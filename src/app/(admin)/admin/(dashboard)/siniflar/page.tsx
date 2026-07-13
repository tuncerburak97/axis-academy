// src/app/(admin)/admin/(dashboard)/siniflar/page.tsx — sınıf listesi: kart + popup + 2 sekme
import type { Metadata } from "next";
import { getAllModules } from "@/lib/queries/catalog";
import { getAdminClasses, getPendingEnrollments } from "@/lib/queries/admin-classes";
import { CreateClassDialog } from "@/components/admin/create-class-dialog";
import { ClassListTabs } from "@/components/admin/class-list-tabs";
import { StatusBanner } from "@/components/admin/fields";
import { categoryLabels } from "@/lib/types/catalog";

export const metadata: Metadata = { title: "Sınıf Yönetimi", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ClassManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; tab?: string }>;
}) {
  const { saved, error, tab } = await searchParams;

  const [modules, classes, pendingEnrollments] = await Promise.all([
    getAllModules(),
    getAdminClasses(),
    getPendingEnrollments(),
  ]);

  const moduleOptions = modules.map((mod) => ({
    value: mod.id,
    label: `${categoryLabels[mod.category]} — ${mod.title}`,
  }));

  const initialTab = tab === "pending" ? "pending" : "classes";

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Sınıf Yönetimi</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Sınıfları kart görünümünde yönet; öğrenciler ve duyurular sınıf detayında.
          </p>
        </div>
        <CreateClassDialog moduleOptions={moduleOptions} />
      </div>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      <div className="mt-6">
        <ClassListTabs
          classes={classes}
          pendingEnrollments={pendingEnrollments}
          initialTab={initialTab}
        />
      </div>
    </>
  );
}
