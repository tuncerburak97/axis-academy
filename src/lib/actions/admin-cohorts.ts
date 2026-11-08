// src/lib/actions/admin-cohorts.ts — dönem yönetimi: oluştur/düzenle/sil, başvuru onay/red, kişi ekleme, tamamla, materyal ve duyurular
"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { logAudit } from "@/lib/audit";
import { emailMember } from "@/lib/email";
import { formatDate } from "@/lib/format";
import { buildMaterialStoragePath, mapUploadError, validateMaterialFile } from "@/lib/materials";
import type { ActionState } from "@/components/admin/lib/action-state";
import {
  dbError,
  fail,
  isDate,
  isUuid,
  ok,
  optNum,
  revalidateAdmin,
  revalidateEverything,
  str,
} from "@/lib/actions/admin-utils";

const COHORT_STATUSES = ["open", "full", "completed", "cancelled"];

function revalidateCohort(id: string) {
  revalidateAdmin(`/panel/egitimler/${id}`, "/panel/egitimler", "/panel");
}

type CohortFields = {
  module_id: string;
  title: string;
  description: string;
  overview: string;
  start_date: string;
  schedule_note: string;
  duration_hours: number;
  duration_weeks: number;
  capacity: number;
  price: number | null;
  location: string;
  meeting_url: string;
  instructor_id: string | null;
};

function parseCohort(formData: FormData): { data: CohortFields } | { error: string } {
  const module_id = str(formData, "module_id");
  const title = str(formData, "title");
  const start_date = str(formData, "start_date");
  const duration_hours = Number(str(formData, "duration_hours"));
  const duration_weeks = Number(str(formData, "duration_weeks") || "0");
  const capacity = Number(str(formData, "capacity"));
  const price = optNum(formData, "price");
  const instructor = str(formData, "instructor_id");
  const meeting_url = str(formData, "meeting_url");

  if (!isUuid(module_id)) return { error: "Bir program seç." };
  if (title.length < 2 || title.length > 120) return { error: "Dönem adı 2–120 karakter olmalı." };
  if (!isDate(start_date)) return { error: "Başlangıç tarihini seç." };
  if (!Number.isInteger(duration_hours) || duration_hours < 1) return { error: "Toplam süre en az 1 saat olmalı." };
  if (!Number.isInteger(duration_weeks) || duration_weeks < 0 || duration_weeks > 104) return { error: "Hafta sayısı 0–104 arasında olmalı." };
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) return { error: "Kontenjan 1–500 arasında olmalı." };
  if (price !== null && (Number.isNaN(price) || price < 0)) return { error: "Fiyat geçersiz. Boş bırakabilir ya da ₺ tutarı girebilirsin." };
  if (instructor && !isUuid(instructor)) return { error: "Eğitmen seçimi geçersiz." };
  if (meeting_url && !/^https?:\/\//i.test(meeting_url)) return { error: "Toplantı linki http(s):// ile başlamalı." };

  return {
    data: {
      module_id,
      title,
      description: str(formData, "description").slice(0, 1000),
      overview: str(formData, "overview").slice(0, 5000),
      start_date,
      schedule_note: str(formData, "schedule_note").slice(0, 200),
      duration_hours,
      duration_weeks,
      capacity,
      price,
      location: str(formData, "location").slice(0, 200) || "Online",
      meeting_url: meeting_url.slice(0, 500),
      instructor_id: instructor || null,
    },
  };
}

export async function createCohort(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const parsed = parseCohort(formData);
  if ("error" in parsed) return fail(parsed.error);

  const { data, error } = await supabase.from("classes").insert(parsed.data).select("id").single();
  if (error || !data) return fail(dbError(error?.message, "Dönem oluşturulamadı. Tekrar dene."));

  await logAudit(supabase, user.id, "class.create", "class", data.id, `${parsed.data.title} (${parsed.data.start_date}) oluşturuldu`);
  revalidateEverything();
  return ok("Dönem oluşturuldu", { redirectTo: `/admin/donemler/${data.id}` });
}

