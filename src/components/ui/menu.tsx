// src/components/ui/menu.tsx — açılır menü (Radix DropdownMenu) ve ipucu (Radix Tooltip)
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const Menu = DropdownMenuPrimitive.Root;
export const MenuTrigger = DropdownMenuPrimitive.Trigger;

export function MenuContent({
  className,
  sideOffset = 6,
  align = "end",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-48 rounded-xl border border-line bg-paper p-1.5 shadow-pop data-[state=open]:animate-[pop-in_140ms_var(--ease-out-soft)]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function MenuItem({
  className,
  tone = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { tone?: "default" | "danger" }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex min-h-9 cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-ink-soft",
        tone === "danger"
          ? "text-danger-ink data-[highlighted]:bg-danger-soft [&_svg]:text-danger"
          : "text-ink data-[highlighted]:bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function MenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted", className)}
      {...props}
    />
  );
}

export function MenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn("-mx-1.5 my-1.5 h-px bg-line", className)} {...props} />;
}

/** Kısa açıklama balonu; yalnızca ikon butonlarda ve kısaltmalarda kullan */
export function Tooltip({ content, children }: { content: React.ReactNode; children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className="z-50 max-w-64 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-white shadow-raise data-[state=delayed-open]:animate-[pop-in_120ms_ease-out]"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
