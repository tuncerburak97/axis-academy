// src/lib/queries/admin-requests.ts — birleşik talep hattı (requests) admin okuma sorguları
import { createClient } from "@/lib/supabase/server";
import type {
  RequestFileRow,
  RequestKind,
  RequestRow,
  RequestStatus,
  SessionRow,
} from "@/lib/types/platform";

export interface AdminRequestFilters {
  kind?: string;
  status?: string;
  assignee?: string;
  q?: string;
}

export interface AdminRequestListItem {
  id: string;
  kind: RequestKind;
  training_mode: string | null;
  title: string;
  status: RequestStatus;
  created_at: string;
  last_activity_at: string;
  due_date: string | null;
  quote_amount: number | null;
  price_estimate: number | null;
  member: { user_id: string; name: string; email: string };
  assignee: { user_id: string; name: string } | null;
  /** Ekipten en az bir yanıt var mı */
  answered: boolean;
}

export interface AdminPerson {
  user_id: string;
  name: string;
  email: string;
}

const KINDS = ["analysis", "thesis", "corporate", "training"];
const STATUSES = ["received", "quoted", "approved", "planned", "in_progress", "completed", "cancelled"];

function clean(value: string) {
  return value.replace(/[%,()*\\"]/g, " ").trim().slice(0, 80);
}

export async function getAdminRequests(filters: AdminRequestFilters): Promise<AdminRequestListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("requests")
    .select(
      "id, kind, training_mode, title, status, created_at, last_activity_at, due_date, quote_amount, price_estimate, user_id, assignee_id, member:profiles!requests_user_id_fkey(user_id, full_name, email), assignee:profiles!requests_assignee_id_fkey(user_id, full_name, email)",
    )
    .order("last_activity_at", { ascending: false })
    .limit(300);

  if (filters.kind && KINDS.includes(filters.kind)) query = query.eq("kind", filters.kind);
  if (filters.status === "active") query = query.not("status", "in", "(completed,cancelled)");
  else if (filters.status && STATUSES.includes(filters.status)) query = query.eq("status", filters.status);
  if (filters.assignee === "none") query = query.is("assignee_id", null);
  else if (filters.assignee) query = query.eq("assignee_id", filters.assignee);

  const q = filters.q ? clean(filters.q) : "";
  if (q) {
    // Üye adı/e-postası da aransın: önce eşleşen kişileri bul
    const { data: people } = await supabase
      .from("profiles")
      .select("user_id")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(50);
    const ids = (people ?? []).map((person) => person.user_id);
    query = ids.length
      ? query.or(`title.ilike.%${q}%,message.ilike.%${q}%,user_id.in.(${ids.join(",")})`)
      : query.or(`title.ilike.%${q}%,message.ilike.%${q}%`);
  }

  const { data } = await query;
  const rows = data ?? [];

  // Yanıt bekleyenler: ekip mesajı olmayan "received" talepler
  const receivedIds = rows.filter((row) => row.status === "received").map((row) => row.id);
  const answered = new Set<string>();
  if (receivedIds.length) {
    const { data: staff } = await supabase
      .from("request_messages")
      .select("request_id")
      .eq("is_staff", true)
      .in("request_id", receivedIds);
    for (const message of staff ?? []) answered.add(message.request_id);
  }

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind as RequestKind,
    training_mode: row.training_mode,
    title: row.title,
    status: row.status as RequestStatus,
    created_at: row.created_at,
    last_activity_at: row.last_activity_at,
    due_date: row.due_date,
    quote_amount: row.quote_amount,
    price_estimate: row.price_estimate,
    member: {
      user_id: row.user_id,
      name: row.member?.full_name || row.member?.email || "Üye",
      email: row.member?.email ?? "",
    },
    assignee: row.assignee ? { user_id: row.assignee.user_id, name: row.assignee.full_name || row.assignee.email } : null,
    answered: row.status !== "received" || answered.has(row.id),
  }));
}

/** Atanabilecek ekip (adminler) */
export async function getAdmins(): Promise<AdminPerson[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("user_id, full_name, email").eq("role", "admin").order("full_name");
  return (data ?? []).map((row) => ({ user_id: row.user_id, name: row.full_name || row.email, email: row.email }));
}

export interface AdminRequestMessage {
  id: string;
  body: string;
  is_staff: boolean;
  created_at: string;
  author: string;
}

export interface AdminRequestFile extends RequestFileRow {
  url: string | null;
}

export interface AdminRequestDetail {
  request: RequestRow;
  member: { user_id: string; name: string; email: string; phone: string | null; created_at: string };
  program: { id: string; title: string; slug: string } | null;
  bundle: { id: string; title: string; duration_hours: number; fixed_price: number } | null;
  topics: { id: string; title: string; estimated_hours: number }[];
  messages: AdminRequestMessage[];
  files: AdminRequestFile[];
  sessions: SessionRow[];
  admins: AdminPerson[];
}

export async function getAdminRequest(id: string): Promise<AdminRequestDetail | null> {
  const supabase = await createClient();
  const { data: request } = await supabase.from("requests").select("*").eq("id", id).maybeSingle();
  if (!request) return null;

  const [member, program, bundle, topics, messages, files, sessions, admins] = await Promise.all([
    supabase.from("profiles").select("user_id, full_name, email, phone, created_at").eq("user_id", request.user_id).maybeSingle(),
    request.module_id
      ? supabase.from("education_modules").select("id, title, slug").eq("id", request.module_id).maybeSingle()
      : Promise.resolve({ data: null }),
    request.bundle_id
      ? supabase.from("bundle_packages").select("id, title, duration_hours, fixed_price").eq("id", request.bundle_id).maybeSingle()
      : Promise.resolve({ data: null }),
    request.topic_ids.length
      ? supabase.from("topics").select("id, title, estimated_hours").in("id", request.topic_ids)
      : Promise.resolve({ data: [] as { id: string; title: string; estimated_hours: number }[] }),
    supabase
      .from("request_messages")
      .select("id, body, is_staff, created_at, author:profiles(full_name, email)")
      .eq("request_id", id)
      .order("created_at"),
    supabase.from("request_files").select("*").eq("request_id", id).order("created_at"),
    supabase.from("sessions").select("*").eq("request_id", id).order("starts_at"),
    getAdmins(),
  ]);

  const fileRows = files.data ?? [];
  const urls: Record<string, string> = {};
  if (fileRows.length) {
    const { data: signed } = await supabase.storage
      .from("request-files")
      .createSignedUrls(
        fileRows.map((file) => file.file_path),
        60 * 60,
      );
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) urls[item.path] = item.signedUrl;
    }
  }

  const profile = member.data;
  return {
    request,
    member: {
      user_id: request.user_id,
      name: profile?.full_name || profile?.email || "Üye",
      email: profile?.email ?? "",
      phone: profile?.phone ?? null,
      created_at: profile?.created_at ?? request.created_at,
    },
    program: program.data,
    bundle: bundle.data,
    topics: topics.data ?? [],
    messages: (messages.data ?? []).map((message) => ({
      id: message.id,
      body: message.body,
      is_staff: message.is_staff,
      created_at: message.created_at,
      author: message.author?.full_name || message.author?.email || (message.is_staff ? "Axis ekibi" : "Üye"),
    })),
    files: fileRows.map((file) => ({ ...file, url: urls[file.file_path] ?? null })),
    sessions: sessions.data ?? [],
    admins,
  };
}
