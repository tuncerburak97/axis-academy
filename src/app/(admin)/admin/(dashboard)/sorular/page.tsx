// src/app/(admin)/admin/(dashboard)/sorular/page.tsx — iletişim formundan gelen anonim sorular: durum, ekip notu, e-postayla yanıt
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircleQuestion, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Select, Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { getInquiries, getInquiryCounts } from "@/lib/queries/admin-moderation";
import { deleteInquiry, replyInquiry, updateInquiry } from "@/lib/actions/admin-moderation";
import { ActionForm, ConfirmAction, CopyButton, Hidden, SubmitButton } from "@/components/admin/action-form";
import { inquiryStatusLabels } from "@/components/admin/lib/labels";

export const metadata: Metadata = { title: "Sorular" };

const FILTERS = [
  { value: "new", label: "Yeni" },
  { value: "answered", label: "Yanıtlandı" },
  { value: "closed", label: "Kapatıldı" },
  { value: "all", label: "Tümü" },
];

const tone = { new: "amber", answered: "success", closed: "neutral" } as const;

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const status = FILTERS.some((item) => item.value === params.durum) ? params.durum! : "new";
  const [inquiries, counts] = await Promise.all([getInquiries(status === "all" ? undefined : status), getInquiryCounts()]);
  const emailEnabled = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Sorular" description="Giriş yapmadan iletişim formundan yazanlar. Yanıtladıktan sonra durumu güncelle." />
      <nav aria-label="Durum filtresi" className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-surface p-1 ring-1 ring-inset ring-line">
        {FILTERS.map((item) => {
          const active = item.value === status;
          const count = item.value === "all" ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[item.value] ?? 0;
          return (
            <Link
              key={item.value}
              href={`/admin/sorular?durum=${item.value}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors",
                active ? "bg-paper text-ink shadow-card" : "text-ink-soft hover:text-ink",
              )}
            >
              {item.label}
              <span className="tabular font-mono text-[11px] text-ink-muted">{count}</span>
            </Link>
          );
        })}
      </nav>

      {inquiries.length === 0 ? (
        <EmptyState
          icon={MessageCircleQuestion}
          title={status === "new" ? "Yeni soru yok" : "Bu durumda soru yok"}
          description={status === "new" ? "İletişim formundan yeni mesaj gelince burada görünür." : "Başka bir filtre seç."}
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className={cn("rounded-2xl border bg-paper p-5 shadow-card", inquiry.status === "new" ? "border-amber/60" : "border-line")}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{inquiry.name}</p>
                    <Badge size="sm" tone={tone[inquiry.status as keyof typeof tone] ?? "neutral"} dot>
                      {inquiryStatusLabels[inquiry.status] ?? inquiry.status}
                    </Badge>
                    <span className="text-xs text-ink-soft">{formatRelative(inquiry.created_at)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <a href={`mailto:${inquiry.email}`} className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                      <Mail className="size-3.5" aria-hidden /> {inquiry.email}
                    </a>
                    <CopyButton value={inquiry.email} label="Kopyala" variant="ghost" />
                  </div>
                </div>
                <ConfirmAction
                  title="Soru silinsin mi?"
                  description={`${inquiry.name} adlı kişinin mesajı kalıcı olarak silinir.`}
                  action={deleteInquiry}
                  fields={{ inquiry_id: inquiry.id }}
                  confirmLabel="Sil"
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="Soruyu sil">
                      <Trash2 />
                    </Button>
                  }
                />
              </div>
              <p className="mt-3 whitespace-pre-line rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed">{inquiry.message}</p>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <ActionForm action={updateInquiry} className="flex flex-col gap-3">
                  <Hidden name="inquiry_id" value={inquiry.id} />
                  <Field id={`status-${inquiry.id}`} label="Durum">
                    <Select name="status" defaultValue={inquiry.status} key={inquiry.status}>
                      {Object.entries(inquiryStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field id={`notes-${inquiry.id}`} label="Ekip notu" optional>
                    <Textarea name="admin_notes" rows={3} maxLength={2000} defaultValue={inquiry.admin_notes} key={inquiry.admin_notes} />
                  </Field>
                  <SubmitButton variant="outline" size="sm" className="self-start">
                    Kaydet
                  </SubmitButton>
                </ActionForm>

                <ActionForm action={replyInquiry} resetOnSuccess className="flex flex-col gap-3 rounded-xl border border-dashed border-line-strong p-3.5">
                  <Hidden name="inquiry_id" value={inquiry.id} />
                  <Field
                    id={`reply-${inquiry.id}`}
                    label="E-postayla yanıtla"
                    hint={
                      emailEnabled
                        ? `${inquiry.email} adresine gider; soru “yanıtlandı” olur ve yanıt ekip notuna eklenir.`
                        : "E-posta servisi yapılandırılmamış. Adresi kopyalayıp kendi e-postandan yanıtla, sonra durumu güncelle."
                    }
                  >
                    <Textarea name="reply" rows={4} maxLength={5000} disabled={!emailEnabled} placeholder="Merhaba, sorunu aldık…" />
                  </Field>
                  <SubmitButton variant="secondary" size="sm" className="self-start" disabled={!emailEnabled}>
                    <Send /> Yanıtı gönder
                  </SubmitButton>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
