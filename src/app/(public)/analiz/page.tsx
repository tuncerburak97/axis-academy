// src/app/(public)/analiz/page.tsx — Analiz hizmeti: BentoGrid + FeatureCard bileşenleri
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BarChart3, BookOpenCheck, LineChart, Microscope } from "lucide-react";
import { PageIntro } from "@/components/public/page-intro";
import { getContent } from "@/lib/queries/content";
import { defaultAnalysisIntro, type ServiceIntroContent } from "@/lib/types/content";
import { siteImages } from "@/lib/images";
import { Reveal } from "@/components/public/motion-primitives";
import { BentoCell, BentoGrid, FeatureCard } from "@/components/public/marketing";

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
      <section className="mx-auto max-w-6xl px-3 py-16 sm:px-6">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <Reveal>
            <p className="max-w-2xl whitespace-pre-wrap text-ink-soft">{intro.body}</p>
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
        </div>

        <BentoGrid className="mt-12">
          {highlights.map((item, index) => (
            <BentoCell key={item.title} delay={index * 0.1}>
              <FeatureCard icon={item.icon} title={item.title} description={item.description} variant="compact" />
            </BentoCell>
          ))}
        </BentoGrid>
      </section>
    </>
  );
}
