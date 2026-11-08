// src/components/ui/tabs.tsx — sekmeler (Radix Tabs); "pill" segment kontrol, "line" sayfa içi sekme
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

type TabsStyle = "pill" | "line";
const TabsStyleContext = React.createContext<TabsStyle>("pill");

export function Tabs({
  tabStyle = "pill",
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & { tabStyle?: TabsStyle }) {
  return (
    <TabsStyleContext.Provider value={tabStyle}>
      <TabsPrimitive.Root className={cn("flex min-w-0 flex-col gap-5", className)} {...props} />
    </TabsStyleContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const style = React.useContext(TabsStyleContext);
  return (
    <TabsPrimitive.List
      className={cn(
        "flex max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        style === "pill" ? "w-fit gap-1 rounded-xl bg-surface p-1 ring-1 ring-inset ring-line" : "gap-1 border-b border-line",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const style = React.useContext(TabsStyleContext);
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50",
        style === "pill"
          ? "rounded-lg px-3.5 data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:shadow-card"
          : "-mb-px min-h-11 border-b-2 border-transparent px-3 data-[state=active]:border-accent data-[state=active]:text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("min-w-0 focus-visible:outline-none", className)} {...props} />;
}
