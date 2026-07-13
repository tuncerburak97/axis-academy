// src/lib/actions/admin-catalog.ts — modül / fiyat planı / örnek paket CRUD Server Action'ları
// MVP hata stratejisi: doğrulama hatasında forma ?error parametresiyle dönülür (banner gösterilir)
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin-guard";

// Public eğitim sayfaları + admin modül ekranları birlikte tazelenir
function revalidateCatalog(moduleId?: string) {
  revalidatePath("/egitim");
  if (moduleId) revalidatePath(`/egitim/${moduleId}`);
  revalidatePath("/admin/moduller");
}

// "Satır başına bir madde" metnini diziye çevirir
function parseFeatures(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const moduleSchema = z.object({
  title: z.string().min(2).max(120),
  category: z.enum(["excel", "word", "powerpoint"]),
  description: z.string().max(500),
  long_description: z.string().max(5000),
  badge: z.string().max(40),
  public_price_hint: z.string().max(120),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.coerce.boolean(),
});

export async function createModule(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    long_description: formData.get("long_description") ?? "",
    badge: formData.get("badge") ?? "",
    public_price_hint: formData.get("public_price_hint") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
    // Hızlı oluşturma formunda checkbox yoksa modül aktif başlar
    is_active: formData.get("is_active") === null ? true : formData.get("is_active") === "on",
  });
  if (!parsed.success) redirect("/admin/moduller?error=validation");

  const { data, error } = await supabase
    .from("education_modules")
    .insert({ ...parsed.data, features: parseFeatures(formData.get("features")) })
    .select("id")
    .single();
  if (error) redirect("/admin/moduller?error=db");

  revalidateCatalog(data.id);
  redirect(`/admin/moduller/${data.id}?hint=add_syllabus&tab=syllabus`);
}

export async function updateModule(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const moduleId = String(formData.get("module_id"));

  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    long_description: formData.get("long_description") ?? "",
    badge: formData.get("badge") ?? "",
    public_price_hint: formData.get("public_price_hint") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) redirect(`/admin/moduller/${moduleId}?error=validation`);

  const { error } = await supabase
    .from("education_modules")
    .update({ ...parsed.data, features: parseFeatures(formData.get("features")) })
    .eq("id", moduleId);
  if (error) redirect(`/admin/moduller/${moduleId}?error=db`);

  if (parsed.data.is_active) {
    const { count } = await supabase
      .from("module_syllabus_weeks")
      .select("*", { count: "exact", head: true })
      .eq("module_id", moduleId);
    if ((count ?? 0) < 1) redirect(`/admin/moduller/${moduleId}?error=syllabus_required&tab=syllabus`);
  }

  revalidateCatalog(moduleId);
  redirect(`/admin/moduller/${moduleId}?saved=1`);
}

const planSchema = z.object({
  module_id: z.string().uuid(),
  training_type: z.enum(["individual", "group"]),
  min_people: z.coerce.number().int().min(1),
  max_people: z.coerce.number().int().min(1),
  price: z.coerce.number().positive(),
  unit: z.enum(["per_hour", "total"]),
  note: z.string().max(200),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.coerce.boolean(),
});

function planInputFromForm(formData: FormData) {
  return {
    module_id: formData.get("module_id"),
    training_type: formData.get("training_type"),
    min_people: formData.get("min_people") ?? 1,
    max_people: formData.get("max_people") ?? 1,
    price: formData.get("price"),
    unit: formData.get("unit"),
    note: formData.get("note") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
    is_active: formData.get("is_active") === "on",
  };
}

export async function createPlan(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const parsed = planSchema.safeParse(planInputFromForm(formData));
  if (!parsed.success) redirect(`/admin/moduller/${formData.get("module_id")}?error=validation`);

  const { error } = await supabase.from("pricing_plans").insert(parsed.data);
  if (error) redirect(`/admin/moduller/${parsed.data.module_id}?error=db`);

  revalidateCatalog(parsed.data.module_id);
  redirect(`/admin/moduller/${parsed.data.module_id}?saved=1`);
}

export async function updatePlan(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const planId = String(formData.get("plan_id"));
  const parsed = planSchema.safeParse(planInputFromForm(formData));
  if (!parsed.success) redirect(`/admin/moduller/${formData.get("module_id")}?error=validation`);

  const { error } = await supabase.from("pricing_plans").update(parsed.data).eq("id", planId);
  if (error) redirect(`/admin/moduller/${parsed.data.module_id}?error=db`);

  revalidateCatalog(parsed.data.module_id);
  redirect(`/admin/moduller/${parsed.data.module_id}?saved=1`);
}

