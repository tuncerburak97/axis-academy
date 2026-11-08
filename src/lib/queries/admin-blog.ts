// src/lib/queries/admin-blog.ts — blog yazıları (taslaklar dahil)
import { createClient } from "@/lib/supabase/server";
import type { PostRow } from "@/lib/types/platform";

export async function getAdminPosts(): Promise<PostRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").order("updated_at", { ascending: false });
  return data ?? [];
}

export async function getAdminPost(id: string): Promise<PostRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  return data;
}
