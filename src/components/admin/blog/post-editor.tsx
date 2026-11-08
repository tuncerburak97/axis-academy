// src/components/admin/blog/post-editor.tsx — blog yazı düzenleyicisi: alanlar + markdown canlı önizleme
"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { savePost } from "@/lib/actions/admin-blog";
import type { PostRow } from "@/lib/types/platform";
import { ActionForm, Hidden, SubmitButton } from "@/components/admin/action-form";

export function PostEditor({ post }: { post?: PostRow }) {
  const [body, setBody] = React.useState(post?.body_md ?? "");
  const [title, setTitle] = React.useState(post?.title ?? "");
  const words = body.split(/\s+/).filter(Boolean).length;

  const preview = (
    <div className="min-h-64 rounded-xl border border-line bg-paper px-5 py-4">
      {title && <h1 className="mb-3 text-2xl font-semibold tracking-tight">{title}</h1>}
      {body.trim() ? (
        <div className="prose-custom">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Önizleme burada görünür.</p>
      )}
    </div>
  );

  return (
    <ActionForm action={savePost} className="flex flex-col gap-6">
      {post && <Hidden name="post_id" value={post.id} />}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Field id="post-title" label="Başlık">
            <Input
              name="title"
              required
              minLength={3}
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="text-lg font-semibold"
            />
          </Field>
          <Tabs defaultValue="write" tabStyle="pill">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList>
                <TabsTrigger value="write">Yaz</TabsTrigger>
                <TabsTrigger value="preview" className="xl:hidden">
                  Önizle
                </TabsTrigger>
              </TabsList>
              <span className="tabular font-mono text-xs text-ink-soft">
                {words} kelime · ~{Math.max(1, Math.round(words / 200))} dk
              </span>
            </div>
            <TabsContent value="write" forceMount className="data-[state=inactive]:hidden xl:data-[state=inactive]:block">
              <div className="grid gap-4 xl:grid-cols-2">
                <div>
                  <label htmlFor="post-body" className="sr-only">
                    Metin (Markdown)
                  </label>
                  <Textarea
                    id="post-body"
                    name="body_md"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    rows={24}
                    placeholder={"## Ara başlık\n\nMetin… **kalın**, *italik*, [bağlantı](https://…)\n\n- madde"}
                    className="min-h-96 font-mono text-sm"
                  />
                </div>
                <div className="hidden xl:block">{preview}</div>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="xl:hidden">
              {preview}
            </TabsContent>
          </Tabs>
        </div>

        <Card padding="sm" className="flex h-fit flex-col gap-4 xl:sticky xl:top-24">
          <Field id="post-slug" label="Adres (slug)" hint="Boşsa başlıktan üretilir.">
            <Input name="slug" defaultValue={post?.slug ?? ""} maxLength={80} className="font-mono text-sm" placeholder="yazinin-adresi" />
          </Field>
          <Field id="post-excerpt" label="Özet" optional hint="Liste ve paylaşım önizlemesinde görünür. En fazla 400 karakter.">
            <Textarea name="excerpt" rows={3} maxLength={400} defaultValue={post?.excerpt ?? ""} />
          </Field>
          <Field id="post-tags" label="Etiketler" optional hint="Virgülle ayır: excel, tez, ipucu">
            <Input name="tags" defaultValue={post?.tags.join(", ") ?? ""} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="post-minutes" label="Okuma (dk)" optional hint="Boşsa hesaplanır.">
              <Input name="reading_minutes" type="number" min={1} max={120} defaultValue={post?.reading_minutes ?? ""} className="tabular font-mono" />
            </Field>
            <Field id="post-author" label="Yazar">
              <Input name="author_name" maxLength={80} defaultValue={post?.author_name ?? "Axis Akademi"} />
            </Field>
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-line px-3.5 py-3 text-sm">
            <input type="checkbox" name="is_published" defaultChecked={post?.is_published ?? false} className="mt-0.5 size-4 accent-[var(--color-accent)]" />
            <span>
              <span className="font-medium">Yayında</span>
              <span className="block text-xs text-ink-soft">İşaretliyse /blog'da görünür; yayın tarihi ilk yayında atanır.</span>
            </span>
          </label>
          <SubmitButton>{post ? "Kaydet" : "Oluştur"}</SubmitButton>
        </Card>
      </div>
    </ActionForm>
  );
}
