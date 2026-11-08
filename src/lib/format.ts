// src/lib/format.ts — Türkçe tarih, saat, para ve göreli zaman biçimleri (Europe/Istanbul)
const TZ = "Europe/Istanbul";

const dateLong = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
const dateShort = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: TZ });
const dateWeekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
const timeOnly = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const money = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

type DateInput = string | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value.length === 10 ? `${value}T12:00:00` : value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 18 Kasım 2026 */
export function formatDate(value: DateInput): string {
  const date = toDate(value);
  return date ? dateLong.format(date) : "";
}

/** 18 Kas */
export function formatDateShort(value: DateInput): string {
  const date = toDate(value);
  return date ? dateShort.format(date) : "";
}

/** Salı, 18 Kasım */
export function formatWeekday(value: DateInput): string {
  const date = toDate(value);
  return date ? dateWeekday.format(date) : "";
}

/** 19:00 */
export function formatTime(value: DateInput): string {
  const date = toDate(value);
  return date ? timeOnly.format(date) : "";
}

/** 19:00–21:00 */
export function formatTimeRange(start: DateInput, end: DateInput): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}

/** ₺4.800 */
export function formatTRY(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "";
  return `₺${money.format(Number(amount))}`;
}

/** İndirimli tutar (yuvarlanmış) */
export function applyDiscount(amount: number, percent: number | null | undefined): number {
  if (!percent) return amount;
  return Math.round(amount * (1 - percent / 100));
}

/** "Bugün", "Yarın", "3 gün sonra", "2 saat önce" gibi göreli zaman */
export function formatRelative(value: DateInput): string {
  const date = toDate(value);
  if (!date) return "";
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  const future = diffMs > 0;

  if (minutes < 1) return "şimdi";
  if (minutes < 60) return future ? `${minutes} dk sonra` : `${minutes} dk önce`;
  if (hours < 24) return future ? `${hours} saat sonra` : `${hours} saat önce`;
  if (days === 1) return future ? "yarın" : "dün";
  if (days < 7) return future ? `${days} gün sonra` : `${days} gün önce`;
  return formatDateShort(date);
}

/** Bir tarihe kaç gün kaldığı (bugün 0, geçmişse negatif) */
export function daysFromToday(value: DateInput): number {
  const date = toDate(value);
  if (!date) return 0;
  const today = new Date();
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const b = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((b - a) / 86_400_000);
}

/** Saat sayısını okunur biçimde: "24 saat" */
export function formatHours(hours: number | null | undefined): string {
  if (!hours) return "";
  return `${hours} saat`;
}

/** Dosya boyutu: 1,2 MB */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} KB`;
  return `${(bytes / 1024 / 1024).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} MB`;
}
