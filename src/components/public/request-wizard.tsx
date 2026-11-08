// src/components/public/request-wizard.tsx — çok adımlı talep sihirbazı (analiz, tez, kurumsal, birebir)
// Adım adım doğrulama, tarayıcıda taslak (localStorage), son adımda giriş kontrolü ve sunucu aksiyonuyla gönderim.
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, FileUp, LogIn, Paperclip, Pencil, X } from "lucide-react";
import { createRequest, type CreateRequestState } from "@/lib/actions/requests";
import { checkDiscountCode } from "@/lib/actions/enroll";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceCard, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/data";
import { toast } from "@/components/ui/toast";
import { analysisMethodLabels, trainingModeLabels } from "@/lib/types/platform";
import { applyDiscount, formatBytes, formatDate, formatTRY } from "@/lib/format";
import type { WizardProgram } from "@/lib/queries/public-catalog";
import { cn } from "@/lib/utils";

export type WizardKind = "analiz" | "tez" | "kurumsal" | "birebir";

interface Draft {
  method?: "bibliometric" | "statistical" | "both";
  database?: string;
  software?: string;
  sample?: string;
  topic?: string;
  field?: string;
  deadline?: string;
  message?: string;
  degree?: string;
  institute?: string;
  pages?: string;
  style?: string;
  needs?: string[];
  company?: string;
  headcount?: string;
  programs?: string[];
  format?: string;
  dates?: string;
  program?: string;
  mode?: "bundle" | "custom" | "schedule";
  bundleId?: string;
  topicIds?: string[];
  preferredDays?: string[];
  discountCode?: string;
  discountPercent?: number | null;
}

type Errors = Partial<Record<keyof Draft | "file", string>>;

interface StepDef {
  id: string;
  title: string;
  validate?: (draft: Draft) => Errors;
}

const MAX_FILE = 20 * 1024 * 1024;
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

const databases = ["Scopus", "Web of Science", "Scopus + Web of Science", "PubMed", "TR Dizin", "Diğer"];
const softwares = ["SPSS", "R", "AMOS", "Jamovi", "Stata", "Python", "Excel", "Fark etmez"];
const degrees = ["Yüksek lisans", "Doktora", "Lisans", "Diğer"];
const styles = ["APA 7", "APA 6", "IEEE", "Chicago", "Vancouver", "Harvard", "MLA", "Enstitü stili", "Emin değilim"];
const thesisNeeds = [
  "Sayfa düzeni ve biçim",
  "İçindekiler, tablo ve şekil listeleri",
  "Kaynakça ve metin içi atıflar",
  "Tablo ve şekil numaralandırma",
  "Enstitü şablonuna aktarma",
  "Teslim öncesi son kontrol",
];
const formats = [
  { value: "Online", hint: "Canlı online dersler" },
  { value: "Yerinde", hint: "Ofisinizde, yüz yüze" },
  { value: "Karma", hint: "İkisinin birleşimi" },
];
const weekDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const dayParts = ["Sabah", "Öğleden sonra", "Akşam"];

const kindNames: Record<WizardKind, string> = { analiz: "Analiz", tez: "Tez düzenleme", kurumsal: "Kurumsal eğitim", birebir: "Birebir ders" };

