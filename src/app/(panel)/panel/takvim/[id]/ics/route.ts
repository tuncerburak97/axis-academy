// src/app/(panel)/panel/takvim/[id]/ics/route.ts — tek oturum .ics dosyası ("Takvime ekle")
import { getSessionUser } from "@/lib/auth";
import { getMySession } from "@/lib/queries/member";
import { buildIcs, icsResponse } from "@/lib/queries/member-calendar";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return Response.redirect(new URL(`/giris?next=${encodeURIComponent("/panel/takvim")}`, request.url), 303);
  }
  const session = await getMySession(user, id);
  if (!session) return new Response("Oturum bulunamadı.", { status: 404 });
  const appUrl = process.env.APP_URL ?? new URL(request.url).origin;
  return icsResponse(buildIcs([session], { appUrl }), `axis-ders-${session.starts_at.slice(0, 10)}.ics`);
}
