import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus, Trash2, User, Baby, Heart, Scroll, UserCog,
  Gift, PawPrint, Home, Briefcase
} from "lucide-react";

type FullMatter = any;

interface Props {
  matter: FullMatter;
  onSaved: () => void;
}

// ── Small reusable person-row component ──────────────────────────────────────

interface PersonRowProps {
  label: string;
  name: string;
  address: string;
  onChangeName: (v: string) => void;
  onChangeAddress: (v: string) => void;
  onRemove: () => void;
  showRemove?: boolean;
  extraFields?: React.ReactNode;
}

function PersonRow({ label, name, address, onChangeName, onChangeAddress, onRemove, showRemove = true, extraFields }: PersonRowProps) {
  return (
    <div className="border border-border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {showRemove && (
          <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Full Name</Label>
          <Input value={name} onChange={e => onChangeName(e.target.value)} placeholder="Full legal name" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Address</Label>
          <Input value={address} onChange={e => onChangeAddress(e.target.value)} placeholder="Address" className="h-8 text-sm" />
        </div>
      </div>
      {extraFields}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function MatterForm({ matter, onSaved }: Props) {
  const isMirror = matter.matterType === "mirror";
  const utils = trpc.useUtils();

  // ── Client state ──────────────────────────────────────────────────────────
  const [t1, setT1] = useState({
    fullName: matter.clients?.find((c: any) => c.clientRole === "testator1")?.fullName || "",
    address: matter.clients?.find((c: any) => c.clientRole === "testator1")?.address || "",
    dateOfBirth: matter.clients?.find((c: any) => c.clientRole === "testator1")?.dateOfBirth || "",
    email: matter.clients?.find((c: any) => c.clientRole === "testator1")?.email || "",
    phone: matter.clients?.find((c: any) => c.clientRole === "testator1")?.phone || "",
  });
  const [t2, setT2] = useState({
    fullName: matter.clients?.find((c: any) => c.clientRole === "testator2")?.fullName || "",
    address: matter.clients?.find((c: any) => c.clientRole === "testator2")?.address || "",
    dateOfBirth: matter.clients?.find((c: any) => c.clientRole === "testator2")?.dateOfBirth || "",
    email: matter.clients?.find((c: any) => c.clientRole === "testator2")?.email || "",
    phone: matter.clients?.find((c: any) => c.clientRole === "testator2")?.phone || "",
  });

  // ── Executor state ────────────────────────────────────────────────────────
  const toExecRows = (role: string) =>
    (matter.executors || []).filter((e: any) => e.clientRole === role).map((e: any) => ({
      fullName: e.fullName || "",
      address: e.address || "",
      executorType: e.executorType || "primary",
    }));

  const [execs1, setExecs1] = useState<Array<{ fullName: string; address: string; executorType: string }>>(
    toExecRows(isMirror ? "testator1" : "shared")
  );
  const [execs2, setExecs2] = useState<Array<{ fullName: string; address: string; executorType: string }>>(
    toExecRows("testator2")
  );

  // ── Guardian state ────────────────────────────────────────────────────────
  const [guardians, setGuardians] = useState<Array<{ fullName: string; address: string; guardianType: string }>>(
    (matter.guardians || []).map((g: any) => ({
      fullName: g.fullName || "",
      address: g.address || "",
      guardianType: g.guardianType || "primary",
    }))
  );

  // ── Beneficiary state ─────────────────────────────────────────────────────
  const toBenRows = (role: string) =>
    (matter.beneficiaries || []).filter((b: any) => b.clientRole === role).map((b: any): {
      fullName: string; address: string; relationship: string; shareFraction: string; beneficiaryType: string; includeIssue: number;
    } => ({
      fullName: b.fullName || "",
      address: b.address || "",
      relationship: b.relationship || "",
      shareFraction: b.shareFraction || "",
      beneficiaryType: b.beneficiaryType || "primary",
      includeIssue: b.includeIssue ?? 1,
    }));

  const [bens1, setBens1] = useState(toBenRows(isMirror ? "testator1" : "shared"));
  const [bens2, setBens2] = useState(toBenRows("testator2"));

  // ── Wishes state ──────────────────────────────────────────────────────────
  const getWishes = (role: string) => {
    const w = (matter.wishes || []).find((w: any) => w.clientRole === role) || (matter.wishes || [])[0] || {};
    return {
      ageCondition: w.ageCondition ?? 18,
      survivorshipDays: w.survivorshipDays ?? 28,
      organDonation: !!(w.organDonation),
      organDonationText: w.organDonationText || "",
      funeralWishes: w.funeralWishes || "",
      extraNotes: w.extraNotes || "",
      residueToSpouseFirst: w.residueToSpouseFirst ?? 1,
      disasterClauseNotes: w.disasterClauseNotes || "",
      generalNotes: w.generalNotes || "",
    };
  };

  const [wishes1, setWishes1] = useState(getWishes(isMirror ? "testator1" : "shared"));
  const [wishes2, setWishes2] = useState(getWishes("testator2"));

  // ── Gifts state ───────────────────────────────────────────────────────────
  const toGiftRows = (role: string) =>
    (matter.gifts || []).filter((g: any) => g.clientRole === role || g.clientRole === "shared").map((g: any) => ({
      recipientName: g.recipientName || "",
      recipientAddress: g.recipientAddress || "",
      giftDescription: g.giftDescription || "",
      giftType: g.giftType || "asset",
    }));

  const [gifts1, setGifts1] = useState<Array<{ recipientName: string; recipientAddress: string; giftDescription: string; giftType: string }>>(toGiftRows(isMirror ? "testator1" : "shared"));
  const [gifts2, setGifts2] = useState<Array<{ recipientName: string; recipientAddress: string; giftDescription: string; giftType: string }>>(toGiftRows("testator2"));

  // ── Pets state ────────────────────────────────────────────────────────────
  const [pets, setPets] = useState<Array<{
    petName: string; petType: string; carerName: string; carerAddress: string; careNotes: string;
  }>>(
    (matter.pets || []).map((p: any) => ({
      petName: p.petName || "",
      petType: p.petType || "",
      carerName: p.carerName || "",
      carerAddress: p.carerAddress || "",
      careNotes: p.careNotes || "",
    }))
  );

  // ── Property state ────────────────────────────────────────────────────────
  const [properties, setProperties] = useState<Array<{
    address: string; ownershipType: string; mortgageOutstanding: number; mortgageLender: string; propertyNotes: string;
  }>>(
    (matter.properties || []).map((p: any) => ({
      address: p.address || "",
      ownershipType: p.ownershipType || "sole",
      mortgageOutstanding: p.mortgageOutstanding ?? 0,
      mortgageLender: p.mortgageLender || "",
      propertyNotes: p.propertyNotes || "",
    }))
  );

  // ── Business state ────────────────────────────────────────────────────────
  const [businesses, setBusinesses] = useState<Array<{
    businessName: string; businessType: string; sharePercentage: string; businessNotes: string;
  }>>(
    (matter.businesses || []).length > 0
      ? (matter.businesses || []).map((b: any) => ({
          businessName: b.businessName || "",
          businessType: b.businessType || "",
          sharePercentage: b.sharePercentage || "",
          businessNotes: b.businessNotes || "",
        }))
      : [{ businessName: "Genesis Wills and Estate Planning Ltd", businessType: "Limited Company", sharePercentage: "", businessNotes: "" }]
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const saveClient = trpc.matters.saveClient.useMutation();
  const saveExecutors = trpc.matters.saveExecutors.useMutation();
  const saveGuardians = trpc.matters.saveGuardians.useMutation();
  const saveBeneficiaries = trpc.matters.saveBeneficiaries.useMutation();
  const saveWishes = trpc.matters.saveWishes.useMutation();
  const saveGifts = trpc.matters.saveGifts.useMutation();
  const savePets = trpc.matters.savePets.useMutation();
  const saveProperty = trpc.matters.saveProperty.useMutation();
  const saveBusiness = trpc.matters.saveBusiness.useMutation();

  const handleSaveAll = async () => {
    try {
      const ops: Promise<any>[] = [];

      // Clients
      ops.push(saveClient.mutateAsync({ matterId: matter.id, clientRole: "testator1", ...t1 }));
      if (isMirror) ops.push(saveClient.mutateAsync({ matterId: matter.id, clientRole: "testator2", ...t2 }));

      // Executors
      ops.push(saveExecutors.mutateAsync({
        matterId: matter.id,
        clientRole: isMirror ? "testator1" : "shared",
        executors: execs1.map(e => ({ ...e, executorType: e.executorType as "primary" | "substitute" })),
      }));
      if (isMirror) {
        ops.push(saveExecutors.mutateAsync({
          matterId: matter.id,
          clientRole: "testator2",
          executors: execs2.map(e => ({ ...e, executorType: e.executorType as "primary" | "substitute" })),
        }));
      }

      // Guardians
      ops.push(saveGuardians.mutateAsync({
        matterId: matter.id,
        guardians: guardians.map(g => ({ ...g, guardianType: g.guardianType as "primary" | "substitute" })),
      }));

      // Beneficiaries
      ops.push(saveBeneficiaries.mutateAsync({
        matterId: matter.id,
        clientRole: isMirror ? "testator1" : "shared",
        beneficiaries: bens1.map((b: any) => ({
          ...b,
          beneficiaryType: b.beneficiaryType as "primary" | "fallback",
          includeIssue: b.includeIssue as 0 | 1,
        })),
      }));
      if (isMirror) {
        ops.push(saveBeneficiaries.mutateAsync({
          matterId: matter.id,
          clientRole: "testator2",
          beneficiaries: bens2.map((b: any) => ({
            ...b,
            beneficiaryType: b.beneficiaryType as "primary" | "fallback",
            includeIssue: b.includeIssue as 0 | 1,
          })),
        }));
      }

      // Wishes
      ops.push(saveWishes.mutateAsync({
        matterId: matter.id,
        clientRole: isMirror ? "testator1" : "shared",
        wishes: { ...wishes1, organDonation: wishes1.organDonation ? 1 : 0, residueToSpouseFirst: wishes1.residueToSpouseFirst as 0 | 1 },
      }));
      if (isMirror) {
        ops.push(saveWishes.mutateAsync({
          matterId: matter.id,
          clientRole: "testator2",
          wishes: { ...wishes2, organDonation: wishes2.organDonation ? 1 : 0, residueToSpouseFirst: wishes2.residueToSpouseFirst as 0 | 1 },
        }));
      }

      // Gifts
      ops.push(saveGifts.mutateAsync({
        matterId: matter.id,
        clientRole: isMirror ? "testator1" : "shared",
        gifts: gifts1.map(g => ({ ...g, giftType: g.giftType as "monetary" | "asset" | "residue" })),
      }));
      if (isMirror) {
        ops.push(saveGifts.mutateAsync({
          matterId: matter.id,
          clientRole: "testator2",
          gifts: gifts2.map(g => ({ ...g, giftType: g.giftType as "monetary" | "asset" | "residue" })),
        }));
      }

      // Pets
      ops.push(savePets.mutateAsync({ matterId: matter.id, pets }));

      // Property
      ops.push(saveProperty.mutateAsync({
        matterId: matter.id,
        properties: properties.map(p => ({
          ...p,
          ownershipType: p.ownershipType as "sole" | "joint_tenants" | "tenants_in_common",
          mortgageOutstanding: p.mortgageOutstanding as 0 | 1,
        })),
      }));

      // Business
      ops.push(saveBusiness.mutateAsync({ matterId: matter.id, businesses }));

      await Promise.all(ops);
      utils.matters.list.invalidate();
      utils.matters.getById.invalidate({ id: matter.id });
      onSaved();
      toast.success("Matter saved successfully");
    } catch (err) {
      toast.error("Failed to save matter");
    }
  };

  const isSaving = saveClient.isPending || saveExecutors.isPending || saveGuardians.isPending ||
    saveBeneficiaries.isPending || saveWishes.isPending || saveGifts.isPending ||
    savePets.isPending || saveProperty.isPending || saveBusiness.isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="clients">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="clients" className="text-xs gap-1.5">
              <User className="h-3.5 w-3.5" /> Clients
            </TabsTrigger>
            <TabsTrigger value="executors" className="text-xs gap-1.5">
              <UserCog className="h-3.5 w-3.5" /> Executors
            </TabsTrigger>
            <TabsTrigger value="guardians" className="text-xs gap-1.5">
              <Baby className="h-3.5 w-3.5" /> Guardians
            </TabsTrigger>
            <TabsTrigger value="property" className="text-xs gap-1.5">
              <Home className="h-3.5 w-3.5" /> Property
            </TabsTrigger>
            <TabsTrigger value="business" className="text-xs gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Business
            </TabsTrigger>
            <TabsTrigger value="gifts" className="text-xs gap-1.5">
              <Gift className="h-3.5 w-3.5" /> Gifts
            </TabsTrigger>
            <TabsTrigger value="pets" className="text-xs gap-1.5">
              <PawPrint className="h-3.5 w-3.5" /> Pets
            </TabsTrigger>
            <TabsTrigger value="beneficiaries" className="text-xs gap-1.5">
              <Heart className="h-3.5 w-3.5" /> Beneficiaries
            </TabsTrigger>
            <TabsTrigger value="wishes" className="text-xs gap-1.5">
              <Scroll className="h-3.5 w-3.5" /> Wishes
            </TabsTrigger>
          </TabsList>

          {/* ── CLIENTS ─────────────────────────────────────────────────── */}
          <TabsContent value="clients" className="space-y-4">
            <ClientSection label={isMirror ? "Testator 1" : "Testator"} data={t1} onChange={setT1} />
            {isMirror && (
              <>
                <Separator />
                <ClientSection label="Testator 2" data={t2} onChange={setT2} />
              </>
            )}
          </TabsContent>

          {/* ── EXECUTORS ────────────────────────────────────────────────── */}
          <TabsContent value="executors" className="space-y-4">
            <ExecutorSection
              label={isMirror ? `Executors for ${t1.fullName || "Testator 1"}` : "Executors"}
              rows={execs1}
              onChange={setExecs1}
            />
            {isMirror && (
              <>
                <Separator />
                <ExecutorSection
                  label={`Executors for ${t2.fullName || "Testator 2"}`}
                  rows={execs2}
                  onChange={setExecs2}
                />
              </>
            )}
          </TabsContent>

          {/* ── GUARDIANS ────────────────────────────────────────────────── */}
          <TabsContent value="guardians" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Guardians are shared across both Wills for minor children.
            </div>
            <GuardianSection rows={guardians} onChange={setGuardians} />
          </TabsContent>

          {/* ── PROPERTY ─────────────────────────────────────────────────── */}
          <TabsContent value="property" className="space-y-4">
            <PropertySection rows={properties} onChange={setProperties} />
          </TabsContent>

          {/* ── BUSINESS ─────────────────────────────────────────────────── */}
          <TabsContent value="business" className="space-y-4">
            <BusinessSection rows={businesses} onChange={setBusinesses} />
          </TabsContent>

          {/* ── GIFTS ────────────────────────────────────────────────────── */}
          <TabsContent value="gifts" className="space-y-4">
            <GiftsSection
              label={isMirror ? `Specific Gifts from ${t1.fullName || "Testator 1"}` : "Specific Gifts"}
              rows={gifts1}
              onChange={setGifts1}
            />
            {isMirror && (
              <>
                <Separator />
                <GiftsSection
                  label={`Specific Gifts from ${t2.fullName || "Testator 2"}`}
                  rows={gifts2}
                  onChange={setGifts2}
                />
              </>
            )}
          </TabsContent>

          {/* ── PETS ─────────────────────────────────────────────────────── */}
          <TabsContent value="pets" className="space-y-4">
            <PetsSection rows={pets} onChange={setPets} />
          </TabsContent>

          {/* ── BENEFICIARIES ─────────────────────────────────────────────── */}
          <TabsContent value="beneficiaries" className="space-y-4">
            <BeneficiarySection
              label={isMirror ? `Beneficiaries for ${t1.fullName || "Testator 1"}` : "Beneficiaries"}
              partnerName={isMirror ? t2.fullName : undefined}
              rows={bens1}
              onChange={setBens1}
              wishes={wishes1}
              onWishesChange={setWishes1}
            />
            {isMirror && (
              <>
                <Separator />
                <BeneficiarySection
                  label={`Beneficiaries for ${t2.fullName || "Testator 2"}`}
                  partnerName={t1.fullName}
                  rows={bens2}
                  onChange={setBens2}
                  wishes={wishes2}
                  onWishesChange={setWishes2}
                />
              </>
            )}
          </TabsContent>

          {/* ── WISHES ────────────────────────────────────────────────────── */}
          <TabsContent value="wishes" className="space-y-4">
            <WishesSection
              label={isMirror ? `Wishes for ${t1.fullName || "Testator 1"}` : "Wishes & Preferences"}
              data={wishes1}
              onChange={setWishes1}
            />
            {isMirror && (
              <>
                <Separator />
                <WishesSection
                  label={`Wishes for ${t2.fullName || "Testator 2"}`}
                  data={wishes2}
                  onChange={setWishes2}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer save bar */}
      <div className="border-t border-border px-4 py-3 bg-card flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Changes are not auto-saved — click Save when ready.</p>
        <Button onClick={handleSaveAll} disabled={isSaving} size="sm">
          {isSaving ? "Saving…" : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}

// ── Sub-sections ──────────────────────────────────────────────────────────────

function ClientSection({ label, data, onChange }: { label: string; data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">{label}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Full Legal Name *</Label>
          <Input value={data.fullName} onChange={e => onChange({ ...data, fullName: e.target.value })} placeholder="Full name as it appears on ID" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date of Birth</Label>
          <Input type="date" value={data.dateOfBirth} onChange={e => onChange({ ...data, dateOfBirth: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Full Address</Label>
          <Textarea value={data.address} onChange={e => onChange({ ...data, address: e.target.value })} placeholder="Full residential address" rows={2} className="text-sm resize-none" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input type="email" value={data.email} onChange={e => onChange({ ...data, email: e.target.value })} placeholder="email@example.com" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Phone</Label>
          <Input type="tel" value={data.phone} onChange={e => onChange({ ...data, phone: e.target.value })} placeholder="+44 7700 000000" className="h-8 text-sm" />
        </div>
      </div>
    </div>
  );
}

function ExecutorSection({ label, rows, onChange }: { label: string; rows: any[]; onChange: (r: any[]) => void }) {
  const addRow = (type: "primary" | "substitute") => onChange([...rows, { fullName: "", address: "", executorType: type }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: string) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  const primary = rows.filter(r => r.executorType === "primary");
  const substitute = rows.filter(r => r.executorType === "substitute");

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">{label}</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Primary Executors</span>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => addRow("primary")}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {primary.length === 0 && <p className="text-xs text-muted-foreground italic">No primary executors added.</p>}
        {rows.map((r, i) => r.executorType === "primary" && (
          <PersonRow key={i} label={`Primary Executor ${primary.indexOf(r) + 1}`} name={r.fullName} address={r.address}
            onChangeName={v => updateRow(i, "fullName", v)} onChangeAddress={v => updateRow(i, "address", v)} onRemove={() => removeRow(i)} />
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Substitute Executors</span>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => addRow("substitute")}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {substitute.length === 0 && <p className="text-xs text-muted-foreground italic">No substitute executors added.</p>}
        {rows.map((r, i) => r.executorType === "substitute" && (
          <PersonRow key={i} label={`Substitute Executor ${substitute.indexOf(r) + 1}`} name={r.fullName} address={r.address}
            onChangeName={v => updateRow(i, "fullName", v)} onChangeAddress={v => updateRow(i, "address", v)} onRemove={() => removeRow(i)} />
        ))}
      </div>
    </div>
  );
}

function GuardianSection({ rows, onChange }: { rows: any[]; onChange: (r: any[]) => void }) {
  const addRow = (type: "primary" | "substitute") => onChange([...rows, { fullName: "", address: "", guardianType: type }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: string) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  const primary = rows.filter(r => r.guardianType === "primary");
  const substitute = rows.filter(r => r.guardianType === "substitute");

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Primary Guardians</span>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => addRow("primary")}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {primary.length === 0 && <p className="text-xs text-muted-foreground italic">No primary guardians added.</p>}
        {rows.map((r, i) => r.guardianType === "primary" && (
          <PersonRow key={i} label={`Primary Guardian ${primary.indexOf(r) + 1}`} name={r.fullName} address={r.address}
            onChangeName={v => updateRow(i, "fullName", v)} onChangeAddress={v => updateRow(i, "address", v)} onRemove={() => removeRow(i)} />
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Substitute Guardians</span>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => addRow("substitute")}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {substitute.length === 0 && <p className="text-xs text-muted-foreground italic">No substitute guardians added.</p>}
        {rows.map((r, i) => r.guardianType === "substitute" && (
          <PersonRow key={i} label={`Substitute Guardian ${substitute.indexOf(r) + 1}`} name={r.fullName} address={r.address}
            onChangeName={v => updateRow(i, "fullName", v)} onChangeAddress={v => updateRow(i, "address", v)} onRemove={() => removeRow(i)} />
        ))}
      </div>
    </div>
  );
}

function PropertySection({ rows, onChange }: { rows: any[]; onChange: (r: any[]) => void }) {
  const addRow = () => onChange([...rows, { address: "", ownershipType: "sole", mortgageOutstanding: 0, mortgageLender: "", propertyNotes: "" }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: any) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">Property</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record property interests — this informs the property clause in the Will.</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={addRow}>
          <Plus className="h-3 w-3" /> Add Property
        </Button>
      </div>
      {rows.length === 0 && <p className="text-xs text-muted-foreground italic">No properties added — no property clause will appear in the Will.</p>}
      {rows.map((r, i) => (
        <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Property {i + 1}</span>
            <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Full Address</Label>
            <Textarea value={r.address} onChange={e => updateRow(i, "address", e.target.value)} placeholder="Full property address" rows={2} className="text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Ownership Type</Label>
              <Select value={r.ownershipType} onValueChange={v => updateRow(i, "ownershipType", v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole">Sole Ownership</SelectItem>
                  <SelectItem value="joint_tenants">Joint Tenants</SelectItem>
                  <SelectItem value="tenants_in_common">Tenants in Common</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <Switch
                checked={!!r.mortgageOutstanding}
                onCheckedChange={v => updateRow(i, "mortgageOutstanding", v ? 1 : 0)}
                id={`mortgage-${i}`}
              />
              <Label htmlFor={`mortgage-${i}`} className="text-xs cursor-pointer">Mortgage outstanding</Label>
            </div>
          </div>
          {!!r.mortgageOutstanding && (
            <div className="space-y-1">
              <Label className="text-xs">Mortgage Lender</Label>
              <Input value={r.mortgageLender} onChange={e => updateRow(i, "mortgageLender", e.target.value)} placeholder="e.g. Nationwide, Halifax" className="h-8 text-sm" />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Textarea value={r.propertyNotes} onChange={e => updateRow(i, "propertyNotes", e.target.value)} placeholder="Any additional notes about this property..." rows={2} className="text-sm resize-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BusinessSection({ rows, onChange }: { rows: any[]; onChange: (r: any[]) => void }) {
  const addRow = () => onChange([...rows, { businessName: "", businessType: "", sharePercentage: "", businessNotes: "" }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: string) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">Business Interests</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record business interests — this informs the business clause in the Will.</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={addRow}>
          <Plus className="h-3 w-3" /> Add Business
        </Button>
      </div>
      {rows.length === 0 && <p className="text-xs text-muted-foreground italic">No business interests added — no business clause will appear in the Will.</p>}
      {rows.map((r, i) => (
        <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business {i + 1}</span>
            <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Business Name</Label>
              <Input value={r.businessName} onChange={e => updateRow(i, "businessName", e.target.value)} placeholder="e.g. Genesis Wills and Estate Planning Ltd" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Business Type</Label>
              <Input value={r.businessType} onChange={e => updateRow(i, "businessType", e.target.value)} placeholder="e.g. Limited Company, Partnership" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Share / Interest</Label>
              <Input value={r.sharePercentage} onChange={e => updateRow(i, "sharePercentage", e.target.value)} placeholder="e.g. 50%, sole trader" className="h-8 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Textarea value={r.businessNotes} onChange={e => updateRow(i, "businessNotes", e.target.value)} placeholder="Any additional notes about this business interest..." rows={2} className="text-sm resize-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GiftsSection({ label, rows, onChange }: { label: string; rows: any[]; onChange: (r: any[]) => void }) {
  const addRow = () => onChange([...rows, { recipientName: "", recipientAddress: "", giftDescription: "", giftType: "asset" }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: string) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">{label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Specific gifts are paid before the residue is distributed.</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={addRow}>
          <Plus className="h-3 w-3" /> Add Gift
        </Button>
      </div>
      {rows.length === 0 && <p className="text-xs text-muted-foreground italic">No specific gifts added.</p>}
      {rows.map((r, i) => (
        <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gift {i + 1}</span>
            <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Gift Type</Label>
              <Select value={r.giftType} onValueChange={v => updateRow(i, "giftType", v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Specific Asset / Item</SelectItem>
                  <SelectItem value="monetary">Monetary Sum</SelectItem>
                  <SelectItem value="residue">Share of Residue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Recipient Name</Label>
              <Input value={r.recipientName} onChange={e => updateRow(i, "recipientName", e.target.value)} placeholder="Full legal name" className="h-8 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Gift Description</Label>
              <Input value={r.giftDescription} onChange={e => updateRow(i, "giftDescription", e.target.value)}
                placeholder={r.giftType === "monetary" ? "e.g. £5,000" : "e.g. my gold watch, my car registration AB12 CDE"}
                className="h-8 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Recipient Address (optional)</Label>
              <Input value={r.recipientAddress} onChange={e => updateRow(i, "recipientAddress", e.target.value)} placeholder="Recipient's address" className="h-8 text-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PetsSection({ rows, onChange }: { rows: any[]; onChange: (r: any[]) => void }) {
  const addRow = () => onChange([...rows, { petName: "", petType: "", carerName: "", carerAddress: "", careNotes: "" }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: string) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">Pets</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record pets and their nominated carers. Pets are shared across both Wills for mirror matters.</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={addRow}>
          <Plus className="h-3 w-3" /> Add Pet
        </Button>
      </div>
      {rows.length === 0 && <p className="text-xs text-muted-foreground italic">No pets added — no pets clause will appear in the Will.</p>}
      {rows.map((r, i) => (
        <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pet {i + 1}</span>
            <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Pet Name</Label>
              <Input value={r.petName} onChange={e => updateRow(i, "petName", e.target.value)} placeholder="e.g. Bella" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type of Animal</Label>
              <Input value={r.petType} onChange={e => updateRow(i, "petType", e.target.value)} placeholder="e.g. dog, cat, rabbit" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nominated Carer Name</Label>
              <Input value={r.carerName} onChange={e => updateRow(i, "carerName", e.target.value)} placeholder="Full name of carer" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Carer Address</Label>
              <Input value={r.carerAddress} onChange={e => updateRow(i, "carerAddress", e.target.value)} placeholder="Carer's address" className="h-8 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Care Notes</Label>
              <Textarea value={r.careNotes} onChange={e => updateRow(i, "careNotes", e.target.value)} placeholder="Any special care instructions..." rows={2} className="text-sm resize-none" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BeneficiarySection({ label, partnerName, rows, onChange, wishes, onWishesChange }: {
  label: string;
  partnerName?: string;
  rows: any[];
  onChange: (r: any[]) => void;
  wishes: any;
  onWishesChange: (w: any) => void;
}) {
  const addRow = (type: "primary" | "fallback") => onChange([...rows, { fullName: "", address: "", relationship: "", shareFraction: "", beneficiaryType: type, includeIssue: 1 }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: any) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  const primary = rows.filter(r => r.beneficiaryType === "primary");
  const fallback = rows.filter(r => r.beneficiaryType === "fallback");

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">{label}</h3>

      {partnerName && (
        <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
          <Switch
            checked={!!wishes.residueToSpouseFirst}
            onCheckedChange={v => onWishesChange({ ...wishes, residueToSpouseFirst: v ? 1 : 0 })}
            id="residue-spouse"
          />
          <Label htmlFor="residue-spouse" className="text-sm cursor-pointer">
            Leave entire estate to <strong>{partnerName}</strong> first (standard mirror arrangement)
          </Label>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {partnerName && wishes.residueToSpouseFirst ? "Substitute Beneficiaries (if partner predeceases)" : "Primary Beneficiaries"}
          </span>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => addRow("primary")}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {primary.length === 0 && <p className="text-xs text-muted-foreground italic">No primary beneficiaries added — estate will pass to children equally or under intestacy rules.</p>}
        {rows.map((r, i) => r.beneficiaryType === "primary" && (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Beneficiary {primary.indexOf(r) + 1}</span>
              <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input value={r.fullName} onChange={e => updateRow(i, "fullName", e.target.value)} placeholder="Full legal name" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Relationship</Label>
                <Input value={r.relationship} onChange={e => updateRow(i, "relationship", e.target.value)} placeholder="e.g. son, daughter" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Share / Fraction</Label>
                <Input value={r.shareFraction} onChange={e => updateRow(i, "shareFraction", e.target.value)} placeholder="e.g. 50% or equal share" className="h-8 text-sm" />
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <Switch checked={!!r.includeIssue} onCheckedChange={v => updateRow(i, "includeIssue", v ? 1 : 0)} id={`issue-${i}`} />
                <Label htmlFor={`issue-${i}`} className="text-xs cursor-pointer">Pass to their children if they predecease</Label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Fallback Beneficiaries</span>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => addRow("fallback")}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">These beneficiaries receive the estate only if all primary gifts fail.</p>
        {fallback.length === 0 && <p className="text-xs text-muted-foreground italic">No fallback beneficiaries — estate will pass under intestacy rules if all primary gifts fail.</p>}
        {rows.map((r, i) => r.beneficiaryType === "fallback" && (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fallback {fallback.indexOf(r) + 1}</span>
              <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input value={r.fullName} onChange={e => updateRow(i, "fullName", e.target.value)} placeholder="Full legal name" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Relationship</Label>
                <Input value={r.relationship} onChange={e => updateRow(i, "relationship", e.target.value)} placeholder="e.g. sibling, charity" className="h-8 text-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WishesSection({ label, data, onChange }: { label: string; data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">{label}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Age condition for inheritance</Label>
          <Input type="number" min={0} max={99} value={data.ageCondition}
            onChange={e => onChange({ ...data, ageCondition: parseInt(e.target.value) || 18 })} className="h-8 text-sm" />
          <p className="text-[10px] text-muted-foreground">Beneficiaries must reach this age to inherit outright (default 18)</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Survivorship period (days)</Label>
          <Input type="number" min={0} max={365} value={data.survivorshipDays}
            onChange={e => onChange({ ...data, survivorshipDays: parseInt(e.target.value) || 28 })} className="h-8 text-sm" />
          <p className="text-[10px] text-muted-foreground">Beneficiary must survive testator by this many days (default 28)</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Switch checked={!!data.organDonation} onCheckedChange={v => onChange({ ...data, organDonation: v })} id="organ-donation" />
          <Label htmlFor="organ-donation" className="text-sm cursor-pointer">Include organ donation direction</Label>
        </div>
        {data.organDonation && (
          <Textarea value={data.organDonationText} onChange={e => onChange({ ...data, organDonationText: e.target.value })}
            placeholder="I wish to donate my organs for medical purposes." rows={2} className="text-sm resize-none" />
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Funeral Wishes</Label>
        <Textarea value={data.funeralWishes} onChange={e => onChange({ ...data, funeralWishes: e.target.value })}
          placeholder="e.g. I wish to be cremated. I would like a simple ceremony..." rows={3} className="text-sm resize-none" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Disaster Clause — Custom Instructions</Label>
        <Textarea value={data.disasterClauseNotes} onChange={e => onChange({ ...data, disasterClauseNotes: e.target.value })}
          placeholder="Optional: specify what happens if ALL beneficiaries predecease you. Leave blank to use the standard intestacy fallback."
          rows={3} className="text-sm resize-none" />
        <p className="text-[10px] text-muted-foreground">If left blank, the Will will include a standard clause directing the estate to pass under the intestacy rules.</p>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">General Notes / Solicitor's Notes</Label>
        <Textarea value={data.generalNotes} onChange={e => onChange({ ...data, generalNotes: e.target.value })}
          placeholder="Any internal notes or additional instructions for the file (these will appear as a Solicitor's Notes section at the end of the Will document)..."
          rows={3} className="text-sm resize-none" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Additional Notes / Instructions</Label>
        <Textarea value={data.extraNotes} onChange={e => onChange({ ...data, extraNotes: e.target.value })}
          placeholder="Any other instructions or notes for the file..." rows={3} className="text-sm resize-none" />
      </div>
    </div>
  );
}
