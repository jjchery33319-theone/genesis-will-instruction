import { describe, it, expect } from "vitest";
import { validateOneDriveCredentials } from "./oneDriveService";
import { formatWillDocument, buildFilename } from "./willDocumentFormatter";
import type { WillInstruction } from "../drizzle/schema";

// ─── Credential validation ────────────────────────────────────────────────────
describe("OneDrive credentials", () => {
  it("should acquire a valid access token with the configured Azure credentials", async () => {
    const valid = await validateOneDriveCredentials();
    expect(valid).toBe(true);
  }, 20_000); // allow up to 20s for network call
});

// ─── Document formatter ───────────────────────────────────────────────────────
describe("Will document formatter", () => {
  const mockRecord = {
    id: 1,
    referenceNumber: "GEP-TEST-ABCD",
    client1FirstName: "John",
    client1LastName: "Smith",
    client1Dob: "1970-01-15",
    client2FirstName: "Jane",
    client2LastName: "Smith",
    productsOrdered: ["mirror_wills"],
    consultantName: "Test Consultant",
    appointmentDate: "2026-06-16",
    hasLifeInsurance: "yes",
    lifeInsurancePolicies: [
      { provider: "Aviva", policyNumber: "AV-123", sumAssured: "250000", termRemaining: "15 years", inTrust: true, beneficiary: "Spouse" },
    ],
    client1Executors: [{ firstName: "Jane", lastName: "Smith", relationship: "Spouse" }],
    client2Executors: [{ firstName: "John", lastName: "Smith", relationship: "Spouse" }],
    client1Beneficiaries: [],
    client2Beneficiaries: [],
    client1SpecificGifts: [],
    client2SpecificGifts: [],
    client1Guardians: [],
    client2Guardians: [],
    client1ReservedGuardians: [],
    client2ReservedGuardians: [],
    client1ReservedExecutors: [],
    client2ReservedExecutors: [],
    trustees: [],
    client1ChildrenUnder18: [],
    client2ChildrenUnder18: [],
    aiRecommendationNarrative: "Test narrative",
    status: "submitted",
  } as unknown as WillInstruction;

  it("should include the reference number in the document", () => {
    const doc = formatWillDocument(mockRecord);
    expect(doc).toContain("GEP-TEST-ABCD");
  });

  it("should include both client names", () => {
    const doc = formatWillDocument(mockRecord);
    expect(doc).toContain("John Smith");
    expect(doc).toContain("Jane Smith");
  });

  it("should include term remaining for life insurance policies", () => {
    const doc = formatWillDocument(mockRecord);
    expect(doc).toContain("15 years");
  });

  it("should build a filename with client name and reference", () => {
    const filename = buildFilename(mockRecord);
    expect(filename).toContain("John_Smith");
    expect(filename).toContain("GEP-TEST-ABCD");
    expect(filename).toMatch(/\.txt$/);
  });
});
