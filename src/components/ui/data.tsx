// src/components/ui/data.tsx — veri parçaları: takvim yaprağı, kontenjan çubuğu, fiyat, istatistik, avatar, kısayol tuşu
import * as React from "react";
import { cn } from "@/lib/utils";

const monthShort = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

/** Takvim yaprağı: "18 / Kas". Tarih listelerinde sol sütun olarak kullanılır. */
export function DateTile({ date, className, tone = "light" }: { date: Date | string; className?: string; tone?: "light" | "dark" }) {
  const value = typeof date === "string" ? new Date(date) : date;
  const day = String(value.getDate()).padStart(2, "0");
  const month = monthShort[value.getMonth()];
  return (
    <span
      className={cn(
        "flex w-14 shrink-0 flex-col items-center justify-center rounded-xl py-2 leading-none",
        tone === "light" ? "bg-surface ring-1 ring-inset ring-line" : "bg-white/10",
        className,
      )}
    >
      <span className="tabular font-mono text-xl font-medium">{day}</span>
      <span className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.08em]", tone === "light" ? "text-ink-soft" : "text-white/70")}>
        {month}
      </span>
    </span>
  );
}

/** Kontenjan çubuğu: dolu yer / toplam. %80 üstü amber "az yer kaldı" uyarısı verir. */
export function SeatMeter({ taken, capacity, className }: { taken: number; capacity: number; className?: string }) {
  const ratio = capacity > 0 ? Math.min(1, taken / capacity) : 0;
  const left = Math.max(0, capacity - taken);
  const status = left === 0 ? "full" : ratio >= 0.8 ? "low" : "open";
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className={cn("font-semibold", status === "full" ? "text-danger-ink" : status === "low" ? "text-amber-ink" : "text-ink-soft")}>
          {status === "full" ? "Kontenjan doldu" : status === "low" ? `Son ${left} yer` : `${left} yer var`}
        </span>
        <span className="tabular font-mono text-ink-soft">
          {taken}/{capacity}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
        <div
          className={cn("h-full rounded-full", status === "full" ? "bg-danger" : "bg-amber")}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

const tryFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

/** Fiyat: "₺4.800" ve isteğe bağlı birim ("/ kişi", "/ saat"); "'den başlayan" önekli kullanım için from */
export function Price({
  amount,
  unit,
  from,
  className,
}: {
  amount: number;
  unit?: string;
  from?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span className="tabular font-mono font-medium tracking-tight">₺{tryFormatter.format(amount)}</span>
      {from && <span className="text-[0.8em] text-ink-soft">'den başlayan</span>}
      {unit && <span className="text-[0.8em] text-ink-soft">/ {unit}</span>}
    </span>
  );
}

/** Admin ve panel özet kutusu. "attention" dikkat gerektiren sayıyı amber vurgular. */
export function Stat({
  label,
  value,
  hint,
  icon: Icon,
  attention,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  attention?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-2xl border p-4 sm:p-5",
        attention ? "border-amber/60 bg-amber-soft" : "border-line bg-paper shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={cn("text-sm font-medium", attention ? "text-amber-ink" : "text-ink-soft")}>{label}</p>
        {Icon && <Icon className={cn("size-4", attention ? "text-amber-ink" : "text-ink-muted")} aria-hidden />}
      </div>
      <p className="tabular font-mono text-3xl font-medium tracking-tight text-ink">{value}</p>
      {hint && <p className={cn("text-xs", attention ? "text-amber-ink" : "text-ink-soft")}>{hint}</p>}
    </div>
  );
}

const avatarTones = [
  "bg-accent-soft text-accent-ink",
  "bg-amber-soft text-amber-ink",
  "bg-success-soft text-success-ink",
  "bg-info-soft text-info-ink",
  "bg-[#f3e8ff] text-[#6b21a8]",
];

/** Baş harfli avatar; renk isimden türetilir, aynı kişi hep aynı rengi alır */
export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toLocaleUpperCase("tr-TR") || "?";
  const tone = avatarTones[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        size === "sm" && "size-7 text-[11px]",
        size === "md" && "size-9 text-xs",
        size === "lg" && "size-12 text-sm",
        tone,
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-md border border-line-strong bg-paper px-1.5 font-mono text-[11px] font-medium text-ink-soft shadow-[0_1px_0_var(--color-line-strong)]",
        className,
      )}
      {...props}
    />
  );
}
