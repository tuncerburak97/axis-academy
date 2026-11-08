// src/app/(panel)/panel/egitimler/[classId]/page.tsx — dönem detayı: başvuru durumu ya da kayıtlı öğrencinin sınıf alanı
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, CalendarDays, Check, Clock, Hourglass, MapPin, Megaphone, UserRound, Video } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyCancelledEnrollment, getMyCohortDetail, getMyEnrollmentForClass } from "@/lib/queries/member";
import { sessionIsLive, type EnrollmentView } from "@/lib/queries/member-types";
import { formatDate, formatRelative } from "@/lib/format";
import { cancelEnrollmentAction } from "@/lib/actions/member";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { WeekStrip } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrollmentStatusBadge } from "@/components/panel/status-badges";
import { ConfirmAction } from "@/components/panel/confirm-action";
import { SessionItem } from "@/components/panel/session-item";
import { MaterialList } from "@/components/panel/material-list";
import { ReviewForm, ReviewSummary } from "@/components/panel/review-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Eğitim" };
export const dynamic = "force-dynamic";

function endDate(start: string, weeks: number) {
  const date = new Date(`${start}T12:00:00`);
  date.setDate(date.getDate() + Math.max(weeks, 1) * 7 - 1);
  return date;
}

export default async function CohortPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const user = await requireUser(`/panel/egitimler/${classId}`);
  const view = await getMyEnrollmentForClass(user.id, classId);
  if (!view) {
    const cancelled = await getMyCancelledEnrollment(user.id, classId);
    if (!cancelled?.classes) notFound();
    return <CancelledState programTitle={cancelled.classes.education_modules?.title ?? cancelled.classes.title} slug={cancelled.classes.education_modules?.slug} />;
  }

  if (view.group === "application") return <ApplicationStatus view={view} />;

  const detail = await getMyCohortDetail(user, view);
  const { cohort } = view;
  const now = Date.now();
  const upcoming = detail.sessions.filter((session) => new Date(session.ends_at).getTime() >= now);
  const past = detail.sessions.filter((session) => new Date(session.ends_at).getTime() < now).reverse();
  const nextSession = upcoming[0] ?? null;
  const shownWeek = Math.min(view.currentWeek, view.totalWeeks);
  const currentSyllabus = detail.syllabus.find((week) => week.week_number === view.currentWeek);
  const canReview = view.effective === "in_progress" || view.effective === "completed";
  const live = nextSession ? sessionIsLive(nextSession) : false;
  const meetingUrl = nextSession?.meeting_url || detail.meetingUrl;

  return (
    <div className="flex flex-col gap-6">
      <CohortHeader view={view} instructorName={detail.instructorName} />

      <Tabs defaultValue="genel" tabStyle="line">
        <TabsList aria-label="Eğitim bölümleri">
          <TabsTrigger value="genel">Genel</TabsTrigger>
          <TabsTrigger value="mufredat">Müfredat</TabsTrigger>
          <TabsTrigger value="oturumlar">
            Oturumlar {detail.sessions.length > 0 && <span className="tabular font-mono text-xs text-ink-muted">{detail.sessions.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="materyaller">
            Materyaller {detail.materials.length > 0 && <span className="tabular font-mono text-xs text-ink-muted">{detail.materials.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="duyurular">
            Duyurular {detail.announcements.length > 0 && <span className="tabular font-mono text-xs text-ink-muted">{detail.announcements.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="degerlendirme">Değerlendirme</TabsTrigger>
        </TabsList>

        <TabsContent value="genel">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-6">
              <Card className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between gap-3">
                  <CardEyebrow>İlerleme</CardEyebrow>
                  <span className="text-sm text-ink-soft">
                    {view.group === "completed" ? (
                      "Tamamlandı"
                    ) : view.currentWeek === 0 ? (
                      `${formatDate(cohort.start_date)} tarihinde başlıyor`
                    ) : (
                      <>
                        <span className="tabular font-mono text-ink">{shownWeek}</span> / {view.totalWeeks}. hafta
                      </>
                    )}
                  </span>
                </div>
                <WeekStrip total={view.totalWeeks} current={view.currentWeek} />
                {currentSyllabus && view.group !== "completed" && (
                  <p className="text-sm">
                    <span className="text-ink-soft">Bu haftanın konusu: </span>
                    <span className="font-semibold">{currentSyllabus.title}</span>
                  </p>
                )}
              </Card>

              {cohort.overview || cohort.description ? (
                <Card>
                  <CardEyebrow>Eğitim hakkında</CardEyebrow>
                  <div className="prose-custom mt-2">
                    <ReactMarkdown>{cohort.overview || cohort.description}</ReactMarkdown>
                  </div>
                </Card>
              ) : null}

              {detail.announcements[0] && (
                <Card variant="muted" className="flex gap-3">
                  <Megaphone className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-ink-soft">Son duyuru · {formatRelative(detail.announcements[0].created_at)}</p>
                    <p className="font-semibold">{detail.announcements[0].title}</p>
                    <div className="prose-custom line-clamp-3">
                      <ReactMarkdown>{detail.announcements[0].body}</ReactMarkdown>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              {view.group !== "completed" && (
                <Card className="flex flex-col gap-3">
                  <CardEyebrow>Sıradaki ders</CardEyebrow>
                  {nextSession ? (
                    <ul>
                      <SessionItem session={nextSession} showSource={false} />
                    </ul>
                  ) : (
                    <p className="text-sm text-ink-soft">Takvime henüz oturum eklenmedi. Ders günleri: {cohort.schedule_note || "yakında"}.</p>
                  )}
                  {meetingUrl && (
                    <Button asChild variant={live ? "primary" : "outline"}>
                      <a href={meetingUrl} target="_blank" rel="noreferrer">
                        <Video aria-hidden /> {live ? "Derse katıl" : "Ders bağlantısını aç"}
                      </a>
                    </Button>
                  )}
                </Card>
              )}
              {view.group === "completed" && (
                <Card variant="muted" className="flex flex-col gap-3">
                  <p className="font-semibold">Tebrikler, bu eğitimi tamamladın.</p>
                  <p className="text-sm text-ink-soft">Katılım belgen Belgelerim bölümünde. Doğrulama koduyla herkesle paylaşabilirsin.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/panel/belgeler">Belgelerime git</Link>
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mufredat">
          {detail.syllabus.length === 0 ? (
            <EmptyState title="Müfredat henüz eklenmedi" description="Haftalık konu akışı eklendiğinde burada göreceksin." />
          ) : (
            <ol className="flex flex-col gap-2">
              {detail.syllabus.map((week) => {
                const done = week.week_number < view.currentWeek;
                const current = week.week_number === view.currentWeek;
                return (
                  <li
                    key={week.week_number}
                    aria-current={current ? "step" : undefined}
                    className={cn(
                      "flex gap-4 rounded-2xl border bg-paper p-4 sm:p-5",
                      current ? "border-amber shadow-[0_0_0_3px_rgb(245_158_11/0.15)]" : "border-line",
                    )}
                  >
                    <span
                      className={cn(
                        "tabular flex size-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-medium",
                        done ? "bg-accent text-white" : current ? "bg-amber text-ink" : "bg-surface text-ink-soft ring-1 ring-line",
                      )}
                    >
                      {done ? <Check className="size-4" aria-hidden /> : week.week_number}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        <span className="text-ink-soft">{week.week_number}. hafta</span> {week.title}
                        {current && (
                          <Badge tone="amber" size="sm">
                            Bu hafta
                          </Badge>
                        )}
                      </p>
                      {week.description && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{week.description}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="oturumlar">
          {detail.sessions.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Henüz oturum eklenmedi" description="Ders oturumları eklendiğinde burada ve takviminde görünür." />
          ) : (
            <div className="flex flex-col gap-6">
              {upcoming.length > 0 && (
                <Card padding="none" className="px-4 sm:px-5">
                  <p className="pt-4 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Yaklaşan</p>
                  <ul className="divide-y divide-line">
                    {upcoming.map((session) => (
                      <SessionItem key={session.id} session={session} showSource={false} />
                    ))}
                  </ul>
                </Card>
              )}
              {past.length > 0 && (
                <Card padding="none" className="px-4 sm:px-5">
                  <p className="pt-4 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Geçmiş</p>
                  <ul className="divide-y divide-line">
                    {past.map((session) => (
                      <SessionItem key={session.id} session={session} showSource={false} past />
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="materyaller">
          {detail.materials.length === 0 ? (
            <EmptyState title="Henüz materyal yok" description="Eğitmenin ders notu, ödev ya da dosya paylaştığında burada görünür ve sana bildirim gelir." />
          ) : (
            <MaterialList materials={detail.materials} currentWeek={view.group === "active" ? view.currentWeek : undefined} />
          )}
        </TabsContent>

        <TabsContent value="duyurular">
          {detail.announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="Henüz duyuru yok" description="Ders değişiklikleri ve önemli notlar burada paylaşılır." />
          ) : (
            <ul className="flex flex-col gap-3">
              {detail.announcements.map((announcement) => (
                <li key={announcement.id}>
                  <Card>
                    <p className="text-xs text-ink-soft">{formatDate(announcement.created_at)}</p>
                    <p className="mt-0.5 font-semibold">{announcement.title}</p>
                    <div className="prose-custom mt-1">
                      <ReactMarkdown>{announcement.body}</ReactMarkdown>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="degerlendirme">
          <Card className="max-w-2xl">
            <CardEyebrow>Değerlendirme</CardEyebrow>
            <p className="mb-5 mt-1 text-sm text-ink-soft">Deneyimini paylaş; sonraki katılımcılar için çok değerli.</p>
            {detail.review ? (
              <ReviewSummary review={detail.review} />
            ) : canReview ? (
              <ReviewForm target="class" targetId={cohort.id} />
            ) : (
              <p className="text-sm text-ink-soft">Eğitim başladığında buradan değerlendirme yapabilirsin.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CohortHeader({ view, instructorName }: { view: EnrollmentView; instructorName?: string | null }) {
  const { cohort } = view;
  return (
    <header className="flex flex-col gap-4">
      <Link href="/panel/egitimler" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Eğitimlerim
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-balance sm:text-[28px]">{view.programTitle}</h1>
          {cohort.title !== view.programTitle && <p className="mt-1 text-[15px] text-ink-soft">{cohort.title}</p>}
        </div>
        <EnrollmentStatusBadge status={view.effective} />
      </div>
      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Tarihler</dt>
          <CalendarDays className="size-4" aria-hidden />
          <dd>
            {formatDate(cohort.start_date)} – {formatDate(endDate(cohort.start_date, cohort.duration_weeks))}
          </dd>
        </div>
        {cohort.schedule_note && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Ders günleri</dt>
            <Clock className="size-4" aria-hidden />
            <dd>
              {cohort.schedule_note} · {cohort.duration_hours} saat
            </dd>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Yer</dt>
          <MapPin className="size-4" aria-hidden />
          <dd>{cohort.location || "Online"}</dd>
        </div>
        {instructorName && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Eğitmen</dt>
            <UserRound className="size-4" aria-hidden />
            <dd>{instructorName}</dd>
          </div>
        )}
      </dl>
    </header>
  );
}

function ApplicationStatus({ view }: { view: EnrollmentView }) {
  const waitlisted = view.enrollment.status === "waitlisted";
  const slug = view.cohort.education_modules?.slug;
  return (
    <div className="flex flex-col gap-6">
      <CohortHeader view={view} />
      <Card className="flex max-w-2xl flex-col gap-5">
        <div className="flex gap-4">
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", waitlisted ? "bg-info-soft text-info-ink" : "bg-amber-soft text-amber-ink")}>
            <Hourglass className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight">{waitlisted ? "Bekleme listesindesin" : "Başvurun onay bekliyor"}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {waitlisted
                ? "Bu dönemin kontenjanı dolu. Biri ayrılır ya da kontenjan artarsa sıradaki kişi olarak sana e-posta ve panel bildirimiyle haber vereceğiz."
                : "Ekibimiz başvurunu inceliyor; genellikle 1 iş günü içinde dönüş yapıyoruz. Onaylandığında ders bağlantısı, materyaller ve oturumlar burada açılır."}
            </p>
            <p className="mt-2 text-xs text-ink-muted">Başvuru tarihi: {formatDate(view.enrollment.created_at)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <ConfirmAction
            action={cancelEnrollmentAction}
            fields={{ enrollment_id: view.enrollment.id }}
            trigger="Başvuruyu geri çek"
            title="Başvurunu geri çekmek istiyor musun?"
            description={`${view.programTitle} başvurun iptal edilir. Kontenjan uygunsa daha sonra tekrar başvurabilirsin.`}
            confirmLabel="Geri çek"
            successHref="/panel/egitimler"
          />
          {slug && (
            <Button asChild variant="ghost">
              <Link href={`/programlar/${slug}`}>Program sayfası</Link>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function CancelledState({ programTitle, slug }: { programTitle: string; slug?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/egitimler" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Eğitimlerim
      </Link>
      <EmptyState
        title={`${programTitle} kaydın aktif değil`}
        description="Bu döneme ait başvurun geri çekildi ya da iptal edildi. Kontenjan varsa program sayfasından tekrar başvurabilirsin."
        action={
          <>
            {slug && (
              <Button asChild>
                <Link href={`/programlar/${slug}`}>Program sayfasına git</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/panel/egitimler">Eğitimlerime dön</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
