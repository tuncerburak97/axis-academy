// src/components/panel/enrollment-card.tsx — eğitim kartı: program, tarih, program akışı, durum, hafta şeridi
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WeekStrip } from "@/components/ui/progress";
import { formatDate } from "@/lib/format";
import type { EnrollmentView } from "@/lib/queries/member-types";
import { cancelEnrollmentAction } from "@/lib/actions/member";
import { EnrollmentStatusBadge } from "@/components/panel/status-badges";
import { ConfirmAction } from "@/components/panel/confirm-action";

export function EnrollmentCard({ view }: { view: EnrollmentView }) {
  const { cohort, enrollment } = view;
  const href = `/panel/egitimler/${cohort.id}`;
  const isApplication = view.group === "application";
  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={href} className="font-semibold hover:text-accent">
            {view.programTitle}
          </Link>
          {cohort.title !== view.programTitle && <p className="mt-0.5 truncate text-sm text-ink-soft">{cohort.title}</p>}
        </div>
        <EnrollmentStatusBadge status={view.effective} size="sm" />
      </div>

      <dl className="flex flex-col gap-1.5 text-sm text-ink-soft">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Başlangıç</dt>
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          <dd>
            {formatDate(cohort.start_date)} · {cohort.duration_weeks} hafta
          </dd>
        </div>
        {cohort.schedule_note && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Ders günleri</dt>
            <Clock className="size-4 shrink-0" aria-hidden />
            <dd className="truncate">{cohort.schedule_note}</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <dt className="sr-only">Yer</dt>
          <MapPin className="size-4 shrink-0" aria-hidden />
          <dd className="truncate">{cohort.location || "Online"}</dd>
        </div>
      </dl>

      {isApplication ? (
        <div className="mt-auto flex flex-col gap-3">
          <p className="rounded-xl bg-surface px-3 py-2.5 text-sm text-ink-soft">
            {enrollment.status === "waitlisted"
              ? "Dönem dolu; bekleme listesindesin. Yer açılınca sıradaki kişi olarak sana haber vereceğiz."
              : "Başvurun ekibimizde. Onaylandığında e-posta ve panel bildirimi alırsın."}
          </p>
          <div className="flex flex-wrap gap-2">
            <ConfirmAction
              action={cancelEnrollmentAction}
              fields={{ enrollment_id: enrollment.id }}
              trigger="Başvuruyu geri çek"
              triggerSize="sm"
              title="Başvurunu geri çekmek istiyor musun?"
              description={`${view.programTitle} (${formatDate(cohort.start_date)}) başvurun iptal edilir. Kontenjan uygunsa daha sonra tekrar başvurabilirsin.`}
              confirmLabel="Geri çek"
            />
            <Link href={href} className="inline-flex min-h-9 items-center gap-1 px-2 text-[13px] font-semibold text-accent hover:underline">
              Ayrıntılar <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      ) : (
        <Link href={href} className="group mt-auto flex flex-col gap-2">
          <WeekStrip total={view.totalWeeks} current={view.currentWeek} />
          <span className="flex items-center justify-between text-xs text-ink-soft">
            <span>
              {view.group === "completed"
                ? "Tamamlandı"
                : view.currentWeek === 0
                  ? "Henüz başlamadı"
                  : `${Math.min(view.currentWeek, view.totalWeeks)}. hafta / ${view.totalWeeks}`}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:underline">
              Eğitime git <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </span>
        </Link>
      )}
    </Card>
  );
}
