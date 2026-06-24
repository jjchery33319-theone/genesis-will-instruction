import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { lpaRecords, willInstructions, matters, matterClients, matterExecutors, matterGuardians, matterBeneficiaries, matterWishes } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ── Shared person schema ──────────────────────────────────────────────────────
const lpaPersonSchema = z.object({
  title: z.string().optional(),
  firstNames: z.string().optional(),
  lastName: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  postcode: z.string().optional(),
  email: z.string().optional(),
  isTrustCorporation: z.boolean().optional(),
});

const notifyPersonSchema = z.object({
  title: z.string().optional(),
  firstNames: z.string().optional(),
  lastName: z.string().optional(),
  address: z.string().optional(),
  postcode: z.string().optional(),
});

// ── Input schema ─────────────────────────────────────────────────────────────
const lpaInputSchema = z.object({
  willInstructionId: z.number().default(0),
  matterId: z.number().optional(),
  clientNumber: z.number().min(1).max(2).default(1),
  lpaType: z.enum(["property_finance", "health_welfare"]),

  // Donor
  donorTitle: z.string().optional(),
  donorFirstNames: z.string().optional(),
  donorLastName: z.string().optional(),
  donorOtherNames: z.string().optional(),
  donorDob: z.string().optional(),
  donorAddress: z.string().optional(),
  donorPostcode: z.string().optional(),
  donorEmail: z.string().optional(),

  // Attorneys
  attorneys: z.array(lpaPersonSchema).optional(),
  replacementAttorneys: z.array(lpaPersonSchema).optional(),

  // Decision type
  attorneyDecisionType: z.string().optional(),  // "single" | "jointly_severally" | "jointly" | "jointly_some" | ""
  attorneyDecisionDetails: z.string().optional(),
  replacementDecisionDetails: z.string().optional(),

  // Certificate provider
  certProviderTitle: z.string().optional(),
  certProviderFirstNames: z.string().optional(),
  certProviderLastName: z.string().optional(),
  certProviderAddress: z.string().optional(),
  certProviderPostcode: z.string().optional(),
  certProviderEmail: z.string().optional(),

  // People to notify
  peopleToNotify: z.array(notifyPersonSchema).optional(),

  // LP1H specific
  lifeSustainingTreatment: z.string().optional(),  // "give_authority" | "do_not_give" | ""

  // LP1F specific
  whenAttorneysCanAct: z.string().optional(),  // "capacity" | "whenever" | ""

  // Preferences & instructions
  preferences: z.string().optional(),
  instructions: z.string().optional(),

  // Section 12: who is applying to register
  applicantType: z.string().optional(),  // 'donor' | 'attorneys'

  // Section 13: who receives the LPA
  recipientType: z.string().optional(),  // 'donor' | 'attorney' | 'other'
  recipientTitle: z.string().optional(),
  recipientFirstNames: z.string().optional(),
  recipientLastName: z.string().optional(),
  recipientCompany: z.string().optional(),
  recipientAddressLine1: z.string().optional(),
  recipientAddressLine2: z.string().optional(),
  recipientAddressLine3: z.string().optional(),
  recipientPostcode: z.string().optional(),
  deliveryPost: z.boolean().optional(),
  deliveryPhone: z.boolean().optional(),
  deliveryEmail: z.boolean().optional(),
  deliveryWelsh: z.boolean().optional(),

  // Section 14: application fee
  feePaymentMethod: z.string().optional(),  // 'card' | 'cheque'
  feeContactPhone: z.string().optional(),
  reducedFee: z.boolean().optional(),
  repeatApplication: z.boolean().optional(),
  caseNumber: z.string().optional(),

  status: z.enum(["draft", "complete"]).optional(),
});

// ── Helper: check admin ───────────────────────────────────────────────────────
function requireAdmin(role: string | undefined) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
}

