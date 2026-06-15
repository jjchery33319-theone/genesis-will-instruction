import { WillFormData, PersonEntry } from "../../../hooks/useWillForm";
import { FormCard, SectionDivider } from "../FormCard";
import { PersonList, QuickFillSource } from "../PersonFields";
import { Scale, Shield, Baby, UserCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill?: boolean;
}

/** Build a PersonEntry from client fields stored in WillFormData */
function clientToPersonEntry(
  data: WillFormData,
  clientNum: 1 | 2,
  relationship: string
): PersonEntry {
  const p = clientNum === 1 ? "client1" : "client2";
  return {
    prefix: (data as Record<string, string | undefined>)[`${p}Prefix`],
    firstName: (data as Record<string, string | undefined>)[`${p}FirstName`] ?? "",
    lastName: (data as Record<string, string | undefined>)[`${p}LastName`] ?? "",
    dob: (data as Record<string, string | undefined>)[`${p}Dob`],
    phone: (data as Record<string, string | undefined>)[`${p}DaytimePhone`] ??
           (data as Record<string, string | undefined>)[`${p}Mobile`],
    email: (data as Record<string, string | undefined>)[`${p}Email`],
    address: [
      (data as Record<string, string | undefined>)[`${p}AddressLine1`],
      (data as Record<string, string | undefined>)[`${p}City`],
      (data as Record<string, string | undefined>)[`${p}Postcode`],
    ].filter(Boolean).join(", "),
    relationship,
  };
}

/** Build the "Copy from…" sources available to every person list */
function buildQuickFillSources(data: WillFormData): QuickFillSource[] {
  const sources: QuickFillSource[] = [];

  const c1Name = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ");
  const c2Name = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ");

  if (c1Name.trim()) {
    sources.push({ label: `Client 1 — ${c1Name}`, person: clientToPersonEntry(data, 1, "Client 1") });
  }
  if (c2Name.trim()) {
    sources.push({ label: `Client 2 — ${c2Name}`, person: clientToPersonEntry(data, 2, "Client 2") });
  }

  // Also expose already-entered executors / trustees / guardians as copy sources
  (data.executors ?? []).forEach((e, i) => {
    const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
    if (name.trim()) sources.push({ label: `Executor ${i + 1} — ${name}`, person: e });
  });
  (data.trustees ?? []).forEach((t, i) => {
    const name = [t.firstName, t.lastName].filter(Boolean).join(" ");
    if (name.trim()) sources.push({ label: `Trustee ${i + 1} — ${name}`, person: t });
  });
  (data.guardians ?? []).forEach((g, i) => {
    const name = [g.firstName, g.lastName].filter(Boolean).join(" ");
    if (name.trim()) sources.push({ label: `Guardian ${i + 1} — ${name}`, person: g });
  });

  return sources;
}

