import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Download, RotateCcw, Save, FileText, MessageSquare, ClipboardList, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type FullMatter = any;

interface Props {
  matter: FullMatter;
}

type DocType = "will" | "commentary" | "signing-guide";

interface DocTab {
  id: DocType;
  label: string;
  icon: React.ReactNode;
  endpoint: (matterId: number, testator: string) => string;
  downloadEndpoint: (matterId: number, testator: string) => string;
  downloadLabel: string;
}

const DOC_TABS: DocTab[] = [
  {
    id: "will",
    label: "Will",
    icon: <FileText className="h-3.5 w-3.5" />,
    endpoint: (id, t) => `/api/matters/${id}/will?testator=${t}`,
    downloadEndpoint: (id, t) => `/api/matters/${id}/will-pdf?testator=${t}`,
    downloadLabel: "Download Will",
  },
  {
    id: "commentary",
    label: "Commentary",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    endpoint: (id, t) => `/api/matters/${id}/commentary?testator=${t}`,
    downloadEndpoint: (id, t) => `/api/matters/${id}/commentary?testator=${t}`,
    downloadLabel: "Download Commentary",
  },
  {
    id: "signing-guide",
    label: "Signing Guide",
    icon: <ClipboardList className="h-3.5 w-3.5" />,
    endpoint: (id, t) => `/api/matters/${id}/signing-guide?testator=${t}`,
    downloadEndpoint: (id, t) => `/api/matters/${id}/signing-guide?testator=${t}`,
    downloadLabel: "Download Signing Guide",
  },
];

// ── Single document viewer ────────────────────────────────────────────────────

function DocViewer({
  matterId,
  testatorRole,
  doc,
  isEditable,
}: {
  matterId: number;
  testatorRole: "testator1" | "testator2";
  doc: DocTab;
  isEditable: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [isEdited, setIsEdited] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const url = doc.endpoint(matterId, testatorRole);
  const downloadUrl = doc.downloadEndpoint(matterId, testatorRole);

  // Check if a saved version exists on mount
  useEffect(() => {
    if (doc.id !== "will") return;
    fetch(url, { method: "HEAD" }).then(res => {
      setIsEdited(res.headers.get("X-Will-Edited") === "true");
    }).catch(() => {});
  }, [url, doc.id]);

  const handleIframeLoad = () => {
    setLoading(false);
    if (doc.id !== "will" || !isEditable) return;
    // Make the iframe content editable
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    iframe.contentDocument.body.contentEditable = "true";
    iframe.contentDocument.body.style.outline = "none";
    // Listen for changes
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
      // Reload the iframe
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

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-1.5 flex-1">
          {isEdited && !hasUnsaved && (
            <Badge variant="default" className="h-5 text-[10px] gap-1 bg-green-600">
              <CheckCircle2 className="h-3 w-3" /> Edited version saved
            </Badge>
          )}
          {hasUnsaved && (
            <Badge variant="outline" className="h-5 text-[10px] gap-1 border-amber-500 text-amber-600">
              <AlertCircle className="h-3 w-3" /> Unsaved changes
            </Badge>
          )}
          {!isEdited && !hasUnsaved && doc.id === "will" && (
            <span className="text-[10px] text-muted-foreground">Click any text to edit directly</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {doc.id === "will" && hasUnsaved && (
            <Button size="sm" className="h-6 px-2 text-xs gap-1" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {saving ? "Saving…" : "Save Edits"}
            </Button>
          )}
          {doc.id === "will" && isEdited && !hasUnsaved && (
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowResetDialog(true)}>
              <RotateCcw className="h-3 w-3" />
              Reset to Original
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={handleDownload}>
            <Download className="h-3 w-3" />
            {isEdited && doc.id === "will" ? "Download Edited" : doc.downloadLabel}
          </Button>
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
          title={`${doc.label} preview`}
        />
      </div>

      {/* Reset confirmation */}
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

// ── Main preview ──────────────────────────────────────────────────────────────

export function MatterPreview({ matter }: Props) {
  const isMirror = matter.matterType === "mirror";
  const [testatorRole, setTestatorRole] = useState<"testator1" | "testator2">("testator1");
  const [activeDoc, setActiveDoc] = useState<DocType>("will");

  const t1Name = matter.clients?.find((c: any) => c.clientRole === "testator1")?.fullName || "Testator 1";
  const t2Name = matter.clients?.find((c: any) => c.clientRole === "testator2")?.fullName || "Testator 2";

  const activeDocDef = DOC_TABS.find(d => d.id === activeDoc)!;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Document type selector */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card flex-shrink-0">
        {isMirror && (
          <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
            <button
              onClick={() => setTestatorRole("testator1")}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${testatorRole === "testator1" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              {t1Name}
            </button>
            <button
              onClick={() => setTestatorRole("testator2")}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${testatorRole === "testator2" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              {t2Name}
            </button>
          </div>
        )}
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
            onClick={() => {
              // Download all three documents
              DOC_TABS.forEach(doc => {
                const a = document.createElement("a");
                a.href = doc.downloadEndpoint(matter.id, testatorRole);
                a.target = "_blank";
                a.click();
              });
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Download All
          </Button>
        </div>
      </div>

      {/* Document viewer */}
      <div className="flex-1 overflow-hidden">
        <DocViewer
          key={`${matter.id}-${testatorRole}-${activeDoc}`}
          matterId={matter.id}
          testatorRole={testatorRole}
          doc={activeDocDef}
          isEditable={activeDoc === "will"}
        />
      </div>
    </div>
  );
}
