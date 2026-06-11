import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { id: number; title: string; subtitle: string };

interface StepIndicatorProps {
  steps: readonly Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  const totalSteps = steps.length;
  const progressPct = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const currentStepData = steps.find((s) => s.id === currentStep);

  // Show a window of 7 steps centred on the current step
  const WINDOW = 7;
  const half = Math.floor(WINDOW / 2);
  let windowStart = Math.max(1, currentStep - half);
  let windowEnd = windowStart + WINDOW - 1;
  if (windowEnd > totalSteps) {
    windowEnd = totalSteps;
    windowStart = Math.max(1, windowEnd - WINDOW + 1);
  }
  const visibleSteps = steps.filter((s) => s.id >= windowStart && s.id <= windowEnd);
  const showLeftEllipsis = windowStart > 1;
  const showRightEllipsis = windowEnd < totalSteps;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      {/* ── Top bar: step info + progress ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: "oklch(0.18 0.06 155)" }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "oklch(0.78 0.12 85)" }}>
            Step {currentStep} of {totalSteps}
          </p>
          <p className="text-sm font-bold text-white mt-0.5">
            {currentStepData?.title}
            {currentStepData?.subtitle && (
              <span className="font-normal text-white/60 ml-2 text-xs">— {currentStepData.subtitle}</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50 mb-1">{Math.round(progressPct)}% complete</p>
          <div className="w-28 h-1.5 rounded-full bg-white/20">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: "oklch(0.78 0.12 85)" }}
            />
          </div>
        </div>
      </div>

      {/* ── Step bubbles row ───────────────────────────────────────────────── */}
      <div className="flex items-center px-3 py-2.5 gap-0.5 overflow-x-auto scrollbar-none">
        {/* Left ellipsis */}
        {showLeftEllipsis && (
          <button
            onClick={() => onStepClick(windowStart - 1)}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={`Back to step ${windowStart - 1}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {visibleSteps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = step.id <= currentStep;
          const isFirst = index === 0 && !showLeftEllipsis;
          const isLast = index === visibleSteps.length - 1 && !showRightEllipsis;

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                title={`${step.title} — ${step.subtitle}`}
                className={cn(
                  "flex flex-col items-center gap-1 flex-shrink-0 transition-all duration-200 px-1",
                  isClickable ? "cursor-pointer" : "cursor-default",
                  isActive ? "scale-110" : "opacity-80 hover:opacity-100"
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2",
                    isCompleted && "border-transparent",
                    isActive && "border-transparent ring-2 ring-offset-1",
                    !isCompleted && !isActive && "border-border bg-muted text-muted-foreground"
                  )}
                  style={
                    isCompleted
                      ? { background: "oklch(0.78 0.12 85)", color: "oklch(0.2 0.05 155)" }
                      : isActive
                      ? {
                          background: "oklch(0.28 0.07 155)",
                          color: "#fff",
                        }
                      : {}
                  }
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span>{step.id}</span>}
                </div>

                {/* Label — only show on md+ */}
                <span
                  className={cn(
                    "hidden md:block text-[10px] font-semibold leading-none whitespace-nowrap",
                    isActive ? "genesis-green-text" : isCompleted ? "gold-text" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector */}
              {index < visibleSteps.length - 1 && (
                <div
                  className="h-0.5 flex-1 mx-0.5 rounded-full transition-all duration-300 min-w-[8px]"
                  style={{
                    background:
                      step.id < currentStep
                        ? "oklch(0.78 0.12 85)"
                        : "oklch(0.92 0.01 155)",
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Right ellipsis */}
        {showRightEllipsis && (
          <button
            onClick={() => onStepClick(windowEnd + 1)}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={`Jump to step ${windowEnd + 1}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
