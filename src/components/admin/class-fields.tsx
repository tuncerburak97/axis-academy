// src/components/admin/class-fields.tsx — sınıf oluşturma form alanları
import { NumberInput, SelectField, TextInput } from "@/components/admin/fields";

interface ClassFieldsProps {
  moduleOptions: { value: string; label: string }[];
}

export function CreateClassFields({ moduleOptions }: ClassFieldsProps) {
  return (
    <>
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
            className="mt-1 w-full min-h-11 rounded-lg border border-line bg-white px-3 py-2.5 text-sm transition-colors focus:border-accent"
          />
        </div>
        <TextInput label="Program notu (örn. Salı-Perşembe 20:00)" name="schedule_note" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput label="Süre (saat)" name="duration_hours" min={1} required />
        <NumberInput label="Kontenjan" name="capacity" min={1} required />
      </div>
    </>
  );
}
