// src/components/panel/week-progress-tracker.tsx — haftalık müfredat progress timeline (öğrenci)
"use client";

import { Check, ClipboardList, FileText, Lock, PlayCircle } from "lucide-react";
import { countMaterialsForWeek, getWeekStatus, type WeekStatus } from "@/lib/syllabus";
import type { ClassMaterial, SyllabusWeek } from "@/lib/types/catalog";

interface WeekProgressTrackerProps {
  weeks: SyllabusWeek[];
  effectiveWeek: number;
  materials: ClassMaterial[];
  /** Tek hafta / odak görünümü: daha küçük rozet, daha sıkı düzen */
  compact?: boolean;
}

const statusStyles: Record<WeekStatus, { ring: string; bg: string; text: string; icon: typeof Check }> = {
  completed: { ring: "ring-success/30", bg: "bg-success", text: "text-success", icon: Check },
  current: { ring: "ring-accent/40", bg: "bg-accent", text: "text-accent", icon: PlayCircle },
  upcoming: { ring: "ring-line", bg: "bg-surface", text: "text-ink-soft", icon: Lock },
};

const statusLabels: Record<WeekStatus, string> = {
  completed: "Tamamlandı",
  current: "Bu hafta",
  upcoming: "Yaklaşan",
};

export function WeekProgressTracker({ weeks, effectiveWeek, materials, compact = false }: WeekProgressTrackerProps) {
  if (weeks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-soft">
        Müfredat henüz tanımlanmadı.
      </p>
    );
  }

  return (
    <ol className={`relative space-y-0 ${compact ? "pt-1" : ""}`}>
      <span
        className={`absolute w-0.5 bg-gradient-to-b from-success via-accent to-line ${
          compact
            ? "bottom-4 left-[1.1rem] top-4 sm:left-[1.25rem]"
            : "bottom-6 left-[1.35rem] top-6 sm:left-6"
        }`}
        aria-hidden
      />
      {weeks.map((week) => {
        const status = getWeekStatus(week.week_number, effectiveWeek);
        const style = statusStyles[status];
        const StatusIcon = style.icon;
        const counts = countMaterialsForWeek(materials, week.week_number);

        return (
          <li
            key={week.id}
            className={`relative flex last:pb-0 ${
              compact ? "gap-3 pb-4 sm:gap-4" : "gap-4 pb-8 sm:gap-6"
            } ${status === "current" ? "rounded-2xl" : ""}`}
          >
            <span
              className={`relative z-10 flex shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${
                compact
                  ? `size-9 ring-2 sm:size-10 ${style.ring} ${style.bg}`
                  : `size-11 ring-4 sm:size-12 ${style.ring} ${style.bg}`
              }`}
            >
              {status === "completed" ? (
                <Check className={compact ? "size-4" : "size-5"} aria-hidden />
              ) : (
                <span className={`font-semibold ${compact ? "text-xs" : "font-display text-sm font-bold"}`}>
                  {week.week_number}
                </span>
              )}
            </span>
            <article
              className={`min-w-0 flex-1 rounded-2xl border transition-shadow ${
                compact ? "p-4" : "p-5"
              } ${
                status === "current"
                  ? "border-accent/40 bg-accent-soft/30 shadow-md"
                  : status === "completed"
                    ? "border-line bg-white shadow-sm"
                    : "border-line bg-white/60 opacity-90"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display font-semibold">{week.title}</h3>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${style.text}`}>
                  <StatusIcon className="size-3.5" aria-hidden />
                  {statusLabels[status]}
                </span>
              </div>
              {week.description && (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{week.description}</p>
              )}
              {(counts.weekly > 0 || counts.homework > 0 || counts.documents > 0) && (
                <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-ink-soft">
                  {counts.weekly > 0 && (
                    <li className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                      <PlayCircle className="size-3 text-accent" aria-hidden />
                      {counts.weekly} ders
                    </li>
                  )}
                  {counts.homework > 0 && (
                    <li className="inline-flex items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1">
                      <ClipboardList className="size-3" aria-hidden />
                      {counts.homework} ödev
                    </li>
                  )}
                  {counts.documents > 0 && (
                    <li className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                      <FileText className="size-3 text-accent" aria-hidden />
                      {counts.documents} doküman
                    </li>
                  )}
                </ul>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
