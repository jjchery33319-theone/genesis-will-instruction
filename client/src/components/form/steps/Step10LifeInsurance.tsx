import { WillFormData, LifeInsurancePolicy } from "../../../hooks/useWillForm";
import { FormCard, FieldRow } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Trash2 } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

const emptyPolicy = (): LifeInsurancePolicy => ({
  provider: "",
  policyNumber: "",
  sumAssured: "",
  inTrust: false,
  beneficiary: "",
  notes: "",
});

export default function Step10LifeInsurance({ data, onChange }: Props) {
  const policies = data.lifeInsurancePolicies ?? [];
  const hasInsurance = data.hasLifeInsurance;

  const addPolicy = () => {
    onChange({ lifeInsurancePolicies: [...policies, emptyPolicy()] });
  };

  const updatePolicy = (index: number, updates: Partial<LifeInsurancePolicy>) => {
    const updated = policies.map((p, i) => (i === index ? { ...p, ...updates } : p));
    onChange({ lifeInsurancePolicies: updated });
  };

  const removePolicy = (index: number) => {
    onChange({ lifeInsurancePolicies: policies.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-5">
      <FormCard
        title="Life Insurance & Protection"
        subtitle="Details of any existing life insurance policies and protection arrangements"
        icon={<Shield className="w-4 h-4" />}
      >
        <FieldRow label="Does the client have any life insurance policies?">
          <Select
            value={hasInsurance ?? ""}
            onValueChange={v => {
              onChange({ hasLifeInsurance: v });
              if (v === "yes" && policies.length === 0) {
                onChange({ lifeInsurancePolicies: [emptyPolicy()] });
              }
            }}
          >
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="unsure">Unsure / To Confirm</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>

        {hasInsurance === "yes" && (
          <div className="mt-6 space-y-4">
            {policies.map((policy, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 space-y-4"
                style={{ borderColor: "oklch(0.88 0.02 155)", background: "oklch(0.99 0.005 155)" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.28 0.07 155)" }}
                  >
                    Policy {index + 1}
                  </span>
                  {policies.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePolicy(index)}
                      className="text-destructive hover:text-destructive h-7 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Insurance Provider" required>
                    <Input
                      value={policy.provider}
                      onChange={e => updatePolicy(index, { provider: e.target.value })}
                      placeholder="e.g. Legal & General, Aviva, Zurich…"
                    />
                  </FieldRow>
                  <FieldRow label="Policy Number">
                    <Input
                      value={policy.policyNumber ?? ""}
                      onChange={e => updatePolicy(index, { policyNumber: e.target.value })}
                      placeholder="e.g. LG-123456"
                    />
                  </FieldRow>
                  <FieldRow label="Sum Assured (£)">
                    <Input
                      value={policy.sumAssured ?? ""}
                      onChange={e => updatePolicy(index, { sumAssured: e.target.value })}
                      placeholder="e.g. 250000"
                    />
                  </FieldRow>
                  <FieldRow label="Named Beneficiary">
                    <Input
                      value={policy.beneficiary ?? ""}
                      onChange={e => updatePolicy(index, { beneficiary: e.target.value })}
                      placeholder="e.g. Spouse, children equally…"
                    />
                  </FieldRow>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    id={`trust-${index}`}
                    checked={policy.inTrust ?? false}
                    onCheckedChange={v => updatePolicy(index, { inTrust: v })}
                  />
                  <Label htmlFor={`trust-${index}`} className="text-sm cursor-pointer">
                    Policy is written in trust
                  </Label>
                  {!policy.inTrust && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "oklch(0.97 0.04 80)", color: "oklch(0.55 0.14 80)" }}
                    >
                      Consider writing in trust to avoid probate
                    </span>
                  )}
                </div>

                <FieldRow label="Notes">
                  <Textarea
                    rows={2}
                    value={policy.notes ?? ""}
                    onChange={e => updatePolicy(index, { notes: e.target.value })}
                    placeholder="Any additional notes about this policy…"
                  />
                </FieldRow>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addPolicy}
              className="w-full gap-2 border-dashed"
              style={{ borderColor: "oklch(0.65 0.14 80)", color: "oklch(0.45 0.12 155)" }}
            >
              <Plus className="w-4 h-4" />
              Add Another Policy
            </Button>
          </div>
        )}

        <div className="mt-5">
          <FieldRow label="Additional Notes" hint="Any other protection arrangements, critical illness cover, income protection, etc.">
            <Textarea
              rows={3}
              value={data.lifeInsuranceNotes ?? ""}
              onChange={e => onChange({ lifeInsuranceNotes: e.target.value })}
              placeholder="e.g. Critical illness cover with employer, death in service benefit…"
            />
          </FieldRow>
        </div>
      </FormCard>
    </div>
  );
}
