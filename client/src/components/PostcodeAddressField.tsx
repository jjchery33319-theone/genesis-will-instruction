/**
 * PostcodeAddressField
 *
 * A three-field address block (address line, city, postcode) enhanced with a
 * postcode-first lookup flow:
 *
 *  1. User types a postcode and presses "Find" (or Enter).
 *  2. The component calls the free postcodes.io API to validate the postcode
 *     and retrieve the admin district (town/city) automatically.
 *  3. The city field is pre-filled; the user only needs to type the street address.
 *  4. A "Enter address manually" link is always visible so the user can skip
 *     the lookup and type everything themselves.
 *
 * Props are intentionally simple: three string values + three change callbacks,
 * matching the existing ClientFields and PersonList patterns exactly.
 */

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, CheckCircle2, AlertCircle, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostcodeAddressFieldProps {
  /** Current value of the street address line */
  addressLine1: string;
  /** Current value of the city / town */
  city: string;
  /** Current value of the postcode */
  postcode: string;
  onChangeAddressLine1: (v: string) => void;
  onChangeCity: (v: string) => void;
  onChangePostcode: (v: string) => void;
  /** Extra Tailwind classes applied to the wrapper div */
  className?: string;
  /** Compact mode — smaller inputs, used inside PersonRow */
  compact?: boolean;
}

type LookupState = "idle" | "loading" | "found" | "not_found" | "error";

