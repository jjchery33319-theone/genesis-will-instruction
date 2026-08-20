import { describe, expect, it } from "vitest";
import { captureAiFieldSnapshot, parseStructuredAiSummaryEdit } from "../client/src/lib/aiUploadData";

describe("V1 AI upload reset snapshot", () => {
  it("captures only fields that an uploaded document is about to overwrite", () => {
    const current = {
      client1FirstName: "Existing",
      client1LastName: "Client",
      client1Executors: [{ firstName: "Original", lastName: "Executor" }],
      propertyValue: "£200,000",
    };

    expect(captureAiFieldSnapshot(current, ["client1FirstName", "client1Executors"])).toEqual({
      client1FirstName: "Existing",
      client1Executors: [{ firstName: "Original", lastName: "Executor" }],
    });
  });

  it("retains an undefined previous value so clear can remove newly AI-added data", () => {
    const snapshot = captureAiFieldSnapshot({ client1FirstName: "Existing" }, ["client1FirstName", "propertyValue"]);
    expect(snapshot).toHaveProperty("propertyValue", undefined);
  });

  it("accepts valid structured summary edits and rejects invalid JSON before application", () => {
    expect(parseStructuredAiSummaryEdit('[{"firstName":"Laura","lastName":"Taylor"}]')).toEqual({
      ok: true,
      value: [{ firstName: "Laura", lastName: "Taylor" }],
    });
    expect(parseStructuredAiSummaryEdit('{not valid}')).toEqual({
      ok: false,
      error: "Use valid JSON for this structured value.",
    });
  });
});
