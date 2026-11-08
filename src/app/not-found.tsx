// src/app/not-found.tsx — eşleşmeyen her adres için 404: public üst menü + alt bilgiyle birlikte
// (public)/not-found.tsx yalnızca o grup içindeki notFound() çağrılarını yakalar; bilinmeyen URL'ler buraya düşer.
import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import PublicNotFound from "./(public)/not-found";

export const metadata: Metadata = { title: "Sayfa bulunamadı", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SiteHeader />
      <main id="icerik" className="flex-1 overflow-x-clip">
        <PublicNotFound />
      </main>
      <SiteFooter />
    </div>
  );
}
