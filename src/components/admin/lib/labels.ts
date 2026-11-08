// src/components/admin/lib/labels.ts — admin konsoluna özel etiketler ve satır tipleri (ortak dosyalara bağımlılığı azaltır)
import type { Row } from "@/lib/types/platform";

export type MaterialRow = Row<"class_materials">;
export type AnnouncementRow = Row<"class_announcements">;
export type SyllabusWeekRow = Row<"module_syllabus_weeks">;
export type BundleRow = Row<"bundle_packages">;
export type BundleWeekRow = Row<"bundle_syllabus_weeks">;
export type PlanRow = Row<"pricing_plans">;
export type TopicRow = Row<"topics">;
export type InquiryRow = Row<"public_inquiries">;

export const categoryLabels: Record<string, string> = {
  excel: "Excel",
  word: "Word",
  powerpoint: "PowerPoint",
};

export const materialCategoryLabels: Record<string, string> = {
  general: "Genel içerik",
  weekly: "Haftalık ders",
  homework: "Ödev",
  note: "Not",
};

export const weekKindLabels: Record<string, string> = {
  core: "Ortak temel",
  specialized: "Pakete özel",
};

export const trainingTypeLabels: Record<string, string> = {
  individual: "Birebir",
  group: "Grup",
};

export const priceUnitLabels: Record<string, string> = {
  per_hour: "saat",
  total: "toplam",
};

export const inquiryStatusLabels: Record<string, string> = {
  new: "Yeni",
  answered: "Yanıtlandı",
  closed: "Kapatıldı",
};

export const roleLabels: Record<string, string> = {
  user: "Üye",
  instructor: "Eğitmen",
  admin: "Admin",
};
