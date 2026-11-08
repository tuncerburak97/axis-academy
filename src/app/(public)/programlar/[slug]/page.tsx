// src/app/(public)/programlar/[slug]/page.tsx — program sayfası: önemli bilgiler, katılım seçenekleri (grup/birebir/kurumsal),
// müfredat, kazanımlar, yorumlar ve SSS. Eski uuid adresleri slug'a kalıcı yönlenir. ?basvur=<dönem> başvuru diyaloğunu açar.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, Building2, CalendarDays, ChevronRight, Clock3, GraduationCap, MapPin, Sparkles, UserRound } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getProgramByParam, getProgramDetail, isUuid, programCategoryLabels, isProgramCategory } from "@/lib/queries/public-catalog";
import { openGraphDefaults, organizationJsonLd, siteUrl } from "@/lib/queries/public-seo";
import { programLevelLabels, type ProgramLevel } from "@/lib/types/platform";
import { formatDate, formatTRY } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow } from "@/components/ui/card";
import { DateTile, Price, SeatMeter } from "@/components/ui/data";
import { EmptyState } from "@/components/ui/feedback";
import { Eyebrow } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccentTitle, Container, Section, SectionIntro } from "@/components/public/section";
import { CohortRow, MyCohortStatus, cohortIsFull } from "@/components/public/cohort-row";
import { CategoryMark } from "@/components/public/program-card";
import { Checklist, FaqList, JsonLd, ReviewList } from "@/components/public/blocks";
import { ProgramVisual } from "@/components/public/showcase-art";
import { SyllabusTimeline } from "@/components/public/syllabus-timeline";
import { ApplyButton, ApplyProvider } from "@/components/public/apply-dialog";
import { BundleSyllabusDialog } from "@/components/public/bundle-syllabus-dialog";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ basvur?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramByParam(slug);
  if (!program) return { title: "Program bulunamadı" };
  return {
    title: program.title,
    description: program.description,
    alternates: { canonical: `/programlar/${program.slug}` },
    openGraph: { ...openGraphDefaults, title: `${program.title} | Axis Akademi`, description: program.description, type: "website", url: siteUrl(`/programlar/${program.slug}`) },
  };
}

const programFaq = [
  {
    question: "Grup dönemi ile birebir ders arasındaki fark ne?",
    answer: "Grup döneminde tarih ve müfredat sabittir, kişi başı fiyat daha uygundur. Birebirde takvimi ve konuları sen belirlersin; dersler tamamen senin dosyaların üzerinden ilerler.",
  },
  {
    question: "Başvurduktan sonra ne oluyor?",
    answer: "Başvurun ekibimize düşer ve genellikle aynı gün onaylanır. Onayla birlikte e-posta ve panel bildirimi alırsın; ders bağlantıları panelindeki Eğitimlerim sayfasında görünür.",
  },
  {
    question: "Dönem doluysa ne yapmalıyım?",
    answer: "Bekleme listesine katıl. Kayıtlı biri ayrılırsa sıradaki kişiye otomatik haber veririz.",
  },
  {
    question: "Ödemeyi nasıl yapıyorum?",
    answer: "Sitede ödeme alınmaz. Fiyatlar bilgi amaçlıdır; başvurun onaylandığında ödeme ayrıntılarını ekibimizle konuşursun.",
  },
  {
    question: "Sonunda belge alıyor muyum?",
    answer: "Dönemi tamamlayan herkes doğrulama kodlu katılım belgesi alır. Belgeyi panelinden indirir, kodu /sertifika sayfasında herkes doğrulayabilir.",
  },
];

