// src/components/public/bundle-comparison-section.tsx — paket karşılaştırma: şerit + sekmeli müfredat
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Layers, Sparkles } from "lucide-react";
import { SyllabusTimeline } from "@/components/public/syllabus-timeline";
import { BundleComparisonMatrix } from "@/components/public/bundle-comparison-matrix";
import { Reveal } from "@/components/public/motion-primitives";
import { weekKindLabels } from "@/lib/types/catalog";
import type { BundleWithSyllabus } from "@/lib/types/catalog";

interface BundleComparisonSectionProps {
  moduleTitle: string;
  bundles: BundleWithSyllabus[];
}

export function BundleComparisonSection({ moduleTitle, bundles }: BundleComparisonSectionProps) {
  const withSyllabus = bundles.filter((b) => b.weeks.length > 0);
  const [activeId, setActiveId] = useState(withSyllabus[0]?.id ?? bundles[0]?.id);
  const active = withSyllabus.find((b) => b.id === activeId) ?? withSyllabus[0];

  if (bundles.length === 0) return null;

  const countKind = (weeks: BundleWithSyllabus["weeks"], kind: "core" | "specialized") =>
    weeks.filter((w) => w.week_kind === kind).length;

  return (
    <section
      id="paketleri-karsilastir"
      aria-labelledby="bundle-compare-heading"
      className="border-t border-line bg-surface py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent">
              <Sparkles className="size-3.5" aria-hidden />
              Paket karşılaştırması
            </p>
            <h2 id="bundle-compare-heading" className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Hangi paket sana uygun?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-ink-soft">
              {moduleTitle} için her paketin haftalık akışı farklıdır. Ortak temel haftalar tüm paketlerde aynıdır;
              pakete özel haftalar programı derinleştirir.
            </p>
          </div>
        </Reveal>

        {/* Karşılaştırma şeridi */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {bundles.map((bundle, index) => {
            const core = countKind(bundle.weeks, "core");
            const specialized = countKind(bundle.weeks, "specialized");
            const isActive = bundle.id === activeId;
            return (
              <Reveal key={bundle.id} delay={index * 0.08}>
                <button
                  type="button"
                  onClick={() => setActiveId(bundle.id)}
                  aria-pressed={isActive}
                  className={`flex h-full w-full flex-col rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 ${
                    isActive
                      ? "border-accent bg-white shadow-md ring-2 ring-accent/20"
                      : "border-line bg-white hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <p className="font-display font-semibold leading-snug">{bundle.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{bundle.description}</p>
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
                  <p className="mt-auto pt-4 font-display text-lg font-bold">
                    {bundle.fixed_price.toLocaleString("tr-TR")}₺
                  </p>
                </button>
              </Reveal>
            );
          })}
        </div>

        <BundleComparisonMatrix bundles={bundles} />

        {/* Sekmeli müfredat */}
        {active && active.weeks.length > 0 && (
          <div className="mt-10">
            <div role="tablist" aria-label="Paket müfredatı" className="scroll-fade-x border-b border-line">
              <div className="flex gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {withSyllabus.map((bundle) => {
                  const isTabActive = bundle.id === activeId;
                  return (
                    <button
                      key={bundle.id}
                      type="button"
                      role="tab"
                      aria-selected={isTabActive}
                      onClick={() => setActiveId(bundle.id)}
                      className={`min-h-11 shrink-0 snap-start whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 sm:py-3 ${
                        isTabActive ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
                      }`}
                    >
                      {bundle.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div role="tabpanel" className="mt-8">
              <SyllabusTimeline
                weeks={active.weeks}
                showWeekKind
                title={`${active.title} — Haftalık Akış`}
                description={`${countKind(active.weeks, "core")} ortak temel hafta${
                  countKind(active.weeks, "specialized") > 0
                    ? ` + ${countKind(active.weeks, "specialized")} pakete özel hafta`
                    : ""
                }. Toplam ${active.duration_hours} saat.`}
                embedded
              />
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/kayit"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Kayıt Ol, Paket Seç <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
