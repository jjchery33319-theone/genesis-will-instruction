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
  replaceGifts,
  replacePets,
  replaceProperty,
  replaceBusiness,
  saveEditedWillHtml,
  clearEditedWillHtml,
  replaceTrustClauses,
  listExclusions,
  upsertExclusion,
  deleteExclusion,
  getLetterOfWishes,
  upsertLetterOfWishes,
  listPeoplePool,
  upsertPersonPool,
  deletePersonPool,
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
  hasMinorChildren: z.number().int().min(0).max(1).default(1),
  disasterClauseNotes: z.string().optional(),
  generalNotes: z.string().optional(),
});

const giftSchema = z.object({
  recipientName: z.string().optional(),
  recipientAddress: z.string().optional(),
  giftDescription: z.string().optional(),
  giftType: z.enum(["monetary", "asset", "residue"]).default("asset"),
});

const petSchema = z.object({
  petName: z.string().optional(),
  petType: z.string().optional(),
  carerName: z.string().optional(),
  carerAddress: z.string().optional(),
  careNotes: z.string().optional(),
});

const propertySchema = z.object({
  address: z.string().optional(),
  ownershipType: z.enum(["sole", "joint_tenants", "tenants_in_common"]).default("sole"),
  mortgageOutstanding: z.number().int().min(0).max(1).default(0),
  mortgageLender: z.string().optional(),
  propertyNotes: z.string().optional(),
});

const businessSchema = z.object({
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  sharePercentage: z.string().optional(),
  businessNotes: z.string().optional(),
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

  saveGifts: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      clientRole: z.enum(["testator1", "testator2", "shared"]),
      gifts: z.array(giftSchema),
    }))
    .mutation(async ({ input }) => {
      await replaceGifts(input.matterId, input.clientRole, input.gifts);
      return { success: true };
    }),

  savePets: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      pets: z.array(petSchema),
    }))
    .mutation(async ({ input }) => {
      await replacePets(input.matterId, input.pets);
      return { success: true };
    }),

  saveProperty: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      properties: z.array(propertySchema),
    }))
    .mutation(async ({ input }) => {
      await replaceProperty(input.matterId, input.properties);
      return { success: true };
    }),

  saveBusiness: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      businesses: z.array(businessSchema),
    }))
    .mutation(async ({ input }) => {
      await replaceBusiness(input.matterId, input.businesses);
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

  saveTrustClauses: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      clientRole: z.string().default("shared"),
      clauses: z.array(z.object({
        trustType: z.string(),
        enabled: z.number().int().min(0).max(1).default(0),
        trustees: z.array(z.object({ name: z.string(), address: z.string() })).optional(),
        lifeTenants: z.array(z.object({ name: z.string(), address: z.string() })).optional(),
        beneficiaries: z.array(z.object({ name: z.string(), relationship: z.string() })).optional(),
        propertyAddress: z.string().optional(),
        sharePercentage: z.string().optional(),
        namedBeneficiary: z.string().optional(),
        namedBeneficiaryDisability: z.string().optional(),
        ageVesting: z.number().int().optional(),
        notes: z.string().optional(),
        terminateDeath: z.number().int().min(0).max(1).optional(),
        terminateRemarriage: z.number().int().min(0).max(1).optional(),
        terminateCohabitation: z.number().int().min(0).max(1).optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      await replaceTrustClauses(input.matterId, input.clientRole, input.clauses);
      return { success: true };
    }),

  // ── Exclusions ──────────────────────────────────────────────────────────────────
  listExclusions: protectedProcedure
    .input(z.object({ matterId: z.number().int() }))
    .query(async ({ input }) => {
      return listExclusions(input.matterId);
    }),

  upsertExclusion: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      id: z.number().int().optional(),
      clientRole: z.enum(["testator1", "testator2"]).default("testator1"),
      fullName: z.string().default(""),
      relationship: z.string().default(""),
      reasonPreset: z.string().optional(),
      reasonCustom: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { matterId, ...data } = input;
      const id = await upsertExclusion(matterId, data);
      return { id };
    }),

  deleteExclusion: protectedProcedure
    .input(z.object({
      id: z.number().int(),
      matterId: z.number().int(),
    }))
    .mutation(async ({ input }) => {
      await deleteExclusion(input.id, input.matterId);
      return { success: true };
    }),

  // ── Letter of Wishes ─────────────────────────────────────────────────────────────────
  getLetterOfWishes: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      clientRole: z.enum(["testator1", "testator2"]),
    }))
    .query(async ({ input }) => {
      return getLetterOfWishes(input.matterId, input.clientRole);
    }),

  upsertLetterOfWishes: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      clientRole: z.enum(["testator1", "testator2"]),
      content: z.string(),
    }))
    .mutation(async ({ input }) => {
      await upsertLetterOfWishes(input.matterId, input.clientRole, input.content);
      return { success: true };
    }),

  // ── People Pool ────────────────────────────────────────────────────────────────────
  listPeoplePool: protectedProcedure
    .input(z.object({ matterId: z.number().int() }))
    .query(async ({ input }) => listPeoplePool(input.matterId)),

  upsertPersonPool: protectedProcedure
    .input(z.object({
      matterId: z.number().int(),
      id: z.number().int().optional(),
      fullName: z.string(),
      dateOfBirth: z.string().optional(),
      address: z.string().optional(),
      relationship: z.string().optional(),
      sourceRole: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { matterId, ...data } = input;
      const id = await upsertPersonPool(matterId, data);
      return { id };
    }),

  deletePersonPool: protectedProcedure
    .input(z.object({ id: z.number().int(), matterId: z.number().int() }))
    .mutation(async ({ input }) => {
      await deletePersonPool(input.id, input.matterId);
      return { success: true };
    }),
});
