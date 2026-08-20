/**
 * AI-powered extraction of will instruction data from a transcript.
 * Uses a plain JSON prompt (no json_schema response_format) to avoid strict schema validation issues.
 */
import { invokeLLM } from "./_core/llm";

const ALLOWED_V1_FIELDS = new Set([
  "willType", "consultantName", "appointmentDate", "appointmentTime", "appointmentLocation", "productsOrdered",
  "client1Prefix", "client1FirstName", "client1MiddleName", "client1LastName", "client1Dob", "client1AddressLine1", "client1City", "client1Postcode", "client1MaritalStatus", "client1JobTitle", "client1DaytimePhone", "client1Mobile", "client1Email", "client1Nationality",
  "client2Prefix", "client2FirstName", "client2MiddleName", "client2LastName", "client2Dob", "client2AddressLine1", "client2City", "client2Postcode", "client2MaritalStatus", "client2JobTitle", "client2DaytimePhone", "client2Mobile", "client2Email", "client2Nationality",
  "client1HasChildren", "client1TotalChildren", "client1ChildrenUnder18", "client1ChildrenOver18", "client1ChildrenDetails", "client1FamilyCircumstances",
  "client2HasChildren", "client2TotalChildren", "client2ChildrenUnder18", "client2ChildrenOver18", "client2ChildrenDetails", "client2FamilyCircumstances",
  "client1Residency", "client1DomiciledUK", "client1MentalCapacity", "client1MentalCapacityNotes", "client1ChildrenPastRelationships", "client1ChildrenPastDetails",
  "client2Residency", "client2DomiciledUK", "client2MentalCapacity", "client2MentalCapacityNotes", "client2ChildrenPastRelationships", "client2ChildrenPastDetails",
  "ddArrangedAppointment", "ddArrangedAppointmentNotes", "ddKnowledgeOfEstate", "ddKnowledgeOfEstateNotes", "ddKnewBeneficiaries", "ddKnewBeneficiariesNotes", "ddSignsOfInfluence", "ddSignsOfInfluenceNotes", "ddKnewAppointees", "ddKnewAppointeesNotes",
  "client1Executors", "client1ReservedExecutors", "client2Executors", "client2ReservedExecutors", "trustees", "client1Guardians", "client1ReservedGuardians", "client2Guardians", "client2ReservedGuardians",
  "client1Beneficiaries", "client1ResidualEstate", "client1ResidualBackup", "client1SpecificGifts", "client1Exclusions", "client2Beneficiaries", "client2ResidualEstate", "client2ResidualBackup", "client2SpecificGifts", "client2Exclusions",
  "propertyOwned", "propertyAddress", "propertyOwnership", "mortgageOutstanding", "mortgageBalance", "mortgageTermRemaining", "mortgageLender", "propertyValue", "hasOtherProperties", "otherProperties", "assetsOutsideUK", "assetsOutsideUKDetails", "bankAccounts", "investments", "pensionDetails", "estimatedEstateValue", "client2BankAccounts", "client2Investments", "client2PensionDetails", "client2EstimatedEstateValue",
  "hasLifeInsurance", "lifeInsurancePolicies", "lifeInsuranceNotes", "hasBusinessInterests", "businessInterests", "businessInterestsDetails", "hasPets", "petsDetails", "petsCarer",
  "client1FuneralType", "client1FuneralWishes", "client1OrganDonation", "client2FuneralType", "client2FuneralWishes", "client2OrganDonation", "disasterClauseClient1", "disasterClauseClient2", "disasterClauseNotes", "additionalNotes", "specialNotes", "lpaDetails"
]);

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  return !Array.isArray(value) || value.length > 0;
}

