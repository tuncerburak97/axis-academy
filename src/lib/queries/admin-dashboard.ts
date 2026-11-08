// src/lib/queries/admin-dashboard.ts — gelen kutusu: ne bekliyor, ne gecikti, bu hafta ne var
import { createClient } from "@/lib/supabase/server";
import { requestKindLabels, type RequestKind } from "@/lib/types/platform";
import { addDays, istanbulIso, mondayOf, todayIstanbul } from "@/components/admin/lib/time";
import { getSessionsBetween, type CalendarSession } from "@/lib/queries/admin-calendar";

export interface AttentionItem {
  id: string;
  kind: "request" | "application" | "waitlist" | "quote";
  title: string;
  subtitle: string;
  since: string;
  href: string;
  overdue: boolean;
}

export interface OccupancyItem {
  id: string;
  title: string;
  start_date: string;
  capacity: number;
  taken: number;
  pending: number;
  waitlisted: number;
}

export interface ActivityItem {
  id: string;
  at: string;
  text: string;
  actor: string;
  href: string | null;
}

export interface DashboardData {
  overdueRequests: number;
  newRequests: number;
  pendingApplications: number;
  waitlistOpenings: number;
  openQuotes: number;
  weekSessionCount: number;
  attention: AttentionItem[];
  weekSessions: CalendarSession[];
  occupancy: OccupancyItem[];
  activity: ActivityItem[];
}

const DAY_MS = 86_400_000;

