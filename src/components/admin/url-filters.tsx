// src/components/admin/url-filters.tsx — URL'de tutulan arama kutusu ve seçim filtresi (liste sayfaları için)
"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/field";

function useParamUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const update = React.useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("sayfa");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );
  return { params, update };
}

export function UrlSearchInput({ name = "q", placeholder, label }: { name?: string; placeholder: string; label: string }) {
  const { params, update } = useParamUpdater();
  const [value, setValue] = React.useState(params.get(name) ?? "");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if ((params.get(name) ?? "") !== value) update(name, value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, params, name, update]);
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
      <Input type="search" value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} aria-label={label} className="pl-10" />
    </div>
  );
}

export function UrlSelect({
  name,
  label,
  options,
  allLabel,
  className,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  allLabel: string;
  className?: string;
}) {
  const { params, update } = useParamUpdater();
  return (
    <Select aria-label={label} value={params.get(name) ?? ""} onChange={(event) => update(name, event.target.value)} className={className}>
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
