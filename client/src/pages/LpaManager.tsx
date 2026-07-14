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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  // Section 12
  applicantType?: string;
  // Section 13
  recipientType?: string;
  recipientTitle?: string;
  recipientFirstNames?: string;
  recipientLastName?: string;
  recipientCompany?: string;
  recipientAddressLine1?: string;
  recipientAddressLine2?: string;
  recipientAddressLine3?: string;
  recipientPostcode?: string;
  deliveryPost?: boolean;
  deliveryPhone?: boolean;
  deliveryEmail?: boolean;
  deliveryWelsh?: boolean;
  // Section 14
  feePaymentMethod?: string;
  feeContactPhone?: string;
  reducedFee?: boolean;
  repeatApplication?: boolean;
  caseNumber?: string;
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
  matterId,
  willRecord,
  matterRecord,
  existingLpa,
  lpaType,
  clientNumber,
  onSaved,
}: {
  submissionId: number;
  matterId?: number;
  willRecord: any;
  matterRecord?: any;
  existingLpa: any | null;
  lpaType: "property_finance" | "health_welfare";
  clientNumber: 1 | 2;
  onSaved: () => void;
}) {
  const isMatterMode = !!matterId;
  const safeArr = (v: unknown): any[] => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    try { return JSON.parse(v as string) ?? []; } catch { return []; }
  };

  // Build suggested people from the Will instruction (or matter)
  const suggestedPeople = (() => {
    const people: { name: string; person: LpaPerson }[] = [];

    if (isMatterMode && matterRecord) {
      // Matter mode: suggest partner and executors from matter data
      const clientRole = clientNumber === 1 ? "testator1" : "testator2";
      const otherRole = clientNumber === 1 ? "testator2" : "testator1";
      const otherClient = (matterRecord.clients ?? []).find((c: any) => c.clientRole === otherRole);
      if (otherClient?.fullName) {
        people.push({
          name: otherClient.fullName,
          person: { firstNames: otherClient.fullName, lastName: "", address: otherClient.address ?? "", email: otherClient.email ?? "", dob: otherClient.dateOfBirth ?? "" },
        });
      }
      const executors = (matterRecord.executors ?? []).filter((e: any) => e.clientRole === clientRole || e.clientRole === "shared");
      executors.forEach((e: any) => {
        if (e.fullName && !people.find(p => p.name === e.fullName)) {
          people.push({ name: e.fullName, person: { firstNames: e.fullName, lastName: "", address: e.address ?? "" } });
        }
      });
      const beneficiaries = (matterRecord.beneficiaries ?? []).filter((b: any) => b.clientRole === clientRole || b.clientRole === "shared");
      beneficiaries.forEach((b: any) => {
        if (b.fullName && !people.find(p => p.name === b.fullName)) {
          people.push({ name: b.fullName, person: { firstNames: b.fullName, lastName: "", address: b.address ?? "" } });
        }
      });
    } else {
      // Submission mode: suggest from V1 willRecord
      const prefix = clientNumber === 1 ? "client1" : "client2";
      const otherPrefix = clientNumber === 1 ? "client2" : "client1";
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
      const executors = safeArr(willRecord?.[`${prefix}Executors`]);
      executors.forEach((e: any) => {
        const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
        if (name) people.push({ name, person: { title: e.title ?? "", firstNames: e.firstName ?? "", lastName: e.lastName ?? "", dob: e.dob ?? "", address: e.address ?? "", postcode: e.postcode ?? "", email: e.email ?? "" } });
      });
      const beneficiaries = safeArr(willRecord?.[`${prefix}Beneficiaries`]);
      beneficiaries.forEach((b: any) => {
        const name = [b.firstName, b.lastName].filter(Boolean).join(" ");
        if (name && !people.find(p => p.name === name)) {
          people.push({ name, person: { title: b.title ?? "", firstNames: b.firstName ?? "", lastName: b.lastName ?? "", dob: b.dob ?? "", address: b.address ?? "", postcode: b.postcode ?? "", email: b.email ?? "" } });
        }
      });
    }

    return people;
  })();

  // Donor pre-fill from will record or matter
  const donorDefaults = (() => {
    if (isMatterMode && matterRecord) {
      const clientRole = clientNumber === 1 ? "testator1" : "testator2";
      const client = (matterRecord.clients ?? []).find((c: any) => c.clientRole === clientRole);
      // Use individual name fields if available, fall back to parsing fullName
      let donorTitle = client?.title ?? "";
      let donorFirstNames = client?.firstName ? [client.firstName, client.middleName].filter(Boolean).join(" ") : "";
      let donorLastName = client?.lastName ?? "";
      if (!donorFirstNames && !donorLastName && client?.fullName) {
        const nameParts = client.fullName.trim().split(/\s+/);
        donorFirstNames = nameParts.slice(0, -1).join(" ") || client.fullName || "";
        donorLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
      }
      return {
        donorTitle,
        donorFirstNames,
        donorLastName,
        donorDob: client?.dateOfBirth ?? "",
        donorAddress: client?.address ?? "",
        donorPostcode: "",
        donorEmail: client?.email ?? "",
      };
    }
    return {
      donorTitle: willRecord?.[`client${clientNumber}Prefix`] ?? "",
      donorFirstNames: willRecord?.[`client${clientNumber}FirstName`] ?? "",
      donorLastName: willRecord?.[`client${clientNumber}LastName`] ?? "",
      donorDob: willRecord?.[`client${clientNumber}Dob`] ?? "",
      donorAddress: willRecord?.[`client${clientNumber}AddressLine1`] ?? "",
      donorPostcode: willRecord?.[`client${clientNumber}Postcode`] ?? "",
      donorEmail: willRecord?.[`client${clientNumber}Email`] ?? "",
    };
  })();

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
        applicantType: (existingLpa as any).applicantType ?? "",
        recipientType: (existingLpa as any).recipientType ?? "",
        recipientTitle: (existingLpa as any).recipientTitle ?? "",
        recipientFirstNames: (existingLpa as any).recipientFirstNames ?? "",
        recipientLastName: (existingLpa as any).recipientLastName ?? "",
        recipientCompany: (existingLpa as any).recipientCompany ?? "",
        recipientAddressLine1: (existingLpa as any).recipientAddressLine1 ?? "",
        recipientAddressLine2: (existingLpa as any).recipientAddressLine2 ?? "",
        recipientAddressLine3: (existingLpa as any).recipientAddressLine3 ?? "",
        recipientPostcode: (existingLpa as any).recipientPostcode ?? "",
        deliveryPost: !!(existingLpa as any).deliveryPost,
        deliveryPhone: !!(existingLpa as any).deliveryPhone,
        deliveryEmail: !!(existingLpa as any).deliveryEmail,
        deliveryWelsh: !!(existingLpa as any).deliveryWelsh,
        feePaymentMethod: (existingLpa as any).feePaymentMethod ?? "",
        feeContactPhone: (existingLpa as any).feeContactPhone ?? "",
        reducedFee: !!(existingLpa as any).reducedFee,
        repeatApplication: !!(existingLpa as any).repeatApplication,
        caseNumber: (existingLpa as any).caseNumber ?? "",
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
      applicantType: "",
      recipientType: "",
      recipientTitle: "",
      recipientFirstNames: "",
      recipientLastName: "",
      recipientCompany: "",
      recipientAddressLine1: "",
      recipientAddressLine2: "",
      recipientAddressLine3: "",
      recipientPostcode: "",
      deliveryPost: false,
      deliveryPhone: false,
      deliveryEmail: false,
      deliveryWelsh: false,
      feePaymentMethod: "",
      feeContactPhone: "",
      reducedFee: false,
      repeatApplication: false,
      caseNumber: "",
    };
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.lpa.create.useMutation({
    onSuccess: () => {
      toast.success("LPA created successfully");
      if (isMatterMode && matterId) {
        utils.lpa.listByMatter.invalidate({ matterId });
      } else {
        utils.lpa.listBySubmission.invalidate({ willInstructionId: submissionId });
      }
      onSaved();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.lpa.update.useMutation({
    onSuccess: () => {
      toast.success("LPA saved successfully");
      if (isMatterMode && matterId) {
        utils.lpa.listByMatter.invalidate({ matterId });
      } else {
        utils.lpa.listBySubmission.invalidate({ willInstructionId: submissionId });
      }
      onSaved();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSave = () => {
    const payload = {
      willInstructionId: isMatterMode ? 0 : submissionId,
      matterId: isMatterMode ? matterId : undefined,
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
      applicantType: form.applicantType,
      recipientType: form.recipientType,
      recipientTitle: form.recipientTitle,
      recipientFirstNames: form.recipientFirstNames,
      recipientLastName: form.recipientLastName,
      recipientCompany: form.recipientCompany,
      recipientAddressLine1: form.recipientAddressLine1,
      recipientAddressLine2: form.recipientAddressLine2,
      recipientAddressLine3: form.recipientAddressLine3,
      recipientPostcode: form.recipientPostcode,
      deliveryPost: form.deliveryPost,
      deliveryPhone: form.deliveryPhone,
      deliveryEmail: form.deliveryEmail,
      deliveryWelsh: form.deliveryWelsh,
      feePaymentMethod: form.feePaymentMethod,
      feeContactPhone: form.feeContactPhone,
      reducedFee: form.reducedFee,
      repeatApplication: form.repeatApplication,
      caseNumber: form.caseNumber,
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
          <TabsTrigger value="registration" className="text-xs">Sections 12–14: Registration</TabsTrigger>
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

        {/* Sections 12-14: Registration */}
        <TabsContent value="registration" className="space-y-6 pt-4">

          {/* Section 12: Who is applying */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">Section 12 — Who is applying to register the LPA?</Label>
              <p className="text-xs text-muted-foreground mt-1">The applicant is the person or people sending the LPA to the OPG for registration.</p>
            </div>
            {[{ value: "donor", label: "The donor" }, { value: "attorneys", label: "The attorneys" }].map(opt => (
              <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.applicantType === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                <input type="radio" name="applicantType" value={opt.value} checked={form.applicantType === opt.value} onChange={() => setForm(prev => ({ ...prev, applicantType: opt.value }))} />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>

          <Separator />

          {/* Section 13: Who receives the LPA */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">Section 13 — Who do you want to receive the registered LPA?</Label>
              <p className="text-xs text-muted-foreground mt-1">The OPG will send the registered LPA to this person.</p>
            </div>
            {[{ value: "donor", label: "The donor" }, { value: "attorney", label: "An attorney" }, { value: "other", label: "Someone else" }].map(opt => (
              <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.recipientType === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                <input type="radio" name="recipientType" value={opt.value} checked={form.recipientType === opt.value} onChange={() => setForm(prev => ({ ...prev, recipientType: opt.value }))} />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
            {form.recipientType === "other" && (
              <div className="space-y-3 pl-4 border-l-2 border-primary/30 mt-2">
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Title</Label><Input value={form.recipientTitle ?? ""} onChange={f("recipientTitle")} placeholder="Mr/Mrs/Ms/Dr" /></div>
                  <div><Label>First Names</Label><Input value={form.recipientFirstNames ?? ""} onChange={f("recipientFirstNames")} /></div>
                  <div><Label>Last Name</Label><Input value={form.recipientLastName ?? ""} onChange={f("recipientLastName")} /></div>
                </div>
                <div><Label>Company (if applicable)</Label><Input value={form.recipientCompany ?? ""} onChange={f("recipientCompany")} /></div>
                <div><Label>Address Line 1</Label><Input value={form.recipientAddressLine1 ?? ""} onChange={f("recipientAddressLine1")} /></div>
                <div><Label>Address Line 2</Label><Input value={form.recipientAddressLine2 ?? ""} onChange={f("recipientAddressLine2")} /></div>
                <div><Label>Address Line 3</Label><Input value={form.recipientAddressLine3 ?? ""} onChange={f("recipientAddressLine3")} /></div>
                <div className="w-48"><Label>Postcode</Label><Input value={form.recipientPostcode ?? ""} onChange={f("recipientPostcode")} /></div>
              </div>
            )}
            <div className="space-y-2 pt-2">
              <Label className="text-sm font-medium">How would you like to be contacted about the registration?</Label>
              {[{ key: "deliveryPost" as const, label: "Post" }, { key: "deliveryPhone" as const, label: "Phone" }, { key: "deliveryEmail" as const, label: "Email" }, { key: "deliveryWelsh" as const, label: "Welsh language" }].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form[opt.key]} onChange={(e) => setForm(prev => ({ ...prev, [opt.key]: e.target.checked }))} className="rounded" />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Section 14: Application fee */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">Section 14 — Application Fee</Label>
              <p className="text-xs text-muted-foreground mt-1">The current fee is £82 per LPA. You can apply for a reduced fee if the donor's income is below £12,000/year.</p>
            </div>
            <div>
              <Label>Payment method</Label>
              <div className="flex gap-4 mt-2">
                {[{ value: "card", label: "Card" }, { value: "cheque", label: "Cheque" }].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${form.feePaymentMethod === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                    <input type="radio" name="feeMethod" value={opt.value} checked={form.feePaymentMethod === opt.value} onChange={() => setForm(prev => ({ ...prev, feePaymentMethod: opt.value }))} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {form.feePaymentMethod === "card" && (
              <div className="w-72">
                <Label>Contact phone number for card payment</Label>
                <Input value={form.feeContactPhone ?? ""} onChange={f("feeContactPhone")} placeholder="e.g. 07700 900000" />
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form.reducedFee} onChange={(e) => setForm(prev => ({ ...prev, reducedFee: e.target.checked }))} className="rounded" />
              <span className="text-sm">Apply for a reduced fee (donor's income below £12,000/year)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form.repeatApplication} onChange={(e) => setForm(prev => ({ ...prev, repeatApplication: e.target.checked }))} className="rounded" />
              <span className="text-sm">This is a repeat application (previously rejected LPA)</span>
            </label>
            {form.repeatApplication && (
              <div className="w-64">
                <Label>Previous case number</Label>
                <Input value={form.caseNumber ?? ""} onChange={f("caseNumber")} placeholder="OPG case number" />
              </div>
            )}
          </div>
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
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const entityId = parseInt(id ?? "0", 10);

  // Detect whether we're in matter mode (/admin/wills/:id/lpa) or submission mode (/admin/submissions/:id/lpa)
  const isMatterMode = location.includes("/wills/");
  const submissionId = isMatterMode ? 0 : entityId;
  const matterId = isMatterMode ? entityId : undefined;

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [editingLpa, setEditingLpa] = useState<{ lpaType: "property_finance" | "health_welfare"; clientNumber: 1 | 2; existingId?: number } | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{ lpaId: number; lpaData: Record<string, any> } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Submission mode queries
  const { data: willRecord, isLoading: willLoading } = trpc.will.getById.useQuery(
    { id: submissionId },
    { enabled: !isMatterMode && submissionId > 0 }
  );
  const { data: submissionLpaList, isLoading: submissionLpaLoading, refetch: refetchSubmissionLpas } = trpc.lpa.listBySubmission.useQuery(
    { willInstructionId: submissionId },
    { enabled: !isMatterMode && submissionId > 0 }
  );

  // Matter mode queries
  const { data: matterRecord, isLoading: matterLoading } = trpc.matters.getById.useQuery(
    { id: matterId ?? 0 },
    { enabled: isMatterMode && (matterId ?? 0) > 0 }
  );
  const { data: matterLpaList, isLoading: matterLpaLoading, refetch: refetchMatterLpas } = trpc.lpa.listByMatter.useQuery(
    { matterId: matterId ?? 0 },
    { enabled: isMatterMode && (matterId ?? 0) > 0 }
  );

  // Unified accessors
  const lpaList = isMatterMode ? matterLpaList : submissionLpaList;
  const lpaLoading = isMatterMode ? matterLpaLoading : submissionLpaLoading;
  const refetchLpas = isMatterMode ? refetchMatterLpas : refetchSubmissionLpas;
  const isDataLoading = isMatterMode ? (matterLoading || matterLpaLoading) : (willLoading || submissionLpaLoading);

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
      if (isMatterMode && matterRecord) {
        const role = targetClientNumber === 1 ? "testator1" : "testator2";
        const client = (matterRecord.clients ?? []).find((c: any) => c.clientRole === role);
        let donorTitle = client?.title ?? "";
        let donorFirstNames = client?.firstName ? [client.firstName, client.middleName].filter(Boolean).join(" ") : "";
        let donorLastName = client?.lastName ?? "";
        if (!donorFirstNames && !donorLastName && client?.fullName) {
          const nameParts = client.fullName.trim().split(/\s+/);
          donorFirstNames = nameParts.slice(0, -1).join(" ") || client.fullName || "";
          donorLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
        }
        return {
          donorTitle,
          donorFirstNames,
          donorLastName,
          donorDob: client?.dateOfBirth ?? "",
          donorAddress: client?.address ?? "",
          donorPostcode: "",
          donorEmail: client?.email ?? "",
        };
      }
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
      willInstructionId: isMatterMode ? 0 : submissionId,
      matterId: isMatterMode ? matterId : undefined,
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

  if (isDataLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  const clientName = (n: 1 | 2) => {
    if (isMatterMode && matterRecord) {
      const role = n === 1 ? "testator1" : "testator2";
      const client = (matterRecord.clients ?? []).find((c: any) => c.clientRole === role);
      return client?.fullName || `Client ${n}`;
    }
    const r = willRecord as any;
    return [r?.[`client${n}FirstName`], r?.[`client${n}LastName`]].filter(Boolean).join(" ") || `Client ${n}`;
  };

  const hasClient2 = isMatterMode
    ? !!(matterRecord?.clients ?? []).find((c: any) => c.clientRole === "testator2")
    : !!(willRecord as any)?.client2FirstName;

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
            matterId={matterId}
            willRecord={willRecord}
            matterRecord={matterRecord}
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
          <Button variant="ghost" size="sm" onClick={() => isMatterMode ? navigate("/admin/wills") : navigate(`/admin/submissions/${submissionId}`)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {isMatterMode ? "Back to Will Drafting" : "Back to Submission"}
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Lasting Powers of Attorney</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isMatterMode
              ? `Matter: ${matterRecord?.fileReference ?? `#${matterId}`} — ${clientName(1)}${hasClient2 ? ` & ${clientName(2)}` : ""}`
              : `Submission #${submissionId} — ${clientName(1)}${hasClient2 ? ` & ${clientName(2)}` : ""}`
            }
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1"
                              onClick={() => {
                                const safeArr = (v: unknown): any[] => { if (!v) return []; if (Array.isArray(v)) return v; try { return JSON.parse(v as string) ?? []; } catch { return []; } };
                                setPdfPreview({
                                  lpaId: existing.id,
                                  lpaData: {
                                    lpaType: existing.lpaType ?? "property_finance",
                                    donorTitle: existing.donorTitle ?? "",
                                    donorFirstNames: existing.donorFirstNames ?? "",
                                    donorLastName: existing.donorLastName ?? "",
                                    donorOtherNames: existing.donorOtherNames ?? "",
                                    donorDob: existing.donorDob ?? "",
                                    donorAddress: existing.donorAddress ?? "",
                                    donorPostcode: existing.donorPostcode ?? "",
                                    donorEmail: existing.donorEmail ?? "",
                                    attorneys: safeArr(existing.attorneys),
                                    replacementAttorneys: safeArr(existing.replacementAttorneys),
                                    attorneyDecisionType: existing.attorneyDecisionType ?? "",
                                    certProviderTitle: existing.certProviderTitle ?? "",
                                    certProviderFirstNames: existing.certProviderFirstNames ?? "",
                                    certProviderLastName: existing.certProviderLastName ?? "",
                                    certProviderAddress: existing.certProviderAddress ?? "",
                                    certProviderPostcode: existing.certProviderPostcode ?? "",
                                    certProviderEmail: existing.certProviderEmail ?? "",
                                    whenAttorneysCanAct: existing.whenAttorneysCanAct ?? "",
                                    lifeSustainingTreatment: existing.lifeSustainingTreatment ?? "",
                                    preferences: existing.preferences ?? "",
                                    instructions: existing.instructions ?? "",
                                    applicantType: existing.applicantType ?? "",
                                    recipientType: existing.recipientType ?? "",
                                    recipientTitle: existing.recipientTitle ?? "",
                                    recipientFirstNames: existing.recipientFirstNames ?? "",
                                    recipientLastName: existing.recipientLastName ?? "",
                                    recipientCompany: existing.recipientCompany ?? "",
                                    recipientAddressLine1: existing.recipientAddressLine1 ?? "",
                                    recipientAddressLine2: existing.recipientAddressLine2 ?? "",
                                    recipientAddressLine3: existing.recipientAddressLine3 ?? "",
                                    recipientPostcode: existing.recipientPostcode ?? "",
                                    deliveryPost: !!(existing.deliveryPost),
                                    deliveryPhone: !!(existing.deliveryPhone),
                                    deliveryEmail: !!(existing.deliveryEmail),
                                    deliveryWelsh: !!(existing.deliveryWelsh),
                                    feePaymentMethod: existing.feePaymentMethod ?? "",
                                    feeContactPhone: existing.feeContactPhone ?? "",
                                    reducedFee: !!(existing.reducedFee),
                                    repeatApplication: !!(existing.repeatApplication),
                                    caseNumber: existing.caseNumber ?? "",
                                  },
                                });
                              }}
                            >
                              <Download className="w-3 h-3" /> PDF
                            </Button>
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
              <CardTitle className="text-sm">{isMatterMode ? "All LPA Records for This Matter" : "All LPA Records for This Submission"}</CardTitle>
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

      {/* PDF Manual Field Editor Modal */}
      {pdfPreview && (
        <Dialog open={true} onOpenChange={() => setPdfPreview(null)}>
          <DialogContent className="max-w-3xl w-[95vw] h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-3 border-b shrink-0">
              <DialogTitle>Review &amp; Edit LPA Fields Before Generating PDF</DialogTitle>
              <p className="text-sm text-muted-foreground">Review the pre-filled data below. Edit any field, then click Generate PDF to download.</p>
            </DialogHeader>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-6 px-6 py-4">
                {/* Section 1: Donor */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-primary border-b pb-1">Section 1 — Donor</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Title</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.donorTitle ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, donorTitle: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">First Names</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.donorFirstNames ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, donorFirstNames: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">Last Name</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.donorLastName ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, donorLastName: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">Other Names</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.donorOtherNames ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, donorOtherNames: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">Date of Birth (DD/MM/YYYY)</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.donorDob ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, donorDob: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">Email</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.donorEmail ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, donorEmail: e.target.value } } : p)} /></div>
                    <div className="col-span-2"><Label className="text-xs">Address (comma-separated lines)</Label><Textarea className="text-sm" rows={2} value={pdfPreview.lpaData.donorAddress ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, donorAddress: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">Postcode</Label><Input className="h-8 text-sm w-40" value={pdfPreview.lpaData.donorPostcode ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, donorPostcode: e.target.value } } : p)} /></div>
                  </div>
                </div>
                {/* Section 2: Attorneys */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-primary border-b pb-1">Section 2 — Attorneys</h3>
                  {(pdfPreview.lpaData.attorneys as any[]).map((a: any, i: number) => (
                    <div key={i} className="border border-border/60 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium mb-2 text-muted-foreground">Attorney {i + 1}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-xs">Title</Label><Input className="h-8 text-sm" value={a.title ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.attorneys]; arr[i] = { ...arr[i], title: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, attorneys: arr } } : p); }} /></div>
                        <div><Label className="text-xs">First Names</Label><Input className="h-8 text-sm" value={a.firstNames ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.attorneys]; arr[i] = { ...arr[i], firstNames: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, attorneys: arr } } : p); }} /></div>
                        <div><Label className="text-xs">Last Name</Label><Input className="h-8 text-sm" value={a.lastName ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.attorneys]; arr[i] = { ...arr[i], lastName: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, attorneys: arr } } : p); }} /></div>
                        <div><Label className="text-xs">Date of Birth</Label><Input className="h-8 text-sm" value={a.dob ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.attorneys]; arr[i] = { ...arr[i], dob: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, attorneys: arr } } : p); }} /></div>
                        <div className="col-span-2"><Label className="text-xs">Address (comma-separated lines)</Label><Textarea className="text-sm" rows={2} value={a.address ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.attorneys]; arr[i] = { ...arr[i], address: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, attorneys: arr } } : p); }} /></div>
                        <div><Label className="text-xs">Postcode</Label><Input className="h-8 text-sm" value={a.postcode ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.attorneys]; arr[i] = { ...arr[i], postcode: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, attorneys: arr } } : p); }} /></div>
                        <div><Label className="text-xs">Email</Label><Input className="h-8 text-sm" value={a.email ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.attorneys]; arr[i] = { ...arr[i], email: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, attorneys: arr } } : p); }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Section 4: Replacement Attorneys */}
                {(pdfPreview.lpaData.replacementAttorneys as any[]).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-3 text-primary border-b pb-1">Section 4 — Replacement Attorneys</h3>
                    {(pdfPreview.lpaData.replacementAttorneys as any[]).map((r: any, i: number) => (
                      <div key={i} className="border border-border/60 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Replacement {i + 1}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div><Label className="text-xs">Title</Label><Input className="h-8 text-sm" value={r.title ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.replacementAttorneys]; arr[i] = { ...arr[i], title: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, replacementAttorneys: arr } } : p); }} /></div>
                          <div><Label className="text-xs">First Names</Label><Input className="h-8 text-sm" value={r.firstNames ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.replacementAttorneys]; arr[i] = { ...arr[i], firstNames: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, replacementAttorneys: arr } } : p); }} /></div>
                          <div><Label className="text-xs">Last Name</Label><Input className="h-8 text-sm" value={r.lastName ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.replacementAttorneys]; arr[i] = { ...arr[i], lastName: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, replacementAttorneys: arr } } : p); }} /></div>
                          <div><Label className="text-xs">Date of Birth</Label><Input className="h-8 text-sm" value={r.dob ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.replacementAttorneys]; arr[i] = { ...arr[i], dob: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, replacementAttorneys: arr } } : p); }} /></div>
                          <div className="col-span-2"><Label className="text-xs">Address (comma-separated lines)</Label><Textarea className="text-sm" rows={2} value={r.address ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.replacementAttorneys]; arr[i] = { ...arr[i], address: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, replacementAttorneys: arr } } : p); }} /></div>
                          <div><Label className="text-xs">Postcode</Label><Input className="h-8 text-sm" value={r.postcode ?? ""} onChange={e => { const arr = [...pdfPreview.lpaData.replacementAttorneys]; arr[i] = { ...arr[i], postcode: e.target.value }; setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, replacementAttorneys: arr } } : p); }} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Section 10: Certificate Provider */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-primary border-b pb-1">Section 10 — Certificate Provider</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Title</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.certProviderTitle ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, certProviderTitle: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">First Names</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.certProviderFirstNames ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, certProviderFirstNames: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">Last Name</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.certProviderLastName ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, certProviderLastName: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">Email</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.certProviderEmail ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, certProviderEmail: e.target.value } } : p)} /></div>
                    <div className="col-span-2"><Label className="text-xs">Address (comma-separated lines)</Label><Textarea className="text-sm" rows={2} value={pdfPreview.lpaData.certProviderAddress ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, certProviderAddress: e.target.value } } : p)} /></div>
                    <div><Label className="text-xs">Postcode</Label><Input className="h-8 text-sm w-40" value={pdfPreview.lpaData.certProviderPostcode ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, certProviderPostcode: e.target.value } } : p)} /></div>
                  </div>
                </div>
                {/* Section 12 */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-primary border-b pb-1">Section 12 — Who is Applying</h3>
                  <div className="flex gap-4">
                    {[{val:"donor",label:"Donor"},{val:"attorneys",label:"Attorney(s)"}].map(opt => (
                      <label key={opt.val} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="applicantType" value={opt.val} checked={pdfPreview.lpaData.applicantType === opt.val} onChange={() => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, applicantType: opt.val } } : p)} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Section 13 */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-primary border-b pb-1">Section 13 — Who Receives the LPA</h3>
                  <div className="flex gap-4 mb-3">
                    {[{val:"donor",label:"The donor"},{val:"attorney",label:"An attorney"},{val:"other",label:"Someone else"}].map(opt => (
                      <label key={opt.val} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="recipientType" value={opt.val} checked={pdfPreview.lpaData.recipientType === opt.val} onChange={() => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, recipientType: opt.val } } : p)} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {pdfPreview.lpaData.recipientType === "other" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Title</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.recipientTitle ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, recipientTitle: e.target.value } } : p)} /></div>
                      <div><Label className="text-xs">First Names</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.recipientFirstNames ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, recipientFirstNames: e.target.value } } : p)} /></div>
                      <div><Label className="text-xs">Last Name</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.recipientLastName ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, recipientLastName: e.target.value } } : p)} /></div>
                      <div><Label className="text-xs">Company (optional)</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.recipientCompany ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, recipientCompany: e.target.value } } : p)} /></div>
                      <div><Label className="text-xs">Address Line 1</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.recipientAddressLine1 ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, recipientAddressLine1: e.target.value } } : p)} /></div>
                      <div><Label className="text-xs">Address Line 2</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.recipientAddressLine2 ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, recipientAddressLine2: e.target.value } } : p)} /></div>
                      <div><Label className="text-xs">Address Line 3</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.recipientAddressLine3 ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, recipientAddressLine3: e.target.value } } : p)} /></div>
                      <div><Label className="text-xs">Postcode</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.recipientPostcode ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, recipientPostcode: e.target.value } } : p)} /></div>
                    </div>
                  )}
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium mb-1">Preferred contact method:</p>
                    {[{key:"deliveryPost",label:"Post"},{key:"deliveryPhone",label:"Phone"},{key:"deliveryEmail",label:"Email"},{key:"deliveryWelsh",label:"Welsh"}].map(opt => (
                      <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={!!pdfPreview.lpaData[opt.key]} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, [opt.key]: e.target.checked } } : p)} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Section 14 */}
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-primary border-b pb-1">Section 14 — Application Fee</h3>
                  <div className="flex gap-4 mb-3">
                    {[{val:"card",label:"Card"},{val:"cheque",label:"Cheque"}].map(opt => (
                      <label key={opt.val} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name="feePaymentMethod" value={opt.val} checked={pdfPreview.lpaData.feePaymentMethod === opt.val} onChange={() => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, feePaymentMethod: opt.val } } : p)} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {pdfPreview.lpaData.feePaymentMethod === "card" && (
                    <div className="mb-3"><Label className="text-xs">Phone Number for Card Payment</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.feeContactPhone ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, feeContactPhone: e.target.value } } : p)} /></div>
                  )}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!pdfPreview.lpaData.reducedFee} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, reducedFee: e.target.checked } } : p)} />
                      Apply for reduced fee (income below £12,000/year)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!pdfPreview.lpaData.repeatApplication} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, repeatApplication: e.target.checked } } : p)} />
                      Repeat application
                    </label>
                    {pdfPreview.lpaData.repeatApplication && (
                      <div><Label className="text-xs">Case Number</Label><Input className="h-8 text-sm" value={pdfPreview.lpaData.caseNumber ?? ""} onChange={e => setPdfPreview(p => p ? { ...p, lpaData: { ...p.lpaData, caseNumber: e.target.value } } : p)} /></div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="px-6 py-4 border-t shrink-0">
              <Button variant="outline" onClick={() => setPdfPreview(null)}>Cancel</Button>
              <Button
                disabled={isGenerating}
                onClick={async () => {
                  setIsGenerating(true);
                  try {
                    const res = await fetch(`/api/lpa/${pdfPreview.lpaId}/pdf`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(pdfPreview.lpaData),
                    });
                    if (!res.ok) throw new Error(await res.text());
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    const lpaType = pdfPreview.lpaData.lpaType === "property_finance" ? "LP1F" : "LP1H";
                    const donorName = [pdfPreview.lpaData.donorFirstNames, pdfPreview.lpaData.donorLastName].filter(Boolean).join("_") || String(pdfPreview.lpaId);
                    a.download = `LPA_${lpaType}_${donorName}.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setPdfPreview(null);
                    toast.success("LPA PDF downloaded");
                  } catch (err: any) {
                    toast.error("Failed to generate PDF: " + err.message);
                  } finally {
                    setIsGenerating(false);
                  }
                }}
              >
                {isGenerating ? "Generating..." : "Generate & Download PDF"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
