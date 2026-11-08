// src/lib/queries/admin-moderation.ts — yorumlar, indirim kodları, iletişim soruları ve kayıt geçmişi
import { createClient } from "@/lib/supabase/server";
import type { AuditRow, DiscountCodeRow } from "@/lib/types/platform";
import type { InquiryRow } from "@/components/admin/lib/labels";

export interface AdminReview {
  id: string;
  rating: number;
  comment: string;
  is_published: boolean;
  created_at: string;
  member: { user_id: string; name: string };
  program: { id: string; title: string } | null;
  cohort: { id: string; title: string } | null;
  request: { id: string; title: string } | null;
}

export async function getAdminReviews(filters: { program?: string; status?: string }): Promise<AdminReview[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("id, rating, comment, is_published, created_at, user_id, profiles(full_name, email), education_modules(id, title), classes(id, title), requests(id, title)")
    .order("is_published")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters.program && /^[0-9a-f-]{36}$/i.test(filters.program)) query = query.eq("module_id", filters.program);
  if (filters.status === "pending") query = query.eq("is_published", false);
  if (filters.status === "published") query = query.eq("is_published", true);
  const { data } = await query;
  return (data ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    is_published: row.is_published,
    created_at: row.created_at,
    member: { user_id: row.user_id, name: row.profiles?.full_name || row.profiles?.email || "Üye" },
    program: row.education_modules,
    cohort: row.classes,
    request: row.requests,
  }));
}

export async function getDiscountCodes(): Promise<DiscountCodeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("discount_codes").select("*").order("is_active", { ascending: false }).order("created_at", { ascending: false });
  return data ?? [];
}

export async function getInquiries(status?: string): Promise<InquiryRow[]> {
  const supabase = await createClient();
  let query = supabase.from("public_inquiries").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && ["new", "answered", "closed"].includes(status)) query = query.eq("status", status);
  const { data } = await query;
  return data ?? [];
}

export async function getInquiryCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("public_inquiries").select("status");
  const counts: Record<string, number> = { new: 0, answered: 0, closed: 0 };
  for (const row of data ?? []) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}

export interface AuditEntry extends AuditRow {
  actor: string;
}

export const AUDIT_PAGE_SIZE = 30;

export async function getAuditPage(page: number): Promise<{ rows: AuditEntry[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * AUDIT_PAGE_SIZE;
  const { data, count } = await supabase
    .from("audit_log")
    .select("*, profiles(full_name, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + AUDIT_PAGE_SIZE - 1);
  return {
    rows: (data ?? []).map(({ profiles, ...row }) => ({ ...row, actor: profiles?.full_name || profiles?.email || "Silinmiş kullanıcı" })),
    total: count ?? 0,
  };
}
