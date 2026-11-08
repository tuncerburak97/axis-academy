// src/app/(admin)/admin/(dashboard)/talepler/[id]/page.tsx — talep çalışma alanı: durum hattı, üye, detaylar, yazışma, dosyalar, oturumlar; yanda işlem kartları
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Download, FileText, Mail, Phone, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { StatusTrack } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/data";
import { Alert } from "@/components/ui/feedback";
import { SectionHeading } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { formatBytes, formatDate, formatHours, formatRelative, formatTRY, applyDiscount } from "@/lib/format";
import {
  analysisMethodLabels,
  requestDetailLabels,
  requestStatusAdminLabels,
  requestTrack,
  type RequestKind,
  type RequestStatus,
  type TrainingMode,
} from "@/lib/types/platform";
import { getAdminRequest } from "@/lib/queries/admin-requests";
import {
  deleteRequest,
  deleteRequestFile,
  sendQuote,
  sendStaffMessage,
  setRequestStatus,
  updateAdminNotes,
  updateProgressNote,
  updateRequestPlanning,
  uploadDeliverable,
} from "@/lib/actions/admin-requests";
import { ActionForm, ConfirmAction, Hidden, SubmitButton } from "@/components/admin/action-form";
import { RequestKindBadge, RequestStatusBadge } from "@/components/admin/requests/bits";
import { SessionList } from "@/components/admin/sessions/session-list";
import { SessionDialog } from "@/components/admin/sessions/session-dialog";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAdminRequest(id).catch(() => null);
  return { title: detail?.request.title || "Talep" };
}

function formatDetailValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.map((item) => formatDetailValue(key, item)).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  if (key === "method") return analysisMethodLabels[text] ?? text;
  if (key === "deadline" && /^\d{4}-\d{2}-\d{2}$/.test(text)) return formatDate(text);
  return text;
}

