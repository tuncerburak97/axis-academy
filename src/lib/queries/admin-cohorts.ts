// src/lib/queries/admin-cohorts.ts — dönem (classes) yönetimi okuma sorguları
import { createClient } from "@/lib/supabase/server";
import type { CohortRow, EnrollmentStatus, SessionRow } from "@/lib/types/platform";
import type { AnnouncementRow, MaterialRow } from "@/components/admin/lib/labels";
import { todayIstanbul } from "@/components/admin/lib/time";

export type CohortBucket = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface AdminCohortListItem {
  id: string;
  title: string;
  start_date: string;
  duration_weeks: number;
  duration_hours: number;
  capacity: number;
  status: string;
  price: number | null;
  location: string;
  program: { id: string; title: string; category: string } | null;
  instructor: string | null;
  taken: number;
  pending: number;
  waitlisted: number;
  bucket: CohortBucket;
}

const TAKEN: EnrollmentStatus[] = ["enrolled", "in_progress", "completed"];

/** Dönemin bitiş tarihi (başlangıç + hafta sayısı) */
export function cohortEndDate(startDate: string, weeks: number): string {
  const end = new Date(`${startDate}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() + Math.max(weeks, 1) * 7 - 1);
  return end.toISOString().slice(0, 10);
}

function bucketOf(row: { status: string; start_date: string; duration_weeks: number }, today: string): CohortBucket {
  if (row.status === "cancelled") return "cancelled";
  if (row.status === "completed") return "completed";
  return row.start_date > today ? "upcoming" : "ongoing";
}

export async function getAdminCohorts(): Promise<AdminCohortListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("classes")
    .select(
      "id, title, start_date, duration_weeks, duration_hours, capacity, status, price, location, program:education_modules(id, title, category), instructor:profiles(full_name, email), class_enrollments(status)",
    )
    .order("start_date", { ascending: true });
  const today = todayIstanbul();
  return (data ?? []).map((row) => {
    const statuses = (row.class_enrollments ?? []).map((enrollment) => enrollment.status as EnrollmentStatus);
    return {
      id: row.id,
      title: row.title,
      start_date: row.start_date,
      duration_weeks: row.duration_weeks,
      duration_hours: row.duration_hours,
      capacity: row.capacity,
      status: row.status,
      price: row.price,
      location: row.location,
      program: row.program,
      instructor: row.instructor ? row.instructor.full_name || row.instructor.email : null,
      taken: statuses.filter((status) => TAKEN.includes(status)).length,
      pending: statuses.filter((status) => status === "pending").length,
      waitlisted: statuses.filter((status) => status === "waitlisted").length,
      bucket: bucketOf(row, today),
    };
  });
}

export interface ProgramOption {
  id: string;
  title: string;
  category: string;
  is_active: boolean;
}

export async function getProgramOptions(): Promise<ProgramOption[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("education_modules").select("id, title, category, is_active").order("sort_order");
  return data ?? [];
}

export interface InstructorOption {
  user_id: string;
  name: string;
  role: string;
}

/** Eğitmen seçilebilecek kişiler: eğitmen rolü (ve adminler) */
export async function getInstructorOptions(): Promise<InstructorOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, role")
    .in("role", ["instructor", "admin"])
    .order("role", { ascending: false })
    .order("full_name");
  return (data ?? []).map((row) => ({ user_id: row.user_id, name: row.full_name || row.email, role: row.role }));
}

export interface AdminEnrollment {
  id: string;
  user_id: string;
  status: EnrollmentStatus;
  note: string;
  discount_code: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface AdminCohortDetail {
  cohort: CohortRow;
  program: { id: string; title: string; slug: string; category: string } | null;
  instructor: { user_id: string; name: string } | null;
  enrollments: AdminEnrollment[];
  sessions: SessionRow[];
  materials: MaterialRow[];
  materialUrls: Record<string, string>;
  announcements: AnnouncementRow[];
  syllabus: { week_number: number; title: string }[];
  taken: number;
  certificates: number;
}

export async function getAdminCohort(id: string): Promise<AdminCohortDetail | null> {
  const supabase = await createClient();
  const { data: cohort } = await supabase.from("classes").select("*").eq("id", id).maybeSingle();
  if (!cohort) return null;

  const [program, instructor, enrollments, sessions, materials, announcements, syllabus, certificates] = await Promise.all([
    supabase.from("education_modules").select("id, title, slug, category").eq("id", cohort.module_id).maybeSingle(),
    cohort.instructor_id
      ? supabase.from("profiles").select("user_id, full_name, email").eq("user_id", cohort.instructor_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("class_enrollments")
      .select("id, user_id, status, note, discount_code, created_at, updated_at, profiles(full_name, email, phone)")
      .eq("class_id", id)
      .order("created_at"),
    supabase.from("sessions").select("*").eq("class_id", id).order("starts_at"),
    supabase.from("class_materials").select("*").eq("class_id", id).order("week_number", { nullsFirst: true }).order("sort_order"),
    supabase.from("class_announcements").select("*").eq("class_id", id).order("created_at", { ascending: false }),
    supabase.from("module_syllabus_weeks").select("week_number, title").eq("module_id", cohort.module_id).order("week_number"),
    supabase.from("certificates").select("id", { count: "exact", head: true }).eq("class_id", id),
  ]);

  const materialRows = materials.data ?? [];
  const paths = materialRows.map((material) => material.file_path).filter((path): path is string => Boolean(path));
  const materialUrls: Record<string, string> = {};
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("class-materials").createSignedUrls(paths, 60 * 60);
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) materialUrls[item.path] = item.signedUrl;
    }
  }

  const enrollmentRows: AdminEnrollment[] = (enrollments.data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    status: row.status as EnrollmentStatus,
    note: row.note,
    discount_code: row.discount_code,
    created_at: row.created_at,
    updated_at: row.updated_at,
    name: row.profiles?.full_name || row.profiles?.email || "Üye",
    email: row.profiles?.email ?? "",
    phone: row.profiles?.phone ?? null,
  }));

  return {
    cohort,
    program: program.data,
    instructor: instructor.data ? { user_id: instructor.data.user_id, name: instructor.data.full_name || instructor.data.email } : null,
    enrollments: enrollmentRows,
    sessions: sessions.data ?? [],
    materials: materialRows,
    materialUrls,
    announcements: announcements.data ?? [],
    syllabus: syllabus.data ?? [],
    taken: enrollmentRows.filter((row) => TAKEN.includes(row.status)).length,
    certificates: certificates.count ?? 0,
  };
}
