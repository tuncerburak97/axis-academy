// src/components/public/syllabus-timeline.tsx — public haftalık müfredat vitrini (wow timeline)
"use client";

import { BookOpen, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";
import type { SyllabusWeek } from "@/lib/types/catalog";

interface SyllabusTimelineProps {
  weeks: SyllabusWeek[];
  title?: string;
  description?: string;
}

export function SyllabusTimeline({
  weeks,
  title = "Haftalık Müfredat",
  description = "Hafta hafta ne öğreneceğinizi net biçimde görün — program yoğun ve uygulamalıdır.",
}: SyllabusTimelineProps) {
  if (weeks.length === 0) return null;

  return (
    <section aria-labelledby="syllabus-heading" className="border-t border-line bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-3 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent">
              <BookOpen className="size-3.5" aria-hidden />
              {weeks.length} haftalık program
            </p>
            <h2 id="syllabus-heading" className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-ink-soft">{description}</p>
          </div>
        </Reveal>

        <ol className="relative mt-12 space-y-0">
          <span
            className="absolute bottom-4 left-[1.35rem] top-4 w-0.5 bg-gradient-to-b from-accent via-accent/40 to-line sm:left-6"
            aria-hidden
          />
          {weeks.map((week, index) => (
            <Reveal key={week.id} delay={index * 0.06}>
              <li className="relative flex gap-4 pb-10 last:pb-0 sm:gap-6">
                <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent font-display text-sm font-bold text-white shadow-md sm:size-12">
                  {week.week_number}
                </span>
                <div className="min-w-0 flex-1 rounded-2xl border border-line bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
                  <h3 className="font-display text-lg font-semibold">{week.title}</h3>
                  {week.description && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{week.description}</p>
                  )}
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    <CheckCircle2 className="size-3.5" aria-hidden />
                    Hafta {week.week_number} kazanımı
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
