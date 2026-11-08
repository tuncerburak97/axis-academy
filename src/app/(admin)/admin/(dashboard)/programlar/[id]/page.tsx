// src/app/(admin)/admin/(dashboard)/programlar/[id]/page.tsx — program düzenleme: genel, müfredat, paketler, fiyatlar, konular
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy, ExternalLink, ListOrdered, Package, Pencil, Plus, Tag, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { SectionHeading } from "@/components/ui/page-header";
import { formatHours, formatTRY } from "@/lib/format";
import { programLevelLabels } from "@/lib/types/platform";
import { getAdminProgram } from "@/lib/queries/admin-catalog";
import {
  copyModuleWeekToBundle,
  deleteBundle,
  deleteBundleWeek,
  deletePlan,
  deleteProgram,
  deleteSyllabusWeek,
  deleteTopic,
  updateProgram,
} from "@/lib/actions/admin-catalog";
import { ActionForm, ConfirmAction, Hidden, SubmitButton } from "@/components/admin/action-form";
import { UrlTabs } from "@/components/admin/url-tabs";
import {
  BundleDialog,
  BundleWeekDialog,
  Checkbox,
  PlanDialog,
  SyllabusWeekDialog,
  TopicDialog,
} from "@/components/admin/programs/catalog-dialogs";
import { categoryLabels, priceUnitLabels, trainingTypeLabels, weekKindLabels } from "@/components/admin/lib/labels";

type Params = Promise<{ id: string }>;
const TABS = ["genel", "mufredat", "paketler", "fiyatlar", "konular"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const detail = await getAdminProgram(id).catch(() => null);
  return { title: detail?.program.title ?? "Program" };
}

function DeleteIcon({ label }: { label: string }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label={label}>
      <Trash2 />
    </Button>
  );
}

function EditIcon({ label }: { label: string }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label={label}>
      <Pencil />
    </Button>
  );
}

