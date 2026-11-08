// src/app/(panel)/panel/page.tsx — "Bugün": üye alanının açılış ekranı. Soru: "Bugün ne yapmam lazım?"
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Compass, Hourglass, Inbox, MessageSquare, Presentation, Receipt } from "lucide-react";
import { requireUser, firstName } from "@/lib/auth";
import {
  getMyEnrollmentViews,
  getMyRequests,
  getMySessions,
  getSuggestedCohorts,
  getUnreadStaffMessages,
} from "@/lib/queries/member";
import { getMyNotifications } from "@/lib/queries/notifications";
import { istanbulDayKey, istanbulHour } from "@/lib/queries/member-types";
import { applyDiscount, daysFromToday, formatDate, formatDateShort, formatRelative } from "@/lib/format";
import { enrollmentStatusLabels, notificationKindLabels, requestKindLabels, requestTrack } from "@/lib/types/platform";
import { Accent } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow } from "@/components/ui/card";
import { DateTile, Price } from "@/components/ui/data";
import { EmptyState } from "@/components/ui/feedback";
import { SectionHeading } from "@/components/ui/page-header";
import { StatusTrack, WeekStrip } from "@/components/ui/progress";
import { NextSessionCard } from "@/components/panel/session-item";
import { EnrollmentStatusBadge, RequestStatusBadge } from "@/components/panel/status-badges";
import { NewRequestMenu } from "@/components/panel/new-request-menu";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Bugün" };
export const dynamic = "force-dynamic";

