// src/lib/syllabus.ts — haftalık müfredat ve sınıf progress hesaplamaları
import type { ClassMaterial, MaterialCategory, RequestStatus, SyllabusWeek } from "@/lib/types/catalog";

export type { SyllabusWeek };

export type WeekStatus = "completed" | "current" | "upcoming";

export interface WeekMaterialCounts {
  weekly: number;
  homework: number;
  documents: number;
}

export interface ClassProgressSnapshot {
  totalWeeks: number;
  effectiveWeek: number;
  completedWeeks: number;
  percentComplete: number;
  isManualOverride: boolean;
  autoWeek: number;
}

/** Başlangıç tarihinden bugüne kaç hafta geçti (1 tabanlı) */
export function computeAutoWeek(startDateIso: string, referenceDate = new Date()): number {
  const start = new Date(startDateIso);
  start.setHours(0, 0, 0, 0);
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  const diffMs = ref.getTime() - start.getTime();
  if (diffMs < 0) return 1;
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export function clampWeek(week: number, totalWeeks: number): number {
  if (totalWeeks <= 0) return Math.max(1, week);
  return Math.min(Math.max(1, week), totalWeeks);
}

/** Efektif güncel hafta: override varsa o, yoksa otomatik (sınıf süresiyle sınırlı) */
export function resolveEffectiveWeek(
  startDateIso: string,
  durationWeeks: number,
  override: number | null | undefined,
  referenceDate = new Date(),
): number {
  const total = Math.max(durationWeeks, 1);
  const auto = clampWeek(computeAutoWeek(startDateIso, referenceDate), total);
  if (override != null && override >= 1) return clampWeek(override, total);
  return auto;
}

export function getWeekStatus(weekNumber: number, effectiveWeek: number): WeekStatus {
  if (weekNumber < effectiveWeek) return "completed";
  if (weekNumber === effectiveWeek) return "current";
  return "upcoming";
}

export function buildClassProgress(
  startDateIso: string,
  durationWeeks: number,
  override: number | null | undefined,
  referenceDate = new Date(),
): ClassProgressSnapshot {
  const totalWeeks = Math.max(durationWeeks, 1);
  const autoWeek = clampWeek(computeAutoWeek(startDateIso, referenceDate), totalWeeks);
  const effectiveWeek = resolveEffectiveWeek(startDateIso, durationWeeks, override, referenceDate);
  const completedWeeks = Math.max(0, effectiveWeek - 1);
  const percentComplete = Math.round((completedWeeks / totalWeeks) * 100);

  return {
    totalWeeks,
    effectiveWeek,
    completedWeeks,
    percentComplete,
    isManualOverride: override != null && override >= 1,
    autoWeek,
  };
}

/** Materyalleri hafta numarasına göre gruplar ve kategori sayar */
export function groupMaterialsByWeek(
  materials: ClassMaterial[],
): Map<number, Map<MaterialCategory, ClassMaterial[]>> {
  const map = new Map<number, Map<MaterialCategory, ClassMaterial[]>>();
  for (const material of materials) {
    if (!material.week_number) continue;
    if (!map.has(material.week_number)) map.set(material.week_number, new Map());
    const weekMap = map.get(material.week_number)!;
    const list = weekMap.get(material.category) ?? [];
    list.push(material);
    weekMap.set(material.category, list);
  }
  return map;
}

export function countMaterialsForWeek(
  materials: ClassMaterial[],
  weekNumber: number,
): WeekMaterialCounts {
  const weekMaterials = materials.filter((m) => m.week_number === weekNumber);
  return {
    weekly: weekMaterials.filter((m) => m.category === "weekly").length,
    homework: weekMaterials.filter((m) => m.category === "homework").length,
    documents: weekMaterials.filter((m) => m.file_path).length,
  };
}

export function aggregateMaterialStats(materials: ClassMaterial[]) {
  return {
    totalDocuments: materials.filter((m) => m.file_path).length,
    totalHomework: materials.filter((m) => m.category === "homework").length,
    totalLessons: materials.filter((m) => m.category === "weekly").length,
    weeksWithContent: new Set(materials.filter((m) => m.week_number).map((m) => m.week_number)).size,
  };
}

/** Bireysel eğitim: talep durumuna göre müfredat ilerlemesi (sınıf tarihi yok) */
export function buildIndividualProgress(
  status: RequestStatus,
  syllabusWeekCount: number,
): ClassProgressSnapshot {
  const totalWeeks = Math.max(syllabusWeekCount, 1);

  if (status === "completed") {
    return {
      totalWeeks,
      effectiveWeek: totalWeeks,
      completedWeeks: totalWeeks,
      percentComplete: 100,
      isManualOverride: false,
      autoWeek: totalWeeks,
    };
  }

  if (status === "cancelled") {
    return {
      totalWeeks,
      effectiveWeek: 1,
      completedWeeks: 0,
      percentComplete: 0,
      isManualOverride: false,
      autoWeek: 1,
    };
  }

  const statusWeekMap: Record<Exclude<RequestStatus, "completed" | "cancelled">, number> = {
    received: 1,
    planned: Math.max(1, Math.ceil(totalWeeks * 0.1)),
    in_progress: Math.max(2, Math.ceil(totalWeeks * 0.5)),
  };

  const effectiveWeek = clampWeek(statusWeekMap[status], totalWeeks);
  const completedWeeks = Math.max(0, effectiveWeek - 1);
  const percentComplete = Math.round((completedWeeks / totalWeeks) * 100);

  return {
    totalWeeks,
    effectiveWeek,
    completedWeeks,
    percentComplete,
    isManualOverride: false,
    autoWeek: effectiveWeek,
  };
}
