// src/app/(public)/programlar/page.tsx — herkese açık katalog: kategori filtresi, program kartları, tüm yaklaşan dönemler
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarX2, Clock3, Users } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getContent } from "@/lib/queries/content";
import { getCatalogCohorts, getProgramSummaries, isProgramCategory, programCategoryLabels, type ProgramCategory } from "@/lib/queries/public-catalog";
import { defaultEducationIntro, type EducationIntroContent } from "@/lib/types/content";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { AccentTitle, Container, PageHero, Section, SectionIntro } from "@/components/public/section";
import { ProgramCard } from "@/components/public/program-card";
import { CohortRow, cohortApplyHref, cohortIsFull } from "@/components/public/cohort-row";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Programlar",
  description: "Excel, Word ve PowerPoint programları: yaklaşan dönemler, kontenjan, müfredat ve fiyatlar tek sayfada.",
  alternates: { canonical: "/programlar" },
};

const categories: (ProgramCategory | "tumu")[] = ["tumu", "excel", "word", "powerpoint"];

export default async function ProgramsPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const active = isProgramCategory(kategori) ? kategori : null;

  const [intro, programs, cohorts, user] = await Promise.all([
    getContent<EducationIntroContent>("education", "intro", defaultEducationIntro),
    getProgramSummaries(),
    getCatalogCohorts(undefined, 60),
    getSessionUser(),
  ]);

  const visiblePrograms = active ? programs.filter((summary) => summary.category === active) : programs;
  const visibleCohorts = active ? cohorts.filter((cohort) => cohort.module_category === active) : cohorts;
  const countFor = (category: ProgramCategory | "tumu") =>
    category === "tumu" ? programs.length : programs.filter((summary) => summary.category === category).length;

  return (
    <>
      <PageHero eyebrow="Programlar" title={<AccentTitle text={intro.title} />} description={intro.description}>
        <nav aria-label="Kategori" className="-mx-1 flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = category === "tumu" ? !active : active === category;
            const href = category === "tumu" ? "/programlar" : `/programlar?kategori=${category}`;
            return (
              <Link
                key={category}
                href={href}
                scroll={false}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                  selected ? "border-ink bg-ink text-white" : "border-line-strong bg-paper text-ink hover:border-ink-muted",
                )}
              >
                {category === "tumu" ? "Tümü" : programCategoryLabels[category]}
                <span className={cn("tabular font-mono text-xs", selected ? "text-white/70" : "text-ink-soft")}>{countFor(category)}</span>
              </Link>
            );
          })}
        </nav>
      </PageHero>

      <Section className="pt-12 sm:pt-16" aria-label="Program listesi">
        <Container>
          {visiblePrograms.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visiblePrograms.map((summary) => (
                <li key={summary.program.id} className="min-w-0">
                  <ProgramCard summary={summary} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Bu kategoride henüz program yok"
              description="Diğer kategorilere göz at ya da ihtiyacını yaz; sana özel bir program kuralım."
              action={
                <>
                  <Button asChild variant="outline">
                    <Link href="/programlar">Tüm programlar</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/teklif/birebir">Birebir ders iste</Link>
                  </Button>
                </>
              }
            />
          )}
        </Container>
      </Section>

      <Section id="donemler" className="scroll-mt-20 border-t border-line bg-canvas" aria-labelledby="donemler-baslik">
        <Container>
          <SectionIntro
            id="donemler-baslik"
            eyebrow="Takvim"
            title={active ? `Yaklaşan ${programCategoryLabels[active]} dönemleri` : "Yaklaşan tüm dönemler"}
            description="Kontenjan anlık güncellenir. Dolu dönemde bekleme listesine katılırsın; yer açılınca haber veririz."
          />
          {visibleCohorts.length > 0 ? (
            <ul className="mt-8 flex flex-col gap-3">
              {visibleCohorts.map((cohort) => {
                const full = cohortIsFull(cohort);
                return (
                  <li key={cohort.id}>
                    <CohortRow
                      cohort={cohort}
                      action={
                        cohort.my_status ? (
                          <Button asChild size="sm" variant="ghost">
                            <Link href="/panel/egitimler">Panelde gör</Link>
                          </Button>
                        ) : (
                          <Button asChild size="sm" variant={full ? "outline" : "secondary"}>
                            <Link href={cohortApplyHref(cohort, Boolean(user))}>{full ? "Bekleme listesi" : "Yerimi ayır"}</Link>
                          </Button>
                        )
                      }
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarX2}
              className="mt-8"
              title="Şu an açık dönem yok"
              description="Yeni dönemler sık açılıyor. Beklemeden başlamak istersen birebir dersle kendi takvimini kur."
              action={
                <Button asChild variant="secondary">
                  <Link href="/teklif/birebir">Birebir ders iste</Link>
                </Button>
              }
            />
          )}
        </Container>
      </Section>

      <Section aria-label="Diğer seçenekler">
        <Container className="grid gap-4 md:grid-cols-2">
          <Card padding="lg" className="flex flex-col">
            <Clock3 className="size-6 text-accent" aria-hidden />
            <h2 className="mt-4 text-xl font-semibold tracking-tight">Takvim sana uymuyor mu?</h2>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-soft">
              Hazır bir paket seç ya da konuları kendin belirle; saatini birlikte planlayalım. Fiyat tahminini formda anında görürsün.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link href="/teklif/birebir">
                  Birebir ders iste <ArrowRight />
                </Link>
              </Button>
            </div>
          </Card>
          <Card padding="lg" className="flex flex-col">
            <Users className="size-6 text-accent" aria-hidden />
            <h2 className="mt-4 text-xl font-semibold tracking-tight">Ekibin için mi bakıyorsun?</h2>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-soft">
              Kişi sayısına göre fiyat aralıkları program sayfalarında açık. Programı ekibinin seviyesine ve iş dosyalarına göre uyarlarız.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link href="/kurumsal">
                  Kurumsal eğitim <ArrowRight />
                </Link>
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
