// src/components/public/cohort-row.tsx — yaklaşan dönem satırı: takvim yaprağı, program, gün/saat, kontenjan, fiyat
import * as React from "react";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { DateTile, Price, SeatMeter } from "@/components/ui/data";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { enrollmentStatusLabels, enrollmentStatusTone, type EnrollmentStatus } from "@/lib/types/platform";
import type { CatalogCohort } from "@/lib/types/platform";
import { cn } from "@/lib/utils";

export function cohortIsFull(cohort: Pick<CatalogCohort, "status" | "taken_seats" | "capacity">): boolean {
  return cohort.status === "full" || cohort.taken_seats >= cohort.capacity;
}

/** Dönem başvuru adresi: giriş yoksa giriş sayfasına (dönüşte diyalog açılır), varsa program sayfasındaki başvuru diyaloğuna */
export function cohortApplyHref(cohort: Pick<CatalogCohort, "id" | "module_slug">, loggedIn: boolean): string {
  const target = `/programlar/${cohort.module_slug}?basvur=${cohort.id}`;
  return loggedIn ? target : `/giris?next=${encodeURIComponent(target)}`;
}

/** Kullanıcının bu döneme kaydı (iptal dışı) varsa durum rozeti */
export function MyCohortStatus({ status, className }: { status: string | null; className?: string }) {
  if (!status) return null;
  const key = status as EnrollmentStatus;
  return (
    <Badge tone={enrollmentStatusTone[key] ?? "neutral"} dot className={className}>
      {enrollmentStatusLabels[key] ?? status}
    </Badge>
  );
}

/** Katalog ve program sayfasındaki dönem satırı. action: başvuru butonu vb. */
export function CohortRow({
  cohort,
  showProgram = true,
  action,
  className,
}: {
  cohort: CatalogCohort;
  showProgram?: boolean;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-5 md:grid-cols-[auto_minmax(0,1fr)_200px_auto] md:items-center",
        className,
      )}
    >
      <DateTile date={`${cohort.start_date}T12:00:00`} />
      <div className="min-w-0">
        {showProgram && (
          <Link
            href={`/programlar/${cohort.module_slug}`}
            className="text-xs font-semibold uppercase tracking-[0.08em] text-accent hover:underline"
          >
            {cohort.module_title}
          </Link>
        )}
        <h3 className="mt-0.5 text-[15px] font-semibold leading-snug tracking-tight text-ink">{cohort.title}</h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            <span className="tabular font-mono">{cohort.schedule_note || formatDate(cohort.start_date)}</span>
          </span>
          <span className="tabular font-mono">
            {cohort.duration_weeks} hf · {cohort.duration_hours} sa
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {cohort.location || "Online"}
          </span>
        </p>
        <MyCohortStatus status={cohort.my_status} className="mt-2" />
      </div>
      <SeatMeter taken={cohort.taken_seats} capacity={cohort.capacity} className="col-span-2 md:col-span-1" />
      <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-1 md:flex-col md:items-end">
        {cohort.price ? (
          <Price amount={Number(cohort.price)} unit="kişi" className="text-lg" />
        ) : (
          <span className="text-sm text-ink-soft">Fiyat için sor</span>
        )}
        {action}
      </div>
    </article>
  );
}

/** Koyu kart içinde kompakt dönem satırı (anasayfa "Yaklaşan dönemler") */
export function CohortMiniRow({ cohort }: { cohort: CatalogCohort }) {
  const left = Math.max(0, cohort.capacity - cohort.taken_seats);
  const full = cohortIsFull(cohort);
  return (
    <Link
      href={`/programlar/${cohort.module_slug}#donemler`}
      className="group flex items-center gap-3.5 rounded-xl p-2.5 transition-colors hover:bg-white/5 focus-visible:outline-accent-glow"
    >
      <DateTile date={`${cohort.start_date}T12:00:00`} tone="dark" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white">{cohort.module_title}</p>
        <p className="tabular mt-0.5 truncate font-mono text-xs text-white/60">{cohort.schedule_note || cohort.title}</p>
        <p className={cn("mt-1 text-xs font-semibold", full ? "text-[#fca5a5]" : left <= 3 ? "text-amber" : "text-white/70")}>
          {full ? "Dolu · bekleme listesi" : left <= 3 ? `Son ${left} yer` : `${left} yer var`}
        </p>
      </div>
      {cohort.price ? (
        <span className="tabular shrink-0 font-mono text-sm text-white">₺{new Intl.NumberFormat("tr-TR").format(Number(cohort.price))}</span>
      ) : null}
    </Link>
  );
}
