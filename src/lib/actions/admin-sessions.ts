// src/lib/actions/admin-sessions.ts — ders oturumları (dönem ya da birebir talep): ekle/düzenle/sil, haftalık üretici
"use server";

import { requireAdmin } from "@/lib/actions/admin-guard";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/components/admin/lib/action-state";
import { addDays, istanbulIso, weekdayOf } from "@/components/admin/lib/time";
import { fail, isDate, isUuid, ok, optNum, revalidateAdmin, str } from "@/lib/actions/admin-utils";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function revalidateOwner(classId: string | null, requestId: string | null) {
  if (classId) revalidateAdmin(`/panel/egitimler/${classId}`, "/panel", "/panel/takvim");
  if (requestId) revalidateAdmin(`/panel/talepler/${requestId}`, "/panel", "/panel/takvim");
}

export async function saveSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const sessionId = str(formData, "session_id");
  const classId = str(formData, "class_id") || null;
  const requestId = str(formData, "request_id") || null;
  const date = str(formData, "date");
  const start = str(formData, "start_time");
  const end = str(formData, "end_time");
  const title = str(formData, "title").slice(0, 200);
  const week = optNum(formData, "week_number");

  if (!sessionId && Boolean(classId) === Boolean(requestId)) return fail("Oturumun bağlı olduğu dönem ya da talep belirsiz.");
  if ((classId && !isUuid(classId)) || (requestId && !isUuid(requestId))) return fail("Bağlı kayıt geçersiz.");
  if (!isDate(date)) return fail("Oturum tarihini seç.");
  if (!TIME.test(start) || !TIME.test(end)) return fail("Başlangıç ve bitiş saatini SS:DD biçiminde gir.");
  if (end <= start) return fail("Bitiş saati başlangıçtan sonra olmalı.");
  if (week !== null && (Number.isNaN(week) || week < 1 || week > 104)) return fail("Hafta numarası 1–104 arasında olmalı.");

  const payload = {
    title,
    week_number: week,
    starts_at: istanbulIso(date, start),
    ends_at: istanbulIso(date, end),
    location: str(formData, "location").slice(0, 200) || "Online",
    meeting_url: str(formData, "meeting_url").slice(0, 500),
    notes: str(formData, "notes").slice(0, 2000),
  };

  if (sessionId) {
    if (!isUuid(sessionId)) return fail("Oturum bulunamadı.");
    const { data, error } = await supabase.from("sessions").update(payload).eq("id", sessionId).select("class_id, request_id").maybeSingle();
    if (error || !data) return fail("Oturum güncellenemedi.");
    await logAudit(supabase, user.id, "session.update", "session", sessionId, `${title || "Oturum"} · ${date} ${start}`);
    revalidateOwner(data.class_id, data.request_id);
    return ok("Oturum güncellendi");
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({ ...payload, class_id: classId, request_id: requestId })
    .select("id")
    .single();
  if (error || !data) return fail("Oturum eklenemedi.");
  await logAudit(supabase, user.id, "session.create", "session", data.id, `${title || "Oturum"} · ${date} ${start}`);
  revalidateOwner(classId, requestId);
  return ok("Oturum eklendi");
}

export async function deleteSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "session_id");
  if (!isUuid(id)) return fail("Oturum bulunamadı.");
  const { data } = await supabase.from("sessions").select("class_id, request_id, title, starts_at").eq("id", id).maybeSingle();
  if (!data) return fail("Oturum bulunamadı.");
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) return fail("Oturum silinemedi.");
  await logAudit(supabase, user.id, "session.delete", "session", id, `${data.title || "Oturum"} silindi`);
  revalidateOwner(data.class_id, data.request_id);
  return ok("Oturum silindi");
}

/** Haftalık oturum üretici: ilk tarih + gün + saat aralığı + adet; başlıklar program müfredatından */
export async function generateWeeklySessions(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const classId = str(formData, "class_id");
  const firstDate = str(formData, "first_date");
  const weekday = Number(str(formData, "weekday"));
  const start = str(formData, "start_time");
  const end = str(formData, "end_time");
  const count = Number(str(formData, "count"));
  const firstWeek = Number(str(formData, "first_week") || "1");

  if (!isUuid(classId)) return fail("Dönem bulunamadı.");
  if (!isDate(firstDate)) return fail("İlk oturum tarihini seç.");
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return fail("Haftanın gününü seç.");
  if (!TIME.test(start) || !TIME.test(end) || end <= start) return fail("Saat aralığını kontrol et (bitiş başlangıçtan sonra).");
  if (!Number.isInteger(count) || count < 1 || count > 52) return fail("Oturum sayısı 1–52 arasında olmalı.");
  if (!Number.isInteger(firstWeek) || firstWeek < 1 || firstWeek > 104) return fail("Başlangıç haftası geçersiz.");

  const { data: cohort } = await supabase
    .from("classes")
    .select("id, title, module_id, location, meeting_url")
    .eq("id", classId)
    .maybeSingle();
  if (!cohort) return fail("Dönem bulunamadı.");

  const { data: weeks } = await supabase
    .from("module_syllabus_weeks")
    .select("week_number, title")
    .eq("module_id", cohort.module_id);
  const titles = new Map((weeks ?? []).map((week) => [week.week_number, week.title]));

  // İlk tarihten itibaren seçilen güne denk gelen ilk gün
  let date = firstDate;
  const shift = (weekday - weekdayOf(firstDate) + 7) % 7;
  date = addDays(date, shift);

  const rows = Array.from({ length: count }, (_, index) => {
    const day = addDays(date, index * 7);
    const weekNumber = firstWeek + index;
    return {
      class_id: classId,
      week_number: weekNumber,
      title: titles.get(weekNumber) ?? `Hafta ${weekNumber}`,
      starts_at: istanbulIso(day, start),
      ends_at: istanbulIso(day, end),
      location: cohort.location || "Online",
      meeting_url: cohort.meeting_url,
    };
  });

  const { error } = await supabase.from("sessions").insert(rows);
  if (error) return fail("Oturumlar oluşturulamadı. Tekrar dene.");

  await logAudit(supabase, user.id, "session.generate", "class", classId, `${cohort.title}: ${count} haftalık oturum oluşturuldu`);
  revalidateOwner(classId, null);
  return ok(`${count} oturum oluşturuldu`);
}
