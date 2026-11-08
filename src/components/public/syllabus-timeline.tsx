// src/components/public/syllabus-timeline.tsx — hafta hafta müfredat zaman çizelgesi (program ve paket müfredatı)
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TimelineWeek {
  id: string;
  week_number: number;
  title: string;
  description: string;
  week_kind?: string;
}

export function SyllabusTimeline({ weeks, compact = false, className }: { weeks: TimelineWeek[]; compact?: boolean; className?: string }) {
  if (weeks.length === 0) return null;
  return (
    <ol className={cn("relative flex flex-col", className)}>
      {weeks.map((week, index) => (
        <li key={week.id} className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-4 pb-6 last:pb-0">
          {index < weeks.length - 1 && <span aria-hidden className="absolute bottom-0 left-6 top-11 w-px bg-line-strong" />}
          <span className="relative flex h-11 flex-col items-center justify-center rounded-xl bg-surface ring-1 ring-inset ring-line">
            <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Hafta</span>
            <span className="tabular font-mono text-sm font-medium leading-none text-ink">{String(week.week_number).padStart(2, "0")}</span>
          </span>
          <div className={cn("min-w-0 pt-1", !compact && "pb-1")}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold leading-snug tracking-tight text-ink">{week.title}</h3>
              {week.week_kind === "specialized" && (
                <Badge size="sm" tone="accent">
                  Pakete özel
                </Badge>
              )}
            </div>
            {week.description && (
              <p className={cn("mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft", compact && "line-clamp-3")}>{week.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
