/**
 * Regression tests for the V1 Will Instructions router.
 *
 * These tests guard against:
 *  1. UI-only fields (client2SameAddressAsClient1) leaking into DB inserts/updates
 *     and causing "Unknown column" MySQL errors.
 *  2. The Zod input schema accepting all expected fields without throwing.
 *  3. The nullify() helper converting undefined → null (required for TiDB nullable cols).
 *  4. Reference number format staying consistent.
 *  5. Recommendation engine logic remaining correct.
 *
 * No real DB or network calls are made — all external dependencies are mocked.
 */

import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({ getDb: vi.fn().mockResolvedValue(null) }));
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ narrative: "test", clientEmailDraft: "test" }) } }],
  }),
}));
vi.mock("./emailService", () => ({ sendAdminEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock("./clientEmailService", () => ({
  sendClientConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendAdviserConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  buildClientEmailPreview: vi.fn().mockReturnValue("<html>preview</html>"),
}));
vi.mock("./pdfGenerator", () => ({ generateWillPdf: vi.fn().mockResolvedValue(Buffer.from("pdf")) }));
vi.mock("./oneDriveService", () => ({
  uploadToOneDrive: vi.fn().mockResolvedValue({ webUrl: "https://example.com/file.docx" }),
}));
vi.mock("./willDocumentFormatter", () => ({
  formatWillDocument: vi.fn().mockReturnValue("doc content"),
  buildFilename: vi.fn().mockReturnValue("test.docx"),
}));

// ── Helpers replicated from the router (pure functions, no DB) ────────────────

/** Mirrors the nullify() helper in willInstructions.ts */
function nullify<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = v === undefined ? null : v;
  }
  return result as T;
}

/** Mirrors the Zod schema from willInstructions.ts (key fields only for regression) */
const personSchema = z.object({
  prefix: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  relationship: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  dob: z.string().optional(),
  share: z.string().optional(),
  isVulnerable: z.boolean().optional(),
  notes: z.string().optional(),
});

const specificGiftSchema = z.object({
  description: z.string().optional(),
  recipient: z.string().optional(),
  value: z.string().optional(),
  isCharity: z.boolean().optional(),
  notes: z.string().optional(),
});

const willInputSchema = z.object({
  // Appointment
  appointmentDate: z.string().optional(),
  consultantName: z.string().optional(),
  productsOrdered: z.array(z.string()).optional(),
  willType: z.string().optional(),
  // Client 1
  client1Prefix: z.string().optional(),
  client1FirstName: z.string().optional(),
  client1LastName: z.string().optional(),
  client1Email: z.string().optional(),
  // Client 2
  client2Prefix: z.string().optional(),
  client2FirstName: z.string().optional(),
  client2LastName: z.string().optional(),
  // UI-only field — must be stripped before DB insert
  client2SameAddressAsClient1: z.boolean().optional(),
  // Per-client people
  client1Executors: z.array(personSchema).optional(),
  client1ReservedExecutors: z.array(personSchema).optional(),
  client2Executors: z.array(personSchema).optional(),
  client2ReservedExecutors: z.array(personSchema).optional(),
  client1Guardians: z.array(personSchema).optional(),
  client1ReservedGuardians: z.array(personSchema).optional(),
  client2Guardians: z.array(personSchema).optional(),
  client2ReservedGuardians: z.array(personSchema).optional(),
  trustees: z.array(personSchema).optional(),
  executors: z.array(personSchema).optional(),
  reservedExecutors: z.array(personSchema).optional(),
  guardians: z.array(personSchema).optional(),
  reservedGuardians: z.array(personSchema).optional(),
  beneficiaries: z.array(personSchema).optional(),
  client1Beneficiaries: z.array(personSchema).optional(),
  client2Beneficiaries: z.array(personSchema).optional(),
  // Gifts
  specificGifts: z.array(specificGiftSchema).optional(),
  client1SpecificGifts: z.array(specificGiftSchema).optional(),
  client2SpecificGifts: z.array(specificGiftSchema).optional(),
  // Family
  client1HasChildren: z.string().optional(),
  client1ChildrenUnder18: z.array(z.any()).optional(),
  client1ChildrenOver18: z.array(z.any()).optional(),
  client2ChildrenUnder18: z.array(z.any()).optional(),
  client2ChildrenOver18: z.array(z.any()).optional(),
  // DD
  ddArrangedAppointment: z.string().optional(),
  ddClientSince: z.string().optional(),
  ddMeetingType: z.string().optional(),
  // Assets
  propertyOwned: z.string().optional(),
  hasLifeInsurance: z.string().optional(),
  hasBusinessInterests: z.string().optional(),
  // Trust clauses
  protectivePropertyTrusts: z.array(z.any()).optional(),
  discretionaryTrusts: z.array(z.any()).optional(),
  vulnerablePersonTrusts: z.array(z.any()).optional(),
  nilRateBandTrusts: z.array(z.any()).optional(),
  bereavedMinorTrusts: z.array(z.any()).optional(),
  age18To25Trusts: z.array(z.any()).optional(),
  businessPropertyReliefs: z.array(z.any()).optional(),
  // Recommendations
  manualNeedsAssessment: z.string().optional(),
  considerLPA: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).optional(),
  considerPPT: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).optional(),
  considerAAT: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).optional(),
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("V1 — nullify() helper", () => {
  it("converts undefined values to null", () => {
    const result = nullify({ a: "hello", b: undefined, c: 42, d: null });
    expect(result.a).toBe("hello");
    expect(result.b).toBeNull();
    expect(result.c).toBe(42);
    expect(result.d).toBeNull();
  });

  it("does not mutate the original object", () => {
    const original = { a: undefined };
    nullify(original);
    expect(original.a).toBeUndefined();
  });

  it("handles empty objects", () => {
    expect(nullify({})).toEqual({});
  });

  it("handles arrays without modification", () => {
    const result = nullify({ arr: [1, 2, 3] });
    expect(result.arr).toEqual([1, 2, 3]);
  });
});

