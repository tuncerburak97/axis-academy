// src/app/(admin)/admin/(dashboard)/siniflar/[id]/page.tsx — eğitim içerik yönetimi + dosya önizleme
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, Paperclip } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  createMaterial,
  deleteMaterial,
  updateClassDetails,
  updateMaterial,
} from "@/lib/actions/admin-classes";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { materialCategoryLabels } from "@/lib/types/catalog";
import type { ClassMaterial, MaterialCategory } from "@/lib/types/catalog";
import { isPdfPath } from "@/lib/materials";
import { buildClassProgress, computeAutoWeek } from "@/lib/syllabus";
import {
  NumberInput,
  SelectField,
  StatusBanner,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/fields";

export const metadata: Metadata = { title: "Eğitim İçeriği", robots: { index: false } };
export const dynamic = "force-dynamic";

const categoryOptions = Object.entries(materialCategoryLabels).map(([value, label]) => ({ value, label }));
const categoryOrder: MaterialCategory[] = ["general", "weekly", "homework", "note"];

const fileInputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent";

export default async function ClassContentManagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const supabase = await createClient();

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

  const autoWeek = computeAutoWeek(trainingClass.start_date);
  const progress = buildClassProgress(
    trainingClass.start_date,
    trainingClass.duration_weeks,
    trainingClass.current_week_override,
  );

  const signedUrlMap = new Map<string, string>();
  const filePaths = materials.filter((m) => m.file_path).map((m) => m.file_path!);
  if (filePaths.length > 0) {
    const { data: signed } = await supabase.storage.from("class-materials").createSignedUrls(filePaths, 3600);
    signed?.forEach((entry) => {
      if (entry.signedUrl && entry.path) signedUrlMap.set(entry.path, entry.signedUrl);
    });
  }

  return (
    <>
      <Link href="/admin/siniflar" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Sınıf Yönetimi
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">{trainingClass.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {trainingClass.education_modules?.title} · {new Date(trainingClass.start_date).toLocaleDateString("tr-TR")}
      </p>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      <section aria-labelledby="class-info-heading" className="max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 id="class-info-heading" className="font-display text-lg font-semibold">Eğitim Bilgileri</h2>
        <form action={updateClassDetails} className="mt-4 space-y-4">
          <input type="hidden" name="class_id" value={trainingClass.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput label="Süre (hafta)" name="duration_weeks" defaultValue={trainingClass.duration_weeks} min={0} />
            <NumberInput
              label="Güncel hafta override (boş = otomatik)"
              name="current_week_override"
              defaultValue={trainingClass.current_week_override ?? undefined}
              min={1}
            />
          </div>
          <p className="rounded-lg bg-surface px-3 py-2 text-xs text-ink-soft">
            Otomatik hesaplanan hafta: <strong>{autoWeek}</strong> · Öğrenci panelinde görünen:{" "}
            <strong>Hafta {progress.effectiveWeek}</strong>
            {progress.isManualOverride && " (manuel override aktif)"}
          </p>
          <TextArea
            label="Genel içerik / tanıtım (kayıtlı kullanıcı görür; Markdown desteklenir)"
            name="overview"
            defaultValue={trainingClass.overview}
            rows={5}
          />
          <SubmitButton>Kaydet</SubmitButton>
        </form>
      </section>

      {categoryOrder.map((category) => {
        const categoryMaterials = materials.filter((material) => material.category === category);
        return (
          <section key={category} aria-label={materialCategoryLabels[category]} className="mt-10">
            <h2 className="font-display text-lg font-semibold">
              {materialCategoryLabels[category]}
              <span className="ml-2 text-sm font-normal text-ink-soft">({categoryMaterials.length})</span>
            </h2>
            <div className="mt-3 space-y-3">
              {categoryMaterials.map((material) => {
                const signedUrl = material.file_path ? signedUrlMap.get(material.file_path) : null;
                return (
                  <details key={material.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
                    <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-3 text-sm">
                      <FileText className="size-4 text-accent" aria-hidden />
                      <span className="font-semibold">{material.title}</span>
                      {material.week_number && (
                        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                          Hafta {material.week_number}
                        </span>
                      )}
                      {material.file_path && (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
                          <Paperclip className="size-3.5" aria-hidden />
                          {material.file_path.split("/").pop()}
                        </span>
                      )}
                    </summary>
                    {signedUrl && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        <a
                          href={signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-accent hover:bg-accent-soft"
                        >
                          <Download className="size-4" aria-hidden /> Dosyayı Aç
                        </a>
                        {isPdfPath(material.file_path!) && (
                          <iframe
                            src={signedUrl}
                            title={`${material.title} önizleme`}
                            className="h-48 w-full rounded-lg border border-line sm:h-64"
                          />
                        )}
                      </div>
                    )}
                    <form action={updateMaterial} className="mt-4 space-y-4">
                      <input type="hidden" name="material_id" value={material.id} />
                      <input type="hidden" name="class_id" value={trainingClass.id} />
                      <MaterialFields material={material} />
                      <div>
                        <label htmlFor={`file-${material.id}`} className="block text-sm font-medium">
                          Dosyayı değiştir <span className="font-normal text-ink-soft">(isteğe bağlı)</span>
                        </label>
                        <input
                          id={`file-${material.id}`}
                          name="file"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.md"
                          className={fileInputClass}
                        />
                      </div>
                      <SubmitButton>Güncelle</SubmitButton>
                    </form>
                    <div className="mt-3">
                      <ConfirmDeleteButton
                        action={deleteMaterial}
                        hiddenFields={[
                          { name: "material_id", value: material.id },
                          { name: "class_id", value: trainingClass.id },
                        ]}
                        label="Materyali Sil"
                        confirmTitle="Materyali sil?"
                        confirmMessage={`"${material.title}" kalıcı olarak silinecek.`}
                      />
                    </div>
                  </details>
                );
              })}
              {categoryMaterials.length === 0 && (
                <p className="rounded-xl border border-dashed border-line bg-white p-4 text-sm text-ink-soft">
                  Bu kategoride materyal yok.
                </p>
              )}
            </div>
          </section>
        );
      })}

      <section aria-labelledby="new-material-heading" className="mt-10 max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 id="new-material-heading" className="font-display text-lg font-semibold">Yeni Materyal Ekle</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Markdown içerik yazabilir, PDF/Word dosyası ekleyebilir ya da ikisini birlikte kullanabilirsin.
        </p>
        <form action={createMaterial} className="mt-4 space-y-4" encType="multipart/form-data">
          <input type="hidden" name="class_id" value={trainingClass.id} />
          <MaterialFields />
          <div>
            <label htmlFor="material-file" className="block text-sm font-medium">
              Dosya <span className="font-normal text-ink-soft">(isteğe bağlı, max 20MB)</span>
            </label>
            <input
              id="material-file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.md"
              className={fileInputClass}
            />
          </div>
          <SubmitButton>Materyal Ekle</SubmitButton>
        </form>
      </section>
    </>
  );
}

function MaterialFields({ material }: { material?: ClassMaterial }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField label="Kategori" name="category" defaultValue={material?.category} options={categoryOptions} />
        <NumberInput label="Hafta no (haftalık ise)" name="week_number" defaultValue={material?.week_number ?? undefined} min={1} />
        <NumberInput label="Sıra" name="sort_order" defaultValue={material?.sort_order ?? 0} min={0} />
      </div>
      <TextInput label="Başlık" name="title" defaultValue={material?.title} required />
      <TextArea
        label="İçerik (Markdown)"
        name="content_md"
        defaultValue={material?.content_md}
        rows={8}
      />
    </>
  );
}
