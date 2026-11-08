// src/lib/queries/member-instructor.ts — eğitmen rolü: kendi dönemleri, öğrencileri, oturumları, içerikleri
// Yalnızca classes.instructor_id = oturumdaki kullanıcı olan dönemler döner (RLS de aynı kuralı uygular).
import { createClient } from "@/lib/supabase/server";
import { fileNameFromPath, type MaterialCategory } from "@/lib/queries/member-types";
import { isUuid, readProfileNames, signPaths } from "@/lib/queries/member";
import type { SessionRow } from "@/lib/types/platform";

export interface TeachingCohort {
  id: string;
  title: string;
  start_date: string;
  schedule_note: string;
  duration_weeks: number;
  duration_hours: number;
  current_week_override: number | null;
  location: string;
  meeting_url: string;
  status: string;
  capacity: number;
  module_id: string;
  education_modules: { title: string } | null;
}

const teachingColumns =
  "id, title, start_date, schedule_note, duration_weeks, duration_hours, current_week_override, location, meeting_url, status, capacity, module_id, education_modules(title)";

export async function getTeachingCohorts(userId: string): Promise<(TeachingCohort & { studentCount: number; nextSession: string | null })[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("classes").select(teachingColumns).eq("instructor_id", userId).order("start_date", { ascending: false });
  const cohorts = (data ?? []) as unknown as TeachingCohort[];
  if (!cohorts.length) return [];
  const ids = cohorts.map((cohort) => cohort.id);
  const [enrollmentsResult, sessionsResult] = await Promise.all([
    supabase.from("class_enrollments").select("class_id, status").in("class_id", ids).in("status", ["enrolled", "in_progress", "completed"]),
    supabase.from("sessions").select("class_id, starts_at").in("class_id", ids).gte("starts_at", new Date().toISOString()).order("starts_at"),
  ]);
  const counts = new Map<string, number>();
  for (const row of enrollmentsResult.data ?? []) counts.set(row.class_id, (counts.get(row.class_id) ?? 0) + 1);
  const next = new Map<string, string>();
  for (const row of sessionsResult.data ?? []) if (row.class_id && !next.has(row.class_id)) next.set(row.class_id, row.starts_at);
  return cohorts.map((cohort) => ({ ...cohort, studentCount: counts.get(cohort.id) ?? 0, nextSession: next.get(cohort.id) ?? null }));
}

export interface TeachingDetail {
  cohort: TeachingCohort;
  students: { id: string; name: string; status: string; since: string }[];
  sessions: SessionRow[];
  announcements: { id: string; title: string; body: string; created_at: string }[];
  materials: {
    id: string;
    category: MaterialCategory;
    week_number: number | null;
    title: string;
    content_md: string;
    file_path: string | null;
    file_name: string | null;
    signed_url: string | null;
  }[];
}

export async function getTeachingDetail(userId: string, classId: string): Promise<TeachingDetail | null> {
  if (!isUuid(classId)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("classes").select(teachingColumns).eq("id", classId).eq("instructor_id", userId).maybeSingle();
  const cohort = data as unknown as TeachingCohort | null;
  if (!cohort) return null;

  const [enrollmentsResult, sessionsResult, announcementsResult, materialsResult] = await Promise.all([
    supabase
      .from("class_enrollments")
      .select("user_id, status, created_at")
      .eq("class_id", classId)
      .in("status", ["enrolled", "in_progress", "completed"])
      .order("created_at"),
    supabase.from("sessions").select("*").eq("class_id", classId).order("starts_at"),
    supabase.from("class_announcements").select("id, title, body, created_at").eq("class_id", classId).order("created_at", { ascending: false }),
    supabase.from("class_materials").select("*").eq("class_id", classId).order("week_number", { nullsFirst: true }).order("sort_order"),
  ]);

  const enrollments = enrollmentsResult.data ?? [];
  // Yetki yukarıda doğrulandı (instructor_id = ben); adlar servis anahtarıyla okunur
  const names = await readProfileNames(enrollments.map((row) => row.user_id));
  const materials = materialsResult.data ?? [];
  const signed = await signPaths("class-materials", materials.map((row) => row.file_path).filter((path): path is string => !!path));

  return {
    cohort,
    students: enrollments.map((row, index) => ({
      id: row.user_id,
      name: names.get(row.user_id) ?? `Katılımcı ${index + 1}`,
      status: row.status,
      since: row.created_at,
    })),
    sessions: sessionsResult.data ?? [],
    announcements: announcementsResult.data ?? [],
    materials: materials.map((row) => ({
      id: row.id,
      category: row.category as MaterialCategory,
      week_number: row.week_number,
      title: row.title,
      content_md: row.content_md,
      file_path: row.file_path,
      file_name: row.file_path ? fileNameFromPath(row.file_path) : null,
      signed_url: row.file_path ? (signed.get(row.file_path) ?? null) : null,
    })),
  };
}