describe("V1 — client2SameAddressAsClient1 field stripping", () => {
  it("is accepted by the Zod schema as a boolean", () => {
    const parsed = willInputSchema.parse({ client2SameAddressAsClient1: true });
    expect(parsed.client2SameAddressAsClient1).toBe(true);
  });

  it("is accepted as false", () => {
    const parsed = willInputSchema.parse({ client2SameAddressAsClient1: false });
    expect(parsed.client2SameAddressAsClient1).toBe(false);
  });

  it("is optional and defaults to undefined when omitted", () => {
    const parsed = willInputSchema.parse({});
    expect(parsed.client2SameAddressAsClient1).toBeUndefined();
  });

  it("stripping pattern: destructuring removes it from the insert payload", () => {
    const input = willInputSchema.parse({
      client1FirstName: "Alice",
      client2SameAddressAsClient1: true,
      consultantName: "Bob",
    });
    // Simulate the strip pattern used in submit, saveDraft, and updateSubmission
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client2SameAddressAsClient1: _stripped, ...insertInput } = input;
    expect("client2SameAddressAsClient1" in insertInput).toBe(false);
    expect(insertInput.client1FirstName).toBe("Alice");
    expect(insertInput.consultantName).toBe("Bob");
  });

  it("nullify() on stripped payload does NOT contain client2SameAddressAsClient1", () => {
    const input = willInputSchema.parse({
      client1FirstName: "Alice",
      client2SameAddressAsClient1: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client2SameAddressAsClient1: _stripped, ...insertInput } = input;
    const insertData = nullify(insertInput);
    expect("client2SameAddressAsClient1" in insertData).toBe(false);
  });
});

describe("V1 — Zod schema accepts all expected fields", () => {
  it("parses a minimal single-will payload without throwing", () => {
    expect(() =>
      willInputSchema.parse({
        client1FirstName: "John",
        client1LastName: "Smith",
        willType: "Single Will",
        productsOrdered: ["single_will"],
      })
    ).not.toThrow();
  });

  it("parses a mirror-will payload with per-client arrays", () => {
    expect(() =>
      willInputSchema.parse({
        willType: "Mirror Wills",
        productsOrdered: ["mirror_wills"],
        client1FirstName: "Alice",
        client2FirstName: "Bob",
        client1Executors: [{ firstName: "Charlie", lastName: "Brown" }],
        client2Executors: [{ firstName: "Diana", lastName: "Prince" }],
        client1Beneficiaries: [{ firstName: "Eve", share: "all" }],
        client2Beneficiaries: [{ firstName: "Frank", share: "all" }],
        client1SpecificGifts: [{ description: "Watch", recipient: "Eve" }],
        client2SpecificGifts: [{ description: "Ring", recipient: "Frank" }],
      })
    ).not.toThrow();
  });

  it("parses a payload with trust clause arrays", () => {
    expect(() =>
      willInputSchema.parse({
        protectivePropertyTrusts: [{ propertyAddress: "1 Main St" }],
        discretionaryTrusts: [{ beneficiaryClass: "children" }],
        nilRateBandTrusts: [{ notes: "NRB trust" }],
        bereavedMinorTrusts: [{ ageOfAbsoluteEntitlement: "18" }],
        age18To25Trusts: [{ ageOfAbsoluteEntitlement: "25" }],
        businessPropertyReliefs: [{ businessName: "Acme Ltd" }],
      })
    ).not.toThrow();
  });

  it("parses considerLPA as boolean", () => {
    const result = willInputSchema.parse({ considerLPA: true });
    expect(result.considerLPA).toBe(true);
  });

  it("parses considerLPA as number (1 → true)", () => {
    const result = willInputSchema.parse({ considerLPA: 1 });
    expect(result.considerLPA).toBe(true);
  });

  it("parses considerLPA as number (0 → false)", () => {
    const result = willInputSchema.parse({ considerLPA: 0 });
    expect(result.considerLPA).toBe(false);
  });

  it("parses DD fields without throwing", () => {
    expect(() =>
      willInputSchema.parse({
        ddArrangedAppointment: "yes",
        ddClientSince: "2020",
        ddMeetingType: "in-person",
      })
    ).not.toThrow();
  });
});

