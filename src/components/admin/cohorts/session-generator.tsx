// src/components/admin/cohorts/session-generator.tsx — "Haftalık oturum oluştur": ilk tarih, gün, saat, adet → müfredat başlıklı oturumlar
"use client";

import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { generateWeeklySessions } from "@/lib/actions/admin-sessions";
import { FormDialog, Hidden } from "@/components/admin/action-form";
import { weekdayNames, weekdayOf } from "@/components/admin/lib/time";

export function SessionGenerator({
  classId,
  startDate,
  weeks,
  nextWeek,
  syllabusCount,
}: {
  classId: string;
  startDate: string;
  weeks: number;
  nextWeek: number;
  syllabusCount: number;
}) {
  const remaining = Math.max(1, (weeks || syllabusCount || 4) - nextWeek + 1);
  return (
    <FormDialog
      title="Haftalık oturum oluştur"
      description={
        syllabusCount > 0
          ? "Başlıklar program müfredatından gelir; sonra tek tek düzenleyebilirsin."
          : "Programda müfredat yok; oturumlar “Hafta N” adıyla oluşur."
      }
      action={generateWeeklySessions}
      submitLabel="Oturumları oluştur"
      trigger={
        <Button variant="outline" size="sm">
          <CalendarRange /> Haftalık oluştur
        </Button>
      }
    >
      <Hidden name="class_id" value={classId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="gen-first" label="İlk oturum tarihi" hint="Seçtiğin güne denk gelen ilk tarihten başlar.">
          <Input name="first_date" type="date" required defaultValue={startDate} />
        </Field>
        <Field id="gen-weekday" label="Gün">
          <Select name="weekday" defaultValue={String(weekdayOf(startDate))}>
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <option key={day} value={day}>
                {weekdayNames[day]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field id="gen-start" label="Başlangıç">
          <Input name="start_time" type="time" required defaultValue="19:00" />
        </Field>
        <Field id="gen-end" label="Bitiş">
          <Input name="end_time" type="time" required defaultValue="21:00" />
        </Field>
        <Field id="gen-count" label="Adet">
          <Input name="count" type="number" min={1} max={52} required defaultValue={remaining} className="tabular font-mono" />
        </Field>
        <Field id="gen-week" label="İlk hafta no">
          <Input name="first_week" type="number" min={1} max={104} required defaultValue={nextWeek} className="tabular font-mono" />
        </Field>
      </div>
    </FormDialog>
  );
}
