// src/components/admin/class-announcements-panel.tsx — sınıf duyuru CRUD
"use client";

import { Plus } from "lucide-react";
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/actions/admin-classes";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { SubmitButton, TextArea, TextInput } from "@/components/admin/fields";
import type { ClassAnnouncement } from "@/lib/types/catalog";

interface ClassAnnouncementsPanelProps {
  classId: string;
  announcements: ClassAnnouncement[];
}

export function ClassAnnouncementsPanel({ classId, announcements }: ClassAnnouncementsPanelProps) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Duyurular yalnızca bu sınıfa kayıtlı öğrencilerin panelinde görünür.
        </p>
        <AdminFormDialog
          title="Yeni Duyuru"
          triggerLabel="Duyuru Ekle"
          triggerIcon={<Plus className="size-4" aria-hidden />}
          triggerVariant="primary"
          size="lg"
        >
          <form action={createAnnouncement} className="space-y-4">
            <input type="hidden" name="class_id" value={classId} />
            <AnnouncementFields />
            <SubmitButton>Yayınla</SubmitButton>
          </form>
        </AdminFormDialog>
      </div>

      {announcements.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line bg-white p-6 text-sm text-ink-soft">
          Henüz duyuru yok.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {announcements.map((item) => (
            <article key={item.id} className="rounded-xl border border-line bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-ink-soft">
                    {new Date(item.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AnnouncementEditDialog classId={classId} announcement={item} />
                  <ConfirmDeleteButton
                    action={deleteAnnouncement}
                    hiddenFields={[
                      { name: "announcement_id", value: item.id },
                      { name: "class_id", value: classId },
                    ]}
                    label="Sil"
                    confirmTitle="Duyuruyu sil?"
                    confirmMessage={`"${item.title}" kaldırılacak.`}
                  />
                </div>
              </div>
              {item.body && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{item.body}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementFields({ announcement }: { announcement?: ClassAnnouncement }) {
  return (
    <>
      <TextInput name="title" label="Başlık" defaultValue={announcement?.title} required />
      <TextArea name="body" label="İçerik (Markdown desteklenir)" defaultValue={announcement?.body} rows={6} />
    </>
  );
}

function AnnouncementEditDialog({
  classId,
  announcement,
}: {
  classId: string;
  announcement: ClassAnnouncement;
}) {
  return (
    <AdminFormDialog title="Duyuruyu Düzenle" triggerLabel="Düzenle" triggerVariant="text" size="lg">
      <form action={updateAnnouncement} className="space-y-4">
        <input type="hidden" name="announcement_id" value={announcement.id} />
        <input type="hidden" name="class_id" value={classId} />
        <AnnouncementFields announcement={announcement} />
        <SubmitButton>Güncelle</SubmitButton>
      </form>
    </AdminFormDialog>
  );
}
