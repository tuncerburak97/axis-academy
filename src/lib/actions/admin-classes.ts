// src/lib/actions/admin-classes.ts — sınıf CRUD ve katılım onay/red Server Action'ları
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin-guard";
import {
  buildMaterialStoragePath,
  mapUploadError,
  materialAdminPath,
  validateMaterialFile,
} from "@/lib/materials";
import type { SupabaseClient } from "@supabase/supabase-js";

function revalidateClasses() {
  revalidatePath("/admin/siniflar");
  revalidatePath("/panel");
}

const classSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(2).max(120),
  description: z.string().max(1000),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih biçimi geçersiz."),
  schedule_note: z.string().max(200),
  duration_hours: z.coerce.number().int().min(1),
  capacity: z.coerce.number().int().min(1),
});

export async function createClass(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = classSchema.safeParse({
    module_id: formData.get("module_id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    start_date: formData.get("start_date"),
    schedule_note: formData.get("schedule_note") ?? "",
    duration_hours: formData.get("duration_hours"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) redirect("/admin/siniflar?error=validation");

  const { error } = await supabase.from("classes").insert(parsed.data);
  if (error) redirect("/admin/siniflar?error=db");

  revalidateClasses();
  redirect("/admin/siniflar?saved=1");
}

const statusSchema = z.enum(["open", "full", "completed", "cancelled"]);

export async function updateClassStatus(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const classId = String(formData.get("class_id"));
  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) redirect("/admin/siniflar?error=validation");

  const { error } = await supabase.from("classes").update({ status: parsed.data }).eq("id", classId);
  if (error) redirect("/admin/siniflar?error=db");

  revalidateClasses();
  redirect("/admin/siniflar?saved=1");
}

const classDetailsSchema = z.object({
  class_id: z.string().uuid(),
  overview: z.string().max(5000),
  duration_weeks: z.coerce.number().int().min(0).max(104),
});

// Eğitim genel içeriği ve hafta sayısı (materyal yönetimi sayfasından)
export async function updateClassDetails(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = classDetailsSchema.safeParse({
    class_id: formData.get("class_id"),
    overview: formData.get("overview") ?? "",
    duration_weeks: formData.get("duration_weeks") ?? 0,
  });
  if (!parsed.success) redirect("/admin/siniflar?error=validation");

  const { class_id, ...update } = parsed.data;
  const { error } = await supabase.from("classes").update(update).eq("id", class_id);
  if (error) redirect(`/admin/siniflar/${class_id}?error=db`);

  revalidatePath(`/admin/siniflar/${class_id}`);
  redirect(`/admin/siniflar/${class_id}?saved=1`);
}

const materialSchema = z.object({
  class_id: z.string().uuid(),
  category: z.enum(["general", "weekly", "homework", "note"]),
  week_number: z.union([z.literal(""), z.coerce.number().int().min(1).max(104)]).optional(),
  title: z.string().min(2).max(200),
  content_md: z.string().max(50000),
  sort_order: z.coerce.number().int().min(0),
});

function materialInputFromForm(formData: FormData) {
  return {
    class_id: formData.get("class_id"),
    category: formData.get("category"),
    week_number: formData.get("week_number") ?? "",
    title: formData.get("title"),
    content_md: formData.get("content_md") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
  };
}

async function uploadMaterialFile(
  supabase: SupabaseClient,
  classId: string,
  file: File,
): Promise<{ filePath: string } | { error: string }> {
  const validation = validateMaterialFile(file);
  if (!validation.ok) return { error: validation.code };

  const filePath = buildMaterialStoragePath(classId, file.name);
  const { error: uploadError } = await supabase.storage.from("class-materials").upload(filePath, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (uploadError) return { error: mapUploadError(uploadError.message) };
  return { filePath };
}

async function removeStorageFile(supabase: SupabaseClient, filePath: string | null | undefined) {
  if (!filePath) return;
  await supabase.storage.from("class-materials").remove([filePath]);
}

// Yeni materyal: MD içerik ve/veya dosya (private 'class-materials' bucket'ına)
export async function createMaterial(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = materialSchema.safeParse(materialInputFromForm(formData));
  const classId = String(formData.get("class_id"));
  if (!parsed.success) redirect(materialAdminPath(classId, "validation"));

  let filePath: string | null = null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadMaterialFile(supabase, parsed.data.class_id, file);
    if ("error" in upload) redirect(materialAdminPath(parsed.data.class_id, upload.error));
    filePath = upload.filePath;
  }

  const { class_id, week_number, ...rest } = parsed.data;
  const { error } = await supabase.from("class_materials").insert({
    class_id,
    ...rest,
    week_number: week_number === "" || week_number === undefined ? null : week_number,
    file_path: filePath,
  });
  if (error) {
    if (filePath) await removeStorageFile(supabase, filePath);
    redirect(materialAdminPath(class_id, "db"));
  }

  revalidatePath(materialAdminPath(class_id));
  redirect(materialAdminPath(class_id, undefined, true));
}

export async function updateMaterial(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const materialId = String(formData.get("material_id"));

  const parsed = materialSchema.safeParse(materialInputFromForm(formData));
  const classId = String(formData.get("class_id"));
  if (!parsed.success) redirect(materialAdminPath(classId, "validation"));

  const { data: existing } = await supabase
    .from("class_materials")
    .select("file_path")
    .eq("id", materialId)
    .maybeSingle();

  let nextFilePath = existing?.file_path ?? null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const upload = await uploadMaterialFile(supabase, parsed.data.class_id, file);
    if ("error" in upload) redirect(materialAdminPath(parsed.data.class_id, upload.error));
    if (existing?.file_path) await removeStorageFile(supabase, existing.file_path);
    nextFilePath = upload.filePath;
  }

  const { class_id, week_number, ...rest } = parsed.data;
  const { error } = await supabase
    .from("class_materials")
    .update({
      ...rest,
      week_number: week_number === "" || week_number === undefined ? null : week_number,
      file_path: nextFilePath,
    })
    .eq("id", materialId);
  if (error) redirect(materialAdminPath(class_id, "db"));

  revalidatePath(materialAdminPath(class_id));
  redirect(materialAdminPath(class_id, undefined, true));
}

export async function deleteMaterial(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const materialId = String(formData.get("material_id"));
  const classId = String(formData.get("class_id"));

  const { data: material } = await supabase
    .from("class_materials")
    .select("file_path")
    .eq("id", materialId)
    .maybeSingle();
  await removeStorageFile(supabase, material?.file_path);

  await supabase.from("class_materials").delete().eq("id", materialId);

  revalidatePath(materialAdminPath(classId));
  redirect(materialAdminPath(classId, undefined, true));
}

/** Sınıfa ait tüm materyal dosyalarını storage'dan temizler */
export async function purgeClassMaterialFiles(
  supabase: SupabaseClient,
  classId: string,
): Promise<void> {
  const { data: materials } = await supabase
    .from("class_materials")
    .select("file_path")
    .eq("class_id", classId);
  const paths = (materials ?? [])
    .map((row) => row.file_path)
    .filter((path): path is string => Boolean(path));
  if (paths.length > 0) {
    await supabase.storage.from("class-materials").remove(paths);
  }
}

// Onay: kontenjan kontrolü DB fonksiyonunda atomik yapılır
export async function approveEnrollment(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const enrollmentId = String(formData.get("enrollment_id"));

  const { error } = await supabase.rpc("approve_class_enrollment", {
    p_enrollment_id: enrollmentId,
  });
  if (error) {
    const reason = error.message.includes("CLASS_FULL") ? "full" : "db";
    redirect(`/admin/siniflar?error=${reason}`);
  }

  revalidateClasses();
  redirect("/admin/siniflar?saved=1");
}

export async function rejectEnrollment(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const enrollmentId = String(formData.get("enrollment_id"));

  await supabase
    .from("class_enrollments")
    .update({ status: "cancelled" })
    .eq("id", enrollmentId)
    .eq("status", "pending");

  revalidateClasses();
  redirect("/admin/siniflar?saved=1");
}
