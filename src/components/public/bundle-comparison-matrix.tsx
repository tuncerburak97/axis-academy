// src/components/public/bundle-comparison-matrix.tsx — hafta bazlı paket karşılaştırma tablosu
"use client";

import { Check, Minus } from "lucide-react";
import { buildComparisonMatrixRows, getMatrixCell } from "@/lib/bundle-comparison";
import { weekKindLabels } from "@/lib/types/catalog";
import type { BundleWithSyllabus } from "@/lib/types/catalog";

interface BundleComparisonMatrixProps {
  bundles: BundleWithSyllabus[];
}

export function BundleComparisonMatrix({ bundles }: BundleComparisonMatrixProps) {
  const withSyllabus = bundles.filter((b) => b.weeks.length > 0);
  const rows = buildComparisonMatrixRows(bundles);

  if (withSyllabus.length < 2 || rows.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-center font-display text-lg font-semibold sm:text-xl">Hafta bazlı karşılaştırma</h3>
      <p className="mx-auto mt-1 max-w-xl text-center text-sm text-ink-soft">
        Hangi pakette hangi konuların işlendiğini tek bakışta görün.
      </p>

      {/* Mobil: yatay kaydırma */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th scope="col" className="sticky left-0 z-10 min-w-[180px] bg-surface px-4 py-3 font-semibold">
                Konu / Hafta
              </th>
              {withSyllabus.map((bundle) => (
                <th key={bundle.id} scope="col" className="px-3 py-3 text-center font-semibold">
                  <span className="line-clamp-2 text-xs sm:text-sm">{bundle.title.replace(/ Paketi$/, "")}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-line last:border-0">
                <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-3 align-top font-medium">
                  <span className="line-clamp-2">{row.label}</span>
                </th>
                {withSyllabus.map((bundle) => {
                  const cell = getMatrixCell(bundle, row.key);
                  return (
                    <td key={bundle.id} className="px-3 py-3 text-center align-middle">
                      {cell.included ? (
                        <span className="inline-flex flex-col items-center gap-0.5">
                          <span
                            className={`inline-flex size-7 items-center justify-center rounded-full ${
                              cell.weekKind === "specialized" ? "bg-amber-soft text-amber-900" : "bg-accent-soft text-accent"
                            }`}
                            aria-label={`Hafta ${cell.weekNumber}, ${cell.weekKind ? weekKindLabels[cell.weekKind] : "dahil"}`}
                          >
                            <Check className="size-4" aria-hidden />
                          </span>
                          <span className="text-[10px] font-semibold text-ink-soft">
                            {cell.weekKind ? weekKindLabels[cell.weekKind] : "Dahil"}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex size-7 items-center justify-center text-ink-soft/40" aria-label="Dahil değil">
                          <Minus className="size-4" aria-hidden />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-center text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-accent" aria-hidden /> Ortak temel
        </span>
        <span className="mx-2">·</span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-amber" aria-hidden /> Pakete özel
        </span>
      </p>
    </div>
  );
}
