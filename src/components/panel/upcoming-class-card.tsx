// src/components/panel/upcoming-class-card.tsx — yaklaşan sınıf kartı: tarih rozeti, geri sayım, katılım CTA
import Link from "next/link";
import { CalendarDays, Clock, Users } from "lucide-react";
import { requestEnrollment } from "@/lib/actions/member";
import { daysUntil, formatClassDateBadge } from "@/lib/dates";
import {
  categoryLabels,
  enrollmentStatusLabels,
  type EnrollmentStatus,
  type ModuleCategory,
} from "@/lib/types/catalog";

interface UpcomingClassCardProps {
  id: string;
  title: string;
  start_date: string;
  schedule_note: string;
  duration_hours: number;
  capacity: number;
  approved_count: number;
  my_status: EnrollmentStatus | null;
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

export function UpcomingClassCard({
  id,
  title,
  start_date,
  schedule_note,
  duration_hours,
  capacity,
  approved_count,
  my_status,
  module_id,
  module_title,
  module_category,
  variant = "hero",
}: UpcomingClassCardProps) {
  const remaining = Math.max(0, capacity - Number(approved_count));
  const countdown = daysUntil(start_date);
  const badge = formatClassDateBadge(start_date);
  const isLowCapacity = remaining > 0 && remaining <= 5;
  const isFull = remaining === 0;
  const isDetail = variant === "detail";
  const canEnterClass = my_status === "enrolled" || my_status === "in_progress";

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

          <p
            className={`mt-2 text-sm ${urgencyClasses[countdown.urgency]}`}
            aria-live="polite"
          >
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

      <div className={isDetail ? "shrink-0 sm:ml-4" : "mt-auto"}>
        {canEnterClass ? (
          <Link
            href={`/panel/sinif/${id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong sm:w-auto"
          >
            Eğitimine Git
          </Link>
        ) : my_status === "pending" ? (
          <span className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent sm:w-auto">
            {enrollmentStatusLabels.pending}
          </span>
        ) : (
          <form action={requestEnrollment} className={isDetail ? "" : "w-full"}>
            <input type="hidden" name="class_id" value={id} />
            <input type="hidden" name="module_id" value={module_id} />
            <button
              type="submit"
              disabled={isFull}
              className="min-h-11 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isFull ? "Kontenjan Doldu" : "Katılım İsteği Gönder"}
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
