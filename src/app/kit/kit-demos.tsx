// src/app/kit/kit-demos.tsx — kit vitrinindeki etkileşimli örnekler (sekme, diyalog, menü, bildirim)
"use client";

import { useState } from "react";
import { Archive, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger, Tooltip } from "@/components/ui/menu";
import { ChoiceCard } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast.success("Başvurun alındı", { description: "Onaylandığında sana e-posta göndereceğiz." })}
      >
        Başarılı bildirim
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("Dosya yüklenemedi", { description: "Dosya 20 MB'tan büyük. Küçültüp tekrar dene." })}
      >
        Hata bildirimi
      </Button>
    </div>
  );
}

export function TabsDemo() {
  return (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="grup">
        <TabsList aria-label="Katılım şekli">
          <TabsTrigger value="grup">Grup dönemi</TabsTrigger>
          <TabsTrigger value="birebir">Birebir</TabsTrigger>
          <TabsTrigger value="kurumsal">Kurumsal</TabsTrigger>
        </TabsList>
        <TabsContent value="grup" className="text-sm text-ink-soft">
          Tarihli, kontenjanlı dönemler. Fiyat kişi sayısına göre sabittir.
        </TabsContent>
        <TabsContent value="birebir" className="text-sm text-ink-soft">
          Konuları ve saati sen seçersin; ders günlerini birlikte planlarız.
        </TabsContent>
        <TabsContent value="kurumsal" className="text-sm text-ink-soft">
          Ekibine özel program ve teklif.
        </TabsContent>
      </Tabs>

      <Tabs defaultValue="mufredat" tabStyle="line">
        <TabsList aria-label="Dönem detayı">
          <TabsTrigger value="mufredat">Müfredat</TabsTrigger>
          <TabsTrigger value="materyal">Materyaller</TabsTrigger>
          <TabsTrigger value="duyuru">Duyurular</TabsTrigger>
          <TabsTrigger value="ogrenci">Öğrenciler</TabsTrigger>
        </TabsList>
        <TabsContent value="mufredat" className="text-sm text-ink-soft">Hafta hafta konu akışı.</TabsContent>
        <TabsContent value="materyal" className="text-sm text-ink-soft">PDF ve Office dosyaları.</TabsContent>
        <TabsContent value="duyuru" className="text-sm text-ink-soft">Döneme özel duyurular.</TabsContent>
        <TabsContent value="ogrenci" className="text-sm text-ink-soft">Kayıtlı öğrenciler.</TabsContent>
      </Tabs>
    </div>
  );
}

export function DialogDemo() {
  const [plan, setPlan] = useState("grup");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Yerimi ayır</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excel ile Veri Ustalığı</DialogTitle>
          <DialogDescription>18 Kasım dönemi · 6 hafta · Salı ve Perşembe 19:00</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <ChoiceCard
            name="plan"
            value="grup"
            checked={plan === "grup"}
            onChange={() => setPlan("grup")}
            title="Grup dönemi"
            meta="₺4.800"
            description="12 kişilik online sınıf, kayıtlar ve materyaller dahil."
          />
          <ChoiceCard
            name="plan"
            value="birebir"
            checked={plan === "birebir"}
            onChange={() => setPlan("birebir")}
            title="Birebir"
            meta="₺900 / saat"
            description="Konuları sen seç, takvimi birlikte belirleyelim."
          />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Vazgeç</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => toast.success("Başvurun alındı", { description: "Onaylandığında haber vereceğiz." })}>
              Başvuruyu gönder
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MenuDemo() {
  return (
    <div className="flex items-center gap-2">
      <Menu>
        <Tooltip content="Diğer işlemler">
          <MenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Diğer işlemler">
              <MoreHorizontal />
            </Button>
          </MenuTrigger>
        </Tooltip>
        <MenuContent>
          <MenuLabel>Dönem</MenuLabel>
          <MenuItem>
            <Pencil aria-hidden /> Düzenle
          </MenuItem>
          <MenuItem>
            <Archive aria-hidden /> Arşivle
          </MenuItem>
          <MenuSeparator />
          <MenuItem tone="danger">
            <Trash2 aria-hidden /> Sil
          </MenuItem>
        </MenuContent>
      </Menu>
      <span className="text-sm text-ink-soft">İkon butonlar ipucu gösterir</span>
    </div>
  );
}
