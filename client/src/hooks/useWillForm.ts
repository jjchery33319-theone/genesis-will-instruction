import { useState, useCallback, useEffect, useRef } from "react";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export type PersonEntry = {
  prefix?: string;
  firstName: string;
  lastName: string;
  relationship?: string;
  address?: string;
  phone?: string;
  email?: string;
  dob?: string;
  share?: string;
  isVulnerable?: boolean;
  notes?: string;
};

export type SpecificGift = {
  description: string;
  recipient: string;
  value?: string;
  isCharity?: boolean;
  notes?: string;
};

export type LifeInsurancePolicy = {
  provider: string;
  policyNumber?: string;
  sumAssured?: string;
  inTrust?: boolean;
  beneficiary?: string;
  notes?: string;
};

export type BusinessInterestEntry = {
  businessName: string;
  natureOfBusiness: string;
  ownershipPercentage?: string;
  notes?: string;
};

export type ChildEntry = {
  firstName: string;
  lastName?: string;
  dob?: string;
  ageGroup: "under18" | "over18";
  hasSpecialNeeds?: boolean;
  specialNeedsDetails?: string;
  relationship?: string;
  notes?: string;
};

export type WillFormData = {
  // Step 1 — Appointment
  appointmentDate?: string;
  appointmentTime?: string;
  consultantName?: string;
  consultantEmail?: string;
  consultantPhone?: string;
  caseCoordinatorName?: string;
  caseCoordinatorEmail?: string;
  caseCoordinatorPhone?: string;
  priceQuoted?: string;
  estimatedDraftDate?: string;
  productsOrdered?: string[];
  willType?: string;
  lpaType?: string;

  // Step 2 — Client 1
  client1Prefix?: string;
  client1FirstName?: string;
  client1MiddleName?: string;
  client1LastName?: string;
  client1Dob?: string;
  client1AddressLine1?: string;
  client1City?: string;
  client1Postcode?: string;
  client1MaritalStatus?: string;
  client1JobTitle?: string;
  client1DaytimePhone?: string;
  client1Mobile?: string;
  client1Email?: string;
  client1Nationality?: string;

  // Step 3 — Client 2
  client2Prefix?: string;
  client2FirstName?: string;
  client2MiddleName?: string;
  client2LastName?: string;
  client2Dob?: string;
  client2AddressLine1?: string;
  client2City?: string;
  client2Postcode?: string;
  client2MaritalStatus?: string;
  client2JobTitle?: string;
  client2DaytimePhone?: string;
  client2Mobile?: string;
  client2Email?: string;
  client2Nationality?: string;

  // Step 4 — Family Background
  client1MarriagePlans?: string;
  client1MarriagePlanDetails?: string;
  client1HasChildren?: string;
  client1TotalChildren?: string;
  client1ChildrenSpecialNeeds?: string;
  client1ChildrenSpecialNeedsDetails?: string;
  client1ChildrenUnder18?: ChildEntry[];
  client1ChildrenOver18?: ChildEntry[];
  client1ChildrenDetails?: string;
  client1FamilyCircumstances?: string;
  client2MarriagePlans?: string;
  client2MarriagePlanDetails?: string;
  client2HasChildren?: string;
  client2TotalChildren?: string;
  client2ChildrenSpecialNeeds?: string;
  client2ChildrenSpecialNeedsDetails?: string;
  client2ChildrenUnder18?: ChildEntry[];
  client2ChildrenOver18?: ChildEntry[];
  client2ChildrenDetails?: string;
  client2FamilyCircumstances?: string;

  // Step 5 — Additional Background
  client1Residency?: string;
  client1DomiciledUK?: string;
  client1MentalCapacity?: string;
  client1MentalCapacityNotes?: string;
  client1ChildrenPastRelationships?: string;
  client1ChildrenPastDetails?: string;
  client2Residency?: string;
  client2DomiciledUK?: string;
  client2MentalCapacity?: string;
  client2MentalCapacityNotes?: string;
  client2ChildrenPastRelationships?: string;
  client2ChildrenPastDetails?: string;

  // Step 6 — Due Diligence
  ddArrangedAppointment?: string;
  ddArrangedAppointmentNotes?: string;
  ddKnowledgeOfEstate?: string;
  ddKnowledgeOfEstateNotes?: string;
  ddKnewBeneficiaries?: string;
  ddKnewBeneficiariesNotes?: string;
  ddSignsOfInfluence?: string;
  ddSignsOfInfluenceNotes?: string;
  ddKnewAppointees?: string;
  ddKnewAppointeesNotes?: string;

  // Step 7 — Executors / Trustees / Guardians
  executors?: PersonEntry[];
  reservedExecutors?: PersonEntry[];
  trustees?: PersonEntry[];
  guardians?: PersonEntry[];
  reservedGuardians?: PersonEntry[];

  // Step 8 — Beneficiaries
  beneficiaries?: PersonEntry[];
  childrenBenefitAge?: string;
  disasterClauseClient1?: string;
  disasterClauseClient2?: string;
  hasVulnerableBeneficiary?: string;
  vulnerableBeneficiaryDetails?: string;

  // Step 9 — Property & Assets
  propertyOwned?: string;
  propertyAddress?: string;
  propertyOwnership?: string;
  mortgageOutstanding?: string;
  mortgageBalance?: string;
  mortgageTermRemaining?: string;
  mortgageLender?: string;
  propertyValue?: string;
  hasOtherProperties?: string;
  otherProperties?: string;
  assetsOutsideUK?: string;
  assetsOutsideUKDetails?: string;
  bankAccounts?: string;
  investments?: string;
  pensionDetails?: string;
  estimatedEstateValue?: string;
  careConcerns?: string;
  careConcernDetails?: string;

  // Step 10 — Life Insurance & Protection
  hasLifeInsurance?: string;
  lifeInsurancePolicies?: LifeInsurancePolicy[];
  lifeInsuranceNotes?: string;

  // Step 11 — Business Interests
  hasBusinessInterests?: string;
  businessInterests?: string;
  businessInterestsDetails?: BusinessInterestEntry[];

  // Step 12 — Legacies & Gifts
  specificGifts?: SpecificGift[];

  // Step 13 — Pets
  hasPets?: string;
  petsDetails?: string;
  petsCarer?: string;

  // Step 14 — Wishes
  residuaryEstate?: string;
  residuaryBackup?: string;
  funeralType?: string;
  funeralWishes?: string;
  organDonation?: string;

  // Step 15 — Disaster Clause & Notes
  disasterClauseNotes?: string;
  additionalNotes?: string;
  specialNotes?: string;
};

