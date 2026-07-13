// src/app/(panel)/panel/page.tsx — "Eğitimlerim": aktif bireysel talepler ve sınıf kayıtları,
// her kartta 4 adımlı ilerleme stepper'ı ve admin ilerleme notu
import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, CalendarDays } from "lucide-react";
import { getMyEnrollments, getMyIndividualRequests } from "@/lib/queries/member";
import { requestTypeLabels } from "@/lib/types/catalog";
import type { EnrollmentStatus, RequestStatus } from "@/lib/types/catalog";
import { ProgressStepper } from "@/components/panel/progress-stepper";
import { StatusBanner } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Eğitimlerim" };
export const dynamic = "force-dynamic";

const requestSteps = ["Talep Alındı", "Planlandı", "Devam Ediyor", "Tamamlandı"];
const requestStepIndex: Record<RequestStatus, number> = {
  received: 0,
  planned: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1,
};

const enrollmentSteps = ["Onay Bekliyor", "Kayıtlı", "Devam Ediyor", "Tamamlandı"];
const enrollmentStepIndex: Record<EnrollmentStatus, number> = {
  pending: 0,
  enrolled: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1,
};

export default async function MyTrainingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const [requests, enrollments] = await Promise.all([getMyIndividualRequests(), getMyEnrollments()]);

  const activeRequests = requests.filter((request) => !["completed", "cancelled"].includes(request.status));
  const activeEnrollments = enrollments.filter((enrollment) => !["completed", "cancelled"].includes(enrollment.status));
  const hasActive = activeRequests.length > 0 || activeEnrollments.length > 0;

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Eğitimlerim</h1>
      <p className="mt-1 text-sm text-ink-soft">Devam eden eğitimlerin ve sınıf kayıtların.</p>

      <div className="mt-6">
        <StatusBanner saved={saved} />
      </div>

      {!hasActive && (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center">
          <span className="rounded-xl bg-accent-soft p-4 text-accent">
            <GraduationCap className="size-8" aria-hidden />
          </span>
          <p className="mt-4 font-display text-lg font-semibold">Henüz aktif bir eğitimin yok</p>
          <p className="mt-1 max-w-sm text-sm text-ink-soft">
            Hazır paketleri, açık sınıfları incele ya da kendi modülünü oluştur.
          </p>
          <Link
            href="/panel/kesfet"
            className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Eğitimleri Keşfet
          </Link>
        </div>
      )}

      {activeRequests.length > 0 && (
        <section aria-labelledby="my-requests-heading" className="mt-4">
          <h2 id="my-requests-heading" className="font-display text-lg font-semibold">Bireysel Eğitimler</h2>
          <div className="mt-3 space-y-4">
            {activeRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display font-semibold">
                      {request.education_modules?.title}
                      <span className="text-ink-soft">
                        {" · "}
                        {request.request_type === "bundle" && request.bundle_packages?.title
                          ? request.bundle_packages.title
                          : requestTypeLabels[request.request_type]}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {new Date(request.created_at).toLocaleDateString("tr-TR")}
                      {request.total_hours ? ` · ${request.total_hours} saat` : ""}
                    </p>
                  </div>
                  {request.request_type !== "schedule" && (
                    <span className="rounded-full bg-amber-soft px-3 py-1 text-sm font-bold">
                      {request.calculated_price.toLocaleString("tr-TR")}₺
                    </span>
                  )}
                </div>
                <div className="mt-5 max-w-xl">
                  <ProgressStepper steps={requestSteps} currentIndex={requestStepIndex[request.status]} />
                </div>
                {request.progress_note && (
                  <p className="mt-4 rounded-lg bg-surface px-3 py-2.5 text-sm text-ink-soft">
                    <span className="font-semibold text-ink">Eğitmen notu: </span>
                    {request.progress_note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeEnrollments.length > 0 && (
        <section aria-labelledby="my-enrollments-heading" className="mt-8">
          <h2 id="my-enrollments-heading" className="font-display text-lg font-semibold">Sınıf Kayıtları</h2>
          <div className="mt-3 space-y-4">
            {activeEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display font-semibold">{enrollment.classes?.title}</p>
                  {enrollment.classes && (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {new Date(enrollment.classes.start_date).toLocaleDateString("tr-TR")}
                      {enrollment.classes.schedule_note && ` · ${enrollment.classes.schedule_note}`}
                    </span>
                  )}
                </div>
                <div className="mt-5 max-w-xl">
                  <ProgressStepper steps={enrollmentSteps} currentIndex={enrollmentStepIndex[enrollment.status]} />
                </div>
                {enrollment.status !== "pending" && (
                  <Link
                    href={`/panel/sinif/${enrollment.class_id}`}
                    className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
                  >
                    Eğitim İçeriğine Git
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
