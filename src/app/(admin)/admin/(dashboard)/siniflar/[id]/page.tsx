// src/app/(admin)/admin/(dashboard)/siniflar/[id]/page.tsx — eğitim içerik yönetimi:
// genel bilgiler + kategori bazlı materyal (doküman/MD not/ödev) CRUD
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Paperclip } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  createMaterial,
  deleteMaterial,
  updateClassDetails,
  updateMaterial,
} from "@/lib/actions/admin-classes";
import { materialCategoryLabels } from "@/lib/types/catalog";
import type { ClassMaterial, MaterialCategory } from "@/lib/types/catalog";
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

      {/* Eğitim genel bilgileri */}
      <section aria-labelledby="class-info-heading" className="max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 id="class-info-heading" className="font-display text-lg font-semibold">Eğitim Bilgileri</h2>
        <form action={updateClassDetails} className="mt-4 space-y-4">
          <input type="hidden" name="class_id" value={trainingClass.id} />
          <div className="max-w-40">
            <NumberInput label="Süre (hafta)" name="duration_weeks" defaultValue={trainingClass.duration_weeks} min={0} />
          </div>
          <TextArea
            label="Genel içerik / tanıtım (kayıtlı kullanıcı görür; Markdown desteklenir)"
            name="overview"
            defaultValue={trainingClass.overview}
            rows={5}
          />
          <SubmitButton>Kaydet</SubmitButton>
        </form>
      </section>

      {/* Materyaller: kategori bazlı */}
      {categoryOrder.map((category) => {
        const categoryMaterials = materials.filter((material) => material.category === category);
        return (
          <section key={category} aria-label={materialCategoryLabels[category]} className="mt-10">
            <h2 className="font-display text-lg font-semibold">
              {materialCategoryLabels[category]}
              <span className="ml-2 text-sm font-normal text-ink-soft">({categoryMaterials.length})</span>
            </h2>
            <div className="mt-3 space-y-3">
              {categoryMaterials.map((material) => (
                <details key={material.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
                  <summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm">
                    <FileText className="size-4 text-accent" aria-hidden />
                    <span className="font-semibold">{material.title}</span>
                    {material.week_number && (
                      <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                        Hafta {material.week_number}
                      </span>
                    )}
                    {material.file_path && (
                      <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
                        <Paperclip className="size-3.5" aria-hidden /> dosya ekli
                      </span>
                    )}
                  </summary>
                  <form action={updateMaterial} className="mt-4 space-y-4">
                    <input type="hidden" name="material_id" value={material.id} />
                    <input type="hidden" name="class_id" value={trainingClass.id} />
                    <MaterialFields material={material} />
                    <SubmitButton>Güncelle</SubmitButton>
                  </form>
                  <form action={deleteMaterial} className="mt-2">
                    <input type="hidden" name="material_id" value={material.id} />
                    <input type="hidden" name="class_id" value={trainingClass.id} />
                    <button type="submit" className="text-sm font-semibold text-red-700 hover:underline">
                      Materyali Sil
                    </button>
                  </form>
                </details>
              ))}
              {categoryMaterials.length === 0 && (
                <p className="rounded-xl border border-dashed border-line bg-white p-4 text-sm text-ink-soft">
                  Bu kategoride materyal yok.
                </p>
              )}
            </div>
          </section>
        );
      })}

      {/* Yeni materyal */}
      <section aria-labelledby="new-material-heading" className="mt-10 max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 id="new-material-heading" className="font-display text-lg font-semibold">Yeni Materyal Ekle</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Markdown içerik yazabilir, PDF/Word dosyası ekleyebilir ya da ikisini birlikte kullanabilirsin.
        </p>
        <form action={createMaterial} className="mt-4 space-y-4">
          <input type="hidden" name="class_id" value={trainingClass.id} />
          <MaterialFields />
          <div>
            <label htmlFor="material-file" className="block text-sm font-medium">
              Dosya <span className="font-normal text-ink-soft">(isteğe bağlı, max 20MB — PDF, Word, Excel…)</span>
            </label>
            <input
              id="material-file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.md"
              className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent"
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
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Kategori" name="category" defaultValue={material?.category} options={categoryOptions} />
        <NumberInput label="Hafta no (haftalık ise)" name="week_number" defaultValue={material?.week_number ?? undefined} min={1} />
        <NumberInput label="Sıra" name="sort_order" defaultValue={material?.sort_order ?? 0} min={0} />
      </div>
      <TextInput label="Başlık" name="title" defaultValue={material?.title} required />
      <TextArea
        label="İçerik (Markdown — başlık, liste, tablo desteklenir)"
        name="content_md"
        defaultValue={material?.content_md}
        rows={8}
      />
    </>
  );
}
