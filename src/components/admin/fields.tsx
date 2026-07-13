// src/components/admin/fields.tsx — admin formları için ortak alan bileşenleri ve durum banner'ı
const inputClass =
  "mt-1 w-full min-h-11 rounded-lg border border-line bg-white px-3 py-2.5 text-sm transition-colors focus:border-accent";

interface BaseFieldProps {
  label: string;
  name: string;
  defaultValue?: string | number;
  required?: boolean;
}

export function TextInput({ label, name, defaultValue, required }: BaseFieldProps) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input id={id} name={name} type="text" defaultValue={defaultValue} required={required} className={inputClass} />
    </div>
  );
}

export function NumberInput({ label, name, defaultValue, required, min, step }: BaseFieldProps & { min?: number; step?: string }) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input id={id} name={name} type="number" defaultValue={defaultValue} required={required} min={min} step={step ?? "1"} className={inputClass} />
    </div>
  );
}

export function TextArea({ label, name, defaultValue, rows }: BaseFieldProps & { rows?: number }) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <textarea id={id} name={name} defaultValue={defaultValue} rows={rows ?? 3} className={inputClass} />
    </div>
  );
}

export function SelectField({ label, name, defaultValue, options }: BaseFieldProps & { options: { value: string; label: string }[] }) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <select id={id} name={name} defaultValue={defaultValue} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  const id = `field-${name}`;
  return (
    <label htmlFor={id} className="flex min-h-11 items-center gap-3 rounded-lg px-1 text-sm font-medium">
      <input id={id} name={name} type="checkbox" defaultChecked={defaultChecked} className="size-5 shrink-0 rounded border-line accent-[var(--color-accent)]" />
      {label}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="min-h-11 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
    >
      {children}
    </button>
  );
}

// ?saved / ?error parametrelerine göre işlem sonucunu sayfada gösterir
export function StatusBanner({ saved, error }: { saved?: string; error?: string }) {
  if (saved) {
    return (
      <p role="status" className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
        Değişiklikler kaydedildi.
      </p>
    );
  }
  if (!error) return null;

  const messages: Record<string, string> = {
    validation: "Form alanlarında hata var. Değerleri kontrol edip tekrar deneyin.",
    db: "Kaydetme sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
    full: "Sınıf kontenjanı dolu — onay verilemedi. Sınıf durumu 'Dolu' olarak işaretlendi.",
    already: "Bu sınıf için zaten bir katılım isteğin var.",
    notopen: "Bu sınıf şu anda kayda açık değil.",
    file_too_large: "Dosya 20MB sınırını aşıyor. Daha küçük bir dosya seçin.",
    invalid_type: "Bu dosya türü desteklenmiyor. PDF, Word, Excel, PowerPoint veya ZIP yükleyin.",
    upload_failed: "Dosya yüklenemedi. Bucket kurulumunu ve bağlantıyı kontrol edin.",
    bucket_missing: "Storage bucket bulunamadı. 0006_storage_buckets.sql migration'ını çalıştırın.",
    delete_failed: "Silme işlemi başarısız. Kayıt başka bir veriye bağlı olabilir.",
    self_delete: "Kendi hesabınızı silemezsiniz.",
    last_admin: "Son admin hesabı silinemez.",
    no_service_key: "SUPABASE_SECRET_KEY tanımlı değil — kullanıcı silme devre dışı.",
    not_found: "Kayıt bulunamadı.",
    syllabus_required: "Modülü aktif yapmak için en az bir haftalık müfredat ekleyin.",
  };
  return (
    <p role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {messages[error] ?? messages.db}
    </p>
  );
}
