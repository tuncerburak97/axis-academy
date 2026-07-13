// src/app/(admin)/admin/(dashboard)/moduller/[id]/page.tsx — modül detayı: 3 tab + popup CRUD
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getModuleById, getModuleBundles, getModulePlans } from "@/lib/queries/catalog";
import { ModuleDetailTabs } from "@/components/admin/module-detail-tabs";
import { categoryLabels } from "@/lib/types/catalog";
import { StatusBanner } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Modül Detayı", robots: { index: false } };
export const dynamic = "force-dynamic";

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

      <div className="mt-6">
        <ModuleDetailTabs module={educationModule} plans={plans} bundles={bundles} />
      </div>
    </>
  );
}
