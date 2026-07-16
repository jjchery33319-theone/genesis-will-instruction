import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow } from "../FormCard";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

type DDQuestion = {
  key: keyof WillFormData;
  notesKey: keyof WillFormData;
  label: string;
  hint: string;
  yesLabel?: string;
  noLabel?: string;
  flagOnYes?: boolean; // if true, "Yes" is a concern (e.g. signs of influence)
};

const DD_QUESTIONS: DDQuestion[] = [
  {
    key: "ddArrangedAppointment",
    notesKey: "ddArrangedAppointmentNotes",
    label: "Did the client arrange the appointment themselves?",
    hint: "Confirms the client is acting of their own volition and was not brought by a third party",
    yesLabel: "Yes — Client arranged it",
    noLabel: "No — Arranged by someone else",
  },
  {
    key: "ddKnowledgeOfEstate",
    notesKey: "ddKnowledgeOfEstateNotes",
    label: "Did the client have a good knowledge of what constitutes their estate?",
    hint: "The client should understand their assets, liabilities, and overall estate",
    yesLabel: "Yes — Good knowledge",
    noLabel: "No — Limited knowledge",
  },
  {
    key: "ddKnewBeneficiaries",
    notesKey: "ddKnewBeneficiariesNotes",
    label: "Did the client know exactly who they wanted their estate to go to?",
    hint: "The client should have clear intentions about their beneficiaries",
    yesLabel: "Yes — Clear intentions",
    noLabel: "No — Uncertain",
  },
  {
    key: "ddSignsOfInfluence",
    notesKey: "ddSignsOfInfluenceNotes",
    label: "Were there any signs of influence from anyone?",
    hint: "Any undue pressure, coercion, or influence from a third party must be noted",
    yesLabel: "Yes — Concerns noted below",
    noLabel: "No — No signs of influence",
    flagOnYes: true,
  },
  {
    key: "ddKnewAppointees",
    notesKey: "ddKnewAppointeesNotes",
    label: "Does the client know who they want to appoint as Executor / Attorney / Trustee and why?",
    hint: "The client should have considered their choice of appointees",
    yesLabel: "Yes — Clear choices",
    noLabel: "No — Needs guidance",
  },
];

export default function Step6DueDiligence({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <FormCard
        title="Due Diligence"
        subtitle="Compliance questions to confirm the client's capacity and independence of decision"
        icon={<ShieldCheck className="w-4 h-4" />}
      >
        {/* Compliance notice */}
        <div
          className="rounded-lg p-4 mb-6 text-sm"
          style={{ background: "oklch(0.97 0.015 155)", borderLeft: "4px solid oklch(0.65 0.14 80)" }}
        >
          <p className="font-semibold genesis-green-text mb-1">Compliance Requirement</p>
          <p className="text-muted-foreground">
            These questions must be completed for every instruction. Any concerns identified should be
            documented in the notes field and escalated to the compliance team before proceeding.
          </p>
        </div>

        <div className="space-y-6">
          {DD_QUESTIONS.map((q, idx) => {
            const answer = data[q.key] as string | undefined;
            const isConcern = q.flagOnYes && answer === "yes";

            return (
              <div
                key={q.key as string}
                className="rounded-lg border p-4 space-y-3"
                style={{
                  borderColor: isConcern ? "oklch(0.55 0.22 25)" : "oklch(0.88 0.02 155)",
                  background: isConcern ? "oklch(0.98 0.01 25)" : "white",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                    style={{ background: "oklch(0.28 0.07 155)", color: "oklch(0.97 0.03 90)" }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <FieldRow label={q.label} hint={q.hint}>
                      <Select
                        value={answer ?? ""}
                        onValueChange={v => onChange({ [q.key]: v } as Partial<WillFormData>)}
                      >
                        <SelectTrigger
                          style={isConcern ? { borderColor: "oklch(0.55 0.22 25)", background: "oklch(0.97 0.01 25)" } : {}}
                        >
                          <SelectValue placeholder="Select response…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">{q.yesLabel ?? "Yes"}</SelectItem>
                          <SelectItem value="no">{q.noLabel ?? "No"}</SelectItem>
                          <SelectItem value="na">Not Applicable</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldRow>

                    {isConcern && (
                      <div
                        className="mt-2 text-xs font-semibold px-2 py-1 rounded"
                        style={{ background: "oklch(0.55 0.22 25)", color: "white" }}
                      >
                        ⚠ Concern flagged — please document details below and escalate if necessary
                      </div>
                    )}

                    {answer && answer !== "" && (
                      <div className="mt-3">
                        <FieldRow label="Notes / Additional Details" hint="Optional — record any relevant observations">
                          <Textarea
                            rows={4}
                            value={(data[q.notesKey] as string) ?? ""}
                            onChange={e => onChange({ [q.notesKey]: e.target.value } as Partial<WillFormData>)}
                            placeholder="Add any relevant notes here…"
                          />
                        </FieldRow>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </FormCard>
    </div>
  );
}
