// src/lib/queries/admin-people.ts — kişiler: arama, rol filtresi, talep/kayıt sayıları ve kişi detayı
import { createClient } from "@/lib/supabase/server";
import type { CertificateRow, EnrollmentStatus, ProfileRow, RequestKind, RequestStatus } from "@/lib/types/platform";

export interface PersonListItem {
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  requests: number;
  enrollments: number;
}

export async function getPeople(filters: { q?: string; role?: string }): Promise<PersonListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("user_id, full_name, email, phone, role, created_at, requests!requests_user_id_fkey(count), class_enrollments(count)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters.role && ["user", "instructor", "admin"].includes(filters.role)) query = query.eq("role", filters.role);
  const q = (filters.q ?? "").replace(/[%,()*\\"]/g, " ").trim().slice(0, 80);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data } = await query;
  return (data ?? []).map((row) => ({
    user_id: row.user_id,
    name: row.full_name || row.email,
    email: row.email,
    phone: row.phone,
    role: row.role,
    created_at: row.created_at,
    requests: row.requests?.[0]?.count ?? 0,
    enrollments: row.class_enrollments?.[0]?.count ?? 0,
  }));
}

export interface PersonDetail {
  profile: ProfileRow;
  requests: { id: string; title: string; kind: RequestKind; status: RequestStatus; created_at: string; last_activity_at: string }[];
  enrollments: { id: string; class_id: string; status: EnrollmentStatus; created_at: string; title: string; start_date: string }[];
  certificates: CertificateRow[];
  teaching: { id: string; title: string; start_date: string; status: string }[];
  adminCount: number;
}

export async function getPerson(userId: string): Promise<PersonDetail | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (!profile) return null;
  const [requests, enrollments, certificates, teaching, admins] = await Promise.all([
    supabase.from("requests").select("id, title, kind, status, created_at, last_activity_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase
      .from("class_enrollments")
      .select("id, class_id, status, created_at, classes(title, start_date)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("certificates").select("*").eq("user_id", userId).order("issued_at", { ascending: false }),
    supabase.from("classes").select("id, title, start_date, status").eq("instructor_id", userId).order("start_date", { ascending: false }),
    supabase.from("profiles").select("user_id", { count: "exact", head: true }).eq("role", "admin"),
  ]);
  return {
    profile,
    requests: (requests.data ?? []).map((row) => ({ ...row, kind: row.kind as RequestKind, status: row.status as RequestStatus })),
    enrollments: (enrollments.data ?? []).map((row) => ({
      id: row.id,
      class_id: row.class_id,
      status: row.status as EnrollmentStatus,
      created_at: row.created_at,
      title: row.classes?.title ?? "Dönem",
      start_date: row.classes?.start_date ?? "",
    })),
    certificates: certificates.data ?? [],
    teaching: teaching.data ?? [],
    adminCount: admins.count ?? 0,
  };
}

export interface TeamMember {
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export async function getTeam(): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, role, created_at")
    .in("role", ["admin", "instructor"])
    .order("role")
    .order("full_name");
  return (data ?? []).map((row) => ({ user_id: row.user_id, name: row.full_name || row.email, email: row.email, role: row.role, created_at: row.created_at }));
}
