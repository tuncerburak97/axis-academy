// src/app/(panel)/panel/kesfet/[id]/page.tsx — üye modül detayı:
// açık sınıflar, hazır paketler, fiyat planları, kendi modülünü oluştur
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { getActiveBundles, getModuleById, getModulePlans } from "@/lib/queries/catalog";
import { getIndividualHourlyPlan, getModuleTopics, getOpenClasses } from "@/lib/queries/member";
import { createBundleRequest } from "@/lib/actions/member";
import {
  categoryLabels,
  priceUnitLabels,
  trainingTypeLabels,
} from "@/lib/types/catalog";
import { CustomModuleBuilder } from "@/components/panel/custom-module-builder";
import { OpenClassesSection } from "@/components/panel/open-classes-section";
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

      {/* 1. Açık sınıflar */}
      <div className="mt-8">
        <OpenClassesSection moduleId={educationModule.id} openClasses={openClasses} />
      </div>

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

      {/* 3. Fiyat planları */}
      <section aria-labelledby="member-plans-heading" className="mt-10">
        <h2 id="member-plans-heading" className="font-display text-lg font-semibold">Fiyat Planları</h2>
        {activePlans.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
            Fiyat planları henüz tanımlanmadı.
          </p>
        ) : (
          <>
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

      {/* 4. Kendi modülünü oluştur */}
      <section aria-labelledby="custom-heading" className="mt-10">
        <h2 id="custom-heading" className="font-display text-lg font-semibold">Kendi Modülünü Oluştur</h2>
        <p className="mt-1 text-sm text-ink-soft">
          İhtiyacın olan konuları seç; tahmini süre otomatik hesaplanır, istersen değiştir.
        </p>
        <div className="mt-3">
          <CustomModuleBuilder moduleId={educationModule.id} topics={topics} hourlyRate={hourlyPlan?.price ?? null} />
        </div>
      </section>
    </>
  );
}
