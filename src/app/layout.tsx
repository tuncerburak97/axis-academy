// src/app/layout.tsx — kök layout; fontları yükler, global metadata ve bildirim (toast) katmanını tanımlar
import type { Metadata, Viewport } from "next";
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
  // OG/Twitter görsel URL'leri bu kökle mutlak hale gelir; öncelik sırası lib/queries/public-seo.ts → siteUrl() ile aynı
  metadataBase: new URL(process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://axisakademi.com"),
  title: {
    default: "Axis Akademi — Analiz, Eğitim ve Tez Düzenleme",
    template: "%s | Axis Akademi",
  },
  description:
    "Bibliyometrik ve istatistiksel analiz, Excel/Word/PowerPoint eğitimleri ve tez düzenleme hizmetleri. Profesyonel, net ve güvenilir.",
  // Görseller app/opengraph-image.tsx ve app/twitter-image.tsx dosya kuralıyla otomatik eklenir
  openGraph: { siteName: "Axis Akademi", locale: "tr_TR", type: "website" },
  twitter: { card: "summary_large_image" },
};

// viewport-fit=cover: mobil alt sekme çubuğu güvenli alan boşluklarını (env(safe-area-inset-*)) kullanabilsin
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };

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
