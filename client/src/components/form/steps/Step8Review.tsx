import { WillFormData } from "../../../hooks/useWillForm";
import { PRODUCTS } from "../../../../../shared/willConstants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, Edit2, Send, AlertTriangle, Star,
  User, Users, Scale, Heart, Home, Gift, Flower2,
  Calendar, ShoppingBag
} from "lucide-react";

interface Props {
  data: WillFormData;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// ─── Recommendation Engine (client-side preview) ─────────────────────────────
function computeRecommendations(data: WillFormData) {
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

export default function Step8Review({ data, onEdit, onSubmit, isSubmitting }: Props) {
  const recommendations = computeRecommendations(data);
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

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div
          className="rounded-xl border-2 overflow-hidden"
          style={{ borderColor: "oklch(0.78 0.12 85)" }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{ background: "oklch(0.97 0.015 90)" }}
          >
            <Star className="w-4 h-4" style={{ color: "oklch(0.65 0.14 80)" }} />
            <h3 className="font-serif text-sm font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>
              Estate Planning Recommendations ({recommendations.length})
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
                style={{
                  background: rec.priority === "high" ? "oklch(0.99 0.01 85 / 0.6)" : "oklch(0.99 0.005 155)",
                  borderColor: rec.priority === "high" ? "oklch(0.78 0.12 85 / 0.5)" : "oklch(0.88 0.02 155)",
                }}
              >
                <AlertTriangle
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: rec.priority === "high" ? "oklch(0.65 0.14 80)" : "oklch(0.5 0.04 155)" }}
                />
                <div>
                  <p className="text-sm font-semibold genesis-green-text">{rec.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                </div>
                <Badge
                  className="ml-auto flex-shrink-0 text-xs"
                  style={
                    rec.priority === "high"
                      ? { background: "oklch(0.78 0.12 85)", color: "oklch(0.2 0.05 155)" }
                      : { background: "oklch(0.88 0.02 155)", color: "oklch(0.28 0.07 155)" }
                  }
                >
                  {rec.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <ReviewSection title="Client 1" icon={<User className="w-4 h-4" />} step={2} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Full Name" value={client1Name || undefined} />
          <Field label="Date of Birth" value={data.client1Dob} />
          <Field label="Address" value={[data.client1AddressLine1, data.client1City, data.client1Postcode].filter(Boolean).join(", ") || undefined} />
          <Field label="Marital Status" value={data.client1MaritalStatus} />
          <Field label="Email" value={data.client1Email} />
          <Field label="Mobile" value={data.client1Mobile} />
        </div>
      </ReviewSection>

      {client2Name && (
        <ReviewSection title="Client 2" icon={<Users className="w-4 h-4" />} step={3} onEdit={onEdit}>
          <div className="space-y-1.5">
            <Field label="Full Name" value={client2Name} />
            <Field label="Date of Birth" value={data.client2Dob} />
            <Field label="Address" value={[data.client2AddressLine1, data.client2City, data.client2Postcode].filter(Boolean).join(", ") || undefined} />
            <Field label="Marital Status" value={data.client2MaritalStatus} />
            <Field label="Email" value={data.client2Email} />
          </div>
        </ReviewSection>
      )}

      <ReviewSection title="Executors, Trustees & Guardians" icon={<Scale className="w-4 h-4" />} step={4} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Executors" value={formatPersons(data.executors)} />
          <Field label="Trustees" value={formatPersons(data.trustees)} />
          <Field label="Guardians" value={formatPersons(data.guardians)} />
        </div>
      </ReviewSection>

      <ReviewSection title="Beneficiaries" icon={<Heart className="w-4 h-4" />} step={5} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Beneficiaries" value={formatPersons(data.beneficiaries)} />
          <Field label="Children Benefit Age" value={data.childrenBenefitAge ? `Age ${data.childrenBenefitAge}` : undefined} />
          <Field label="Vulnerable Beneficiary" value={data.hasVulnerableBeneficiary === "yes" ? `Yes — ${data.vulnerableBeneficiaryDetails ?? ""}` : "No"} />
        </div>
      </ReviewSection>

      <ReviewSection title="Property & Assets" icon={<Home className="w-4 h-4" />} step={6} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Property Owned" value={data.propertyOwned === "yes" ? "Yes" : "No"} />
          {data.propertyOwned === "yes" && (
            <>
              <Field label="Property Address" value={data.propertyAddress} />
              <Field label="Ownership Type" value={data.propertyOwnership} />
              <Field label="Estimated Value" value={data.propertyValue ? `£${data.propertyValue}` : undefined} />
            </>
          )}
          <Field label="Estimated Estate" value={data.estimatedEstateValue ? `£${data.estimatedEstateValue}` : undefined} />
          <Field label="Care Concerns" value={data.careConcerns === "yes" ? "Yes" : "No"} />
        </div>
      </ReviewSection>

      <ReviewSection title="Wishes & Funeral" icon={<Flower2 className="w-4 h-4" />} step={7} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Residuary Estate" value={data.residuaryEstate} />
          <Field label="Funeral Type" value={data.funeralType} />
          <Field label="Organ Donation" value={data.organDonation === "yes" ? "Yes" : data.organDonation === "no" ? "No" : undefined} />
          {(data.specificGifts?.length ?? 0) > 0 && (
            <Field label="Specific Gifts" value={`${data.specificGifts?.length} gift(s) specified`} />
          )}
          <Field label="Special Notes" value={data.specialNotes} />
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
              and automatically notify the admin team at Genesis Estate Planning.
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