export async function updateCohort(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "class_id");
  if (!isUuid(id)) return fail("Dönem bulunamadı.");
  const parsed = parseCohort(formData);
  if ("error" in parsed) return fail(parsed.error);

  const status = str(formData, "status");
  if (status && !COHORT_STATUSES.includes(status)) return fail("Geçerli bir durum seç.");
  const overrideRaw = str(formData, "current_week_override");
  const override = overrideRaw ? Number(overrideRaw) : null;
  if (override !== null && (!Number.isInteger(override) || override < 1 || override > 104)) {
    return fail("Güncel hafta 1–104 arasında olmalı ya da boş bırakılmalı.");
  }

  const { error } = await supabase
    .from("classes")
    .update({ ...parsed.data, ...(status ? { status } : {}), current_week_override: override })
    .eq("id", id);
  if (error) return fail(dbError(error.message, "Dönem kaydedilemedi. Tekrar dene."));

  await logAudit(supabase, user.id, "class.update", "class", id, `${parsed.data.title} güncellendi`);
  revalidateEverything();
  return ok("Dönem kaydedildi");
}

/** Dönemin materyal dosyalarını depolamadan temizler */
async function purgeClassMaterialFiles(supabase: SupabaseClient, classId: string): Promise<void> {
  const { data: materials } = await supabase.from("class_materials").select("file_path").eq("class_id", classId);
  const paths = (materials ?? []).map((row) => row.file_path as string | null).filter((path): path is string => Boolean(path));
  if (paths.length) await supabase.storage.from("class-materials").remove(paths);
}

export async function deleteCohort(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "class_id");
  if (!isUuid(id)) return fail("Dönem bulunamadı.");
  const { data: cohort } = await supabase.from("classes").select("title").eq("id", id).maybeSingle();
  if (!cohort) return fail("Dönem bulunamadı.");

  await purgeClassMaterialFiles(supabase, id);
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) return fail(dbError(error.message, "Dönem silinemedi."));

  await logAudit(supabase, user.id, "class.delete", "class", id, `${cohort.title} silindi`);
  revalidateEverything();
  return ok("Dönem silindi", { redirectTo: "/admin/donemler" });
}

async function loadEnrollment(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], id: string) {
  if (!isUuid(id)) return null;
  const { data } = await supabase
    .from("class_enrollments")
    .select("id, class_id, user_id, status, classes(title, start_date)")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function approveEnrollment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const enrollment = await loadEnrollment(supabase, str(formData, "enrollment_id"));
  if (!enrollment) return fail("Başvuru bulunamadı.");

  const { error } = await supabase.rpc("approve_class_enrollment", { p_enrollment_id: enrollment.id });
  if (error) {
    if (error.message.includes("CLASS_FULL")) return fail("Kontenjan dolu. Önce kontenjanı artır ya da bir kaydı iptal et.");
    if (error.message.includes("ENROLLMENT_NOT_PENDING")) return fail("Bu başvuru artık beklemede değil. Sayfayı yenile.");
    return fail("Başvuru onaylanamadı. Tekrar dene.");
  }

  const title = enrollment.classes?.title ?? "Dönem";
  await logAudit(supabase, user.id, "enrollment.approve", "class", enrollment.class_id, `${title}: başvuru onaylandı`);
  await emailMember(enrollment.user_id, {
    subject: "Kaydın onaylandı",
    lines: [
      `${title} dönemine kaydın onaylandı.`,
      enrollment.classes?.start_date ? `Başlangıç: ${formatDate(enrollment.classes.start_date)}.` : "",
      "Ders saatleri, bağlantılar ve materyaller panelinde.",
    ].filter(Boolean),
    cta: { label: "Eğitimimi aç", href: `/panel/egitimler/${enrollment.class_id}` },
  });
  revalidateCohort(enrollment.class_id);
  return ok("Başvuru onaylandı");
}

export async function rejectEnrollment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const enrollment = await loadEnrollment(supabase, str(formData, "enrollment_id"));
  if (!enrollment) return fail("Başvuru bulunamadı.");
  if (!["pending", "waitlisted"].includes(enrollment.status)) return fail("Bu başvuru artık beklemede değil.");

  const { error } = await supabase
    .from("class_enrollments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", enrollment.id);
  if (error) return fail("Başvuru reddedilemedi.");

  const title = enrollment.classes?.title ?? "Dönem";
  await logAudit(supabase, user.id, "enrollment.reject", "class", enrollment.class_id, `${title}: başvuru reddedildi`);
  await emailMember(enrollment.user_id, {
    subject: "Başvurun sonuçlandırıldı",
    lines: [
      `${title} dönemi için başvurunu bu kez onaylayamadık.`,
      "Yaklaşan diğer dönemlere göz atabilir ya da birebir eğitim talep edebilirsin.",
    ],
    cta: { label: "Programlara göz at", href: "/programlar" },
  });
  revalidateCohort(enrollment.class_id);
  return ok("Başvuru reddedildi");
}

