import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  listMatters,
  getMatterById,
  createMatter,
  updateMatter,
  deleteMatter,
  upsertClient,
  replaceExecutors,
  replaceGuardians,
  replaceBeneficiaries,
  upsertWishes,
  saveEditedWillHtml,
  clearEditedWillHtml,
} from "../mattersDb";

const personSchema = z.object({
  fullName: z.string().optional(),
  address: z.string().optional(),
});

const executorSchema = personSchema.extend({
  executorType: z.enum(["primary", "substitute"]).default("primary"),
});

const guardianSchema = personSchema.extend({
  guardianType: z.enum(["primary", "substitute"]).default("primary"),
});

const beneficiarySchema = personSchema.extend({
  beneficiaryType: z.enum(["primary", "fallback"]).default("primary"),
  relationship: z.string().optional(),
  shareFraction: z.string().optional(),
  includeIssue: z.number().int().min(0).max(1).default(1),
});

const wishesSchema = z.object({
  ageCondition: z.number().int().min(0).max(99).default(18),
  survivorshipDays: z.number().int().min(0).max(365).default(28),
  organDonation: z.number().int().min(0).max(1).default(0),
  organDonationText: z.string().optional(),
  funeralWishes: z.string().optional(),
  extraNotes: z.string().optional(),
  residueToSpouseFirst: z.number().int().min(0).max(1).default(1),
});

export const mattersRouter = router({
  list: protectedProcedure.query(async () => {
    return listMatters();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const matter = await getMatterById(input.id);
      if (!matter) throw new Error("Matter not found");
      return matter;
    }),

  create: protectedProcedure
    .input(z.object({
      matterType: z.enum(["single", "mirror"]),
      fileReference: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await createMatter({
        matterType: input.matterType,
        fileReference: input.fileReference ?? null,
        status: "draft",
      });
      return { id };
    }),

  updateMeta: protectedProcedure
    .input(z.object({
      id: z.number().int(),
      fileReference: z.string().optional(),
      status: z.enum(["draft", "complete"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateMatter(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await deleteMatter(input.id);
      return { success: true };
    }),

  saveClient: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      clientRole: z.enum(["testator1", "testator2"]),
      fullName: z.string().optional(),
      address: z.string().optional(),
      dateOfBirth: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { matterId, clientRole, ...data } = input;
      await upsertClient(matterId, clientRole, data);
      return { success: true };
    }),

  saveExecutors: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      clientRole: z.enum(["testator1", "testator2", "shared"]),
      executors: z.array(executorSchema),
    }))
    .mutation(async ({ input }) => {
      await replaceExecutors(input.matterId, input.clientRole, input.executors);
      return { success: true };
    }),

  saveGuardians: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      guardians: z.array(guardianSchema),
    }))
    .mutation(async ({ input }) => {
      await replaceGuardians(input.matterId, input.guardians);
      return { success: true };
    }),

  saveBeneficiaries: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      clientRole: z.enum(["testator1", "testator2", "shared"]),
      beneficiaries: z.array(beneficiarySchema),
    }))
    .mutation(async ({ input }) => {
      await replaceBeneficiaries(input.matterId, input.clientRole, input.beneficiaries);
      return { success: true };
    }),

  saveWishes: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      clientRole: z.enum(["testator1", "testator2", "shared"]),
      wishes: wishesSchema,
    }))
    .mutation(async ({ input }) => {
      await upsertWishes(input.matterId, input.clientRole, input.wishes);
      return { success: true };
    }),

  saveEditedWill: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      testatorRole: z.enum(["testator1", "testator2"]),
      html: z.string(),
    }))
    .mutation(async ({ input }) => {
      await saveEditedWillHtml(input.matterId, input.testatorRole, input.html);
      return { success: true };
    }),

  clearEditedWill: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      testatorRole: z.enum(["testator1", "testator2"]),
    }))
    .mutation(async ({ input }) => {
      await clearEditedWillHtml(input.matterId, input.testatorRole);
      return { success: true };
    }),
});
