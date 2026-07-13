// src/lib/queries/content.ts — site_content okuma; kayıt yoksa koddaki varsayılan döner
import { createClient } from "@/lib/supabase/server";

export async function getContent<T>(pageKey: string, sectionKey: string, fallback: T): Promise<T> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("page_key", pageKey)
    .eq("section_key", sectionKey)
    .maybeSingle();
  return (data?.content_json as T) ?? fallback;
}
