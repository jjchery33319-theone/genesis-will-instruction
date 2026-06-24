import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";
import {
  CheckCircle2, Star, Mail, ArrowLeft, Loader2, AlertTriangle,
  Calendar, User, Users, Baby, Globe, Shield, Scale, Heart, Home,
  HeartHandshake, Briefcase, ShoppingBag, PawPrint, Flower2, Info,
  ChevronDown, ChevronRight, CheckCircle, XCircle
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FormHeader from "../components/form/FormHeader";
import { PRODUCTS } from "../../../shared/willConstants";

function getProductLabel(id: string) {
  return PRODUCTS.find(p => p.id === id)?.label ?? id;
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-3 border-b flex items-center justify-between gap-2 text-left"
        style={{ background: "oklch(0.97 0.015 155)" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "oklch(0.28 0.07 155)" }}>{icon}</span>
          <h3 className="font-serif text-sm font-semibold genesis-green-text">{title}</h3>
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
          : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-5 space-y-2">{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 text-sm">
      <span className="font-medium text-muted-foreground sm:min-w-[200px] flex-shrink-0">{label}:</span>
      <span className="text-foreground break-words">{value}</span>
    </div>
  );
}

function YesNo({ label, value, detail }: { label: string; value?: string | null; detail?: string | null }) {
  if (!value) return null;
  const isYes = value === "yes";
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 text-sm">
      <span className="font-medium text-muted-foreground sm:min-w-[200px] flex-shrink-0">{label}:</span>
      <span className="flex items-center gap-1">
        {isYes
          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          : <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
        <span>{isYes ? "Yes" : "No"}{isYes && detail ? ` — ${detail}` : ""}</span>
      </span>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 pt-3 border-t first:mt-0 first:pt-0 first:border-t-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function PersonList({ persons }: { persons: unknown }) {
  if (!Array.isArray(persons) || persons.length === 0) return <p className="text-sm text-muted-foreground">None recorded</p>;
  return (
    <div className="space-y-2 mt-1">
      {(persons as Record<string, string>[]).map((p, i) => (
        <div key={i} className="rounded-lg border p-3 text-sm space-y-0.5" style={{ background: "oklch(0.98 0.005 155)" }}>
          <p className="font-medium">{[p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ")}</p>
          {p.relationship && <p className="text-xs text-muted-foreground">Relationship: {p.relationship}</p>}
          {p.address && <p className="text-xs text-muted-foreground">Address: {p.address}</p>}
          {p.phone && <p className="text-xs text-muted-foreground">Phone: {p.phone}</p>}
          {p.email && <p className="text-xs text-muted-foreground">Email: {p.email}</p>}
          {p.dob && <p className="text-xs text-muted-foreground">DOB: {p.dob}</p>}
          {p.share && <p className="text-xs text-muted-foreground">Share: {p.share}</p>}
          {p.notes && <p className="text-xs text-muted-foreground italic">Notes: {p.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function GiftList({ gifts }: { gifts: unknown }) {
  if (!Array.isArray(gifts) || gifts.length === 0) return <p className="text-sm text-muted-foreground">None recorded</p>;
  return (
    <div className="space-y-2 mt-1">
      {(gifts as Record<string, string>[]).map((g, i) => (
        <div key={i} className="rounded-lg border p-3 text-sm space-y-0.5" style={{ background: "oklch(0.98 0.005 155)" }}>
          <p className="font-medium">{g.description}</p>
          <p className="text-xs text-muted-foreground">Recipient: {g.recipient}</p>
          {g.value && <p className="text-xs text-muted-foreground">Value: £{g.value}</p>}
          {g.isCharity && <Badge className="text-xs mt-1">Charity</Badge>}
          {g.notes && <p className="text-xs text-muted-foreground italic">Notes: {g.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function ChildList({ children: kids }: { children: unknown }) {
  if (!Array.isArray(kids) || kids.length === 0) return null;
  return (
    <div className="space-y-2 mt-1">
      {(kids as Record<string, string>[]).map((c, i) => (
        <div key={i} className="rounded-lg border p-3 text-sm space-y-0.5" style={{ background: "oklch(0.98 0.005 155)" }}>
          <p className="font-medium">{[c.firstName, c.lastName].filter(Boolean).join(" ")}</p>
          {c.dob && <p className="text-xs text-muted-foreground">DOB: {c.dob}</p>}
          {c.ageGroup && <p className="text-xs text-muted-foreground">Age Group: {c.ageGroup === "under18" ? "Under 18" : "Over 18"}</p>}
          {c.hasSpecialNeeds && <Badge className="text-xs mt-1" variant="destructive">Special Needs</Badge>}
          {c.specialNeedsDetails && <p className="text-xs text-muted-foreground italic">{c.specialNeedsDetails}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SubmissionSuccess() {
  const params = useParams<{ ref: string }>();
  const ref = params.ref ?? "";

  const { data: record, isLoading } = trpc.will.getByRef.useQuery(
    { ref },
    { enabled: !!ref }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
        <FormHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
        </div>
      </div>
    );
  }

  const recommendations = Array.isArray(record?.recommendationsJson) ? record.recommendationsJson : [];
  const products = Array.isArray(record?.productsOrdered) ? record.productsOrdered as string[] : [];
  const isMirror = !!record?.client2FirstName;
  const client1Name = [record?.client1Prefix, record?.client1FirstName, record?.client1LastName].filter(Boolean).join(" ");
  const client2Name = isMirror ? [record?.client2Prefix, record?.client2FirstName, record?.client2LastName].filter(Boolean).join(" ") : null;

  // Per-client fallbacks
  const c1Executors = (record?.client1Executors as unknown[])?.length ? record?.client1Executors : record?.executors;
  const c1ReservedExecutors = (record?.client1ReservedExecutors as unknown[])?.length ? record?.client1ReservedExecutors : record?.reservedExecutors;
  const c1Guardians = (record?.client1Guardians as unknown[])?.length ? record?.client1Guardians : record?.guardians;
  const c1Beneficiaries = (record?.client1Beneficiaries as unknown[])?.length ? record?.client1Beneficiaries : record?.beneficiaries;
  const c1Gifts = (record?.client1SpecificGifts as unknown[])?.length ? record?.client1SpecificGifts : record?.specificGifts;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      <FormHeader />

      <div className="container max-w-3xl py-8 space-y-6">
        {/* Success Banner */}
        <div
          className="rounded-xl p-6 text-white text-center"
          style={{ background: "linear-gradient(135deg, oklch(0.18 0.06 155) 0%, oklch(0.28 0.07 155) 100%)" }}
        >
          <CheckCircle2 className="w-14 h-14 mx-auto mb-3" style={{ color: "oklch(0.78 0.12 85)" }} />
          <h1 className="font-serif text-2xl font-semibold">Instruction Submitted Successfully</h1>
          <p className="text-sm mt-2" style={{ color: "oklch(0.78 0.12 85)" }}>
            Reference Number: <strong>{ref}</strong>
          </p>
          <p className="text-sm mt-1 opacity-80">
            The admin team has been notified and will process this instruction shortly.
          </p>
        </div>

        {/* Email Notification Confirmation */}
        <div
          className="rounded-xl p-4 border flex items-start gap-3"
          style={{ background: "oklch(0.99 0.01 155)", borderColor: "oklch(0.78 0.12 85 / 0.3)" }}
        >
          <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.28 0.07 155)" }} />
          <div>
            <p className="text-sm font-semibold genesis-green-text">Admin Team Notified</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated emails have been sent to the Genesis Estate Planning team with the full instruction summary.
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: "oklch(0.97 0.015 90)" }}>
              <Star className="w-4 h-4" style={{ color: "oklch(0.65 0.14 80)" }} />
              <h2 className="font-serif text-sm font-semibold genesis-green-text">Estate Planning Recommendations</h2>
            </div>
            <div className="p-5 space-y-3">
              {recommendations.map((rec: Record<string, string>) => (
                <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg border"
                  style={{
                    background: rec.priority === "high" ? "oklch(0.99 0.01 85 / 0.6)" : "oklch(0.99 0.005 155)",
                    borderColor: rec.priority === "high" ? "oklch(0.78 0.12 85 / 0.5)" : "oklch(0.88 0.02 155)",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: rec.priority === "high" ? "oklch(0.65 0.14 80)" : "oklch(0.5 0.04 155)" }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold genesis-green-text">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                  </div>
                  <Badge className="text-xs flex-shrink-0"
                    style={rec.priority === "high"
                      ? { background: "oklch(0.78 0.12 85)", color: "oklch(0.2 0.05 155)" }
                      : { background: "oklch(0.88 0.02 155)", color: "oklch(0.28 0.07 155)" }}>
                    {rec.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Full Instruction Summary ── */}
        {record && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px flex-1" style={{ background: "oklch(0.88 0.02 155)" }} />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2">Full Instruction Summary</p>
              <div className="h-px flex-1" style={{ background: "oklch(0.88 0.02 155)" }} />
            </div>

            {/* Appointment */}
            <Section title="Appointment Details" icon={<Calendar className="w-4 h-4" />}>
              <Field label="Reference" value={record.referenceNumber} />
              <Field label="Will Type" value={record.willType} />
              <Field label="LPA Type" value={record.lpaType} />
              <Field label="Appointment Date" value={record.appointmentDate} />
              <Field label="Appointment Time" value={record.appointmentTime} />
              <Field label="Consultant" value={record.consultantName} />
              <Field label="Price Quoted" value={record.priceQuoted ? `£${record.priceQuoted}` : null} />
              <Field label="Estimated Draft Date" value={record.estimatedDraftDate} />
              {products.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {products.map(pid => (
                    <Badge key={pid} className="text-xs" style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                      {getProductLabel(pid)}
                    </Badge>
                  ))}
                </div>
              )}
            </Section>

            {/* Client 1 */}
            <Section title={`Client 1 — ${client1Name}`} icon={<User className="w-4 h-4" />} defaultOpen={false}>
              <Field label="Full Name" value={[record.client1Prefix, record.client1FirstName, record.client1MiddleName, record.client1LastName].filter(Boolean).join(" ")} />
              <Field label="Date of Birth" value={record.client1Dob} />
              <Field label="Address" value={[record.client1AddressLine1, record.client1City, record.client1Postcode].filter(Boolean).join(", ") || null} />
              <Field label="Marital Status" value={record.client1MaritalStatus} />
              <Field label="Job Title" value={record.client1JobTitle} />
              <Field label="Nationality" value={record.client1Nationality} />
              <Field label="Daytime Phone" value={record.client1DaytimePhone} />
              <Field label="Mobile" value={record.client1Mobile} />
              <Field label="Email" value={record.client1Email} />
            </Section>

            {/* Client 2 */}
            {client2Name && (
              <Section title={`Client 2 — ${client2Name}`} icon={<Users className="w-4 h-4" />} defaultOpen={false}>
                <Field label="Full Name" value={[record.client2Prefix, record.client2FirstName, record.client2MiddleName, record.client2LastName].filter(Boolean).join(" ")} />
                <Field label="Date of Birth" value={record.client2Dob} />
                <Field label="Address" value={[record.client2AddressLine1, record.client2City, record.client2Postcode].filter(Boolean).join(", ") || null} />
                <Field label="Marital Status" value={record.client2MaritalStatus} />
                <Field label="Job Title" value={record.client2JobTitle} />
                <Field label="Nationality" value={record.client2Nationality} />
                <Field label="Daytime Phone" value={record.client2DaytimePhone} />
                <Field label="Mobile" value={record.client2Mobile} />
                <Field label="Email" value={record.client2Email} />
              </Section>
            )}

            {/* Family Background */}
            <Section title="Family Background" icon={<Baby className="w-4 h-4" />} defaultOpen={false}>
              <SubSection title={isMirror ? "Client 1" : "Family"}>
                <YesNo label="Marriage / Civil Partnership Plans" value={record.client1MarriagePlans} detail={record.client1MarriagePlanDetails} />
                <YesNo label="Has Children" value={record.client1HasChildren} />
                <Field label="Total Children" value={record.client1TotalChildren} />
                <YesNo label="Children with Special Needs" value={record.client1ChildrenSpecialNeeds} detail={record.client1ChildrenSpecialNeedsDetails} />
                <Field label="Family Circumstances" value={record.client1FamilyCircumstances} />
              </SubSection>
              {(record.client1ChildrenUnder18 as unknown[])?.length > 0 && (
                <SubSection title="Client 1 — Children Under 18">
                  <ChildList children={record.client1ChildrenUnder18} />
                </SubSection>
              )}
              {(record.client1ChildrenOver18 as unknown[])?.length > 0 && (
                <SubSection title="Client 1 — Children Over 18">
                  <ChildList children={record.client1ChildrenOver18} />
                </SubSection>
              )}
              {isMirror && (
                <SubSection title="Client 2">
                  <YesNo label="Marriage / Civil Partnership Plans" value={record.client2MarriagePlans} detail={record.client2MarriagePlanDetails} />
                  <YesNo label="Has Children" value={record.client2HasChildren} />
                  <Field label="Total Children" value={record.client2TotalChildren} />
                  <YesNo label="Children with Special Needs" value={record.client2ChildrenSpecialNeeds} detail={record.client2ChildrenSpecialNeedsDetails} />
                  <Field label="Family Circumstances" value={record.client2FamilyCircumstances} />
                </SubSection>
              )}
            </Section>

            {/* Additional Background */}
            <Section title="Additional Background" icon={<Globe className="w-4 h-4" />} defaultOpen={false}>
              <SubSection title={isMirror ? "Client 1" : "Background"}>
                <Field label="Residency" value={record.client1Residency} />
                <YesNo label="Domiciled in UK" value={record.client1DomiciledUK} />
                <YesNo label="Mental Capacity Confirmed" value={record.client1MentalCapacity} detail={record.client1MentalCapacityNotes} />
                <YesNo label="Children from Past Relationships" value={record.client1ChildrenPastRelationships} detail={record.client1ChildrenPastDetails} />
              </SubSection>
              {isMirror && (
                <SubSection title="Client 2">
                  <Field label="Residency" value={record.client2Residency} />
                  <YesNo label="Domiciled in UK" value={record.client2DomiciledUK} />
                  <YesNo label="Mental Capacity Confirmed" value={record.client2MentalCapacity} detail={record.client2MentalCapacityNotes} />
                  <YesNo label="Children from Past Relationships" value={record.client2ChildrenPastRelationships} detail={record.client2ChildrenPastDetails} />
                </SubSection>
              )}
            </Section>

            {/* Executors & Guardians */}
            <Section title="Executors, Trustees & Guardians" icon={<Scale className="w-4 h-4" />} defaultOpen={false}>
              <SubSection title={isMirror ? "Client 1 — Executors" : "Executors"}>
                <PersonList persons={c1Executors} />
              </SubSection>
              {(c1ReservedExecutors as unknown[])?.length > 0 && (
                <SubSection title={isMirror ? "Client 1 — Reserved Executors" : "Reserved Executors"}>
                  <PersonList persons={c1ReservedExecutors} />
                </SubSection>
              )}
              {isMirror && (
                <SubSection title="Client 2 — Executors">
                  <PersonList persons={record.client2Executors} />
                </SubSection>
              )}
              {(record.trustees as unknown[])?.length > 0 && (
                <SubSection title="Trustees">
                  <PersonList persons={record.trustees} />
                </SubSection>
              )}
              {(c1Guardians as unknown[])?.length > 0 && (
                <SubSection title={isMirror ? "Client 1 — Guardians" : "Guardians"}>
                  <PersonList persons={c1Guardians} />
                </SubSection>
              )}
              {isMirror && (record.client2Guardians as unknown[])?.length > 0 && (
                <SubSection title="Client 2 — Guardians">
                  <PersonList persons={record.client2Guardians} />
                </SubSection>
              )}
            </Section>

            {/* Beneficiaries */}
            <Section title="Beneficiaries" icon={<Heart className="w-4 h-4" />} defaultOpen={false}>
              <SubSection title={isMirror ? "Client 1 — Beneficiaries" : "Beneficiaries"}>
                <PersonList persons={c1Beneficiaries} />
              </SubSection>
              <SubSection title={isMirror ? "Client 1 — Residue" : "Residue"}>
                <Field label="Residuary Estate" value={record.client1ResidualEstate ?? record.residuaryEstate} />
                <Field label="Residuary Backup" value={record.client1ResidualBackup ?? record.residuaryBackup} />
                <Field label="Children Benefit Age" value={record.client1ChildrenBenefitAge ?? record.childrenBenefitAge ? `Age ${record.client1ChildrenBenefitAge ?? record.childrenBenefitAge}` : null} />
                <YesNo label="Vulnerable Beneficiary" value={record.client1HasVulnerableBeneficiary ?? record.hasVulnerableBeneficiary} detail={record.client1VulnerableBeneficiaryDetails ?? record.vulnerableBeneficiaryDetails} />
                <Field label="Disaster Clause" value={record.disasterClauseClient1} />
              </SubSection>
              {isMirror && (
                <>
                  <SubSection title="Client 2 — Beneficiaries">
                    <PersonList persons={record.client2Beneficiaries} />
                  </SubSection>
                  <SubSection title="Client 2 — Residue">
                    <Field label="Residuary Estate" value={record.client2ResidualEstate} />
                    <Field label="Residuary Backup" value={record.client2ResidualBackup} />
                    <Field label="Children Benefit Age" value={record.client2ChildrenBenefitAge ? `Age ${record.client2ChildrenBenefitAge}` : null} />
                    <YesNo label="Vulnerable Beneficiary" value={record.client2HasVulnerableBeneficiary} detail={record.client2VulnerableBeneficiaryDetails} />
                    <Field label="Disaster Clause" value={record.disasterClauseClient2} />
                  </SubSection>
                </>
              )}
            </Section>

            {/* Property & Assets */}
            <Section title="Property & Assets" icon={<Home className="w-4 h-4" />} defaultOpen={false}>
              <YesNo label="Property Owned" value={record.propertyOwned} />
              <Field label="Property Address" value={record.propertyAddress} />
              <Field label="Ownership Type" value={record.propertyOwnership} />
              <Field label="Property Value" value={record.propertyValue ? `£${record.propertyValue}` : null} />
              <YesNo label="Mortgage Outstanding" value={record.mortgageOutstanding} />
              <Field label="Mortgage Balance" value={record.mortgageBalance ? `£${record.mortgageBalance}` : null} />
              <Field label="Mortgage Lender" value={record.mortgageLender} />
              <Field label="Mortgage Term Remaining" value={record.mortgageTermRemaining} />
              <YesNo label="Has Other Properties" value={record.hasOtherProperties} detail={record.otherProperties} />
              <YesNo label="Assets Outside UK" value={record.assetsOutsideUK} detail={record.assetsOutsideUKDetails} />
              <SubSection title={isMirror ? "Client 1 — Financial Assets" : "Financial Assets"}>
                <Field label="Bank Accounts" value={record.bankAccounts} />
                <Field label="Investments" value={record.investments} />
                <Field label="Pension Details" value={record.pensionDetails} />
                <Field label="Estimated Estate Value" value={record.estimatedEstateValue ? `£${record.estimatedEstateValue}` : null} />
              </SubSection>
              {isMirror && (
                <SubSection title="Client 2 — Financial Assets">
                  <Field label="Bank Accounts" value={record.client2BankAccounts} />
                  <Field label="Investments" value={record.client2Investments} />
                  <Field label="Pension Details" value={record.client2PensionDetails} />
                  <Field label="Estimated Estate Value" value={record.client2EstimatedEstateValue ? `£${record.client2EstimatedEstateValue}` : null} />
                </SubSection>
              )}
              <YesNo label="Care Concerns" value={record.careConcerns} detail={record.careConcernDetails} />
            </Section>

            {/* Life Insurance */}
            <Section title="Life Insurance & Protection" icon={<HeartHandshake className="w-4 h-4" />} defaultOpen={false}>
              <YesNo label="Has Life Insurance" value={record.hasLifeInsurance} />
              {(record.lifeInsurancePolicies as unknown[])?.length > 0 && (
                <div className="space-y-2 mt-2">
                  {(record.lifeInsurancePolicies as Record<string, string>[]).map((p, i) => (
                    <div key={i} className="rounded-lg border p-3 text-sm space-y-0.5" style={{ background: "oklch(0.98 0.005 155)" }}>
                      <p className="font-medium">{p.provider}</p>
                      {p.policyNumber && <p className="text-xs text-muted-foreground">Policy #: {p.policyNumber}</p>}
                      {p.sumAssured && <p className="text-xs text-muted-foreground">Sum Assured: £{p.sumAssured}</p>}
                      {p.termRemaining && <p className="text-xs text-muted-foreground">Term Remaining: {p.termRemaining}</p>}
                      {p.beneficiary && <p className="text-xs text-muted-foreground">Beneficiary: {p.beneficiary}</p>}
                      {p.inTrust && <Badge className="text-xs mt-1">In Trust</Badge>}
                    </div>
                  ))}
                </div>
              )}
              <Field label="Notes" value={record.lifeInsuranceNotes} />
            </Section>

            {/* Business Interests */}
            <Section title="Business Interests" icon={<Briefcase className="w-4 h-4" />} defaultOpen={false}>
              <YesNo label="Has Business Interests" value={record.hasBusinessInterests} />
              <Field label="Overview" value={record.businessInterests} />
              {(record.businessInterestsDetails as unknown[])?.length > 0 && (
                <div className="space-y-2 mt-2">
                  {(record.businessInterestsDetails as Record<string, string>[]).map((b, i) => (
                    <div key={i} className="rounded-lg border p-3 text-sm space-y-0.5" style={{ background: "oklch(0.98 0.005 155)" }}>
                      <p className="font-medium">{b.businessName}</p>
                      <p className="text-xs text-muted-foreground">Nature: {b.natureOfBusiness}</p>
                      {b.ownershipPercentage && <p className="text-xs text-muted-foreground">Ownership: {b.ownershipPercentage}%</p>}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Gifts */}
            <Section title="Legacies & Specific Gifts" icon={<ShoppingBag className="w-4 h-4" />} defaultOpen={false}>
              <SubSection title={isMirror ? "Client 1 — Gifts" : "Gifts"}>
                <GiftList gifts={c1Gifts} />
              </SubSection>
              {isMirror && (
                <SubSection title="Client 2 — Gifts">
                  <GiftList gifts={record.client2SpecificGifts} />
                </SubSection>
              )}
            </Section>

            {/* Pets */}
            <Section title="Pets" icon={<PawPrint className="w-4 h-4" />} defaultOpen={false}>
              <YesNo label="Has Pets" value={record.hasPets} />
              <Field label="Pet Details" value={record.petsDetails} />
              <Field label="Preferred Carer" value={record.petsCarer} />
            </Section>

            {/* Funeral Wishes */}
            <Section title="Funeral Wishes" icon={<Flower2 className="w-4 h-4" />} defaultOpen={false}>
              <SubSection title={isMirror ? "Client 1" : "Wishes"}>
                <Field label="Funeral Type" value={record.client1FuneralType ?? record.funeralType} />
                <Field label="Funeral Wishes" value={record.client1FuneralWishes ?? record.funeralWishes} />
                <YesNo label="Organ Donation" value={record.client1OrganDonation ?? record.organDonation} />
              </SubSection>
              {isMirror && (
                <SubSection title="Client 2">
                  <Field label="Funeral Type" value={record.client2FuneralType} />
                  <Field label="Funeral Wishes" value={record.client2FuneralWishes} />
                  <YesNo label="Organ Donation" value={record.client2OrganDonation} />
                </SubSection>
              )}
            </Section>

            {/* Notes */}
            <Section title="Notes & Additional Information" icon={<Info className="w-4 h-4" />} defaultOpen={false}>
              <Field label="Disaster Clause Notes" value={record.disasterClauseNotes} />
              <Field label="Additional Notes" value={record.additionalNotes} />
              <Field label="Special Notes" value={record.specialNotes} />
            </Section>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              New Instruction
            </Button>
          </Link>
          <Link href="/admin">
            <Button className="gap-2" style={{ background: "oklch(0.28 0.07 155)", color: "oklch(0.97 0.03 90)" }}>
              View All Submissions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
