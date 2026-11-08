// src/app/(admin)/admin/(dashboard)/programlar/page.tsx — program kataloğu: yayın durumu, müfredat, paket, konu ve açık dönem sayıları
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { programLevelLabels, type ProgramLevel } from "@/lib/types/platform";
import { getAdminPrograms } from "@/lib/queries/admin-catalog";
import { NewProgramDialog } from "@/components/admin/programs/new-program-dialog";
import { categoryLabels } from "@/components/admin/lib/labels";

export const metadata: Metadata = { title: "Programlar" };

export default async function ProgramsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const programs = await getAdminPrograms();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Programlar"
        description="Katalogdaki eğitim programları. Müfredat, paketler, fiyatlar ve birebir konu havuzu programın içinde."
        actions={<NewProgramDialog defaultOpen={params.yeni === "1"} />}
      />
      {programs.length === 0 ? (
        <EmptyState icon={BookOpen} title="Henüz program yok" description="İlk programı oluştur, müfredatını ekle ve yayına al." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => (
            <li key={program.id}>
              <Link
                href={`/admin/programlar/${program.id}`}
                className="flex h-full flex-col rounded-2xl border border-line bg-paper p-5 shadow-card transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-raise"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={program.is_active ? "success" : "neutral"} size="sm" dot>
                    {program.is_active ? "Yayında" : "Pasif"}
                  </Badge>
                  <Badge size="sm">{categoryLabels[program.category] ?? program.category}</Badge>
                  <Badge size="sm">{programLevelLabels[program.level as ProgramLevel] ?? program.level}</Badge>
                  {program.badge && (
                    <Badge size="sm" tone="amber">
                      {program.badge}
                    </Badge>
                  )}
                </div>
                <p className="mt-3 font-semibold text-ink">{program.title}</p>
                {program.description && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{program.description}</p>}
                <dl className="mt-auto grid grid-cols-4 gap-2 pt-4 text-center">
                  {[
                    ["Hafta", program.weeks],
                    ["Paket", program.bundles],
                    ["Konu", program.topics],
                    ["Dönem", program.cohorts],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex flex-col-reverse rounded-xl bg-surface py-2">
                      <dt className="text-[11px] text-ink-soft">{label}</dt>
                      <dd className="tabular font-mono text-base font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
                {!program.is_active && program.weeks === 0 && <p className="mt-3 text-xs text-amber-ink">Yayına almak için müfredat ekle.</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
