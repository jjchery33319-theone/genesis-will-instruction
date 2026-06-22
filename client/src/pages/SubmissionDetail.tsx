import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Loader2, ArrowLeft, Mail, ClipboardList, User, Users, Scale, Heart, Home, Flower2, Calendar, ShoppingBag, FileDown, FileText, Shield, GitFork, HeartHandshake, Pencil, ScrollText } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS } from "../../../shared/willConstants";

function getProductLabel(id: string) {
  return PRODUCTS.find(p => p.id === id)?.label ?? id;
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: "oklch(0.97 0.015 155)" }}>
        <span style={{ color: "oklch(0.28 0.07 155)" }}>{icon}</span>
        <h3 className="font-serif text-sm font-semibold genesis-green-text">{title}</h3>
      </div>
      <div className="p-5 space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 text-sm">
      <span className="font-medium text-muted-foreground sm:min-w-[180px] flex-shrink-0">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function formatPersons(persons: unknown): string {
  if (!Array.isArray(persons) || persons.length === 0) return "None";
  return persons.map((p: Record<string, string>) =>
    `${p.prefix ?? ""} ${p.firstName ?? ""} ${p.lastName ?? ""}${p.relationship ? ` (${p.relationship})` : ""}`.trim()
  ).join("; ");
}

export default function SubmissionDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);

  const { data: record, isLoading } = trpc.will.getById.useQuery(
    { id },
    { enabled: !!id }
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

  const recommendations = Array.isArray(record.recommendationsJson) ? record.recommendationsJson : [];
  const products = Array.isArray(record.productsOrdered) ? record.productsOrdered as string[] : [];
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim();
  const client2Name = record.client2FirstName
    ? `${record.client2Prefix ?? ""} ${record.client2FirstName} ${record.client2LastName ?? ""}`.trim()
    : null;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      {/* Header */}
      <header className="genesis-gradient shadow-lg">
        <div className="container max-w-4xl py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <img src="/manus-storage/genesis-logo_48897107.png" alt="Genesis Wills and Estate Planning" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 object-contain rounded-lg" />
              <div className="min-w-0">
                <h1 className="font-serif text-sm sm:text-lg font-semibold text-white truncate">Submission Detail</h1>
                <p className="text-xs" style={{ color: "oklch(0.78 0.12 85)" }}>Ref: {record.referenceNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
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

      <div className="container max-w-4xl py-6 space-y-5">
        {/* Will Generation Panel */}
        <WillGenerationPanel id={id} isMirror={!!record.client2FirstName} />

        {/* Needs Assessment & Recommendations */}
        {((record as any).manualNeedsAssessment || record.aiRecommendationNarrative) && (
          <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: "oklch(0.78 0.12 85)" }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "oklch(0.97 0.015 90)" }}>
              <ClipboardList className="w-4 h-4" style={{ color: "oklch(0.65 0.14 80)" }} />
              <h3 className="font-serif text-sm font-semibold genesis-green-text">
                Needs Assessment &amp; Recommendations
              </h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {(record as any).manualNeedsAssessment || record.aiRecommendationNarrative}
              </p>
            </div>
          </div>
        )}

        {/* Client Email Draft */}
        {record.aiClientEmailDraft && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ background: "oklch(0.97 0.015 90)" }}>
              <Mail className="w-4 h-4" style={{ color: "oklch(0.65 0.14 80)" }} />
              <div>
                <h3 className="font-serif text-sm font-semibold genesis-green-text">Client Email Draft</h3>
                <p className="text-xs text-muted-foreground">Ready to copy and send to the client</p>
              </div>
            </div>
            <div className="p-5">
              <div className="rounded-lg border p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap" style={{ background: "oklch(0.98 0.01 90)", borderColor: "oklch(0.88 0.05 85)", color: "oklch(0.15 0.02 150)" }}>
                {record.aiClientEmailDraft}
              </div>
            </div>
          </div>
        )}

        {/* Appointment */}
        <Section title="Appointment Details" icon={<Calendar className="w-4 h-4" />}>
          <Field label="Reference" value={record.referenceNumber} />
          <Field label="Appointment Date" value={record.appointmentDate} />
          <Field label="Appointment Time" value={record.appointmentTime} />
          <Field label="Consultant" value={record.consultantName} />
          <Field label="Consultant Email" value={record.consultantEmail} />
          <Field label="Case Coordinator" value={record.caseCoordinatorName} />
          <Field label="Price Quoted" value={record.priceQuoted ? `£${record.priceQuoted}` : null} />
          <Field label="Estimated Draft Date" value={record.estimatedDraftDate} />
          {products.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {products.map(id => (
                <Badge key={id} className="text-xs" style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                  {getProductLabel(id)}
                </Badge>
              ))}
            </div>
          )}
        </Section>

        {/* Client 1 */}
        <Section title={`Client 1 — ${client1Name}`} icon={<User className="w-4 h-4" />}>
          <Field label="Date of Birth" value={record.client1Dob} />
          <Field label="Address" value={[record.client1AddressLine1, record.client1City, record.client1Postcode].filter(Boolean).join(", ") || null} />
          <Field label="Marital Status" value={record.client1MaritalStatus} />
          <Field label="Job Title" value={record.client1JobTitle} />
          <Field label="Daytime Phone" value={record.client1DaytimePhone} />
          <Field label="Mobile" value={record.client1Mobile} />
          <Field label="Email" value={record.client1Email} />
          <Field label="Nationality" value={record.client1Nationality} />
        </Section>

        {/* Client 2 */}
        {client2Name && (
          <Section title={`Client 2 — ${client2Name}`} icon={<Users className="w-4 h-4" />}>
            <Field label="Date of Birth" value={record.client2Dob} />
            <Field label="Address" value={[record.client2AddressLine1, record.client2City, record.client2Postcode].filter(Boolean).join(", ") || null} />
            <Field label="Marital Status" value={record.client2MaritalStatus} />
            <Field label="Mobile" value={record.client2Mobile} />
            <Field label="Email" value={record.client2Email} />
          </Section>
        )}

        {/* Executors */}
        <Section title="Executors, Trustees & Guardians" icon={<Scale className="w-4 h-4" />}>
          <Field label="Executors" value={formatPersons(record.executors)} />
          <Field label="Trustees" value={formatPersons(record.trustees)} />
          <Field label="Guardians" value={formatPersons(record.guardians)} />
        </Section>

        {/* Beneficiaries */}
        <Section title="Beneficiaries" icon={<Heart className="w-4 h-4" />}>
          <Field label="Beneficiaries" value={formatPersons(record.beneficiaries)} />
          <Field label="Children Benefit Age" value={record.childrenBenefitAge ? `Age ${record.childrenBenefitAge}` : null} />
          <Field label="Disaster Clause (Client 1)" value={record.disasterClauseClient1} />
          <Field label="Disaster Clause (Client 2)" value={record.disasterClauseClient2} />
          <Field label="Vulnerable Beneficiary" value={record.hasVulnerableBeneficiary === "yes" ? `Yes — ${record.vulnerableBeneficiaryDetails ?? ""}` : "No"} />
        </Section>

        {/* Property */}
        <Section title="Property & Assets" icon={<Home className="w-4 h-4" />}>
          <Field label="Property Owned" value={record.propertyOwned === "yes" ? "Yes" : "No"} />
          <Field label="Property Address" value={record.propertyAddress} />
          <Field label="Ownership Type" value={record.propertyOwnership} />
          <Field label="Mortgage Outstanding" value={record.mortgageOutstanding === "yes" ? "Yes" : record.mortgageOutstanding === "no" ? "No" : null} />
          <Field label="Property Value" value={record.propertyValue ? `£${record.propertyValue}` : null} />
          <Field label="Bank Accounts" value={record.bankAccounts} />
          <Field label="Investments" value={record.investments} />
          <Field label="Pension Details" value={record.pensionDetails} />
          <Field label="Life Insurance" value={record.hasLifeInsurance === "yes" ? "Yes" : record.hasLifeInsurance === "no" ? "No" : null} />
          <Field label="Business Interests" value={record.hasBusinessInterests === "yes" ? record.businessInterests : record.hasBusinessInterests === "no" ? "No" : null} />
          <Field label="Estimated Estate Value" value={record.estimatedEstateValue ? `£${record.estimatedEstateValue}` : null} />
          <Field label="Care Concerns" value={record.careConcerns === "yes" ? `Yes — ${record.careConcernDetails ?? ""}` : "No"} />
        </Section>

        {/* Wishes */}
        <Section title="Wishes & Funeral" icon={<Flower2 className="w-4 h-4" />}>
          <Field label="Residuary Estate" value={record.residuaryEstate} />
          <Field label="Residuary Backup" value={record.residuaryBackup} />
          <Field label="Funeral Type" value={record.funeralType} />
          <Field label="Funeral Wishes" value={record.funeralWishes} />
          <Field label="Organ Donation" value={record.organDonation === "yes" ? "Yes" : record.organDonation === "no" ? "No" : null} />
          <Field label="Special Notes" value={record.specialNotes} />
        </Section>
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
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-2" style={{ background: "oklch(0.28 0.07 155)" }}>
        <FileText className="w-4 h-4 text-white" />
        <h3 className="font-serif text-sm font-semibold text-white">Generate Will Document</h3>
      </div>

      <div className="p-5 space-y-5 bg-white">
        {/* Trust clause toggles */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Optional Trust Clauses</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Switch id="ppt" checked={includePPT} onCheckedChange={setIncludePPT} />
              <div>
                <Label htmlFor="ppt" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" style={{ color: "oklch(0.45 0.12 155)" }} />
                  Protective Property Trust
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">Lifetime trust — protects share of property for surviving spouse</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Switch id="disc" checked={includeDiscretionary} onCheckedChange={setIncludeDiscretionary} />
              <div>
                <Label htmlFor="disc" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5" style={{ color: "oklch(0.45 0.12 155)" }} />
                  Discretionary Trust
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">Trustees have full discretion over distribution of estate</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Switch id="vuln" checked={includeVulnerable} onCheckedChange={setIncludeVulnerable} />
              <div>
                <Label htmlFor="vuln" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5" style={{ color: "oklch(0.45 0.12 155)" }} />
                  Vulnerable Person's Trust
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">For a named beneficiary with a disability (Finance Act 2005)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {isMirror ? "Mirror Wills" : "Will Document"}
          </p>
          <div className="flex flex-wrap gap-2">
            {isMirror ? (
              <>
                {/* Client 1 */}
                <Button size="sm" variant="outline" className="gap-2" onClick={() => openPreview("mirror_client1")}>
                  <FileText className="w-4 h-4" />
                  Preview & Edit — Client 1
                </Button>
                <a href={buildUrl("mirror_client1")} download>
                  <Button size="sm" className="gap-2 genesis-gradient text-white">
                    <FileDown className="w-4 h-4" />
                    PDF — Client 1
                  </Button>
                </a>
                {/* Client 2 */}
                <Button size="sm" variant="outline" className="gap-2" onClick={() => openPreview("mirror_client2")}>
                  <FileText className="w-4 h-4" />
                  Preview & Edit — Client 2
                </Button>
                <a href={buildUrl("mirror_client2")} download>
                  <Button size="sm" className="gap-2 genesis-gradient text-white">
                    <FileDown className="w-4 h-4" />
                    PDF — Client 2
                  </Button>
                </a>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => openPreview("single")}>
                  <FileText className="w-4 h-4" />
                  Preview & Edit Will
                </Button>
                <a href={buildUrl("single")} download>
                  <Button size="sm" className="gap-2 genesis-gradient text-white">
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
