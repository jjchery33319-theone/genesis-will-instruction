import { WillFormData, PersonEntry } from "../../../hooks/useWillForm";
import { FormCard, SectionDivider } from "../FormCard";
import { PersonList, QuickFillSource } from "../PersonFields";
import { Scale, Shield, Baby, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill?: boolean;
}

function clientToPersonEntry(data: WillFormData, clientNum: 1 | 2, relationship: string): PersonEntry {
  const p = clientNum === 1 ? "client1" : "client2";
  const d = data as Record<string, string | undefined>;
  return {
    prefix: d[`${p}Prefix`],
    firstName: d[`${p}FirstName`] ?? "",
    lastName: d[`${p}LastName`] ?? "",
    dob: d[`${p}Dob`],
    phone: d[`${p}DaytimePhone`] ?? d[`${p}Mobile`],
    email: d[`${p}Email`],
    address: [d[`${p}AddressLine1`], d[`${p}City`], d[`${p}Postcode`]].filter(Boolean).join(", "),
    relationship,
  };
}

function childToPersonEntry(child: import("../../../hooks/useWillForm").ChildEntry): Partial<PersonEntry> {
  return {
    firstName: child.firstName,
    lastName: child.lastName ?? "",
    dob: child.dob,
    address: child.address ?? "",
    relationship: child.relationship ?? "Child",
  };
}

function buildQuickFillSources(data: WillFormData): QuickFillSource[] {
  const sources: QuickFillSource[] = [];
  const c1Name = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ");
  const c2Name = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ");
  if (c1Name.trim()) sources.push({ label: `Client 1 — ${c1Name}`, person: clientToPersonEntry(data, 1, "Client 1") });
  if (c2Name.trim()) sources.push({ label: `Client 2 — ${c2Name}`, person: clientToPersonEntry(data, 2, "Client 2") });

  // Over-18 children from both clients
  const over18Children = [
    ...(data.client1ChildrenOver18 ?? []).map(c => ({ child: c, owner: "C1" })),
    ...(data.client2ChildrenOver18 ?? []).map(c => ({ child: c, owner: "C2" })),
  ];
  over18Children.forEach(({ child, owner }) => {
    const name = [child.firstName, child.lastName].filter(Boolean).join(" ");
    if (name.trim()) {
      sources.push({ label: `${owner} Child (18+) — ${name}`, person: childToPersonEntry(child) });
    }
  });

  const allPeople: { list: PersonEntry[]; prefix: string }[] = [
    { list: data.client1Executors ?? [], prefix: "C1 Executor" },
    { list: data.client2Executors ?? [], prefix: "C2 Executor" },
    { list: data.trustees ?? [], prefix: "Trustee" },
    { list: data.client1Guardians ?? [], prefix: "C1 Guardian" },
    { list: data.client2Guardians ?? [], prefix: "C2 Guardian" },
  ];
  allPeople.forEach(({ list, prefix }) => {
    list.forEach((p, i) => {
      const name = [p.firstName, p.lastName].filter(Boolean).join(" ");
      if (name.trim()) sources.push({ label: `${prefix} ${i + 1} — ${name}`, person: p });
    });
  });
  return sources;
}

