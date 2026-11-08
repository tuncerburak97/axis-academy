// src/lib/queries/admin-content.ts — site_content bölümlerini tek sorguda okur
import { createClient } from "@/lib/supabase/server";

export async function getSiteContentMap(): Promise<Record<string, { content: Record<string, unknown>; updated_at: string }>> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("page_key, section_key, content_json, updated_at");
  const map: Record<string, { content: Record<string, unknown>; updated_at: string }> = {};
  for (const row of data ?? []) {
    const content = row.content_json && typeof row.content_json === "object" && !Array.isArray(row.content_json) ? (row.content_json as Record<string, unknown>) : {};
    map[`${row.page_key}/${row.section_key}`] = { content, updated_at: row.updated_at };
  }
  return map;
}
