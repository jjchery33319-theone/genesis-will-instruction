import { WillFormData } from "../../../hooks/useWillForm";
import { PRODUCTS } from "../../../../../shared/willConstants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, Edit2, Send, ClipboardList,
  User, Users, Scale, Heart, Home, Gift, Flower2,
  Calendar, ShoppingBag
} from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// ─── (auto-recommendation engine removed — replaced by manual entry) ────────────────
function _unused_computeRecommendations(data: WillFormData) {
  const products = data.productsOrdered ?? [];
  const hasLPA = products.some(p => p.includes("lpa") || p === "both_lpas");
  const hasPPT = products.includes("ppt");
  const hasAAT = products.includes("aat");
  const hasStorage = products.includes("storage");
  const hasVulnerableTrust = products.includes("vulnerable_trust");
  const isMirrorWill = products.includes("mirror_wills") || data.willType === "Mirror Wills";
  const isMarried = ["Married", "Civil Partnership", "Partner / Common Law Spouse"].includes(data.client1MaritalStatus ?? "");
  const ownsProperty = data.propertyOwned === "yes";
  const hasVulnerableBeneficiary = data.hasVulnerableBeneficiary === "yes";
  const hasCareConerns = data.careConcerns === "yes";

  const recs: Array<{ id: string; title: string; reason: string; priority: "high" | "medium" | "low" }> = [];

  if (!hasPPT && isMarried && ownsProperty && isMirrorWill) {
    recs.push({ id: "ppt", title: "Protective Property Trust (PPT)", priority: "high", reason: "Married/partnered clients with property benefit from a PPT to protect the first-to-die's share from care fees and remarriage." });
  }
  if (!hasAAT && ownsProperty) {
    recs.push({ id: "aat", title: "Asset Allocation Trust (AAT)", priority: "high", reason: "An AAT provides robust protection against care home fees, divorce of beneficiaries, and creditor claims." });
  }
  if (!hasLPA) {
    recs.push({ id: "lpa", title: "Lasting Powers of Attorney (LPAs)", priority: "high", reason: "Without LPAs, family members must apply to the Court of Protection if the client loses capacity — a costly and lengthy process." });
  }
  if (!hasStorage) {
    recs.push({ id: "storage", title: "Secure Will Storage", priority: "medium", reason: "Storing the original Will with Genesis ensures it is safe, accessible, and cannot be lost or destroyed." });
  }
  if (hasVulnerableBeneficiary && !hasVulnerableTrust) {
    recs.push({ id: "vulnerable_trust", title: "Vulnerable Person's Trust", priority: "high", reason: "A vulnerable beneficiary has been identified. A Vulnerable Person's Trust protects their inheritance and preserves means-tested benefit eligibility." });
  }
  if (hasCareConerns && !hasAAT) {
    recs.push({ id: "care_protection", title: "Care Protection Trust", priority: "high", reason: "Care cost concerns noted. A Care Protection Trust can shield assets from local authority means-testing." });
  }

  return recs;
}

