// src/app/kit/page.tsx — Axis 2.0 bileşen kiti vitrini. Yalnızca geliştirme ortamında açılır; canlıda 404.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarPlus, FileText, GraduationCap, Inbox, Search, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardEyebrow, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea, ChoiceCard } from "@/components/ui/field";
import { StatusTrack, WeekStrip, ProgressBar } from "@/components/ui/progress";
import { Avatar, DateTile, Kbd, Price, SeatMeter, Stat } from "@/components/ui/data";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Accent, Eyebrow, PageHeader, SectionHeading } from "@/components/ui/page-header";
import { DialogDemo, MenuDemo, TabsDemo, ToastDemo } from "./kit-demos";

export const metadata: Metadata = { title: "Bileşen kiti", robots: { index: false, follow: false } };

const swatches = [
  { name: "Mürekkep", token: "ink", hex: "#0E1A2B", className: "bg-ink" },
  { name: "İndigo", token: "accent", hex: "#4F46E5", className: "bg-accent" },
  { name: "İndigo açık", token: "accent-soft", hex: "#EEF2FF", className: "bg-accent-soft" },
  { name: "Amber", token: "amber", hex: "#F59E0B", className: "bg-amber" },
  { name: "Amber açık", token: "amber-soft", hex: "#FEF3C7", className: "bg-amber-soft" },
  { name: "Zemin", token: "canvas", hex: "#F6F7FB", className: "bg-canvas" },
  { name: "Başarılı", token: "success", hex: "#16A34A", className: "bg-success" },
  { name: "Hata", token: "danger", hex: "#DC2626", className: "bg-danger" },
];

const cohorts = [
  { date: "2026-11-18", title: "Excel ile Veri Ustalığı", meta: "6 hafta · Salı-Perşembe 19:00 · Online", taken: 12, capacity: 16 },
  { date: "2026-11-25", title: "Word ile Profesyonel Belgeler", meta: "4 hafta · Cumartesi 10:00 · Online", taken: 14, capacity: 15 },
  { date: "2026-12-02", title: "PowerPoint ile Etkileyici Sunum", meta: "3 hafta · Çarşamba 20:00 · Online", taken: 15, capacity: 15 },
];

