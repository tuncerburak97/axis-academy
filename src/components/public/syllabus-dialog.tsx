// src/components/public/syllabus-dialog.tsx — paket müfredatını native dialog ile gösteren popup
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, X } from "lucide-react";
import { SyllabusTimeline } from "@/components/public/syllabus-timeline";
import { weekKindLabels } from "@/lib/types/catalog";
import type { BundleWithSyllabus } from "@/lib/types/catalog";

interface SyllabusDialogProps {
  moduleTitle: string;
  bundles: BundleWithSyllabus[];
  initialBundleId: string;
}

function countKind(weeks: BundleWithSyllabus["weeks"], kind: "core" | "specialized") {
  return weeks.filter((week) => week.week_kind === kind).length;
}

export function SyllabusDialog({ moduleTitle, bundles, initialBundleId }: SyllabusDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const withSyllabus = bundles.filter((bundle) => bundle.weeks.length > 0);
  const [activeId, setActiveId] = useState(initialBundleId);

  if (withSyllabus.length === 0) return null;

  const active = withSyllabus.find((bundle) => bundle.id === activeId) ?? withSyllabus[0];

  function openDialog() {
    setActiveId(initialBundleId);
    dialogRef.current?.showModal();
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
      >
        Müfredatı Gör
      </button>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-labelledby="syllabus-dialog-title"
        className="m-auto w-[calc(100%-2rem)] max-w-3xl rounded-2xl p-0 shadow-xl backdrop:bg-ink/40"
      >
        <div className="flex max-h-[85vh] flex-col">
          <div className="shrink-0 border-b border-line p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  <BookOpen className="size-3.5" aria-hidden />
                  Paket müfredatı
                </p>
                <h2 id="syllabus-dialog-title" className="mt-3 font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {moduleTitle}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">Paket seçerek haftalık içeriği inceleyin.</p>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Kapat"
                className="min-touch rounded-lg p-2 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div
              role="tablist"
              aria-label="Paket müfredatı"
              className="mt-6 flex gap-1 overflow-x-auto border-b border-line [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {withSyllabus.map((bundle) => {
                const isActive = bundle.id === activeId;
                return (
                  <button
                    key={bundle.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveId(bundle.id)}
                    className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
                    }`}
                  >
                    {bundle.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-6 sm:px-8" role="tabpanel">
            {active && (
              <SyllabusTimeline
                weeks={active.weeks}
                showWeekKind
                embedded
                title={`${active.title} — Haftalık Akış`}
                description={`${countKind(active.weeks, "core")} ${weekKindLabels.core.toLowerCase()}${
                  countKind(active.weeks, "specialized") > 0
                    ? ` + ${countKind(active.weeks, "specialized")} ${weekKindLabels.specialized.toLowerCase()}`
                    : ""
                }. Toplam ${active.duration_hours} saat.`}
              />
            )}
          </div>

          <div className="shrink-0 border-t border-line p-6 sm:p-8">
            <Link
              href="/kayit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Kayıt Ol, Paket Seç <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
