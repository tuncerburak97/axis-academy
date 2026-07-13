// src/components/public/marketing/feature-card.tsx — ikonlu özellik kartı
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  variant?: "default" | "compact";
}

export function FeatureCard({ icon: Icon, title, description, delay = 0, variant = "default" }: FeatureCardProps) {
  const padding = variant === "compact" ? "p-5" : "p-6";

  return (
    <Reveal delay={delay}>
      <div
        className={`flex h-full flex-col rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${padding}`}
      >
        <span className="inline-flex w-fit rounded-lg bg-accent-soft p-2.5 text-accent">
          <Icon className="size-5" aria-hidden />
        </span>
        <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
      </div>
    </Reveal>
  );
}
