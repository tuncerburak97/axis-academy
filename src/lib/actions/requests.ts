// src/lib/actions/requests.ts — talep sihirbazının gönderimi (/teklif/[tur])
// Fiyat tahmini her zaman sunucuda hesaplanır; istemciden gelen fiyata güvenilmez.
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { sendAdminNotification } from "@/lib/email";
import { formatDate, formatTRY } from "@/lib/format";
import { analysisMethodLabels, requestKindLabels, type RequestKind } from "@/lib/types/platform";
import type { Json } from "@/lib/supabase/database.types";

export interface CreateRequestState {
  error?: string;
  /** Başarılıysa oluşan talep; istemci taslağı siler ve talep sayfasına geçer */
  requestId?: string;
  /** Talep oluştu ama dosya yüklenemedi gibi kısmi sorunlar */
  warning?: string;
}

const MAX_FILE_BYTES = 20 * 1024 * 1024;

const text = (max: number) => z.string().trim().max(max, `En fazla ${max} karakter yazabilirsin.`);
const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarihi gün.ay.yıl olarak seç.")
  .optional()
  .or(z.literal(""));

const analysisSchema = z.object({
  kind: z.literal("analiz"),
  method: z.enum(["bibliometric", "statistical", "both"], { message: "Analiz türünü seç." }),
  database: text(80).optional().default(""),
  software: text(80).optional().default(""),
  sample: text(40).optional().default(""),
  topic: text(200).min(3, "Konunu birkaç kelimeyle yaz."),
  field: text(120).optional().default(""),
  deadline: optionalDate,
  message: text(5000).min(10, "İhtiyacını en az 10 karakterle anlat."),
});

const thesisSchema = z.object({
  kind: z.literal("tez"),
  degree: z.enum(["Yüksek lisans", "Doktora", "Lisans", "Diğer"], { message: "Dereceni seç." }),
  institute: text(160).min(2, "Enstitü ya da üniversite adını yaz."),
  pages: z.coerce.number({ message: "Sayfa sayısını rakamla yaz." }).int().min(1, "Sayfa sayısı en az 1 olmalı.").max(2000, "Sayfa sayısı çok yüksek görünüyor."),
  style: text(60).min(2, "Kaynakça stilini seç."),
  deadline: optionalDate,
  needs: z.array(text(80)).min(1, "En az bir ihtiyaç seç.").max(12),
  message: text(5000).optional().default(""),
});

const corporateSchema = z.object({
  kind: z.literal("kurumsal"),
  company: text(160).min(2, "Kurum adını yaz."),
  headcount: z.coerce.number({ message: "Katılımcı sayısını rakamla yaz." }).int().min(1, "En az 1 kişi olmalı.").max(5000),
  programs: z.array(text(160)).min(1, "En az bir program seç.").max(10),
  format: z.enum(["Online", "Yerinde", "Karma"], { message: "Eğitim şeklini seç." }),
  dates: text(200).optional().default(""),
  message: text(5000).optional().default(""),
});

const trainingSchema = z.object({
  kind: z.literal("birebir"),
  program: text(120).min(1, "Bir program seç."),
  mode: z.enum(["bundle", "custom", "schedule"], { message: "Nasıl çalışmak istediğini seç." }),
  bundleId: z.string().uuid().optional().or(z.literal("")),
  topicIds: z.array(z.string().uuid()).max(50).optional().default([]),
  preferredDays: z.array(text(40)).max(14).optional().default([]),
  message: text(5000).optional().default(""),
  discountCode: text(32).optional().default(""),
});

const payloadSchema = z.discriminatedUnion("kind", [analysisSchema, thesisSchema, corporateSchema, trainingSchema]);

function safeFileName(name: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U" };
  const replaced = name.replace(/[çğıöşüÇĞİÖŞÜ]/g, (char) => map[char] ?? char);
  const dot = replaced.lastIndexOf(".");
  const base = (dot > 0 ? replaced.slice(0, dot) : replaced).replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "dosya";
  const ext = dot > 0 ? replaced.slice(dot + 1).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toLowerCase() : "";
  return ext ? `${base}.${ext}` : base;
}

