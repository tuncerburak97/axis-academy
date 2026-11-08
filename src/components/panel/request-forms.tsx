// src/components/panel/request-forms.tsx — talep detayındaki etkileşimler: teklif yanıtı, mesaj gönderme, dosya yükleme
"use client";

import { useActionState, useRef, useState } from "react";
import { Check, Paperclip, Send, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { respondToQuoteAction, sendRequestMessageAction, uploadRequestFilesAction } from "@/lib/actions/member";
import { idleState } from "@/lib/queries/member-types";
import { formatBytes } from "@/lib/format";
import { useActionToast } from "@/components/panel/use-action-toast";
import { ConfirmAction } from "@/components/panel/confirm-action";

export function QuoteActions({ requestId, amountLabel }: { requestId: string; amountLabel: string }) {
  const [state, formAction, pending] = useActionState(respondToQuoteAction, idleState);
  useActionToast(state);
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <form action={formAction}>
        <input type="hidden" name="request_id" value={requestId} />
        <input type="hidden" name="decision" value="accept" />
        <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
          <Check aria-hidden /> Teklifi onayla
        </Button>
      </form>
      <ConfirmAction
        action={respondToQuoteAction}
        fields={{ request_id: requestId, decision: "decline" }}
        trigger="Reddet"
        triggerVariant="ghost"
        triggerSize="lg"
        title="Teklifi reddetmek istiyor musun?"
        description={`${amountLabel} tutarındaki teklif reddedilir ve talebin kapatılır. Fikrini değiştirirsen yeni bir talep oluşturabilirsin. Önce soru sormak istersen aşağıdan ekibe yazabilirsin.`}
        confirmLabel="Teklifi reddet"
      />
    </div>
  );
}

export function MessageForm({ requestId }: { requestId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(sendRequestMessageAction, idleState);
  useActionToast(state, () => formRef.current?.reset());

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="request_id" value={requestId} />
      <label htmlFor="message-body" className="sr-only">
        Mesajın
      </label>
      <Textarea
        id="message-body"
        name="body"
        rows={3}
        maxLength={5000}
        required
        placeholder="Ekibe bir soru sor ya da not bırak…"
        aria-invalid={state.fieldErrors?.body ? true : undefined}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) event.currentTarget.form?.requestSubmit();
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">Ekibimiz genellikle aynı iş günü içinde yanıtlar.</p>
        <Button type="submit" variant="secondary" loading={pending}>
          <Send aria-hidden /> Gönder
        </Button>
      </div>
    </form>
  );
}

const MAX_SIZE = 20 * 1024 * 1024;

export function FileUploadForm({ requestId }: { requestId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [state, formAction, pending] = useActionState(uploadRequestFilesAction, idleState);
  useActionToast(state, () => {
    formRef.current?.reset();
    setFiles([]);
  });
  const tooLarge = files.find((file) => file.size > MAX_SIZE);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="request_id" value={requestId} />
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-4 py-6 text-center transition-colors hover:border-accent hover:bg-accent-soft/40 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
        <Upload className="size-5 text-ink-soft" aria-hidden />
        <span className="text-sm font-semibold">Dosya seç</span>
        <span className="text-xs text-ink-soft">Dosya başına en fazla 20 MB · birden fazla seçebilirsin</span>
        <input
          ref={inputRef}
          type="file"
          name="files"
          multiple
          className="sr-only"
          onChange={(event) => setFiles(Array.from(event.currentTarget.files ?? []))}
        />
      </label>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`} className="flex items-center gap-2 text-sm">
              <Paperclip className="size-4 shrink-0 text-ink-soft" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className={file.size > MAX_SIZE ? "tabular font-mono text-xs font-semibold text-danger-ink" : "tabular font-mono text-xs text-ink-soft"}>
                {formatBytes(file.size)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {tooLarge && <p role="alert" className="text-sm font-medium text-danger-ink">“{tooLarge.name}” 20 MB sınırını aşıyor. Sıkıştırıp tekrar seç.</p>}
      {files.length > 0 && (
        <div className="flex gap-2">
          <Button type="submit" variant="secondary" size="sm" loading={pending} disabled={!!tooLarge}>
            <Upload aria-hidden /> {files.length === 1 ? "Yükle" : `${files.length} dosyayı yükle`}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              formRef.current?.reset();
              setFiles([]);
            }}
          >
            <X aria-hidden /> Vazgeç
          </Button>
        </div>
      )}
    </form>
  );
}
