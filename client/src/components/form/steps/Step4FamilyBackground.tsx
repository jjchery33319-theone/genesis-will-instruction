import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill?: boolean;
}

function ClientFamilySection({
  label,
  fieldPrefix,
  data,
  onChange,
}: {
  label: string;
  fieldPrefix: "client1" | "client2";
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}) {
  const marriagePlans = data[`${fieldPrefix}MarriagePlans`];
  const hasChildren = data[`${fieldPrefix}HasChildren`];

  return (
    <div className="space-y-4">
      <SectionDivider title={label} />

      <FieldRow label="Any plans to marry or enter a civil partnership?" hint="A new marriage revokes an existing Will">
        <Select
          value={marriagePlans ?? ""}
          onValueChange={v => onChange({ [`${fieldPrefix}MarriagePlans`]: v } as Partial<WillFormData>)}
        >
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="not_applicable">Not Applicable</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      {marriagePlans === "yes" && (
        <FieldRow label="Marriage / Civil Partnership Details">
          <Textarea
            rows={2}
            value={data[`${fieldPrefix}MarriagePlanDetails`] ?? ""}
            onChange={e => onChange({ [`${fieldPrefix}MarriagePlanDetails`]: e.target.value } as Partial<WillFormData>)}
            placeholder="e.g. Planning to marry in 2025, partner's name is…"
          />
        </FieldRow>
      )}

      <FieldRow label="Does the client have children?">
        <Select
          value={hasChildren ?? ""}
          onValueChange={v => onChange({ [`${fieldPrefix}HasChildren`]: v } as Partial<WillFormData>)}
        >
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      {hasChildren === "yes" && (
        <FieldRow label="Children Details" hint="Names, ages, and any relevant circumstances">
          <Textarea
            rows={3}
            value={data[`${fieldPrefix}ChildrenDetails`] ?? ""}
            onChange={e => onChange({ [`${fieldPrefix}ChildrenDetails`]: e.target.value } as Partial<WillFormData>)}
            placeholder="e.g. James (12), Sophie (9) — both from current marriage"
          />
        </FieldRow>
      )}

      <FieldRow label="Family Circumstances" hint="Any relevant family background the consultant should note">
        <Textarea
          rows={3}
          value={data[`${fieldPrefix}FamilyCircumstances`] ?? ""}
          onChange={e => onChange({ [`${fieldPrefix}FamilyCircumstances`]: e.target.value } as Partial<WillFormData>)}
          placeholder="e.g. Blended family, estranged relatives, dependants with special needs…"
        />
      </FieldRow>
    </div>
  );
}

export default function Step4FamilyBackground({ data, onChange, isMirrorWill }: Props) {
  return (
    <div className="space-y-5">
      <FormCard
        title="Family Background"
        subtitle="Information about family circumstances, marriage plans, and children"
        icon={<Users className="w-4 h-4" />}
      >
        <ClientFamilySection
          label="Client 1 — Family Background"
          fieldPrefix="client1"
          data={data}
          onChange={onChange}
        />

        {isMirrorWill && (
          <ClientFamilySection
            label="Client 2 — Family Background"
            fieldPrefix="client2"
            data={data}
            onChange={onChange}
          />
        )}
      </FormCard>
    </div>
  );
}