function splitName(value: string): Pick<Record<"firstName" | "lastName", string>, "firstName" | "lastName"> {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function normalisePeople(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return value.map((person) => {
    if (!person || typeof person !== "object") return person;
    const entry = { ...(person as Record<string, unknown>) };
    if (!entry.firstName) {
      const name = typeof entry.fullName === "string" ? entry.fullName : typeof entry.name === "string" ? entry.name : "";
      if (name) Object.assign(entry, splitName(name));
    }
    if (!entry.address && typeof entry.addressLine1 === "string") entry.address = entry.addressLine1;
    return entry;
  });
}

export function normaliseV1Extraction(raw: Record<string, unknown>): Record<string, unknown> {
  const aliases: Record<string, string> = {
    executors: "client1Executors",
    reserveExecutors: "client1ReservedExecutors",
    reservedExecutors: "client1ReservedExecutors",
    guardians: "client1Guardians",
    reservedGuardians: "client1ReservedGuardians",
    beneficiaries: "client1Beneficiaries",
    specificGifts: "client1SpecificGifts",
    residuaryEstate: "client1ResidualEstate",
    residuaryBackup: "client1ResidualBackup",
    funeralType: "client1FuneralType",
    funeralWishes: "client1FuneralWishes",
    organDonation: "client1OrganDonation",
  };
  const normalised: Record<string, unknown> = {};
  for (const [rawKey, rawValue] of Object.entries(raw)) {
    const key = aliases[rawKey] ?? rawKey;
    if (!ALLOWED_V1_FIELDS.has(key) || !hasValue(rawValue)) continue;
    normalised[key] = /(Executors|Guardians|Beneficiaries|SpecificGifts|ChildrenUnder18|ChildrenOver18|Exclusions)$/.test(key)
      ? normalisePeople(rawValue)
      : rawValue;
  }
  return normalised;
}

const SYSTEM_PROMPT = `You are an expert will-writing assistant for Genesis Wills and Estate Planning Ltd (UK).
Your task is to extract structured will instruction data from a consultation transcript, completed questionnaire, letter, PDF, Word document, or notes.
Extract only information expressly stated in the source. Do not guess, infer, invent, or complete missing facts. Omit fields that are not mentioned.
Work through the source carefully, including narrative wording, tables, headings, informal notes, and lists. Map each fact to the exact current Version 1 field name below. Where a full name appears inside a person list, split it into firstName and lastName. Preserve exact allocation wording, gift wording, and funeral wishes in their relevant text fields.
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
client1Executors (array of {prefix, firstName, lastName, relationship, address, phone, email, dob, notes}),
client1ReservedExecutors (array of {prefix, firstName, lastName, relationship, address, phone, email, dob, notes}),
client2Executors and client2ReservedExecutors (the equivalent arrays for Client 2 in mirror Wills),
trustees (array of {prefix, firstName, lastName, relationship, address, phone, email, dob, notes}),
client1Guardians and client1ReservedGuardians (arrays of {prefix, firstName, lastName, relationship, address, phone, email, dob, notes}),
client2Guardians and client2ReservedGuardians (the equivalent arrays for Client 2 in mirror Wills),
client1Beneficiaries (array of {prefix, firstName, lastName, relationship, address, dob, share, isVulnerable, notes}) - named beneficiaries for Client 1,
client2Beneficiaries (array of {prefix, firstName, lastName, relationship, address, dob, share, isVulnerable, notes}) - named beneficiaries for Client 2 (mirror wills only),
client1ResidualEstate (string) - who inherits the residue for Client 1,
client1ResidualBackup (string) - backup/substitution clause for Client 1,
client2ResidualEstate (string) - who inherits the residue for Client 2 (mirror wills only),
client2ResidualBackup (string) - backup/substitution clause for Client 2 (mirror wills only),
client1SpecificGifts (array of {description, recipient, recipientRelationship, notes}) - specific gifts for Client 1,
client2SpecificGifts (array of {description, recipient, recipientRelationship, notes}) - specific gifts for Client 2 (mirror wills only),
client1FuneralType (one of: cremation, burial, no_preference), client1FuneralWishes (string), client1OrganDonation (one of: yes, no, not_stated),
client2FuneralType (one of: cremation, burial, no_preference), client2FuneralWishes (string), client2OrganDonation (one of: yes, no, not_stated),
hasPets, petsDetails, petsCarer,
otherProperties (string - plain text description of additional properties, NOT an array),
bankAccounts (string), investments (string), pensionDetails (string), estimatedEstateValue (string),
client2BankAccounts (string), client2Investments (string), client2PensionDetails (string), client2EstimatedEstateValue (string),
propertyOwned, propertyAddress, propertyOwnership, propertyValue, mortgageOutstanding, mortgageBalance, mortgageTermRemaining, mortgageLender, hasOtherProperties, assetsOutsideUK, assetsOutsideUKDetails,
hasLifeInsurance, lifeInsuranceNotes, lifeInsurancePolicies (array of {provider, policyNumber, sumAssured, termRemaining, inTrust, beneficiary, notes}),
hasBusinessInterests, businessInterests, businessInterestsDetails (array of {businessName, natureOfBusiness, ownershipPercentage, notes}),
additionalNotes, specialNotes, extractionNotes`;

export async function extractWillDataFromTranscript(transcriptText: string): Promise<{
  extractedData: Record<string, unknown>;
  extractionNotes: string;
  confidence: "high" | "medium" | "low";
  populatedFields: string[];
}> {
  const truncated = transcriptText.slice(0, 18000); // Keep enough context for unstructured letters and questionnaires.

  const response = await invokeLLM({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extract Version 1 will instruction data from the following uploaded document and return a JSON object only:\n\n---\n${truncated}\n---`
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
  parsed = normaliseV1Extraction(parsed);

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

  return { extractedData: parsed, extractionNotes, confidence, populatedFields: Object.keys(parsed) };
}
