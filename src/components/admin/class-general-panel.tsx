// src/components/admin/class-general-panel.tsx — sınıf genel bilgiler + durum
import { updateClassDetails, updateClassStatus } from "@/lib/actions/admin-classes";
import { buildClassProgress, computeAutoWeek } from "@/lib/syllabus";
import { classStatusLabels } from "@/lib/types/catalog";
import type { ClassStatus } from "@/lib/types/catalog";
import { NumberInput, SelectField, SubmitButton, TextArea } from "@/components/admin/fields";

interface ClassGeneralPanelProps {
  trainingClass: {
    id: string;
    title: string;
    start_date: string;
    schedule_note: string;
    duration_hours: number;
    capacity: number;
    status: ClassStatus;
    duration_weeks: number;
    current_week_override: number | null;
    overview: string;
    education_modules: { title: string } | null;
  };
  approvedCount: number;
}

const statusOptions = Object.entries(classStatusLabels).map(([value, label]) => ({ value, label }));

export function ClassGeneralPanel({ trainingClass, approvedCount }: ClassGeneralPanelProps) {
  const autoWeek = computeAutoWeek(trainingClass.start_date);
  const progress = buildClassProgress(
    trainingClass.start_date,
    trainingClass.duration_weeks,
    trainingClass.current_week_override,
  );

  return (
    <div className="space-y-8">
      <dl className="grid gap-4 rounded-xl border border-line bg-surface p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-soft">Modül</dt>
          <dd className="font-semibold">{trainingClass.education_modules?.title}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Başlangıç</dt>
          <dd className="font-semibold">
            {new Date(trainingClass.start_date).toLocaleDateString("tr-TR")}
            {trainingClass.schedule_note && ` · ${trainingClass.schedule_note}`}
          </dd>
        </div>
        <div>
          <dt className="text-ink-soft">Süre</dt>
          <dd className="font-semibold">{trainingClass.duration_hours} saat</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Kontenjan</dt>
          <dd className="font-semibold">{approvedCount} / {trainingClass.capacity} dolu</dd>
        </div>
      </dl>

      <section className="max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold">Durum</h3>
        <form action={updateClassStatus} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="class_id" value={trainingClass.id} />
          <div className="w-full sm:w-48">
            <SelectField label="Sınıf durumu" name="status" defaultValue={trainingClass.status} options={statusOptions} />
          </div>
          <SubmitButton>Durumu Güncelle</SubmitButton>
        </form>
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold">İlerleme ve içerik</h3>
        <form action={updateClassDetails} className="mt-4 space-y-4">
          <input type="hidden" name="class_id" value={trainingClass.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput label="Süre (hafta)" name="duration_weeks" defaultValue={trainingClass.duration_weeks} min={0} />
            <NumberInput
              label="Güncel hafta override (boş = otomatik)"
              name="current_week_override"
              defaultValue={trainingClass.current_week_override ?? undefined}
              min={1}
            />
          </div>
          <p className="rounded-lg bg-surface px-3 py-2 text-xs text-ink-soft">
            Otomatik hafta: <strong>{autoWeek}</strong> · Öğrenci paneli:{" "}
            <strong>Hafta {progress.effectiveWeek}</strong>
            {progress.isManualOverride && " (manuel override)"}
          </p>
          <TextArea
            label="Genel içerik / tanıtım (Markdown)"
            name="overview"
            defaultValue={trainingClass.overview}
            rows={5}
          />
          <SubmitButton>Kaydet</SubmitButton>
        </form>
      </section>
    </div>
  );
}
