// src/app/(admin)/admin/(dashboard)/donemler/[id]/page.tsx — dönem çalışma alanı: genel, öğrenciler, oturumlar, materyaller, duyurular, tamamlama
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  CheckCheck,
  Download,
  ExternalLink,
  FileText,
  Megaphone,
  Pencil,
  Play,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, SeatMeter, Stat } from "@/components/ui/data";
import { WeekStrip } from "@/components/ui/progress";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { SectionHeading } from "@/components/ui/page-header";
import { formatDate, formatRelative, formatTRY } from "@/lib/format";
import {
  cohortCurrentWeek,
  cohortStatusLabels,
  enrollmentStatusLabels,
  enrollmentStatusTone,
  type CohortStatus,
} from "@/lib/types/platform";
import { cohortEndDate, getAdminCohort, getInstructorOptions, getProgramOptions, type AdminEnrollment } from "@/lib/queries/admin-cohorts";
import {
  approveEnrollment,
  completeCohort,
  deleteAnnouncement,
  deleteCohort,
  deleteMaterial,
  markEnrollmentInProgress,
  rejectEnrollment,
  removeEnrollment,
  startAllEnrollments,
  updateCohort,
} from "@/lib/actions/admin-cohorts";
import { ActionForm, ConfirmAction, CopyButton, Hidden, SubmitButton } from "@/components/admin/action-form";
import { UrlTabs } from "@/components/admin/url-tabs";
import { CohortFields } from "@/components/admin/cohorts/cohort-fields";
import { AddPersonDialog } from "@/components/admin/cohorts/add-person-dialog";
import { SessionGenerator } from "@/components/admin/cohorts/session-generator";
import { AnnouncementDialog, MaterialDialog } from "@/components/admin/cohorts/content-dialogs";
import { SessionList } from "@/components/admin/sessions/session-list";
import { SessionDialog } from "@/components/admin/sessions/session-dialog";
import { materialCategoryLabels } from "@/components/admin/lib/labels";

type Params = Promise<{ id: string }>;
const TABS = ["genel", "ogrenciler", "oturumlar", "materyaller", "duyurular"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAdminCohort(id).catch(() => null);
  return { title: detail?.cohort.title ?? "Dönem" };
}

