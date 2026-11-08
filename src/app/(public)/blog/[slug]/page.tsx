// src/app/(public)/blog/[slug]/page.tsx — blog yazısı: markdown gövde, okuma süresi, etiketler, ilgili yazılar, Article JSON-LD
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPostBySlug, getPublishedPosts, readingMinutes } from "@/lib/queries/blog";
import { organizationJsonLd, openGraphDefaults, siteUrl } from "@/lib/queries/public-seo";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/public/section";
import { CtaBand, JsonLd } from "@/components/public/blocks";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Yazı bulunamadı" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      ...openGraphDefaults,
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: siteUrl(`/blog/${post.slug}`),
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      tags: post.tags,
    },
  };
}

/** Yazının konusuna göre ilgili hizmet/programa yönlendirme */
function contextualCta(tags: string[]) {
  const set = new Set(tags.map((tag) => tag.toLocaleLowerCase("tr-TR")));
  if (set.has("tez") || set.has("kaynakça")) return { title: "Tezini teslime hazırlayalım", href: "/tez-duzenleme", label: "Tez düzenleme" };
  if (set.has("analiz")) return { title: "Analizini uzmanına bırak", href: "/analiz", label: "Analiz hizmeti" };
  return { title: "Bir sonraki adım: programa katıl", href: "/programlar", label: "Programları gör" };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const all = await getPublishedPosts();
  const related = all
    .filter((item) => item.slug !== post.slug)
    .sort((a, b) => b.tags.filter((tag) => post.tags.includes(tag)).length - a.tags.filter((tag) => post.tags.includes(tag)).length)
    .slice(0, 2);
  const cta = contextualCta(post.tags);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.published_at ?? post.created_at,
          dateModified: post.updated_at,
          author: { "@type": "Organization", name: post.author_name },
          publisher: organizationJsonLd,
          mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
          keywords: post.tags.join(", "),
          inLanguage: "tr",
        }}
      />
      <article>
        <header className="border-b border-line bg-canvas">
          <Container className="max-w-3xl py-10 sm:py-14">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
              <ArrowLeft className="size-4" aria-hidden /> Blog
            </Link>
            <h1 className="mt-6 text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-balance sm:text-[44px]">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{post.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft">
              <span className="font-semibold text-ink">{post.author_name}</span>
              {post.published_at && (
                <time dateTime={post.published_at} className="tabular font-mono text-xs">
                  {formatDate(post.published_at)}
                </time>
              )}
              <span className="tabular font-mono text-xs">{readingMinutes(post)} dk okuma</span>
              {post.tags.length > 0 && (
                <span className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/blog?etiket=${encodeURIComponent(tag)}`}>
                      <Badge size="sm" className="hover:ring-ink-muted">
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </span>
              )}
            </div>
          </Container>
        </header>
        <Container className="max-w-3xl py-10 sm:py-14">
          <div className="prose-custom text-base! [&_h2]:mt-10! [&_h2]:text-[22px]! [&_h2]:tracking-tight [&_p]:text-[17px] [&_p]:leading-[1.75] [&_li]:text-[17px]">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => {
                  const external = href?.startsWith("http");
                  return (
                    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {children}
                    </a>
                  );
                },
                img: () => null,
              }}
            >
              {post.body_md}
            </ReactMarkdown>
          </div>
        </Container>
      </article>

      <Container className="max-w-3xl pb-6">
        <CtaBand title={cta.title}>
          <Button asChild variant="secondary">
            <Link href={cta.href}>
              {cta.label} <ArrowRight />
            </Link>
          </Button>
        </CtaBand>
      </Container>

      {related.length > 0 && (
        <Section className="pt-10 sm:pt-14">
          <Container className="max-w-3xl">
            <h2 className="text-lg font-semibold tracking-tight">Şunlar da ilgini çekebilir</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link href={`/blog/${item.slug}`} className="group flex h-full flex-col rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-line-strong">
                    <span className="tabular font-mono text-xs text-ink-soft">{item.reading_minutes} dk okuma</span>
                    <span className="mt-2 font-semibold leading-snug group-hover:text-accent">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}
