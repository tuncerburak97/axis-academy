// src/components/admin/programs/new-program-dialog.tsx — "Yeni program" diyaloğu (?yeni=1 ile açık gelir)
"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { createProgram } from "@/lib/actions/admin-catalog";
import { FormDialog } from "@/components/admin/action-form";
import { categoryLabels } from "@/components/admin/lib/labels";

export function NewProgramDialog({ defaultOpen }: { defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(Boolean(defaultOpen));
  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Yeni program"
      description="Program pasif başlar. Müfredat ekleyip Genel sekmesinden yayına alırsın."
      action={createProgram}
      submitLabel="Programı oluştur"
      trigger={
        <Button>
          <Plus /> Yeni program
        </Button>
      }
    >
      <Field id="new-program-title" label="Program adı">
        <Input name="title" required minLength={2} maxLength={120} placeholder="Ör. Excel ile Veri Ustalığı" />
      </Field>
      <Field id="new-program-category" label="Kategori">
        <Select name="category" defaultValue="excel">
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="new-program-desc" label="Kısa açıklama" optional>
        <Textarea name="description" rows={2} maxLength={500} />
      </Field>
    </FormDialog>
  );
}
