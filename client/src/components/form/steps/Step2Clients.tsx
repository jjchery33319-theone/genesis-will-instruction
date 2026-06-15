import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, User, Copy } from "lucide-react";
import { PREFIXES, MARITAL_STATUSES } from "../../../../../shared/willConstants";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill?: boolean;
}

const MARRIED_STATUSES = ["Married", "Civil Partnership"];

function ClientSection({
  label,
  fieldPrefix,
  data,
  onChange,
  showSameAddress = false,
  onCopyAddress,
}: {
  label: string;
  fieldPrefix: "client1" | "client2";
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  showSameAddress?: boolean;
  onCopyAddress?: () => void;
}) {
  const f = (field: string) =>
    `${fieldPrefix}${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof WillFormData;

  const val = (field: string) => (data[f(field)] as string) ?? "";
  const set = (field: string, value: string) => onChange({ [f(field)]: value } as Partial<WillFormData>);

  const maritalStatus = val("maritalStatus");
  const isAlreadyMarried = MARRIED_STATUSES.includes(maritalStatus);
  const sameAddress = (data as Record<string, unknown>)[`${fieldPrefix}SameAddressAsClient1`] === true;

  return (
    <div className="space-y-4">
      <SectionDivider title={label} />

      {/* Name row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FieldRow label="Title">
          <Select value={val("prefix")} onValueChange={v => set("prefix", v)}>
            <SelectTrigger><SelectValue placeholder="Title" /></SelectTrigger>
            <SelectContent>
              {PREFIXES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="First Name">
          <Input value={val("firstName")} onChange={e => set("firstName", e.target.value)} placeholder="First name" />
        </FieldRow>
        <FieldRow label="Middle Name">
          <Input value={val("middleName")} onChange={e => set("middleName", e.target.value)} placeholder="Middle name" />
        </FieldRow>
        <FieldRow label="Last Name">
          <Input value={val("lastName")} onChange={e => set("lastName", e.target.value)} placeholder="Last name" />
        </FieldRow>
      </div>

      {/* DOB / Marital / Nationality */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FieldRow label="Date of Birth">
          <Input type="date" value={val("dob")} onChange={e => set("dob", e.target.value)} />
        </FieldRow>
        <FieldRow label="Marital Status">
          <Select value={val("maritalStatus")} onValueChange={v => set("maritalStatus", v)}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {MARITAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Nationality">
          <Input value={val("nationality")} onChange={e => set("nationality", e.target.value)} placeholder="e.g. British" />
        </FieldRow>
      </div>

      {/* Marriage plans — only shown if NOT already married/civil partnership */}
      {!isAlreadyMarried && (
        <FieldRow label="Any plans to marry or enter a civil partnership?" hint="A new marriage revokes an existing Will">
          <Select value={val("marriagePlans")} onValueChange={v => set("marriagePlans", v)}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="not_applicable">Not Applicable</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      )}
      {!isAlreadyMarried && val("marriagePlans") === "yes" && (
        <FieldRow label="Marriage / Civil Partnership Details">
          <Input
            value={val("marriagePlanDetails")}
            onChange={e => set("marriagePlanDetails", e.target.value)}
            placeholder="e.g. Planning to marry in 2025, partner's name is…"
          />
        </FieldRow>
      )}

      {/* Address — with same-as-client-1 toggle for Client 2 */}
      {showSameAddress && (
        <div className="flex items-center gap-3 py-1">
          <Switch
            id={`${fieldPrefix}-same-address`}
            checked={sameAddress}
            onCheckedChange={checked => {
              onChange({ [`${fieldPrefix}SameAddressAsClient1`]: checked } as Partial<WillFormData>);
              if (checked && onCopyAddress) onCopyAddress();
            }}
          />
          <Label htmlFor={`${fieldPrefix}-same-address`} className="text-sm cursor-pointer select-none">
            <Copy className="w-3.5 h-3.5 inline mr-1 opacity-60" />
            Same address as Client 1
          </Label>
        </div>
      )}

      {!sameAddress && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FieldRow label="Address Line 1" className="sm:col-span-1">
              <Input value={val("addressLine1")} onChange={e => set("addressLine1", e.target.value)} placeholder="Street address" />
            </FieldRow>
            <FieldRow label="City / Town">
              <Input value={val("city")} onChange={e => set("city", e.target.value)} placeholder="City" />
            </FieldRow>
            <FieldRow label="Postcode">
              <Input value={val("postcode")} onChange={e => set("postcode", e.target.value)} placeholder="e.g. SW1A 1AA" className="uppercase" />
            </FieldRow>
          </div>
        </>
      )}

      {/* Contact / Job */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FieldRow label="Job Title">
          <Input value={val("jobTitle")} onChange={e => set("jobTitle", e.target.value)} placeholder="Occupation" />
        </FieldRow>
        <FieldRow label="Daytime Phone">
          <Input type="tel" value={val("daytimePhone")} onChange={e => set("daytimePhone", e.target.value)} placeholder="+44 7700 000000" />
        </FieldRow>
        <FieldRow label="Mobile">
          <Input type="tel" value={val("mobile")} onChange={e => set("mobile", e.target.value)} placeholder="+44 7700 000000" />
        </FieldRow>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldRow label="Email Address">
          <Input type="email" value={val("email")} onChange={e => set("email", e.target.value)} placeholder="client@example.com" />
        </FieldRow>
      </div>
    </div>
  );
}

export default function Step2Clients({ data, onChange, isMirrorWill }: Props) {
  // Copy Client 1 address to Client 2
  const copyAddressToClient2 = () => {
    onChange({
      client2AddressLine1: data.client1AddressLine1,
      client2City: data.client1City,
      client2Postcode: data.client1Postcode,
    });
  };

  return (
    <div className="space-y-5">
      <FormCard
        title="Client Details"
        subtitle={isMirrorWill ? "Both clients' personal information" : "Client's personal information"}
        icon={<Users className="w-4 h-4" />}
      >
        <ClientSection
          label="Client 1"
          fieldPrefix="client1"
          data={data}
          onChange={onChange}
        />

        {isMirrorWill && (
          <ClientSection
            label="Client 2"
            fieldPrefix="client2"
            data={data}
            onChange={onChange}
            showSameAddress
            onCopyAddress={copyAddressToClient2}
          />
        )}
      </FormCard>
    </div>
  );
}
