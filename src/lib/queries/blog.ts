// src/lib/queries/blog.ts — yayındaki blog yazıları (posts tablosu; RLS yalnızca yayındakileri döndürür)
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { PostRow } from "@/lib/types/platform";

export type PostSummary = Pick<PostRow, "id" | "slug" | "title" | "excerpt" | "tags" | "author_name" | "reading_minutes" | "published_at" | "updated_at">;

const summaryColumns = "id, slug, title, excerpt, tags, author_name, reading_minutes, published_at, updated_at";

export async function getPublishedPosts(tag?: string): Promise<PostSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(summaryColumns)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (tag) query = query.contains("tags", [tag]);
  const { data } = await query;
  return data ?? [];
}

export const getPostBySlug = cache(async (slug: string): Promise<PostRow | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  return data;
});

/** Okuma süresi: kayıtlı değer yoksa ~200 kelime/dk */
export function readingMinutes(post: Pick<PostRow, "reading_minutes" | "body_md">): number {
  if (post.reading_minutes && post.reading_minutes > 0) return post.reading_minutes;
  const words = post.body_md.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
