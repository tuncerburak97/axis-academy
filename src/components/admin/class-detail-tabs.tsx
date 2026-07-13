// src/components/admin/class-detail-tabs.tsx — sınıf detay 4 sekmeli görünüm
"use client";

import { useState } from "react";
import { ClassAnnouncementsPanel } from "@/components/admin/class-announcements-panel";
import { ClassGeneralPanel } from "@/components/admin/class-general-panel";
import { ClassMaterialsPanel } from "@/components/admin/class-materials-panel";
import { ClassStudentsPanel } from "@/components/admin/class-students-panel";
import type { ClassAnnouncement, ClassEnrollmentRow, ClassMaterial, ClassStatus } from "@/lib/types/catalog";

type ClassTab = "general" | "students" | "announcements" | "materials";

interface ClassDetailTabsProps {
  trainingClass: {
    id: string;
    title: string;
    start_date: string;
    schedule_note: string;
    duration_hours: number;
    capacity: number;
    status: ClassStatus;
    duration_weeks: number;
    current_week_override: number | null;
    overview: string;
    education_modules: { title: string } | null;
  };
  approvedCount: number;
  pendingCount: number;
  enrollments: ClassEnrollmentRow[];
  announcements: ClassAnnouncement[];
  materials: ClassMaterial[];
  signedUrlMap: Record<string, string>;
  initialTab?: ClassTab;
}

const tabLabels: Record<ClassTab, string> = {
  general: "Genel",
  students: "Öğrenciler",
  announcements: "Duyurular",
  materials: "Materyaller",
};

export function ClassDetailTabs({
  trainingClass,
  approvedCount,
  pendingCount,
  enrollments,
  announcements,
  materials,
  signedUrlMap,
  initialTab = "general",
}: ClassDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<ClassTab>(initialTab);

  const tabs: { id: ClassTab; count?: number }[] = [
    { id: "general" },
    { id: "students", count: enrollments.filter((e) => e.status !== "cancelled").length },
    { id: "announcements", count: announcements.length },
    { id: "materials", count: materials.length },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Sınıf yönetimi sekmeleri" className="scroll-fade-x border-b border-line">
        <div className="flex gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const showPending = tab.id === "students" && pendingCount > 0;
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
                {showPending && (
                  <span className="ml-1.5 rounded-full bg-amber-soft px-2 py-0.5 text-xs font-semibold text-amber-900">
                    {pendingCount}
                  </span>
                )}
                {!showPending && tab.count !== undefined && (
                  <span className="ml-1.5 rounded-full bg-surface px-2 py-0.5 text-xs">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="mt-6">
        {activeTab === "general" && (
          <ClassGeneralPanel trainingClass={trainingClass} approvedCount={approvedCount} />
        )}
        {activeTab === "students" && (
          <ClassStudentsPanel classId={trainingClass.id} enrollments={enrollments} />
        )}
        {activeTab === "announcements" && (
          <ClassAnnouncementsPanel classId={trainingClass.id} announcements={announcements} />
        )}
        {activeTab === "materials" && (
          <ClassMaterialsPanel
            classId={trainingClass.id}
            materials={materials}
            signedUrlMap={signedUrlMap}
          />
        )}
      </div>
    </div>
  );
}
