// src/app/(admin)/admin/(dashboard)/talepler/page.tsx — talep yönetimi:
// analiz/tez ve bireysel eğitim talepleri, durum + not güncelleme, dosya indirme
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateContactRequest, updateIndividualRequest, updateInquiry } from "@/lib/actions/admin-requests";
import {
  contactStatusLabels,
  inquiryStatusLabels,
  requestStatusLabels,
  requestTypeLabels,
  serviceTypeLabels,
} from "@/lib/types/catalog";
import type { ContactStatus, IndividualRequestType, InquiryStatus, RequestStatus } from "@/lib/types/catalog";
import { SelectField, StatusBanner, SubmitButton, TextArea } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Talep Yönetimi", robots: { index: false } };
export const dynamic = "force-dynamic";

interface ContactRow {
  id: string;
  service_type: "analysis" | "thesis";
  message: string;
  file_path: string | null;
  status: ContactStatus;
  admin_notes: string;
  created_at: string;
  profiles: { full_name: string; email: string; phone: string | null } | null;
}

interface IndividualRow {
  id: string;
  request_type: IndividualRequestType;
  total_hours: number | null;
  calculated_price: number;
  status: RequestStatus;
  progress_note: string;
  admin_notes: string;
  user_message: string;
  created_at: string;
  profiles: { full_name: string; email: string; phone: string | null } | null;
  education_modules: { title: string } | null;
  bundle_packages: { title: string } | null;
}

interface InquiryRow {
  id: string;
  name: string;
  email: string;
  message: string;
  status: InquiryStatus;
  admin_notes: string;
  created_at: string;
}

const contactStatusOptions = Object.entries(contactStatusLabels).map(([value, label]) => ({ value, label }));
const requestStatusOptions = Object.entries(requestStatusLabels).map(([value, label]) => ({ value, label }));
const inquiryStatusOptions = Object.entries(inquiryStatusLabels).map(([value, label]) => ({ value, label }));

