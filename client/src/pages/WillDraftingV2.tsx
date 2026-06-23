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
import { Plus, FileText, Trash2, Eye, ChevronRight, Users, UserCheck, Baby, Heart, Scroll, Download, RotateCcw, Save } from "lucide-react";
import { MatterForm } from "@/components/will-v2/MatterForm";
import { MatterPreview } from "@/components/will-v2/MatterPreview";

type ViewMode = "form" | "preview";

export default function WillDraftingV2() {
  const [selectedMatterId, setSelectedMatterId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [newMatterType, setNewMatterType] = useState<"single" | "mirror">("single");
  const [newFileRef, setNewFileRef] = useState("");

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
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {viewMode === "form" ? (
                <MatterForm matter={selectedMatter} onSaved={() => utils.matters.list.invalidate()} />
              ) : (
                <MatterPreview matter={selectedMatter} />
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
