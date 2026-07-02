import { useState, useEffect, useCallback } from "react";
import { PersonPickerField, type PoolPerson } from "./PersonPickerField";
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
  Gift, PawPrint, Home, Briefcase, Shield, Copy, UserX, FileHeart
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
  dateOfBirth?: string;
  onChangeName: (v: string) => void;
  onChangeAddress: (v: string) => void;
  onChangeDateOfBirth?: (v: string) => void;
  onRemove: () => void;
  showRemove?: boolean;
  extraFields?: React.ReactNode;
  matterId?: number;
  poolPersonId?: number;
  onPickPerson?: (p: PoolPerson | null) => void;
}

function PersonRow({ label, name, address, dateOfBirth, onChangeName, onChangeAddress, onChangeDateOfBirth, onRemove, showRemove = true, extraFields, matterId, poolPersonId, onPickPerson }: PersonRowProps) {
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
      {matterId !== undefined && onPickPerson && (
        <div className="grid grid-cols-2 gap-2">
          <PersonPickerField
            matterId={matterId}
            selectedId={poolPersonId}
            onSelect={onPickPerson}
            label="Select existing person or add new"
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Full Name</Label>
          <Input value={name} onChange={e => onChangeName(e.target.value)} placeholder="Full legal name" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date of Birth</Label>
          <Input type="date" value={dateOfBirth ?? ""} onChange={e => onChangeDateOfBirth?.(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="col-span-2 space-y-1">
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
  const [activeTab, setActiveTab] = useState("clients");

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
      dateOfBirth: e.dateOfBirth || "",
      executorType: e.executorType || "primary",
    }));
  const [execs1, setExecs1] = useState<Array<{ fullName: string; address: string; dateOfBirth: string; executorType: string; _poolId?: number }>>(
    toExecRows(isMirror ? "testator1" : "shared")
  );
  const [execs2, setExecs2] = useState<Array<{ fullName: string; address: string; dateOfBirth: string; executorType: string; _poolId?: number }>>(
    toExecRows("testator2")
  );

  // ── Guardian state ────────────────────────────────────────────────────────
  const [guardians, setGuardians] = useState<Array<{ fullName: string; address: string; dateOfBirth: string; guardianType: string; _poolId?: number }>>(
    (matter.guardians || []).map((g: any) => ({
      fullName: g.fullName || "",
      address: g.address || "",
      dateOfBirth: g.dateOfBirth || "",
      guardianType: g.guardianType || "primary",
    }))
  );

  // ── Beneficiary state ─────────────────────────────────────────────────────
  const toBenRows = (role: string) =>
    (matter.beneficiaries || []).filter((b: any) => b.clientRole === role).map((b: any): {
      fullName: string; address: string; dateOfBirth: string; relationship: string; shareFraction: string; beneficiaryType: string; includeIssue: number;
    } => ({
      fullName: b.fullName || "",
      address: b.address || "",
      dateOfBirth: b.dateOfBirth || "",
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
      hasMinorChildren: w.hasMinorChildren ?? 1,
      disasterClauseNotes: w.disasterClauseNotes || "",
      generalNotes: w.generalNotes || "",
    };
  };

  const [wishes1, setWishes1] = useState(getWishes(isMirror ? "testator1" : "shared"));
  const [wishes2, setWishes2] = useState(getWishes("testator2"));

  // ── Gifts state ───────────────────────────────────────────────────────────
  const toGiftRows = (role: string) =>
    (matter.gifts || []).filter((g: any) => g.clientRole === role).map((g: any) => ({
      recipientName: g.recipientName || "",
      recipientAddress: g.recipientAddress || "",
      giftDescription: g.giftDescription || "",
      giftType: g.giftType || "asset",
    }));

  const [gifts1, setGifts1] = useState<Array<{ recipientName: string; recipientAddress: string; giftDescription: string; giftType: string; _poolId?: number }>>(toGiftRows(isMirror ? "testator1" : "shared"));
  const [gifts2, setGifts2] = useState<Array<{ recipientName: string; recipientAddress: string; giftDescription: string; giftType: string; _poolId?: number }>>(toGiftRows("testator2"));

  // ── Pets state ────────────────────────────────────────────────────────────
  const [pets, setPets] = useState<Array<{
    petName: string; petType: string; carerName: string; carerAddress: string; careNotes: string; _carerPoolId?: number;
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

  // ── Trust Clauses state ─────────────────────────────────────────────────
  type TrustClause = {
    trustType: string;
    enabled: number;
    trustees: Array<{ name: string; address: string }>;
    lifeTenants: Array<{ name: string; address: string }>;
    beneficiaries: Array<{ name: string; relationship: string }>;
    propertyAddress: string;
    sharePercentage: string;
    namedBeneficiary: string;
    namedBeneficiaryDisability: string;
    ageVesting: number;
    notes: string;
    // PPT termination triggers
    terminateDeath: number;
    terminateRemarriage: number;
    terminateCohabitation: number;
  };

  const ALL_TRUST_TYPES = [
    { value: "ppt", label: "Protective Property Trust (PPT)" },
    { value: "discretionary", label: "Discretionary Trust" },
    { value: "vulnerable", label: "Vulnerable Person's Trust (Finance Act 2005)" },
    { value: "nrb", label: "Nil-Rate Band Trust" },
    { value: "rnrb", label: "Residential Nil-Rate Band (RNRB)" },
    { value: "bereaved_minor", label: "Bereaved Minor's Trust (s.71A IHTA 1984)" },
    { value: "age18to25", label: "18-to-25 Trust (s.71D IHTA 1984)" },
    { value: "bpr", label: "Business Property Relief (BPR) Trust" },
  ];

  const toTrustRows = (role: string): TrustClause[] => {
    const existing = (matter.trustClauses || []).filter((tc: any) => tc.clientRole === role);
    return ALL_TRUST_TYPES.map(tt => {
      const found = existing.find((tc: any) => tc.trustType === tt.value);
      return {
        trustType: tt.value,
        enabled: found?.enabled ?? 0,
        trustees: found?.trustees ? (typeof found.trustees === "string" ? JSON.parse(found.trustees) : found.trustees) : [],
        lifeTenants: found?.lifeTenants ? (typeof found.lifeTenants === "string" ? JSON.parse(found.lifeTenants) : found.lifeTenants) : [],
        beneficiaries: found?.beneficiaries ? (typeof found.beneficiaries === "string" ? JSON.parse(found.beneficiaries) : found.beneficiaries) : [],
        propertyAddress: found?.propertyAddress || "",
        sharePercentage: found?.sharePercentage || "",
        namedBeneficiary: found?.namedBeneficiary || "",
        namedBeneficiaryDisability: found?.namedBeneficiaryDisability || "",
        ageVesting: found?.ageVesting ?? 25,
        notes: found?.notes || "",
        terminateDeath: found?.terminateDeath ?? 1,
        terminateRemarriage: found?.terminateRemarriage ?? 1,
        terminateCohabitation: found?.terminateCohabitation ?? 1,
      };
    });
  };

  const [trusts1, setTrusts1] = useState<TrustClause[]>(toTrustRows(isMirror ? "testator1" : "shared"));
  const [trusts2, setTrusts2] = useState<TrustClause[]>(toTrustRows("testator2"));

  // ── Exclusions state ──────────────────────────────────────────────────────
  type ExclusionRow = { id?: number; clientRole: string; fullName: string; relationship: string; reasonPreset: string; reasonCustom: string };
  const toExclusionRows = (role: string): ExclusionRow[] =>
    (matter.exclusions || []).filter((e: any) => e.clientRole === role).map((e: any) => ({
      id: e.id,
      clientRole: e.clientRole || role,
      fullName: e.fullName || "",
      relationship: e.relationship || "",
      reasonPreset: e.reasonPreset || "",
      reasonCustom: e.reasonCustom || "",
    }));
  const [exclusions1, setExclusions1] = useState<ExclusionRow[]>(toExclusionRows(isMirror ? "testator1" : "testator1"));
  const [exclusions2, setExclusions2] = useState<ExclusionRow[]>(toExclusionRows("testator2"));

  // ── Letter of Wishes state ──────────────────────────────────────────
  const [low1, setLow1] = useState<string>("");
  const [low2, setLow2] = useState<string>("");
  const lowQuery1 = trpc.matters.getLetterOfWishes.useQuery({ matterId: matter.id, clientRole: "testator1" });
  const lowQuery2 = trpc.matters.getLetterOfWishes.useQuery(
    { matterId: matter.id, clientRole: "testator2" },
    { enabled: isMirror }
  );
  useEffect(() => { if (lowQuery1.data !== undefined) setLow1(lowQuery1.data?.content ?? ""); }, [lowQuery1.data]);
  useEffect(() => { if (lowQuery2.data !== undefined) setLow2(lowQuery2.data?.content ?? ""); }, [lowQuery2.data]);

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
      : []
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
  const saveTrustClauses = trpc.matters.saveTrustClauses.useMutation();
  const upsertExclusion = trpc.matters.upsertExclusion.useMutation();
  const deleteExclusion = trpc.matters.deleteExclusion.useMutation();
  const saveLow = trpc.matters.upsertLetterOfWishes.useMutation();
  const upsertPersonPool = trpc.matters.upsertPersonPool.useMutation();
  const poolUtils = trpc.useUtils();

  const handleSaveAll = async (silent = false) => {
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
        wishes: { ...wishes1, organDonation: wishes1.organDonation ? 1 : 0, residueToSpouseFirst: wishes1.residueToSpouseFirst as 0 | 1, hasMinorChildren: (wishes1.hasMinorChildren ?? 1) as 0 | 1 },
      }));
      if (isMirror) {
        ops.push(saveWishes.mutateAsync({
          matterId: matter.id,
          clientRole: "testator2",
          wishes: { ...wishes2, organDonation: wishes2.organDonation ? 1 : 0, residueToSpouseFirst: wishes2.residueToSpouseFirst as 0 | 1, hasMinorChildren: (wishes2.hasMinorChildren ?? 1) as 0 | 1 },
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

      // Exclusions — delete removed rows, upsert current rows
      const savedExclusions1 = (matter.exclusions || []).filter((e: any) => e.clientRole === (isMirror ? "testator1" : "testator1"));
      const savedExclusions2 = (matter.exclusions || []).filter((e: any) => e.clientRole === "testator2");
      // Delete rows that were removed
      const currentIds1 = new Set(exclusions1.filter(e => e.id).map(e => e.id));
      const currentIds2 = new Set(exclusions2.filter(e => e.id).map(e => e.id));
      for (const saved of savedExclusions1) {
        if (!currentIds1.has(saved.id)) ops.push(deleteExclusion.mutateAsync({ id: saved.id, matterId: matter.id }));
      }
      if (isMirror) {
        for (const saved of savedExclusions2) {
          if (!currentIds2.has(saved.id)) ops.push(deleteExclusion.mutateAsync({ id: saved.id, matterId: matter.id }));
        }
      }
      // Upsert current rows
      for (const row of exclusions1) {
        if (row.fullName.trim()) ops.push(upsertExclusion.mutateAsync({ matterId: matter.id, ...row, clientRole: isMirror ? "testator1" : "testator1" }));
      }
      if (isMirror) {
        for (const row of exclusions2) {
          if (row.fullName.trim()) ops.push(upsertExclusion.mutateAsync({ matterId: matter.id, ...row, clientRole: "testator2" }));
        }
      }

      // Trust Clauses
      const enabledTrusts1 = trusts1.filter(tc => tc.enabled);
      if (enabledTrusts1.length > 0 || trusts1.some(tc => !tc.enabled)) {
        ops.push(saveTrustClauses.mutateAsync({
          matterId: matter.id,
          clientRole: isMirror ? "testator1" : "shared",
          clauses: trusts1.map(tc => ({
            ...tc,
            enabled: tc.enabled as 0 | 1,
            ageVesting: tc.ageVesting || 25,
          })),
        }));
      }
      if (isMirror) {
        const enabledTrusts2 = trusts2.filter(tc => tc.enabled);
        if (enabledTrusts2.length > 0 || trusts2.some(tc => !tc.enabled)) {
          ops.push(saveTrustClauses.mutateAsync({
            matterId: matter.id,
            clientRole: "testator2",
            clauses: trusts2.map(tc => ({
              ...tc,
              enabled: tc.enabled as 0 | 1,
              ageVesting: tc.ageVesting || 25,
            })),
          }));
        }
      }

      // Letter of Wishes
      ops.push(saveLow.mutateAsync({ matterId: matter.id, clientRole: "testator1", content: low1 }));
      if (isMirror) ops.push(saveLow.mutateAsync({ matterId: matter.id, clientRole: "testator2", content: low2 }));

      await Promise.all(ops);

      // ── Sync People Pool ─────────────────────────────────────────────────
      // Collect all named people from every section and upsert them into the pool.
      // We do this AFTER the main save so the pool stays fresh without blocking.
      const poolOps: Promise<any>[] = [];
      const syncPerson = (fullName: string, address: string, relationship: string, sourceRole: string, id?: number, dateOfBirth?: string) => {
        if (!fullName.trim()) return;
        poolOps.push(upsertPersonPool.mutateAsync({ matterId: matter.id, id, fullName: fullName.trim(), address: address?.trim() || "", relationship: relationship?.trim() || "", sourceRole, dateOfBirth: dateOfBirth?.trim() || "" }));
      };
      // Testators — include DOB from client record
      if (t1.fullName) syncPerson(t1.fullName, t1.address || "", "testator", "testator1", undefined, t1.dateOfBirth || "");
      if (isMirror && t2.fullName) syncPerson(t2.fullName, t2.address || "", "testator", "testator2", undefined, t2.dateOfBirth || "");
      // Executors
      [...execs1, ...(isMirror ? execs2 : [])].forEach(e => syncPerson(e.fullName, e.address, "", "executor", e._poolId, e.dateOfBirth));
      // Guardians
      guardians.forEach(g => syncPerson(g.fullName, g.address, "", "guardian", g._poolId, g.dateOfBirth));
      // Beneficiaries
      [...bens1, ...(isMirror ? bens2 : [])].forEach(b => syncPerson(b.fullName, b.address || "", b.relationship || "", "beneficiary", b._poolId, b.dateOfBirth));
      // Gifts recipients
      [...gifts1, ...(isMirror ? gifts2 : [])].forEach(g => syncPerson(g.recipientName, g.recipientAddress, "", "gift_recipient", g._poolId, (g as any).recipientDob));
      // Pets carers
      pets.forEach(p => syncPerson(p.carerName, p.carerAddress, "", "pet_carer", p._carerPoolId, (p as any).carerDob));
      // Exclusions
      [...exclusions1, ...(isMirror ? exclusions2 : [])].forEach(e => syncPerson(e.fullName, "", e.relationship || "", "exclusion", (e as any)._poolId, (e as any).dateOfBirth));
      if (poolOps.length > 0) {
        await Promise.all(poolOps);
        poolUtils.matters.listPeoplePool.invalidate({ matterId: matter.id });
      }
      utils.matters.list.invalidate();
      utils.matters.getById.invalidate({ id: matter.id });
      onSaved();
      if (!silent) toast.success("Matter saved successfully");
    } catch (err) {
      if (!silent) toast.error("Failed to save matter");
    }
  };

  const isSaving = saveClient.isPending || saveExecutors.isPending || saveGuardians.isPending ||
    saveBeneficiaries.isPending || saveWishes.isPending || saveGifts.isPending ||
    savePets.isPending || saveProperty.isPending || saveBusiness.isPending || saveTrustClauses.isPending ||
    upsertExclusion.isPending || deleteExclusion.isPending || saveLow.isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs value={activeTab} onValueChange={async (tab) => {
            // Auto-save current tab data before switching
            try { await handleSaveAll(true); } catch { /* silent */ }
            setActiveTab(tab);
          }}>
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
            <TabsTrigger value="trusts" className="text-xs gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Trusts
            </TabsTrigger>
            <TabsTrigger value="exclusions" className="text-xs gap-1.5">
              <UserX className="h-3.5 w-3.5" /> Exclusions
            </TabsTrigger>
            <TabsTrigger value="letter-of-wishes" className="text-xs gap-1.5">
              <FileHeart className="h-3.5 w-3.5" /> Letter of Wishes
            </TabsTrigger>
          </TabsList>

          {/* ── CLIENTS ─────────────────────────────────────────────────── */}
          <TabsContent value="clients" className="space-y-4">
            <ClientSection label={isMirror ? "Testator 1" : "Testator"} data={t1} onChange={setT1} />
            {isMirror && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">Testator 2</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setT2({ ...t1 });
                      // Mirror executors, beneficiaries, wishes, gifts, trusts
                      setExecs2(execs1.map(e => ({ ...e })));
                      setBens2(bens1.map((b: typeof bens1[0]) => ({ ...b })));
                      setWishes2({ ...wishes1 });
                      setGifts2(gifts1.map(g => ({ ...g })));
                      setTrusts2(trusts1.map(t => ({ ...t })));
                    }}
                  >
                    <Copy className="h-3 w-3" /> Mirror from Client 1
                  </Button>
                </div>
                <ClientSection label="" data={t2} onChange={setT2} />
              </>
            )}
          </TabsContent>

          {/* ── EXECUTORS ────────────────────────────────────────────────── */}
          <TabsContent value="executors" className="space-y-4">
            <ExecutorSection
              label={isMirror ? `Executors for ${t1.fullName || "Testator 1"}` : "Executors"}
              rows={execs1}
              onChange={setExecs1}
              matterId={matter.id}
            />
            {isMirror && (
              <>
                <Separator />
                <ExecutorSection
                  label={`Executors for ${t2.fullName || "Testator 2"}`}
                  rows={execs2}
                  onChange={setExecs2}
                  matterId={matter.id}
                />
              </>
            )}
          </TabsContent>

          {/* ── GUARDIANS ────────────────────────────────────────────────── */}
          <TabsContent value="guardians" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Guardians are shared across both Wills for minor children.
            </div>
            <GuardianSection rows={guardians} onChange={setGuardians} matterId={matter.id} />
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
              matterId={matter.id}
            />
            {isMirror && (
              <>
                <Separator />
                <GiftsSection
                  label={`Specific Gifts from ${t2.fullName || "Testator 2"}`}
                  rows={gifts2}
                  onChange={setGifts2}
                  matterId={matter.id}
                />
              </>
            )}
          </TabsContent>

          {/* ── PETS ─────────────────────────────────────────────────────── */}
          <TabsContent value="pets" className="space-y-4">
            <PetsSection rows={pets} onChange={setPets} matterId={matter.id} />
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
              matterId={matter.id}
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
                  matterId={matter.id}
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

          {/* ── TRUSTS ────────────────────────────────────────────────────── */}
          <TabsContent value="exclusions" className="space-y-4">
            <ExclusionsSection
              label={isMirror ? `Exclusions for ${t1.fullName || "Testator 1"}` : "Exclusions"}
              rows={exclusions1}
              onChange={setExclusions1}
              matterId={matter.id}
            />
            {isMirror && (
              <>
                <Separator />
                <ExclusionsSection
                  label={`Exclusions for ${t2.fullName || "Testator 2"}`}
                  rows={exclusions2}
                  onChange={setExclusions2}
                  matterId={matter.id}
                />
              </>
            )}
          </TabsContent>

          {/* ── LETTER OF WISHES ───────────────────────────────────────────── */}
          <TabsContent value="letter-of-wishes" className="space-y-4">
            <LetterOfWishesSection
              label={isMirror ? `Letter of Wishes — ${t1.fullName || "Testator 1"}` : "Letter of Wishes"}
              content={low1}
              onChange={setLow1}
            />
            {isMirror && (
              <>
                <Separator />
                <LetterOfWishesSection
                  label={`Letter of Wishes — ${t2.fullName || "Testator 2"}`}
                  content={low2}
                  onChange={setLow2}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="trusts" className="space-y-4">
            <TrustClausesSection
              label={isMirror ? `Trust Clauses for ${t1.fullName || "Testator 1"}` : "Trust Clauses"}
              clauses={trusts1}
              onChange={setTrusts1}
              allTrustTypes={ALL_TRUST_TYPES}
            />
            {isMirror && (
              <>
                <Separator />
                <TrustClausesSection
                  label={`Trust Clauses for ${t2.fullName || "Testator 2"}`}
                  clauses={trusts2}
                  onChange={setTrusts2}
                  allTrustTypes={ALL_TRUST_TYPES}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer save bar */}
      <div className="border-t border-border px-4 py-3 bg-card flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Auto-saved when switching tabs. Click Save to save immediately.</p>
        <Button onClick={() => handleSaveAll()} disabled={isSaving} size="sm">
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

function ExecutorSection({ label, rows, onChange, matterId }: { label: string; rows: any[]; onChange: (r: any[]) => void; matterId?: number }) {
  const addRow = (type: "primary" | "substitute") => onChange([...rows, { fullName: "", address: "", dateOfBirth: "", executorType: type, _poolId: undefined }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: any) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

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
          <PersonRow key={i} label={`Primary Executor ${primary.indexOf(r) + 1}`} name={r.fullName} address={r.address} dateOfBirth={r.dateOfBirth}
            onChangeName={v => updateRow(i, "fullName", v)} onChangeAddress={v => updateRow(i, "address", v)} onChangeDateOfBirth={v => updateRow(i, "dateOfBirth", v)} onRemove={() => removeRow(i)}
            matterId={matterId} poolPersonId={r._poolId}
            onPickPerson={p => {
              onChange(rows.map((row, idx) => idx !== i ? row : { ...row, _poolId: p?.id, fullName: p ? (p.fullName ?? "") : "", address: p ? (p.address ?? "") : "", dateOfBirth: p ? (p.dateOfBirth ?? "") : "" }));
            }}
          />
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
          <PersonRow key={i} label={`Substitute Executor ${substitute.indexOf(r) + 1}`} name={r.fullName} address={r.address} dateOfBirth={r.dateOfBirth}
            onChangeName={v => updateRow(i, "fullName", v)} onChangeAddress={v => updateRow(i, "address", v)} onChangeDateOfBirth={v => updateRow(i, "dateOfBirth", v)} onRemove={() => removeRow(i)}
            matterId={matterId} poolPersonId={r._poolId}
            onPickPerson={p => {
              onChange(rows.map((row, idx) => idx !== i ? row : { ...row, _poolId: p?.id, fullName: p ? (p.fullName ?? "") : "", address: p ? (p.address ?? "") : "", dateOfBirth: p ? (p.dateOfBirth ?? "") : "" }));
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GuardianSection({ rows, onChange, matterId }: { rows: any[]; onChange: (r: any[]) => void; matterId?: number }) {
  const addRow = (type: "primary" | "substitute") => onChange([...rows, { fullName: "", address: "", dateOfBirth: "", guardianType: type, _poolId: undefined }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: any) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

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
          <PersonRow key={i} label={`Primary Guardian ${primary.indexOf(r) + 1}`} name={r.fullName} address={r.address} dateOfBirth={r.dateOfBirth}
            onChangeName={v => updateRow(i, "fullName", v)} onChangeAddress={v => updateRow(i, "address", v)} onChangeDateOfBirth={v => updateRow(i, "dateOfBirth", v)} onRemove={() => removeRow(i)}
            matterId={matterId} poolPersonId={r._poolId}
            onPickPerson={p => {
              onChange(rows.map((row, idx) => idx !== i ? row : { ...row, _poolId: p?.id, fullName: p ? (p.fullName ?? "") : "", address: p ? (p.address ?? "") : "", dateOfBirth: p ? (p.dateOfBirth ?? "") : "" }));
            }}
          />
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
          <PersonRow key={i} label={`Substitute Guardian ${substitute.indexOf(r) + 1}`} name={r.fullName} address={r.address} dateOfBirth={r.dateOfBirth}
            onChangeName={v => updateRow(i, "fullName", v)} onChangeAddress={v => updateRow(i, "address", v)} onChangeDateOfBirth={v => updateRow(i, "dateOfBirth", v)} onRemove={() => removeRow(i)}
            matterId={matterId} poolPersonId={r._poolId}
            onPickPerson={p => {
              onChange(rows.map((row, idx) => idx !== i ? row : { ...row, _poolId: p?.id, fullName: p ? (p.fullName ?? "") : "", address: p ? (p.address ?? "") : "", dateOfBirth: p ? (p.dateOfBirth ?? "") : "" }));
            }}
          />
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

function GiftsSection({ label, rows, onChange, matterId }: { label: string; rows: any[]; onChange: (r: any[]) => void; matterId?: number }) {
  const addRow = () => onChange([...rows, { recipientName: "", recipientAddress: "", giftDescription: "", giftType: "asset", _poolId: undefined }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: any) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

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
          {matterId !== undefined && (
            <div className="grid grid-cols-2 gap-2">
              <PersonPickerField
                matterId={matterId}
                selectedId={r._poolId}
                onSelect={p => {
                  onChange(rows.map((row, idx) => idx !== i ? row : { ...row, _poolId: p?.id, recipientName: p ? (p.fullName ?? "") : "", recipientAddress: p ? (p.address ?? "") : "" }));
                }}
                label="Select existing recipient or add new"
              />
            </div>
          )}
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

function PetsSection({ rows, onChange, matterId }: { rows: any[]; onChange: (r: any[]) => void; matterId?: number }) {
  const addRow = () => onChange([...rows, { petName: "", petType: "", carerName: "", carerAddress: "", careNotes: "", _carerPoolId: undefined }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: any) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

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
          {matterId !== undefined && (
            <div className="grid grid-cols-2 gap-2">
              <PersonPickerField
                matterId={matterId}
                selectedId={r._carerPoolId}
                onSelect={p => {
                  onChange(rows.map((row, idx) => idx !== i ? row : { ...row, _carerPoolId: p?.id, carerName: p ? (p.fullName ?? "") : "", carerAddress: p ? (p.address ?? "") : "" }));
                }}
                label="Select existing carer or add new"
              />
            </div>
          )}
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

function BeneficiarySection({ label, partnerName, rows, onChange, wishes, onWishesChange, matterId }: {
  label: string;
  partnerName?: string;
  rows: any[];
  onChange: (r: any[]) => void;
  wishes: any;
  onWishesChange: (w: any) => void;
  matterId?: number;
}) {
  const addRow = (type: "primary" | "fallback") => onChange([...rows, { fullName: "", address: "", dateOfBirth: "", relationship: "", shareFraction: "", beneficiaryType: type, includeIssue: 1, _poolId: undefined }]);
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
            {matterId !== undefined && (
              <div className="grid grid-cols-2 gap-2">
                                <PersonPickerField
                  matterId={matterId}
                  selectedId={r._poolId}
                  onSelect={p => {
                    onChange(rows.map((row, idx) => idx !== i ? row : { ...row, _poolId: p?.id, fullName: p ? (p.fullName ?? "") : "", relationship: p ? (p.relationship ?? "") : "", dateOfBirth: p ? (p.dateOfBirth ?? "") : "", address: p ? (p.address ?? "") : "" }));
                  }}
                  label="Select existing beneficiary or add new"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input value={r.fullName} onChange={e => updateRow(i, "fullName", e.target.value)} placeholder="Full legal name" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date of Birth</Label>
                <Input type="date" value={r.dateOfBirth ?? ""} onChange={e => updateRow(i, "dateOfBirth", e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Relationship</Label>
                <Input value={r.relationship} onChange={e => updateRow(i, "relationship", e.target.value)} placeholder="e.g. son, daughter" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Share / Fraction</Label>
                <Input value={r.shareFraction} onChange={e => updateRow(i, "shareFraction", e.target.value)} placeholder="e.g. 50% or equal share" className="h-8 text-sm" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Address</Label>
                <Input value={r.address ?? ""} onChange={e => updateRow(i, "address", e.target.value)} placeholder="Address" className="h-8 text-sm" />
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
            {matterId !== undefined && (
              <div className="grid grid-cols-2 gap-2">
                <PersonPickerField
                  matterId={matterId}
                  selectedId={r._poolId}
                  onSelect={p => {
                    onChange(rows.map((row, idx) => idx !== i ? row : { ...row, _poolId: p?.id, fullName: p ? (p.fullName ?? "") : "", relationship: p ? (p.relationship ?? "") : "", dateOfBirth: p ? (p.dateOfBirth ?? "") : "", address: p ? (p.address ?? "") : "" }));
                  }}
                  label="Select existing beneficiary or add new"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input value={r.fullName} onChange={e => updateRow(i, "fullName", e.target.value)} placeholder="Full legal name" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date of Birth</Label>
                <Input type="date" value={r.dateOfBirth ?? ""} onChange={e => updateRow(i, "dateOfBirth", e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Relationship</Label>
                <Input value={r.relationship} onChange={e => updateRow(i, "relationship", e.target.value)} placeholder="e.g. sibling, charity" className="h-8 text-sm" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Address</Label>
                <Input value={r.address ?? ""} onChange={e => updateRow(i, "address", e.target.value)} placeholder="Address" className="h-8 text-sm" />
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

      {/* Minor children toggle */}
      <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
        <Switch
          id="has-minor-children"
          checked={data.hasMinorChildren !== 0}
          onCheckedChange={v => onChange({ ...data, hasMinorChildren: v ? 1 : 0 })}
        />
        <div>
          <Label htmlFor="has-minor-children" className="text-sm cursor-pointer font-medium">
            Client has children under 18
          </Label>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            When enabled, a Guardians clause (Clause 3) will be included in the Will. Turn off if there are no minor children.
          </p>
        </div>
      </div>

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

// ── Trust Clauses Section ─────────────────────────────────────────────────────

type TrustClauseRow = {
  trustType: string;
  enabled: number;
  trustees: Array<{ name: string; address: string }>;
  lifeTenants: Array<{ name: string; address: string }>;
  beneficiaries: Array<{ name: string; relationship: string }>;
  propertyAddress: string;
  sharePercentage: string;
  namedBeneficiary: string;
  namedBeneficiaryDisability: string;
  ageVesting: number;
  notes: string;
  // PPT termination triggers
  terminateDeath: number;
  terminateRemarriage: number;
  terminateCohabitation: number;
};

const TRUST_DESCRIPTIONS: Record<string, string> = {
  ppt: "Protects your share of the property for remainder beneficiaries whilst providing security of occupation for the surviving spouse or civil partner.",
  discretionary: "Trustees have full discretion over distribution of estate.",
  vulnerable: "For a named beneficiary with a disability (Finance Act 2005).",
  nrb: "Nil-Rate Band Discretionary Trust — preserves the nil-rate band on first death.",
  rnrb: "Residential Nil-Rate Band — claims the additional IHT allowance for residential property passing to direct descendants.",
  bereaved_minor: "For bereaved minors who will become absolutely entitled at age 18. Qualifies for IHT exemption under s.71A IHTA 1984.",
  age18to25: "For bereaved young people who will become absolutely entitled between ages 18 and 25. Qualifies for partial IHT relief under s.71D IHTA 1984.",
  bpr: "Preserves Business Property Relief by directing qualifying business assets into a trust, preventing the relief from being lost on a gift to a surviving spouse.",
};

function TrustClausesSection({
  label,
  clauses,
  onChange,
  allTrustTypes,
}: {
  label: string;
  clauses: TrustClauseRow[];
  onChange: (c: TrustClauseRow[]) => void;
  allTrustTypes: Array<{ value: string; label: string }>;
}) {
  const updateClause = (i: number, field: string, value: any) =>
    onChange(clauses.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const addPerson = (i: number, field: "trustees" | "lifeTenants") =>
    updateClause(i, field, [...clauses[i][field], { name: "", address: "" }]);

  const removePerson = (i: number, field: "trustees" | "lifeTenants", pi: number) =>
    updateClause(i, field, clauses[i][field].filter((_, idx) => idx !== pi));

  const updatePerson = (i: number, field: "trustees" | "lifeTenants", pi: number, key: string, val: string) =>
    updateClause(i, field, clauses[i][field].map((p, idx) => idx === pi ? { ...p, [key]: val } : p));

  const addBeneficiary = (i: number) =>
    updateClause(i, "beneficiaries", [...clauses[i].beneficiaries, { name: "", relationship: "" }]);

  const removeBeneficiary = (i: number, bi: number) =>
    updateClause(i, "beneficiaries", clauses[i].beneficiaries.filter((_, idx) => idx !== bi));

  const updateBeneficiary = (i: number, bi: number, key: string, val: string) =>
    updateClause(i, "beneficiaries", clauses[i].beneficiaries.map((b, idx) => idx === bi ? { ...b, [key]: val } : b));

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium text-sm">{label}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Enable any trust clauses required for this Will. Only enabled trusts will appear in the generated document.</p>
      </div>

      {clauses.map((tc, i) => {
        const typeInfo = allTrustTypes.find(t => t.value === tc.trustType);
        const isEnabled = !!tc.enabled;
        const needsProperty = ["ppt", "rnrb", "bpr"].includes(tc.trustType);
        const needsNamedBen = ["vulnerable", "bereaved_minor", "age18to25"].includes(tc.trustType);
        const needsAgeVesting = ["bereaved_minor", "age18to25"].includes(tc.trustType);
        const needsLifeTenants = tc.trustType === "ppt";

        return (
          <div key={tc.trustType} className={`border rounded-lg overflow-hidden transition-colors ${isEnabled ? "border-blue-300 bg-blue-50/30" : "border-border bg-card"}`}>
            <div className="flex items-start gap-3 p-3">
              <Switch
                checked={isEnabled}
                onCheckedChange={v => updateClause(i, "enabled", v ? 1 : 0)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{typeInfo?.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{TRUST_DESCRIPTIONS[tc.trustType]}</div>
              </div>
            </div>

            {isEnabled && (
              <div className="px-3 pb-3 space-y-3 border-t border-blue-200/50 pt-3">

                {/* Property address (PPT, RNRB, BPR) */}
                {needsProperty && (
                  <div className="space-y-1">
                    <Label className="text-xs">{tc.trustType === "bpr" ? "Business / Asset Description" : "Property Address"}</Label>
                    <Textarea
                      value={tc.propertyAddress}
                      onChange={e => updateClause(i, "propertyAddress", e.target.value)}
                      placeholder={tc.trustType === "bpr" ? "e.g. Genesis Wills and Estate Planning Ltd — 100% shareholding" : "Full address of the property"}
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>
                )}

                {/* Named beneficiary (Vulnerable, Bereaved Minor, 18-to-25) */}
                {needsNamedBen && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Named Beneficiary</Label>
                      <Input
                        value={tc.namedBeneficiary}
                        onChange={e => updateClause(i, "namedBeneficiary", e.target.value)}
                        placeholder="Full legal name"
                        className="h-8 text-sm"
                      />
                    </div>
                    {tc.trustType === "vulnerable" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Nature of Disability</Label>
                        <Input
                          value={tc.namedBeneficiaryDisability}
                          onChange={e => updateClause(i, "namedBeneficiaryDisability", e.target.value)}
                          placeholder="Brief description"
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                    {needsAgeVesting && (
                      <div className="space-y-1">
                        <Label className="text-xs">Vesting Age</Label>
                        <Input
                          type="number"
                          min={18}
                          max={25}
                          value={tc.ageVesting}
                          onChange={e => updateClause(i, "ageVesting", parseInt(e.target.value) || 25)}
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Life Tenants (PPT only) */}
                {needsLifeTenants && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Life Tenant(s)</span>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => addPerson(i, "lifeTenants")}>
                        <Plus className="h-3 w-3" /> Add
                      </Button>
                    </div>
                    {tc.lifeTenants.length === 0 && <p className="text-xs text-muted-foreground italic">No life tenants added.</p>}
                    {tc.lifeTenants.map((lt, pi) => (
                      <div key={pi} className="border border-border rounded p-2 space-y-1.5 bg-background">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Life Tenant {pi + 1}</span>
                          <button onClick={() => removePerson(i, "lifeTenants", pi)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Input value={lt.name} onChange={e => updatePerson(i, "lifeTenants", pi, "name", e.target.value)} placeholder="Full name" className="h-7 text-xs" />
                          <Input value={lt.address} onChange={e => updatePerson(i, "lifeTenants", pi, "address", e.target.value)} placeholder="Address" className="h-7 text-xs" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trust Termination Triggers (PPT only) */}
                {needsLifeTenants && (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Trust Termination Triggers</span>
                      <p className="text-xs text-muted-foreground mt-0.5">The Trust Period shall terminate when any of the selected events occur.</p>
                    </div>
                    <div className="space-y-1.5 pl-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.terminateDeath === 1}
                          onChange={e => updateClause(i, "terminateDeath", e.target.checked ? 1 : 0)}
                          className="h-3.5 w-3.5 rounded border-border accent-primary"
                        />
                        <span className="text-xs">Death: Upon the death of the Life Tenant</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.terminateRemarriage === 1}
                          onChange={e => updateClause(i, "terminateRemarriage", e.target.checked ? 1 : 0)}
                          className="h-3.5 w-3.5 rounded border-border accent-primary"
                        />
                        <span className="text-xs">Remarriage: Upon the Life Tenant remarrying or entering into a new civil partnership</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.terminateCohabitation === 1}
                          onChange={e => updateClause(i, "terminateCohabitation", e.target.checked ? 1 : 0)}
                          className="h-3.5 w-3.5 rounded border-border accent-primary"
                        />
                        <span className="text-xs">Cohabitation/Residence: Upon the Life Tenant ceasing to permanently reside in the Property</span>
                      </label>
                    </div>
                  </div>
                )}
                {/* Trustees */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Trustees</span>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => addPerson(i, "trustees")}>
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                  {tc.trustees.length === 0 && <p className="text-xs text-muted-foreground italic">No trustees added — Executors will act as Trustees by default.</p>}
                  {tc.trustees.map((tr, pi) => (
                    <div key={pi} className="border border-border rounded p-2 space-y-1.5 bg-background">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Trustee {pi + 1}</span>
                        <button onClick={() => removePerson(i, "trustees", pi)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input value={tr.name} onChange={e => updatePerson(i, "trustees", pi, "name", e.target.value)} placeholder="Full name" className="h-7 text-xs" />
                        <Input value={tr.address} onChange={e => updatePerson(i, "trustees", pi, "address", e.target.value)} placeholder="Address" className="h-7 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Remainder Beneficiaries */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Remainder Beneficiaries</span>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => addBeneficiary(i)}>
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                  {tc.beneficiaries.length === 0 && <p className="text-xs text-muted-foreground italic">No remainder beneficiaries added.</p>}
                  {tc.beneficiaries.map((b, bi) => (
                    <div key={bi} className="border border-border rounded p-2 space-y-1.5 bg-background">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Beneficiary {bi + 1}</span>
                        <button onClick={() => removeBeneficiary(i, bi)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input value={b.name} onChange={e => updateBeneficiary(i, bi, "name", e.target.value)} placeholder="Full name" className="h-7 text-xs" />
                        <Input value={b.relationship} onChange={e => updateBeneficiary(i, bi, "relationship", e.target.value)} placeholder="Relationship (e.g. son)" className="h-7 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <Label className="text-xs">Additional Notes</Label>
                  <Textarea
                    value={tc.notes}
                    onChange={e => updateClause(i, "notes", e.target.value)}
                    placeholder="Any additional instructions for this trust clause..."
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── ExclusionsSection ─────────────────────────────────────────────────────────

const REASON_PRESETS = [
  { value: "estrangement", label: "Estrangement — no contact for an extended period" },
  { value: "no_relationship", label: "No relationship — never had a meaningful relationship" },
  { value: "adequately_provided", label: "Adequately provided for elsewhere — gifts or trusts already made" },
  { value: "conduct", label: "Conduct — behaviour or actions incompatible with inheritance" },
  { value: "financial_independence", label: "Financial independence — they are self-sufficient" },
  { value: "other", label: "Other — see custom reason below" },
];

function ExclusionsSection({
  label,
  rows,
  onChange,
  matterId,
}: {
  label: string;
  rows: Array<{ id?: number; clientRole: string; fullName: string; relationship: string; reasonPreset: string; reasonCustom: string; _poolId?: number }>;
  onChange: (r: any[]) => void;
  matterId?: number;
}) {
  const addRow = () =>
    onChange([...rows, { clientRole: "testator1", fullName: "", relationship: "", reasonPreset: "", reasonCustom: "", _poolId: undefined }]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: any) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">{label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Each excluded person will receive a formal exclusion clause in the Will.
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={addRow}>
          <Plus className="h-3 w-3" /> Add Exclusion
        </Button>
      </div>
      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No exclusions added.</p>
      )}
      {rows.map((r, i) => (
        <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Excluded Person {i + 1}
            </span>
            <button
              onClick={() => removeRow(i)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {matterId !== undefined && (
            <div className="grid grid-cols-2 gap-2">
              <PersonPickerField
                matterId={matterId}
                selectedId={r._poolId}
                onSelect={p => {
                  onChange(rows.map((row, idx) => idx !== i ? row : { ...row, _poolId: p?.id, fullName: p ? (p.fullName ?? "") : "", relationship: p ? (p.relationship ?? "") : "" }));
                }}
                label="Select existing person or add new"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={r.fullName}
                onChange={e => updateRow(i, "fullName", e.target.value)}
                placeholder="Full legal name"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Relationship to Testator</Label>
              <Input
                value={r.relationship}
                onChange={e => updateRow(i, "relationship", e.target.value)}
                placeholder="e.g. child, sibling, former spouse"
                className="h-8 text-sm"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Reason</Label>
              <Select value={r.reasonPreset || ""} onValueChange={v => updateRow(i, "reasonPreset", v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_PRESETS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(r.reasonPreset === "other" || r.reasonCustom) && (
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Custom Reason (optional)</Label>
                <Textarea
                  value={r.reasonCustom}
                  onChange={e => updateRow(i, "reasonCustom", e.target.value)}
                  placeholder="Provide additional context if needed (not included in the Will text itself)"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LetterOfWishesSection ─────────────────────────────────────────────────────

interface LetterOfWishesSectionProps {
  label: string;
  content: string;
  onChange: (v: string) => void;
}

function LetterOfWishesSection({ label, content, onChange }: LetterOfWishesSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">{label}</h3>
      </div>
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          This Letter of Wishes is not legally binding but provides important guidance to your Trustees and Executors.
          It will be printed on Genesis headed paper and stored alongside the Will.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          The document will open with the following introduction:
          <br />
          <span className="not-italic text-foreground/80">
            &ldquo;This Letter of Wishes is written to accompany my Will dated [Date of Will], and it is intended to provide
            guidance to my Trustees and Executors regarding the administration of my estate. While this document is not
            legally binding, I trust that it will be treated with serious consideration and will serve to clarify my
            intentions for the distribution and management of my assets. The requests and suggestions outlined below are
            made with the aim of ensuring that my wishes are respected and that my family and beneficiaries are provided
            for in accordance with my personal values and long-term objectives.&rdquo;
          </span>
        </p>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Wishes Content</Label>
        <Textarea
          value={content}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter the client's wishes here. You may include guidance on caring for children, messages to beneficiaries, preferences for specific assets, charitable intentions, or any other personal instructions…"
          rows={14}
          className="text-sm resize-y"
        />
        <p className="text-xs text-muted-foreground">
          {content.length > 0 ? `${content.length} characters` : "No content yet — click Save All Changes to save once written."}
        </p>
      </div>
    </div>
  );
}
