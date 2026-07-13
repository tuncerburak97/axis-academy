// src/components/public/site-header.tsx — public site üst navigasyonu (375px optimize)
import Link from "next/link";
import { publicNavLinks } from "@/lib/navigation";
import { MobileSiteMenu } from "@/components/public/mobile-site-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Link href="/" className="shrink-0 font-display text-base font-bold tracking-tight sm:text-lg">
          Axis<span className="text-accent"> Akademi</span>
        </Link>

        <nav aria-label="Ana menü" className="hidden items-center gap-6 md:flex">
          {publicNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/giris"
            className="hidden min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface sm:inline-flex sm:px-4"
          >
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            className="hidden min-h-11 items-center rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-strong hover:shadow sm:inline-flex sm:px-4"
          >
            Kayıt Ol
          </Link>
          <MobileSiteMenu />
        </div>
      </div>
    </header>
  );
}
