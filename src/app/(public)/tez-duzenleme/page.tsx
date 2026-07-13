// src/app/(public)/tez-duzenleme/page.tsx — Tez düzenleme: BentoGrid + FeatureCard bileşenleri
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FileCheck2, ListChecks, BookMarked, Ruler } from "lucide-react";
import { PageIntro } from "@/components/public/page-intro";
import { getContent } from "@/lib/queries/content";
import { defaultThesisIntro, type ServiceIntroContent } from "@/lib/types/content";
import { siteImages } from "@/lib/images";
import { Reveal } from "@/components/public/motion-primitives";
import { BentoCell, BentoGrid, FeatureCard } from "@/components/public/marketing";

export const metadata: Metadata = { title: "Tez Düzenleme" };

const highlights = [
  { icon: Ruler, title: "Şablon uyumu", description: "Enstitü kılavuzuna göre sayfa düzeni, başlık ve numaralandırma." },
  { icon: BookMarked, title: "Kaynakça düzeni", description: "APA/IEEE gibi stillere uygun atıf ve kaynakça denetimi." },
  { icon: ListChecks, title: "Son kontrol listesi", description: "Teslim öncesi biçimsel eksiklerin tamamının giderilmesi." },
];

export default async function ThesisEditingPage() {
  const intro = await getContent<ServiceIntroContent>("thesis", "intro", defaultThesisIntro);

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
              <FileCheck2 className="size-4" aria-hidden /> Kayıt Ol ve Talep Oluştur
            </Link>
          </Reveal>
          <Reveal delay={0.15} className="hidden md:block">
            <Image
              src={siteImages.thesis}
              alt="Dolma kalemle yazılmış el yazısı notlar"
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
