import { useState, useCallback, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { useLocation, useSearch } from "wouter";
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
  termRemaining?: string;
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

  // Client 2 same address toggle
  client2SameAddressAsClient1?: boolean;

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

  // Step 7 — Executors / Trustees / Guardians (per-client)
  client1Executors?: PersonEntry[];
  client1ReservedExecutors?: PersonEntry[];
  client2Executors?: PersonEntry[];
  client2ReservedExecutors?: PersonEntry[];
  trustees?: PersonEntry[];
  client1Guardians?: PersonEntry[];
  client1ReservedGuardians?: PersonEntry[];
  client2Guardians?: PersonEntry[];
  client2ReservedGuardians?: PersonEntry[];
  // Legacy shared fields
  executors?: PersonEntry[];
  reservedExecutors?: PersonEntry[];
  guardians?: PersonEntry[];
  reservedGuardians?: PersonEntry[];

  // Step 8 — Beneficiaries (per-client)
  client1Beneficiaries?: PersonEntry[];
  client1ResidualEstate?: string;
  client1ResidualBackup?: string;
  client1ChildrenBenefitAge?: string;
  client1HasVulnerableBeneficiary?: string;
  client1VulnerableBeneficiaryDetails?: string;
  client2Beneficiaries?: PersonEntry[];
  client2ResidualEstate?: string;
  client2ResidualBackup?: string;
  client2ChildrenBenefitAge?: string;
  client2HasVulnerableBeneficiary?: string;
  client2VulnerableBeneficiaryDetails?: string;
  // Legacy shared fields
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

  // Client 2 financial assets (separate from Client 1)
  client2BankAccounts?: string;
  client2Investments?: string;
  client2PensionDetails?: string;
  client2EstimatedEstateValue?: string;

  // Step 10 — Life Insurance & Protection
  hasLifeInsurance?: string;
  lifeInsurancePolicies?: LifeInsurancePolicy[];
  lifeInsuranceNotes?: string;

  // Step 11 — Business Interests
  hasBusinessInterests?: string;
  businessInterests?: string;
  businessInterestsDetails?: BusinessInterestEntry[];

  // Step 12 — Legacies & Gifts (per-client)
  client1SpecificGifts?: SpecificGift[];
  client2SpecificGifts?: SpecificGift[];
  specificGifts?: SpecificGift[];

  // Step 13 — Pets
  hasPets?: string;
  petsDetails?: string;
  petsCarer?: string;

  // Step 14 — Funeral Wishes (per-client)
  client1FuneralType?: string;
  client1FuneralWishes?: string;
  client1OrganDonation?: string;
  client2FuneralType?: string;
  client2FuneralWishes?: string;
  client2OrganDonation?: string;
  // Legacy shared fields
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
  // Per-client executors
  client1Executors: [],
  client1ReservedExecutors: [],
  client2Executors: [],
  client2ReservedExecutors: [],
  trustees: [],
  // Per-client guardians
  client1Guardians: [],
  client1ReservedGuardians: [],
  client2Guardians: [],
  client2ReservedGuardians: [],
  // Legacy
  executors: [],
  reservedExecutors: [],
  guardians: [],
  reservedGuardians: [],
  // Per-client beneficiaries
  client1Beneficiaries: [],
  client2Beneficiaries: [],
  beneficiaries: [],
  // Per-client gifts
  client1SpecificGifts: [],
  client2SpecificGifts: [],
  specificGifts: [],
  lifeInsurancePolicies: [],
  businessInterestsDetails: [],
  client1ChildrenUnder18: [],
  client1ChildrenOver18: [],
  client2ChildrenUnder18: [],
  client2ChildrenOver18: [],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWillForm() {
  const [formData, setFormData] = useState<WillFormData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [, navigate] = useLocation();

  // ── Server-side draft ID ──────────────────────────────────────────────────
  const [serverDraftId, setServerDraftId] = useState<number | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Resume from URL param (?draftId=123)
  const searchString = useSearch();
  const urlDraftId = new URLSearchParams(searchString).get("draftId");
  const resumeQuery = trpc.will.getDraft.useQuery(
    { id: Number(urlDraftId) },
    { enabled: !!urlDraftId && !serverDraftId, retry: false }
  );

  useEffect(() => {
    if (resumeQuery.data && !serverDraftId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = resumeQuery.data as any;
      const restored: WillFormData = {
        ...(d as WillFormData),
        productsOrdered: (d.productsOrdered as string[] | null) ?? [],
        executors: (d.executors as PersonEntry[] | null) ?? [],
        reservedExecutors: (d.reservedExecutors as PersonEntry[] | null) ?? [],
        trustees: (d.trustees as PersonEntry[] | null) ?? [],
        guardians: (d.guardians as PersonEntry[] | null) ?? [],
        reservedGuardians: (d.reservedGuardians as PersonEntry[] | null) ?? [],
        beneficiaries: (d.beneficiaries as PersonEntry[] | null) ?? [],
        specificGifts: (d.specificGifts as SpecificGift[] | null) ?? [],
        client1Executors: (d.client1Executors as PersonEntry[] | null) ?? [],
        client1ReservedExecutors: (d.client1ReservedExecutors as PersonEntry[] | null) ?? [],
        client2Executors: (d.client2Executors as PersonEntry[] | null) ?? [],
        client2ReservedExecutors: (d.client2ReservedExecutors as PersonEntry[] | null) ?? [],
        client1Guardians: (d.client1Guardians as PersonEntry[] | null) ?? [],
        client1ReservedGuardians: (d.client1ReservedGuardians as PersonEntry[] | null) ?? [],
        client2Guardians: (d.client2Guardians as PersonEntry[] | null) ?? [],
        client2ReservedGuardians: (d.client2ReservedGuardians as PersonEntry[] | null) ?? [],
        client1Beneficiaries: (d.client1Beneficiaries as PersonEntry[] | null) ?? [],
        client2Beneficiaries: (d.client2Beneficiaries as PersonEntry[] | null) ?? [],
        client1SpecificGifts: (d.client1SpecificGifts as SpecificGift[] | null) ?? [],
        client2SpecificGifts: (d.client2SpecificGifts as SpecificGift[] | null) ?? [],
        client1ChildrenUnder18: (d.client1ChildrenUnder18 as ChildEntry[] | null) ?? [],
        client1ChildrenOver18: (d.client1ChildrenOver18 as ChildEntry[] | null) ?? [],
        client2ChildrenUnder18: (d.client2ChildrenUnder18 as ChildEntry[] | null) ?? [],
        client2ChildrenOver18: (d.client2ChildrenOver18 as ChildEntry[] | null) ?? [],
      };
      setFormData(restored);
      setCurrentStep(d.currentStep ?? 1);
      setServerDraftId(d.id);
      toast.success("Draft loaded — continue where you left off.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeQuery.data]);

  const saveDraftMutation = trpc.will.saveDraft.useMutation({
    onSuccess: (data) => {
      if (data.draftId && !serverDraftId) setServerDraftId(data.draftId);
    },
    onError: () => {
      toast.error("Could not save draft to server. Please try again.");
    },
  });

  const saveAsDraft = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      const result = await saveDraftMutation.mutateAsync({
        ...formData,
        draftId: serverDraftId ?? undefined,
        currentStep,
      });
      if (result.draftId) setServerDraftId(result.draftId);
      toast.success("Draft saved — you can resume this instruction from the Admin Dashboard.");
    } finally {
      setIsSavingDraft(false);
    }
  }, [formData, serverDraftId, currentStep, saveDraftMutation]);

  const submitMutation = trpc.will.submit.useMutation({
    onSuccess: (data) => {
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
    // Step management
    currentStep,
    goToStep,
    // Server-side draft
    saveAsDraft,
    isSavingDraft,
    serverDraftId,
    isLoadingResume: resumeQuery.isLoading && !!urlDraftId,
  };
}