function KitSection({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-line py-12">
      <div className="mb-8 max-w-2xl">
        <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-[15px] text-ink-soft">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function KitPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-8">
        <PageHeader
          eyebrow={<><span lang="en">Axis</span> 2.0 · Faz 0</>}
          title={
            <>
              Bileşen <Accent>kiti</Accent>
            </>
          }
          description="Public site, üye alanı ve admin konsolu bu parçalardan kurulacak. Sayfadaki veriler örnektir. Bu sayfa yalnızca geliştirme ortamında açılır."
          actions={
            <>
              <Button variant="outline">
                <Search /> Ara <Kbd>⌘K</Kbd>
              </Button>
              <Button>
                Yeni dönem <ArrowRight />
              </Button>
            </>
          }
        />

        <KitSection id="renk" title="Renk" description="Mevcut palet korunur. İndigo aksiyon, amber dikkat ve doluluk, mürekkep metin ve koyu odak kartı.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {swatches.map((swatch) => (
              <div key={swatch.token} className="overflow-hidden rounded-2xl border border-line bg-paper">
                <div className={`h-16 ${swatch.className}`} />
                <div className="px-3.5 py-3">
                  <p className="text-sm font-semibold">{swatch.name}</p>
                  <p className="tabular font-mono text-xs text-ink-soft">
                    {swatch.token} · {swatch.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </KitSection>

        <KitSection id="tipografi" title="Tipografi" description="Geist arayüzü taşır. Instrument Serif yalnızca başlıktaki tek vurgu kelimesinde. Geist Mono tarih, saat, fiyat ve kontenjanda.">
          <div className="flex flex-col gap-6 rounded-3xl border border-line bg-paper p-6 sm:p-10">
            <Eyebrow>Analiz · Eğitim · Tez Düzenleme</Eyebrow>
            <p className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-balance sm:text-6xl">
              Excel'den teze, <Accent>işini bitiren</Accent> akademik destek.
            </p>
            <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
              Grup dönemleri, birebir dersler, analiz ve tez hizmetleri. Fiyatı ve tarihi önden gör, panelinden adım adım takip et.
            </p>
            <div className="grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-semibold tracking-tight">Başlık 2 · 24</p>
                <p className="text-sm text-ink-soft">Sayfa başlıkları</p>
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">Başlık 3 · 18</p>
                <p className="text-sm text-ink-soft">Kart ve bölüm başlıkları</p>
              </div>
              <div>
                <p className="tabular font-mono text-lg">18 Kas · 19:00 · 12/16</p>
                <p className="text-sm text-ink-soft">Veri satırları</p>
              </div>
            </div>
          </div>
        </KitSection>

        <KitSection id="buton" title="Buton" description="Bir ekranda tek birincil buton. İşlem sürerken buton kilitlenir ve döner.">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Button>Başvuruyu gönder</Button>
              <Button variant="secondary">Derse katıl</Button>
              <Button variant="outline">Takvime ekle</Button>
              <Button variant="soft">Müfredatı gör</Button>
              <Button variant="ghost">Vazgeç</Button>
              <Button variant="danger">Kalıcı olarak sil</Button>
              <Button variant="link">Tüm dönemler</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Küçük</Button>
              <Button size="md">Orta</Button>
              <Button size="lg">Büyük</Button>
              <Button loading>Gönderiliyor</Button>
              <Button disabled variant="outline">Pasif</Button>
              <Button size="icon" variant="outline" aria-label="Takvime ekle">
                <CalendarPlus />
              </Button>
            </div>
          </div>
        </KitSection>

        <KitSection id="rozet" title="Rozet" description="Durum her zaman metinle de yazılır; renk tek başına anlam taşımaz.">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent" dot>Planlandı</Badge>
            <Badge tone="amber" dot>Teklif bekliyor</Badge>
            <Badge tone="success" dot>Tamamlandı</Badge>
            <Badge tone="danger" dot>İptal edildi</Badge>
            <Badge tone="info" dot>Yeni</Badge>
            <Badge>Excel</Badge>
            <Badge tone="solid">En çok tercih edilen</Badge>
            <Badge tone="brand" size="sm">Yeni müfredat</Badge>
          </div>
        </KitSection>

        <KitSection id="form" title="Form" description="Etiket üstte, ipucu altta. Hata metni neyin yanlış olduğunu ve nasıl düzeltileceğini söyler.">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-5">
              <Field id="kit-name" label="Ad soyad">
                <Input placeholder="Elif Demir" autoComplete="name" />
              </Field>
              <Field id="kit-email" label="E-posta" error="Bu adres geçerli görünmüyor. Örnek: ad@universite.edu.tr">
                <Input type="email" defaultValue="elif@" />
              </Field>
              <Field id="kit-field" label="Çalışma alanın" hint="Analizi doğru yöntemle kurmamıza yardımcı olur.">
                <Select defaultValue="">
                  <option value="" disabled>
                    Seç
                  </option>
                  <option>Sağlık bilimleri</option>
                  <option>Sosyal bilimler</option>
                  <option>Mühendislik</option>
                </Select>
              </Field>
              <Field id="kit-note" label="Eklemek istediklerin" optional>
                <Textarea placeholder="Teslim tarihin, enstitü yazım kılavuzu gibi bilgiler" />
              </Field>
            </Card>
            <div className="flex flex-col gap-3">
              <ChoiceCard name="kit-service" defaultChecked title="Bibliyometrik analiz" description="Scopus veya Web of Science verisiyle yayın ve atıf haritası." />
              <ChoiceCard name="kit-service" title="İstatistiksel analiz" description="SPSS, R veya Python ile hipotez testleri ve raporlama." />
              <ChoiceCard name="kit-service" title="Tez düzenleme" description="Enstitü kılavuzuna göre biçim, kaynakça ve şablon." />
              <ChoiceCard type="checkbox" name="kit-topics" defaultChecked title="Pivot tablolar" meta="3 saat" />
              <ChoiceCard type="checkbox" name="kit-topics" title="Dashboard tasarımı" meta="4 saat" />
            </div>
          </div>
        </KitSection>

        <KitSection id="kart" title="Kart" description="Koyu kart ekranın tek odak noktasıdır. Diğer kartlar sade ve düz kalır.">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <Card variant="inverse" padding="lg" className="flex flex-col gap-4">
              <CardEyebrow className="text-white/60">Sıradaki ders</CardEyebrow>
              <div>
                <p className="tabular font-mono text-sm text-accent-glow">Yarın · 19:00–21:00 · Online</p>
                <p className="mt-1.5 text-xl font-semibold tracking-tight">Hafta 3 · Pivot tablolar ve özet raporlar</p>
                <p className="mt-1 text-sm text-white/60">Excel ile Veri Ustalığı · 18 Kasım dönemi</p>
              </div>
              <WeekStrip total={6} current={3} tone="dark" />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="border-transparent bg-white text-ink hover:bg-white/90">
                  <Video /> Derse katıl
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <CalendarPlus /> Takvime ekle
                </Button>
              </div>
            </Card>

            <Card padding="none" className="p-1.5">
              <div className="flex items-center justify-between px-3.5 pb-2 pt-3">
                <CardEyebrow>Yaklaşan dönemler</CardEyebrow>
                <Button variant="link" size="sm">
                  Tümü
                </Button>
              </div>
              <ul className="flex flex-col">
                {cohorts.map((cohort, index) => (
                  <li key={cohort.title} className={index > 0 ? "border-t border-line" : undefined}>
                    <a href="#kart" className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-colors hover:bg-surface">
                      <DateTile date={cohort.date} />
                      <span className="flex min-w-0 flex-1 flex-col gap-2">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{cohort.title}</span>
                          <span className="block truncate text-xs text-ink-soft">{cohort.meta}</span>
                        </span>
                        <SeatMeter taken={cohort.taken} capacity={cohort.capacity} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>

            <Card variant="interactive" className="flex flex-col">
              <CardHeader>
                <Badge>Excel</Badge>
                <Badge tone="solid" size="sm">En çok tercih edilen</Badge>
              </CardHeader>
              <CardTitle className="mt-4 text-lg">Excel ile Veri Ustalığı</CardTitle>
              <CardDescription className="mt-1.5">
                Ham veriyi karar destekleyen raporlara dönüştür: formüllerden dashboard kurulumuna.
              </CardDescription>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
                <div>
                  <dt className="text-xs text-ink-soft">Süre</dt>
                  <dd className="tabular font-mono">6 hafta</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Seviye</dt>
                  <dd>Orta</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Fiyat</dt>
                  <dd>
                    <Price amount={4800} />
                  </dd>
                </div>
              </dl>
              <CardFooter>
                <Button variant="soft" size="sm">
                  Programı incele <ArrowRight />
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col gap-4">
              <CardHeader>
                <div>
                  <CardEyebrow>Tez düzenleme talebi</CardEyebrow>
                  <CardTitle className="mt-1">142 sayfa · APA 7</CardTitle>
                </div>
                <Badge tone="amber" dot>
                  Onayını bekliyor
                </Badge>
              </CardHeader>
              <StatusTrack steps={["Alındı", "Teklif", "Onaylandı", "Devam ediyor", "Tamamlandı"]} current={1} />
              <div className="flex gap-3 rounded-xl bg-surface p-3.5 text-sm">
                <Avatar name="Axis Akademi" size="sm" />
                <p className="min-w-0 leading-relaxed">
                  <span className="font-semibold">Axis ekibi:</span> Dosyanı inceledik. Biçim ve kaynakça düzenlemesi için teklifimiz hazır.
                </p>
              </div>
            </Card>
          </div>
        </KitSection>

        <KitSection id="ilerleme" title="İlerleme" description="Talep durum hattı, dönem hafta şeridi ve yüzde çubuğu.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="flex flex-col gap-6">
              <StatusTrack steps={["Alındı", "Teklif", "Onaylandı", "Devam ediyor", "Tamamlandı"]} current={3} />
              <StatusTrack steps={["Alındı", "Teklif", "Onaylandı", "Devam ediyor", "Tamamlandı"]} current={4} finished />
              <StatusTrack steps={["Alındı", "Teklif", "Onaylandı"]} current={-1} />
            </Card>
            <Card className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Hafta 4 / 8</p>
                <WeekStrip total={8} current={4} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="flex justify-between text-sm font-medium">
                  <span>Materyallerin tamamlandı</span>
                  <span className="tabular font-mono text-ink-soft">%62</span>
                </p>
                <ProgressBar value={62} label="Materyal ilerlemesi" />
              </div>
            </Card>
          </div>
        </KitSection>

        <KitSection id="veri" title="Veri ve özet" description="Admin konsolunun açılış ekranı. Dikkat gerektiren sayı amber ile öne çıkar.">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="24 saattir yanıtsız" value={3} icon={Inbox} attention hint="En eskisi 26 saat önce" />
            <Stat label="Onay bekleyen başvuru" value={5} icon={Users} />
            <Stat label="Bu ayki doluluk" value="%78" icon={GraduationCap} hint="Geçen ay %64" />
            <Stat label="Yeni analiz talebi" value={2} icon={FileText} />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Avatar name="Elif Demir" />
            <Avatar name="Ahmet Kaya" />
            <Avatar name="Zeynep Aydın" />
            <Avatar name="Murat Şahin" />
            <span className="text-sm text-ink-soft">
              Fiyat: <Price amount={900} unit="saat" /> · <Price amount={3200} from />
            </span>
          </div>
        </KitSection>

        <KitSection id="geri-bildirim" title="Geri bildirim" description="Kalıcı uyarı sayfada durur; işlem sonucu üstten kısa bir bildirimle gelir.">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <Alert tone="info" title="Dönem 18 Kasım'da başlıyor">
                Ders linki başlangıçtan bir gün önce panelinde ve e-postanda olacak.
              </Alert>
              <Alert tone="warning" title="Teklifin 2 gün içinde geçerliliğini yitirecek" action={<Button size="sm" variant="secondary">Teklifi gör</Button>} />
              <Alert tone="success">Profilin güncellendi.</Alert>
              <Alert tone="danger" title="Dosya yüklenemedi">
                Dosya 20 MB'tan büyük. Sıkıştırıp ya da bölerek tekrar yükle.
              </Alert>
              <ToastDemo />
            </div>
            <div className="flex flex-col gap-4">
              <EmptyState
                icon={GraduationCap}
                title="Henüz bir eğitimin yok"
                description="18 Kasım'da başlayan Excel dönemi senin için uygun olabilir. 4 yer kaldı."
                action={
                  <>
                    <Button size="sm">Dönemi incele</Button>
                    <Button size="sm" variant="ghost">
                      Tüm programlar
                    </Button>
                  </>
                }
              />
              <Card className="flex flex-col gap-3" aria-hidden>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-2 w-full" />
              </Card>
            </div>
          </div>
        </KitSection>

        <KitSection id="etkilesim" title="Etkileşim" description="Sekme, diyalog, menü ve ipucu. Diyalog mobilde alttan açılır.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <TabsDemo />
            </Card>
            <Card className="flex flex-col items-start gap-6">
              <SectionHeading title="Başvuru diyaloğu" description="Katılım şeklini yan yana karşılaştırıp seçer." as="h3" />
              <DialogDemo />
              <MenuDemo />
            </Card>
          </div>
        </KitSection>
      </div>
    </div>
  );
}
