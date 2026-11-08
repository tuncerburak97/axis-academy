// src/components/public/apply-dialog.tsx — döneme başvuru diyaloğu ve sayfadaki tüm "Yerimi ayır" butonlarının ortak durumu
// Giriş yoksa butonlar /giris?next=/programlar/<slug>?basvur=<id> adresine gider; dönüşte diyalog kendiliğinden açılır.
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Tag } from "lucide-react";
import { applyToCohort, checkDiscountCode, type ApplyState } from "@/lib/actions/enroll";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChoiceCard, Field, Input, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Price } from "@/components/ui/data";
import { toast } from "@/components/ui/toast";
import { applyDiscount, formatDate, formatTRY } from "@/lib/format";
import type { CatalogCohort } from "@/lib/types/platform";

type Cohort = Pick<
  CatalogCohort,
  "id" | "title" | "start_date" | "schedule_note" | "capacity" | "taken_seats" | "status" | "price" | "my_status" | "duration_weeks" | "location"
>;

interface ApplyContextValue {
  loggedIn: boolean;
  openApply: (classId?: string) => void;
  loginHref: (classId?: string) => string;
  firstOpenId: string | null;
}

const ApplyContext = React.createContext<ApplyContextValue | null>(null);

const isFull = (cohort: Cohort) => cohort.status === "full" || cohort.taken_seats >= cohort.capacity;

