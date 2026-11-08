// src/lib/queries/member.ts — üye alanı okuma sorguları
// RLS kullanıcının yalnızca kendi verisini görmesini garanti eder; yine de admin/eğitmen hesapları
// panelde başkalarının verisini görmesin diye her sorgu açıkça kullanıcıya göre süzülür.
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/lib/auth";
import type { CatalogCohort, CertificateRow, NotificationRow, RequestFileRow, RequestMessageRow, RequestRow } from "@/lib/types/platform";
import {
  approvedEnrollmentStatuses,
  fileNameFromPath,
  toEnrollmentView,
  type EnrollmentView,
  type MaterialCategory,
  type MemberEnrollment,
  type MemberMaterial,
  type MemberRequestSummary,
  type MemberSession,
} from "@/lib/queries/member-types";

const SIGNED_URL_TTL = 60 * 60; // 1 saat

const cohortColumns =
  "id, title, description, overview, start_date, schedule_note, duration_hours, duration_weeks, current_week_override, location, status, instructor_id, completed_at, module_id, education_modules(id, title, slug, category)";

// ------------------------------------------------------------
// Dönem kayıtları
// ------------------------------------------------------------
export const getMyEnrollments = cache(async (userId: string): Promise<MemberEnrollment[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_enrollments")
    .select(`id, class_id, status, note, created_at, updated_at, classes(${cohortColumns})`)
    .eq("user_id", userId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as MemberEnrollment[];
});

export async function getMyEnrollmentViews(userId: string): Promise<EnrollmentView[]> {
  const enrollments = await getMyEnrollments(userId);
  return enrollments.map(toEnrollmentView).filter((view): view is EnrollmentView => view !== null);
}

// ------------------------------------------------------------
// Talepler
// ------------------------------------------------------------
const requestSummaryColumns =
  "id, kind, training_mode, title, status, quote_amount, quote_valid_until, discount_percent, due_date, progress_note, created_at, last_activity_at";

export const getMyRequests = cache(async (userId: string): Promise<MemberRequestSummary[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("requests")
    .select(requestSummaryColumns)
    .eq("user_id", userId)
    .order("last_activity_at", { ascending: false });
  return (data ?? []) as unknown as MemberRequestSummary[];
});

/** Kenar çubuğundaki amber sayaç: teklif onayı bekleyen talepler */
export async function getMyAwaitingRequestCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "quoted");
  return count ?? 0;
}

export interface RequestFileView extends RequestFileRow {
  signed_url: string | null;
}

export interface RequestDetail {
  request: RequestRow;
  programTitle: string | null;
  programSlug: string | null;
  bundleTitle: string | null;
  topics: string[];
  messages: RequestMessageRow[];
  files: RequestFileView[];
  sessions: MemberSession[];
  review: { rating: number; comment: string; is_published: boolean } | null;
}

export async function getMyRequestDetail(id: string, userId: string): Promise<RequestDetail | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data: request } = await supabase.from("requests").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (!request) return null;

  const [moduleResult, bundleResult, topicsResult, messagesResult, filesResult, sessionsResult, reviewResult] = await Promise.all([
    request.module_id
      ? supabase.from("education_modules").select("title, slug").eq("id", request.module_id).maybeSingle()
      : Promise.resolve({ data: null }),
    request.bundle_id
      ? supabase.from("bundle_packages").select("title").eq("id", request.bundle_id).maybeSingle()
      : Promise.resolve({ data: null }),
    request.topic_ids.length > 0
      ? supabase.from("topics").select("id, title").in("id", request.topic_ids)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    supabase.from("request_messages").select("*").eq("request_id", id).order("created_at"),
    supabase.from("request_files").select("*").eq("request_id", id).order("created_at"),
    supabase.from("sessions").select("*").eq("request_id", id).order("starts_at"),
    supabase.from("reviews").select("rating, comment, is_published").eq("request_id", id).eq("user_id", userId).maybeSingle(),
  ]);

  const files = (filesResult.data ?? []) as RequestFileRow[];
  const signed = await signPaths("request-files", files.map((file) => file.file_path));

  const title = request.title || "Talep";
  return {
    request,
    programTitle: (moduleResult.data as { title: string } | null)?.title ?? null,
    programSlug: (moduleResult.data as { slug: string } | null)?.slug ?? null,
    bundleTitle: (bundleResult.data as { title: string } | null)?.title ?? null,
    topics: ((topicsResult.data ?? []) as { title: string }[]).map((topic) => topic.title),
    messages: messagesResult.data ?? [],
    files: files.map((file) => ({ ...file, signed_url: signed.get(file.file_path) ?? null })),
    sessions: (sessionsResult.data ?? []).map((session) => ({
      id: session.id,
      title: session.title,
      week_number: session.week_number,
      starts_at: session.starts_at,
      ends_at: session.ends_at,
      location: session.location,
      meeting_url: session.meeting_url,
      notes: session.notes,
      source: { kind: "request" as const, id, title, href: `/panel/talepler/${id}` },
    })),
    review: reviewResult.data ?? null,
  };
}

