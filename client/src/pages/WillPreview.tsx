/**
 * WillPreview.tsx
 *
 * Admin back-office page that loads a Will document as editable HTML.
 * Staff can make manual changes directly in the document, save them
 * permanently, and then export as PDF or Word — the saved version is
 * always used for downloads when present.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  FileText,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Printer,
  RefreshCw,
  ChevronDown,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type WillType = "single" | "mirror_client1" | "mirror_client2";

interface WillOptions {
  willType: WillType;
  ppt: boolean;
  discretionary: boolean;
  vulnerable: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUrl(id: string, opts: WillOptions): string {
  const params = new URLSearchParams({
    willType: opts.willType,
    ppt: opts.ppt ? "1" : "0",
    discretionary: opts.discretionary ? "1" : "0",
    vulnerable: opts.vulnerable ? "1" : "0",
  });
  return `/api/submissions/${id}/will-html?${params.toString()}`;
}

function buildPdfUrl(id: string, opts: WillOptions): string {
  const params = new URLSearchParams({
    willType: opts.willType,
    ppt: opts.ppt ? "1" : "0",
    discretionary: opts.discretionary ? "1" : "0",
    vulnerable: opts.vulnerable ? "1" : "0",
  });
  return `/api/submissions/${id}/will?${params.toString()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WillPreview() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  // Parse options from query string
  const searchParams = new URLSearchParams(window.location.search);
  const [opts, setOpts] = useState<WillOptions>({
    willType: (searchParams.get("willType") as WillType) || "single",
    ppt: searchParams.get("ppt") === "1",
    discretionary: searchParams.get("discretionary") === "1",
    vulnerable: searchParams.get("vulnerable") === "1",
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [dirty, setDirty] = useState(false);
  const [isEdited, setIsEdited] = useState(false); // true when server has a saved version
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Load the HTML Will (server returns saved version if present)
  const loadWill = useCallback(async (forceRegenerate = false) => {
    setLoading(true);
    setDirty(false);
    try {
      const url = forceRegenerate
        ? buildUrl(id!, opts) + "&_regen=1"
        : buildUrl(id!, opts);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const html = await res.text();
      // Check if the server returned a saved edited version
      const edited = res.headers.get("X-Will-Edited") === "true";
      setIsEdited(edited);
      setHtmlContent(html);
    } catch (err) {
      toast.error("Failed to load Will document");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, opts]);

  useEffect(() => {
    loadWill();
  }, [loadWill]);

  // Inject HTML into iframe and make it editable
  useEffect(() => {
    if (!htmlContent || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(htmlContent);
    doc.close();
    // Make the will-document div editable
    const willDiv = doc.getElementById("will-content");
    if (willDiv) {
      willDiv.contentEditable = "true";
      willDiv.style.outline = "none";
      willDiv.addEventListener("input", () => setDirty(true));
    }
    // Prevent default link navigation inside iframe
    doc.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A") e.preventDefault();
    });
  }, [htmlContent]);

  // ── Get current edited HTML from iframe ──────────────────────────────────

  const getCurrentHtml = (): string | null => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return null;
    const willDiv = doc.getElementById("will-content");
    if (willDiv) return willDiv.outerHTML;
    return doc.body?.innerHTML ?? null;
  };

  // ── Save edits to server ──────────────────────────────────────────────────

  const saveEdits = async () => {
    const html = getCurrentHtml();
    if (!html) { toast.error("Could not read document content"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/submissions/${id}/will-html`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, willType: opts.willType }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setDirty(false);
      setIsEdited(true);
      toast.success("Edits saved — PDF and Word downloads will now use this version");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save edits");
    } finally {
      setSaving(false);
    }
  };

  // ── Reset to original (clear saved version) ───────────────────────────────

  const resetToOriginal = async () => {
    try {
      const res = await fetch(
        `/api/submissions/${id}/will-html?willType=${opts.willType}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setIsEdited(false);
      setDirty(false);
      toast.success("Saved edits cleared — reloading original…");
      await loadWill();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset Will");
    }
  };

  // ── Formatting commands ──────────────────────────────────────────────────

  const execCmd = (cmd: string, value?: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.execCommand(cmd, false, value);
    iframeRef.current?.contentWindow?.focus();
  };

  // ── Export: PDF via server ────────────────────────────────────────────────

  const downloadPdf = () => {
    const url = buildPdfUrl(id!, opts);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Will_${opts.willType}.pdf`;
    a.click();
  };

  // ── Export: Word (.docx) via server ─────────────────────────────────────────

  const downloadDocx = async () => {
    try {
      const params = new URLSearchParams({
        willType: opts.willType,
        ppt: opts.ppt ? "1" : "0",
        discretionary: opts.discretionary ? "1" : "0",
        vulnerable: opts.vulnerable ? "1" : "0",
      });
      const url = `/api/submissions/${id}/will-docx?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `Will_${opts.willType}.docx`;
      a.click();
      URL.revokeObjectURL(objectUrl);
      toast.success("Word document downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Word document");
    }
  };

  // ── Print ─────────────────────────────────────────────────────────────────

  const printDoc = () => {
    iframeRef.current?.contentWindow?.print();
  };

  // ── Will type label ───────────────────────────────────────────────────────

  const willTypeLabel: Record<WillType, string> = {
    single: "Single Will",
    mirror_client1: "Mirror Will — Client 1",
    mirror_client2: "Mirror Will — Client 2",
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ── Top toolbar ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap shadow-sm">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/admin/submission/${id}`)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block" />

        {/* Will type badge */}
        <Badge variant="outline" className="text-xs font-medium">
          {willTypeLabel[opts.willType]}
        </Badge>
        {opts.ppt && <Badge className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">PPT</Badge>}
        {opts.discretionary && <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">Discretionary</Badge>}
        {opts.vulnerable && <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">Vulnerable</Badge>}

        {/* Edited badge — shown when a saved version exists on the server */}
        {isEdited && !dirty && (
          <Badge className="text-xs bg-green-100 text-green-800 border-green-200 border">
            ✓ Edited version saved
          </Badge>
        )}

        {dirty && (
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
            Unsaved changes
          </Badge>
        )}

        <div className="flex-1" />

        {/* Formatting buttons */}
        <div className="flex items-center gap-0.5 border border-gray-200 rounded-md p-0.5">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => execCmd("bold")} title="Bold">
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => execCmd("italic")} title="Italic">
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => execCmd("underline")} title="Underline">
            <Underline className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-px bg-gray-200 mx-0.5" />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => execCmd("justifyLeft")} title="Align left">
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => execCmd("justifyCenter")} title="Align centre">
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => execCmd("justifyRight")} title="Align right">
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-px bg-gray-200 mx-0.5" />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => execCmd("insertUnorderedList")} title="Bullet list">
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => execCmd("insertOrderedList")} title="Numbered list">
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block" />

        {/* Save Edits */}
        <Button
          size="sm"
          variant="outline"
          onClick={saveEdits}
          disabled={saving || loading}
          className="gap-1 border-green-300 text-green-700 hover:bg-green-50"
          title="Save edits — PDF and Word downloads will use this version"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">{saving ? "Saving…" : "Save Edits"}</span>
        </Button>

        {/* Reset to Original */}
        {isEdited && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            title="Discard saved edits and restore the auto-generated version"
            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Reset to Original</span>
          </Button>
        )}

        {/* Print */}
        <Button variant="ghost" size="sm" onClick={printDoc} className="gap-1" title="Print">
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Print</span>
        </Button>

        {/* Download dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1 bg-[#1a3a2a] hover:bg-[#2a5a3a] text-white">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={downloadPdf} className="gap-2">
              <FileText className="h-4 w-4 text-red-500" />
              {isEdited ? "Download Edited PDF" : "Download as PDF"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={downloadDocx} className="gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              {isEdited ? "Download Edited Word (.docx)" : "Download as Word (.docx)"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Document iframe ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin text-[#1a3a2a]" />
              <p className="text-sm">Loading Will document…</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="Will Document Preview"
          className="w-full h-full border-none bg-white"
          style={{ display: loading ? "none" : "block" }}
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* ── Footer hint ──────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-200 px-4 py-1.5 text-xs text-gray-400 text-center">
        {isEdited
          ? "Showing your saved edited version. Downloads will use this version. Click \"Reset to Original\" to discard edits."
          : "Click anywhere in the document to edit. Click \"Save Edits\" to save your changes — PDF and Word downloads will then use your saved version."}
      </div>

      {/* ── Reset confirmation dialog ─────────────────────────────────────── */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Original?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently discard your saved edits for this Will and restore the
              auto-generated version. PDF and Word downloads will be regenerated from the
              form data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetToOriginal}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reset to Original
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
