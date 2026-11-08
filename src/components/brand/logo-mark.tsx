// src/components/brand/logo-mark.tsx — Axis işareti: eksen + yükselen veri çizgisi + amber "içgörü" noktası
// Aynı geometri favicon (app/icon.svg), apple-icon ve OG görselinde kullanılır; değiştirirsen orada da güncelle.
import { cn } from "@/lib/utils";

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="9" fill="#0e1a2b" />
      <path d="M9 7.5V23h15.5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 18.5l4-4 3 2 4.5-6.5" fill="none" stroke="#a5b4fc" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="10" r="2.6" fill="#f59e0b" />
    </svg>
  );
}
