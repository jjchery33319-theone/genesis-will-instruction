import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldRow } from "./FormCard";
import { PREFIXES, MARITAL_STATUSES } from "../../../../shared/willConstants";

interface ClientFieldsProps {
  prefix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
  maritalStatus?: string;
  jobTitle?: string;
  daytimePhone?: string;
  mobile?: string;
  email?: string;
  nationality?: string;
  onChange: (field: string, value: string) => void;
  fieldPrefix: string;
  showMaritalStatus?: boolean;
  required?: boolean;
}

export function ClientFields({
  prefix, firstName, middleName, lastName, dob,
  addressLine1, city, postcode, maritalStatus, jobTitle,
  daytimePhone, mobile, email, nationality,
  onChange, fieldPrefix, showMaritalStatus = true, required = false,
}: ClientFieldsProps) {
  const f = (field: string) => `${fieldPrefix}${field.charAt(0).toUpperCase()}${field.slice(1)}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FieldRow label="Title">
          <Select value={prefix ?? ""} onValueChange={v => onChange(f("prefix"), v)}>
            <SelectTrigger><SelectValue placeholder="Title" /></SelectTrigger>
            <SelectContent>
              {PREFIXES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="First Name" required={required}>
          <Input value={firstName ?? ""} onChange={e => onChange(f("firstName"), e.target.value)} placeholder="First name" />
        </FieldRow>
        <FieldRow label="Middle Name">
          <Input value={middleName ?? ""} onChange={e => onChange(f("middleName"), e.target.value)} placeholder="Middle name" />
        </FieldRow>
        <FieldRow label="Last Name" required={required}>
          <Input value={lastName ?? ""} onChange={e => onChange(f("lastName"), e.target.value)} placeholder="Last name" />
        </FieldRow>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FieldRow label="Date of Birth" required={required}>
          <Input type="date" value={dob ?? ""} onChange={e => onChange(f("dob"), e.target.value)} />
        </FieldRow>
        {showMaritalStatus && (
          <FieldRow label="Marital Status">
            <Select value={maritalStatus ?? ""} onValueChange={v => onChange(f("maritalStatus"), v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {MARITAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldRow>
        )}
        <FieldRow label="Nationality">
          <Input value={nationality ?? ""} onChange={e => onChange(f("nationality"), e.target.value)} placeholder="e.g. British" />
        </FieldRow>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FieldRow label="Address Line 1" required={required} className="sm:col-span-1">
          <Input value={addressLine1 ?? ""} onChange={e => onChange(f("addressLine1"), e.target.value)} placeholder="Street address" />
        </FieldRow>
        <FieldRow label="City / Town">
          <Input value={city ?? ""} onChange={e => onChange(f("city"), e.target.value)} placeholder="City" />
        </FieldRow>
        <FieldRow label="Postcode" required={required}>
          <Input value={postcode ?? ""} onChange={e => onChange(f("postcode"), e.target.value)} placeholder="e.g. SW1A 1AA" className="uppercase" />
        </FieldRow>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FieldRow label="Job Title">
          <Input value={jobTitle ?? ""} onChange={e => onChange(f("jobTitle"), e.target.value)} placeholder="Occupation" />
        </FieldRow>
        <FieldRow label="Daytime Phone" required={required}>
          <Input type="tel" value={daytimePhone ?? ""} onChange={e => onChange(f("daytimePhone"), e.target.value)} placeholder="+44 7700 000000" />
        </FieldRow>
        <FieldRow label="Mobile">
          <Input type="tel" value={mobile ?? ""} onChange={e => onChange(f("mobile"), e.target.value)} placeholder="+44 7700 000000" />
        </FieldRow>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldRow label="Email Address">
          <Input type="email" value={email ?? ""} onChange={e => onChange(f("email"), e.target.value)} placeholder="client@example.com" />
        </FieldRow>
      </div>
    </div>
  );
}

// ─── Person Entry (for executors, trustees, guardians, beneficiaries) ─────────

import { PersonEntry } from "../../hooks/useWillForm";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type QuickFillSource = {
  label: string;
  person: Partial<PersonEntry>;
};

interface PersonListProps {
  persons: PersonEntry[];
  onChange: (persons: PersonEntry[]) => void;
  showShare?: boolean;
  showVulnerable?: boolean;
  showRelationship?: boolean;
  addLabel?: string;
  emptyMessage?: string;
  /** Sources available in the "Copy from…" dropdown for each entry */
  quickFillSources?: QuickFillSource[];
}

const emptyPerson = (): PersonEntry => ({ firstName: "", lastName: "" });

export function PersonList({
  persons,
  onChange,
  showShare = false,
  showVulnerable = false,
  showRelationship = true,
  addLabel = "Add Person",
  emptyMessage = "No entries yet.",
  quickFillSources = [],
}: PersonListProps) {
  const update = (index: number, field: keyof PersonEntry, value: string | boolean) => {
    const updated = [...persons];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const remove = (index: number) => {
    onChange(persons.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...persons, emptyPerson()]);
  };

  const applyQuickFill = (index: number, source: Partial<PersonEntry>) => {
    const updated = [...persons];
    updated[index] = { ...updated[index], ...source };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {persons.length === 0 && (
        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
      )}

      {persons.map((person, index) => (
        <div
          key={index}
          className="border border-border rounded-lg p-4 space-y-3 relative"
          style={{ background: "oklch(0.99 0.005 155)" }}
        >
          {/* Header row: entry number, copy-from selector, delete */}
          <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Entry {index + 1}
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {quickFillSources.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <Select
                    value=""
                    onValueChange={val => {
                      const src = quickFillSources.find(s => s.label === val);
                      if (src) applyQuickFill(index, src.person);
                    }}
                  >
                    <SelectTrigger
                      className="h-7 text-xs px-2 min-w-[140px] max-w-[200px]"
                      style={{ borderColor: "oklch(0.78 0.12 85 / 0.6)", color: "oklch(0.28 0.07 155)" }}
                    >
                      <SelectValue placeholder="Copy from…" />
                    </SelectTrigger>
                    <SelectContent>
                      {quickFillSources.map(src => (
                        <SelectItem key={src.label} value={src.label} className="text-xs">
                          {src.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive h-7 w-7 p-0 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <FieldRow label="Title">
              <Select value={person.prefix ?? ""} onValueChange={v => update(index, "prefix", v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Title" /></SelectTrigger>
                <SelectContent>
                  {PREFIXES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="First Name">
              <Input className="h-8 text-sm" value={person.firstName} onChange={e => update(index, "firstName", e.target.value)} placeholder="First" />
            </FieldRow>
            <FieldRow label="Last Name">
              <Input className="h-8 text-sm" value={person.lastName} onChange={e => update(index, "lastName", e.target.value)} placeholder="Last" />
            </FieldRow>
            {showRelationship && (
              <FieldRow label="Relationship">
                <Input className="h-8 text-sm" value={person.relationship ?? ""} onChange={e => update(index, "relationship", e.target.value)} placeholder="e.g. Spouse" />
              </FieldRow>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <FieldRow label="Date of Birth">
              <Input type="date" className="h-8 text-sm" value={person.dob ?? ""} onChange={e => update(index, "dob", e.target.value)} />
            </FieldRow>
            <FieldRow label="Phone">
              <Input type="tel" className="h-8 text-sm" value={person.phone ?? ""} onChange={e => update(index, "phone", e.target.value)} placeholder="+44 7700 000000" />
            </FieldRow>
            <FieldRow label="Email">
              <Input type="email" className="h-8 text-sm" value={person.email ?? ""} onChange={e => update(index, "email", e.target.value)} placeholder="email@example.com" />
            </FieldRow>
          </div>

          <FieldRow label="Address">
            <Input className="h-8 text-sm" value={person.address ?? ""} onChange={e => update(index, "address", e.target.value)} placeholder="Full address" />
          </FieldRow>

          {showShare && (
            <FieldRow label="Share / Percentage" hint="e.g. 50% or Equal share">
              <Input className="h-8 text-sm" value={person.share ?? ""} onChange={e => update(index, "share", e.target.value)} placeholder="e.g. 50%" />
            </FieldRow>
          )}

          {showVulnerable && (
            <div className="flex items-center gap-3 pt-1">
              <Switch checked={person.isVulnerable ?? false} onCheckedChange={v => update(index, "isVulnerable", v)} />
              <Label className="text-sm cursor-pointer">This beneficiary is a vulnerable person</Label>
            </div>
          )}

          <FieldRow label="Notes">
            <Textarea className="text-sm resize-none" rows={2} value={person.notes ?? ""} onChange={e => update(index, "notes", e.target.value)} placeholder="Any additional notes…" />
          </FieldRow>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={add}
        className="gap-2 border-dashed"
        style={{ borderColor: "oklch(0.78 0.12 85)", color: "oklch(0.28 0.07 155)" }}
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </Button>
    </div>
  );
}
