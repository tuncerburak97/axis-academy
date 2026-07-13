// src/components/admin/bundle-syllabus-panel.tsx — paket müfredatı CRUD (hibrit: çekirdek / özel)
"use client";

import { Plus } from "lucide-react";
import {
  createBundleSyllabusWeek,
  deleteBundleSyllabusWeek,
  updateBundleSyllabusWeek,
} from "@/lib/actions/admin-catalog";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { NumberInput, SelectField, SubmitButton, TextArea, TextInput } from "@/components/admin/fields";
import { weekKindLabels } from "@/lib/types/catalog";
import type { BundlePackage, BundleSyllabusWeek } from "@/lib/types/catalog";

interface BundleSyllabusPanelProps {
  bundle: BundlePackage;
  weeks: BundleSyllabusWeek[];
}

export function BundleSyllabusPanel({ bundle, weeks }: BundleSyllabusPanelProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        Public sayfada &quot;Paketleri Karşılaştır&quot; bölümünde görünür. Ortak temel haftalar paketler arası tutarlılık sağlar.
      </p>

      <AdminFormDialog
        title={`${bundle.title} — Hafta Ekle`}
        triggerLabel="Hafta Ekle"
        triggerIcon={<Plus className="size-4" aria-hidden />}
        triggerVariant="primary"
        size="lg"
      >
        <form action={createBundleSyllabusWeek} className="space-y-4">
          <input type="hidden" name="bundle_id" value={bundle.id} />
          <input type="hidden" name="module_id" value={bundle.module_id} />
          <BundleSyllabusFields nextWeek={weeks.length + 1} />
          <SubmitButton>Hafta Ekle</SubmitButton>
        </form>
      </AdminFormDialog>

      {weeks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-surface p-4 text-sm text-ink-soft">
          Bu paket için henüz müfredat yok.
        </p>
      ) : (
        <div className="space-y-3">
          {weeks.map((week) => (
            <article key={week.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl font-display text-xs font-bold text-white ${
                      week.week_kind === "core" ? "bg-accent" : "bg-amber"
                    }`}
                  >
                    {week.week_number}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{week.title}</h4>
                      <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-soft">
                        {weekKindLabels[week.week_kind]}
                      </span>
                    </div>
                    {week.description && (
                      <p className="mt-1 text-sm text-ink-soft">{week.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BundleSyllabusEditDialog bundle={bundle} week={week} />
                  <ConfirmDeleteButton
                    action={deleteBundleSyllabusWeek}
                    hiddenFields={[
                      { name: "week_id", value: week.id },
                      { name: "module_id", value: bundle.module_id },
                    ]}
                    label="Sil"
                    confirmTitle="Haftayı sil?"
                    confirmMessage={`Hafta ${week.week_number}: "${week.title}" kaldırılacak.`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function BundleSyllabusFields({ week, nextWeek = 1 }: { week?: BundleSyllabusWeek; nextWeek?: number }) {
  return (
    <>
      <NumberInput
        name="week_number"
        label="Hafta No"
        defaultValue={week?.week_number ?? nextWeek}
        min={1}
        required
      />
      <TextInput name="title" label="Başlık" defaultValue={week?.title} required />
      <TextArea name="description" label="Açıklama" defaultValue={week?.description} rows={3} />
      <SelectField
        name="week_kind"
        label="Hafta türü"
        defaultValue={week?.week_kind ?? "core"}
        options={[
          { value: "core", label: weekKindLabels.core },
          { value: "specialized", label: weekKindLabels.specialized },
        ]}
      />
      <input type="hidden" name="sort_order" value={week?.sort_order ?? nextWeek} />
    </>
  );
}

function BundleSyllabusEditDialog({ bundle, week }: { bundle: BundlePackage; week: BundleSyllabusWeek }) {
  return (
    <AdminFormDialog title="Haftayı Düzenle" triggerLabel="Düzenle" triggerVariant="text" size="lg">
      <form action={updateBundleSyllabusWeek} className="space-y-4">
        <input type="hidden" name="week_id" value={week.id} />
        <input type="hidden" name="bundle_id" value={bundle.id} />
        <input type="hidden" name="module_id" value={bundle.module_id} />
        <BundleSyllabusFields week={week} />
        <SubmitButton>Güncelle</SubmitButton>
      </form>
    </AdminFormDialog>
  );
}
