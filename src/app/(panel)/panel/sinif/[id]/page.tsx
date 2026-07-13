// src/app/(panel)/panel/sinif/[id]/page.tsx — kayıtlı kullanıcının eğitim içerik sayfası:
// genel bilgiler + kategori tab'larıyla materyaller (yalnız onaylı kayıtlılar erişir)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { ClassMaterial } from "@/lib/types/catalog";
import { ClassMaterialsTabs, type MaterialWithUrl } from "@/components/panel/class-materials-tabs";

export const metadata: Metadata = { title: "Eğitim İçeriği" };
export const dynamic = "force-dynamic";

export default async function MemberClassContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  // Erişim: yalnız onaylı kayıt (pending/cancelled hariç)
  const { data: enrollment } = await supabase
    .from("class_enrollments")
    .select("status")
    .eq("class_id", id)
    .eq("user_id", user.id)
    .not("status", "in", "(pending,cancelled)")
    .maybeSingle();
  if (!enrollment) notFound();

  const [classResult, materialsResult] = await Promise.all([
    supabase.from("classes").select("*, education_modules(title)").eq("id", id).maybeSingle(),
    supabase
      .from("class_materials")
      .select("*")
      .eq("class_id", id)
      .order("week_number", { nullsFirst: true })
      .order("sort_order"),
  ]);

  const trainingClass = classResult.data;
  if (!trainingClass) notFound();
  const materials = (materialsResult.data ?? []) as ClassMaterial[];

  // Dosyalı materyaller için 1 saatlik imzalı indirme linkleri
  const signedUrlMap = new Map<string, string>();
  const filePaths = materials.filter((material) => material.file_path).map((material) => material.file_path!);
  if (filePaths.length > 0) {
    const { data: signed } = await supabase.storage.from("class-materials").createSignedUrls(filePaths, 3600);
    signed?.forEach((entry) => {
      if (entry.signedUrl && entry.path) signedUrlMap.set(entry.path, entry.signedUrl);
    });
  }

  const materialsWithUrls: MaterialWithUrl[] = materials.map((material) => ({
    ...material,
    signedUrl: material.file_path ? (signedUrlMap.get(material.file_path) ?? null) : null,
  }));

  return (
    <>
      <Link href="/panel" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Eğitimlerim
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">{trainingClass.title}</h1>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4" aria-hidden />
          {new Date(trainingClass.start_date).toLocaleDateString("tr-TR")}
          {trainingClass.schedule_note && ` · ${trainingClass.schedule_note}`}
        </span>
        {trainingClass.duration_weeks > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-4" aria-hidden /> {trainingClass.duration_weeks} hafta
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden /> {trainingClass.duration_hours} saat
        </span>
      </div>

      {trainingClass.overview && (
        <div className="mt-6 rounded-xl border border-line bg-accent-soft/50 p-6">
          <h2 className="font-display text-lg font-semibold">Eğitim Hakkında</h2>
          <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-soft">
            {trainingClass.overview.split("\n").filter(Boolean).map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <ClassMaterialsTabs materials={materialsWithUrls} />
      </div>
    </>
  );
}