function stepsFor(kind: WizardKind, programs: WizardProgram[]): StepDef[] {
  const review: StepDef = { id: "ozet", title: "Gözden geçir ve gönder" };
  const file: StepDef = { id: "dosya", title: "Dosya ekle" };
  switch (kind) {
    case "analiz":
      return [
        { id: "yontem", title: "Analiz türü", validate: (d) => (d.method ? {} : { method: "Analiz türünü seç." }) },
        {
          id: "detay",
          title: "Ayrıntılar",
          validate: (d) => {
            const errors: Errors = {};
            if (!d.topic || d.topic.trim().length < 3) errors.topic = "Konunu birkaç kelimeyle yaz.";
            if ((d.method === "bibliometric" || d.method === "both") && !d.database) errors.database = "Veri tabanını seç.";
            return errors;
          },
        },
        {
          id: "takvim",
          title: "Takvim ve mesaj",
          validate: (d) => {
            const errors: Errors = {};
            if (!d.message || d.message.trim().length < 10) errors.message = "İhtiyacını en az 10 karakterle anlat.";
            if (d.deadline && d.deadline < today()) errors.deadline = "Geçmiş bir tarih seçtin.";
            return errors;
          },
        },
        file,
        review,
      ];
    case "tez":
      return [
        {
          id: "tez",
          title: "Tez bilgileri",
          validate: (d) => {
            const errors: Errors = {};
            if (!d.degree) errors.degree = "Dereceni seç.";
            if (!d.institute || d.institute.trim().length < 2) errors.institute = "Enstitü ya da üniversite adını yaz.";
            const pages = Number(d.pages);
            if (!d.pages || !Number.isInteger(pages) || pages < 1) errors.pages = "Sayfa sayısını rakamla yaz.";
            else if (pages > 2000) errors.pages = "Sayfa sayısı çok yüksek görünüyor.";
            if (!d.style) errors.style = "Kaynakça stilini seç.";
            if (d.deadline && d.deadline < today()) errors.deadline = "Geçmiş bir tarih seçtin.";
            return errors;
          },
        },
        { id: "ihtiyac", title: "Ne gerekiyor?", validate: (d) => (d.needs?.length ? {} : { needs: "En az bir ihtiyaç işaretle." }) },
        file,
        review,
      ];
    case "kurumsal":
      return [
        {
          id: "kurum",
          title: "Ekip ve program",
          validate: (d) => {
            const errors: Errors = {};
            if (!d.company || d.company.trim().length < 2) errors.company = "Kurum adını yaz.";
            const headcount = Number(d.headcount);
            if (!d.headcount || !Number.isInteger(headcount) || headcount < 1) errors.headcount = "Katılımcı sayısını rakamla yaz.";
            if (!d.programs?.length) errors.programs = "En az bir program seç.";
            if (!d.format) errors.format = "Eğitim şeklini seç.";
            return errors;
          },
        },
        { id: "mesaj", title: "Mesajın" },
        review,
      ];
    case "birebir":
      return [
        { id: "program", title: "Program", validate: (d) => (d.program && programs.some((p) => p.slug === d.program) ? {} : { program: "Bir program seç." }) },
        {
          id: "sekil",
          title: "Nasıl çalışalım?",
          validate: (d) => {
            if (!d.mode) return { mode: "Bir seçenek işaretle." };
            if (d.mode === "bundle" && !d.bundleId) return { bundleId: "Bir paket seç." };
            if (d.mode === "custom" && !d.topicIds?.length) return { topicIds: "En az bir konu seç." };
            return {};
          },
        },
        { id: "zaman", title: "Zaman ve mesaj" },
        {
          id: "indirim",
          title: "İndirim kodu",
          validate: (d) => (d.discountCode && !d.discountPercent ? { discountCode: "Kodu uygula ya da alanı boş bırak." } : {}),
        },
        review,
      ];
  }
}

function storageKey(kind: WizardKind) {
  return `axis:teklif:${kind}`;
}

interface StoredDraft {
  draft: Draft;
  step: number;
}

function readStored(kind: WizardKind): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(storageKey(kind));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    return parsed && typeof parsed === "object" && parsed.draft ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(kind: WizardKind, value: StoredDraft | null) {
  try {
    if (value) window.localStorage.setItem(storageKey(kind), JSON.stringify(value));
    else window.localStorage.removeItem(storageKey(kind));
  } catch {
    // Gizli sekme ya da depolama kapalı: taslak yalnızca bu oturumda yaşar
  }
}

/** Birebir için sunucuyla aynı mantıkta fiyat tahmini (gösterim amaçlı; kesin hesap sunucuda) */
function estimate(draft: Draft, programs: WizardProgram[]) {
  const program = programs.find((p) => p.slug === draft.program);
  if (!program || !draft.mode) return null;
  if (draft.mode === "bundle") {
    const bundle = program.bundles.find((b) => b.id === draft.bundleId);
    return bundle ? { hours: bundle.duration_hours, price: Number(bundle.fixed_price) } : null;
  }
  if (draft.mode === "custom") {
    const hours = program.topics.filter((t) => draft.topicIds?.includes(t.id)).reduce((sum, t) => sum + t.estimated_hours, 0);
    if (!hours) return null;
    return { hours, price: program.hourlyPrice ? Number(program.hourlyPrice) * hours : null };
  }
  return null;
}

