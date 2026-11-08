// src/components/admin/programs/catalog-dialogs.tsx — program kataloğu ekle/düzenle diyalogları (hafta, paket, paket haftası, fiyat, konu)
import * as React from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { saveBundle, saveBundleWeek, savePlan, saveSyllabusWeek, saveTopic } from "@/lib/actions/admin-catalog";
import { FormDialog, Hidden } from "@/components/admin/action-form";
import type { BundleRow, BundleWeekRow, PlanRow, SyllabusWeekRow, TopicRow } from "@/components/admin/lib/labels";

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-line px-3.5 py-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]" />
      <span>
        <span className="font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>}
      </span>
    </label>
  );
}

export function SyllabusWeekDialog({
  trigger,
  moduleId,
  week,
  nextWeek,
}: {
  trigger: React.ReactNode;
  moduleId: string;
  week?: SyllabusWeekRow;
  nextWeek?: number;
}) {
  const p = week?.id ?? "new-week";
  return (
    <FormDialog trigger={trigger} title={week ? "Haftayı düzenle" : "Hafta ekle"} action={saveSyllabusWeek} submitLabel={week ? "Kaydet" : "Haftayı ekle"} resetOnSuccess={!week}>
      <Hidden name="module_id" value={moduleId} />
      {week && <Hidden name="week_id" value={week.id} />}
      <div className="grid grid-cols-[6rem_1fr] gap-4">
        <Field id={`${p}-no`} label="Hafta">
          <Input name="week_number" type="number" min={1} max={104} required defaultValue={week?.week_number ?? nextWeek ?? 1} className="tabular font-mono" />
        </Field>
        <Field id={`${p}-title`} label="Başlık">
          <Input name="title" required minLength={2} maxLength={200} defaultValue={week?.title ?? ""} />
        </Field>
      </div>
      <Field id={`${p}-desc`} label="Açıklama" optional>
        <Textarea name="description" rows={3} maxLength={1000} defaultValue={week?.description ?? ""} />
      </Field>
      <Field id={`${p}-sort`} label="Sıra" hint="Aynı haftada birden çok başlık varsa sıralama için.">
        <Input name="sort_order" type="number" min={0} defaultValue={week?.sort_order ?? 0} className="w-28" />
      </Field>
    </FormDialog>
  );
}

