// src/app/(admin)/admin/(dashboard)/blog/page.tsx — blog yazıları: taslak/yayında, hızlı yayınla, düzenle
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Newspaper, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate, formatRelative } from "@/lib/format";
import { getAdminPosts } from "@/lib/queries/admin-blog";
import { setPostPublished } from "@/lib/actions/admin-blog";
import { ActionForm, Hidden, SubmitButton } from "@/components/admin/action-form";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdminPage() {
  const posts = await getAdminPosts();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Blog"
        description="Yazılar Markdown ile yazılır; yayındakiler /blog sayfasında görünür."
        actions={
          <Button asChild>
            <Link href="/admin/blog/yeni">
              <Plus /> Yeni yazı
            </Link>
          </Button>
        }
      />
      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="Henüz yazı yok" description="İlk yazını oluştur; taslak olarak kaydedip hazır olunca yayınla." />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 shadow-card sm:flex-row sm:items-center">
              <Link href={`/admin/blog/${post.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" tone={post.is_published ? "success" : "neutral"} dot>
                    {post.is_published ? "Yayında" : "Taslak"}
                  </Badge>
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 font-semibold text-ink hover:text-accent">{post.title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {post.is_published && post.published_at ? `Yayın ${formatDate(post.published_at)}` : `Düzenlendi ${formatRelative(post.updated_at)}`} ·{" "}
                  {post.reading_minutes} dk · /blog/{post.slug}
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-1">
                {post.is_published && (
                  <Button asChild variant="ghost" size="icon-sm" aria-label="Sitede aç">
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink />
                    </a>
                  </Button>
                )}
                <ActionForm action={setPostPublished}>
                  <Hidden name="post_id" value={post.id} />
                  <Hidden name="publish" value={post.is_published ? "false" : "true"} />
                  <SubmitButton variant="outline" size="sm">
                    {post.is_published ? "Yayından kaldır" : "Yayınla"}
                  </SubmitButton>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
