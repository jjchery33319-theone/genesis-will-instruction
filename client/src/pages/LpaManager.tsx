import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, UserPlus, Building2, ChevronDown, ChevronUp, Save, FileText, CheckCircle, Download, Copy, Users } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface LpaPerson {
  title?: string;
  firstNames?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  postcode?: string;
  email?: string;
  isTrustCorporation?: boolean;
}

interface NotifyPerson {
  title?: string;
  firstNames?: string;
  lastName?: string;
  address?: string;
  postcode?: string;
}

interface LpaFormData {
  lpaType: "property_finance" | "health_welfare";
  clientNumber: number;
  donorTitle?: string;
  donorFirstNames?: string;
  donorLastName?: string;
  donorOtherNames?: string;
  donorDob?: string;
  donorAddress?: string;
  donorPostcode?: string;
  donorEmail?: string;
  attorneys: LpaPerson[];
  replacementAttorneys: LpaPerson[];
  attorneyDecisionType?: string;
  attorneyDecisionDetails?: string;
  replacementDecisionDetails?: string;
  certProviderTitle?: string;
  certProviderFirstNames?: string;
  certProviderLastName?: string;
  certProviderAddress?: string;
  certProviderPostcode?: string;
  certProviderEmail?: string;
  peopleToNotify: NotifyPerson[];
  lifeSustainingTreatment?: string;
  whenAttorneysCanAct?: string;
  preferences?: string;
  instructions?: string;
  status?: "draft" | "complete";
}

const GENESIS_COMPANY: LpaPerson = {
  title: "",
  firstNames: "Genesis Wills and Estate Planning Ltd",
  lastName: "",
  dob: "",
  address: "",
  postcode: "",
  email: "office@genesisestateplanning.info",
  isTrustCorporation: true,
};

const emptyPerson = (): LpaPerson => ({ title: "", firstNames: "", lastName: "", dob: "", address: "", postcode: "", email: "" });
const emptyNotify = (): NotifyPerson => ({ title: "", firstNames: "", lastName: "", address: "", postcode: "" });

