// src/app/(admin)/admin/(dashboard)/ayarlar/page.tsx — ekip (admin ve eğitmenler, rol değişikliği) ve kayıt geçmişi (sayfalı)
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Avatar } from "@/components/ui/data";
import { PageHeader, SectionHeading } from "@/components/ui/page-header";
import { formatDate, formatTime } from "@/lib/format";
import { requireAdminUser } from "@/lib/auth";
import { getTeam } from "@/lib/queries/admin-people";
import { AUDIT_PAGE_SIZE, getAuditPage } from "@/lib/queries/admin-moderation";
import { addTeamMember, changeRole } from "@/lib/actions/admin-people";
import { ActionForm, AutoSubmitSelect, FormDialog, Hidden } from "@/components/admin/action-form";
import { roleLabels } from "@/components/admin/lib/labels";

export const metadata: Metadata = { title: "Roller ve kayıt geçmişi" };

const selectClass =
  "min-h-9 rounded-lg border border-line-strong bg-paper px-2.5 text-sm text-ink focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-soft";

const auditHref: Record<string, (id: string) => string> = {
  request: (id) => `/admin/talepler/${id}`,
  class: (id) => `/admin/donemler/${id}`,
  module: (id) => `/admin/programlar/${id}`,
  profile: (id) => `/admin/kisiler/${id}`,
  post: (id) => `/admin/blog/${id}`,
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.sayfa) || 1);
  const [me, team, audit] = await Promise.all([requireAdminUser(), getTeam(), getAuditPage(page)]);
  const adminCount = team.filter((member) => member.role === "admin").length;
  const pages = Math.max(1, Math.ceil(audit.total / AUDIT_PAGE_SIZE));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Roller ve kayıt geçmişi" description="Ekibi yönet ve konsolda yapılan her işlemin kaydını gör." />

      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Ekip"
          description="Adminler konsolun tamamına erişir. Eğitmenler yalnızca atandıkları dönemleri yönetir."
          action={
            <FormDialog
              title="Ekibe ekle"
              description="Kişinin önce siteye üye olması gerekir. Rol hemen geçerli olur."
              action={addTeamMember}
              submitLabel="Ekle"
              resetOnSuccess
              trigger={
                <Button variant="outline" size="sm">
                  <UserPlus /> Ekibe ekle
                </Button>
              }
            >
              <Field id="team-email" label="E-posta">
                <Input name="email" type="email" required placeholder="kisi@ornek.com" />
              </Field>
              <Field id="team-role" label="Rol">
                <Select name="role" defaultValue="instructor">
                  <option value="instructor">Eğitmen</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
            </FormDialog>
          }
        />
        <Card padding="none">
          <ul className="divide-y divide-line">
            {team.map((member) => {
              const locked = member.user_id === me.id || (member.role === "admin" && adminCount <= 1);
              return (
                <li key={member.user_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Avatar name={member.name} size="sm" />
                  <Link href={`/admin/kisiler/${member.user_id}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold hover:text-accent">
                      {member.name}
                      {member.user_id === me.id && <span className="font-normal text-ink-soft"> (sen)</span>}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">{member.email}</span>
                  </Link>
                  {locked ? (
                    <Badge tone={member.role === "admin" ? "solid" : "accent"}>{roleLabels[member.role]}</Badge>
                  ) : (
                    <ActionForm action={changeRole}>
                      <Hidden name="user_id" value={member.user_id} />
                      <label className="sr-only" htmlFor={`role-${member.user_id}`}>
                        {member.name} rolü
                      </label>
                      <AutoSubmitSelect id={`role-${member.user_id}`} name="role" defaultValue={member.role} key={member.role} className={selectClass}>
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {value === "user" ? "Üye (ekipten çıkar)" : label}
                          </option>
                        ))}
                      </AutoSubmitSelect>
                    </ActionForm>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading title="Kayıt geçmişi" description={`${audit.total} kayıt · en yeni en üstte`} />
        <Card padding="none">
          {audit.rows.length === 0 ? (
            <p className="p-5 text-sm text-ink-soft">Henüz kayıt yok.</p>
          ) : (
            <ol className="divide-y divide-line">
              {audit.rows.map((row) => {
                const href = row.entity_id && auditHref[row.entity] ? auditHref[row.entity](row.entity_id) : null;
                return (
                  <li key={row.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <span className="tabular w-36 shrink-0 font-mono text-xs text-ink-soft">
                      {formatDate(row.created_at)} {formatTime(row.created_at)}
                    </span>
                    <div className="min-w-0 flex-1">
                      {href ? (
                        <Link href={href} className="text-sm font-medium hover:text-accent">
                          {row.summary || row.action}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium">{row.summary || row.action}</p>
                      )}
                      <p className="text-xs text-ink-soft">
                        {row.actor} · <span className="font-mono">{row.action}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
        {pages > 1 && (
          <nav aria-label="Sayfalar" className="flex items-center justify-between gap-2">
            {page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/ayarlar?sayfa=${page - 1}`}>
                  <ChevronLeft /> Daha yeni
                </Link>
              </Button>
            ) : (
              <span />
            )}
            <span className="tabular font-mono text-xs text-ink-soft">
              {page} / {pages}
            </span>
            {page < pages ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/ayarlar?sayfa=${page + 1}`}>
                  Daha eski <ChevronRight />
                </Link>
              </Button>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
