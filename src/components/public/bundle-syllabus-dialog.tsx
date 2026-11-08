// src/components/public/bundle-syllabus-dialog.tsx — birebir paketin hafta hafta müfredatı (diyalog)
"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Price } from "@/components/ui/data";
import { SyllabusTimeline, type TimelineWeek } from "@/components/public/syllabus-timeline";

export function BundleSyllabusDialog({
  title,
  description,
  price,
  hours,
  weeks,
  requestHref,
}: {
  title: string;
  description: string;
  price: number;
  hours: number;
  weeks: TimelineWeek[];
  requestHref: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="soft" size="sm">
          <BookOpen /> Müfredatı gör
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <p className="mt-1 flex items-baseline gap-3 text-sm text-ink-soft">
            <Price amount={price} className="text-base text-ink" />
            <span className="tabular font-mono">{hours} saat</span>
          </p>
        </DialogHeader>
        <DialogBody>
          {weeks.length > 0 ? (
            <SyllabusTimeline weeks={weeks} compact />
          ) : (
            <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-ink-soft">
              Bu paketin hafta planı ilk görüşmede seviyene göre çıkarılır.
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button asChild>
            <Link href={requestHref}>Bu paketi iste</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
