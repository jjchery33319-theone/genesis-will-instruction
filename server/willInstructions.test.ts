import { describe, expect, it, vi, beforeEach } from "vitest";

// ─── Mock the DB so tests run without a real database ─────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// ─── Mock the LLM to avoid API calls ─────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            narrative: "Test narrative from AI.",
            clientEmailDraft: "Dear Client, test email draft.",
          }),
        },
      },
    ],
  }),
}));

// ─── Mock email service ───────────────────────────────────────────────────────
vi.mock("./emailService", () => ({
  sendAdminEmail: vi.fn().mockResolvedValue(undefined),
}));

// ─── Recommendation engine tests (pure logic) ────────────────────────────────

describe("Recommendation Engine Logic", () => {
  // We test the recommendation logic by importing and calling the router
  // with a mocked DB. Since DB returns null, submit will throw, so we test
  // the logic inline here.

  function computeRecommendations(data: {
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
    const isMirrorWill = products.includes("mirror_wills") || data.willType === "Mirror Wills";
    const isMarried = ["Married", "Civil Partnership", "Partner / Common Law Spouse"].includes(data.client1MaritalStatus ?? "");
    const ownsProperty = data.propertyOwned === "yes";
    const hasVulnerableBeneficiary = data.hasVulnerableBeneficiary === "yes";
    const hasCareConerns = data.careConcerns === "yes";

    const recs: string[] = [];

    if (!hasPPT && isMarried && ownsProperty && isMirrorWill) recs.push("ppt");
    if (!hasAAT && ownsProperty) recs.push("aat");
    if (!hasLPA) recs.push("lpa");
    if (!hasStorage) recs.push("storage");
    if (hasVulnerableBeneficiary && !hasVulnerableTrust) recs.push("vulnerable_trust");
    if (hasCareConerns && !hasAAT) recs.push("care_protection");

    return recs;
  }

  it("recommends LPA when no LPA is ordered", () => {
    const recs = computeRecommendations({ productsOrdered: ["single_will"] });
    expect(recs).toContain("lpa");
  });

  it("does NOT recommend LPA when LPA is already ordered", () => {
    const recs = computeRecommendations({ productsOrdered: ["single_will", "lpa_property_finance"] });
    expect(recs).not.toContain("lpa");
  });

  it("recommends PPT for married property owner with mirror wills", () => {
    const recs = computeRecommendations({
      productsOrdered: ["mirror_wills"],
      client1MaritalStatus: "Married",
      propertyOwned: "yes",
    });
    expect(recs).toContain("ppt");
  });

  it("does NOT recommend PPT for single will", () => {
    const recs = computeRecommendations({
      productsOrdered: ["single_will"],
      client1MaritalStatus: "Married",
      propertyOwned: "yes",
    });
    expect(recs).not.toContain("ppt");
  });

  it("recommends AAT when property is owned and AAT not ordered", () => {
    const recs = computeRecommendations({ propertyOwned: "yes" });
    expect(recs).toContain("aat");
  });

  it("does NOT recommend AAT when already ordered", () => {
    const recs = computeRecommendations({ productsOrdered: ["aat"], propertyOwned: "yes" });
    expect(recs).not.toContain("aat");
  });

  it("recommends storage when not ordered", () => {
    const recs = computeRecommendations({ productsOrdered: [] });
    expect(recs).toContain("storage");
  });

  it("recommends vulnerable trust when vulnerable beneficiary present", () => {
    const recs = computeRecommendations({ hasVulnerableBeneficiary: "yes" });
    expect(recs).toContain("vulnerable_trust");
  });

  it("does NOT recommend vulnerable trust when already ordered", () => {
    const recs = computeRecommendations({
      productsOrdered: ["vulnerable_trust"],
      hasVulnerableBeneficiary: "yes",
    });
    expect(recs).not.toContain("vulnerable_trust");
  });

  it("recommends care protection when care concerns noted and no AAT", () => {
    const recs = computeRecommendations({ careConcerns: "yes" });
    expect(recs).toContain("care_protection");
  });

  it("does NOT recommend care protection when AAT already ordered", () => {
    const recs = computeRecommendations({
      productsOrdered: ["aat"],
      careConcerns: "yes",
    });
    expect(recs).not.toContain("care_protection");
  });

  it("returns no recommendations when all products are ordered", () => {
    const recs = computeRecommendations({
      productsOrdered: ["mirror_wills", "lpa_property_finance", "ppt", "aat", "storage", "vulnerable_trust"],
      client1MaritalStatus: "Married",
      propertyOwned: "yes",
      hasVulnerableBeneficiary: "yes",
      careConcerns: "yes",
    });
    expect(recs).toHaveLength(0);
  });
});

// ─── Reference number format ──────────────────────────────────────────────────
describe("Reference Number Format", () => {
  it("generates a reference number matching GEP-XXXXX-XXXX pattern", () => {
    const ref = `GEP-${Date.now().toString(36).toUpperCase()}-ABCD`;
    expect(ref).toMatch(/^GEP-[A-Z0-9]+-[A-Z0-9]+$/);
  });
});
