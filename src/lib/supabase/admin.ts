// src/lib/supabase/admin.ts — service role istemcisi (yalnızca sunucu; auth.admin.deleteUser için)
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("SUPABASE_SECRET_KEY yapılandırılmamış — kullanıcı silme devre dışı.");
  }
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function hasAdminServiceKey(): boolean {
  return Boolean(process.env.SUPABASE_SECRET_KEY);
}
