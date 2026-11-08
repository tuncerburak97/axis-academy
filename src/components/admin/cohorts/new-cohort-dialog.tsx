// src/components/admin/cohorts/new-cohort-dialog.tsx — "Yeni dönem" diyaloğu (?yeni=1 ile açık gelir)
"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCohort } from "@/lib/actions/admin-cohorts";
import { FormDialog } from "@/components/admin/action-form";
import { CohortFields } from "@/components/admin/cohorts/cohort-fields";

export function NewCohortDialog({
  programs,
  instructors,
  defaultOpen,
}: {
  programs: { id: string; title: string; is_active?: boolean }[];
  instructors: { user_id: string; name: string; role: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(Boolean(defaultOpen));
  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      size="lg"
      title="Yeni dönem"
      description="Dönem oluşunca katalogda yayına girer; oturumları sonra haftalık üreticiyle ekleyebilirsin."
      action={createCohort}
      submitLabel="Dönemi oluştur"
      trigger={
        <Button>
          <Plus /> Yeni dönem
        </Button>
      }
    >
      <CohortFields programs={programs} instructors={instructors} prefix="new-cohort" />
    </FormDialog>
  );
}
