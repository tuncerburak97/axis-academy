// src/components/admin/create-class-dialog.tsx — yeni sınıf popup
"use client";

import { Plus } from "lucide-react";
import { createClass } from "@/lib/actions/admin-classes";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { CreateClassFields } from "@/components/admin/class-fields";
import { SubmitButton } from "@/components/admin/fields";

interface CreateClassDialogProps {
  moduleOptions: { value: string; label: string }[];
}

export function CreateClassDialog({ moduleOptions }: CreateClassDialogProps) {
  return (
    <AdminFormDialog
      title="Yeni Sınıf"
      triggerLabel="Sınıf Aç"
      triggerIcon={<Plus className="size-4" aria-hidden />}
      triggerVariant="primary"
      description="Temel bilgileri gir; öğrenci ve içerik yönetimi sınıf detayında yapılır."
      size="lg"
    >
      <form action={createClass} className="space-y-4">
        <CreateClassFields moduleOptions={moduleOptions} />
        <SubmitButton>Sınıf Oluştur</SubmitButton>
      </form>
    </AdminFormDialog>
  );
}
