// src/components/public/site-footer.tsx — public alt bilgi: kısa tanım, site haritası sütunları, telif
import Link from "next/link";
import { footerNavGroups } from "@/lib/navigation";
import { Logo } from "@/components/public/site-header";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Link href="/" className="text-lg text-ink">
            <Logo />
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Excel, Word ve PowerPoint programları; bibliyometrik ve istatistiksel analiz; tez düzenleme. Fiyat ve tarih önden belli, süreç panelinde.
          </p>
        </div>
        {footerNavGroups.map((group) => (
          <nav key={group.title} aria-label={group.title} className="text-sm">
            <p className="font-semibold text-ink">{group.title}</p>
            <ul className="mt-3 flex flex-col">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-10 items-center text-ink-soft transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Axis Akademi. Tüm hakları saklıdır.</p>
          <p>Ödemeler platform dışında, ekibimizle doğrudan yapılır.</p>
        </div>
      </div>
    </footer>
  );
}