export default async function ProgramDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const detail = await getAdminProgram(id);
  if (!detail) notFound();
  const { program, weeks, bundles, plans, topics } = detail;
  const tab = TABS.includes(query.tab ?? "") ? query.tab! : "genel";
  const nextWeek = weeks.reduce((max, week) => Math.max(max, week.week_number), 0) + 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/programlar" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Programlar
        </Link>
      </div>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={program.is_active ? "success" : "neutral"} dot>
              {program.is_active ? "Yayında" : "Pasif"}
            </Badge>
            <Badge>{categoryLabels[program.category] ?? program.category}</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-balance sm:text-[28px]">{program.title}</h1>
          <p className="mt-1 font-mono text-sm text-ink-soft">/programlar/{program.slug}</p>
        </div>
        {program.is_active && (
          <Button asChild variant="ghost" size="sm">
            <a href={`/programlar/${program.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink /> Sitede gör
            </a>
          </Button>
        )}
      </header>

      <UrlTabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="genel">Genel</TabsTrigger>
          <TabsTrigger value="mufredat">
            Müfredat <span className="tabular font-mono text-[11px] text-ink-muted">{weeks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="paketler">
            Paketler <span className="tabular font-mono text-[11px] text-ink-muted">{bundles.length}</span>
          </TabsTrigger>
          <TabsTrigger value="fiyatlar">
            Fiyatlar <span className="tabular font-mono text-[11px] text-ink-muted">{plans.length}</span>
          </TabsTrigger>
          <TabsTrigger value="konular">
            Konular <span className="tabular font-mono text-[11px] text-ink-muted">{topics.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* GENEL */}
        <TabsContent value="genel">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <Card>
              <ActionForm action={updateProgram} className="flex flex-col gap-4">
                <Hidden name="module_id" value={program.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="p-title" label="Program adı">
                    <Input name="title" required minLength={2} maxLength={120} defaultValue={program.title} />
                  </Field>
                  <Field id="p-slug" label="Adres (slug)" hint="Boş bırakırsan addan üretilir.">
                    <Input name="slug" maxLength={120} defaultValue={program.slug} className="font-mono" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field id="p-category" label="Kategori">
                    <Select name="category" defaultValue={program.category}>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field id="p-level" label="Seviye">
                    <Select name="level" defaultValue={program.level}>
                      {Object.entries(programLevelLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field id="p-badge" label="Rozet" optional>
                    <Input name="badge" maxLength={40} defaultValue={program.badge} placeholder="Ör. En çok tercih edilen" />
                  </Field>
                  <Field id="p-sort" label="Sıra">
                    <Input name="sort_order" type="number" min={0} defaultValue={program.sort_order} className="tabular font-mono" />
                  </Field>
                </div>
                <Field id="p-audience" label="Kimler için" optional>
                  <Input name="audience" maxLength={500} defaultValue={program.audience} placeholder="Ör. Tez yazan lisansüstü öğrenciler" />
                </Field>
                <Field id="p-desc" label="Kısa açıklama" hint="Katalog kartında görünür.">
                  <Textarea name="description" rows={2} maxLength={500} defaultValue={program.description} />
                </Field>
                <Field id="p-long" label="Uzun açıklama" optional hint="Program sayfasında görünür. Markdown desteklenir.">
                  <Textarea name="long_description" rows={6} maxLength={5000} defaultValue={program.long_description} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="p-features" label="Öne çıkanlar" optional hint="Satır başına bir madde.">
                    <Textarea name="features" rows={5} defaultValue={program.features.join("\n")} />
                  </Field>
                  <Field id="p-outcomes" label="Kazanımlar" optional hint="Satır başına bir madde.">
                    <Textarea name="outcomes" rows={5} defaultValue={program.outcomes.join("\n")} />
                  </Field>
                </div>
                <Field id="p-price" label="Fiyat ipucu" optional hint="Ör. ₺4.800'den başlayan">
                  <Input name="public_price_hint" maxLength={120} defaultValue={program.public_price_hint} />
                </Field>
                <Checkbox
                  name="is_active"
                  label="Yayında"
                  defaultChecked={program.is_active}
                  hint={weeks.length ? "Katalogda ve anasayfada görünür." : "Yayına almak için önce müfredata en az bir hafta ekle."}
                />
                <div className="flex justify-end border-t border-line pt-4">
                  <SubmitButton>Kaydet</SubmitButton>
                </div>
              </ActionForm>
            </Card>
            <div className="flex flex-col gap-4">
              {weeks.length === 0 && (
                <Alert tone="warning" title="Müfredat yok">
                  Program yayına alınmadan önce en az bir müfredat haftası gerekir.
                </Alert>
              )}
              <ConfirmAction
                title="Program kalıcı olarak silinsin mi?"
                description="Müfredat, paketler, fiyatlar, konular ve programa bağlı tüm dönemler (kayıtlarıyla) silinir. Bu işlem geri alınamaz. Yayından kaldırmak için “Yayında” kutusunu kapatman yeterli."
                action={deleteProgram}
                fields={{ module_id: program.id }}
                confirmLabel="Kalıcı olarak sil"
                trigger={
                  <Button variant="ghost" size="sm" className="self-start text-danger-ink hover:bg-danger-soft">
                    <Trash2 /> Programı sil
                  </Button>
                }
              />
            </div>
          </div>
        </TabsContent>

        {/* MÜFREDAT */}
        <TabsContent value="mufredat">
          <Card>
            <SectionHeading
              as="h3"
              title="Müfredat"
              description="Haftalık başlıklar program sayfasında ve dönem oturumu üreticisinde kullanılır."
              action={
                <SyllabusWeekDialog
                  moduleId={program.id}
                  nextWeek={nextWeek}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus /> Hafta ekle
                    </Button>
                  }
                />
              }
            />
            {weeks.length === 0 ? (
              <EmptyState className="mt-4" icon={ListOrdered} title="Müfredat boş" description="İlk haftayı ekle; program ancak müfredatla yayına alınabilir." />
            ) : (
              <ol className="mt-4 flex flex-col divide-y divide-line">
                {weeks.map((week) => (
                  <li key={week.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="tabular flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface font-mono text-sm ring-1 ring-inset ring-line">
                      {week.week_number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{week.title}</p>
                      {week.description && <p className="mt-0.5 text-sm text-ink-soft">{week.description}</p>}
                    </div>
                    <SyllabusWeekDialog moduleId={program.id} week={week} trigger={<EditIcon label="Haftayı düzenle" />} />
                    <ConfirmAction
                      title="Hafta silinsin mi?"
                      description={`Hafta ${week.week_number}: ${week.title}`}
                      action={deleteSyllabusWeek}
                      fields={{ week_id: week.id }}
                      confirmLabel="Sil"
                      trigger={<DeleteIcon label="Haftayı sil" />}
                    />
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </TabsContent>

        {/* PAKETLER */}
        <TabsContent value="paketler" className="flex flex-col gap-4">
          <SectionHeading
            title="Birebir paketler"
            description="Sabit fiyatlı hazır paketler ve haftalık içerikleri."
            action={
              <BundleDialog
                moduleId={program.id}
                trigger={
                  <Button variant="outline" size="sm">
                    <Plus /> Paket ekle
                  </Button>
                }
              />
            }
          />
          {bundles.length === 0 && <EmptyState icon={Package} title="Paket yok" description="Birebir eğitim için hazır paket ekle; üyeler teklif sihirbazından seçer." />}
          {bundles.map((bundle) => {
            const nextBundleWeek = bundle.weeks.reduce((max, week) => Math.max(max, week.week_number), 0) + 1;
            const copied = new Set(bundle.weeks.map((week) => week.source_module_week_id));
            const copyable = weeks.filter((week) => !copied.has(week.id));
            return (
              <Card key={bundle.id}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>{bundle.title}</CardTitle>
                      <Badge size="sm" tone={bundle.is_active ? "success" : "neutral"} dot>
                        {bundle.is_active ? "Yayında" : "Pasif"}
                      </Badge>
                    </div>
                    <p className="tabular mt-1 font-mono text-sm text-ink-soft">
                      {formatTRY(bundle.fixed_price)} · {formatHours(bundle.duration_hours)}
                    </p>
                    {bundle.description && <CardDescription className="mt-1">{bundle.description}</CardDescription>}
                  </div>
                  <BundleDialog moduleId={program.id} bundle={bundle} trigger={<EditIcon label="Paketi düzenle" />} />
                  <ConfirmAction
                    title="Paket silinsin mi?"
                    description={`${bundle.title} ve haftalık içeriği silinir. Bu paketle açılmış talepler paketsiz kalır.`}
                    action={deleteBundle}
                    fields={{ bundle_id: bundle.id }}
                    confirmLabel="Sil"
                    trigger={<DeleteIcon label="Paketi sil" />}
                  />
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Paket müfredatı</p>
                    <BundleWeekDialog
                      bundleId={bundle.id}
                      nextWeek={nextBundleWeek}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Plus /> Hafta ekle
                        </Button>
                      }
                    />
                  </div>
                  {bundle.weeks.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-soft">Henüz hafta yok. Programdan kopyala ya da yeni hafta ekle.</p>
                  ) : (
                    <ol className="mt-2 flex flex-col divide-y divide-line">
                      {bundle.weeks.map((week) => (
                        <li key={week.id} className="flex items-center gap-3 py-2">
                          <span className="tabular w-8 shrink-0 font-mono text-sm text-ink-soft">H{week.week_number}</span>
                          <span className="min-w-0 flex-1 truncate text-sm">{week.title}</span>
                          <Badge size="sm" tone={week.week_kind === "specialized" ? "amber" : "neutral"}>
                            {weekKindLabels[week.week_kind] ?? week.week_kind}
                          </Badge>
                          <BundleWeekDialog bundleId={bundle.id} week={week} trigger={<EditIcon label="Haftayı düzenle" />} />
                          <ConfirmAction
                            title="Paket haftası silinsin mi?"
                            description={week.title}
                            action={deleteBundleWeek}
                            fields={{ week_id: week.id }}
                            confirmLabel="Sil"
                            trigger={<DeleteIcon label="Haftayı sil" />}
                          />
                        </li>
                      ))}
                    </ol>
                  )}
                  {copyable.length > 0 && (
                    <ActionForm action={copyModuleWeekToBundle} className="mt-3 flex flex-col gap-2 rounded-xl bg-surface p-3 sm:flex-row sm:items-end">
                      <Hidden name="bundle_id" value={bundle.id} />
                      <Field id={`copy-${bundle.id}`} label="Programdan hafta kopyala" className="flex-1">
                        <Select name="module_week_id" required defaultValue="">
                          <option value="" disabled>
                            Hafta seç
                          </option>
                          {copyable.map((week) => (
                            <option key={week.id} value={week.id}>
                              Hafta {week.week_number}: {week.title}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field id={`copy-kind-${bundle.id}`} label="Tür" className="sm:w-40">
                        <Select name="week_kind" defaultValue="core">
                          <option value="core">Ortak temel</option>
                          <option value="specialized">Pakete özel</option>
                        </Select>
                      </Field>
                      <SubmitButton variant="outline">
                        <Copy /> Kopyala
                      </SubmitButton>
                    </ActionForm>
                  )}
                </div>
              </Card>
            );
          })}
        </TabsContent>

        {/* FİYATLAR */}
        <TabsContent value="fiyatlar">
          <Card>
            <SectionHeading
              as="h3"
              title="Fiyat planları"
              description="Birebir saatlik ücret ve grup kişi aralıkları. Teklif sihirbazında tahmin için kullanılır."
              action={
                <PlanDialog
                  moduleId={program.id}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus /> Plan ekle
                    </Button>
                  }
                />
              }
            />
            {plans.length === 0 ? (
              <EmptyState className="mt-4" icon={Tag} title="Fiyat planı yok" description="Birebir saatlik ücret ekle; “kendi programın” talepleri bununla fiyatlanır." />
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-line">
                {plans.map((plan) => (
                  <li key={plan.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Badge size="sm" tone={plan.training_type === "group" ? "info" : "accent"}>
                      {trainingTypeLabels[plan.training_type] ?? plan.training_type}
                    </Badge>
                    <span className="tabular font-mono text-sm text-ink-soft">
                      {plan.min_people === plan.max_people ? `${plan.min_people} kişi` : `${plan.min_people}–${plan.max_people} kişi`}
                    </span>
                    <span className="tabular min-w-0 flex-1 font-mono font-medium">
                      {formatTRY(plan.price)} <span className="text-sm font-normal text-ink-soft">/ {priceUnitLabels[plan.unit] ?? plan.unit}</span>
                      {plan.note && <span className="ml-2 font-sans text-sm font-normal text-ink-soft">{plan.note}</span>}
                    </span>
                    {!plan.is_active && <Badge size="sm">Pasif</Badge>}
                    <PlanDialog moduleId={program.id} plan={plan} trigger={<EditIcon label="Planı düzenle" />} />
                    <ConfirmAction
                      title="Fiyat planı silinsin mi?"
                      description="Bu plan teklif hesaplamasında artık kullanılmaz."
                      action={deletePlan}
                      fields={{ plan_id: plan.id }}
                      confirmLabel="Sil"
                      trigger={<DeleteIcon label="Planı sil" />}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        {/* KONULAR */}
        <TabsContent value="konular">
          <Card>
            <SectionHeading
              as="h3"
              title="Konu havuzu"
              description="Birebir “kendi programın” talebinde üyenin seçtiği konular ve tahmini süreleri."
              action={
                <TopicDialog
                  moduleId={program.id}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus /> Konu ekle
                    </Button>
                  }
                />
              }
            />
            {topics.length === 0 ? (
              <EmptyState className="mt-4" icon={Tags} title="Konu yok" description="Konular eklenince üyeler kendi birebir programlarını kurabilir." />
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-line">
                {topics.map((topic) => (
                  <li key={topic.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{topic.title}</p>
                        <span className="tabular font-mono text-xs text-ink-soft">{topic.estimated_hours} sa</span>
                        {!topic.is_active && <Badge size="sm">Pasif</Badge>}
                      </div>
                      {topic.description && <p className="mt-0.5 text-sm text-ink-soft">{topic.description}</p>}
                    </div>
                    <TopicDialog moduleId={program.id} topic={topic} trigger={<EditIcon label="Konuyu düzenle" />} />
                    <ConfirmAction
                      title="Konu silinsin mi?"
                      description={`${topic.title}. Geçmiş taleplerde seçilmişse yalnızca pasife almak daha güvenli.`}
                      action={deleteTopic}
                      fields={{ topic_id: topic.id }}
                      confirmLabel="Sil"
                      trigger={<DeleteIcon label="Konuyu sil" />}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
