// src/app/(public)/analiz/page.tsx — Analiz hizmeti tanıtımı: görselli, ikonlu, animasyonlu
// (metinler site_content'ten)
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BarChart3, BookOpenCheck, LineChart, Microscope } from "lucide-react";
import { PageIntro } from "@/components/public/page-intro";
import { getContent } from "@/lib/queries/content";
import { defaultAnalysisIntro, type ServiceIntroContent } from "@/lib/types/content";
import { siteImages } from "@/lib/images";
import { Reveal } from "@/components/public/motion-primitives";

export const metadata: Metadata = { title: "Analiz" };

const highlights = [
  { icon: Microscope, title: "Bibliyometrik analiz", description: "Literatür haritalama, atıf ve yazar ağları, tema analizi." },
  { icon: LineChart, title: "İstatistiksel analiz", description: "Doğru yöntem seçimi, model kurulumu ve sonuçların yorumu." },
  { icon: BookOpenCheck, title: "Yayına hazır raporlama", description: "Bulgular tablolar ve görsellerle, dergi formatına uygun sunulur." },
];

export default async function AnalysisPage() {
  const intro = await getContent<ServiceIntroContent>("analysis", "intro", defaultAnalysisIntro);

  return (
    <>
      <PageIntro eyebrow="Hizmet" title={intro.title} description={intro.description} />
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
        <Reveal>
          <p className="max-w-2xl whitespace-pre-wrap text-ink-soft">{intro.body}</p>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="rounded-lg bg-accent-soft p-2.5 text-accent">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-display font-semibold">{item.title}</p>
                  <p className="text-sm text-ink-soft">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/kayit"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-md active:scale-[0.98]"
          >
            <BarChart3 className="size-4" aria-hidden /> Kayıt Ol ve Talep Oluştur
          </Link>
        </Reveal>
        <Reveal delay={0.15} className="hidden md:block">
          <Image
            src={siteImages.analysis}
            alt="Grafiklerle dolu analiz ekranı"
            width={640}
            height={460}
            className="h-96 w-full rounded-2xl object-cover shadow-lg"
          />
        </Reveal>
      </section>
    </>
  );
}