// ── Router ────────────────────────────────────────────────────────────────────
export const lpaRouter = router({
  // List all LPAs for a submission
  listBySubmission: protectedProcedure
    .input(z.object({ willInstructionId: z.number() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const records = await db
        .select()
        .from(lpaRecords)
        .where(eq(lpaRecords.willInstructionId, input.willInstructionId));
      return records;
    }),

  // Get a single LPA record
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [record] = await db
        .select()
        .from(lpaRecords)
        .where(eq(lpaRecords.id, input.id));
      if (!record) throw new TRPCError({ code: "NOT_FOUND" });
      return record;
    }),

  // Create a new LPA record
  create: protectedProcedure
    .input(lpaInputSchema)
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db.insert(lpaRecords).values({
        willInstructionId: input.willInstructionId,
        matterId: input.matterId ?? null,
        clientNumber: input.clientNumber,
        lpaType: input.lpaType,
        donorTitle: input.donorTitle,
        donorFirstNames: input.donorFirstNames,
        donorLastName: input.donorLastName,
        donorOtherNames: input.donorOtherNames,
        donorDob: input.donorDob,
        donorAddress: input.donorAddress,
        donorPostcode: input.donorPostcode,
        donorEmail: input.donorEmail,
        attorneys: input.attorneys ?? [],
        replacementAttorneys: input.replacementAttorneys ?? [],
        attorneyDecisionType: input.attorneyDecisionType,
        attorneyDecisionDetails: input.attorneyDecisionDetails,
        replacementDecisionDetails: input.replacementDecisionDetails,
        certProviderTitle: input.certProviderTitle,
        certProviderFirstNames: input.certProviderFirstNames,
        certProviderLastName: input.certProviderLastName,
        certProviderAddress: input.certProviderAddress,
        certProviderPostcode: input.certProviderPostcode,
        certProviderEmail: input.certProviderEmail,
        peopleToNotify: input.peopleToNotify ?? [],
        lifeSustainingTreatment: input.lifeSustainingTreatment,
        whenAttorneysCanAct: input.whenAttorneysCanAct,
        preferences: input.preferences,
        instructions: input.instructions,
        status: input.status ?? "draft",
        applicantType: input.applicantType,
        recipientType: input.recipientType,
        recipientTitle: input.recipientTitle,
        recipientFirstNames: input.recipientFirstNames,
        recipientLastName: input.recipientLastName,
        recipientCompany: input.recipientCompany,
        recipientAddressLine1: input.recipientAddressLine1,
        recipientAddressLine2: input.recipientAddressLine2,
        recipientAddressLine3: input.recipientAddressLine3,
        recipientPostcode: input.recipientPostcode,
        deliveryPost: input.deliveryPost ? 1 : 0,
        deliveryPhone: input.deliveryPhone ? 1 : 0,
        deliveryEmail: input.deliveryEmail ? 1 : 0,
        deliveryWelsh: input.deliveryWelsh ? 1 : 0,
        feePaymentMethod: input.feePaymentMethod,
        feeContactPhone: input.feeContactPhone,
        reducedFee: input.reducedFee ? 1 : 0,
        repeatApplication: input.repeatApplication ? 1 : 0,
        caseNumber: input.caseNumber,
      });
      return { success: true };
    }),

  // Update an existing LPA record
  update: protectedProcedure
    .input(lpaInputSchema.extend({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const { id, willInstructionId, clientNumber, lpaType, ...rest } = input;
      await db
        .update(lpaRecords)
        .set({
          donorTitle: rest.donorTitle,
          donorFirstNames: rest.donorFirstNames,
          donorLastName: rest.donorLastName,
          donorOtherNames: rest.donorOtherNames,
          donorDob: rest.donorDob,
          donorAddress: rest.donorAddress,
          donorPostcode: rest.donorPostcode,
          donorEmail: rest.donorEmail,
          attorneys: rest.attorneys ?? [],
          replacementAttorneys: rest.replacementAttorneys ?? [],
          attorneyDecisionType: rest.attorneyDecisionType,
          attorneyDecisionDetails: rest.attorneyDecisionDetails,
          replacementDecisionDetails: rest.replacementDecisionDetails,
          certProviderTitle: rest.certProviderTitle,
          certProviderFirstNames: rest.certProviderFirstNames,
          certProviderLastName: rest.certProviderLastName,
          certProviderAddress: rest.certProviderAddress,
          certProviderPostcode: rest.certProviderPostcode,
          certProviderEmail: rest.certProviderEmail,
          peopleToNotify: rest.peopleToNotify ?? [],
          lifeSustainingTreatment: rest.lifeSustainingTreatment,
          whenAttorneysCanAct: rest.whenAttorneysCanAct,
          preferences: rest.preferences,
          instructions: rest.instructions,
          status: rest.status ?? "draft",
          applicantType: rest.applicantType,
          recipientType: rest.recipientType,
          recipientTitle: rest.recipientTitle,
          recipientFirstNames: rest.recipientFirstNames,
          recipientLastName: rest.recipientLastName,
          recipientCompany: rest.recipientCompany,
          recipientAddressLine1: rest.recipientAddressLine1,
          recipientAddressLine2: rest.recipientAddressLine2,
          recipientAddressLine3: rest.recipientAddressLine3,
          recipientPostcode: rest.recipientPostcode,
          deliveryPost: rest.deliveryPost ? 1 : 0,
          deliveryPhone: rest.deliveryPhone ? 1 : 0,
          deliveryEmail: rest.deliveryEmail ? 1 : 0,
          deliveryWelsh: rest.deliveryWelsh ? 1 : 0,
          feePaymentMethod: rest.feePaymentMethod,
          feeContactPhone: rest.feeContactPhone,
          reducedFee: rest.reducedFee ? 1 : 0,
          repeatApplication: rest.repeatApplication ? 1 : 0,
          caseNumber: rest.caseNumber,
        })
        .where(eq(lpaRecords.id, id));
      return { success: true };
    }),

  // Delete an LPA record
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db.delete(lpaRecords).where(eq(lpaRecords.id, input.id));
      return { success: true };
    }),

  // List LPAs linked to a V2 matter
  listByMatter: protectedProcedure
    .input(z.object({ matterId: z.number() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const records = await db
        .select()
        .from(lpaRecords)
        .where(eq(lpaRecords.matterId, input.matterId));
      return records;
    }),

  // Create pre-filled LPA records from a V2 matter's client data
  createFromMatter: protectedProcedure
    .input(z.object({
      matterId: z.number(),
      // Which LPA types to create: pf = Property & Finance, hw = Health & Welfare
      createPF: z.boolean().default(true),
      createHW: z.boolean().default(true),
      // Which clients to create for (testator1, testator2, or both for mirror)
      clients: z.array(z.enum(["testator1", "testator2"])).min(1),
      // When true, copy the matter's executors into the LPA attorney fields
      useExecutorsAsAttorneys: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Load matter + clients + executors
      const [matter] = await db.select().from(matters).where(eq(matters.id, input.matterId));
      if (!matter) throw new TRPCError({ code: "NOT_FOUND", message: "Matter not found" });

      const clients = await db.select().from(matterClients).where(eq(matterClients.matterId, input.matterId));
      const executors = await db.select().from(matterExecutors).where(eq(matterExecutors.matterId, input.matterId));

      // We need a willInstructionId placeholder — use 0 for matter-sourced LPAs
      // (the UI will navigate to the LPA manager where matter_id is the key)
      const MATTER_PLACEHOLDER_WI_ID = 0;

      const created: number[] = [];

      for (const clientRole of input.clients) {
        const clientNum = clientRole === "testator1" ? 1 : 2;
        const client = clients.find(c => c.clientRole === clientRole);
        if (!client) continue;

        // Build attorney list from executors for this client (or shared)
        const clientExecs = executors.filter(e =>
          e.clientRole === clientRole || e.clientRole === "shared"
        );
        const attorneys = input.useExecutorsAsAttorneys
          ? clientExecs
              .filter(e => e.executorType === "primary")
              .map(e => ({ firstNames: e.fullName, lastName: "", address: e.address ?? "" }))
          : [];
        const replacementAttorneys = input.useExecutorsAsAttorneys
          ? clientExecs
              .filter(e => e.executorType === "substitute")
              .map(e => ({ firstNames: e.fullName, lastName: "", address: e.address ?? "" }))
          : [];

        // Parse name parts (fullName may be "Title FirstName LastName")
        const nameParts = (client.fullName ?? "").trim().split(/\s+/);
        const donorFirstNames = nameParts.slice(0, -1).join(" ") || client.fullName || "";
        const donorLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
        const donorAddress = client.address ?? "";
        const donorPostcode = "";
        const donorDob = client.dateOfBirth ?? "";
        const donorEmail = client.email ?? "";

        const lpaTypes: Array<"property_finance" | "health_welfare"> = [];
        if (input.createPF) lpaTypes.push("property_finance");
        if (input.createHW) lpaTypes.push("health_welfare");

        for (const lpaType of lpaTypes) {
          const result = await db.insert(lpaRecords).values({
            willInstructionId: MATTER_PLACEHOLDER_WI_ID,
            matterId: input.matterId,
            clientNumber: clientNum,
            lpaType,
            donorFirstNames,
            donorLastName,
            donorDob,
            donorAddress,
            donorPostcode,
            donorEmail,
            attorneys,
            replacementAttorneys,
            status: "draft",
          });
          created.push((result as any).insertId ?? 0);
        }
      }

      return { success: true, created };
    }),

  // Import a V1 will_instruction submission into a new V2 matter
  importFromV1: protectedProcedure
    .input(z.object({ willInstructionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user?.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Load the V1 submission
      const [sub] = await db.select().from(willInstructions).where(eq(willInstructions.id, input.willInstructionId));
      if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });

      // Determine matter type from products ordered
      const products = Array.isArray(sub.productsOrdered) ? sub.productsOrdered as string[] : [];
      const isMirror = products.some(p => typeof p === "string" && p.toLowerCase().includes("mirror")) ||
        sub.willType?.toLowerCase().includes("mirror") ||
        !!(sub.client2FirstName);
      const matterType = isMirror ? "mirror" : "single";

      // Create the matter
      const matterResult = await db.insert(matters).values({
        matterType,
        fileReference: sub.referenceNumber ?? `V1-${sub.id}`,
        status: "draft",
      });
      const matterId = (matterResult as any).insertId as number;

      // Create client records
      const c1Name = [
        sub.client1Prefix,
        sub.client1FirstName,
        sub.client1MiddleName,
        sub.client1LastName,
      ].filter(Boolean).join(" ").trim();

      const c1Address = [
        sub.client1AddressLine1,
        sub.client1City,
        sub.client1Postcode,
      ].filter(Boolean).join(", ");

      await db.insert(matterClients).values({
        matterId,
        clientRole: "testator1",
        fullName: c1Name || "Client 1",
        address: c1Address || null,
        dateOfBirth: sub.client1Dob || null,
        email: sub.client1Email || null,
        phone: sub.client1DaytimePhone || sub.client1Mobile || null,
      });

      if (isMirror && sub.client2FirstName) {
        const c2Name = [
          sub.client2Prefix,
          sub.client2FirstName,
          sub.client2MiddleName,
          sub.client2LastName,
        ].filter(Boolean).join(" ").trim();

        const c2Address = [
          sub.client2AddressLine1,
          sub.client2City,
          sub.client2Postcode,
        ].filter(Boolean).join(", ");

        await db.insert(matterClients).values({
          matterId,
          clientRole: "testator2",
          fullName: c2Name || "Client 2",
          address: c2Address || null,
          dateOfBirth: sub.client2Dob || null,
          email: sub.client2Email || null,
          phone: sub.client2DaytimePhone || sub.client2Mobile || null,
        });
      }

      // Import executors (client1)
      const c1Execs = Array.isArray(sub.client1Executors) ? sub.client1Executors as any[] : [];
      const c1ResExecs = Array.isArray(sub.client1ReservedExecutors) ? sub.client1ReservedExecutors as any[] : [];
      for (let i = 0; i < c1Execs.length; i++) {
        const e = c1Execs[i];
        await db.insert(matterExecutors).values({
          matterId,
          clientRole: "testator1",
          executorType: "primary",
          sortOrder: i,
          fullName: [e.title, e.firstName, e.lastName].filter(Boolean).join(" ") || e.name || "",
          address: e.address || null,
        });
      }
      for (let i = 0; i < c1ResExecs.length; i++) {
        const e = c1ResExecs[i];
        await db.insert(matterExecutors).values({
          matterId,
          clientRole: "testator1",
          executorType: "substitute",
          sortOrder: i,
          fullName: [e.title, e.firstName, e.lastName].filter(Boolean).join(" ") || e.name || "",
          address: e.address || null,
        });
      }

      // Import executors (client2) if mirror
      if (isMirror) {
        const c2Execs = Array.isArray(sub.client2Executors) ? sub.client2Executors as any[] : [];
        const c2ResExecs = Array.isArray(sub.client2ReservedExecutors) ? sub.client2ReservedExecutors as any[] : [];
        for (let i = 0; i < c2Execs.length; i++) {
          const e = c2Execs[i];
          await db.insert(matterExecutors).values({
            matterId,
            clientRole: "testator2",
            executorType: "primary",
            sortOrder: i,
            fullName: [e.title, e.firstName, e.lastName].filter(Boolean).join(" ") || e.name || "",
            address: e.address || null,
          });
        }
        for (let i = 0; i < c2ResExecs.length; i++) {
          const e = c2ResExecs[i];
          await db.insert(matterExecutors).values({
            matterId,
            clientRole: "testator2",
            executorType: "substitute",
            sortOrder: i,
            fullName: [e.title, e.firstName, e.lastName].filter(Boolean).join(" ") || e.name || "",
            address: e.address || null,
          });
        }
      }

      // Import guardians
      const guardians = Array.isArray(sub.client1Guardians) ? sub.client1Guardians as any[] : [];
      const resGuardians = Array.isArray(sub.client1ReservedGuardians) ? sub.client1ReservedGuardians as any[] : [];
      for (let i = 0; i < guardians.length; i++) {
        const g = guardians[i];
        await db.insert(matterGuardians).values({
          matterId,
          guardianType: "primary",
          sortOrder: i,
          fullName: [g.title, g.firstName, g.lastName].filter(Boolean).join(" ") || g.name || "",
          address: g.address || null,
        });
      }
      for (let i = 0; i < resGuardians.length; i++) {
        const g = resGuardians[i];
        await db.insert(matterGuardians).values({
          matterId,
          guardianType: "substitute",
          sortOrder: i,
          fullName: [g.title, g.firstName, g.lastName].filter(Boolean).join(" ") || g.name || "",
          address: g.address || null,
        });
      }

      // Import beneficiaries (client1)
      const c1Bens = Array.isArray(sub.client1Beneficiaries) ? sub.client1Beneficiaries as any[] : [];
      for (let i = 0; i < c1Bens.length; i++) {
        const b = c1Bens[i];
        await db.insert(matterBeneficiaries).values({
          matterId,
          clientRole: "testator1",
          beneficiaryType: "primary",
          sortOrder: i,
          fullName: [b.title, b.firstName, b.lastName].filter(Boolean).join(" ") || b.name || "",
          relationship: b.relationship || null,
          shareFraction: b.share || null,
          includeIssue: 0,
        });
      }

      // Import beneficiaries (client2) if mirror
      if (isMirror) {
        const c2Bens = Array.isArray(sub.client2Beneficiaries) ? sub.client2Beneficiaries as any[] : [];
        for (let i = 0; i < c2Bens.length; i++) {
          const b = c2Bens[i];
          await db.insert(matterBeneficiaries).values({
            matterId,
            clientRole: "testator2",
            beneficiaryType: "primary",
            sortOrder: i,
            fullName: [b.title, b.firstName, b.lastName].filter(Boolean).join(" ") || b.name || "",
            relationship: b.relationship || null,
            shareFraction: b.share || null,
            includeIssue: 0,
          });
        }
      }

      // Import wishes (client1)
      await db.insert(matterWishes).values({
        matterId,
        clientRole: "testator1",
        ageCondition: parseInt(sub.client1ChildrenBenefitAge ?? "18", 10) || 18,
        survivorshipDays: 28,
        organDonation: sub.client1OrganDonation === "yes" ? 1 : 0,
        organDonationText: null,
        funeralWishes: sub.client1FuneralWishes || null,
        extraNotes: null,
        residueToSpouseFirst: isMirror ? 1 : 0,
        hasMinorChildren: sub.client1HasChildren === "yes" ? 1 : 0,
        disasterClauseNotes: sub.disasterClauseClient1 || sub.disasterClauseNotes || null,
        generalNotes: sub.additionalNotes || sub.specialNotes || null,
      });

      if (isMirror) {
        await db.insert(matterWishes).values({
          matterId,
          clientRole: "testator2",
          ageCondition: parseInt(sub.client2ChildrenBenefitAge ?? "18", 10) || 18,
          survivorshipDays: 28,
          organDonation: sub.client2OrganDonation === "yes" ? 1 : 0,
          organDonationText: null,
          funeralWishes: sub.client2FuneralWishes || null,
          extraNotes: null,
          residueToSpouseFirst: 1,
          hasMinorChildren: sub.client2HasChildren === "yes" ? 1 : 0,
          disasterClauseNotes: sub.disasterClauseClient2 || null,
          generalNotes: null,
        });
      }

      return { success: true, matterId, matterType };
    }),
});
