// src/components/panel/upcoming-classes-hero.tsx — Keşfet ana sayfa: yaklaşan eğitimler hero bandı
import { Flame } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";
import { UpcomingClassCard } from "@/components/panel/upcoming-class-card";
import type { MemberUpcomingClass } from "@/lib/types/catalog";

interface UpcomingClassesHeroProps {
  classes: MemberUpcomingClass[];
}

export function UpcomingClassesHero({ classes }: UpcomingClassesHeroProps) {
  if (classes.length === 0) {
    return (
      <section
        aria-label="Yaklaşan eğitimler"
        className="mb-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-5"
      >
        <p className="text-sm text-ink-soft">
          Şu an kayda açık sınıf yok. Modüllere göz at veya uygun tarih için talep oluştur.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="upcoming-hero-heading"
      className="relative -mx-3 mb-10 overflow-hidden rounded-2xl border border-line bg-surface px-4 py-8 sm:mx-0 sm:px-8"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-accent-soft),transparent_55%)]"
        aria-hidden
      />

      <Reveal>
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <Flame className="size-3.5" aria-hidden />
            Yaklaşan Eğitimler
          </p>
          <h2 id="upcoming-hero-heading" className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Kontenjanlar dolmadan yerini ayırt
          </h2>
          <p className="mt-2 max-w-lg text-sm text-ink-soft">
            Takvimi belli programlar — hemen katılım isteği gönder, eğitimine başla.
          </p>
        </div>
      </Reveal>

      <div className="relative mt-6 flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
        {classes.map((trainingClass, index) => (
          <Reveal
            key={trainingClass.id}
            delay={index * 0.08}
            className="w-[min(100%,320px)] shrink-0 snap-start md:w-auto"
          >
            <UpcomingClassCard
              id={trainingClass.id}
              title={trainingClass.title}
              start_date={trainingClass.start_date}
              schedule_note={trainingClass.schedule_note}
              duration_hours={trainingClass.duration_hours}
              capacity={trainingClass.capacity}
              approved_count={trainingClass.approved_count}
              my_status={trainingClass.my_status}
              module_id={trainingClass.module_id}
              module_title={trainingClass.module_title}
              module_category={trainingClass.module_category}
              variant="hero"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
