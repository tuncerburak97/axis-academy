// src/components/admin/sessions/session-dialog.tsx — oturum ekle/düzenle diyaloğu (dönem ya da talep)
"use client";

import * as React from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { saveSession } from "@/lib/actions/admin-sessions";
import { FormDialog, Hidden } from "@/components/admin/action-form";
import { splitIstanbul } from "@/components/admin/lib/time";
import type { SessionRow } from "@/lib/types/platform";

interface SessionDialogProps {
  trigger: React.ReactNode;
  session?: SessionRow;
  classId?: string;
  requestId?: string;
  /** Dönem oturumlarında hafta numarası sorulur */
  withWeek?: boolean;
  defaults?: { location?: string; meeting_url?: string };
}

export function SessionDialog({ trigger, session, classId, requestId, withWeek, defaults }: SessionDialogProps) {
  const start = session ? splitIstanbul(session.starts_at) : null;
  const end = session ? splitIstanbul(session.ends_at) : null;
  const prefix = session?.id ?? "new";
  return (
    <FormDialog
      trigger={trigger}
      title={session ? "Oturumu düzenle" : "Oturum ekle"}
      description="Saatler İstanbul saatine göre. Kayıtlı üyeler oturumu takviminde görür."
      action={saveSession}
      submitLabel={session ? "Kaydet" : "Oturumu ekle"}
      resetOnSuccess={!session}
    >
      {session && <Hidden name="session_id" value={session.id} />}
      {!session && classId && <Hidden name="class_id" value={classId} />}
      {!session && requestId && <Hidden name="request_id" value={requestId} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
        <Field id={`${prefix}-title`} label="Başlık" optional>
          <Input name="title" defaultValue={session?.title ?? ""} placeholder="Ör. Pivot tablolar" maxLength={200} />
        </Field>
        {withWeek && (
          <Field id={`${prefix}-week`} label="Hafta" optional>
            <Input name="week_number" type="number" min={1} max={104} defaultValue={session?.week_number ?? ""} />
          </Field>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field id={`${prefix}-date`} label="Tarih" className="col-span-2 sm:col-span-1">
          <Input name="date" type="date" required defaultValue={start?.date ?? ""} />
        </Field>
        <Field id={`${prefix}-start`} label="Başlangıç">
          <Input name="start_time" type="time" required defaultValue={start?.time ?? "19:00"} />
        </Field>
        <Field id={`${prefix}-end`} label="Bitiş">
          <Input name="end_time" type="time" required defaultValue={end?.time ?? "21:00"} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${prefix}-location`} label="Yer">
          <Input name="location" defaultValue={session?.location ?? defaults?.location ?? "Online"} maxLength={200} />
        </Field>
        <Field id={`${prefix}-url`} label="Toplantı linki" optional>
          <Input name="meeting_url" type="url" defaultValue={session?.meeting_url ?? defaults?.meeting_url ?? ""} placeholder="https://" />
        </Field>
      </div>
      <Field id={`${prefix}-notes`} label="Not" optional hint="Üye de görür.">
        <Textarea name="notes" rows={2} defaultValue={session?.notes ?? ""} maxLength={2000} />
      </Field>
    </FormDialog>
  );
}
