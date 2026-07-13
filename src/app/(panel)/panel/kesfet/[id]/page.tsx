// src/app/(panel)/panel/kesfet/[id]/page.tsx — üye modül detayı:
// fiyat planı matrisi, hazır paketler, kendi modülünü oluştur, açık sınıflar
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Users } from "lucide-react";
import { getActiveBundles, getModuleById } from "@/lib/queries/catalog";
import { getIndividualHourlyPlan, getModuleTopics, getOpenClasses } from "@/lib/queries/member";
import { getModulePlans } from "@/lib/queries/catalog";
import { createBundleRequest, requestEnrollment } from "@/lib/actions/member";
import {
  categoryLabels,
  enrollmentStatusLabels,
  priceUnitLabels,
  trainingTypeLabels,
} from "@/lib/types/catalog";
import { CustomModuleBuilder } from "@/components/panel/custom-module-builder";
import { ScheduleRequestForm } from "@/components/panel/schedule-request-form";
import { StatusBanner } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Modül Detayı" };
export const dynamic = "force-dynamic";

export default async function MemberModuleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const educationModule = await getModuleById(id);
  if (!educationModule || !educationModule.is_active) notFound();

  const [plans, bundles, topics, hourlyPlan, openClasses] = await Promise.all([
    getModulePlans(id),
    getActiveBundles(id),
    getModuleTopics(id),
    getIndividualHourlyPlan(id),
    getOpenClasses(id),
  ]);

  const activePlans = plans.filter((plan) => plan.is_active);

  return (
    <>
      <Link href="/panel/kesfet" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Keşfet
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">{educationModule.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{categoryLabels[educationModule.category]} · {educationModule.description}</p>

      <div className="mt-6">
        <StatusBanner error={error} />
      </div>

      {/* 1. Fiyat planları */}
      <section aria-labelledby="member-plans-heading">
        <h2 id="member-plans-heading" className="font-display text-lg font-semibold">Fiyat Planları</h2>
        {activePlans.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
            Fiyat planları henüz tanımlanmadı.
          </p>
        ) : (
          <>
            {/* Mobil: kart görünümü */}
            <div className="mt-3 space-y-3 md:hidden">
              {activePlans.map((plan) => (
                <article key={plan.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
                  <p className="font-semibold">{trainingTypeLabels[plan.training_type]}</p>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Kişi</dt>
                      <dd>
                        {plan.min_people === plan.max_people ? plan.min_people : `${plan.min_people}-${plan.max_people}`} kişi
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Fiyat</dt>
                      <dd>
                        <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-bold">
                          {plan.price.toLocaleString("tr-TR")}₺ · {priceUnitLabels[plan.unit]}
                        </span>
                      </dd>
                    </div>
                    {plan.note && (
                      <div className="border-t border-line pt-2">
                        <dt className="text-ink-soft">Not</dt>
                        <dd className="mt-1 text-ink-soft">{plan.note}</dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>

            {/* Desktop: tablo */}
            <div className="mt-3 hidden overflow-x-auto rounded-xl border border-line bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                    <th scope="col" className="px-4 py-3 font-semibold">Eğitim Tipi</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Kişi</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Fiyat</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Not</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-medium">{trainingTypeLabels[plan.training_type]}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        {plan.min_people === plan.max_people ? plan.min_people : `${plan.min_people}-${plan.max_people}`} kişi
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-bold">
                          {plan.price.toLocaleString("tr-TR")}₺ · {priceUnitLabels[plan.unit]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{plan.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* 2. Hazır paketler */}
      <section aria-labelledby="member-bundles-heading" className="mt-10">
        <h2 id="member-bundles-heading" className="font-display text-lg font-semibold">Hazır Paketler</h2>
        {bundles.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
            Bu modülde hazır paket bulunmuyor.
          </p>
        ) : (
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-sm">
                <p className="font-display font-semibold">{bundle.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{bundle.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{bundle.duration_hours} saat</span>
                  <span className="rounded-full bg-amber-soft px-2.5 py-0.5 font-bold">
                    {bundle.fixed_price.toLocaleString("tr-TR")}₺
                  </span>
                </div>
                <form action={createBundleRequest} className="mt-auto pt-4">
                  <input type="hidden" name="bundle_id" value={bundle.id} />
                  <input type="hidden" name="module_id" value={educationModule.id} />
                  <button
                    type="submit"
                    className="min-h-11 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
                  >
                    Talep Oluştur
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Kendi modülünü oluştur */}
      <section aria-labelledby="custom-heading" className="mt-10">
        <h2 id="custom-heading" className="font-display text-lg font-semibold">Kendi Modülünü Oluştur</h2>
        <p className="mt-1 text-sm text-ink-soft">
          İhtiyacın olan konuları seç; tahmini süre otomatik hesaplanır, istersen değiştir.
        </p>
        <div className="mt-3">
          <CustomModuleBuilder moduleId={educationModule.id} topics={topics} hourlyRate={hourlyPlan?.price ?? null} />
        </div>
      </section>

      {/* 4. Açık sınıflar */}
      <section aria-labelledby="classes-heading" className="mt-10">
        <h2 id="classes-heading" className="font-display text-lg font-semibold">Açık Sınıflar</h2>
        {openClasses.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
            Şu anda kayda açık sınıf yok. Yeni sınıflar açıldığında burada görünecek.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {openClasses.map((openClass) => {
              const remaining = Math.max(0, openClass.capacity - openClass.approved_count);
              return (
                <div key={openClass.id} className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div>
                    <p className="font-display font-semibold">{openClass.title}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-ink-soft">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {new Date(openClass.start_date).toLocaleDateString("tr-TR")}
                        {openClass.schedule_note && ` · ${openClass.schedule_note}`}
                      </span>
                      <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{openClass.duration_hours} saat</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden />
                        {remaining > 0 ? `${remaining} kontenjan kaldı` : "Kontenjan doldu"}
                      </span>
                    </div>
                  </div>
                  {openClass.my_status ? (
                    <span className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent">
                      {enrollmentStatusLabels[openClass.my_status]}
                    </span>
                  ) : (
                    <form action={requestEnrollment}>
                      <input type="hidden" name="class_id" value={openClass.id} />
                      <input type="hidden" name="module_id" value={educationModule.id} />
                      <button
                        type="submit"
                        disabled={remaining === 0}
                        className="min-h-11 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        Katılım İsteği Gönder
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-3 text-xs text-ink-soft">
          Katılım istekleri eğitmen onayından sonra kesinleşir; onay durumunu Eğitimlerim sekmesinden izleyebilirsin.
        </p>
        <div className="mt-5">
          <ScheduleRequestForm moduleId={educationModule.id} />
        </div>
      </section>
    </>
  );
}
