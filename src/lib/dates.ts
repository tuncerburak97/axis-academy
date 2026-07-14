// src/lib/dates.ts — sınıf başlangıç tarihi geri sayım ve rozet metinleri

export type CountdownUrgency = "today" | "tomorrow" | "soon" | "normal";

export interface CountdownInfo {
  days: number;
  label: string;
  urgency: CountdownUrgency;
}

// Başlangıç tarihine kalan gün ve kullanıcıya gösterilecek aciliyet metni
export function daysUntil(startDateIso: string): CountdownInfo {
  const start = new Date(startDateIso);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = start.getTime() - today.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return { days: 0, label: "Bugün başlıyor!", urgency: "today" };
  if (days === 1) return { days: 1, label: "Yarın başlıyor!", urgency: "tomorrow" };
  if (days <= 7) return { days, label: `${days} gün kaldı`, urgency: "soon" };

  const formatted = start.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return { days, label: `${formatted}'da başlıyor`, urgency: "normal" };
}

export interface DateBadgeParts {
  day: number;
  month: string;
}

// Tarih rozeti için gün ve kısa ay etiketi
export function formatClassDateBadge(startDateIso: string): DateBadgeParts {
  const start = new Date(startDateIso);
  return {
    day: start.getDate(),
    month: start.toLocaleDateString("tr-TR", { month: "short" }),
  };
}
