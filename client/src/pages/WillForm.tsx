import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FORM_STEPS } from "../../../shared/willConstants";
import StepIndicator from "../components/form/StepIndicator";
import FormHeader from "../components/form/FormHeader";
import Step1Appointment from "../components/form/steps/Step1Appointment";
import Step2Client1 from "../components/form/steps/Step2Client1";
import Step3Client2 from "../components/form/steps/Step3Client2";
import Step4Executors from "../components/form/steps/Step4Executors";
import Step5Beneficiaries from "../components/form/steps/Step5Beneficiaries";
import Step6Property from "../components/form/steps/Step6Property";
import Step7Wishes from "../components/form/steps/Step7Wishes";
import Step8Review from "../components/form/steps/Step8Review";
import { useWillForm } from "../hooks/useWillForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function WillForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const { formData, updateFormData, submitForm, isSubmitting } = useWillForm();

  const goNext = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, FORM_STEPS.length));
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
    1: <Step1Appointment data={formData} onChange={updateFormData} />,
    2: <Step2Client1 data={formData} onChange={updateFormData} />,
    3: <Step3Client2 data={formData} onChange={updateFormData} isMirrorWill={isMirrorWill} />,
    4: <Step4Executors data={formData} onChange={updateFormData} />,
    5: <Step5Beneficiaries data={formData} onChange={updateFormData} />,
    6: <Step6Property data={formData} onChange={updateFormData} />,
    7: <Step7Wishes data={formData} onChange={updateFormData} />,
    8: (
      <Step8Review
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
        {currentStep < 8 && (
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
              Step {currentStep} of {FORM_STEPS.length}
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