export function BundleDialog({ trigger, moduleId, bundle }: { trigger: React.ReactNode; moduleId: string; bundle?: BundleRow }) {
  const p = bundle?.id ?? "new-bundle";
  return (
    <FormDialog trigger={trigger} title={bundle ? "Paketi düzenle" : "Paket ekle"} description="Birebir hazır paket; sabit fiyat ve süre." action={saveBundle} submitLabel={bundle ? "Kaydet" : "Paketi ekle"} resetOnSuccess={!bundle}>
      <Hidden name="module_id" value={moduleId} />
      {bundle && <Hidden name="bundle_id" value={bundle.id} />}
      <Field id={`${p}-title`} label="Paket adı">
        <Input name="title" required minLength={2} maxLength={120} defaultValue={bundle?.title ?? ""} />
      </Field>
      <Field id={`${p}-desc`} label="Açıklama" optional>
        <Textarea name="description" rows={3} maxLength={1000} defaultValue={bundle?.description ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id={`${p}-price`} label="Fiyat (₺)">
          <Input name="fixed_price" type="number" min={1} step="1" required defaultValue={bundle?.fixed_price ?? ""} className="tabular font-mono" />
        </Field>
        <Field id={`${p}-hours`} label="Süre (saat)">
          <Input name="duration_hours" type="number" min={1} required defaultValue={bundle?.duration_hours ?? ""} className="tabular font-mono" />
        </Field>
      </div>
      <Checkbox name="is_active" label="Yayında" defaultChecked={bundle?.is_active ?? true} hint="Pasif paketler katalogda görünmez." />
    </FormDialog>
  );
}

export function BundleWeekDialog({
  trigger,
  bundleId,
  week,
  nextWeek,
}: {
  trigger: React.ReactNode;
  bundleId: string;
  week?: BundleWeekRow;
  nextWeek?: number;
}) {
  const p = week?.id ?? `new-bweek-${bundleId}`;
  return (
    <FormDialog trigger={trigger} title={week ? "Paket haftasını düzenle" : "Paket haftası ekle"} action={saveBundleWeek} submitLabel={week ? "Kaydet" : "Haftayı ekle"} resetOnSuccess={!week}>
      <Hidden name="bundle_id" value={bundleId} />
      {week && <Hidden name="week_id" value={week.id} />}
      <div className="grid grid-cols-[6rem_1fr] gap-4">
        <Field id={`${p}-no`} label="Hafta">
          <Input name="week_number" type="number" min={1} max={52} required defaultValue={week?.week_number ?? nextWeek ?? 1} className="tabular font-mono" />
        </Field>
        <Field id={`${p}-title`} label="Başlık">
          <Input name="title" required minLength={2} maxLength={200} defaultValue={week?.title ?? ""} />
        </Field>
      </div>
      <Field id={`${p}-desc`} label="Açıklama" optional>
        <Textarea name="description" rows={3} maxLength={1000} defaultValue={week?.description ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id={`${p}-kind`} label="Tür">
          <Select name="week_kind" defaultValue={week?.week_kind ?? "core"}>
            <option value="core">Ortak temel</option>
            <option value="specialized">Pakete özel</option>
          </Select>
        </Field>
        <Field id={`${p}-sort`} label="Sıra">
          <Input name="sort_order" type="number" min={0} defaultValue={week?.sort_order ?? 0} />
        </Field>
      </div>
    </FormDialog>
  );
}

export function PlanDialog({ trigger, moduleId, plan }: { trigger: React.ReactNode; moduleId: string; plan?: PlanRow }) {
  const p = plan?.id ?? "new-plan";
  return (
    <FormDialog trigger={trigger} title={plan ? "Fiyat planını düzenle" : "Fiyat planı ekle"} description="Birebir saatlik ya da grup kişi aralığı fiyatı. Bilgi amaçlı gösterilir." action={savePlan} submitLabel={plan ? "Kaydet" : "Planı ekle"} resetOnSuccess={!plan}>
      <Hidden name="module_id" value={moduleId} />
      {plan && <Hidden name="plan_id" value={plan.id} />}
      <div className="grid grid-cols-2 gap-4">
        <Field id={`${p}-type`} label="Tür">
          <Select name="training_type" defaultValue={plan?.training_type ?? "individual"}>
            <option value="individual">Birebir</option>
            <option value="group">Grup</option>
          </Select>
        </Field>
        <Field id={`${p}-unit`} label="Birim">
          <Select name="unit" defaultValue={plan?.unit ?? "per_hour"}>
            <option value="per_hour">Saatlik</option>
            <option value="total">Toplam</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field id={`${p}-min`} label="En az kişi">
          <Input name="min_people" type="number" min={1} required defaultValue={plan?.min_people ?? 1} className="tabular font-mono" />
        </Field>
        <Field id={`${p}-max`} label="En çok kişi">
          <Input name="max_people" type="number" min={1} required defaultValue={plan?.max_people ?? 1} className="tabular font-mono" />
        </Field>
        <Field id={`${p}-price`} label="Fiyat (₺)">
          <Input name="price" type="number" min={1} step="1" required defaultValue={plan?.price ?? ""} className="tabular font-mono" />
        </Field>
      </div>
      <div className="grid grid-cols-[1fr_6rem] gap-4">
        <Field id={`${p}-note`} label="Not" optional>
          <Input name="note" maxLength={200} defaultValue={plan?.note ?? ""} />
        </Field>
        <Field id={`${p}-sort`} label="Sıra">
          <Input name="sort_order" type="number" min={0} defaultValue={plan?.sort_order ?? 0} />
        </Field>
      </div>
      <Checkbox name="is_active" label="Yayında" defaultChecked={plan?.is_active ?? true} />
    </FormDialog>
  );
}

export function TopicDialog({ trigger, moduleId, topic }: { trigger: React.ReactNode; moduleId: string; topic?: TopicRow }) {
  const p = topic?.id ?? "new-topic";
  return (
    <FormDialog trigger={trigger} title={topic ? "Konuyu düzenle" : "Konu ekle"} description="Üyeler birebir “kendi programın” sihirbazında bu konulardan seçer." action={saveTopic} submitLabel={topic ? "Kaydet" : "Konuyu ekle"} resetOnSuccess={!topic}>
      <Hidden name="module_id" value={moduleId} />
      {topic && <Hidden name="topic_id" value={topic.id} />}
      <div className="grid grid-cols-[1fr_7rem] gap-4">
        <Field id={`${p}-title`} label="Konu">
          <Input name="title" required minLength={2} maxLength={160} defaultValue={topic?.title ?? ""} />
        </Field>
        <Field id={`${p}-hours`} label="Süre (saat)">
          <Input name="estimated_hours" type="number" min={1} max={100} required defaultValue={topic?.estimated_hours ?? 2} className="tabular font-mono" />
        </Field>
      </div>
      <Field id={`${p}-desc`} label="Açıklama" optional>
        <Textarea name="description" rows={3} maxLength={1000} defaultValue={topic?.description ?? ""} />
      </Field>
      <Checkbox name="is_active" label="Seçilebilir" defaultChecked={topic?.is_active ?? true} />
    </FormDialog>
  );
}
