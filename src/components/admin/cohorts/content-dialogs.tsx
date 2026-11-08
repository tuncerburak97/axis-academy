// src/components/admin/cohorts/content-dialogs.tsx — dönem materyali ve duyurusu ekle/düzenle diyalogları
"use client";

import * as React from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { saveAnnouncement, saveMaterial } from "@/lib/actions/admin-cohorts";
import { materialCategoryLabels, type AnnouncementRow, type MaterialRow } from "@/components/admin/lib/labels";
import { FormDialog, Hidden } from "@/components/admin/action-form";

export function MaterialDialog({
  trigger,
  classId,
  material,
  defaultCategory = "weekly",
}: {
  trigger: React.ReactNode;
  classId: string;
  material?: MaterialRow;
  defaultCategory?: string;
}) {
  const prefix = material?.id ?? "new-material";
  return (
    <FormDialog
      trigger={trigger}
      size="lg"
      title={material ? "Materyali düzenle" : "Materyal ekle"}
      description="Kayıtlı öğrenciler eğitim sayfasında görür; yeni materyal bildirim olarak da gider."
      action={saveMaterial}
      submitLabel={material ? "Kaydet" : "Materyali ekle"}
      resetOnSuccess={!material}
    >
      <Hidden name="class_id" value={classId} />
      {material && <Hidden name="material_id" value={material.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem_6rem]">
        <Field id={`${prefix}-title`} label="Başlık">
          <Input name="title" required minLength={2} maxLength={200} defaultValue={material?.title ?? ""} />
        </Field>
        <Field id={`${prefix}-category`} label="Kategori">
          <Select name="category" defaultValue={material?.category ?? defaultCategory}>
            {Object.entries(materialCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id={`${prefix}-week`} label="Hafta" optional>
          <Input name="week_number" type="number" min={1} max={104} defaultValue={material?.week_number ?? ""} />
        </Field>
      </div>
      <Field id={`${prefix}-content`} label="İçerik" optional hint="Markdown desteklenir.">
        <Textarea name="content_md" rows={6} maxLength={50000} defaultValue={material?.content_md ?? ""} className="font-mono text-sm" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
        <Field
          id={`${prefix}-file`}
          label={material?.file_path ? "Dosyayı değiştir" : "Dosya"}
          optional
          hint="PDF, Office, ZIP, MD, TXT · en fazla 20 MB"
        >
          <Input
            name="file"
            type="file"
            className="py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent-ink"
          />
        </Field>
        <Field id={`${prefix}-sort`} label="Sıra">
          <Input name="sort_order" type="number" min={0} defaultValue={material?.sort_order ?? 0} />
        </Field>
      </div>
      {material?.file_path && (
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="remove_file" className="size-4 accent-[var(--color-danger)]" /> Mevcut dosyayı kaldır
        </label>
      )}
    </FormDialog>
  );
}

export function AnnouncementDialog({
  trigger,
  classId,
  announcement,
}: {
  trigger: React.ReactNode;
  classId: string;
  announcement?: AnnouncementRow;
}) {
  const prefix = announcement?.id ?? "new-announcement";
  return (
    <FormDialog
      trigger={trigger}
      title={announcement ? "Duyuruyu düzenle" : "Duyuru yayınla"}
      description={announcement ? undefined : "Kayıtlı öğrencilere uygulama içi bildirim gider."}
      action={saveAnnouncement}
      submitLabel={announcement ? "Kaydet" : "Yayınla"}
      resetOnSuccess={!announcement}
    >
      <Hidden name="class_id" value={classId} />
      {announcement && <Hidden name="announcement_id" value={announcement.id} />}
      <Field id={`${prefix}-title`} label="Başlık">
        <Input name="title" required minLength={2} maxLength={200} defaultValue={announcement?.title ?? ""} />
      </Field>
      <Field id={`${prefix}-body`} label="Metin" hint="Markdown desteklenir.">
        <Textarea name="body" rows={6} maxLength={10000} defaultValue={announcement?.body ?? ""} />
      </Field>
    </FormDialog>
  );
}