function entityHref(entity: string, id: string | null): string | null {
  if (!id) return null;
  switch (entity) {
    case "request":
      return `/admin/talepler/${id}`;
    case "class":
      return `/admin/donemler/${id}`;
    case "module":
      return `/admin/programlar/${id}`;
    case "profile":
      return `/admin/kisiler/${id}`;
    case "post":
      return `/admin/blog/${id}`;
    default:
      return null;
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const today = todayIstanbul();
  const monday = mondayOf(today);

  const [received, quoted, pending, cohorts, weekSessions, audit, latestRequests] = await Promise.all([
    supabase
      .from("requests")
      .select("id, title, kind, created_at, profiles!requests_user_id_fkey(full_name, email)")
      .eq("status", "received")
      .order("created_at"),
    supabase
      .from("requests")
      .select("id, title, kind, quoted_at, quote_valid_until, profiles!requests_user_id_fkey(full_name, email)")
      .eq("status", "quoted")
      .order("quoted_at"),
    supabase
      .from("class_enrollments")
      .select("id, class_id, created_at, classes(title), profiles(full_name, email)")
      .eq("status", "pending")
      .order("created_at"),
    supabase
      .from("classes")
      .select("id, title, start_date, capacity, status, class_enrollments(status, created_at)")
      .in("status", ["open", "full"])
      .order("start_date"),
    getSessionsBetween(istanbulIso(monday, "00:00"), istanbulIso(addDays(monday, 7), "00:00")),
    supabase.from("audit_log").select("id, action, entity, entity_id, summary, created_at, profiles(full_name, email)").order("created_at", { ascending: false }).limit(12),
    supabase
      .from("requests")
      .select("id, title, kind, created_at, profiles!requests_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  // Yanıtsız yeni talepler: ekip mesajı olmayan "received"
  const receivedRows = received.data ?? [];
  const answered = new Set<string>();
  if (receivedRows.length) {
    const { data: staff } = await supabase
      .from("request_messages")
      .select("request_id")
      .eq("is_staff", true)
      .in("request_id", receivedRows.map((row) => row.id));
    for (const message of staff ?? []) answered.add(message.request_id);
  }
  const unanswered = receivedRows.filter((row) => !answered.has(row.id));
  const now = Date.now();
  const overdueRequests = unanswered.filter((row) => now - new Date(row.created_at).getTime() > DAY_MS);

  const occupancy: OccupancyItem[] = (cohorts.data ?? []).map((row) => {
    const statuses = row.class_enrollments ?? [];
    return {
      id: row.id,
      title: row.title,
      start_date: row.start_date,
      capacity: row.capacity,
      taken: statuses.filter((e) => ["enrolled", "in_progress", "completed"].includes(e.status)).length,
      pending: statuses.filter((e) => e.status === "pending").length,
      waitlisted: statuses.filter((e) => e.status === "waitlisted").length,
    };
  });
  const waitlistOpenings = occupancy.filter((row) => row.waitlisted > 0 && row.taken < row.capacity);

  const attention: AttentionItem[] = [
    ...unanswered.map((row) => ({
      id: `r-${row.id}`,
      kind: "request" as const,
      title: row.title || requestKindLabels[row.kind as RequestKind],
      subtitle: `Yeni ${requestKindLabels[row.kind as RequestKind]?.toLocaleLowerCase("tr-TR") ?? "talep"} · ${row.profiles?.full_name || row.profiles?.email || "Üye"}`,
      since: row.created_at,
      href: `/admin/talepler/${row.id}`,
      overdue: now - new Date(row.created_at).getTime() > DAY_MS,
    })),
    ...(pending.data ?? []).map((row) => ({
      id: `e-${row.id}`,
      kind: "application" as const,
      title: row.profiles?.full_name || row.profiles?.email || "Üye",
      subtitle: `Döneme başvuru · ${row.classes?.title ?? ""}`,
      since: row.created_at,
      href: `/admin/donemler/${row.class_id}?tab=ogrenciler`,
      overdue: now - new Date(row.created_at).getTime() > DAY_MS,
    })),
    ...waitlistOpenings.map((row) => ({
      id: `w-${row.id}`,
      kind: "waitlist" as const,
      title: row.title,
      subtitle: `${row.capacity - row.taken} yer açık · ${row.waitlisted} kişi bekleme listesinde`,
      since: (cohorts.data ?? [])
        .find((cohort) => cohort.id === row.id)!
        .class_enrollments.filter((e) => e.status === "waitlisted")
        .map((e) => e.created_at)
        .sort()[0],
      href: `/admin/donemler/${row.id}?tab=ogrenciler`,
      overdue: true,
    })),
    // Süresi geçmiş ya da 3 günden uzun yanıtsız teklifler
    ...(quoted.data ?? [])
      .filter(
        (row) =>
          (row.quote_valid_until && row.quote_valid_until < today) ||
          (row.quoted_at && now - new Date(row.quoted_at).getTime() > 3 * DAY_MS),
      )
      .map((row) => ({
        id: `q-${row.id}`,
        kind: "quote" as const,
        title: row.title || requestKindLabels[row.kind as RequestKind],
        subtitle: `${row.quote_valid_until && row.quote_valid_until < today ? "Teklif süresi doldu" : "Teklife yanıt gelmedi"} · ${row.profiles?.full_name || row.profiles?.email || "Üye"}`,
        since: row.quoted_at ?? "",
        href: `/admin/talepler/${row.id}`,
        overdue: false,
      })),
  ].sort((a, b) => a.since.localeCompare(b.since));

  const activity: ActivityItem[] = [
    ...(audit.data ?? []).map((row) => ({
      id: `a-${row.id}`,
      at: row.created_at,
      text: row.summary || row.action,
      actor: row.profiles?.full_name || row.profiles?.email || "Ekip",
      href: entityHref(row.entity, row.entity_id),
    })),
    ...(latestRequests.data ?? []).map((row) => ({
      id: `n-${row.id}`,
      at: row.created_at,
      text: `Yeni talep: ${row.title || requestKindLabels[row.kind as RequestKind]}`,
      actor: row.profiles?.full_name || row.profiles?.email || "Üye",
      href: `/admin/talepler/${row.id}`,
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 12);

  return {
    overdueRequests: overdueRequests.length,
    newRequests: unanswered.length,
    pendingApplications: (pending.data ?? []).length,
    waitlistOpenings: waitlistOpenings.length,
    openQuotes: (quoted.data ?? []).length,
    weekSessionCount: weekSessions.length,
    attention,
    weekSessions,
    occupancy: occupancy.filter((row) => row.start_date >= today).slice(0, 8),
    activity,
  };
}
