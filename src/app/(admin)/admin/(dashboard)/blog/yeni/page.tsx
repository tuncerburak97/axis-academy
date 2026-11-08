// src/app/(admin)/admin/(dashboard)/blog/yeni/page.tsx — yeni blog yazısı
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PostEditor } from "@/components/admin/blog/post-editor";

export const metadata: Metadata = { title: "Yeni yazı" };

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Blog
        </Link>
      </div>
      <PageHeader title="Yeni yazı" description="Taslak olarak kaydedebilir, hazır olunca yayınlayabilirsin." />
      <PostEditor />
    </div>
  );
}