export default async function RequestDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const detail = await getAdminRequest(id);
  if (!detail) notFound();

  const { request, member, program, bundle, topics, messages, files, sessions, admins } = detail;
  const kind = request.kind as RequestKind;
  const status = request.status as RequestStatus;
  const mode = request.training_mode as TrainingMode | null;
  const track = requestTrack(kind, mode, status);
  const details = (request.details && typeof request.details === "object" && !Array.isArray(request.details) ? request.details : {}) as Record<string, unknown>;
  const detailRows = Object.entries(details)
    .map(([key, value]) => ({ key, label: requestDetailLabels[key] ?? key, value: formatDetailValue(key, value) }))
    .filter((row) => row.value);
  const memberFiles = files.filter((file) => !file.is_deliverable);
  const deliverables = files.filter((file) => file.is_deliverable);
  const closed = status === "completed" || status === "cancelled";
  // Ekranın tek birincil butonu: yeni talepte "Teklif gönder" (hazır paket teklif adımına uğramaz)
  const quotePrimary = status === "received" && !(kind === "training" && mode === "bundle");
  const showSessions = kind === "training" || kind === "corporate" || sessions.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/talepler" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Talepler
        </Link>
      </div>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <RequestKindBadge kind={kind} mode={mode} />
          <RequestStatusBadge status={status} />
          <span className="text-xs text-ink-soft">
            Açıldı {formatDate(request.created_at)} · son hareket {formatRelative(request.last_activity_at)}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-balance sm:text-[28px]">{request.title || "Başlıksız talep"}</h1>
        <Card padding="sm" className="px-3 py-4 sm:px-5">
          <StatusTrack steps={track.labels} current={track.current} finished={track.finished} />
        </Card>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Ana sütun */}
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardEyebrow>Üye</CardEyebrow>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Avatar name={member.name} size="lg" />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/kisiler/${member.user_id}`} className="font-semibold text-ink hover:text-accent">
                  {member.name}
                </Link>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                  <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 hover:text-ink">
                    <Mail className="size-3.5" aria-hidden /> {member.email}
                  </a>
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="tabular inline-flex items-center gap-1.5 font-mono hover:text-ink">
                      <Phone className="size-3.5" aria-hidden /> {member.phone}
                    </a>
                  )}
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/kisiler/${member.user_id}`}>Profili aç</Link>
              </Button>
            </div>
          </Card>

          <Card>
            <CardTitle>Talep detayları</CardTitle>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {program && (
                <div>
                  <dt className="text-xs text-ink-soft">Program</dt>
                  <dd className="font-medium">
                    <Link href={`/admin/programlar/${program.id}`} className="hover:text-accent">
                      {program.title}
                    </Link>
                  </dd>
                </div>
              )}
              {bundle && (
                <div>
                  <dt className="text-xs text-ink-soft">Paket</dt>
                  <dd className="font-medium">
                    {bundle.title} <span className="tabular font-mono text-sm text-ink-soft">· {formatHours(bundle.duration_hours)} · {formatTRY(bundle.fixed_price)}</span>
                  </dd>
                </div>
              )}
              {request.total_hours ? (
                <div>
                  <dt className="text-xs text-ink-soft">Toplam süre</dt>
                  <dd className="tabular font-mono">{formatHours(request.total_hours)}</dd>
                </div>
              ) : null}
              {request.price_estimate ? (
                <div>
                  <dt className="text-xs text-ink-soft">Sistem tahmini</dt>
                  <dd className="tabular font-mono">
                    {formatTRY(request.price_estimate)}
                    {request.discount_percent ? (
                      <span className="text-ink-soft"> → {formatTRY(applyDiscount(request.price_estimate, request.discount_percent))}</span>
                    ) : null}
                  </dd>
                </div>
              ) : null}
              {request.discount_code && (
                <div>
                  <dt className="text-xs text-ink-soft">İndirim kodu</dt>
                  <dd className="font-mono text-sm">
                    {request.discount_code}
                    {request.discount_percent ? ` · %${request.discount_percent}` : ""}
                  </dd>
                </div>
              )}
              {detailRows.map((row) => (
                <div key={row.key}>
                  <dt className="text-xs text-ink-soft">{row.label}</dt>
                  <dd className="break-words">{row.value}</dd>
                </div>
              ))}
            </dl>
            {topics.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-ink-soft">Seçilen konular</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {topics.map((topic) => (
                    <li key={topic.id}>
                      <Badge tone="accent" size="sm">
                        {topic.title} · {topic.estimated_hours} sa
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {request.message && (
              <div className="mt-4 rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed whitespace-pre-line">{request.message}</div>
            )}
            {detailRows.length === 0 && !request.message && !program && !bundle && (
              <p className="mt-3 text-sm text-ink-soft">Üye ek detay girmemiş. Gerekirse aşağıdan mesajla sor.</p>
            )}
          </Card>

          <Card>
            <SectionHeading as="h3" title="Yazışma" description="Mesajın üyeye e-postayla da gider." />
            <ol className="mt-4 flex flex-col gap-3">
              {messages.length === 0 && <li className="text-sm text-ink-soft">Henüz mesaj yok. İlk yanıtı sen yaz.</li>}
              {messages.map((message) => (
                <li key={message.id} className={cn("flex", message.is_staff ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      message.is_staff ? "rounded-br-md bg-accent-soft text-ink" : "rounded-bl-md bg-surface text-ink ring-1 ring-inset ring-line",
                    )}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{message.body}</p>
                    <p className="mt-1 text-[11px] text-ink-soft">
                      {message.author} · {formatRelative(message.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <ActionForm action={sendStaffMessage} resetOnSuccess className="mt-4 flex flex-col gap-2">
              <Hidden name="request_id" value={request.id} />
              <label htmlFor="staff-message" className="sr-only">
                Mesaj
              </label>
              <Textarea id="staff-message" name="body" rows={3} required maxLength={5000} placeholder="Üyeye yaz…" />
              <div className="flex justify-end">
                <SubmitButton variant="secondary" size="sm">
                  Gönder
                </SubmitButton>
              </div>
            </ActionForm>
          </Card>

          <Card>
            <SectionHeading as="h3" title="Dosyalar" description="Üyenin yüklediği dosyalar ve teslimler." />
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Üyeden</p>
                <FileList files={memberFiles} empty="Üye dosya eklemedi." />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Teslimler</p>
                <FileList files={deliverables} empty="Henüz teslim yok." deletable />
              </div>
            </div>
            <ActionForm action={uploadDeliverable} resetOnSuccess className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-end">
              <Hidden name="request_id" value={request.id} />
              <Field id="deliverable" label="Teslim dosyası yükle" hint="En fazla 25 MB. Üyeye bildirim ve e-posta gider." className="flex-1">
                <Input
                  name="file"
                  type="file"
                  required
                  className="py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent-ink"
                />
              </Field>
              <SubmitButton variant="outline" className="sm:mb-6">
                <Upload /> Yükle
              </SubmitButton>
            </ActionForm>
          </Card>

          {showSessions && (
            <Card>
              <SectionHeading
                as="h3"
                title="Oturumlar"
                description="Birebir ders oturumları üyenin takviminde görünür."
                action={
                  sessions.length > 0 ? (
                    <SessionDialog
                      requestId={request.id}
                      trigger={
                        <Button variant="outline" size="sm">
                          <CalendarPlus /> Ekle
                        </Button>
                      }
                    />
                  ) : undefined
                }
              />
              <div className="mt-4">
                <SessionList sessions={sessions} requestId={request.id} />
              </div>
            </Card>
          )}
        </div>

        {/* Yan sütun: işlemler */}
        <aside className="flex min-w-0 flex-col gap-4">
          <Card padding="sm">
            <CardTitle className="text-sm">Durum</CardTitle>
            <ActionForm action={setRequestStatus} className="mt-3 flex gap-2">
              <Hidden name="request_id" value={request.id} />
              <div className="min-w-0 flex-1">
                <Select name="status" defaultValue={status} aria-label="Durum" key={status}>
                  {(Object.keys(requestStatusAdminLabels) as RequestStatus[]).map((option) => (
                    <option key={option} value={option}>
                      {requestStatusAdminLabels[option]}
                    </option>
                  ))}
                </Select>
              </div>
              <SubmitButton variant="outline">Kaydet</SubmitButton>
            </ActionForm>
            <p className="mt-2 text-xs text-ink-soft">Değişiklik üyeye e-posta ve bildirimle iletilir.</p>
          </Card>

          <Card padding="sm" className={status === "quoted" ? "border-amber/60" : undefined}>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Teklif</CardTitle>
              {request.quoted_at && <span className="text-xs text-ink-soft">{formatRelative(request.quoted_at)} verildi</span>}
            </div>
            {status === "quoted" && (
              <Alert tone="warning" className="mt-3 py-2.5 text-xs">
                Üyenin yanıtı bekleniyor.
                {request.quote_valid_until ? ` Geçerlilik: ${formatDate(request.quote_valid_until)}.` : ""}
              </Alert>
            )}
            {closed ? (
              <p className="mt-3 text-sm text-ink-soft">
                {request.quote_amount ? <span className="tabular font-mono text-ink">{formatTRY(request.quote_amount)}</span> : "Teklif verilmedi."}
              </p>
            ) : (
              <ActionForm action={sendQuote} className="mt-3 flex flex-col gap-3">
                <Hidden name="request_id" value={request.id} />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="quote_amount"
                    label="Tutar (₺)"
                    hint={request.discount_percent ? `İndirim öncesi tutar. Üyeye %${request.discount_percent} indirimli gösterilir.` : undefined}
                  >
                    <Input
                      name="quote_amount"
                      type="number"
                      min={1}
                      step="1"
                      required
                      inputMode="numeric"
                      className="tabular font-mono"
                      defaultValue={request.quote_amount ?? request.price_estimate ?? ""}
                    />
                  </Field>
                  <Field id="quote_valid_until" label="Geçerlilik" optional>
                    <Input name="quote_valid_until" type="date" defaultValue={request.quote_valid_until ?? ""} />
                  </Field>
                </div>
                <Field id="quote_note" label="Kapsam notu" optional>
                  <Textarea name="quote_note" rows={3} maxLength={2000} defaultValue={request.quote_note} placeholder="Neler dahil, teslim süresi…" />
                </Field>
                <SubmitButton variant={quotePrimary ? "primary" : "outline"}>
                  {request.quoted_at ? "Teklifi güncelle ve gönder" : "Teklif gönder"}
                </SubmitButton>
              </ActionForm>
            )}
          </Card>

          <Card padding="sm">
            <CardTitle className="text-sm">Planlama</CardTitle>
            <ActionForm action={updateRequestPlanning} className="mt-3 flex flex-col gap-3">
              <Hidden name="request_id" value={request.id} />
              <Field id="due_date" label="Teslim tarihi" optional>
                <Input name="due_date" type="date" defaultValue={request.due_date ?? ""} />
              </Field>
              <Field id="assignee_id" label="Sorumlu">
                <Select name="assignee_id" defaultValue={request.assignee_id ?? ""}>
                  <option value="">Atanmamış</option>
                  {admins.map((admin) => (
                    <option key={admin.user_id} value={admin.user_id}>
                      {admin.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <SubmitButton variant="outline" size="sm">
                Kaydet
              </SubmitButton>
            </ActionForm>
          </Card>

          <Card padding="sm">
            <CardTitle className="text-sm">İlerleme notu</CardTitle>
            <p className="mt-1 text-xs text-ink-soft">Üye panelinde görünür.</p>
            <ActionForm action={updateProgressNote} className="mt-3 flex flex-col gap-2">
              <Hidden name="request_id" value={request.id} />
              <label htmlFor="progress_note" className="sr-only">
                İlerleme notu
              </label>
              <Textarea id="progress_note" name="progress_note" rows={3} maxLength={1000} defaultValue={request.progress_note} placeholder="Ör. Analiz tamamlandı, rapor yazılıyor." />
              <SubmitButton variant="outline" size="sm">
                Kaydet
              </SubmitButton>
            </ActionForm>
          </Card>

          <Card padding="sm" variant="muted">
            <CardTitle className="text-sm">Ekip notu</CardTitle>
            <p className="mt-1 text-xs text-ink-soft">Yalnızca ekip görür.</p>
            <ActionForm action={updateAdminNotes} className="mt-3 flex flex-col gap-2">
              <Hidden name="request_id" value={request.id} />
              <label htmlFor="admin_notes" className="sr-only">
                Ekip notu
              </label>
              <Textarea id="admin_notes" name="admin_notes" rows={4} maxLength={5000} defaultValue={request.admin_notes} />
              <SubmitButton variant="outline" size="sm">
                Kaydet
              </SubmitButton>
            </ActionForm>
          </Card>

          <ConfirmAction
            title="Talep kalıcı olarak silinsin mi?"
            description="Mesajlar, dosyalar ve oturumlar da silinir. Bu işlem geri alınamaz. Yalnızca iptal etmek istiyorsan durumu “İptal” yap."
            action={deleteRequest}
            fields={{ request_id: request.id }}
            confirmLabel="Kalıcı olarak sil"
            trigger={
              <Button variant="ghost" size="sm" className="self-start text-danger-ink hover:bg-danger-soft">
                <Trash2 /> Talebi sil
              </Button>
            }
          />
        </aside>
      </div>
    </div>
  );
}

function FileList({
  files,
  empty,
  deletable,
}: {
  files: { id: string; file_name: string; file_size: number; created_at: string; url: string | null }[];
  empty: string;
  deletable?: boolean;
}) {
  if (files.length === 0) return <p className="mt-2 text-sm text-ink-soft">{empty}</p>;
  return (
    <ul className="mt-2 flex flex-col gap-1.5">
      {files.map((file) => (
        <li key={file.id} className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2">
          <FileText className="size-4 shrink-0 text-ink-muted" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.file_name}</p>
            <p className="tabular font-mono text-[11px] text-ink-soft">
              {formatBytes(file.file_size)} {file.file_size ? "·" : ""} {formatRelative(file.created_at)}
            </p>
          </div>
          {file.url ? (
            <Button asChild variant="ghost" size="icon-sm" aria-label={`${file.file_name} indir`}>
              <a href={file.url} target="_blank" rel="noreferrer">
                <Download />
              </a>
            </Button>
          ) : (
            <span className="text-[11px] text-ink-muted">Bağlantı yok</span>
          )}
          {deletable && (
            <ConfirmAction
              title="Dosya silinsin mi?"
              description={`${file.file_name} depolamadan da kaldırılır.`}
              action={deleteRequestFile}
              fields={{ file_id: file.id }}
              confirmLabel="Sil"
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label={`${file.file_name} sil`}>
                  <Trash2 />
                </Button>
              }
            />
          )}
        </li>
      ))}
    </ul>
  );
}
