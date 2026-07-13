// src/components/panel/progress-stepper.tsx — 4 adımlı ilerleme göstergesi (mobil kompakt)
import { Check } from "lucide-react";

interface ProgressStepperProps {
  steps: string[];
  currentIndex: number; // -1: iptal (hiçbir adım aktif değil)
}

export function ProgressStepper({ steps, currentIndex }: ProgressStepperProps) {
  return (
    <>
      {/* Mobil: dikey kompakt liste */}
      <ol className="space-y-2 sm:hidden" aria-label="İlerleme durumu">
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li
              key={step}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                isCurrent ? "bg-accent-soft font-semibold text-ink" : "text-ink-soft"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? "bg-success text-white"
                    : isCurrent
                      ? "bg-accent text-white"
                      : "bg-surface text-ink-soft"
                }`}
              >
                {isDone ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>
              {step}
            </li>
          );
        })}
      </ol>

      {/* Desktop: yatay stepper */}
      <ol className="hidden items-center gap-0 sm:flex" aria-label="İlerleme durumu">
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li key={step} className="flex flex-1 items-center last:flex-none">
              <span className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isDone
                      ? "bg-success text-white"
                      : isCurrent
                        ? "bg-accent text-white"
                        : "bg-surface text-ink-soft"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isDone ? <Check className="size-4" aria-hidden /> : index + 1}
                </span>
                <span className={`whitespace-nowrap text-[11px] font-medium ${isCurrent ? "text-ink" : "text-ink-soft"}`}>
                  {step}
                </span>
              </span>
              {index < steps.length - 1 && (
                <span aria-hidden className={`mx-2 mb-5 h-0.5 flex-1 rounded ${isDone ? "bg-success" : "bg-line"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
