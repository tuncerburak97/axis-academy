// src/components/admin/module-detail-tabs.tsx — modül detay 3 sekmeli görünüm
"use client";

import { useState } from "react";
import { updateModule } from "@/lib/actions/admin-catalog";
import { ModuleBundlesPanel } from "@/components/admin/module-bundles-panel";
import { ModulePlansPanel } from "@/components/admin/module-plans-panel";
import { ModuleInfoFields } from "@/components/admin/module-catalog-fields";
import { SubmitButton } from "@/components/admin/fields";
import type { BundlePackage, EducationModule, PricingPlan } from "@/lib/types/catalog";

type ModuleTab = "general" | "plans" | "bundles";

interface ModuleDetailTabsProps {
  module: EducationModule;
  plans: PricingPlan[];
  bundles: BundlePackage[];
}

const tabLabels: Record<ModuleTab, string> = {
  general: "Genel Görünüm",
  plans: "Fiyat Planları",
  bundles: "Örnek Paketler",
};

export function ModuleDetailTabs({ module, plans, bundles }: ModuleDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<ModuleTab>("general");

  const tabs: { id: ModuleTab; count?: number }[] = [
    { id: "general" },
    { id: "plans", count: plans.length },
    { id: "bundles", count: bundles.length },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Modül yönetimi sekmeleri" className="scroll-fade-x border-b border-line">
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
                {tabLabels[tab.id]}
                {tab.count !== undefined && (
                  <span className="ml-1.5 rounded-full bg-surface px-2 py-0.5 text-xs">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="mt-6">
        {activeTab === "general" && (
          <section aria-labelledby="module-info-heading" className="max-w-2xl rounded-xl border border-line bg-white p-6 shadow-sm">
            <h2 id="module-info-heading" className="font-display text-lg font-semibold">
              Modül Bilgileri
            </h2>
            <form action={updateModule} className="mt-4 space-y-4">
              <input type="hidden" name="module_id" value={module.id} />
              <ModuleInfoFields module={module} />
              <SubmitButton>Kaydet</SubmitButton>
            </form>
          </section>
        )}

        {activeTab === "plans" && <ModulePlansPanel moduleId={module.id} plans={plans} />}
        {activeTab === "bundles" && <ModuleBundlesPanel moduleId={module.id} bundles={bundles} />}
      </div>
    </div>
  );
}
