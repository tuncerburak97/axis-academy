// src/app/(admin)/admin/(dashboard)/indirimler/page.tsx — indirim kodları: oluştur, düzenle, aç/kapat, kullanım
import type { Metadata } from "next";
import * as React from "react";
import { Pencil, Plus, TicketPercent, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { formatDate } from "@/lib/format";
import type { DiscountCodeRow } from "@/lib/types/platform";
import { getDiscountCodes } from "@/lib/queries/admin-moderation";
import { deleteDiscount, saveDiscount, setDiscountActive } from "@/lib/actions/admin-moderation";
import { ActionForm, ConfirmAction, FormDialog, Hidden, SubmitButton } from "@/components/admin/action-form";
import { Checkbox } from "@/components/admin/programs/catalog-dialogs";
import { todayIstanbul } from "@/components/admin/lib/time";

export const metadata: Metadata = { title: "İndirim kodları" };

function DiscountDialog({ trigger, code }: { trigger: React.ReactNode; code?: DiscountCodeRow }) {
  const p = code?.id ?? "new-code";
  return (
    <FormDialog
      trigger={trigger}
      title={code ? "Kodu düzenle" : "Yeni indirim kodu"}
      description="Üye kodu teklif sihirbazında ya da döneme başvururken girer. İndirim fiyat tahminine yansır."
      action={saveDiscount}
      submitLabel={code ? "Kaydet" : "Kodu oluştur"}
      resetOnSuccess={!code}
    >
      {code && <Hidden name="discount_id" value={code.id} />}
      <div className="grid grid-cols-[1fr_7rem] gap-4">
        <Field id={`${p}-code`} label="Kod" hint="Büyük harfe çevrilir.">
          <Input name="code" required minLength={3} maxLength={32} defaultValue={code?.code ?? ""} className="font-mono uppercase" placeholder="OGRENCI10" />
        </Field>
        <Field id={`${p}-percent`} label="Yüzde">
          <Input name="percent" type="number" min={1} max={100} required defaultValue={code?.percent ?? 10} className="tabular font-mono" />
        </Field>
      </div>
      <Field id={`${p}-desc`} label="Açıklama" optional hint="Yalnızca ekip görür.">
        <Input name="description" maxLength={200} defaultValue={code?.description ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id={`${p}-until`} label="Son geçerlilik" optional>
          <Input name="valid_until" type="date" defaultValue={code?.valid_until ?? ""} />
        </Field>
        <Field id={`${p}-max`} label="Kullanım sınırı" optional hint="Boşsa sınırsız.">
          <Input name="max_uses" type="number" min={1} defaultValue={code?.max_uses ?? ""} className="tabular font-mono" />
        </Field>
      </div>
      <Checkbox name="is_active" label="Aktif" defaultChecked={code?.is_active ?? true} />
    </FormDialog>
  );
}

export default async function DiscountsPage() {
  const codes = await getDiscountCodes();
  const today = todayIstanbul();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="İndirim kodları"
        description="Kullanım sayısı talep ve dönem başvurusunda kod girildiğinde artar."
        actions={
          <DiscountDialog
            trigger={
              <Button>
                <Plus /> Yeni kod
              </Button>
            }
          />
        }
      />
      {codes.length === 0 ? (
        <EmptyState icon={TicketPercent} title="İndirim kodu yok" description="Öğrenci, kurum ya da kampanya kodu oluştur." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {codes.map((code) => {
            const expired = Boolean(code.valid_until && code.valid_until < today);
            const exhausted = code.max_uses !== null && code.used_count >= code.max_uses;
            const live = code.is_active && !expired && !exhausted;
            return (
              <li key={code.id} className="flex flex-col rounded-2xl border border-line bg-paper p-5 shadow-card">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-lg font-medium tracking-wide">{code.code}</p>
                    {code.description && <p className="mt-0.5 text-sm text-ink-soft">{code.description}</p>}
                  </div>
                  <span className="tabular rounded-xl bg-accent-soft px-2.5 py-1 font-mono text-sm font-semibold text-accent-ink">%{code.percent}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge size="sm" tone={live ? "success" : "neutral"} dot>
                    {live ? "Geçerli" : !code.is_active ? "Kapalı" : expired ? "Süresi doldu" : "Sınır doldu"}
                  </Badge>
                  {code.valid_until && <Badge size="sm">Son gün {formatDate(code.valid_until)}</Badge>}
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-ink-soft">
                    <span>Kullanım</span>
                    <span className="tabular font-mono">
                      {code.used_count}
                      {code.max_uses !== null ? ` / ${code.max_uses}` : " · sınırsız"}
                    </span>
                  </div>
                  {code.max_uses !== null && <ProgressBar value={(code.used_count / code.max_uses) * 100} label={`${code.code} kullanımı`} />}
                </div>
                <div className="mt-4 flex items-center justify-end gap-1 border-t border-line pt-3">
                  <ConfirmAction
                    title={`${code.code} silinsin mi?`}
                    description="Bu kodu kullanmış talepler etkilenmez; kod artık girilemez."
                    action={deleteDiscount}
                    fields={{ discount_id: code.id }}
                    confirmLabel="Sil"
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Kodu sil">
                        <Trash2 />
                      </Button>
                    }
                  />
                  <DiscountDialog
                    code={code}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Kodu düzenle">
                        <Pencil />
                      </Button>
                    }
                  />
                  <ActionForm action={setDiscountActive}>
                    <Hidden name="discount_id" value={code.id} />
                    <Hidden name="active" value={code.is_active ? "false" : "true"} />
                    <SubmitButton size="sm" variant="outline">
                      {code.is_active ? "Kapat" : "Aç"}
                    </SubmitButton>
                  </ActionForm>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