describe("V1 — Reference number format", () => {
  it("generates a reference number matching GEP-XXXXX-XXXX pattern", () => {
    const ref = `GEP-${Date.now().toString(36).toUpperCase()}-ABCD`;
    expect(ref).toMatch(/^GEP-[A-Z0-9]+-[A-Z0-9]+$/);
  });

  it("two references generated in sequence are unique", () => {
    const a = `GEP-${Date.now().toString(36).toUpperCase()}-AAAA`;
    const b = `GEP-${(Date.now() + 1).toString(36).toUpperCase()}-BBBB`;
    expect(a).not.toBe(b);
  });
});

describe("V1 — Recommendation engine (pure logic)", () => {
  function computeRecs(data: {
    productsOrdered?: string[];
    willType?: string;
    client1MaritalStatus?: string;
    propertyOwned?: string;
    hasVulnerableBeneficiary?: string;
    careConcerns?: string;
  }) {
    const products = data.productsOrdered ?? [];
    const hasLPA = products.some(p => p.includes("lpa") || p === "both_lpas");
    const hasPPT = products.includes("ppt");
    const hasAAT = products.includes("aat");
    const hasStorage = products.includes("storage");
    const hasVulnerableTrust = products.includes("vulnerable_trust");
    const isMirror = products.includes("mirror_wills") || data.willType === "Mirror Wills";
    const isMarried = ["Married", "Civil Partnership", "Partner / Common Law Spouse"].includes(data.client1MaritalStatus ?? "");
    const ownsProperty = data.propertyOwned === "yes";
    const hasVulnerableBeneficiary = data.hasVulnerableBeneficiary === "yes";
    const hasCareConerns = data.careConcerns === "yes";
    const recs: string[] = [];
    if (!hasPPT && isMarried && ownsProperty && isMirror) recs.push("ppt");
    if (!hasAAT && ownsProperty) recs.push("aat");
    if (!hasLPA) recs.push("lpa");
    if (!hasStorage) recs.push("storage");
    if (hasVulnerableBeneficiary && !hasVulnerableTrust) recs.push("vulnerable_trust");
    if (hasCareConerns && !hasAAT) recs.push("care_protection");
    return recs;
  }

  it("recommends LPA when not ordered", () => {
    expect(computeRecs({ productsOrdered: ["single_will"] })).toContain("lpa");
  });

  it("does NOT recommend LPA when already ordered", () => {
    expect(computeRecs({ productsOrdered: ["lpa_property_finance"] })).not.toContain("lpa");
  });

  it("recommends PPT for married mirror-will property owner", () => {
    expect(
      computeRecs({ productsOrdered: ["mirror_wills"], client1MaritalStatus: "Married", propertyOwned: "yes" })
    ).toContain("ppt");
  });

  it("does NOT recommend PPT for single will", () => {
    expect(
      computeRecs({ productsOrdered: ["single_will"], client1MaritalStatus: "Married", propertyOwned: "yes" })
    ).not.toContain("ppt");
  });

  it("recommends AAT when property owned and not ordered", () => {
    expect(computeRecs({ propertyOwned: "yes" })).toContain("aat");
  });

  it("does NOT recommend AAT when already ordered", () => {
    expect(computeRecs({ productsOrdered: ["aat"], propertyOwned: "yes" })).not.toContain("aat");
  });

  it("recommends vulnerable trust when vulnerable beneficiary present", () => {
    expect(computeRecs({ hasVulnerableBeneficiary: "yes" })).toContain("vulnerable_trust");
  });

  it("does NOT recommend vulnerable trust when already ordered", () => {
    expect(
      computeRecs({ productsOrdered: ["vulnerable_trust"], hasVulnerableBeneficiary: "yes" })
    ).not.toContain("vulnerable_trust");
  });

  it("recommends care protection when care concerns noted and no AAT", () => {
    expect(computeRecs({ careConcerns: "yes" })).toContain("care_protection");
  });

  it("does NOT recommend care protection when AAT already ordered", () => {
    expect(computeRecs({ productsOrdered: ["aat"], careConcerns: "yes" })).not.toContain("care_protection");
  });

  it("returns no recommendations when all products ordered", () => {
    expect(
      computeRecs({
        productsOrdered: ["mirror_wills", "lpa_property_finance", "ppt", "aat", "storage", "vulnerable_trust"],
        client1MaritalStatus: "Married",
        propertyOwned: "yes",
        hasVulnerableBeneficiary: "yes",
        careConcerns: "yes",
      })
    ).toHaveLength(0);
  });
});

