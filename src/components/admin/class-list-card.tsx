// src/components/admin/class-list-card.tsx — sınıf liste kartı
import Link from "next/link";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { deleteClass } from "@/lib/actions/admin-delete";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { categoryLabels, classStatusLabels } from "@/lib/types/catalog";
import type { AdminClassRow } from "@/lib/types/catalog";

interface ClassListCardProps {
  trainingClass: AdminClassRow;
}

export function ClassListCard({ trainingClass }: ClassListCardProps) {
  const approvedCount = trainingClass.class_enrollments.filter(
    (e) => !["pending", "cancelled"].includes(e.status),
  ).length;
  const pendingCount = trainingClass.class_enrollments.filter((e) => e.status === "pending").length;

  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {trainingClass.education_modules
            ? categoryLabels[trainingClass.education_modules.category]
            : "Eğitim"}
        </p>
        <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
          {classStatusLabels[trainingClass.status]}
        </span>
      </div>
      <p className="mt-2 font-display text-lg font-semibold leading-snug">{trainingClass.title}</p>
      <p className="mt-1 text-sm text-ink-soft">{trainingClass.education_modules?.title}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-ink-soft">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
          <CalendarDays className="size-3.5" aria-hidden />
          {new Date(trainingClass.start_date).toLocaleDateString("tr-TR")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-accent">
          <Users className="size-3.5" aria-hidden />
          {approvedCount}/{trainingClass.capacity}
        </span>
        {pendingCount > 0 && (
          <span className="rounded-full bg-amber-soft px-2.5 py-1 font-semibold text-amber-900">
            {pendingCount} bekleyen
          </span>
        )}
      </div>
      <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/admin/siniflar/${trainingClass.id}`}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          Detaya Git
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <ConfirmDeleteButton
          action={deleteClass}
          hiddenFields={[{ name: "class_id", value: trainingClass.id }]}
          label="Sil"
          confirmTitle="Sınıfı kalıcı olarak sil?"
          confirmMessage={`"${trainingClass.title}" ve tüm materyalleri silinecek.`}
        />
      </div>
    </article>
  );
}
