// src/lib/queries/public-catalog.ts — herkese açık katalog sorguları (program, dönem, fiyat, müfredat, yorum)
// Anonim ziyaretçi de okuyabilir (RLS: aktif katalog satırları herkese açık).
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CatalogCohort, ProgramRow, PublicReview, Row } from "@/lib/types/platform";

export type PlanRow = Row<"pricing_plans">;
export type BundleRow = Row<"bundle_packages">;
export type TopicRow = Row<"topics">;
export type SyllabusWeekRow = Row<"module_syllabus_weeks">;
export type BundleWeekRow = Row<"bundle_syllabus_weeks">;

export type ProgramCategory = "excel" | "word" | "powerpoint";

export const programCategoryLabels: Record<ProgramCategory, string> = {
  excel: "Excel",
  word: "Word",
  powerpoint: "PowerPoint",
};

export function isProgramCategory(value: unknown): value is ProgramCategory {
  return value === "excel" || value === "word" || value === "powerpoint";
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** Bir programın en düşük fiyatı: dönem fiyatı, paket fiyatı ve kişi başı grup fiyatı arasından.
 *  Hiçbiri yoksa saatlik birebir fiyatı "/ saat" birimiyle döner. */
export interface StartingPrice {
  amount: number;
  unit?: string;
}

export function computeStartingPrice(input: {
  cohorts: Pick<CatalogCohort, "price">[];
  bundles: Pick<BundleRow, "fixed_price" | "is_active">[];
  plans: Pick<PlanRow, "price" | "training_type" | "unit" | "is_active">[];
}): StartingPrice | null {
  const candidates: number[] = [];
  for (const cohort of input.cohorts) if (cohort.price && cohort.price > 0) candidates.push(Number(cohort.price));
  for (const bundle of input.bundles) if (bundle.is_active && bundle.fixed_price > 0) candidates.push(Number(bundle.fixed_price));
  for (const plan of input.plans) {
    if (plan.is_active && plan.training_type === "group" && plan.price > 0) candidates.push(Number(plan.price));
  }
  if (candidates.length > 0) return { amount: Math.min(...candidates) };
  const hourly = input.plans.find((plan) => plan.is_active && plan.training_type === "individual" && plan.unit === "per_hour");
  return hourly ? { amount: Number(hourly.price), unit: "saat" } : null;
}

export interface ProgramSummary {
  program: ProgramRow;
  category: ProgramCategory;
  startingPrice: StartingPrice | null;
  weeks: number;
  hours: number;
  cohorts: CatalogCohort[];
  bundleCount: number;
}

/** Yaklaşan açık/dolu dönemler (kontenjan ve oturumdaki kullanıcının durumu ile) */
export const getCatalogCohorts = cache(async (moduleId?: string, limit = 24): Promise<CatalogCohort[]> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_catalog_cohorts", {
    ...(moduleId ? { p_module_id: moduleId } : {}),
    p_limit: limit,
  });
  return data ?? [];
});

/** Katalog: aktif programlar ve kart özetleri */
export const getProgramSummaries = cache(async (): Promise<ProgramSummary[]> => {
  const supabase = await createClient();
  const [modules, plans, bundles, weeks, cohorts] = await Promise.all([
    supabase.from("education_modules").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("pricing_plans").select("*").eq("is_active", true),
    supabase.from("bundle_packages").select("*").eq("is_active", true),
    supabase.from("module_syllabus_weeks").select("module_id"),
    getCatalogCohorts(undefined, 100),
  ]);

  return (modules.data ?? []).map((program) => {
    const programCohorts = cohorts.filter((cohort) => cohort.module_id === program.id);
    const programBundles = (bundles.data ?? []).filter((bundle) => bundle.module_id === program.id);
    const programPlans = (plans.data ?? []).filter((plan) => plan.module_id === program.id);
    const weekCount = (weeks.data ?? []).filter((week) => week.module_id === program.id).length;
    const next = programCohorts[0];
    const minBundleHours = programBundles.length ? Math.min(...programBundles.map((b) => b.duration_hours)) : 0;
    return {
      program,
      category: isProgramCategory(program.category) ? program.category : "excel",
      startingPrice: computeStartingPrice({ cohorts: programCohorts, bundles: programBundles, plans: programPlans }),
      weeks: weekCount || next?.duration_weeks || 0,
      hours: next?.duration_hours || minBundleHours,
      cohorts: programCohorts,
      bundleCount: programBundles.length,
    };
  });
});

/** Program sayfası: slug ya da eski uuid ile */
export const getProgramByParam = cache(async (param: string): Promise<ProgramRow | null> => {
  const supabase = await createClient();
  const query = supabase.from("education_modules").select("*").eq("is_active", true);
  const { data } = await (isUuid(param) ? query.eq("id", param) : query.eq("slug", param)).maybeSingle();
  return data;
});

export interface ProgramDetail {
  program: ProgramRow;
  cohorts: CatalogCohort[];
  plans: PlanRow[];
  bundles: (BundleRow & { weeks: BundleWeekRow[] })[];
  syllabus: SyllabusWeekRow[];
  topics: TopicRow[];
  reviews: PublicReview[];
  startingPrice: StartingPrice | null;
}

