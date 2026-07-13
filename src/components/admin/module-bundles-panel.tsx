// src/components/admin/module-bundles-panel.tsx — örnek paketler tablosu + popup CRUD
"use client";

import { Plus } from "lucide-react";
import { createBundle, deleteBundle, updateBundle } from "@/lib/actions/admin-catalog";
import { BundleSyllabusPanel } from "@/components/admin/bundle-syllabus-panel";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { BundleFields } from "@/components/admin/module-catalog-fields";
import { SubmitButton } from "@/components/admin/fields";
import type { BundlePackage, BundleSyllabusWeek } from "@/lib/types/catalog";

interface ModuleBundlesPanelProps {
  moduleId: string;
  bundles: BundlePackage[];
  bundleSyllabi: Record<string, BundleSyllabusWeek[]>;
}

export function ModuleBundlesPanel({ moduleId, bundles, bundleSyllabi }: ModuleBundlesPanelProps) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Public detay sayfasındaki &quot;Paketleri Karşılaştır&quot; bölümünde sergilenen şablonlar ve müfredatları.
        </p>
        <AdminFormDialog
          title="Yeni Örnek Paket"
          triggerLabel="Yeni Paket Ekle"
          triggerIcon={<Plus className="size-4" aria-hidden />}
          triggerVariant="primary"
          size="lg"
        >
          <form action={createBundle} className="space-y-4">
            <input type="hidden" name="module_id" value={moduleId} />
            <BundleFields />
            <SubmitButton>Paket Ekle</SubmitButton>
          </form>
        </AdminFormDialog>
      </div>

      {bundles.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
          Henüz örnek paket yok.
        </p>
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-line bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th scope="col" className="px-4 py-3 font-semibold">Paket</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Fiyat</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Süre</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Durum</th>
                  <th scope="col" className="px-4 py-3 font-semibold"><span className="sr-only">İşlemler</span></th>
                </tr>
              </thead>
              <tbody>
                {bundles.map((bundle) => (
                  <tr key={bundle.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{bundle.title}</td>
                    <td className="px-4 py-3">{bundle.fixed_price.toLocaleString("tr-TR")}₺</td>
                    <td className="px-4 py-3 text-ink-soft">{bundle.duration_hours} saat</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          bundle.is_active ? "bg-green-50 text-green-800" : "bg-surface text-ink-soft"
                        }`}
                      >
                        {bundle.is_active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <BundleSyllabusDialog bundle={bundle} weeks={bundleSyllabi[bundle.id] ?? []} />
                        <BundleEditDialog bundle={bundle} />
                        <ConfirmDeleteButton
                          action={deleteBundle}
                          hiddenFields={[
                            { name: "bundle_id", value: bundle.id },
                            { name: "module_id", value: bundle.module_id },
                          ]}
                          label="Sil"
                          confirmTitle="Örnek paketi sil?"
                          confirmMessage={`"${bundle.title}" kalıcı olarak kaldırılacak.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 md:hidden">
            {bundles.map((bundle) => (
              <article key={bundle.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{bundle.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      bundle.is_active ? "bg-green-50 text-green-800" : "bg-surface text-ink-soft"
                    }`}
                  >
                    {bundle.is_active ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Fiyat</dt>
                    <dd className="font-semibold">{bundle.fixed_price.toLocaleString("tr-TR")}₺</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Süre</dt>
                    <dd>{bundle.duration_hours} saat</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3">
                  <BundleSyllabusDialog bundle={bundle} weeks={bundleSyllabi[bundle.id] ?? []} />
                  <BundleEditDialog bundle={bundle} />
                  <ConfirmDeleteButton
                    action={deleteBundle}
                    hiddenFields={[
                      { name: "bundle_id", value: bundle.id },
                      { name: "module_id", value: bundle.module_id },
                    ]}
                    label="Sil"
                    confirmTitle="Örnek paketi sil?"
                    confirmMessage={`"${bundle.title}" kalıcı olarak kaldırılacak.`}
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

function BundleSyllabusDialog({ bundle, weeks }: { bundle: BundlePackage; weeks: BundleSyllabusWeek[] }) {
  return (
    <AdminFormDialog
      title={`${bundle.title} — Müfredat`}
      triggerLabel="Müfredat"
      triggerVariant="text"
      size="lg"
    >
      <BundleSyllabusPanel bundle={bundle} weeks={weeks} />
    </AdminFormDialog>
  );
}

function BundleEditDialog({ bundle }: { bundle: BundlePackage }) {
  return (
    <AdminFormDialog
      title="Örnek Paketi Düzenle"
      triggerLabel="Düzenle"
      triggerVariant="text"
      size="lg"
    >
      <form action={updateBundle} className="space-y-4">
        <input type="hidden" name="bundle_id" value={bundle.id} />
        <input type="hidden" name="module_id" value={bundle.module_id} />
        <BundleFields bundle={bundle} />
        <SubmitButton>Güncelle</SubmitButton>
      </form>
    </AdminFormDialog>
  );
}
