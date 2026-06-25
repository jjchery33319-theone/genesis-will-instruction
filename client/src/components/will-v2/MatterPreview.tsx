import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Download, RotateCcw, Save, FileText, MessageSquare, ClipboardList, Loader2, CheckCircle2, AlertCircle, Users, FileWarning } from "lucide-react";

type FullMatter = any;

interface Props {
  matter: FullMatter;
}

type DocType = "will" | "commentary" | "signing-guide" | "letter-of-wishes";

interface DocTab {
  id: DocType;
  label: string;
  icon: React.ReactNode;
  endpoint: (matterId: number, testator: string) => string;
  downloadPdfEndpoint: (matterId: number, testator: string) => string;
  downloadPdfLabel: string;
  downloadDocxEndpoint?: (matterId: number, testator: string) => string;
  downloadDocxLabel?: string;
}

const DOC_TABS: DocTab[] = [
  {
    id: "will",
    label: "Will",
    icon: <FileText className="h-3.5 w-3.5" />,
    endpoint: (id, t) => `/api/matters/${id}/will?testator=${t}`,
    downloadPdfEndpoint: (id, t) => `/api/matters/${id}/will-pdf?testator=${t}`,
    downloadPdfLabel: "Download Will (PDF)",
  },
  {
    id: "commentary",
    label: "Commentary",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    endpoint: (id, t) => `/api/matters/${id}/commentary?testator=${t}`,
    downloadPdfEndpoint: (id, t) => `/api/matters/${id}/commentary-pdf?testator=${t}`,
    downloadPdfLabel: "Download Commentary (PDF)",
    downloadDocxEndpoint: (id, t) => `/api/matters/${id}/commentary-docx?testator=${t}`,
    downloadDocxLabel: "Download Commentary (Word)",
  },
  {
    id: "signing-guide",
    label: "Signing Guide",
    icon: <ClipboardList className="h-3.5 w-3.5" />,
    endpoint: (id, t) => `/api/matters/${id}/signing-guide?testator=${t}`,
    downloadPdfEndpoint: (id, t) => `/api/matters/${id}/signing-guide-pdf?testator=${t}`,
    downloadPdfLabel: "Download Signing Guide (PDF)",
  },
  {
    id: "letter-of-wishes",
    label: "Letter of Wishes",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    endpoint: (id, t) => `/api/matters/${id}/letter-of-wishes?testator=${t}`,
    downloadPdfEndpoint: (id, t) => `/api/matters/${id}/letter-of-wishes?testator=${t}&print=1`,
    downloadPdfLabel: "Print Letter of Wishes (PDF)",
  },
];

// ── Single document viewer ────────────────────────────────────────────────────

