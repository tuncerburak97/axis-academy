// src/components/public/site-footer.tsx — public site alt bilgi alanı
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">
            Axis<span className="text-accent"> Akademi</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Analiz, eğitim ve tez düzenleme hizmetlerinde net, profesyonel ve güvenilir çözüm ortağınız.
          </p>
        </div>
        <nav aria-label="Hizmetler" className="text-sm">
          <p className="font-semibold">Hizmetler</p>
          <ul className="mt-3 space-y-1 text-ink-soft">
            <li><Link className="inline-flex min-h-11 items-center hover:text-ink" href="/analiz">Bibliyometrik &amp; İstatistiksel Analiz</Link></li>
            <li><Link className="inline-flex min-h-11 items-center hover:text-ink" href="/egitim">Excel / Word / PowerPoint Eğitimleri</Link></li>
            <li><Link className="inline-flex min-h-11 items-center hover:text-ink" href="/tez-duzenleme">Tez Düzenleme</Link></li>
          </ul>
        </nav>
        <nav aria-label="Kurumsal" className="text-sm">
          <p className="font-semibold">Kurumsal</p>
          <ul className="mt-3 space-y-1 text-ink-soft">
            <li><Link className="inline-flex min-h-11 items-center hover:text-ink" href="/hakkimizda">Hakkımızda</Link></li>
            <li><Link className="inline-flex min-h-11 items-center hover:text-ink" href="/sss">Sıkça Sorulan Sorular</Link></li>
            <li><Link className="inline-flex min-h-11 items-center hover:text-ink" href="/iletisim">İletişim</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} Axis Akademi. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
