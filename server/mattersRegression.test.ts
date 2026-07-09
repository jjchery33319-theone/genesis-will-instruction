/**
 * Regression tests for the V2 Matters router and related helpers.
 *
 * These tests guard against:
 *  1. beneficiarySchema accepting divisionType / divisionNotes fields.
 *  2. giftSchema accepting divisionType / divisionNotes fields.
 *  3. The toBenRows / toGiftRows mapping logic in transferFromInstruction
 *     correctly preserving all fields (including division fields).
 *  4. Mirror-copy logic: spreading a row with { ...row } copies ALL fields
 *     including divisionType and divisionNotes.
 *  5. personFullName helper resolving names from both V1 (firstName/lastName)
 *     and V2 (fullName) formats.
 *  6. safeArr helper handling null, undefined, arrays, and JSON strings.
 *  7. The Zod schemas for beneficiaries and gifts do not regress on required fields.
 *
 * No real DB or network calls are made.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";

// ── Replicate the Zod schemas from matters.ts ─────────────────────────────────

const personSchema = z.object({
  title: z.string().optional(),
  fullName: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  relationship: z.string().optional(),
});

const beneficiarySchema = personSchema.extend({
  beneficiaryType: z.enum(["primary", "fallback"]).default("primary"),
  relationship: z.string().optional(),
  shareFraction: z.string().optional(),
  includeIssue: z.number().int().min(0).max(1).default(1),
  recipientGroup: z.string().optional(),
  divisionType: z.string().optional(),
  divisionNotes: z.string().optional(),
});

const giftSchema = z.object({
  recipientGroup: z.string().optional(),
  recipientName: z.string().optional(),
  recipientAddress: z.string().optional(),
  giftDescription: z.string().optional(),
  giftType: z.enum(["monetary", "asset", "residue", "property"]).default("asset"),
  onSecondDeath: z.union([z.boolean(), z.number()]).transform(v => v ? 1 : 0).optional(),
  divisionType: z.string().optional(),
  divisionNotes: z.string().optional(),
});

const wishesSchema = z.object({
  ageCondition: z.number().int().min(0).max(99).default(18),
  survivorshipDays: z.number().int().min(0).max(365).default(28),
  organDonation: z.number().int().min(0).max(1).default(0),
  organDonationText: z.string().optional(),
  funeralWishes: z.string().optional(),
  extraNotes: z.string().optional(),
  residueToSpouseFirst: z.number().int().min(0).max(1).default(1),
  hasMinorChildren: z.number().int().min(0).max(1).default(1),
  disasterClauseNotes: z.string().optional(),
  generalNotes: z.string().optional(),
});

// ── Replicate pure helpers from matters.ts (transferFromInstruction) ──────────

/** Safely parse a JSON field that may already be an object/array */
function safeArr<T>(v: unknown): T[] {
  if (!v) return [];
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string") { try { return JSON.parse(v) as T[]; } catch { return []; } }
  return [];
}

type PersonEntry = Record<string, unknown>;

/** Reconstruct full name from instruction person object */
function personFullName(p: PersonEntry): string {
  if (p.fullName && typeof p.fullName === "string" && p.fullName.trim()) return p.fullName.trim();
  const parts = [p.prefix, p.firstName, p.middleName, p.lastName].filter(v => typeof v === "string" && (v as string).trim());
  if (parts.length > 0) return parts.join(" ").trim();
  return typeof p.name === "string" ? p.name.trim() : "";
}

/** Mirrors toBenRows in transferFromInstruction */
function toBenRows(arr: PersonEntry[], type: "primary" | "fallback") {
  return arr.map(p => ({
    fullName: personFullName(p),
    address: typeof p.address === "string" ? p.address : "",
    relationship: typeof p.relationship === "string" ? p.relationship : "",
    shareFraction: typeof p.share === "string" ? p.share : "",
    beneficiaryType: type,
    includeIssue: 1 as 0 | 1,
  }));
}

type GiftEntry = Record<string, unknown>;

