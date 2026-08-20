import { describe, expect, it } from "vitest";
import { normaliseV1Extraction } from "./transcriptAIExtractor";

describe("enhanced V1 AI extraction normalization", () => {
  it("maps legacy unstructured aliases to the current Version 1 per-client fields", () => {
    const normalized = normaliseV1Extraction({
      executors: [{ fullName: "Laura Taylor", relationship: "sister" }],
      beneficiaries: [{ name: "Daniel Taylor", share: "50%" }],
      residuaryEstate: "Daniel Taylor and Sophie Taylor equally",
      funeralWishes: "Cremation with no religious service",
    });

    expect(normalized.client1Executors).toEqual([{ firstName: "Laura", lastName: "Taylor", relationship: "sister", fullName: "Laura Taylor" }]);
    expect(normalized.client1Beneficiaries).toEqual([{ firstName: "Daniel", lastName: "Taylor", share: "50%", name: "Daniel Taylor" }]);
    expect(normalized.client1ResidualEstate).toBe("Daniel Taylor and Sophie Taylor equally");
    expect(normalized.client1FuneralWishes).toBe("Cremation with no religious service");
  });

  it("keeps only recognised non-empty Version 1 fields for review and application", () => {
    const normalized = normaliseV1Extraction({
      client1FirstName: "Jane",
      propertyValue: "£350,000",
      unexpectedInstruction: "must not reach form state",
      client1Beneficiaries: [],
    });

    expect(normalized).toEqual({ client1FirstName: "Jane", propertyValue: "£350,000" });
  });
});
