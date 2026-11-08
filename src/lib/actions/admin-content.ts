// src/lib/actions/admin-content.ts — site_content düzenleyicisi: anasayfa, hizmet tanıtımları, program girişi, SSS listesi
"use server";

import { revalidatePath } from "next/cache";
import type { Json } from "@/lib/supabase/database.types";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/components/admin/lib/action-state";
import { fail, ok, revalidateAdmin, str } from "@/lib/actions/admin-utils";

/** Düzenlenebilir bölümler ve alanları (alan: [en az, en çok] karakter) */
const SECTIONS: Record<string, { label: string; fields: Record<string, [number, number]>; paths: string[] }> = {
  "home/hero": { label: "Anasayfa girişi", fields: { title: [5, 200], subtitle: [5, 500] }, paths: ["/"] },
  "analysis/intro": { label: "Analiz sayfası", fields: { title: [3, 150], description: [5, 500], body: [5, 2000] }, paths: ["/analiz"] },
  "thesis/intro": { label: "Tez düzenleme sayfası", fields: { title: [3, 150], description: [5, 500], body: [5, 2000] }, paths: ["/tez-duzenleme"] },
  "corporate/intro": { label: "Kurumsal sayfası", fields: { title: [3, 150], description: [5, 500], body: [5, 2000] }, paths: ["/kurumsal"] },
  "education/intro": { label: "Program kataloğu girişi", fields: { title: [3, 150], description: [5, 500] }, paths: ["/programlar"] },
};

async function upsert(pageKey: string, sectionKey: string, content: unknown, label: string, paths: string[]): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.from("site_content").upsert({
    page_key: pageKey,
    section_key: sectionKey,
    content_json: content as NonNullable<Json>,
    updated_at: new Date().toISOString(),
  });
  if (error) return fail("İçerik kaydedilemedi. Tekrar dene.");
  await logAudit(supabase, user.id, "content.update", "site_content", `${pageKey}/${sectionKey}`, `${label} güncellendi`);
  for (const path of paths) revalidatePath(path);
  revalidateAdmin();
  return ok(`${label} kaydedildi`);
}

export async function saveContentSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const key = str(formData, "section");
  const section = SECTIONS[key];
  if (!section) return fail("Bölüm bulunamadı.");
  const content: Record<string, string> = {};
  for (const [field, [min, max]] of Object.entries(section.fields)) {
    const value = str(formData, field);
    if (value.length < min || value.length > max) return fail(`Alan uzunluğu ${min}–${max} karakter olmalı (${field}).`);
    content[field] = value;
  }
  const [pageKey, sectionKey] = key.split("/");
  return upsert(pageKey, sectionKey, content, section.label, section.paths);
}

/** SSS: sıralı soru-cevap listesi (JSON olarak gelir) */
export async function saveFaq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let raw: unknown;
  try {
    raw = JSON.parse(str(formData, "items") || "[]");
  } catch {
    return fail("SSS listesi okunamadı. Sayfayı yenileyip tekrar dene.");
  }
  if (!Array.isArray(raw)) return fail("SSS listesi geçersiz.");
  const items = raw
    .map((item) => ({
      question: String((item as { question?: unknown })?.question ?? "").trim().slice(0, 300),
      answer: String((item as { answer?: unknown })?.answer ?? "").trim().slice(0, 2000),
    }))
    .filter((item) => item.question || item.answer);
  if (items.some((item) => !item.question || !item.answer)) return fail("Her sorunun hem başlığı hem cevabı olmalı.");
  if (items.length === 0) return fail("En az bir soru ekle.");
  if (items.length > 40) return fail("En fazla 40 soru eklenebilir.");
  return upsert("faq", "items", { items }, "SSS", ["/sss", "/"]);
}
