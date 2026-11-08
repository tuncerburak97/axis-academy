// src/lib/actions/admin-search.ts — ⌘K komut paleti araması (talepler, kişiler, dönemler, programlar)
"use server";

import { requireAdmin } from "@/lib/actions/admin-guard";
import { requestKindLabels, type RequestKind } from "@/lib/types/platform";

export interface SearchHit {
  id: string;
  group: "Talepler" | "Kişiler" | "Dönemler" | "Programlar";
  title: string;
  subtitle: string;
  href: string;
}

/** PostgREST "or" filtresine güvenle girecek arama metni */
function cleanQuery(query: string): string {
  return query.replace(/[%,()*\\"]/g, " ").trim().slice(0, 80);
}

export async function adminSearch(query: string): Promise<SearchHit[]> {
  const { supabase } = await requireAdmin();
  const q = cleanQuery(query);
  if (q.length < 2) return [];
  const like = `%${q}%`;

  const [requests, people, cohorts, programs] = await Promise.all([
    supabase
      .from("requests")
      .select("id, title, kind, profiles!requests_user_id_fkey(full_name, email)")
      .ilike("title", like)
      .order("last_activity_at", { ascending: false })
      .limit(6),
    supabase
      .from("profiles")
      .select("user_id, full_name, email, role")
      .or(`full_name.ilike.${like},email.ilike.${like}`)
      .limit(6),
    supabase.from("classes").select("id, title, start_date").ilike("title", like).order("start_date", { ascending: false }).limit(5),
    supabase.from("education_modules").select("id, title, category").ilike("title", like).limit(5),
  ]);

  const hits: SearchHit[] = [];
  for (const row of requests.data ?? []) {
    hits.push({
      id: `r-${row.id}`,
      group: "Talepler",
      title: row.title || requestKindLabels[row.kind as RequestKind],
      subtitle: `${requestKindLabels[row.kind as RequestKind] ?? row.kind} · ${row.profiles?.full_name || row.profiles?.email || ""}`,
      href: `/admin/talepler/${row.id}`,
    });
  }
  for (const row of people.data ?? []) {
    hits.push({
      id: `p-${row.user_id}`,
      group: "Kişiler",
      title: row.full_name || row.email,
      subtitle: row.email,
      href: `/admin/kisiler/${row.user_id}`,
    });
  }
  for (const row of cohorts.data ?? []) {
    hits.push({ id: `c-${row.id}`, group: "Dönemler", title: row.title, subtitle: row.start_date, href: `/admin/donemler/${row.id}` });
  }
  for (const row of programs.data ?? []) {
    hits.push({ id: `m-${row.id}`, group: "Programlar", title: row.title, subtitle: row.category, href: `/admin/programlar/${row.id}` });
  }
  return hits;
}
