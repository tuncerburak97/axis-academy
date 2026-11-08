// src/components/ui/page-header.tsx — sayfa ve bölüm başlıkları; başlıkta tek vurgu kelimesi serif italik olabilir
import * as React from "react";
import { cn } from "@/lib/utils";

/** Başlık içinde vurgulanacak kelime: <Accent>platforma</Accent> */
export function Accent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("accent-word text-[1.06em] text-accent", className)}>{children}</span>;
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft", className)} {...props} />
  );
}

/** Uygulama sayfası başlığı (panel ve admin): başlık, açıklama, sağda aksiyonlar */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-balance sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Sayfa içindeki bölüm başlığı */
export function SectionHeading({
  title,
  description,
  action,
  className,
  as: Heading = "h2",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <Heading className="text-lg font-semibold tracking-tight">{title}</Heading>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
