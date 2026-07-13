// src/lib/queries/catalog.ts — eğitim kataloğu okuma sorguları (Server Component'lerden çağrılır)
import { createClient } from "@/lib/supabase/server";
import type { BundlePackage, EducationModule, PricingPlan } from "@/lib/types/catalog";

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