export function PostcodeAddressField({
  addressLine1,
  city,
  postcode,
  onChangeAddressLine1,
  onChangeCity,
  onChangePostcode,
  className,
  compact = false,
}: PostcodeAddressFieldProps) {
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [lookupMessage, setLookupMessage] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const postcodeInputRef = useRef<HTMLInputElement>(null);

  const h = compact ? "h-8" : "h-9";
  const textSz = compact ? "text-sm" : "text-sm";

  async function handleLookup() {
    const raw = postcode.trim().replace(/\s+/g, "").toUpperCase();
    if (!raw) return;

    setLookupState("loading");
    setLookupMessage("");

    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(raw)}`);
      if (res.status === 404) {
        setLookupState("not_found");
        setLookupMessage("Postcode not found — please check and try again, or enter address manually.");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const result = json.result;

      // Format postcode with space (e.g. "SW1A2AA" → "SW1A 2AA")
      const formatted: string = result.postcode ?? raw;
      onChangePostcode(formatted);

      // Auto-fill city from admin_district or parish
      const town: string =
        result.admin_district ||
        result.parish?.replace(/, unparished area$/, "") ||
        result.region ||
        "";
      if (town && !city) {
        onChangeCity(town);
      }

      setLookupState("found");
      setLookupMessage(
        town
          ? `Postcode confirmed — ${formatted}${city ? "" : `, ${town}`}`
          : `Postcode confirmed — ${formatted}`
      );

      // Move focus to address line so user can type the street
      setTimeout(() => {
        const el = document.getElementById("addr-line1-input");
        if (el) (el as HTMLInputElement).focus();
      }, 50);
    } catch {
      setLookupState("error");
      setLookupMessage("Lookup failed — please enter address manually.");
    }
  }

  function handlePostcodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLookup();
    }
  }

  const showAddressFields = manualMode || lookupState === "found" || addressLine1 || city;

  return (
    <div className={cn("space-y-2", className)}>
      {/* ── Postcode row ─────────────────────────────────────────────── */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 min-w-0">
          <label className={cn("block text-xs font-medium text-muted-foreground mb-1", compact && "text-xs")}>
            Postcode
          </label>
          <Input
            ref={postcodeInputRef}
            id="postcode-input"
            value={postcode}
            onChange={e => {
              onChangePostcode(e.target.value);
              // Reset lookup state when user edits postcode
              if (lookupState !== "idle") {
                setLookupState("idle");
                setLookupMessage("");
              }
            }}
            onKeyDown={handlePostcodeKeyDown}
            placeholder="e.g. SW1A 1AA"
            className={cn(h, textSz, "uppercase tracking-wide")}
            aria-label="Postcode"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handleLookup}
          disabled={lookupState === "loading" || !postcode.trim()}
          className={cn(
            "flex-shrink-0 gap-1.5 font-medium",
            compact ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
            "border-[oklch(0.78_0.12_85)] text-[oklch(0.28_0.07_155)] hover:bg-[oklch(0.97_0.02_155)]"
          )}
        >
          {lookupState === "loading" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          {compact ? "Find" : "Find Address"}
        </Button>
      </div>

      {/* ── Status message ───────────────────────────────────────────── */}
      {lookupMessage && (
        <div
          className={cn(
            "flex items-start gap-1.5 text-xs rounded px-2 py-1.5",
            lookupState === "found"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          )}
        >
          {lookupState === "found" ? (
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          )}
          <span>{lookupMessage}</span>
        </div>
      )}

      {/* ── Manual entry toggle ──────────────────────────────────────── */}
      {!manualMode && lookupState !== "found" && (
        <button
          type="button"
          onClick={() => setManualMode(true)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          <PencilLine className="w-3 h-3" />
          Enter address manually
        </button>
      )}

      {/* ── Address fields (shown after lookup or manual mode) ───────── */}
      {showAddressFields && (
        <div className="space-y-2 pt-1">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Address Line 1
            </label>
            <Input
              id="addr-line1-input"
              value={addressLine1}
              onChange={e => onChangeAddressLine1(e.target.value)}
              placeholder="House number and street name"
              className={cn(h, textSz)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                City / Town
              </label>
              <Input
                value={city}
                onChange={e => onChangeCity(e.target.value)}
                placeholder="City or town"
                className={cn(h, textSz)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Postcode
              </label>
              <Input
                value={postcode}
                onChange={e => onChangePostcode(e.target.value)}
                placeholder="e.g. SW1A 1AA"
                className={cn(h, textSz, "uppercase tracking-wide")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SingleLineAddressField
 *
 * A simpler variant for PersonList entries where the address is stored as a
 * single string (e.g. "12 High Street, London, SW1A 1AA").
 *
 * The user enters a postcode → lookup fills city/district → they type the
 * street → the three parts are joined into one string and emitted via onChange.
 */
interface SingleLineAddressFieldProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  compact?: boolean;
}

export function SingleLineAddressField({
  value,
  onChange,
  className,
  compact = false,
}: SingleLineAddressFieldProps) {
  // Parse existing value back into parts for editing
  // Format we write: "12 High Street, London, SW1A 1AA"
  const [postcodeInput, setPostcodeInput] = useState(() => {
    const m = value.match(/([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i);
    return m ? m[1].toUpperCase() : "";
  });
  const [city, setCity] = useState(() => {
    const parts = value.split(",").map(s => s.trim());
    return parts.length >= 2 ? parts[parts.length - 2] : "";
  });
  const [street, setStreet] = useState(() => {
    const parts = value.split(",").map(s => s.trim());
    // Everything before the last two parts is the street
    return parts.length >= 3 ? parts.slice(0, parts.length - 2).join(", ") : parts[0] ?? "";
  });

  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [lookupMessage, setLookupMessage] = useState("");
  const [manualMode, setManualMode] = useState(() => !!value);

  const h = compact ? "h-8" : "h-9";
  const textSz = "text-sm";

  function buildAddress(s: string, c: string, p: string) {
    const parts = [s, c, p].map(x => x.trim()).filter(Boolean);
    return parts.join(", ");
  }

  function handleStreetChange(v: string) {
    setStreet(v);
    onChange(buildAddress(v, city, postcodeInput));
  }

  function handleCityChange(v: string) {
    setCity(v);
    onChange(buildAddress(street, v, postcodeInput));
  }

  function handlePostcodeChange(v: string) {
    setPostcodeInput(v);
    onChange(buildAddress(street, city, v));
    if (lookupState !== "idle") {
      setLookupState("idle");
      setLookupMessage("");
    }
  }

  async function handleLookup() {
    const raw = postcodeInput.trim().replace(/\s+/g, "").toUpperCase();
    if (!raw) return;

    setLookupState("loading");
    setLookupMessage("");

    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(raw)}`);
      if (res.status === 404) {
        setLookupState("not_found");
        setLookupMessage("Postcode not found — please check and try again, or enter manually.");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const result = json.result;

      const formatted: string = result.postcode ?? raw;
      setPostcodeInput(formatted);

      const town: string =
        result.admin_district ||
        result.parish?.replace(/, unparished area$/, "") ||
        result.region ||
        "";

      const newCity = city || town;
      if (!city && town) setCity(town);

      onChange(buildAddress(street, newCity, formatted));

      setLookupState("found");
      setLookupMessage(
        town
          ? `Postcode confirmed — ${formatted}${city ? "" : `, ${town}`}`
          : `Postcode confirmed — ${formatted}`
      );
      setManualMode(true);

      setTimeout(() => {
        const el = document.getElementById("single-addr-street");
        if (el) (el as HTMLInputElement).focus();
      }, 50);
    } catch {
      setLookupState("error");
      setLookupMessage("Lookup failed — please enter address manually.");
      setManualMode(true);
    }
  }

  function handlePostcodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLookup();
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* ── Postcode lookup row ──────────────────────────────────────── */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Postcode
          </label>
          <Input
            value={postcodeInput}
            onChange={e => handlePostcodeChange(e.target.value)}
            onKeyDown={handlePostcodeKeyDown}
            placeholder="e.g. SW1A 1AA"
            className={cn(h, textSz, "uppercase tracking-wide")}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handleLookup}
          disabled={lookupState === "loading" || !postcodeInput.trim()}
          className={cn(
            "flex-shrink-0 gap-1.5 font-medium",
            compact ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
            "border-[oklch(0.78_0.12_85)] text-[oklch(0.28_0.07_155)] hover:bg-[oklch(0.97_0.02_155)]"
          )}
        >
          {lookupState === "loading" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          Find
        </Button>
      </div>

      {/* ── Status message ───────────────────────────────────────────── */}
      {lookupMessage && (
        <div
          className={cn(
            "flex items-start gap-1.5 text-xs rounded px-2 py-1.5",
            lookupState === "found"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          )}
        >
          {lookupState === "found" ? (
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          )}
          <span>{lookupMessage}</span>
        </div>
      )}

      {/* ── Manual entry toggle ──────────────────────────────────────── */}
      {!manualMode && lookupState !== "found" && (
        <button
          type="button"
          onClick={() => setManualMode(true)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          <PencilLine className="w-3 h-3" />
          Enter address manually
        </button>
      )}

      {/* ── Expanded address fields ──────────────────────────────────── */}
      {manualMode && (
        <div className="space-y-2 pt-0.5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Street Address
            </label>
            <Input
              id="single-addr-street"
              value={street}
              onChange={e => handleStreetChange(e.target.value)}
              placeholder="House number and street name"
              className={cn(h, textSz)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                City / Town
              </label>
              <Input
                value={city}
                onChange={e => handleCityChange(e.target.value)}
                placeholder="City or town"
                className={cn(h, textSz)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Postcode
              </label>
              <Input
                value={postcodeInput}
                onChange={e => handlePostcodeChange(e.target.value)}
                placeholder="e.g. SW1A 1AA"
                className={cn(h, textSz, "uppercase tracking-wide")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
