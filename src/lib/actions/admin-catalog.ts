// src/lib/actions/admin-catalog.ts — program kataloğu: program, müfredat, paket (+ paket müfredatı), fiyat planı ve konu CRUD
"use server";

import { requireAdmin } from "@/lib/actions/admin-guard";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/components/admin/lib/action-state";
import { bool, dbError, fail, isUuid, lines, ok, optNum, revalidateEverything, str } from "@/lib/actions/admin-utils";

const CATEGORIES = ["excel", "word", "powerpoint"];
const LEVELS = ["beginner", "intermediate", "advanced", "all"];

function intIn(raw: string, min: number, max: number): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

// ------------------------------------------------------------
// Program
// ------------------------------------------------------------
export async function createProgram(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const title = str(formData, "title");
  const category = str(formData, "category");
  if (title.length < 2 || title.length > 120) return fail("Program adı 2–120 karakter olmalı.");
  if (!CATEGORIES.includes(category)) return fail("Kategori seç.");

  // Müfredat eklenmeden yayına alınmaz: pasif başlar
  const { data, error } = await supabase
    .from("education_modules")
    .insert({ title, category, description: str(formData, "description").slice(0, 500), is_active: false })
    .select("id")
    .single();
  if (error || !data) return fail(dbError(error?.message, "Program oluşturulamadı."));

  await logAudit(supabase, user.id, "module.create", "module", data.id, `${title} oluşturuldu`);
  revalidateEverything();
  return ok("Program oluşturuldu. Yayına almadan önce müfredat ekle.", { redirectTo: `/admin/programlar/${data.id}?tab=mufredat` });
}

export async function updateProgram(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "module_id");
  if (!isUuid(id)) return fail("Program bulunamadı.");

  const title = str(formData, "title");
  const slug = str(formData, "slug").toLowerCase();
  const category = str(formData, "category");
  const level = str(formData, "level");
  const sortOrder = intIn(str(formData, "sort_order") || "0", 0, 9999);
  const isActive = bool(formData, "is_active");

  if (title.length < 2 || title.length > 120) return fail("Program adı 2–120 karakter olmalı.");
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return fail("Adres (slug) yalnızca küçük harf, rakam ve tire içerebilir.");
  if (!CATEGORIES.includes(category)) return fail("Kategori seç.");
  if (!LEVELS.includes(level)) return fail("Seviye seç.");
  if (sortOrder === null) return fail("Sıra 0 ya da pozitif bir tam sayı olmalı.");

  // Yayına almadan önce en az bir müfredat haftası gerekir (kaydetmeden kontrol)
  if (isActive) {
    const { count } = await supabase.from("module_syllabus_weeks").select("id", { count: "exact", head: true }).eq("module_id", id);
    if ((count ?? 0) < 1) return fail("Yayına almak için önce Müfredat sekmesinden en az bir hafta ekle.");
  }

  const { error } = await supabase
    .from("education_modules")
    .update({
      title,
      slug,
      category,
      level,
      audience: str(formData, "audience").slice(0, 500),
      description: str(formData, "description").slice(0, 500),
      long_description: str(formData, "long_description").slice(0, 5000),
      features: lines(formData, "features").slice(0, 30),
      outcomes: lines(formData, "outcomes").slice(0, 30),
      badge: str(formData, "badge").slice(0, 40),
      public_price_hint: str(formData, "public_price_hint").slice(0, 120),
      is_active: isActive,
      sort_order: sortOrder,
    })
    .eq("id", id);
  if (error) return fail(error.message.includes("slug") ? "Bu adres (slug) başka bir programda kullanılıyor." : dbError(error.message));

  await logAudit(supabase, user.id, "module.update", "module", id, `${title} güncellendi${isActive ? " (yayında)" : ""}`);
  revalidateEverything();
  return ok("Program kaydedildi");
}

export async function deleteProgram(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "module_id");
  if (!isUuid(id)) return fail("Program bulunamadı.");
  const { data: program } = await supabase.from("education_modules").select("title").eq("id", id).maybeSingle();
  if (!program) return fail("Program bulunamadı.");

  // Dönemlerin materyal dosyalarını depolamadan temizle
  const { data: cohorts } = await supabase.from("classes").select("id").eq("module_id", id);
  const cohortIds = (cohorts ?? []).map((row) => row.id);
  if (cohortIds.length) {
    const { data: materials } = await supabase.from("class_materials").select("file_path").in("class_id", cohortIds);
    const paths = (materials ?? []).map((row) => row.file_path).filter((path): path is string => Boolean(path));
    if (paths.length) await supabase.storage.from("class-materials").remove(paths);
  }

  const { error } = await supabase.from("education_modules").delete().eq("id", id);
  if (error) return fail(dbError(error.message, "Program silinemedi."));

  await logAudit(supabase, user.id, "module.delete", "module", id, `${program.title} silindi`);
  revalidateEverything();
  return ok("Program silindi", { redirectTo: "/admin/programlar" });
}

