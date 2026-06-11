import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, SectionDivider } from "../FormCard";
import { PersonList } from "../PersonFields";
import { Scale, Shield, Baby, UserCheck } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

export default function Step4Executors({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      {/* ── Executors ─────────────────────────────────────────────────────── */}
      <FormCard
        title="Executors"
        subtitle="The person(s) responsible for administering the estate and carrying out the wishes in the Will"
        icon={<Scale className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Executors manage the estate after death. You can appoint up to 4. Common choices include a spouse/partner, adult children, or a trusted friend. Professionals (solicitors) can also be appointed.
        </div>

        <SectionDivider title="Primary Executors" />
        <PersonList
          persons={data.executors ?? []}
          onChange={executors => onChange({ executors })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Primary Executor"
          emptyMessage="No primary executors added yet. Click the button below to add one."
        />

        <SectionDivider title="Reserved / Substitute Executors" />
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.98 0.01 85)", color: "oklch(0.45 0.1 85)", border: "1px solid oklch(0.78 0.12 85 / 0.3)" }}>
          <strong>Reserved Executors</strong> step in if a primary executor is unable or unwilling to act — for example, if they predecease the testator or renounce their role. Naming a substitute ensures the estate can always be administered.
        </div>
        <PersonList
          persons={data.reservedExecutors ?? []}
          onChange={reservedExecutors => onChange({ reservedExecutors })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Reserved Executor"
          emptyMessage="No reserved executors added. This is optional but recommended."
        />
      </FormCard>

      {/* ── Trustees ──────────────────────────────────────────────────────── */}
      <FormCard
        title="Trustees"
        subtitle="The person(s) who will manage any trust created under the Will (e.g. for minor children or a PPT)"
        icon={<Shield className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Trustees manage assets held in trust until children reach a specified age, or for a Protective Property Trust / Asset Allocation Trust. Executors are often also appointed as trustees.
        </div>
        <PersonList
          persons={data.trustees ?? []}
          onChange={trustees => onChange({ trustees })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Trustee"
          emptyMessage="No trustees added yet."
        />
      </FormCard>

      {/* ── Guardians ─────────────────────────────────────────────────────── */}
      <FormCard
        title="Guardians for Minor Children"
        subtitle="The person(s) who will care for any minor children if both parents die"
        icon={<Baby className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Guardians are only relevant if the client has children under 18. If both parents die, the guardian will be responsible for the day-to-day care of the children. This is one of the most important decisions in a Will for parents.
        </div>

        <SectionDivider title="Primary Guardians" />
        <PersonList
          persons={data.guardians ?? []}
          onChange={guardians => onChange({ guardians })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Primary Guardian"
          emptyMessage="No primary guardians added. Leave blank if no minor children."
        />

        <SectionDivider title="Reserved / Substitute Guardians" />
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.98 0.01 85)", color: "oklch(0.45 0.1 85)", border: "1px solid oklch(0.78 0.12 85 / 0.3)" }}>
          <strong>Reserved Guardians</strong> step in if the primary guardian is unable to act — for example, if they predecease the testator or are unable to care for the children. Naming a substitute provides an important safety net for the children's welfare.
        </div>
        <PersonList
          persons={data.reservedGuardians ?? []}
          onChange={reservedGuardians => onChange({ reservedGuardians })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Reserved Guardian"
          emptyMessage="No reserved guardians added. This is optional but recommended for parents."
        />
      </FormCard>
    </div>
  );
}