// ------------------------------------------------------------
// Oturumlar
// ------------------------------------------------------------
interface SessionScope {
  cohortIds: string[];
  teachingIds: string[];
  requestIds: string[];
  titles: Map<string, string>;
}

const getSessionScope = cache(async (userId: string, role: string): Promise<SessionScope> => {
  const supabase = await createClient();
  const [enrollments, requests, teaching] = await Promise.all([
    getMyEnrollments(userId),
    getMyRequests(userId),
    role === "instructor"
      ? supabase.from("classes").select("id, title").eq("instructor_id", userId)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);
  const titles = new Map<string, string>();
  const cohortIds: string[] = [];
  for (const enrollment of enrollments) {
    if (!enrollment.classes || !(approvedEnrollmentStatuses as string[]).includes(enrollment.status)) continue;
    cohortIds.push(enrollment.class_id);
    titles.set(enrollment.class_id, enrollment.classes.education_modules?.title ?? enrollment.classes.title);
  }
  const teachingIds = ((teaching.data ?? []) as { id: string; title: string }[]).map((row) => {
    if (!titles.has(row.id)) titles.set(row.id, row.title);
    return row.id;
  });
  for (const request of requests) titles.set(request.id, request.title || "Talep");
  return { cohortIds, teachingIds, requestIds: requests.map((request) => request.id), titles };
});

interface SessionQueryOptions {
  from?: string;
  to?: string;
  limit?: number;
  ascending?: boolean;
}

export async function getMySessions(user: Pick<SessionUser, "id" | "role">, options: SessionQueryOptions = {}): Promise<MemberSession[]> {
  const scope = await getSessionScope(user.id, user.role);
  const classIds = [...new Set([...scope.cohortIds, ...scope.teachingIds])];
  const filters: string[] = [];
  if (classIds.length) filters.push(`class_id.in.(${classIds.join(",")})`);
  if (scope.requestIds.length) filters.push(`request_id.in.(${scope.requestIds.join(",")})`);
  if (!filters.length) return [];

  const supabase = await createClient();
  let query = supabase.from("sessions").select("*").or(filters.join(","));
  if (options.from) query = query.gte("ends_at", options.from);
  if (options.to) query = query.lt("starts_at", options.to);
  query = query.order("starts_at", { ascending: options.ascending ?? true });
  if (options.limit) query = query.limit(options.limit);
  const { data } = await query;

  const cohortSet = new Set(scope.cohortIds);
  return (data ?? []).map((session) => {
    const sourceId = (session.class_id ?? session.request_id)!;
    const kind = session.request_id ? "request" : cohortSet.has(sourceId) ? "cohort" : "teaching";
    const href =
      kind === "request" ? `/panel/talepler/${sourceId}` : kind === "cohort" ? `/panel/egitimler/${sourceId}` : `/panel/derslerim/${sourceId}`;
    return {
      id: session.id,
      title: session.title,
      week_number: session.week_number,
      starts_at: session.starts_at,
      ends_at: session.ends_at,
      location: session.location,
      meeting_url: session.meeting_url,
      notes: session.notes,
      source: { kind, id: sourceId, title: scope.titles.get(sourceId) ?? "Ders", href },
    } satisfies MemberSession;
  });
}

export async function getMySession(user: Pick<SessionUser, "id" | "role">, sessionId: string): Promise<MemberSession | null> {
  if (!isUuid(sessionId)) return null;
  const sessions = await getMySessions(user);
  return sessions.find((session) => session.id === sessionId) ?? null;
}

export async function getNextSession(user: Pick<SessionUser, "id" | "role">): Promise<MemberSession | null> {
  const [next] = await getMySessions(user, { from: new Date().toISOString(), limit: 1 });
  return next ?? null;
}

// ------------------------------------------------------------
// Dönem detayı (yalnızca kendi kaydı üzerinden)
// ------------------------------------------------------------
export interface CohortDetail {
  view: EnrollmentView;
  meetingUrl: string;
  instructorName: string | null;
  syllabus: { week_number: number; title: string; description: string }[];
  sessions: MemberSession[];
  materials: MemberMaterial[];
  announcements: { id: string; title: string; body: string; created_at: string }[];
  review: { rating: number; comment: string; is_published: boolean } | null;
}

export async function getMyEnrollmentForClass(userId: string, classId: string): Promise<EnrollmentView | null> {
  if (!isUuid(classId)) return null;
  const enrollments = await getMyEnrollments(userId);
  const match = enrollments.find((enrollment) => enrollment.class_id === classId);
  return match ? toEnrollmentView(match) : null;
}

/** Geri çekilmiş başvuru (detay sayfası 404 yerine açıklama göstersin diye) */
export async function getMyCancelledEnrollment(userId: string, classId: string): Promise<MemberEnrollment | null> {
  if (!isUuid(classId)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_enrollments")
    .select(`id, class_id, status, note, created_at, updated_at, classes(${cohortColumns})`)
    .eq("user_id", userId)
    .eq("class_id", classId)
    .eq("status", "cancelled")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as unknown as MemberEnrollment | null) ?? null;
}

export async function getMyCohortDetail(user: Pick<SessionUser, "id" | "role">, view: EnrollmentView): Promise<CohortDetail> {
  const supabase = await createClient();
  const classId = view.cohort.id;

  const [meetingResult, syllabusResult, materialsResult, announcementsResult, reviewResult, sessions] = await Promise.all([
    // Toplantı linki yalnızca onaylı kayıt için okunur
    supabase.from("classes").select("meeting_url").eq("id", classId).maybeSingle(),
    supabase
      .from("module_syllabus_weeks")
      .select("week_number, title, description")
      .eq("module_id", view.cohort.module_id)
      .order("week_number")
      .order("sort_order"),
    supabase.from("class_materials").select("*").eq("class_id", classId).order("week_number", { nullsFirst: true }).order("sort_order"),
    supabase.from("class_announcements").select("id, title, body, created_at").eq("class_id", classId).order("created_at", { ascending: false }),
    supabase.from("reviews").select("rating, comment, is_published").eq("class_id", classId).eq("user_id", user.id).maybeSingle(),
    getMySessions(user),
  ]);

  const materials = materialsResult.data ?? [];
  const signed = await signPaths("class-materials", materials.map((material) => material.file_path).filter((path): path is string => !!path));
  const instructorNames = view.cohort.instructor_id ? await readProfileNames([view.cohort.instructor_id]) : new Map<string, string>();

  return {
    view,
    meetingUrl: meetingResult.data?.meeting_url ?? "",
    instructorName: view.cohort.instructor_id ? (instructorNames.get(view.cohort.instructor_id) ?? null) : null,
    syllabus: syllabusResult.data ?? [],
    sessions: sessions.filter((session) => session.source.id === classId),
    materials: materials.map((material) => ({
      id: material.id,
      category: material.category as MaterialCategory,
      week_number: material.week_number,
      title: material.title,
      content_md: material.content_md,
      file_path: material.file_path,
      file_name: material.file_path ? fileNameFromPath(material.file_path) : null,
      signed_url: material.file_path ? (signed.get(material.file_path) ?? null) : null,
      created_at: material.created_at,
    })),
    announcements: announcementsResult.data ?? [],
    review: reviewResult.data ?? null,
  };
}

// ------------------------------------------------------------
// Belgeler
// ------------------------------------------------------------
export async function getMyCertificates(userId: string): Promise<CertificateRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("certificates").select("*").eq("user_id", userId).order("issued_at", { ascending: false });
  return data ?? [];
}

