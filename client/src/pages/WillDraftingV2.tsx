import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, FileText, Trash2, Eye, ChevronRight, Users, UserCheck, Baby, Heart, Scroll, Download, RotateCcw, Save, FileCheck, ExternalLink, ClipboardList } from "lucide-react";
import { MatterForm } from "@/components/will-v2/MatterForm";
import { MatterPreview } from "@/components/will-v2/MatterPreview";
import { useLocation } from "wouter";

type ViewMode = "form" | "preview";

type LpaOrderDialogState = {
  open: boolean;
  createPF: boolean;
  createHW: boolean;
  useExecutorsAsAttorneys: boolean;
};

export default function WillDraftingV2() {
  const [, navigate] = useLocation();
  const [selectedMatterId, setSelectedMatterId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [newMatterType, setNewMatterType] = useState<"single" | "mirror">("single");
  const [newFileRef, setNewFileRef] = useState("");
  const [lpaDialog, setLpaDialog] = useState<LpaOrderDialogState>({ open: false, createPF: true, createHW: true, useExecutorsAsAttorneys: true });

  const utils = trpc.useUtils();
  const { data: matters = [], isLoading } = trpc.matters.list.useQuery();

  const createMatter = trpc.matters.create.useMutation({
    onSuccess: (data) => {
      utils.matters.list.invalidate();
      setSelectedMatterId(data.id);
      setViewMode("form");
      setShowNewDialog(false);
      setNewFileRef("");
      toast.success("Matter created");
    },
    onError: () => toast.error("Failed to create matter"),
  });

  const deleteMatter = trpc.matters.delete.useMutation({
    onSuccess: () => {
      utils.matters.list.invalidate();
      if (deleteTargetId === selectedMatterId) setSelectedMatterId(null);
      setDeleteTargetId(null);
      toast.success("Matter deleted");
    },
    onError: () => toast.error("Failed to delete matter"),
  });

  const handleCreate = () => {
    createMatter.mutate({ matterType: newMatterType, fileReference: newFileRef || undefined });
  };

  const createLpaFromMatter = trpc.lpa.createFromMatter.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.created.length} LPA record(s) created — open the LPA Manager to complete them`);
      setLpaDialog({ open: false, createPF: true, createHW: true, useExecutorsAsAttorneys: true });
    },
    onError: (err) => toast.error(`Failed to create LPAs: ${err.message}`),
  });

  const handleOrderLpa = () => {
    if (!selectedMatter) return;
    const clients = selectedMatter.matterType === "mirror"
      ? ["testator1" as const, "testator2" as const]
      : ["testator1" as const];
    createLpaFromMatter.mutate({
      matterId: selectedMatter.id,
      createPF: lpaDialog.createPF,
      createHW: lpaDialog.createHW,
      useExecutorsAsAttorneys: lpaDialog.useExecutorsAsAttorneys,
      clients,
    });
  };

  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
    setShowDeleteDialog(true);
  };

  const getClientName = (matter: any) => {
    const t1 = matter.clients?.find((c: any) => c.clientRole === "testator1");
    const t2 = matter.clients?.find((c: any) => c.clientRole === "testator2");
    if (matter.matterType === "mirror" && t1?.fullName && t2?.fullName) {
      return `${t1.fullName} & ${t2.fullName}`;
    }
    return t1?.fullName || matter.fileReference || `Matter #${matter.id}`;
  };

  const selectedMatter = matters.find(m => m.id === selectedMatterId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ══ LEFT PANEL: Matter List ═══════════════════════════════════════════ */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-base font-semibold text-foreground">Will Drafting</h1>
            <Button size="sm" onClick={() => setShowNewDialog(true)} className="h-7 px-2 gap-1">
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{matters.length} matter{matters.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          )}
          {!isLoading && matters.length === 0 && (
            <div className="p-6 text-center">
              <Scroll className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No matters yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Click "New" to create one.</p>
            </div>
          )}
          {matters.map((matter) => (
            <div
              key={matter.id}
              onClick={() => { setSelectedMatterId(matter.id); setViewMode("form"); }}
              className={`group flex items-start gap-2 p-3 cursor-pointer border-b border-border/50 hover:bg-accent/50 transition-colors ${selectedMatterId === matter.id ? "bg-accent" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-medium truncate">{getClientName(matter)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    {matter.matterType === "mirror" ? "Mirror" : "Single"}
                  </Badge>
                  {matter.fileReference && (
                    <span className="text-[10px] text-muted-foreground truncate">{matter.fileReference}</span>
                  )}
                  <Badge
                    variant={matter.status === "complete" ? "default" : "secondary"}
                    className="text-[10px] h-4 px-1 ml-auto"
                  >
                    {matter.status}
                  </Badge>
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteClick(matter.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL: Form / Preview ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedMatter ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Select a matter or create a new one</p>
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card">
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm">{getClientName(selectedMatter)}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {selectedMatter.matterType === "mirror" ? "Mirror Wills" : "Single Will"}
                  {selectedMatter.fileReference ? ` · ${selectedMatter.fileReference}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === "form" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("form")}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  <Users className="h-3.5 w-3.5" />
                  Instructions
                </Button>
                <Button
                  variant={viewMode === "preview" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLpaDialog(s => ({ ...s, open: true }))}
                  className="h-7 px-2.5 text-xs gap-1 border-green-600 text-green-700 hover:bg-green-50"
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  LPA Ordered
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/wills/${selectedMatter.id}/lpa`)}
                  className="h-7 px-2.5 text-xs gap-1 border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  View LPAs
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {viewMode === "form" ? (
                <MatterForm key={selectedMatter.id} matter={selectedMatter} onSaved={() => utils.matters.list.invalidate()} />
              ) : (
                <MatterPreview key={selectedMatter.id} matter={selectedMatter} />
              )}
            </div>
          </>
        )}
      </div>

      {/* ══ New Matter Dialog ══════════════════════════════════════════════════ */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Matter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Will Type</Label>
              <Select value={newMatterType} onValueChange={(v) => setNewMatterType(v as "single" | "mirror")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Will — one testator</SelectItem>
                  <SelectItem value="mirror">Mirror Wills — two testators</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>File Reference <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                placeholder="e.g. GEP-2024-001"
                value={newFileRef}
                onChange={(e) => setNewFileRef(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMatter.isPending}>
              {createMatter.isPending ? "Creating…" : "Create Matter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ LPA Order Dialog ══════════════════════════════════════════════════ */}
      <Dialog open={lpaDialog.open} onOpenChange={(open) => setLpaDialog(s => ({ ...s, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order LPA — Create Pre-filled Records</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This will create pre-filled LPA records in the LPA Manager using the client data from this matter.
              {selectedMatter?.matterType === "mirror" && " Records will be created for both clients."}
            </p>
            <div className="space-y-3">
              <Label className="text-sm font-medium">LPA Types to Create</Label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lpaDialog.createPF}
                    onChange={e => setLpaDialog(s => ({ ...s, createPF: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Property &amp; Financial Affairs (LP1F)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lpaDialog.createHW}
                    onChange={e => setLpaDialog(s => ({ ...s, createHW: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Health &amp; Welfare (LP1H)</span>
                </label>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <Label className="text-sm font-medium mb-2 block">Attorney Options</Label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lpaDialog.useExecutorsAsAttorneys}
                  onChange={e => setLpaDialog(s => ({ ...s, useExecutorsAsAttorneys: e.target.checked }))}
                  className="rounded mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium">Use Will Executors as Attorneys</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Primary executors will be added as attorneys; substitute executors as replacement attorneys.
                    Uncheck to leave the attorney fields blank for manual entry.
                  </p>
                </div>
              </label>
            </div>
            {selectedMatter?.matterType === "mirror" && (
              <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                Mirror Wills: {lpaDialog.createPF && lpaDialog.createHW ? 4 : lpaDialog.createPF || lpaDialog.createHW ? 2 : 0} LPA record(s) will be created
                (one per client per LPA type).
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLpaDialog(s => ({ ...s, open: false }))}>Cancel</Button>
            <Button
              onClick={handleOrderLpa}
              disabled={createLpaFromMatter.isPending || (!lpaDialog.createPF && !lpaDialog.createHW)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {createLpaFromMatter.isPending ? "Creating…" : "Create LPA Records"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Delete Confirmation ════════════════════════════════════════════════ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this matter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the matter and all associated data including executors, guardians, beneficiaries, and wishes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTargetId && deleteMatter.mutate({ id: deleteTargetId })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
