// src/components/public/program-card.tsx — katalog kartı: kategori, seviye, süre, sıradaki dönem ve başlangıç fiyatı
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/data";
import { formatDateShort } from "@/lib/format";
import { programLevelLabels, type ProgramLevel } from "@/lib/types/platform";
import { programCategoryLabels, type ProgramSummary } from "@/lib/queries/public-catalog";
import { cn } from "@/lib/utils";
import { ProgramVisual } from "@/components/public/showcase-art";

/** Kategoriye özgü küçük tipografik işaret (stok görsel yerine) */
const categoryMark: Record<string, { glyph: string; className: string }> = {
  excel: { glyph: "fx", className: "bg-success-soft text-success-ink" },
  word: { glyph: "¶", className: "bg-info-soft text-info-ink" },
  powerpoint: { glyph: "▶", className: "bg-amber-soft text-amber-ink" },
};

export function CategoryMark({ category, className }: { category: string; className?: string }) {
  const mark = categoryMark[category] ?? categoryMark.excel;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-[15px] font-semibold",
        mark.className,
        className,
      )}
    >
      {mark.glyph}
    </span>
  );
}

export function ProgramCard({ summary, className }: { summary: ProgramSummary; className?: string }) {
  const { program, category, startingPrice, weeks, hours, cohorts } = summary;
  const next = cohorts[0];
  const level = programLevelLabels[program.level as ProgramLevel] ?? "Her seviye";

  return (
    <Link
      href={`/programlar/${program.slug}`}
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-card transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-pop",
        className,
      )}
    >
      <div className="relative">
        <ProgramVisual
          category={category}
          className="h-44 border-b border-line transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-paper/90 text-ink-soft shadow-card ring-1 ring-line backdrop-blur transition-colors group-hover:text-accent">
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge size="sm">{programCategoryLabels[category]}</Badge>
          <Badge size="sm">{level}</Badge>
          {program.badge && (
            <Badge size="sm" tone="accent">
              {program.badge}
            </Badge>
          )}
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">{program.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{program.description}</p>

        <div className="mt-auto pt-6" />
        <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm [&_dt]:text-xs [&_dt]:text-ink-soft">
          <div>
            <dt>Süre</dt>
            <dd className="tabular mt-0.5 font-mono text-ink">
              {weeks ? `${weeks} hf` : "Esnek"}
              {hours ? ` · ${hours} sa` : ""}
            </dd>
          </div>
          <div>
            <dt>Sıradaki dönem</dt>
            <dd className="tabular mt-0.5 inline-flex items-center gap-1.5 font-mono text-ink">
              <CalendarDays className="size-3.5 text-ink-muted" aria-hidden />
              {next ? formatDateShort(next.start_date) : "Birebir"}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex items-baseline justify-between gap-2">
          {startingPrice ? (
            <Price amount={startingPrice.amount} unit={startingPrice.unit} from={!startingPrice.unit} className="text-lg text-ink" />
          ) : (
            <span className="text-sm text-ink-soft">Fiyat için teklif al</span>
          )}
          {cohorts.length > 0 && (
            <span className="text-xs text-ink-soft">
              <span className="tabular font-mono">{cohorts.length}</span> açık dönem
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
