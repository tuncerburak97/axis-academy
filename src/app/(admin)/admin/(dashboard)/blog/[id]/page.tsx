// src/app/(admin)/admin/(dashboard)/blog/[id]/page.tsx — blog yazısını düzenle / sil
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminPost } from "@/lib/queries/admin-blog";
import { deletePost } from "@/lib/actions/admin-blog";
import { ConfirmAction } from "@/components/admin/action-form";
import { PostEditor } from "@/components/admin/blog/post-editor";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const post = /^[0-9a-f-]{36}$/i.test(id) ? await getAdminPost(id) : null;
  return { title: post?.title ?? "Yazı" };
}

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const post = await getAdminPost(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Blog
        </Link>
      </div>
      <PageHeader
        title="Yazıyı düzenle"
        actions={
          <>
            {post.is_published && (
              <Button asChild variant="ghost" size="sm">
                <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink /> Sitede gör
                </a>
              </Button>
            )}
            <ConfirmAction
              title="Yazı silinsin mi?"
              description={`“${post.title}” kalıcı olarak silinir.`}
              action={deletePost}
              fields={{ post_id: post.id }}
              confirmLabel="Sil"
              trigger={
                <Button variant="ghost" size="sm" className="text-danger-ink hover:bg-danger-soft">
                  <Trash2 /> Sil
                </Button>
              }
            />
          </>
        }
      />
      <PostEditor key={post.updated_at} post={post} />
    </div>
  );
}
