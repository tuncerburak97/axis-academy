// src/lib/actions/member-instructor.ts — eğitmen aksiyonları: oturum, duyuru, materyal
// Yetki iki katmanlı: rol kontrolü burada, dönem sahipliği (instructor_id) RLS politikalarında.
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { buildMaterialStoragePath, validateMaterialFile } from "@/lib/materials";
import { fail, istanbulLocalToIso, ok, type ActionState } from "@/lib/queries/member-types";

async function requireInstructorClass(classId: unknown) {
  const user = await getSessionUser();
  if (!user || user.role !== "instructor") return { error: "Bu işlem yalnızca eğitmenler içindir." } as const;
  const parsed = z.string().uuid().safeParse(classId);
  if (!parsed.success) return { error: "Dönem bulunamadı." } as const;
  const supabase = await createClient();
  const { data } = await supabase.from("classes").select("id, title").eq("id", parsed.data).eq("instructor_id", user.id).maybeSingle();
  if (!data) return { error: "Bu dönemin eğitmeni değilsin." } as const;
  return { user, supabase, cohort: data } as const;
}

function revalidateTeaching(classId: string) {
  revalidatePath(`/panel/derslerim/${classId}`);
  revalidatePath("/panel/derslerim");
  revalidatePath(`/panel/egitimler/${classId}`);
  revalidatePath("/panel/takvim");
  revalidatePath("/panel");
}

const sessionSchema = z.object({
  title: z.string().trim().max(200, "Başlık en fazla 200 karakter olabilir."),
  week_number: z.union([z.literal(""), z.coerce.number().int().min(1).max(60)]),
  starts_at: z.string().min(1, "Başlangıç zamanını seç."),
  duration: z.coerce.number().int().min(15, "Süre en az 15 dakika olmalı.").max(600, "Süre en fazla 10 saat olabilir."),
  location: z.string().trim().max(200),
  meeting_url: z.union([z.literal(""), z.string().trim().url("Ders bağlantısı geçerli bir adres olmalı (https://…).")]),
  notes: z.string().trim().max(2000),
});

export async function saveSessionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const context = await requireInstructorClass(formData.get("class_id"));
  if ("error" in context) return fail(context.error as string);
  const parsed = sessionSchema.safeParse({
    title: formData.get("title") ?? "",
    week_number: formData.get("week_number") ?? "",
    starts_at: formData.get("starts_at") ?? "",
    duration: formData.get("duration") ?? 120,
    location: formData.get("location") ?? "",
    meeting_url: formData.get("meeting_url") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue.message, { [String(issue.path[0])]: issue.message });
  }
  const startsAt = istanbulLocalToIso(parsed.data.starts_at);
  if (!startsAt) return fail("Başlangıç zamanı geçersiz.", { starts_at: "Tarih ve saati seç." });
  const endsAt = new Date(new Date(startsAt).getTime() + parsed.data.duration * 60_000).toISOString();

  const payload = {
    class_id: context.cohort.id,
    title: parsed.data.title,
    week_number: parsed.data.week_number === "" ? null : parsed.data.week_number,
    starts_at: startsAt,
    ends_at: endsAt,
    location: parsed.data.location || "Online",
    meeting_url: parsed.data.meeting_url,
    notes: parsed.data.notes,
  };

  const sessionId = formData.get("session_id");
  if (sessionId) {
    const id = z.string().uuid().safeParse(sessionId);
    if (!id.success) return fail("Oturum bulunamadı.");
    const { error } = await context.supabase.from("sessions").update(payload).eq("id", id.data).eq("class_id", context.cohort.id);
    if (error) return fail("Oturum güncellenemedi. Tekrar dene.");
    revalidateTeaching(context.cohort.id);
    return ok("Oturum güncellendi.");
  }

  const { error } = await context.supabase.from("sessions").insert(payload);
  if (error) return fail("Oturum eklenemedi. Tekrar dene.");
  revalidateTeaching(context.cohort.id);
  return ok("Oturum eklendi; öğrencilerin takviminde görünüyor.");
}

