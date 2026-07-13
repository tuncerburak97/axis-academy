// src/lib/queries/catalog.ts — eğitim kataloğu okuma sorguları (Server Component'lerden çağrılır)
import { createClient } from "@/lib/supabase/server";
import type { BundlePackage, BundleSyllabusWeek, BundleWithSyllabus, EducationModule, PricingPlan, SyllabusWeek } from "@/lib/types/catalog";

export async function getActiveModules(): Promise<EducationModule[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("education_modules")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getModuleById(id: string): Promise<EducationModule | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("education_modules")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getActiveBundles(moduleId: string): Promise<BundlePackage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bundle_packages")
    .select("*")
    .eq("module_id", moduleId)
    .eq("is_active", true)
    .order("fixed_price");
  return data ?? [];
}

export interface PublicUpcomingClass {
  id: string;
  title: string;
  start_date: string;
  duration_hours: number;
  duration_weeks: number;
}

// Public "yaklaşan eğitimler": kişisel veri içermeyen SECURITY DEFINER fonksiyonundan
export async function getPublicUpcomingClasses(moduleId: string): Promise<PublicUpcomingClass[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_upcoming_classes", { p_module_id: moduleId });
  return (data ?? []) as PublicUpcomingClass[];
}

// Admin görünümleri: pasif kayıtlar dahil tüm satırlar
export async function getAllModules(): Promise<EducationModule[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("education_modules").select("*").order("sort_order");
  return data ?? [];
}

export async function getModulePlans(moduleId: string): Promise<PricingPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order");
  return data ?? [];
}

export async function getModuleBundles(moduleId: string): Promise<BundlePackage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bundle_packages")
    .select("*")
    .eq("module_id", moduleId)
    .order("fixed_price");
  return data ?? [];
}

export async function getModuleSyllabus(moduleId: string): Promise<SyllabusWeek[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("module_syllabus_weeks")
    .select("*")
    .eq("module_id", moduleId)
    .order("week_number");
  return data ?? [];
}

export async function getBundleSyllabus(bundleId: string): Promise<BundleSyllabusWeek[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bundle_syllabus_weeks")
    .select("*")
    .eq("bundle_id", bundleId)
    .order("week_number");
  return data ?? [];
}

export async function getModuleBundleSyllabi(moduleId: string): Promise<Record<string, BundleSyllabusWeek[]>> {
  const bundles = await getModuleBundles(moduleId);
  if (bundles.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("bundle_syllabus_weeks")
    .select("*")
    .in("bundle_id", bundles.map((b) => b.id))
    .order("week_number");

  const map: Record<string, BundleSyllabusWeek[]> = {};
  for (const bundle of bundles) map[bundle.id] = [];
  for (const week of data ?? []) {
    if (!map[week.bundle_id]) map[week.bundle_id] = [];
    map[week.bundle_id].push(week);
  }
  return map;
}

export async function getActiveBundlesWithSyllabus(moduleId: string): Promise<BundleWithSyllabus[]> {
  const bundles = await getActiveBundles(moduleId);
  if (bundles.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("bundle_syllabus_weeks")
    .select("*")
    .in("bundle_id", bundles.map((b) => b.id))
    .order("week_number");

  const weeksByBundle = new Map<string, BundleSyllabusWeek[]>();
  for (const week of data ?? []) {
    const list = weeksByBundle.get(week.bundle_id) ?? [];
    list.push(week);
    weeksByBundle.set(week.bundle_id, list);
  }

  return bundles.map((bundle) => ({
    ...bundle,
    weeks: weeksByBundle.get(bundle.id) ?? [],
  }));
}
