// src/lib/syllabus-resolve.ts — talep için doğru müfredat kaynağını seçer (server-only)
import { getBundleSyllabus, getModuleSyllabus } from "@/lib/queries/catalog";
import type { DisplaySyllabusWeek } from "@/lib/types/catalog";

export type { DisplaySyllabusWeek } from "@/lib/types/catalog";
export { isBundleSyllabusWeek } from "@/lib/types/catalog";

/** Paket talebinde bundle müfredatı; yoksa modül müfredatına düşer */
export async function resolveSyllabusForRequest(input: {
  module_id: string;
  bundle_id: string | null;
  request_type: "bundle" | "custom" | "schedule";
}): Promise<DisplaySyllabusWeek[]> {
  if (input.request_type === "bundle" && input.bundle_id) {
    const bundleWeeks = await getBundleSyllabus(input.bundle_id);
    if (bundleWeeks.length > 0) return bundleWeeks;
  }
  return getModuleSyllabus(input.module_id);
}
