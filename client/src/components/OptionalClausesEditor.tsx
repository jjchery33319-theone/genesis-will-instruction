/**
 * OptionalClausesEditor.tsx
 * Comprehensive admin editor for all optional Will clauses.
 * Supports multiple instances per clause type, configurable trustees,
 * life tenants, termination triggers, and ultimate beneficiaries.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, ChevronDown, Building2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PersonEntry {
  prefix?: string;
  firstName?: string;
  lastName?: string;
  relationship?: string;
  address?: string;
  phone?: string;
  email?: string;
  dob?: string;
  share?: string;
  notes?: string;
}

export interface PPTTerminationTriggers {
  onDeath?: boolean;
  onRemarriageOrCohabitation?: boolean;
  onCeasingToReside?: boolean;
  onBreachOfConditions?: boolean;
}

export interface PPTClause {
  propertyAddress?: string;
  trustees?: PersonEntry[];
  lifeTenants?: PersonEntry[];
  terminationTriggers?: PPTTerminationTriggers;
  trustPeriodNotes?: string;
  ultimateBeneficiaries?: PersonEntry[];
  notes?: string;
}

export interface DiscretionaryTrustClause {
  trustees?: PersonEntry[];
  beneficiaryClass?: string;
  additionalBeneficiaries?: PersonEntry[];
  terminationNotes?: string;
  notes?: string;
}

export interface VulnerableTrustClause {
  vulnerableBeneficiary?: PersonEntry;
  trustees?: PersonEntry[];
  ultimateBeneficiaries?: PersonEntry[];
  notes?: string;
}

export interface NilRateBandClause {
  trustees?: PersonEntry[];
  beneficiaries?: PersonEntry[];
  notes?: string;
}

export interface BereavedMinorClause {
  beneficiary?: PersonEntry;
  trustees?: PersonEntry[];
  ageOfAbsoluteEntitlement?: string;
  notes?: string;
}

export interface Age18To25Clause {
  beneficiary?: PersonEntry;
  trustees?: PersonEntry[];
  ageOfAbsoluteEntitlement?: string;
  notes?: string;
}

export interface BusinessPropertyReliefClause {
  businessName?: string;
  trustees?: PersonEntry[];
  beneficiaries?: PersonEntry[];
  notes?: string;
}

export interface OptionalClausesData {
  protectivePropertyTrusts?: PPTClause[];
  discretionaryTrusts?: DiscretionaryTrustClause[];
  vulnerablePersonTrusts?: VulnerableTrustClause[];
  nilRateBandTrusts?: NilRateBandClause[];
  bereavedMinorTrusts?: BereavedMinorClause[];
  age18To25Trusts?: Age18To25Clause[];
  businessPropertyReliefs?: BusinessPropertyReliefClause[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GENESIS_COMPANY: PersonEntry = {
  firstName: "Genesis Wills and Estate Planning Ltd",
  relationship: "Professional Trustee",
  address: "Registered office address",
};

function emptyPerson(): PersonEntry {
  return { prefix: "", firstName: "", lastName: "", relationship: "", address: "", phone: "", email: "", dob: "", share: "" };
}

function personLabel(p: PersonEntry): string {
  const name = [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ");
  return name || "Unnamed person";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PersonEditor({
  person,
  onChange,
  onRemove,
  showShare = false,
  label = "Person",
}: {
  person: PersonEntry;
  onChange: (p: PersonEntry) => void;
  onRemove: () => void;
  showShare?: boolean;
  label?: string;
}) {
  return (
    <Card className="border border-border/50 bg-muted/20">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <span className="text-sm font-medium text-foreground">{personLabel(person) || label}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-3 grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Title</Label>
          <Input className="h-8 text-sm" value={person.prefix ?? ""} onChange={e => onChange({ ...person, prefix: e.target.value })} placeholder="Mr/Mrs/Ms/Dr" />
        </div>
        <div>
          <Label className="text-xs">First Name</Label>
          <Input className="h-8 text-sm" value={person.firstName ?? ""} onChange={e => onChange({ ...person, firstName: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Last Name</Label>
          <Input className="h-8 text-sm" value={person.lastName ?? ""} onChange={e => onChange({ ...person, lastName: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Relationship</Label>
          <Input className="h-8 text-sm" value={person.relationship ?? ""} onChange={e => onChange({ ...person, relationship: e.target.value })} placeholder="e.g. Spouse, Child" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs">Address</Label>
          <Input className="h-8 text-sm" value={person.address ?? ""} onChange={e => onChange({ ...person, address: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Date of Birth</Label>
          <Input className="h-8 text-sm" type="date" value={person.dob ?? ""} onChange={e => onChange({ ...person, dob: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input className="h-8 text-sm" value={person.email ?? ""} onChange={e => onChange({ ...person, email: e.target.value })} />
        </div>
        {showShare && (
          <div>
            <Label className="text-xs">Share / Proportion</Label>
            <Input className="h-8 text-sm" value={person.share ?? ""} onChange={e => onChange({ ...person, share: e.target.value })} placeholder="e.g. 50%, equally" />
          </div>
        )}
        <div className={showShare ? "" : "col-span-2"}>
          <Label className="text-xs">Notes</Label>
          <Input className="h-8 text-sm" value={person.notes ?? ""} onChange={e => onChange({ ...person, notes: e.target.value })} />
        </div>
      </CardContent>
    </Card>
  );
}

function PersonListEditor({
  people,
  onChange,
  showShare = false,
  label = "Person",
  addLabel = "Add Person",
  showGenesisButton = false,
}: {
  people: PersonEntry[];
  onChange: (people: PersonEntry[]) => void;
  showShare?: boolean;
  label?: string;
  addLabel?: string;
  showGenesisButton?: boolean;
}) {
  return (
    <div className="space-y-2">
      {people.map((p, i) => (
        <PersonEditor
          key={i}
          person={p}
          label={`${label} ${i + 1}`}
          showShare={showShare}
          onChange={updated => {
            const next = [...people];
            next[i] = updated;
            onChange(next);
          }}
          onRemove={() => onChange(people.filter((_, idx) => idx !== i))}
        />
      ))}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => onChange([...people, emptyPerson()])}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          {addLabel}
        </Button>
        {showGenesisButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => onChange([...people, { ...GENESIS_COMPANY }])}
          >
            <Building2 className="h-3.5 w-3.5 mr-1" />
            Appoint Genesis Wills Ltd
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── PPT Clause Editor ────────────────────────────────────────────────────────

function PPTClauseEditor({
  clause,
  index,
  onChange,
  onRemove,
}: {
  clause: PPTClause;
  index: number;
  onChange: (c: PPTClause) => void;
  onRemove: () => void;
}) {
  const triggers = clause.terminationTriggers ?? {};

  return (
    <Card className="border-2 border-emerald-200 bg-emerald-50/30">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">PPT #{index + 1}</Badge>
          <span className="text-sm font-medium">{clause.propertyAddress || "Property address not set"}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold">Property Address</Label>
          <Input
            className="h-8 text-sm mt-1"
            value={clause.propertyAddress ?? ""}
            onChange={e => onChange({ ...clause, propertyAddress: e.target.value })}
            placeholder="Full address of the trust property"
          />
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-2 block">Trustees</Label>
          <PersonListEditor
            people={clause.trustees ?? []}
            onChange={trustees => onChange({ ...clause, trustees })}
            label="Trustee"
            addLabel="Add Trustee"
            showGenesisButton
          />
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-2 block">Life Tenant(s)</Label>
          <p className="text-xs text-muted-foreground mb-2">The person(s) with the right to reside in the property during the trust period.</p>
          <PersonListEditor
            people={clause.lifeTenants ?? []}
            onChange={lifeTenants => onChange({ ...clause, lifeTenants })}
            label="Life Tenant"
            addLabel="Add Life Tenant"
          />
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-2 block">Trust Period — Termination Triggers</Label>
          <p className="text-xs text-muted-foreground mb-3">The life tenant's interest will terminate upon the first to occur of the following selected events:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id={`ppt-${index}-death`}
                checked={triggers.onDeath ?? true}
                onCheckedChange={v => onChange({ ...clause, terminationTriggers: { ...triggers, onDeath: !!v } })}
              />
              <label htmlFor={`ppt-${index}-death`} className="text-sm cursor-pointer">
                <span className="font-medium">Death</span> — upon the death of the life tenant(s)
              </label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id={`ppt-${index}-remarriage`}
                checked={triggers.onRemarriageOrCohabitation ?? false}
                onCheckedChange={v => onChange({ ...clause, terminationTriggers: { ...triggers, onRemarriageOrCohabitation: !!v } })}
              />
              <label htmlFor={`ppt-${index}-remarriage`} className="text-sm cursor-pointer">
                <span className="font-medium">Remarriage or cohabitation</span> — if the life tenant remarries, enters a civil partnership, or begins cohabiting with another person
              </label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id={`ppt-${index}-ceasing`}
                checked={triggers.onCeasingToReside ?? false}
                onCheckedChange={v => onChange({ ...clause, terminationTriggers: { ...triggers, onCeasingToReside: !!v } })}
              />
              <label htmlFor={`ppt-${index}-ceasing`} className="text-sm cursor-pointer">
                <span className="font-medium">Ceasing to reside</span> — if the life tenant ceases to permanently reside in the property for a continuous period (e.g. moves into long-term care or vacates permanently)
              </label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id={`ppt-${index}-breach`}
                checked={triggers.onBreachOfConditions ?? false}
                onCheckedChange={v => onChange({ ...clause, terminationTriggers: { ...triggers, onBreachOfConditions: !!v } })}
              />
              <label htmlFor={`ppt-${index}-breach`} className="text-sm cursor-pointer">
                <span className="font-medium">Breach of conditions</span> — if the life tenant fails to comply with the conditions of the trust (keeping the property insured, repaired, and paying all outgoings)
              </label>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold">Additional Trust Period Notes</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.trustPeriodNotes ?? ""}
            onChange={e => onChange({ ...clause, trustPeriodNotes: e.target.value })}
            placeholder="Any additional conditions or notes regarding the trust period..."
          />
        </div>

        <Separator />

        <div>
          <Label className="text-xs font-semibold mb-2 block">Ultimate Beneficiaries</Label>
          <p className="text-xs text-muted-foreground mb-2">Upon termination of the trust period, the property (or proceeds of sale) shall be distributed to these beneficiaries in the shares specified.</p>
          <PersonListEditor
            people={clause.ultimateBeneficiaries ?? []}
            onChange={ultimateBeneficiaries => onChange({ ...clause, ultimateBeneficiaries })}
            label="Beneficiary"
            addLabel="Add Ultimate Beneficiary"
            showShare
          />
        </div>

        <div>
          <Label className="text-xs font-semibold">Additional Notes</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.notes ?? ""}
            onChange={e => onChange({ ...clause, notes: e.target.value })}
            placeholder="Any additional instructions for this PPT..."
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Discretionary Trust Editor ───────────────────────────────────────────────

function DiscretionaryTrustEditor({
  clause,
  index,
  onChange,
  onRemove,
}: {
  clause: DiscretionaryTrustClause;
  index: number;
  onChange: (c: DiscretionaryTrustClause) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Discretionary Trust #{index + 1}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-2 block">Trustees</Label>
          <PersonListEditor
            people={clause.trustees ?? []}
            onChange={trustees => onChange({ ...clause, trustees })}
            label="Trustee"
            addLabel="Add Trustee"
            showGenesisButton
          />
        </div>
        <Separator />
        <div>
          <Label className="text-xs font-semibold">Beneficiary Class</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.beneficiaryClass ?? ""}
            onChange={e => onChange({ ...clause, beneficiaryClass: e.target.value })}
            placeholder="e.g. my children and remoter issue and such other persons as my Trustees shall in their absolute discretion determine"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold mb-2 block">Additional Named Beneficiaries</Label>
          <PersonListEditor
            people={clause.additionalBeneficiaries ?? []}
            onChange={additionalBeneficiaries => onChange({ ...clause, additionalBeneficiaries })}
            label="Beneficiary"
            addLabel="Add Beneficiary"
            showShare
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Termination / Additional Notes</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.terminationNotes ?? ""}
            onChange={e => onChange({ ...clause, terminationNotes: e.target.value })}
            placeholder="Any special termination conditions or notes..."
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Additional Notes</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.notes ?? ""}
            onChange={e => onChange({ ...clause, notes: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Vulnerable Person's Trust Editor ────────────────────────────────────────

function VulnerableTrustEditor({
  clause,
  index,
  onChange,
  onRemove,
}: {
  clause: VulnerableTrustClause;
  index: number;
  onChange: (c: VulnerableTrustClause) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-2 border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">Vulnerable Person's Trust #{index + 1}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-2 block">Vulnerable Beneficiary</Label>
          {clause.vulnerableBeneficiary ? (
            <PersonEditor
              person={clause.vulnerableBeneficiary}
              label="Vulnerable Beneficiary"
              onChange={p => onChange({ ...clause, vulnerableBeneficiary: p })}
              onRemove={() => onChange({ ...clause, vulnerableBeneficiary: undefined })}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onChange({ ...clause, vulnerableBeneficiary: emptyPerson() })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Vulnerable Beneficiary
            </Button>
          )}
        </div>
        <Separator />
        <div>
          <Label className="text-xs font-semibold mb-2 block">Trustees</Label>
          <PersonListEditor
            people={clause.trustees ?? []}
            onChange={trustees => onChange({ ...clause, trustees })}
            label="Trustee"
            addLabel="Add Trustee"
            showGenesisButton
          />
        </div>
        <Separator />
        <div>
          <Label className="text-xs font-semibold mb-2 block">Ultimate Beneficiaries (on death of vulnerable beneficiary)</Label>
          <PersonListEditor
            people={clause.ultimateBeneficiaries ?? []}
            onChange={ultimateBeneficiaries => onChange({ ...clause, ultimateBeneficiaries })}
            label="Beneficiary"
            addLabel="Add Ultimate Beneficiary"
            showShare
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Additional Notes</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.notes ?? ""}
            onChange={e => onChange({ ...clause, notes: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Nil-Rate Band Trust Editor ───────────────────────────────────────────────

function NilRateBandEditor({
  clause,
  index,
  onChange,
  onRemove,
}: {
  clause: NilRateBandClause;
  index: number;
  onChange: (c: NilRateBandClause) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-2 border-orange-200 bg-orange-50/30">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Nil-Rate Band Trust #{index + 1}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-2 block">Trustees</Label>
          <PersonListEditor
            people={clause.trustees ?? []}
            onChange={trustees => onChange({ ...clause, trustees })}
            label="Trustee"
            addLabel="Add Trustee"
            showGenesisButton
          />
        </div>
        <Separator />
        <div>
          <Label className="text-xs font-semibold mb-2 block">Beneficiaries</Label>
          <PersonListEditor
            people={clause.beneficiaries ?? []}
            onChange={beneficiaries => onChange({ ...clause, beneficiaries })}
            label="Beneficiary"
            addLabel="Add Beneficiary"
            showShare
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Additional Notes</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.notes ?? ""}
            onChange={e => onChange({ ...clause, notes: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Bereaved Minor Trust Editor ──────────────────────────────────────────────

function BereavedMinorEditor({
  clause,
  index,
  onChange,
  onRemove,
}: {
  clause: BereavedMinorClause;
  index: number;
  onChange: (c: BereavedMinorClause) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-2 border-teal-200 bg-teal-50/30">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs">Bereaved Minor Trust #{index + 1}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-2 block">Beneficiary (the bereaved minor)</Label>
          {clause.beneficiary ? (
            <PersonEditor
              person={clause.beneficiary}
              label="Bereaved Minor"
              onChange={p => onChange({ ...clause, beneficiary: p })}
              onRemove={() => onChange({ ...clause, beneficiary: undefined })}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onChange({ ...clause, beneficiary: emptyPerson() })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Beneficiary
            </Button>
          )}
        </div>
        <Separator />
        <div>
          <Label className="text-xs font-semibold mb-2 block">Trustees</Label>
          <PersonListEditor
            people={clause.trustees ?? []}
            onChange={trustees => onChange({ ...clause, trustees })}
            label="Trustee"
            addLabel="Add Trustee"
            showGenesisButton
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Age of Absolute Entitlement</Label>
          <Input
            className="h-8 text-sm mt-1"
            value={clause.ageOfAbsoluteEntitlement ?? "18"}
            onChange={e => onChange({ ...clause, ageOfAbsoluteEntitlement: e.target.value })}
            placeholder="18"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Additional Notes</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.notes ?? ""}
            onChange={e => onChange({ ...clause, notes: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 18-to-25 Trust Editor ────────────────────────────────────────────────────

function Age18To25Editor({
  clause,
  index,
  onChange,
  onRemove,
}: {
  clause: Age18To25Clause;
  index: number;
  onChange: (c: Age18To25Clause) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-2 border-indigo-200 bg-indigo-50/30">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs">18-to-25 Trust #{index + 1}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-2 block">Beneficiary</Label>
          {clause.beneficiary ? (
            <PersonEditor
              person={clause.beneficiary}
              label="Beneficiary"
              onChange={p => onChange({ ...clause, beneficiary: p })}
              onRemove={() => onChange({ ...clause, beneficiary: undefined })}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onChange({ ...clause, beneficiary: emptyPerson() })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Beneficiary
            </Button>
          )}
        </div>
        <Separator />
        <div>
          <Label className="text-xs font-semibold mb-2 block">Trustees</Label>
          <PersonListEditor
            people={clause.trustees ?? []}
            onChange={trustees => onChange({ ...clause, trustees })}
            label="Trustee"
            addLabel="Add Trustee"
            showGenesisButton
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Age of Absolute Entitlement (max 25)</Label>
          <Input
            className="h-8 text-sm mt-1"
            value={clause.ageOfAbsoluteEntitlement ?? "25"}
            onChange={e => onChange({ ...clause, ageOfAbsoluteEntitlement: e.target.value })}
            placeholder="25"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Additional Notes</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.notes ?? ""}
            onChange={e => onChange({ ...clause, notes: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Business Property Relief Editor ─────────────────────────────────────────

function BusinessPropertyReliefEditor({
  clause,
  index,
  onChange,
  onRemove,
}: {
  clause: BusinessPropertyReliefClause;
  index: number;
  onChange: (c: BusinessPropertyReliefClause) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="border-2 border-rose-200 bg-rose-50/30">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-xs">Business Property Relief #{index + 1}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div>
          <Label className="text-xs font-semibold">Business Name / Description</Label>
          <Input
            className="h-8 text-sm mt-1"
            value={clause.businessName ?? ""}
            onChange={e => onChange({ ...clause, businessName: e.target.value })}
            placeholder="e.g. Smith & Co Ltd"
          />
        </div>
        <Separator />
        <div>
          <Label className="text-xs font-semibold mb-2 block">Trustees</Label>
          <PersonListEditor
            people={clause.trustees ?? []}
            onChange={trustees => onChange({ ...clause, trustees })}
            label="Trustee"
            addLabel="Add Trustee"
            showGenesisButton
          />
        </div>
        <Separator />
        <div>
          <Label className="text-xs font-semibold mb-2 block">Beneficiaries</Label>
          <PersonListEditor
            people={clause.beneficiaries ?? []}
            onChange={beneficiaries => onChange({ ...clause, beneficiaries })}
            label="Beneficiary"
            addLabel="Add Beneficiary"
            showShare
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Additional Notes</Label>
          <Textarea
            className="text-sm mt-1 min-h-[60px]"
            value={clause.notes ?? ""}
            onChange={e => onChange({ ...clause, notes: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OptionalClausesEditor({
  data,
  onChange,
}: {
  data: OptionalClausesData;
  onChange: (data: OptionalClausesData) => void;
}) {
  const ppts = data.protectivePropertyTrusts ?? [];
  const dts = data.discretionaryTrusts ?? [];
  const vpts = data.vulnerablePersonTrusts ?? [];
  const nrbs = data.nilRateBandTrusts ?? [];
  const bms = data.bereavedMinorTrusts ?? [];
  const a1825s = data.age18To25Trusts ?? [];
  const bprs = data.businessPropertyReliefs ?? [];

  const totalClauses = ppts.length + dts.length + vpts.length + nrbs.length + bms.length + a1825s.length + bprs.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Optional Trust Clauses</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add one or more optional clauses. Each clause generates a distinct, separate section in the Will.
          </p>
        </div>
        {totalClauses > 0 && (
          <Badge variant="secondary">{totalClauses} clause{totalClauses !== 1 ? "s" : ""}</Badge>
        )}
      </div>

      <Accordion type="multiple" className="space-y-2">

        {/* ── Protective Property Trust ─────────────────────────────────────── */}
        <AccordionItem value="ppt" className="border rounded-lg px-3">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Protective Property Trust (PPT)</span>
              {ppts.length > 0 && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">{ppts.length}</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Protects the testator's share of the property for remainder beneficiaries whilst providing security of occupation for the surviving spouse or civil partner.
            </p>
            {ppts.map((clause, i) => (
              <PPTClauseEditor
                key={i}
                clause={clause}
                index={i}
                onChange={updated => {
                  const next = [...ppts];
                  next[i] = updated;
                  onChange({ ...data, protectivePropertyTrusts: next });
                }}
                onRemove={() => onChange({ ...data, protectivePropertyTrusts: ppts.filter((_, idx) => idx !== i) })}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => onChange({
                ...data,
                protectivePropertyTrusts: [...ppts, {
                  terminationTriggers: { onDeath: true, onRemarriageOrCohabitation: true },
                }],
              })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Protective Property Trust
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* ── Discretionary Trust ───────────────────────────────────────────── */}
        <AccordionItem value="dt" className="border rounded-lg px-3">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Discretionary Trust</span>
              {dts.length > 0 && <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">{dts.length}</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Trustees hold the fund and distribute income and capital at their discretion among a defined class of beneficiaries.
            </p>
            {dts.map((clause, i) => (
              <DiscretionaryTrustEditor
                key={i}
                clause={clause}
                index={i}
                onChange={updated => {
                  const next = [...dts];
                  next[i] = updated;
                  onChange({ ...data, discretionaryTrusts: next });
                }}
                onRemove={() => onChange({ ...data, discretionaryTrusts: dts.filter((_, idx) => idx !== i) })}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => onChange({ ...data, discretionaryTrusts: [...dts, {}] })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Discretionary Trust
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* ── Vulnerable Person's Trust ─────────────────────────────────────── */}
        <AccordionItem value="vpt" className="border rounded-lg px-3">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Vulnerable Person's Trust</span>
              {vpts.length > 0 && <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">{vpts.length}</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Qualifies as a Vulnerable Beneficiary Trust under Finance Act 2005, providing tax advantages for a beneficiary with a disability or vulnerability.
            </p>
            {vpts.map((clause, i) => (
              <VulnerableTrustEditor
                key={i}
                clause={clause}
                index={i}
                onChange={updated => {
                  const next = [...vpts];
                  next[i] = updated;
                  onChange({ ...data, vulnerablePersonTrusts: next });
                }}
                onRemove={() => onChange({ ...data, vulnerablePersonTrusts: vpts.filter((_, idx) => idx !== i) })}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={() => onChange({ ...data, vulnerablePersonTrusts: [...vpts, {}] })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Vulnerable Person's Trust
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* ── Nil-Rate Band Trust ───────────────────────────────────────────── */}
        <AccordionItem value="nrb" className="border rounded-lg px-3">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Nil-Rate Band Trust</span>
              {nrbs.length > 0 && <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">{nrbs.length}</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Utilises the testator's inheritance tax nil-rate band by placing assets up to the threshold into a discretionary trust for the benefit of named beneficiaries.
            </p>
            {nrbs.map((clause, i) => (
              <NilRateBandEditor
                key={i}
                clause={clause}
                index={i}
                onChange={updated => {
                  const next = [...nrbs];
                  next[i] = updated;
                  onChange({ ...data, nilRateBandTrusts: next });
                }}
                onRemove={() => onChange({ ...data, nilRateBandTrusts: nrbs.filter((_, idx) => idx !== i) })}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => onChange({ ...data, nilRateBandTrusts: [...nrbs, {}] })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Nil-Rate Band Trust
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* ── Bereaved Minor Trust ──────────────────────────────────────────── */}
        <AccordionItem value="bm" className="border rounded-lg px-3">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Bereaved Minor Trust (s.71A IHTA 1984)</span>
              {bms.length > 0 && <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs">{bms.length}</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              For bereaved minors who will become absolutely entitled to the trust fund at age 18. Qualifies for IHT exemption under s.71A IHTA 1984.
            </p>
            {bms.map((clause, i) => (
              <BereavedMinorEditor
                key={i}
                clause={clause}
                index={i}
                onChange={updated => {
                  const next = [...bms];
                  next[i] = updated;
                  onChange({ ...data, bereavedMinorTrusts: next });
                }}
                onRemove={() => onChange({ ...data, bereavedMinorTrusts: bms.filter((_, idx) => idx !== i) })}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-teal-300 text-teal-700 hover:bg-teal-50"
              onClick={() => onChange({ ...data, bereavedMinorTrusts: [...bms, { ageOfAbsoluteEntitlement: "18" }] })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Bereaved Minor Trust
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* ── 18-to-25 Trust ────────────────────────────────────────────────── */}
        <AccordionItem value="a1825" className="border rounded-lg px-3">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">18-to-25 Trust (s.71D IHTA 1984)</span>
              {a1825s.length > 0 && <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs">{a1825s.length}</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              For bereaved young people who will become absolutely entitled between ages 18 and 25. Qualifies for partial IHT relief under s.71D IHTA 1984.
            </p>
            {a1825s.map((clause, i) => (
              <Age18To25Editor
                key={i}
                clause={clause}
                index={i}
                onChange={updated => {
                  const next = [...a1825s];
                  next[i] = updated;
                  onChange({ ...data, age18To25Trusts: next });
                }}
                onRemove={() => onChange({ ...data, age18To25Trusts: a1825s.filter((_, idx) => idx !== i) })}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              onClick={() => onChange({ ...data, age18To25Trusts: [...a1825s, { ageOfAbsoluteEntitlement: "25" }] })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add 18-to-25 Trust
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* ── Business Property Relief ──────────────────────────────────────── */}
        <AccordionItem value="bpr" className="border rounded-lg px-3">
          <AccordionTrigger className="py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Business Property Relief (BPR) Trust</span>
              {bprs.length > 0 && <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-xs">{bprs.length}</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Preserves Business Property Relief by directing qualifying business assets into a trust, preventing the relief from being lost on a straightforward gift to a surviving spouse.
            </p>
            {bprs.map((clause, i) => (
              <BusinessPropertyReliefEditor
                key={i}
                clause={clause}
                index={i}
                onChange={updated => {
                  const next = [...bprs];
                  next[i] = updated;
                  onChange({ ...data, businessPropertyReliefs: next });
                }}
                onRemove={() => onChange({ ...data, businessPropertyReliefs: bprs.filter((_, idx) => idx !== i) })}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-rose-300 text-rose-700 hover:bg-rose-50"
              onClick={() => onChange({ ...data, businessPropertyReliefs: [...bprs, {}] })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Business Property Relief Trust
            </Button>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
