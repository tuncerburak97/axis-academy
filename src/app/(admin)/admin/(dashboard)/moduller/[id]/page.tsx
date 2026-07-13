// src/app/(admin)/admin/(dashboard)/moduller/[id]/page.tsx — modül detayı:
// modül bilgileri, fiyat planı matrisi ve örnek paket yönetimi tek sayfada
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getModuleById, getModuleBundles, getModulePlans } from "@/lib/queries/catalog";
import {
  updateModule,
  createPlan,
  updatePlan,
  deletePlan,
  createBundle,
  updateBundle,
  deleteBundle,
} from "@/lib/actions/admin-catalog";
import { deleteModule } from "@/lib/actions/admin-delete";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { categoryLabels, priceUnitLabels, trainingTypeLabels } from "@/lib/types/catalog";
import type { BundlePackage, PricingPlan } from "@/lib/types/catalog";
import {
  CheckboxField,
  NumberInput,
  SelectField,
  StatusBanner,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/fields";

export const metadata: Metadata = { title: "Modül Detayı", robots: { index: false } };
export const dynamic = "force-dynamic";

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }));
const trainingTypeOptions = Object.entries(trainingTypeLabels).map(([value, label]) => ({ value, label }));
const unitOptions = Object.entries(priceUnitLabels).map(([value, label]) => ({ value, label }));

export default async function ModuleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  const educationModule = await getModuleById(id);
  if (!educationModule) notFound();

  const [plans, bundles] = await Promise.all([getModulePlans(id), getModuleBundles(id)]);

  return (
    <>
      <Link href="/admin/moduller" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Eğitim Yönetimi
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">{educationModule.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">{categoryLabels[educationModule.category]} modülü</p>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      {/* 1. Modül bilgileri */}
      <section aria-labelledby="module-info-heading" className="max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 id="module-info-heading" className="font-display text-lg font-semibold">Modül Bilgileri</h2>
        <form action={updateModule} className="mt-4 space-y-4">
          <input type="hidden" name="module_id" value={educationModule.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Başlık" name="title" defaultValue={educationModule.title} required />
            <SelectField label="Kategori" name="category" defaultValue={educationModule.category} options={categoryOptions} />
          </div>
          <TextInput label="Kısa açıklama (kartta görünür)" name="description" defaultValue={educationModule.description} />
          <TextArea label="Uzun açıklama (detay sayfası)" name="long_description" defaultValue={educationModule.long_description} rows={5} />
          <TextArea
            label="Özellikler (her satıra bir madde)"
            name="features"
            defaultValue={educationModule.features.join("\n")}
            rows={4}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput label="Rozet (örn. Popüler)" name="badge" defaultValue={educationModule.badge} />
            <TextInput label="Public fiyat göstergesi" name="public_price_hint" defaultValue={educationModule.public_price_hint} />
            <NumberInput label="Sıra" name="sort_order" defaultValue={educationModule.sort_order} min={0} />
          </div>
          <CheckboxField label="Modül aktif (public'te görünür)" name="is_active" defaultChecked={educationModule.is_active} />
          <SubmitButton>Kaydet</SubmitButton>
        </form>
      </section>

      {/* 2. Fiyat planları */}
      <section aria-labelledby="plans-heading" className="mt-10">
        <h2 id="plans-heading" className="font-display text-lg font-semibold">Fiyat Planları</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Eğitim tipi + kişi aralığı + birim fiyat kombinasyonları. Üyeler bu matrisi Keşfet ekranında görür.
        </p>

        <div className="mt-4 space-y-3">
          {plans.map((plan) => (
            <PlanRow key={plan.id} plan={plan} />
          ))}
          {plans.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
              Henüz fiyat planı yok. Aşağıdan ekle — örn. Bireysel · 1-1 kişi · 400₺ · Saatlik.
            </p>
          )}
        </div>

        <details className="mt-4 rounded-xl border border-line bg-white p-5 shadow-sm">
          <summary className="cursor-pointer font-display text-sm font-semibold">Yeni Fiyat Planı Ekle</summary>
          <form action={createPlan} className="mt-4 space-y-4">
            <input type="hidden" name="module_id" value={educationModule.id} />
            <PlanFields />
            <SubmitButton>Plan Ekle</SubmitButton>
          </form>
        </details>
      </section>

      {/* 3. Örnek paketler */}
      <section aria-labelledby="bundles-heading" className="mt-10">
        <h2 id="bundles-heading" className="font-display text-lg font-semibold">Örnek Paketler</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Public detay sayfasındaki &quot;Örnek Paketleri Gör&quot; popup&apos;ında sergilenen hazır şablonlar.
        </p>

        <div className="mt-4 space-y-3">
          {bundles.map((bundle) => (
            <BundleRow key={bundle.id} bundle={bundle} />
          ))}
          {bundles.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
              Henüz örnek paket yok.
            </p>
          )}
        </div>

        <details className="mt-4 rounded-xl border border-line bg-white p-5 shadow-sm">
          <summary className="cursor-pointer font-display text-sm font-semibold">Yeni Paket Ekle</summary>
          <form action={createBundle} className="mt-4 space-y-4">
            <input type="hidden" name="module_id" value={educationModule.id} />
            <BundleFields />
            <SubmitButton>Paket Ekle</SubmitButton>
          </form>
        </details>
      </section>

      <section aria-labelledby="danger-heading" className="mt-10 max-w-2xl rounded-xl border border-red-200 bg-red-50/50 p-6">
        <h2 id="danger-heading" className="font-display text-lg font-semibold text-red-800">Tehlikeli Bölge</h2>
        <p className="mt-1 text-sm text-red-700">
          Modülü silmek bağlı sınıfları, materyalleri ve fiyat planlarını da kaldırır.
        </p>
        <div className="mt-4">
          <ConfirmDeleteButton
            action={deleteModule}
            hiddenFields={[{ name: "module_id", value: educationModule.id }]}
            label="Modülü Sil"
            confirmTitle="Modülü kalıcı olarak sil?"
            confirmMessage={`"${educationModule.title}" ve tüm bağlı veriler silinecek.`}
            variant="button"
          />
        </div>
      </section>
    </>
  );
}

