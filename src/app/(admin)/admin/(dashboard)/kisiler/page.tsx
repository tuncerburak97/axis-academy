// src/app/(admin)/admin/(dashboard)/kisiler/page.tsx — kişiler: arama, rol filtresi, talep/kayıt sayıları
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/data";
import { EmptyState } from "@/components/ui/feedback";
import { formatDate } from "@/lib/format";
import { getPeople } from "@/lib/queries/admin-people";
import { UrlSearchInput, UrlSelect } from "@/components/admin/url-filters";
import { roleLabels } from "@/components/admin/lib/labels";

export const metadata: Metadata = { title: "Kişiler" };

const roleTone = { admin: "solid", instructor: "accent", user: "neutral" } as const;

export default async function PeoplePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const people = await getPeople({ q: params.q, role: params.rol });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Kişiler" description="Üyeler, eğitmenler ve ekip. Rol değiştirmek ya da hesabı silmek için kişiyi aç." />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Suspense>
          <UrlSearchInput placeholder="Ad, e-posta ya da telefon" label="Kişilerde ara" />
          <UrlSelect
            name="rol"
            label="Rol"
            allLabel="Tüm roller"
            className="sm:w-44"
            options={Object.entries(roleLabels).map(([value, label]) => ({ value, label }))}
          />
        </Suspense>
      </div>
      {people.length === 0 ? (
        <EmptyState icon={Users} title="Kişi bulunamadı" description="Aramayı ya da rol filtresini değiştir." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
          <ul className="divide-y divide-line">
            {people.map((person) => (
              <li key={person.user_id}>
                <Link href={`/admin/kisiler/${person.user_id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/60">
                  <Avatar name={person.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{person.name}</p>
                    <p className="truncate text-xs text-ink-soft">{person.email}</p>
                  </div>
                  <div className="hidden shrink-0 gap-6 text-right text-xs text-ink-soft md:flex">
                    <span>
                      <span className="tabular block font-mono text-sm text-ink">{person.requests}</span>talep
                    </span>
                    <span>
                      <span className="tabular block font-mono text-sm text-ink">{person.enrollments}</span>kayıt
                    </span>
                    <span className="w-28">
                      <span className="tabular block font-mono text-sm text-ink">{formatDate(person.created_at)}</span>katıldı
                    </span>
                  </div>
                  {person.role !== "user" && (
                    <Badge size="sm" tone={roleTone[person.role as keyof typeof roleTone] ?? "neutral"}>
                      {roleLabels[person.role] ?? person.role}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {people.length === 200 && <p className="text-sm text-ink-soft">İlk 200 kişi gösteriliyor. Daraltmak için ara.</p>}
    </div>
  );
}
