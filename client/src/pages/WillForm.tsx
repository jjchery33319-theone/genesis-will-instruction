import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FORM_STEPS } from "../../../shared/willConstants";
import StepIndicator from "../components/form/StepIndicator";
import FormHeader from "../components/form/FormHeader";
import Step1Appointment from "../components/form/steps/Step1Appointment";
import Step2Client1 from "../components/form/steps/Step2Client1";
import Step3Client2 from "../components/form/steps/Step3Client2";
import Step4FamilyBackground from "../components/form/steps/Step4FamilyBackground";
import Step5AdditionalBackground from "../components/form/steps/Step5AdditionalBackground";
import Step6DueDiligence from "../components/form/steps/Step6DueDiligence";
import Step7Executors from "../components/form/steps/Step4Executors";
import Step8Beneficiaries from "../components/form/steps/Step5Beneficiaries";
import Step9Property from "../components/form/steps/Step6Property";
import Step10LifeInsurance from "../components/form/steps/Step10LifeInsurance";
import Step11BusinessInterests from "../components/form/steps/Step11BusinessInterests";
import Step12Gifts from "../components/form/steps/Step12Gifts";
import Step13Pets from "../components/form/steps/Step13Pets";
import Step14Wishes from "../components/form/steps/Step14Wishes";
import Step15DisasterClause from "../components/form/steps/Step15DisasterClause";
import Step16Review from "../components/form/steps/Step8Review";
import { useWillForm } from "../hooks/useWillForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL_STEPS = FORM_STEPS.length;

export default function WillForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const { formData, updateFormData, submitForm, isSubmitting } = useWillForm();

  const goNext = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const isMirrorWill =
    formData.productsOrdered?.includes("mirror_wills") ||
    formData.willType === "Mirror Wills";

  const stepComponents: Record<number, React.ReactNode> = {
    1:  <Step1Appointment data={formData} onChange={updateFormData} />,
    2:  <Step2Client1 data={formData} onChange={updateFormData} />,
    3:  <Step3Client2 data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    4:  <Step4FamilyBackground data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    5:  <Step5AdditionalBackground data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    6:  <Step6DueDiligence data={formData} onChange={updateFormData} />,
    7:  <Step7Executors data={formData} onChange={updateFormData} />,
    // New order: Property/assets first, then beneficiaries/gifts/wishes last
    8:  <Step9Property data={formData} onChange={updateFormData} />,
    9:  <Step10LifeInsurance data={formData} onChange={updateFormData} />,
    10: <Step11BusinessInterests data={formData} onChange={updateFormData} />,
    11: <Step13Pets data={formData} onChange={updateFormData} />,
    12: <Step8Beneficiaries data={formData} onChange={updateFormData} />,
    13: <Step12Gifts data={formData} onChange={updateFormData} />,
    14: <Step14Wishes data={formData} onChange={updateFormData} />,
    15: <Step15DisasterClause data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    16: (
      <Step16Review
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

            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </span>

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
