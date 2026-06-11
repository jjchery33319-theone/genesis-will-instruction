import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill?: boolean;
}

function ClientBackgroundSection({
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
  const mentalCapacity = data[`${fieldPrefix}MentalCapacity`];
  const childrenPast = data[`${fieldPrefix}ChildrenPastRelationships`];

  return (
    <div className="space-y-4">
      <SectionDivider title={label} />

      <FieldRow label="Country of Residency" hint="Where is the client currently resident?">
        <Select
          value={data[`${fieldPrefix}Residency`] ?? ""}
          onValueChange={v => onChange({ [`${fieldPrefix}Residency`]: v } as Partial<WillFormData>)}
        >
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="UK">United Kingdom</SelectItem>
            <SelectItem value="Non-UK">Non-UK</SelectItem>
            <SelectItem value="Dual">Dual Residency</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow label="Domiciled in the UK?" hint="Domicile affects inheritance tax and which law governs the Will">
        <Select
          value={data[`${fieldPrefix}DomiciledUK`] ?? ""}
          onValueChange={v => onChange({ [`${fieldPrefix}DomiciledUK`]: v } as Partial<WillFormData>)}
        >
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="unsure">Unsure</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow
        label="Does the client have mental capacity?"
        hint="The client must have capacity to make a valid Will"
      >
        <Select
          value={mentalCapacity ?? ""}
          onValueChange={v => onChange({ [`${fieldPrefix}MentalCapacity`]: v } as Partial<WillFormData>)}
        >
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes — Full Capacity</SelectItem>
            <SelectItem value="concerns">Concerns — Notes Below</SelectItem>
            <SelectItem value="no">No — Unable to Proceed</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      {(mentalCapacity === "concerns" || mentalCapacity === "no") && (
        <FieldRow label="Mental Capacity Notes">
          <Textarea
            rows={3}
            value={data[`${fieldPrefix}MentalCapacityNotes`] ?? ""}
            onChange={e => onChange({ [`${fieldPrefix}MentalCapacityNotes`]: e.target.value } as Partial<WillFormData>)}
            placeholder="Describe any concerns about mental capacity…"
          />
        </FieldRow>
      )}

      <FieldRow
        label="Children from previous / past relationships relevant to this Will?"
        hint="Step-children, adopted children, or children from prior relationships"
      >
        <Select
          value={childrenPast ?? ""}
          onValueChange={v => onChange({ [`${fieldPrefix}ChildrenPastRelationships`]: v } as Partial<WillFormData>)}
        >
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      {childrenPast === "yes" && (
        <FieldRow label="Details of Children from Past Relationships">
          <Textarea
            rows={3}
            value={data[`${fieldPrefix}ChildrenPastDetails`] ?? ""}
            onChange={e => onChange({ [`${fieldPrefix}ChildrenPastDetails`]: e.target.value } as Partial<WillFormData>)}
            placeholder="e.g. Two children from first marriage — Tom (22) and Emma (19)…"
          />
        </FieldRow>
      )}
    </div>
  );
}

export default function Step5AdditionalBackground({ data, onChange, isMirrorWill }: Props) {
  return (
    <div className="space-y-5">
      <FormCard
        title="Additional Background"
        subtitle="Residency, mental capacity, and children from present or past relationships"
        icon={<Info className="w-4 h-4" />}
      >
        <ClientBackgroundSection
          label="Client 1 — Additional Background"
          fieldPrefix="client1"
          data={data}
          onChange={onChange}
        />

        {isMirrorWill && (
          <ClientBackgroundSection
            label="Client 2 — Additional Background"
            fieldPrefix="client2"
            data={data}
            onChange={onChange}
          />
        )}
      </FormCard>
    </div>
  );
}
