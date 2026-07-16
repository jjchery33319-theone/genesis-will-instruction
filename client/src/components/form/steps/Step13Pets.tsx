import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow } from "../FormCard";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PawPrint } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

export default function Step13Pets({ data, onChange }: Props) {
  const hasPets = data.hasPets;

  return (
    <div className="space-y-5">
      <FormCard
        title="Pets"
        subtitle="Shall provisions be made for the client's pets?"
        icon={<PawPrint className="w-4 h-4" />}
      >
        <FieldRow label="Does the client have any pets?" hint="Pets cannot inherit directly but provisions can be made for their care">
          <Select
            value={hasPets ?? ""}
            onValueChange={v => onChange({ hasPets: v })}
          >
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>

        {hasPets === "yes" && (
          <div className="mt-5 space-y-4">
            <div
              className="rounded-lg p-3 text-xs"
              style={{ background: "oklch(0.97 0.03 90)", borderLeft: "3px solid oklch(0.65 0.14 80)" }}
            >
              <span className="font-semibold" style={{ color: "oklch(0.45 0.12 80)" }}>Note:</span>{" "}
              <span className="text-muted-foreground">
                Pets are legally considered property. A legacy can be left to a named carer along with a sum of money
                for the pet's upkeep. A condition can also be included that the money is only paid if the carer
                takes on the pet.
              </span>
            </div>

            <FieldRow label="Pet Details" hint="Type of pet, name, and any relevant information">
              <Textarea
                rows={5}
                value={data.petsDetails ?? ""}
                onChange={e => onChange({ petsDetails: e.target.value })}
                placeholder="e.g. Two cats — Whiskers (5) and Mittens (3). One dog — Buddy (7, Labrador)…"
              />
            </FieldRow>

            <FieldRow
              label="Proposed Carer for Pets"
              hint="Who should take care of the pets? A sum of money can be left to this person for the pets' upkeep"
            >
              <Textarea
                rows={5}
                value={data.petsCarer ?? ""}
                onChange={e => onChange({ petsCarer: e.target.value })}
                placeholder="e.g. Sister — Jane Smith, 12 Oak Lane, London. Leave £2,000 for upkeep on condition she takes the cats…"
              />
            </FieldRow>
          </div>
        )}

        {hasPets === "no" && (
          <div
            className="mt-4 rounded-lg p-3 text-sm"
            style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.45 0.08 155)" }}
          >
            No pet provisions required.
          </div>
        )}
      </FormCard>
    </div>
  );
}
