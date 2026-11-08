// src/lib/queries/member-types.ts — üye alanının görünüm tipleri ve saf yardımcıları
// Sunucuya bağımlılığı yoktur; istemci bileşenleri de içe aktarabilir.
import {
  cohortCurrentWeek,
  effectiveEnrollmentStatus,
  type EnrollmentStatus,
  type RequestKind,
  type RequestStatus,
  type TrainingMode,
} from "@/lib/types/platform";

// ------------------------------------------------------------
// Sunucu aksiyonu sonucu (useActionState + toast)
// ------------------------------------------------------------
export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Aynı mesaj tekrar geldiğinde de toast gösterilsin diye zaman damgası */
  at?: number;
}

export const idleState: ActionState = { status: "idle" };

export function ok(message: string): ActionState {
  return { status: "success", message, at: Date.now() };
}

export function fail(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { status: "error", message, fieldErrors, at: Date.now() };
}

// ------------------------------------------------------------
// Dönem kayıtları
// ------------------------------------------------------------
export interface MemberCohort {
  id: string;
  title: string;
  description: string;
  overview: string;
  start_date: string;
  schedule_note: string;
  duration_hours: number;
  duration_weeks: number;
  current_week_override: number | null;
  location: string;
  status: string;
  instructor_id: string | null;
  completed_at: string | null;
  module_id: string;
  education_modules: { id: string; title: string; slug: string; category: string } | null;
}

export interface MemberEnrollment {
  id: string;
  class_id: string;
  status: EnrollmentStatus;
  note: string;
  created_at: string;
  updated_at: string;
  classes: MemberCohort | null;
}

export type EnrollmentGroup = "application" | "active" | "completed";

export interface EnrollmentView {
  enrollment: MemberEnrollment;
  cohort: MemberCohort;
  programTitle: string;
  effective: EnrollmentStatus;
  group: EnrollmentGroup;
  totalWeeks: number;
  /** WeekStrip için: tamamlanan dönemde total + 1 */
  currentWeek: number;
}

export const approvedEnrollmentStatuses: EnrollmentStatus[] = ["enrolled", "in_progress", "completed"];

export function isApproved(status: string): boolean {
  return (approvedEnrollmentStatuses as string[]).includes(status);
}

export function toEnrollmentView(enrollment: MemberEnrollment): EnrollmentView | null {
  const cohort = enrollment.classes;
  if (!cohort) return null;
  const effective = effectiveEnrollmentStatus(enrollment.status, cohort.start_date, cohort.status);
  const totalWeeks = Math.max(cohort.duration_weeks, 1);
  const cohortDone = cohort.status === "completed" || cohort.status === "cancelled";
  let group: EnrollmentGroup;
  if (enrollment.status === "pending" || enrollment.status === "waitlisted") group = "application";
  else if (enrollment.status === "completed" || cohortDone) group = "completed";
  else group = "active";
  const currentWeek =
    group === "completed" ? totalWeeks + 1 : cohortCurrentWeek(cohort.start_date, totalWeeks, cohort.current_week_override);
  return {
    enrollment,
    cohort,
    programTitle: cohort.education_modules?.title ?? cohort.title,
    effective: group === "completed" && cohort.status === "completed" ? "completed" : effective,
    group,
    totalWeeks,
    currentWeek,
  };
}

// ------------------------------------------------------------
// Talepler
// ------------------------------------------------------------
export interface MemberRequestSummary {
  id: string;
  kind: RequestKind;
  training_mode: TrainingMode | null;
  title: string;
  status: RequestStatus;
  quote_amount: number | null;
  quote_valid_until: string | null;
  discount_percent: number | null;
  due_date: string | null;
  progress_note: string;
  created_at: string;
  last_activity_at: string;
}

export type RequestFilter = "tumu" | "bekleyen" | "devam" | "tamamlanan";

export const requestFilterLabels: Record<RequestFilter, string> = {
  tumu: "Tümü",
  bekleyen: "İşlem bekleyen",
  devam: "Devam eden",
  tamamlanan: "Tamamlanan",
};

export function requestMatchesFilter(request: Pick<MemberRequestSummary, "status">, filter: RequestFilter): boolean {
  switch (filter) {
    case "bekleyen":
      return request.status === "quoted";
    case "devam":
      return ["received", "approved", "planned", "in_progress"].includes(request.status);
    case "tamamlanan":
      return request.status === "completed" || request.status === "cancelled";
    default:
      return true;
  }
}

export const newRequestLinks = [
  { href: "/teklif/analiz", label: "Analiz talebi", description: "Bibliyometrik ya da istatistiksel analiz" },
  { href: "/teklif/tez", label: "Tez düzenleme", description: "Biçim, kaynakça ve enstitü şablonu" },
  { href: "/teklif/birebir", label: "Birebir eğitim", description: "Konuları ve saati sen seç" },
  { href: "/teklif/kurumsal", label: "Kurumsal eğitim", description: "Ekibine özel program" },
] as const;

// ------------------------------------------------------------
// Oturumlar (takvim)
// ------------------------------------------------------------
export type SessionSourceKind = "cohort" | "request" | "teaching";

export interface MemberSession {
  id: string;
  title: string;
  week_number: number | null;
  starts_at: string;
  ends_at: string;
  location: string;
  meeting_url: string;
  notes: string;
  source: { kind: SessionSourceKind; id: string; title: string; href: string };
}

/** Katıl butonu: dersten 15 dk önce açılır, ders bitene kadar açık kalır */
export function sessionIsLive(session: Pick<MemberSession, "starts_at" | "ends_at">, now = Date.now()): boolean {
  const start = new Date(session.starts_at).getTime();
  const end = new Date(session.ends_at).getTime();
  return now >= start - 15 * 60_000 && now <= end;
}

// ------------------------------------------------------------
// Materyaller
// ------------------------------------------------------------
export type MaterialCategory = "general" | "weekly" | "homework" | "note";

export const materialCategoryLabels: Record<MaterialCategory, string> = {
  general: "Genel",
  weekly: "Ders içeriği",
  homework: "Ödev",
  note: "Not",
};

export interface MemberMaterial {
  id: string;
  category: MaterialCategory;
  week_number: number | null;
  title: string;
  content_md: string;
  file_path: string | null;
  file_name: string | null;
  signed_url: string | null;
  created_at: string;
}

export function fileNameFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  // {uuid}-{dosya} önekini at
  return base.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "");
}

/** Saat dilimi: Türkiye 2016'dan beri kalıcı UTC+3 (yaz saati yok) */
export const ISTANBUL_OFFSET = "+03:00";

/** <input type="datetime-local"> değerini (İstanbul saati) ISO UTC'ye çevirir */
export function istanbulLocalToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${ISTANBUL_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** ISO zamanı datetime-local alanı için İstanbul saatine çevirir */
export function isoToIstanbulLocal(iso: string): string {
  const date = new Date(new Date(iso).getTime() + 3 * 3_600_000);
  return date.toISOString().slice(0, 16);
}

/** İstanbul takvim günü anahtarı: 2026-11-18 */
export function istanbulDayKey(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Date(date.getTime() + 3 * 3_600_000).toISOString().slice(0, 10);
}

/** İstanbul saatine göre saat (0-23) */
export function istanbulHour(date = new Date()): number {
  return new Date(date.getTime() + 3 * 3_600_000).getUTCHours();
}
