// src/lib/actions/admin-requests.ts — talep durumu ve not güncelleme Server Action'ları
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin-guard";

function revalidateRequestViews() {
  revalidatePath("/admin/talepler");
  revalidatePath("/panel");
  revalidatePath("/panel/talepler");
}

const contactUpdateSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum(["new", "contacted", "in_progress", "completed"]),
  admin_notes: z.string().max(2000),
});

export async function updateContactRequest(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = contactUpdateSchema.safeParse({
    request_id: formData.get("request_id"),
    status: formData.get("status"),
    admin_notes: formData.get("admin_notes") ?? "",
  });
  if (!parsed.success) redirect("/admin/talepler?error=validation");

  const { request_id, ...update } = parsed.data;
  const { error } = await supabase.from("contact_requests").update(update).eq("id", request_id);
  if (error) redirect("/admin/talepler?error=db");

  revalidateRequestViews();
  redirect("/admin/talepler?saved=1");
}

const inquiryUpdateSchema = z.object({
  inquiry_id: z.string().uuid(),
  status: z.enum(["new", "answered", "closed"]),
  admin_notes: z.string().max(2000),
});

export async function updateInquiry(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = inquiryUpdateSchema.safeParse({
    inquiry_id: formData.get("inquiry_id"),
    status: formData.get("status"),
    admin_notes: formData.get("admin_notes") ?? "",
  });
  if (!parsed.success) redirect("/admin/talepler?error=validation");

  const { inquiry_id, ...update } = parsed.data;
  const { error } = await supabase.from("public_inquiries").update(update).eq("id", inquiry_id);
  if (error) redirect("/admin/talepler?error=db");

  revalidatePath("/admin/talepler");
  redirect("/admin/talepler?saved=1");
}

const individualUpdateSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum(["received", "planned", "in_progress", "completed", "cancelled"]),
  progress_note: z.string().max(1000),
  admin_notes: z.string().max(2000),
});

export async function updateIndividualRequest(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const parsed = individualUpdateSchema.safeParse({
    request_id: formData.get("request_id"),
    status: formData.get("status"),
    progress_note: formData.get("progress_note") ?? "",
    admin_notes: formData.get("admin_notes") ?? "",
  });
  if (!parsed.success) redirect("/admin/talepler?error=validation");

  const { request_id, ...update } = parsed.data;
  const { error } = await supabase.from("individual_requests").update(update).eq("id", request_id);
  if (error) redirect("/admin/talepler?error=db");

  revalidateRequestViews();
  redirect("/admin/talepler?saved=1");
}
