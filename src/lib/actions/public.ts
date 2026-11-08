// src/lib/actions/public.ts — giriş gerektirmeyen "bize yaz" mesajı (public_inquiries; admin /admin/sorular)
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendAdminNotification } from "@/lib/email";
import type { AuthFormState } from "@/lib/types";

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Adını yaz (en az 2 karakter).").max(100),
  email: z.string().trim().email("Geçerli bir e-posta adresi yaz; yanıtımızı oraya göndereceğiz."),
  message: z.string().trim().min(10, "Mesajın en az 10 karakter olmalı.").max(5000),
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
    return { error: "Mesajın gönderilemedi. Bağlantını kontrol edip tekrar dene." };
  }

  await sendAdminNotification("Yeni iletişim mesajı (Bize Ulaşın)", [
    `Ad: ${parsed.data.name}`,
    `E-posta: ${parsed.data.email}`,
    `Mesaj: ${parsed.data.message}`,
  ]);

  revalidatePath("/admin/sorular");
  return { message: "Mesajın bize ulaştı. Yanıtımızı e-posta ile göndereceğiz." };
}
