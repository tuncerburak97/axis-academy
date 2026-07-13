// src/app/(public)/tez-duzenleme/page.tsx — Tez düzenleme tanıtımı: görselli, ikonlu, animasyonlu
// (metinler site_content'ten)
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FileCheck2, ListChecks, BookMarked, Ruler } from "lucide-react";
import { PageIntro } from "@/components/public/page-intro";
import { getContent } from "@/lib/queries/content";
import { defaultThesisIntro, type ServiceIntroContent } from "@/lib/types/content";
import { siteImages } from "@/lib/images";
import { Reveal } from "@/components/public/motion-primitives";

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
      </section>
    </>
  );
}
