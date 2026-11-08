// src/app/(admin)/admin/(dashboard)/kisiler/[id]/page.tsx — kişi detayı: profil, rol (korumalı), talepler, kayıtlar, sertifikalar, hesabı silme
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Mail, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";
import { Avatar } from "@/components/ui/data";
import { Alert } from "@/components/ui/feedback";
import { SectionHeading } from "@/components/ui/page-header";
import { formatDate, formatRelative } from "@/lib/format";
import { requireAdminUser } from "@/lib/auth";
import { cohortStatusLabels, enrollmentStatusLabels, enrollmentStatusTone, type CohortStatus } from "@/lib/types/platform";
import { hasAdminServiceKey } from "@/lib/supabase/admin";
import { getPerson } from "@/lib/queries/admin-people";
import { changeRole, deletePerson } from "@/lib/actions/admin-people";
import { ActionForm, ConfirmAction, CopyButton, Hidden, SubmitButton } from "@/components/admin/action-form";
import { RequestKindBadge, RequestStatusBadge } from "@/components/admin/requests/bits";
import { roleLabels } from "@/components/admin/lib/labels";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const person = await getPerson(id).catch(() => null);
  return { title: person?.profile.full_name || person?.profile.email || "Kişi" };
}

export default async function PersonPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [me, person] = await Promise.all([requireAdminUser(), getPerson(id)]);
  if (!person) notFound();
  const { profile, requests, enrollments, certificates, teaching, adminCount } = person;
  const name = profile.full_name || profile.email;
  const isSelf = me.id === profile.user_id;
  const lastAdmin = profile.role === "admin" && adminCount <= 1;
  const roleLocked = isSelf || lastAdmin;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/kisiler" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Kişiler
        </Link>
      </div>

      <header className="flex flex-wrap items-center gap-4">
        <Avatar name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-[-0.025em]">{name}</h1>
            <Badge tone={profile.role === "admin" ? "solid" : profile.role === "instructor" ? "accent" : "neutral"}>{roleLabels[profile.role] ?? profile.role}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-ink">
              <Mail className="size-3.5" aria-hidden /> {profile.email}
            </a>
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="tabular inline-flex items-center gap-1.5 font-mono hover:text-ink">
                <Phone className="size-3.5" aria-hidden /> {profile.phone}
              </a>
            )}
            <span>Katıldı {formatDate(profile.created_at)}</span>
            {!profile.email_notifications && <span className="text-amber-ink">E-posta bildirimleri kapalı</span>}
          </div>
        </div>
        <CopyButton value={profile.email} label="E-postayı kopyala" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <SectionHeading as="h3" title={`Talepler (${requests.length})`} />
            {requests.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">Talep yok.</p>
            ) : (
              <ul className="mt-3 flex flex-col divide-y divide-line">
                {requests.map((request) => (
                  <li key={request.id}>
                    <Link href={`/admin/talepler/${request.id}`} className="flex flex-wrap items-center gap-2 py-2.5 hover:text-accent">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{request.title || "Başlıksız talep"}</span>
                      <RequestKindBadge kind={request.kind} />
                      <RequestStatusBadge status={request.status} size="sm" />
                      <span className="w-20 text-right text-xs text-ink-soft">{formatRelative(request.last_activity_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHeading as="h3" title={`Dönem kayıtları (${enrollments.length})`} />
            {enrollments.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">Dönem kaydı yok.</p>
            ) : (
              <ul className="mt-3 flex flex-col divide-y divide-line">
                {enrollments.map((enrollment) => (
                  <li key={enrollment.id}>
                    <Link href={`/admin/donemler/${enrollment.class_id}?tab=ogrenciler`} className="flex flex-wrap items-center gap-2 py-2.5 hover:text-accent">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{enrollment.title}</span>
                      <span className="tabular font-mono text-xs text-ink-soft">{enrollment.start_date && formatDate(enrollment.start_date)}</span>
                      <Badge size="sm" tone={enrollmentStatusTone[enrollment.status]} dot>
                        {enrollmentStatusLabels[enrollment.status]}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {(teaching.length > 0 || profile.role === "instructor") && (
            <Card>
              <SectionHeading as="h3" title={`Eğitmenlik yaptığı dönemler (${teaching.length})`} />
              {teaching.length === 0 ? (
                <p className="mt-3 text-sm text-ink-soft">Henüz dönem atanmadı. Dönemin Genel sekmesinden eğitmen seçebilirsin.</p>
              ) : (
                <ul className="mt-3 flex flex-col divide-y divide-line">
                  {teaching.map((cohort) => (
                    <li key={cohort.id}>
                      <Link href={`/admin/donemler/${cohort.id}`} className="flex items-center gap-2 py-2.5 hover:text-accent">
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{cohort.title}</span>
                        <span className="tabular font-mono text-xs text-ink-soft">{formatDate(cohort.start_date)}</span>
                        <Badge size="sm">{cohortStatusLabels[cohort.status as CohortStatus] ?? cohort.status}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <Card>
            <SectionHeading as="h3" title={`Sertifikalar (${certificates.length})`} />
            {certificates.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">Sertifika yok.</p>
            ) : (
              <ul className="mt-3 flex flex-col divide-y divide-line">
                {certificates.map((certificate) => (
                  <li key={certificate.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <Award className="size-4 shrink-0 text-amber" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{certificate.program_title}</span>
                    <a href={`/sertifika/${certificate.code}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-accent hover:underline">
                      {certificate.code}
                    </a>
                    <span className="tabular font-mono text-xs text-ink-soft">{formatDate(certificate.issued_at)}</span>
                    {certificate.revoked_at && (
                      <Badge size="sm" tone="danger">
                        İptal
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card padding="sm">
            <CardTitle className="text-sm">Rol</CardTitle>
            {roleLocked ? (
              <Alert tone="info" className="mt-3 text-xs">
                {isSelf ? "Kendi rolünü değiştiremezsin; başka bir admin değiştirebilir." : "Son admin olduğu için rolü değiştirilemez."}
              </Alert>
            ) : (
              <ActionForm action={changeRole} className="mt-3 flex flex-col gap-3">
                <Hidden name="user_id" value={profile.user_id} />
                <Field id="role" label="Rol" hint="Eğitmen kendi dönemlerinin oturum, materyal ve duyurularını yönetir. Admin konsolun tamamına erişir.">
                  <Select name="role" defaultValue={profile.role} key={profile.role}>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <SubmitButton variant="outline" size="sm">
                  Rolü kaydet
                </SubmitButton>
              </ActionForm>
            )}
          </Card>

          {!isSelf && !lastAdmin && (
            <Card padding="sm" variant="muted">
              <CardTitle className="text-sm">Hesabı sil</CardTitle>
              <p className="mt-1 text-xs text-ink-soft">
                Hesap, talepler, kayıtlar, sertifikalar ve dosyalar kalıcı olarak silinir.
                {!hasAdminServiceKey() && " Sunucuda SUPABASE_SECRET_KEY tanımlı olmadığı için şu an kullanılamaz."}
              </p>
              <ConfirmAction
                title={`${name} silinsin mi?`}
                description="Bu işlem geri alınamaz. Kişinin tüm talepleri, mesajları, dosyaları, dönem kayıtları ve sertifikaları silinir."
                action={deletePerson}
                fields={{ user_id: profile.user_id }}
                confirmLabel="Hesabı kalıcı olarak sil"
                trigger={
                  <Button variant="ghost" size="sm" className="mt-3 text-danger-ink hover:bg-danger-soft" disabled={!hasAdminServiceKey()}>
                    <Trash2 /> Hesabı sil
                  </Button>
                }
              />
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
