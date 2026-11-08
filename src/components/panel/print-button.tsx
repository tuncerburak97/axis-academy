// src/components/panel/print-button.tsx — tarayıcının yazdır / PDF olarak kaydet penceresini açar
"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Yazdır / PDF indir" }: { label?: string }) {
  return (
    <Button type="button" onClick={() => window.print()}>
      <Printer aria-hidden /> {label}
    </Button>
  );
}
