// src/components/ui/button.tsx — Axis 2.0 buton (Radix Slot + CVA)
// Kural: bir ekranda tek "primary" buton olur; diğer aksiyonlar secondary/outline/ghost.
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white shadow-[0_1px_0_rgb(255_255_255/0.15)_inset,0_1px_2px_rgb(14_26_43/0.2)] hover:bg-accent-strong",
        secondary: "bg-ink text-white hover:bg-ink-raised",
        outline: "border border-line-strong bg-paper text-ink hover:border-ink-muted hover:bg-surface",
        ghost: "text-ink hover:bg-surface",
        soft: "bg-accent-soft text-accent-ink hover:bg-[#e0e7ff]",
        danger: "bg-danger text-white hover:bg-danger-ink",
        link: "h-auto min-h-0 rounded-md px-0 text-accent underline-offset-4 hover:underline",
        // Eski kullanım uyumluluğu
        default: "bg-accent text-white hover:bg-accent-strong",
      },
      size: {
        sm: "min-h-9 px-3 text-[13px]",
        md: "min-h-11 px-4 text-sm",
        lg: "min-h-12 px-5 text-[15px]",
        icon: "size-11 shrink-0 p-0",
        "icon-sm": "size-9 shrink-0 p-0",
        // Eski kullanım uyumluluğu
        default: "min-h-11 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Sunucu işlemi sürerken dönen ikon gösterir ve butonu kilitler */
  loading?: boolean;
}

function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
