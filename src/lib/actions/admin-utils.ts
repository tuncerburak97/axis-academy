// src/lib/actions/admin-utils.ts — admin Server Action'ları için yardımcılar (sunucu tarafı, "use server" değil)
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/components/admin/lib/action-state";

export function ok(message?: string, extra?: Partial<ActionState>): ActionState {
  return { ok: true, message, at: Date.now(), ...extra };
}

export function fail(error: string): ActionState {
  return { ok: false, error, at: Date.now() };
}

export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Boşsa null */
export function optStr(formData: FormData, key: string): string | null {
  return str(formData, key) || null;
}

/** Boşsa null, sayı değilse NaN */
export function optNum(formData: FormData, key: string): number | null {
  const raw = str(formData, key).replace(",", ".");
  if (!raw) return null;
  return Number(raw);
}

export function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

/** Satır başına bir madde → dizi */
export function lines(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

/** Admin konsolunu tazeler (sayaçlar dahil); ek yollar public/üye sayfaları için */
export function revalidateAdmin(...extra: string[]) {
  revalidatePath("/admin", "layout");
  for (const path of extra) revalidatePath(path);
}

/** Katalog değişti: public ve üye sayfaları da tazelenir */
export function revalidateEverything() {
  revalidatePath("/", "layout");
}

export function dbError(message: string | undefined, fallback = "Kaydedilemedi. Biraz sonra tekrar dene."): string {
  if (!message) return fallback;
  if (message.includes("duplicate key")) return "Bu değer zaten kullanılıyor. Farklı bir değer gir.";
  if (message.includes("violates check constraint")) return "Girilen değerlerden biri geçersiz. Alanları kontrol et.";
  if (message.includes("violates foreign key")) return "Bağlı kayıtlar olduğu için işlem yapılamadı.";
  return fallback;
}

/** Dosya adını depolama için güvenli hâle getirir */
export function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w.\-() ]+/g, "_")
    .replace(/\s+/g, "_");
  return cleaned.slice(-120) || "dosya";
}
