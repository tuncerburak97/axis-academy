// src/app/(admin)/admin/(dashboard)/moduller/page.tsx — modül listesi + popup ile yeni modül
import type { Metadata } from "next";
import { getAllModules } from "@/lib/queries/catalog";
import { CreateModuleDialog } from "@/components/admin/create-module-dialog";
import { ModuleListCard } from "@/components/admin/module-list-card";
import { StatusBanner } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Eğitim Yönetimi", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ModuleManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const modules = await getAllModules();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Eğitim Yönetimi</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Modülleri yönet; fiyat planları ve örnek paketler modül detayında düzenlenir.
          </p>
        </div>
        <CreateModuleDialog />
      </div>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod) => (
          <ModuleListCard key={mod.id} module={mod} />
        ))}
        {modules.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-white p-6 text-sm text-ink-soft md:col-span-2 xl:col-span-3">
            Henüz modül yok. Sağ üstten &quot;Modül Ekle&quot; ile ilk modülü oluştur.
          </p>
        )}
      </div>
    </>
  );
}
