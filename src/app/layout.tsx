// src/app/layout.tsx — kök layout; fontları yükler, global metadata ve bildirim (toast) katmanını tanımlar
import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

// Geist: arayüz ve başlıklar · Instrument Serif: yalnızca vurgu kelimeleri · Geist Mono: tarih, saat, fiyat
const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-geist-mono" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Axis Akademi — Analiz, Eğitim ve Tez Düzenleme",
    template: "%s | Axis Akademi",
  },
  description:
    "Bibliyometrik ve istatistiksel analiz, Excel/Word/PowerPoint eğitimleri ve tez düzenleme hizmetleri. Profesyonel, net ve güvenilir.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
