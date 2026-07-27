import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, Scale, UserCheck } from "lucide-react";

const PREFIXES = ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Rev", "Sir", "Lady", "Lord"];

type Donor = {
  title?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  postcode?: string;
  email?: string;
  phone?: string;
};

type Attorney = {
  title?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  postcode?: string;
  email?: string;
  phone?: string;
  relationship?: string;
};

type CertProvider = {
  title?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  postcode?: string;
  email?: string;
  phone?: string;
  relationship?: string;
};

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

function PersonRow({
  label,
  person,
  onUpdate,
  onRemove,
  showRelationship = false,
  showDob = true,
  canRemove = true,
}: {
  label: string;
  person: Donor | Attorney | CertProvider;
  onUpdate: (field: string, value: string) => void;
  onRemove?: () => void;
  showRelationship?: boolean;
  showDob?: boolean;
  canRemove?: boolean;
}) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold genesis-green-text">{label}</span>
        {canRemove && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive h-7 w-7 p-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <FieldRow label="Title">
          <Select value={(person as Record<string, string>).title ?? ""} onValueChange={v => onUpdate("title", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Title" /></SelectTrigger>
            <SelectContent>
              {PREFIXES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="First Name">
          <Input className="h-8 text-sm" value={(person as Record<string, string>).firstName ?? ""} onChange={e => onUpdate("firstName", e.target.value)} placeholder="First name" />
        </FieldRow>
        <FieldRow label="Last Name">
          <Input className="h-8 text-sm" value={(person as Record<string, string>).lastName ?? ""} onChange={e => onUpdate("lastName", e.target.value)} placeholder="Last name" />
        </FieldRow>
        {showRelationship && (
          <FieldRow label="Relationship">
            <Input className="h-8 text-sm" value={(person as Record<string, string>).relationship ?? ""} onChange={e => onUpdate("relationship", e.target.value)} placeholder="e.g. Spouse" />
          </FieldRow>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {showDob && (
          <FieldRow label="Date of Birth">
            <Input type="date" className="h-8 text-sm" value={(person as Record<string, string>).dob ?? ""} onChange={e => onUpdate("dob", e.target.value)} />
          </FieldRow>
        )}
        <FieldRow label="Phone">
          <Input type="tel" className="h-8 text-sm" value={(person as Record<string, string>).phone ?? ""} onChange={e => onUpdate("phone", e.target.value)} placeholder="+44 7700 000000" />
        </FieldRow>
        <FieldRow label="Email">
          <Input type="email" className="h-8 text-sm" value={(person as Record<string, string>).email ?? ""} onChange={e => onUpdate("email", e.target.value)} placeholder="email@example.com" />
        </FieldRow>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FieldRow label="Address">
          <Input className="h-8 text-sm" value={(person as Record<string, string>).address ?? ""} onChange={e => onUpdate("address", e.target.value)} placeholder="Full address" />
        </FieldRow>
        <FieldRow label="Postcode">
          <Input className="h-8 text-sm" value={(person as Record<string, string>).postcode ?? ""} onChange={e => onUpdate("postcode", e.target.value)} placeholder="e.g. SW1A 1AA" />
        </FieldRow>
      </div>
    </div>
  );
}

export function StepLpaDetails({ data, onChange }: Props) {
  const lpaDetails = data.lpaDetails ?? { donors: [], attorneys: [], certProvider: undefined };

  const updateLpaDetails = (updates: Partial<typeof lpaDetails>) => {
    onChange({ lpaDetails: { ...lpaDetails, ...updates } });
  };

  // ── Donors ────────────────────────────────────────────────────────────────
  const donors = lpaDetails.donors ?? [];
  const addDonor = () => {
    if (donors.length >= 2) return;
    updateLpaDetails({ donors: [...donors, { firstName: "", lastName: "" }] });
  };
  const updateDonor = (index: number, field: string, value: string) => {
    const updated = donors.map((d, i) => i === index ? { ...d, [field]: value } : d);
    updateLpaDetails({ donors: updated });
  };
  const removeDonor = (index: number) => {
    updateLpaDetails({ donors: donors.filter((_, i) => i !== index) });
  };

  // ── Attorneys ─────────────────────────────────────────────────────────────
  const attorneys = lpaDetails.attorneys ?? [];
  const addAttorney = () => {
    updateLpaDetails({ attorneys: [...attorneys, { firstName: "", lastName: "" }] });
  };
  const updateAttorney = (index: number, field: string, value: string) => {
    const updated = attorneys.map((a, i) => i === index ? { ...a, [field]: value } : a);
    updateLpaDetails({ attorneys: updated });
  };
  const removeAttorney = (index: number) => {
    updateLpaDetails({ attorneys: attorneys.filter((_, i) => i !== index) });
  };

  // ── Certificate Provider ──────────────────────────────────────────────────
  const certProvider = lpaDetails.certProvider ?? {};
  const updateCertProvider = (field: string, value: string) => {
    updateLpaDetails({ certProvider: { ...certProvider, [field]: value } });
  };

  return (
    <div className="space-y-6">
      {/* Donors */}
      <FormCard
        title="Donors"
        subtitle="The person(s) granting the LPA (up to 2)"
        icon={<Users className="w-4 h-4" />}
      >
        <div className="space-y-4">
          {donors.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No donors added yet. Click below to add a donor.</p>
          )}
          {donors.map((donor, i) => (
            <PersonRow
              key={i}
              label={`Donor ${i + 1}`}
              person={donor}
              onUpdate={(field, value) => updateDonor(i, field, value)}
              onRemove={() => removeDonor(i)}
              showDob
            />
          ))}
          {donors.length < 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={addDonor}
              className="gap-2 border-dashed w-full"
              style={{ borderColor: "oklch(0.78 0.12 85)", color: "oklch(0.28 0.07 155)" }}
            >
              <Plus className="w-4 h-4" />
              Add Donor {donors.length === 1 ? "(Donor 2)" : ""}
            </Button>
          )}
        </div>
      </FormCard>

      {/* Attorneys */}
      <FormCard
        title="Attorneys"
        subtitle="The people appointed to act under the LPA"
        icon={<Scale className="w-4 h-4" />}
      >
        <div className="space-y-4">
          {attorneys.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No attorneys added yet. Click below to add an attorney.</p>
          )}
          {attorneys.map((attorney, i) => (
            <PersonRow
              key={i}
              label={`Attorney ${i + 1}`}
              person={attorney}
              onUpdate={(field, value) => updateAttorney(i, field, value)}
              onRemove={() => removeAttorney(i)}
              showRelationship
              showDob
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addAttorney}
            className="gap-2 border-dashed w-full"
            style={{ borderColor: "oklch(0.78 0.12 85)", color: "oklch(0.28 0.07 155)" }}
          >
            <Plus className="w-4 h-4" />
            Add Attorney
          </Button>
        </div>
      </FormCard>

      {/* Certificate Provider */}
      <FormCard
        title="Certificate Provider"
        subtitle="The independent person who certifies the donor understands the LPA"
        icon={<UserCheck className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <SectionDivider title="Certificate Provider Details" />
          <PersonRow
            label="Certificate Provider"
            person={certProvider}
            onUpdate={updateCertProvider}
            showRelationship
            showDob={false}
            canRemove={false}
          />
        </div>
      </FormCard>
    </div>
  );
}
