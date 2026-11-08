// src/components/ui/card.tsx — kart yüzeyi; "inverse" koyu kart ekranın tek odak noktası için (ör. sıradaki ders)
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("relative min-w-0 rounded-2xl", {
  variants: {
    variant: {
      default: "border border-line bg-paper shadow-card",
      muted: "border border-line bg-surface",
      outline: "border border-dashed border-line-strong bg-transparent",
      inverse: "bg-ink text-white",
      interactive:
        "border border-line bg-paper shadow-card transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raise",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    },
  },
  defaultVariants: { variant: "default", padding: "md" },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-4", className)} {...props} />;
}

/** Küçük, büyük harfli bölüm etiketi ("Sıradaki ders", "Senden beklenenler") */
export function CardEyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold tracking-tight text-balance", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-relaxed text-ink-soft", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-5 flex flex-wrap items-center gap-2", className)} {...props} />;
}

export { cardVariants };