// Plan satırı: düzenleme formu + silme
function PlanRow({ plan }: { plan: PricingPlan }) {
  return (
    <details className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold">{trainingTypeLabels[plan.training_type]}</span>
        <span className="text-ink-soft">{plan.min_people}-{plan.max_people} kişi</span>
        <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-semibold">
          {plan.price.toLocaleString("tr-TR")}₺ · {priceUnitLabels[plan.unit]}
        </span>
        {!plan.is_active && <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink-soft">Pasif</span>}
        {plan.note && <span className="text-xs text-ink-soft">{plan.note}</span>}
      </summary>
      <form action={updatePlan} className="mt-4 space-y-4">
        <input type="hidden" name="plan_id" value={plan.id} />
        <input type="hidden" name="module_id" value={plan.module_id} />
        <PlanFields plan={plan} />
        <div className="flex items-center gap-3">
          <SubmitButton>Güncelle</SubmitButton>
        </div>
      </form>
      <form action={deletePlan} className="mt-2">
        <input type="hidden" name="plan_id" value={plan.id} />
        <input type="hidden" name="module_id" value={plan.module_id} />
        <button type="submit" className="text-sm font-semibold text-red-700 hover:underline">
          Planı Sil
        </button>
      </form>
    </details>
  );
}

function PlanFields({ plan }: { plan?: PricingPlan }) {
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

// Paket satırı: düzenleme formu + silme
function BundleRow({ bundle }: { bundle: BundlePackage }) {
  return (
    <details className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold">{bundle.title}</span>
        <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-semibold">
          {bundle.fixed_price.toLocaleString("tr-TR")}₺ · {bundle.duration_hours} saat
        </span>
        {!bundle.is_active && <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink-soft">Pasif</span>}
      </summary>
      <form action={updateBundle} className="mt-4 space-y-4">
        <input type="hidden" name="bundle_id" value={bundle.id} />
        <input type="hidden" name="module_id" value={bundle.module_id} />
        <BundleFields bundle={bundle} />
        <SubmitButton>Güncelle</SubmitButton>
      </form>
      <form action={deleteBundle} className="mt-2">
        <input type="hidden" name="bundle_id" value={bundle.id} />
        <input type="hidden" name="module_id" value={bundle.module_id} />
        <button type="submit" className="text-sm font-semibold text-red-700 hover:underline">
          Paketi Sil
        </button>
      </form>
    </details>
  );
}

function BundleFields({ bundle }: { bundle?: BundlePackage }) {
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
