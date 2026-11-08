// src/lib/actions/enroll.ts — döneme başvuru ve indirim kodu kontrolü (program sayfasındaki başvuru diyaloğu)
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { sendAdminNotification } from "@/lib/email";
import { formatDate } from "@/lib/format";

export interface ApplyState {
  error?: string;
  /** Başarılı başvuruda kaydın durumu: onay bekliyor ya da bekleme listesi */
  result?: "pending" | "waitlisted";
  /** Giriş yoksa yönlendirilecek giriş adresi */
  loginHref?: string;
}

const applySchema = z.object({
  classId: z.string().uuid("Bir dönem seç."),
  note: z.string().trim().max(1000, "Not en fazla 1000 karakter olabilir.").optional().default(""),
  discountCode: z
    .string()
    .trim()
    .max(32, "İndirim kodu en fazla 32 karakter olabilir.")
    .optional()
    .default(""),
  returnPath: z.string().optional().default("/programlar"),
});

const rpcErrors: Record<string, string> = {
  ALREADY_REQUESTED: "Bu döneme zaten başvurdun. Başvurunun durumunu Eğitimlerim sayfasından izleyebilirsin.",
  CLASS_NOT_OPEN: "Bu dönem artık başvuru almıyor. Listeden başka bir dönem seç ya da birebir ders iste.",
  AUTH_REQUIRED: "Başvurmak için giriş yapman gerekiyor.",
};

export async function applyToCohort(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const parsed = applySchema.safeParse({
    classId: formData.get("classId"),
    note: formData.get("note") ?? "",
    discountCode: formData.get("discountCode") ?? "",
    returnPath: formData.get("returnPath") ?? "/programlar",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { classId, note, discountCode, returnPath } = parsed.data;

  const user = await getSessionUser();
  if (!user) {
    const back = returnPath.startsWith("/programlar") ? returnPath : "/programlar";
    const next = `${back.split("?")[0]}?basvur=${classId}`;
    return { error: rpcErrors.AUTH_REQUIRED, loginHref: `/giris?next=${encodeURIComponent(next)}` };
  }

  const supabase = await createClient();

  // İndirim kodu verildiyse önce geçerliliğini kontrol et; geçersiz kodla başvuru yapılmaz
  let code: string | undefined;
  if (discountCode) {
    const { data: percent } = await supabase.rpc("check_discount_code", { p_code: discountCode });
    if (!percent) {
      return { error: "Bu indirim kodu geçerli değil ya da süresi dolmuş. Kodu kontrol et veya alanı boş bırak." };
    }
    code = discountCode.toUpperCase();
  }

  const { data: enrollment, error } = await supabase.rpc("request_class_enrollment", {
    p_class_id: classId,
    p_note: note,
    ...(code ? { p_discount_code: code } : {}),
  });

  if (error || !enrollment) {
    const key = Object.keys(rpcErrors).find((name) => error?.message?.includes(name));
    return { error: key ? rpcErrors[key] : "Başvurun kaydedilemedi. Birazdan tekrar dene." };
  }

  const { data: cohort } = await supabase
    .from("classes")
    .select("title, start_date, education_modules(title)")
    .eq("id", classId)
    .maybeSingle();

  const waitlisted = enrollment.status === "waitlisted";
  await sendAdminNotification(
    waitlisted ? "Bekleme listesine yeni katılım" : "Yeni dönem başvurusu",
    [
      `Dönem: ${cohort?.title ?? classId}${cohort?.start_date ? ` (${formatDate(cohort.start_date)})` : ""}`,
      `Program: ${cohort?.education_modules?.title ?? "-"}`,
      `Kişi: ${user.displayName} <${user.email}>`,
      code ? `İndirim kodu: ${code}` : "",
      note ? `Not: ${note}` : "",
    ].filter(Boolean),
    `/admin/donemler/${classId}`,
  );

  revalidatePath("/programlar", "layout");
  revalidatePath("/panel/egitimler");
  return { result: waitlisted ? "waitlisted" : "pending" };
}

/** İndirim kodu kontrolü: geçerliyse yüzde, değilse null */
export async function checkDiscountCode(rawCode: string): Promise<{ percent: number | null; code: string }> {
  const code = rawCode.trim().toUpperCase().slice(0, 32);
  if (code.length < 3) return { percent: null, code };
  const supabase = await createClient();
  const { data } = await supabase.rpc("check_discount_code", { p_code: code });
  return { percent: typeof data === "number" && data > 0 ? data : null, code };
}