// ------------------------------------------------------------
// Program müfredatı
// ------------------------------------------------------------
export async function saveSyllabusWeek(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const moduleId = str(formData, "module_id");
  const weekId = str(formData, "week_id");
  const week = intIn(str(formData, "week_number"), 1, 104);
  const title = str(formData, "title");
  if (!isUuid(moduleId)) return fail("Program bulunamadı.");
  if (week === null) return fail("Hafta numarası 1–104 arasında olmalı.");
  if (title.length < 2 || title.length > 200) return fail("Başlık 2–200 karakter olmalı.");
  const payload = {
    week_number: week,
    title,
    description: str(formData, "description").slice(0, 1000),
    sort_order: intIn(str(formData, "sort_order") || "0", 0, 9999) ?? 0,
  };

  const { error } = weekId
    ? await supabase.from("module_syllabus_weeks").update(payload).eq("id", weekId)
    : await supabase.from("module_syllabus_weeks").insert({ ...payload, module_id: moduleId });
  if (error) return fail(dbError(error.message, "Hafta kaydedilemedi."));

  await logAudit(supabase, user.id, weekId ? "syllabus.update" : "syllabus.create", "module", moduleId, `Hafta ${week}: ${title}`);
  revalidateEverything();
  return ok(weekId ? "Hafta kaydedildi" : "Hafta eklendi");
}

export async function deleteSyllabusWeek(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "week_id");
  if (!isUuid(id)) return fail("Hafta bulunamadı.");
  const { data: week } = await supabase.from("module_syllabus_weeks").select("module_id, week_number, title").eq("id", id).maybeSingle();
  if (!week) return fail("Hafta bulunamadı.");

  // Yayındaki programın son haftası silinemez
  const [{ data: program }, { count }] = await Promise.all([
    supabase.from("education_modules").select("is_active").eq("id", week.module_id).maybeSingle(),
    supabase.from("module_syllabus_weeks").select("id", { count: "exact", head: true }).eq("module_id", week.module_id),
  ]);
  if (program?.is_active && (count ?? 0) <= 1) return fail("Yayındaki programın son haftası silinemez. Önce programı pasife al.");

  const { error } = await supabase.from("module_syllabus_weeks").delete().eq("id", id);
  if (error) return fail("Hafta silinemedi.");
  await logAudit(supabase, user.id, "syllabus.delete", "module", week.module_id, `Hafta ${week.week_number}: ${week.title} silindi`);
  revalidateEverything();
  return ok("Hafta silindi");
}

// ------------------------------------------------------------
// Paketler
// ------------------------------------------------------------
export async function saveBundle(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const moduleId = str(formData, "module_id");
  const bundleId = str(formData, "bundle_id");
  const title = str(formData, "title");
  const price = optNum(formData, "fixed_price");
  const hours = intIn(str(formData, "duration_hours"), 1, 1000);
  if (!isUuid(moduleId)) return fail("Program bulunamadı.");
  if (title.length < 2 || title.length > 120) return fail("Paket adı 2–120 karakter olmalı.");
  if (price === null || Number.isNaN(price) || price <= 0) return fail("Paket fiyatını gir (₺).");
  if (hours === null) return fail("Süre en az 1 saat olmalı.");
  const payload = { title, description: str(formData, "description").slice(0, 1000), fixed_price: price, duration_hours: hours, is_active: bool(formData, "is_active") };

  const { error } = bundleId
    ? await supabase.from("bundle_packages").update(payload).eq("id", bundleId)
    : await supabase.from("bundle_packages").insert({ ...payload, module_id: moduleId });
  if (error) return fail(dbError(error.message, "Paket kaydedilemedi."));

  await logAudit(supabase, user.id, bundleId ? "bundle.update" : "bundle.create", "module", moduleId, `Paket: ${title}`);
  revalidateEverything();
  return ok(bundleId ? "Paket kaydedildi" : "Paket eklendi");
}

