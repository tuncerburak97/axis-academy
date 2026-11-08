// src/components/admin/lib/time.ts — Europe/Istanbul (UTC+3, yaz saati yok) tarih/saat dönüşümleri
const TZ = "Europe/Istanbul";

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** ISO zaman damgasını İstanbul saatine göre { date: "2026-11-18", time: "19:00" } olarak ayırır */
export function splitIstanbul(value: string | Date): { date: string; time: string } {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = Object.fromEntries(partsFormatter.formatToParts(date).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/** "2026-11-18" + "19:00" → İstanbul saatiyle ISO */
export function istanbulIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00+03:00`).toISOString();
}

/** Bugünün İstanbul tarihi (YYYY-MM-DD) */
export function todayIstanbul(): string {
  return splitIstanbul(new Date()).date;
}

/** YYYY-MM-DD tarihine gün ekler */
export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/** Haftanın günü (0 Pazar … 6 Cumartesi) */
export function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

/** Verilen tarihin içinde bulunduğu haftanın pazartesisi */
export function mondayOf(date: string): string {
  const day = weekdayOf(date);
  return addDays(date, day === 0 ? -6 : 1 - day);
}

export const weekdayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** Saat farkı (saat cinsinden) */
export function hoursSince(value: string): number {
  return (Date.now() - new Date(value).getTime()) / 3_600_000;
}