export function ApplyProvider({
  slug,
  cohorts,
  loggedIn,
  initialClassId,
  children,
}: {
  slug: string;
  cohorts: Cohort[];
  loggedIn: boolean;
  initialClassId?: string | null;
  children: React.ReactNode;
}) {
  const applicable = React.useMemo(() => cohorts.filter((cohort) => !cohort.my_status), [cohorts]);
  const firstOpenId = (applicable.find((cohort) => !isFull(cohort)) ?? applicable[0])?.id ?? null;
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(firstOpenId);

  const openApply = React.useCallback(
    (classId?: string) => {
      setSelectedId(classId && applicable.some((cohort) => cohort.id === classId) ? classId : firstOpenId);
      setOpen(true);
    },
    [applicable, firstOpenId],
  );

  const loginHref = React.useCallback(
    (classId?: string) => {
      const target = `/programlar/${slug}?basvur=${classId ?? firstOpenId ?? ""}`;
      return `/giris?next=${encodeURIComponent(target)}`;
    },
    [slug, firstOpenId],
  );

  // Girişten dönüşte (?basvur=) diyalog kendiliğinden açılır
  React.useEffect(() => {
    if (!loggedIn || !initialClassId) return;
    if (applicable.some((cohort) => cohort.id === initialClassId)) openApply(initialClassId);
    // yalnızca ilk yüklemede
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && typeof window !== "undefined" && window.location.search.includes("basvur=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("basvur");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  };

  return (
    <ApplyContext.Provider value={{ loggedIn, openApply, loginHref, firstOpenId }}>
      {children}
      {loggedIn && applicable.length > 0 && (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent size="md">
            {open && (
              <ApplyForm
                slug={slug}
                cohorts={applicable}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onCancel={() => handleOpenChange(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </ApplyContext.Provider>
  );
}

/** "Yerimi ayır" butonu: giriş varsa diyaloğu açar, yoksa girişe yönlendirir */
export function ApplyButton({
  classId,
  children,
  ...props
}: Omit<ButtonProps, "onClick" | "asChild"> & { classId?: string }) {
  const context = React.useContext(ApplyContext);
  if (!context || (!classId && !context.firstOpenId)) return null;
  if (!context.loggedIn) {
    return (
      <Button asChild {...props}>
        <Link href={context.loginHref(classId)}>{children}</Link>
      </Button>
    );
  }
  return (
    <Button type="button" onClick={() => context.openApply(classId)} {...props}>
      {children}
    </Button>
  );
}

const initialState: ApplyState = {};

function ApplyForm({
  slug,
  cohorts,
  selectedId,
  onSelect,
  onCancel,
}: {
  slug: string;
  cohorts: Cohort[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState(applyToCohort, initialState);
  const [code, setCode] = React.useState("");
  const [discount, setDiscount] = React.useState<{ code: string; percent: number } | null>(null);
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [checking, startChecking] = React.useTransition();

  const selected = cohorts.find((cohort) => cohort.id === selectedId) ?? null;
  const full = selected ? isFull(selected) : false;
  const price = selected?.price ? Number(selected.price) : null;

  React.useEffect(() => {
    if (state.result) {
      toast.success(state.result === "waitlisted" ? "Bekleme listesine eklendin" : "Başvurun alındı", {
        description:
          state.result === "waitlisted"
            ? "Yer açılınca sana e-posta ve bildirimle haber vereceğiz."
            : "Onaylandığında e-posta ve bildirim alacaksın.",
      });
      router.push("/panel/egitimler");
    } else if (state.loginHref) {
      router.push(state.loginHref);
    }
  }, [state, router]);

  const applyCode = () => {
    setCodeError(null);
    if (code.trim().length < 3) {
      setCodeError("Kodu eksiksiz yaz.");
      return;
    }
    startChecking(async () => {
      const result = await checkDiscountCode(code);
      if (result.percent) {
        setDiscount({ code: result.code, percent: result.percent });
      } else {
        setDiscount(null);
        setCodeError("Bu kod geçerli değil ya da süresi dolmuş.");
      }
    });
  };

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="returnPath" value={`/programlar/${slug}`} />
      <input type="hidden" name="discountCode" value={discount?.code ?? code.trim()} />
      <DialogHeader>
        <DialogTitle>{full ? "Bekleme listesine katıl" : "Yerini ayır"}</DialogTitle>
        <DialogDescription>
          Başvurun ekibimize düşer; onaylanınca e-posta ve panel bildirimi alırsın. Ödeme platform dışında konuşulur.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-5">
        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium text-ink">Dönem</legend>
          {cohorts.map((cohort) => {
            const cohortFull = isFull(cohort);
            const left = Math.max(0, cohort.capacity - cohort.taken_seats);
            return (
              <ChoiceCard
                key={cohort.id}
                name="classId"
                value={cohort.id}
                checked={selectedId === cohort.id}
                onChange={() => onSelect(cohort.id)}
                title={formatDate(cohort.start_date)}
                meta={cohort.price ? formatTRY(cohort.price) : undefined}
                description={
                  <>
                    <span className="tabular font-mono">{cohort.schedule_note || cohort.title}</span>
                    <span className="mt-1 block text-xs font-semibold">
                      {cohortFull ? (
                        <span className="text-danger-ink">Dolu · bekleme listesine katılırsın</span>
                      ) : left <= 3 ? (
                        <span className="text-amber-ink">Son {left} yer</span>
                      ) : (
                        <span>{left} yer var</span>
                      )}
                    </span>
                  </>
                }
              />
            );
          })}
        </fieldset>

        <Field id="apply-note" label="Eklemek istediğin bir not" optional hint="Seviyen, beklentin ya da kaçıracağın bir ders varsa yaz.">
          <Textarea name="note" rows={3} maxLength={1000} placeholder="Örn. Temel seviyedeyim, en çok raporlama konusunda zorlanıyorum." />
        </Field>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="apply-code" className="flex items-baseline justify-between text-sm font-medium text-ink">
            İndirim kodu <span className="text-xs font-normal text-ink-muted">İsteğe bağlı</span>
          </label>
          <div className="flex gap-2">
            <Input
              id="apply-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setDiscount(null);
                setCodeError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyCode();
                }
              }}
              placeholder="AXIS10"
              autoComplete="off"
              maxLength={32}
              aria-invalid={codeError ? true : undefined}
              aria-describedby={codeError ? "apply-code-error" : undefined}
              className="font-mono uppercase"
            />
            <Button type="button" variant="outline" onClick={applyCode} loading={checking} className="shrink-0">
              Uygula
            </Button>
          </div>
          {codeError && (
            <p id="apply-code-error" role="alert" className="text-[13px] font-medium text-danger-ink">
              {codeError}
            </p>
          )}
          {discount && (
            <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success-ink">
              <Check className="size-3.5" aria-hidden /> {discount.code} uygulandı: %{discount.percent} indirim
            </p>
          )}
        </div>

        {price !== null && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
              <Tag className="size-4" aria-hidden /> Kişi başı ücret
            </span>
            <span className="flex items-baseline gap-2">
              {discount && <span className="tabular font-mono text-sm text-ink-muted line-through">{formatTRY(price)}</span>}
              <Price amount={applyDiscount(price, discount?.percent)} className="text-lg" />
            </span>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Vazgeç
        </Button>
        <Button type="submit" loading={pending} disabled={!selected || Boolean(state.result)}>
          {full ? "Bekleme listesine katıl" : "Başvuruyu gönder"}
        </Button>
      </DialogFooter>
    </form>
  );
}
