import { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { Link, useLocation } from "wouter";
import {
  Loader2, FileText, Eye, Plus, LayoutDashboard, FileEdit,
  Trash2, PlayCircle, Clock, CheckCircle2, XCircle, ChevronDown, FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PRODUCTS } from "../../../shared/willConstants";
import { toast } from "sonner";

type SubmissionStatus = "submitted" | "processing" | "complete" | "cancelled";

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  submitted: {
    label: "Submitted",
    bg: "oklch(0.78 0.12 85)",
    color: "oklch(0.2 0.05 155)",
    icon: <Clock className="w-3 h-3" />,
  },
  processing: {
    label: "Processing",
    bg: "oklch(0.7 0.15 250)",
    color: "white",
    icon: <PlayCircle className="w-3 h-3" />,
  },
  complete: {
    label: "Complete",
    bg: "oklch(0.55 0.15 145)",
    color: "white",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    bg: "oklch(0.6 0.18 25)",
    color: "white",
    icon: <XCircle className="w-3 h-3" />,
  },
};

function getProductLabel(id: string) {
  return PRODUCTS.find(p => p.id === id)?.label ?? id;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(date: Date | string | null | undefined) {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: submissions, isLoading: loadingSubmissions } = trpc.will.list.useQuery();
  const { data: drafts, isLoading: loadingDrafts } = trpc.will.listDrafts.useQuery();

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");

  // Filtered submissions based on active status filter
  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    if (statusFilter === "all") return submissions;
    return submissions.filter(s => (s.status ?? "submitted") === statusFilter);
  }, [submissions, statusFilter]);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const deleteDraftMutation = trpc.will.deleteDraft.useMutation({
    onSuccess: () => {
      toast.success("Draft deleted.");
      utils.will.listDrafts.invalidate();
    },
    onError: () => toast.error("Failed to delete draft."),
  });

  const deleteSubmissionMutation = trpc.will.deleteSubmission.useMutation({
    onSuccess: () => {
      toast.success("Submission deleted.");
      utils.will.list.invalidate();
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete submission.");
      setDeleteTarget(null);
    },
  });

  const updateStatusMutation = trpc.will.updateStatus.useMutation({
    onSuccess: (_data, variables) => {
      const cfg = STATUS_CONFIG[variables.status as SubmissionStatus];
      toast.success(`Status updated to "${cfg?.label ?? variables.status}".`);
      utils.will.list.invalidate();
    },
    onError: () => toast.error("Failed to update status."),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleResumeDraft = (draftId: number) => navigate(`/?draftId=${draftId}`);

  const handleDeleteDraft = (draftId: number) => {
    if (confirm("Delete this draft? This cannot be undone.")) {
      deleteDraftMutation.mutate({ id: draftId });
    }
  };

  const handleDeleteSubmission = (id: number, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDeleteSubmission = () => {
    if (deleteTarget) deleteSubmissionMutation.mutate({ id: deleteTarget.id });
  };

  const handleStatusChange = (id: number, status: SubmissionStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 155)" }}>
      {/* Header */}
      <header className="genesis-gradient shadow-lg">
        <div className="container max-w-6xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/manus-storage/genesis-logo_48897107.png"
                alt="Genesis Estate Planning"
                className="h-12 w-12 object-contain rounded-lg"
              />
              <div>
                <h1 className="font-serif text-xl font-semibold text-white">Admin Dashboard</h1>
                <p className="text-sm" style={{ color: "oklch(0.78 0.12 85)" }}>
                  Genesis Estate Planning
                </p>
              </div>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <Plus className="w-4 h-4" />
                New Instruction
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Submitted", value: submissions?.length ?? 0 },
            { label: "Drafts In Progress", value: drafts?.length ?? 0 },
            { label: "This Month", value: submissions?.filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth()).length ?? 0 },
            { label: "Complete", value: submissions?.filter(s => s.status === "complete").length ?? 0 },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold genesis-green-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="submissions">
          <TabsList className="mb-4 bg-white border border-border">
            <TabsTrigger value="submissions" className="gap-2 data-[state=active]:genesis-green-text">
              <LayoutDashboard className="w-4 h-4" />
              Submissions
              {submissions?.length ? (
                <Badge className="ml-1 text-[10px] py-0 px-1.5" style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                  {submissions.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2 data-[state=active]:genesis-green-text">
              <FileEdit className="w-4 h-4" />
              Drafts
              {drafts?.length ? (
                <Badge className="ml-1 text-[10px] py-0 px-1.5" style={{ background: "oklch(0.75 0.14 85)", color: "oklch(0.2 0.05 155)" }}>
                  {drafts.length}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {/* ── Submissions Tab ── */}
          <TabsContent value="submissions">
            {/* Status filter bar */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  statusFilter === "all"
                    ? "border-transparent text-white"
                    : "border-border bg-white text-muted-foreground hover:border-muted-foreground"
                }`}
                style={statusFilter === "all" ? { background: "oklch(0.28 0.07 155)" } : {}}
              >
                All ({submissions?.length ?? 0})
              </button>
              {(Object.entries(STATUS_CONFIG) as [SubmissionStatus, typeof STATUS_CONFIG[SubmissionStatus]][]).map(([s, cfg]) => {
                const count = submissions?.filter(sub => (sub.status ?? "submitted") === s).length ?? 0;
                const isActive = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isActive ? "border-transparent" : "border-border bg-white text-muted-foreground hover:opacity-80"
                    }`}
                    style={isActive ? { background: cfg.bg, color: cfg.color } : {}}
                  >
                    {cfg.icon}
                    {cfg.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b" style={{ background: "oklch(0.97 0.015 155)" }}>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 genesis-green-text" />
                  <h2 className="font-serif text-base font-semibold genesis-green-text">
                    {statusFilter === "all" ? `All Submissions (${submissions?.length ?? 0})` : `${STATUS_CONFIG[statusFilter].label} (${filteredSubmissions.length})`}
                  </h2>
                </div>
              </div>

              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
                </div>
              ) : !submissions?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No submissions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Completed Will instructions will appear here</p>
                  <Link href="/" className="mt-4">
                    <Button size="sm" style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                      Create First Instruction
                    </Button>
                  </Link>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No {STATUS_CONFIG[statusFilter as SubmissionStatus]?.label ?? ""} submissions</p>
                  <button onClick={() => setStatusFilter("all")} className="mt-2 text-xs underline" style={{ color: "oklch(0.28 0.07 155)" }}>Show all</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ background: "oklch(0.98 0.005 155)" }}>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Reference</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Client</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Consultant</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Products</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Date</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((sub, index) => {
                        const products = Array.isArray(sub.productsOrdered) ? sub.productsOrdered as string[] : [];
                        const status = (sub.status ?? "submitted") as SubmissionStatus;
                        const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
                        const clientName = `${sub.client1FirstName ?? ""} ${sub.client1LastName ?? ""}`.trim() || "Unknown";

                        return (
                          <tr
                            key={sub.id}
                            className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                            style={{ background: index % 2 === 0 ? "white" : "oklch(0.99 0.003 155)" }}
                          >
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs font-semibold" style={{ color: "oklch(0.65 0.14 80)" }}>
                                {sub.referenceNumber}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-foreground">{clientName}</span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{sub.consultantName ?? "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {products.slice(0, 2).map(id => (
                                  <Badge
                                    key={id}
                                    className="text-[10px] py-0"
                                    style={{ background: "oklch(0.28 0.07 155 / 0.1)", color: "oklch(0.28 0.07 155)" }}
                                  >
                                    {getProductLabel(id)}
                                  </Badge>
                                ))}
                                {products.length > 2 && (
                                  <Badge className="text-[10px] py-0 bg-muted text-muted-foreground">
                                    +{products.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(sub.createdAt)}</td>

                            {/* ── Status dropdown ── */}
                            <td className="px-4 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    style={{ background: statusCfg.bg, color: statusCfg.color }}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    {statusCfg.icon}
                                    {statusCfg.label}
                                    <ChevronDown className="w-3 h-3 opacity-70" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-44">
                                  <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Change status to</div>
                                  <DropdownMenuSeparator />
                                  {(Object.entries(STATUS_CONFIG) as [SubmissionStatus, typeof STATUS_CONFIG[SubmissionStatus]][])
                                    .filter(([s]) => s !== status)
                                    .map(([s, cfg]) => (
                                      <DropdownMenuItem
                                        key={s}
                                        className="gap-2 cursor-pointer"
                                        onClick={() => handleStatusChange(sub.id, s)}
                                      >
                                        <span
                                          className="flex items-center justify-center w-5 h-5 rounded-full text-[10px]"
                                          style={{ background: cfg.bg, color: cfg.color }}
                                        >
                                          {cfg.icon}
                                        </span>
                                        {cfg.label}
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>

                            {/* ── Actions ── */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Link href={`/admin/submission/${sub.id}`}>
                                  <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
                                    <Eye className="w-3 h-3" />
                                    View
                                  </Button>
                                </Link>
                                <a href={`/api/submissions/${sub.id}/pdf`} download title="Download PDF">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted">
                                    <FileDown className="w-3.5 h-3.5" style={{ color: "oklch(0.28 0.07 155)" }} />
                                  </Button>
                                </a>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleDeleteSubmission(sub.id, clientName)}
                                  disabled={deleteSubmissionMutation.isPending}
                                  title="Delete submission"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Drafts Tab ── */}
          <TabsContent value="drafts">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b" style={{ background: "oklch(0.97 0.015 155)" }}>
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 genesis-green-text" />
                  <h2 className="font-serif text-base font-semibold genesis-green-text">
                    Saved Drafts ({drafts?.length ?? 0})
                  </h2>
                  <span className="text-xs text-muted-foreground ml-1">— click Resume to continue an instruction</span>
                </div>
              </div>

              {loadingDrafts ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
                </div>
              ) : !drafts?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileEdit className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No drafts saved</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the "Save Draft" button on the form to save an in-progress instruction
                  </p>
                  <Link href="/" className="mt-4">
                    <Button size="sm" style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                      Start New Instruction
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ background: "oklch(0.98 0.005 155)" }}>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Reference</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Client</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Consultant</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Step</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Last Saved</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drafts.map((draft, index) => (
                        <tr
                          key={draft.id}
                          className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                          style={{ background: index % 2 === 0 ? "white" : "oklch(0.99 0.003 155)" }}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold" style={{ color: "oklch(0.65 0.14 80)" }}>
                              {draft.referenceNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-foreground">
                              {draft.client1FirstName || draft.client1LastName
                                ? `${draft.client1FirstName ?? ""} ${draft.client1LastName ?? ""}`.trim()
                                : <span className="text-muted-foreground italic">Not started</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{draft.consultantName ?? "—"}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs">
                              Step {draft.currentStep ?? 1}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{timeAgo(draft.updatedAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 h-7 text-xs"
                                onClick={() => handleResumeDraft(draft.id)}
                              >
                                <PlayCircle className="w-3 h-3" />
                                Resume
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteDraft(draft.id)}
                                disabled={deleteDraftMutation.isPending}
                                title="Delete draft"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the submission for{" "}
              <strong>{deleteTarget?.name}</strong>. This action cannot be undone and the data will be lost forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubmission}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSubmissionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