export async function getMyCertificate(userId: string, code: string): Promise<CertificateRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  return data ?? null;
}

export interface DeliverableView extends RequestFileView {
  request_title: string;
}

export async function getMyDeliverables(userId: string): Promise<DeliverableView[]> {
  const requests = await getMyRequests(userId);
  if (!requests.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("request_files")
    .select("*")
    .in("request_id", requests.map((request) => request.id))
    .eq("is_deliverable", true)
    .order("created_at", { ascending: false });
  const files = data ?? [];
  const signed = await signPaths("request-files", files.map((file) => file.file_path));
  const titles = new Map(requests.map((request) => [request.id, request.title || "Talep"]));
  return files.map((file) => ({
    ...file,
    signed_url: signed.get(file.file_path) ?? null,
    request_title: titles.get(file.request_id) ?? "Talep",
  }));
}

// ------------------------------------------------------------
// Bugün ekranı yardımcıları
// ------------------------------------------------------------
/** Okunmamış "Axis ekibinden yeni mesaj" bildirimleri */
export async function getUnreadStaffMessages(userId: string): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("kind", "message")
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

/** Boş durumda önerilecek, henüz başvurulmamış yaklaşan dönemler */
export async function getSuggestedCohorts(limit = 2): Promise<CatalogCohort[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_catalog_cohorts", { p_limit: 12 });
  return (data ?? []).filter((cohort) => !cohort.my_status).slice(0, limit);
}

// ------------------------------------------------------------
// Hesap
// ------------------------------------------------------------
export async function getMyProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  return data;
}

// ------------------------------------------------------------
// Ortak yardımcılar
// ------------------------------------------------------------
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** Özel bucket dosyaları için toplu imzalı URL; RLS storage politikası erişimi doğrular */
export async function signPaths(bucket: "request-files" | "class-materials", paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return map;
  const supabase = await createClient();
  const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, SIGNED_URL_TTL, { download: false });
  for (const entry of data ?? []) {
    if (entry.signedUrl && entry.path) map.set(entry.path, entry.signedUrl);
  }
  return map;
}

/**
 * Profil adları: üye kendi dönemindeki eğitmenin, eğitmen de öğrencilerinin yalnızca adını görür.
 * Yetki kontrolü veritabanındaki get_visible_profile_names fonksiyonunda yapılır.
 */
export async function readProfileNames(userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return map;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_visible_profile_names", { p_ids: ids });
  if (error) console.error("Profil adları okunamadı:", error.message);
  for (const row of data ?? []) {
    if (row.full_name) map.set(row.user_id, row.full_name);
  }
  return map;
}
