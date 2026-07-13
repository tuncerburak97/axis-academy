// src/lib/images.ts — sitede kullanılan eğitim temalı görseller (Unsplash)
// Tek yerden değiştirilebilir; ileride admin panelden yönetime taşınabilir.
import type { ModuleCategory } from "@/lib/types/catalog";

const unsplash = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const siteImages = {
  // Anasayfa hero: birlikte çalışan öğrenciler
  hero: unsplash("photo-1522202176988-66273c2fd55f", 1400),
  // Hizmet kartları
  analysis: unsplash("photo-1551288049-bebda4e38f71", 800),
  education: unsplash("photo-1523240795612-9a054b0db644", 800),
  thesis: unsplash("photo-1455390582262-044cdead277a", 800),
  // Hakkımızda: ekip ve eğitim sahnesi
  team: unsplash("photo-1521737604893-d14cc237f11d", 1200),
  lecture: unsplash("photo-1524178232363-1fb2b075b655", 1000),
};

// Eğitim kategorisi görselleri (modül kartları ve detay bandı)
export const categoryImages: Record<ModuleCategory, string> = {
  excel: unsplash("photo-1460925895917-afdab827c52f", 1000),
  word: unsplash("photo-1504691342899-4d92b50853e1", 1000),
  powerpoint: unsplash("photo-1517245386807-bb43f82c33c4", 1000),
};

// Kategoriye özel rozet renkleri (Tailwind sınıfları)
export const categoryBadgeClasses: Record<ModuleCategory, string> = {
  excel: "bg-emerald-100 text-emerald-800",
  word: "bg-sky-100 text-sky-800",
  powerpoint: "bg-orange-100 text-orange-800",
};
