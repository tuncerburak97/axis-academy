// src/components/panel/instructor-forms.tsx — eğitmen: oturum ekle/düzenle/sil, duyuru yayınla, materyal ekle
"use client";

import { useActionState, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
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
import { addMaterialAction, deleteSessionAction, postAnnouncementAction, saveSessionAction } from "@/lib/actions/member-instructor";
import { idleState, isoToIstanbulLocal, materialCategoryLabels, type MaterialCategory } from "@/lib/queries/member-types";
import { useActionToast } from "@/components/panel/use-action-toast";
import { ConfirmAction } from "@/components/panel/confirm-action";

export interface EditableSession {
  id: string;
  title: string;
  week_number: number | null;
  starts_at: string;
  ends_at: string;
  location: string;
  meeting_url: string;
  notes: string;
}

export function SessionDialog({
  classId,
  session,
  defaults,
}: {
  classId: string;
  session?: EditableSession;
  defaults?: { location: string; meeting_url: string; nextWeek: number };
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(saveSessionAction, idleState);
  useActionToast(state, () => setOpen(false));
  const duration = session ? Math.round((new Date(session.ends_at).getTime() - new Date(session.starts_at).getTime()) / 60_000) : 120;
  const errors = state.fieldErrors ?? {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {session ? (
          <Button variant="ghost" size="icon-sm" aria-label="Oturumu düzenle">
            <Pencil aria-hidden />
          </Button>
        ) : (
          <Button>
            <Plus aria-hidden /> Oturum ekle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex min-h-0 flex-col">
          <input type="hidden" name="class_id" value={classId} />
          {session && <input type="hidden" name="session_id" value={session.id} />}
          <DialogHeader>
            <DialogTitle>{session ? "Oturumu düzenle" : "Yeni oturum"}</DialogTitle>
            <DialogDescription>Saatler Türkiye saatiyle girilir. Oturum öğrencilerin takviminde görünür.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <Field id="session-title" label="Başlık" optional error={errors.title}>
              <Input name="title" defaultValue={session?.title ?? ""} maxLength={200} placeholder="Örn. Pivot tablolar" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <Field id="session-start" label="Başlangıç" error={errors.starts_at}>
                <Input name="starts_at" type="datetime-local" required defaultValue={session ? isoToIstanbulLocal(session.starts_at) : ""} />
              </Field>
              <Field id="session-duration" label="Süre (dk)" error={errors.duration}>
                <Input name="duration" type="number" min={15} max={600} step={15} required defaultValue={duration} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <Field id="session-week" label="Hafta" optional error={errors.week_number}>
                <Input name="week_number" type="number" min={1} max={60} defaultValue={session?.week_number ?? defaults?.nextWeek ?? ""} />
              </Field>
              <Field id="session-location" label="Yer" error={errors.location}>
                <Input name="location" defaultValue={session?.location ?? defaults?.location ?? "Online"} maxLength={200} />
              </Field>
            </div>
            <Field id="session-url" label="Ders bağlantısı" optional error={errors.meeting_url} hint="Öğrenciler derse bu bağlantıyla katılır; dönemin bağlantısı varsayılan gelir.">
              <Input name="meeting_url" type="url" defaultValue={session?.meeting_url ?? defaults?.meeting_url ?? ""} placeholder="https://" />
            </Field>
            <Field id="session-notes" label="Not" optional error={errors.notes}>
              <Textarea name="notes" rows={3} defaultValue={session?.notes ?? ""} maxLength={2000} placeholder="Öğrencilerin hazırlaması gerekenler…" />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Vazgeç
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              {session ? "Kaydet" : "Oturumu ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteSessionButton({ classId, sessionId, label }: { classId: string; sessionId: string; label: string }) {
  return (
    <ConfirmAction
      action={deleteSessionAction}
      fields={{ class_id: classId, session_id: sessionId }}
      trigger={<Trash2 aria-hidden />}
      triggerVariant="ghost"
      triggerSize="icon-sm"
      triggerClassName="text-danger-ink hover:bg-danger-soft"
      title="Oturumu sil"
      description={`${label} oturumu silinir ve öğrencilerin takviminden kalkar.`}
      confirmLabel="Sil"
    />
  );
}

export function AnnouncementForm({ classId }: { classId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(postAnnouncementAction, idleState);
  useActionToast(state, () => formRef.current?.reset());
  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="class_id" value={classId} />
      <Field id="announcement-title" label="Başlık" error={state.fieldErrors?.title}>
        <Input name="title" required minLength={3} maxLength={200} placeholder="Örn. Bu haftaki ders 30 dk geç başlayacak" />
      </Field>
      <Field id="announcement-body" label="Duyuru" hint="Markdown desteklenir. Kayıtlı öğrencilere bildirim gider." error={state.fieldErrors?.body}>
        <Textarea name="body" rows={4} required maxLength={5000} />
      </Field>
      <div>
        <Button type="submit" variant="secondary" loading={pending}>
          Duyuruyu yayınla
        </Button>
      </div>
    </form>
  );
}

export function MaterialForm({ classId, currentWeek }: { classId: string; currentWeek: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(addMaterialAction, idleState);
  useActionToast(state, () => formRef.current?.reset());
  const errors = state.fieldErrors ?? {};
  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="class_id" value={classId} />
      <Field id="material-title" label="Başlık" error={errors.title}>
        <Input name="title" required minLength={2} maxLength={200} placeholder="Örn. 3. hafta alıştırma dosyası" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="material-category" label="Tür" error={errors.category}>
          <Select name="category" defaultValue="weekly">
            {(Object.keys(materialCategoryLabels) as MaterialCategory[]).map((key) => (
              <option key={key} value={key}>
                {materialCategoryLabels[key]}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="material-week" label="Hafta" optional hint="Boş bırakırsan genel kaynaklarda görünür." error={errors.week_number}>
          <Input name="week_number" type="number" min={1} max={60} defaultValue={currentWeek > 0 ? currentWeek : ""} />
        </Field>
      </div>
      <Field id="material-content" label="Metin" optional hint="Markdown desteklenir." error={errors.content_md}>
        <Textarea name="content_md" rows={5} maxLength={20000} />
      </Field>
      <Field id="material-file" label="Dosya" optional hint="PDF, Office, ZIP, TXT ya da MD · en fazla 20 MB" error={errors.file}>
        <Input name="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.md,.txt" className="py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-semibold" />
      </Field>
      <div>
        <Button type="submit" variant="secondary" loading={pending}>
          Materyali ekle
        </Button>
      </div>
    </form>
  );
}
