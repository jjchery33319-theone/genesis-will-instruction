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
import { ChevronLeft, ChevronRight, Save, Loader2 } from "lucide-react";

const TOTAL_STEPS = FORM_STEPS.length;

// ─── Main component ───────────────────────────────────────────────────────────
export default function WillForm() {
  const {
    formData,
    updateFormData,
    submitForm,
    isSubmitting,
    currentStep,
    goToStep,
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

  if (isLoadingResume) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.01 155)" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
          <p className="text-sm text-muted-foreground">Loading draft…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      <FormHeader />

      <div className="container py-6 max-w-5xl">
        <StepIndicator
          steps={FORM_STEPS}
          currentStep={currentStep}
          onStepClick={goToStep}
        />

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
          <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border gap-2">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentStep === 1}
              className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={saveAsDraft}
                disabled={isSavingDraft}
                className="gap-1.5 text-xs px-2.5 sm:px-3"
                style={{ borderColor: "oklch(0.75 0.14 85)", color: "oklch(0.35 0.10 85)" }}
              >
                {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Draft</span>
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
            </div>

            <Button
              onClick={goNext}
              className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4"
              style={{ background: "oklch(0.28 0.07 155)", color: "oklch(0.97 0.03 90)" }}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