// ─── Section Preview ──────────────────────────────────────────────────────────
function ReviewSection({
  title, icon, step, onEdit, children,
}: {
  title: string;
  icon: React.ReactNode;
  step: number;
  onEdit: (s: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-border"
        style={{ background: "oklch(0.97 0.015 155)" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "oklch(0.28 0.07 155)" }}>{icon}</span>
          <h3 className="font-serif text-sm font-semibold genesis-green-text">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(step)}
          className="gap-1.5 h-7 text-xs"
          style={{ color: "oklch(0.65 0.14 80)" }}
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </Button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-medium text-muted-foreground min-w-[140px] flex-shrink-0">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export default function Step8Review({ data, onChange, onEdit, onSubmit, isSubmitting }: Props) {
  const client1Name = [data.client1Prefix, data.client1FirstName, data.client1MiddleName, data.client1LastName].filter(Boolean).join(" ");
  const client2Name = data.client2FirstName
    ? [data.client2Prefix, data.client2FirstName, data.client2MiddleName, data.client2LastName].filter(Boolean).join(" ")
    : null;

  const productLabels = (data.productsOrdered ?? [])
    .map(id => PRODUCTS.find(p => p.id === id)?.label)
    .filter(Boolean);

  const formatPersons = (persons?: Array<{ firstName: string; lastName: string; relationship?: string }>) =>
    persons?.length
      ? persons.map(p => `${p.firstName} ${p.lastName}${p.relationship ? ` (${p.relationship})` : ""}`).join(", ")
      : "None";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="rounded-xl p-5 text-white"
        style={{ background: "linear-gradient(135deg, oklch(0.18 0.06 155) 0%, oklch(0.28 0.07 155) 100%)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">Review & Submit</h2>
            <p className="text-sm mt-1" style={{ color: "oklch(0.78 0.12 85)" }}>
              Please review all details carefully before submitting
            </p>
          </div>
          <CheckCircle2 className="w-8 h-8" style={{ color: "oklch(0.78 0.12 85)" }} />
        </div>
      </div>

      {/* Manual Needs Assessment */}
      <div
        className="rounded-xl border-2 overflow-hidden"
        style={{ borderColor: "oklch(0.78 0.12 85)" }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ background: "oklch(0.97 0.015 90)" }}
        >
          <ClipboardList className="w-4 h-4" style={{ color: "oklch(0.65 0.14 80)" }} />
          <h3 className="font-serif text-sm font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>
            Needs Assessment &amp; Recommendations
          </h3>
          <span className="ml-auto text-xs text-muted-foreground">Optional</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-2">
            Enter any needs, recommendations, or notes for this instruction. If left blank, no recommendations will be included.
          </p>
          <Textarea
            value={data.manualNeedsAssessment ?? ""}
            onChange={e => onChange({ manualNeedsAssessment: e.target.value })}
            placeholder="e.g. Client should consider an LPA as they have no existing power of attorney. A PPT is recommended to protect the property share..."
            rows={6}
            className="text-sm resize-y"
          />
        </div>
      </div>

      {/* Section Previews */}
      <ReviewSection title="Appointment & Products" icon={<Calendar className="w-4 h-4" />} step={1} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Appointment Date" value={data.appointmentDate} />
          <Field label="Consultant" value={data.consultantName} />
          <Field label="Case Coordinator" value={data.caseCoordinatorName} />
          <Field label="Price Quoted" value={data.priceQuoted ? `£${data.priceQuoted}` : undefined} />
          {productLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {productLabels.map(label => (
                <Badge
                  key={label}
                  className="text-xs"
                  style={{ background: "oklch(0.28 0.07 155)", color: "white" }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </ReviewSection>

      <ReviewSection title="Clients" icon={<Users className="w-4 h-4" />} step={2} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 1</p>
            <Field label="Full Name" value={client1Name || undefined} />
            <Field label="Date of Birth" value={data.client1Dob} />
            <Field label="Address" value={[data.client1AddressLine1, data.client1City, data.client1Postcode].filter(Boolean).join(", ") || undefined} />
            <Field label="Marital Status" value={data.client1MaritalStatus} />
            <Field label="Email" value={data.client1Email} />
            <Field label="Mobile" value={data.client1Mobile} />
          </div>
          {client2Name && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 2</p>
              <Field label="Full Name" value={client2Name} />
              <Field label="Date of Birth" value={data.client2Dob} />
              <Field label="Address" value={data.client2SameAddressAsClient1 ? "Same as Client 1" : [data.client2AddressLine1, data.client2City, data.client2Postcode].filter(Boolean).join(", ") || undefined} />
              <Field label="Marital Status" value={data.client2MaritalStatus} />
              <Field label="Email" value={data.client2Email} />
              <Field label="Mobile" value={data.client2Mobile} />
            </div>
          )}
        </div>
      </ReviewSection>

      {/* Family Background */}
      <ReviewSection title="Family Background" icon={<Users className="w-4 h-4" />} step={3} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="C1 Marriage Plans" value={data.client1MarriagePlans === "yes" ? `Yes — ${data.client1MarriagePlanDetails ?? ""}` : data.client1MarriagePlans === "no" ? "No" : undefined} />
          <Field label="C1 Has Children" value={data.client1HasChildren === "yes" ? `Yes (${data.client1TotalChildren ?? ""} total)` : data.client1HasChildren === "no" ? "No" : undefined} />
          {data.client1HasChildren === "yes" && (
            <>
              {(data.client1ChildrenSpecialNeeds === "yes") && <Field label="C1 Special Needs" value={`Yes — ${data.client1ChildrenSpecialNeedsDetails ?? ""}`} />}
              {(data.client1ChildrenUnder18?.length ?? 0) > 0 && <Field label="C1 Under 18" value={data.client1ChildrenUnder18?.map(c => [c.firstName, c.lastName].filter(Boolean).join(" ")).join(", ")} />}
              {(data.client1ChildrenOver18?.length ?? 0) > 0 && <Field label="C1 Over 18" value={data.client1ChildrenOver18?.map(c => [c.firstName, c.lastName].filter(Boolean).join(" ")).join(", ")} />}
            </>
          )}
          <Field label="C1 Family Circumstances" value={data.client1FamilyCircumstances} />
          {data.client2FirstName && (
            <>
              <Field label="C2 Marriage Plans" value={data.client2MarriagePlans === "yes" ? `Yes — ${data.client2MarriagePlanDetails ?? ""}` : data.client2MarriagePlans === "no" ? "No" : undefined} />
              <Field label="C2 Has Children" value={data.client2HasChildren === "yes" ? `Yes (${data.client2TotalChildren ?? ""} total)` : data.client2HasChildren === "no" ? "No" : undefined} />
              {data.client2HasChildren === "yes" && (
                <>
                  {(data.client2ChildrenSpecialNeeds === "yes") && <Field label="C2 Special Needs" value={`Yes — ${data.client2ChildrenSpecialNeedsDetails ?? ""}`} />}
                  {(data.client2ChildrenUnder18?.length ?? 0) > 0 && <Field label="C2 Under 18" value={data.client2ChildrenUnder18?.map(c => [c.firstName, c.lastName].filter(Boolean).join(" ")).join(", ")} />}
                  {(data.client2ChildrenOver18?.length ?? 0) > 0 && <Field label="C2 Over 18" value={data.client2ChildrenOver18?.map(c => [c.firstName, c.lastName].filter(Boolean).join(" ")).join(", ")} />}
                </>
              )}
            </>
          )}
        </div>
      </ReviewSection>

      {/* Additional Background */}
      <ReviewSection title="Additional Background" icon={<User className="w-4 h-4" />} step={4} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="C1 Residency" value={data.client1Residency} />
          <Field label="C1 Domiciled UK" value={data.client1DomiciledUK} />
          <Field label="C1 Mental Capacity" value={data.client1MentalCapacity} />
          <Field label="C1 Children Past Rels" value={data.client1ChildrenPastRelationships === "yes" ? `Yes — ${data.client1ChildrenPastDetails ?? ""}` : data.client1ChildrenPastRelationships === "no" ? "No" : undefined} />
        </div>
      </ReviewSection>

      {/* Due Diligence */}
      <ReviewSection title="Due Diligence" icon={<ShoppingBag className="w-4 h-4" />} step={5} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Arranged Appointment" value={data.ddArrangedAppointment} />
          <Field label="Knowledge of Estate" value={data.ddKnowledgeOfEstate} />
          <Field label="Knew Beneficiaries" value={data.ddKnewBeneficiaries} />
          <Field label="Signs of Influence" value={data.ddSignsOfInfluence === "yes" ? `⚠ YES — ${data.ddSignsOfInfluenceNotes ?? ""}` : data.ddSignsOfInfluence === "no" ? "No" : undefined} />
          <Field label="Knew Appointees" value={data.ddKnewAppointees} />
        </div>
      </ReviewSection>

      <ReviewSection title="Executors, Trustees & Guardians" icon={<Scale className="w-4 h-4" />} step={6} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 1</p>
            <Field label="Primary Executors" value={formatPersons(data.client1Executors?.length ? data.client1Executors : data.executors)} />
            {(data.client1ReservedExecutors?.length ?? 0) > 0 && <Field label="Reserved Executors" value={formatPersons(data.client1ReservedExecutors)} />}
            <Field label="Primary Guardians" value={formatPersons(data.client1Guardians?.length ? data.client1Guardians : data.guardians)} />
            {(data.client1ReservedGuardians?.length ?? 0) > 0 && <Field label="Reserved Guardians" value={formatPersons(data.client1ReservedGuardians)} />}
          </div>
          {client2Name && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 2</p>
              <Field label="Primary Executors" value={formatPersons(data.client2Executors)} />
              {(data.client2ReservedExecutors?.length ?? 0) > 0 && <Field label="Reserved Executors" value={formatPersons(data.client2ReservedExecutors)} />}
              <Field label="Primary Guardians" value={formatPersons(data.client2Guardians)} />
              {(data.client2ReservedGuardians?.length ?? 0) > 0 && <Field label="Reserved Guardians" value={formatPersons(data.client2ReservedGuardians)} />}
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <Field label="Trustees (Shared)" value={formatPersons(data.trustees)} />
        </div>
      </ReviewSection>

      <ReviewSection title="Property & Assets" icon={<Home className="w-4 h-4" />} step={7} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Property Owned" value={data.propertyOwned === "yes" ? "Yes" : "No"} />
          {data.propertyOwned === "yes" && (
            <>
              <Field label="Property Address" value={data.propertyAddress} />
              <Field label="Ownership Type" value={data.propertyOwnership} />
              <Field label="Estimated Value" value={data.propertyValue ? `£${data.propertyValue}` : undefined} />
              {data.mortgageOutstanding === "yes" && (
                <>
                  <Field label="Mortgage Lender" value={data.mortgageLender} />
                  <Field label="Mortgage Balance" value={data.mortgageBalance ? `£${data.mortgageBalance}` : undefined} />
                  <Field label="Term Remaining" value={data.mortgageTermRemaining} />
                </>
              )}
            </>
          )}
          <Field label="Assets Outside UK" value={data.assetsOutsideUK === "yes" ? `Yes — ${data.assetsOutsideUKDetails ?? ""}` : data.assetsOutsideUK === "no" ? "No" : undefined} />
          <Field label="Estimated Estate" value={data.estimatedEstateValue ? `£${data.estimatedEstateValue}` : undefined} />
          <Field label="Care Concerns" value={data.careConcerns === "yes" ? "Yes" : "No"} />
        </div>
      </ReviewSection>

      {/* Life Insurance */}
      <ReviewSection title="Life Insurance" icon={<ShoppingBag className="w-4 h-4" />} step={8} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Has Life Insurance" value={data.hasLifeInsurance === "yes" ? `Yes — ${data.lifeInsurancePolicies?.length ?? 0} policy/policies` : data.hasLifeInsurance === "no" ? "No" : undefined} />
          <Field label="Notes" value={data.lifeInsuranceNotes} />
        </div>
      </ReviewSection>

      {/* Business Interests */}
      <ReviewSection title="Business Interests" icon={<Scale className="w-4 h-4" />} step={9} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Has Business Interests" value={data.hasBusinessInterests === "yes" ? `Yes — ${data.businessInterestsDetails?.length ?? 0} business(es)` : data.hasBusinessInterests === "no" ? "No" : undefined} />
        </div>
      </ReviewSection>

      {/* Pets */}
      <ReviewSection title="Pets" icon={<Heart className="w-4 h-4" />} step={10} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Has Pets" value={data.hasPets === "yes" ? `Yes — ${data.petsDetails ?? ""}` : data.hasPets === "no" ? "No" : undefined} />
          <Field label="Proposed Carer" value={data.petsCarer} />
        </div>
      </ReviewSection>

      {/* Funeral Wishes — per client */}
      <ReviewSection title="Funeral Wishes" icon={<Flower2 className="w-4 h-4" />} step={11} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 1</p>
            <Field label="Funeral Type" value={data.client1FuneralType ?? data.funeralType} />
            <Field label="Wishes" value={data.client1FuneralWishes ?? data.funeralWishes} />
            <Field label="Organ Donation" value={(data.client1OrganDonation ?? data.organDonation) === "yes" ? "Yes" : (data.client1OrganDonation ?? data.organDonation) === "no" ? "No" : undefined} />
          </div>
          {client2Name && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 2</p>
              <Field label="Funeral Type" value={data.client2FuneralType} />
              <Field label="Wishes" value={data.client2FuneralWishes} />
              <Field label="Organ Donation" value={data.client2OrganDonation === "yes" ? "Yes" : data.client2OrganDonation === "no" ? "No" : undefined} />
            </div>
          )}
        </div>
      </ReviewSection>

      {/* Gifts — per client */}
      <ReviewSection title="Legacies & Gifts" icon={<Gift className="w-4 h-4" />} step={12} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 1</p>
            {(data.client1SpecificGifts?.length ?? 0) > 0
              ? data.client1SpecificGifts?.map((g, i) => <Field key={i} label={g.isCharity ? `Charity ${i+1}` : `Gift ${i+1}`} value={`${g.description} → ${g.recipient}${g.value ? ` (${g.value})` : ""}`} />)
              : <span className="text-sm text-muted-foreground italic">No specific gifts</span>}
          </div>
          {client2Name && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 2</p>
              {(data.client2SpecificGifts?.length ?? 0) > 0
                ? data.client2SpecificGifts?.map((g, i) => <Field key={i} label={g.isCharity ? `Charity ${i+1}` : `Gift ${i+1}`} value={`${g.description} → ${g.recipient}${g.value ? ` (${g.value})` : ""}`} />)
                : <span className="text-sm text-muted-foreground italic">No specific gifts</span>}
            </div>
          )}
        </div>
      </ReviewSection>

      {/* Beneficiaries — per client */}
      <ReviewSection title="Beneficiaries & Residuary Estate" icon={<Heart className="w-4 h-4" />} step={13} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 1</p>
            <Field label="Residuary Estate" value={data.client1ResidualEstate ?? data.residuaryEstate} />
            <Field label="Beneficiaries" value={formatPersons(data.client1Beneficiaries?.length ? data.client1Beneficiaries : data.beneficiaries)} />
            <Field label="Children Benefit Age" value={data.client1ChildrenBenefitAge ? `Age ${data.client1ChildrenBenefitAge}` : undefined} />
            {data.client1HasVulnerableBeneficiary === "yes" && <Field label="Vulnerable Beneficiary" value={`Yes — ${data.client1VulnerableBeneficiaryDetails ?? ""}`} />}
          </div>
          {client2Name && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.65 0.14 80)" }}>Client 2</p>
              <Field label="Residuary Estate" value={data.client2ResidualEstate} />
              <Field label="Beneficiaries" value={formatPersons(data.client2Beneficiaries)} />
              <Field label="Children Benefit Age" value={data.client2ChildrenBenefitAge ? `Age ${data.client2ChildrenBenefitAge}` : undefined} />
              {data.client2HasVulnerableBeneficiary === "yes" && <Field label="Vulnerable Beneficiary" value={`Yes — ${data.client2VulnerableBeneficiaryDetails ?? ""}`} />}
            </div>
          )}
        </div>
      </ReviewSection>

      {/* Disaster Clause & Notes */}
      <ReviewSection title="Disaster Clause & Notes" icon={<Calendar className="w-4 h-4" />} step={14} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Disaster Clause (C1)" value={data.disasterClauseClient1} />
          {data.client2FirstName && <Field label="Disaster Clause (C2)" value={data.disasterClauseClient2} />}
          <Field label="Disaster Clause Notes" value={data.disasterClauseNotes} />
          <Field label="Additional Notes" value={data.additionalNotes} />
          <Field label="Consultant Notes" value={data.specialNotes} />
        </div>
      </ReviewSection>

      {/* Submit */}
      <div
        className="rounded-xl p-5 border-2"
        style={{ background: "oklch(0.97 0.015 155)", borderColor: "oklch(0.28 0.07 155 / 0.3)" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <Send className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.28 0.07 155)" }} />
          <div>
            <h3 className="font-serif text-sm font-semibold genesis-green-text">Ready to Submit</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Submitting will save this instruction, generate AI-powered estate planning recommendations,
              and automatically notify the admin team at Genesis Wills and Estate Planning.
            </p>
          </div>
        </div>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          size="lg"
          className="w-full gap-2 font-semibold text-base"
          style={{ background: "oklch(0.28 0.07 155)", color: "oklch(0.97 0.03 90)" }}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⏳</span>
              Submitting & Generating Recommendations…
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Will Instruction
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
