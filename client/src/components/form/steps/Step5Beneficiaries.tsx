import { WillFormData, PersonEntry } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { PersonList, QuickFillSource } from "../PersonFields";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CHILDREN_BENEFIT_AGES } from "../../../../../shared/willConstants";
import { Heart, AlertTriangle, BookOpen, Copy, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyUndo } from "../../../hooks/useCopyUndo";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

function buildQuickFillSources(data: WillFormData): QuickFillSource[] {
  const sources: QuickFillSource[] = [];
  const c1Name = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ");
  const c2Name = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ");
  if (c1Name.trim()) {
    sources.push({
      label: `Client 1 — ${c1Name}`,
      person: {
        prefix: data.client1Prefix,
        firstName: data.client1FirstName ?? "",
        lastName: data.client1LastName ?? "",
        dob: data.client1Dob,
        phone: data.client1DaytimePhone ?? data.client1Mobile,
        email: data.client1Email,
        address: [data.client1AddressLine1, data.client1City, data.client1Postcode].filter(Boolean).join(", "),
        relationship: "Client 1",
      },
    });
  }
  if (c2Name.trim()) {
    sources.push({
      label: `Client 2 — ${c2Name}`,
      person: {
        prefix: data.client2Prefix,
        firstName: data.client2FirstName ?? "",
        lastName: data.client2LastName ?? "",
        dob: data.client2Dob,
        phone: data.client2DaytimePhone ?? data.client2Mobile,
        email: data.client2Email,
        address: [data.client2AddressLine1, data.client2City, data.client2Postcode].filter(Boolean).join(", "),
        relationship: "Client 2",
      },
    });
  }
  // Add executors as copy sources
  (data.client1Executors ?? []).forEach((e, i) => {
    const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
    if (name.trim()) sources.push({ label: `C1 Executor ${i + 1} — ${name}`, person: e });
  });
  (data.client2Executors ?? []).forEach((e, i) => {
    const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
    if (name.trim()) sources.push({ label: `C2 Executor ${i + 1} — ${name}`, person: e });
  });
  return sources;
}

const EXCLUSION_REASONS = [
  { value: "relationship_breakdown", label: "Relationship breakdown" },
  { value: "already_provided_for", label: "Already adequately provided for" },
  { value: "no_ongoing_relationship", label: "No ongoing relationship" },
  { value: "other", label: "Other reason" },
];

function ExclusionInstructions({
  exclusionsKey,
  data,
  onChange,
}: {
  exclusionsKey: "client1Exclusions" | "client2Exclusions";
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}) {
  const exclusions = data[exclusionsKey] ?? [];
  const setExclusions = (next: typeof exclusions) => onChange({ [exclusionsKey]: next } as Partial<WillFormData>);
  const updateExclusion = (index: number, field: keyof (typeof exclusions)[number], value: string) => {
    setExclusions(exclusions.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry));
  };

  return (
    <div className="mt-5 border-t pt-5">
      <div className="flex items-center gap-3">
        <Switch
          id={`${exclusionsKey}-enabled`}
          checked={exclusions.length > 0}
          onCheckedChange={(enabled) => setExclusions(enabled ? (exclusions.length ? exclusions : [{ fullName: "" }]) : [])}
        />
        <Label htmlFor={`${exclusionsKey}-enabled`} className="text-sm cursor-pointer">
          Do you want to exclude someone from your estate?
        </Label>
      </div>
      {exclusions.length > 0 && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">Record anyone who is expressly intended to receive no benefit. You can add more than one person.</p>
          {exclusions.map((entry, index) => (
            <div key={index} className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Excluded person {index + 1}</p>
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setExclusions(exclusions.filter((_, entryIndex) => entryIndex !== index))}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldRow label="Full name"><Input value={entry.fullName} onChange={e => updateExclusion(index, "fullName", e.target.value)} placeholder="Full name" /></FieldRow>
                <FieldRow label="Relationship to client"><Input value={entry.relationship ?? ""} onChange={e => updateExclusion(index, "relationship", e.target.value)} placeholder="e.g. Son, former partner" /></FieldRow>
              </div>
              <FieldRow label="Reason for exclusion">
                <Select value={entry.reason ?? ""} onValueChange={value => updateExclusion(index, "reason", value)}>
                  <SelectTrigger><SelectValue placeholder="Select reason…" /></SelectTrigger>
                  <SelectContent>{EXCLUSION_REASONS.map(reason => <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>)}</SelectContent>
                </Select>
              </FieldRow>
              {entry.reason === "other" && <FieldRow label="Other reason"><Input value={entry.otherReason ?? ""} onChange={e => updateExclusion(index, "otherReason", e.target.value)} placeholder="Describe the reason" /></FieldRow>}
              <FieldRow label="Additional instructions or notes"><Textarea rows={3} value={entry.notes ?? ""} onChange={e => updateExclusion(index, "notes", e.target.value)} placeholder="Any further instruction for the Will writer…" /></FieldRow>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setExclusions([...exclusions, { fullName: "" }])}>
            <Plus className="h-3.5 w-3.5" /> Add another person
          </Button>
        </div>
      )}
    </div>
  );
}

