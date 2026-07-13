// src/lib/queries/admin-requests.ts — admin paneli talep sayım sorguları
import { createClient } from "@/lib/supabase/server";

const ACTIVE_CONTACT_STATUSES = ["new", "contacted", "in_progress"] as const;
const ACTIVE_INDIVIDUAL_STATUSES = ["received", "planned", "in_progress"] as const;
const ACTIVE_INQUIRY_STATUSES = ["new", "answered"] as const;

export async function getActiveRequestCount(): Promise<number> {
  const supabase = await createClient();

  const [contactResult, individualResult, inquiryResult] = await Promise.all([
    supabase
      .from("contact_requests")
      .select("*", { count: "exact", head: true })
      .in("status", [...ACTIVE_CONTACT_STATUSES]),
    supabase
      .from("individual_requests")
      .select("*", { count: "exact", head: true })
      .in("status", [...ACTIVE_INDIVIDUAL_STATUSES]),
    supabase
      .from("public_inquiries")
      .select("*", { count: "exact", head: true })
      .in("status", [...ACTIVE_INQUIRY_STATUSES]),
  ]);

  if (contactResult.error || individualResult.error || inquiryResult.error) return 0;

  return (
    (contactResult.count ?? 0) +
    (individualResult.count ?? 0) +
    (inquiryResult.count ?? 0)
  );
}
