// src/lib/email.ts — Resend REST API ile admin bildirim e-postaları (yalnızca sunucu tarafı)
// RESEND_API_KEY veya ADMIN_EMAIL tanımlı değilse mail atlanır; akış asla bozulmaz.

export async function sendAdminNotification(subject: string, lines: string[]): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Axis Akademi <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `[Axis Akademi] ${subject}`,
        text: `${lines.join("\n")}\n\n— Bu bildirim Axis Akademi sitesinden otomatik gönderildi.`,
      }),
    });
    if (!response.ok) {
      console.error("Admin bildirimi gönderilemedi:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Admin bildirimi gönderilemedi:", error);
  }
}
