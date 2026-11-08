// src/app/(panel)/panel/talepler/[id]/page.tsx — talep detayı: durum hattı, teklif onayı, mesajlar, dosyalar, oturumlar
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Download, FileCheck2, FileText, MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyRequestDetail, type RequestDetail, type RequestFileView } from "@/lib/queries/member";
import { applyDiscount, daysFromToday, formatBytes, formatDate, formatHours, formatRelative, formatTRY } from "@/lib/format";
import {
  analysisMethodLabels,
  requestDetailLabels,
  requestKindLabels,
  requestTrack,
  trainingModeLabels,
  type RequestKind,
  type RequestStatus,
  type TrainingMode,
} from "@/lib/types/platform";
import { cancelRequestAction } from "@/lib/actions/member";
import { Alert } from "@/components/ui/feedback";
import { Avatar } from "@/components/ui/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow } from "@/components/ui/card";
import { StatusTrack } from "@/components/ui/progress";
import { RequestStatusBadge } from "@/components/panel/status-badges";
import { FileUploadForm, MessageForm, QuoteActions } from "@/components/panel/request-forms";
import { ConfirmAction } from "@/components/panel/confirm-action";
import { SessionItem } from "@/components/panel/session-item";
import { ReviewForm, ReviewSummary } from "@/components/panel/review-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Talep" };
export const dynamic = "force-dynamic";

function formatDetailValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.map((item) => formatDetailValue(key, item)).filter(Boolean).join(", ");
  if (typeof value === "boolean") return value ? "Evet" : "Hayır";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  if (key === "method") return analysisMethodLabels[text] ?? text;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return formatDate(text);
  if (key === "pages") return `${text} sayfa`;
  if (key === "headcount") return `${text} kişi`;
  return text;
}

