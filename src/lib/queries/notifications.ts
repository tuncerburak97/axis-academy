// src/lib/queries/notifications.ts — oturumdaki kullanıcının bildirimleri (RLS yalnızca kendi satırlarını döner)
import { createClient } from "@/lib/supabase/server";
import type { NotificationRow } from "@/lib/types/platform";

export async function getMyNotifications(limit = 30): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getMyUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);
  return count ?? 0;
}
