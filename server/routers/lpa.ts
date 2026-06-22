import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { lpaRecords } from "../../drizzle/schema";
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
  willInstructionId: z.number(),
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
  attorneyDecisionType: z.enum(["single", "jointly_severally", "jointly", "jointly_some"]).optional(),
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
  lifeSustainingTreatment: z.enum(["give_authority", "do_not_give"]).optional(),

  // LP1F specific
  whenAttorneysCanAct: z.enum(["capacity", "whenever"]).optional(),

  // Preferences & instructions
  preferences: z.string().optional(),
  instructions: z.string().optional(),

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
});