export async function deleteBundle(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "bundle_id");
  if (!isUuid(id)) return fail("Paket bulunamadı.");
  const { data: bundle } = await supabase.from("bundle_packages").select("module_id, title").eq("id", id).maybeSingle();
  if (!bundle) return fail("Paket bulunamadı.");
  const { error } = await supabase.from("bundle_packages").delete().eq("id", id);
  if (error) return fail(dbError(error.message, "Paket silinemedi."));
  await logAudit(supabase, user.id, "bundle.delete", "module", bundle.module_id, `Paket silindi: ${bundle.title}`);
  revalidateEverything();
  return ok("Paket silindi");
}

export async function saveBundleWeek(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const bundleId = str(formData, "bundle_id");
  const weekId = str(formData, "week_id");
  const week = intIn(str(formData, "week_number"), 1, 52);
  const title = str(formData, "title");
  const kind = str(formData, "week_kind") === "specialized" ? "specialized" : "core";
  if (!isUuid(bundleId)) return fail("Paket bulunamadı.");
  if (week === null) return fail("Hafta numarası 1–52 arasında olmalı.");
  if (title.length < 2 || title.length > 200) return fail("Başlık 2–200 karakter olmalı.");
  const payload = {
    week_number: week,
    title,
    description: str(formData, "description").slice(0, 1000),
    week_kind: kind,
    sort_order: intIn(str(formData, "sort_order") || "0", 0, 9999) ?? 0,
  };

  const { error } = weekId
    ? await supabase.from("bundle_syllabus_weeks").update(payload).eq("id", weekId)
    : await supabase.from("bundle_syllabus_weeks").insert({ ...payload, bundle_id: bundleId });
  if (error) return fail(dbError(error.message, "Hafta kaydedilemedi."));

  const { data: bundle } = await supabase.from("bundle_packages").select("module_id, title").eq("id", bundleId).maybeSingle();
  await logAudit(supabase, user.id, "bundle_syllabus.save", "module", bundle?.module_id ?? null, `${bundle?.title ?? "Paket"} · Hafta ${week}: ${title}`);
  revalidateEverything();
  return ok(weekId ? "Hafta kaydedildi" : "Hafta eklendi");
}

export async function deleteBundleWeek(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "week_id");
  if (!isUuid(id)) return fail("Hafta bulunamadı.");
  const { data: week } = await supabase.from("bundle_syllabus_weeks").select("bundle_id, title, bundle_packages(module_id)").eq("id", id).maybeSingle();
  if (!week) return fail("Hafta bulunamadı.");
  const { error } = await supabase.from("bundle_syllabus_weeks").delete().eq("id", id);
  if (error) return fail("Hafta silinemedi.");
  await logAudit(supabase, user.id, "bundle_syllabus.delete", "module", week.bundle_packages?.module_id ?? null, `Paket haftası silindi: ${week.title}`);
  revalidateEverything();
  return ok("Hafta silindi");
}

