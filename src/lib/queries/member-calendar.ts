// src/lib/queries/member-calendar.ts — iCalendar (.ics) üretimi (RFC 5545)
// Zamanlar UTC ("Z") yazılır; takvim uygulaması kullanıcının saat dilimine çevirir.
import type { MemberSession } from "@/lib/queries/member-types";

const CRLF = "\r\n";

function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Metin alanlarında ters bölü, noktalı virgül, virgül ve satır sonu kaçışlanır */
function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** 75 oktetten uzun satırlar katlanır (UTF-8 çok baytlı karakterler bölünmeden) */
function fold(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // devam satırları baştaki boşlukla başlar
    if (size + bytes > limit) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += bytes;
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

export function buildIcs(sessions: MemberSession[], options: { appUrl: string; calendarName?: string }): string {
  const stamp = icsDate(new Date().toISOString());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Axis Akademi//Uye Paneli//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(options.calendarName ?? "Axis Akademi")}`,
    "X-WR-TIMEZONE:Europe/Istanbul",
  ];

  for (const session of sessions) {
    const summary = session.title ? `${session.source.title} · ${session.title}` : session.source.title;
    const detailUrl = `${options.appUrl}${session.source.href}`;
    const description = [
      session.week_number ? `Hafta ${session.week_number}` : "",
      session.notes,
      session.meeting_url ? `Ders bağlantısı: ${session.meeting_url}` : "",
      `Ayrıntılar: ${detailUrl}`,
    ]
      .filter(Boolean)
      .join("\n");
    const location = session.meeting_url && session.location.toLowerCase() === "online" ? session.meeting_url : session.location;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${session.id}@axisakademi.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(session.starts_at)}`,
      `DTEND:${icsDate(session.ends_at)}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `LOCATION:${escapeText(location || "Online")}`,
      `URL:${session.meeting_url || detailUrl}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(summary)}`,
      "TRIGGER:-PT30M",
      "END:VALARM",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join(CRLF) + CRLF;
}

export function icsResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