// ── Per-client executor section ───────────────────────────────────────────────
function ClientExecutorSection({
  label,
  primaryKey,
  reservedKey,
  data,
  onChange,
  isMirrorWill,
  mirrorClientNum,
  quickFillSources,
}: {
  label: string;
  primaryKey: "client1Executors" | "client2Executors";
  reservedKey: "client1ReservedExecutors" | "client2ReservedExecutors";
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill?: boolean;
  mirrorClientNum?: 1 | 2;
  quickFillSources: QuickFillSource[];
}) {
  const mirrorName = mirrorClientNum
    ? [
        (data as Record<string, string | undefined>)[`client${mirrorClientNum}FirstName`],
        (data as Record<string, string | undefined>)[`client${mirrorClientNum}LastName`],
      ].filter(Boolean).join(" ")
    : "";

  // Add mirror client at position #1 (front of the list)
  const addMirrorClientFirst = () => {
    if (!mirrorClientNum) return;
    const person = clientToPersonEntry(data, mirrorClientNum, "Spouse / Partner");
    if (!person.firstName) return;
    const existing = data[primaryKey] ?? [];
    // Remove if already present, then prepend
    const without = existing.filter(e => !(e.firstName === person.firstName && e.lastName === person.lastName));
    onChange({ [primaryKey]: [person, ...without] } as Partial<WillFormData>);
  };

  return (
    <div className="space-y-3">
      <SectionDivider title={label} />

      {isMirrorWill && mirrorName && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 mb-1"
          style={{ borderColor: "oklch(0.78 0.12 85 / 0.6)", color: "oklch(0.28 0.07 155)" }}
          onClick={addMirrorClientFirst}
        >
          <Zap className="w-3.5 h-3.5" />
          Add {mirrorName} as First Executor
        </Button>
      )}

      <div className="text-xs font-medium text-muted-foreground mb-1">Primary Executor(s)</div>
      <PersonList
        persons={data[primaryKey] ?? []}
        onChange={list => onChange({ [primaryKey]: list } as Partial<WillFormData>)}
        showShare={false}
        showVulnerable={false}
        addLabel="Add Primary Executor"
        emptyMessage="No primary executors added yet."
        quickFillSources={quickFillSources}
      />

      <div className="text-xs font-medium text-muted-foreground mt-3 mb-1">Reserved / Substitute Executor(s)</div>
      <div className="mb-2 p-2.5 rounded-lg text-xs" style={{ background: "oklch(0.98 0.01 85)", color: "oklch(0.45 0.1 85)", border: "1px solid oklch(0.78 0.12 85 / 0.3)" }}>
        Reserved Executors step in if a primary executor is unable or unwilling to act.
      </div>
      <PersonList
        persons={data[reservedKey] ?? []}
        onChange={list => onChange({ [reservedKey]: list } as Partial<WillFormData>)}
        showShare={false}
        showVulnerable={false}
        addLabel="Add Reserved Executor"
        emptyMessage="Optional but recommended."
        quickFillSources={quickFillSources}
      />
    </div>
  );
}

// ── Per-client guardian section ───────────────────────────────────────────────
function ClientGuardianSection({
  label,
  primaryKey,
  reservedKey,
  data,
  onChange,
  quickFillSources,
}: {
  label: string;
  primaryKey: "client1Guardians" | "client2Guardians";
  reservedKey: "client1ReservedGuardians" | "client2ReservedGuardians";
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  quickFillSources: QuickFillSource[];
}) {
  return (
    <div className="space-y-3">
      <SectionDivider title={label} />
      <div className="text-xs font-medium text-muted-foreground mb-1">Primary Guardian(s)</div>
      <PersonList
        persons={data[primaryKey] ?? []}
        onChange={list => onChange({ [primaryKey]: list } as Partial<WillFormData>)}
        showShare={false}
        showVulnerable={false}
        addLabel="Add Primary Guardian"
        emptyMessage="No primary guardians added yet."
        quickFillSources={quickFillSources}
      />
      <div className="text-xs font-medium text-muted-foreground mt-3 mb-1">Reserved / Substitute Guardian(s)</div>
      <PersonList
        persons={data[reservedKey] ?? []}
        onChange={list => onChange({ [reservedKey]: list } as Partial<WillFormData>)}
        showShare={false}
        showVulnerable={false}
        addLabel="Add Reserved Guardian"
        emptyMessage="Optional but recommended for parents."
        quickFillSources={quickFillSources}
      />
    </div>
  );
}

