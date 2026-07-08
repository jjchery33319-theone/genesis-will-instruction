import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";
import {
  ArrowLeft, FileDown, FileText, RefreshCw, Maximize2, Minimize2,
  Printer, Eye, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function WelcomePackPreview() {
  const { id } = useParams<{ id: string }>();
  const numId = parseInt(id ?? "0", 10);

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
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

  const displayName = isMirror && client2Name
    ? `${clientName} & ${client2Name}`
    : clientName;

  function handleRefresh() {
    setIframeLoaded(false);
    setIframeError(false);
    setRefreshKey(k => k + 1);
  }

  function handlePrint() {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  }

  function toggleFullscreen() {
    setFullscreen(f => !f);
  }

  // Keyboard shortcut: Escape to exit fullscreen
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  return (
    <TooltipProvider>
      <div
        className={`flex flex-col bg-gray-100 transition-all duration-300 ${
          fullscreen ? "fixed inset-0 z-50" : "min-h-screen"
        }`}
      >
        {/* ── Header bar ─────────────────────────────────────────────────────── */}
        <header
          className="flex items-center gap-3 px-4 py-3 shadow-md flex-shrink-0"
          style={{ background: "oklch(0.18 0.05 155)" }}
        >
          {/* Back button */}
          <Link href={`/admin/submission/${numId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/80 hover:text-white hover:bg-white/10 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Submission</span>
            </Button>
          </Link>

          <div className="w-px h-5 bg-white/20" />

          {/* Title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Eye className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.78 0.12 85)" }} />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                Welcome Pack Preview
              </p>
              <p className="text-white/60 text-xs truncate">{displayName}</p>
            </div>
            {submission?.referenceNumber && (
              <Badge
                variant="outline"
                className="ml-2 hidden sm:flex text-xs border-white/20 text-white/70 flex-shrink-0"
              >
                {submission.referenceNumber}
              </Badge>
            )}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!iframeLoaded && !iframeError && (
              <span className="flex items-center gap-1 text-white/60 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Loading…</span>
              </span>
            )}
            {iframeLoaded && !iframeError && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.78 0.12 85)" }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ready</span>
              </span>
            )}
            {iframeError && (
              <span className="flex items-center gap-1 text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Error</span>
              </span>
            )}
          </div>

          <div className="w-px h-5 bg-white/20" />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-white/70 hover:text-white hover:bg-white/10 px-2"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh preview</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  disabled={!iframeLoaded}
                  className="text-white/70 hover:text-white hover:bg-white/10 px-2"
                >
                  <Printer className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print preview</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white/70 hover:text-white hover:bg-white/10 px-2"
                >
                  {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}</TooltipContent>
            </Tooltip>

            <div className="w-px h-5 bg-white/20" />

            {/* Download PDF */}
            <a href={pdfUrl} download>
              <Button
                size="sm"
                className="gap-1.5 text-xs px-2 sm:px-3 font-medium"
                style={{
                  background: "oklch(0.78 0.12 85)",
                  color: "oklch(0.18 0.05 155)",
                }}
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </a>

            {/* Download Word */}
            <a href={docxUrl} download>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs px-2 sm:px-3"
                style={{
                  borderColor: "rgba(201,168,76,0.5)",
                  color: "oklch(0.78 0.12 85)",
                  background: "rgba(201,168,76,0.1)",
                }}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download Word</span>
                <span className="sm:hidden">Word</span>
              </Button>
            </a>
          </div>
        </header>

        {/* ── Preview area ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Paper-style container */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div
              className="mx-auto shadow-2xl rounded-sm overflow-hidden"
              style={{
                maxWidth: "900px",
                minHeight: "1100px",
                background: "white",
                border: "1px solid #e5e7eb",
              }}
            >
              {/* Loading skeleton */}
              {!iframeLoaded && !iframeError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10 pointer-events-none"
                  style={{ position: "relative", minHeight: "600px" }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(0.95 0.02 155)" }}
                    >
                      <Loader2
                        className="w-8 h-8 animate-spin"
                        style={{ color: "oklch(0.28 0.07 155)" }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Generating Welcome Pack…</p>
                    <p className="text-xs text-gray-400">This may take a few seconds</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {iframeError && (
                <div
                  className="flex flex-col items-center justify-center gap-4 bg-white"
                  style={{ minHeight: "600px" }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "oklch(0.97 0.01 20)" }}
                  >
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Failed to load preview</p>
                    <p className="text-xs text-gray-400 mt-1">The Welcome Pack could not be generated</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try again
                  </Button>
                </div>
              )}

              {/* iframe */}
              <iframe
                key={refreshKey}
                ref={iframeRef}
                src={previewUrl}
                title="Welcome Pack Preview"
                onLoad={() => setIframeLoaded(true)}
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

          {/* ── Bottom action bar ─────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3 border-t flex-shrink-0"
            style={{ background: "white", borderColor: "#e5e7eb" }}
          >
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Eye className="w-3.5 h-3.5" />
              <span>
                This is a live preview of the Welcome Pack that will be sent to{" "}
                <span className="font-medium text-gray-700">{displayName}</span>.
                Review all details carefully before downloading.
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <a href={pdfUrl} download>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs font-medium"
                  style={{
                    background: "oklch(0.28 0.07 155)",
                    color: "white",
                  }}
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </a>
              <a href={docxUrl} download>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  style={{
                    borderColor: "oklch(0.78 0.12 85)",
                    color: "oklch(0.55 0.1 85)",
                  }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download Word</span>
                  <span className="sm:hidden">Word</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
