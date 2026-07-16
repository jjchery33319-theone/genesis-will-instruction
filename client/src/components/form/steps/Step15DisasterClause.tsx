import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyUndo } from "../../../hooks/useCopyUndo";

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

        {isMirrorWill && (() => {
          const c1HasDisaster = !!data.disasterClauseClient1;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { hasSnapshot: hasDisasterSnapshot, saveSnapshot: saveDisasterSnapshot, undo: undoDisaster } = useCopyUndo(data, onChange);
          const copyDisasterFromClient1 = () => {
            saveDisasterSnapshot(["disasterClauseClient2"]);
            onChange({ disasterClauseClient2: data.disasterClauseClient1 });
          };
          return (
            <>
              <SectionDivider title="Client 2 — Disaster Clause" />
              {hasDisasterSnapshot && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: "oklch(0.98 0.02 85)", border: "1px solid oklch(0.78 0.12 85 / 0.5)" }}>
                  <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.55 0.12 85)" }} />
                  <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.08 85)" }}>Disaster clause copied from Client 1. Changed your mind?</span>
                  <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" style={{ borderColor: "oklch(0.78 0.12 85 / 0.6)", color: "oklch(0.45 0.1 85)" }} onClick={undoDisaster}>
                    <RotateCcw className="w-3 h-3" /> Undo Copy
                  </Button>
                </div>
              )}
              {c1HasDisaster && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: "oklch(0.97 0.015 155)", border: "1px solid oklch(0.65 0.08 155 / 0.3)" }}>
                  <Copy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.35 0.1 155)" }} />
                  <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.1 155)" }}>Copy disaster clause from Client 1</span>
                  <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" style={{ borderColor: "oklch(0.65 0.08 155 / 0.6)", color: "oklch(0.28 0.07 155)" }} onClick={copyDisasterFromClient1}>
                    <Copy className="w-3 h-3" /> Copy from Client 1
                  </Button>
                </div>
              )}
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
          );
        })()}

        <SectionDivider title="Disaster Clause Notes" />
        <FieldRow
          label="General Disaster Clause Notes"
          hint="Any additional considerations or instructions for the disaster clause"
        >
          <Textarea
            rows={5}
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
            rows={5}
            value={data.specialNotes ?? ""}
            onChange={e => onChange({ specialNotes: e.target.value })}
            placeholder="Internal notes only — compliance observations, follow-up reminders, etc."
          />
        </FieldRow>
      </FormCard>
    </div>
  );
}
