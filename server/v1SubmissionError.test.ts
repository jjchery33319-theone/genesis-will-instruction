import { describe, expect, it } from "vitest";
import { extractV1SubmissionError, submissionErrorFieldPath, submissionErrorStep } from "../client/src/lib/v1SubmissionError";

describe("V1 submission error guidance", () => {
  it("extracts a Zod error path from a tRPC-style message", () => {
    const error = {
      message: 'Submission failed: [{"expected":"boolean","path":["lifeInsurancePolicies",0,"inTrust"],"message":"Invalid input"}]',
    };
    const result = extractV1SubmissionError(error);
    expect(result?.path).toEqual(["lifeInsurancePolicies", "0", "inTrust"]);
    expect(submissionErrorStep(result?.path ?? [])).toBe(8);
    expect(submissionErrorFieldPath(result?.path ?? [])).toBe("lifeInsurancePolicies[0].inTrust");
  });

  it("maps child totals and gift notes to the relevant V1 steps", () => {
    expect(submissionErrorStep(["client1TotalChildren"])).toBe(3);
    expect(submissionErrorFieldPath(["client2SpecificGifts", "1", "notes"])).toBe("client2SpecificGifts[1].notes");
    expect(submissionErrorStep(["client2SpecificGifts", "1", "notes"])).toBe(12);
  });
});
