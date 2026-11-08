// src/app/(public)/blog/page.tsx — blog listesi: etiket filtresi, okuma süresi, tarih
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { getPublishedPosts } from "@/lib/queries/blog";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Accent } from "@/components/ui/page-header";
import { Container, PageHero, Section } from "@/components/public/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Excel, Word, PowerPoint, analiz ve tez yazımı üzerine kısa, uygulanabilir yazılar.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ etiket?: string }> }) {
  const { etiket } = await searchParams;
  const [allPosts, posts] = await Promise.all([getPublishedPosts(), etiket ? getPublishedPosts(etiket) : null]);
  const visible = posts ?? allPosts;
  const tags = Array.from(new Set(allPosts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b, "tr"));
  const [featured, ...rest] = visible;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={
          <>
            Kısa, <Accent>uygulanabilir</Accent> notlar
          </>
        }
        description="Excel'den kaynakçaya, ekibimizin sahada en sık karşılaştığı sorular ve çözümleri."
      >
        {tags.length > 0 && (
          <nav aria-label="Etiketler" className="flex flex-wrap gap-2">
            {[null, ...tags].map((tag) => {
              const selected = tag === null ? !etiket : etiket === tag;
              return (
                <Link
                  key={tag ?? "tumu"}
                  href={tag ? `/blog?etiket=${encodeURIComponent(tag)}` : "/blog"}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors",
                    selected ? "border-ink bg-ink text-white" : "border-line-strong bg-paper text-ink hover:border-ink-muted",
                  )}
                >
                  {tag ? `#${tag}` : "Tümü"}
                </Link>
              );
            })}
          </nav>
        )}
      </PageHero>

      <Section className="pt-10 sm:pt-14">
        <Container>
          {visible.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={etiket ? `#${etiket} etiketinde yazı yok` : "Henüz yazı yok"}
              description="Yeni yazılar yakında burada. Bu arada programlara göz atabilirsin."
              action={
                <Button asChild variant="outline">
                  <Link href={etiket ? "/blog" : "/programlar"}>{etiket ? "Tüm yazılar" : "Programlar"}</Link>
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid gap-6 rounded-3xl border border-line bg-paper p-6 shadow-card transition-[box-shadow,border-color] hover:border-line-strong hover:shadow-raise sm:p-8 md:grid-cols-[minmax(0,1fr)_200px]"
                >
                  <div className="min-w-0">
                    <PostMeta date={featured.published_at} minutes={featured.reading_minutes} />
                    <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.025em] text-balance group-hover:text-accent sm:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{featured.excerpt}</p>
                    <Tags tags={featured.tags} className="mt-5" />
                  </div>
                  <span className="hidden items-end justify-end md:flex">
                    <ArrowUpRight className="size-6 text-ink-muted transition-colors group-hover:text-accent" aria-hidden />
                  </span>
                </Link>
              )}
              {rest.length > 0 && (
                <ul className="grid gap-4 md:grid-cols-2">
                  {rest.map((post) => (
                    <li key={post.id} className="min-w-0">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex h-full flex-col rounded-3xl border border-line bg-paper p-6 shadow-card transition-[box-shadow,border-color] hover:border-line-strong hover:shadow-raise"
                      >
                        <PostMeta date={post.published_at} minutes={post.reading_minutes} />
                        <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight group-hover:text-accent">{post.title}</h2>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
                        <Tags tags={post.tags} className="mt-5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

function PostMeta({ date, minutes }: { date: string | null; minutes: number }) {
  return (
    <p className="tabular flex items-center gap-2 font-mono text-xs text-ink-soft">
      {date && <time dateTime={date}>{formatDate(date)}</time>}
      {date && <span aria-hidden>·</span>}
      <span>{minutes} dk okuma</span>
    </p>
  );
}

function Tags({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null;
  return (
    <span className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <Badge key={tag} size="sm">
          #{tag}
        </Badge>
      ))}
    </span>
  );
}