export default function Step4Executors({ data, onChange, isMirrorWill = false }: Props) {
  const quickFillSources = buildQuickFillSources(data);

  const c1Name = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ") || "Client 1";
  const c2Name = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ") || "Client 2";

  /** Mirror Wills: appoint each client as the other's executor */
  const appointEachOther = () => {
    const c1 = clientToPersonEntry(data, 1, "Spouse / Partner");
    const c2 = clientToPersonEntry(data, 2, "Spouse / Partner");
    // Merge with existing list, avoiding duplicates by first+last name
    const existing = data.executors ?? [];
    const hasC1 = existing.some(e => e.firstName === c1.firstName && e.lastName === c1.lastName);
    const hasC2 = existing.some(e => e.firstName === c2.firstName && e.lastName === c2.lastName);
    const merged = [...existing];
    if (!hasC1 && c1.firstName) merged.push(c1);
    if (!hasC2 && c2.firstName) merged.push(c2);
    onChange({ executors: merged });
  };

  return (
    <div className="space-y-5">
      {/* ── Mirror Wills quick-action banner ──────────────────────────────── */}
      {isMirrorWill && (
        <div
          className="rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          style={{ background: "oklch(0.97 0.02 85 / 0.5)", borderColor: "oklch(0.78 0.12 85 / 0.5)" }}
        >
          <Zap className="w-5 h-5 flex-shrink-0" style={{ color: "oklch(0.65 0.14 80)" }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>
              Mirror Wills — Appoint Each Other as Executors
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              For Mirror Wills it is common for each client to appoint the other as their primary executor. Click below to pre-fill both clients as executors in one step.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={appointEachOther}
            className="flex-shrink-0 text-white"
            style={{ background: "oklch(0.28 0.07 155)" }}
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Appoint Each Other
          </Button>
        </div>
      )}

      {/* ── Executors ─────────────────────────────────────────────────────── */}
      <FormCard
        title="Executors"
        subtitle="The person(s) responsible for administering the estate and carrying out the wishes in the Will"
        icon={<Scale className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Executors manage the estate after death. You can appoint up to 4. Common choices include a spouse/partner, adult children, or a trusted friend. Use the <strong>Copy from…</strong> dropdown on each entry to auto-fill from previously entered clients or people.
        </div>

        {/* Individual quick-fill buttons for Mirror Wills */}
        {isMirrorWill && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              style={{ borderColor: "oklch(0.78 0.12 85 / 0.6)", color: "oklch(0.28 0.07 155)" }}
              onClick={() => {
                const c1 = clientToPersonEntry(data, 1, "Spouse / Partner");
                if (!c1.firstName) return;
                const existing = data.executors ?? [];
                const has = existing.some(e => e.firstName === c1.firstName && e.lastName === c1.lastName);
                if (!has) onChange({ executors: [...existing, c1] });
              }}
            >
              + Add {c1Name} as Executor
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              style={{ borderColor: "oklch(0.78 0.12 85 / 0.6)", color: "oklch(0.28 0.07 155)" }}
              onClick={() => {
                const c2 = clientToPersonEntry(data, 2, "Spouse / Partner");
                if (!c2.firstName) return;
                const existing = data.executors ?? [];
                const has = existing.some(e => e.firstName === c2.firstName && e.lastName === c2.lastName);
                if (!has) onChange({ executors: [...existing, c2] });
              }}
            >
              + Add {c2Name} as Executor
            </Button>
          </div>
        )}

        <SectionDivider title="Primary Executors" />
        <PersonList
          persons={data.executors ?? []}
          onChange={executors => onChange({ executors })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Primary Executor"
          emptyMessage="No primary executors added yet. Click the button below to add one."
          quickFillSources={quickFillSources}
        />

        <SectionDivider title="Reserved / Substitute Executors" />
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.98 0.01 85)", color: "oklch(0.45 0.1 85)", border: "1px solid oklch(0.78 0.12 85 / 0.3)" }}>
          <strong>Reserved Executors</strong> step in if a primary executor is unable or unwilling to act — for example, if they predecease the testator or renounce their role.
        </div>
        <PersonList
          persons={data.reservedExecutors ?? []}
          onChange={reservedExecutors => onChange({ reservedExecutors })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Reserved Executor"
          emptyMessage="No reserved executors added. This is optional but recommended."
          quickFillSources={quickFillSources}
        />
      </FormCard>

      {/* ── Trustees ──────────────────────────────────────────────────────── */}
      <FormCard
        title="Trustees"
        subtitle="The person(s) who will manage any trust created under the Will"
        icon={<Shield className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Trustees manage assets held in trust. Executors are often also appointed as trustees. Use <strong>Copy from…</strong> to reuse an executor entry.
        </div>
        <PersonList
          persons={data.trustees ?? []}
          onChange={trustees => onChange({ trustees })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Trustee"
          emptyMessage="No trustees added yet."
          quickFillSources={quickFillSources}
        />
      </FormCard>

      {/* ── Guardians ─────────────────────────────────────────────────────── */}
      <FormCard
        title="Guardians for Minor Children"
        subtitle="The person(s) who will care for any minor children if both parents die"
        icon={<Baby className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Only relevant if the client has children under 18. Use <strong>Copy from…</strong> to reuse a previously entered person.
        </div>

        <SectionDivider title="Primary Guardians" />
        <PersonList
          persons={data.guardians ?? []}
          onChange={guardians => onChange({ guardians })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Primary Guardian"
          emptyMessage="No primary guardians added. Leave blank if no minor children."
          quickFillSources={quickFillSources}
        />

        <SectionDivider title="Reserved / Substitute Guardians" />
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.98 0.01 85)", color: "oklch(0.45 0.1 85)", border: "1px solid oklch(0.78 0.12 85 / 0.3)" }}>
          <strong>Reserved Guardians</strong> step in if the primary guardian is unable to act.
        </div>
        <PersonList
          persons={data.reservedGuardians ?? []}
          onChange={reservedGuardians => onChange({ reservedGuardians })}
          showShare={false}
          showVulnerable={false}
          addLabel="Add Reserved Guardian"
          emptyMessage="No reserved guardians added. This is optional but recommended for parents."
          quickFillSources={quickFillSources}
        />
      </FormCard>
    </div>
  );
}
