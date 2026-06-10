import { useState, useCallback } from "react";
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

  // Step 4 — Executors / Trustees / Guardians
  executors?: PersonEntry[];
  trustees?: PersonEntry[];
  guardians?: PersonEntry[];

  // Step 5 — Beneficiaries
  beneficiaries?: PersonEntry[];
  childrenBenefitAge?: string;
  disasterClauseClient1?: string;
  disasterClauseClient2?: string;
  hasVulnerableBeneficiary?: string;
  vulnerableBeneficiaryDetails?: string;

  // Step 6 — Property & Assets
  propertyOwned?: string;
  propertyAddress?: string;
  propertyOwnership?: string;
  mortgageOutstanding?: string;
  propertyValue?: string;
  hasOtherProperties?: string;
  otherProperties?: string;
  bankAccounts?: string;
  investments?: string;
  pensionDetails?: string;
  lifeInsurance?: string;
  businessInterests?: string;
  estimatedEstateValue?: string;
  careConcerns?: string;
  careConcernDetails?: string;

  // Step 7 — Wishes
  specificGifts?: SpecificGift[];
  residuaryEstate?: string;
  residuaryBackup?: string;
  funeralType?: string;
  funeralWishes?: string;
  organDonation?: string;

  // Step 8 — Notes
  specialNotes?: string;
};

const initialData: WillFormData = {
  productsOrdered: [],
  executors: [],
  trustees: [],
  guardians: [],
  beneficiaries: [],
  specificGifts: [],
};

export function useWillForm() {
  const [formData, setFormData] = useState<WillFormData>(initialData);
  const [, navigate] = useLocation();

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

  const submitForm = useCallback(async () => {
    const data = {
      ...formData,
      client1FirstName: formData.client1FirstName ?? "",
      client1LastName: formData.client1LastName ?? "",
    };
    submitMutation.mutate(data);
  }, [formData, submitMutation]);

  return {
    formData,
    updateFormData,
    submitForm,
    isSubmitting: submitMutation.isPending,
  };
}
