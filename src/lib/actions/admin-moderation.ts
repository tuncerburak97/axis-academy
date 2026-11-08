// src/lib/actions/admin-moderation.ts — yorum moderasyonu, indirim kodları ve iletişim soruları
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import type { ActionState } from "@/components/admin/lib/action-state";
import { bool, dbError, fail, isDate, isUuid, ok, revalidateAdmin, str } from "@/lib/actions/admin-utils";

// ------------------------------------------------------------
// Yorumlar
// ------------------------------------------------------------
export async function setReviewPublished(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "review_id");
  const publish = bool(formData, "publish");
  if (!isUuid(id)) return fail("Yorum bulunamadı.");
  const { data: review, error } = await supabase
    .from("reviews")
    .update({ is_published: publish })
    .eq("id", id)
    .select("rating, module_id, education_modules(slug)")
    .maybeSingle();
  if (error || !review) return fail("Yorum güncellenemedi.");
  await logAudit(supabase, user.id, publish ? "review.publish" : "review.unpublish", "review", id, `${review.rating}★ yorum ${publish ? "yayınlandı" : "yayından kaldırıldı"}`);
  revalidatePath("/");
  if (review.education_modules?.slug) revalidatePath(`/programlar/${review.education_modules.slug}`);
  revalidateAdmin();
  return ok(publish ? "Yorum yayında" : "Yorum yayından kaldırıldı");
}

export async function deleteReview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "review_id");
  if (!isUuid(id)) return fail("Yorum bulunamadı.");
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return fail("Yorum silinemedi.");
  await logAudit(supabase, user.id, "review.delete", "review", id, "Yorum silindi");
  revalidatePath("/", "layout");
  return ok("Yorum silindi");
}

// ------------------------------------------------------------
// İndirim kodları
// ------------------------------------------------------------
export async function saveDiscount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "discount_id");
  const code = str(formData, "code").toUpperCase().replace(/\s+/g, "");
  const percent = Number(str(formData, "percent"));
  const validUntil = str(formData, "valid_until");
  const maxRaw = str(formData, "max_uses");
  const maxUses = maxRaw ? Number(maxRaw) : null;

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return fail("Kod 3–32 karakter olmalı; yalnızca harf, rakam, - ve _.");
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) return fail("İndirim yüzdesi 1–100 arasında olmalı.");
  if (validUntil && !isDate(validUntil)) return fail("Son geçerlilik tarihi geçersiz.");
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) return fail("Kullanım sınırı boş ya da 1'den büyük olmalı.");

  const payload = {
    code,
    percent,
    description: str(formData, "description").slice(0, 200),
    valid_until: validUntil || null,
    max_uses: maxUses,
    is_active: bool(formData, "is_active"),
  };
  const { error } = id
    ? await supabase.from("discount_codes").update(payload).eq("id", id)
    : await supabase.from("discount_codes").insert(payload);
  if (error) return fail(error.message.includes("duplicate") ? "Bu kod zaten var." : dbError(error.message));

  await logAudit(supabase, user.id, id ? "discount.update" : "discount.create", "discount_code", id || code, `${code} · %${percent}`);
  revalidateAdmin();
  return ok(id ? "Kod kaydedildi" : `${code} oluşturuldu`);
}

export async function setDiscountActive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "discount_id");
  const active = bool(formData, "active");
  if (!isUuid(id)) return fail("Kod bulunamadı.");
  const { data, error } = await supabase.from("discount_codes").update({ is_active: active }).eq("id", id).select("code").maybeSingle();
  if (error || !data) return fail("Güncellenemedi.");
  await logAudit(supabase, user.id, active ? "discount.activate" : "discount.deactivate", "discount_code", id, `${data.code} ${active ? "açıldı" : "kapatıldı"}`);
  revalidateAdmin();
  return ok(active ? `${data.code} aktif` : `${data.code} kapatıldı`);
}

export async function deleteDiscount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "discount_id");
  if (!isUuid(id)) return fail("Kod bulunamadı.");
  const { data } = await supabase.from("discount_codes").select("code").eq("id", id).maybeSingle();
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);
  if (error) return fail("Kod silinemedi.");
  await logAudit(supabase, user.id, "discount.delete", "discount_code", id, `${data?.code ?? "Kod"} silindi`);
  revalidateAdmin();
  return ok("Kod silindi");
}

// ------------------------------------------------------------
// İletişim soruları (public_inquiries)
// ------------------------------------------------------------
const INQUIRY_STATUSES = ["new", "answered", "closed"];

export async function updateInquiry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "inquiry_id");
  const status = str(formData, "status");
  const notes = str(formData, "admin_notes");
  if (!isUuid(id)) return fail("Soru bulunamadı.");
  if (!INQUIRY_STATUSES.includes(status)) return fail("Durum seç.");
  if (notes.length > 2000) return fail("Not en fazla 2000 karakter olabilir.");
  const { data, error } = await supabase.from("public_inquiries").update({ status, admin_notes: notes }).eq("id", id).select("name").maybeSingle();
  if (error || !data) return fail("Kaydedilemedi.");
  await logAudit(supabase, user.id, "inquiry.update", "inquiry", id, `${data.name}: ${status}`);
  revalidateAdmin();
  return ok("Kaydedildi");
}

/** Uygulama içinden e-postayla yanıtla, soruyu "yanıtlandı" yap */
export async function replyInquiry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "inquiry_id");
  const reply = str(formData, "reply");
  if (!isUuid(id)) return fail("Soru bulunamadı.");
  if (reply.length < 5) return fail("Yanıt en az 5 karakter olmalı.");
  if (reply.length > 5000) return fail("Yanıt en fazla 5000 karakter olabilir.");
  if (!process.env.RESEND_API_KEY) return fail("E-posta servisi yapılandırılmamış (RESEND_API_KEY). Adresi kopyalayıp kendi e-postandan yanıtla.");

  const { data: inquiry } = await supabase.from("public_inquiries").select("name, email, message, admin_notes").eq("id", id).maybeSingle();
  if (!inquiry) return fail("Soru bulunamadı.");

  await sendEmail({
    to: inquiry.email,
    subject: "Sorunu yanıtladık",
    lines: [
      `Merhaba ${inquiry.name.split(/\s+/)[0] || ""},`.trim(),
      ...reply.split(/\n{2,}/),
      "—",
      `Senin mesajın: “${inquiry.message.slice(0, 400)}${inquiry.message.length > 400 ? "…" : ""}”`,
    ],
  });

  const stamp = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  const notes = `${inquiry.admin_notes ? `${inquiry.admin_notes}\n\n` : ""}[${stamp}] E-postayla yanıtlandı:\n${reply}`.slice(0, 2000);
  await supabase.from("public_inquiries").update({ status: "answered", admin_notes: notes }).eq("id", id);
  await logAudit(supabase, user.id, "inquiry.reply", "inquiry", id, `${inquiry.name} e-postayla yanıtlandı`);
  revalidateAdmin();
  return ok("Yanıt gönderildi, soru “yanıtlandı” oldu");
}

export async function deleteInquiry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "inquiry_id");
  if (!isUuid(id)) return fail("Soru bulunamadı.");
  const { error } = await supabase.from("public_inquiries").delete().eq("id", id);
  if (error) return fail("Soru silinemedi.");
  await logAudit(supabase, user.id, "inquiry.delete", "inquiry", id, "İletişim sorusu silindi");
  revalidateAdmin();
  return ok("Soru silindi");
}
