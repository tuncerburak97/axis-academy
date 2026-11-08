// src/components/admin/command-palette.tsx — ⌘K komut paleti: hızlı geçiş + talep/kişi/dönem/program araması
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, CornerDownLeft, Loader2, Search } from "lucide-react";
import { Kbd } from "@/components/ui/data";
import { cn } from "@/lib/utils";
import { adminSearch, type SearchHit } from "@/lib/actions/admin-search";
import { adminNavGroups } from "@/components/admin/nav-config";

interface PaletteEntry {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  href: string;
}

const quickEntries: (PaletteEntry & { keywords: string })[] = [
  ...adminNavGroups.flatMap((group) =>
    group.items.map((item) => ({
      id: `nav-${item.href}`,
      group: "Git",
      title: item.label,
      subtitle: group.label,
      href: item.href,
      keywords: `${item.label} ${item.keywords ?? ""}`,
    })),
  ),
  { id: "new-cohort", group: "Oluştur", title: "Yeni dönem", href: "/admin/donemler?yeni=1", keywords: "yeni dönem sınıf oluştur" },
  { id: "new-post", group: "Oluştur", title: "Yeni blog yazısı", href: "/admin/blog/yeni", keywords: "yeni yazı blog" },
  { id: "new-program", group: "Oluştur", title: "Yeni program", href: "/admin/programlar?yeni=1", keywords: "yeni program modül" },
];

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR");
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<SearchHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K her yerden açar
  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setHits([]);
      setActive(0);
    }
  }, [open]);

  // Sunucu araması (gecikmeli)
  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await adminSearch(q);
        if (!cancelled) setHits(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const entries: PaletteEntry[] = React.useMemo(() => {
    const q = normalize(query.trim());
    const quick = q ? quickEntries.filter((entry) => normalize(entry.keywords).includes(q)) : quickEntries;
    return [...hits, ...quick];
  }, [hits, query]);

  React.useEffect(() => setActive(0), [entries.length]);

  React.useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(entry: PaletteEntry | undefined) {
    if (!entry) return;
    onOpenChange(false);
    router.push(entry.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, entries.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(entries[active]);
    }
  }

  let lastGroup = "";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px] data-[state=open]:animate-[overlay-in_160ms_ease-out]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-3 top-[10vh] z-50 mx-auto flex max-h-[70vh] max-w-xl flex-col overflow-hidden rounded-2xl bg-paper shadow-pop focus:outline-none data-[state=open]:animate-[dialog-in_160ms_var(--ease-out-soft)]"
        >
          <DialogPrimitive.Title className="sr-only">Komut paleti</DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b border-line px-4">
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-ink-soft" aria-hidden />
            ) : (
              <Search className="size-4 shrink-0 text-ink-soft" aria-hidden />
            )}
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Talep, kişi, dönem ara ya da bir sayfaya git…"
              className="min-h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-muted"
              role="combobox"
              aria-expanded
              aria-controls="admin-palette-list"
              aria-activedescendant={entries[active] ? `palette-${entries[active].id}` : undefined}
            />
            <Kbd>Esc</Kbd>
          </div>
          <div ref={listRef} id="admin-palette-list" role="listbox" className="min-h-0 flex-1 overflow-y-auto p-2">
            {entries.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-ink-soft">
                {loading ? "Aranıyor…" : "Sonuç yok. Başka bir kelime dene."}
              </p>
            )}
            {entries.map((entry, index) => {
              const showGroup = entry.group !== lastGroup;
              lastGroup = entry.group;
              return (
                <React.Fragment key={entry.id}>
                  {showGroup && (
                    <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{entry.group}</p>
                  )}
                  <div
                    id={`palette-${entry.id}`}
                    role="option"
                    aria-selected={index === active}
                    data-index={index}
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(entry)}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm",
                      index === active ? "bg-accent-soft text-accent-ink" : "text-ink",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{entry.title}</span>
                      {entry.subtitle && <span className="block truncate text-xs text-ink-soft">{entry.subtitle}</span>}
                    </span>
                    {index === active ? (
                      <CornerDownLeft className="size-4 shrink-0" aria-hidden />
                    ) : (
                      <ArrowRight className="size-4 shrink-0 text-ink-muted" aria-hidden />
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <div className="hidden items-center gap-4 border-t border-line bg-surface/60 px-4 py-2.5 text-xs text-ink-soft sm:flex">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> gezin
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>Enter</Kbd> aç
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>Esc</Kbd> kapat
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
