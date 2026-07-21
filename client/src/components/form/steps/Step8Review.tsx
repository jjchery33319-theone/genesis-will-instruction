import { useState } from "react";
import { WillFormData } from "../../../hooks/useWillForm";
import { PRODUCTS } from "../../../../../shared/willConstants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, Edit2, Send, ClipboardList,
  User, Users, Scale, Heart, Home, Gift, Flower2,
  Calendar, ShoppingBag, ChevronDown, ChevronUp,
  Briefcase, Shield, FileText, AlertTriangle,
} from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function ReviewSection({
  title, icon, step, onEdit, children, defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  step: number;
  onEdit: (s: number) => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-border cursor-pointer select-none"
        style={{ background: "oklch(0.97 0.015 155)" }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "oklch(0.28 0.07 155)" }}>{icon}</span>
          <h3 className="font-serif text-sm font-semibold genesis-green-text">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => { e.stopPropagation(); onEdit(step); }}
            className="gap-1.5 h-7 text-xs"
            style={{ color: "oklch(0.65 0.14 80)" }}
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </Button>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-medium text-muted-foreground min-w-[160px] flex-shrink-0">{label}:</span>
      <span className="text-foreground break-words">{value}</span>
    </div>
  );
}

function SubHeading({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide mt-3 mb-1.5 first:mt-0" style={{ color: "oklch(0.65 0.14 80)" }}>
      {label}
    </p>
  );
}

function PersonList({ persons, label }: { persons?: Array<{ title?: string; prefix?: string; firstName: string; lastName: string; relationship?: string; address?: string; phone?: string; email?: string; dob?: string; share?: string; notes?: string }>; label: string }) {
  if (!persons?.length) return null;
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      {persons.map((p, i) => (
        <div key={i} className="ml-3 pl-3 border-l-2 border-border space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            {[p.title, p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ")}
            {p.relationship ? <span className="text-muted-foreground font-normal"> — {p.relationship}</span> : null}
          </p>
          {p.address && <p className="text-xs text-muted-foreground">{p.address}</p>}
          {p.phone && <p className="text-xs text-muted-foreground">📞 {p.phone}</p>}
          {p.email && <p className="text-xs text-muted-foreground">✉ {p.email}</p>}
          {p.dob && <p className="text-xs text-muted-foreground">DOB: {p.dob}</p>}
          {p.share && <p className="text-xs text-muted-foreground">Share: {p.share}</p>}
          {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
        </div>
      ))}
    </div>
  );
}

