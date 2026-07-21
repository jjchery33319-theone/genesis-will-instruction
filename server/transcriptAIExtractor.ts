/**
 * AI-powered extraction of will instruction data from a transcript
 * Returns a partial WillInstruction object ready to pre-fill the V1 form
 */
import { invokeLLM } from "./_core/llm";

const SYSTEM_PROMPT = `You are an expert will-writing assistant for Genesis Wills and Estate Planning Ltd (UK).
Your task is to extract structured will instruction data from a consultation transcript or notes.
Extract as much information as possible. Leave fields as null/undefined if not mentioned.
Return ONLY valid JSON matching the schema — no markdown, no explanation.

Key rules:
- Dates: use ISO format YYYY-MM-DD where possible, or the exact string as spoken
- Names: extract prefix (Mr/Mrs/Miss/Ms/Dr), first name, middle name, last name separately where possible
- Addresses: split into addressLine1, city, postcode where possible
- For executors/trustees/guardians/beneficiaries: extract as arrays of person objects
- willType: "single" if one person, "mirror" if couple/two people
- Products: infer from context (single_will, mirror_wills, lpa_property_finance, lpa_health_welfare, both_lpas, ppt, storage)
- Residuary estate: who gets the estate after specific gifts
- Funeral: cremation/burial, any specific wishes
- Organ donation: yes/no
`;

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    // Appointment / meta
    willType: { type: "string", enum: ["single", "mirror"], description: "single or mirror wills" },
    consultantName: { type: "string" },
    appointmentDate: { type: "string" },
    appointmentLocation: { type: "string" },
    productsOrdered: { type: "array", items: { type: "string" } },

    // Client 1
    client1Prefix: { type: "string" },
    client1FirstName: { type: "string" },
    client1MiddleName: { type: "string" },
    client1LastName: { type: "string" },
    client1Dob: { type: "string" },
    client1AddressLine1: { type: "string" },
    client1City: { type: "string" },
    client1Postcode: { type: "string" },
    client1MaritalStatus: { type: "string" },
    client1JobTitle: { type: "string" },
    client1DaytimePhone: { type: "string" },
    client1Mobile: { type: "string" },
    client1Email: { type: "string" },
    client1Nationality: { type: "string" },

    // Client 2 (mirror wills)
    client2Prefix: { type: "string" },
    client2FirstName: { type: "string" },
    client2MiddleName: { type: "string" },
    client2LastName: { type: "string" },
    client2Dob: { type: "string" },
    client2AddressLine1: { type: "string" },
    client2City: { type: "string" },
    client2Postcode: { type: "string" },
    client2MaritalStatus: { type: "string" },
    client2JobTitle: { type: "string" },
    client2DaytimePhone: { type: "string" },
    client2Mobile: { type: "string" },
    client2Email: { type: "string" },

    // Family
    client1HasChildren: { type: "string", enum: ["yes", "no"] },
    client1TotalChildren: { type: "string" },
    client1ChildrenUnder18: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          dob: { type: "string" },
          relationship: { type: "string" }
        },
        additionalProperties: false
      }
    },
    client1ChildrenOver18: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          dob: { type: "string" },
          relationship: { type: "string" }
        },
        additionalProperties: false
      }
    },
    client2HasChildren: { type: "string", enum: ["yes", "no"] },
    client2TotalChildren: { type: "string" },

    // Executors
    executors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prefix: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          relationship: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          dob: { type: "string" },
          notes: { type: "string" }
        },
        additionalProperties: false
      }
    },
    reserveExecutors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prefix: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          relationship: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          notes: { type: "string" }
        },
        additionalProperties: false
      }
    },

    // Trustees
    trustees: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prefix: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          relationship: { type: "string" },
          address: { type: "string" },
          notes: { type: "string" }
        },
        additionalProperties: false
      }
    },

    // Guardians
    guardians: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prefix: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          relationship: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          notes: { type: "string" }
        },
        additionalProperties: false
      }
    },

    // Beneficiaries
    beneficiaries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prefix: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          relationship: { type: "string" },
          address: { type: "string" },
          dob: { type: "string" },
          share: { type: "string" },
          isVulnerable: { type: "boolean" },
          notes: { type: "string" }
        },
        additionalProperties: false
      }
    },

    // Specific gifts
    specificGifts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          recipient: { type: "string" },
          recipientRelationship: { type: "string" },
          notes: { type: "string" }
        },
        additionalProperties: false
      }
    },

    // Pets
    hasPets: { type: "string", enum: ["yes", "no"] },
    petsDetails: { type: "string" },
    petsCarer: { type: "string" },

    // Wishes
    residuaryEstate: { type: "string" },
    residuaryBackup: { type: "string" },
    funeralType: { type: "string", enum: ["cremation", "burial", "no_preference"] },
    funeralWishes: { type: "string" },
    organDonation: { type: "string", enum: ["yes", "no", "not_stated"] },

    // Property
    propertyOwned: { type: "string", enum: ["yes", "no"] },
    propertyAddress: { type: "string" },
    propertyOwnership: { type: "string" },
    propertyValue: { type: "string" },
    mortgageOutstanding: { type: "string", enum: ["yes", "no"] },

    // Additional notes
    additionalNotes: { type: "string" },
    specialNotes: { type: "string" },

    // Confidence note
    extractionNotes: { type: "string", description: "Any ambiguities or low-confidence extractions the user should review" }
  },
  required: [],
  additionalProperties: false
};

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
        content: `Please extract will instruction data from the following transcript:\n\n---\n${truncated}\n---\n\nReturn structured JSON only.`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "will_instruction_extraction",
        strict: true,
        schema: EXTRACTION_SCHEMA
      }
    }
  });

  const rawContent = response.choices?.[0]?.message?.content;
  if (!rawContent || typeof rawContent !== "string") {
    throw new Error("AI extraction returned no content");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error("AI extraction returned invalid JSON");
  }

  const extractionNotes = (parsed.extractionNotes as string) ?? "";
  delete parsed.extractionNotes;

  // Determine confidence based on how many key fields were extracted
  const keyFields = ["client1FirstName", "client1LastName", "willType", "executors"];
  const filledKeys = keyFields.filter(k => parsed[k] !== null && parsed[k] !== undefined && parsed[k] !== "");
  const confidence: "high" | "medium" | "low" =
    filledKeys.length >= 3 ? "high" : filledKeys.length >= 2 ? "medium" : "low";

  return { extractedData: parsed, extractionNotes, confidence };
}