function greeting() {
  const hour = istanbulHour();
  if (hour < 5) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

function joinTr(parts: string[]) {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} ve ${parts[parts.length - 1]}`;
}

export default async function TodayPage() {
  const user = await requireUser("/panel");
  const now = new Date().toISOString();
  const [enrollments, requests, upcoming, staffMessages, notifications] = await Promise.all([
    getMyEnrollmentViews(user.id),
    getMyRequests(user.id),
    getMySessions(user, { from: now, limit: 20 }),
    getUnreadStaffMessages(user.id),
    getMyNotifications(5),
  ]);

  const nextSession = upcoming[0] ?? null;
  const todayKey = istanbulDayKey(new Date());
  const todaySessions = upcoming.filter((session) => istanbulDayKey(session.starts_at) === todayKey);
  const quotes = requests.filter((request) => request.status === "quoted");
  const applications = enrollments.filter((view) => view.group === "application");
  const activeCohorts = enrollments.filter((view) => view.group === "active");
  const activeRequests = requests.filter((request) => !["completed", "cancelled"].includes(request.status));
  const isNewMember = enrollments.length === 0 && requests.length === 0 && user.role !== "instructor";
  const suggestions = activeCohorts.length === 0 ? await getSuggestedCohorts(isNewMember ? 3 : 2) : [];

  const summaryParts: string[] = [];
  if (todaySessions.length) summaryParts.push(`bugün ${todaySessions.length} dersin var`);
  if (quotes.length) summaryParts.push(`${quotes.length} teklif onayını bekliyor`);
  if (staffMessages.length) summaryParts.push(`${staffMessages.length} yeni mesajın var`);
  const summary = summaryParts.length
    ? `${joinTr(summaryParts).replace(/^./, (char) => char.toLocaleUpperCase("tr-TR"))}.`
    : nextSession
      ? `Bugün senden beklenen bir şey yok. Sıradaki dersin ${formatRelative(nextSession.starts_at)}.`
      : isNewMember
        ? "Hoş geldin! Bir döneme katılarak ya da talep oluşturarak başlayabilirsin."
        : "Bugün senden beklenen bir şey yok.";

  const expectedCount = quotes.length + applications.length + staffMessages.length;

  return (
    <div className="flex flex-col gap-8">
      <header className="pt-2">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">
          {greeting()}, <Accent>{firstName(user)}</Accent>
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-soft">{summary}</p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-8">
          {nextSession ? (
            <NextSessionCard session={nextSession} />
          ) : !isNewMember ? (
            <Card variant="muted" className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-paper text-ink-soft ring-1 ring-line">
                <CalendarDays className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">Planlanmış dersin yok</p>
                <p className="text-sm text-ink-soft">Yeni oturumlar eklendiğinde burada ve takviminde görünür.</p>
              </div>
            </Card>
          ) : null}

          {expectedCount > 0 && (
            <section aria-labelledby="beklenenler" className="flex flex-col gap-3">
              <SectionHeading
                title={
                  <span id="beklenenler" className="inline-flex items-center gap-2">
                    Senden beklenenler
                    <span className="tabular inline-flex min-w-6 items-center justify-center rounded-full bg-amber px-1.5 py-0.5 font-mono text-xs text-ink">
                      {expectedCount}
                    </span>
                  </span>
                }
              />
              <ul className="flex flex-col gap-2.5">
                {quotes.map((quote) => {
                  const daysLeft = quote.quote_valid_until ? daysFromToday(quote.quote_valid_until) : null;
                  const amount = quote.quote_amount ? applyDiscount(quote.quote_amount, quote.discount_percent) : null;
                  return (
                    <li key={quote.id}>
                      <ExpectedRow
                        href={`/panel/talepler/${quote.id}`}
                        icon={<Receipt className="size-5" aria-hidden />}
                        tone="amber"
                        title={`Teklifin hazır: ${quote.title || requestKindLabels[quote.kind]}`}
                        meta={
                          <>
                            {amount !== null && <Price amount={amount} className="text-ink" />}
                            {quote.quote_valid_until && (
                              <span className={cn(daysLeft !== null && daysLeft <= 2 && "font-semibold text-amber-ink")}>
                                {daysLeft !== null && daysLeft < 0
                                  ? "Süresi doldu"
                                  : daysLeft === 0
                                    ? "Bugün sona eriyor"
                                    : `${formatDateShort(quote.quote_valid_until)} tarihine kadar geçerli`}
                              </span>
                            )}
                          </>
                        }
                        cta="Teklifi incele"
                      />
                    </li>
                  );
                })}
                {staffMessages.map((message) => (
                  <li key={message.id}>
                    <ExpectedRow
                      href={message.link || "/panel/talepler"}
                      icon={<MessageSquare className="size-5" aria-hidden />}
                      tone="accent"
                      title={message.title}
                      meta={<span className="line-clamp-1">{message.body}</span>}
                      cta="Yanıtla"
                    />
                  </li>
                ))}
                {applications.map((view) => (
                  <li key={view.enrollment.id}>
                    <ExpectedRow
                      href={`/panel/egitimler/${view.cohort.id}`}
                      icon={<Hourglass className="size-5" aria-hidden />}
                      tone="info"
                      title={`${view.programTitle}: ${enrollmentStatusLabels[view.enrollment.status].toLocaleLowerCase("tr-TR")}`}
                      meta={
                        <span>
                          {view.enrollment.status === "waitlisted"
                            ? "Yer açılınca sana haber vereceğiz."
                            : "Ekibimiz başvurunu inceliyor; onaylanınca haber vereceğiz."}{" "}
                          Başlangıç {formatDateShort(view.cohort.start_date)}.
                        </span>
                      }
                      cta="Ayrıntılar"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activeCohorts.length > 0 && (
            <section aria-labelledby="aktif-egitimler" className="@container flex flex-col gap-3">
              <SectionHeading
                title={<span id="aktif-egitimler">Eğitimlerin</span>}
                action={
                  <Link href="/panel/egitimler" className="text-sm font-semibold text-accent hover:underline">
                    Tümü
                  </Link>
                }
              />
              <div className="grid gap-3 @xl:grid-cols-2">
                {activeCohorts.map((view) => (
                  <Link key={view.enrollment.id} href={`/panel/egitimler/${view.cohort.id}`} className="group block min-w-0">
                    <Card variant="interactive" className="flex h-full flex-col gap-4">
                      <div className="flex flex-wrap-reverse items-start justify-between gap-x-3 gap-y-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold group-hover:text-accent">{view.programTitle}</p>
                          <p className="mt-0.5 truncate text-sm text-ink-soft">{view.cohort.schedule_note || view.cohort.title}</p>
                        </div>
                        <EnrollmentStatusBadge status={view.effective} size="sm" />
                      </div>
                      <div className="mt-auto flex flex-col gap-2">
                        <WeekStrip total={view.totalWeeks} current={view.currentWeek} />
                        <p className="text-xs text-ink-soft">
                          {view.currentWeek === 0 ? (
                            <>Başlangıç {formatDate(view.cohort.start_date)}</>
                          ) : (
                            <>
                              <span className="tabular font-mono text-ink">{Math.min(view.currentWeek, view.totalWeeks)}</span> / {view.totalWeeks}. hafta
                            </>
                          )}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {activeRequests.length > 0 && (
            <section aria-labelledby="aktif-talepler" className="flex flex-col gap-3">
              <SectionHeading
                title={<span id="aktif-talepler">Taleplerin</span>}
                action={
                  <Link href="/panel/talepler" className="text-sm font-semibold text-accent hover:underline">
                    Tümü
                  </Link>
                }
              />
              <div className="flex flex-col gap-3">
                {activeRequests.slice(0, 4).map((request) => {
                  const track = requestTrack(request.kind, request.training_mode, request.status);
                  return (
                    <Link key={request.id} href={`/panel/talepler/${request.id}`} className="group block min-w-0">
                      <Card variant="interactive" className={cn("flex flex-col gap-4", request.status === "quoted" && "border-amber/60")}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{requestKindLabels[request.kind]}</p>
                            <p className="mt-0.5 truncate font-semibold group-hover:text-accent">{request.title || requestKindLabels[request.kind]}</p>
                          </div>
                          <RequestStatusBadge status={request.status} size="sm" />
                        </div>
                        <StatusTrack steps={track.labels} current={track.current} finished={track.finished} />
                        {request.progress_note && <p className="line-clamp-2 text-sm text-ink-soft">{request.progress_note}</p>}
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {isNewMember && (
            <EmptyState
              icon={Compass}
              title="İlk adımı atalım"
              description="Bir eğitim dönemine katıl ya da analiz, tez veya birebir eğitim için talep oluştur. Takvimin, derslerin ve tekliflerin burada toplanır."
              action={
                <>
                  <Button asChild>
                    <Link href="/programlar">
                      Programları keşfet <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <NewRequestMenu variant="outline" align="center" />
                </>
              }
            />
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          {user.role === "instructor" && (
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Presentation className="size-4 text-accent" aria-hidden />
                <p className="text-sm font-semibold">Eğitmen alanı</p>
              </div>
              <p className="text-sm text-ink-soft">Dönemlerinin oturumlarını planla, duyuru yap ve materyal paylaş.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/panel/derslerim">Derslerime git</Link>
              </Button>
            </Card>
          )}
          {suggestions.length > 0 && (
            <Card className="flex flex-col gap-4">
              <div>
                <CardEyebrow>Yaklaşan dönemler</CardEyebrow>
                <p className="mt-1 text-sm text-ink-soft">Yeni bir beceri için yerini şimdiden ayırt.</p>
              </div>
              <ul className="flex flex-col divide-y divide-line">
                {suggestions.map((cohort) => (
                  <li key={cohort.id}>
                    <Link href={`/programlar/${cohort.module_slug}`} className="group flex gap-3 py-3 first:pt-0 last:pb-0">
                      <DateTile date={cohort.start_date} />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-sm font-semibold group-hover:text-accent">{cohort.module_title}</span>
                        <span className="truncate text-xs text-ink-soft">{cohort.schedule_note || `${cohort.duration_weeks} hafta`}</span>
                        <span className="flex items-center gap-2 text-xs text-ink-soft">
                          {cohort.price ? <Price amount={Number(cohort.price)} className="text-ink" /> : null}
                          {cohort.capacity - cohort.taken_seats <= 3 && cohort.capacity > cohort.taken_seats && (
                            <Badge tone="amber" size="sm">
                              Son {cohort.capacity - cohort.taken_seats} yer
                            </Badge>
                          )}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm">
                <Link href="/programlar">Tüm programlar</Link>
              </Button>
            </Card>
          )}

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <CardEyebrow>Son bildirimler</CardEyebrow>
              <Link href="/panel/bildirimler" className="text-xs font-semibold text-accent hover:underline">
                Tümü
              </Link>
            </div>
            {notifications.length === 0 ? (
              <p className="py-4 text-sm text-ink-soft">Talep ve eğitimlerindeki gelişmeler burada görünür.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {notifications.map((notification) => (
                  <li key={notification.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link href={notification.link || "/panel/bildirimler"} className="group flex gap-2.5">
                      <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", notification.read_at ? "bg-line-strong" : "bg-accent")} />
                      <span className="min-w-0">
                        <span className={cn("block text-sm leading-snug group-hover:text-accent", !notification.read_at && "font-semibold")}>
                          {notification.title}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {notificationKindLabels[notification.kind] ?? "Bilgi"} · {formatRelative(notification.created_at)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {!isNewMember && (
            <Card variant="muted" className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Inbox className="size-4 text-ink-soft" aria-hidden />
                <p className="text-sm font-semibold">Yeni bir ihtiyacın mı var?</p>
              </div>
              <p className="text-sm text-ink-soft">Analiz, tez düzenleme ya da birebir eğitim için birkaç adımda talep oluştur.</p>
              <NewRequestMenu variant="outline" size="sm" align="start" />
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

const toneStyles = {
  amber: "bg-amber-soft text-amber-ink",
  accent: "bg-accent-soft text-accent",
  info: "bg-info-soft text-info-ink",
} as const;

function ExpectedRow({
  href,
  icon,
  tone,
  title,
  meta,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  tone: keyof typeof toneStyles;
  title: string;
  meta: React.ReactNode;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border bg-paper p-3.5 shadow-card transition-[border-color,box-shadow] hover:shadow-raise sm:gap-4 sm:p-4",
        tone === "amber" ? "border-amber/60" : "border-line hover:border-line-strong",
      )}
    >
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", toneStyles[tone])}>{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px] font-semibold group-hover:text-accent">{title}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-ink-soft">{meta}</span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-accent sm:inline-flex">
        {cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
      <ArrowRight className="size-4 shrink-0 text-ink-muted sm:hidden" aria-hidden />
    </Link>
  );
}
