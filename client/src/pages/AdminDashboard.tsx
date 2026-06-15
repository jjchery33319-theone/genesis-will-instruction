import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Link, useLocation } from "wouter";
import { Loader2, FileText, Eye, Plus, LayoutDashboard, FileEdit, Trash2, PlayCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUCTS } from "../../../shared/willConstants";
import { toast } from "sonner";

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
  const { data: submissions, isLoading: loadingSubmissions } = trpc.will.list.useQuery();
  const { data: drafts, isLoading: loadingDrafts, refetch: refetchDrafts } = trpc.will.listDrafts.useQuery();
  const deleteDraftMutation = trpc.will.deleteDraft.useMutation({
    onSuccess: () => {
      toast.success("Draft deleted.");
      refetchDrafts();
    },
    onError: () => toast.error("Failed to delete draft."),
  });

  const handleResumeDraft = (draftId: number) => {
    navigate(`/?draftId=${draftId}`);
  };

  const handleDeleteDraft = (draftId: number) => {
    if (confirm("Delete this draft? This cannot be undone.")) {
      deleteDraftMutation.mutate({ id: draftId });
    }
  };

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
            { label: "With LPAs", value: submissions?.filter(s => Array.isArray(s.productsOrdered) && (s.productsOrdered as string[]).some((p: string) => p.includes("lpa") || p === "both_lpas")).length ?? 0 },
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
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b" style={{ background: "oklch(0.97 0.015 155)" }}>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 genesis-green-text" />
                  <h2 className="font-serif text-base font-semibold genesis-green-text">
                    All Submissions ({submissions?.length ?? 0})
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
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub, index) => {
                        const products = Array.isArray(sub.productsOrdered) ? sub.productsOrdered as string[] : [];
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
                              <span className="font-medium text-foreground">
                                {sub.client1FirstName} {sub.client1LastName}
                              </span>
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
                            <td className="px-4 py-3">
                              <Badge
                                className="text-xs capitalize"
                                style={{ background: "oklch(0.78 0.12 85)", color: "oklch(0.2 0.05 155)" }}
                              >
                                {sub.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Link href={`/admin/submission/${sub.id}`}>
                                <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
                                  <Eye className="w-3 h-3" />
                                  View
                                </Button>
                              </Link>
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
                        <th className="px-4 py-3"></th>
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
                                : <span className="text-muted-foreground italic">No name yet</span>
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{draft.consultantName ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Step {draft.currentStep ?? 1} of 15
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {timeAgo(draft.updatedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                className="gap-1.5 h-7 text-xs"
                                style={{ background: "oklch(0.28 0.07 155)", color: "white" }}
                                onClick={() => handleResumeDraft(draft.id)}
                              >
                                <PlayCircle className="w-3 h-3" />
                                Resume
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleDeleteDraft(draft.id)}
                                disabled={deleteDraftMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3" />
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
    </div>
  );
}