/** Kayıtlı öğrenciyi dönemden çıkarır (iptal) */
export async function removeEnrollment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const enrollment = await loadEnrollment(supabase, str(formData, "enrollment_id"));
  if (!enrollment) return fail("Kayıt bulunamadı.");
  if (enrollment.status === "cancelled") return ok();

  const { error } = await supabase
    .from("class_enrollments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", enrollment.id);
  if (error) return fail("Kayıt iptal edilemedi.");

  const title = enrollment.classes?.title ?? "Dönem";
  await logAudit(supabase, user.id, "enrollment.remove", "class", enrollment.class_id, `${title}: kayıt iptal edildi`);
  await emailMember(enrollment.user_id, {
    subject: "Kaydın iptal edildi",
    lines: [`${title} dönemindeki kaydın iptal edildi.`, "Bir yanlışlık olduğunu düşünüyorsan bize yaz."],
    cta: { label: "Panelini aç", href: "/panel/egitimler" },
  });
  revalidateCohort(enrollment.class_id);
  return ok("Kayıt iptal edildi");
}

/** Kayıtlı → devam ediyor */
export async function markEnrollmentInProgress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const enrollment = await loadEnrollment(supabase, str(formData, "enrollment_id"));
  if (!enrollment) return fail("Kayıt bulunamadı.");
  if (enrollment.status !== "enrolled") return fail("Yalnızca kayıtlı öğrenciler “devam ediyor” yapılabilir.");

  const { error } = await supabase
    .from("class_enrollments")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", enrollment.id);
  if (error) return fail("Güncellenemedi.");

  await logAudit(supabase, user.id, "enrollment.progress", "class", enrollment.class_id, `${enrollment.classes?.title ?? "Dönem"}: öğrenci devam ediyor`);
  revalidateCohort(enrollment.class_id);
  return ok("Öğrenci “devam ediyor” olarak işaretlendi");
}

/** Bütün kayıtlıları birden "devam ediyor" yapar */
export async function startAllEnrollments(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const classId = str(formData, "class_id");
  if (!isUuid(classId)) return fail("Dönem bulunamadı.");
  const { data, error } = await supabase
    .from("class_enrollments")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("class_id", classId)
    .eq("status", "enrolled")
    .select("id");
  if (error) return fail("Güncellenemedi.");
  await logAudit(supabase, user.id, "enrollment.progress_all", "class", classId, `${data?.length ?? 0} öğrenci devam ediyor`);
  revalidateCohort(classId);
  return ok(`${data?.length ?? 0} öğrenci “devam ediyor”`);
}

/** Kişiyi doğrudan döneme ekler (onaylı) */
export async function addPersonToCohort(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const classId = str(formData, "class_id");
  const userId = str(formData, "user_id");
  if (!isUuid(classId) || !isUuid(userId)) return fail("Kişi ya da dönem geçersiz.");

  const { error } = await supabase.rpc("admin_add_enrollment", { p_class_id: classId, p_user_id: userId });
  if (error) {
    if (error.message.includes("ALREADY_ENROLLED")) return fail("Bu kişi zaten kayıtlı.");
    return fail("Kişi eklenemedi. Tekrar dene.");
  }
  const { data: cohort } = await supabase.from("classes").select("title, start_date").eq("id", classId).maybeSingle();
  await logAudit(supabase, user.id, "enrollment.add", "class", classId, `${cohort?.title ?? "Dönem"}: kişi eklendi`);
  await emailMember(userId, {
    subject: "Döneme eklendin",
    lines: [
      `${cohort?.title ?? "Bir dönem"} için kaydın oluşturuldu.`,
      cohort?.start_date ? `Başlangıç: ${formatDate(cohort.start_date)}.` : "",
    ].filter(Boolean),
    cta: { label: "Eğitimimi aç", href: `/panel/egitimler/${classId}` },
  });
  revalidateCohort(classId);
  return ok("Kişi döneme eklendi");
}

