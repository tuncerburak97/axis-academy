// src/components/ui/progress.tsx — ilerleme gösterimleri: talep durum hattı, hafta şeridi, yüzde çubuğu
import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusTrackProps {
  steps: string[];
  /** Şu anki adımın sırası (0'dan). -1: iptal edildi */
  current: number;
  /** Tamamlanan son adım da "bitti" gösterilsin mi (ör. talep tamamlandı) */
  finished?: boolean;
  cancelledLabel?: string;
  className?: string;
}

/** Talep/kayıt durum hattı. Renk yanında ikon ve metin de durumu anlatır. */
export function StatusTrack({ steps, current, finished, cancelledLabel = "İptal edildi", className }: StatusTrackProps) {
  if (current < 0) {
    return (
      <p className={cn("inline-flex items-center gap-2 rounded-full bg-danger-soft px-3 py-1.5 text-xs font-semibold text-danger-ink", className)}>
        <X className="size-3.5" aria-hidden />
        {cancelledLabel}
      </p>
    );
  }

  return (
    <ol className={cn("flex min-w-0 items-start", className)} aria-label="Durum">
      {steps.map((step, index) => {
        const done = index < current || (finished && index === current);
        const active = index === current && !finished;
        return (
          <li
            key={step}
            className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
            aria-current={active ? "step" : undefined}
          >
            {index > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2",
                  index <= current ? "bg-accent" : "bg-line",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-6 items-center justify-center rounded-full text-[11px] font-bold ring-4 ring-paper transition-colors",
                done && "bg-accent text-white",
                active && "bg-paper text-accent ring-accent-soft outline-2 outline-accent",
                !done && !active && "bg-surface text-ink-muted outline-1 outline-line-strong",
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
            </span>
            <span
              className={cn(
                "max-w-full px-1 text-[11px] font-medium leading-tight sm:text-xs",
                active ? "font-semibold text-ink" : done ? "text-ink-soft" : "text-ink-muted",
              )}
            >
              {step}
              <span className="sr-only">{done ? " (tamamlandı)" : active ? " (şu anki adım)" : ""}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

interface WeekStripProps {
  total: number;
  /** Şu an içinde bulunulan hafta (1'den) */
  current: number;
  tone?: "light" | "dark";
  className?: string;
}

/** Dönemin hafta hafta ilerleyişi: biten haftalar dolu, içinde bulunulan amber */
export function WeekStrip({ total, current, tone = "light", className }: WeekStripProps) {
  const weeks = Math.max(total, 1);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-1" role="img" aria-label={`${weeks} haftanın ${Math.min(current, weeks)}. haftası`}>
        {Array.from({ length: weeks }, (_, index) => {
          const week = index + 1;
          return (
            <span
              key={week}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                week < current && (tone === "dark" ? "bg-accent-glow" : "bg-accent"),
                week === current && "bg-amber",
                week > current && (tone === "dark" ? "bg-white/15" : "bg-line"),
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Basit yüzde çubuğu */
export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-line", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label}
    >
      <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${clamped}%` }} />
    </div>
  );
}