function detailRows(detail: RequestDetail): { label: string; value: string }[] {
  const { request } = detail;
  const rows: { label: string; value: string }[] = [];
  if (request.kind === "training") {
    if (request.training_mode) rows.push({ label: "Eğitim türü", value: trainingModeLabels[request.training_mode as TrainingMode] ?? request.training_mode });
    if (detail.programTitle) rows.push({ label: "Program", value: detail.programTitle });
    if (detail.bundleTitle) rows.push({ label: "Paket", value: detail.bundleTitle });
    if (detail.topics.length) rows.push({ label: "Konular", value: detail.topics.join(", ") });
    if (request.total_hours) rows.push({ label: "Toplam süre", value: formatHours(request.total_hours) });
    if (request.price_estimate) rows.push({ label: "Tahmini ücret", value: formatTRY(request.price_estimate) });
  }
  const details = (request.details && typeof request.details === "object" && !Array.isArray(request.details) ? request.details : {}) as Record<string, unknown>;
  for (const [key, value] of Object.entries(details)) {
    const formatted = formatDetailValue(key, value);
    if (formatted) rows.push({ label: requestDetailLabels[key] ?? key.replace(/_/g, " "), value: formatted });
  }
  if (request.discount_code) rows.push({ label: "İndirim kodu", value: `${request.discount_code}${request.discount_percent ? ` (%${request.discount_percent})` : ""}` });
  if (request.due_date) rows.push({ label: "Planlanan teslim", value: formatDate(request.due_date) });
  rows.push({ label: "Oluşturulma", value: formatDate(request.created_at) });
  return rows;
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/panel/talepler/${id}`);
  const detail = await getMyRequestDetail(id, user.id);
  if (!detail) notFound();

  const { request } = detail;
  const kind = request.kind as RequestKind;
  const status = request.status as RequestStatus;
  const track = requestTrack(kind, request.training_mode as TrainingMode | null, status);
  const title = request.title || requestKindLabels[kind];
  const deliverables = detail.files.filter((file) => file.is_deliverable);
  const uploads = detail.files.filter((file) => !file.is_deliverable);
  const cancellable = status === "received" || status === "quoted";
  const closed = status === "cancelled";
  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Link href="/panel/talepler" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Taleplerim
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">{requestKindLabels[kind]}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-balance sm:text-[28px]">{title}</h1>
            <p className="mt-1 text-sm text-ink-soft">Son hareket {formatRelative(request.last_activity_at)}</p>
          </div>
          <RequestStatusBadge status={status} />
        </div>
      </header>

      <Card>
        <StatusTrack steps={track.labels} current={track.current} finished={track.finished} />
        {request.progress_note && !closed && (
          <p className="mt-5 rounded-xl bg-surface px-4 py-3 text-sm text-ink">
            <span className="font-semibold">Ekipten not: </span>
            {request.progress_note}
          </p>
        )}
      </Card>

      {status === "quoted" && <QuoteCard detail={detail} />}

      {closed && (
        <Alert tone="info" title="Bu talep kapatıldı">
          {request.decided_at ? `${formatDate(request.decided_at)} tarihinde kapatıldı. ` : ""}Yeni bir ihtiyacın olursa yeni talep oluşturabilirsin.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          {(detail.sessions.length > 0 || kind === "training") && (
            <section aria-labelledby="oturumlar" className="flex flex-col gap-3">
              <h2 id="oturumlar" className="text-lg font-semibold tracking-tight">
                Oturumlar
              </h2>
              {detail.sessions.length === 0 ? (
                <Card variant="muted" className="flex items-center gap-3 text-sm text-ink-soft">
                  <CalendarDays className="size-5 shrink-0" aria-hidden />
                  Ders günleri planlandığında oturumlar burada ve takviminde görünür.
                </Card>
              ) : (
                <Card padding="none" className="px-4 sm:px-5">
                  <ul className="divide-y divide-line">
                    {detail.sessions.map((session) => (
                      <SessionItem key={session.id} session={session} showSource={false} past={new Date(session.ends_at).getTime() < now} />
                    ))}
                  </ul>
                </Card>
              )}
            </section>
          )}

          <section aria-labelledby="mesajlar" className="flex flex-col gap-3">
            <h2 id="mesajlar" className="text-lg font-semibold tracking-tight">
              Mesajlar
            </h2>
            <Card className="flex flex-col gap-5">
              {detail.messages.length === 0 ? (
                <div className="flex items-center gap-3 text-sm text-ink-soft">
                  <MessageSquare className="size-5 shrink-0" aria-hidden />
                  Henüz mesaj yok. Sorunu yaz, ekibimiz burada yanıtlasın.
                </div>
              ) : (
                <ol className="flex flex-col gap-4" aria-label="Mesaj geçmişi">
                  {detail.messages.map((message) => (
                    <li key={message.id} className={cn("flex gap-3", !message.is_staff && "flex-row-reverse")}>
                      {message.is_staff ? (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white" aria-hidden>
                          AX
                        </span>
                      ) : (
                        <Avatar name={user.displayName} />
                      )}
                      <div className={cn("flex max-w-[85%] flex-col gap-1", !message.is_staff && "items-end")}>
                        <p className="text-xs text-ink-soft">
                          <span className={cn("font-semibold", message.is_staff ? "text-ink" : "text-ink-soft")}>
                            {message.is_staff ? "Axis ekibi" : "Sen"}
                          </span>{" "}
                          · {formatRelative(message.created_at)}
                        </p>
                        <div
                          className={cn(
                            "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            message.is_staff ? "rounded-tl-md border border-line bg-surface text-ink" : "rounded-tr-md bg-accent-soft text-accent-ink",
                          )}
                        >
                          {message.body}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              {closed ? (
                <p className="border-t border-line pt-4 text-sm text-ink-soft">Bu talep kapatıldı; yeni mesaj gönderilemez.</p>
              ) : (
                <div className="border-t border-line pt-4">
                  <MessageForm requestId={request.id} />
                </div>
              )}
            </Card>
          </section>

          {status === "completed" && (
            <Card>
              <CardEyebrow>Değerlendirme</CardEyebrow>
              <p className="mb-5 mt-1 text-sm text-ink-soft">Hizmetimizden memnun kaldın mı? Kısa bir değerlendirme bırak.</p>
              {detail.review ? <ReviewSummary review={detail.review} /> : <ReviewForm target="request" targetId={request.id} />}
            </Card>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <CardEyebrow>Talep özeti</CardEyebrow>
            <dl className="flex flex-col divide-y divide-line text-sm">
              {detailRows(detail).map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0">
                  <dt className="shrink-0 text-ink-soft">{row.label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
            {request.message && (
              <div className="rounded-xl bg-surface px-3.5 py-3 text-sm">
                <p className="text-xs font-semibold text-ink-soft">Notun</p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed">{request.message}</p>
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-4">
            <CardEyebrow>Dosyalar</CardEyebrow>
            {deliverables.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-success-ink">
                  <FileCheck2 className="size-4" aria-hidden /> Teslim dosyaları
                </p>
                <ul className="flex flex-col gap-2">
                  {deliverables.map((file) => (
                    <FileRow key={file.id} file={file} highlight />
                  ))}
                </ul>
              </div>
            )}
            {uploads.length > 0 && (
              <div className="flex flex-col gap-2">
                {deliverables.length > 0 && <p className="text-sm font-semibold text-ink-soft">Paylaştığın dosyalar</p>}
                <ul className="flex flex-col gap-2">
                  {uploads.map((file) => (
                    <FileRow key={file.id} file={file} />
                  ))}
                </ul>
              </div>
            )}
            {detail.files.length === 0 && <p className="text-sm text-ink-soft">Henüz dosya yok. Veri setini ya da taslağını buradan paylaşabilirsin.</p>}
            {!closed && <FileUploadForm requestId={request.id} />}
          </Card>

          {cancellable && (
            <Card variant="muted" className="flex flex-col gap-3">
              <p className="text-sm text-ink-soft">
                {status === "quoted" ? "Teklifi değerlendirmek yerine talebi tamamen kapatmak istersen:" : "Talebin henüz işleme alınmadı. Vazgeçtiysen iptal edebilirsin."}
              </p>
              <ConfirmAction
                action={cancelRequestAction}
                fields={{ request_id: request.id }}
                trigger="Talebi iptal et"
                triggerSize="sm"
                triggerClassName="w-fit"
                title="Talebi iptal etmek istiyor musun?"
                description="Talebin kapatılır ve ekibimiz üzerinde çalışmayı bırakır. Bu işlem geri alınamaz; gerekirse yeni bir talep oluşturabilirsin."
                confirmLabel="Talebi iptal et"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function QuoteCard({ detail }: { detail: RequestDetail }) {
  const { request } = detail;
  const amount = request.quote_amount ?? 0;
  const final = applyDiscount(amount, request.discount_percent);
  const daysLeft = request.quote_valid_until ? daysFromToday(request.quote_valid_until) : null;
  return (
    <section aria-labelledby="teklif" className="rounded-3xl border-2 border-amber bg-paper p-5 shadow-raise sm:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="amber" dot>
              Onayını bekliyor
            </Badge>
            {request.quote_valid_until && (
              <span className={cn("text-sm", daysLeft !== null && daysLeft <= 2 ? "font-semibold text-amber-ink" : "text-ink-soft")}>
                {daysLeft !== null && daysLeft < 0
                  ? `Geçerlilik süresi ${formatDate(request.quote_valid_until)} tarihinde doldu`
                  : `${formatDate(request.quote_valid_until)} tarihine kadar geçerli${daysLeft !== null && daysLeft <= 7 ? ` · ${daysLeft === 0 ? "bugün son gün" : `${daysLeft} gün kaldı`}` : ""}`}
              </span>
            )}
          </div>
          <h2 id="teklif" className="mt-3 text-lg font-semibold tracking-tight">
            Teklifin hazır
          </h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="tabular font-mono text-4xl font-medium tracking-tight sm:text-5xl">{formatTRY(final)}</span>
            {request.discount_percent ? (
              <span className="text-sm text-ink-soft">
                <s className="tabular font-mono">{formatTRY(amount)}</s> · %{request.discount_percent} indirim
                {request.discount_code ? ` (${request.discount_code})` : ""}
              </span>
            ) : null}
          </div>
          {request.quote_note && <p className="mt-4 max-w-2xl whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{request.quote_note}</p>}
          <p className="mt-4 text-xs text-ink-soft">
            Tutar bilgi amaçlıdır; ödeme platform dışında ekibimizle konuşularak yapılır. Onayladığında süreç planlamaya geçer.
          </p>
        </div>
        <div className="shrink-0">
          <QuoteActions requestId={request.id} amountLabel={formatTRY(final)} />
        </div>
      </div>
    </section>
  );
}

function FileRow({ file, highlight }: { file: RequestFileView; highlight?: boolean }) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5",
        highlight ? "border-success/40 bg-success-soft/60" : "border-line bg-paper",
      )}
    >
      <FileText className={cn("size-5 shrink-0", highlight ? "text-success" : "text-ink-soft")} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.file_name}</p>
        <p className="tabular font-mono text-xs text-ink-soft">
          {[formatBytes(file.file_size), formatDate(file.created_at)].filter(Boolean).join(" · ")}
        </p>
      </div>
      {file.signed_url ? (
        <a
          href={file.signed_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-surface hover:text-ink"
          aria-label={`${file.file_name} dosyasını indir`}
        >
          <Download className="size-4" aria-hidden />
        </a>
      ) : (
        <span className="text-xs text-ink-muted">Açılamıyor</span>
      )}
    </li>
  );
}
