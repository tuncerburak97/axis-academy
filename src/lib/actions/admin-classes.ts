// src/lib/actions/admin-classes.ts — sınıf CRUD ve katılım onay/red Server Action'ları
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin-guard";

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

const MAX_MATERIAL_FILE_SIZE = 20 * 1024 * 1024; // 20MB

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

// Yeni materyal: MD içerik ve/veya dosya (private 'class-materials' bucket'ına)
export async function createMaterial(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = materialSchema.safeParse(materialInputFromForm(formData));
  if (!parsed.success) redirect(`/admin/siniflar/${formData.get("class_id")}?error=validation`);

  let filePath: string | null = null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_MATERIAL_FILE_SIZE) {
      redirect(`/admin/siniflar/${parsed.data.class_id}?error=validation`);
    }
    filePath = `${parsed.data.class_id}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("class-materials").upload(filePath, file);
    if (uploadError) redirect(`/admin/siniflar/${parsed.data.class_id}?error=db`);
  }

  const { class_id, week_number, ...rest } = parsed.data;
  const { error } = await supabase.from("class_materials").insert({
    class_id,
    ...rest,
    week_number: week_number === "" || week_number === undefined ? null : week_number,
    file_path: filePath,
  });
  if (error) redirect(`/admin/siniflar/${class_id}?error=db`);

  revalidatePath(`/admin/siniflar/${class_id}`);
  redirect(`/admin/siniflar/${class_id}?saved=1`);
}

export async function updateMaterial(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const materialId = String(formData.get("material_id"));

  const parsed = materialSchema.safeParse(materialInputFromForm(formData));
  if (!parsed.success) redirect(`/admin/siniflar/${formData.get("class_id")}?error=validation`);

  const { class_id, week_number, ...rest } = parsed.data;
  const { error } = await supabase
    .from("class_materials")
    .update({
      ...rest,
      week_number: week_number === "" || week_number === undefined ? null : week_number,
    })
    .eq("id", materialId);
  if (error) redirect(`/admin/siniflar/${class_id}?error=db`);

  revalidatePath(`/admin/siniflar/${class_id}`);
  redirect(`/admin/siniflar/${class_id}?saved=1`);
}

export async function deleteMaterial(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const materialId = String(formData.get("material_id"));
  const classId = String(formData.get("class_id"));

  // Varsa storage'daki dosyayı da temizle
  const { data: material } = await supabase
    .from("class_materials")
    .select("file_path")
    .eq("id", materialId)
    .maybeSingle();
  if (material?.file_path) {
    await supabase.storage.from("class-materials").remove([material.file_path]);
  }

  await supabase.from("class_materials").delete().eq("id", materialId);

  revalidatePath(`/admin/siniflar/${classId}`);
  redirect(`/admin/siniflar/${classId}?saved=1`);
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
