// src/components/admin/url-tabs.tsx — seçili sekmeyi ?tab= parametresinde tutan Tabs sarmalayıcısı (yenilemede korunur)
"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";

export function UrlTabs({
  defaultValue,
  children,
  tabStyle = "line",
  className,
}: {
  defaultValue: string;
  children: React.ReactNode;
  tabStyle?: "pill" | "line";
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <Tabs
      tabStyle={tabStyle}
      className={className}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", next);
        window.history.replaceState(window.history.state, "", url.toString());
      }}
    >
      {children}
    </Tabs>
  );
}