export function RequestWizard({
  kind,
  loggedIn,
  userName,
  programs,
  programOptions,
  prefill,
  className,
}: {
  kind: WizardKind;
  loggedIn: boolean;
  userName: string | null;
  programs: WizardProgram[];
  programOptions: { slug: string; title: string; category: string }[];
  prefill: { program?: string; bundleId?: string; mode?: "bundle" | "custom" | "schedule" };
  className?: string;
}) {
  const router = useRouter();
  const steps = React.useMemo(() => stepsFor(kind, programs), [kind, programs]);

  const initialDraft = React.useMemo<Draft>(() => {
    const draft: Draft = {};
    if (kind === "birebir" && prefill.program && programs.some((p) => p.slug === prefill.program)) {
      draft.program = prefill.program;
      const program = programs.find((p) => p.slug === prefill.program)!;
      if (prefill.bundleId && program.bundles.some((b) => b.id === prefill.bundleId)) {
        draft.mode = "bundle";
        draft.bundleId = prefill.bundleId;
      } else if (prefill.mode) {
        draft.mode = prefill.mode;
      }
    }
    if (kind === "kurumsal" && prefill.program) {
      const option = programOptions.find((p) => p.slug === prefill.program);
      if (option) draft.programs = [option.title];
    }
    return draft;
  }, [kind, prefill, programs, programOptions]);

  const [draft, setDraft] = React.useState<Draft>(initialDraft);
  const [step, setStep] = React.useState(0);
  const [errors, setErrors] = React.useState<Errors>({});
  const [file, setFile] = React.useState<File | null>(null);
  const [restored, setRestored] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const firstRender = React.useRef(true);

  // Taslağı geri yükle; URL'deki ön seçim taslağın üzerine yazılır
  React.useEffect(() => {
    const stored = readStored(kind);
    if (stored) {
      const prefillWins = Object.keys(initialDraft).length > 0;
      const merged = { ...stored.draft, ...(prefillWins ? initialDraft : {}) };
      if (prefillWins && initialDraft.program && stored.draft.program !== initialDraft.program) {
        merged.bundleId = initialDraft.bundleId;
        merged.topicIds = [];
      }
      setDraft(merged);
      setStep(Math.min(Math.max(0, stored.step), steps.length - 1));
      setRestored(Object.values(stored.draft).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value))));
    } else if (initialDraft.program && (initialDraft.bundleId || initialDraft.mode)) {
      // Program sayfasından paket/özel seçimle gelindiyse doğrudan ilgili adıma geç
      setStep(1);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    writeStored(kind, { draft, step });
  }, [draft, step, kind, hydrated]);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  const toggle = (key: "needs" | "programs" | "topicIds" | "preferredDays", value: string) => {
    const list = draft[key] ?? [];
    update(key, list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const current = steps[step];
  const isReview = current.id === "ozet";

  const goNext = () => {
    const stepErrors = current.validate?.(draft) ?? {};
    if (Object.values(stepErrors).some(Boolean)) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const goTo = (index: number) => {
    setErrors({});
    setStep(index);
  };

  const resetDraft = () => {
    writeStored(kind, null);
    setDraft(initialDraft);
    setFile(null);
    setStep(0);
    setRestored(false);
  };

  // Gönderim
  const [state, submitAction, pending] = React.useActionState<CreateRequestState, FormData>(createRequest, {});
  React.useEffect(() => {
    if (state.requestId) {
      writeStored(kind, null);
      if (state.warning) toast.warning("Talebin alındı", { description: state.warning });
      else toast.success("Talebin alındı", { description: "Teklifin hazır olunca e-posta ve bildirimle haber vereceğiz." });
      router.push(`/panel/talepler/${state.requestId}`);
    }
  }, [state, kind, router]);

  const submit = () => {
    for (let index = 0; index < steps.length; index++) {
      const stepErrors = steps[index].validate?.(draft) ?? {};
      if (Object.values(stepErrors).some(Boolean)) {
        setErrors(stepErrors);
        setStep(index);
        return;
      }
    }
    const formData = new FormData();
    formData.set("payload", JSON.stringify({ ...draft, kind }));
    if (file) formData.set("file", file);
    React.startTransition(() => submitAction(formData));
  };

  const nextParam = `/teklif/${kind}`;
  const priceEstimate = kind === "birebir" ? estimate(draft, programs) : null;
  const selectedProgram = programs.find((p) => p.slug === draft.program) ?? null;

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start", className)}>
      <section aria-labelledby="wizard-step-title" className="scroll-mt-24">
        <Card padding="none" className="overflow-hidden">
          {/* İlerleme */}
          <div className="border-b border-line px-5 py-4 sm:px-7">
            <div className="flex items-center justify-between gap-3 text-xs">
              <p className="font-semibold text-ink-soft">
                Adım <span className="tabular font-mono text-ink">{step + 1}</span>
                <span className="tabular font-mono">/{steps.length}</span>
              </p>
              {hydrated && (
                <p className="inline-flex items-center gap-1.5 text-ink-soft" aria-live="polite">
                  <Check className="size-3.5 text-success" aria-hidden /> Taslak bu cihazda saklanıyor
                </p>
              )}
            </div>
            <ol className="mt-3 flex gap-1.5" aria-label="Adımlar">
              {steps.map((item, index) => (
                <li key={item.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => index < step && goTo(index)}
                    disabled={index >= step}
                    aria-current={index === step ? "step" : undefined}
                    aria-label={`${index + 1}. adım: ${item.title}${index < step ? " (tamamlandı, düzenlemek için seç)" : ""}`}
                    className={cn(
                      "block h-1.5 w-full rounded-full transition-colors disabled:cursor-default",
                      index < step ? "bg-accent hover:bg-accent-strong" : index === step ? "bg-amber" : "bg-line",
                    )}
                  />
                </li>
              ))}
            </ol>
          </div>

          <div className="px-5 py-6 sm:px-7 sm:py-8">
            {restored && step === 0 && (
              <Alert
                tone="info"
                className="mb-6"
                action={
                  <Button type="button" size="sm" variant="ghost" onClick={resetDraft}>
                    Baştan başla
                  </Button>
                }
              >
                Kaldığın yerden devam ediyorsun.
              </Alert>
            )}
            <h2 id="wizard-step-title" ref={headingRef} tabIndex={-1} className="text-xl font-semibold tracking-tight focus:outline-none sm:text-2xl">
              {current.title}
            </h2>

            <div className="mt-6 flex flex-col gap-5">
              {kind === "analiz" && current.id === "yontem" && (
                <fieldset className="flex flex-col gap-2.5">
                  <legend className="sr-only">Analiz türü</legend>
                  {(
                    [
                      ["bibliometric", "Literatürdeki yayınları, yazarları ve temaları haritalamak için."],
                      ["statistical", "Anket ya da ölçüm verindeki ilişkileri test etmek için."],
                      ["both", "Literatür haritası ve veri analizi birlikte."],
                    ] as const
                  ).map(([value, hint]) => (
                    <ChoiceCard
                      key={value}
                      name="method"
                      value={value}
                      checked={draft.method === value}
                      onChange={() => update("method", value)}
                      title={analysisMethodLabels[value]}
                      description={hint}
                    />
                  ))}
                  <FieldError message={errors.method} />
                </fieldset>
              )}

              {kind === "analiz" && current.id === "detay" && (
                <>
                  {(draft.method === "bibliometric" || draft.method === "both") && (
                    <Field id="w-database" label="Veri tabanı" error={errors.database}>
                      <Select value={draft.database ?? ""} onChange={(e) => update("database", e.target.value)}>
                        <option value="">Seç</option>
                        {databases.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </Select>
                    </Field>
                  )}
                  {(draft.method === "statistical" || draft.method === "both") && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="w-software" label="Tercih ettiğin program" optional>
                        <Select value={draft.software ?? ""} onChange={(e) => update("software", e.target.value)}>
                          <option value="">Fark etmez</option>
                          {softwares.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field id="w-sample" label="Örneklem büyüklüğü" optional hint="Yaklaşık kişi ya da gözlem sayısı">
                        <Input inputMode="numeric" value={draft.sample ?? ""} onChange={(e) => update("sample", e.target.value)} placeholder="412" className="tabular font-mono" />
                      </Field>
                    </div>
                  )}
                  <Field id="w-topic" label="Konu" error={errors.topic} hint="Örn. Dijital sağlık okuryazarlığı">
                    <Input value={draft.topic ?? ""} onChange={(e) => update("topic", e.target.value)} maxLength={200} />
                  </Field>
                  <Field id="w-field" label="Çalışma alanı" optional hint="Bölüm ya da disiplin">
                    <Input value={draft.field ?? ""} onChange={(e) => update("field", e.target.value)} maxLength={120} placeholder="Hemşirelik, işletme, eğitim bilimleri…" />
                  </Field>
                </>
              )}

              {(kind === "analiz" && current.id === "takvim") && (
                <>
                  <Field id="w-deadline" label="İstediğin teslim tarihi" optional error={errors.deadline} hint="Danışman ya da dergi takvimin varsa seç.">
                    <Input type="date" min={today()} value={draft.deadline ?? ""} onChange={(e) => update("deadline", e.target.value)} className="tabular font-mono sm:max-w-56" />
                  </Field>
                  <Field id="w-message" label="Ne istediğini anlat" error={errors.message} hint="Hipotezlerin, istediğin analizler ya da danışmanının notları.">
                    <Textarea rows={6} value={draft.message ?? ""} onChange={(e) => update("message", e.target.value)} maxLength={5000} />
                  </Field>
                </>
              )}

              {kind === "tez" && current.id === "tez" && (
                <>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">Derece</legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {degrees.map((degree) => (
                        <ChoiceCard key={degree} name="degree" value={degree} checked={draft.degree === degree} onChange={() => update("degree", degree)} title={degree} className="p-3" />
                      ))}
                    </div>
                    <FieldError message={errors.degree} />
                  </fieldset>
                  <Field id="w-institute" label="Enstitü ve üniversite" error={errors.institute}>
                    <Input value={draft.institute ?? ""} onChange={(e) => update("institute", e.target.value)} maxLength={160} placeholder="Sağlık Bilimleri Enstitüsü, … Üniversitesi" />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="w-pages" label="Sayfa sayısı" error={errors.pages} hint="Yaklaşık değer yeterli">
                      <Input inputMode="numeric" value={draft.pages ?? ""} onChange={(e) => update("pages", e.target.value.replace(/\D/g, ""))} placeholder="140" className="tabular font-mono" />
                    </Field>
                    <Field id="w-style" label="Kaynakça stili" error={errors.style}>
                      <Select value={draft.style ?? ""} onChange={(e) => update("style", e.target.value)}>
                        <option value="">Seç</option>
                        {styles.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field id="w-deadline" label="Enstitüye teslim tarihi" optional error={errors.deadline}>
                    <Input type="date" min={today()} value={draft.deadline ?? ""} onChange={(e) => update("deadline", e.target.value)} className="tabular font-mono sm:max-w-56" />
                  </Field>
                </>
              )}

              {kind === "tez" && current.id === "ihtiyac" && (
                <>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">Neye ihtiyacın var?</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {thesisNeeds.map((need) => (
                        <ChoiceCard key={need} type="checkbox" name="needs" value={need} checked={draft.needs?.includes(need) ?? false} onChange={() => toggle("needs", need)} title={need} className="p-3.5" />
                      ))}
                    </div>
                    <FieldError message={errors.needs} />
                  </fieldset>
                  <Field id="w-message" label="Eklemek istediklerin" optional hint="Danışmanının ya da enstitünün geri bildirimleri, özel durumlar.">
                    <Textarea rows={5} value={draft.message ?? ""} onChange={(e) => update("message", e.target.value)} maxLength={5000} />
                  </Field>
                </>
              )}

              {kind === "kurumsal" && current.id === "kurum" && (
                <>
                  <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_160px]">
                    <Field id="w-company" label="Kurum" error={errors.company}>
                      <Input value={draft.company ?? ""} onChange={(e) => update("company", e.target.value)} maxLength={160} autoComplete="organization" />
                    </Field>
                    <Field id="w-headcount" label="Katılımcı sayısı" error={errors.headcount}>
                      <Input inputMode="numeric" value={draft.headcount ?? ""} onChange={(e) => update("headcount", e.target.value.replace(/\D/g, ""))} placeholder="18" className="tabular font-mono" />
                    </Field>
                  </div>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">Programlar</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[...programOptions.map((option) => option.title), "Henüz emin değilim"].map((title) => (
                        <ChoiceCard key={title} type="checkbox" name="programs" value={title} checked={draft.programs?.includes(title) ?? false} onChange={() => toggle("programs", title)} title={title} className="p-3.5" />
                      ))}
                    </div>
                    <FieldError message={errors.programs} />
                  </fieldset>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">Eğitim şekli</legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {formats.map((format) => (
                        <ChoiceCard key={format.value} name="format" value={format.value} checked={draft.format === format.value} onChange={() => update("format", format.value)} title={format.value} description={format.hint} className="p-3.5" />
                      ))}
                    </div>
                    <FieldError message={errors.format} />
                  </fieldset>
                  <Field id="w-dates" label="Tercih ettiğiniz tarihler" optional hint="Örn. Ocak ikinci yarısı, hafta içi öğleden sonra">
                    <Input value={draft.dates ?? ""} onChange={(e) => update("dates", e.target.value)} maxLength={200} />
                  </Field>
                </>
              )}

              {kind === "kurumsal" && current.id === "mesaj" && (
                <Field id="w-message" label="Ekibinizden ve beklentinizden bahsedin" optional hint="Ekibin seviyesi, kullandığınız dosyalar, özel hedefler.">
                  <Textarea rows={7} value={draft.message ?? ""} onChange={(e) => update("message", e.target.value)} maxLength={5000} />
                </Field>
              )}

              {kind === "birebir" && current.id === "program" && (
                <fieldset className="flex flex-col gap-2.5">
                  <legend className="sr-only">Program</legend>
                  {programs.map((program) => (
                    <ChoiceCard
                      key={program.slug}
                      name="program"
                      value={program.slug}
                      checked={draft.program === program.slug}
                      onChange={() => {
                        setDraft((current) => ({ ...current, program: program.slug, bundleId: undefined, topicIds: [] }));
                        setErrors({});
                      }}
                      title={program.title}
                      meta={program.hourlyPrice ? `${formatTRY(program.hourlyPrice)} / saat` : undefined}
                      description={`${program.bundles.length} hazır paket · ${program.topics.length} konu`}
                    />
                  ))}
                  <FieldError message={errors.program} />
                </fieldset>
              )}

              {kind === "birebir" && current.id === "sekil" && selectedProgram && (
                <>
                  <fieldset className="grid gap-2.5 sm:grid-cols-3">
                    <legend className="sr-only">Çalışma şekli</legend>
                    {(
                      [
                        ["bundle", "Müfredatı ve fiyatı belli paketler.", selectedProgram.bundles.length > 0],
                        ["custom", "Konuları sen seç, saat ve fiyat hesaplansın.", selectedProgram.topics.length > 0],
                        ["schedule", "Programın tamamı, senin takvimine göre.", true],
                      ] as const
                    )
                      .filter(([, , available]) => available)
                      .map(([value, hint]) => (
                        <ChoiceCard
                          key={value}
                          name="mode"
                          value={value}
                          checked={draft.mode === value}
                          onChange={() => update("mode", value)}
                          title={trainingModeLabels[value]}
                          description={hint}
                          className="p-3.5"
                        />
                      ))}
                  </fieldset>
                  <FieldError message={errors.mode} />

                  {draft.mode === "bundle" && (
                    <fieldset className="flex flex-col gap-2">
                      <legend className="mb-2 text-sm font-medium">Paket</legend>
                      {selectedProgram.bundles.map((bundle) => (
                        <ChoiceCard
                          key={bundle.id}
                          name="bundle"
                          value={bundle.id}
                          checked={draft.bundleId === bundle.id}
                          onChange={() => update("bundleId", bundle.id)}
                          title={bundle.title}
                          meta={formatTRY(bundle.fixed_price)}
                          description={
                            <>
                              {bundle.description} <span className="tabular whitespace-nowrap font-mono">· {bundle.duration_hours} saat</span>
                            </>
                          }
                        />
                      ))}
                      <FieldError message={errors.bundleId} />
                    </fieldset>
                  )}

                  {draft.mode === "custom" && (
                    <fieldset className="flex flex-col gap-2">
                      <legend className="mb-2 flex w-full items-baseline justify-between gap-3 text-sm font-medium">
                        Konular
                        {priceEstimate && (
                          <span className="tabular font-mono text-xs font-normal text-ink-soft">
                            {priceEstimate.hours} saat{priceEstimate.price ? ` · ${formatTRY(priceEstimate.price)}` : ""}
                          </span>
                        )}
                      </legend>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {selectedProgram.topics.map((topic) => (
                          <ChoiceCard
                            key={topic.id}
                            type="checkbox"
                            name="topics"
                            value={topic.id}
                            checked={draft.topicIds?.includes(topic.id) ?? false}
                            onChange={() => toggle("topicIds", topic.id)}
                            title={topic.title}
                            meta={`${topic.estimated_hours} sa`}
                            description={topic.description || undefined}
                            className="p-3.5"
                          />
                        ))}
                      </div>
                      <FieldError message={errors.topicIds} />
                    </fieldset>
                  )}

                  {draft.mode === "schedule" && (
                    <Alert tone="info">Programın tamamını birebir, senin belirlediğin günlerde alırsın. Fiyatı teklifle netleştiririz.</Alert>
                  )}
                </>
              )}

              {kind === "birebir" && current.id === "zaman" && (
                <>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">Hangi günler uygun?</legend>
                    <div className="flex flex-wrap gap-2">
                      {[...weekDays, ...dayParts].map((day, index) => {
                        const checked = draft.preferredDays?.includes(day) ?? false;
                        return (
                          <label
                            key={day}
                            className={cn(
                              "inline-flex min-h-10 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                              checked ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong bg-paper text-ink hover:border-ink-muted",
                              index === weekDays.length && "sm:ml-3",
                            )}
                          >
                            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle("preferredDays", day)} />
                            {day}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <Field id="w-message" label="Hedefin ve seviyen" optional hint="Ne için öğrenmek istiyorsun? Var olan bir dosya üzerinden mi çalışalım?">
                    <Textarea rows={5} value={draft.message ?? ""} onChange={(e) => update("message", e.target.value)} maxLength={5000} />
                  </Field>
                </>
              )}

              {kind === "birebir" && current.id === "indirim" && (
                <DiscountStep
                  code={draft.discountCode ?? ""}
                  percent={draft.discountPercent ?? null}
                  error={errors.discountCode}
                  onChange={(code, percent) => {
                    setDraft((current) => ({ ...current, discountCode: code, discountPercent: percent }));
                    setErrors({});
                  }}
                />
              )}

              {current.id === "dosya" && (
                <FileStep
                  file={file}
                  error={errors.file}
                  onChange={(next, error) => {
                    setFile(next);
                    setErrors(error ? { file: error } : {});
                  }}
                  hint={kind === "tez" ? "Tez dosyan ve enstitü yazım kılavuzu (ZIP olarak da ekleyebilirsin)." : "Veri setin, ölçek ya da danışman notların."}
                />
              )}

              {isReview && (
                <Review
                  kind={kind}
                  draft={draft}
                  file={file}
                  steps={steps}
                  onEdit={goTo}
                  programs={programs}
                  priceEstimate={priceEstimate}
                />
              )}

              {isReview && state.error && <Alert tone="danger">{state.error}</Alert>}

              {isReview && !loggedIn && (
                <Card variant="muted" className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-paper text-accent ring-1 ring-line">
                      <LogIn className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold">Göndermek için giriş yap</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                        Teklifin ve mesajların panelinde duracak. Taslağın bu cihazda saklı; giriş yapınca bu adıma geri döneceksin.
                        {file ? " Seçtiğin dosyayı dönüşte yeniden eklemen gerekecek." : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="secondary">
                      <Link href={`/giris?next=${encodeURIComponent(nextParam)}`}>Giriş yap</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/kayit?next=${encodeURIComponent(nextParam)}`}>Ücretsiz hesap aç</Link>
                    </Button>
                  </div>
                </Card>
              )}
              {isReview && loggedIn && userName && (
                <p className="text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{userName}</span> olarak göndereceksin. Yanıtımız e-posta ve panel bildirimiyle gelir.
                </p>
              )}
            </div>
          </div>

          {/* Gezinme */}
          <div className="flex items-center justify-between gap-3 border-t border-line bg-surface/60 px-5 py-4 sm:px-7">
            <Button type="button" variant="ghost" onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0 || pending}>
              <ArrowLeft /> Geri
            </Button>
            {isReview ? (
              <Button type="button" onClick={submit} loading={pending} disabled={!loggedIn || Boolean(state.requestId)}>
                Talebi gönder
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                {current.id === "dosya" && !file ? "Dosyasız devam et" : current.id === "indirim" && !draft.discountCode ? "Kodsuz devam et" : "Devam"} <ArrowRight />
              </Button>
            )}
          </div>
        </Card>
      </section>

      {/* Yan özet */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{kindNames[kind]}</p>
          {kind === "birebir" ? (
            <div className="mt-3">
              <p className="font-semibold">{selectedProgram?.title ?? "Program seçilmedi"}</p>
              {draft.mode && <p className="mt-0.5 text-sm text-ink-soft">{trainingModeLabels[draft.mode]}</p>}
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-xs text-ink-soft">Tahmini tutar</p>
                {priceEstimate?.price ? (
                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    {draft.discountPercent ? (
                      <span className="tabular font-mono text-sm text-ink-muted line-through">{formatTRY(priceEstimate.price)}</span>
                    ) : null}
                    <Price amount={applyDiscount(priceEstimate.price, draft.discountPercent)} className="text-2xl" />
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-ink-soft">{draft.mode === "schedule" ? "Teklifle belirlenir" : "Seçimine göre hesaplanır"}</p>
                )}
                {priceEstimate?.hours ? <p className="tabular mt-1 font-mono text-xs text-ink-soft">{priceEstimate.hours} saat</p> : null}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Fiyat, kapsamı inceledikten sonra panelinde yazılı teklif olarak sunulur. Teklif almak ücretsiz.</p>
          )}
        </Card>
        <Card variant="muted" padding="sm" className="px-5">
          <p className="text-sm font-semibold">Gönderdikten sonra</p>
          <ol className="mt-3 flex flex-col gap-2.5 text-sm text-ink-soft">
            {(kind === "birebir" && draft.mode === "bundle"
              ? ["Talebin panelinde görünür", "Onaylanınca ders günlerini planlarız", "Oturumlar takviminde belirir"]
              : ["Talebin panelinde görünür", "Teklifi panelinde inceler, onaylarsın", "Her adımı durum hattından izlersin"]
            ).map((item, index) => (
              <li key={item} className="flex gap-2.5">
                <span className="tabular w-5 shrink-0 font-mono text-xs leading-5 text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ol>
        </Card>
      </aside>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 text-[13px] font-medium text-danger-ink">
      {message}
    </p>
  );
}

function FileStep({
  file,
  error,
  hint,
  onChange,
}: {
  file: File | null;
  error?: string;
  hint: string;
  onChange: (file: File | null, error?: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const accept = (next: File | null | undefined) => {
    if (!next) return;
    if (next.size > MAX_FILE) {
      onChange(null, `Bu dosya ${formatBytes(next.size)}. En fazla 20 MB ekleyebilirsin; büyük dosyaları ZIP'leyip bölebilir ya da talep sayfasından ekleyebilirsin.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-soft">İsteğe bağlı. {hint}</p>
      {file ? (
        <div className="flex items-center gap-3 rounded-2xl border border-line-strong bg-paper p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Paperclip className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{file.name}</p>
            <p className="tabular font-mono text-xs text-ink-soft">{formatBytes(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Dosyayı kaldır"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X />
          </Button>
        </div>
      ) : (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            accept(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
            dragging ? "border-accent bg-accent-soft/50" : "border-line-strong bg-surface/50 hover:border-ink-muted",
          )}
        >
          <FileUp className="size-6 text-accent" aria-hidden />
          <span className="font-semibold">Dosya seç ya da buraya sürükle</span>
          <span className="text-xs text-ink-soft">
            PDF, Word, Excel, SPSS, CSV, ZIP · en fazla <span className="tabular font-mono">20 MB</span>
          </span>
          <input ref={inputRef} type="file" className="sr-only" onChange={(event) => accept(event.target.files?.[0])} />
        </label>
      )}
      <FieldError message={error} />
    </div>
  );
}

function DiscountStep({
  code,
  percent,
  error,
  onChange,
}: {
  code: string;
  percent: number | null;
  error?: string;
  onChange: (code: string, percent: number | null) => void;
}) {
  const [checking, startChecking] = React.useTransition();
  const [localError, setLocalError] = React.useState<string | null>(null);

  const apply = () => {
    setLocalError(null);
    if (code.trim().length < 3) {
      setLocalError("Kodu eksiksiz yaz.");
      return;
    }
    startChecking(async () => {
      const result = await checkDiscountCode(code);
      if (result.percent) onChange(result.code, result.percent);
      else {
        onChange(code, null);
        setLocalError("Bu kod geçerli değil ya da süresi dolmuş.");
      }
    });
  };

  const message = localError ?? error;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="mb-2 text-sm text-ink-soft">İndirim kodun varsa ekle; yoksa bu adımı atlayabilirsin.</p>
      <label htmlFor="w-code" className="text-sm font-medium">
        İndirim kodu
      </label>
      <div className="flex max-w-md gap-2">
        <Input
          id="w-code"
          value={code}
          onChange={(event) => {
            onChange(event.target.value.toUpperCase(), null);
            setLocalError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
          placeholder="AXIS10"
          maxLength={32}
          autoComplete="off"
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? "w-code-error" : undefined}
          className="font-mono uppercase"
        />
        <Button type="button" variant="outline" onClick={apply} loading={checking} className="shrink-0">
          Uygula
        </Button>
      </div>
      {message && (
        <p id="w-code-error" role="alert" className="text-[13px] font-medium text-danger-ink">
          {message}
        </p>
      )}
      {percent ? (
        <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success-ink">
          <Check className="size-3.5" aria-hidden /> {code} uygulandı: %{percent} indirim
        </p>
      ) : null}
    </div>
  );
}

function Review({
  kind,
  draft,
  file,
  steps,
  onEdit,
  programs,
  priceEstimate,
}: {
  kind: WizardKind;
  draft: Draft;
  file: File | null;
  steps: StepDef[];
  onEdit: (index: number) => void;
  programs: WizardProgram[];
  priceEstimate: { hours: number; price: number | null } | null;
}) {
  const stepIndex = (id: string) => steps.findIndex((step) => step.id === id);
  const program = programs.find((p) => p.slug === draft.program);
  const bundle = program?.bundles.find((b) => b.id === draft.bundleId);
  const topics = program?.topics.filter((t) => draft.topicIds?.includes(t.id)) ?? [];

  const rows: { label: string; value: React.ReactNode; step: string }[] = [];
  const push = (label: string, value: React.ReactNode, step: string) => {
    if (value !== undefined && value !== null && value !== "") rows.push({ label, value, step });
  };

  if (kind === "analiz") {
    push("Analiz türü", draft.method ? analysisMethodLabels[draft.method] : "", "yontem");
    push("Veri tabanı", draft.database, "detay");
    push("Program", draft.software, "detay");
    push("Örneklem", draft.sample, "detay");
    push("Konu", draft.topic, "detay");
    push("Alan", draft.field, "detay");
    push("Teslim tarihi", draft.deadline ? formatDate(draft.deadline) : "Belirtilmedi", "takvim");
    push("Mesaj", draft.message, "takvim");
    push("Dosya", file ? `${file.name} · ${formatBytes(file.size)}` : "Eklenmedi", "dosya");
  } else if (kind === "tez") {
    push("Derece", draft.degree, "tez");
    push("Enstitü", draft.institute, "tez");
    push("Sayfa", draft.pages ? `${draft.pages} sayfa` : "", "tez");
    push("Kaynakça", draft.style, "tez");
    push("Teslim tarihi", draft.deadline ? formatDate(draft.deadline) : "Belirtilmedi", "tez");
    push("İhtiyaçlar", draft.needs?.join(", "), "ihtiyac");
    push("Mesaj", draft.message, "ihtiyac");
    push("Dosya", file ? `${file.name} · ${formatBytes(file.size)}` : "Eklenmedi", "dosya");
  } else if (kind === "kurumsal") {
    push("Kurum", draft.company, "kurum");
    push("Katılımcı", draft.headcount ? `${draft.headcount} kişi` : "", "kurum");
    push("Programlar", draft.programs?.join(", "), "kurum");
    push("Şekil", draft.format, "kurum");
    push("Tarihler", draft.dates, "kurum");
    push("Mesaj", draft.message, "mesaj");
  } else {
    push("Program", program?.title, "program");
    push("Şekil", draft.mode ? trainingModeLabels[draft.mode] : "", "sekil");
    push("Paket", bundle ? `${bundle.title} · ${bundle.duration_hours} saat` : "", "sekil");
    push(
      "Konular",
      topics.length ? (
        <span className="flex flex-wrap gap-1.5">
          {topics.map((topic) => (
            <Badge key={topic.id} size="sm">
              {topic.title}
            </Badge>
          ))}
        </span>
      ) : (
        ""
      ),
      "sekil",
    );
    push("Uygun zamanlar", draft.preferredDays?.length ? draft.preferredDays.join(", ") : "Esnek", "zaman");
    push("Mesaj", draft.message, "zaman");
    push("İndirim", draft.discountPercent ? `${draft.discountCode} · %${draft.discountPercent}` : "", "indirim");
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="divide-y divide-line rounded-2xl border border-line">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-start gap-3 px-4 py-3 sm:grid-cols-[150px_minmax(0,1fr)_auto]">
            <dt className="text-sm text-ink-soft">{row.label}</dt>
            <dd className="min-w-0 whitespace-pre-line break-words text-sm text-ink">{row.value}</dd>
            <button
              type="button"
              onClick={() => onEdit(Math.max(0, stepIndex(row.step)))}
              className="inline-flex size-8 items-center justify-center rounded-lg text-ink-soft hover:bg-surface hover:text-ink"
              aria-label={`${row.label} bilgisini düzenle`}
            >
              <Pencil className="size-3.5" aria-hidden />
            </button>
          </div>
        ))}
      </dl>
      {kind === "birebir" && priceEstimate?.price ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5">
          <span className="text-sm text-ink-soft">
            Tahmini tutar <span className="tabular font-mono">· {priceEstimate.hours} saat</span>
          </span>
          <span className="flex items-baseline gap-2">
            {draft.discountPercent ? <span className="tabular font-mono text-sm text-ink-muted line-through">{formatTRY(priceEstimate.price)}</span> : null}
            <Price amount={applyDiscount(priceEstimate.price, draft.discountPercent)} className="text-xl" />
          </span>
        </div>
      ) : null}
    </div>
  );
}
