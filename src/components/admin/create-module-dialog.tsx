// src/components/admin/create-module-dialog.tsx — yeni modül ekleme popup
"use client";

import { Plus } from "lucide-react";
import { createModule } from "@/lib/actions/admin-catalog";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { CreateModuleFields } from "@/components/admin/module-catalog-fields";
import { SubmitButton } from "@/components/admin/fields";

export function CreateModuleDialog() {
  return (
    <AdminFormDialog
      title="Yeni Modül"
      triggerLabel="Modül Ekle"
      triggerIcon={<Plus className="size-4" aria-hidden />}
      triggerVariant="primary"
      description="Temel bilgileri gir; detaylı düzenleme modül sayfasında yapılır."
    >
      <form action={createModule} className="space-y-4">
        <CreateModuleFields />
        <SubmitButton>Modül Oluştur</SubmitButton>
      </form>
    </AdminFormDialog>
  );
}
