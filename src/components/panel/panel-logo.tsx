// src/components/panel/panel-logo.tsx — "Axis Akademi" yazı logosu (Akademi serif italik indigo)
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PanelLogo({ className }: { className?: string }) {
  return (
    <Link href="/panel" className={cn("inline-flex items-baseline gap-1 text-[17px] font-semibold tracking-tight text-ink", className)}>
      Axis <span className="accent-word text-[1.12em] text-accent">Akademi</span>
      <span className="sr-only">, üye alanı</span>
    </Link>
  );
}