interface Insert {
  kind: RequestKind;
  training_mode: "bundle" | "custom" | "schedule" | null;
  module_id: string | null;
  bundle_id: string | null;
  topic_ids: string[];
  total_hours: number | null;
  title: string;
  details: Record<string, Json>;
  message: string;
  price_estimate: number | null;
  discount_code: string | null;
  discount_percent: number | null;
}

export async function createRequest(_prev: CreateRequestState, formData: FormData): Promise<CreateRequestState> {
  const user = await getSessionUser();
  if (!user) return { error: "Talebini göndermek için giriş yapman gerekiyor. Taslağın bu cihazda saklı." };

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { error: "Form okunamadı. Sayfayı yenileyip tekrar dene." };
  }
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const payload = parsed.data;

  const fileEntry = formData.get("file");
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
  if (file && file.size > MAX_FILE_BYTES) {
    return { error: "Dosya 20 MB'tan büyük. Sıkıştırıp (ZIP) ya da bölerek tekrar dene." };
  }

  const supabase = await createClient();
  let insert: Insert;

  switch (payload.kind) {
    case "analiz": {
      const method = analysisMethodLabels[payload.method];
      const tool = payload.method === "bibliometric" ? payload.database : payload.software || payload.database;
      insert = base("analysis", `${method}${tool ? ` · ${tool}` : ""}`, payload.message, {
        method: payload.method,
        database: payload.database,
        software: payload.software,
        sample: payload.sample,
        topic: payload.topic,
        field: payload.field,
        deadline: payload.deadline ?? "",
      });
      break;
    }
    case "tez": {
      insert = base("thesis", `Tez düzenleme · ${payload.pages} sayfa`, payload.message, {
        degree: payload.degree,
        institute: payload.institute,
        pages: payload.pages,
        style: payload.style,
        deadline: payload.deadline ?? "",
        needs: payload.needs.join(", "),
      });
      break;
    }
    case "kurumsal": {
      insert = base("corporate", `Kurumsal eğitim · ${payload.headcount} kişi`, payload.message, {
        company: payload.company,
        headcount: payload.headcount,
        programs: payload.programs,
        format: payload.format,
        preferred_days: payload.dates,
      });
      break;
    }
    case "birebir": {
      const { data: program } = await supabase
        .from("education_modules")
        .select("id, title, slug")
        .eq("slug", payload.program)
        .eq("is_active", true)
        .maybeSingle();
      if (!program) return { error: "Seçtiğin program artık aktif değil. Başka bir program seç." };

      let title = `Birebir ${program.title}`;
      let bundleId: string | null = null;
      let topicIds: string[] = [];
      let totalHours: number | null = null;
      let price: number | null = null;

      if (payload.mode === "bundle") {
        if (!payload.bundleId) return { error: "Bir paket seç." };
        const { data: bundle } = await supabase
          .from("bundle_packages")
          .select("id, title, fixed_price, duration_hours")
          .eq("id", payload.bundleId)
          .eq("module_id", program.id)
          .eq("is_active", true)
          .maybeSingle();
        if (!bundle) return { error: "Seçtiğin paket artık sunulmuyor. Başka bir paket seç." };
        bundleId = bundle.id;
        totalHours = bundle.duration_hours;
        price = Number(bundle.fixed_price);
        title = bundle.title;
      } else if (payload.mode === "custom") {
        if (payload.topicIds.length === 0) return { error: "Programına eklemek için en az bir konu seç." };
        const [{ data: topics }, { data: plan }] = await Promise.all([
          supabase
            .from("topics")
            .select("id, estimated_hours")
            .in("id", payload.topicIds)
            .eq("module_id", program.id)
            .eq("is_active", true),
          supabase
            .from("pricing_plans")
            .select("price")
            .eq("module_id", program.id)
            .eq("training_type", "individual")
            .eq("unit", "per_hour")
            .eq("is_active", true)
            .order("sort_order")
            .limit(1)
            .maybeSingle(),
        ]);
        if (!topics || topics.length === 0) return { error: "Seçtiğin konular bulunamadı. Listeden yeniden seç." };
        topicIds = topics.map((topic) => topic.id);
        totalHours = topics.reduce((sum, topic) => sum + topic.estimated_hours, 0);
        price = plan ? Number(plan.price) * totalHours : null;
        title = `Birebir ${program.title} · ${totalHours} saat`;
      } else {
        title = `Birebir ${program.title} · tarih talebi`;
      }

      let discountCode: string | null = null;
      let discountPercent: number | null = null;
      if (payload.discountCode) {
        const { data: percent } = await supabase.rpc("check_discount_code", { p_code: payload.discountCode });
        if (!percent) return { error: "İndirim kodu geçerli değil ya da süresi dolmuş. Kodu kontrol et veya alanı boş bırak." };
        discountCode = payload.discountCode.toUpperCase();
        discountPercent = percent;
      }

      insert = {
        ...base("training", title, payload.message, {
          preferred_days: payload.preferredDays.join(", "),
        }),
        training_mode: payload.mode,
        module_id: program.id,
        bundle_id: bundleId,
        topic_ids: topicIds,
        total_hours: totalHours,
        price_estimate: price,
        discount_code: discountCode,
        discount_percent: discountPercent,
      };
      break;
    }
  }

  const { data: created, error } = await supabase
    .from("requests")
    .insert({ ...insert, user_id: user.id })
    .select("id")
    .single();
  if (error || !created) {
    return { error: "Talebin kaydedilemedi. Bağlantını kontrol edip tekrar dene; taslağın saklı." };
  }

  let warning: string | undefined;
  if (file) {
    const path = `${user.id}/${created.id}/${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("request-files")
      .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
    if (uploadError) {
      warning = "Talebin alındı ama dosya yüklenemedi. Talep sayfasından dosyayı yeniden ekleyebilirsin.";
    } else {
      const { error: fileRowError } = await supabase.from("request_files").insert({
        request_id: created.id,
        uploaded_by: user.id,
        file_path: path,
        file_name: file.name.slice(0, 200),
        file_size: file.size,
      });
      if (fileRowError) warning = "Talebin alındı ama dosya kaydı oluşturulamadı. Talep sayfasından dosyayı yeniden ekleyebilirsin.";
    }
  }

  const detailLines = Object.entries(insert.details)
    .filter(([, value]) => value !== "" && value !== null && !(Array.isArray(value) && value.length === 0))
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`);
  await sendAdminNotification(
    `Yeni talep: ${insert.title}`,
    [
      `Tür: ${requestKindLabels[insert.kind]}`,
      `Kişi: ${user.displayName} <${user.email}>`,
      ...detailLines,
      insert.total_hours ? `Toplam süre: ${insert.total_hours} saat` : "",
      insert.price_estimate ? `Tahmini tutar: ${formatTRY(insert.price_estimate)}` : "",
      insert.discount_code ? `İndirim kodu: ${insert.discount_code} (%${insert.discount_percent})` : "",
      insert.message ? `Mesaj: ${insert.message}` : "",
      file ? `Dosya: ${file.name}${warning ? " (yüklenemedi)" : ""}` : "",
      `Gönderim: ${formatDate(new Date())}`,
    ].filter(Boolean),
    `/admin/talepler/${created.id}`,
  );

  revalidatePath("/panel/talepler");
  revalidatePath("/panel");
  return { requestId: created.id, warning };
}

function base(kind: RequestKind, title: string, message: string, details: Record<string, Json>): Insert {
  return {
    kind,
    training_mode: null,
    module_id: null,
    bundle_id: null,
    topic_ids: [],
    total_hours: null,
    title: title.slice(0, 200),
    details,
    message: message ?? "",
    price_estimate: null,
    discount_code: null,
    discount_percent: null,
  };
}
