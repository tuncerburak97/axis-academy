// src/app/(panel)/panel/takvim/ics/route.ts — kullanıcının tüm oturumları tek .ics dosyası olarak
import { getSessionUser } from "@/lib/auth";
import { getMySessions } from "@/lib/queries/member";
import { buildIcs, icsResponse } from "@/lib/queries/member-calendar";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.redirect(new URL(`/giris?next=${encodeURIComponent("/panel/takvim")}`, request.url), 303);
  }
  // Son 30 günden itibaren: geçmiş derslerin notları da takvimde kalsın
  const from = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const sessions = await getMySessions(user, { from });
  const appUrl = process.env.APP_URL ?? new URL(request.url).origin;
  return icsResponse(buildIcs(sessions, { appUrl, calendarName: "Axis Akademi dersleri" }), "axis-akademi-takvim.ics");
}
