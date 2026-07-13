// src/components/admin/module-list-card.tsx — modül liste kartı: Detaya Git + Sil
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { deleteModule } from "@/lib/actions/admin-delete";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { categoryLabels } from "@/lib/types/catalog";
import type { EducationModule } from "@/lib/types/catalog";

interface ModuleListCardProps {
  module: EducationModule;
}

export function ModuleListCard({ module }: ModuleListCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {categoryLabels[module.category]}
        </p>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            module.is_active ? "bg-green-50 text-green-800" : "bg-surface text-ink-soft"
          }`}
        >
          {module.is_active ? "Aktif" : "Pasif"}
        </span>
      </div>
      <p className="mt-2 font-display text-lg font-semibold">{module.title}</p>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-soft">{module.description}</p>
      {module.public_price_hint && (
        <p className="mt-3 inline-flex w-fit rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-semibold">
          {module.public_price_hint}
        </p>
      )}
      <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/admin/moduller/${module.id}`}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          Detaya Git
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <ConfirmDeleteButton
          action={deleteModule}
          hiddenFields={[{ name: "module_id", value: module.id }]}
          label="Sil"
          confirmTitle="Modülü kalıcı olarak sil?"
          confirmMessage={`"${module.title}" ve tüm bağlı veriler silinecek.`}
        />
      </div>
    </article>
  );
}
