// src/components/panel/review-form.tsx — 1–5 yıldız + yorum; yorum admin onayından sonra yayınlanır
"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { submitReviewAction } from "@/lib/actions/member";
import { idleState } from "@/lib/queries/member-types";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/components/panel/use-action-toast";

const ratingWords = ["", "Hiç memnun kalmadım", "Beklentimin altında", "Fena değil", "Memnun kaldım", "Çok memnun kaldım"];

export function ReviewForm({ target, targetId }: { target: "class" | "request"; targetId: string }) {
  const [state, formAction, pending] = useActionState(submitReviewAction, idleState);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  useActionToast(state);
  const shown = hover || rating;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="target" value={target} />
      <input type="hidden" name="target_id" value={targetId} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Puanın</legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer rounded-lg p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent" onMouseEnter={() => setHover(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="sr-only"
                required
              />
              <Star
                className={cn("size-8 transition-colors", value <= shown ? "fill-amber text-amber" : "text-line-strong")}
                aria-hidden
              />
              <span className="sr-only">{value} yıldız</span>
            </label>
          ))}
          <span className="ml-2 text-sm text-ink-soft" aria-live="polite">
            {ratingWords[shown]}
          </span>
        </div>
      </fieldset>
      <Field id="review-comment" label="Yorumun" optional hint="Neler işine yaradı, neler daha iyi olabilirdi? Adın kısaltılarak gösterilir.">
        <Textarea name="comment" rows={4} maxLength={2000} placeholder="Örneğin: Her hafta kendi dosyalarım üzerinden çalışmak çok faydalıydı." />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending} disabled={!rating}>
          Değerlendirmeyi gönder
        </Button>
        <p className="text-xs text-ink-soft">Yorumun onaylandıktan sonra yayınlanır.</p>
      </div>
    </form>
  );
}

export function ReviewSummary({ review }: { review: { rating: number; comment: string; is_published: boolean } }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1" aria-label={`${review.rating} / 5`}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Star key={value} className={cn("size-5", value <= review.rating ? "fill-amber text-amber" : "text-line-strong")} aria-hidden />
        ))}
      </div>
      {review.comment && <p className="text-sm leading-relaxed text-ink">“{review.comment}”</p>}
      <p className="text-xs text-ink-soft">
        {review.is_published ? "Yorumun yayında. Teşekkürler!" : "Yorumun alındı; onaylandıktan sonra yayınlanır."}
      </p>
    </div>
  );
}
