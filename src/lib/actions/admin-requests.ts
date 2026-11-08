// src/lib/actions/admin-requests.ts — talep hattı admin işlemleri: durum, teklif, mesaj, teslim dosyası, planlama, notlar, silme
"use server";

import { requireAdmin } from "@/lib/actions/admin-guard";
import { logAudit } from "@/lib/audit";
import { emailMember } from "@/lib/email";
import { formatDate, formatTRY } from "@/lib/format";
import { requestStatusLabels, type RequestStatus } from "@/lib/types/platform";
import type { ActionState } from "@/components/admin/lib/action-state";
import { fail, isDate, isUuid, ok, optNum, revalidateAdmin, safeFileName, str } from "@/lib/actions/admin-utils";

const STATUSES: RequestStatus[] = ["received", "quoted", "approved", "planned", "in_progress", "completed", "cancelled"];
const MAX_FILE = 25 * 1024 * 1024;

function revalidateRequest(id: string) {
  revalidateAdmin(`/panel/talepler/${id}`, "/panel/talepler", "/panel");
}

async function loadRequest(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], id: string) {
  if (!isUuid(id)) return null;
  const { data } = await supabase.from("requests").select("id, user_id, title, kind, status, decided_at").eq("id", id).maybeSingle();
  return data;
}

/** Durum değişikliği: üyeye e-posta gider (uygulama içi bildirimi tetikleyici üretir) */
export async function setRequestStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "request_id");
  const status = str(formData, "status") as RequestStatus;
  if (!STATUSES.includes(status)) return fail("Geçerli bir durum seç.");
  const request = await loadRequest(supabase, id);
  if (!request) return fail("Talep bulunamadı. Sayfayı yenileyip tekrar dene.");
  if (request.status === status) return ok();

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("requests")
    .update({
      status,
      last_activity_at: now,
      ...((status === "approved" || status === "cancelled") && !request.decided_at ? { decided_at: now } : {}),
    })
    .eq("id", id);
  if (error) return fail("Durum güncellenemedi. Tekrar dene.");

  await logAudit(supabase, user.id, "request.status", "request", id, `${request.title}: ${requestStatusLabels[request.status as RequestStatus]} → ${requestStatusLabels[status]}`);
  await emailMember(request.user_id, {
    subject: `Talebin güncellendi: ${requestStatusLabels[status]}`,
    lines: [
      `"${request.title || "Talebin"}" için durum artık: ${requestStatusLabels[status]}.`,
      "Ayrıntıları ve sıradaki adımı panelinde görebilirsin.",
    ],
    cta: { label: "Talebi aç", href: `/panel/talepler/${id}` },
  });

  revalidateRequest(id);
  return ok(`Durum: ${requestStatusLabels[status]}`);
}

/** Teklif ver: tutar + not + geçerlilik → durum "quoted" */
export async function sendQuote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "request_id");
  const amount = optNum(formData, "quote_amount");
  const note = str(formData, "quote_note").slice(0, 2000);
  const validUntil = str(formData, "quote_valid_until");

  if (amount === null || Number.isNaN(amount) || amount <= 0) return fail("Teklif tutarını gir (₺, sıfırdan büyük).");
  if (validUntil && !isDate(validUntil)) return fail("Geçerlilik tarihi geçersiz.");
  const request = await loadRequest(supabase, id);
  if (!request) return fail("Talep bulunamadı.");
  if (["completed", "cancelled"].includes(request.status)) return fail("Tamamlanan ya da iptal edilen talebe teklif verilemez.");

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("requests")
    .update({
      quote_amount: amount,
      quote_note: note,
      quote_valid_until: validUntil || null,
      quoted_at: now,
      status: "quoted",
      decided_at: null,
      last_activity_at: now,
    })
    .eq("id", id);
  if (error) return fail("Teklif kaydedilemedi. Tekrar dene.");

  await logAudit(supabase, user.id, "request.quote", "request", id, `${request.title}: ${formatTRY(amount)} teklif`);
  await emailMember(request.user_id, {
    subject: "Teklifin hazır",
    lines: [
      `"${request.title || "Talebin"}" için teklifimiz: ${formatTRY(amount)}.`,
      ...(note ? [note] : []),
      ...(validUntil ? [`Teklif ${formatDate(validUntil)} tarihine kadar geçerli.`] : []),
      "Panelinden teklifi onaylayabilir ya da sorularını yazabilirsin.",
    ],
    cta: { label: "Teklifi incele", href: `/panel/talepler/${id}` },
  });

  revalidateRequest(id);
  return ok("Teklif gönderildi");
}

/** Ekip mesajı: üyeye e-posta da gider */
export async function sendStaffMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "request_id");
  const body = str(formData, "body");
  if (body.length < 1) return fail("Mesaj boş olamaz.");
  if (body.length > 5000) return fail("Mesaj en fazla 5000 karakter olabilir.");
  const request = await loadRequest(supabase, id);
  if (!request) return fail("Talep bulunamadı.");

  const { error } = await supabase.from("request_messages").insert({ request_id: id, author_id: user.id, is_staff: true, body });
  if (error) return fail("Mesaj gönderilemedi. Tekrar dene.");

  await logAudit(supabase, user.id, "request.message", "request", id, `${request.title}: mesaj gönderildi`);
  await emailMember(request.user_id, {
    subject: "Axis ekibinden yeni mesaj",
    lines: [`"${request.title || "Talebin"}" hakkında sana yazdık:`, body.length > 600 ? `${body.slice(0, 600)}…` : body],
    cta: { label: "Yanıtla", href: `/panel/talepler/${id}` },
  });

  revalidateRequest(id);
  return ok("Mesaj gönderildi");
}