export default async function ProgramPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const [{ slug }, { basvur }] = await Promise.all([params, searchParams]);
  const program = await getProgramByParam(slug);
  if (!program) notFound();
  if (isUuid(slug) || slug !== program.slug) {
    permanentRedirect(`/programlar/${program.slug}${basvur ? `?basvur=${encodeURIComponent(basvur)}` : ""}`);
  }

  const [detail, user] = await Promise.all([getProgramDetail(program), getSessionUser()]);
  const { cohorts, plans, bundles, syllabus, topics, reviews, startingPrice } = detail;
  const category = isProgramCategory(program.category) ? program.category : "excel";
  const level = programLevelLabels[program.level as ProgramLevel] ?? "Her seviye";
  const next = cohorts.find((cohort) => !cohort.my_status) ?? cohorts[0] ?? null;
  const nextFull = next ? cohortIsFull(next) : false;
  const hourly = plans.find((plan) => plan.training_type === "individual" && plan.unit === "per_hour");
  const groupPlans = plans.filter((plan) => plan.training_type === "group");
  const weeks = syllabus.length || next?.duration_weeks || 0;
  const hours = next?.duration_hours || (bundles.length ? Math.min(...bundles.map((bundle) => bundle.duration_hours)) : 0);
  const outcomes = program.outcomes.length > 0 ? program.outcomes : program.features;
  const extraFeatures = program.outcomes.length > 0 ? program.features : [];
  const defaultTab = cohorts.length > 0 ? "grup" : bundles.length > 0 || hourly ? "birebir" : "kurumsal";
  const paragraphs = program.long_description.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const birebirHref = `/teklif/birebir?program=${program.slug}`;

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: program.description,
    url: siteUrl(`/programlar/${program.slug}`),
    provider: organizationJsonLd,
    inLanguage: "tr",
    educationalLevel: level,
    ...(outcomes.length ? { teaches: outcomes.slice(0, 10) } : {}),
    ...(startingPrice && !startingPrice.unit
      ? { offers: { "@type": "Offer", price: startingPrice.amount, priceCurrency: "TRY", category: "Paid", url: siteUrl(`/programlar/${program.slug}`) } }
      : {}),
    hasCourseInstance: cohorts.map((cohort) => ({
      "@type": "CourseInstance",
      name: cohort.title,
      courseMode: /online/i.test(cohort.location) ? "online" : "onsite",
      location: cohort.location || "Online",
      startDate: cohort.start_date,
      ...(cohort.duration_weeks ? { courseSchedule: { "@type": "Schedule", repeatFrequency: "P1W", repeatCount: cohort.duration_weeks } } : {}),
      ...(cohort.price
        ? {
            offers: {
              "@type": "Offer",
              price: Number(cohort.price),
              priceCurrency: "TRY",
              category: "Paid",
              availability: cohortIsFull(cohort) ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            },
          }
        : {}),
    })),
    ...(reviews.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  return (
    <ApplyProvider slug={program.slug} cohorts={cohorts} loggedIn={Boolean(user)} initialClassId={basvur ?? null}>
      <JsonLd data={courseJsonLd} />

      {/* GİRİŞ */}
      <section className="relative isolate overflow-hidden border-b border-line bg-canvas">
        <div aria-hidden className="bg-grid-light absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_70%_80%_at_85%_10%,black,transparent)]" />
        <div aria-hidden className="glow-indigo absolute -right-40 -top-32 -z-10 size-[640px] opacity-35" />
        <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14 lg:py-16">
          <div className="min-w-0">
            <nav aria-label="Konum" className="flex items-center gap-1.5 text-sm text-ink-soft">
              <Link href="/programlar" className="hover:text-ink">
                Programlar
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href={`/programlar?kategori=${category}`} className="hover:text-ink">
                {programCategoryLabels[category]}
              </Link>
            </nav>
            <div className="mt-6 flex items-center gap-3">
              <CategoryMark category={category} />
              <div className="flex flex-wrap gap-1.5">
                <Badge size="sm">{level}</Badge>
                {program.badge && (
                  <Badge size="sm" tone="accent">
                    {program.badge}
                  </Badge>
                )}
              </div>
            </div>
            <h1 className="mt-5 text-[36px] font-semibold leading-[1.02] tracking-[-0.04em] text-balance sm:text-[56px]">
              <AccentTitle text={program.title} />
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">{program.description}</p>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {[
                { icon: CalendarDays, label: "Süre", value: weeks ? `${weeks} hafta` : "Esnek" },
                { icon: Clock3, label: "Toplam", value: hours ? `${hours} saat` : "Sana göre" },
                { icon: GraduationCap, label: "Seviye", value: level },
                { icon: MapPin, label: "Format", value: next?.location || "Online" },
              ].map((fact) => (
                <div key={fact.label} className="bg-paper px-4 py-3.5">
                  <dt className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <fact.icon className="size-3.5" aria-hidden /> {fact.label}
                  </dt>
                  <dd className="tabular mt-1 font-mono text-[15px] text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Sıradaki dönem kartı: masaüstünde başında programın çizimi */}
          <div className="min-w-0 self-start">
            <Card padding="none" className="relative overflow-hidden shadow-pop">
            <div className="hidden border-b border-line lg:block">
              <ProgramVisual category={category} className="h-40" />
            </div>
            {next ? (
              <>
                <div className="flex gap-4 p-5">
                  <DateTile date={`${next.start_date}T12:00:00`} />
                  <div className="min-w-0">
                    <CardEyebrow>Sıradaki dönem</CardEyebrow>
                    <p className="mt-1 font-semibold leading-snug">{next.title}</p>
                    <p className="tabular mt-1 font-mono text-[13px] text-ink-soft">{next.schedule_note || formatDate(next.start_date)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 border-t border-line p-5">
                  <SeatMeter taken={next.taken_seats} capacity={next.capacity} />
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-ink-soft">Kişi başı</span>
                    {next.price ? <Price amount={Number(next.price)} className="text-2xl" /> : <span className="text-sm">Fiyat için sor</span>}
                  </div>
                  {next.my_status ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2.5">
                      <MyCohortStatus status={next.my_status} />
                      <Link href="/panel/egitimler" className="text-sm font-semibold text-accent hover:underline">
                        Panelde gör
                      </Link>
                    </div>
                  ) : (
                    <ApplyButton classId={next.id} size="lg" className="w-full">
                      {nextFull ? "Bekleme listesine katıl" : "Yerimi ayır"}
                    </ApplyButton>
                  )}
                  {cohorts.length > 1 && (
                    <a href="#katilim" className="text-center text-sm font-semibold text-ink-soft hover:text-ink">
                      {cohorts.length - 1} dönem daha var
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="p-5">
                <CardEyebrow>Dönem takvimi</CardEyebrow>
                <p className="mt-2 font-semibold">Şu an açık grup dönemi yok</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">Beklemek yerine birebir başla; takvimi ve konuları sen seç.</p>
                {startingPrice && (
                  <p className="mt-4">
                    <Price amount={startingPrice.amount} unit={startingPrice.unit} from={!startingPrice.unit} className="text-xl" />
                  </p>
                )}
                <Button asChild size="lg" className="mt-5 w-full">
                  <Link href={birebirHref}>Birebir ders iste</Link>
                </Button>
              </div>
            )}
            </Card>
          </div>
        </Container>
      </section>

      {/* KATILIM SEÇENEKLERİ */}
      <Section id="katilim" className="scroll-mt-20" aria-labelledby="katilim-baslik">
        <Container>
          <SectionIntro
            id="katilim-baslik"
            eyebrow="Katılım"
            title="Nasıl öğrenmek istersin?"
            description="Aynı müfredat, üç farklı yol. Fiyatlar bilgi amaçlıdır; ödeme ekibimizle konuşulur."
          />
          <Tabs defaultValue={defaultTab} className="mt-8">
            <TabsList aria-label="Katılım seçenekleri">
              <TabsTrigger value="grup">
                <CalendarDays className="hidden size-4 sm:block" aria-hidden /> Grup dönemi
                {cohorts.length > 0 && <span className="tabular font-mono text-xs text-ink-soft">{cohorts.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="birebir">
                <UserRound className="hidden size-4 sm:block" aria-hidden /> Birebir
              </TabsTrigger>
              <TabsTrigger value="kurumsal">
                <Building2 className="hidden size-4 sm:block" aria-hidden /> Kurumsal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grup" id="donemler" className="scroll-mt-24">
              {cohorts.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {cohorts.map((cohort) => {
                    const full = cohortIsFull(cohort);
                    return (
                      <li key={cohort.id}>
                        <CohortRow
                          cohort={cohort}
                          showProgram={false}
                          action={
                            cohort.my_status ? (
                              <Button asChild size="sm" variant="ghost">
                                <Link href="/panel/egitimler">Panelde gör</Link>
                              </Button>
                            ) : (
                              <ApplyButton classId={cohort.id} size="sm" variant={full ? "outline" : "secondary"}>
                                {full ? "Bekleme listesi" : "Başvur"}
                              </ApplyButton>
                            )
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Yeni dönem henüz açılmadı"
                  description="Dönem açıldığında bu sayfada görünür. Beklemek istemezsen birebir başlayabilirsin."
                  action={
                    <Button asChild variant="secondary">
                      <Link href={birebirHref}>Birebir ders iste</Link>
                    </Button>
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="birebir">
              <div className="grid gap-4 lg:grid-cols-3">
                {bundles.map((bundle) => {
                  const requestHref = `${birebirHref}&paket=${bundle.id}`;
                  return (
                    <Card key={bundle.id} className="flex flex-col">
                      <CardEyebrow>Hazır paket</CardEyebrow>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight">{bundle.title}</h3>
                      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{bundle.description}</p>
                      <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-line pt-4">
                        <Price amount={Number(bundle.fixed_price)} className="text-xl" />
                        <span className="tabular font-mono text-sm text-ink-soft">
                          {bundle.duration_hours} saat{bundle.weeks.length ? ` · ${bundle.weeks.length} hafta` : ""}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <BundleSyllabusDialog
                          title={bundle.title}
                          description={bundle.description}
                          price={Number(bundle.fixed_price)}
                          hours={bundle.duration_hours}
                          weeks={bundle.weeks}
                          requestHref={requestHref}
                        />
                        <Button asChild size="sm" variant="outline">
                          <Link href={requestHref}>Bu paketi iste</Link>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
                <Card variant="outline" className="flex flex-col">
                  <Sparkles className="size-5 text-accent" aria-hidden />
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">Kendi programını oluştur</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">
                    {topics.length > 0
                      ? `${topics.length} konu arasından ihtiyacın olanları seç; toplam saat ve fiyat tahmini anında hesaplanır.`
                      : "Öğrenmek istediklerini yaz; programı ve saat planını birlikte çıkaralım."}
                  </p>
                  <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-line-strong/60 pt-4">
                    {hourly ? <Price amount={Number(hourly.price)} unit="saat" className="text-xl" /> : <span className="text-sm text-ink-soft">Teklifle</span>}
                    {hourly?.note && <span className="text-right text-xs text-ink-soft">{hourly.note}</span>}
                  </div>
                  <Button asChild size="sm" variant="secondary" className="mt-4 self-start">
                    <Link href={`${birebirHref}&mod=custom`}>
                      Konularını seç <ArrowRight />
                    </Link>
                  </Button>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="kurumsal">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                {groupPlans.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-line bg-paper">
                    <table className="w-full text-left text-sm">
                      <caption className="sr-only">Kişi sayısına göre kişi başı fiyatlar</caption>
                      <thead className="bg-surface text-xs text-ink-soft">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                            Grup büyüklüğü
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                            Kişi başı
                          </th>
                          <th scope="col" className="hidden px-5 py-3 font-semibold sm:table-cell">
                            Kapsam
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {groupPlans.map((plan) => (
                          <tr key={plan.id}>
                            <td className="tabular px-4 py-3.5 font-mono sm:px-5">
                              {plan.min_people}–{plan.max_people} kişi
                            </td>
                            <td className="px-4 py-3.5 sm:px-5">
                              <Price amount={Number(plan.price)} />
                              <span className="mt-0.5 block text-xs text-ink-soft sm:hidden">{plan.note}</span>
                            </td>
                            <td className="hidden px-5 py-3.5 text-ink-soft sm:table-cell">{plan.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-line-strong px-5 py-8 text-sm text-ink-soft">
                    Kurumsal fiyatlar kişi sayısına ve formata göre teklifle belirlenir.
                  </p>
                )}
                <Card variant="muted" className="flex flex-col">
                  <Building2 className="size-5 text-accent" aria-hidden />
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">Ekibine özel program</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">
                    Seviye ölçümü, kendi iş dosyalarınızla uygulama ve online, yerinde ya da karma format.
                  </p>
                  <Button asChild variant="secondary" className="mt-5 self-start">
                    <Link href={`/teklif/kurumsal?program=${program.slug}`}>
                      Teklif iste <ArrowRight />
                    </Link>
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </Section>

      {/* MÜFREDAT + KAZANIMLAR */}
      <Section className="border-t border-line bg-canvas" aria-labelledby="mufredat-baslik">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
          <div className="min-w-0">
            <SectionIntro
              id="mufredat-baslik"
              eyebrow="Müfredat"
              title={syllabus.length ? `${syllabus.length} haftada neler var?` : "Program hakkında"}
              description={syllabus.length ? "Her hafta bir önceki haftanın üzerine kurulur; uygulamalar gerçek iş senaryolarıyla yapılır." : undefined}
            />
            {syllabus.length > 0 ? (
              <SyllabusTimeline weeks={syllabus} className="mt-8" />
            ) : (
              paragraphs.length > 0 && (
                <div className="mt-6 flex max-w-2xl flex-col gap-4 text-[15px] leading-relaxed text-ink-soft">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              )
            )}
          </div>
          <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            {outcomes.length > 0 && (
              <Card padding="lg">
                <Eyebrow>Programın sonunda</Eyebrow>
                <Checklist items={outcomes} className="mt-4" />
              </Card>
            )}
            {program.audience && (
              <Card variant="muted">
                <Eyebrow>Kimler için</Eyebrow>
                <p className="mt-3 text-[15px] leading-relaxed text-ink">{program.audience}</p>
              </Card>
            )}
          </aside>
        </Container>
      </Section>

      {(syllabus.length > 0 && paragraphs.length > 0) || extraFeatures.length > 0 ? (
        <Section aria-labelledby="hakkinda-baslik">
          <Container className="grid gap-10 lg:grid-cols-2">
            {syllabus.length > 0 && paragraphs.length > 0 && (
              <div className="min-w-0">
                <SectionIntro id="hakkinda-baslik" eyebrow="Yaklaşım" title="Program hakkında" />
                <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-ink-soft">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            {extraFeatures.length > 0 && (
              <div className="min-w-0">
                <SectionIntro eyebrow="Öne çıkanlar" title="Bu programda" />
                <Checklist items={extraFeatures} className="mt-6" />
              </div>
            )}
          </Container>
        </Section>
      ) : null}

      {reviews.length > 0 && (
        <Section className="border-t border-line" aria-labelledby="yorum-baslik">
          <Container>
            <SectionIntro id="yorum-baslik" eyebrow="Yorumlar" title="Bu programı bitirenler ne diyor?" />
            <ReviewList reviews={reviews} showProgram={false} className="mt-8" />
          </Container>
        </Section>
      )}

      <Section className="border-t border-line bg-canvas" aria-labelledby="sss-baslik">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <SectionIntro
            id="sss-baslik"
            eyebrow="Sık sorulanlar"
            title="Başvurmadan önce"
            description="Aradığın yanıt burada yoksa bize yaz, aynı gün dönelim."
            action={
              <Button asChild variant="link">
                <Link href="/iletisim">Soru sor</Link>
              </Button>
            }
            className="sm:flex-col sm:items-start"
          />
          <FaqList items={programFaq} />
        </Container>
      </Section>

      {/* MOBİL YAPIŞKAN ÇAĞRI */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{program.title}</p>
            {next?.price ? (
              <p className="tabular truncate font-mono text-xs text-ink-soft">
                {formatDate(next.start_date)} · {formatTRY(next.price)}
              </p>
            ) : startingPrice ? (
              <p className="tabular font-mono text-xs text-ink-soft">
                {formatTRY(startingPrice.amount)}
                {startingPrice.unit ? ` / ${startingPrice.unit}` : "'den başlayan"}
              </p>
            ) : null}
          </div>
          {next && !next.my_status ? (
            <ApplyButton classId={next.id} className="shrink-0">
              {nextFull ? "Bekleme listesi" : "Yerimi ayır"}
            </ApplyButton>
          ) : (
            <Button asChild className="shrink-0">
              <Link href={birebirHref}>Birebir ders iste</Link>
            </Button>
          )}
        </div>
      </div>
    </ApplyProvider>
  );
}
