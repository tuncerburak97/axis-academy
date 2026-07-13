// src/components/ui/sheet.tsx — shadcn Sheet (Radix Dialog, sol drawer)
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-ink/40 transition-opacity data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "left",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-white shadow-xl transition-transform duration-300 ease-in-out data-[state=closed]:duration-200",
          side === "left" &&
            "inset-y-0 left-0 h-full w-[min(20rem,85vw)] border-r border-line data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
          side === "right" &&
            "inset-y-0 right-0 h-full w-[min(20rem,85vw)] border-l border-line data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
          side === "top" &&
            "inset-x-0 top-0 border-b border-line data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
          side === "bottom" &&
            "inset-x-0 bottom-0 border-t border-line data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-soft opacity-70 transition-opacity hover:bg-surface hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent">
          <X className="size-5" aria-hidden />
          <span className="sr-only">Kapat</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("font-display text-lg font-bold tracking-tight text-ink", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-ink-soft", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
