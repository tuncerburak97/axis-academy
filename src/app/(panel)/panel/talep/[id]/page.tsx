// src/app/(panel)/panel/talep/[id]/page.tsx — bireysel eğitim detayı: progress + müfredat
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getModuleSyllabus } from "@/lib/queries/catalog";
import { getMyIndividualRequestById } from "@/lib/queries/member";
import { IndividualDetailTabs } from "@/components/panel/individual-detail-tabs";
import { requestTypeLabels } from "@/lib/types/catalog";

export const metadata: Metadata = { title: "Eğitim Detayı" };
export const dynamic = "force-dynamic";

export default async function IndividualRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const request = await getMyIndividualRequestById(id);
  if (!request) notFound();

  const syllabus = await getModuleSyllabus(request.module_id);

  const subtitle =
    request.request_type === "bundle" && request.bundle_packages?.title
      ? request.bundle_packages.title
      : requestTypeLabels[request.request_type];

  return (
    <>
      <Link href="/panel" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Eğitimlerim
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
        {request.education_modules?.title}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>

      <div className="mt-8">
        <IndividualDetailTabs
          status={request.status}
          requestType={request.request_type}
          moduleTitle={request.education_modules?.title ?? "Eğitim"}
          bundleTitle={request.bundle_packages?.title}
          totalHours={request.total_hours}
          calculatedPrice={request.calculated_price}
          progressNote={request.progress_note}
          userMessage={request.user_message}
          createdAt={request.created_at}
          syllabus={syllabus}
        />
      </div>
    </>
  );
}
