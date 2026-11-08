// src/app/(admin)/admin/(dashboard)/yorumlar/page.tsx — yorum moderasyonu: yayınla / geri çek / sil, programa göre filtre
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { getAdminReviews } from "@/lib/queries/admin-moderation";
import { getProgramOptions } from "@/lib/queries/admin-cohorts";
import { deleteReview, setReviewPublished } from "@/lib/actions/admin-moderation";
import { ActionForm, ConfirmAction, Hidden, SubmitButton } from "@/components/admin/action-form";
import { UrlSelect } from "@/components/admin/url-filters";

export const metadata: Metadata = { title: "Yorumlar" };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`5 üzerinden ${rating}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={cn("size-4", index < rating ? "fill-amber text-amber" : "text-line-strong")} aria-hidden />
      ))}
    </span>
  );
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [reviews, programs] = await Promise.all([getAdminReviews({ program: params.program, status: params.durum }), getProgramOptions()]);
  const pending = reviews.filter((review) => !review.is_published).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Yorumlar"
        description={pending ? `${pending} yorum yayın onayı bekliyor. Yayınlanan yorumlarda yalnızca ad ve soyadın baş harfi görünür.` : "Üye yorumları. Yayınlanan yorumlarda yalnızca ad ve soyadın baş harfi görünür."}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Suspense>
          <UrlSelect
            name="program"
            label="Program"
            allLabel="Tüm programlar"
            className="sm:w-64"
            options={programs.map((program) => ({ value: program.id, label: program.title }))}
          />
          <UrlSelect
            name="durum"
            label="Durum"
            allLabel="Tüm yorumlar"
            className="sm:w-48"
            options={[
              { value: "pending", label: "Onay bekleyen" },
              { value: "published", label: "Yayında" },
            ]}
          />
        </Suspense>
      </div>
      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="Yorum yok" description="Dönemini ya da birebir eğitimini tamamlayan üyeler yorum bırakabilir." />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {reviews.map((review) => (
            <li key={review.id} className={cn("flex flex-col rounded-2xl border bg-paper p-5 shadow-card", review.is_published ? "border-line" : "border-amber/60")}>
              <div className="flex flex-wrap items-center gap-2">
                <Stars rating={review.rating} />
                <Badge size="sm" tone={review.is_published ? "success" : "amber"} dot>
                  {review.is_published ? "Yayında" : "Onay bekliyor"}
                </Badge>
                <span className="ml-auto text-xs text-ink-soft">{formatRelative(review.created_at)}</span>
              </div>
              <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed">{review.comment || <span className="text-ink-muted">Yorum metni yok.</span>}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                <Link href={`/admin/kisiler/${review.member.user_id}`} className="font-semibold text-ink hover:text-accent">
                  {review.member.name}
                </Link>
                {review.program && <span>· {review.program.title}</span>}
                {review.cohort && (
                  <Link href={`/admin/donemler/${review.cohort.id}`} className="hover:text-ink">
                    · {review.cohort.title}
                  </Link>
                )}
                {review.request && (
                  <Link href={`/admin/talepler/${review.request.id}`} className="hover:text-ink">
                    · {review.request.title || "Birebir talep"}
                  </Link>
                )}
              </div>
              <div className="mt-4 flex items-center justify-end gap-1 border-t border-line pt-3">
                <ConfirmAction
                  title="Yorum silinsin mi?"
                  description="Yorum kalıcı olarak silinir. Yalnızca gizlemek için “Yayından kaldır” yeterli."
                  action={deleteReview}
                  fields={{ review_id: review.id }}
                  confirmLabel="Sil"
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label="Yorumu sil">
                      <Trash2 />
                    </Button>
                  }
                />
                <ActionForm action={setReviewPublished}>
                  <Hidden name="review_id" value={review.id} />
                  <Hidden name="publish" value={review.is_published ? "false" : "true"} />
                  <SubmitButton size="sm" variant={review.is_published ? "outline" : "soft"}>
                    {review.is_published ? "Yayından kaldır" : "Yayınla"}
                  </SubmitButton>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
