// src/components/public/blocks.tsx — public sayfa yapı taşları: talep hattı, SSS, yorumlar, güven şeridi, kapanış çağrısı
import * as React from "react";
import { Check, ChevronDown, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/page-header";
import { formatDateShort } from "@/lib/format";
import type { FaqItem } from "@/lib/types/content";
import type { PublicReview } from "@/lib/types/platform";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// Talep hattı: Alındı → Teklif → Onay → Devam → Teslim
// ------------------------------------------------------------
export interface PipelineStep {
  label: string;
  title: string;
  description: string;
}

export const servicePipeline: PipelineStep[] = [
  { label: "Alındı", title: "İhtiyacını anlat", description: "Kısa formu doldur, varsa dosyanı ekle. Talebin panelinde hemen görünür." },
  { label: "Teklif", title: "Net teklifini gör", description: "Ekibimiz inceler; kapsam, süre ve tutarı panelinde yazılı olarak sunar." },
  { label: "Onay", title: "Onayla, başlayalım", description: "Teklifi tek tıkla onayla ya da sorularını mesajla sor. Ödeme ekibimizle konuşulur." },
  { label: "Devam", title: "Adım adım izle", description: "İlerleme notları, mesajlar ve ara dosyalar talep sayfanda birikir." },
  { label: "Teslim", title: "Teslim dosyanı al", description: "Çıktılar panelindeki Belgelerim bölümünde seni bekler." },
];

/** Hizmet sürecini numaralı, yatay (masaüstü) / dikey (mobil) hat olarak gösterir */
export function Pipeline({
  steps = servicePipeline,
  vertical = false,
  className,
}: {
  steps?: PipelineStep[];
  /** true: her ekranda dikey hat (dar sütunlar için) */
  vertical?: boolean;
  className?: string;
}) {
  const horizontal = !vertical;
  return (
    <ol className={cn("grid gap-0", horizontal && "md:grid-cols-5 md:gap-4", className)}>
      {steps.map((step, index) => (
        <li key={step.label} className={cn("relative flex gap-4 pb-8 last:pb-0", horizontal && "md:flex-col md:gap-3 md:pb-0")}>
          {index < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "absolute left-[15px] top-10 h-[calc(100%-3rem)] w-px bg-line-strong",
                horizontal && "md:left-10 md:-right-2 md:top-[15px] md:h-px md:w-auto",
              )}
            />
          )}
          <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs font-medium text-white">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">{step.label}</p>
            <p className="mt-1 font-semibold tracking-tight text-ink">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ------------------------------------------------------------
// SSS: yerel <details> akordeonu (JS gerektirmez, içerik her zaman erişilebilir)
// ------------------------------------------------------------
export function FaqList({ items, className }: { items: FaqItem[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={cn("divide-y divide-line rounded-2xl border border-line bg-paper", className)}>
      {items.map((item, index) => (
        <details key={`${item.question}-${index}`} className="group px-5 sm:px-6" open={index === 0}>
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown className="size-4 shrink-0 text-ink-soft transition-transform duration-200 group-open:rotate-180" aria-hidden />
          </summary>
          <p className="-mt-1 pb-5 text-sm leading-relaxed text-ink-soft">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// Yayındaki yorumlar
// ------------------------------------------------------------
export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`5 üzerinden ${rating} puan`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn("size-3.5", index < rating ? "fill-amber text-amber" : "fill-line text-line")}
        />
      ))}
    </span>
  );
}

export function ReviewList({ reviews, showProgram = true, className }: { reviews: PublicReview[]; showProgram?: boolean; className?: string }) {
  if (reviews.length === 0) return null;
  return (
    <ul className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {reviews.map((review) => (
        <li key={review.id}>
          <figure className="flex h-full flex-col rounded-2xl border border-line bg-paper p-5 shadow-card sm:p-6">
            <Stars rating={review.rating} />
            <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">“{review.comment}”</blockquote>
            <figcaption className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-4 text-sm">
              <span className="font-semibold text-ink">{review.author}</span>
              <span className="text-xs text-ink-soft">
                {showProgram && review.program_title ? `${review.program_title} · ` : ""}
                <span className="tabular font-mono">{formatDateShort(review.created_at)}</span>
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

// ------------------------------------------------------------
// Güven şeridi: kurumun kendi beyan ettiği rakamlar, sakin bir satırda
// ------------------------------------------------------------
const trustItems = [
  { value: "15+", label: "yıl eğitim deneyimi" },
  { value: "10.000+", label: "katılımcı" },
  { value: "150+", label: "kurumsal iş birliği" },
];

export function TrustStrip({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-soft", className)}>
      {trustItems.map((item) => (
        <li key={item.label} className="flex items-baseline gap-2">
          <span className="tabular font-mono text-base font-medium text-ink">{item.value}</span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

// ------------------------------------------------------------
// Onay işaretli liste
// ------------------------------------------------------------
export function Checklist({ items, className, columns = 1 }: { items: string[]; className?: string; columns?: 1 | 2 }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("grid gap-3", columns === 2 && "sm:grid-cols-2", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Check className="size-3" strokeWidth={3} aria-hidden />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ------------------------------------------------------------
// Kapanış çağrısı (açık zeminli; koyu kart sayfanın asıl odağına ayrılır)
// ------------------------------------------------------------
export function CtaBand({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card variant="muted" padding="lg" className={cn("overflow-hidden sm:p-12", className)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
          <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-balance sm:text-4xl">{title}</h2>
          {description && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft sm:text-base">{description}</p>}
        </div>
        {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
      </div>
    </Card>
  );
}

// ------------------------------------------------------------
// Yapısal veri (JSON-LD)
// ------------------------------------------------------------
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // </script> kaçışı: içerik yönetici metni içerebilir
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