const initialData: WillFormData = {
  productsOrdered: [],
  executors: [],
  reservedExecutors: [],
  trustees: [],
  guardians: [],
  reservedGuardians: [],
  beneficiaries: [],
  specificGifts: [],
  lifeInsurancePolicies: [],
  businessInterestsDetails: [],
  client1ChildrenUnder18: [],
  client1ChildrenOver18: [],
  client2ChildrenUnder18: [],
  client2ChildrenOver18: [],
};

// ─── Auto-save constants ──────────────────────────────────────────────────────
const STORAGE_KEY = "genesis_will_draft";
const STORAGE_STEP_KEY = "genesis_will_draft_step";
const STORAGE_TS_KEY = "genesis_will_draft_ts";
const DEBOUNCE_MS = 1000;

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadDraft(): { data: WillFormData; step: number; savedAt: Date } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stepRaw = localStorage.getItem(STORAGE_STEP_KEY);
    const tsRaw = localStorage.getItem(STORAGE_TS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as WillFormData;
    const step = stepRaw ? parseInt(stepRaw, 10) : 1;
    const savedAt = tsRaw ? new Date(tsRaw) : new Date();
    return { data, step, savedAt };
  } catch {
    return null;
  }
}

function saveDraft(data: WillFormData, step: number): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_STEP_KEY, String(step));
    localStorage.setItem(STORAGE_TS_KEY, new Date().toISOString());
    return true;
  } catch (e) {
    // localStorage quota exceeded or unavailable
    console.warn("[AutoSave] Could not save draft:", e);
    return false;
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_STEP_KEY);
    localStorage.removeItem(STORAGE_TS_KEY);
  } catch {
    // ignore
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWillForm() {
  const [formData, setFormData] = useState<WillFormData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ savedAt: Date; step: number } | null>(null);
  const [, navigate] = useLocation();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // ── Check for existing draft on mount ──────────────────────────────────────
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      // Only show restore prompt if there's meaningful data (client name filled)
      const hasMeaningfulData = !!(draft.data.client1FirstName || draft.data.client1LastName || draft.data.consultantName);
      if (hasMeaningfulData) {
        setHasDraft(true);
        setDraftInfo({ savedAt: draft.savedAt, step: draft.step });
      }
    }
  }, []);

  // ── Debounced auto-save whenever formData or currentStep changes ───────────
  useEffect(() => {
    // Skip the very first render to avoid immediately overwriting a draft
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Don't auto-save if we're showing the restore prompt (hasDraft = true means
    // the user hasn't decided yet — we don't want to overwrite with empty state)
    if (hasDraft) return;

    setAutoSaveStatus("saving");

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const ok = saveDraft(formData, currentStep);
      setAutoSaveStatus(ok ? "saved" : "error");
      if (!ok) {
        // Notify consultant once so they know the draft won't persist
        toast.warning("Auto-save unavailable — please submit soon to avoid losing data.", { id: "autosave-error", duration: 6000 });
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [formData, currentStep, hasDraft]);

  // ── Restore draft ──────────────────────────────────────────────────────────
  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft.data);
      setCurrentStep(draft.step);
      setHasDraft(false);
      setDraftInfo(null);
      setAutoSaveStatus("saved");
      toast.success("Draft restored — you can continue where you left off.");
    }
  }, []);

  // ── Discard draft ──────────────────────────────────────────────────────────
  const discardDraft = useCallback(() => {
    clearDraft();
    setHasDraft(false);
    setDraftInfo(null);
    setFormData(initialData);
    setCurrentStep(1);
    setAutoSaveStatus("idle");
    toast.info("Draft discarded. Starting a fresh instruction.");
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitMutation = trpc.will.submit.useMutation({
    onSuccess: (data) => {
      clearDraft(); // wipe the draft on successful submission
      toast.success("Will instruction submitted successfully!");
      navigate(`/success/${data.referenceNumber}`);
    },
    onError: (err) => {
      toast.error(`Submission failed: ${err.message}`);
    },
  });

  const updateFormData = useCallback((updates: Partial<WillFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const submitForm = useCallback(async () => {
    submitMutation.mutate(formData);
  }, [formData, submitMutation]);

  return {
    formData,
    updateFormData,
    submitForm,
    isSubmitting: submitMutation.isPending,
    // Step management (now owned by hook for auto-save step tracking)
    currentStep,
    goToStep,
    // Auto-save state
    autoSaveStatus,
    hasDraft,
    draftInfo,
    restoreDraft,
    discardDraft,
  };
}
