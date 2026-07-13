// src/lib/utils.ts — Tailwind sınıf birleştirme yardımcısı (shadcn/ui)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
