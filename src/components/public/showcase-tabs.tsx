// src/components/public/showcase-tabs.tsx — koyu vitrin bölümündeki sekmeler (Radix Tabs)
// İçerik sunucuda çizilir ve buraya hazır düğüm olarak gelir; bu bileşen yalnızca sekme geçişini yönetir.
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export interface ShowcaseTab {
  value: string;
  label: string;
  hint: string;
  content: React.ReactNode;
}

export function ShowcaseTabs({ tabs, className }: { tabs: ShowcaseTab[]; className?: string }) {
  return (
    <TabsPrimitive.Root defaultValue={tabs[0]?.value} className={cn("flex min-w-0 flex-col", className)}>
      <TabsPrimitive.List
        aria-label="Örnek çıktılar"
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
      >
        {tabs.map((tab, index) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className="group relative flex min-h-16 items-center gap-3.5 overflow-hidden rounded-2xl px-4 py-3 text-left ring-1 ring-inset ring-white/10 transition-[background-color,box-shadow] hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-glow data-[state=active]:bg-white/[0.07] data-[state=active]:ring-white/20"
          >
            <span className="tabular font-mono text-xs text-white/40 transition-colors group-data-[state=active]:text-accent-glow">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-white/70 transition-colors group-data-[state=active]:text-white">{tab.label}</span>
              <span className="mt-0.5 block truncate text-xs text-white/45">{tab.hint}</span>
            </span>
            <span
              aria-hidden
              className="absolute inset-x-4 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-accent-glow to-transparent transition-transform duration-500 group-data-[state=active]:scale-x-100"
            />
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.value}
          value={tab.value}
          className="mt-10 min-w-0 focus-visible:outline-none data-[state=active]:animate-[pop-in_0.45s_var(--ease-out-soft)]"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
