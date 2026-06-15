import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { PersonList, QuickFillSource } from "../PersonFields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CHILDREN_BENEFIT_AGES } from "../../../../../shared/willConstants";
import { Heart, AlertTriangle, BookOpen } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

function buildBeneficiaryQuickFillSources(data: WillFormData): QuickFillSource[] {
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
  (data.executors ?? []).forEach((e, i) => {
    const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
    if (name.trim()) sources.push({ label: `Executor ${i + 1} — ${name}`, person: e });
  });
  return sources;
}

export default function Step5Beneficiaries({ data, onChange }: Props) {
  const hasVulnerable = data.hasVulnerableBeneficiary === "yes";
  const isMirrorWill =
    data.productsOrdered?.includes("mirror_wills") || data.willType === "Mirror Wills";

  const quickFillSources = buildBeneficiaryQuickFillSources(data);

  return (
    <div className="space-y-5">

      {/* ── Residuary Estate ──────────────────────────────────────────────── */}
      <FormCard
        title="Residuary Estate"
        subtitle="Who inherits the remainder of the estate after all specific gifts, debts, and expenses have been settled"
        icon={<BookOpen className="w-4 h-4" />}
      >
        <div
          className="mb-3 p-3 rounded-lg text-sm"
          style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}
        >
          <strong>Guidance:</strong> The residuary estate is everything left over after specific gifts have been distributed and all debts and expenses paid. This is typically the largest part of the estate.
        </div>
        <div className="space-y-4">
          <FieldRow
            label="Residuary Estate — Who inherits the remainder?"
            hint="e.g. To my spouse absolutely, or if they predecease me, equally between my children"
          >
            <Textarea
              rows={3}
              value={data.residuaryEstate ?? ""}
              onChange={e => onChange({ residuaryEstate: e.target.value })}
              placeholder="e.g. To my spouse absolutely, or if they predecease me, equally between my children…"
            />
          </FieldRow>

          <FieldRow
            label="Backup / Substitution Clause"
            hint="What happens if the primary residuary beneficiary predeceases the client?"
          >
            <Textarea
              rows={3}
              value={data.residuaryBackup ?? ""}
              onChange={e => onChange({ residuaryBackup: e.target.value })}
              placeholder="e.g. If my spouse predeceases me, I leave the residue equally between my children…"
            />
          </FieldRow>
        </div>
      </FormCard>

      {/* ── Named Beneficiaries ───────────────────────────────────────────── */}
      <FormCard
        title="Named Beneficiaries"
        subtitle="The people or organisations who will inherit from the estate"
        icon={<Heart className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> List all beneficiaries and their share of the estate. Shares should total 100%. You can specify equal shares (e.g. "Equal share") or percentages (e.g. "50%"). Use the <strong>Copy from…</strong> dropdown to reuse a previously entered person.
        </div>

        <PersonList
          persons={data.beneficiaries ?? []}
          onChange={beneficiaries => onChange({ beneficiaries })}
          showShare
          showVulnerable
          addLabel="Add Beneficiary"
          emptyMessage="No beneficiaries added yet."
          quickFillSources={quickFillSources}
        />

        <SectionDivider title="Children's Benefit Age" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow
            label="At what age should children benefit?"
            hint="The age at which minor children will receive their inheritance"
          >
            <Select
              value={data.childrenBenefitAge ?? ""}
              onValueChange={v => onChange({ childrenBenefitAge: v })}
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
      </FormCard>

      {/* ── Vulnerable Beneficiary ────────────────────────────────────────── */}
      <FormCard
        title="Vulnerable Beneficiary"
        subtitle="Does any beneficiary have a disability, mental health condition, or other vulnerability?"
        icon={<AlertTriangle className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={hasVulnerable}
              onCheckedChange={v => onChange({ hasVulnerableBeneficiary: v ? "yes" : "no" })}
            />
            <Label className="text-sm cursor-pointer">
              Yes, there is a vulnerable beneficiary
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
                  rows={3}
                  value={data.vulnerableBeneficiaryDetails ?? ""}
                  onChange={e => onChange({ vulnerableBeneficiaryDetails: e.target.value })}
                  placeholder="Name, nature of vulnerability, current support arrangements…"
                />
              </FieldRow>
            </div>
          )}
        </div>
      </FormCard>
    </div>
  );
}
