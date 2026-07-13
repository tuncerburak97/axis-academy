// src/lib/actions/admin-content.ts — site_content bölüm güncelleme Server Action'ları
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin-guard";

// Bölüm anahtarına göre hangi public path'lerin tazeleneceği
const revalidateTargets: Record<string, string[]> = {
  "home/hero": ["/"],
  "analysis/intro": ["/analiz"],
  "thesis/intro": ["/tez-duzenleme"],
  "education/intro": ["/egitim"],
  "faq/items": ["/sss"],
};

async function upsertContent(pageKey: string, sectionKey: string, contentJson: unknown): Promise<void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("site_content")
    .upsert({ page_key: pageKey, section_key: sectionKey, content_json: contentJson, updated_at: new Date().toISOString() });
  if (error) redirect("/admin/icerik?error=db");

  for (const path of revalidateTargets[`${pageKey}/${sectionKey}`] ?? []) {
    revalidatePath(path);
  }
  revalidatePath("/admin/icerik");
  redirect("/admin/icerik?saved=1");
}

const heroSchema = z.object({
  title: z.string().min(5).max(200),
  subtitle: z.string().min(5).max(500),
});

export async function updateHero(formData: FormData): Promise<void> {
  const parsed = heroSchema.safeParse({
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
  });
  if (!parsed.success) redirect("/admin/icerik?error=validation");
  await upsertContent("home", "hero", parsed.data);
}

const serviceIntroSchema = z.object({
  page_key: z.enum(["analysis", "thesis"]),
  title: z.string().min(3).max(150),
  description: z.string().min(5).max(500),
  body: z.string().min(5).max(2000),
});

export async function updateServiceIntro(formData: FormData): Promise<void> {
  const parsed = serviceIntroSchema.safeParse({
    page_key: formData.get("page_key"),
    title: formData.get("title"),
    description: formData.get("description"),
    body: formData.get("body"),
  });
  if (!parsed.success) redirect("/admin/icerik?error=validation");

  const { page_key, ...content } = parsed.data;
  await upsertContent(page_key, "intro", content);
}

const educationIntroSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(5).max(500),
});

export async function updateEducationIntro(formData: FormData): Promise<void> {
  const parsed = educationIntroSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) redirect("/admin/icerik?error=validation");
  await upsertContent("education", "intro", parsed.data);
}

// SSS: satır başına "Soru::Cevap" biçimindeki metni yapılandırılmış listeye çevirir
export async function updateFaq(formData: FormData): Promise<void> {
  const raw = String(formData.get("items") ?? "");
  const items = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes("::"))
    .map((line) => {
      const [question, ...rest] = line.split("::");
      return { question: question.trim(), answer: rest.join("::").trim() };
    })
    .filter((item) => item.question && item.answer);

  if (items.length === 0) redirect("/admin/icerik?error=validation");
  await upsertContent("faq", "items", { items });
}
