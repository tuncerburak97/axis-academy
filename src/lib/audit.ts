// src/lib/audit.ts — admin işlemlerini kayıt geçmişine yazar (hata akışı bozmaz)
import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  actorId: string,
  action: string,
  entity: string,
  entityId: string | null,
  summary: string,
): Promise<void> {
  const { error } = await supabase.from("audit_log").insert({
    actor_id: actorId,
    action,
    entity,
    entity_id: entityId,
    summary: summary.slice(0, 500),
  });
  if (error) console.error("Kayıt geçmişi yazılamadı:", error.message);
}
