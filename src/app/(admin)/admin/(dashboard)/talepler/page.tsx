// src/app/(admin)/admin/(dashboard)/talepler/page.tsx — tüm talepler tek yerde: liste (masaüstü tablo / mobil kart) ve durum panosu
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/feedback";
import { Avatar } from "@/components/ui/data";
import { cn } from "@/lib/utils";
import { formatDateShort, formatTRY } from "@/lib/format";
import { requestStatusAdminLabels, type RequestStatus } from "@/lib/types/platform";
import { getAdminRequests, getAdmins, type AdminRequestListItem } from "@/lib/queries/admin-requests";
import { RequestFilters } from "@/components/admin/requests/request-filters";
import { RequestStatusMenu } from "@/components/admin/requests/request-status-menu";
import { AgeLabel, RequestKindBadge, RequestStatusBadge, isOverdue } from "@/components/admin/requests/bits";

export const metadata: Metadata = { title: "Talepler" };

const BOARD_COLUMNS: RequestStatus[] = ["received", "quoted", "approved", "planned", "in_progress", "completed"];

type SearchParams = Promise<Record<string, string | undefined>>;

function amountOf(item: AdminRequestListItem) {
  const value = item.quote_amount ?? item.price_estimate;
  return value ? formatTRY(value) : "";
}

function RequestTable({ items }: { items: AdminRequestListItem[] }) {
  return (
    <>
      {/* Masaüstü tablo */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-paper shadow-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface/60 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-soft">
            <tr>
              <th className="px-4 py-3">Talep</th>
              <th className="px-4 py-3">Üye</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Sorumlu</th>
              <th className="px-4 py-3 text-right">Tutar</th>
              <th className="px-4 py-3 text-right">Son hareket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => (
              <tr key={item.id} className={cn("transition-colors hover:bg-surface/60", isOverdue(item) && "bg-amber-soft/40")}>
                <td className="max-w-80 px-4 py-3">
                  <Link href={`/admin/talepler/${item.id}`} className="block font-semibold text-ink hover:text-accent">
                    <span className="line-clamp-1">{item.title || "Başlıksız talep"}</span>
                  </Link>
                  <div className="mt-1">
                    <RequestKindBadge kind={item.kind} mode={item.training_mode} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={item.member.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.member.name}</p>
                      <p className="truncate text-xs text-ink-soft">{item.member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RequestStatusBadge status={item.status} size="sm" />
                </td>
                <td className="px-4 py-3 text-ink-soft">{item.assignee?.name ?? "—"}</td>
                <td className="tabular px-4 py-3 text-right font-mono">{amountOf(item) || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <AgeLabel item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil kartlar */}
      <ul className="flex flex-col gap-2.5 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/admin/talepler/${item.id}`}
              className={cn(
                "block rounded-2xl border bg-paper p-4 shadow-card",
                isOverdue(item) ? "border-amber/60" : "border-line",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-semibold text-ink">{item.title || "Başlıksız talep"}</p>
                <RequestStatusBadge status={item.status} size="sm" />
              </div>
              <p className="mt-1 truncate text-sm text-ink-soft">{item.member.name}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <RequestKindBadge kind={item.kind} mode={item.training_mode} />
                <AgeLabel item={item} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function RequestBoard({ items }: { items: AdminRequestListItem[] }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
      <div className="grid min-w-max auto-cols-[17rem] grid-flow-col gap-3">
        {BOARD_COLUMNS.map((status) => {
          const column = items.filter((item) => item.status === status);
          return (
            <section key={status} aria-label={requestStatusAdminLabels[status]} className="flex flex-col rounded-2xl bg-surface/80 p-2 ring-1 ring-inset ring-line">
              <header className="flex items-center justify-between px-2 pb-2 pt-1">
                <RequestStatusBadge status={status} size="sm" />
                <span className="tabular font-mono text-xs text-ink-soft">{column.length}</span>
              </header>
              <div className="flex flex-col gap-2">
                {column.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-muted">Bu sütunda talep yok</p>}
                {column.map((item) => (
                  <article
                    key={item.id}
                    className={cn("rounded-xl border bg-paper p-3 shadow-card", isOverdue(item) ? "border-amber/60" : "border-line")}
                  >
                    <div className="flex items-start gap-2">
                      <Link href={`/admin/talepler/${item.id}`} className="min-w-0 flex-1 text-sm font-semibold leading-snug text-ink hover:text-accent">
                        {item.title || "Başlıksız talep"}
                      </Link>
                      <RequestStatusMenu requestId={item.id} status={item.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-ink-soft">{item.member.name}</p>
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                      <RequestKindBadge kind={item.kind} mode={item.training_mode} />
                      {amountOf(item) && <span className="tabular font-mono text-xs">{amountOf(item)}</span>}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <AgeLabel item={item} />
                      {item.due_date && <span className="tabular font-mono text-[11px] text-ink-soft">Teslim {formatDateShort(item.due_date)}</span>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default async function RequestsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [items, admins] = await Promise.all([
    getAdminRequests({ kind: params.kind, status: params.status, assignee: params.assignee, q: params.q }),
    getAdmins(),
  ]);
  const view = params.view === "board" ? "board" : "list";
  const filtered = Boolean(params.kind || params.status || params.assignee || params.q);
  const overdue = items.filter(isOverdue).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Talepler"
        description={
          overdue > 0
            ? `${overdue} yeni talep 24 saatten uzun süredir yanıt bekliyor. Sıralama son harekete göre.`
            : "Analiz, tez, kurumsal ve birebir eğitim talepleri tek hatta. Sıralama son harekete göre."
        }
      />
      <Suspense>
        <RequestFilters admins={admins} />
      </Suspense>
      {items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filtered ? "Bu filtrelerle talep yok" : "Henüz talep yok"}
          description={filtered ? "Filtreleri gevşet ya da aramayı temizle." : "Üyeler teklif sihirbazından talep gönderdiğinde burada görünür."}
        />
      ) : view === "board" ? (
        <RequestBoard items={items} />
      ) : (
        <RequestTable items={items} />
      )}
    </div>
  );
}
