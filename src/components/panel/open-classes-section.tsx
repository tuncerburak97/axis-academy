// src/components/panel/open-classes-section.tsx — modül detay: açık sınıflar üst bölümü (zenginleştirilmiş)
import { CalendarDays } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";
import { UpcomingClassCard } from "@/components/panel/upcoming-class-card";
import { ScheduleRequestForm } from "@/components/panel/schedule-request-form";
import type { OpenClass } from "@/lib/types/catalog";

interface OpenClassesSectionProps {
  moduleId: string;
  openClasses: OpenClass[];
}

export function OpenClassesSection({ moduleId, openClasses }: OpenClassesSectionProps) {
  return (
    <section aria-labelledby="classes-heading">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-accent-soft/60 via-white to-white p-5 shadow-sm sm:p-6">
        <Reveal>
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-accent p-2.5 text-white">
              <CalendarDays className="size-5" aria-hidden />
            </span>
            <div>
              <h2 id="classes-heading" className="font-display text-lg font-semibold sm:text-xl">
                Bu Modülde Açık Sınıflar
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Kontenjanlar sınırlı — yerini şimdi ayırt.
              </p>
            </div>
          </div>
        </Reveal>

        {openClasses.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
            Şu anda kayda açık sınıf yok. Yeni sınıflar açıldığında burada görünecek.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {openClasses.map((openClass, index) => (
              <Reveal key={openClass.id} delay={index * 0.06}>
                <UpcomingClassCard
                  id={openClass.id}
                  title={openClass.title}
                  start_date={openClass.start_date}
                  schedule_note={openClass.schedule_note}
                  duration_hours={openClass.duration_hours}
                  capacity={openClass.capacity}
                  approved_count={openClass.approved_count}
                  my_status={openClass.my_status}
                  module_id={moduleId}
                  variant="detail"
                />
              </Reveal>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs text-ink-soft">
          Katılım istekleri eğitmen onayından sonra kesinleşir; onay durumunu Eğitimlerim sekmesinden izleyebilirsin.
        </p>
      </div>

      <div className="mt-5">
        <ScheduleRequestForm moduleId={moduleId} />
      </div>
    </section>
  );
}
