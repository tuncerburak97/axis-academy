// src/lib/actions/admin-blog.ts — blog yazıları: oluştur/düzenle, yayınla/geri çek, sil
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/components/admin/lib/action-state";
import { bool, dbError, fail, isUuid, ok, revalidateAdmin, str } from "@/lib/actions/admin-utils";

function slugify(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidateAdmin();
}

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "post_id");
  const title = str(formData, "title");
  const slug = slugify(str(formData, "slug") || title);
  const excerpt = str(formData, "excerpt");
  const body = typeof formData.get("body_md") === "string" ? String(formData.get("body_md")) : "";
  const tags = str(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);
  const words = body.split(/\s+/).filter(Boolean).length;
  const minutesRaw = str(formData, "reading_minutes");
  const minutes = minutesRaw ? Number(minutesRaw) : Math.max(1, Math.round(words / 200));
  const publish = bool(formData, "is_published");

  if (title.length < 3 || title.length > 200) return fail("Başlık 3–200 karakter olmalı.");
  if (!slug) return fail("Adres (slug) üretilemedi. Başlığa harf ekle ya da adresi elle gir.");
  if (excerpt.length > 400) return fail("Özet en fazla 400 karakter olabilir.");
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) return fail("Okuma süresi 1–120 dakika olmalı.");
  if (publish && body.trim().length < 20) return fail("Yayınlamak için yazı metnini ekle.");

  const payload = {
    title,
    slug,
    excerpt,
    body_md: body,
    tags,
    reading_minutes: minutes,
    author_name: str(formData, "author_name").slice(0, 80) || "Axis Akademi",
    is_published: publish,
  };

  if (id) {
    if (!isUuid(id)) return fail("Yazı bulunamadı.");
    const { data: existing } = await supabase.from("posts").select("slug, published_at").eq("id", id).maybeSingle();
    if (!existing) return fail("Yazı bulunamadı.");
    const { error } = await supabase
      .from("posts")
      .update({ ...payload, published_at: publish ? existing.published_at ?? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return fail(error.message.includes("slug") ? "Bu adres başka bir yazıda kullanılıyor." : dbError(error.message));
    await logAudit(supabase, user.id, "post.update", "post", id, `${title}${publish ? " (yayında)" : " (taslak)"}`);
    revalidateBlog(existing.slug);
    revalidateBlog(slug);
    return ok(publish ? "Yazı kaydedildi ve yayında" : "Taslak kaydedildi");
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...payload, published_at: publish ? new Date().toISOString() : null })
    .select("id")
    .single();
  if (error || !data) return fail(error?.message.includes("slug") ? "Bu adres başka bir yazıda kullanılıyor." : dbError(error?.message));
  await logAudit(supabase, user.id, "post.create", "post", data.id, `${title}${publish ? " yayınlandı" : " taslak olarak oluşturuldu"}`);
  revalidateBlog(slug);
  return ok(publish ? "Yazı yayınlandı" : "Taslak oluşturuldu", { redirectTo: `/admin/blog/${data.id}` });
}

export async function setPostPublished(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "post_id");
  const publish = bool(formData, "publish");
  if (!isUuid(id)) return fail("Yazı bulunamadı.");
  const { data: post } = await supabase.from("posts").select("title, slug, body_md, published_at").eq("id", id).maybeSingle();
  if (!post) return fail("Yazı bulunamadı.");
  if (publish && post.body_md.trim().length < 20) return fail("Yayınlamak için önce yazı metnini ekle.");
  const { error } = await supabase
    .from("posts")
    .update({ is_published: publish, published_at: publish ? post.published_at ?? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return fail("Güncellenemedi.");
  await logAudit(supabase, user.id, publish ? "post.publish" : "post.unpublish", "post", id, `${post.title} ${publish ? "yayınlandı" : "yayından kaldırıldı"}`);
  revalidateBlog(post.slug);
  return ok(publish ? "Yazı yayında" : "Yazı yayından kaldırıldı");
}

export async function deletePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const id = str(formData, "post_id");
  if (!isUuid(id)) return fail("Yazı bulunamadı.");
  const { data: post } = await supabase.from("posts").select("title, slug").eq("id", id).maybeSingle();
  if (!post) return fail("Yazı bulunamadı.");
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return fail("Yazı silinemedi.");
  await logAudit(supabase, user.id, "post.delete", "post", id, `${post.title} silindi`);
  revalidateBlog(post.slug);
  return ok("Yazı silindi", { redirectTo: "/admin/blog" });
}