export async function getProgramDetail(program: ProgramRow): Promise<ProgramDetail> {
  const supabase = await createClient();
  const [cohorts, plans, bundles, syllabus, topics, reviews] = await Promise.all([
    getCatalogCohorts(program.id, 24),
    supabase.from("pricing_plans").select("*").eq("module_id", program.id).eq("is_active", true).order("sort_order"),
    supabase.from("bundle_packages").select("*").eq("module_id", program.id).eq("is_active", true).order("fixed_price"),
    supabase.from("module_syllabus_weeks").select("*").eq("module_id", program.id).order("week_number"),
    supabase.from("topics").select("*").eq("module_id", program.id).eq("is_active", true).order("title"),
    getPublicReviews(program.id, 6),
  ]);

  const bundleRows = bundles.data ?? [];
  let bundleWeeks: BundleWeekRow[] = [];
  if (bundleRows.length > 0) {
    const { data } = await supabase
      .from("bundle_syllabus_weeks")
      .select("*")
      .in("bundle_id", bundleRows.map((bundle) => bundle.id))
      .order("week_number");
    bundleWeeks = data ?? [];
  }

  const planRows = plans.data ?? [];
  return {
    program,
    cohorts,
    plans: planRows,
    bundles: bundleRows.map((bundle) => ({ ...bundle, weeks: bundleWeeks.filter((week) => week.bundle_id === bundle.id) })),
    syllabus: syllabus.data ?? [],
    topics: topics.data ?? [],
    reviews,
    startingPrice: computeStartingPrice({ cohorts, bundles: bundleRows, plans: planRows }),
  };
}

/** Birebir sihirbazı için: aktif programlar + paketler + konular + saatlik fiyat */
export interface WizardProgram {
  id: string;
  slug: string;
  title: string;
  category: string;
  hourlyPrice: number | null;
  bundles: { id: string; title: string; description: string; fixed_price: number; duration_hours: number }[];
  topics: { id: string; title: string; description: string; estimated_hours: number }[];
}

export async function getWizardPrograms(): Promise<WizardProgram[]> {
  const supabase = await createClient();
  const [modules, plans, bundles, topics] = await Promise.all([
    supabase.from("education_modules").select("id, slug, title, category").eq("is_active", true).order("sort_order"),
    supabase.from("pricing_plans").select("*").eq("is_active", true).eq("training_type", "individual").eq("unit", "per_hour").order("sort_order"),
    supabase.from("bundle_packages").select("id, module_id, title, description, fixed_price, duration_hours").eq("is_active", true).order("fixed_price"),
    supabase.from("topics").select("id, module_id, title, description, estimated_hours").eq("is_active", true).order("title"),
  ]);
  return (modules.data ?? []).map((module) => ({
    id: module.id,
    slug: module.slug,
    title: module.title,
    category: module.category,
    hourlyPrice: (plans.data ?? []).find((plan) => plan.module_id === module.id)?.price ?? null,
    bundles: (bundles.data ?? [])
      .filter((bundle) => bundle.module_id === module.id)
      .map(({ module_id: _m, ...bundle }) => bundle),
    topics: (topics.data ?? [])
      .filter((topic) => topic.module_id === module.id)
      .map(({ module_id: _m, ...topic }) => topic),
  }));
}

/** Kurumsal sihirbazı için program adları */
export async function getProgramOptions(): Promise<{ slug: string; title: string; category: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("education_modules").select("slug, title, category").eq("is_active", true).order("sort_order");
  return data ?? [];
}

/** Yayındaki yorumlar (ad + soyadın baş harfi) */
export const getPublicReviews = cache(async (moduleId?: string, limit = 6): Promise<PublicReview[]> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_reviews", {
    ...(moduleId ? { p_module_id: moduleId } : {}),
    p_limit: limit,
  });
  return data ?? [];
});

/** Site haritası için program slug'ları */
export async function getProgramSlugs(): Promise<{ slug: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("education_modules").select("slug").eq("is_active", true);
  return data ?? [];
}

/** Kurumsal sayfası: programlara göre kişi başı grup fiyat aralıkları */
export interface GroupPricing {
  slug: string;
  title: string;
  category: string;
  tiers: { id: string; min_people: number; max_people: number; price: number; note: string }[];
}

export async function getGroupPricing(): Promise<GroupPricing[]> {
  const supabase = await createClient();
  const [modules, plans] = await Promise.all([
    supabase.from("education_modules").select("id, slug, title, category").eq("is_active", true).order("sort_order"),
    supabase.from("pricing_plans").select("*").eq("is_active", true).eq("training_type", "group").order("min_people"),
  ]);
  return (modules.data ?? [])
    .map((module) => ({
      slug: module.slug,
      title: module.title,
      category: module.category,
      tiers: (plans.data ?? [])
        .filter((plan) => plan.module_id === module.id)
        .map(({ id, min_people, max_people, price, note }) => ({ id, min_people, max_people, price: Number(price), note })),
    }))
    .filter((entry) => entry.tiers.length > 0);
}