export async function deleteSessionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const context = await requireInstructorClass(formData.get("class_id"));
  if ("error" in context) return fail(context.error as string);
  const id = z.string().uuid().safeParse(formData.get("session_id"));
  if (!id.success) return fail("Oturum bulunamadı.");
  const { error } = await context.supabase.from("sessions").delete().eq("id", id.data).eq("class_id", context.cohort.id);
  if (error) return fail("Oturum silinemedi. Tekrar dene.");
  revalidateTeaching(context.cohort.id);
  return ok("Oturum silindi.");
}

const announcementSchema = z.object({
  title: z.string().trim().min(3, "Başlık en az 3 karakter olmalı.").max(200, "Başlık en fazla 200 karakter olabilir."),
  body: z.string().trim().min(1, "Duyuru metni boş olamaz.").max(5000, "Duyuru en fazla 5000 karakter olabilir."),
});

export async function postAnnouncementAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const context = await requireInstructorClass(formData.get("class_id"));
  if ("error" in context) return fail(context.error as string);
  const parsed = announcementSchema.safeParse({ title: formData.get("title") ?? "", body: formData.get("body") ?? "" });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue.message, { [String(issue.path[0])]: issue.message });
  }
  const { error } = await context.supabase.from("class_announcements").insert({ class_id: context.cohort.id, ...parsed.data });
  if (error) return fail("Duyuru yayınlanamadı. Tekrar dene.");
  revalidateTeaching(context.cohort.id);
  return ok("Duyuru yayınlandı; öğrencilere bildirim gitti.");
}

const materialSchema = z.object({
  title: z.string().trim().min(2, "Başlık en az 2 karakter olmalı.").max(200, "Başlık en fazla 200 karakter olabilir."),
  category: z.enum(["general", "weekly", "homework", "note"]),
  week_number: z.union([z.literal(""), z.coerce.number().int().min(1).max(60)]),
  content_md: z.string().trim().max(20000, "İçerik çok uzun."),
});

const materialErrors: Record<string, string> = {
  file_too_large: "Dosya 20 MB'tan büyük olamaz.",
  invalid_type: "Bu dosya türü desteklenmiyor. PDF, Office, ZIP, TXT ya da MD yükle.",
};

export async function addMaterialAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const context = await requireInstructorClass(formData.get("class_id"));
  if ("error" in context) return fail(context.error as string);
  const parsed = materialSchema.safeParse({
    title: formData.get("title") ?? "",
    category: formData.get("category") ?? "general",
    week_number: formData.get("week_number") ?? "",
    content_md: formData.get("content_md") ?? "",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue.message, { [String(issue.path[0])]: issue.message });
  }

  const file = formData.get("file");
  let filePath: string | null = null;
  if (file instanceof File && file.size > 0) {
    const check = validateMaterialFile(file);
    if (!check.ok) return fail(materialErrors[check.code] ?? "Dosya yüklenemedi.", { file: materialErrors[check.code] ?? "" });
    filePath = buildMaterialStoragePath(context.cohort.id, file.name);
    const { error } = await context.supabase.storage
      .from("class-materials")
      .upload(filePath, file, { contentType: file.type || "application/octet-stream" });
    if (error) return fail("Dosya yüklenemedi. Tekrar dene.");
  }
  if (!filePath && !parsed.data.content_md) {
    return fail("Bir metin yaz ya da dosya ekle.", { content_md: "Metin ya da dosya gerekli." });
  }

  const { error } = await context.supabase.from("class_materials").insert({
    class_id: context.cohort.id,
    title: parsed.data.title,
    category: parsed.data.category,
    week_number: parsed.data.week_number === "" ? null : parsed.data.week_number,
    content_md: parsed.data.content_md,
    file_path: filePath,
  });
  if (error) {
    if (filePath) await context.supabase.storage.from("class-materials").remove([filePath]);
    return fail("Materyal kaydedilemedi. Tekrar dene.");
  }
  revalidateTeaching(context.cohort.id);
  return ok("Materyal eklendi.");
}
