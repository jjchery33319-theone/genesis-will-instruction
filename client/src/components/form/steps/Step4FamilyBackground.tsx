import { WillFormData, ChildEntry } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Baby, UserCheck, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill?: boolean;
}

// ── Blank child factory ──────────────────────────────────────────────────────
function blankChild(ageGroup: "under18" | "over18"): ChildEntry {
  return { firstName: "", ageGroup };
}

// ── Child card ───────────────────────────────────────────────────────────────
function ChildCard({
  child,
  index,
  ageGroup,
  onUpdate,
  onRemove,
}: {
  child: ChildEntry;
  index: number;
  ageGroup: "under18" | "over18";
  onUpdate: (updated: ChildEntry) => void;
  onRemove: () => void;
}) {
  const u = (patch: Partial<ChildEntry>) => onUpdate({ ...child, ...patch });

  return (
    <div
      className="rounded-lg border p-4 space-y-3 relative"
      style={{ borderColor: ageGroup === "under18" ? "oklch(0.78 0.12 85 / 0.5)" : "oklch(0.65 0.08 155 / 0.4)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <Badge
          variant="outline"
          className="text-xs font-semibold"
          style={
            ageGroup === "under18"
              ? { borderColor: "oklch(0.78 0.12 85)", color: "oklch(0.55 0.12 85)" }
              : { borderColor: "oklch(0.4 0.1 155)", color: "oklch(0.35 0.1 155)" }
          }
        >
          {ageGroup === "under18" ? <Baby className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
          {ageGroup === "under18" ? "Under 18" : "Over 18"} — Child {index + 1}
        </Badge>
        <button
          type="button"
          onClick={onRemove}
          className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded"
          title="Remove child"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">First Name *</Label>
          <Input
            value={child.firstName}
            onChange={e => u({ firstName: e.target.value })}
            placeholder="First name"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Last Name</Label>
          <Input
            value={child.lastName ?? ""}
            onChange={e => u({ lastName: e.target.value })}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Date of Birth</Label>
          <Input
            type="date"
            value={child.dob ?? ""}
            onChange={e => u({ dob: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Relationship</Label>
          <Select
            value={child.relationship ?? ""}
            onValueChange={v => u({ relationship: v })}
          >
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Child from current marriage">Child — current marriage</SelectItem>
              <SelectItem value="Child from previous relationship">Child — previous relationship</SelectItem>
              <SelectItem value="Stepchild">Stepchild</SelectItem>
              <SelectItem value="Adopted child">Adopted child</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Special needs toggle */}
      <div className="flex items-center gap-3 pt-1">
        <Switch
          checked={child.hasSpecialNeeds ?? false}
          onCheckedChange={v => u({ hasSpecialNeeds: v })}
          id={`sn-${ageGroup}-${index}`}
        />
        <Label htmlFor={`sn-${ageGroup}-${index}`} className="text-sm cursor-pointer flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Has special needs or vulnerability
        </Label>
      </div>

      {child.hasSpecialNeeds && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Special Needs / Vulnerability Details</Label>
          <Textarea
            rows={2}
            value={child.specialNeedsDetails ?? ""}
            onChange={e => u({ specialNeedsDetails: e.target.value })}
            placeholder="Describe the special needs or vulnerability…"
          />
        </div>
      )}

      {child.notes && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Notes</Label>
          <Input
            value={child.notes}
            onChange={e => u({ notes: e.target.value })}
            placeholder="Any additional notes…"
          />
        </div>
      )}
    </div>
  );
}

// ── Per-client children section ──────────────────────────────────────────────
function ClientChildrenSection({
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
  const hasChildren = data[`${fieldPrefix}HasChildren`];
  const under18Key = `${fieldPrefix}ChildrenUnder18` as "client1ChildrenUnder18" | "client2ChildrenUnder18";
  const over18Key = `${fieldPrefix}ChildrenOver18` as "client1ChildrenOver18" | "client2ChildrenOver18";
  const under18 = data[under18Key] ?? [];
  const over18 = data[over18Key] ?? [];

  const updateChild = (
    key: typeof under18Key | typeof over18Key,
    index: number,
    updated: ChildEntry
  ) => {
    const arr = [...(data[key] ?? [])];
    arr[index] = updated;
    onChange({ [key]: arr } as Partial<WillFormData>);
  };

  const removeChild = (key: typeof under18Key | typeof over18Key, index: number) => {
    const arr = (data[key] ?? []).filter((_, i) => i !== index);
    onChange({ [key]: arr } as Partial<WillFormData>);
  };

  const addChild = (key: typeof under18Key | typeof over18Key, ageGroup: "under18" | "over18") => {
    const arr = [...(data[key] ?? []), blankChild(ageGroup)];
    onChange({ [key]: arr } as Partial<WillFormData>);
  };

  const hasSpecialNeedsChildren =
    [...under18, ...over18].some(c => c.hasSpecialNeeds);

  return (
    <div className="space-y-4">
      <SectionDivider title={label} />

      {/* Marriage plans */}
      <FieldRow label="Any plans to marry or enter a civil partnership?" hint="A new marriage revokes an existing Will">
        <Select
          value={data[`${fieldPrefix}MarriagePlans`] ?? ""}
          onValueChange={v => onChange({ [`${fieldPrefix}MarriagePlans`]: v } as Partial<WillFormData>)}
        >
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="not_applicable">Not Applicable</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      {data[`${fieldPrefix}MarriagePlans`] === "yes" && (
        <FieldRow label="Marriage / Civil Partnership Details">
          <Textarea
            rows={2}
            value={data[`${fieldPrefix}MarriagePlanDetails`] ?? ""}
            onChange={e => onChange({ [`${fieldPrefix}MarriagePlanDetails`]: e.target.value } as Partial<WillFormData>)}
            placeholder="e.g. Planning to marry in 2025, partner's name is…"
          />
        </FieldRow>
      )}

      {/* Do you have children? */}
      <FieldRow label="Do you have children?">
        <Select
          value={hasChildren ?? ""}
          onValueChange={v => onChange({ [`${fieldPrefix}HasChildren`]: v } as Partial<WillFormData>)}
        >
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      {hasChildren === "yes" && (
        <div className="space-y-4 pl-2 border-l-2" style={{ borderColor: "oklch(0.78 0.12 85 / 0.4)" }}>
          {/* Total number */}
          <FieldRow label="Total number of children">
            <Input
              type="number"
              min={1}
              max={20}
              value={data[`${fieldPrefix}TotalChildren`] ?? ""}
              onChange={e => onChange({ [`${fieldPrefix}TotalChildren`]: e.target.value } as Partial<WillFormData>)}
              placeholder="e.g. 3"
              className="max-w-[120px]"
            />
          </FieldRow>

          {/* Special needs flag */}
          <FieldRow label="Do any children have special needs or vulnerabilities?">
            <Select
              value={data[`${fieldPrefix}ChildrenSpecialNeeds`] ?? ""}
              onValueChange={v => onChange({ [`${fieldPrefix}ChildrenSpecialNeeds`]: v } as Partial<WillFormData>)}
            >
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>

          {data[`${fieldPrefix}ChildrenSpecialNeeds`] === "yes" && (
            <FieldRow label="Special Needs / Vulnerability Overview" hint="General overview — you can add detail per child below">
              <Textarea
                rows={2}
                value={data[`${fieldPrefix}ChildrenSpecialNeedsDetails`] ?? ""}
                onChange={e => onChange({ [`${fieldPrefix}ChildrenSpecialNeedsDetails`]: e.target.value } as Partial<WillFormData>)}
                placeholder="e.g. One child has autism and will require ongoing care…"
              />
            </FieldRow>
          )}

          {/* ── Children Under 18 ─────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4" style={{ color: "oklch(0.55 0.12 85)" }} />
                <span className="text-sm font-semibold genesis-green-text">Children Under 18</span>
                {under18.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{under18.length}</Badge>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addChild(under18Key, "under18")}
                className="gap-1.5 text-xs"
                style={{ borderColor: "oklch(0.78 0.12 85)", color: "oklch(0.45 0.1 85)" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Child Under 18
              </Button>
            </div>

            {under18.length === 0 && (
              <p className="text-xs text-muted-foreground italic pl-1">No children under 18 added yet.</p>
            )}

            {under18.map((child, i) => (
              <ChildCard
                key={i}
                child={child}
                index={i}
                ageGroup="under18"
                onUpdate={updated => updateChild(under18Key, i, updated)}
                onRemove={() => removeChild(under18Key, i)}
              />
            ))}
          </div>

          {/* ── Children Over 18 ──────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" style={{ color: "oklch(0.4 0.1 155)" }} />
                <span className="text-sm font-semibold genesis-green-text">Children Over 18</span>
                {over18.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{over18.length}</Badge>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addChild(over18Key, "over18")}
                className="gap-1.5 text-xs"
                style={{ borderColor: "oklch(0.4 0.1 155)", color: "oklch(0.35 0.1 155)" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Child Over 18
              </Button>
            </div>

            {over18.length === 0 && (
              <p className="text-xs text-muted-foreground italic pl-1">No children over 18 added yet.</p>
            )}

            {over18.map((child, i) => (
              <ChildCard
                key={i}
                child={child}
                index={i}
                ageGroup="over18"
                onUpdate={updated => updateChild(over18Key, i, updated)}
                onRemove={() => removeChild(over18Key, i)}
              />
            ))}
          </div>

          {/* Vulnerable Trust alert */}
          {hasSpecialNeedsChildren && (
            <div
              className="rounded-lg p-3 flex items-start gap-2 text-sm"
              style={{ background: "oklch(0.97 0.03 85)", border: "1px solid oklch(0.78 0.12 85 / 0.5)" }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.55 0.12 85)" }} />
              <p style={{ color: "oklch(0.45 0.1 85)" }}>
                <strong>Recommendation flag:</strong> One or more children have special needs or vulnerabilities.
                A <strong>Vulnerable Person's Trust</strong> may be appropriate — this will be highlighted in the recommendations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Family circumstances */}
      <FieldRow label="Family Circumstances" hint="Any relevant family background the consultant should note">
        <Textarea
          rows={3}
          value={data[`${fieldPrefix}FamilyCircumstances`] ?? ""}
          onChange={e => onChange({ [`${fieldPrefix}FamilyCircumstances`]: e.target.value } as Partial<WillFormData>)}
          placeholder="e.g. Blended family, estranged relatives, dependants with special needs…"
        />
      </FieldRow>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Step4FamilyBackground({ data, onChange, isMirrorWill }: Props) {
  return (
    <div className="space-y-5">
      <FormCard
        title="Family Background"
        subtitle="Information about family circumstances, marriage plans, and children"
        icon={<Users className="w-4 h-4" />}
      >
        <ClientChildrenSection
          label="Client 1 — Family Background"
          fieldPrefix="client1"
          data={data}
          onChange={onChange}
        />

        {isMirrorWill && (
          <ClientChildrenSection
            label="Client 2 — Family Background"
            fieldPrefix="client2"
            data={data}
            onChange={onChange}
          />
        )}
      </FormCard>
    </div>
  );
}
