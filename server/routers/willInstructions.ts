import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { willInstructions } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { invokeLLM } from "../_core/llm";
import { ADMIN_EMAILS } from "../../shared/willConstants";
import { sendAdminEmail } from "../emailService";
import { sendClientConfirmationEmail, sendAdviserConfirmationEmail } from "../clientEmailService";
import { generateWillPdf } from "../pdfGenerator";
import { uploadToOneDrive } from "../oneDriveService";
import { formatWillDocument, buildFilename } from "../willDocumentFormatter";

// Zod schema for a person (executor/trustee/guardian/beneficiary)
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

const lifeInsurancePolicySchema = z.object({
  provider: z.string().optional(),
  policyNumber: z.string().optional(),
  sumAssured: z.string().optional(),
  termRemaining: z.string().optional(),
  inTrust: z.boolean().optional(),
  beneficiary: z.string().optional(),
  notes: z.string().optional(),
});

const businessInterestSchema = z.object({
  businessName: z.string().optional(),
  natureOfBusiness: z.string().optional(),
  ownershipPercentage: z.string().optional(),
  notes: z.string().optional(),
});

const willInstructionInputSchema = z.object({
  // Appointment
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  consultantName: z.string().optional(),
  consultantEmail: z.string().optional(),
  consultantPhone: z.string().optional(),
  caseCoordinatorName: z.string().optional(),
  caseCoordinatorEmail: z.string().optional(),
  caseCoordinatorPhone: z.string().optional(),
  priceQuoted: z.string().optional(),
  estimatedDraftDate: z.string().optional(),
  productsOrdered: z.array(z.string()).optional(),
  willType: z.string().optional(),
  lpaType: z.string().optional(),

  // Client 1
  client1Prefix: z.string().optional(),
  client1FirstName: z.string().optional(),
  client1MiddleName: z.string().optional(),
  client1LastName: z.string().optional(),
  client1Dob: z.string().optional(),
  client1AddressLine1: z.string().optional(),
  client1City: z.string().optional(),
  client1Postcode: z.string().optional(),
  client1MaritalStatus: z.string().optional(),
  client1JobTitle: z.string().optional(),
  client1DaytimePhone: z.string().optional(),
  client1Mobile: z.string().optional(),
  client1Email: z.string().optional(),
  client1Nationality: z.string().optional(),

  // Client 2
  client2Prefix: z.string().optional(),
  client2FirstName: z.string().optional(),
  client2MiddleName: z.string().optional(),
  client2LastName: z.string().optional(),
  client2Dob: z.string().optional(),
  client2AddressLine1: z.string().optional(),
  client2City: z.string().optional(),
  client2Postcode: z.string().optional(),
  client2MaritalStatus: z.string().optional(),
  client2JobTitle: z.string().optional(),
  client2DaytimePhone: z.string().optional(),
  client2Mobile: z.string().optional(),
  client2Email: z.string().optional(),
  client2Nationality: z.string().optional(),

  // Client 2 same address
  client2SameAddressAsClient1: z.boolean().optional(),

  // Per-client executors
  client1Executors: z.array(personSchema).optional(),
  client1ReservedExecutors: z.array(personSchema).optional(),
  client2Executors: z.array(personSchema).optional(),
  client2ReservedExecutors: z.array(personSchema).optional(),
  // Per-client guardians
  client1Guardians: z.array(personSchema).optional(),
  client1ReservedGuardians: z.array(personSchema).optional(),
  client2Guardians: z.array(personSchema).optional(),
  client2ReservedGuardians: z.array(personSchema).optional(),
  // Shared trustees
  trustees: z.array(personSchema).optional(),
  // Legacy shared fields
  executors: z.array(personSchema).optional(),
  reservedExecutors: z.array(personSchema).optional(),
  guardians: z.array(personSchema).optional(),
  reservedGuardians: z.array(personSchema).optional(),
  beneficiaries: z.array(personSchema).optional(),
  childrenBenefitAge: z.string().optional(),
  disasterClauseClient1: z.string().optional(),
  disasterClauseClient2: z.string().optional(),

  // Property & Assets
  propertyOwned: z.string().optional(),
  propertyAddress: z.string().optional(),
  propertyOwnership: z.string().optional(),
  mortgageOutstanding: z.string().optional(),
  mortgageBalance: z.string().optional(),
  mortgageTermRemaining: z.string().optional(),
  mortgageLender: z.string().optional(),
  propertyValue: z.string().optional(),
  hasOtherProperties: z.string().optional(),
  otherProperties: z.string().optional(),
  bankAccounts: z.string().optional(),
  investments: z.string().optional(),
  pensionDetails: z.string().optional(),
  estimatedEstateValue: z.string().optional(),

  // Per-client beneficiaries
  client1Beneficiaries: z.array(personSchema).optional(),
  client1ResidualEstate: z.string().optional(),
  client1ResidualBackup: z.string().optional(),
  client1ChildrenBenefitAge: z.string().optional(),
  client1HasVulnerableBeneficiary: z.string().optional(),
  client1VulnerableBeneficiaryDetails: z.string().optional(),
  client2Beneficiaries: z.array(personSchema).optional(),
  client2ResidualEstate: z.string().optional(),
  client2ResidualBackup: z.string().optional(),
  client2ChildrenBenefitAge: z.string().optional(),
  client2HasVulnerableBeneficiary: z.string().optional(),
  client2VulnerableBeneficiaryDetails: z.string().optional(),

  // Per-client gifts
  client1SpecificGifts: z.array(specificGiftSchema).optional(),
  client2SpecificGifts: z.array(specificGiftSchema).optional(),

  // Per-client funeral wishes
  client1FuneralType: z.string().optional(),
  client1FuneralWishes: z.string().optional(),
  client1OrganDonation: z.string().optional(),
  client2FuneralType: z.string().optional(),
  client2FuneralWishes: z.string().optional(),
  client2OrganDonation: z.string().optional(),

  // Legacy shared gifts & wishes
  specificGifts: z.array(specificGiftSchema).optional(),
  residuaryEstate: z.string().optional(),
  residuaryBackup: z.string().optional(),
  funeralType: z.string().optional(),
  funeralWishes: z.string().optional(),
  organDonation: z.string().optional(),

  // Vulnerable & care
  hasVulnerableBeneficiary: z.string().optional(),
  vulnerableBeneficiaryDetails: z.string().optional(),
  careConcerns: z.string().optional(),
  careConcernDetails: z.string().optional(),

  // Family Background
  client1MarriagePlans: z.string().optional(),
  client1MarriagePlanDetails: z.string().optional(),
  client1HasChildren: z.string().optional(),
  client1TotalChildren: z.string().optional(),
  client1ChildrenSpecialNeeds: z.string().optional(),
  client1ChildrenSpecialNeedsDetails: z.string().optional(),
  client1ChildrenUnder18: z.array(z.any()).optional(),
  client1ChildrenOver18: z.array(z.any()).optional(),
  client1ChildrenDetails: z.string().optional(),
  client1FamilyCircumstances: z.string().optional(),
  client2MarriagePlans: z.string().optional(),
  client2MarriagePlanDetails: z.string().optional(),
  client2HasChildren: z.string().optional(),
  client2TotalChildren: z.string().optional(),
  client2ChildrenSpecialNeeds: z.string().optional(),
  client2ChildrenSpecialNeedsDetails: z.string().optional(),
  client2ChildrenUnder18: z.array(z.any()).optional(),
  client2ChildrenOver18: z.array(z.any()).optional(),
  client2ChildrenDetails: z.string().optional(),
  client2FamilyCircumstances: z.string().optional(),

  // Additional Background
  client1Residency: z.string().optional(),
  client1DomiciledUK: z.string().optional(),
  client1MentalCapacity: z.string().optional(),
  client1MentalCapacityNotes: z.string().optional(),
  client1ChildrenPastRelationships: z.string().optional(),
  client1ChildrenPastDetails: z.string().optional(),
  client2Residency: z.string().optional(),
  client2DomiciledUK: z.string().optional(),
  client2MentalCapacity: z.string().optional(),
  client2MentalCapacityNotes: z.string().optional(),
  client2ChildrenPastRelationships: z.string().optional(),
  client2ChildrenPastDetails: z.string().optional(),

  // Due Diligence
  ddArrangedAppointment: z.string().optional(),
  ddArrangedAppointmentNotes: z.string().optional(),
  ddKnowledgeOfEstate: z.string().optional(),
  ddKnowledgeOfEstateNotes: z.string().optional(),
  ddKnewBeneficiaries: z.string().optional(),
  ddKnewBeneficiariesNotes: z.string().optional(),
  ddSignsOfInfluence: z.string().optional(),
  ddSignsOfInfluenceNotes: z.string().optional(),
  ddKnewAppointees: z.string().optional(),
  ddKnewAppointeesNotes: z.string().optional(),

  // Overseas assets
  assetsOutsideUK: z.string().optional(),
  assetsOutsideUKDetails: z.string().optional(),

  // Client 2 financial assets
  client2BankAccounts: z.string().optional(),
  client2Investments: z.string().optional(),
  client2PensionDetails: z.string().optional(),
  client2EstimatedEstateValue: z.string().optional(),

  // Life Insurance
  hasLifeInsurance: z.string().optional(),
  lifeInsurancePolicies: z.array(lifeInsurancePolicySchema).optional(),
  lifeInsuranceNotes: z.string().optional(),

  // Business Interests
  hasBusinessInterests: z.string().optional(),
  businessInterests: z.string().optional(),
  businessInterestsDetails: z.array(businessInterestSchema).optional(),

  // Pets
  hasPets: z.string().optional(),
  petsDetails: z.string().optional(),
  petsCarer: z.string().optional(),

  // Disaster Clause & Notes
  disasterClauseNotes: z.string().optional(),
  additionalNotes: z.string().optional(),

  // Notes
  specialNotes: z.string().optional(),

  // Manual Needs Assessment / Recommendations
  manualNeedsAssessment: z.string().optional(),
});

