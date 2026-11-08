// src/lib/auth.ts — oturum yardımcıları: kullanıcı + profil okuma, rol korumaları
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, UserRole } from "@/lib/types/platform";

export interface SessionUser {
  id: string;
  email: string;
  profile: ProfileRow;
  role: UserRole;
  displayName: string;
}

/** Oturumdaki kullanıcı ve profili; giriş yoksa null. Aynı istekte tek sorgu (cache). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? profile.email,
    profile,
    role: profile.role as UserRole,
    displayName: profile.full_name || user.email || "Üye",
  };
});

/** Giriş zorunlu sayfalar: giriş yoksa /giris?next=… adresine yönlendirir */
export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(nextPath ? `/giris?next=${encodeURIComponent(nextPath)}` : "/giris");
  return user;
}

/** Admin sayfaları: admin değilse 404 (panelin varlığı gizli kalır) */
export async function requireAdminUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") notFound();
  return user;
}

/** Yalnızca aynı site içi yönlendirmelere izin verir (açık yönlendirme açığını önler) */
export function safeNextPath(next: string | null | undefined, fallback = "/panel"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

/** Kullanıcının adının ilk kelimesi: "Günaydın, Elif" */
export function firstName(user: Pick<SessionUser, "displayName">): string {
  return user.displayName.split(/\s+/)[0] ?? user.displayName;
}
