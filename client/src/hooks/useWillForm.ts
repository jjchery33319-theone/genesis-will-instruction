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
  address?: string;
  ageGroup: "under18" | "over18";
  hasSpecialNeeds?: boolean;
  specialNeedsDetails?: string;
  relationship?: string;
  clientOwner?: "client1" | "client2" | "both";
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

  // Manual Needs Assessment / Recommendations
  manualNeedsAssessment?: string;
  considerLPA?: boolean;
  considerPPT?: boolean;
  considerAAT?: boolean;
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

// ─── Local-storage key ───────────────────────────────────────────────────────
const LS_KEY = "genesis_will_form_autosave";

/**
 * The AI transcript extractor may return string fields as arrays.
 * This helper coerces them back to strings so Zod validation passes on submit.
 */
function coerceStringField(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    // Join array items into a single string
    return value
      .map(v => (typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)))
      .filter(Boolean)
      .join(", ");
  }
  return String(value);
}

/** All fields in WillFormData that must be strings (not arrays or objects) */
const STRING_FIELDS: (keyof WillFormData)[] = [
  "appointmentDate", "appointmentTime", "consultantName", "consultantEmail", "consultantPhone",
  "caseCoordinatorName", "caseCoordinatorEmail", "caseCoordinatorPhone", "priceQuoted", "estimatedDraftDate",
  "willType", "lpaType",
  "client1Prefix", "client1FirstName", "client1MiddleName", "client1LastName", "client1Dob",
  "client1AddressLine1", "client1City", "client1Postcode", "client1MaritalStatus", "client1JobTitle",
  "client1DaytimePhone", "client1Mobile", "client1Email", "client1Nationality",
  "client2Prefix", "client2FirstName", "client2MiddleName", "client2LastName", "client2Dob",
  "client2AddressLine1", "client2City", "client2Postcode", "client2MaritalStatus", "client2JobTitle",
  "client2DaytimePhone", "client2Mobile", "client2Email", "client2Nationality",
  "client1MarriagePlans", "client1MarriagePlanDetails", "client1HasChildren", "client1TotalChildren",
  "client1ChildrenSpecialNeeds", "client1ChildrenSpecialNeedsDetails", "client1ChildrenDetails", "client1FamilyCircumstances",
  "client2MarriagePlans", "client2MarriagePlanDetails", "client2HasChildren", "client2TotalChildren",
  "client2ChildrenSpecialNeeds", "client2ChildrenSpecialNeedsDetails", "client2ChildrenDetails", "client2FamilyCircumstances",
  "client1Residency", "client1DomiciledUK", "client1MentalCapacity", "client1MentalCapacityNotes",
  "client1ChildrenPastRelationships", "client1ChildrenPastDetails",
  "client2Residency", "client2DomiciledUK", "client2MentalCapacity", "client2MentalCapacityNotes",
  "client2ChildrenPastRelationships", "client2ChildrenPastDetails",
  "ddArrangedAppointment", "ddArrangedAppointmentNotes", "ddKnowledgeOfEstate", "ddKnowledgeOfEstateNotes",
  "ddKnewBeneficiaries", "ddKnewBeneficiariesNotes", "ddSignsOfInfluence", "ddSignsOfInfluenceNotes",
  "ddKnewAppointees", "ddKnewAppointeesNotes",
  "client1ResidualEstate", "client1ResidualBackup", "client1ChildrenBenefitAge",
  "client1HasVulnerableBeneficiary", "client1VulnerableBeneficiaryDetails",
  "client2ResidualEstate", "client2ResidualBackup", "client2ChildrenBenefitAge",
  "client2HasVulnerableBeneficiary", "client2VulnerableBeneficiaryDetails",
  "childrenBenefitAge", "disasterClauseClient1", "disasterClauseClient2",
  "hasVulnerableBeneficiary", "vulnerableBeneficiaryDetails",
  "propertyOwned", "propertyAddress", "propertyOwnership", "mortgageOutstanding",
  "mortgageBalance", "mortgageTermRemaining", "mortgageLender", "propertyValue",
  "hasOtherProperties", "otherProperties", "assetsOutsideUK", "assetsOutsideUKDetails",
  "bankAccounts", "investments", "pensionDetails", "estimatedEstateValue",
  "careConcerns", "careConcernDetails",
  "client2BankAccounts", "client2Investments", "client2PensionDetails", "client2EstimatedEstateValue",
  "hasLifeInsurance", "lifeInsuranceNotes", "hasBusinessInterests", "businessInterests",
  "hasPets", "petsDetails", "petsCarer",
  "client1FuneralType", "client1FuneralWishes", "client1OrganDonation",
  "client2FuneralType", "client2FuneralWishes", "client2OrganDonation",
  "residuaryEstate", "residuaryBackup", "funeralType", "funeralWishes", "organDonation",
  "disasterClauseNotes", "additionalNotes", "specialNotes", "manualNeedsAssessment",
];

