// src/components/admin/requests/request-filters.tsx — talep filtreleri (tür, durum, sorumlu, arama) ve liste/pano geçişi; URL'de tutulur
"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search } from "lucide-react";
import { Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { requestKindLabels, requestStatusAdminLabels } from "@/lib/types/platform";

export function RequestFilters({ admins }: { admins: { user_id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");
  const view = params.get("view") === "board" ? "board" : "list";

  const update = React.useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) update("q", q);
    }, 300);
    return () => clearTimeout(timer);
  }, [q, params, update]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <Input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Başlık, mesaj ya da üye ara"
          aria-label="Taleplerde ara"
          className="pl-10"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:w-auto">
        <Select aria-label="Tür" value={params.get("kind") ?? ""} onChange={(event) => update("kind", event.target.value)} className="lg:w-40">
          <option value="">Tüm türler</option>
          {Object.entries(requestKindLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select aria-label="Durum" value={params.get("status") ?? ""} onChange={(event) => update("status", event.target.value)} className="lg:w-40">
          <option value="">Tüm durumlar</option>
          <option value="active">Açık olanlar</option>
          {Object.entries(requestStatusAdminLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Sorumlu"
          value={params.get("assignee") ?? ""}
          onChange={(event) => update("assignee", event.target.value)}
          className="col-span-2 sm:col-span-1 lg:w-44"
        >
          <option value="">Tüm sorumlular</option>
          <option value="none">Atanmamış</option>
          {admins.map((admin) => (
            <option key={admin.user_id} value={admin.user_id}>
              {admin.name}
            </option>
          ))}
        </Select>
      </div>
      <div role="group" aria-label="Görünüm" className="flex w-fit gap-1 rounded-xl bg-surface p-1 ring-1 ring-inset ring-line">
        {(
          [
            ["list", "Liste", List],
            ["board", "Pano", LayoutGrid],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => update("view", value === "list" ? "" : value)}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
              view === value ? "bg-paper text-ink shadow-card" : "text-ink-soft hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
