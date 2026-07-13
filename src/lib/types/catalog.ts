// src/lib/types/catalog.ts — eğitim kataloğu satır tipleri (DB şemasıyla birebir)
export type ModuleCategory = "excel" | "word" | "powerpoint";
export type TrainingType = "individual" | "group";
export type PriceUnit = "per_hour" | "total";
export type ClassStatus = "open" | "full" | "completed" | "cancelled";
export type EnrollmentStatus = "pending" | "enrolled" | "in_progress" | "completed" | "cancelled";

export interface EducationModule {
  id: string;
  title: string;
  category: ModuleCategory;
  description: string;
  long_description: string;
  features: string[];
  badge: string;
  public_price_hint: string;
  is_active: boolean;
  sort_order: number;
}

export interface PricingPlan {
  id: string;
  module_id: string;
  training_type: TrainingType;
  min_people: number;
  max_people: number;
  price: number;
  unit: PriceUnit;
  note: string;
  is_active: boolean;
  sort_order: number;
}

export interface BundlePackage {
  id: string;
  module_id: string;
  title: string;
  description: string;
  fixed_price: number;
  duration_hours: number;
  is_active: boolean;
}

export interface Topic {
  id: string;
  module_id: string;
  title: string;
  description: string;
  estimated_hours: number;
  is_active: boolean;
}

export interface OpenClass {
  id: string;
  title: string;
  description: string;
  start_date: string;
  schedule_note: string;
  duration_hours: number;
  capacity: number;
  approved_count: number;
  my_status: EnrollmentStatus | null;
}

export type RequestStatus = "received" | "planned" | "in_progress" | "completed" | "cancelled";
export type ContactStatus = "new" | "contacted" | "in_progress" | "completed";
export type IndividualRequestType = "bundle" | "custom" | "schedule";
export type InquiryStatus = "new" | "answered" | "closed";
export type MaterialCategory = "general" | "weekly" | "homework" | "note";

export interface ClassMaterial {
  id: string;
  class_id: string;
  category: MaterialCategory;
  week_number: number | null;
  title: string;
  content_md: string;
  file_path: string | null;
  sort_order: number;
  created_at: string;
}

export interface ClassAnnouncement {
  id: string;
  class_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface ClassEnrollmentRow {
  id: string;
  class_id: string;
  user_id: string;
  status: EnrollmentStatus;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
}

export interface AdminClassRow {
  id: string;
  module_id: string;
  title: string;
  start_date: string;
  duration_hours: number;
  capacity: number;
  status: ClassStatus;
  education_modules: { title: string; category: ModuleCategory } | null;
  class_enrollments: { status: string }[];
}

export interface SyllabusWeek {
  id: string;
  module_id: string;
  week_number: number;
  title: string;
  description: string;
  sort_order: number;
}

export type WeekKind = "core" | "specialized";

export interface BundleSyllabusWeek {
  id: string;
  bundle_id: string;
  week_number: number;
  title: string;
  description: string;
  week_kind: WeekKind;
  source_module_week_id: string | null;
  sort_order: number;
}

export interface BundleWithSyllabus extends BundlePackage {
  weeks: BundleSyllabusWeek[];
}

export const weekKindLabels: Record<WeekKind, string> = {
  core: "Ortak temel",
  specialized: "Pakete özel",
};

export type DisplaySyllabusWeek = SyllabusWeek | BundleSyllabusWeek;

export function isBundleSyllabusWeek(week: DisplaySyllabusWeek): week is BundleSyllabusWeek {
  return "week_kind" in week;
}

export interface TrainingClass {
  id: string;
  module_id: string;
  title: string;
  description: string;
  start_date: string;
  schedule_note: string;
  duration_hours: number;
  capacity: number;
  status: ClassStatus;
  created_at: string;
}

// UI etiketleri: kod İngilizce, kullanıcıya görünen metin Türkçe
export const categoryLabels: Record<ModuleCategory, string> = {
  excel: "Excel",
  word: "Word",
  powerpoint: "PowerPoint",
};

export const trainingTypeLabels: Record<TrainingType, string> = {
  individual: "Bireysel",
  group: "Grup",
};

export const priceUnitLabels: Record<PriceUnit, string> = {
  per_hour: "Saatlik",
  total: "Toplam",
};

export const classStatusLabels: Record<ClassStatus, string> = {
  open: "Açık",
  full: "Dolu",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export const requestStatusLabels: Record<RequestStatus, string> = {
  received: "Talep Alındı",
  planned: "Planlandı",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  pending: "Onay Bekliyor",
  enrolled: "Kayıtlı",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export const contactStatusLabels: Record<ContactStatus, string> = {
  new: "Yeni",
  contacted: "Görüşüldü",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
};

export const serviceTypeLabels: Record<"analysis" | "thesis", string> = {
  analysis: "Analiz",
  thesis: "Tez Düzenleme",
};

export const requestTypeLabels: Record<IndividualRequestType, string> = {
  bundle: "Hazır Paket",
  custom: "Özel Modül",
  schedule: "Tarih Talebi",
};

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  new: "Yeni",
  answered: "Yanıtlandı",
  closed: "Kapatıldı",
};

export const materialCategoryLabels: Record<MaterialCategory, string> = {
  general: "Genel İçerik",
  weekly: "Haftalık Ders",
  homework: "Ödevler",
  note: "Notlar",
};
