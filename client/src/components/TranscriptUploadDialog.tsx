/**
 * TranscriptUploadDialog
 * Allows admin to upload a consultation transcript (PDF/DOCX/TXT),
 * AI extracts will instruction data, user reviews it, then opens the V1 form pre-filled.
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";

const LS_KEY = "genesis_will_form_autosave";

interface ExtractedData {
  [key: string]: unknown;
}

interface ExtractionResult {
  extractedData: ExtractedData;
  extractionNotes: string;
  confidence: "high" | "medium" | "low";
}

interface TranscriptUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONFIDENCE_CONFIG = {
  high: { label: "High confidence", color: "oklch(0.55 0.15 145)", bg: "oklch(0.95 0.05 145)" },
  medium: { label: "Medium confidence", color: "oklch(0.55 0.15 85)", bg: "oklch(0.97 0.05 85)" },
  low: { label: "Low confidence — please review carefully", color: "oklch(0.6 0.18 25)", bg: "oklch(0.97 0.05 25)" },
};

function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, s => s.toUpperCase())
    .replace(/Client1 /g, "Client 1 ")
    .replace(/Client2 /g, "Client 2 ");
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value
      .map(v => {
        if (typeof v === "object" && v !== null) {
          const obj = v as Record<string, unknown>;
          const parts = [obj.firstName, obj.lastName, obj.name, obj.description, obj.recipient]
            .filter(Boolean)
            .join(" ");
          return parts || JSON.stringify(v);
        }
        return String(v);
      })
      .join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Fields to display in the review panel (in order)
const REVIEW_SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: "Will Type & Products",
    fields: ["willType", "productsOrdered", "consultantName", "appointmentDate", "appointmentLocation"],
  },
  {
    title: "Client 1",
    fields: [
      "client1Prefix", "client1FirstName", "client1MiddleName", "client1LastName",
      "client1Dob", "client1AddressLine1", "client1City", "client1Postcode",
      "client1MaritalStatus", "client1JobTitle", "client1DaytimePhone", "client1Mobile", "client1Email",
    ],
  },
  {
    title: "Client 2 (Mirror Wills)",
    fields: [
      "client2Prefix", "client2FirstName", "client2MiddleName", "client2LastName",
      "client2Dob", "client2AddressLine1", "client2City", "client2Postcode",
      "client2MaritalStatus", "client2JobTitle", "client2DaytimePhone", "client2Mobile", "client2Email",
    ],
  },
  {
    title: "Family",
    fields: ["client1HasChildren", "client1TotalChildren", "client1ChildrenUnder18", "client1ChildrenOver18"],
  },
  {
    title: "Executors & Trustees",
    fields: ["executors", "reserveExecutors", "trustees"],
  },
  {
    title: "Guardians",
    fields: ["guardians"],
  },
  {
    title: "Beneficiaries",
    fields: ["beneficiaries"],
  },
  {
    title: "Gifts & Property",
    fields: ["specificGifts", "propertyOwned", "propertyAddress", "propertyOwnership", "propertyValue", "mortgageOutstanding"],
  },
  {
    title: "Pets & Wishes",
    fields: ["hasPets", "petsDetails", "petsCarer", "residuaryEstate", "residuaryBackup", "funeralType", "funeralWishes", "organDonation"],
  },
  {
    title: "Notes",
    fields: ["additionalNotes", "specialNotes"],
  },
];

export default function TranscriptUploadDialog({ open, onOpenChange }: TranscriptUploadDialogProps) {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const resp = await fetch("/api/admin/extract-transcript", {
        method: "POST",
        body: formData,
      });
      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json.error ?? "Extraction failed");
      }
      setResult(json as ExtractionResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to extract data";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  }

  function handleOpenInForm() {
    if (!result) return;
    try {
      // Write extracted data to localStorage so WillForm picks it up
      localStorage.setItem(LS_KEY, JSON.stringify(result.extractedData));
      onOpenChange(false);
      navigate("/");
      toast.success("Form pre-filled with transcript data. Please review each section.");
    } catch {
      toast.error("Failed to pre-fill form");
    }
  }

  function handleClose() {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    onOpenChange(false);
  }

  const confidenceCfg = result ? CONFIDENCE_CONFIG[result.confidence] : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" style={{ color: "oklch(0.28 0.07 155)" }} />
            Upload Consultation Transcript
          </DialogTitle>
          <DialogDescription>
            Upload a transcript or notes from a video call or consultation. The AI will extract the client's will instruction data and pre-fill the form for you to review.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Upload area */}
          <div className="px-6 py-4 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Select file</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Supported formats: PDF, Word (.docx), plain text (.txt) — max 10 MB
              </p>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30"
                style={{ borderColor: selectedFile ? "oklch(0.28 0.07 155)" : undefined }}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8" style={{ color: "oklch(0.28 0.07 155)" }} />
                    <div className="text-left">
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      className="ml-auto p-1 rounded hover:bg-muted"
                      onClick={e => { e.stopPropagation(); setSelectedFile(null); setResult(null); setError(null); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to browse or drag and drop
                    </p>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.05 25)", color: "oklch(0.4 0.15 25)" }}>
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full gap-2"
              style={{ background: "oklch(0.28 0.07 155)", color: "white" }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting data with AI…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Extract Data from Transcript
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <>
              <Separator />
              <div className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: confidenceCfg?.color }} />
                  <span className="text-sm font-medium">Extraction complete</span>
                  <Badge
                    className="text-xs"
                    style={{ background: confidenceCfg?.bg, color: confidenceCfg?.color, border: "none" }}
                  >
                    {confidenceCfg?.label}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5"
                  style={{ background: "oklch(0.28 0.07 155)", color: "white" }}
                  onClick={handleOpenInForm}
                >
                  Open in Form
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {result.extractionNotes && (
                <div className="mx-6 mb-3 flex items-start gap-2 p-3 rounded-lg text-xs" style={{ background: "oklch(0.97 0.05 85)", color: "oklch(0.4 0.1 85)" }}>
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{result.extractionNotes}</span>
                </div>
              )}

              <ScrollArea className="flex-1 px-6 pb-6">
                <div className="space-y-4">
                  {REVIEW_SECTIONS.map(section => {
                    const filledFields = section.fields.filter(f => {
                      const v = result.extractedData[f];
                      if (v === null || v === undefined || v === "") return false;
                      if (Array.isArray(v) && v.length === 0) return false;
                      return true;
                    });
                    if (filledFields.length === 0) return null;
                    return (
                      <div key={section.title}>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          {section.title}
                        </h4>
                        <div className="rounded-lg border divide-y">
                          {filledFields.map(field => (
                            <div key={field} className="flex items-start gap-3 px-3 py-2 text-sm">
                              <span className="text-muted-foreground w-44 flex-shrink-0 text-xs pt-0.5">
                                {formatFieldLabel(field)}
                              </span>
                              <span className="flex-1 text-xs font-medium break-words">
                                {formatValue(result.extractedData[field])}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