/** Program müfredatındaki bir haftayı pakete kopyalar (sona ekler) */
export async function copyModuleWeekToBundle(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const bundleId = str(formData, "bundle_id");
  const moduleWeekId = str(formData, "module_week_id");
  const kind = str(formData, "week_kind") === "specialized" ? "specialized" : "core";
  if (!isUuid(bundleId) || !isUuid(moduleWeekId)) return fail("Kopyalanacak haftayı seç.");

  const [{ data: moduleWeek }, { data: duplicate }, { data: lastWeek }] = await Promise.all([
    supabase.from("module_syllabus_weeks").select("id, module_id, title, description, sort_order").eq("id", moduleWeekId).maybeSingle(),
    supabase.from("bundle_syllabus_weeks").select("id").eq("bundle_id", bundleId).eq("source_module_week_id", moduleWeekId).maybeSingle(),
    supabase.from("bundle_syllabus_weeks").select("week_number").eq("bundle_id", bundleId).order("week_number", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!moduleWeek) return fail("Program haftası bulunamadı.");
  if (duplicate) return fail("Bu hafta pakete zaten eklenmiş.");

  const next = (lastWeek?.week_number ?? 0) + 1;
  if (next > 52) return fail("Paket en fazla 52 hafta olabilir.");
  const { error } = await supabase.from("bundle_syllabus_weeks").insert({
    bundle_id: bundleId,
    week_number: next,
    title: moduleWeek.title,
    description: moduleWeek.description,
    week_kind: kind,
    source_module_week_id: moduleWeek.id,
    sort_order: moduleWeek.sort_order || next,
  });
  if (error) return fail("Hafta kopyalanamadı.");

  await logAudit(supabase, user.id, "bundle_syllabus.copy", "module", moduleWeek.module_id, `Pakete kopyalandı: ${moduleWeek.title}`);
  revalidateEverything();
  return ok(`Hafta ${next} olarak eklendi`);
}

// ------------------------------------------------------------
// Fiyat planları
// ------------------------------------------------------------
export async function savePlan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const moduleId = str(formData, "module_id");
  const planId = str(formData, "plan_id");
  const type = str(formData, "training_type");
  const unit = str(formData, "unit");
  const min = intIn(str(formData, "min_people"), 1, 1000);
  const max = intIn(str(formData, "max_people"), 1, 1000);
  const price = optNum(formData, "price");
  if (!isUuid(moduleId)) return fail("Program bulunamadı.");
  if (!["individual", "group"].includes(type)) return fail("Eğitim türünü seç.");
  if (!["per_hour", "total"].includes(unit)) return fail("Fiyat birimini seç.");
  if (min === null || max === null || min > max) return fail("Kişi aralığı geçersiz (en az ≤ en çok).");
  if (price === null || Number.isNaN(price) || price <= 0) return fail("Fiyatı gir (₺).");
  const payload = {
    training_type: type,
    unit,
    min_people: min,
    max_people: max,
    price,
    note: str(formData, "note").slice(0, 200),
    sort_order: intIn(str(formData, "sort_order") || "0", 0, 9999) ?? 0,
    is_active: bool(formData, "is_active"),
  };

  const { error } = planId
    ? await supabase.from("pricing_plans").update(payload).eq("id", planId)
    : await supabase.from("pricing_plans").insert({ ...payload, module_id: moduleId });
  if (error) return fail(dbError(error.message, "Fiyat planı kaydedilemedi."));

  await logAudit(supabase, user.id, planId ? "plan.update" : "plan.create", "module", moduleId, `Fiyat planı: ${type} ${min}-${max} kişi ₺${price}`);
  revalidateEverything();
  return ok(planId ? "Fiyat planı kaydedildi" : "Fiyat planı eklendi");
}

export async function deletePlan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "plan_id");
  if (!isUuid(id)) return fail("Plan bulunamadı.");
  const { data: plan } = await supabase.from("pricing_plans").select("module_id").eq("id", id).maybeSingle();
  if (!plan) return fail("Plan bulunamadı.");
  const { error } = await supabase.from("pricing_plans").delete().eq("id", id);
  if (error) return fail("Plan silinemedi.");
  await logAudit(supabase, user.id, "plan.delete", "module", plan.module_id, "Fiyat planı silindi");
  revalidateEverything();
  return ok("Fiyat planı silindi");
}

// ------------------------------------------------------------
// Konular (birebir "kendi programın" havuzu)
// ------------------------------------------------------------
export async function saveTopic(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const moduleId = str(formData, "module_id");
  const topicId = str(formData, "topic_id");
  const title = str(formData, "title");
  const hours = intIn(str(formData, "estimated_hours"), 1, 100);
  if (!isUuid(moduleId)) return fail("Program bulunamadı.");
  if (title.length < 2 || title.length > 160) return fail("Konu adı 2–160 karakter olmalı.");
  if (hours === null) return fail("Tahmini süre 1–100 saat arasında olmalı.");
  const payload = { title, description: str(formData, "description").slice(0, 1000), estimated_hours: hours, is_active: bool(formData, "is_active") };

  const { error } = topicId
    ? await supabase.from("topics").update(payload).eq("id", topicId)
    : await supabase.from("topics").insert({ ...payload, module_id: moduleId });
  if (error) return fail(dbError(error.message, "Konu kaydedilemedi."));

  await logAudit(supabase, user.id, topicId ? "topic.update" : "topic.create", "module", moduleId, `Konu: ${title}`);
  revalidateEverything();
  return ok(topicId ? "Konu kaydedildi" : "Konu eklendi");
}

export async function deleteTopic(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "topic_id");
  if (!isUuid(id)) return fail("Konu bulunamadı.");
  const { data: topic } = await supabase.from("topics").select("module_id, title").eq("id", id).maybeSingle();
  if (!topic) return fail("Konu bulunamadı.");
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) return fail(dbError(error.message, "Konu silinemedi. Taleplerde kullanılıyorsa pasife al."));
  await logAudit(supabase, user.id, "topic.delete", "module", topic.module_id, `Konu silindi: ${topic.title}`);
  revalidateEverything();
  return ok("Konu silindi");
}
