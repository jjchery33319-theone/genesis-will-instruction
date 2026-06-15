import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FORM_STEPS } from "../../../shared/willConstants";
import StepIndicator from "../components/form/StepIndicator";
import FormHeader from "../components/form/FormHeader";
import Step1Appointment from "../components/form/steps/Step1Appointment";
import Step2Clients from "../components/form/steps/Step2Clients";
import Step3FamilyBackground from "../components/form/steps/Step4FamilyBackground";
import Step4AdditionalBackground from "../components/form/steps/Step5AdditionalBackground";
import Step5DueDiligence from "../components/form/steps/Step6DueDiligence";
import Step6Executors from "../components/form/steps/Step4Executors";
import Step7Property from "../components/form/steps/Step6Property";
import Step8LifeInsurance from "../components/form/steps/Step10LifeInsurance";
import Step9BusinessInterests from "../components/form/steps/Step11BusinessInterests";
import Step10Pets from "../components/form/steps/Step13Pets";
import Step11FuneralWishes from "../components/form/steps/Step14Wishes";
import Step12Gifts from "../components/form/steps/Step12Gifts";
import Step13Beneficiaries from "../components/form/steps/Step5Beneficiaries";
import Step14DisasterClause from "../components/form/steps/Step15DisasterClause";
import Step15Review from "../components/form/steps/Step8Review";
import { useWillForm } from "../hooks/useWillForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Trash2, Save, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";

const TOTAL_STEPS = FORM_STEPS.length;

// ─── Auto-save status badge ────────────────────────────────────────────────────
function AutoSaveBadge({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  return (
    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all duration-300"
      style={{
        background: status === "saved" ? "oklch(0.93 0.05 155)" :
                    status === "saving" ? "oklch(0.93 0.03 240)" :
                    "oklch(0.93 0.05 30)",
        color: status === "saved" ? "oklch(0.28 0.07 155)" :
               status === "saving" ? "oklch(0.28 0.07 240)" :
               "oklch(0.35 0.12 30)",
      }}
    >
      {status === "saving" && <><Save className="w-3 h-3 animate-pulse" /> Saving…</>}
      {status === "saved" && <><CheckCircle2 className="w-3 h-3" /> Draft saved</>}
      {status === "error" && <><AlertCircle className="w-3 h-3" /> Save failed</>}
    </div>
  );
}

// ─── Draft restore banner ─────────────────────────────────────────────────────
function DraftRestoreBanner({
  savedAt,
  step,
  onRestore,
  onDiscard,
}: {
  savedAt: Date;
  step: number;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  const stepName = FORM_STEPS[step - 1]?.title ?? `Step ${step}`;
  const timeAgo = formatTimeAgo(savedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-xl border-2 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      style={{
        background: "oklch(0.97 0.02 85)",
        borderColor: "oklch(0.75 0.14 85)",
      }}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.88 0.12 85)" }}>
          <Clock className="w-4 h-4" style={{ color: "oklch(0.45 0.14 85)" }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "oklch(0.35 0.10 85)" }}>
            Unsaved draft found
          </p>
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.50 0.08 85)" }}>
            Last saved {timeAgo} — was on <strong>{stepName}</strong>. Would you like to continue where you left off?
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onDiscard}
          className="gap-1.5 text-xs"
          style={{ borderColor: "oklch(0.75 0.14 85)", color: "oklch(0.45 0.14 85)" }}
        >
          <Trash2 className="w-3 h-3" />
          Discard
        </Button>
        <Button
          size="sm"
          onClick={onRestore}
          className="gap-1.5 text-xs font-semibold"
          style={{ background: "oklch(0.55 0.14 85)", color: "white" }}
        >
          <RotateCcw className="w-3 h-3" />
          Restore Draft
        </Button>
      </div>
    </motion.div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function WillForm() {
  const {
    formData,
    updateFormData,
    submitForm,
    isSubmitting,
    currentStep,
    goToStep,
    autoSaveStatus,
    hasDraft,
    draftInfo,
    restoreDraft,
    discardDraft,
    saveAsDraft,
    isSavingDraft,
    isLoadingResume,
  } = useWillForm();

  const goNext = useCallback(() => {
    goToStep(Math.min(currentStep + 1, TOTAL_STEPS));
  }, [currentStep, goToStep]);

  const goPrev = useCallback(() => {
    goToStep(Math.max(currentStep - 1, 1));
  }, [currentStep, goToStep]);

  const isMirrorWill =
    formData.productsOrdered?.includes("mirror_wills") ||
    formData.willType === "Mirror Wills";

  const stepComponents: Record<number, React.ReactNode> = {
    1:  <Step1Appointment data={formData} onChange={updateFormData} />,
    2:  <Step2Clients data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    3:  <Step3FamilyBackground data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    4:  <Step4AdditionalBackground data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    5:  <Step5DueDiligence data={formData} onChange={updateFormData} />,
    6:  <Step6Executors data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    7:  <Step7Property data={formData} onChange={updateFormData} />,
    8:  <Step8LifeInsurance data={formData} onChange={updateFormData} />,
    9:  <Step9BusinessInterests data={formData} onChange={updateFormData} />,
    10: <Step10Pets data={formData} onChange={updateFormData} />,
    11: <Step11FuneralWishes data={formData} onChange={updateFormData} />,
    12: <Step12Gifts data={formData} onChange={updateFormData} />,
    13: <Step13Beneficiaries data={formData} onChange={updateFormData} />,
    14: <Step14DisasterClause data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    15: (
      <Step15Review
        data={formData}
        onEdit={goToStep}
        onSubmit={submitForm}
        isSubmitting={isSubmitting}
      />
    ),
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      <FormHeader />

      <div className="container py-6 max-w-5xl">
        {/* Draft restore banner */}
        <AnimatePresence>
          {hasDraft && draftInfo && (
            <DraftRestoreBanner
              savedAt={draftInfo.savedAt}
              step={draftInfo.step}
              onRestore={restoreDraft}
              onDiscard={discardDraft}
            />
          )}
        </AnimatePresence>

        {/* Step indicator with auto-save badge */}
        <div className="relative">
          <StepIndicator
            steps={FORM_STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
          {/* Auto-save badge — floats top-right of the step indicator */}
          <div className="absolute top-2 right-3 z-10">
            <AutoSaveBadge status={autoSaveStatus} />
          </div>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              {stepComponents[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep < TOTAL_STEPS && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={saveAsDraft}
                disabled={isSavingDraft}
                className="gap-2 text-xs"
                style={{ borderColor: "oklch(0.75 0.14 85)", color: "oklch(0.35 0.10 85)" }}
              >
                {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Draft
              </Button>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
            </div>

            <Button
              onClick={goNext}
              className="gap-2"
              style={{ background: "oklch(0.28 0.07 155)", color: "oklch(0.97 0.03 90)" }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
