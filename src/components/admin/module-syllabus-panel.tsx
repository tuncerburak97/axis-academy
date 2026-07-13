// src/components/admin/module-syllabus-panel.tsx — modül müfredat tablosu + popup CRUD
"use client";

import { Plus } from "lucide-react";
import { createSyllabusWeek, deleteSyllabusWeek, updateSyllabusWeek } from "@/lib/actions/admin-catalog";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { NumberInput, SubmitButton, TextArea, TextInput } from "@/components/admin/fields";
import type { SyllabusWeek } from "@/lib/types/catalog";

interface ModuleSyllabusPanelProps {
  moduleId: string;
  weeks: SyllabusWeek[];
}

export function ModuleSyllabusPanel({ moduleId, weeks }: ModuleSyllabusPanelProps) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Haftalık konu başlıkları public vitrinde ve öğrenci panelinde görünür. Modülü aktif yapmak için en az 1 hafta gerekir.
        </p>
        <AdminFormDialog
          title="Yeni Hafta Ekle"
          triggerLabel="Hafta Ekle"
          triggerIcon={<Plus className="size-4" aria-hidden />}
          triggerVariant="primary"
          size="lg"
        >
          <form action={createSyllabusWeek} className="space-y-4">
            <input type="hidden" name="module_id" value={moduleId} />
            <SyllabusFields nextWeek={weeks.length + 1} />
            <SubmitButton>Hafta Ekle</SubmitButton>
          </form>
        </AdminFormDialog>
      </div>

      {weeks.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-5 text-sm text-amber-900">
          Henüz müfredat yok. Public vitrin ve öğrenci progress için haftalık konuları ekleyin.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {weeks.map((week) => (
            <article key={week.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-display text-sm font-bold text-accent">
                    {week.week_number}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold">{week.title}</h3>
                    {week.description && (
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{week.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SyllabusEditDialog week={week} />
                  <ConfirmDeleteButton
                    action={deleteSyllabusWeek}
                    hiddenFields={[
                      { name: "week_id", value: week.id },
                      { name: "module_id", value: moduleId },
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

function SyllabusEditDialog({ week }: { week: SyllabusWeek }) {
  return (
    <AdminFormDialog title="Haftayı Düzenle" triggerLabel="Düzenle" triggerVariant="text" size="lg">
      <form action={updateSyllabusWeek} className="space-y-4">
        <input type="hidden" name="week_id" value={week.id} />
        <input type="hidden" name="module_id" value={week.module_id} />
        <SyllabusFields week={week} />
        <SubmitButton>Güncelle</SubmitButton>
      </form>
    </AdminFormDialog>
  );
}

function SyllabusFields({ week, nextWeek }: { week?: SyllabusWeek; nextWeek?: number }) {
  return (
    <>
      <NumberInput label="Hafta no" name="week_number" defaultValue={week?.week_number ?? nextWeek ?? 1} min={1} required />
      <TextInput label="Konu başlığı" name="title" defaultValue={week?.title} required />
      <TextArea label="Kısa açıklama" name="description" defaultValue={week?.description} rows={3} />
      <NumberInput label="Sıra" name="sort_order" defaultValue={week?.sort_order ?? week?.week_number ?? nextWeek ?? 0} min={0} />
    </>
  );
}
