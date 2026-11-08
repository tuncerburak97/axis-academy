// src/components/admin/cohorts/cohort-fields.tsx — dönem formunun tüm alanları (oluşturma ve düzenleme ortak)
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { cohortStatusLabels, type CohortRow } from "@/lib/types/platform";

interface CohortFieldsProps {
  programs: { id: string; title: string; is_active?: boolean }[];
  instructors: { user_id: string; name: string; role: string }[];
  cohort?: CohortRow;
  /** Düzenleme modunda durum ve güncel hafta da sorulur */
  withStatus?: boolean;
  prefix?: string;
}

export function CohortFields({ programs, instructors, cohort, withStatus, prefix = "cohort" }: CohortFieldsProps) {
  const id = (name: string) => `${prefix}-${name}`;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id("module")} label="Program">
          <Select name="module_id" required defaultValue={cohort?.module_id ?? ""}>
            <option value="" disabled>
              Program seç
            </option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
                {program.is_active === false ? " (pasif)" : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field id={id("title")} label="Dönem adı" hint="Ör. Excel ile Veri Ustalığı · Kasım">
          <Input name="title" required minLength={2} maxLength={120} defaultValue={cohort?.title ?? ""} />
        </Field>
      </div>
      <Field id={id("description")} label="Kısa açıklama" optional hint="Dönem kartında görünür.">
        <Textarea name="description" rows={2} maxLength={1000} defaultValue={cohort?.description ?? ""} />
      </Field>
      <Field id={id("overview")} label="Genel bakış" optional hint="Kayıtlı öğrencilerin eğitim sayfasında görünür. Markdown desteklenir.">
        <Textarea name="overview" rows={4} maxLength={5000} defaultValue={cohort?.overview ?? ""} />
      </Field>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field id={id("start")} label="Başlangıç" className="col-span-2 sm:col-span-1">
          <Input name="start_date" type="date" required defaultValue={cohort?.start_date ?? ""} />
        </Field>
        <Field id={id("weeks")} label="Hafta">
          <Input name="duration_weeks" type="number" min={0} max={104} required defaultValue={cohort?.duration_weeks ?? 4} className="tabular font-mono" />
        </Field>
        <Field id={id("hours")} label="Toplam saat">
          <Input name="duration_hours" type="number" min={1} required defaultValue={cohort?.duration_hours ?? 12} className="tabular font-mono" />
        </Field>
        <Field id={id("capacity")} label="Kontenjan">
          <Input name="capacity" type="number" min={1} max={500} required defaultValue={cohort?.capacity ?? 15} className="tabular font-mono" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id("schedule")} label="Program notu" optional hint="Ör. Salı-Perşembe 19:00–21:00">
          <Input name="schedule_note" maxLength={200} defaultValue={cohort?.schedule_note ?? ""} />
        </Field>
        <Field id={id("price")} label="Fiyat (₺)" optional hint="Bilgi amaçlı; ödeme platformda alınmaz.">
          <Input name="price" type="number" min={0} step="1" defaultValue={cohort?.price ?? ""} className="tabular font-mono" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id("location")} label="Yer">
          <Input name="location" maxLength={200} defaultValue={cohort?.location ?? "Online"} />
        </Field>
        <Field id={id("meeting")} label="Toplantı linki" optional hint="Yalnızca kayıtlılara gösterilir.">
          <Input name="meeting_url" type="url" maxLength={500} placeholder="https://" defaultValue={cohort?.meeting_url ?? ""} />
        </Field>
      </div>
      <Field id={id("instructor")} label="Eğitmen" optional hint="Eğitmen rolündeki kişiler dönemin oturum ve materyallerini yönetebilir.">
        <Select name="instructor_id" defaultValue={cohort?.instructor_id ?? ""}>
          <option value="">Atanmamış</option>
          {instructors.map((person) => (
            <option key={person.user_id} value={person.user_id}>
              {person.name}
              {person.role === "admin" ? " (admin)" : ""}
            </option>
          ))}
        </Select>
      </Field>
      {withStatus && cohort && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={id("status")} label="Durum" hint="Dolu/açık durumu kontenjana göre kendiliğinden de değişir.">
            <Select name="status" defaultValue={cohort.status}>
              {Object.entries(cohortStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id={id("override")} label="Güncel hafta" optional hint="Boşsa başlangıç tarihinden hesaplanır.">
            <Input
              name="current_week_override"
              type="number"
              min={1}
              max={104}
              defaultValue={cohort.current_week_override ?? ""}
              className="tabular font-mono"
            />
          </Field>
        </div>
      )}
    </div>
  );
}
