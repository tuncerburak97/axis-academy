// src/components/admin/class-materials-panel.tsx — materyal yönetimi (kategori alt-sekmeleri)
"use client";

import { useState } from "react";
import { Download, FileText, Paperclip } from "lucide-react";
import { createMaterial, deleteMaterial, updateMaterial } from "@/lib/actions/admin-classes";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { materialCategoryLabels } from "@/lib/types/catalog";
import type { ClassMaterial, MaterialCategory } from "@/lib/types/catalog";
import { FilePreview } from "@/components/shared/file-preview";
import { supportsPreview } from "@/lib/file-preview";
import { NumberInput, SelectField, SubmitButton, TextArea, TextInput } from "@/components/admin/fields";

const categoryOrder: MaterialCategory[] = ["general", "weekly", "homework", "note"];
const categoryOptions = Object.entries(materialCategoryLabels).map(([value, label]) => ({ value, label }));

const fileInputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent";

interface ClassMaterialsPanelProps {
  classId: string;
  materials: ClassMaterial[];
  signedUrlMap: Record<string, string>;
}

export function ClassMaterialsPanel({ classId, materials, signedUrlMap }: ClassMaterialsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>("weekly");

  return (
    <div>
      <div role="tablist" aria-label="Materyal kategorileri" className="scroll-fade-x border-b border-line">
        <div className="flex gap-1 overflow-x-auto">
          {categoryOrder.map((cat) => {
            const count = materials.filter((m) => m.category === cat).length;
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-11 shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold sm:px-4 ${
                  isActive ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {materialCategoryLabels[cat]}
                <span className="ml-1.5 rounded-full bg-surface px-2 py-0.5 text-xs">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="mt-6">
        <CategoryMaterials
          classId={classId}
          category={activeCategory}
          materials={materials.filter((m) => m.category === activeCategory)}
          signedUrlMap={signedUrlMap}
        />
      </div>

      <section className="mt-10 max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold">Yeni Materyal Ekle</h3>
        <form action={createMaterial} className="mt-4 space-y-4" encType="multipart/form-data">
          <input type="hidden" name="class_id" value={classId} />
          <MaterialFields defaultCategory={activeCategory} />
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
    </div>
  );
}

function CategoryMaterials({
  classId,
  category,
  materials,
  signedUrlMap,
}: {
  classId: string;
  category: MaterialCategory;
  materials: ClassMaterial[];
  signedUrlMap: Record<string, string>;
}) {
  if (materials.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
        {materialCategoryLabels[category]} kategorisinde materyal yok.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {materials.map((material) => {
        const signedUrl = material.file_path ? signedUrlMap[material.file_path] : null;
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
              <div className="mt-3">
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-accent hover:bg-accent-soft"
                >
                  <Download className="size-4" aria-hidden /> Dosyayı Aç
                </a>
                {material.file_path && supportsPreview(material.file_path) && (
                  <FilePreview
                    url={signedUrl}
                    title={material.title}
                    filePath={material.file_path}
                    compact
                  />
                )}
              </div>
            )}
            <form action={updateMaterial} className="mt-4 space-y-4" encType="multipart/form-data">
              <input type="hidden" name="material_id" value={material.id} />
              <input type="hidden" name="class_id" value={classId} />
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
                  { name: "class_id", value: classId },
                ]}
                label="Materyali Sil"
                confirmTitle="Materyali sil?"
                confirmMessage={`"${material.title}" kalıcı olarak silinecek.`}
              />
            </div>
          </details>
        );
      })}
    </div>
  );
}

function MaterialFields({
  material,
  defaultCategory,
}: {
  material?: ClassMaterial;
  defaultCategory?: MaterialCategory;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Kategori"
          name="category"
          defaultValue={material?.category ?? defaultCategory}
          options={categoryOptions}
        />
        <NumberInput label="Hafta no" name="week_number" defaultValue={material?.week_number ?? undefined} min={1} />
        <NumberInput label="Sıra" name="sort_order" defaultValue={material?.sort_order ?? 0} min={0} />
      </div>
      <TextInput label="Başlık" name="title" defaultValue={material?.title} required />
      <TextArea label="İçerik (Markdown)" name="content_md" defaultValue={material?.content_md} rows={8} />
    </>
  );
}
