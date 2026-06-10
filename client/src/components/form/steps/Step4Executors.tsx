import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, SectionDivider } from "../FormCard";
import { PersonList } from "../PersonFields";
import { PersonEntry } from "../../../hooks/useWillForm";
import { Scale, Shield, Baby } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

export default function Step4Executors({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      {/* Executors */}
      <FormCard
        title="Executors"
        subtitle="The person(s) responsible for administering the estate and carrying out the wishes in the Will"
        icon={<Scale className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Executors are the people who will manage the estate after death. You can appoint up to 4 executors. Common choices include a spouse/partner, adult children, or a trusted friend. Professionals (solicitors) can also be appointed.
        </div>
        <PersonList
          persons={data.executors ?? []}
          onChange={executors => onChange({ executors })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Executor"
          emptyMessage="No executors added yet. Click the button below to add an executor."
        />
      </FormCard>

      {/* Trustees */}
      <FormCard
        title="Trustees"
        subtitle="The person(s) who will manage any trust created under the Will (e.g. for minor children)"
        icon={<Shield className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Trustees manage assets held in trust, for example until children reach a specified age. Executors are often also appointed as trustees. If a Protective Property Trust or Asset Allocation Trust is being set up, trustees must be named.
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

      {/* Guardians */}
      <FormCard
        title="Guardians for Minor Children"
        subtitle="The person(s) who will care for any minor children if both parents die"
        icon={<Baby className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Guardians are only relevant if the client has children under 18. If both parents die, the guardian will be responsible for the day-to-day care of the children. This is one of the most important decisions in a Will for parents.
        </div>
        <PersonList
          persons={data.guardians ?? []}
          onChange={guardians => onChange({ guardians })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Guardian"
          emptyMessage="No guardians added yet. Leave blank if no minor children."
        />
      </FormCard>
    </div>
  );
}
