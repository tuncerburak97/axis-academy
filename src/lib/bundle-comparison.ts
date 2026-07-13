// src/lib/bundle-comparison.ts — paket müfredatı karşılaştırma matrisi satırları
import type { BundleSyllabusWeek, BundleWithSyllabus, WeekKind } from "@/lib/types/catalog";

export interface ComparisonMatrixRow {
  key: string;
  label: string;
  description: string;
}

export interface ComparisonMatrixCell {
  included: boolean;
  weekKind?: WeekKind;
  weekNumber?: number;
}

function weekKey(week: BundleSyllabusWeek): string {
  return week.source_module_week_id ?? week.id;
}

/** Tüm paketlerde geçen benzersiz hafta satırları (en uzun paket sırasına göre) */
export function buildComparisonMatrixRows(bundles: BundleWithSyllabus[]): ComparisonMatrixRow[] {
  const withSyllabus = bundles.filter((b) => b.weeks.length > 0);
  if (withSyllabus.length === 0) return [];

  const rowMap = new Map<string, ComparisonMatrixRow>();
  for (const bundle of withSyllabus) {
    for (const week of bundle.weeks) {
      const key = weekKey(week);
      if (!rowMap.has(key)) {
        rowMap.set(key, { key, label: week.title, description: week.description });
      }
    }
  }

  const anchor = withSyllabus.reduce((a, b) => (a.weeks.length >= b.weeks.length ? a : b));
  const orderedKeys: string[] = [];
  for (const week of anchor.weeks) {
    const key = weekKey(week);
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  }
  for (const key of rowMap.keys()) {
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  }

  return orderedKeys.map((key) => rowMap.get(key)!);
}

export function getMatrixCell(bundle: BundleWithSyllabus, rowKey: string): ComparisonMatrixCell {
  const week = bundle.weeks.find((w) => weekKey(w) === rowKey);
  if (!week) return { included: false };
  return { included: true, weekKind: week.week_kind, weekNumber: week.week_number };
}
