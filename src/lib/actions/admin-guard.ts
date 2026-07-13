// src/lib/actions/admin-guard.ts — admin Server Action'ları için ortak yetki kontrolü
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Admin değilse 404 fırlatır; admin ise hazır supabase istemcisini döner
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (profile?.role !== "admin") notFound();

  return { supabase, user };
}
