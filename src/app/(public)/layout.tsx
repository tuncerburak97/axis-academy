// src/app/(public)/layout.tsx — public route grubu: üst menü + içerik + alt bilgi
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        İçeriğe geç
      </a>
      <SiteHeader />
      <main id="icerik" className="flex-1 overflow-x-clip">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
