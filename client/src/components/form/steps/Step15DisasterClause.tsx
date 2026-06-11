import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill?: boolean;
}

export default function Step15DisasterClause({ data, onChange, isMirrorWill }: Props) {
  return (
    <div className="space-y-5">
      <FormCard
        title="Disaster Clause & Final Notes"
        subtitle="A disaster clause sets out who inherits if all primary beneficiaries die simultaneously"
        icon={<FileText className="w-4 h-4" />}
      >
        {/* Explanation */}
        <div
          className="rounded-lg p-4 mb-6 text-sm"
          style={{ background: "oklch(0.97 0.015 155)", borderLeft: "4px solid oklch(0.65 0.14 80)" }}
        >
          <p className="font-semibold genesis-green-text mb-1">What is a Disaster Clause?</p>
          <p className="text-muted-foreground">
            A disaster clause (also called a catastrophe clause) provides instructions for what should happen
            to the estate if all the primary beneficiaries die at the same time or within a short period of
            each other — for example, in a road accident or natural disaster. Without this clause, the estate
            would pass under the rules of intestacy.
          </p>
        </div>

        <SectionDivider title="Client 1 — Disaster Clause" />
        <FieldRow
          label="Client 1 Disaster Clause"
          hint="Who should inherit if all primary beneficiaries predecease the client?"
        >
          <Textarea
            rows={4}
            value={data.disasterClauseClient1 ?? ""}
            onChange={e => onChange({ disasterClauseClient1: e.target.value })}
            placeholder="e.g. If all named beneficiaries predecease me, I wish my estate to pass equally to my siblings or, if they have also predeceased me, to Cancer Research UK…"
          />
        </FieldRow>

        {isMirrorWill && (
          <>
            <SectionDivider title="Client 2 — Disaster Clause" />
            <FieldRow
              label="Client 2 Disaster Clause"
              hint="Who should inherit if all primary beneficiaries predecease the client?"
            >
              <Textarea
                rows={4}
                value={data.disasterClauseClient2 ?? ""}
                onChange={e => onChange({ disasterClauseClient2: e.target.value })}
                placeholder="e.g. If all named beneficiaries predecease me, I wish my estate to pass equally to my siblings or, if they have also predeceased me, to Cancer Research UK…"
              />
            </FieldRow>
          </>
        )}

        <SectionDivider title="Disaster Clause Notes" />
        <FieldRow
          label="General Disaster Clause Notes"
          hint="Any additional considerations or instructions for the disaster clause"
        >
          <Textarea
            rows={3}
            value={data.disasterClauseNotes ?? ""}
            onChange={e => onChange({ disasterClauseNotes: e.target.value })}
            placeholder="e.g. Client wishes to include a 30-day survivorship clause for all beneficiaries…"
          />
        </FieldRow>

        <SectionDivider title="Additional Notes" />
        <FieldRow
          label="Additional Notes for the Admin Team"
          hint="Anything else the consultant should note — special circumstances, follow-up actions, client concerns, etc."
        >
          <Textarea
            rows={5}
            value={data.additionalNotes ?? ""}
            onChange={e => onChange({ additionalNotes: e.target.value })}
            placeholder="e.g. Client mentioned they are expecting a child in 3 months — Will should be reviewed after birth. Client also asked about LPA — follow up required. Client has a property in Spain — advise on Spanish Will…"
          />
        </FieldRow>

        <FieldRow
          label="Consultant's Internal Notes"
          hint="Private notes for the admin team — not included in client-facing documents"
        >
          <Textarea
            rows={3}
            value={data.specialNotes ?? ""}
            onChange={e => onChange({ specialNotes: e.target.value })}
            placeholder="Internal notes only — compliance observations, follow-up reminders, etc."
          />
        </FieldRow>
      </FormCard>
    </div>
  );
}
