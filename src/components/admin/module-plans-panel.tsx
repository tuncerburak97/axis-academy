// src/components/admin/module-plans-panel.tsx — fiyat planları tablosu + popup CRUD
"use client";

import { Plus } from "lucide-react";
import { createPlan, deletePlan, updatePlan } from "@/lib/actions/admin-catalog";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { PlanFields } from "@/components/admin/module-catalog-fields";
import { SubmitButton } from "@/components/admin/fields";
import { priceUnitLabels, trainingTypeLabels } from "@/lib/types/catalog";
import type { PricingPlan } from "@/lib/types/catalog";

interface ModulePlansPanelProps {
  moduleId: string;
  plans: PricingPlan[];
}

export function ModulePlansPanel({ moduleId, plans }: ModulePlansPanelProps) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Eğitim tipi + kişi aralığı + birim fiyat. Üyeler Keşfet ekranında görür.
        </p>
        <AdminFormDialog
          title="Yeni Fiyat Planı"
          triggerLabel="Yeni Fiyat Ekle"
          triggerIcon={<Plus className="size-4" aria-hidden />}
          triggerVariant="primary"
          size="lg"
        >
          <form action={createPlan} className="space-y-4">
            <input type="hidden" name="module_id" value={moduleId} />
            <PlanFields />
            <SubmitButton>Plan Ekle</SubmitButton>
          </form>
        </AdminFormDialog>
      </div>

      {plans.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
          Henüz fiyat planı yok. Örn. Bireysel · 1-1 kişi · 400₺ · Saatlik.
        </p>
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-line bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th scope="col" className="px-4 py-3 font-semibold">Eğitim tipi</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Kişi</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Fiyat</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Birim</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Durum</th>
                  <th scope="col" className="px-4 py-3 font-semibold"><span className="sr-only">İşlemler</span></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{trainingTypeLabels[plan.training_type]}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {plan.min_people}-{plan.max_people}
                    </td>
                    <td className="px-4 py-3">{plan.price.toLocaleString("tr-TR")}₺</td>
                    <td className="px-4 py-3 text-ink-soft">{priceUnitLabels[plan.unit]}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          plan.is_active ? "bg-green-50 text-green-800" : "bg-surface text-ink-soft"
                        }`}
                      >
                        {plan.is_active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <PlanEditDialog plan={plan} />
                        <ConfirmDeleteButton
                          action={deletePlan}
                          hiddenFields={[
                            { name: "plan_id", value: plan.id },
                            { name: "module_id", value: plan.module_id },
                          ]}
                          label="Sil"
                          confirmTitle="Fiyat planını sil?"
                          confirmMessage="Bu plan kalıcı olarak kaldırılacak."
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 md:hidden">
            {plans.map((plan) => (
              <article key={plan.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{trainingTypeLabels[plan.training_type]}</p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      plan.is_active ? "bg-green-50 text-green-800" : "bg-surface text-ink-soft"
                    }`}
                  >
                    {plan.is_active ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Kişi</dt>
                    <dd>{plan.min_people}-{plan.max_people}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Fiyat</dt>
                    <dd className="font-semibold">{plan.price.toLocaleString("tr-TR")}₺</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Birim</dt>
                    <dd>{priceUnitLabels[plan.unit]}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
                  <PlanEditDialog plan={plan} />
                  <ConfirmDeleteButton
                    action={deletePlan}
                    hiddenFields={[
                      { name: "plan_id", value: plan.id },
                      { name: "module_id", value: plan.module_id },
                    ]}
                    label="Sil"
                    confirmTitle="Fiyat planını sil?"
                    confirmMessage="Bu plan kalıcı olarak kaldırılacak."
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PlanEditDialog({ plan }: { plan: PricingPlan }) {
  return (
    <AdminFormDialog
      title="Fiyat Planını Düzenle"
      triggerLabel="Düzenle"
      triggerVariant="text"
      size="lg"
    >
      <form action={updatePlan} className="space-y-4">
        <input type="hidden" name="plan_id" value={plan.id} />
        <input type="hidden" name="module_id" value={plan.module_id} />
        <PlanFields plan={plan} />
        <SubmitButton>Güncelle</SubmitButton>
      </form>
    </AdminFormDialog>
  );
}
