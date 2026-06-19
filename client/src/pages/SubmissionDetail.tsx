import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Loader2, ArrowLeft, Mail, Star, AlertTriangle, User, Users, Scale, Heart, Home, Flower2, Calendar, ShoppingBag, FileDown } from "lucide-react";
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
    <div className="flex gap-2 text-sm">
      <span className="font-medium text-muted-foreground min-w-[180px] flex-shrink-0">{label}:</span>
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
        <div className="container max-w-4xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/manus-storage/genesis-logo_48897107.png" alt="Genesis Wills and Estate Planning" className="h-10 w-10 object-contain rounded-lg" />
              <div>
                <h1 className="font-serif text-lg font-semibold text-white">Submission Detail</h1>
                <p className="text-xs" style={{ color: "oklch(0.78 0.12 85)" }}>Ref: {record.referenceNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={`/api/submissions/${id}/pdf`} download>
                <Button variant="outline" size="sm" className="gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent">
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </Button>
              </a>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl py-6 space-y-5">
        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: "oklch(0.78 0.12 85)" }}>
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "oklch(0.97 0.015 90)" }}>
              <Star className="w-4 h-4" style={{ color: "oklch(0.65 0.14 80)" }} />
              <h3 className="font-serif text-sm font-semibold genesis-green-text">
                Estate Planning Recommendations ({recommendations.length})
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {recommendations.map((rec: Record<string, string>) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                  style={{
                    background: rec.priority === "high" ? "oklch(0.99 0.01 85 / 0.6)" : "oklch(0.99 0.005 155)",
                    borderColor: rec.priority === "high" ? "oklch(0.78 0.12 85 / 0.5)" : "oklch(0.88 0.02 155)",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: rec.priority === "high" ? "oklch(0.65 0.14 80)" : "oklch(0.5 0.04 155)" }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold genesis-green-text">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                  </div>
                  <Badge className="text-xs flex-shrink-0" style={rec.priority === "high" ? { background: "oklch(0.78 0.12 85)", color: "oklch(0.2 0.05 155)" } : { background: "oklch(0.88 0.02 155)", color: "oklch(0.28 0.07 155)" }}>
                    {rec.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Narrative */}
        {record.aiRecommendationNarrative && (
          <Section title="Internal Recommendation Narrative" icon={<Star className="w-4 h-4" />}>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{record.aiRecommendationNarrative}</p>
          </Section>
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