export const willInstructionsRouter = router({
  submit: publicProcedure
    .input(willInstructionInputSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const referenceNumber = `GEP-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

      // Use manual needs assessment if provided; skip AI generation
      let recommendations: Array<{ id: string; title: string; reason: string; priority: "high" | "medium" | "low" }> = [];
      let narrative = "";
      let clientEmailDraft = "";
      if (input.manualNeedsAssessment?.trim()) {
        narrative = input.manualNeedsAssessment.trim();
      } else {
        // No manual input — skip AI, leave empty
        narrative = "No needs assessment or recommendations were recorded for this instruction.";
      }

      const insertData = {
        referenceNumber,
        ...input,
        productsOrdered: input.productsOrdered ?? [],
        executors: input.executors ?? [],
        reservedExecutors: input.reservedExecutors ?? [],
        trustees: input.trustees ?? [],
        guardians: input.guardians ?? [],
        reservedGuardians: input.reservedGuardians ?? [],
        beneficiaries: input.beneficiaries ?? [],
        specificGifts: input.specificGifts ?? [],
        client1Executors: input.client1Executors ?? [],
        client1ReservedExecutors: input.client1ReservedExecutors ?? [],
        client2Executors: input.client2Executors ?? [],
        client2ReservedExecutors: input.client2ReservedExecutors ?? [],
        client1Guardians: input.client1Guardians ?? [],
        client1ReservedGuardians: input.client1ReservedGuardians ?? [],
        client2Guardians: input.client2Guardians ?? [],
        client2ReservedGuardians: input.client2ReservedGuardians ?? [],
        client1Beneficiaries: input.client1Beneficiaries ?? [],
        client2Beneficiaries: input.client2Beneficiaries ?? [],
        client1SpecificGifts: input.client1SpecificGifts ?? [],
        client2SpecificGifts: input.client2SpecificGifts ?? [],
        client1ChildrenUnder18: input.client1ChildrenUnder18 ?? [],
        client1ChildrenOver18: input.client1ChildrenOver18 ?? [],
        client2ChildrenUnder18: input.client2ChildrenUnder18 ?? [],
        client2ChildrenOver18: input.client2ChildrenOver18 ?? [],
        recommendationsJson: recommendations,
        aiRecommendationNarrative: narrative,
        aiClientEmailDraft: clientEmailDraft,
        status: "submitted" as const,
        emailSent: 0,
      };

      await db.insert(willInstructions).values(insertData);

      // Fetch the newly inserted record
      const [record] = await db
        .select()
        .from(willInstructions)
        .where(eq(willInstructions.referenceNumber, referenceNumber))
        .limit(1);

      // Generate PDF, upload to OneDrive, then send admin email with attachment + link (non-blocking)
      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await generateWillPdf(record);
      } catch (pdfErr) {
        console.error("[PDF] Failed to generate PDF for email attachment:", pdfErr);
      }

      const docContent = formatWillDocument(record);
      const filename = buildFilename(record);
      uploadToOneDrive(filename, docContent)
        .then(({ webUrl }) => {
          console.log(`[OneDrive] Uploaded ${filename} \u2192 ${webUrl}`);
          return sendAdminEmail(record, webUrl, pdfBuffer);
        })
        .catch(err => {
          console.error("[OneDrive] Upload failed, sending email without link:", err);
          sendAdminEmail(record, undefined, pdfBuffer).catch(e =>
            console.error("[Email] Failed to send admin notification:", e)
          );
        });

      // Send client confirmation email (non-blocking)
      sendClientConfirmationEmail(record).catch(e =>
        console.error("[ClientEmail] Failed to send client confirmation:", e)
      );

      // Send adviser confirmation email (non-blocking)
      sendAdviserConfirmationEmail(record).catch(e =>
        console.error("[AdviserEmail] Failed to send adviser confirmation:", e)
      );

      return { success: true, referenceNumber, id: record.id, recommendations, narrative, clientEmailDraft };
    }),

  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select({
        id: willInstructions.id,
        referenceNumber: willInstructions.referenceNumber,
        client1FirstName: willInstructions.client1FirstName,
        client1LastName: willInstructions.client1LastName,
        consultantName: willInstructions.consultantName,
        willType: willInstructions.willType,
        productsOrdered: willInstructions.productsOrdered,
        status: willInstructions.status,
        createdAt: willInstructions.createdAt,
      })
      .from(willInstructions)
      .orderBy(desc(willInstructions.createdAt));
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [record] = await db
        .select()
        .from(willInstructions)
        .where(eq(willInstructions.id, input.id))
        .limit(1);
      return record ?? null;
    }),

  getByRef: publicProcedure
    .input(z.object({ ref: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [record] = await db
        .select()
        .from(willInstructions)
        .where(eq(willInstructions.referenceNumber, input.ref))
        .limit(1);
      return record ?? null;
    }),

  // ─── Draft procedures ────────────────────────────────────────────────────

  saveDraft: publicProcedure
    .input(willInstructionInputSchema.extend({
      draftId: z.number().optional(),
      currentStep: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { draftId, currentStep, ...formData } = input;

      const draftData = {
        ...formData,
        productsOrdered: formData.productsOrdered ?? [],
        executors: formData.executors ?? [],
        reservedExecutors: formData.reservedExecutors ?? [],
        trustees: formData.trustees ?? [],
        guardians: formData.guardians ?? [],
        reservedGuardians: formData.reservedGuardians ?? [],
        beneficiaries: formData.beneficiaries ?? [],
        specificGifts: formData.specificGifts ?? [],
        client1Executors: formData.client1Executors ?? [],
        client1ReservedExecutors: formData.client1ReservedExecutors ?? [],
        client2Executors: formData.client2Executors ?? [],
        client2ReservedExecutors: formData.client2ReservedExecutors ?? [],
        client1Guardians: formData.client1Guardians ?? [],
        client1ReservedGuardians: formData.client1ReservedGuardians ?? [],
        client2Guardians: formData.client2Guardians ?? [],
        client2ReservedGuardians: formData.client2ReservedGuardians ?? [],
        client1Beneficiaries: formData.client1Beneficiaries ?? [],
        client2Beneficiaries: formData.client2Beneficiaries ?? [],
        client1SpecificGifts: formData.client1SpecificGifts ?? [],
        client2SpecificGifts: formData.client2SpecificGifts ?? [],
        client1ChildrenUnder18: formData.client1ChildrenUnder18 ?? [],
        client1ChildrenOver18: formData.client1ChildrenOver18 ?? [],
        client2ChildrenUnder18: formData.client2ChildrenUnder18 ?? [],
        client2ChildrenOver18: formData.client2ChildrenOver18 ?? [],
        status: "draft" as const,
        currentStep: currentStep ?? 1,
        emailSent: 0,
      };

      if (draftId) {
        // Update existing draft
        await db
          .update(willInstructions)
          .set({ ...draftData, updatedAt: new Date() })
          .where(eq(willInstructions.id, draftId));
        return { success: true, draftId };
      } else {
        // Create new draft with a reference number
        const referenceNumber = `GEP-DRAFT-${Date.now().toString(36).toUpperCase()}`;
        await db.insert(willInstructions).values({ ...draftData, referenceNumber });
        const [record] = await db
          .select({ id: willInstructions.id })
          .from(willInstructions)
          .where(eq(willInstructions.referenceNumber, referenceNumber))
          .limit(1);
        return { success: true, draftId: record?.id };
      }
    }),

  listDrafts: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select({
        id: willInstructions.id,
        referenceNumber: willInstructions.referenceNumber,
        client1FirstName: willInstructions.client1FirstName,
        client1LastName: willInstructions.client1LastName,
        client2FirstName: willInstructions.client2FirstName,
        client2LastName: willInstructions.client2LastName,
        consultantName: willInstructions.consultantName,
        willType: willInstructions.willType,
        currentStep: willInstructions.currentStep,
        updatedAt: willInstructions.updatedAt,
        createdAt: willInstructions.createdAt,
      })
      .from(willInstructions)
      .where(eq(willInstructions.status, "draft"))
      .orderBy(desc(willInstructions.updatedAt));
  }),

  getDraft: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [record] = await db
        .select()
        .from(willInstructions)
        .where(eq(willInstructions.id, input.id))
        .limit(1);
      if (!record || record.status !== "draft") return null;
      return record;
    }),

  deleteDraft: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(willInstructions)
        .where(eq(willInstructions.id, input.id));
      return { success: true };
    }),

  // Delete a submitted instruction (admin only)
  deleteSubmission: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(willInstructions)
        .where(eq(willInstructions.id, input.id));
      return { success: true };
    }),

  // Admin: full update of any submission
  updateSubmission: publicProcedure
    .input(willInstructionInputSchema.extend({
      id: z.number(),
      status: z.enum(["draft", "submitted", "processing", "complete", "cancelled"]).optional(),
      manualNeedsAssessment: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...formData } = input;

      const updateData = {
        ...formData,
        productsOrdered: formData.productsOrdered ?? undefined,
        executors: formData.executors ?? undefined,
        reservedExecutors: formData.reservedExecutors ?? undefined,
        trustees: formData.trustees ?? undefined,
        guardians: formData.guardians ?? undefined,
        reservedGuardians: formData.reservedGuardians ?? undefined,
        beneficiaries: formData.beneficiaries ?? undefined,
        specificGifts: formData.specificGifts ?? undefined,
        client1Executors: formData.client1Executors ?? undefined,
        client1ReservedExecutors: formData.client1ReservedExecutors ?? undefined,
        client2Executors: formData.client2Executors ?? undefined,
        client2ReservedExecutors: formData.client2ReservedExecutors ?? undefined,
        client1Guardians: formData.client1Guardians ?? undefined,
        client1ReservedGuardians: formData.client1ReservedGuardians ?? undefined,
        client2Guardians: formData.client2Guardians ?? undefined,
        client2ReservedGuardians: formData.client2ReservedGuardians ?? undefined,
        client1Beneficiaries: formData.client1Beneficiaries ?? undefined,
        client2Beneficiaries: formData.client2Beneficiaries ?? undefined,
        client1SpecificGifts: formData.client1SpecificGifts ?? undefined,
        client2SpecificGifts: formData.client2SpecificGifts ?? undefined,
        client1ChildrenUnder18: formData.client1ChildrenUnder18 ?? undefined,
        client1ChildrenOver18: formData.client1ChildrenOver18 ?? undefined,
        client2ChildrenUnder18: formData.client2ChildrenUnder18 ?? undefined,
        client2ChildrenOver18: formData.client2ChildrenOver18 ?? undefined,
        lifeInsurancePolicies: formData.lifeInsurancePolicies ?? undefined,
        businessInterestsDetails: formData.businessInterestsDetails ?? undefined,
        updatedAt: new Date(),
      };

      await db
        .update(willInstructions)
        .set(updateData)
        .where(eq(willInstructions.id, id));

      return { success: true };
    }),

  // Update status of a submitted instruction
  updateStatus: publicProcedure
    .input(z.object({ id: z.number(), status: z.enum(["submitted", "processing", "complete", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(willInstructions)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(willInstructions.id, input.id));
      return { success: true };
    }),
});

// ─── AI Recommendation Engine ────────────────────────────────────────────────

async function generateAIRecommendations(input: z.infer<typeof willInstructionInputSchema>) {
  const products = input.productsOrdered ?? [];
  const hasLPA = products.some(p => p.includes("lpa") || p.includes("both_lpas"));
  const hasPPT = products.includes("ppt");
  const hasAAT = products.includes("aat");
  const hasStorage = products.includes("storage");
  const hasVulnerableTrust = products.includes("vulnerable_trust");
  const isMirrorWill = products.includes("mirror_wills") || input.willType === "Mirror Wills";
  const isMarried = ["Married", "Civil Partnership", "Partner / Common Law Spouse"].includes(input.client1MaritalStatus ?? "");
  const ownsProperty = input.propertyOwned === "yes";
  const hasVulnerableBeneficiary = input.hasVulnerableBeneficiary === "yes";
  const hasCareConerns = input.careConcerns === "yes";

  const recommendations: Array<{ id: string; title: string; reason: string; priority: "high" | "medium" | "low" }> = [];

  if (!hasPPT && isMarried && ownsProperty && isMirrorWill) {
    recommendations.push({
      id: "ppt",
      title: "Protective Property Trust (PPT)",
      reason: `${input.client1FirstName} and their partner are married/in a partnership and own property. A PPT protects the property share of the first to die, ensuring it passes to the intended beneficiaries rather than being lost to a new partner or care fees.`,
      priority: "high",
    });
  }

  if (!hasAAT && ownsProperty) {
    recommendations.push({
      id: "aat",
      title: "Asset Allocation Trust (Family Trust / AAT)",
      reason: `With property ownership, an Asset Allocation Trust provides robust protection against care home fees, divorce of beneficiaries, and creditor claims — ensuring assets pass intact to the next generation.`,
      priority: "high",
    });
  }

  if (!hasLPA) {
    recommendations.push({
      id: "lpa",
      title: "Lasting Powers of Attorney (LPAs)",
      reason: `No LPA has been ordered. Without LPAs, if ${input.client1FirstName} loses mental capacity, family members would need to apply to the Court of Protection — a costly and lengthy process. Both Property & Finance and Health & Welfare LPAs are strongly recommended.`,
      priority: "high",
    });
  }

  if (!hasStorage) {
    recommendations.push({
      id: "storage",
      title: "Secure Will Storage",
      reason: `Storing the original Will with Genesis Wills and Estate Planning ensures it is safe, accessible, and cannot be lost, damaged, or contested. Without secure storage, a Will can be misplaced or destroyed.`,
      priority: "medium",
    });
  }

  if (hasVulnerableBeneficiary && !hasVulnerableTrust) {
    recommendations.push({
      id: "vulnerable_trust",
      title: "Vulnerable Person's Trust",
      reason: `A vulnerable beneficiary has been identified. A Vulnerable Person's Trust protects their inheritance from being used to disqualify them from means-tested benefits, and ensures a trusted person manages funds on their behalf.`,
      priority: "high",
    });
  }

  if (hasCareConerns && !hasAAT) {
    recommendations.push({
      id: "care_protection",
      title: "Care Protection Trust",
      reason: `Care cost concerns have been noted. A Care Protection Trust (via an Asset Allocation Trust) can help shield assets from local authority means-testing for care home fees, preserving wealth for beneficiaries.`,
      priority: "high",
    });
  }

  if (recommendations.length === 0) {
    return {
      recommendations,
      narrative: "The client's current instruction covers all key estate planning areas. No additional recommendations are required at this time.",
      clientEmailDraft: "",
    };
  }

  // Generate AI narrative and client email
  const clientName = `${input.client1Prefix ?? ""} ${input.client1FirstName} ${input.client1LastName}`.trim();
  const consultantName = input.consultantName ?? "your consultant";

  const prompt = `You are a senior estate planning advisor at Genesis Wills and Estate Planning. Based on the following client profile and identified recommendations, write two things:

1. An INTERNAL RECOMMENDATION NARRATIVE for the admin team (professional, detailed, 2-3 paragraphs).
2. A PROFESSIONAL CLIENT EMAIL DRAFT ready to be sent to the client (warm, clear, non-technical, signed by the consultant).

Client: ${clientName}
Marital Status: ${input.client1MaritalStatus ?? "Not specified"}
Property Owner: ${ownsProperty ? "Yes" : "No"}
Products Already Ordered: ${products.join(", ") || "None"}
Consultant: ${consultantName}

Recommendations to address:
${recommendations.map(r => `- ${r.title}: ${r.reason}`).join("\n")}

Format your response as valid JSON with keys: "narrative" (string) and "clientEmailDraft" (string).
The client email should:
- Open with a warm greeting using the client's name
- Briefly explain why each recommendation matters in plain English
- Invite the client to discuss further with their consultant
- Be signed by ${consultantName}, Genesis Wills and Estate Planning
- Be professional but approachable`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a senior estate planning advisor. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recommendations_output",
          strict: true,
          schema: {
            type: "object",
            properties: {
              narrative: { type: "string" },
              clientEmailDraft: { type: "string" },
            },
            required: ["narrative", "clientEmailDraft"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : null;
    if (content) {
      const parsed = JSON.parse(content);
      return { recommendations, narrative: parsed.narrative, clientEmailDraft: parsed.clientEmailDraft };
    }
  } catch (err) {
    console.error("[AI] Failed to generate recommendations:", err);
  }

  // Fallback narrative
  const fallbackNarrative = `Based on the instruction taken for ${clientName}, the following estate planning enhancements are recommended:\n\n${recommendations.map(r => `${r.title}: ${r.reason}`).join("\n\n")}`;
  const fallbackEmail = `Dear ${clientName},\n\nThank you for choosing Genesis Wills and Estate Planning. Following your recent consultation with ${consultantName}, we would like to bring some additional estate planning options to your attention that may be of significant benefit to you.\n\n${recommendations.map(r => `${r.title}: ${r.reason}`).join("\n\n")}\n\nWe would be delighted to discuss any of these options with you at your convenience. Please do not hesitate to contact us.\n\nYours sincerely,\n${consultantName}\nGenesis Wills and Estate Planning\n0330 118 0937`;

  return { recommendations, narrative: fallbackNarrative, clientEmailDraft: fallbackEmail };
}
