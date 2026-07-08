import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft, FileDown, FileText, RefreshCw, Maximize2, Minimize2,
  Printer, Eye, CheckCircle2, AlertCircle, Loader2, Save, RotateCcw,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function WelcomePackPreview() {
  const { id } = useParams<{ id: string }>();
  const numId = parseInt(id ?? "0", 10);

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEdited, setIsEdited] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch submission metadata for the header
  const { data: submission } = trpc.will.getById.useQuery(
    { id: numId },
    { enabled: !isNaN(numId) && numId > 0 }
  );

  const previewUrl = `/api/submissions/${numId}/welcome-pack-preview`;
  const pdfUrl = `/api/submissions/${numId}/welcome-pack-pdf`;
  const docxUrl = `/api/submissions/${numId}/welcome-pack-docx`;

  const clientName = [
    submission?.client1Prefix,
    submission?.client1FirstName,
    submission?.client1LastName,
  ].filter(Boolean).join(" ") || `Submission #${numId}`;

  const isMirror = (submission?.willType ?? "").toLowerCase().includes("mirror");
  const client2Name = isMirror
    ? [submission?.client2Prefix, submission?.client2FirstName, submission?.client2LastName].filter(Boolean).join(" ")
    : "";
  const displayName = isMirror && client2Name ? `${clientName} & ${client2Name}` : clientName;
  const safeName = displayName.replace(/[^a-zA-Z0-9\s-]/g, "").trim() || "Client";

  // Check if there's a saved edited version
  useEffect(() => {
    fetch(previewUrl, { method: "HEAD" }).then(res => {
      setIsEdited(res.headers.get("X-Welcome-Pack-Edited") === "true");
    }).catch(() => {});
  }, [previewUrl, refreshKey]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    // Make body editable
    iframe.contentDocument.body.contentEditable = "true";
    iframe.contentDocument.body.style.outline = "none";
    iframe.contentDocument.body.style.cursor = "text";
    // Add a subtle edit-mode indicator style
    const style = iframe.contentDocument.createElement("style");
    style.textContent = `
      body[contenteditable="true"] *:hover {
        outline: 1px dashed rgba(201,168,76,0.4) !important;
        outline-offset: 2px;
      }
      body[contenteditable="true"] *:focus {
        outline: 2px solid rgba(201,168,76,0.7) !important;
        outline-offset: 2px;
      }
    `;
    iframe.contentDocument.head.appendChild(style);
    // Track changes
    const handler = () => setHasUnsaved(true);
    iframe.contentDocument.addEventListener("input", handler);
  }, []);

  const execCmd = (cmd: string, value?: string) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    iframe.contentDocument.execCommand(cmd, false, value);
    iframe.contentWindow?.focus();
    setHasUnsaved(true);
  };

  const handleSave = async () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    setSaving(true);
    try {
      const html = iframe.contentDocument.documentElement.outerHTML;
      const res = await fetch(`/api/submissions/${numId}/welcome-pack-html`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) throw new Error("Save failed");
      setIsEdited(true);
      setHasUnsaved(false);
      toast.success("Welcome Pack edits saved");
    } catch {
      toast.error("Failed to save edits");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch(`/api/submissions/${numId}/welcome-pack-html`, { method: "DELETE" });
      if (!res.ok) throw new Error("Reset failed");
      setIsEdited(false);
      setHasUnsaved(false);
      setIframeLoaded(false);
      setRefreshKey(k => k + 1);
      toast.success("Welcome Pack reset to original");
    } catch {
      toast.error("Failed to reset");
    } finally {
      setShowResetDialog(false);
    }
  };

  const triggerDownload = async (url: string, filename: string, setDl: (v: boolean) => void) => {
    setDl(true);
    try {
      const res = await fetch(url);
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
    } catch (err: unknown) {
      toast.error(`Download failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setDl(false);
    }
  };

  const handleDownloadPdf = () => triggerDownload(pdfUrl, `WelcomePack_${safeName}.pdf`, setDownloadingPdf);
  const handleDownloadDocx = () => triggerDownload(docxUrl, `WelcomePack_${safeName}.docx`, setDownloadingDocx);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeError(false);
    setHasUnsaved(false);
    setRefreshKey(k => k + 1);
  };

  // Keyboard shortcut: Escape to exit fullscreen
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const headerBg = "oklch(0.18 0.05 155)";
  const gold = "#C9A84C";

  return (
    <TooltipProvider>
      <div className={`flex flex-col bg-gray-100 transition-all duration-300 ${fullscreen ? "fixed inset-0 z-50" : "min-h-screen"}`}>

        {/* ── Top header ─────────────────────────────────────────────────────── */}
        <header className="flex items-center gap-2 px-3 py-2.5 shadow-md flex-shrink-0" style={{ background: headerBg }}>
          <Link href={`/admin/submission/${numId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-white/80 hover:text-white hover:bg-white/10 text-xs px-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>

          <div className="w-px h-5 bg-white/20" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Eye className="w-4 h-4 flex-shrink-0" style={{ color: gold }} />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">Welcome Pack — Editable Preview</p>
              <p className="text-white/60 text-xs truncate">{displayName}</p>
            </div>
            {submission?.referenceNumber && (
              <Badge variant="outline" className="ml-1 hidden sm:flex text-xs border-white/20 text-white/70 flex-shrink-0">
                {submission.referenceNumber}
              </Badge>
            )}
            {isEdited && !hasUnsaved && (
              <Badge className="h-5 text-[10px] gap-1 flex-shrink-0" style={{ background: "oklch(0.45 0.15 155)", color: "white" }}>
                <CheckCircle2 className="h-3 w-3" /> Edited
              </Badge>
            )}
            {hasUnsaved && (
              <Badge variant="outline" className="h-5 text-[10px] gap-1 border-amber-400 text-amber-300 flex-shrink-0">
                <AlertCircle className="h-3 w-3" /> Unsaved
              </Badge>
            )}
          </div>

          {/* Status */}
          {!iframeLoaded && !iframeError && (
            <span className="flex items-center gap-1 text-white/60 text-xs flex-shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Loading…</span>
            </span>
          )}

          <div className="w-px h-5 bg-white/20 flex-shrink-0" />

          {/* Utility buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-white/70 hover:text-white hover:bg-white/10 px-2">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh (discards unsaved changes)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handlePrint} disabled={!iframeLoaded} className="text-white/70 hover:text-white hover:bg-white/10 px-2">
                  <Printer className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setFullscreen(f => !f)} className="text-white/70 hover:text-white hover:bg-white/10 px-2">
                  {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}</TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-5 bg-white/20 flex-shrink-0" />

          {/* Save / Reset / Download */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasUnsaved && (
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 text-xs px-2 sm:px-3"
                style={{ background: "oklch(0.45 0.15 155)", color: "white" }}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? "Saving…" : "Save"}
              </Button>
            )}
            {isEdited && !hasUnsaved && (
              <Button variant="outline" size="sm" onClick={() => setShowResetDialog(true)}
                className="gap-1.5 text-xs px-2 text-red-300 border-red-400/40 hover:bg-red-400/10">
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
            <Button size="sm" onClick={handleDownloadPdf} disabled={downloadingPdf}
              className="gap-1.5 text-xs px-2 sm:px-3 font-medium"
              style={{ background: gold, color: "oklch(0.18 0.05 155)" }}>
              {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isEdited ? "Edited PDF" : "PDF"}</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadDocx} disabled={downloadingDocx}
              className="gap-1.5 text-xs px-2 sm:px-3"
              style={{ borderColor: "rgba(201,168,76,0.5)", color: gold, background: "rgba(201,168,76,0.1)" }}>
              {downloadingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isEdited ? "Edited Word" : "Word"}</span>
              <span className="sm:hidden">Word</span>
            </Button>
          </div>
        </header>

        {/* ── Formatting toolbar ─────────────────────────────────────────────── */}
        {iframeLoaded && (
          <div className="flex items-center gap-1 px-3 py-1.5 border-b flex-shrink-0 flex-wrap"
            style={{ background: "oklch(0.22 0.04 155)", borderColor: "rgba(255,255,255,0.08)" }}>
            <span className="text-xs text-white/40 mr-1 hidden sm:inline">Format:</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => execCmd("bold")} className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10">
                  <Bold className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => execCmd("italic")} className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10">
                  <Italic className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => execCmd("underline")} className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10">
                  <Underline className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
            </Tooltip>
            <div className="w-px h-4 bg-white/15 mx-0.5" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => execCmd("justifyLeft")} className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10">
                  <AlignLeft className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align left</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => execCmd("justifyCenter")} className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10">
                  <AlignCenter className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align centre</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => execCmd("justifyRight")} className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10">
                  <AlignRight className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align right</TooltipContent>
            </Tooltip>
            <div className="w-px h-4 bg-white/15 mx-0.5" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => execCmd("fontSize", "4")} className="h-7 px-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 gap-1">
                  <Type className="w-3 h-3" />A+
                </Button>
              </TooltipTrigger>
              <TooltipContent>Increase font size</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => execCmd("fontSize", "2")} className="h-7 px-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 gap-1">
                  <Type className="w-2.5 h-2.5" />A-
                </Button>
              </TooltipTrigger>
              <TooltipContent>Decrease font size</TooltipContent>
            </Tooltip>
            <div className="w-px h-4 bg-white/15 mx-0.5" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => execCmd("removeFormat")} className="h-7 px-2 text-xs text-white/50 hover:text-white hover:bg-white/10">
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove formatting from selection</TooltipContent>
            </Tooltip>
            <div className="flex-1" />
            <span className="text-xs text-white/40 hidden sm:inline">Click any text in the document to edit it</span>
          </div>
        )}

        {/* ── Preview area ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="mx-auto shadow-2xl rounded-sm overflow-hidden"
              style={{ maxWidth: "920px", minHeight: "1100px", background: "white", border: "1px solid #e5e7eb" }}>

              {/* Loading state */}
              {!iframeLoaded && !iframeError && (
                <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: "600px" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "oklch(0.95 0.02 155)" }}>
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.28 0.07 155)" }} />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Generating Welcome Pack…</p>
                  <p className="text-xs text-gray-400">This may take a few seconds</p>
                </div>
              )}

              {/* Error state */}
              {iframeError && (
                <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: "600px" }}>
                  <AlertCircle className="w-12 h-12 text-red-400" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Failed to load preview</p>
                    <p className="text-xs text-gray-400 mt-1">The Welcome Pack could not be generated</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Try again
                  </Button>
                </div>
              )}

              {/* Editable iframe */}
              <iframe
                key={refreshKey}
                ref={iframeRef}
                src={previewUrl}
                title="Welcome Pack — Editable Preview"
                onLoad={handleIframeLoad}
                onError={() => { setIframeError(true); setIframeLoaded(false); }}
                style={{
                  width: "100%",
                  minHeight: "1100px",
                  border: "none",
                  display: iframeLoaded ? "block" : "none",
                }}
              />
            </div>
          </div>

          {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t flex-shrink-0"
            style={{ background: "white", borderColor: "#e5e7eb" }}>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Click any text in the preview to edit it. Save your changes, then download the updated PDF or Word file.
              </span>
            </p>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {hasUnsaved && (
                <Button size="sm" onClick={handleSave} disabled={saving}
                  className="gap-1.5 text-xs"
                  style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? "Saving…" : "Save edits"}
                </Button>
              )}
              <Button size="sm" onClick={handleDownloadPdf} disabled={downloadingPdf}
                className="gap-1.5 text-xs font-medium"
                style={{ background: "oklch(0.28 0.07 155)", color: "white" }}>
                {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadDocx} disabled={downloadingDocx}
                className="gap-1.5 text-xs"
                style={{ borderColor: gold, color: "oklch(0.55 0.1 85)" }}>
                {downloadingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Download Word</span>
                <span className="sm:hidden">Word</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset confirmation dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Welcome Pack to original?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently discard your saved edits and regenerate the Welcome Pack from the original submission data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleReset}>
              Reset to original
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