export default function Step4Executors({ data, onChange, isMirrorWill = false }: Props) {
  const quickFillSources = buildQuickFillSources(data);
  const c1Name = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ") || "Client 1";
  const c2Name = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ") || "Client 2";

  // Guardians are only relevant when there are minor children entered
  const hasMinorChildren =
    (data.client1ChildrenUnder18?.length ?? 0) > 0 ||
    (data.client2ChildrenUnder18?.length ?? 0) > 0;

  return (
    <div className="space-y-5">
      {/* ── Executors ─────────────────────────────────────────────────────── */}
      <FormCard
        title="Executors"
        subtitle="The person(s) responsible for administering the estate and carrying out the wishes in the Will"
        icon={<Scale className="w-4 h-4" />}
      >
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Executors manage the estate after death. You can appoint up to 4. Common choices include a spouse/partner, adult children, or a trusted friend. Use the <strong>Copy from…</strong> dropdown on each entry to auto-fill from previously entered clients or people.
        </div>

        {isMirrorWill && (() => {
          const c1Full = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ");
          const c2Full = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ");
          if (!c1Full || !c2Full) return null;

          // "Appoint each other as First Executor" — places the partner at position #1
          const appointEachOtherFirst = () => {
            const person1 = clientToPersonEntry(data, 1, "Spouse / Partner");
            const person2 = clientToPersonEntry(data, 2, "Spouse / Partner");
            const c1Execs = data.client1Executors ?? [];
            const c2Execs = data.client2Executors ?? [];
            // Remove if already present, then prepend
            const c1Without = c1Execs.filter(e => !(e.firstName === person2.firstName && e.lastName === person2.lastName));
            const c2Without = c2Execs.filter(e => !(e.firstName === person1.firstName && e.lastName === person1.lastName));
            onChange({
              client1Executors: [person2, ...c1Without],
              client2Executors: [person1, ...c2Without],
            });
          };

          return (
            <div className="mb-4 p-3 rounded-xl flex items-center gap-3" style={{ background: "oklch(0.96 0.04 85)", border: "1.5px solid oklch(0.78 0.12 85 / 0.7)" }}>
              <Users className="w-5 h-5 shrink-0" style={{ color: "oklch(0.55 0.12 85)" }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>Mirror Wills — Appoint Each Other as First Executor</div>
                <div className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.07 155)" }}>For Mirror Wills it is common for each client to appoint the other as their <strong>first</strong> (primary) executor. This places the partner at position #1 in each other's executor list.</div>
              </div>
              <Button
                type="button"
                size="sm"
                className="shrink-0 text-xs font-semibold"
                style={{ background: "oklch(0.28 0.07 155)", color: "white" }}
                onClick={appointEachOtherFirst}
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                Appoint as First Executor
              </Button>
            </div>
          );
        })()}

        <ClientExecutorSection
          label={`Primary Executor for ${c1Name}`}
          primaryKey="client1Executors"
          reservedKey="client1ReservedExecutors"
          data={data}
          onChange={onChange}
          isMirrorWill={isMirrorWill}
          mirrorClientNum={2}
          quickFillSources={quickFillSources}
        />

        {isMirrorWill && (
          <ClientExecutorSection
            label={`Primary Executor for ${c2Name}`}
            primaryKey="client2Executors"
            reservedKey="client2ReservedExecutors"
            data={data}
            onChange={onChange}
            isMirrorWill={isMirrorWill}
            mirrorClientNum={1}
            quickFillSources={quickFillSources}
          />
        )}
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

      {/* ── Guardians — only shown when minor children have been entered ───── */}
      {hasMinorChildren && (
        <FormCard
          title="Guardians for Minor Children"
          subtitle="The person(s) who will care for any minor children if both parents die"
          icon={<Baby className="w-4 h-4" />}
        >
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
            <strong>Guidance:</strong> Each client can appoint different guardians. Use <strong>Copy from…</strong> to reuse a previously entered person.
          </div>

          <ClientGuardianSection
            label={`Guardians for ${c1Name}`}
            primaryKey="client1Guardians"
            reservedKey="client1ReservedGuardians"
            data={data}
            onChange={onChange}
            quickFillSources={quickFillSources}
          />

          {isMirrorWill && (
            <ClientGuardianSection
              label={`Guardians for ${c2Name}`}
              primaryKey="client2Guardians"
              reservedKey="client2ReservedGuardians"
              data={data}
              onChange={onChange}
              quickFillSources={quickFillSources}
            />
          )}
        </FormCard>
      )}
    </div>
  );
}