function ClientBeneficiarySection({
  label,
  beneficiariesKey,
  residualEstateKey,
  residualBackupKey,
  childrenBenefitAgeKey,
  hasVulnerableKey,
  vulnerableDetailsKey,
  exclusionsKey,
  data,
  onChange,
  quickFillSources,
}: {
  label: string;
  beneficiariesKey: "client1Beneficiaries" | "client2Beneficiaries";
  residualEstateKey: "client1ResidualEstate" | "client2ResidualEstate";
  residualBackupKey: "client1ResidualBackup" | "client2ResidualBackup";
  childrenBenefitAgeKey: "client1ChildrenBenefitAge" | "client2ChildrenBenefitAge";
  hasVulnerableKey: "client1HasVulnerableBeneficiary" | "client2HasVulnerableBeneficiary";
  vulnerableDetailsKey: "client1VulnerableBeneficiaryDetails" | "client2VulnerableBeneficiaryDetails";
  exclusionsKey: "client1Exclusions" | "client2Exclusions";
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  quickFillSources: QuickFillSource[];
}) {
  const hasVulnerable = data[hasVulnerableKey] === "yes";

  return (
    <div className="space-y-4">
      <SectionDivider title={label} />

      {/* Residuary Estate */}
      <div
        className="p-3 rounded-lg text-sm mb-1"
        style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}
      >
        <strong>Residuary Estate:</strong> Everything left after specific gifts, debts, and expenses are settled.
      </div>

      <FieldRow
        label="Residuary Estate — Who inherits the remainder?"
        hint="e.g. To my spouse absolutely, or if they predecease me, equally between my children"
      >
        <Textarea
          rows={5}
          value={data[residualEstateKey] ?? ""}
          onChange={e => onChange({ [residualEstateKey]: e.target.value } as Partial<WillFormData>)}
          placeholder="e.g. To my spouse absolutely, or if they predecease me, equally between my children…"
        />
      </FieldRow>

      <FieldRow
        label="Backup / Substitution Clause"
        hint="What happens if the primary residuary beneficiary predeceases the client?"
      >
        <Textarea
          rows={4}
          value={data[residualBackupKey] ?? ""}
          onChange={e => onChange({ [residualBackupKey]: e.target.value } as Partial<WillFormData>)}
          placeholder="e.g. If my spouse predeceases me, I leave the residue equally between my children…"
        />
      </FieldRow>

      {/* Named Beneficiaries */}
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-4 mb-1">
        Named Beneficiaries
      </div>
      <div className="mb-2 p-2.5 rounded-lg text-xs" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
        List all beneficiaries and their share. Shares should total 100%. Use <strong>Copy from…</strong> to reuse a previously entered person.
      </div>

      <PersonList
        persons={data[beneficiariesKey] ?? []}
        onChange={(list: PersonEntry[]) => onChange({ [beneficiariesKey]: list } as Partial<WillFormData>)}
        showShare
        showVulnerable
        addLabel="Add Beneficiary"
        emptyMessage="No beneficiaries added yet."
        quickFillSources={quickFillSources}
      />

      {/* Children benefit age */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <FieldRow
          label="At what age should children benefit?"
          hint="The age at which minor children will receive their inheritance"
        >
          <Select
            value={data[childrenBenefitAgeKey] ?? ""}
            onValueChange={v => onChange({ [childrenBenefitAgeKey]: v } as Partial<WillFormData>)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select age…" />
            </SelectTrigger>
            <SelectContent>
              {CHILDREN_BENEFIT_AGES.map(age => (
                <SelectItem key={age} value={age}>Age {age}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </div>

      {/* Vulnerable beneficiary */}
      <div className="flex items-center gap-3 mt-2">
        <Switch
          id={`${beneficiariesKey}-vulnerable`}
          checked={hasVulnerable}
          onCheckedChange={v => onChange({ [hasVulnerableKey]: v ? "yes" : "no" } as Partial<WillFormData>)}
        />
        <Label htmlFor={`${beneficiariesKey}-vulnerable`} className="text-sm cursor-pointer">
          There is a vulnerable beneficiary in this Will
        </Label>
      </div>

      {hasVulnerable && (
        <div
          className="p-4 rounded-lg border space-y-3"
          style={{ background: "oklch(0.99 0.01 85 / 0.5)", borderColor: "oklch(0.78 0.12 85 / 0.4)" }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.65 0.14 80)" }} />
            <p className="text-sm" style={{ color: "oklch(0.28 0.07 155)" }}>
              <strong>Recommendation:</strong> A Vulnerable Person's Trust may be appropriate to protect this beneficiary's inheritance and preserve their eligibility for means-tested benefits.
            </p>
          </div>
          <FieldRow label="Please provide details of the vulnerable beneficiary">
            <Textarea
              rows={5}
              value={data[vulnerableDetailsKey] ?? ""}
              onChange={e => onChange({ [vulnerableDetailsKey]: e.target.value } as Partial<WillFormData>)}
              placeholder="Name, nature of vulnerability, current support arrangements…"
            />
          </FieldRow>
        </div>
      )}

      <ExclusionInstructions exclusionsKey={exclusionsKey} data={data} onChange={onChange} />
    </div>
  );
}

export default function Step5Beneficiaries({ data, onChange }: Props) {
  const isMirrorWill =
    data.productsOrdered?.includes("mirror_wills") || data.willType === "Mirror Wills";

  const c1Name = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ") || "Client 1";
  const c2Name = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ") || "Client 2";

  const quickFillSources = buildQuickFillSources(data);

  return (
    <div className="space-y-5">
      <FormCard
        title="Residuary Estate & Beneficiaries"
        subtitle="Who inherits the estate after all gifts and expenses have been settled"
        icon={<Heart className="w-4 h-4" />}
      >
        <ClientBeneficiarySection
          label={c1Name}
          beneficiariesKey="client1Beneficiaries"
          residualEstateKey="client1ResidualEstate"
          residualBackupKey="client1ResidualBackup"
          childrenBenefitAgeKey="client1ChildrenBenefitAge"
          hasVulnerableKey="client1HasVulnerableBeneficiary"
          vulnerableDetailsKey="client1VulnerableBeneficiaryDetails"
          exclusionsKey="client1Exclusions"
          data={data}
          onChange={onChange}
          quickFillSources={quickFillSources}
        />

        {isMirrorWill && (() => {
          const c1HasBeneficiaries = (data.client1Beneficiaries?.length ?? 0) > 0 ||
            !!(data.client1ResidualEstate || data.client1ResidualBackup || data.client1ChildrenBenefitAge);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { hasSnapshot: hasBenefSnapshot, saveSnapshot: saveBenefSnapshot, undo: undoBenef } = useCopyUndo(data, onChange);
          const copyBeneficiariesFromClient1 = () => {
            saveBenefSnapshot(["client2Beneficiaries", "client2ResidualEstate", "client2ResidualBackup", "client2ChildrenBenefitAge", "client2HasVulnerableBeneficiary", "client2VulnerableBeneficiaryDetails"]);
            onChange({
              client2Beneficiaries: (data.client1Beneficiaries ?? []).map(b => ({ ...b })),
              client2ResidualEstate: data.client1ResidualEstate,
              client2ResidualBackup: data.client1ResidualBackup,
              client2ChildrenBenefitAge: data.client1ChildrenBenefitAge,
              client2HasVulnerableBeneficiary: data.client1HasVulnerableBeneficiary,
              client2VulnerableBeneficiaryDetails: data.client1VulnerableBeneficiaryDetails,
            });
          };
          return (
            <>
              {hasBenefSnapshot && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: "oklch(0.98 0.02 85)", border: "1px solid oklch(0.78 0.12 85 / 0.5)" }}>
                  <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.55 0.12 85)" }} />
                  <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.08 85)" }}>Beneficiaries copied from Client 1. Changed your mind?</span>
                  <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" style={{ borderColor: "oklch(0.78 0.12 85 / 0.6)", color: "oklch(0.45 0.1 85)" }} onClick={undoBenef}>
                    <RotateCcw className="w-3 h-3" /> Undo Copy
                  </Button>
                </div>
              )}
              {c1HasBeneficiaries && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: "oklch(0.97 0.015 155)", border: "1px solid oklch(0.65 0.08 155 / 0.3)" }}>
                  <Copy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.35 0.1 155)" }} />
                  <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.1 155)" }}>Copy beneficiaries, residual estate &amp; children benefit age from Client 1</span>
                  <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" style={{ borderColor: "oklch(0.65 0.08 155 / 0.6)", color: "oklch(0.28 0.07 155)" }} onClick={copyBeneficiariesFromClient1}>
                    <Copy className="w-3 h-3" /> Copy from Client 1
                  </Button>
                </div>
              )}
              <ClientBeneficiarySection
                label={c2Name}
                beneficiariesKey="client2Beneficiaries"
                residualEstateKey="client2ResidualEstate"
                residualBackupKey="client2ResidualBackup"
                childrenBenefitAgeKey="client2ChildrenBenefitAge"
                hasVulnerableKey="client2HasVulnerableBeneficiary"
                vulnerableDetailsKey="client2VulnerableBeneficiaryDetails"
                exclusionsKey="client2Exclusions"
                data={data}
                onChange={onChange}
                quickFillSources={quickFillSources}
              />
            </>
          );
        })()}
      </FormCard>
    </div>
  );
}
