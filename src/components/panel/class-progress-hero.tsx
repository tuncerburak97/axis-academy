// src/components/panel/class-progress-hero.tsx — sınıf progress hero: bar, istatistikler, güncel hafta
"use client";

import { motion, useReducedMotion } from "motion/react";
import { BookOpen, ClipboardList, FileText, Layers, Sparkles } from "lucide-react";
import type { ClassProgressSnapshot } from "@/lib/syllabus";

interface ClassProgressHeroProps {
  progress: ClassProgressSnapshot;
  currentWeekTitle?: string;
  stats?: {
    totalDocuments: number;
    totalHomework: number;
    totalLessons: number;
  };
  footerNote?: string;
}

export function ClassProgressHero({ progress, currentWeekTitle, stats, footerNote }: ClassProgressHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Eğitim ilerlemeniz"
      className="overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-accent-soft/80 via-white to-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-accent shadow-sm">
            <Sparkles className="size-3.5" aria-hidden />
            İlerleme Durumun
          </p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Hafta {progress.effectiveWeek}
            <span className="text-xl font-semibold text-ink-soft sm:text-2xl"> / {progress.totalWeeks}</span>
          </p>
          {currentWeekTitle && (
            <p className="mt-1 max-w-lg text-sm font-medium text-ink-soft sm:text-base">
              Bu hafta: <span className="text-ink">{currentWeekTitle}</span>
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-bold text-accent">{progress.percentComplete}%</p>
          <p className="text-xs font-medium text-ink-soft">tamamlandı</p>
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-line/80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-strong"
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentComplete}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.2, ease: [0.21, 0.65, 0.35, 1] }}
          role="progressbar"
          aria-valuenow={progress.percentComplete}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Eğitim ilerlemesi %${progress.percentComplete}`}
        />
      </div>

      <p className="mt-2 text-xs text-ink-soft">
        {progress.completedWeeks} hafta tamamlandı · {Math.max(0, progress.totalWeeks - progress.effectiveWeek)} hafta kaldı
        {progress.isManualOverride && " · Eğitmen güncellemesi"}
        {footerNote && ` · ${footerNote}`}
      </p>

      {stats && (
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={Layers} label="Ders materyali" value={stats.totalLessons} />
        <StatCard icon={ClipboardList} label="Ödev" value={stats.totalHomework} />
        <StatCard icon={FileText} label="Doküman" value={stats.totalDocuments} />
      </dl>
      )}
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line/80 bg-white/80 px-4 py-3 backdrop-blur-sm">
      <span className="rounded-lg bg-accent-soft p-2 text-accent">
        <Icon className="size-4" aria-hidden />
      </span>
      <div>
        <dt className="text-xs font-medium text-ink-soft">{label}</dt>
        <dd className="font-display text-xl font-bold">{value}</dd>
      </div>
    </div>
  );
}