// ── Person card component ─────────────────────────────────────────────────────
function PersonCard({
  person,
  index,
  onChange,
  onRemove,
  showDob = true,
  showEmail = true,
  label,
}: {
  person: LpaPerson | NotifyPerson;
  index: number;
  onChange: (idx: number, updated: LpaPerson | NotifyPerson) => void;
  onRemove: (idx: number) => void;
  showDob?: boolean;
  showEmail?: boolean;
  label: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const p = person as LpaPerson;
  const displayName = [p.firstNames, p.lastName].filter(Boolean).join(" ") || `${label} ${index + 1}`;

  return (
    <Card className="border border-border/60">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {p.isTrustCorporation && <Building2 className="w-4 h-4 text-primary" />}
            <span className="font-medium text-sm">{displayName}</span>
            {p.isTrustCorporation && <Badge variant="secondary" className="text-xs">Trust Corporation</Badge>}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onRemove(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 pb-4 px-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={p.title ?? ""} onChange={e => onChange(index, { ...person, title: e.target.value })} placeholder="Mr/Mrs/Ms/Dr" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">First Names</Label>
              <Input value={p.firstNames ?? ""} onChange={e => onChange(index, { ...person, firstNames: e.target.value })} className="h-8 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Last Name {p.isTrustCorporation ? "(or Trust Corporation Name)" : ""}</Label>
            <Input value={p.lastName ?? ""} onChange={e => onChange(index, { ...person, lastName: e.target.value })} className="h-8 text-sm" />
          </div>
          {showDob && (
            <div>
              <Label className="text-xs">Date of Birth</Label>
              <Input value={(p as LpaPerson).dob ?? ""} onChange={e => onChange(index, { ...person, dob: e.target.value })} placeholder="DD/MM/YYYY" className="h-8 text-sm" />
            </div>
          )}
          <div>
            <Label className="text-xs">Address</Label>
            <Textarea value={p.address ?? ""} onChange={e => onChange(index, { ...person, address: e.target.value })} rows={2} className="text-sm resize-none" />
          </div>
          <div>
            <Label className="text-xs">Postcode</Label>
            <Input value={p.postcode ?? ""} onChange={e => onChange(index, { ...person, postcode: e.target.value })} className="h-8 text-sm w-40" />
          </div>
          {showEmail && (
            <div>
              <Label className="text-xs">Email (optional)</Label>
              <Input value={(p as LpaPerson).email ?? ""} onChange={e => onChange(index, { ...person, email: e.target.value })} className="h-8 text-sm" />
            </div>
          )}
          {showDob && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`tc-${index}`}
                checked={(p as LpaPerson).isTrustCorporation ?? false}
                onChange={e => onChange(index, { ...person, isTrustCorporation: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor={`tc-${index}`} className="text-xs cursor-pointer">This attorney is a trust corporation</Label>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── People list editor ────────────────────────────────────────────────────────
function PeopleList({
  people,
  onChange,
  label,
  showDob = true,
  showEmail = true,
  suggestedPeople,
  showGenesisButton = false,
}: {
  people: (LpaPerson | NotifyPerson)[];
  onChange: (updated: (LpaPerson | NotifyPerson)[]) => void;
  label: string;
  showDob?: boolean;
  showEmail?: boolean;
  suggestedPeople?: { name: string; person: LpaPerson }[];
  showGenesisButton?: boolean;
}) {
  const handleChange = (idx: number, updated: LpaPerson | NotifyPerson) => {
    const next = [...people];
    next[idx] = updated;
    onChange(next);
  };
  const handleRemove = (idx: number) => onChange(people.filter((_, i) => i !== idx));
  const addEmpty = () => onChange([...people, showDob ? emptyPerson() : emptyNotify()]);
  const addGenesis = () => onChange([...people, { ...GENESIS_COMPANY }]);
  const addSuggested = (p: LpaPerson) => onChange([...people, { ...p }]);

  return (
    <div className="space-y-3">
      {people.map((p, i) => (
        <PersonCard
          key={i}
          person={p}
          index={i}
          onChange={handleChange}
          onRemove={handleRemove}
          showDob={showDob}
          showEmail={showEmail}
          label={label}
        />
      ))}
      {people.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          No {label.toLowerCase()}s added yet
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={addEmpty}>
          <Plus className="w-3 h-3 mr-1" /> Add {label}
        </Button>
        {showGenesisButton && (
          <Button variant="outline" size="sm" onClick={addGenesis} className="border-primary/40 text-primary hover:bg-primary/5">
            <Building2 className="w-3 h-3 mr-1" /> Appoint Genesis Wills Ltd
          </Button>
        )}
        {suggestedPeople && suggestedPeople.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {suggestedPeople.map((s, i) => (
              <Button key={i} variant="ghost" size="sm" className="text-xs h-7 border border-border/50" onClick={() => addSuggested(s.person)}>
                <UserPlus className="w-3 h-3 mr-1" /> {s.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main LPA editor form ──────────────────────────────────────────────────────
function LpaEditorForm({
  submissionId,
  willRecord,
  existingLpa,
  lpaType,
  clientNumber,
  onSaved,
}: {
  submissionId: number;
  willRecord: any;
  existingLpa: any | null;
  lpaType: "property_finance" | "health_welfare";
  clientNumber: 1 | 2;
  onSaved: () => void;
}) {
  const safeArr = (v: unknown): any[] => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    try { return JSON.parse(v as string) ?? []; } catch { return []; }
  };

  // Build suggested people from the Will instruction
  const suggestedPeople = (() => {
    const people: { name: string; person: LpaPerson }[] = [];
    const prefix = clientNumber === 1 ? "client1" : "client2";
    const otherPrefix = clientNumber === 1 ? "client2" : "client1";

    // Partner (for mirror Wills)
    if (willRecord?.client2FirstName) {
      const partnerName = [willRecord[`${otherPrefix}FirstName`], willRecord[`${otherPrefix}LastName`]].filter(Boolean).join(" ");
      if (partnerName) {
        people.push({
          name: partnerName,
          person: {
            title: willRecord[`${otherPrefix}Prefix`] ?? "",
            firstNames: willRecord[`${otherPrefix}FirstName`] ?? "",
            lastName: willRecord[`${otherPrefix}LastName`] ?? "",
            dob: willRecord[`${otherPrefix}Dob`] ?? "",
            address: willRecord[`${otherPrefix}AddressLine1`] ?? "",
            postcode: willRecord[`${otherPrefix}Postcode`] ?? "",
            email: willRecord[`${otherPrefix}Email`] ?? "",
          },
        });
      }
    }

    // Executors
    const executors = safeArr(willRecord?.[`${prefix}Executors`]);
    executors.forEach((e: any) => {
      const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
      if (name) people.push({ name, person: { title: e.title ?? "", firstNames: e.firstName ?? "", lastName: e.lastName ?? "", dob: e.dob ?? "", address: e.address ?? "", postcode: e.postcode ?? "", email: e.email ?? "" } });
    });

    // Beneficiaries
    const beneficiaries = safeArr(willRecord?.[`${prefix}Beneficiaries`]);
    beneficiaries.forEach((b: any) => {
      const name = [b.firstName, b.lastName].filter(Boolean).join(" ");
      if (name && !people.find(p => p.name === name)) {
        people.push({ name, person: { title: b.title ?? "", firstNames: b.firstName ?? "", lastName: b.lastName ?? "", dob: b.dob ?? "", address: b.address ?? "", postcode: b.postcode ?? "", email: b.email ?? "" } });
      }
    });

    return people;
  })();

  // Donor pre-fill from will record
  const donorDefaults = {
    donorTitle: willRecord?.[`client${clientNumber}Prefix`] ?? "",
    donorFirstNames: willRecord?.[`client${clientNumber}FirstName`] ?? "",
    donorLastName: willRecord?.[`client${clientNumber}LastName`] ?? "",
    donorDob: willRecord?.[`client${clientNumber}Dob`] ?? "",
    donorAddress: willRecord?.[`client${clientNumber}AddressLine1`] ?? "",
    donorPostcode: willRecord?.[`client${clientNumber}Postcode`] ?? "",
    donorEmail: willRecord?.[`client${clientNumber}Email`] ?? "",
  };

  const [form, setForm] = useState<LpaFormData>(() => {
    if (existingLpa) {
      return {
        lpaType,
        clientNumber,
        donorTitle: existingLpa.donorTitle ?? donorDefaults.donorTitle,
        donorFirstNames: existingLpa.donorFirstNames ?? donorDefaults.donorFirstNames,
        donorLastName: existingLpa.donorLastName ?? donorDefaults.donorLastName,
        donorOtherNames: existingLpa.donorOtherNames ?? "",
        donorDob: existingLpa.donorDob ?? donorDefaults.donorDob,
        donorAddress: existingLpa.donorAddress ?? donorDefaults.donorAddress,
        donorPostcode: existingLpa.donorPostcode ?? donorDefaults.donorPostcode,
        donorEmail: existingLpa.donorEmail ?? donorDefaults.donorEmail,
        attorneys: safeArr(existingLpa.attorneys),
        replacementAttorneys: safeArr(existingLpa.replacementAttorneys),
        attorneyDecisionType: existingLpa.attorneyDecisionType ?? "",
        attorneyDecisionDetails: existingLpa.attorneyDecisionDetails ?? "",
        replacementDecisionDetails: existingLpa.replacementDecisionDetails ?? "",
        certProviderTitle: existingLpa.certProviderTitle ?? "",
        certProviderFirstNames: existingLpa.certProviderFirstNames ?? "",
        certProviderLastName: existingLpa.certProviderLastName ?? "",
        certProviderAddress: existingLpa.certProviderAddress ?? "",
        certProviderPostcode: existingLpa.certProviderPostcode ?? "",
        certProviderEmail: existingLpa.certProviderEmail ?? "",
        peopleToNotify: safeArr(existingLpa.peopleToNotify),
        lifeSustainingTreatment: existingLpa.lifeSustainingTreatment ?? "",
        whenAttorneysCanAct: existingLpa.whenAttorneysCanAct ?? "",
        preferences: existingLpa.preferences ?? "",
        instructions: existingLpa.instructions ?? "",
        status: existingLpa.status ?? "draft",
      };
    }
    return {
      lpaType,
      clientNumber,
      ...donorDefaults,
      donorOtherNames: "",
      attorneys: [],
      replacementAttorneys: [],
      attorneyDecisionType: "",
      attorneyDecisionDetails: "",
      replacementDecisionDetails: "",
      certProviderTitle: "",
      certProviderFirstNames: "",
      certProviderLastName: "",
      certProviderAddress: "",
      certProviderPostcode: "",
      certProviderEmail: "",
      peopleToNotify: [],
      lifeSustainingTreatment: "",
      whenAttorneysCanAct: "",
      preferences: "",
      instructions: "",
      status: "draft",
    };
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.lpa.create.useMutation({
    onSuccess: () => { toast.success("LPA created successfully"); utils.lpa.listBySubmission.invalidate({ willInstructionId: submissionId }); onSaved(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.lpa.update.useMutation({
    onSuccess: () => { toast.success("LPA saved successfully"); utils.lpa.listBySubmission.invalidate({ willInstructionId: submissionId }); onSaved(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSave = () => {
    const payload = {
      willInstructionId: submissionId,
      clientNumber: form.clientNumber,
      lpaType: form.lpaType,
      donorTitle: form.donorTitle,
      donorFirstNames: form.donorFirstNames,
      donorLastName: form.donorLastName,
      donorOtherNames: form.donorOtherNames,
      donorDob: form.donorDob,
      donorAddress: form.donorAddress,
      donorPostcode: form.donorPostcode,
      donorEmail: form.donorEmail,
      attorneys: form.attorneys,
      replacementAttorneys: form.replacementAttorneys,
      attorneyDecisionType: form.attorneyDecisionType as any,
      attorneyDecisionDetails: form.attorneyDecisionDetails,
      replacementDecisionDetails: form.replacementDecisionDetails,
      certProviderTitle: form.certProviderTitle,
      certProviderFirstNames: form.certProviderFirstNames,
      certProviderLastName: form.certProviderLastName,
      certProviderAddress: form.certProviderAddress,
      certProviderPostcode: form.certProviderPostcode,
      certProviderEmail: form.certProviderEmail,
      peopleToNotify: form.peopleToNotify,
      lifeSustainingTreatment: form.lifeSustainingTreatment as any,
      whenAttorneysCanAct: form.whenAttorneysCanAct as any,
      preferences: form.preferences,
      instructions: form.instructions,
      status: form.status,
    };
    if (existingLpa) {
      updateMutation.mutate({ ...payload, id: existingLpa.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const f = (field: keyof LpaFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const typeLabel = lpaType === "property_finance" ? "Property & Financial Affairs (LP1F)" : "Health & Welfare (LP1H)";
  const clientLabel = `Client ${clientNumber}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{typeLabel}</h3>
          <p className="text-sm text-muted-foreground">{clientLabel} — {existingLpa ? "Edit existing LPA" : "Create new LPA"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v as any }))}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="w-3 h-3 mr-1" />
            {isSaving ? "Saving..." : "Save LPA"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="donor">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="donor" className="text-xs">Section 1: Donor</TabsTrigger>
          <TabsTrigger value="attorneys" className="text-xs">Section 2: Attorneys</TabsTrigger>
          <TabsTrigger value="decisions" className="text-xs">Section 3: Decisions</TabsTrigger>
          <TabsTrigger value="replacements" className="text-xs">Section 4: Replacements</TabsTrigger>
          {lpaType === "health_welfare" && (
            <TabsTrigger value="lifesustaining" className="text-xs">Section 5: Life-Sustaining</TabsTrigger>
          )}
          {lpaType === "property_finance" && (
            <TabsTrigger value="whenact" className="text-xs">Section 5: When to Act</TabsTrigger>
          )}
          <TabsTrigger value="certprovider" className="text-xs">Certificate Provider</TabsTrigger>
          <TabsTrigger value="notify" className="text-xs">Section 6: Notify</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs">Section 7: Preferences</TabsTrigger>
        </TabsList>

        {/* Section 1: Donor */}
        <TabsContent value="donor" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">The donor is the person granting the power of attorney. Pre-filled from the Will instruction — edit if different.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={form.donorTitle ?? ""} onChange={f("donorTitle")} placeholder="Mr/Mrs/Ms/Dr" />
            </div>
            <div>
              <Label>First Names</Label>
              <Input value={form.donorFirstNames ?? ""} onChange={f("donorFirstNames")} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.donorLastName ?? ""} onChange={f("donorLastName")} />
            </div>
            <div>
              <Label>Any Other Names Known By (optional)</Label>
              <Input value={form.donorOtherNames ?? ""} onChange={f("donorOtherNames")} placeholder="e.g. married name" />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input value={form.donorDob ?? ""} onChange={f("donorDob")} placeholder="DD/MM/YYYY" />
            </div>
            <div>
              <Label>Email Address (optional)</Label>
              <Input value={form.donorEmail ?? ""} onChange={f("donorEmail")} />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Textarea value={form.donorAddress ?? ""} onChange={f("donorAddress")} rows={2} />
          </div>
          <div className="w-48">
            <Label>Postcode</Label>
            <Input value={form.donorPostcode ?? ""} onChange={f("donorPostcode")} />
          </div>
        </TabsContent>

        {/* Section 2: Attorneys */}
        <TabsContent value="attorneys" className="space-y-4 pt-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Appoint the people who will make decisions on the donor's behalf. You can select people already named in the Will instruction, appoint Genesis Wills Ltd, or add new people manually.
            </p>
            {lpaType === "property_finance" && (
              <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded p-2 mt-2">
                <strong>LP1F note:</strong> To appoint a trust corporation, tick the "trust corporation" checkbox on that attorney's card.
              </p>
            )}
          </div>
          <PeopleList
            people={form.attorneys}
            onChange={(updated) => setForm(prev => ({ ...prev, attorneys: updated as LpaPerson[] }))}
            label="Attorney"
            showDob={true}
            showEmail={true}
            suggestedPeople={suggestedPeople}
            showGenesisButton={true}
          />
        </TabsContent>

        {/* Section 3: How attorneys make decisions */}
        <TabsContent value="decisions" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">Choose how the attorneys should work together when making decisions.</p>
          {form.attorneys.length <= 1 ? (
            <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground">
              Only one attorney appointed — they will act alone. No decision type needed.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>How should attorneys make decisions?</Label>
                <Select value={form.attorneyDecisionType ?? ""} onValueChange={(v) => setForm(prev => ({ ...prev, attorneyDecisionType: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select decision type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jointly_severally">Jointly and severally (recommended — can act independently or together)</SelectItem>
                    <SelectItem value="jointly">Jointly (must all agree on every decision)</SelectItem>
                    <SelectItem value="jointly_some">Jointly for some decisions, jointly and severally for others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.attorneyDecisionType === "jointly_some" && (
                <div>
                  <Label>Decisions that must be made jointly</Label>
                  <Textarea
                    value={form.attorneyDecisionDetails ?? ""}
                    onChange={f("attorneyDecisionDetails")}
                    rows={4}
                    placeholder="List the specific decisions that must be made jointly and unanimously..."
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Section 4: Replacement attorneys */}
        <TabsContent value="replacements" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Replacement attorneys step in if one of the original attorneys can no longer act. This section is optional but recommended.
          </p>
          <PeopleList
            people={form.replacementAttorneys}
            onChange={(updated) => setForm(prev => ({ ...prev, replacementAttorneys: updated as LpaPerson[] }))}
            label="Replacement Attorney"
            showDob={true}
            showEmail={true}
            suggestedPeople={suggestedPeople}
            showGenesisButton={true}
          />
          {form.replacementAttorneys.length > 0 && (
            <div>
              <Label>How replacement attorneys can act (optional — leave blank for default)</Label>
              <Textarea
                value={form.replacementDecisionDetails ?? ""}
                onChange={f("replacementDecisionDetails")}
                rows={3}
                placeholder="Describe any changes to when or how replacement attorneys can act..."
              />
            </div>
          )}
        </TabsContent>

        {/* Section 5 LP1H: Life-sustaining treatment */}
        {lpaType === "health_welfare" && (
          <TabsContent value="lifesustaining" className="space-y-4 pt-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Important — Life-sustaining treatment decision</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                The donor must choose whether to give attorneys authority to consent to or refuse life-sustaining treatment on their behalf.
              </p>
            </div>
            <div className="space-y-3">
              <Label>Life-sustaining treatment authority</Label>
              <div className="space-y-2">
                {[
                  { value: "give_authority", label: "Option A — I give my attorneys authority to consent to or refuse life-sustaining treatment on my behalf" },
                  { value: "do_not_give", label: "Option B — I do NOT give my attorneys authority over life-sustaining treatment (doctors will take into account attorneys' views)" },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.lifeSustainingTreatment === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                    <input
                      type="radio"
                      name="lifeSustaining"
                      value={opt.value}
                      checked={form.lifeSustainingTreatment === opt.value}
                      onChange={() => setForm(prev => ({ ...prev, lifeSustainingTreatment: opt.value }))}
                      className="mt-0.5"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>
        )}

        {/* Section 5 LP1F: When attorneys can act */}
        {lpaType === "property_finance" && (
          <TabsContent value="whenact" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Choose when the attorneys can use this LPA to make financial decisions.
            </p>
            <div className="space-y-3">
              <Label>When can attorneys act?</Label>
              <div className="space-y-2">
                {[
                  { value: "capacity", label: "Only when I do not have mental capacity to make financial decisions myself" },
                  { value: "whenever", label: "As soon as the LPA is registered (even while I still have mental capacity)" },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.whenAttorneysCanAct === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                    <input
                      type="radio"
                      name="whenAct"
                      value={opt.value}
                      checked={form.whenAttorneysCanAct === opt.value}
                      onChange={() => setForm(prev => ({ ...prev, whenAttorneysCanAct: opt.value }))}
                      className="mt-0.5"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>
        )}

        {/* Certificate provider */}
        <TabsContent value="certprovider" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            The certificate provider confirms the donor understands the LPA and is not being pressured. They must be a professional (solicitor, doctor) or someone who has known the donor well for at least 2 years. They cannot be an attorney or replacement attorney.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={form.certProviderTitle ?? ""} onChange={f("certProviderTitle")} placeholder="Mr/Mrs/Ms/Dr" />
            </div>
            <div>
              <Label>First Names</Label>
              <Input value={form.certProviderFirstNames ?? ""} onChange={f("certProviderFirstNames")} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.certProviderLastName ?? ""} onChange={f("certProviderLastName")} />
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input value={form.certProviderEmail ?? ""} onChange={f("certProviderEmail")} />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Textarea value={form.certProviderAddress ?? ""} onChange={f("certProviderAddress")} rows={2} />
          </div>
          <div className="w-48">
            <Label>Postcode</Label>
            <Input value={form.certProviderPostcode ?? ""} onChange={f("certProviderPostcode")} />
          </div>
        </TabsContent>

        {/* Section 6: People to notify */}
        <TabsContent value="notify" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Optional. These people will be notified when the LPA is registered, giving them a chance to raise concerns. They cannot be attorneys or replacement attorneys. Maximum 5 people (up to 4 on the main form).
          </p>
          <PeopleList
            people={form.peopleToNotify}
            onChange={(updated) => setForm(prev => ({ ...prev, peopleToNotify: updated as NotifyPerson[] }))}
            label="Person to Notify"
            showDob={false}
            showEmail={false}
            suggestedPeople={suggestedPeople.map(s => ({ name: s.name, person: s.person }))}
          />
        </TabsContent>

        {/* Section 7: Preferences & instructions */}
        <TabsContent value="preferences" className="space-y-4 pt-4">
          <div>
            <Label className="text-base font-medium">Preferences (optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Attorneys don't have to follow preferences but should keep them in mind. Use words like "prefer" and "would like".</p>
            <Textarea
              value={form.preferences ?? ""}
              onChange={f("preferences")}
              rows={5}
              placeholder="e.g. I would prefer my attorneys to consult my GP before making any major health decisions..."
            />
          </div>
          <Separator />
          <div>
            <Label className="text-base font-medium">Instructions (optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Attorneys must follow instructions exactly. Use words like "must" and "have to". Legally incorrect instructions must be removed before the LPA can be registered.</p>
            <Textarea
              value={form.instructions ?? ""}
              onChange={f("instructions")}
              rows={5}
              placeholder="e.g. My attorneys must not sell my main residence without the agreement of all attorneys..."
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save LPA"}
        </Button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LpaManager() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const submissionId = parseInt(id ?? "0", 10);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [editingLpa, setEditingLpa] = useState<{ lpaType: "property_finance" | "health_welfare"; clientNumber: 1 | 2; existingId?: number } | null>(null);

  const { data: willRecord, isLoading: willLoading } = trpc.will.getById.useQuery(
    { id: submissionId },
    { enabled: submissionId > 0 }
  );

  const { data: lpaList, isLoading: lpaLoading, refetch: refetchLpas } = trpc.lpa.listBySubmission.useQuery(
    { willInstructionId: submissionId },
    { enabled: submissionId > 0 }
  );

  const deleteMutation = trpc.lpa.delete.useMutation({
    onSuccess: () => { toast.success("LPA deleted"); refetchLpas(); },
    onError: (e) => toast.error(e.message),
  });

  const createMutation = trpc.lpa.create.useMutation({
    onSuccess: () => { toast.success("LPA duplicated successfully"); refetchLpas(); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.lpa.update.useMutation({
    onSuccess: () => { toast.success("LPA duplicated successfully"); refetchLpas(); },
    onError: (e) => toast.error(e.message),
  });

  const isDuplicating = createMutation.isPending || updateMutation.isPending;

  /** Copy all shared fields from a source LPA into a target LPA type/client, preserving type-specific fields */
  const duplicateLpa = (source: any, targetLpaType: "property_finance" | "health_welfare", targetClientNumber: 1 | 2) => {
    const safeArr = (v: unknown): any[] => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      try { return JSON.parse(v as string) ?? []; } catch { return []; }
    };
    const targetDonorDefaults = (() => {
      const r = willRecord as any;
      return {
        donorTitle: r?.[`client${targetClientNumber}Prefix`] ?? "",
        donorFirstNames: r?.[`client${targetClientNumber}FirstName`] ?? "",
        donorLastName: r?.[`client${targetClientNumber}LastName`] ?? "",
        donorDob: r?.[`client${targetClientNumber}Dob`] ?? "",
        donorAddress: r?.[`client${targetClientNumber}AddressLine1`] ?? "",
        donorPostcode: r?.[`client${targetClientNumber}Postcode`] ?? "",
        donorEmail: r?.[`client${targetClientNumber}Email`] ?? "",
      };
    })();

    // When mirroring to another client, use that client's donor details
    const isMirrorClient = targetClientNumber !== source.clientNumber;
    const payload = {
      willInstructionId: submissionId,
      lpaType: targetLpaType,
      clientNumber: targetClientNumber,
      // Donor: use target client's details when mirroring to other client
      donorTitle: isMirrorClient ? targetDonorDefaults.donorTitle : (source.donorTitle ?? ""),
      donorFirstNames: isMirrorClient ? targetDonorDefaults.donorFirstNames : (source.donorFirstNames ?? ""),
      donorLastName: isMirrorClient ? targetDonorDefaults.donorLastName : (source.donorLastName ?? ""),
      donorOtherNames: isMirrorClient ? "" : (source.donorOtherNames ?? ""),
      donorDob: isMirrorClient ? targetDonorDefaults.donorDob : (source.donorDob ?? ""),
      donorAddress: isMirrorClient ? targetDonorDefaults.donorAddress : (source.donorAddress ?? ""),
      donorPostcode: isMirrorClient ? targetDonorDefaults.donorPostcode : (source.donorPostcode ?? ""),
      donorEmail: isMirrorClient ? targetDonorDefaults.donorEmail : (source.donorEmail ?? ""),
      // Shared attorney/decision fields
      attorneys: safeArr(source.attorneys),
      replacementAttorneys: safeArr(source.replacementAttorneys),
      attorneyDecisionType: source.attorneyDecisionType ?? "",
      attorneyDecisionDetails: source.attorneyDecisionDetails ?? "",
      replacementDecisionDetails: source.replacementDecisionDetails ?? "",
      certProviderTitle: source.certProviderTitle ?? "",
      certProviderFirstNames: source.certProviderFirstNames ?? "",
      certProviderLastName: source.certProviderLastName ?? "",
      certProviderAddress: source.certProviderAddress ?? "",
      certProviderPostcode: source.certProviderPostcode ?? "",
      certProviderEmail: source.certProviderEmail ?? "",
      peopleToNotify: safeArr(source.peopleToNotify),
      preferences: source.preferences ?? "",
      instructions: source.instructions ?? "",
      status: "draft" as const,
      // Type-specific fields: only copy if same type, otherwise clear
      whenAttorneysCanAct: targetLpaType === "property_finance" ? (source.whenAttorneysCanAct ?? "") : "",
      lifeSustainingTreatment: targetLpaType === "health_welfare" ? (source.lifeSustainingTreatment ?? "") : "",
    };

    const existing = getLpaForClient(targetLpaType, targetClientNumber);
    if (existing) {
      if (!confirm(`This will overwrite the existing ${targetLpaType === "property_finance" ? "Property & Finance" : "Health & Welfare"} LPA for ${clientName(targetClientNumber)}. Continue?`)) return;
      updateMutation.mutate({ ...payload, id: existing.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center text-muted-foreground">Admin access required</div>;
  }

  if (willLoading || lpaLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  const clientName = (n: 1 | 2) => {
    const r = willRecord as any;
    return [r?.[`client${n}FirstName`], r?.[`client${n}LastName`]].filter(Boolean).join(" ") || `Client ${n}`;
  };

  const hasClient2 = !!(willRecord as any)?.client2FirstName;

  const getLpaForClient = (lpaType: "property_finance" | "health_welfare", clientNumber: 1 | 2) =>
    lpaList?.find((l: any) => l.lpaType === lpaType && l.clientNumber === clientNumber);

  const lpaTypeLabel = (t: string) => t === "property_finance" ? "Property & Finance (LP1F)" : "Health & Welfare (LP1H)";

  // If editing, show the editor
  if (editingLpa) {
    const existing = editingLpa.existingId ? lpaList?.find((l: any) => l.id === editingLpa.existingId) : null;
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => setEditingLpa(null)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to LPA Overview
          </Button>
          <LpaEditorForm
            submissionId={submissionId}
            willRecord={willRecord}
            existingLpa={existing ?? null}
            lpaType={editingLpa.lpaType}
            clientNumber={editingLpa.clientNumber}
            onSaved={() => { refetchLpas(); setEditingLpa(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/submissions/${submissionId}`)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Submission
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Lasting Powers of Attorney</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submission #{submissionId} — {clientName(1)}{hasClient2 ? ` & ${clientName(2)}` : ""}
          </p>
        </div>

        {/* LPA grid */}
        <div className="grid gap-4">
          {(["property_finance", "health_welfare"] as const).map(lpaType => (
            <Card key={lpaType}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {lpaTypeLabel(lpaType)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid gap-4 ${hasClient2 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {([1, 2] as const).filter(n => n === 1 || hasClient2).map(clientNum => {
                    const existing = getLpaForClient(lpaType, clientNum);
                    return (
                      <div key={clientNum} className="border border-border/60 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{clientName(clientNum)}</p>
                            <p className="text-xs text-muted-foreground">Client {clientNum}</p>
                          </div>
                          {existing ? (
                            <Badge variant={existing.status === "complete" ? "default" : "secondary"} className="text-xs">
                              {existing.status === "complete" ? <><CheckCircle className="w-3 h-3 mr-1" />Complete</> : "Draft"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">Not started</Badge>
                          )}
                        </div>
                        {existing && (
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>Attorneys: {Array.isArray(existing.attorneys) ? existing.attorneys.length : 0}</p>
                            <p>Replacements: {Array.isArray(existing.replacementAttorneys) ? existing.replacementAttorneys.length : 0}</p>
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant={existing ? "outline" : "default"}
                            className="flex-1 text-xs"
                            onClick={() => setEditingLpa({ lpaType, clientNumber: clientNum, existingId: existing?.id })}
                          >
                            {existing ? "Edit LPA" : "Create LPA"}
                          </Button>
                          {existing && (
                            <a href={`/api/lpa/${existing.id}/pdf`} download>
                              <Button size="sm" variant="outline" className="text-xs gap-1">
                                <Download className="w-3 h-3" /> PDF
                              </Button>
                            </a>
                          )}
                          {/* Copy LP1F → LP1H (or LP1H → LP1F) for same client */}
                          {existing && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1"
                              disabled={isDuplicating}
                              title={lpaType === "property_finance" ? "Copy attorneys & details to Health & Welfare LPA" : "Copy attorneys & details to Property & Finance LPA"}
                              onClick={() => duplicateLpa(existing, lpaType === "property_finance" ? "health_welfare" : "property_finance", clientNum)}
                            >
                              <Copy className="w-3 h-3" />
                              {lpaType === "property_finance" ? "→ H&W" : "→ P&F"}
                            </Button>
                          )}
                          {/* Mirror to other client (only shown when there is a Client 2) */}
                          {existing && hasClient2 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1"
                              disabled={isDuplicating}
                              title={`Mirror this LPA to ${clientName(clientNum === 1 ? 2 : 1)}`}
                              onClick={() => duplicateLpa(existing, lpaType, clientNum === 1 ? 2 : 1)}
                            >
                              <Users className="w-3 h-3" />
                              Mirror → {clientNum === 1 ? "Client 2" : "Client 1"}
                            </Button>
                          )}
                          {existing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive text-xs"
                              onClick={() => {
                                if (confirm("Delete this LPA record?")) deleteMutation.mutate({ id: existing.id });
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary of all LPAs */}
        {lpaList && lpaList.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">All LPA Records for This Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lpaList.map((lpa: any) => (
                  <div key={lpa.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div className="text-sm">
                      <span className="font-medium">{lpaTypeLabel(lpa.lpaType)}</span>
                      <span className="text-muted-foreground ml-2">— {clientName(lpa.clientNumber as 1 | 2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={lpa.status === "complete" ? "default" : "secondary"} className="text-xs">
                        {lpa.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(lpa.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