export async function deletePlan(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const planId = String(formData.get("plan_id"));
  const moduleId = String(formData.get("module_id"));

  await supabase.from("pricing_plans").delete().eq("id", planId);

  revalidateCatalog(moduleId);
  redirect(`/admin/moduller/${moduleId}?saved=1`);
}

const bundleSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(2).max(120),
  description: z.string().max(1000),
  fixed_price: z.coerce.number().positive(),
  duration_hours: z.coerce.number().int().min(1),
  is_active: z.coerce.boolean(),
});

function bundleInputFromForm(formData: FormData) {
  return {
    module_id: formData.get("module_id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    fixed_price: formData.get("fixed_price"),
    duration_hours: formData.get("duration_hours"),
    is_active: formData.get("is_active") === "on",
  };
}

export async function createBundle(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const parsed = bundleSchema.safeParse(bundleInputFromForm(formData));
  if (!parsed.success) redirect(`/admin/moduller/${formData.get("module_id")}?error=validation`);

  const { error } = await supabase.from("bundle_packages").insert(parsed.data);
  if (error) redirect(`/admin/moduller/${parsed.data.module_id}?error=db`);

  revalidateCatalog(parsed.data.module_id);
  redirect(`/admin/moduller/${parsed.data.module_id}?saved=1`);
}

export async function updateBundle(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const bundleId = String(formData.get("bundle_id"));
  const parsed = bundleSchema.safeParse(bundleInputFromForm(formData));
  if (!parsed.success) redirect(`/admin/moduller/${formData.get("module_id")}?error=validation`);

  const { error } = await supabase.from("bundle_packages").update(parsed.data).eq("id", bundleId);
  if (error) redirect(`/admin/moduller/${parsed.data.module_id}?error=db`);

  revalidateCatalog(parsed.data.module_id);
  redirect(`/admin/moduller/${parsed.data.module_id}?saved=1`);
}

export async function deleteBundle(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const bundleId = String(formData.get("bundle_id"));
  const moduleId = String(formData.get("module_id"));

  await supabase.from("bundle_packages").delete().eq("id", bundleId);

  revalidateCatalog(moduleId);
  redirect(`/admin/moduller/${moduleId}?saved=1`);
}

const syllabusSchema = z.object({
  module_id: z.string().uuid(),
  week_number: z.coerce.number().int().min(1).max(104),
  title: z.string().min(2).max(200),
  description: z.string().max(1000),
  sort_order: z.coerce.number().int().min(0),
});

function syllabusInputFromForm(formData: FormData) {
  return {
    module_id: formData.get("module_id"),
    week_number: formData.get("week_number"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
  };
}

function syllabusAdminPath(moduleId: string, error?: string, saved?: boolean) {
  const params = new URLSearchParams();
  if (error) params.set("error", error);
  if (saved) params.set("saved", "1");
  params.set("tab", "syllabus");
  const query = params.toString();
  return `/admin/moduller/${moduleId}?${query}`;
}

export async function createSyllabusWeek(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const parsed = syllabusSchema.safeParse(syllabusInputFromForm(formData));
  const moduleId = String(formData.get("module_id"));
  if (!parsed.success) redirect(syllabusAdminPath(moduleId, "validation"));

  const { error } = await supabase.from("module_syllabus_weeks").insert(parsed.data);
  if (error) redirect(syllabusAdminPath(moduleId, "db"));

  revalidateCatalog(moduleId);
  redirect(syllabusAdminPath(moduleId, undefined, true));
}

export async function updateSyllabusWeek(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const weekId = String(formData.get("week_id"));
  const parsed = syllabusSchema.safeParse(syllabusInputFromForm(formData));
  const moduleId = String(formData.get("module_id"));
  if (!parsed.success) redirect(syllabusAdminPath(moduleId, "validation"));

  const { error } = await supabase.from("module_syllabus_weeks").update(parsed.data).eq("id", weekId);
  if (error) redirect(syllabusAdminPath(moduleId, "db"));

  revalidateCatalog(moduleId);
  redirect(syllabusAdminPath(moduleId, undefined, true));
}

export async function deleteSyllabusWeek(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const weekId = String(formData.get("week_id"));
  const moduleId = String(formData.get("module_id"));

  const { error } = await supabase.from("module_syllabus_weeks").delete().eq("id", weekId);
  if (error) redirect(syllabusAdminPath(moduleId, "db"));

  revalidateCatalog(moduleId);
  redirect(syllabusAdminPath(moduleId, undefined, true));
}