function loadFromLocalStorage(): WillFormData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return initialData;
    const parsed = JSON.parse(raw) as Partial<WillFormData>;

    // Coerce all string fields — the AI extractor may return them as arrays
    const stringCoerced: Partial<WillFormData> = { ...parsed };
    for (const key of STRING_FIELDS) {
      if (key in parsed) {
        (stringCoerced as Record<string, unknown>)[key] = coerceStringField(parsed[key as keyof WillFormData]);
      }
    }

    // Migrate legacy shared `beneficiaries` into per-client fields if the
    // per-client fields are empty (happens when AI extractor pre-fills the form).
    const legacyBeneficiaries = (parsed.beneficiaries as PersonEntry[] | null) ?? [];
    const c1Beneficiaries = (parsed.client1Beneficiaries as PersonEntry[] | null) ?? [];
    const c2Beneficiaries = (parsed.client2Beneficiaries as PersonEntry[] | null) ?? [];
    const migratedC1 = c1Beneficiaries.length === 0 && legacyBeneficiaries.length > 0
      ? legacyBeneficiaries
      : c1Beneficiaries;

    // Migrate legacy shared `specificGifts` into per-client fields similarly
    const legacyGifts = (parsed.specificGifts as SpecificGift[] | null) ?? [];
    const c1Gifts = (parsed.client1SpecificGifts as SpecificGift[] | null) ?? [];
    const migratedC1Gifts = c1Gifts.length === 0 && legacyGifts.length > 0
      ? legacyGifts
      : c1Gifts;

    // Migrate legacy residuaryEstate / residuaryBackup / funeralType etc.
    const migratedC1ResidualEstate = parsed.client1ResidualEstate ?? (parsed as Record<string, unknown>).residuaryEstate as string | undefined;
    const migratedC1ResidualBackup = parsed.client1ResidualBackup ?? (parsed as Record<string, unknown>).residuaryBackup as string | undefined;
    const migratedC1FuneralType = parsed.client1FuneralType ?? (parsed as Record<string, unknown>).funeralType as string | undefined;
    const migratedC1FuneralWishes = parsed.client1FuneralWishes ?? (parsed as Record<string, unknown>).funeralWishes as string | undefined;
    const migratedC1OrganDonation = parsed.client1OrganDonation ?? (parsed as Record<string, unknown>).organDonation as string | undefined;

    return {
      ...initialData,
      ...stringCoerced,
      productsOrdered: (parsed.productsOrdered as string[] | null) ?? [],
      executors: (parsed.executors as PersonEntry[] | null) ?? [],
      reservedExecutors: (parsed.reservedExecutors as PersonEntry[] | null) ?? [],
      trustees: (parsed.trustees as PersonEntry[] | null) ?? [],
      guardians: (parsed.guardians as PersonEntry[] | null) ?? [],
      reservedGuardians: (parsed.reservedGuardians as PersonEntry[] | null) ?? [],
      // Keep legacy field cleared after migration so it doesn't show in review
      beneficiaries: [],
      specificGifts: [],
      client1Executors: (parsed.client1Executors as PersonEntry[] | null) ?? [],
      client1ReservedExecutors: (parsed.client1ReservedExecutors as PersonEntry[] | null) ?? [],
      client2Executors: (parsed.client2Executors as PersonEntry[] | null) ?? [],
      client2ReservedExecutors: (parsed.client2ReservedExecutors as PersonEntry[] | null) ?? [],
      client1Guardians: (parsed.client1Guardians as PersonEntry[] | null) ?? [],
      client1ReservedGuardians: (parsed.client1ReservedGuardians as PersonEntry[] | null) ?? [],
      client2Guardians: (parsed.client2Guardians as PersonEntry[] | null) ?? [],
      client2ReservedGuardians: (parsed.client2ReservedGuardians as PersonEntry[] | null) ?? [],
      client1Beneficiaries: migratedC1,
      client2Beneficiaries: c2Beneficiaries,
      client1SpecificGifts: migratedC1Gifts,
      client2SpecificGifts: (parsed.client2SpecificGifts as SpecificGift[] | null) ?? [],
      client1ChildrenUnder18: (parsed.client1ChildrenUnder18 as ChildEntry[] | null) ?? [],
      client1ChildrenOver18: (parsed.client1ChildrenOver18 as ChildEntry[] | null) ?? [],
      client2ChildrenUnder18: (parsed.client2ChildrenUnder18 as ChildEntry[] | null) ?? [],
      client2ChildrenOver18: (parsed.client2ChildrenOver18 as ChildEntry[] | null) ?? [],
      lifeInsurancePolicies: (parsed.lifeInsurancePolicies as LifeInsurancePolicy[] | null) ?? [],
      businessInterestsDetails: (parsed.businessInterestsDetails as BusinessInterestEntry[] | null) ?? [],
      // Migrate legacy single-client fields to per-client
      client1ResidualEstate: migratedC1ResidualEstate,
      client1ResidualBackup: migratedC1ResidualBackup,
      client1FuneralType: migratedC1FuneralType,
      client1FuneralWishes: migratedC1FuneralWishes,
      client1OrganDonation: migratedC1OrganDonation,
    };
  } catch {
    return initialData;
  }
}

function clearLocalStorage() {
  try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWillForm() {
  const [formData, setFormData] = useState<WillFormData>(() => loadFromLocalStorage());
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
        considerLPA: !!d.considerLPA,
        considerPPT: !!d.considerPPT,
        considerAAT: !!d.considerAAT,
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
      clearLocalStorage();
      toast.success("Will instruction submitted successfully!");
      navigate(`/success/${data.referenceNumber}`);
    },
    onError: (err) => {
      // Log full error details to console for debugging
      console.error('[Submit] Full error:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cause = (err as any)?.cause;
      const causeMsg = cause instanceof Error ? cause.message : (cause ? String(cause) : '');
      const fullMsg = causeMsg ? `${err.message} | Cause: ${causeMsg}` : err.message;
      toast.error(`Submission failed: ${fullMsg}`);
    },
  });

  // ── Auto-save to localStorage on every change ───────────────────────────
  useEffect(() => {
    // Skip saving if we're resuming from a server draft (URL has draftId)
    if (urlDraftId && !serverDraftId) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(formData));
    } catch { /* storage full or private mode */ }
  }, [formData, urlDraftId, serverDraftId]);

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
