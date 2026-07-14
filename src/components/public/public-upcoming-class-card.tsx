// src/components/public/public-upcoming-class-card.tsx — anonim ziyaretçi için yaklaşan sınıf kartı
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Users } from "lucide-react";
import { daysUntil, formatClassDateBadge } from "@/lib/dates";
import { categoryLabels, type ModuleCategory } from "@/lib/types/catalog";

interface PublicUpcomingClassCardProps {
  id: string;
  title: string;
  start_date: string;
  schedule_note: string;
  duration_hours: number;
  capacity: number;
  approved_count: number;
  module_id: string;
  module_title?: string;
  module_category?: ModuleCategory;
  variant?: "hero" | "detail";
}

const urgencyClasses: Record<string, string> = {
  today: "font-bold text-accent",
  tomorrow: "font-bold text-accent",
  soon: "font-semibold text-accent",
  normal: "text-ink-soft",
};

export function PublicUpcomingClassCard({
  title,
  start_date,
  schedule_note,
  duration_hours,
  capacity,
  approved_count,
  module_id,
  module_title,
  module_category,
  variant = "hero",
}: PublicUpcomingClassCardProps) {
  const remaining = Math.max(0, capacity - Number(approved_count));
  const countdown = daysUntil(start_date);
  const badge = formatClassDateBadge(start_date);
  const isLowCapacity = remaining > 0 && remaining <= 5;
  const isFull = remaining === 0;
  const isDetail = variant === "detail";

  return (
    <article
      className={`flex h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        isDetail
          ? "flex-col gap-4 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
          : "flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
      }`}
    >
      <div className={`flex gap-4 ${isDetail ? "min-w-0 flex-1 items-start" : "items-start"}`}>
        <div
          className="flex shrink-0 flex-col items-center rounded-xl bg-accent px-3.5 py-2.5 text-white"
          aria-hidden
        >
          <span className="font-display text-2xl font-bold leading-none">{badge.day}</span>
          <span className="mt-1 text-[11px] font-semibold uppercase">{badge.month}</span>
        </div>

        <div className="min-w-0 flex-1">
          {variant === "hero" && module_title && (
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {module_category ? categoryLabels[module_category] : module_title}
            </p>
          )}
          <p className={`font-display font-semibold leading-snug ${variant === "hero" ? "mt-1" : ""}`}>
            {title}
          </p>
          {variant === "hero" && module_title && (
            <p className="mt-0.5 text-xs text-ink-soft">{module_title}</p>
          )}

          <p className={`mt-2 text-sm ${urgencyClasses[countdown.urgency]}`} aria-live="polite">
            {countdown.label}
          </p>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {new Date(start_date).toLocaleDateString("tr-TR")}
              {schedule_note && ` · ${schedule_note}`}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {duration_hours} saat
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" aria-hidden />
              {isFull ? (
                "Kontenjan doldu"
              ) : isLowCapacity ? (
                <span className="font-semibold text-amber-700">Dolmak üzere · {remaining} kontenjan</span>
              ) : (
                `${remaining} kontenjan kaldı`
              )}
            </span>
          </div>
        </div>
      </div>

      <div className={`flex flex-col gap-2 ${isDetail ? "shrink-0 sm:ml-4" : "mt-auto"}`}>
        <Link
          href="/kayit"
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong ${
            isDetail ? "sm:w-auto" : "w-full"
          }`}
        >
          Kayıt Ol <ArrowRight className="size-4" aria-hidden />
        </Link>
        {variant === "hero" && (
          <Link
            href={`/egitim/${module_id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
          >
            Eğitimi İncele
          </Link>
        )}
      </div>
    </article>
  );
}
