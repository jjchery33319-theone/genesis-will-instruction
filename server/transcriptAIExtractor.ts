/**
 * AI-powered extraction of will instruction data from a transcript.
 * Uses a plain JSON prompt (no json_schema response_format) to avoid strict schema validation issues.
 */
import { invokeLLM } from "./_core/llm";

const SYSTEM_PROMPT = `You are an expert will-writing assistant for Genesis Wills and Estate Planning Ltd (UK).
Your task is to extract structured will instruction data from a consultation transcript or notes.
Extract as much information as possible. Omit fields that are not mentioned.
Return ONLY a single valid JSON object — no markdown fences, no explanation, no extra text.

Key rules:
- Dates: use ISO format YYYY-MM-DD where possible, or the exact string as spoken
- Names: extract prefix (Mr/Mrs/Miss/Ms/Dr), firstName, middleName, lastName separately where possible
- Addresses: split into addressLine1, city, postcode where possible
- For executors/trustees/guardians/beneficiaries: extract as arrays of person objects
- willType: "single" if one person, "mirror" if couple/two people
- productsOrdered: array of strings from (single_will, mirror_wills, lpa_property_finance, lpa_health_welfare, both_lpas, ppt, storage)
- funeralType: one of "cremation", "burial", "no_preference"
- organDonation: one of "yes", "no", "not_stated"
- propertyOwned: "yes" or "no"
- mortgageOutstanding: "yes" or "no"
- hasPets: "yes" or "no"
- client1HasChildren / client2HasChildren: "yes" or "no"
- extractionNotes: brief note about any ambiguities or missing information the user should review

Return a JSON object with any of these fields that are present in the transcript:
willType, consultantName, appointmentDate, appointmentLocation, productsOrdered,
client1Prefix, client1FirstName, client1MiddleName, client1LastName, client1Dob,
client1AddressLine1, client1City, client1Postcode, client1MaritalStatus, client1JobTitle,
client1DaytimePhone, client1Mobile, client1Email, client1Nationality,
client2Prefix, client2FirstName, client2MiddleName, client2LastName, client2Dob,
client2AddressLine1, client2City, client2Postcode, client2MaritalStatus, client2JobTitle,
client2DaytimePhone, client2Mobile, client2Email,
client1HasChildren, client1TotalChildren,
client1ChildrenUnder18 (array of {name, dob, relationship}),
client1ChildrenOver18 (array of {name, dob, relationship}),
client2HasChildren, client2TotalChildren,
executors (array of {prefix, firstName, lastName, relationship, address, phone, email, dob, notes}),
reserveExecutors (array of {prefix, firstName, lastName, relationship, address, phone, email, notes}),
trustees (array of {prefix, firstName, lastName, relationship, address, notes}),
guardians (array of {prefix, firstName, lastName, relationship, address, phone, notes}),
beneficiaries (array of {prefix, firstName, lastName, relationship, address, dob, share, isVulnerable, notes}),
specificGifts (array of {description, recipient, recipientRelationship, notes}),
hasPets, petsDetails, petsCarer,
residuaryEstate, residuaryBackup,
funeralType, funeralWishes, organDonation,
propertyOwned, propertyAddress, propertyOwnership, propertyValue, mortgageOutstanding,
additionalNotes, specialNotes, extractionNotes`;

export async function extractWillDataFromTranscript(transcriptText: string): Promise<{
  extractedData: Record<string, unknown>;
  extractionNotes: string;
  confidence: "high" | "medium" | "low";
}> {
  const truncated = transcriptText.slice(0, 12000); // Limit to ~12k chars to stay within token budget

  const response = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extract will instruction data from the following transcript and return a JSON object only:\n\n---\n${truncated}\n---`
      }
    ]
  });

  const rawContent = response.choices?.[0]?.message?.content;
  if (!rawContent || typeof rawContent !== "string") {
    throw new Error("AI extraction returned no content");
  }

  // Strip markdown code fences if the model wrapped the JSON
  const cleaned = rawContent
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to find JSON object within the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        throw new Error("AI extraction returned invalid JSON. Please try again.");
      }
    } else {
      throw new Error("AI extraction returned invalid JSON. Please try again.");
    }
  }

  const extractionNotes = (parsed.extractionNotes as string) ?? "";
  delete parsed.extractionNotes;

  // Determine confidence based on how many key fields were extracted
  const keyFields = ["client1FirstName", "client1LastName", "willType", "executors"];
  const filledKeys = keyFields.filter(k => {
    const v = parsed[k];
    if (v === null || v === undefined || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });
  const confidence: "high" | "medium" | "low" =
    filledKeys.length >= 3 ? "high" : filledKeys.length >= 2 ? "medium" : "low";

  return { extractedData: parsed, extractionNotes, confidence };
}