export default async function RequestManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();

  const [contactResult, individualResult, inquiryResult] = await Promise.all([
    supabase
      .from("contact_requests")
      .select("*, profiles(full_name, email, phone)")
      .order("created_at", { ascending: false }),
    supabase
      .from("individual_requests")
      .select("*, profiles(full_name, email, phone), education_modules(title), bundle_packages(title)")
      .order("created_at", { ascending: false }),
    supabase.from("public_inquiries").select("*").order("created_at", { ascending: false }),
  ]);

  const contactRequests = (contactResult.data ?? []) as unknown as ContactRow[];
  const individualRequests = (individualResult.data ?? []) as unknown as IndividualRow[];
  const inquiries = (inquiryResult.data ?? []) as InquiryRow[];

  // Dosyalı talepler için 1 saatlik imzalı indirme linkleri
  const signedUrls = new Map<string, string>();
  const filePaths = contactRequests.filter((request) => request.file_path).map((request) => request.file_path!);
  if (filePaths.length > 0) {
    const { data: signed } = await supabase.storage.from("request-files").createSignedUrls(filePaths, 3600);
    signed?.forEach((entry) => {
      if (entry.signedUrl && entry.path) signedUrls.set(entry.path, entry.signedUrl);
    });
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Talep Yönetimi</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Durum ve ilerleme notu güncellemeleri kullanıcının paneline anında yansır.
      </p>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      {/* Analiz / Tez */}
      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="font-display text-lg font-semibold">
          Analiz / Tez Talepleri
          {contactRequests.some((request) => request.status === "new") && (
            <span className="ml-2 rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-semibold">
              {contactRequests.filter((request) => request.status === "new").length} yeni
            </span>
          )}
        </h2>
        <div className="mt-3 space-y-3">
          {contactRequests.map((request) => (
            <details key={request.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm">
                <span className="font-semibold">{serviceTypeLabels[request.service_type]}</span>
                <span className="text-ink-soft">{request.profiles?.full_name || request.profiles?.email}</span>
                <span className="text-ink-soft">{new Date(request.created_at).toLocaleDateString("tr-TR")}</span>
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {contactStatusLabels[request.status]}
                </span>
              </summary>

              <div className="mt-4 rounded-lg bg-surface p-4 text-sm">
                <p className="font-semibold">
                  {request.profiles?.full_name} · {request.profiles?.email}
                  {request.profiles?.phone && ` · ${request.profiles.phone}`}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-ink-soft">{request.message}</p>
                {request.file_path && signedUrls.has(request.file_path) && (
                  <a
                    href={signedUrls.get(request.file_path)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                  >
                    <Download className="size-4" aria-hidden /> Ekli dosyayı indir
                  </a>
                )}
              </div>

              <form action={updateContactRequest} className="mt-4 space-y-4">
                <input type="hidden" name="request_id" value={request.id} />
                <div className="max-w-xs">
                  <SelectField label="Durum" name="status" defaultValue={request.status} options={contactStatusOptions} />
                </div>
                <TextArea label="Admin notu (kullanıcı görmez)" name="admin_notes" defaultValue={request.admin_notes} rows={2} />
                <SubmitButton>Kaydet</SubmitButton>
              </form>
            </details>
          ))}
          {contactRequests.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
              Henüz analiz/tez talebi yok.
            </p>
          )}
        </div>
      </section>

      {/* Bireysel eğitim */}
      <section aria-labelledby="individual-heading" className="mt-10">
        <h2 id="individual-heading" className="font-display text-lg font-semibold">
          Bireysel Eğitim Talepleri
          {individualRequests.some((request) => request.status === "received") && (
            <span className="ml-2 rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-semibold">
              {individualRequests.filter((request) => request.status === "received").length} yeni
            </span>
          )}
        </h2>
        <div className="mt-3 space-y-3">
          {individualRequests.map((request) => (
            <details key={request.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm">
                <span className="font-semibold">
                  {request.education_modules?.title}
                  {" · "}
                  {request.request_type === "bundle" && request.bundle_packages?.title
                    ? request.bundle_packages.title
                    : requestTypeLabels[request.request_type]}
                </span>
                <span className="text-ink-soft">{request.profiles?.full_name || request.profiles?.email}</span>
                {request.request_type !== "schedule" && (
                  <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-bold">
                    {request.calculated_price.toLocaleString("tr-TR")}₺
                  </span>
                )}
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {requestStatusLabels[request.status]}
                </span>
              </summary>

              <div className="mt-4 rounded-lg bg-surface p-4 text-sm">
                <p className="font-semibold">
                  {request.profiles?.full_name} · {request.profiles?.email}
                  {request.profiles?.phone && ` · ${request.profiles.phone}`}
                </p>
                <p className="mt-1 text-ink-soft">
                  {new Date(request.created_at).toLocaleDateString("tr-TR")}
                  {request.total_hours ? ` · ${request.total_hours} saat` : ""}
                </p>
                {request.user_message && (
                  <p className="mt-2 whitespace-pre-wrap text-ink-soft">
                    <span className="font-semibold text-ink">Kullanıcı mesajı: </span>
                    {request.user_message}
                  </p>
                )}
              </div>

              <form action={updateIndividualRequest} className="mt-4 space-y-4">
                <input type="hidden" name="request_id" value={request.id} />
                <div className="max-w-xs">
                  <SelectField label="Durum" name="status" defaultValue={request.status} options={requestStatusOptions} />
                </div>
                <TextArea
                  label="İlerleme notu (kullanıcı panelinde görünür)"
                  name="progress_note"
                  defaultValue={request.progress_note}
                  rows={2}
                />
                <TextArea label="Admin notu (kullanıcı görmez)" name="admin_notes" defaultValue={request.admin_notes} rows={2} />
                <SubmitButton>Kaydet</SubmitButton>
              </form>
            </details>
          ))}
          {individualRequests.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
              Henüz bireysel eğitim talebi yok.
            </p>
          )}
        </div>
      </section>

      {/* Bize Ulaşın mesajları (public form) */}
      <section aria-labelledby="inquiries-heading" className="mt-10">
        <h2 id="inquiries-heading" className="font-display text-lg font-semibold">
          Bize Ulaşın Mesajları
          {inquiries.some((inquiry) => inquiry.status === "new") && (
            <span className="ml-2 rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-semibold">
              {inquiries.filter((inquiry) => inquiry.status === "new").length} yeni
            </span>
          )}
        </h2>
        <div className="mt-3 space-y-3">
          {inquiries.map((inquiry) => (
            <details key={inquiry.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm">
                <span className="font-semibold">{inquiry.name}</span>
                <span className="text-ink-soft">{inquiry.email}</span>
                <span className="text-ink-soft">{new Date(inquiry.created_at).toLocaleDateString("tr-TR")}</span>
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {inquiryStatusLabels[inquiry.status]}
                </span>
              </summary>

              <div className="mt-4 rounded-lg bg-surface p-4 text-sm">
                <p className="whitespace-pre-wrap text-ink-soft">{inquiry.message}</p>
              </div>

              <form action={updateInquiry} className="mt-4 space-y-4">
                <input type="hidden" name="inquiry_id" value={inquiry.id} />
                <div className="max-w-xs">
                  <SelectField label="Durum" name="status" defaultValue={inquiry.status} options={inquiryStatusOptions} />
                </div>
                <TextArea label="Admin notu" name="admin_notes" defaultValue={inquiry.admin_notes} rows={2} />
                <SubmitButton>Kaydet</SubmitButton>
              </form>
            </details>
          ))}
          {inquiries.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
              Henüz iletişim mesajı yok.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