export default function Step8Review({ data, onChange, onEdit, onSubmit, isSubmitting }: Props) {
  const client1Name = [data.client1Prefix, data.client1FirstName, data.client1MiddleName, data.client1LastName].filter(Boolean).join(" ");
  const client2Name = data.client2FirstName
    ? [data.client2Prefix, data.client2FirstName, data.client2MiddleName, data.client2LastName].filter(Boolean).join(" ")
    : null;
  const isMirror = !!client2Name;

  const productLabels = (data.productsOrdered ?? [])
    .map(id => PRODUCTS.find(p => p.id === id)?.label)
    .filter(Boolean);

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
              Please review all details carefully before submitting. Click any section header to expand/collapse.
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
        <div className="p-4 space-y-4">
          {/* Multi-select: Client Should Consider */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "oklch(0.28 0.07 155)" }}>Client should consider:</p>
            <div className="space-y-2">
              {/* LPA */}
              <label
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  background: data.considerLPA ? "oklch(0.95 0.03 155)" : "oklch(0.98 0.005 155)",
                  border: `1.5px solid ${data.considerLPA ? "oklch(0.55 0.1 155)" : "oklch(0.85 0.02 155)"}`,
                }}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-green-700"
                  checked={!!data.considerLPA}
                  onChange={e => onChange({ considerLPA: e.target.checked })}
                />
                <div className="min-w-0">
                  <span className="text-sm font-medium" style={{ color: "oklch(0.28 0.07 155)" }}>Lasting Power of Attorney (LPA)</span>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.05 155)" }}>
                    A legal document that lets you appoint one or more people to make decisions about your health, welfare, property and finances if you lose mental capacity or can no longer manage your own affairs.
                  </p>
                </div>
              </label>

              {/* PPT */}
              <label
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  background: data.considerPPT ? "oklch(0.95 0.03 155)" : "oklch(0.98 0.005 155)",
                  border: `1.5px solid ${data.considerPPT ? "oklch(0.55 0.1 155)" : "oklch(0.85 0.02 155)"}`,
                }}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-green-700"
                  checked={!!data.considerPPT}
                  onChange={e => onChange({ considerPPT: e.target.checked })}
                />
                <div className="min-w-0">
                  <span className="text-sm font-medium" style={{ color: "oklch(0.28 0.07 155)" }}>Protective Property Trust (PPT)</span>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.05 155)" }}>
                    A trust written into a Will that ring-fences your share of the family home on first death, protecting it from care-home fees, remarriage, or creditors — while allowing the surviving partner to continue living in the property.
                  </p>
                </div>
              </label>

              {/* AAT */}
              <label
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  background: data.considerAAT ? "oklch(0.95 0.03 155)" : "oklch(0.98 0.005 155)",
                  border: `1.5px solid ${data.considerAAT ? "oklch(0.55 0.1 155)" : "oklch(0.85 0.02 155)"}`,
                }}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-green-700"
                  checked={!!data.considerAAT}
                  onChange={e => onChange({ considerAAT: e.target.checked })}
                />
                <div className="min-w-0">
                  <span className="text-sm font-medium" style={{ color: "oklch(0.28 0.07 155)" }}>Asset Allocation Trust (AAT)</span>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.05 155)" }}>
                    A flexible trust that holds and manages assets for named beneficiaries, giving trustees discretion over how and when assets are distributed — useful for protecting inheritances for vulnerable, young, or financially inexperienced beneficiaries.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Free-text notes */}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "oklch(0.28 0.07 155)" }}>Additional notes <span className="font-normal text-muted-foreground">(optional)</span></p>
            <p className="text-xs text-muted-foreground mb-2">
              Any further needs, recommendations, or context for this instruction.
            </p>
            <Textarea
              value={data.manualNeedsAssessment ?? ""}
              onChange={e => onChange({ manualNeedsAssessment: e.target.value })}
              placeholder="e.g. Client has no existing power of attorney and should be advised to arrange one. A PPT is recommended given the property ownership situation..."
              rows={4}
              className="text-sm resize-y"
            />
          </div>
        </div>
      </div>

      {/* ── STEP 1: Appointment ── */}
      <ReviewSection title="Step 1 — Appointment & Products" icon={<Calendar className="w-4 h-4" />} step={1} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Appointment Date" value={data.appointmentDate} />
          <Field label="Appointment Time" value={data.appointmentTime} />
          <Field label="Price Quoted" value={data.priceQuoted ? `£${data.priceQuoted}` : undefined} />
          <Field label="Estimated Draft Date" value={data.estimatedDraftDate} />
          <Field label="Will Type" value={data.willType} />
          <Field label="LPA Type" value={data.lpaType} />
          <SubHeading label="Consultant" />
          <Field label="Consultant Name" value={data.consultantName} />
          <Field label="Consultant Email" value={data.consultantEmail} />
          <Field label="Consultant Phone" value={data.consultantPhone} />
          <SubHeading label="Case Coordinator" />
          <Field label="Coordinator Name" value={data.caseCoordinatorName} />
          <Field label="Coordinator Email" value={data.caseCoordinatorEmail} />
          <Field label="Coordinator Phone" value={data.caseCoordinatorPhone} />
          {productLabels.length > 0 && (
            <div className="mt-2">
              <SubHeading label="Products Ordered" />
              <div className="flex flex-wrap gap-1.5">
                {productLabels.map(label => (
                  <Badge key={label} className="text-xs" style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ReviewSection>

      {/* ── STEP 2: Clients ── */}
      <ReviewSection title="Step 2 — Client Details" icon={<Users className="w-4 h-4" />} step={2} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <SubHeading label="Client 1" />
            <Field label="Full Name" value={client1Name || undefined} />
            <Field label="Date of Birth" value={data.client1Dob} />
            <Field label="Address Line 1" value={data.client1AddressLine1} />
            <Field label="City" value={data.client1City} />
            <Field label="Postcode" value={data.client1Postcode} />
            <Field label="Marital Status" value={data.client1MaritalStatus} />
            <Field label="Job Title" value={data.client1JobTitle} />
            <Field label="Nationality" value={data.client1Nationality} />
            <Field label="Daytime Phone" value={data.client1DaytimePhone} />
            <Field label="Mobile" value={data.client1Mobile} />
            <Field label="Email" value={data.client1Email} />
          </div>
          {isMirror && (
            <div className="space-y-1.5">
              <SubHeading label="Client 2" />
              <Field label="Full Name" value={client2Name ?? undefined} />
              <Field label="Date of Birth" value={data.client2Dob} />
              {data.client2SameAddressAsClient1 ? (
                <Field label="Address" value="Same as Client 1" />
              ) : (
                <>
                  <Field label="Address Line 1" value={data.client2AddressLine1} />
                  <Field label="City" value={data.client2City} />
                  <Field label="Postcode" value={data.client2Postcode} />
                </>
              )}
              <Field label="Marital Status" value={data.client2MaritalStatus} />
              <Field label="Job Title" value={data.client2JobTitle} />
              <Field label="Nationality" value={data.client2Nationality} />
              <Field label="Daytime Phone" value={data.client2DaytimePhone} />
              <Field label="Mobile" value={data.client2Mobile} />
              <Field label="Email" value={data.client2Email} />
            </div>
          )}
        </div>
      </ReviewSection>

      {/* ── STEP 3: Family Background ── */}
      <ReviewSection title="Step 3 — Family Background" icon={<Users className="w-4 h-4" />} step={3} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <SubHeading label="Client 1" />
            <Field label="Marriage Plans" value={data.client1MarriagePlans === "yes" ? `Yes — ${data.client1MarriagePlanDetails ?? ""}` : data.client1MarriagePlans === "no" ? "No" : undefined} />
            <Field label="Has Children" value={data.client1HasChildren === "yes" ? `Yes (${data.client1TotalChildren ?? ""} total)` : data.client1HasChildren === "no" ? "No" : undefined} />
            {data.client1HasChildren === "yes" && (
              <>
                <Field label="Special Needs" value={data.client1ChildrenSpecialNeeds === "yes" ? `Yes — ${data.client1ChildrenSpecialNeedsDetails ?? ""}` : data.client1ChildrenSpecialNeeds === "no" ? "No" : undefined} />
                {(data.client1ChildrenUnder18?.length ?? 0) > 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Children Under 18:</p>
                    {data.client1ChildrenUnder18?.map((c, i) => (
                      <p key={i} className="text-sm ml-3">• {[c.firstName, c.lastName].filter(Boolean).join(" ")}{c.dob ? ` (DOB: ${c.dob})` : ""}{c.hasSpecialNeeds ? " ⚠ Special needs" : ""}</p>
                    ))}
                  </div>
                )}
                {(data.client1ChildrenOver18?.length ?? 0) > 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Children Over 18:</p>
                    {data.client1ChildrenOver18?.map((c, i) => (
                      <p key={i} className="text-sm ml-3">• {[c.firstName, c.lastName].filter(Boolean).join(" ")}{c.dob ? ` (DOB: ${c.dob})` : ""}</p>
                    ))}
                  </div>
                )}
              </>
            )}
            <Field label="Family Circumstances" value={data.client1FamilyCircumstances} />
          </div>
          {isMirror && (
            <div className="space-y-1.5">
              <SubHeading label="Client 2" />
              <Field label="Marriage Plans" value={data.client2MarriagePlans === "yes" ? `Yes — ${data.client2MarriagePlanDetails ?? ""}` : data.client2MarriagePlans === "no" ? "No" : undefined} />
              <Field label="Has Children" value={data.client2HasChildren === "yes" ? `Yes (${data.client2TotalChildren ?? ""} total)` : data.client2HasChildren === "no" ? "No" : undefined} />
              {data.client2HasChildren === "yes" && (
                <>
                  <Field label="Special Needs" value={data.client2ChildrenSpecialNeeds === "yes" ? `Yes — ${data.client2ChildrenSpecialNeedsDetails ?? ""}` : data.client2ChildrenSpecialNeeds === "no" ? "No" : undefined} />
                  {(data.client2ChildrenUnder18?.length ?? 0) > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Children Under 18:</p>
                      {data.client2ChildrenUnder18?.map((c, i) => (
                        <p key={i} className="text-sm ml-3">• {[c.firstName, c.lastName].filter(Boolean).join(" ")}{c.dob ? ` (DOB: ${c.dob})` : ""}{c.hasSpecialNeeds ? " ⚠ Special needs" : ""}</p>
                      ))}
                    </div>
                  )}
                  {(data.client2ChildrenOver18?.length ?? 0) > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Children Over 18:</p>
                      {data.client2ChildrenOver18?.map((c, i) => (
                        <p key={i} className="text-sm ml-3">• {[c.firstName, c.lastName].filter(Boolean).join(" ")}{c.dob ? ` (DOB: ${c.dob})` : ""}</p>
                      ))}
                    </div>
                  )}
                </>
              )}
              <Field label="Family Circumstances" value={data.client2FamilyCircumstances} />
            </div>
          )}
        </div>
      </ReviewSection>

      {/* ── STEP 4: Additional Background ── */}
      <ReviewSection title="Step 4 — Additional Background" icon={<User className="w-4 h-4" />} step={4} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <SubHeading label="Client 1" />
            <Field label="Residency" value={data.client1Residency} />
            <Field label="Domiciled in UK" value={data.client1DomiciledUK} />
            <Field label="Mental Capacity" value={data.client1MentalCapacity} />
            <Field label="Capacity Notes" value={data.client1MentalCapacityNotes} />
            <Field label="Children from Past Rels" value={data.client1ChildrenPastRelationships === "yes" ? `Yes — ${data.client1ChildrenPastDetails ?? ""}` : data.client1ChildrenPastRelationships === "no" ? "No" : undefined} />
          </div>
          {isMirror && (
            <div className="space-y-1.5">
              <SubHeading label="Client 2" />
              <Field label="Residency" value={data.client2Residency} />
              <Field label="Domiciled in UK" value={data.client2DomiciledUK} />
              <Field label="Mental Capacity" value={data.client2MentalCapacity} />
              <Field label="Capacity Notes" value={data.client2MentalCapacityNotes} />
              <Field label="Children from Past Rels" value={data.client2ChildrenPastRelationships === "yes" ? `Yes — ${data.client2ChildrenPastDetails ?? ""}` : data.client2ChildrenPastRelationships === "no" ? "No" : undefined} />
            </div>
          )}
        </div>
      </ReviewSection>

      {/* ── STEP 5: Due Diligence ── */}
      <ReviewSection title="Step 5 — Due Diligence" icon={<Shield className="w-4 h-4" />} step={5} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Arranged Appointment" value={data.ddArrangedAppointment} />
          {data.ddArrangedAppointmentNotes && <Field label="Arranged Appt Notes" value={data.ddArrangedAppointmentNotes} />}
          <Field label="Knowledge of Estate" value={data.ddKnowledgeOfEstate} />
          {data.ddKnowledgeOfEstateNotes && <Field label="Knowledge Notes" value={data.ddKnowledgeOfEstateNotes} />}
          <Field label="Knew Beneficiaries" value={data.ddKnewBeneficiaries} />
          {data.ddKnewBeneficiariesNotes && <Field label="Beneficiaries Notes" value={data.ddKnewBeneficiariesNotes} />}
          <Field
            label="Signs of Influence"
            value={data.ddSignsOfInfluence === "yes" ? `⚠ YES — ${data.ddSignsOfInfluenceNotes ?? ""}` : data.ddSignsOfInfluence === "no" ? "No" : undefined}
          />
          <Field label="Knew Appointees" value={data.ddKnewAppointees} />
          {data.ddKnewAppointeesNotes && <Field label="Appointees Notes" value={data.ddKnewAppointeesNotes} />}
        </div>
      </ReviewSection>

      {/* ── STEP 6: Executors / Trustees / Guardians ── */}
      <ReviewSection title="Step 6 — Executors, Trustees & Guardians" icon={<Scale className="w-4 h-4" />} step={6} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <SubHeading label="Client 1" />
            <PersonList persons={data.client1Executors?.length ? data.client1Executors : data.executors} label="Primary Executors" />
            <PersonList persons={data.client1ReservedExecutors?.length ? data.client1ReservedExecutors : data.reservedExecutors} label="Reserved Executors" />
            <PersonList persons={data.client1Guardians?.length ? data.client1Guardians : data.guardians} label="Primary Guardians" />
            <PersonList persons={data.client1ReservedGuardians?.length ? data.client1ReservedGuardians : data.reservedGuardians} label="Reserved Guardians" />
          </div>
          {isMirror && (
            <div className="space-y-2">
              <SubHeading label="Client 2" />
              <PersonList persons={data.client2Executors} label="Primary Executors" />
              <PersonList persons={data.client2ReservedExecutors} label="Reserved Executors" />
              <PersonList persons={data.client2Guardians} label="Primary Guardians" />
              <PersonList persons={data.client2ReservedGuardians} label="Reserved Guardians" />
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <SubHeading label="Trustees (Shared)" />
          <PersonList persons={data.trustees} label="Trustees" />
        </div>
      </ReviewSection>

      {/* ── STEP 7: Property & Assets ── */}
      <ReviewSection title="Step 7 — Property & Assets" icon={<Home className="w-4 h-4" />} step={7} onEdit={onEdit}>
        <div className="space-y-1.5">
          <SubHeading label="Main Residence" />
          <Field label="Property Owned" value={data.propertyOwned === "yes" ? "Yes" : data.propertyOwned === "no" ? "No" : undefined} />
          {data.propertyOwned === "yes" && (
            <>
              <Field label="Property Address" value={data.propertyAddress} />
              <Field label="Ownership Type" value={data.propertyOwnership} />
              <Field label="Estimated Value" value={data.propertyValue ? `£${data.propertyValue}` : undefined} />
              <Field label="Mortgage Outstanding" value={data.mortgageOutstanding === "yes" ? "Yes" : data.mortgageOutstanding === "no" ? "No" : undefined} />
              {data.mortgageOutstanding === "yes" && (
                <>
                  <Field label="Mortgage Lender" value={data.mortgageLender} />
                  <Field label="Mortgage Balance" value={data.mortgageBalance ? `£${data.mortgageBalance}` : undefined} />
                  <Field label="Term Remaining" value={data.mortgageTermRemaining} />
                </>
              )}
            </>
          )}
          <Field label="Other Properties" value={data.hasOtherProperties === "yes" ? `Yes — ${data.otherProperties ?? ""}` : data.hasOtherProperties === "no" ? "No" : undefined} />
          <Field label="Assets Outside UK" value={data.assetsOutsideUK === "yes" ? `Yes — ${data.assetsOutsideUKDetails ?? ""}` : data.assetsOutsideUK === "no" ? "No" : undefined} />
          <SubHeading label="Client 1 Financial Assets" />
          <Field label="Bank Accounts" value={data.bankAccounts} />
          <Field label="Investments" value={data.investments} />
          <Field label="Pension Details" value={data.pensionDetails} />
          <Field label="Estimated Estate Value" value={data.estimatedEstateValue ? `£${data.estimatedEstateValue}` : undefined} />
          {isMirror && (
            <>
              <SubHeading label="Client 2 Financial Assets" />
              <Field label="Bank Accounts" value={data.client2BankAccounts} />
              <Field label="Investments" value={data.client2Investments} />
              <Field label="Pension Details" value={data.client2PensionDetails} />
              <Field label="Estimated Estate Value" value={data.client2EstimatedEstateValue ? `£${data.client2EstimatedEstateValue}` : undefined} />
            </>
          )}
          <SubHeading label="Care Concerns" />
          <Field label="Care Concerns" value={data.careConcerns === "yes" ? "Yes" : data.careConcerns === "no" ? "No" : undefined} />
          {data.careConcerns === "yes" && <Field label="Care Concern Details" value={data.careConcernDetails} />}
        </div>
      </ReviewSection>

      {/* ── STEP 8: Life Insurance ── */}
      <ReviewSection title="Step 8 — Life Insurance & Protection" icon={<ShoppingBag className="w-4 h-4" />} step={8} onEdit={onEdit}>
        <div className="space-y-2">
          <Field label="Has Life Insurance" value={data.hasLifeInsurance === "yes" ? "Yes" : data.hasLifeInsurance === "no" ? "No" : undefined} />
          {data.hasLifeInsurance === "yes" && (data.lifeInsurancePolicies?.length ?? 0) > 0 && (
            <div className="mt-2 space-y-3">
              {data.lifeInsurancePolicies?.map((p, i) => (
                <div key={i} className="ml-3 pl-3 border-l-2 border-border space-y-0.5">
                  <p className="text-sm font-medium">Policy {i + 1}: {p.provider}</p>
                  {p.policyNumber && <p className="text-xs text-muted-foreground">Policy #: {p.policyNumber}</p>}
                  {p.sumAssured && <p className="text-xs text-muted-foreground">Sum Assured: £{p.sumAssured}</p>}
                  {p.termRemaining && <p className="text-xs text-muted-foreground">Term: {p.termRemaining}</p>}
                  {p.beneficiary && <p className="text-xs text-muted-foreground">Beneficiary: {p.beneficiary}</p>}
                  {p.inTrust !== undefined && <p className="text-xs text-muted-foreground">In Trust: {p.inTrust ? "Yes" : "No"}</p>}
                  {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
                </div>
              ))}
            </div>
          )}
          <Field label="Protection Notes" value={data.lifeInsuranceNotes} />
        </div>
      </ReviewSection>

      {/* ── STEP 9: Business Interests ── */}
      <ReviewSection title="Step 9 — Business Interests" icon={<Briefcase className="w-4 h-4" />} step={9} onEdit={onEdit}>
        <div className="space-y-2">
          <Field label="Has Business Interests" value={data.hasBusinessInterests === "yes" ? "Yes" : data.hasBusinessInterests === "no" ? "No" : undefined} />
          {data.hasBusinessInterests === "yes" && (data.businessInterestsDetails?.length ?? 0) > 0 && (
            <div className="mt-2 space-y-3">
              {data.businessInterestsDetails?.map((b, i) => (
                <div key={i} className="ml-3 pl-3 border-l-2 border-border space-y-0.5">
                  <p className="text-sm font-medium">{b.businessName}</p>
                  {b.natureOfBusiness && <p className="text-xs text-muted-foreground">Nature: {b.natureOfBusiness}</p>}
                  {b.ownershipPercentage && <p className="text-xs text-muted-foreground">Ownership: {b.ownershipPercentage}%</p>}
                  {b.notes && <p className="text-xs text-muted-foreground italic">{b.notes}</p>}
                </div>
              ))}
            </div>
          )}
          {data.hasBusinessInterests === "yes" && data.businessInterests && (
            <Field label="Business Details" value={data.businessInterests} />
          )}
        </div>
      </ReviewSection>

      {/* ── STEP 10: Pets ── */}
      <ReviewSection title="Step 10 — Pets" icon={<Heart className="w-4 h-4" />} step={10} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Has Pets" value={data.hasPets === "yes" ? "Yes" : data.hasPets === "no" ? "No" : undefined} />
          {data.hasPets === "yes" && (
            <>
              <Field label="Pet Details" value={data.petsDetails} />
              <Field label="Proposed Carer" value={data.petsCarer} />
            </>
          )}
        </div>
      </ReviewSection>

      {/* ── STEP 11: Funeral Wishes ── */}
      <ReviewSection title="Step 11 — Funeral Wishes" icon={<Flower2 className="w-4 h-4" />} step={11} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <SubHeading label="Client 1" />
            <Field label="Funeral Type" value={data.client1FuneralType ?? data.funeralType} />
            <Field label="Wishes / Instructions" value={data.client1FuneralWishes ?? data.funeralWishes} />
            <Field label="Organ Donation" value={(data.client1OrganDonation ?? data.organDonation) === "yes" ? "Yes" : (data.client1OrganDonation ?? data.organDonation) === "no" ? "No" : undefined} />
          </div>
          {isMirror && (
            <div className="space-y-1.5">
              <SubHeading label="Client 2" />
              <Field label="Funeral Type" value={data.client2FuneralType} />
              <Field label="Wishes / Instructions" value={data.client2FuneralWishes} />
              <Field label="Organ Donation" value={data.client2OrganDonation === "yes" ? "Yes" : data.client2OrganDonation === "no" ? "No" : undefined} />
            </div>
          )}
        </div>
      </ReviewSection>

      {/* ── STEP 12: Legacies & Gifts ── */}
      <ReviewSection title="Step 12 — Legacies & Specific Gifts" icon={<Gift className="w-4 h-4" />} step={12} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <SubHeading label="Client 1" />
            {(data.client1SpecificGifts?.length ?? 0) > 0
              ? data.client1SpecificGifts?.map((g, i) => (
                  <div key={i} className="ml-3 pl-3 border-l-2 border-border space-y-0.5">
                    <p className="text-sm font-medium">{g.isCharity ? "🏛 Charity" : "🎁 Gift"} {i + 1}: {g.description}</p>
                    <p className="text-xs text-muted-foreground">Recipient: {g.recipient}</p>
                    {g.value && <p className="text-xs text-muted-foreground">Value: {g.value}</p>}
                    {g.notes && <p className="text-xs text-muted-foreground italic">{g.notes}</p>}
                  </div>
                ))
              : <span className="text-sm text-muted-foreground italic">No specific gifts</span>}
          </div>
          {isMirror && (
            <div className="space-y-2">
              <SubHeading label="Client 2" />
              {(data.client2SpecificGifts?.length ?? 0) > 0
                ? data.client2SpecificGifts?.map((g, i) => (
                    <div key={i} className="ml-3 pl-3 border-l-2 border-border space-y-0.5">
                      <p className="text-sm font-medium">{g.isCharity ? "🏛 Charity" : "🎁 Gift"} {i + 1}: {g.description}</p>
                      <p className="text-xs text-muted-foreground">Recipient: {g.recipient}</p>
                      {g.value && <p className="text-xs text-muted-foreground">Value: {g.value}</p>}
                      {g.notes && <p className="text-xs text-muted-foreground italic">{g.notes}</p>}
                    </div>
                  ))
                : <span className="text-sm text-muted-foreground italic">No specific gifts</span>}
            </div>
          )}
        </div>
      </ReviewSection>

      {/* ── STEP 13: Beneficiaries ── */}
      <ReviewSection title="Step 13 — Beneficiaries & Residuary Estate" icon={<Heart className="w-4 h-4" />} step={13} onEdit={onEdit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <SubHeading label="Client 1" />
            <Field label="Residuary Estate" value={data.client1ResidualEstate} />
            <Field label="Residuary Backup" value={data.client1ResidualBackup} />
            <PersonList persons={data.client1Beneficiaries ?? []} label="Named Beneficiaries" />
            <Field label="Children Benefit Age" value={data.client1ChildrenBenefitAge ? `Age ${data.client1ChildrenBenefitAge}` : undefined} />
            <Field label="Vulnerable Beneficiary" value={data.client1HasVulnerableBeneficiary === "yes" ? `Yes — ${data.client1VulnerableBeneficiaryDetails ?? ""}` : data.client1HasVulnerableBeneficiary === "no" ? "No" : undefined} />
          </div>
          {isMirror && (
            <div className="space-y-2">
              <SubHeading label="Client 2" />
              <Field label="Residuary Estate" value={data.client2ResidualEstate} />
              <Field label="Residuary Backup" value={data.client2ResidualBackup} />
              <PersonList persons={data.client2Beneficiaries} label="Named Beneficiaries" />
              <Field label="Children Benefit Age" value={data.client2ChildrenBenefitAge ? `Age ${data.client2ChildrenBenefitAge}` : undefined} />
              <Field label="Vulnerable Beneficiary" value={data.client2HasVulnerableBeneficiary === "yes" ? `Yes — ${data.client2VulnerableBeneficiaryDetails ?? ""}` : data.client2HasVulnerableBeneficiary === "no" ? "No" : undefined} />
            </div>
          )}
        </div>
      </ReviewSection>

      {/* ── STEP 14: Disaster Clause & Notes ── */}
      <ReviewSection title="Step 14 — Disaster Clause & Notes" icon={<AlertTriangle className="w-4 h-4" />} step={14} onEdit={onEdit}>
        <div className="space-y-1.5">
          <Field label="Disaster Clause (C1)" value={data.disasterClauseClient1} />
          {isMirror && <Field label="Disaster Clause (C2)" value={data.disasterClauseClient2} />}
          <Field label="Disaster Clause Notes" value={data.disasterClauseNotes} />
          <Field label="Additional Notes" value={data.additionalNotes} />
          <Field label="Consultant Notes" value={data.specialNotes} />
        </div>
      </ReviewSection>

      {/* ── Print Summary Button ── */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={() => window.print()}
          style={{ borderColor: "oklch(0.28 0.07 155 / 0.4)", color: "oklch(0.28 0.07 155)" }}
        >
          <FileText className="w-3.5 h-3.5" />
          Print / Save Summary as PDF
        </Button>
      </div>

      {/* ── Submit ── */}
      <div
        className="rounded-xl p-5 border-2"
        style={{ background: "oklch(0.97 0.015 155)", borderColor: "oklch(0.28 0.07 155 / 0.3)" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <Send className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.28 0.07 155)" }} />
          <div>
            <h3 className="font-serif text-sm font-semibold genesis-green-text">Ready to Submit</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Submitting will save this instruction and automatically notify the admin team at Genesis Wills and Estate Planning.
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
              Submitting…
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
