// src/lib/queries/admin-calendar.ts — takvim: dönem ve birebir talep oturumları (tarih aralığına göre)
import { createClient } from "@/lib/supabase/server";

export interface CalendarSession {
  id: string;
  title: string;
  week_number: number | null;
  starts_at: string;
  ends_at: string;
  location: string;
  meeting_url: string;
  source: "cohort" | "request";
  ownerTitle: string;
  href: string;
}

export async function getSessionsBetween(fromIso: string, toIso: string): Promise<CalendarSession[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessions")
    .select("id, title, week_number, starts_at, ends_at, location, meeting_url, class_id, request_id, classes(title), requests(title)")
    .gte("starts_at", fromIso)
    .lt("starts_at", toIso)
    .order("starts_at");
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    week_number: row.week_number,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    location: row.location,
    meeting_url: row.meeting_url,
    source: row.class_id ? "cohort" : "request",
    ownerTitle: row.class_id ? row.classes?.title ?? "Dönem" : row.requests?.title || "Birebir talep",
    href: row.class_id ? `/admin/donemler/${row.class_id}?tab=oturumlar` : `/admin/talepler/${row.request_id}`,
  }));
}
