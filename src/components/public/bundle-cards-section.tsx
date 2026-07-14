// src/components/public/bundle-cards-section.tsx — sadeleştirilmiş hazır paket kartları (fiyatsız)
"use client";

import { Clock, Layers, Sparkles } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";
import { SyllabusDialog } from "@/components/public/syllabus-dialog";
import { weekKindLabels } from "@/lib/types/catalog";
import type { BundleWithSyllabus } from "@/lib/types/catalog";

interface BundleCardsSectionProps {
  moduleTitle: string;
  bundles: BundleWithSyllabus[];
}

function countKind(weeks: BundleWithSyllabus["weeks"], kind: "core" | "specialized") {
  return weeks.filter((week) => week.week_kind === kind).length;
}

export function BundleCardsSection({ moduleTitle, bundles }: BundleCardsSectionProps) {
  if (bundles.length === 0) return null;

  return (
    <section aria-labelledby="bundles-heading" className="border-t border-line bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent">
              <Sparkles className="size-3.5" aria-hidden />
              Hazır paketler
            </p>
            <h2 id="bundles-heading" className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Hangi paket sana uygun?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-ink-soft">
              Program süresi ve kapsamı paketten pakete değişir. Haftalık içeriği görmek için karttaki butona tıklayın.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {bundles.map((bundle, index) => {
            const core = countKind(bundle.weeks, "core");
            const specialized = countKind(bundle.weeks, "specialized");

            return (
              <Reveal key={bundle.id} delay={index * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <p className="font-display font-semibold leading-snug">{bundle.title}</p>
                  <p className="mt-1 line-clamp-3 text-sm text-ink-soft">{bundle.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-ink-soft">
                      <Clock className="size-3.5" aria-hidden /> {bundle.duration_hours} saat
                    </span>
                    {bundle.weeks.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-ink-soft">
                        <Layers className="size-3.5" aria-hidden /> {bundle.weeks.length} hafta
                      </span>
                    )}
                  </div>

                  {bundle.weeks.length > 0 && (
                    <p className="mt-3 text-xs font-semibold text-accent">
                      {core > 0 && `${core} ${weekKindLabels.core.toLowerCase()}`}
                      {core > 0 && specialized > 0 && " · "}
                      {specialized > 0 && `${specialized} ${weekKindLabels.specialized.toLowerCase()}`}
                    </p>
                  )}

                  <div className="mt-auto pt-5">
                    {bundle.weeks.length > 0 ? (
                      <SyllabusDialog
                        moduleTitle={moduleTitle}
                        bundles={bundles}
                        initialBundleId={bundle.id}
                      />
                    ) : (
                      <p className="text-center text-xs text-ink-soft">Müfredat yakında eklenecek.</p>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
