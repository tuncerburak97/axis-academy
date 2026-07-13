// src/app/(admin)/admin/(dashboard)/siniflar/page.tsx — sınıf yönetimi:
// bekleyen katılım onayları, sınıf listesi (doluluk) ve yeni sınıf formu
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllModules } from "@/lib/queries/catalog";
import { approveEnrollment, createClass, rejectEnrollment, updateClassStatus } from "@/lib/actions/admin-classes";
import { classStatusLabels, categoryLabels } from "@/lib/types/catalog";
import type { ClassStatus } from "@/lib/types/catalog";
import { NumberInput, SelectField, StatusBanner, SubmitButton, TextInput } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Sınıf Yönetimi", robots: { index: false } };
export const dynamic = "force-dynamic";

interface PendingEnrollmentRow {
  id: string;
  created_at: string;
  classes: { title: string } | null;
  profiles: { full_name: string } | null;
}

interface ClassRow {
  id: string;
  title: string;
  start_date: string;
  duration_hours: number;
  capacity: number;
  status: ClassStatus;
  education_modules: { title: string } | null;
  class_enrollments: { status: string }[];
}

const statusOptions = Object.entries(classStatusLabels).map(([value, label]) => ({ value, label }));

export default async function ClassManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();

  const [modules, pendingResult, classesResult] = await Promise.all([
    getAllModules(),
    supabase
      .from("class_enrollments")
      .select("id, created_at, classes(title), profiles(full_name)")
      .eq("status", "pending")
      .order("created_at"),
    supabase
      .from("classes")
      .select("id, title, start_date, duration_hours, capacity, status, education_modules(title), class_enrollments(status)")
      .order("start_date", { ascending: false }),
  ]);

  const pendingEnrollments = (pendingResult.data ?? []) as unknown as PendingEnrollmentRow[];
  const classes = (classesResult.data ?? []) as unknown as ClassRow[];
  const moduleOptions = modules.map((mod) => ({
    value: mod.id,
    label: `${categoryLabels[mod.category]} — ${mod.title}`,
  }));

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Sınıf Yönetimi</h1>
      <p className="mt-1 text-sm text-ink-soft">Sınıflar, doluluk takibi ve katılım onayları.</p>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      {/* Bekleyen katılım onayları */}
      <section aria-labelledby="pending-heading">
        <h2 id="pending-heading" className="font-display text-lg font-semibold">
          Bekleyen Katılım Onayları
          {pendingEnrollments.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-semibold">
              {pendingEnrollments.length}
            </span>
          )}
        </h2>
        <div className="mt-4 space-y-3">
          {pendingEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-sm">
                <p className="font-semibold">{enrollment.profiles?.full_name || "İsimsiz kullanıcı"}</p>
                <p className="break-words text-ink-soft">
                  {enrollment.classes?.title} · {new Date(enrollment.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <form action={approveEnrollment} className="w-full sm:w-auto">
                  <input type="hidden" name="enrollment_id" value={enrollment.id} />
                  <button type="submit" className="min-h-11 w-full rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto">
                    Onayla
                  </button>
                </form>
                <form action={rejectEnrollment} className="w-full sm:w-auto">
                  <input type="hidden" name="enrollment_id" value={enrollment.id} />
                  <button type="submit" className="min-h-11 w-full rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 sm:w-auto">
                    Reddet
                  </button>
                </form>
              </div>
            </div>
          ))}
          {pendingEnrollments.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
              Bekleyen katılım isteği yok.
            </p>
          )}
        </div>
      </section>

      {/* Sınıf listesi */}
      <section aria-labelledby="classes-heading" className="mt-10">
        <h2 id="classes-heading" className="font-display text-lg font-semibold">Sınıflar</h2>
        <div className="mt-4 space-y-3">
          {classes.map((trainingClass) => {
            const approvedCount = trainingClass.class_enrollments.filter(
              (enrollment) => !["pending", "cancelled"].includes(enrollment.status),
            ).length;
            return (
              <details key={trainingClass.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-3 text-sm">
                  <span className="min-w-0 font-semibold">{trainingClass.title}</span>
                  <span className="min-w-0 break-words text-ink-soft">{trainingClass.education_modules?.title}</span>
                  <span className="text-ink-soft">{new Date(trainingClass.start_date).toLocaleDateString("tr-TR")}</span>
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                    {approvedCount}/{trainingClass.capacity} kişi
                  </span>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
                    {classStatusLabels[trainingClass.status]}
                  </span>
                </summary>
                <form action={updateClassStatus} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <input type="hidden" name="class_id" value={trainingClass.id} />
                  <div className="w-full sm:w-48">
                    <SelectField label="Durum" name="status" defaultValue={trainingClass.status} options={statusOptions} />
                  </div>
                  <SubmitButton>Durumu Güncelle</SubmitButton>
                </form>
                <a
                  href={`/admin/siniflar/${trainingClass.id}`}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline"
                >
                  İçerik ve Doküman Yönetimi →
                </a>
              </details>
            );
          })}
          {classes.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
              Henüz sınıf yok. Aşağıdaki formla ilk sınıfı oluştur.
            </p>
          )}
        </div>
      </section>

      {/* Yeni sınıf */}
      <section aria-labelledby="new-class-heading" className="mt-10 max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h2 id="new-class-heading" className="font-display text-lg font-semibold">Yeni Sınıf</h2>
        <form action={createClass} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Modül" name="module_id" options={moduleOptions} />
            <TextInput label="Sınıf adı" name="title" required />
          </div>
          <TextInput label="Açıklama" name="description" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="field-start_date" className="block text-sm font-medium">Başlangıç tarihi</label>
              <input
                id="field-start_date"
                name="start_date"
                type="date"
                required
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm transition-colors focus:border-accent"
              />
            </div>
            <TextInput label="Program notu (örn. Salı-Perşembe 20:00)" name="schedule_note" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput label="Süre (saat)" name="duration_hours" min={1} required />
            <NumberInput label="Kontenjan" name="capacity" min={1} required />
          </div>
          <SubmitButton>Sınıf Oluştur</SubmitButton>
        </form>
      </section>
    </>
  );
}
