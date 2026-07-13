// src/components/admin/class-list-tabs.tsx — sınıf listesi: filtre + 2 sekme
"use client";

import { useMemo, useState } from "react";
import { ClassListCard } from "@/components/admin/class-list-card";
import { ClassPendingPanel } from "@/components/admin/class-pending-panel";
import { classStatusLabels } from "@/lib/types/catalog";
import type { AdminClassRow, ClassStatus } from "@/lib/types/catalog";
import type { PendingEnrollmentRow } from "@/lib/queries/admin-classes";

type ListTab = "classes" | "pending";

interface ClassListTabsProps {
  classes: AdminClassRow[];
  pendingEnrollments: PendingEnrollmentRow[];
  initialTab?: ListTab;
}

export function ClassListTabs({ classes, pendingEnrollments, initialTab = "classes" }: ClassListTabsProps) {
  const [activeTab, setActiveTab] = useState<ListTab>(initialTab);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ClassStatus | "all">("all");

  const moduleOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of classes) {
      if (c.education_modules) map.set(c.module_id, c.education_modules.title);
    }
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [classes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return classes.filter((c) => {
      if (moduleFilter !== "all" && c.module_id !== moduleFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.education_modules?.title.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [classes, search, moduleFilter, statusFilter]);

  const tabs: { id: ListTab; label: string; count?: number }[] = [
    { id: "classes", label: "Sınıflar", count: classes.length },
    { id: "pending", label: "Bekleyen Onaylar", count: pendingEnrollments.length },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Sınıf yönetimi sekmeleri" className="scroll-fade-x border-b border-line">
        <div className="flex gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-11 shrink-0 snap-start whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 sm:py-3 ${
                  isActive ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1.5 rounded-full bg-surface px-2 py-0.5 text-xs">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="mt-6">
        {activeTab === "classes" && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="class-search" className="block text-sm font-medium">Ara</label>
                <input
                  id="class-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Sınıf veya modül adı..."
                  className="mt-1 w-full min-h-11 rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-accent"
                />
              </div>
              <div className="w-full sm:w-48">
                <label htmlFor="module-filter" className="block text-sm font-medium">Modül</label>
                <select
                  id="module-filter"
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="mt-1 w-full min-h-11 rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-accent"
                >
                  <option value="all">Tümü</option>
                  {moduleOptions.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-40">
                <label htmlFor="status-filter" className="block text-sm font-medium">Durum</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ClassStatus | "all")}
                  className="mt-1 w-full min-h-11 rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-accent"
                >
                  <option value="all">Tümü</option>
                  {(Object.keys(classStatusLabels) as ClassStatus[]).map((s) => (
                    <option key={s} value={s}>{classStatusLabels[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((trainingClass) => (
                <ClassListCard key={trainingClass.id} trainingClass={trainingClass} />
              ))}
              {filtered.length === 0 && (
                <p className="rounded-xl border border-dashed border-line bg-white p-6 text-sm text-ink-soft md:col-span-2 xl:col-span-3">
                  {classes.length === 0
                    ? "Henüz sınıf yok. Sağ üstten \"Sınıf Aç\" ile ilk sınıfı oluştur."
                    : "Filtrelere uygun sınıf bulunamadı."}
                </p>
              )}
            </div>
            {filtered.length > 0 && (
              <p className="mt-4 text-xs text-ink-soft">
                {filtered.length} / {classes.length} sınıf gösteriliyor
                {moduleOptions.length > 0 && ` · ${moduleOptions.length} modül`}
              </p>
            )}
          </>
        )}

        {activeTab === "pending" && <ClassPendingPanel enrollments={pendingEnrollments} />}
      </div>
    </div>
  );
}