export interface PersonHit {
  user_id: string;
  name: string;
  email: string;
}

/** "Kişi ekle" araması: dönemde aktif kaydı olmayan kişiler */
export async function searchPeopleForCohort(classId: string, query: string): Promise<PersonHit[]> {
  const { supabase } = await requireAdmin();
  const q = query.replace(/[%,()*\\"]/g, " ").trim().slice(0, 80);
  if (q.length < 2 || !isUuid(classId)) return [];
  const [{ data: people }, { data: active }] = await Promise.all([
    supabase.from("profiles").select("user_id, full_name, email").or(`full_name.ilike.%${q}%,email.ilike.%${q}%`).limit(10),
    supabase.from("class_enrollments").select("user_id, status").eq("class_id", classId).in("status", ["enrolled", "in_progress", "completed"]),
  ]);
  const taken = new Set((active ?? []).map((row) => row.user_id));
  return (people ?? [])
    .filter((person) => !taken.has(person.user_id))
    .map((person) => ({ user_id: person.user_id, name: person.full_name || person.email, email: person.email }));
}

/** Dönemi tamamla: kayıtlılar tamamlanır, sertifikalar üretilir */
export async function completeCohort(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const classId = str(formData, "class_id");
  if (!isUuid(classId)) return fail("Dönem bulunamadı.");

  const { data: before } = await supabase
    .from("class_enrollments")
    .select("user_id")
    .eq("class_id", classId)
    .in("status", ["enrolled", "in_progress"]);
  const { data: count, error } = await supabase.rpc("complete_class", { p_class_id: classId });
  if (error) return fail("Dönem tamamlanamadı. Tekrar dene.");

  const { data: cohort } = await supabase.from("classes").select("title").eq("id", classId).maybeSingle();
  await logAudit(supabase, user.id, "class.complete", "class", classId, `${cohort?.title ?? "Dönem"} tamamlandı, ${count ?? 0} sertifika`);
  for (const row of before ?? []) {
    await emailMember(row.user_id, {
      subject: "Tebrikler, eğitimini tamamladın",
      lines: [`${cohort?.title ?? "Eğitim"} dönemini tamamladın.`, "Doğrulama kodlu katılım belgen panelindeki Belgeler bölümünde."],
      cta: { label: "Belgemi gör", href: "/panel/belgeler" },
    });
  }
  revalidateEverything();
  return ok(`Dönem tamamlandı. ${count ?? 0} kişiye sertifika üretildi`);
}

// ------------------------------------------------------------
// Materyaller
// ------------------------------------------------------------
const MATERIAL_CATEGORIES = ["general", "weekly", "homework", "note"];

const uploadErrors: Record<string, string> = {
  file_too_large: "Dosya 20 MB'tan büyük olamaz.",
  invalid_type: "Bu dosya türü desteklenmiyor (PDF, Office, ZIP, MD, TXT).",
  bucket_missing: "Depolama alanı bulunamadı. Supabase ayarlarını kontrol et.",
  upload_failed: "Dosya yüklenemedi. Tekrar dene.",
};

function parseMaterial(formData: FormData) {
  const category = str(formData, "category");
  const title = str(formData, "title");
  const weekRaw = str(formData, "week_number");
  const week = weekRaw ? Number(weekRaw) : null;
  if (!MATERIAL_CATEGORIES.includes(category)) return { error: "Kategori seç." } as const;
  if (title.length < 2 || title.length > 200) return { error: "Başlık 2–200 karakter olmalı." } as const;
  if (week !== null && (!Number.isInteger(week) || week < 1 || week > 104)) return { error: "Hafta 1–104 arasında olmalı." } as const;
  return {
    data: {
      category,
      title,
      week_number: week,
      content_md: str(formData, "content_md").slice(0, 50000),
      sort_order: Number(str(formData, "sort_order") || "0") || 0,
    },
  } as const;
}

async function uploadMaterial(supabase: SupabaseClient, classId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { path: null };
  const validation = validateMaterialFile(file);
  if (!validation.ok) return { error: uploadErrors[validation.code] };
  const path = buildMaterialStoragePath(classId, file.name);
  const { error } = await supabase.storage.from("class-materials").upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) return { error: uploadErrors[mapUploadError(error.message)] };
  return { path };
}

export async function saveMaterial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const classId = str(formData, "class_id");
  const materialId = str(formData, "material_id");
  if (!isUuid(classId)) return fail("Dönem bulunamadı.");
  const parsed = parseMaterial(formData);
  if ("error" in parsed) return fail(parsed.error!);

  const upload = await uploadMaterial(supabase, classId, formData);
  if ("error" in upload) return fail(upload.error!);

  if (materialId) {
    const { data: existing } = await supabase.from("class_materials").select("file_path").eq("id", materialId).maybeSingle();
    const removeFile = formData.get("remove_file") === "on";
    let filePath = existing?.file_path ?? null;
    if (upload.path || removeFile) {
      if (existing?.file_path) await supabase.storage.from("class-materials").remove([existing.file_path]);
      filePath = upload.path;
    }
    const { error } = await supabase.from("class_materials").update({ ...parsed.data, file_path: filePath }).eq("id", materialId);
    if (error) return fail("Materyal kaydedilemedi.");
    await logAudit(supabase, user.id, "material.update", "class", classId, `${parsed.data.title} güncellendi`);
    revalidateCohort(classId);
    return ok("Materyal kaydedildi");
  }

  const { error } = await supabase.from("class_materials").insert({ ...parsed.data, class_id: classId, file_path: upload.path });
  if (error) {
    if (upload.path) await supabase.storage.from("class-materials").remove([upload.path]);
    return fail("Materyal eklenemedi.");
  }
  await logAudit(supabase, user.id, "material.create", "class", classId, `${parsed.data.title} eklendi`);
  revalidateCohort(classId);
  return ok("Materyal eklendi");
}

