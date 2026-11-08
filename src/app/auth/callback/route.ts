// src/app/auth/callback/route.ts — OAuth, e-posta doğrulama ve şifre sıfırlama dönüşünde oturum kurulumu
// ?next= yalnızca site içi bir yol olabilir (safeNextPath); aksi hâlde /panel'e gider.
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth";

const otpTypes: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next") ?? (type === "recovery" ? "/sifre-yenile" : null));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type && otpTypes.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  const target = next === "/sifre-yenile" ? "/sifremi-unuttum?error=expired" : `/giris?error=auth&next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(`${origin}${target}`);
}
