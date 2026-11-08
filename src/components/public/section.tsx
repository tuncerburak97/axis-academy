// src/components/public/section.tsx — public sayfa iskeleti: kapsayıcı, bölüm başlığı, sayfa girişi, vurgulu başlık
import * as React from "react";
import { Accent, Eyebrow } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}

/**
 * Yönetici metnindeki tek vurgu kelimesini serif italik gösterir.
 * "*kelime*" işareti varsa o kısım, yoksa son kelime vurgulanır (başlık başına en fazla bir vurgu).
 */
export function AccentTitle({ text, auto = true }: { text: string; auto?: boolean }) {
  const marked = text.match(/^([\s\S]*?)\*([^*]+)\*([\s\S]*)$/);
  if (marked) {
    return (
      <>
        {marked[1]}
        <Accent>{marked[2]}</Accent>
        {marked[3].replace(/\*/g, "")}
      </>
    );
  }
  if (!auto) return <>{text}</>;
  const match = text.trim().match(/^([\s\S]*\s)(\S+?)([.!?…]*)$/);
  if (!match) return <>{text}</>;
  return (
    <>
      {match[1]}
      <Accent>{match[2]}</Accent>
      {match[3]}
    </>
  );
}

/** Pazarlama bölümü başlığı: küçük üst etiket, büyük başlık, kısa açıklama, sağda isteğe bağlı aksiyon */
export function SectionIntro({
  eyebrow,
  title,
  description,
  action,
  className,
  id,
  align = "left",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  id?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("min-w-0 max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h2 id={id} className="text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-balance sm:text-4xl">
          {title}
        </h2>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft sm:text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** İç sayfa girişi: başlık, açıklama ve isteğe bağlı sağ sütun */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden border-b border-line bg-canvas", className)}>
      <div aria-hidden className="bg-grid-light absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_70%_90%_at_85%_0%,black,transparent)]" />
      <div aria-hidden className="glow-indigo absolute -right-48 -top-48 -z-10 size-[620px] opacity-30" />
      <Container className={cn("grid gap-10 py-12 sm:py-16 lg:py-20", aside && "lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end")}>
        <div className="min-w-0">
          {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
          <h1 className="text-[36px] font-semibold leading-[1.03] tracking-[-0.04em] text-balance sm:text-[56px]">{title}</h1>
          {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">{description}</p>}
          {children && <div className="mt-7">{children}</div>}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </Container>
    </section>
  );
}

/** Bölüm dikey boşluğu */
export function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-16 sm:py-24", className)} {...props} />;
}
