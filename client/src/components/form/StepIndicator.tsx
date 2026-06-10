import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { id: number; title: string; subtitle: string };

interface StepIndicatorProps {
  steps: readonly Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-4">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = step.id <= currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-0">
              {/* Step circle */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1 flex-shrink-0 group transition-all duration-200",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200",
                    isCompleted && "text-white",
                    isActive && "text-white ring-4 step-active",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground"
                  )}
                  style={
                    isCompleted
                      ? { background: "oklch(0.78 0.12 85)", color: "oklch(0.2 0.05 155)" }
                      : isActive
                      ? {
                          background: "oklch(0.28 0.07 155)",
                        }
                      : {}
                  }
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="hidden sm:block text-center">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      isActive ? "genesis-green-text" : isCompleted ? "gold-text" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight hidden md:block">
                    {step.subtitle}
                  </p>
                </div>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className="h-0.5 flex-1 mx-1 rounded-full transition-all duration-300"
                  style={{
                    background:
                      step.id < currentStep
                        ? "oklch(0.78 0.12 85)"
                        : "oklch(0.88 0.02 155)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
