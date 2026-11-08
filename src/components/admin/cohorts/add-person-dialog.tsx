// src/components/admin/cohorts/add-person-dialog.tsx — "Kişi ekle": ad/e-posta ile ara, döneme onaylı ekle (admin_add_enrollment)
"use client";

import * as React from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/data";
import { Input } from "@/components/ui/field";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addPersonToCohort, searchPeopleForCohort, type PersonHit } from "@/lib/actions/admin-cohorts";
import { useRunAction } from "@/components/admin/action-form";

export function AddPersonDialog({ classId }: { classId: string }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<PersonHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { run, pending } = useRunAction();
  const [adding, setAdding] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      const result = await searchPeopleForCohort(classId, query);
      if (!cancelled) {
        setHits(result);
        setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, classId]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
          setHits([]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus /> Kişi ekle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Döneme kişi ekle</DialogTitle>
          <DialogDescription>Eklenen kişi onaylı kayıt olur ve e-posta alır. Bekleyen başvurusu varsa onaylanır.</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ad ya da e-posta"
              aria-label="Kişi ara"
              className="pl-10"
            />
          </div>
          <div className="min-h-32">
            {loading && (
              <p className="flex items-center gap-2 py-6 text-sm text-ink-soft">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Aranıyor…
              </p>
            )}
            {!loading && query.trim().length >= 2 && hits.length === 0 && (
              <p className="py-6 text-sm text-ink-soft">Eşleşen kişi yok ya da zaten kayıtlı. Kişinin önce siteye üye olması gerekir.</p>
            )}
            <ul className="flex flex-col gap-1">
              {hits.map((person) => (
                <li key={person.user_id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface">
                  <Avatar name={person.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{person.name}</p>
                    <p className="truncate text-xs text-ink-soft">{person.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="soft"
                    loading={pending && adding === person.user_id}
                    disabled={pending}
                    onClick={() => {
                      setAdding(person.user_id);
                      run(addPersonToCohort, { class_id: classId, user_id: person.user_id }, () => {
                        setHits((list) => list.filter((item) => item.user_id !== person.user_id));
                      });
                    }}
                  >
                    Ekle
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
