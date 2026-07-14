// src/components/public/value-proposition-section.tsx — ana sayfa: kimler için / ne kazanırsın görsel blok
import Image from "next/image";
import { Award, Briefcase, GraduationCap, LineChart, Target, Users } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";
import { siteImages } from "@/lib/images";

const audiences = [
  {
    icon: GraduationCap,
    title: "Lisansüstü öğrenciler",
    description: "Tez, makale ve araştırma süreçlerinde teknik destek.",
  },
  {
    icon: Briefcase,
    title: "Akademisyenler",
    description: "Analiz, yazım ve ofis araçlarında zaman kazandıran çözümler.",
  },
  {
    icon: Users,
    title: "Kurum çalışanları",
    description: "Excel, Word ve PowerPoint'te işe dönük eğitimler.",
  },
];

const outcomes = [
  {
    icon: LineChart,
    title: "Analiz raporu hazır",
    description: "Bibliyometrik ve istatistiksel çıktılarınız uzman ekiple tamamlanır.",
  },
  {
    icon: Award,
    title: "Sertifikalı eğitim",
    description: "Katıldığınız programları belgeleyin, CV'nize ekleyin.",
  },
  {
    icon: Target,
    title: "Ertesi gün işinde kullan",
    description: "Uygulamalı modüllerle öğrendiğinizi hemen sahada deneyin.",
  },
];

export function ValuePropositionSection() {
  return (
    <section aria-labelledby="value-prop-heading" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <Reveal>
          <h2 id="value-prop-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Kimler için, ne kazanırsın?
          </h2>
          <p className="mt-2 max-w-lg text-ink-soft">
            Akademik ve kurumsal yolculuğunun her aşamasında net, somut destek.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <Reveal>
              <h3 className="font-display text-lg font-semibold">Kimler için?</h3>
            </Reveal>
            <ul className="mt-5 space-y-4">
              {audiences.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.08}>
                  <li className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <span className="rounded-xl bg-accent-soft p-3 text-accent">
                      <item.icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-display font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.description}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <div>
            <Reveal delay={0.1}>
              <h3 className="font-display text-lg font-semibold">Ne kazanırsın?</h3>
            </Reveal>
            <div className="relative mt-5 overflow-hidden rounded-2xl">
              <Image
                src={siteImages.lecture}
                alt="Eğitim ortamında çalışan katılımcılar"
                width={600}
                height={400}
                className="h-48 w-full object-cover lg:h-full lg:min-h-[280px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" aria-hidden />
              <ul className="absolute inset-x-0 bottom-0 space-y-3 p-5">
                {outcomes.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl bg-white/95 p-4 shadow-sm backdrop-blur-sm"
                  >
                    <span className="rounded-lg bg-amber-soft p-2 text-amber-900">
                      <item.icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