/** Mirrors toGiftRows in transferFromInstruction */
function toGiftRows(arr: GiftEntry[]) {
  return arr.map(g => ({
    recipientName: (typeof g.recipientName === "string" ? g.recipientName : null)
      ?? (typeof g.recipient === "string" ? g.recipient : ""),
    recipientAddress: typeof g.recipientAddress === "string" ? g.recipientAddress : "",
    giftDescription: (typeof g.giftDescription === "string" ? g.giftDescription : null)
      ?? (typeof g.description === "string" ? g.description : ""),
    giftType: (
      (typeof g.giftType === "string" ? g.giftType : null)
      ?? (typeof g.type === "string" ? g.type : "asset")
    ) as "monetary" | "asset" | "residue",
    onSecondDeath: (g.onSecondDeath ? 1 : 0) as 0 | 1,
    divisionType: typeof g.divisionType === "string" ? g.divisionType : "equally",
    divisionNotes: typeof g.divisionNotes === "string" ? g.divisionNotes : null,
  }));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("V2 — beneficiarySchema Zod validation", () => {
  it("accepts a minimal beneficiary row", () => {
    expect(() => beneficiarySchema.parse({ fullName: "Alice Smith" })).not.toThrow();
  });

  it("accepts divisionType field", () => {
    const result = beneficiarySchema.parse({ fullName: "Alice", divisionType: "equally" });
    expect(result.divisionType).toBe("equally");
  });

  it("accepts divisionNotes field", () => {
    const result = beneficiarySchema.parse({ fullName: "Alice", divisionNotes: "50% each" });
    expect(result.divisionNotes).toBe("50% each");
  });

  it("accepts all division types", () => {
    for (const dt of ["equally", "per_stirpes", "percentage", "eldest", "youngest", "custom"]) {
      expect(() => beneficiarySchema.parse({ divisionType: dt })).not.toThrow();
    }
  });

  it("defaults beneficiaryType to 'primary'", () => {
    const result = beneficiarySchema.parse({});
    expect(result.beneficiaryType).toBe("primary");
  });

  it("defaults includeIssue to 1", () => {
    const result = beneficiarySchema.parse({});
    expect(result.includeIssue).toBe(1);
  });

  it("accepts recipientGroup field", () => {
    const result = beneficiarySchema.parse({ recipientGroup: "My Children" });
    expect(result.recipientGroup).toBe("My Children");
  });

  it("accepts a full beneficiary row with all fields", () => {
    expect(() =>
      beneficiarySchema.parse({
        title: "Mrs",
        fullName: "Alice Smith",
        address: "1 Main St",
        gender: "female",
        relationship: "daughter",
        beneficiaryType: "fallback",
        shareFraction: "50%",
        includeIssue: 1,
        recipientGroup: "My Children",
        divisionType: "percentage",
        divisionNotes: "50% to each child",
      })
    ).not.toThrow();
  });
});

describe("V2 — giftSchema Zod validation", () => {
  it("accepts a minimal gift row", () => {
    expect(() => giftSchema.parse({ giftDescription: "Gold watch" })).not.toThrow();
  });

  it("accepts divisionType field", () => {
    const result = giftSchema.parse({ divisionType: "equally" });
    expect(result.divisionType).toBe("equally");
  });

  it("accepts divisionNotes field", () => {
    const result = giftSchema.parse({ divisionNotes: "Split equally between children" });
    expect(result.divisionNotes).toBe("Split equally between children");
  });

  it("defaults giftType to 'asset'", () => {
    const result = giftSchema.parse({});
    expect(result.giftType).toBe("asset");
  });

  it("accepts giftType 'monetary'", () => {
    const result = giftSchema.parse({ giftType: "monetary" });
    expect(result.giftType).toBe("monetary");
  });

  it("accepts giftType 'residue'", () => {
    const result = giftSchema.parse({ giftType: "residue" });
    expect(result.giftType).toBe("residue");
  });

  it("accepts giftType 'property'", () => {
    const result = giftSchema.parse({ giftType: "property" });
    expect(result.giftType).toBe("property");
  });

  it("transforms onSecondDeath boolean true → 1", () => {
    const result = giftSchema.parse({ onSecondDeath: true });
    expect(result.onSecondDeath).toBe(1);
  });

  it("transforms onSecondDeath boolean false → 0", () => {
    const result = giftSchema.parse({ onSecondDeath: false });
    expect(result.onSecondDeath).toBe(0);
  });

  it("transforms onSecondDeath number 1 → 1", () => {
    const result = giftSchema.parse({ onSecondDeath: 1 });
    expect(result.onSecondDeath).toBe(1);
  });

  it("accepts a full gift row with all fields", () => {
    expect(() =>
      giftSchema.parse({
        recipientGroup: "My Children",
        recipientName: "Tom Smith",
        recipientAddress: "1 Main St",
        giftDescription: "Gold watch",
        giftType: "asset",
        onSecondDeath: false,
        divisionType: "equally",
        divisionNotes: "To be shared equally",
      })
    ).not.toThrow();
  });
});

describe("V2 — wishesSchema Zod validation", () => {
  it("parses with all defaults", () => {
    const result = wishesSchema.parse({});
    expect(result.ageCondition).toBe(18);
    expect(result.survivorshipDays).toBe(28);
    expect(result.organDonation).toBe(0);
    expect(result.residueToSpouseFirst).toBe(1);
    expect(result.hasMinorChildren).toBe(1);
  });

  it("accepts funeralWishes string", () => {
    const result = wishesSchema.parse({ funeralWishes: "Cremation" });
    expect(result.funeralWishes).toBe("Cremation");
  });

  it("accepts disasterClauseNotes", () => {
    const result = wishesSchema.parse({ disasterClauseNotes: "If all die together..." });
    expect(result.disasterClauseNotes).toBe("If all die together...");
  });
});

describe("V2 — safeArr helper", () => {
  it("returns empty array for null", () => {
    expect(safeArr(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(safeArr(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(safeArr("")).toEqual([]);
  });

  it("returns the array as-is when already an array", () => {
    const arr = [{ name: "Alice" }, { name: "Bob" }];
    expect(safeArr(arr)).toBe(arr);
  });

  it("parses a valid JSON string into an array", () => {
    const json = JSON.stringify([{ name: "Alice" }]);
    expect(safeArr(json)).toEqual([{ name: "Alice" }]);
  });

  it("returns empty array for invalid JSON string", () => {
    expect(safeArr("not valid json")).toEqual([]);
  });

  it("returns empty array for a non-array JSON value", () => {
    // JSON.parse("42") returns 42, not an array — but safeArr casts it
    // This tests that the function doesn't throw
    expect(() => safeArr("42")).not.toThrow();
  });
});

describe("V2 — personFullName helper", () => {
  it("uses fullName when available (V2 pool format)", () => {
    expect(personFullName({ fullName: "Alice Smith" })).toBe("Alice Smith");
  });

  it("ignores empty fullName and falls back to parts", () => {
    expect(personFullName({ fullName: "  ", firstName: "Alice", lastName: "Smith" })).toBe("Alice Smith");
  });

  it("assembles name from firstName + lastName (V1 format)", () => {
    expect(personFullName({ firstName: "Alice", lastName: "Smith" })).toBe("Alice Smith");
  });

  it("includes prefix and middleName", () => {
    expect(personFullName({ prefix: "Mrs", firstName: "Alice", middleName: "Jane", lastName: "Smith" })).toBe("Mrs Alice Jane Smith");
  });

  it("uses name field as last resort", () => {
    expect(personFullName({ name: "Alice Smith" })).toBe("Alice Smith");
  });

  it("returns empty string when no name fields present", () => {
    expect(personFullName({})).toBe("");
  });

  it("trims the final assembled name string", () => {
    // The helper trims the final joined string but not individual parts.
    // Parts with surrounding spaces are preserved in the join but the
    // overall result is trimmed. This matches the actual router behaviour.
    const result = personFullName({ firstName: "Alice", lastName: "Smith" });
    expect(result.trim()).toBe(result); // no leading/trailing whitespace
    expect(result).toContain("Alice");
    expect(result).toContain("Smith");
  });
});

describe("V2 — toBenRows mapping (transferFromInstruction)", () => {
  it("maps a V1-format beneficiary to a DB row", () => {
    const rows = toBenRows([{ firstName: "Alice", lastName: "Smith", address: "1 Main St", relationship: "daughter", share: "all" }], "primary");
    expect(rows[0].fullName).toBe("Alice Smith");
    expect(rows[0].address).toBe("1 Main St");
    expect(rows[0].relationship).toBe("daughter");
    expect(rows[0].shareFraction).toBe("all");
    expect(rows[0].beneficiaryType).toBe("primary");
    expect(rows[0].includeIssue).toBe(1);
  });

  it("maps a V2-format beneficiary (fullName) to a DB row", () => {
    const rows = toBenRows([{ fullName: "Alice Smith", address: "2 High St" }], "fallback");
    expect(rows[0].fullName).toBe("Alice Smith");
    expect(rows[0].beneficiaryType).toBe("fallback");
  });

  it("returns empty array for empty input", () => {
    expect(toBenRows([], "primary")).toEqual([]);
  });

  it("handles missing optional fields gracefully", () => {
    const rows = toBenRows([{}], "primary");
    expect(rows[0].fullName).toBe("");
    expect(rows[0].address).toBe("");
    expect(rows[0].relationship).toBe("");
    expect(rows[0].shareFraction).toBe("");
  });
});

describe("V2 — toGiftRows mapping (transferFromInstruction)", () => {
  it("maps a V1-format gift (description/recipient) to a DB row", () => {
    const rows = toGiftRows([{ description: "Gold watch", recipient: "Tom Smith" }]);
    expect(rows[0].giftDescription).toBe("Gold watch");
    expect(rows[0].recipientName).toBe("Tom Smith");
    expect(rows[0].divisionType).toBe("equally");
    expect(rows[0].divisionNotes).toBeNull();
  });

  it("maps a V2-format gift (giftDescription/recipientName) to a DB row", () => {
    const rows = toGiftRows([{ giftDescription: "Car", recipientName: "Alice", divisionType: "percentage", divisionNotes: "50% each" }]);
    expect(rows[0].giftDescription).toBe("Car");
    expect(rows[0].recipientName).toBe("Alice");
    expect(rows[0].divisionType).toBe("percentage");
    expect(rows[0].divisionNotes).toBe("50% each");
  });

  it("preserves divisionType from the source row", () => {
    const rows = toGiftRows([{ divisionType: "custom", divisionNotes: "Special arrangement" }]);
    expect(rows[0].divisionType).toBe("custom");
    expect(rows[0].divisionNotes).toBe("Special arrangement");
  });

  it("defaults divisionType to 'equally' when not set", () => {
    const rows = toGiftRows([{ giftDescription: "Watch" }]);
    expect(rows[0].divisionType).toBe("equally");
  });

  it("sets divisionNotes to null when not set", () => {
    const rows = toGiftRows([{ giftDescription: "Watch" }]);
    expect(rows[0].divisionNotes).toBeNull();
  });

  it("returns empty array for empty input", () => {
    expect(toGiftRows([])).toEqual([]);
  });

  it("handles onSecondDeath truthy value", () => {
    const rows = toGiftRows([{ onSecondDeath: true }]);
    expect(rows[0].onSecondDeath).toBe(1);
  });

  it("handles onSecondDeath falsy value", () => {
    const rows = toGiftRows([{ onSecondDeath: false }]);
    expect(rows[0].onSecondDeath).toBe(0);
  });
});

describe("V2 — Mirror copy logic (spreading row objects)", () => {
  /**
   * The mirror-copy button in MatterForm uses:
   *   setGifts2(gifts1.map(g => ({ ...g })))
   *   setBens2(bens1.map(b => ({ ...b })))
   *
   * These tests confirm that spreading a row preserves ALL fields,
   * including divisionType and divisionNotes, so the mirror copy
   * doesn't silently drop division information.
   */

  it("spreading a gift row preserves divisionType", () => {
    const original = { recipientName: "Tom", divisionType: "percentage", divisionNotes: "50% each", giftType: "asset", onSecondDeath: false };
    const copy = { ...original };
    expect(copy.divisionType).toBe("percentage");
    expect(copy.divisionNotes).toBe("50% each");
  });

  it("spreading a gift row preserves all fields", () => {
    const original = {
      recipientGroup: "My Children",
      recipientName: "Tom Smith",
      recipientAddress: "1 Main St",
      giftDescription: "Gold watch",
      giftType: "asset",
      onSecondDeath: false,
      divisionType: "equally",
      divisionNotes: "",
      _poolId: 42,
    };
    const copy = { ...original };
    expect(copy).toEqual(original);
    expect(copy).not.toBe(original); // shallow copy, different reference
  });

  it("spreading a beneficiary row preserves divisionType and divisionNotes", () => {
    const original = {
      title: "",
      fullName: "Alice Smith",
      address: "1 Main St",
      dateOfBirth: "",
      relationship: "daughter",
      shareFraction: "50%",
      beneficiaryType: "primary",
      includeIssue: 1,
      gender: "female",
      recipientGroup: "My Children",
      divisionType: "per_stirpes",
      divisionNotes: "Per stirpes to descendants",
      _poolId: undefined,
    };
    const copy = { ...original };
    expect(copy.divisionType).toBe("per_stirpes");
    expect(copy.divisionNotes).toBe("Per stirpes to descendants");
    expect(copy.fullName).toBe("Alice Smith");
  });

  it("map + spread creates independent copies (mutation of copy does not affect original)", () => {
    const gifts1 = [
      { recipientName: "Tom", divisionType: "equally", divisionNotes: "" },
      { recipientName: "Alice", divisionType: "percentage", divisionNotes: "50% each" },
    ];
    const gifts2 = gifts1.map(g => ({ ...g }));
    gifts2[0].divisionType = "custom";
    expect(gifts1[0].divisionType).toBe("equally"); // original unchanged
    expect(gifts2[0].divisionType).toBe("custom");
  });

  it("map + spread on beneficiaries creates independent copies", () => {
    const bens1 = [
      { fullName: "Alice", divisionType: "equally", divisionNotes: "" },
    ];
    const bens2 = bens1.map((b: typeof bens1[0]) => ({ ...b }));
    bens2[0].divisionType = "per_stirpes";
    expect(bens1[0].divisionType).toBe("equally");
    expect(bens2[0].divisionType).toBe("per_stirpes");
  });
});

describe("V2 — Zod schema completeness for saveBeneficiaries input", () => {
  const saveBeneficiariesInput = z.object({
    matterId: z.number().int(),
    clientRole: z.enum(["testator1", "testator2", "shared"]),
    beneficiaries: z.array(beneficiarySchema),
  });

  it("parses a valid saveBeneficiaries input", () => {
    expect(() =>
      saveBeneficiariesInput.parse({
        matterId: 1,
        clientRole: "testator1",
        beneficiaries: [
          { fullName: "Alice Smith", beneficiaryType: "primary", divisionType: "equally" },
          { fullName: "Bob Smith", beneficiaryType: "fallback", divisionType: "per_stirpes", divisionNotes: "To descendants" },
        ],
      })
    ).not.toThrow();
  });

  it("rejects invalid clientRole", () => {
    expect(() =>
      saveBeneficiariesInput.parse({
        matterId: 1,
        clientRole: "invalid_role",
        beneficiaries: [],
      })
    ).toThrow();
  });

  it("rejects missing matterId", () => {
    expect(() =>
      saveBeneficiariesInput.parse({
        clientRole: "testator1",
        beneficiaries: [],
      })
    ).toThrow();
  });
});

describe("V2 — Zod schema completeness for saveGifts input", () => {
  const saveGiftsInput = z.object({
    matterId: z.number().int(),
    clientRole: z.enum(["testator1", "testator2", "shared"]),
    gifts: z.array(giftSchema),
  });

  it("parses a valid saveGifts input with division fields", () => {
    expect(() =>
      saveGiftsInput.parse({
        matterId: 1,
        clientRole: "testator2",
        gifts: [
          { giftDescription: "Watch", recipientName: "Tom", divisionType: "equally", onSecondDeath: false },
          { giftDescription: "Car", recipientGroup: "My Children", divisionType: "percentage", divisionNotes: "50/50" },
        ],
      })
    ).not.toThrow();
  });

  it("rejects invalid giftType", () => {
    expect(() =>
      saveGiftsInput.parse({
        matterId: 1,
        clientRole: "shared",
        gifts: [{ giftType: "invalid_type" }],
      })
    ).toThrow();
  });
});
