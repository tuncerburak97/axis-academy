// src/components/ui/badge.tsx — durum/etiket rozeti; renk tek başına anlam taşımasın diye isteğe bağlı nokta
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold leading-none",
  {
    variants: {
      tone: {
        neutral: "bg-surface text-ink-soft ring-1 ring-inset ring-line",
        accent: "bg-accent-soft text-accent-ink",
        amber: "bg-amber-soft text-amber-ink",
        success: "bg-success-soft text-success-ink",
        danger: "bg-danger-soft text-danger-ink",
        info: "bg-info-soft text-info-ink",
        solid: "bg-ink text-white",
        brand: "bg-accent text-white",
      },
      size: {
        sm: "px-2 py-1 text-[11px]",
        md: "px-2.5 py-1.5 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export { badgeVariants };
