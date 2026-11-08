// src/components/public/site-footer.tsx — public alt bilgi (koyu): marka, site haritası, belge doğrulama, büyük işaret yazısı
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { footerNavGroups } from "@/lib/navigation";
import { Logo } from "@/components/public/site-header";

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-ink text-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 pb-6 pt-16 sm:px-6 md:grid-cols-[1.3fr_repeat(3,1fr)] md:gap-12">
        <div className="col-span-2 max-w-xs md:col-span-1">
          <Link href="/" className="text-lg text-white" aria-label="Axis Akademi anasayfa">
            <Logo tone="dark" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Excel, Word ve PowerPoint programları; bibliyometrik ve istatistiksel analiz; tez düzenleme. Fiyat ve tarih önden belli, süreç panelinde.
          </p>
          <Link
            href="/sertifika"
            className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full bg-white/[0.06] px-3.5 text-[13px] font-semibold text-white/80 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ShieldCheck className="size-4 text-[#86efac]" aria-hidden />
            Belge doğrula
          </Link>
        </div>
        {footerNavGroups.map((group) => (
          <nav key={group.title} aria-label={group.title} className="text-sm">
            <p className="font-semibold text-white">{group.title}</p>
            <ul className="mt-3 flex flex-col">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-10 items-center text-white/55 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* büyük işaret yazısı: yalnızca süs */}
      <p
        aria-hidden
        className="pointer-events-none mx-auto max-w-6xl select-none px-4 text-center bg-gradient-to-b from-white/[0.11] to-white/0 bg-clip-text pb-2 text-[17vw] font-semibold leading-[0.85] tracking-[-0.06em] text-transparent sm:px-6 lg:text-[196px]"
      >
        Axis<span className="accent-word tracking-[-0.03em]">Akademi</span>
      </p>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Axis Akademi. Tüm hakları saklıdır.</p>
          <p>Ödemeler platform dışında, ekibimizle doğrudan yapılır.</p>
        </div>
      </div>
    </footer>
  );
}
