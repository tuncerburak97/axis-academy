// src/components/public/marketing/bento-grid.tsx — asimetrik pazarlama grid düzeni
import { Reveal } from "@/components/public/motion-primitives";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 ${className}`}>
      {children}
    </div>
  );
}

interface BentoCellProps {
  children: React.ReactNode;
  span?: "default" | "wide" | "tall";
  delay?: number;
}

export function BentoCell({ children, span = "default", delay = 0 }: BentoCellProps) {
  const spanClass =
    span === "wide" ? "sm:col-span-2" : span === "tall" ? "row-span-2" : "";

  return (
    <Reveal delay={delay} className={spanClass}>
      {children}
    </Reveal>
  );
}
