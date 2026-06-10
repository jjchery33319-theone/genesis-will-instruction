import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { PersonList } from "../PersonFields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CHILDREN_BENEFIT_AGES } from "../../../../../shared/willConstants";
import { Heart, AlertTriangle } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

export default function Step5Beneficiaries({ data, onChange }: Props) {
  const hasVulnerable = data.hasVulnerableBeneficiary === "yes";
  const isMirrorWill =
    data.productsOrdered?.includes("mirror_wills") || data.willType === "Mirror Wills";

  return (
    <div className="space-y-5">
      <FormCard
        title="Beneficiaries"
        subtitle="The people or organisations who will inherit from the estate"
        icon={<Heart className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> List all beneficiaries and their share of the estate. Shares should total 100%. You can specify equal shares (e.g. "Equal share") or percentages (e.g. "50%"). Include the relationship to the client.
        </div>

        <PersonList
          persons={data.beneficiaries ?? []}
          onChange={beneficiaries => onChange({ beneficiaries })}
          showShare
          showVulnerable
          addLabel="Add Beneficiary"
          emptyMessage="No beneficiaries added yet."
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

        <SectionDivider title="Disaster Clause" />

        <div className="grid grid-cols-1 gap-4">
          <FieldRow
            label="Disaster Clause — Client 1"
            hint="Who should inherit if all named beneficiaries predecease the client?"
          >
            <Textarea
              rows={3}
              value={data.disasterClauseClient1 ?? ""}
              onChange={e => onChange({ disasterClauseClient1: e.target.value })}
              placeholder="e.g. If all named beneficiaries predecease me, I leave my estate to…"
            />
          </FieldRow>

          {isMirrorWill && (
            <FieldRow
              label="Disaster Clause — Client 2"
              hint="Who should inherit if all named beneficiaries predecease Client 2?"
            >
              <Textarea
                rows={3}
                value={data.disasterClauseClient2 ?? ""}
                onChange={e => onChange({ disasterClauseClient2: e.target.value })}
                placeholder="e.g. If all named beneficiaries predecease me, I leave my estate to…"
              />
            </FieldRow>
          )}
        </div>
      </FormCard>

      {/* Vulnerable Beneficiary */}
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
