// src/app/(panel)/panel/talepler/page.tsx — taleplerim: filtre çipleri, durum hattı, işlem bekleyen vurgusu
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyRequests } from "@/lib/queries/member";
import { requestFilterLabels, requestMatchesFilter, type RequestFilter } from "@/lib/queries/member-types";
import { applyDiscount, formatDateShort, formatRelative } from "@/lib/format";
import { requestKindLabels, requestNeedsMemberAction, requestTrack } from "@/lib/types/platform";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/data";
import { EmptyState } from "@/components/ui/feedback";
import { Accent, PageHeader } from "@/components/ui/page-header";
import { StatusTrack } from "@/components/ui/progress";
import { NewRequestMenu } from "@/components/panel/new-request-menu";
import { RequestStatusBadge } from "@/components/panel/status-badges";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Taleplerim" };
export const dynamic = "force-dynamic";

const filters = Object.keys(requestFilterLabels) as RequestFilter[];

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const { durum } = await searchParams;
  const filter: RequestFilter = filters.includes(durum as RequestFilter) ? (durum as RequestFilter) : "tumu";
  const user = await requireUser("/panel/talepler");
  const requests = await getMyRequests(user.id);
  const visible = requests.filter((request) => requestMatchesFilter(request, filter));
  // İşlem bekleyenler her zaman üstte
  visible.sort((a, b) => Number(requestNeedsMemberAction(b)) - Number(requestNeedsMemberAction(a)));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={<Accent>Taleplerim</Accent>}
        description="Analiz, tez düzenleme ve birebir eğitim taleplerin. Teklifleri onayla, ekiple yazış, dosyalarını yönet."
        actions={<NewRequestMenu variant="primary" />}
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Henüz talebin yok"
          description="İhtiyacını birkaç adımda anlat; ekibimiz inceleyip panelinde teklif sunsun."
          action={<NewRequestMenu variant="primary" align="center" label="Talep oluştur" />}
        />
      ) : (
        <>
          <nav aria-label="Talep filtresi" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {filters.map((key) => {
              const count = requests.filter((request) => requestMatchesFilter(request, key)).length;
              const active = key === filter;
              return (
                <Link
                  key={key}
                  href={key === "tumu" ? "/panel/talepler" : `/panel/talepler?durum=${key}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors",
                    active ? "border-ink bg-ink text-white" : "border-line-strong bg-paper text-ink-soft hover:border-ink-muted hover:text-ink",
                  )}
                >
                  {requestFilterLabels[key]}
                  <span
                    className={cn(
                      "tabular font-mono text-xs",
                      active ? "text-white/70" : key === "bekleyen" && count > 0 ? "rounded-full bg-amber px-1.5 text-ink" : "text-ink-muted",
                    )}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </nav>

          {visible.length === 0 ? (
            <EmptyState title="Bu filtrede talep yok" description="Başka bir filtre seç ya da tüm taleplerine dön." action={<Link className="text-sm font-semibold text-accent hover:underline" href="/panel/talepler">Tüm talepler</Link>} />
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((request) => {
                const track = requestTrack(request.kind, request.training_mode, request.status);
                const needsAction = requestNeedsMemberAction(request);
                return (
                  <li key={request.id}>
                    <Link href={`/panel/talepler/${request.id}`} className="group block">
                      <Card
                        variant="interactive"
                        className={cn("flex flex-col gap-4", needsAction && "border-amber shadow-[0_0_0_3px_rgb(245_158_11/0.12)]")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{requestKindLabels[request.kind]}</p>
                            <p className="mt-0.5 font-semibold text-balance group-hover:text-accent">{request.title || requestKindLabels[request.kind]}</p>
                          </div>
                          <RequestStatusBadge status={request.status} size="sm" />
                        </div>
                        <StatusTrack steps={track.labels} current={track.current} finished={track.finished} className="max-w-xl" />
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
                          {needsAction ? (
                            <span className="flex flex-wrap items-center gap-x-2 font-semibold text-amber-ink">
                              Teklif onayını bekliyor
                              {request.quote_amount ? (
                                <Price amount={applyDiscount(request.quote_amount, request.discount_percent)} className="text-ink" />
                              ) : null}
                              {request.quote_valid_until && (
                                <span className="font-normal text-ink-soft">· {formatDateShort(request.quote_valid_until)} tarihine kadar</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-ink-soft">
                              {request.progress_note ? <span className="line-clamp-1">{request.progress_note}</span> : <>Son hareket {formatRelative(request.last_activity_at)}</>}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 font-semibold text-accent">
                            {needsAction ? "Teklifi incele" : "Ayrıntılar"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
