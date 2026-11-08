// src/lib/email.ts — Resend REST API ile e-posta (yalnızca sunucu tarafı)
// RESEND_API_KEY tanımlı değilse e-posta atlanır; akış asla bozulmaz. Uygulama içi bildirimler
// veritabanı tetikleyicileriyle ayrıca oluşur (notifications tablosu).
import { createClient } from "@/lib/supabase/server";

const appUrl = () => process.env.APP_URL ?? "https://axisakademi.com";

interface EmailInput {
  to: string;
  subject: string;
  /** Paragraf paragraf düz metin */
  lines: string[];
  /** İsteğe bağlı buton: göreli yol verilirse APP_URL eklenir */
  cta?: { label: string; href: string };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderHtml({ subject, lines, cta }: EmailInput): string {
  const href = cta ? (cta.href.startsWith("http") ? cta.href : `${appUrl()}${cta.href}`) : "";
  const paragraphs = lines
    .map((line) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#0e1a2b">${escapeHtml(line)}</p>`)
    .join("");
  const button = cta
    ? `<p style="margin:24px 0 8px"><a href="${escapeHtml(href)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:12px">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html lang="tr"><body style="margin:0;background:#f6f7fb;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e6e9ef;border-radius:16px">
<tr><td style="padding:28px 28px 8px;font-size:15px;font-weight:700;color:#0e1a2b">Axis <span style="color:#4f46e5;font-style:italic;font-family:Georgia,serif;font-weight:400">Akademi</span></td></tr>
<tr><td style="padding:12px 28px 24px"><h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#0e1a2b">${escapeHtml(subject)}</h1>${paragraphs}${button}</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #e6e9ef;font-size:12px;color:#8a93a3">Bu e-postayı Axis Akademi hesabındaki bir hareket nedeniyle aldın. Bildirim tercihlerini panelindeki Hesap sayfasından değiştirebilirsin.</td></tr>
</table></td></tr></table></body></html>`;
}

export async function sendEmail(input: EmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !input.to) return;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Axis Akademi <onboarding@resend.dev>",
        to: [input.to],
        subject: input.subject,
        html: renderHtml(input),
        text: [...input.lines, input.cta ? `${input.cta.label}: ${input.cta.href.startsWith("http") ? input.cta.href : appUrl() + input.cta.href}` : ""]
          .filter(Boolean)
          .join("\n\n"),
      }),
    });
    if (!response.ok) console.error("E-posta gönderilemedi:", response.status, await response.text());
  } catch (error) {
    console.error("E-posta gönderilemedi:", error);
  }
}

/** Ekibe (ADMIN_EMAIL) bildirim */
export async function sendAdminNotification(subject: string, lines: string[], ctaHref?: string): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  await sendEmail({
    to: adminEmail,
    subject: `[Axis Akademi] ${subject}`,
    lines,
    cta: ctaHref ? { label: "Panelde aç", href: ctaHref } : undefined,
  });
}

/**
 * Bir üyeye e-posta. Profilde e-posta bildirimi kapalıysa gönderilmez.
 * Çağıran tarafın o profili okuma yetkisi olmalı (admin işlemleri ya da kullanıcının kendisi).
 */
export async function emailMember(userId: string, input: Omit<EmailInput, "to">): Promise<void> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, email_notifications")
    .eq("user_id", userId)
    .maybeSingle();
  if (!profile?.email || profile.email_notifications === false) return;
  await sendEmail({ ...input, to: profile.email });
}
