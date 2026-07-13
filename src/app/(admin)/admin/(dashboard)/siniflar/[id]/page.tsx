// src/app/(admin)/admin/(dashboard)/siniflar/[id]/page.tsx — sınıf detay: 4 sekme
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getClassAnnouncements,
  getClassEnrollments,
  getClassMaterials,
} from "@/lib/queries/admin-classes";
import { ClassDetailTabs } from "@/components/admin/class-detail-tabs";
import { StatusBanner } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Sınıf Detayı", robots: { index: false } };
export const dynamic = "force-dynamic";

type ClassDetailTab = "general" | "students" | "announcements" | "materials";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string; tab?: string }>;
}) {
  const { id } = await params;
  const { saved, error, tab } = await searchParams;
  const supabase = await createClient();

  const { data: trainingClass } = await supabase
    .from("classes")
    .select("*, education_modules(title)")
    .eq("id", id)
    .maybeSingle();

  if (!trainingClass) notFound();

  const [enrollments, announcements, materials] = await Promise.all([
    getClassEnrollments(id),
    getClassAnnouncements(id),
    getClassMaterials(id),
  ]);

  const approvedCount = enrollments.filter((e) => !["pending", "cancelled"].includes(e.status)).length;
  const pendingCount = enrollments.filter((e) => e.status === "pending").length;

  const signedUrlMap: Record<string, string> = {};
  const filePaths = materials.filter((m) => m.file_path).map((m) => m.file_path!);
  if (filePaths.length > 0) {
    const { data: signed } = await supabase.storage.from("class-materials").createSignedUrls(filePaths, 3600);
    signed?.forEach((entry) => {
      if (entry.signedUrl && entry.path) signedUrlMap[entry.path] = entry.signedUrl;
    });
  }

  const initialTab: ClassDetailTab =
    tab === "students" || tab === "announcements" || tab === "materials" ? tab : "general";

  return (
    <>
      <Link href="/admin/siniflar" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Sınıf Yönetimi
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">{trainingClass.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {trainingClass.education_modules?.title} · {new Date(trainingClass.start_date).toLocaleDateString("tr-TR")}
        {" · "}{approvedCount}/{trainingClass.capacity} öğrenci
      </p>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      <div className="mt-6">
        <ClassDetailTabs
          trainingClass={trainingClass}
          approvedCount={approvedCount}
          pendingCount={pendingCount}
          enrollments={enrollments}
          announcements={announcements}
          materials={materials}
          signedUrlMap={signedUrlMap}
          initialTab={initialTab}
        />
      </div>
    </>
  );
}
