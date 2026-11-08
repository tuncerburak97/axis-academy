// src/lib/actions/notifications.ts — bildirimleri okundu işaretleme
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("mark_notifications_read");
  revalidatePath("/", "layout");
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/", "layout");
}
