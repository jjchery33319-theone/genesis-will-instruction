/**
 * AdminSubmissionEditor.tsx
 *
 * Comprehensive back-office editor for a Will Instruction submission.
 * Allows admin staff to view and edit every field, including executors,
 * guardians, beneficiaries, and all other sections.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp, Building2, User, Users, Home, Heart, FileText, Shield, Scale, Flower2, ClipboardList, Baby, AlertTriangle, RefreshCw, Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PRODUCTS } from "../../../shared/willConstants";
import { OptionalClausesEditor, type OptionalClausesData } from "@/components/OptionalClausesEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonEntry {
  title?: string;
  prefix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  phone?: string;
  email?: string;
  relationship?: string;
  share?: string;
  notes?: string;
  isVulnerable?: boolean;
}

interface GiftEntry {
  description?: string;
  recipient?: string;
  value?: string;
  isCharity?: boolean;
  notes?: string;
}

interface PolicyEntry {
  provider?: string;
  policyNumber?: string;
  sumAssured?: string;
  termRemaining?: string;
  inTrust?: boolean;
  beneficiary?: string;
  notes?: string;
}

interface BusinessEntry {
  businessName?: string;
  natureOfBusiness?: string;
  ownershipPercentage?: string;
  notes?: string;
}

const GENESIS_COMPANY: PersonEntry = {
  firstName: "Genesis Wills and Estate Planning Ltd",
  address: "Genesis Wills and Estate Planning Ltd, England & Wales",
  relationship: "Professional Executor",
};

// ─── Primitive helpers ────────────────────────────────────────────────────────

function safeArr<T>(v: unknown): T[] {
  if (!v) return [];
  if (typeof v === "string") { try { return JSON.parse(v) as T[]; } catch { return []; } }
  if (Array.isArray(v)) return v as T[];
  return [];
}

function s(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden mb-4">
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ background: "oklch(0.97 0.015 155)" }}>
        <span style={{ color: "oklch(0.28 0.07 155)" }}>{icon}</span>
        <h3 className="font-serif text-sm font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>{title}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Field label={label}>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? ""} className="h-8 text-sm" />
    </Field>
  );
}

function TextAreaInput({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <Field label={label}>
      <Textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className="text-sm resize-none" />
    </Field>
  );
}

function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Field label={label}>
      <Select value={value || "__none__"} onValueChange={v => onChange(v === "__none__" ? "" : v)}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">— Select —</SelectItem>
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}

function YesNoInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <SelectInput
      label={label}
      value={value}
      onChange={onChange}
      options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
    />
  );
}

// ─── Person Editor ────────────────────────────────────────────────────────────

function PersonEditor({
  person,
  onChange,
  onRemove,
  index,
  showShare = false,
  showVulnerable = false,
}: {
  person: PersonEntry;
  onChange: (p: PersonEntry) => void;
  onRemove: () => void;
  index: number;
  showShare?: boolean;
  showVulnerable?: boolean;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const name = [person.title, person.prefix, person.firstName, person.lastName].filter(Boolean).join(" ") || `Person ${index + 1}`;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
        style={{ background: "oklch(0.98 0.008 155)" }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{name}</span>
          {person.relationship && <Badge variant="outline" className="text-xs py-0">{person.relationship}</Badge>}
          {person.share && <Badge className="text-xs py-0" style={{ background: "oklch(0.28 0.07 155)" }}>{person.share}</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={e => { e.stopPropagation(); onRemove(); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
        <div className="p-3 space-y-3 border-t border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <TextInput label="Title" value={s(person.title)} onChange={v => onChange({ ...person, title: v })} placeholder="Mr/Mrs/Dr" />
            <TextInput label="Prefix" value={s(person.prefix)} onChange={v => onChange({ ...person, prefix: v })} placeholder="Mr/Mrs/Dr" />
            <TextInput label="First Name" value={s(person.firstName)} onChange={v => onChange({ ...person, firstName: v })} />
            <TextInput label="Middle Name" value={s(person.middleName)} onChange={v => onChange({ ...person, middleName: v })} />
            <TextInput label="Last Name" value={s(person.lastName)} onChange={v => onChange({ ...person, lastName: v })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <TextInput label="Date of Birth" value={s(person.dob)} onChange={v => onChange({ ...person, dob: v })} placeholder="DD/MM/YYYY" />
            <TextInput label="Relationship" value={s(person.relationship)} onChange={v => onChange({ ...person, relationship: v })} placeholder="e.g. spouse, child" />
          </div>
          <TextInput label="Full Address" value={s(person.address)} onChange={v => onChange({ ...person, address: v })} placeholder="Address line 1, City, Postcode" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <TextInput label="Phone" value={s(person.phone)} onChange={v => onChange({ ...person, phone: v })} />
            <TextInput label="Email" value={s(person.email)} onChange={v => onChange({ ...person, email: v })} />
          </div>
          {showShare && (
            <TextInput label="Share (%)" value={s(person.share)} onChange={v => onChange({ ...person, share: v })} placeholder="e.g. 50%" />
          )}
          {showVulnerable && (
            <div className="flex items-center gap-2">
              <Switch
                checked={!!person.isVulnerable}
                onCheckedChange={c => onChange({ ...person, isVulnerable: c })}
              />
              <Label className="text-sm">Vulnerable beneficiary</Label>
            </div>
          )}
          <TextAreaInput label="Notes" value={s(person.notes)} onChange={v => onChange({ ...person, notes: v })} rows={2} />
        </div>
      )}
    </div>
  );
}

function PersonListEditor({
  title,
  persons,
  onChange,
  showShare = false,
  showVulnerable = false,
  onAppendGenesis,
}: {
  title: string;
  persons: PersonEntry[];
  onChange: (p: PersonEntry[]) => void;
  showShare?: boolean;
  showVulnerable?: boolean;
  onAppendGenesis?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <div className="flex gap-1">
          {onAppendGenesis && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              style={{ borderColor: "oklch(0.28 0.07 155)", color: "oklch(0.28 0.07 155)" }}
              onClick={onAppendGenesis}
            >
              <Building2 className="w-3 h-3" />
              Appoint Genesis Wills Ltd
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => onChange([...persons, {}])}
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
      </div>
      {persons.length === 0 && (
        <p className="text-xs text-muted-foreground italic py-2">None added.</p>
      )}
      {persons.map((p, i) => (
        <PersonEditor
          key={i}
          person={p}
          index={i}
          showShare={showShare}
          showVulnerable={showVulnerable}
          onChange={updated => {
            const next = [...persons];
            next[i] = updated;
            onChange(next);
          }}
          onRemove={() => onChange(persons.filter((_, idx) => idx !== i))}
        />
      ))}
    </div>
  );
}

// ─── Gift Editor ──────────────────────────────────────────────────────────────

function GiftEditor({ gift, onChange, onRemove, index }: { gift: GiftEntry; onChange: (g: GiftEntry) => void; onRemove: () => void; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const label = gift.description || gift.recipient ? `${gift.description || "Gift"} → ${gift.recipient || "?"}` : `Gift ${index + 1}`;
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/30" style={{ background: "oklch(0.98 0.008 155)" }} onClick={() => setExpanded(e => !e)}>
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); onRemove(); }}><Trash2 className="w-3.5 h-3.5" /></Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
        <div className="p-3 space-y-2 border-t border-border">
          <TextInput label="Description / Item" value={s(gift.description)} onChange={v => onChange({ ...gift, description: v })} />
          <div className="grid grid-cols-2 gap-2">
            <TextInput label="Recipient" value={s(gift.recipient)} onChange={v => onChange({ ...gift, recipient: v })} />
            <TextInput label="Estimated Value" value={s(gift.value)} onChange={v => onChange({ ...gift, value: v })} placeholder="£" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={!!gift.isCharity} onCheckedChange={c => onChange({ ...gift, isCharity: c })} />
            <Label className="text-sm">Charity gift</Label>
          </div>
          <TextAreaInput label="Notes" value={s(gift.notes)} onChange={v => onChange({ ...gift, notes: v })} rows={2} />
        </div>
      )}
    </div>
  );
}

function GiftListEditor({ title, gifts, onChange }: { title: string; gifts: GiftEntry[]; onChange: (g: GiftEntry[]) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onChange([...gifts, {}])}>
          <Plus className="w-3 h-3" />Add
        </Button>
      </div>
      {gifts.length === 0 && <p className="text-xs text-muted-foreground italic py-2">None added.</p>}
      {gifts.map((g, i) => (
        <GiftEditor key={i} gift={g} index={i} onChange={u => { const n = [...gifts]; n[i] = u; onChange(n); }} onRemove={() => onChange(gifts.filter((_, idx) => idx !== i))} />
      ))}
    </div>
  );
}

// ─── Policy Editor ────────────────────────────────────────────────────────────

function PolicyEditor({ policy, onChange, onRemove, index }: { policy: PolicyEntry; onChange: (p: PolicyEntry) => void; onRemove: () => void; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const label = policy.provider || `Policy ${index + 1}`;
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/30" style={{ background: "oklch(0.98 0.008 155)" }} onClick={() => setExpanded(e => !e)}>
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); onRemove(); }}><Trash2 className="w-3.5 h-3.5" /></Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
        <div className="p-3 space-y-2 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            <TextInput label="Provider" value={s(policy.provider)} onChange={v => onChange({ ...policy, provider: v })} />
            <TextInput label="Policy Number" value={s(policy.policyNumber)} onChange={v => onChange({ ...policy, policyNumber: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextInput label="Sum Assured" value={s(policy.sumAssured)} onChange={v => onChange({ ...policy, sumAssured: v })} placeholder="£" />
            <TextInput label="Term Remaining" value={s(policy.termRemaining)} onChange={v => onChange({ ...policy, termRemaining: v })} />
          </div>
          <TextInput label="Beneficiary" value={s(policy.beneficiary)} onChange={v => onChange({ ...policy, beneficiary: v })} />
          <div className="flex items-center gap-2">
            <Switch checked={!!policy.inTrust} onCheckedChange={c => onChange({ ...policy, inTrust: c })} />
            <Label className="text-sm">Written in trust</Label>
          </div>
          <TextAreaInput label="Notes" value={s(policy.notes)} onChange={v => onChange({ ...policy, notes: v })} rows={2} />
        </div>
      )}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export default function AdminSubmissionEditor() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const [, navigate] = useLocation();

  const { data: record, isLoading } = trpc.will.getById.useQuery({ id }, { enabled: !!id });
  const utils = trpc.useUtils();
  const updateMutation = trpc.will.updateSubmission.useMutation({
    onSuccess: () => {
      toast.success("Changes saved successfully.");
      utils.will.getById.invalidate({ id });
      setDirty(false);
    },
    onError: (err) => {
      toast.error("Failed to save: " + err.message);
    },
  });

  // ── Local state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [dirty, setDirty] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const handleRegenerate = async (type: "pdf" | "docx", clientNumber: 1 | 2 = 1) => {
    const key = `${type}-${clientNumber}`;
    setRegenerating(key);
    try {
      const willType = (form.willType as string) || "single";
      const params = new URLSearchParams({ willType, clientNumber: String(clientNumber) });
      const ext = type === "pdf" ? "will" : "will-docx";
      const resp = await fetch(`/api/submissions/${id}/${ext}?${params.toString()}`);
      if (!resp.ok) throw new Error(await resp.text());
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const firstName = clientNumber === 1 ? form.client1FirstName : form.client2FirstName;
      const lastName = clientNumber === 1 ? form.client1LastName : form.client2LastName;
      const clientName = [firstName, lastName].filter(Boolean).join("_") || `Client${clientNumber}`;
      a.download = `${clientName}_Will.${type === "pdf" ? "pdf" : "docx"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Will ${type === "pdf" ? "PDF" : "Word document"} downloaded.`);
    } catch (e: any) {
      toast.error("Failed to generate Will: " + e.message);
    } finally {
      setRegenerating(null);
    }
  };

  useEffect(() => {
    if (record) {
      setForm({ ...record });
      setDirty(false);
    }
  }, [record]);

  const set = useCallback((key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const f = (key: string): string => s(form[key]);
  const arr = <T,>(key: string): T[] => safeArr<T>(form[key]);

  const handleSave = () => {
    // Strip null values — Zod .optional() accepts undefined but rejects null.
    // The DB record initialises form state with nulls for unset fields.
    const stripNulls = (obj: Record<string, unknown>): Record<string, unknown> => {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v === null) continue; // omit nulls entirely
        if (Array.isArray(v)) {
          // Strip nulls inside arrays of objects too
          out[k] = v.map(item =>
            item !== null && typeof item === "object"
              ? stripNulls(item as Record<string, unknown>)
              : item
          );
        } else if (v !== null && typeof v === "object" && !(v instanceof Date)) {
          out[k] = stripNulls(v as Record<string, unknown>);
        } else {
          out[k] = v;
        }
      }
      return out;
    };
    const payload = stripNulls({ ...form, id });
    updateMutation.mutate(payload as Parameters<typeof updateMutation.mutate>[0]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.01 155)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.01 155)" }}>
        <p className="text-muted-foreground">Submission not found.</p>
      </div>
    );
  }

  const isMirror = f("willType") !== "single";
  const client1Name = [f("client1Prefix"), f("client1FirstName"), f("client1LastName")].filter(Boolean).join(" ") || "Client 1";
  const client2Name = f("client2FirstName")
    ? [f("client2Prefix"), f("client2FirstName"), f("client2LastName")].filter(Boolean).join(" ")
    : "Client 2";

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/submission/${id}`)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-base font-serif font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>
                Edit Submission
              </h1>
              <p className="text-xs text-muted-foreground">{f("referenceNumber")} · {client1Name}{isMirror ? ` & ${client2Name}` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dirty && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">Unsaved changes</Badge>}
            {isMirror ? (
              <>
                {/* Client 1 buttons */}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 bg-white"
                  onClick={() => handleRegenerate("pdf", 1)}
                  disabled={!!regenerating || dirty}
                  title={dirty ? "Save changes first" : `Download ${client1Name} Will as PDF`}
                >
                  {regenerating === "pdf-1" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  C1 PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 bg-white"
                  onClick={() => handleRegenerate("docx", 1)}
                  disabled={!!regenerating || dirty}
                  title={dirty ? "Save changes first" : `Download ${client1Name} Will as Word document`}
                >
                  {regenerating === "docx-1" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  C1 Word
                </Button>
                {/* Client 2 buttons */}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 bg-white"
                  onClick={() => handleRegenerate("pdf", 2)}
                  disabled={!!regenerating || dirty}
                  title={dirty ? "Save changes first" : `Download ${client2Name} Will as PDF`}
                >
                  {regenerating === "pdf-2" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  C2 PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 bg-white"
                  onClick={() => handleRegenerate("docx", 2)}
                  disabled={!!regenerating || dirty}
                  title={dirty ? "Save changes first" : `Download ${client2Name} Will as Word document`}
                >
                  {regenerating === "docx-2" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  C2 Word
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 bg-white"
                  onClick={() => handleRegenerate("pdf", 1)}
                  disabled={!!regenerating || dirty}
                  title={dirty ? "Save changes first" : "Download Will as PDF"}
                >
                  {regenerating === "pdf-1" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 bg-white"
                  onClick={() => handleRegenerate("docx", 1)}
                  disabled={!!regenerating || dirty}
                  title={dirty ? "Save changes first" : "Download Will as Word document"}
                >
                  {regenerating === "docx-1" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Word
                </Button>
              </>
            )}
            <ImportToV2Button submissionId={Number(id)} isMirror={isMirror} />
            <Button
              size="sm"
              className="gap-1.5"
              style={{ background: "oklch(0.28 0.07 155)" }}
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="appointment">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6 p-1 bg-white border border-border rounded-xl" style={{display: 'inline-block'}}>
            {[
              { value: "appointment", label: "Appointment", icon: <ClipboardList className="w-3.5 h-3.5" /> },
              { value: "clients", label: "Clients", icon: <User className="w-3.5 h-3.5" /> },
              { value: "executors", label: "Executors", icon: <Scale className="w-3.5 h-3.5" /> },
              { value: "guardians", label: "Guardians", icon: <Shield className="w-3.5 h-3.5" /> },
              { value: "beneficiaries", label: "Beneficiaries", icon: <Users className="w-3.5 h-3.5" /> },
              { value: "gifts", label: "Gifts & Legacies", icon: <Heart className="w-3.5 h-3.5" /> },
              { value: "property", label: "Property & Assets", icon: <Home className="w-3.5 h-3.5" /> },
              { value: "wishes", label: "Wishes & Funeral", icon: <Flower2 className="w-3.5 h-3.5" /> },
              { value: "optionalclauses", label: "Optional Clauses", icon: <Scale className="w-3.5 h-3.5" /> },
              { value: "family", label: "Family & Background", icon: <Baby className="w-3.5 h-3.5" /> },
              { value: "duediligence", label: "Due Diligence", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
              { value: "notes", label: "Status & Notes", icon: <FileText className="w-3.5 h-3.5" /> },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm" style={{ "--tw-ring-color": "oklch(0.28 0.07 155)" } as React.CSSProperties}>
                {t.icon}{t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── APPOINTMENT ─────────────────────────────────────────────────── */}
          <TabsContent value="appointment">
            <SectionCard title="Appointment Details" icon={<ClipboardList className="w-4 h-4" />}>
              <Row>
                <TextInput label="Date of Appointment" value={f("appointmentDate")} onChange={v => set("appointmentDate", v)} />
                <TextInput label="Time of Appointment" value={f("appointmentTime")} onChange={v => set("appointmentTime", v)} />
                <TextInput label="Estimated Draft Date" value={f("estimatedDraftDate")} onChange={v => set("estimatedDraftDate", v)} />
              </Row>
              <Row>
                <TextInput label="Price Quoted (£)" value={f("priceQuoted")} onChange={v => set("priceQuoted", v)} />
                <SelectInput
                  label="Will Type"
                  value={f("willType")}
                  onChange={v => set("willType", v)}
                  options={[
                    { value: "single", label: "Single Will" },
                    { value: "mirror_client1", label: "Mirror Will (Client 1)" },
                    { value: "mirror_client2", label: "Mirror Will (Client 2)" },
                  ]}
                />
                <TextInput label="LPA Type" value={f("lpaType")} onChange={v => set("lpaType", v)} />
              </Row>
            </SectionCard>
            <SectionCard title="Consultant" icon={<User className="w-4 h-4" />}>
              <Row>
                <TextInput label="Consultant Name" value={f("consultantName")} onChange={v => set("consultantName", v)} />
                <TextInput label="Consultant Email" value={f("consultantEmail")} onChange={v => set("consultantEmail", v)} />
                <TextInput label="Consultant Phone" value={f("consultantPhone")} onChange={v => set("consultantPhone", v)} />
              </Row>
            </SectionCard>
            <SectionCard title="Case Coordinator" icon={<User className="w-4 h-4" />}>
              <Row>
                <TextInput label="Coordinator Name" value={f("caseCoordinatorName")} onChange={v => set("caseCoordinatorName", v)} />
                <TextInput label="Coordinator Email" value={f("caseCoordinatorEmail")} onChange={v => set("caseCoordinatorEmail", v)} />
                <TextInput label="Coordinator Phone" value={f("caseCoordinatorPhone")} onChange={v => set("caseCoordinatorPhone", v)} />
              </Row>
            </SectionCard>
            <SectionCard title="Products Ordered" icon={<ClipboardList className="w-4 h-4" />}>
              <div className="flex flex-wrap gap-2">
                {PRODUCTS.map(p => {
                  const ordered = arr<string>("productsOrdered");
                  const checked = ordered.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        const next = checked ? ordered.filter(x => x !== p.id) : [...ordered, p.id];
                        set("productsOrdered", next);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${checked ? "text-white border-transparent" : "border-border text-muted-foreground hover:border-primary"}`}
                      style={checked ? { background: "oklch(0.28 0.07 155)" } : {}}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── CLIENTS ─────────────────────────────────────────────────────── */}
          <TabsContent value="clients">
            <SectionCard title="Client 1 — Personal Details" icon={<User className="w-4 h-4" />}>
              <Row>
                <TextInput label="Prefix" value={f("client1Prefix")} onChange={v => set("client1Prefix", v)} placeholder="Mr/Mrs/Dr" />
                <TextInput label="First Name" value={f("client1FirstName")} onChange={v => set("client1FirstName", v)} />
                <TextInput label="Middle Name" value={f("client1MiddleName")} onChange={v => set("client1MiddleName", v)} />
              </Row>
              <Row>
                <TextInput label="Last Name" value={f("client1LastName")} onChange={v => set("client1LastName", v)} />
                <TextInput label="Date of Birth" value={f("client1Dob")} onChange={v => set("client1Dob", v)} placeholder="DD/MM/YYYY" />
                <SelectInput label="Marital Status" value={f("client1MaritalStatus")} onChange={v => set("client1MaritalStatus", v)} options={[{ value: "single", label: "Single" }, { value: "married", label: "Married" }, { value: "civil_partnership", label: "Civil Partnership" }, { value: "divorced", label: "Divorced" }, { value: "widowed", label: "Widowed" }, { value: "cohabiting", label: "Cohabiting" }]} />
              </Row>
              <Row>
                <TextInput label="Job Title" value={f("client1JobTitle")} onChange={v => set("client1JobTitle", v)} />
                <TextInput label="Nationality" value={f("client1Nationality")} onChange={v => set("client1Nationality", v)} />
              </Row>
              <Separator />
              <Row>
                <TextInput label="Address Line 1" value={f("client1AddressLine1")} onChange={v => set("client1AddressLine1", v)} />
                <TextInput label="City" value={f("client1City")} onChange={v => set("client1City", v)} />
                <TextInput label="Postcode" value={f("client1Postcode")} onChange={v => set("client1Postcode", v)} />
              </Row>
              <Row>
                <TextInput label="Daytime Phone" value={f("client1DaytimePhone")} onChange={v => set("client1DaytimePhone", v)} />
                <TextInput label="Mobile" value={f("client1Mobile")} onChange={v => set("client1Mobile", v)} />
                <TextInput label="Email" value={f("client1Email")} onChange={v => set("client1Email", v)} />
              </Row>
            </SectionCard>

            {isMirror && (
              <SectionCard title="Client 2 — Personal Details" icon={<User className="w-4 h-4" />}>
                <Row>
                  <TextInput label="Prefix" value={f("client2Prefix")} onChange={v => set("client2Prefix", v)} placeholder="Mr/Mrs/Dr" />
                  <TextInput label="First Name" value={f("client2FirstName")} onChange={v => set("client2FirstName", v)} />
                  <TextInput label="Middle Name" value={f("client2MiddleName")} onChange={v => set("client2MiddleName", v)} />
                </Row>
                <Row>
                  <TextInput label="Last Name" value={f("client2LastName")} onChange={v => set("client2LastName", v)} />
                  <TextInput label="Date of Birth" value={f("client2Dob")} onChange={v => set("client2Dob", v)} placeholder="DD/MM/YYYY" />
                  <SelectInput label="Marital Status" value={f("client2MaritalStatus")} onChange={v => set("client2MaritalStatus", v)} options={[{ value: "single", label: "Single" }, { value: "married", label: "Married" }, { value: "civil_partnership", label: "Civil Partnership" }, { value: "divorced", label: "Divorced" }, { value: "widowed", label: "Widowed" }, { value: "cohabiting", label: "Cohabiting" }]} />
                </Row>
                <Row>
                  <TextInput label="Job Title" value={f("client2JobTitle")} onChange={v => set("client2JobTitle", v)} />
                  <TextInput label="Nationality" value={f("client2Nationality")} onChange={v => set("client2Nationality", v)} />
                </Row>
                <Separator />
                <Row>
                  <TextInput label="Address Line 1" value={f("client2AddressLine1")} onChange={v => set("client2AddressLine1", v)} />
                  <TextInput label="City" value={f("client2City")} onChange={v => set("client2City", v)} />
                  <TextInput label="Postcode" value={f("client2Postcode")} onChange={v => set("client2Postcode", v)} />
                </Row>
                <Row>
                  <TextInput label="Daytime Phone" value={f("client2DaytimePhone")} onChange={v => set("client2DaytimePhone", v)} />
                  <TextInput label="Mobile" value={f("client2Mobile")} onChange={v => set("client2Mobile", v)} />
                  <TextInput label="Email" value={f("client2Email")} onChange={v => set("client2Email", v)} />
                </Row>
              </SectionCard>
            )}
          </TabsContent>

          {/* ── EXECUTORS ────────────────────────────────────────────────────── */}
          <TabsContent value="executors">
            <div className="mb-4 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-start gap-2">
              <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Use the <strong>"Appoint Genesis Wills Ltd"</strong> button to add Genesis Wills and Estate Planning Ltd as a professional executor to any list.</span>
            </div>
            <SectionCard title={`${client1Name} — Primary Executors`} icon={<Scale className="w-4 h-4" />}>
              <PersonListEditor
                title="Primary Executors"
                persons={arr<PersonEntry>("client1Executors")}
                onChange={v => set("client1Executors", v)}
                onAppendGenesis={() => set("client1Executors", [...arr<PersonEntry>("client1Executors"), { ...GENESIS_COMPANY }])}
              />
            </SectionCard>
            <SectionCard title={`${client1Name} — Reserved Executors`} icon={<Scale className="w-4 h-4" />}>
              <PersonListEditor
                title="Reserved Executors"
                persons={arr<PersonEntry>("client1ReservedExecutors")}
                onChange={v => set("client1ReservedExecutors", v)}
                onAppendGenesis={() => set("client1ReservedExecutors", [...arr<PersonEntry>("client1ReservedExecutors"), { ...GENESIS_COMPANY }])}
              />
            </SectionCard>
            {isMirror && (
              <>
                <SectionCard title={`${client2Name} — Primary Executors`} icon={<Scale className="w-4 h-4" />}>
                  <PersonListEditor
                    title="Primary Executors"
                    persons={arr<PersonEntry>("client2Executors")}
                    onChange={v => set("client2Executors", v)}
                    onAppendGenesis={() => set("client2Executors", [...arr<PersonEntry>("client2Executors"), { ...GENESIS_COMPANY }])}
                  />
                </SectionCard>
                <SectionCard title={`${client2Name} — Reserved Executors`} icon={<Scale className="w-4 h-4" />}>
                  <PersonListEditor
                    title="Reserved Executors"
                    persons={arr<PersonEntry>("client2ReservedExecutors")}
                    onChange={v => set("client2ReservedExecutors", v)}
                    onAppendGenesis={() => set("client2ReservedExecutors", [...arr<PersonEntry>("client2ReservedExecutors"), { ...GENESIS_COMPANY }])}
                  />
                </SectionCard>
              </>
            )}
            <SectionCard title="Trustees" icon={<Scale className="w-4 h-4" />}>
              <PersonListEditor
                title="Trustees"
                persons={arr<PersonEntry>("trustees")}
                onChange={v => set("trustees", v)}
                onAppendGenesis={() => set("trustees", [...arr<PersonEntry>("trustees"), { ...GENESIS_COMPANY }])}
              />
            </SectionCard>
          </TabsContent>

          {/* ── GUARDIANS ────────────────────────────────────────────────────── */}
          <TabsContent value="guardians">
            <SectionCard title={`${client1Name} — Primary Guardians`} icon={<Shield className="w-4 h-4" />}>
              <PersonListEditor title="Primary Guardians" persons={arr<PersonEntry>("client1Guardians")} onChange={v => set("client1Guardians", v)} />
            </SectionCard>
            <SectionCard title={`${client1Name} — Reserved Guardians`} icon={<Shield className="w-4 h-4" />}>
              <PersonListEditor title="Reserved Guardians" persons={arr<PersonEntry>("client1ReservedGuardians")} onChange={v => set("client1ReservedGuardians", v)} />
            </SectionCard>
            {isMirror && (
              <>
                <SectionCard title={`${client2Name} — Primary Guardians`} icon={<Shield className="w-4 h-4" />}>
                  <PersonListEditor title="Primary Guardians" persons={arr<PersonEntry>("client2Guardians")} onChange={v => set("client2Guardians", v)} />
                </SectionCard>
                <SectionCard title={`${client2Name} — Reserved Guardians`} icon={<Shield className="w-4 h-4" />}>
                  <PersonListEditor title="Reserved Guardians" persons={arr<PersonEntry>("client2ReservedGuardians")} onChange={v => set("client2ReservedGuardians", v)} />
                </SectionCard>
              </>
            )}
          </TabsContent>

          {/* ── BENEFICIARIES ────────────────────────────────────────────────── */}
          <TabsContent value="beneficiaries">
            <SectionCard title={`${client1Name} — Named Beneficiaries`} icon={<Users className="w-4 h-4" />}>
              <PersonListEditor title="Named Beneficiaries" persons={arr<PersonEntry>("client1Beneficiaries")} onChange={v => set("client1Beneficiaries", v)} showShare showVulnerable />
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextAreaInput label="Residuary Estate Instructions" value={f("client1ResidualEstate")} onChange={v => set("client1ResidualEstate", v)} rows={3} />
                <TextAreaInput label="Backup / Disaster Clause" value={f("client1ResidualBackup")} onChange={v => set("client1ResidualBackup", v)} rows={3} />
              </div>
              <Row>
                <TextInput label="Children Benefit Age" value={f("client1ChildrenBenefitAge")} onChange={v => set("client1ChildrenBenefitAge", v)} placeholder="e.g. 25" />
                <YesNoInput label="Has Vulnerable Beneficiary?" value={f("client1HasVulnerableBeneficiary")} onChange={v => set("client1HasVulnerableBeneficiary", v)} />
              </Row>
              {f("client1HasVulnerableBeneficiary") === "yes" && (
                <TextAreaInput label="Vulnerable Beneficiary Details" value={f("client1VulnerableBeneficiaryDetails")} onChange={v => set("client1VulnerableBeneficiaryDetails", v)} rows={2} />
              )}
            </SectionCard>
            {isMirror && (
              <SectionCard title={`${client2Name} — Named Beneficiaries`} icon={<Users className="w-4 h-4" />}>
                <PersonListEditor title="Named Beneficiaries" persons={arr<PersonEntry>("client2Beneficiaries")} onChange={v => set("client2Beneficiaries", v)} showShare showVulnerable />
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextAreaInput label="Residuary Estate Instructions" value={f("client2ResidualEstate")} onChange={v => set("client2ResidualEstate", v)} rows={3} />
                  <TextAreaInput label="Backup / Disaster Clause" value={f("client2ResidualBackup")} onChange={v => set("client2ResidualBackup", v)} rows={3} />
                </div>
                <Row>
                  <TextInput label="Children Benefit Age" value={f("client2ChildrenBenefitAge")} onChange={v => set("client2ChildrenBenefitAge", v)} placeholder="e.g. 25" />
                  <YesNoInput label="Has Vulnerable Beneficiary?" value={f("client2HasVulnerableBeneficiary")} onChange={v => set("client2HasVulnerableBeneficiary", v)} />
                </Row>
                {f("client2HasVulnerableBeneficiary") === "yes" && (
                  <TextAreaInput label="Vulnerable Beneficiary Details" value={f("client2VulnerableBeneficiaryDetails")} onChange={v => set("client2VulnerableBeneficiaryDetails", v)} rows={2} />
                )}
              </SectionCard>
            )}
          </TabsContent>

          {/* ── GIFTS ────────────────────────────────────────────────────────── */}
          <TabsContent value="gifts">
            <SectionCard title={`${client1Name} — Specific Gifts & Legacies`} icon={<Heart className="w-4 h-4" />}>
              <GiftListEditor title="Gifts" gifts={arr<GiftEntry>("client1SpecificGifts")} onChange={v => set("client1SpecificGifts", v)} />
            </SectionCard>
            {isMirror && (
              <SectionCard title={`${client2Name} — Specific Gifts & Legacies`} icon={<Heart className="w-4 h-4" />}>
                <GiftListEditor title="Gifts" gifts={arr<GiftEntry>("client2SpecificGifts")} onChange={v => set("client2SpecificGifts", v)} />
              </SectionCard>
            )}
            <SectionCard title="Disaster Clause & Additional Notes" icon={<FileText className="w-4 h-4" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextAreaInput label={`${client1Name} — Disaster Clause`} value={f("disasterClauseClient1")} onChange={v => set("disasterClauseClient1", v)} rows={3} />
                {isMirror && <TextAreaInput label={`${client2Name} — Disaster Clause`} value={f("disasterClauseClient2")} onChange={v => set("disasterClauseClient2", v)} rows={3} />}
              </div>
              <TextAreaInput label="General Disaster Clause Notes" value={f("disasterClauseNotes")} onChange={v => set("disasterClauseNotes", v)} rows={3} />
            </SectionCard>
          </TabsContent>

          {/* ── PROPERTY & ASSETS ────────────────────────────────────────────── */}
          <TabsContent value="property">
            <SectionCard title="Property" icon={<Home className="w-4 h-4" />}>
              <Row>
                <YesNoInput label="Property Owned?" value={f("propertyOwned")} onChange={v => set("propertyOwned", v)} />
                <SelectInput label="Ownership Type" value={f("propertyOwnership")} onChange={v => set("propertyOwnership", v)} options={[{ value: "sole", label: "Sole" }, { value: "joint_tenants", label: "Joint Tenants" }, { value: "tenants_in_common", label: "Tenants in Common" }]} />
                <TextInput label="Property Value (£)" value={f("propertyValue")} onChange={v => set("propertyValue", v)} />
              </Row>
              <TextAreaInput label="Property Address" value={f("propertyAddress")} onChange={v => set("propertyAddress", v)} rows={2} />
              <Row>
                <YesNoInput label="Mortgage Outstanding?" value={f("mortgageOutstanding")} onChange={v => set("mortgageOutstanding", v)} />
                <TextInput label="Mortgage Balance (£)" value={f("mortgageBalance")} onChange={v => set("mortgageBalance", v)} />
                <TextInput label="Term Remaining" value={f("mortgageTermRemaining")} onChange={v => set("mortgageTermRemaining", v)} />
              </Row>
              <TextInput label="Mortgage Lender" value={f("mortgageLender")} onChange={v => set("mortgageLender", v)} />
              <Row>
                <YesNoInput label="Other Properties?" value={f("hasOtherProperties")} onChange={v => set("hasOtherProperties", v)} />
                <YesNoInput label="Assets Outside UK?" value={f("assetsOutsideUK")} onChange={v => set("assetsOutsideUK", v)} />
              </Row>
              {f("hasOtherProperties") === "yes" && <TextAreaInput label="Other Properties Details" value={f("otherProperties")} onChange={v => set("otherProperties", v)} rows={2} />}
              {f("assetsOutsideUK") === "yes" && <TextAreaInput label="Assets Outside UK Details" value={f("assetsOutsideUKDetails")} onChange={v => set("assetsOutsideUKDetails", v)} rows={2} />}
            </SectionCard>

            <SectionCard title={`${client1Name} — Financial Assets`} icon={<Home className="w-4 h-4" />}>
              <TextAreaInput label="Bank Accounts" value={f("bankAccounts")} onChange={v => set("bankAccounts", v)} rows={2} />
              <TextAreaInput label="Investments" value={f("investments")} onChange={v => set("investments", v)} rows={2} />
              <TextAreaInput label="Pension Details" value={f("pensionDetails")} onChange={v => set("pensionDetails", v)} rows={2} />
              <TextInput label="Estimated Estate Value (£)" value={f("estimatedEstateValue")} onChange={v => set("estimatedEstateValue", v)} />
            </SectionCard>

            {isMirror && (
              <SectionCard title={`${client2Name} — Financial Assets`} icon={<Home className="w-4 h-4" />}>
                <TextAreaInput label="Bank Accounts" value={f("client2BankAccounts")} onChange={v => set("client2BankAccounts", v)} rows={2} />
                <TextAreaInput label="Investments" value={f("client2Investments")} onChange={v => set("client2Investments", v)} rows={2} />
                <TextAreaInput label="Pension Details" value={f("client2PensionDetails")} onChange={v => set("client2PensionDetails", v)} rows={2} />
                <TextInput label="Estimated Estate Value (£)" value={f("client2EstimatedEstateValue")} onChange={v => set("client2EstimatedEstateValue", v)} />
              </SectionCard>
            )}

            <SectionCard title="Life Insurance & Protection" icon={<Shield className="w-4 h-4" />}>
              <YesNoInput label="Has Life Insurance?" value={f("hasLifeInsurance")} onChange={v => set("hasLifeInsurance", v)} />
              {f("hasLifeInsurance") === "yes" && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Policies</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => set("lifeInsurancePolicies", [...arr<PolicyEntry>("lifeInsurancePolicies"), {}])}>
                        <Plus className="w-3 h-3" />Add Policy
                      </Button>
                    </div>
                    {arr<PolicyEntry>("lifeInsurancePolicies").map((p, i) => (
                      <PolicyEditor
                        key={i}
                        policy={p}
                        index={i}
                        onChange={u => { const n = [...arr<PolicyEntry>("lifeInsurancePolicies")]; n[i] = u; set("lifeInsurancePolicies", n); }}
                        onRemove={() => set("lifeInsurancePolicies", arr<PolicyEntry>("lifeInsurancePolicies").filter((_, idx) => idx !== i))}
                      />
                    ))}
                  </div>
                  <TextAreaInput label="Life Insurance Notes" value={f("lifeInsuranceNotes")} onChange={v => set("lifeInsuranceNotes", v)} rows={2} />
                </>
              )}
            </SectionCard>

            <SectionCard title="Business Interests" icon={<Building2 className="w-4 h-4" />}>
              <YesNoInput label="Has Business Interests?" value={f("hasBusinessInterests")} onChange={v => set("hasBusinessInterests", v)} />
              {f("hasBusinessInterests") === "yes" && (
                <>
                  <TextAreaInput label="Business Interests Overview" value={f("businessInterests")} onChange={v => set("businessInterests", v)} rows={2} />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Business Entries</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => set("businessInterestsDetails", [...arr<BusinessEntry>("businessInterestsDetails"), {}])}>
                        <Plus className="w-3 h-3" />Add
                      </Button>
                    </div>
                    {arr<BusinessEntry>("businessInterestsDetails").map((b, i) => (
                      <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => set("businessInterestsDetails", arr<BusinessEntry>("businessInterestsDetails").filter((_, idx) => idx !== i))}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <TextInput label="Business Name" value={s(b.businessName)} onChange={v => { const n = [...arr<BusinessEntry>("businessInterestsDetails")]; n[i] = { ...b, businessName: v }; set("businessInterestsDetails", n); }} />
                          <TextInput label="Nature of Business" value={s(b.natureOfBusiness)} onChange={v => { const n = [...arr<BusinessEntry>("businessInterestsDetails")]; n[i] = { ...b, natureOfBusiness: v }; set("businessInterestsDetails", n); }} />
                          <TextInput label="Ownership %" value={s(b.ownershipPercentage)} onChange={v => { const n = [...arr<BusinessEntry>("businessInterestsDetails")]; n[i] = { ...b, ownershipPercentage: v }; set("businessInterestsDetails", n); }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard title="Care Concerns" icon={<AlertTriangle className="w-4 h-4" />}>
              <Row>
                <YesNoInput label="Care Concerns?" value={f("careConcerns")} onChange={v => set("careConcerns", v)} />
              </Row>
              {f("careConcerns") === "yes" && <TextAreaInput label="Care Concern Details" value={f("careConcernDetails")} onChange={v => set("careConcernDetails", v)} rows={2} />}
            </SectionCard>
          </TabsContent>

          {/* ── WISHES & FUNERAL ─────────────────────────────────────────────── */}
          <TabsContent value="wishes">
            <SectionCard title={`${client1Name} — Funeral Wishes`} icon={<Flower2 className="w-4 h-4" />}>
              <Row>
                <SelectInput label="Funeral Type" value={f("client1FuneralType") || f("funeralType")} onChange={v => set("client1FuneralType", v)} options={[{ value: "burial", label: "Burial" }, { value: "cremation", label: "Cremation" }, { value: "no_preference", label: "No Preference" }]} />
                <YesNoInput label="Organ Donation?" value={f("client1OrganDonation") || f("organDonation")} onChange={v => set("client1OrganDonation", v)} />
              </Row>
              <TextAreaInput label="Funeral Wishes" value={f("client1FuneralWishes") || f("funeralWishes")} onChange={v => set("client1FuneralWishes", v)} rows={4} />
            </SectionCard>
            {isMirror && (
              <SectionCard title={`${client2Name} — Funeral Wishes`} icon={<Flower2 className="w-4 h-4" />}>
                <Row>
                  <SelectInput label="Funeral Type" value={f("client2FuneralType")} onChange={v => set("client2FuneralType", v)} options={[{ value: "burial", label: "Burial" }, { value: "cremation", label: "Cremation" }, { value: "no_preference", label: "No Preference" }]} />
                  <YesNoInput label="Organ Donation?" value={f("client2OrganDonation")} onChange={v => set("client2OrganDonation", v)} />
                </Row>
                <TextAreaInput label="Funeral Wishes" value={f("client2FuneralWishes")} onChange={v => set("client2FuneralWishes", v)} rows={4} />
              </SectionCard>
            )}
            <SectionCard title="Disaster Clause" icon={<AlertTriangle className="w-4 h-4" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextAreaInput label={`${client1Name} — Disaster Clause`} value={f("disasterClauseClient1")} onChange={v => set("disasterClauseClient1", v)} rows={3} />
                {isMirror && <TextAreaInput label={`${client2Name} — Disaster Clause`} value={f("disasterClauseClient2")} onChange={v => set("disasterClauseClient2", v)} rows={3} />}
              </div>
              <TextAreaInput label="General Disaster Clause Notes" value={f("disasterClauseNotes")} onChange={v => set("disasterClauseNotes", v)} rows={3} />
            </SectionCard>
            <SectionCard title="Pets" icon={<Heart className="w-4 h-4" />}>
              <YesNoInput label="Has Pets?" value={f("hasPets")} onChange={v => set("hasPets", v)} />
              {f("hasPets") === "yes" && (
                <>
                  <TextAreaInput label="Pets Details" value={f("petsDetails")} onChange={v => set("petsDetails", v)} rows={2} />
                  <TextAreaInput label="Pets Carer" value={f("petsCarer")} onChange={v => set("petsCarer", v)} rows={2} />
                </>
              )}
            </SectionCard>
            <SectionCard title="Additional Notes" icon={<FileText className="w-4 h-4" />}>
              <TextAreaInput label="Additional Notes" value={f("additionalNotes") || f("specialNotes")} onChange={v => set("additionalNotes", v)} rows={4} />
            </SectionCard>
          </TabsContent>

          {/* ── FAMILY & BACKGROUND ──────────────────────────────────────────── */}
          <TabsContent value="family">
            <SectionCard title={`${client1Name} — Family Background`} icon={<Baby className="w-4 h-4" />}>
              <Row>
                <YesNoInput label="Plans to Marry?" value={f("client1MarriagePlans")} onChange={v => set("client1MarriagePlans", v)} />
                <YesNoInput label="Has Children?" value={f("client1HasChildren")} onChange={v => set("client1HasChildren", v)} />
                <TextInput label="Total Children" value={f("client1TotalChildren")} onChange={v => set("client1TotalChildren", v)} />
              </Row>
              {f("client1MarriagePlans") === "yes" && <TextAreaInput label="Marriage Plan Details" value={f("client1MarriagePlanDetails")} onChange={v => set("client1MarriagePlanDetails", v)} rows={2} />}
              <Row>
                <YesNoInput label="Children with Special Needs?" value={f("client1ChildrenSpecialNeeds")} onChange={v => set("client1ChildrenSpecialNeeds", v)} />
                <YesNoInput label="Children from Past Relationships?" value={f("client1ChildrenPastRelationships")} onChange={v => set("client1ChildrenPastRelationships", v)} />
              </Row>
              {f("client1ChildrenSpecialNeeds") === "yes" && <TextAreaInput label="Special Needs Details" value={f("client1ChildrenSpecialNeedsDetails")} onChange={v => set("client1ChildrenSpecialNeedsDetails", v)} rows={2} />}
              {f("client1ChildrenPastRelationships") === "yes" && <TextAreaInput label="Past Relationship Children Details" value={f("client1ChildrenPastDetails")} onChange={v => set("client1ChildrenPastDetails", v)} rows={2} />}
              <TextAreaInput label="Family Circumstances" value={f("client1FamilyCircumstances")} onChange={v => set("client1FamilyCircumstances", v)} rows={3} />
            </SectionCard>
            <SectionCard title={`${client1Name} — Additional Background`} icon={<User className="w-4 h-4" />}>
              <Row>
                <SelectInput label="Residency" value={f("client1Residency")} onChange={v => set("client1Residency", v)} options={[{ value: "UK", label: "UK" }, { value: "Non-UK", label: "Non-UK" }, { value: "Dual", label: "Dual" }]} />
                <YesNoInput label="Domiciled in UK?" value={f("client1DomiciledUK")} onChange={v => set("client1DomiciledUK", v)} />
                <YesNoInput label="Mental Capacity Confirmed?" value={f("client1MentalCapacity")} onChange={v => set("client1MentalCapacity", v)} />
              </Row>
              {f("client1MentalCapacity") === "no" && <TextAreaInput label="Mental Capacity Notes" value={f("client1MentalCapacityNotes")} onChange={v => set("client1MentalCapacityNotes", v)} rows={2} />}
            </SectionCard>
            {isMirror && (
              <>
                <SectionCard title={`${client2Name} — Family Background`} icon={<Baby className="w-4 h-4" />}>
                  <Row>
                    <YesNoInput label="Plans to Marry?" value={f("client2MarriagePlans")} onChange={v => set("client2MarriagePlans", v)} />
                    <YesNoInput label="Has Children?" value={f("client2HasChildren")} onChange={v => set("client2HasChildren", v)} />
                    <TextInput label="Total Children" value={f("client2TotalChildren")} onChange={v => set("client2TotalChildren", v)} />
                  </Row>
                  {f("client2MarriagePlans") === "yes" && <TextAreaInput label="Marriage Plan Details" value={f("client2MarriagePlanDetails")} onChange={v => set("client2MarriagePlanDetails", v)} rows={2} />}
                  <Row>
                    <YesNoInput label="Children with Special Needs?" value={f("client2ChildrenSpecialNeeds")} onChange={v => set("client2ChildrenSpecialNeeds", v)} />
                    <YesNoInput label="Children from Past Relationships?" value={f("client2ChildrenPastRelationships")} onChange={v => set("client2ChildrenPastRelationships", v)} />
                  </Row>
                  {f("client2ChildrenSpecialNeeds") === "yes" && <TextAreaInput label="Special Needs Details" value={f("client2ChildrenSpecialNeedsDetails")} onChange={v => set("client2ChildrenSpecialNeedsDetails", v)} rows={2} />}
                  {f("client2ChildrenPastRelationships") === "yes" && <TextAreaInput label="Past Relationship Children Details" value={f("client2ChildrenPastDetails")} onChange={v => set("client2ChildrenPastDetails", v)} rows={2} />}
                  <TextAreaInput label="Family Circumstances" value={f("client2FamilyCircumstances")} onChange={v => set("client2FamilyCircumstances", v)} rows={3} />
                </SectionCard>
                <SectionCard title={`${client2Name} — Additional Background`} icon={<User className="w-4 h-4" />}>
                  <Row>
                    <SelectInput label="Residency" value={f("client2Residency")} onChange={v => set("client2Residency", v)} options={[{ value: "UK", label: "UK" }, { value: "Non-UK", label: "Non-UK" }, { value: "Dual", label: "Dual" }]} />
                    <YesNoInput label="Domiciled in UK?" value={f("client2DomiciledUK")} onChange={v => set("client2DomiciledUK", v)} />
                    <YesNoInput label="Mental Capacity Confirmed?" value={f("client2MentalCapacity")} onChange={v => set("client2MentalCapacity", v)} />
                  </Row>
                  {f("client2MentalCapacity") === "no" && <TextAreaInput label="Mental Capacity Notes" value={f("client2MentalCapacityNotes")} onChange={v => set("client2MentalCapacityNotes", v)} rows={2} />}
                </SectionCard>
              </>
            )}
          </TabsContent>

          {/* ── DUE DILIGENCE ────────────────────────────────────────────────── */}
          <TabsContent value="duediligence">
            <div className="space-y-4">
              {/* Meeting Details */}
              <SectionCard title="Meeting Details" icon={<ClipboardList className="w-4 h-4" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput label="How long has the client been our client?" value={f("ddClientSince")} onChange={v => set("ddClientSince", v)} placeholder="e.g. 2 years, New client" />
                  <TextInput label="When was contact first made?" value={f("ddFirstContactDate")} onChange={v => set("ddFirstContactDate", v)} placeholder="e.g. 01/01/2024" />
                </div>
                <SelectInput
                  label="How did the meeting take place?"
                  value={f("ddMeetingType")}
                  onChange={v => set("ddMeetingType", v)}
                  options={[
                    { value: "consultant_office", label: "Consultant office" },
                    { value: "client_house", label: "Client house" },
                    { value: "video_call", label: "Video Call" },
                    { value: "telephone", label: "Telephone" },
                  ]}
                />
                <div className="space-y-2">
                  <YesNoInput label="Was anyone else present at the meeting other than yourself and the client?" value={f("ddOthersPresent")} onChange={v => set("ddOthersPresent", v)} />
                  {f("ddOthersPresent") === "yes" && (
                    <TextAreaInput label="Name and relation to client of person(s) present" value={f("ddOthersPresentNotes")} onChange={v => set("ddOthersPresentNotes", v)} rows={2} />
                  )}
                </div>
              </SectionCard>

              {/* Client Capacity */}
              <SectionCard title="Client Capacity" icon={<AlertTriangle className="w-4 h-4" />}>
                <div className="space-y-3">
                  <YesNoInput label="Is the client able to see (i.e. not blind or visually impaired)?" value={f("ddClientCanSee")} onChange={v => set("ddClientCanSee", v)} />
                  <YesNoInput label="Is the client able to hear (i.e. not suffering from hearing loss or impairment)?" value={f("ddClientCanHear")} onChange={v => set("ddClientCanHear", v)} />
                  <YesNoInput label="Is the client able to speak?" value={f("ddClientCanSpeak")} onChange={v => set("ddClientCanSpeak", v)} />
                </div>
              </SectionCard>

              {/* Standard Compliance Questions */}
              <SectionCard title="Compliance Questions" icon={<AlertTriangle className="w-4 h-4" />}>
                {[
                  { yesNo: "ddArrangedAppointment", notes: "ddArrangedAppointmentNotes", label: "Did the client arrange the appointment themselves?" },
                  { yesNo: "ddKnowledgeOfEstate", notes: "ddKnowledgeOfEstateNotes", label: "Did the client have knowledge of their estate?" },
                  { yesNo: "ddKnewBeneficiaries", notes: "ddKnewBeneficiariesNotes", label: "Did the client know their beneficiaries?" },
                  { yesNo: "ddSignsOfInfluence", notes: "ddSignsOfInfluenceNotes", label: "Were there any signs of undue influence?" },
                  { yesNo: "ddKnewAppointees", notes: "ddKnewAppointeesNotes", label: "Did the client know their appointees (executors/guardians)?" },
                ].map(q => (
                  <div key={q.yesNo} className="space-y-2 pb-4 border-b border-border last:border-0 last:pb-0">
                    <YesNoInput label={q.label} value={f(q.yesNo)} onChange={v => set(q.yesNo, v)} />
                    <TextAreaInput label="Notes" value={f(q.notes)} onChange={v => set(q.notes, v)} rows={2} />
                  </div>
                ))}
              </SectionCard>
            </div>
          </TabsContent>

          {/* ── OPTIONAL CLAUSES ───────────────────────────────────────────── */}
          <TabsContent value="optionalclauses">
            <SectionCard title="Optional Trust Clauses" icon={<Scale className="w-4 h-4" />}>
              <OptionalClausesEditor
                data={{
                  protectivePropertyTrusts: arr("protectivePropertyTrusts"),
                  discretionaryTrusts: arr("discretionaryTrusts"),
                  vulnerablePersonTrusts: arr("vulnerablePersonTrusts"),
                  nilRateBandTrusts: arr("nilRateBandTrusts"),
                  bereavedMinorTrusts: arr("bereavedMinorTrusts"),
                  age18To25Trusts: arr("age18To25Trusts"),
                  businessPropertyReliefs: arr("businessPropertyReliefs"),
                }}
                onChange={(updated: OptionalClausesData) => {
                  Object.entries(updated).forEach(([key, value]) => set(key, value));
                }}
              />
            </SectionCard>
          </TabsContent>

          {/* ── STATUS & NOTES ───────────────────────────────────────────────── */}
          <TabsContent value="notes">
            {/* Status row */}
            <div className="rounded-xl border border-border overflow-hidden mb-4 bg-white">
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ background: "oklch(0.97 0.015 155)" }}>
                <ClipboardList className="w-4 h-4" style={{ color: "oklch(0.28 0.07 155)" }} />
                <h3 className="font-serif text-sm font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>Submission Status</h3>
              </div>
              <div className="px-5 py-5">
                <div className="flex flex-wrap gap-2">
                  {(["submitted", "processing", "complete", "cancelled", "draft"] as const).map(s => {
                    const colours: Record<string, string> = {
                      submitted: "bg-blue-50 border-blue-200 text-blue-700",
                      processing: "bg-amber-50 border-amber-200 text-amber-700",
                      complete: "bg-green-50 border-green-200 text-green-700",
                      cancelled: "bg-red-50 border-red-200 text-red-700",
                      draft: "bg-gray-50 border-gray-200 text-gray-600",
                    };
                    const active = f("status") === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set("status", s)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                          active
                            ? colours[s] + " ring-2 ring-offset-1 ring-current shadow-sm"
                            : "bg-white border-border text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Manual notes */}
            <div className="rounded-xl border border-border overflow-hidden mb-4 bg-white">
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ background: "oklch(0.97 0.015 155)" }}>
                <FileText className="w-4 h-4" style={{ color: "oklch(0.28 0.07 155)" }} />
                <h3 className="font-serif text-sm font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>Manual Needs Assessment</h3>
              </div>
              <div className="px-5 py-5">
                <Textarea
                  value={f("manualNeedsAssessment")}
                  onChange={e => set("manualNeedsAssessment", e.target.value)}
                  rows={6}
                  placeholder="Enter manual needs assessment and recommendations here…"
                  className="text-sm resize-none w-full"
                />
              </div>
            </div>

            {/* AI outputs */}
            <div className="rounded-xl border border-border overflow-hidden bg-white">
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ background: "oklch(0.97 0.015 155)" }}>
                <FileText className="w-4 h-4" style={{ color: "oklch(0.28 0.07 155)" }} />
                <h3 className="font-serif text-sm font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>AI Outputs</h3>
                <span className="ml-auto text-xs text-muted-foreground">Read-only</span>
              </div>
              <div className="px-5 py-5 space-y-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Recommendation Narrative</p>
                  <div className="text-sm text-foreground bg-muted/20 rounded-lg p-4 whitespace-pre-wrap min-h-[80px] border border-border/50">
                    {f("aiRecommendationNarrative") || <span className="text-muted-foreground italic">Not yet generated.</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Client Email Draft</p>
                  <div className="text-sm text-foreground bg-muted/20 rounded-lg p-4 whitespace-pre-wrap min-h-[80px] border border-border/50">
                    {f("aiClientEmailDraft") || <span className="text-muted-foreground italic">Not yet generated.</span>}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating save bar */}
        {dirty && (
          <div className="fixed bottom-6 right-6 z-30">
            <Button
              size="lg"
              className="shadow-xl gap-2"
              style={{ background: "oklch(0.28 0.07 155)" }}
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Import to V2 Button ──────────────────────────────────────────────────────

function ImportToV2Button({ submissionId, isMirror }: { submissionId: number; isMirror: boolean }) {
  const [, navigate] = useLocation();
  const [showDialog, setShowDialog] = useState(false);

  const transferMutation = trpc.matters.transferFromInstruction.useMutation({
    onSuccess: (data) => {
      toast.success(`Transferred to V2 — Matter #${data.matterId} created`);
      setShowDialog(false);
      navigate(`/admin/wills/${data.matterId}`);
    },
    onError: (err) => toast.error(`Transfer failed: ${err.message}`),
  });

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 bg-white border-purple-500 text-purple-700 hover:bg-purple-50"
        onClick={() => setShowDialog(true)}
        title="Transfer this submission into Will Drafting V2"
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
        Transfer to V2
      </Button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold mb-1">Transfer to Will Drafting V2</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This will create a new <strong>{isMirror ? "Mirror" : "Single"} Will</strong> matter in the V2 drafting
              system, pre-populated with all client data from this submission — clients, executors, guardians,
              beneficiaries, gifts, property, and wishes. No information needs to be re-entered.
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-5">
              A new matter will be created. This submission will remain unchanged.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDialog(false)} disabled={transferMutation.isPending}>Cancel</Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                onClick={() => transferMutation.mutate({ instructionId: submissionId })}
                disabled={transferMutation.isPending}
              >
                {transferMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                {transferMutation.isPending ? "Transferring…" : "Transfer Now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
