// src/app/(admin)/admin/(dashboard)/moduller/page.tsx — modül listesi + yeni modül formu
import type { Metadata } from "next";
import Link from "next/link";
import { getAllModules } from "@/lib/queries/catalog";
import { createModule } from "@/lib/actions/admin-catalog";
import { categoryLabels } from "@/lib/types/catalog";
import { SelectField, StatusBanner, SubmitButton, TextInput } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Eğitim Yönetimi", robots: { index: false } };
export const dynamic = "force-dynamic";

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }));

export default async function ModuleManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const modules = await getAllModules();

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Eğitim Yönetimi</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Modülleri yönet; fiyat planları ve örnek paketler modül detayında düzenlenir.
      </p>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod) => (
          <Link
            key={mod.id}
            href={`/admin/moduller/${mod.id}`}
            className="rounded-xl border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {categoryLabels[mod.category]}
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  mod.is_active ? "bg-green-50 text-green-800" : "bg-surface text-ink-soft"
                }`}
              >
                {mod.is_active ? "Aktif" : "Pasif"}
              </span>
            </div>
            <p className="mt-2 font-display text-lg font-semibold">{mod.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{mod.description}</p>
            {mod.public_price_hint && (
              <p className="mt-3 inline-flex rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-semibold">
                {mod.public_price_hint}
              </p>
            )}
          </Link>
        ))}
        {modules.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-white p-6 text-sm text-ink-soft md:col-span-2 xl:col-span-3">
            Henüz modül yok. Aşağıdaki formla ilk modülü oluştur.
          </p>
        )}
      </div>

      <section aria-labelledby="new-module-heading" className="mt-10 max-w-xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 id="new-module-heading" className="font-display text-lg font-semibold">Yeni Modül</h2>
        <form action={createModule} className="mt-4 space-y-4">
          <TextInput label="Başlık" name="title" required />
          <SelectField label="Kategori" name="category" options={categoryOptions} />
          <TextInput label="Kısa açıklama" name="description" />
          <SubmitButton>Modül Oluştur</SubmitButton>
        </form>
      </section>
    </>
  );
}
