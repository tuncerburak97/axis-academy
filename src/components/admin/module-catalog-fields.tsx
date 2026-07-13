// src/components/admin/module-catalog-fields.tsx — modül/plan/paket form alanları (admin modül UX)
import {
  CheckboxField,
  NumberInput,
  SelectField,
  TextArea,
  TextInput,
} from "@/components/admin/fields";
import { categoryLabels, priceUnitLabels, trainingTypeLabels } from "@/lib/types/catalog";
import type { BundlePackage, EducationModule, PricingPlan } from "@/lib/types/catalog";

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }));
const trainingTypeOptions = Object.entries(trainingTypeLabels).map(([value, label]) => ({ value, label }));
const unitOptions = Object.entries(priceUnitLabels).map(([value, label]) => ({ value, label }));

export function CreateModuleFields() {
  return (
    <>
      <TextInput label="Başlık" name="title" required />
      <SelectField label="Kategori" name="category" options={categoryOptions} />
      <TextInput label="Kısa açıklama" name="description" />
    </>
  );
}

export function ModuleInfoFields({ module }: { module: EducationModule }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Başlık" name="title" defaultValue={module.title} required />
        <SelectField label="Kategori" name="category" defaultValue={module.category} options={categoryOptions} />
      </div>
      <TextInput label="Kısa açıklama (kartta görünür)" name="description" defaultValue={module.description} />
      <TextArea label="Uzun açıklama (detay sayfası)" name="long_description" defaultValue={module.long_description} rows={5} />
      <TextArea
        label="Özellikler (her satıra bir madde)"
        name="features"
        defaultValue={module.features.join("\n")}
        rows={4}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextInput label="Rozet (örn. Popüler)" name="badge" defaultValue={module.badge} />
        <TextInput label="Public fiyat göstergesi" name="public_price_hint" defaultValue={module.public_price_hint} />
        <NumberInput label="Sıra" name="sort_order" defaultValue={module.sort_order} min={0} />
      </div>
      <CheckboxField label="Modül aktif (public'te görünür)" name="is_active" defaultChecked={module.is_active} />
    </>
  );
}

export function PlanFields({ plan }: { plan?: PricingPlan }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Eğitim tipi" name="training_type" defaultValue={plan?.training_type} options={trainingTypeOptions} />
        <NumberInput label="Min kişi" name="min_people" defaultValue={plan?.min_people ?? 1} min={1} required />
        <NumberInput label="Max kişi" name="max_people" defaultValue={plan?.max_people ?? 1} min={1} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberInput label="Fiyat (₺)" name="price" defaultValue={plan?.price} min={1} step="0.01" required />
        <SelectField label="Birim" name="unit" defaultValue={plan?.unit} options={unitOptions} />
        <NumberInput label="Sıra" name="sort_order" defaultValue={plan?.sort_order ?? 0} min={0} />
      </div>
      <TextInput label="Not (isteğe bağlı, üye görür)" name="note" defaultValue={plan?.note} />
      <CheckboxField label="Plan aktif" name="is_active" defaultChecked={plan?.is_active ?? true} />
    </>
  );
}

export function BundleFields({ bundle }: { bundle?: BundlePackage }) {
  return (
    <>
      <TextInput label="Paket adı" name="title" defaultValue={bundle?.title} required />
      <TextArea label="Açıklama" name="description" defaultValue={bundle?.description} rows={3} />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput label="Sabit fiyat (₺)" name="fixed_price" defaultValue={bundle?.fixed_price} min={1} step="0.01" required />
        <NumberInput label="Süre (saat)" name="duration_hours" defaultValue={bundle?.duration_hours} min={1} required />
      </div>
      <CheckboxField label="Paket aktif" name="is_active" defaultChecked={bundle?.is_active ?? true} />
    </>
  );
}