export default async function CohortDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [detail, programs, instructors] = await Promise.all([getAdminCohort(id), getProgramOptions(), getInstructorOptions()]);
  if (!detail) notFound();

  const { cohort, program, instructor, enrollments, sessions, materials, materialUrls, announcements, syllabus, taken, certificates } = detail;
  const waiting = enrollments.filter((row) => row.status === "pending" || row.status === "waitlisted");
  const active = enrollments.filter((row) => ["enrolled", "in_progress", "completed"].includes(row.status));
  const cancelled = enrollments.filter((row) => row.status === "cancelled");
  const status = cohort.status as CohortStatus;
  const finished = status === "completed" || status === "cancelled";
  const week = cohortCurrentWeek(cohort.start_date, cohort.duration_weeks, cohort.current_week_override);
  const nextWeek = sessions.reduce((max, session) => Math.max(max, session.week_number ?? 0), 0) + 1;
  const seatsLeft = cohort.capacity - taken;
  const defaultTab = TABS.includes(query.tab ?? "") ? query.tab! : waiting.length ? "ogrenciler" : "genel";
  const activeEmails = active.filter((row) => row.status !== "completed" || finished).map((row) => row.email).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/donemler" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Dönemler
        </Link>
      </div>

      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status === "completed" ? "success" : status === "cancelled" ? "danger" : status === "full" ? "amber" : "accent"} dot>
              {cohortStatusLabels[status]}
            </Badge>
            {program && (
              <Link href={`/admin/programlar/${program.id}`} className="text-sm text-ink-soft hover:text-ink">
                {program.title}
              </Link>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-balance sm:text-[28px]">{cohort.title}</h1>
          <p className="tabular mt-1 font-mono text-sm text-ink-soft">
            {formatDate(cohort.start_date)} → {formatDate(cohortEndDate(cohort.start_date, cohort.duration_weeks))} · {cohort.duration_weeks} hafta ·{" "}
            {cohort.duration_hours} saat
            {cohort.price ? ` · ${formatTRY(cohort.price)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {program && (
            <Button asChild variant="ghost" size="sm">
              <a href={`/programlar/${program.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink /> Katalogda gör
              </a>
            </Button>
          )}
          {!finished && (
            <ConfirmAction
              title="Dönem tamamlansın mı?"
              description={`${active.filter((row) => row.status !== "completed").length} öğrencinin kaydı “tamamlandı” olur ve her birine doğrulama kodlu sertifika üretilir. Bekleyen başvurular iptal edilir. Bu işlem geri alınamaz.`}
              action={completeCohort}
              fields={{ class_id: cohort.id }}
              confirmLabel="Dönemi tamamla"
              tone="primary"
              trigger={
                <Button variant="secondary" size="sm">
                  <CheckCheck /> Dönemi tamamla
                </Button>
              }
            />
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 flex flex-col justify-center rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-5">
          <SeatMeter taken={taken} capacity={cohort.capacity} />
          {cohort.duration_weeks > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-ink-soft">
                {week === 0 ? "Henüz başlamadı" : `${cohort.duration_weeks} haftanın ${week}. haftası`}
              </p>
              <WeekStrip total={cohort.duration_weeks} current={week} />
            </div>
          )}
        </div>
        <Stat label="Onay bekleyen" value={waiting.filter((row) => row.status === "pending").length} attention={waiting.some((row) => row.status === "pending")} />
        <Stat
          label="Bekleme listesi"
          value={waiting.filter((row) => row.status === "waitlisted").length}
          attention={seatsLeft > 0 && waiting.some((row) => row.status === "waitlisted")}
          hint={seatsLeft > 0 && waiting.some((row) => row.status === "waitlisted") ? "Yer açıldı" : certificates ? `${certificates} sertifika` : undefined}
        />
      </div>

      <UrlTabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="genel">Genel</TabsTrigger>
          <TabsTrigger value="ogrenciler">
            Öğrenciler
            {waiting.length > 0 && <span className="tabular rounded-full bg-amber-soft px-1.5 font-mono text-[11px] text-amber-ink">{waiting.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="oturumlar">
            Oturumlar <span className="tabular font-mono text-[11px] text-ink-muted">{sessions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="materyaller">
            Materyaller <span className="tabular font-mono text-[11px] text-ink-muted">{materials.length}</span>
          </TabsTrigger>
          <TabsTrigger value="duyurular">
            Duyurular <span className="tabular font-mono text-[11px] text-ink-muted">{announcements.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* GENEL */}
        <TabsContent value="genel">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <Card>
              <ActionForm action={updateCohort} className="flex flex-col gap-5">
                <Hidden name="class_id" value={cohort.id} />
                <CohortFields programs={programs} instructors={instructors} cohort={cohort} withStatus prefix="edit" />
                <div className="flex justify-end border-t border-line pt-4">
                  <SubmitButton>Değişiklikleri kaydet</SubmitButton>
                </div>
              </ActionForm>
            </Card>
            <div className="flex flex-col gap-4">
              <Card padding="sm" variant="muted">
                <CardTitle className="text-sm">Eğitmen</CardTitle>
                <p className="mt-1 text-sm">{instructor ? instructor.name : "Atanmadı"}</p>
                {instructor && (
                  <Link href={`/admin/kisiler/${instructor.user_id}`} className="mt-1 inline-block text-xs font-semibold text-accent hover:underline">
                    Profili aç
                  </Link>
                )}
              </Card>
              <ConfirmAction
                title="Dönem kalıcı olarak silinsin mi?"
                description="Kayıtlar, oturumlar, materyaller ve duyurular da silinir. Bu işlem geri alınamaz. Dönem yapılmayacaksa durumu “İptal” yapman yeterli."
                action={deleteCohort}
                fields={{ class_id: cohort.id }}
                confirmLabel="Kalıcı olarak sil"
                trigger={
                  <Button variant="ghost" size="sm" className="self-start text-danger-ink hover:bg-danger-soft">
                    <Trash2 /> Dönemi sil
                  </Button>
                }
              />
            </div>
          </div>
        </TabsContent>

        {/* ÖĞRENCİLER */}
        <TabsContent value="ogrenciler" className="flex flex-col gap-6">
          {waiting.length > 0 && (
            <Card>
              <SectionHeading
                as="h3"
                title="Bekleyen başvurular"
                description={
                  seatsLeft > 0
                    ? `${seatsLeft} yer boş. Onaylanan kişiye e-posta ve bildirim gider.`
                    : "Kontenjan dolu. Onaylamak için kontenjanı artır ya da bir kaydı iptal et."
                }
              />
              <ul className="mt-4 flex flex-col divide-y divide-line">
                {waiting.map((row) => (
                  <li key={row.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                    <PersonCell row={row} />
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge tone={enrollmentStatusTone[row.status]} size="sm" dot>
                        {enrollmentStatusLabels[row.status]}
                      </Badge>
                      <span className="text-xs text-ink-soft">{formatRelative(row.created_at)}</span>
                      <ActionForm action={approveEnrollment}>
                        <Hidden name="enrollment_id" value={row.id} />
                        <SubmitButton size="sm" variant="soft">
                          <Check /> Onayla
                        </SubmitButton>
                      </ActionForm>
                      <ConfirmAction
                        title="Başvuru reddedilsin mi?"
                        description={`${row.name} e-posta ile bilgilendirilir. Kişi daha sonra tekrar başvurabilir.`}
                        action={rejectEnrollment}
                        fields={{ enrollment_id: row.id }}
                        confirmLabel="Reddet"
                        trigger={
                          <Button size="sm" variant="ghost">
                            <X /> Reddet
                          </Button>
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <SectionHeading
              as="h3"
              title={`Kayıtlı öğrenciler (${active.length})`}
              action={
                <div className="flex flex-wrap justify-end gap-2">
                  {activeEmails.length > 0 && <CopyButton value={activeEmails.join(", ")} label="E-postaları kopyala" />}
                  {!finished && active.some((row) => row.status === "enrolled") && (
                    <ActionForm action={startAllEnrollments}>
                      <Hidden name="class_id" value={cohort.id} />
                      <SubmitButton size="sm" variant="outline">
                        <Play /> Hepsini başlat
                      </SubmitButton>
                    </ActionForm>
                  )}
                  {!finished && <AddPersonDialog classId={cohort.id} />}
                </div>
              }
            />
            {active.length === 0 ? (
              <EmptyState
                className="mt-4"
                icon={Users}
                title="Henüz kayıtlı öğrenci yok"
                description="Bekleyen başvuruları onayla ya da “Kişi ekle” ile doğrudan kayıt oluştur."
              />
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-line">
                {active.map((row) => (
                  <li key={row.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                    <PersonCell row={row} />
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge tone={enrollmentStatusTone[row.status]} size="sm" dot>
                        {enrollmentStatusLabels[row.status]}
                      </Badge>
                      {row.status === "enrolled" && (
                        <ActionForm action={markEnrollmentInProgress}>
                          <Hidden name="enrollment_id" value={row.id} />
                          <SubmitButton size="sm" variant="ghost">
                            <Play /> Başlat
                          </SubmitButton>
                        </ActionForm>
                      )}
                      {row.status !== "completed" && (
                        <ConfirmAction
                          title="Kayıt iptal edilsin mi?"
                          description={`${row.name} dönemden çıkarılır ve e-posta ile bilgilendirilir. Bekleme listesinde biri varsa yer açıldı bildirimi gider.`}
                          action={removeEnrollment}
                          fields={{ enrollment_id: row.id }}
                          confirmLabel="Kaydı iptal et"
                          trigger={
                            <Button size="sm" variant="ghost" aria-label={`${row.name} kaydını iptal et`}>
                              <Trash2 />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {cancelled.length > 0 && (
            <details className="group rounded-2xl border border-line bg-paper px-5 py-4">
              <summary className="cursor-pointer text-sm font-semibold text-ink-soft">İptal / reddedilen ({cancelled.length})</summary>
              <ul className="mt-3 flex flex-col divide-y divide-line">
                {cancelled.map((row) => (
                  <li key={row.id} className="flex items-center gap-3 py-2.5">
                    <PersonCell row={row} />
                    <span className="text-xs text-ink-soft">{formatRelative(row.updated_at)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </TabsContent>

        {/* OTURUMLAR */}
        <TabsContent value="oturumlar">
          <Card>
            <SectionHeading
              as="h3"
              title="Oturumlar"
              description="Kayıtlı öğrencilerin takviminde ve hatırlatmalarda görünür."
              action={
                <div className="flex flex-wrap justify-end gap-2">
                  <SessionGenerator
                    classId={cohort.id}
                    startDate={cohort.start_date}
                    weeks={cohort.duration_weeks}
                    nextWeek={nextWeek}
                    syllabusCount={syllabus.length}
                  />
                  <SessionDialog
                    classId={cohort.id}
                    withWeek
                    defaults={{ location: cohort.location, meeting_url: cohort.meeting_url }}
                    trigger={
                      <Button variant="outline" size="sm">
                        <CalendarPlus /> Tek oturum
                      </Button>
                    }
                  />
                </div>
              }
            />
            <div className="mt-4">
              <SessionList
                sessions={sessions}
                classId={cohort.id}
                withWeek
                defaults={{ location: cohort.location, meeting_url: cohort.meeting_url }}
                emptyHint="“Haftalık oluştur” ile tüm dönemi tek seferde planla; başlıklar müfredattan gelir."
              />
            </div>
          </Card>
        </TabsContent>

        {/* MATERYALLER */}
        <TabsContent value="materyaller">
          <Card>
            <SectionHeading
              as="h3"
              title="Materyaller"
              description="Ders notları, dosyalar ve ödevler. Yeni materyal kayıtlılara bildirim olarak gider."
              action={
                <MaterialDialog
                  classId={cohort.id}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus /> Materyal ekle
                    </Button>
                  }
                />
              }
            />
            {materials.length === 0 ? (
              <EmptyState className="mt-4" icon={FileText} title="Henüz materyal yok" description="Haftalık ders notlarını ve dosyaları buradan paylaş." />
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-line">
                {materials.map((material) => (
                  <li key={material.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <FileText className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{material.title}</p>
                        <Badge size="sm">{materialCategoryLabels[material.category] ?? material.category}</Badge>
                        {material.week_number && (
                          <Badge size="sm" tone="info">
                            Hafta {material.week_number}
                          </Badge>
                        )}
                      </div>
                      {material.content_md && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{material.content_md}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {material.file_path && materialUrls[material.file_path] && (
                        <Button asChild variant="ghost" size="icon-sm" aria-label="Dosyayı indir">
                          <a href={materialUrls[material.file_path]} target="_blank" rel="noreferrer">
                            <Download />
                          </a>
                        </Button>
                      )}
                      <MaterialDialog
                        classId={cohort.id}
                        material={material}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Materyali düzenle">
                            <Pencil />
                          </Button>
                        }
                      />
                      <ConfirmAction
                        title="Materyal silinsin mi?"
                        description={`${material.title}${material.file_path ? " ve dosyası" : ""} kalıcı olarak silinir.`}
                        action={deleteMaterial}
                        fields={{ material_id: material.id }}
                        confirmLabel="Sil"
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Materyali sil">
                            <Trash2 />
                          </Button>
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        {/* DUYURULAR */}
        <TabsContent value="duyurular">
          <Card>
            <SectionHeading
              as="h3"
              title="Duyurular"
              description="Kayıtlı öğrencilere bildirim olarak gider."
              action={
                <AnnouncementDialog
                  classId={cohort.id}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Megaphone /> Duyuru yayınla
                    </Button>
                  }
                />
              }
            />
            {announcements.length === 0 ? (
              <EmptyState className="mt-4" icon={Megaphone} title="Henüz duyuru yok" description="Ders değişikliği ya da hatırlatma için duyuru yayınla." />
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {announcements.map((announcement) => (
                  <li key={announcement.id} className="rounded-xl border border-line p-4">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{announcement.title}</p>
                        <p className="text-xs text-ink-soft">{formatRelative(announcement.created_at)}</p>
                      </div>
                      <AnnouncementDialog
                        classId={cohort.id}
                        announcement={announcement}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Duyuruyu düzenle">
                            <Pencil />
                          </Button>
                        }
                      />
                      <ConfirmAction
                        title="Duyuru silinsin mi?"
                        description={announcement.title}
                        action={deleteAnnouncement}
                        fields={{ announcement_id: announcement.id }}
                        confirmLabel="Sil"
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Duyuruyu sil">
                            <Trash2 />
                          </Button>
                        }
                      />
                    </div>
                    {announcement.body && (
                      <div className="prose-custom mt-2">
                        <ReactMarkdown>{announcement.body}</ReactMarkdown>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </UrlTabs>

      {finished && status === "completed" && (
        <Alert tone="success" title="Dönem tamamlandı">
          {certificates} sertifika üretildi{cohort.completed_at ? ` · ${formatDate(cohort.completed_at)}` : ""}.
        </Alert>
      )}
    </div>
  );
}

function PersonCell({ row }: { row: AdminEnrollment }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar name={row.name} size="sm" />
      <div className="min-w-0">
        <Link href={`/admin/kisiler/${row.user_id}`} className="block truncate text-sm font-medium hover:text-accent">
          {row.name}
        </Link>
        <p className="truncate text-xs text-ink-soft">
          {row.email}
          {row.discount_code ? ` · kod ${row.discount_code}` : ""}
        </p>
        {row.note && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">“{row.note}”</p>}
      </div>
    </div>
  );
}
