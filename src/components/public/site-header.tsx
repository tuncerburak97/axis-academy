// src/components/public/site-header.tsx — public site üst navigasyonu (sticky, yarı saydam)
import Link from "next/link";

const navLinks = [
  { href: "/analiz", label: "Analiz" },
  { href: "/egitim", label: "Eğitim" },
  { href: "/tez-duzenleme", label: "Tez Düzenleme" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Geçici tipografik logo — ileride görsel logo ile değiştirilecek */}
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Axis<span className="text-accent"> Akademi</span>
        </Link>

        <nav aria-label="Ana menü" className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/giris"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface"
          >
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-strong hover:shadow"
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    </header>
  );
}