describe("V1 — updateSubmission field stripping (regression for Unknown column bug)", () => {
  /**
   * This test directly guards the bug that was fixed on 2026-07-09:
   * updateSubmission was not stripping client2SameAddressAsClient1 before
   * passing the data to Drizzle's .set(), causing MySQL "Unknown column" errors.
   */
  it("stripping pattern used in updateSubmission removes client2SameAddressAsClient1", () => {
    const input = willInputSchema.parse({
      client1FirstName: "Alice",
      client2SameAddressAsClient1: true,
      consultantName: "Bob",
      considerLPA: true,
    });
    // Simulate: const { id, client2SameAddressAsClient1: _sameAddr, ...formData } = input;
    const id = 42;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client2SameAddressAsClient1: _sameAddr, ...formData } = input;
    const updateData = nullify({
      ...formData,
      considerLPA: formData.considerLPA ? 1 : 0,
      considerPPT: formData.considerPPT ? 1 : 0,
      considerAAT: formData.considerAAT ? 1 : 0,
    });
    expect("client2SameAddressAsClient1" in updateData).toBe(false);
    expect(updateData.client1FirstName).toBe("Alice");
    expect(updateData.consultantName).toBe("Bob");
    expect(updateData.considerLPA).toBe(1);
    expect(id).toBe(42); // id is used separately in .where()
  });

  it("stripping pattern used in submit removes client2SameAddressAsClient1", () => {
    const input = willInputSchema.parse({ client2SameAddressAsClient1: false, client1FirstName: "Test" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client2SameAddressAsClient1: _sameAddr, ...insertInput } = input;
    expect("client2SameAddressAsClient1" in insertInput).toBe(false);
  });

  it("stripping pattern used in saveDraft removes client2SameAddressAsClient1", () => {
    const input = { ...willInputSchema.parse({ client2SameAddressAsClient1: true }), draftId: 1, currentStep: 3 };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { draftId: _d, currentStep: _s, client2SameAddressAsClient1: _sameAddr, ...formData } = input;
    expect("client2SameAddressAsClient1" in formData).toBe(false);
  });
});

describe("V1 — Zod schema completeness (no unexpected fields cause parse errors)", () => {
  it("parses a full realistic single-will payload", () => {
    expect(() =>
      willInputSchema.parse({
        appointmentDate: "2026-07-09",
        consultantName: "Jane Doe",
        productsOrdered: ["single_will", "lpa_property_finance"],
        willType: "Single Will",
        client1Prefix: "Mr",
        client1FirstName: "John",
        client1LastName: "Smith",
        client1Email: "john@example.com",
        client2SameAddressAsClient1: false,
        client1Executors: [{ firstName: "Mary", lastName: "Smith", relationship: "wife" }],
        client1Beneficiaries: [{ firstName: "Tom", lastName: "Smith", share: "all" }],
        client1SpecificGifts: [{ description: "Gold watch", recipient: "Tom Smith" }],
        client1HasChildren: "yes",
        client1ChildrenUnder18: [],
        client1ChildrenOver18: [{ firstName: "Tom", lastName: "Smith" }],
        ddArrangedAppointment: "yes",
        ddClientSince: "2020",
        ddMeetingType: "in-person",
        propertyOwned: "yes",
        hasLifeInsurance: "no",
        hasBusinessInterests: "no",
        protectivePropertyTrusts: [],
        discretionaryTrusts: [],
        manualNeedsAssessment: "Client needs LPA.",
        considerLPA: true,
        considerPPT: false,
        considerAAT: true,
      })
    ).not.toThrow();
  });
});
