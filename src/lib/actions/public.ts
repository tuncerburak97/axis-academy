// src/lib/actions/public.ts — login gerektirmeyen "bize ulaşın" talebi
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendAdminNotification } from "@/lib/email";
import type { AuthFormState } from "@/lib/types";

const inquirySchema = z.object({
  name: z.string().min(2, "Adınızı yazın.").max(100),
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  message: z.string().min(10, "Mesajınız en az 10 karakter olmalı.").max(5000),
  website: z.string().max(0, "Gönderim reddedildi."), // honeypot: botlar doldurur, insanlar görmez
});

export async function createPublicInquiry(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("public_inquiries").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });
  if (error) {
    return { error: "Mesajınız gönderilemedi. Lütfen tekrar deneyin." };
  }

  await sendAdminNotification("Yeni iletişim mesajı (Bize Ulaşın)", [
    `Ad: ${parsed.data.name}`,
    `E-posta: ${parsed.data.email}`,
    `Mesaj: ${parsed.data.message}`,
  ]);

  revalidatePath("/admin/talepler");
  return { message: "Mesajınız bize ulaştı. En kısa sürede e-posta üzerinden dönüş yapacağız." };
}
