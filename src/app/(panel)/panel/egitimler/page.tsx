// src/app/(panel)/panel/egitimler/page.tsx — eğitimlerim: aktif dönemler, başvurular, tamamlananlar
import type { Metadata } from "next";
import Link from "next/link";
import { Award, Compass, GraduationCap, Hourglass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyEnrollmentViews } from "@/lib/queries/member";
import type { EnrollmentGroup, EnrollmentView } from "@/lib/queries/member-types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Accent, PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrollmentCard } from "@/components/panel/enrollment-card";

export const metadata: Metadata = { title: "Eğitimlerim" };
export const dynamic = "force-dynamic";

const tabs: { value: EnrollmentGroup; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "application", label: "Başvurular" },
  { value: "completed", label: "Tamamlanan" },
];

const empty: Record<EnrollmentGroup, { icon: typeof Compass; title: string; description: string }> = {
  active: {
    icon: GraduationCap,
    title: "Şu an devam eden eğitimin yok",
    description: "Yaklaşan dönemlerden birine katıl; derslerin, materyallerin ve ilerlemen burada toplanır.",
  },
  application: {
    icon: Hourglass,
    title: "Bekleyen başvurun yok",
    description: "Program sayfasından bir döneme başvurduğunda onay durumu burada görünür.",
  },
  completed: {
    icon: Award,
    title: "Henüz tamamlanan eğitimin yok",
    description: "Dönemi bitirdiğinde katılım belgen Belgelerim bölümüne eklenir.",
  },
};

export default async function TrainingsPage() {
  const user = await requireUser("/panel/egitimler");
  const views = await getMyEnrollmentViews(user.id);
  const byGroup = (group: EnrollmentGroup) => views.filter((view) => view.group === group);
  const counts = { active: byGroup("active").length, application: byGroup("application").length, completed: byGroup("completed").length };
  const defaultTab: EnrollmentGroup = counts.active ? "active" : counts.application ? "application" : counts.completed ? "completed" : "active";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={
          <>
            <Accent>Eğitimlerim</Accent>
          </>
        }
        description="Katıldığın dönemler, başvuruların ve tamamladığın eğitimler."
        actions={
          <Button asChild variant="outline">
            <Link href="/programlar">
              <Compass aria-hidden /> Program keşfet
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList aria-label="Eğitim durumu">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {counts[tab.value] > 0 && <span className="tabular font-mono text-xs text-ink-muted">{counts[tab.value]}</span>}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Group views={byGroup(tab.value)} group={tab.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Group({ views, group }: { views: EnrollmentView[]; group: EnrollmentGroup }) {
  if (!views.length) {
    const { icon, title, description } = empty[group];
    return (
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={
          group === "completed" ? undefined : (
            <Button asChild>
              <Link href="/programlar">Yaklaşan dönemleri gör</Link>
            </Button>
          )
        }
      />
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {views.map((view) => (
        <EnrollmentCard key={view.enrollment.id} view={view} />
      ))}
    </div>
  );
}