/** Teslim dosyası: request-files/{üye}/{talep}/{dosya} + is_deliverable */
export async function uploadDeliverable(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "request_id");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Yüklenecek dosyayı seç.");
  if (file.size > MAX_FILE) return fail("Dosya 25 MB'tan büyük olamaz.");
  const request = await loadRequest(supabase, id);
  if (!request) return fail("Talep bulunamadı.");

  const safeName = `${Date.now().toString(36)}-${safeFileName(file.name)}`;
  const path = `${request.user_id}/${id}/${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("request-files")
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (uploadError) return fail("Dosya yüklenemedi. Depolama ayarlarını kontrol edip tekrar dene.");

  const { error } = await supabase.from("request_files").insert({
    request_id: id,
    uploaded_by: user.id,
    file_path: path,
    file_name: file.name.slice(0, 200),
    file_size: file.size,
    is_deliverable: true,
  });
  if (error) {
    await supabase.storage.from("request-files").remove([path]);
    return fail("Dosya kaydı oluşturulamadı. Tekrar dene.");
  }

  await logAudit(supabase, user.id, "request.deliverable", "request", id, `${request.title}: ${file.name} teslim edildi`);
  await emailMember(request.user_id, {
    subject: "Teslim dosyan hazır",
    lines: [`"${request.title || "Talebin"}" için teslim dosyası yüklendi: ${file.name}.`, "Panelinden indirebilirsin."],
    cta: { label: "Dosyayı aç", href: `/panel/talepler/${id}` },
  });

  revalidateRequest(id);
  return ok("Teslim dosyası yüklendi");
}

export async function deleteRequestFile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const fileId = str(formData, "file_id");
  if (!isUuid(fileId)) return fail("Dosya bulunamadı.");
  const { data: file } = await supabase.from("request_files").select("id, request_id, file_path, file_name").eq("id", fileId).maybeSingle();
  if (!file) return fail("Dosya bulunamadı.");

  await supabase.storage.from("request-files").remove([file.file_path]);
  const { error } = await supabase.from("request_files").delete().eq("id", fileId);
  if (error) return fail("Dosya silinemedi.");

  await logAudit(supabase, user.id, "request.file_delete", "request", file.request_id, `${file.file_name} silindi`);
  revalidateRequest(file.request_id);
  return ok("Dosya silindi");
}

/** Planlama: teslim tarihi ve sorumlu */
export async function updateRequestPlanning(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "request_id");
  const dueDate = str(formData, "due_date");
  const assignee = str(formData, "assignee_id");
  if (dueDate && !isDate(dueDate)) return fail("Teslim tarihi geçersiz.");
  if (assignee && !isUuid(assignee)) return fail("Sorumlu seçimi geçersiz.");
  const request = await loadRequest(supabase, id);
  if (!request) return fail("Talep bulunamadı.");

  const { error } = await supabase
    .from("requests")
    .update({ due_date: dueDate || null, assignee_id: assignee || null })
    .eq("id", id);
  if (error) return fail("Kaydedilemedi. Tekrar dene.");

  await logAudit(supabase, user.id, "request.planning", "request", id, `${request.title}: teslim ${dueDate || "—"}, sorumlu güncellendi`);
  revalidateRequest(id);
  return ok("Planlama kaydedildi");
}

/** Üyenin gördüğü kısa ilerleme notu */
export async function updateProgressNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "request_id");
  const note = str(formData, "progress_note");
  if (note.length > 1000) return fail("Not en fazla 1000 karakter olabilir.");
  const request = await loadRequest(supabase, id);
  if (!request) return fail("Talep bulunamadı.");

  const { error } = await supabase
    .from("requests")
    .update({ progress_note: note, last_activity_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return fail("Not kaydedilemedi.");

  await logAudit(supabase, user.id, "request.progress", "request", id, `${request.title}: ilerleme notu güncellendi`);
  revalidateRequest(id);
  return ok("İlerleme notu kaydedildi");
}

/** Yalnızca ekibin gördüğü notlar */
export async function updateAdminNotes(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "request_id");
  const notes = str(formData, "admin_notes");
  if (notes.length > 5000) return fail("Not en fazla 5000 karakter olabilir.");
  const request = await loadRequest(supabase, id);
  if (!request) return fail("Talep bulunamadı.");

  const { error } = await supabase.from("requests").update({ admin_notes: notes }).eq("id", id);
  if (error) return fail("Not kaydedilemedi.");

  await logAudit(supabase, user.id, "request.notes", "request", id, `${request.title}: ekip notu güncellendi`);
  revalidateAdmin();
  return ok("Ekip notu kaydedildi");
}

/** Talebi tamamen siler (dosyalar depolamadan da temizlenir) */
export async function deleteRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "request_id");
  const request = await loadRequest(supabase, id);
  if (!request) return fail("Talep bulunamadı.");

  const { data: files } = await supabase.from("request_files").select("file_path").eq("request_id", id);
  const paths = (files ?? []).map((file) => file.file_path);
  if (paths.length) await supabase.storage.from("request-files").remove(paths);

  const { error } = await supabase.from("requests").delete().eq("id", id);
  if (error) return fail("Talep silinemedi. Tekrar dene.");

  await logAudit(supabase, user.id, "request.delete", "request", id, `${request.title || request.kind} silindi`);
  revalidateRequest(id);
  return ok("Talep silindi", { redirectTo: "/admin/talepler" });
}
