// src/lib/types/platform.ts — Axis 2.0 alan modeli: talep hattı, kayıt durumları, etiketler ve yardımcılar
// Satır tipleri veritabanından üretilir (database.types.ts); burada yalnızca alan dili tanımlanır.
import type { Database } from "@/lib/supabase/database.types";

type Tables = Database["public"]["Tables"];
export type Row<T extends keyof Tables> = Tables[T]["Row"];

export type RequestRow = Row<"requests">;
export type RequestMessageRow = Row<"request_messages">;
export type RequestFileRow = Row<"request_files">;
export type SessionRow = Row<"sessions">;
export type NotificationRow = Row<"notifications">;
export type CertificateRow = Row<"certificates">;
export type ReviewRow = Row<"reviews">;
export type DiscountCodeRow = Row<"discount_codes">;
export type PostRow = Row<"posts">;
export type AuditRow = Row<"audit_log">;
export type ProgramRow = Row<"education_modules">;
export type CohortRow = Row<"classes">;
export type EnrollmentRow = Row<"class_enrollments">;
export type ProfileRow = Row<"profiles">;

export type CatalogCohort = Database["public"]["Functions"]["get_catalog_cohorts"]["Returns"][number];
export type PublicReview = Database["public"]["Functions"]["get_public_reviews"]["Returns"][number];

export type UserRole = "user" | "instructor" | "admin";

// ------------------------------------------------------------
// Talepler
// ------------------------------------------------------------
export type RequestKind = "analysis" | "thesis" | "corporate" | "training";
export type TrainingMode = "bundle" | "custom" | "schedule";
export type RequestStatus = "received" | "quoted" | "approved" | "planned" | "in_progress" | "completed" | "cancelled";

export const requestKindLabels: Record<RequestKind, string> = {
  analysis: "Analiz",
  thesis: "Tez düzenleme",
  corporate: "Kurumsal eğitim",
  training: "Birebir eğitim",
};

export const trainingModeLabels: Record<TrainingMode, string> = {
  bundle: "Hazır paket",
  custom: "Kendi programın",
  schedule: "Tarih talebi",
};

export const requestStatusLabels: Record<RequestStatus, string> = {
  received: "Alındı",
  quoted: "Teklif hazır",
  approved: "Onaylandı",
  planned: "Planlandı",
  in_progress: "Devam ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal edildi",
};

/** Admin tarafında kısa durum adları (pano sütunları) */
export const requestStatusAdminLabels: Record<RequestStatus, string> = {
  received: "Yeni",
  quoted: "Teklif verildi",
  approved: "Onaylandı",
  planned: "Planlandı",
  in_progress: "Devam ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export type BadgeTone = "neutral" | "accent" | "amber" | "success" | "danger" | "info";

export const requestStatusTone: Record<RequestStatus, BadgeTone> = {
  received: "info",
  quoted: "amber",
  approved: "accent",
  planned: "accent",
  in_progress: "accent",
  completed: "success",
  cancelled: "danger",
};

/** Fiyatı önceden belli olan talepler (hazır paket) teklif adımına uğramaz */
export function requestSteps(kind: RequestKind, mode?: TrainingMode | null): RequestStatus[] {
  if (kind === "training" && mode === "bundle") {
    return ["received", "approved", "planned", "in_progress", "completed"];
  }
  return ["received", "quoted", "approved", "planned", "in_progress", "completed"];
}

/** Durum hattı için adım etiketleri ve şu anki adımın sırası (-1: iptal) */
export function requestTrack(kind: RequestKind, mode: TrainingMode | null | undefined, status: RequestStatus) {
  const steps = requestSteps(kind, mode);
  const labels = steps.map((step) => (step === "quoted" ? "Teklif" : requestStatusLabels[step]));
  if (status === "cancelled") return { labels, current: -1, finished: false };
  const index = Math.max(0, steps.indexOf(status));
  return { labels, current: index, finished: status === "completed" };
}

/** Kullanıcının yapması gereken bir şey var mı? */
export function requestNeedsMemberAction(request: Pick<RequestRow, "status">): boolean {
  return request.status === "quoted";
}

/** Talep sihirbazı detay alanlarının kullanıcıya görünen adları */
export const requestDetailLabels: Record<string, string> = {
  method: "Analiz türü",
  software: "Yazılım",
  sample: "Örneklem büyüklüğü",
  database: "Veri tabanı",
  topic: "Konu",
  pages: "Sayfa sayısı",
  institute: "Enstitü",
  style: "Kaynakça stili",
  degree: "Derece",
  deadline: "İstenen teslim tarihi",
  company: "Kurum",
  headcount: "Katılımcı sayısı",
  programs: "Programlar",
  format: "Eğitim şekli",
  field: "Çalışma alanı",
  level: "Seviye",
  preferred_days: "Tercih edilen günler",
};

export const analysisMethodLabels: Record<string, string> = {
  bibliometric: "Bibliyometrik analiz",
  statistical: "İstatistiksel analiz",
  both: "İkisi birden",
};

// ------------------------------------------------------------
// Dönem kayıtları
// ------------------------------------------------------------
export type EnrollmentStatus = "pending" | "waitlisted" | "enrolled" | "in_progress" | "completed" | "cancelled";

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  pending: "Onay bekliyor",
  waitlisted: "Bekleme listesinde",
  enrolled: "Kayıtlı",
  in_progress: "Devam ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export const enrollmentStatusTone: Record<EnrollmentStatus, BadgeTone> = {
  pending: "amber",
  waitlisted: "info",
  enrolled: "accent",
  in_progress: "accent",
  completed: "success",
  cancelled: "danger",
};

/** "Kayıtlı" bir öğrenci dönem başladıysa kullanıcıya "Devam ediyor" gösterilir */
export function effectiveEnrollmentStatus(status: EnrollmentStatus, startDate: string, classStatus?: string): EnrollmentStatus {
  if (status === "enrolled" && classStatus !== "completed" && new Date(startDate) <= new Date()) return "in_progress";
  return status;
}

export type CohortStatus = "open" | "full" | "completed" | "cancelled";
export const cohortStatusLabels: Record<CohortStatus, string> = {
  open: "Kayıt açık",
  full: "Dolu",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export type ProgramLevel = "beginner" | "intermediate" | "advanced" | "all";
export const programLevelLabels: Record<ProgramLevel, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
  all: "Her seviye",
};

/** Dönemin kaçıncı haftasında olunduğu (1'den); başlamadıysa 0 */
export function cohortCurrentWeek(startDate: string, totalWeeks: number, override?: number | null): number {
  if (override) return Math.min(override, Math.max(totalWeeks, 1));
  const start = new Date(startDate);
  const diffDays = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  if (diffDays < 0) return 0;
  return Math.min(Math.floor(diffDays / 7) + 1, Math.max(totalWeeks, 1));
}

// ------------------------------------------------------------
// Bildirimler
// ------------------------------------------------------------
export const notificationKindLabels: Record<string, string> = {
  request_new: "Yeni talep",
  request_status: "Talep",
  message: "Mesaj",
  file: "Dosya",
  enrollment_new: "Başvuru",
  enrollment: "Kayıt",
  waitlist: "Bekleme listesi",
  class_announcements: "Duyuru",
  class_materials: "Materyal",
  info: "Bilgi",
};
