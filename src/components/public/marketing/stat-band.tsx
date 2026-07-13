// src/components/public/marketing/stat-band.tsx — sayaçlı istatistik bandı
import { Reveal, StatCounter } from "@/components/public/motion-primitives";

export interface StatItem {
  value: number;
  label: string;
  suffix?: string;
}

interface StatBandProps {
  stats: StatItem[];
  title?: string;
  description?: string;
}

export function StatBand({ stats, title, description }: StatBandProps) {
  return (
    <section aria-label={title ?? "İstatistikler"} className="mx-auto max-w-6xl px-3 py-16 sm:px-6">
      {(title || description) && (
        <Reveal>
          {title && <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>}
          {description && <p className="mt-2 max-w-xl text-ink-soft">{description}</p>}
        </Reveal>
      )}
      <Reveal delay={0.1}>
        <div
          className={`grid gap-10 rounded-2xl border border-line bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-10 ${
            stats.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"
          } ${title || description ? "mt-8" : ""}`}
        >
          {stats.map((stat) => (
            <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
