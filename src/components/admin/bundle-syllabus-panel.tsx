// src/components/admin/bundle-syllabus-panel.tsx — paket müfredatı CRUD + modülden kopyala
"use client";

import { Copy, Plus } from "lucide-react";
import {
  copyModuleWeekToBundle,
  createBundleSyllabusWeek,
  deleteBundleSyllabusWeek,
  updateBundleSyllabusWeek,
} from "@/lib/actions/admin-catalog";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { NumberInput, SelectField, SubmitButton, TextArea, TextInput } from "@/components/admin/fields";
import { weekKindLabels } from "@/lib/types/catalog";
import type { BundlePackage, BundleSyllabusWeek, SyllabusWeek } from "@/lib/types/catalog";

interface BundleSyllabusPanelProps {
  bundle: BundlePackage;
  weeks: BundleSyllabusWeek[];
  moduleWeeks: SyllabusWeek[];
}

export function BundleSyllabusPanel({ bundle, weeks, moduleWeeks }: BundleSyllabusPanelProps) {
  const copiedSourceIds = new Set(
    weeks.map((w) => w.source_module_week_id).filter((id): id is string => Boolean(id)),
  );
  const availableModuleWeeks = moduleWeeks.filter((w) => !copiedSourceIds.has(w.id));

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        Public sayfada &quot;Paketleri Karşılaştır&quot; bölümünde görünür. Modül müfredatından tek tıkla kopyalayabilirsiniz.
      </p>

      {availableModuleWeeks.length > 0 && (
        <div className="rounded-xl border border-dashed border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Modülden kopyala</p>
          <ul className="mt-3 space-y-2">
            {availableModuleWeeks.map((moduleWeek) => (
              <li
                key={moduleWeek.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-semibold">H{moduleWeek.week_number}</span>
                  <span className="text-ink-soft"> — {moduleWeek.title}</span>
                </span>
                <div className="flex items-center gap-2">
                  <CopyWeekForm
                    bundle={bundle}
                    moduleWeek={moduleWeek}
                    weekKind="core"
                    label="Çekirdek"
                  />
                  <CopyWeekForm
                    bundle={bundle}
                    moduleWeek={moduleWeek}
                    weekKind="specialized"
                    label="Özel"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

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
          Bu paket için henüz müfredat yok. Yukarıdan modül haftası kopyalayın veya manuel ekleyin.
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

function CopyWeekForm({
  bundle,
  moduleWeek,
  weekKind,
  label,
}: {
  bundle: BundlePackage;
  moduleWeek: SyllabusWeek;
  weekKind: "core" | "specialized";
  label: string;
}) {
  return (
    <form action={copyModuleWeekToBundle}>
      <input type="hidden" name="module_id" value={bundle.module_id} />
      <input type="hidden" name="bundle_id" value={bundle.id} />
      <input type="hidden" name="module_week_id" value={moduleWeek.id} />
      <input type="hidden" name="week_kind" value={weekKind} />
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface hover:text-ink"
      >
        <Copy className="size-3" aria-hidden />
        {label}
      </button>
    </form>
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
