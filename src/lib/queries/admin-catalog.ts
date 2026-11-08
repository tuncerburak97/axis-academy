// src/lib/queries/admin-catalog.ts — program (education_modules) yönetimi okuma sorguları
import { createClient } from "@/lib/supabase/server";
import type { ProgramRow } from "@/lib/types/platform";
import type { BundleRow, BundleWeekRow, PlanRow, SyllabusWeekRow, TopicRow } from "@/components/admin/lib/labels";

export interface AdminProgramListItem extends ProgramRow {
  weeks: number;
  bundles: number;
  topics: number;
  cohorts: number;
}

export async function getAdminPrograms(): Promise<AdminProgramListItem[]> {
  const supabase = await createClient();
  const [programs, weeks, bundles, topics, cohorts] = await Promise.all([
    supabase.from("education_modules").select("*").order("sort_order").order("title"),
    supabase.from("module_syllabus_weeks").select("module_id"),
    supabase.from("bundle_packages").select("module_id"),
    supabase.from("topics").select("module_id"),
    supabase.from("classes").select("module_id").in("status", ["open", "full"]),
  ]);
  const count = (rows: { module_id: string }[] | null, id: string) => (rows ?? []).filter((row) => row.module_id === id).length;
  return (programs.data ?? []).map((program) => ({
    ...program,
    weeks: count(weeks.data, program.id),
    bundles: count(bundles.data, program.id),
    topics: count(topics.data, program.id),
    cohorts: count(cohorts.data, program.id),
  }));
}

export interface AdminProgramDetail {
  program: ProgramRow;
  weeks: SyllabusWeekRow[];
  bundles: (BundleRow & { weeks: BundleWeekRow[] })[];
  plans: PlanRow[];
  topics: TopicRow[];
}

export async function getAdminProgram(id: string): Promise<AdminProgramDetail | null> {
  const supabase = await createClient();
  const { data: program } = await supabase.from("education_modules").select("*").eq("id", id).maybeSingle();
  if (!program) return null;
  const [weeks, bundles, plans, topics] = await Promise.all([
    supabase.from("module_syllabus_weeks").select("*").eq("module_id", id).order("week_number").order("sort_order"),
    supabase.from("bundle_packages").select("*").eq("module_id", id).order("fixed_price"),
    supabase.from("pricing_plans").select("*").eq("module_id", id).order("sort_order"),
    supabase.from("topics").select("*").eq("module_id", id).order("title"),
  ]);
  const bundleRows = bundles.data ?? [];
  let bundleWeeks: BundleWeekRow[] = [];
  if (bundleRows.length) {
    const { data } = await supabase
      .from("bundle_syllabus_weeks")
      .select("*")
      .in("bundle_id", bundleRows.map((bundle) => bundle.id))
      .order("week_number")
      .order("sort_order");
    bundleWeeks = data ?? [];
  }
  return {
    program,
    weeks: weeks.data ?? [],
    bundles: bundleRows.map((bundle) => ({ ...bundle, weeks: bundleWeeks.filter((week) => week.bundle_id === bundle.id) })),
    plans: plans.data ?? [],
    topics: topics.data ?? [],
  };
}
