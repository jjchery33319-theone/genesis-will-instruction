import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Loader2, ArrowLeft, Mail, ClipboardList, User, Users, Scale, Heart, Home, Flower2,
  Calendar, ShoppingBag, FileDown, FileText, Shield, GitFork, HeartHandshake, Pencil,
  ScrollText, Baby, Globe, Briefcase, PawPrint, DollarSign, Building2, AlertTriangle,
  CheckCircle2, XCircle, Info, ChevronDown, ChevronRight, Eye
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS } from "../../../shared/willConstants";

function getProductLabel(id: string) {
  return PRODUCTS.find(p => p.id === id)?.label ?? id;
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({
  title, icon, children, collapsible = false
}: { title: string; icon: React.ReactNode; children: React.ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setOpen(o => !o)}
        className="w-full px-5 py-3 border-b flex items-center justify-between gap-2 text-left"
        style={{ background: "oklch(0.97 0.015 155)" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "oklch(0.28 0.07 155)" }}>{icon}</span>
          <h3 className="font-serif text-sm font-semibold genesis-green-text">{title}</h3>
        </div>
        {collapsible && (open
          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
          : <ChevronRight className="w-4 h-4 text-muted-foreground" />)}
      </button>
      {open && <div className="p-5 space-y-2">{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 text-sm">
      <span className="font-medium text-muted-foreground sm:min-w-[220px] flex-shrink-0">{label}:</span>
      <span className="text-foreground break-words">{value}</span>
    </div>
  );
}

function YesNo({ label, value, detail }: { label: string; value?: string | null; detail?: string | null }) {
  if (!value) return null;
  const isYes = value === "yes";
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 text-sm">
      <span className="font-medium text-muted-foreground sm:min-w-[220px] flex-shrink-0">{label}:</span>
      <span className="flex items-center gap-1">
        {isYes
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          : <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
        <span className="text-foreground">{isYes ? "Yes" : "No"}{isYes && detail ? ` — ${detail}` : ""}</span>
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

function formatPersons(persons: unknown, showExtra = false): React.ReactNode {
  if (!Array.isArray(persons) || persons.length === 0) return null;
  return (
    <div className="space-y-2 mt-1">
      {(persons as Record<string, string>[]).map((p, i) => (
        <div key={i} className="rounded-lg border p-3 text-sm space-y-0.5" style={{ background: "oklch(0.98 0.005 155)" }}>
          <p className="font-medium">{[p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ") || p.fullName ? [p.title, p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ") || [p.title, p.fullName].filter(Boolean).join(" ") : ""}</p>
          {p.relationship && <p className="text-xs text-muted-foreground">Relationship: {p.relationship}</p>}
          {p.address && <p className="text-xs text-muted-foreground">Address: {p.address}</p>}
          {p.phone && <p className="text-xs text-muted-foreground">Phone: {p.phone}</p>}
          {p.email && <p className="text-xs text-muted-foreground">Email: {p.email}</p>}
          {p.dob && <p className="text-xs text-muted-foreground">DOB: {p.dob}</p>}
          {showExtra && p.share && <p className="text-xs text-muted-foreground">Share: {p.share}</p>}
          {showExtra && p.isVulnerable && <Badge className="text-xs mt-1" variant="destructive">Vulnerable</Badge>}
          {p.notes && <p className="text-xs text-muted-foreground italic">Notes: {p.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function formatGifts(gifts: unknown): React.ReactNode {
  if (!Array.isArray(gifts) || gifts.length === 0) return null;
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

function formatPolicies(policies: unknown): React.ReactNode {
  if (!Array.isArray(policies) || policies.length === 0) return null;
  return (
    <div className="space-y-2 mt-1">
      {(policies as Record<string, string>[]).map((p, i) => (
        <div key={i} className="rounded-lg border p-3 text-sm space-y-0.5" style={{ background: "oklch(0.98 0.005 155)" }}>
          <p className="font-medium">{p.provider}</p>
          {p.policyNumber && <p className="text-xs text-muted-foreground">Policy #: {p.policyNumber}</p>}
          {p.sumAssured && <p className="text-xs text-muted-foreground">Sum Assured: £{p.sumAssured}</p>}
          {p.termRemaining && <p className="text-xs text-muted-foreground">Term Remaining: {p.termRemaining}</p>}
          {p.beneficiary && <p className="text-xs text-muted-foreground">Beneficiary: {p.beneficiary}</p>}
          {p.inTrust && <Badge className="text-xs mt-1">In Trust</Badge>}
          {p.notes && <p className="text-xs text-muted-foreground italic">Notes: {p.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function formatBusinessInterests(items: unknown): React.ReactNode {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="space-y-2 mt-1">
      {(items as Record<string, string>[]).map((b, i) => (
        <div key={i} className="rounded-lg border p-3 text-sm space-y-0.5" style={{ background: "oklch(0.98 0.005 155)" }}>
          <p className="font-medium">{b.businessName}</p>
          <p className="text-xs text-muted-foreground">Nature: {b.natureOfBusiness}</p>
          {b.ownershipPercentage && <p className="text-xs text-muted-foreground">Ownership: {b.ownershipPercentage}%</p>}
          {b.notes && <p className="text-xs text-muted-foreground italic">Notes: {b.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function formatChildren(children: unknown): React.ReactNode {
  if (!Array.isArray(children) || children.length === 0) return null;
  return (
    <div className="space-y-2 mt-1">
      {(children as Record<string, string>[]).map((c, i) => (
        <div key={i} className="rounded-lg border p-3 text-sm space-y-0.5" style={{ background: "oklch(0.98 0.005 155)" }}>
          <p className="font-medium">{[c.firstName, c.lastName].filter(Boolean).join(" ")}</p>
          {c.dob && <p className="text-xs text-muted-foreground">DOB: {c.dob}</p>}
          {c.ageGroup && <p className="text-xs text-muted-foreground">Age Group: {c.ageGroup === "under18" ? "Under 18" : "Over 18"}</p>}
          {c.relationship && <p className="text-xs text-muted-foreground">Relationship: {c.relationship}</p>}
          {c.hasSpecialNeeds && <Badge className="text-xs mt-1" variant="destructive">Special Needs</Badge>}
          {c.specialNeedsDetails && <p className="text-xs text-muted-foreground italic">Details: {c.specialNeedsDetails}</p>}
          {c.notes && <p className="text-xs text-muted-foreground italic">Notes: {c.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function formatTrustClauses(trusts: unknown, type: string): React.ReactNode {
  if (!Array.isArray(trusts) || trusts.length === 0) return null;
  return (
    <div className="space-y-2 mt-1">
      {(trusts as Record<string, unknown>[]).map((t, i) => (
        <div key={i} className="rounded-lg border p-3 text-sm space-y-1" style={{ background: "oklch(0.98 0.005 155)" }}>
          <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">{type} #{i + 1}</p>
          {Object.entries(t).map(([k, v]) => {
            if (!v || (Array.isArray(v) && v.length === 0)) return null;
            if (Array.isArray(v)) {
              return (
                <div key={k}>
                  <p className="text-xs font-medium text-muted-foreground capitalize">{k}:</p>
                  {formatPersons(v)}
                </div>
              );
            }
            if (typeof v === "object" && v !== null) {
              return (
                <p key={k} className="text-xs text-muted-foreground">{k}: {JSON.stringify(v)}</p>
              );
            }
            return <p key={k} className="text-xs text-muted-foreground"><span className="font-medium capitalize">{k}:</span> {String(v)}</p>;
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SubmissionDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);

  const { data: record, isLoading } = trpc.will.getById.useQuery(
    { id },
    { enabled: !!id }
  );
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const { data: emailPreview, isFetching: emailPreviewLoading } = trpc.will.previewEmail.useQuery(
    { id },
    { enabled: emailPreviewOpen && !!id }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.01 155)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.01 155)" }}>
        <div className="text-center">
          <p className="text-muted-foreground">Submission not found.</p>
          <Link href="/admin"><Button className="mt-4">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const products = Array.isArray(record.productsOrdered) ? record.productsOrdered as string[] : [];
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim();
  const client2Name = record.client2FirstName
    ? `${record.client2Prefix ?? ""} ${record.client2FirstName} ${record.client2LastName ?? ""}`.trim()
    : null;
  const isMirror = !!record.client2FirstName;

  // Per-client executors (fall back to legacy)
  const c1Executors = (record.client1Executors as unknown[])?.length ? record.client1Executors : record.executors;
  const c1ReservedExecutors = (record.client1ReservedExecutors as unknown[])?.length ? record.client1ReservedExecutors : record.reservedExecutors;
  const c2Executors = record.client2Executors;
  const c2ReservedExecutors = record.client2ReservedExecutors;
  const c1Guardians = (record.client1Guardians as unknown[])?.length ? record.client1Guardians : record.guardians;
  const c1ReservedGuardians = (record.client1ReservedGuardians as unknown[])?.length ? record.client1ReservedGuardians : record.reservedGuardians;
  const c2Guardians = record.client2Guardians;
  const c2ReservedGuardians = record.client2ReservedGuardians;
  const c1Beneficiaries = (record.client1Beneficiaries as unknown[])?.length ? record.client1Beneficiaries : record.beneficiaries;
  const c2Beneficiaries = record.client2Beneficiaries;
  const c1Gifts = (record.client1SpecificGifts as unknown[])?.length ? record.client1SpecificGifts : record.specificGifts;
  const c2Gifts = record.client2SpecificGifts;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      {/* Header */}
      <header className="genesis-gradient shadow-lg">
        <div className="container max-w-5xl py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <img src="/manus-storage/genesis-logo_48897107.png" alt="Genesis" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 object-contain rounded-lg" />
              <div className="min-w-0">
                <h1 className="font-serif text-sm sm:text-lg font-semibold text-white truncate">Submission Detail</h1>
                <p className="text-xs" style={{ color: "oklch(0.78 0.12 85)" }}>Ref: {record.referenceNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                variant="outline" size="sm"
                className="gap-1.5 border-white/30 text-white hover:bg-white/10 bg-transparent text-xs px-2 sm:px-3"
                onClick={() => setEmailPreviewOpen(true)}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Preview Email</span>
                <span className="sm:hidden">Email</span>
              </Button>
              <a href={`/api/submissions/${id}/pdf`} download>
                <Button variant="outline" size="sm" className="gap-1.5 border-white/30 text-white hover:bg-white/10 bg-transparent text-xs px-2 sm:px-3">
                  <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </a>
              <Link href={`/admin/submission/${id}/lpa`}>
                <Button variant="outline" size="sm" className="gap-1.5 border-white/30 text-white hover:bg-white/10 bg-transparent text-xs px-2 sm:px-3">
                  <ScrollText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">LPAs</span>
                </Button>
              </Link>
              <Link href={`/admin/submission/${id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5 border-white/30 text-white hover:bg-white/10 bg-transparent text-xs px-2 sm:px-3">
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-1.5 border-white/30 text-white hover:bg-white/10 bg-transparent text-xs px-2 sm:px-3">
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl py-6 space-y-5">
        {/* Will Generation Panel */}
        <WillGenerationPanel id={id} isMirror={isMirror} />

        {/* Needs Assessment */}
        {((record as Record<string, unknown>).manualNeedsAssessment || record.aiRecommendationNarrative) && (
          <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: "oklch(0.78 0.12 85)" }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "oklch(0.97 0.015 90)" }}>
              <ClipboardList className="w-4 h-4" style={{ color: "oklch(0.65 0.14 80)" }} />
              <h3 className="font-serif text-sm font-semibold genesis-green-text">Needs Assessment &amp; Recommendations</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {String((record as Record<string, unknown>).manualNeedsAssessment ?? "") || record.aiRecommendationNarrative}
              </p>
            </div>
          </div>
        )}

        {/* ── 1. Appointment ── */}
        <Section title="Appointment Details" icon={<Calendar className="w-4 h-4" />}>
          <Field label="Reference" value={record.referenceNumber} />
          <Field label="Will Type" value={record.willType} />
          <Field label="LPA Type" value={record.lpaType} />
          <Field label="Appointment Date" value={record.appointmentDate} />
          <Field label="Appointment Time" value={record.appointmentTime} />
          <Field label="Estimated Draft Date" value={record.estimatedDraftDate} />
          <Field label="Price Quoted" value={record.priceQuoted ? `£${record.priceQuoted}` : null} />
          <SubSection title="Consultant">
            <Field label="Name" value={record.consultantName} />
            <Field label="Email" value={record.consultantEmail} />
            <Field label="Phone" value={record.consultantPhone} />
          </SubSection>
          <SubSection title="Case Coordinator">
            <Field label="Name" value={record.caseCoordinatorName} />
            <Field label="Email" value={record.caseCoordinatorEmail} />
            <Field label="Phone" value={record.caseCoordinatorPhone} />
          </SubSection>
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

        {/* ── 2. Client 1 ── */}
        <Section title={`Client 1 — ${client1Name}`} icon={<User className="w-4 h-4" />} collapsible>
          <SubSection title="Personal Details">
            <Field label="Full Name" value={[record.client1Prefix, record.client1FirstName, record.client1MiddleName, record.client1LastName].filter(Boolean).join(" ")} />
            <Field label="Date of Birth" value={record.client1Dob} />
            <Field label="Marital Status" value={record.client1MaritalStatus} />
            <Field label="Nationality" value={record.client1Nationality} />
            <Field label="Job Title" value={record.client1JobTitle} />
          </SubSection>
          <SubSection title="Contact">
            <Field label="Address" value={[record.client1AddressLine1, record.client1City, record.client1Postcode].filter(Boolean).join(", ") || null} />
            <Field label="Daytime Phone" value={record.client1DaytimePhone} />
            <Field label="Mobile" value={record.client1Mobile} />
            <Field label="Email" value={record.client1Email} />
          </SubSection>
        </Section>

        {/* ── 3. Client 2 ── */}
        {client2Name && (
          <Section title={`Client 2 — ${client2Name}`} icon={<Users className="w-4 h-4" />} collapsible>
            <SubSection title="Personal Details">
              <Field label="Full Name" value={[record.client2Prefix, record.client2FirstName, record.client2MiddleName, record.client2LastName].filter(Boolean).join(" ")} />
              <Field label="Date of Birth" value={record.client2Dob} />
              <Field label="Marital Status" value={record.client2MaritalStatus} />
              <Field label="Nationality" value={record.client2Nationality} />
              <Field label="Job Title" value={record.client2JobTitle} />
            </SubSection>
            <SubSection title="Contact">
              <Field label="Address" value={[record.client2AddressLine1, record.client2City, record.client2Postcode].filter(Boolean).join(", ") || null} />
              <Field label="Daytime Phone" value={record.client2DaytimePhone} />
              <Field label="Mobile" value={record.client2Mobile} />
              <Field label="Email" value={record.client2Email} />
            </SubSection>
          </Section>
        )}

        {/* ── 4. Family Background ── */}
        <Section title="Family Background" icon={<Baby className="w-4 h-4" />} collapsible>
          <SubSection title={isMirror ? "Client 1 — Family" : "Family"}>
            <YesNo label="Marriage / Civil Partnership Plans" value={record.client1MarriagePlans} detail={record.client1MarriagePlanDetails} />
            <YesNo label="Has Children" value={record.client1HasChildren} />
            <Field label="Total Children" value={record.client1TotalChildren} />
            <YesNo label="Children with Special Needs" value={record.client1ChildrenSpecialNeeds} detail={record.client1ChildrenSpecialNeedsDetails} />
            <Field label="Family Circumstances" value={record.client1FamilyCircumstances} />
            <Field label="Additional Children Details" value={record.client1ChildrenDetails} />
          </SubSection>
          {(record.client1ChildrenUnder18 as unknown[])?.length > 0 && (
            <SubSection title="Client 1 — Children Under 18">
              {formatChildren(record.client1ChildrenUnder18)}
            </SubSection>
          )}
          {(record.client1ChildrenOver18 as unknown[])?.length > 0 && (
            <SubSection title="Client 1 — Children Over 18">
              {formatChildren(record.client1ChildrenOver18)}
            </SubSection>
          )}
          {isMirror && (
            <SubSection title="Client 2 — Family">
              <YesNo label="Marriage / Civil Partnership Plans" value={record.client2MarriagePlans} detail={record.client2MarriagePlanDetails} />
              <YesNo label="Has Children" value={record.client2HasChildren} />
              <Field label="Total Children" value={record.client2TotalChildren} />
              <YesNo label="Children with Special Needs" value={record.client2ChildrenSpecialNeeds} detail={record.client2ChildrenSpecialNeedsDetails} />
              <Field label="Family Circumstances" value={record.client2FamilyCircumstances} />
              <Field label="Additional Children Details" value={record.client2ChildrenDetails} />
            </SubSection>
          )}
          {isMirror && (record.client2ChildrenUnder18 as unknown[])?.length > 0 && (
            <SubSection title="Client 2 — Children Under 18">
              {formatChildren(record.client2ChildrenUnder18)}
            </SubSection>
          )}
          {isMirror && (record.client2ChildrenOver18 as unknown[])?.length > 0 && (
            <SubSection title="Client 2 — Children Over 18">
              {formatChildren(record.client2ChildrenOver18)}
            </SubSection>
          )}
        </Section>

        {/* ── 5. Additional Background ── */}
        <Section title="Additional Background" icon={<Globe className="w-4 h-4" />} collapsible>
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

        {/* ── 6. Due Diligence ── */}
        <Section title="Due Diligence" icon={<Shield className="w-4 h-4" />} collapsible>
          <SubSection title="Standard Due Diligence">
            <YesNo label="Consultant Arranged Appointment" value={record.ddArrangedAppointment} detail={record.ddArrangedAppointmentNotes} />
            <YesNo label="Knowledge of Estate" value={record.ddKnowledgeOfEstate} detail={record.ddKnowledgeOfEstateNotes} />
            <YesNo label="Knew Beneficiaries" value={record.ddKnewBeneficiaries} detail={record.ddKnewBeneficiariesNotes} />
            <YesNo label="Signs of Influence / Coercion" value={record.ddSignsOfInfluence} detail={record.ddSignsOfInfluenceNotes} />
            <YesNo label="Knew Appointees" value={record.ddKnewAppointees} detail={record.ddKnewAppointeesNotes} />
          </SubSection>
          <SubSection title="Extended Due Diligence">
            <Field label="Client Since" value={record.ddClientSince} />
            <Field label="First Contact Date" value={record.ddFirstContactDate} />
            <Field label="Meeting Type" value={record.ddMeetingType} />
            <YesNo label="Others Present" value={record.ddOthersPresent} detail={record.ddOthersPresentNotes} />
            <YesNo label="Client Can See" value={record.ddClientCanSee} />
            <YesNo label="Client Can Hear" value={record.ddClientCanHear} />
            <YesNo label="Client Can Speak" value={record.ddClientCanSpeak} />
          </SubSection>
        </Section>

        {/* ── 7. Executors, Trustees & Guardians ── */}
        <Section title="Executors, Trustees & Guardians" icon={<Scale className="w-4 h-4" />} collapsible>
          <SubSection title={isMirror ? "Client 1 — Executors" : "Executors"}>
            {formatPersons(c1Executors) ?? <p className="text-sm text-muted-foreground">None recorded</p>}
          </SubSection>
          {(c1ReservedExecutors as unknown[])?.length > 0 && (
            <SubSection title={isMirror ? "Client 1 — Reserved Executors" : "Reserved Executors"}>
              {formatPersons(c1ReservedExecutors)}
            </SubSection>
          )}
          {isMirror && (
            <SubSection title="Client 2 — Executors">
              {formatPersons(c2Executors) ?? <p className="text-sm text-muted-foreground">None recorded</p>}
            </SubSection>
          )}
          {isMirror && (c2ReservedExecutors as unknown[])?.length > 0 && (
            <SubSection title="Client 2 — Reserved Executors">
              {formatPersons(c2ReservedExecutors)}
            </SubSection>
          )}
          {(record.trustees as unknown[])?.length > 0 && (
            <SubSection title="Trustees">
              {formatPersons(record.trustees)}
            </SubSection>
          )}
          {(c1Guardians as unknown[])?.length > 0 && (
            <SubSection title={isMirror ? "Client 1 — Guardians" : "Guardians"}>
              {formatPersons(c1Guardians)}
            </SubSection>
          )}
          {(c1ReservedGuardians as unknown[])?.length > 0 && (
            <SubSection title={isMirror ? "Client 1 — Reserved Guardians" : "Reserved Guardians"}>
              {formatPersons(c1ReservedGuardians)}
            </SubSection>
          )}
          {isMirror && (c2Guardians as unknown[])?.length > 0 && (
            <SubSection title="Client 2 — Guardians">
              {formatPersons(c2Guardians)}
            </SubSection>
          )}
          {isMirror && (c2ReservedGuardians as unknown[])?.length > 0 && (
            <SubSection title="Client 2 — Reserved Guardians">
              {formatPersons(c2ReservedGuardians)}
            </SubSection>
          )}
        </Section>

        {/* ── 8. Beneficiaries ── */}
        <Section title="Beneficiaries" icon={<Heart className="w-4 h-4" />} collapsible>
          <SubSection title={isMirror ? "Client 1 — Beneficiaries" : "Beneficiaries"}>
            {formatPersons(c1Beneficiaries, true) ?? <p className="text-sm text-muted-foreground">None recorded</p>}
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
                {formatPersons(c2Beneficiaries, true) ?? <p className="text-sm text-muted-foreground">None recorded</p>}
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

        {/* ── 9. Property & Assets ── */}
        <Section title="Property & Assets" icon={<Home className="w-4 h-4" />} collapsible>
          <SubSection title="Main Property">
            <YesNo label="Property Owned" value={record.propertyOwned} />
            <Field label="Property Address" value={record.propertyAddress} />
            <Field label="Ownership Type" value={record.propertyOwnership} />
            <Field label="Property Value" value={record.propertyValue ? `£${record.propertyValue}` : null} />
            <YesNo label="Mortgage Outstanding" value={record.mortgageOutstanding} />
            <Field label="Mortgage Balance" value={record.mortgageBalance ? `£${record.mortgageBalance}` : null} />
            <Field label="Mortgage Lender" value={record.mortgageLender} />
            <Field label="Mortgage Term Remaining" value={record.mortgageTermRemaining} />
          </SubSection>
          <SubSection title="Other Properties">
            <YesNo label="Has Other Properties" value={record.hasOtherProperties} detail={record.otherProperties} />
            <YesNo label="Assets Outside UK" value={record.assetsOutsideUK} detail={record.assetsOutsideUKDetails} />
          </SubSection>
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
          <SubSection title="Care Concerns">
            <YesNo label="Care Concerns" value={record.careConcerns} detail={record.careConcernDetails} />
          </SubSection>
        </Section>

        {/* ── 10. Life Insurance ── */}
        <Section title="Life Insurance & Protection" icon={<HeartHandshake className="w-4 h-4" />} collapsible>
          <YesNo label="Has Life Insurance" value={record.hasLifeInsurance} />
          {(record.lifeInsurancePolicies as unknown[])?.length > 0 && (
            <SubSection title="Policies">
              {formatPolicies(record.lifeInsurancePolicies)}
            </SubSection>
          )}
          <Field label="Notes" value={record.lifeInsuranceNotes} />
        </Section>

        {/* ── 11. Business Interests ── */}
        <Section title="Business Interests" icon={<Briefcase className="w-4 h-4" />} collapsible>
          <YesNo label="Has Business Interests" value={record.hasBusinessInterests} />
          <Field label="Overview" value={record.businessInterests} />
          {(record.businessInterestsDetails as unknown[])?.length > 0 && (
            <SubSection title="Business Details">
              {formatBusinessInterests(record.businessInterestsDetails)}
            </SubSection>
          )}
        </Section>

        {/* ── 12. Specific Gifts ── */}
        <Section title="Legacies & Specific Gifts" icon={<ShoppingBag className="w-4 h-4" />} collapsible>
          <SubSection title={isMirror ? "Client 1 — Gifts" : "Gifts"}>
            {formatGifts(c1Gifts) ?? <p className="text-sm text-muted-foreground">None recorded</p>}
          </SubSection>
          {isMirror && (
            <SubSection title="Client 2 — Gifts">
              {formatGifts(c2Gifts) ?? <p className="text-sm text-muted-foreground">None recorded</p>}
            </SubSection>
          )}
        </Section>

        {/* ── 13. Pets ── */}
        <Section title="Pets" icon={<PawPrint className="w-4 h-4" />} collapsible>
          <YesNo label="Has Pets" value={record.hasPets} />
          <Field label="Pet Details" value={record.petsDetails} />
          <Field label="Preferred Carer" value={record.petsCarer} />
        </Section>

        {/* ── 14. Funeral Wishes ── */}
        <Section title="Funeral Wishes" icon={<Flower2 className="w-4 h-4" />} collapsible>
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

        {/* ── 15. Disaster Clause & Notes ── */}
        <Section title="Disaster Clause & Notes" icon={<Info className="w-4 h-4" />} collapsible>
          <Field label="Disaster Clause Notes" value={record.disasterClauseNotes} />
          <Field label="Additional Notes" value={record.additionalNotes} />
          <Field label="Special Notes" value={record.specialNotes} />
        </Section>

        {/* ── Trust Clauses ── */}
        {(
          (record.protectivePropertyTrusts as unknown[])?.length > 0 ||
          (record.discretionaryTrusts as unknown[])?.length > 0 ||
          (record.vulnerablePersonTrusts as unknown[])?.length > 0 ||
          (record.nilRateBandTrusts as unknown[])?.length > 0 ||
          (record.bereavedMinorTrusts as unknown[])?.length > 0 ||
          (record.age18To25Trusts as unknown[])?.length > 0 ||
          (record.businessPropertyReliefs as unknown[])?.length > 0
        ) && (
          <Section title="Trust Clauses" icon={<GitFork className="w-4 h-4" />} collapsible>
            {(record.protectivePropertyTrusts as unknown[])?.length > 0 && (
              <SubSection title="Protective Property Trusts">
                {formatTrustClauses(record.protectivePropertyTrusts, "PPT")}
              </SubSection>
            )}
            {(record.discretionaryTrusts as unknown[])?.length > 0 && (
              <SubSection title="Discretionary Trusts">
                {formatTrustClauses(record.discretionaryTrusts, "Discretionary Trust")}
              </SubSection>
            )}
            {(record.vulnerablePersonTrusts as unknown[])?.length > 0 && (
              <SubSection title="Vulnerable Person Trusts">
                {formatTrustClauses(record.vulnerablePersonTrusts, "Vulnerable Person Trust")}
              </SubSection>
            )}
            {(record.nilRateBandTrusts as unknown[])?.length > 0 && (
              <SubSection title="Nil Rate Band Trusts">
                {formatTrustClauses(record.nilRateBandTrusts, "NRB Trust")}
              </SubSection>
            )}
            {(record.bereavedMinorTrusts as unknown[])?.length > 0 && (
              <SubSection title="Bereaved Minor Trusts">
                {formatTrustClauses(record.bereavedMinorTrusts, "Bereaved Minor Trust")}
              </SubSection>
            )}
            {(record.age18To25Trusts as unknown[])?.length > 0 && (
              <SubSection title="18-to-25 Trusts">
                {formatTrustClauses(record.age18To25Trusts, "18-to-25 Trust")}
              </SubSection>
            )}
            {(record.businessPropertyReliefs as unknown[])?.length > 0 && (
              <SubSection title="Business Property Relief">
                {formatTrustClauses(record.businessPropertyReliefs, "BPR")}
              </SubSection>
            )}
          </Section>
        )}

      {/* ── Email Preview Modal ── */}
      <Dialog open={emailPreviewOpen} onOpenChange={setEmailPreviewOpen}>
        <DialogContent className="max-w-3xl w-full h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 font-serif">
              <Mail className="w-4 h-4" style={{ color: "oklch(0.28 0.07 155)" }} />
              Client Email Preview
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">This is exactly how the confirmation email will appear to the client.</p>
          </DialogHeader>
          <div className="flex-1 overflow-hidden relative">
            {emailPreviewLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
              </div>
            ) : emailPreview?.html ? (
              <iframe
                srcDoc={emailPreview.html}
                className="w-full h-full border-0"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                Unable to load email preview.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

// ─── Will Generation Panel ────────────────────────────────────────────────────

function WillGenerationPanel({ id, isMirror }: { id: number; isMirror: boolean }) {
  const [includePPT, setIncludePPT] = useState(false);
  const [includeDiscretionary, setIncludeDiscretionary] = useState(false);
  const [includeVulnerable, setIncludeVulnerable] = useState(false);
  const [, navigate] = useLocation();

  function buildParams(willType: "single" | "mirror_client1" | "mirror_client2") {
    const params = new URLSearchParams({ willType });
    if (includePPT) params.set("ppt", "1");
    if (includeDiscretionary) params.set("discretionary", "1");
    if (includeVulnerable) params.set("vulnerable", "1");
    return params.toString();
  }

  function buildUrl(willType: "single" | "mirror_client1" | "mirror_client2") {
    return `/api/submissions/${id}/will?${buildParams(willType)}`;
  }

  function openPreview(willType: "single" | "mirror_client1" | "mirror_client2") {
    navigate(`/admin/submission/${id}/will-preview?${buildParams(willType)}`);
  }

  return (
    <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: "oklch(0.55 0.12 155)" }}>
      <div className="px-5 py-3 flex items-center gap-2" style={{ background: "oklch(0.28 0.07 155)" }}>
        <FileText className="w-4 h-4 text-white" />
        <h3 className="font-serif text-sm font-semibold text-white">Generate Will Document</h3>
      </div>
      <div className="p-4" style={{ background: "oklch(0.97 0.015 155)" }}>
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={includePPT} onCheckedChange={setIncludePPT} />
            <span>Include PPT</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={includeDiscretionary} onCheckedChange={setIncludeDiscretionary} />
            <span>Include Discretionary Trust</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={includeVulnerable} onCheckedChange={setIncludeVulnerable} />
            <span>Include Vulnerable Person Trust</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isMirror ? (
            <>
              <Button size="sm" onClick={() => openPreview("single")} style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Preview Will
              </Button>
              <a href={buildUrl("single")} download>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <FileDown className="w-3.5 h-3.5" /> Download PDF
                </Button>
              </a>
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => openPreview("mirror_client1")} style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Preview Client 1
              </Button>
              <Button size="sm" onClick={() => openPreview("mirror_client2")} style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Preview Client 2
              </Button>
              <a href={buildUrl("mirror_client1")} download>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <FileDown className="w-3.5 h-3.5" /> PDF Client 1
                </Button>
              </a>
              <a href={buildUrl("mirror_client2")} download>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <FileDown className="w-3.5 h-3.5" /> PDF Client 2
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
