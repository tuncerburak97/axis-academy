// src/app/(panel)/panel/derslerim/[classId]/page.tsx — eğitmen dönem yönetimi: oturumlar, öğrenciler, duyurular, materyaller
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, CalendarDays, MapPin, Video } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTeachingDetail } from "@/lib/queries/member-instructor";
import { formatDate, formatTimeRange, formatWeekday } from "@/lib/format";
import { cohortCurrentWeek, enrollmentStatusLabels, type EnrollmentStatus } from "@/lib/types/platform";
import { Avatar, DateTile } from "@/components/ui/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { WeekStrip } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementForm, DeleteSessionButton, MaterialForm, SessionDialog } from "@/components/panel/instructor-forms";
import { MaterialList } from "@/components/panel/material-list";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dönem yönetimi" };
export const dynamic = "force-dynamic";

export default async function TeachingCohortPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await requireUser(`/panel/derslerim/${classId}`);
  if (user.role !== "instructor") notFound();
  const detail = await getTeachingDetail(user.id, classId);
  if (!detail) notFound();

  const { cohort } = detail;
  const total = Math.max(cohort.duration_weeks, 1);
  const currentWeek = cohort.status === "completed" ? total + 1 : cohortCurrentWeek(cohort.start_date, total, cohort.current_week_override);
  const now = Date.now();
  const maxWeek = detail.sessions.reduce((max, session) => Math.max(max, session.week_number ?? 0), 0);
  const programTitle = cohort.education_modules?.title ?? cohort.title;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Link href="/panel/derslerim" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Derslerim
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">Eğitmen görünümü</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-balance sm:text-[28px]">{programTitle}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {cohort.title} · {formatDate(cohort.start_date)} · {cohort.schedule_note || `${cohort.duration_weeks} hafta`}
            </p>
          </div>
          <SessionDialog classId={cohort.id} defaults={{ location: cohort.location, meeting_url: cohort.meeting_url, nextWeek: Math.min(maxWeek + 1, total) }} />
        </div>
        <Card padding="sm" className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-soft">İlerleme</span>
            <span className="text-ink-soft">
              {currentWeek === 0 ? "Başlamadı" : currentWeek > total ? "Tamamlandı" : `${currentWeek} / ${total}. hafta`}
            </span>
          </div>
          <WeekStrip total={total} current={currentWeek} />
        </Card>
      </header>

      <Tabs defaultValue="oturumlar" tabStyle="line">
        <TabsList aria-label="Dönem yönetimi">
          <TabsTrigger value="oturumlar">Oturumlar</TabsTrigger>
          <TabsTrigger value="ogrenciler">
            Öğrenciler <span className="tabular font-mono text-xs text-ink-muted">{detail.students.length}</span>
          </TabsTrigger>
          <TabsTrigger value="duyurular">Duyurular</TabsTrigger>
          <TabsTrigger value="materyaller">Materyaller</TabsTrigger>
        </TabsList>

        <TabsContent value="oturumlar">
          {detail.sessions.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Henüz oturum yok" description="Oturum ekle; öğrencilerin takviminde görünür ve .ics olarak indirilebilir." />
          ) : (
            <Card padding="none">
              <ul className="divide-y divide-line">
                {detail.sessions.map((session) => {
                  const past = new Date(session.ends_at).getTime() < now;
                  const label = session.title || `${formatWeekday(session.starts_at)} oturumu`;
                  return (
                    <li key={session.id} className={cn("flex gap-3 px-4 py-3.5 sm:gap-4 sm:px-5", past && "opacity-70")}>
                      <DateTile date={session.starts_at} />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="tabular font-mono text-sm font-medium">{formatTimeRange(session.starts_at, session.ends_at)}</span>
                          {session.week_number && (
                            <Badge size="sm" tone={session.week_number === currentWeek ? "amber" : "neutral"}>
                              {session.week_number}. hafta
                            </Badge>
                          )}
                          {past && <Badge size="sm">Geçti</Badge>}
                        </div>
                        <p className="truncate font-semibold">{session.title || "Başlıksız oturum"}</p>
                        <p className="flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
                          <span className="inline-flex items-center gap-1.5">
                            {session.meeting_url ? <Video className="size-4" aria-hidden /> : <MapPin className="size-4" aria-hidden />}
                            {session.location}
                          </span>
                          {session.meeting_url && (
                            <a href={session.meeting_url} target="_blank" rel="noreferrer" className="truncate text-accent hover:underline">
                              Bağlantı
                            </a>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-start gap-1">
                        <SessionDialog classId={cohort.id} session={session} />
                        <DeleteSessionButton classId={cohort.id} sessionId={session.id} label={label} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ogrenciler">
          {detail.students.length === 0 ? (
            <EmptyState title="Henüz onaylı öğrenci yok" description="Başvurular onaylandığında öğrenciler burada listelenir." />
          ) : (
            <Card padding="none">
              <ul className="divide-y divide-line">
                {detail.students.map((student) => (
                  <li key={student.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <Avatar name={student.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{student.name}</p>
                      <p className="text-xs text-ink-soft">Kayıt: {formatDate(student.since)}</p>
                    </div>
                    <Badge size="sm" tone={student.status === "completed" ? "success" : "accent"}>
                      {enrollmentStatusLabels[student.status as EnrollmentStatus] ?? student.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="duyurular">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card>
              <CardEyebrow className="mb-4">Yeni duyuru</CardEyebrow>
              <AnnouncementForm classId={cohort.id} />
            </Card>
            <div className="flex flex-col gap-3">
              {detail.announcements.length === 0 ? (
                <p className="text-sm text-ink-soft">Henüz duyuru yapmadın.</p>
              ) : (
                detail.announcements.map((announcement) => (
                  <Card key={announcement.id} padding="sm">
                    <p className="text-xs text-ink-soft">{formatDate(announcement.created_at)}</p>
                    <p className="font-semibold">{announcement.title}</p>
                    <div className="prose-custom">
                      <ReactMarkdown>{announcement.body}</ReactMarkdown>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="materyaller">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card className="h-fit">
              <CardEyebrow className="mb-4">Materyal ekle</CardEyebrow>
              <MaterialForm classId={cohort.id} currentWeek={currentWeek > total ? 0 : currentWeek} />
            </Card>
            <div className="min-w-0">
              {detail.materials.length === 0 ? (
                <p className="text-sm text-ink-soft">Henüz materyal yok.</p>
              ) : (
                <MaterialList
                  materials={detail.materials.map((material) => ({ ...material, created_at: "" }))}
                  currentWeek={currentWeek}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
