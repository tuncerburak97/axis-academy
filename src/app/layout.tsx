// src/app/layout.tsx — kök layout; fontları yükler ve global metadata tanımlar
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

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
    <html lang="tr" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
