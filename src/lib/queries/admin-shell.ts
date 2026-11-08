// src/lib/queries/admin-shell.ts — kenar çubuğu sayaçları (her admin sayfasında bir kez)
import { createClient } from "@/lib/supabase/server";

export interface AdminNavCounts {
  requests: number;
  pendingApplications: number;
  newInquiries: number;
  unpublishedReviews: number;
}

export async function getAdminNavCounts(): Promise<AdminNavCounts> {
  const supabase = await createClient();
  const [requests, applications, inquiries, reviews] = await Promise.all([
    supabase.from("requests").select("id", { count: "exact", head: true }).in("status", ["received", "approved"]),
    supabase.from("class_enrollments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("public_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_published", false),
  ]);
  return {
    requests: requests.count ?? 0,
    pendingApplications: applications.count ?? 0,
    newInquiries: inquiries.count ?? 0,
    unpublishedReviews: reviews.count ?? 0,
  };
}