export async function deleteMaterial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "material_id");
  if (!isUuid(id)) return fail("Materyal bulunamadı.");
  const { data: material } = await supabase.from("class_materials").select("class_id, title, file_path").eq("id", id).maybeSingle();
  if (!material) return fail("Materyal bulunamadı.");
  if (material.file_path) await supabase.storage.from("class-materials").remove([material.file_path]);
  const { error } = await supabase.from("class_materials").delete().eq("id", id);
  if (error) return fail("Materyal silinemedi.");
  await logAudit(supabase, user.id, "material.delete", "class", material.class_id, `${material.title} silindi`);
  revalidateCohort(material.class_id);
  return ok("Materyal silindi");
}

// ------------------------------------------------------------
// Duyurular
// ------------------------------------------------------------
export async function saveAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const classId = str(formData, "class_id");
  const id = str(formData, "announcement_id");
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!isUuid(classId)) return fail("Dönem bulunamadı.");
  if (title.length < 2 || title.length > 200) return fail("Başlık 2–200 karakter olmalı.");
  if (body.length > 10000) return fail("Metin en fazla 10.000 karakter olabilir.");

  if (id) {
    const { error } = await supabase
      .from("class_announcements")
      .update({ title, body, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return fail("Duyuru kaydedilemedi.");
    await logAudit(supabase, user.id, "announcement.update", "class", classId, `${title} güncellendi`);
    revalidateCohort(classId);
    return ok("Duyuru kaydedildi");
  }

  const { error } = await supabase.from("class_announcements").insert({ class_id: classId, title, body });
  if (error) return fail("Duyuru yayınlanamadı.");
  await logAudit(supabase, user.id, "announcement.create", "class", classId, `${title} yayınlandı`);
  revalidateCohort(classId);
  return ok("Duyuru yayınlandı; kayıtlı öğrencilere bildirim gitti");
}

export async function deleteAnnouncement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "announcement_id");
  if (!isUuid(id)) return fail("Duyuru bulunamadı.");
  const { data } = await supabase.from("class_announcements").select("class_id, title").eq("id", id).maybeSingle();
  if (!data) return fail("Duyuru bulunamadı.");
  const { error } = await supabase.from("class_announcements").delete().eq("id", id);
  if (error) return fail("Duyuru silinemedi.");
  await logAudit(supabase, user.id, "announcement.delete", "class", data.class_id, `${data.title} silindi`);
  revalidateCohort(data.class_id);
  return ok("Duyuru silindi");
}