function DocViewer({
  matterId,
  testatorRole,
  doc,
  isEditable,
  clientName,
  isDraft,
}: {
  matterId: number;
  testatorRole: "testator1" | "testator2";
  doc: DocTab;
  isEditable: boolean;
  clientName: string;
  isDraft: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [isEdited, setIsEdited] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  const draftParam = isDraft ? "&draft=1" : "";
  const url = doc.endpoint(matterId, testatorRole) + draftParam;
  // PDF URL is the same HTML endpoint with ?print=1 — opens in new tab and auto-triggers print dialog
  const printUrl = `${doc.endpoint(matterId, testatorRole)}${doc.endpoint(matterId, testatorRole).includes('?') ? '&' : '?'}print=1${draftParam}`;
  const downloadDocxUrl = doc.downloadDocxEndpoint ? doc.downloadDocxEndpoint(matterId, testatorRole) + draftParam : null;

  useEffect(() => {
    if (doc.id !== "will") return;
    fetch(url, { method: "HEAD" }).then(res => {
      setIsEdited(res.headers.get("X-Will-Edited") === "true");
    }).catch(() => {});
  }, [url, doc.id]);

  const handleIframeLoad = () => {
    setLoading(false);
    if (doc.id !== "will" || !isEditable) return;
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    iframe.contentDocument.body.contentEditable = "true";
    iframe.contentDocument.body.style.outline = "none";
    const handler = () => setHasUnsaved(true);
    iframe.contentDocument.addEventListener("input", handler);
    return () => iframe.contentDocument?.removeEventListener("input", handler);
  };

  const handleSave = async () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    setSaving(true);
    try {
      const html = iframe.contentDocument.documentElement.outerHTML;
      const res = await fetch(`/api/matters/${matterId}/will-html`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, testatorRole }),
      });
      if (!res.ok) throw new Error("Save failed");
      setIsEdited(true);
      setHasUnsaved(false);
      toast.success("Will edits saved");
    } catch {
      toast.error("Failed to save edits");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`/api/matters/${matterId}/will-html?testator=${testatorRole}`, { method: "DELETE" });
      setIsEdited(false);
      setHasUnsaved(false);
      if (iframeRef.current) {
        iframeRef.current.src = url;
        setLoading(true);
      }
      toast.success("Reset to original Will");
    } catch {
      toast.error("Failed to reset");
    } finally {
      setShowResetDialog(false);
    }
  };

  const triggerDownload = async (
    downloadUrl: string,
    filename: string,
    setDl: (v: boolean) => void
  ) => {
    setDl(true);
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`);
    } finally {
      setDl(false);
    }
  };

  const safeName = clientName.replace(/[^a-zA-Z0-9\s-]/g, "").trim() || "Client";

  const handlePrintPdf = () => {
    // Open the HTML document in a new tab — it auto-triggers window.print() on load
    // User selects "Save as PDF" in the browser print dialog
    window.open(printUrl, "_blank");
  };

  const handleDownloadDocx = () => {
    if (!downloadDocxUrl) return;
    const docLabel = doc.id === "commentary" ? "Commentary" : "Document";
    triggerDownload(downloadDocxUrl, `${safeName}-${docLabel}.docx`, setDownloadingDocx);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Per-document toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {isEdited && !hasUnsaved && (
            <Badge variant="default" className="h-5 text-[10px] gap-1 bg-green-600 shrink-0">
              <CheckCircle2 className="h-3 w-3" /> Edited
            </Badge>
          )}
          {hasUnsaved && (
            <Badge variant="outline" className="h-5 text-[10px] gap-1 border-amber-500 text-amber-600 shrink-0">
              <AlertCircle className="h-3 w-3" /> Unsaved
            </Badge>
          )}
          {!isEdited && !hasUnsaved && doc.id === "will" && (
            <span className="text-[10px] text-muted-foreground truncate">Click any text to edit</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {doc.id === "will" && hasUnsaved && (
            <Button size="sm" className="h-6 px-2 text-xs gap-1" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          )}
          {doc.id === "will" && isEdited && !hasUnsaved && (
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowResetDialog(true)}>
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={handlePrintPdf}>
            <Download className="h-3 w-3" />
            {isEdited && doc.id === "will" ? "Edited PDF" : "PDF"}
          </Button>
          {downloadDocxUrl && (
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={handleDownloadDocx} disabled={downloadingDocx}>
              {downloadingDocx ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              Word
            </Button>
          )}
        </div>
      </div>

      {/* Document iframe */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          title={`${doc.label} — ${clientName}`}
        />
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to original Will?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently discard your saved edits and regenerate the Will from the current instructions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleReset}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Per-testator document set panel ──────────────────────────────────────────

function TestatorDocSet({
  matter,
  testatorRole,
  clientName,
  isDraft,
}: {
  matter: FullMatter;
  testatorRole: "testator1" | "testator2";
  clientName: string;
  isDraft: boolean;
}) {
  const [activeDoc, setActiveDoc] = useState<DocType>("will");
  const activeDocDef = DOC_TABS.find(d => d.id === activeDoc)!;

  const downloadBlob = async (dlUrl: string, filename: string) => {
    const res = await fetch(dlUrl);
    if (!res.ok) throw new Error(`${filename}: server returned ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  };

  const draftParam = isDraft ? "&draft=1" : "";
  const handleDownloadAll = () => {
    // Open each document in a new tab with ?print=1 — each auto-triggers the print dialog
    // User saves each as PDF via the browser's native print-to-PDF
    const t = testatorRole;
    window.open(`/api/matters/${matter.id}/will?testator=${t}&print=1${draftParam}`, "_blank");
    setTimeout(() => window.open(`/api/matters/${matter.id}/commentary?testator=${t}&print=1${draftParam}`, "_blank"), 600);
    setTimeout(() => window.open(`/api/matters/${matter.id}/signing-guide?testator=${t}&print=1${draftParam}`, "_blank"), 1200);
    toast.info(`Opening 3 documents for ${clientName} — save each as PDF using the print dialog. Letter of Wishes can be printed separately.`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Doc type selector + Download All for this testator */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
          {DOC_TABS.map(doc => (
            <button
              key={doc.id}
              onClick={() => setActiveDoc(doc.id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${activeDoc === doc.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              {doc.icon}
              {doc.label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1"
            onClick={handleDownloadAll}
          >
            <Download className="h-3.5 w-3.5" />
            {`Print All (PDF) — ${clientName}`}
          </Button>
        </div>
      </div>

      {/* Document viewer */}
      <div className="flex-1 overflow-hidden">
        <DocViewer
          key={`${matter.id}-${testatorRole}-${activeDoc}-${isDraft ? 'draft' : 'final'}`}
          matterId={matter.id}
          testatorRole={testatorRole}
          doc={activeDocDef}
          isEditable={activeDoc === "will"}
          clientName={clientName}
          isDraft={isDraft}
        />
      </div>
    </div>
  );
}

// ── Draft toggle bar (shared across single and mirror views) ─────────────────

function DraftToggleBar({ isDraft, onToggle }: { isDraft: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 border-b flex-shrink-0 transition-colors ${
      isDraft
        ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
        : "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
    }`}>
      <FileWarning className={`h-4 w-4 shrink-0 ${isDraft ? "text-amber-600" : "text-green-600"}`} />
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-semibold ${isDraft ? "text-amber-700 dark:text-amber-400" : "text-green-700 dark:text-green-400"}`}>
          {isDraft ? "Draft Mode — documents include a DRAFT watermark" : "Final Mode — documents are clean and ready for signing"}
        </span>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {isDraft
            ? "Uncheck to remove the watermark when the client has approved the Will."
            : "The watermark has been removed. This document is ready for execution."}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Label htmlFor="draft-toggle" className="text-xs font-medium cursor-pointer select-none">
          Mark as Draft
        </Label>
        <Switch
          id="draft-toggle"
          checked={isDraft}
          onCheckedChange={onToggle}
        />
      </div>
    </div>
  );
}

// ── Main preview ──────────────────────────────────────────────────────────────

export function MatterPreview({ matter }: Props) {
  const isMirror = matter.matterType === "mirror";
  const [isDraft, setIsDraft] = useState(true); // default: Draft mode ON

  const t1Name = matter.clients?.find((c: any) => c.clientRole === "testator1")?.fullName || "Testator 1";
  const t2Name = matter.clients?.find((c: any) => c.clientRole === "testator2")?.fullName || "Testator 2";

  // For single Wills: simple single-panel view
  if (!isMirror) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <DraftToggleBar isDraft={isDraft} onToggle={setIsDraft} />
        <TestatorDocSet matter={matter} testatorRole="testator1" clientName={t1Name} isDraft={isDraft} />
      </div>
    );
  }

  // For Mirror Wills: two tabs, one per testator, each with their own complete doc set
  const [activeTestator, setActiveTestator] = useState<"testator1" | "testator2">("testator1");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Draft toggle — applies to all documents */}
      <DraftToggleBar isDraft={isDraft} onToggle={setIsDraft} />

      {/* Mirror Will testator selector header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card/80 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="font-medium">Mirror Will — select testator:</span>
        </div>
        <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
          <button
            onClick={() => setActiveTestator("testator1")}
            className={`px-3 py-1 text-xs rounded transition-colors font-medium ${activeTestator === "testator1" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            {t1Name}
          </button>
          <button
            onClick={() => setActiveTestator("testator2")}
            className={`px-3 py-1 text-xs rounded transition-colors font-medium ${activeTestator === "testator2" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            {t2Name}
          </button>
        </div>
        <div className="ml-auto text-[10px] text-muted-foreground">
          Each testator has their own Will, Commentary &amp; Signing Guide
        </div>
      </div>

      {/* Active testator's complete document set */}
      <div className="flex-1 overflow-hidden">
        {activeTestator === "testator1" ? (
          <TestatorDocSet
            key={`t1-${matter.id}`}
            matter={matter}
            testatorRole="testator1"
            clientName={t1Name}
            isDraft={isDraft}
          />
        ) : (
          <TestatorDocSet
            key={`t2-${matter.id}`}
            matter={matter}
            testatorRole="testator2"
            clientName={t2Name}
            isDraft={isDraft}
          />
        )}
      </div>
    </div>
  );
}
