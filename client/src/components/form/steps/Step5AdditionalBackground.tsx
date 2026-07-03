import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyUndo } from "../../../hooks/useCopyUndo";

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

        {isMirrorWill && (() => {
          const c1HasBackground = !!(data.client1Residency || data.client1DomiciledUK || data.client1MentalCapacity);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { hasSnapshot: hasBgSnapshot, saveSnapshot: saveBgSnapshot, undo: undoBg } = useCopyUndo(data, onChange);
          const copyBackgroundFromClient1 = () => {
            saveBgSnapshot(["client2Residency", "client2DomiciledUK", "client2MentalCapacity", "client2MentalCapacityNotes", "client2ChildrenPastRelationships", "client2ChildrenPastDetails"]);
            onChange({
              client2Residency: data.client1Residency,
              client2DomiciledUK: data.client1DomiciledUK,
              client2MentalCapacity: data.client1MentalCapacity,
              client2MentalCapacityNotes: data.client1MentalCapacityNotes,
              client2ChildrenPastRelationships: data.client1ChildrenPastRelationships,
              client2ChildrenPastDetails: data.client1ChildrenPastDetails,
            });
          };
          return (
            <>
              {hasBgSnapshot && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: "oklch(0.98 0.02 85)", border: "1px solid oklch(0.78 0.12 85 / 0.5)" }}>
                  <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.55 0.12 85)" }} />
                  <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.08 85)" }}>Background details copied from Client 1. Changed your mind?</span>
                  <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" style={{ borderColor: "oklch(0.78 0.12 85 / 0.6)", color: "oklch(0.45 0.1 85)" }} onClick={undoBg}>
                    <RotateCcw className="w-3 h-3" /> Undo Copy
                  </Button>
                </div>
              )}
              {c1HasBackground && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: "oklch(0.97 0.015 155)", border: "1px solid oklch(0.65 0.08 155 / 0.3)" }}>
                  <Copy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.35 0.1 155)" }} />
                  <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.1 155)" }}>Copy residency, domicile, mental capacity &amp; past-relationship details from Client 1</span>
                  <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" style={{ borderColor: "oklch(0.65 0.08 155 / 0.6)", color: "oklch(0.28 0.07 155)" }} onClick={copyBackgroundFromClient1}>
                    <Copy className="w-3 h-3" /> Copy from Client 1
                  </Button>
                </div>
              )}
              <ClientBackgroundSection
                label="Client 2 — Additional Background"
                fieldPrefix="client2"
                data={data}
                onChange={onChange}
              />
            </>
          );
        })()}
      </FormCard>
    </div>
  );
}
