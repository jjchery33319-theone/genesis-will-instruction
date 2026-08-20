import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FORM_STEPS, LPA_ONLY_STEPS, WILL_PRODUCT_IDS } from "../../../shared/willConstants";
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
import { StepLpaDetails } from "../components/form/steps/StepLpaDetails";
import { useWillForm, type WillFormData } from "../hooks/useWillForm";
import TranscriptUploadDialog from "../components/TranscriptUploadDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Loader2, Upload } from "lucide-react";

// ─── LPA-only detection ───────────────────────────────────────────────────────
/**
 * Returns true when the user has selected at least one LPA product
 * AND no Will/Trust products — i.e. this is a pure LPA-only instruction.
 */
function detectLpaOnly(productsOrdered: string[] | undefined): boolean {
  if (!productsOrdered || productsOrdered.length === 0) return false;
  const hasWill = productsOrdered.some(id => WILL_PRODUCT_IDS.has(id));
  if (hasWill) return false;
  // Must have at least one LPA product
  return productsOrdered.some(id =>
    id === "lpa_property_finance" || id === "lpa_health_welfare" || id === "both_lpas"
  );
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
    saveAsDraft,
    isSavingDraft,
    isLoadingResume,
  } = useWillForm();
  const [uploadOpen, setUploadOpen] = useState(false);

  const applyUploadedData = useCallback((data: Record<string, unknown>) => {
    updateFormData(data as Partial<WillFormData>);
    goToStep(1);
  }, [updateFormData, goToStep]);

  const isLpaOnly = detectLpaOnly(formData.productsOrdered);
  const isMirrorWill =
    formData.productsOrdered?.includes("mirror_wills") ||
    formData.willType === "Mirror Wills";

  // The active step list depends on whether this is LPA-only
  const activeSteps = isLpaOnly ? LPA_ONLY_STEPS : FORM_STEPS;
  const TOTAL_STEPS = activeSteps.length;

  // In LPA-only mode, step 7 (the last step) maps to the Review component.
  // In full mode, step 15 is Review.
  // We use a mapping from "virtual step number" → component.
  const stepComponents = useMemo((): Record<number, React.ReactNode> => {
    if (isLpaOnly) {
      return {
        1: <Step1Appointment data={formData} onChange={updateFormData} />,
        2: <Step2Clients data={formData} onChange={updateFormData} isMirrorWill={false} />,
        3: <Step3FamilyBackground data={formData} onChange={updateFormData} isMirrorWill={false} />,
        4: <Step4AdditionalBackground data={formData} onChange={updateFormData} isMirrorWill={false} />,
        5: <Step5DueDiligence data={formData} onChange={updateFormData} />,
        6: <StepLpaDetails data={formData} onChange={updateFormData} />,
        7: (
          <Step15Review
            data={formData}
            onChange={updateFormData}
            onEdit={goToStep}
            onSubmit={submitForm}
            isSubmitting={isSubmitting}
          />
        ),
      };
    }
    return {
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
          onChange={updateFormData}
          onEdit={goToStep}
          onSubmit={submitForm}
          isSubmitting={isSubmitting}
        />
      ),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLpaOnly, isMirrorWill, formData, updateFormData, goToStep, submitForm, isSubmitting]);

  // When switching between LPA-only and full mode, clamp currentStep to valid range
  const effectiveStep = Math.min(currentStep, TOTAL_STEPS);

  const goNext = useCallback(() => {
    goToStep(Math.min(effectiveStep + 1, TOTAL_STEPS));
  }, [effectiveStep, TOTAL_STEPS, goToStep]);

  const goPrev = useCallback(() => {
    goToStep(Math.max(effectiveStep - 1, 1));
  }, [effectiveStep, goToStep]);

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
        <div className="flex justify-end mb-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setUploadOpen(true)}
            className="gap-2"
            style={{ borderColor: "oklch(0.28 0.07 155)", color: "oklch(0.28 0.07 155)" }}
          >
            <Upload className="w-4 h-4" />
            Upload Instructions
          </Button>
        </div>
        <StepIndicator
          steps={activeSteps}
          currentStep={effectiveStep}
          onStepClick={goToStep}
        />

        {/* LPA-only banner */}
        {isLpaOnly && (
          <div
            className="mt-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{
              background: "oklch(0.93 0.05 250)",
              color: "oklch(0.25 0.1 250)",
              border: "1.5px solid oklch(0.75 0.12 250)",
            }}
          >
            <span>📋</span>
            <span>
              <strong>LPA-only instruction</strong> — Will-specific sections are hidden. Only Appointment, Clients, Family, Background, Due Diligence, LPA Details (donors, attorneys &amp; certificate provider) and Review are required.
            </span>
          </div>
        )}

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${isLpaOnly ? "lpa" : "full"}-${effectiveStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              {stepComponents[effectiveStep]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {effectiveStep < TOTAL_STEPS && (
          <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border gap-2">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={effectiveStep === 1}
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
                Step {effectiveStep} of {TOTAL_STEPS}
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

      <TranscriptUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onApply={applyUploadedData}
      />
    </div>
  );
}
