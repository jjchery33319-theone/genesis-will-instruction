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

  // ── Transfer from Will Instruction to V2 Matter ──────────────────────────
  transferFromInstruction: protectedProcedure
    .input(z.object({ instructionId: z.number().int() }))
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const { willInstructions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const rows = await db.select().from(willInstructions).where(eq(willInstructions.id, input.instructionId)).limit(1);
      const ins = rows[0];
      if (!ins) throw new Error("Instruction not found");

      const isMirror = ins.willType === "mirror" || ins.willType === "mirrorWills";
      const matterType: "single" | "mirror" = isMirror ? "mirror" : "single";

      // Helper to build a full name from instruction client fields
      const fullName = (prefix: string | null | undefined, first: string | null | undefined, middle: string | null | undefined, last: string | null | undefined) =>
        [prefix, first, middle, last].filter(Boolean).join(" ").trim() || undefined;

      // Helper to build address string from instruction address fields
      const buildAddress = (line1: string | null | undefined, city: string | null | undefined, postcode: string | null | undefined) =>
        [line1, city, postcode].filter(Boolean).join(", ").trim() || undefined;

      // Helper to safely parse a JSON field that may already be an object/array
      const safeArr = <T>(v: unknown): T[] => {
        if (!v) return [];
        if (Array.isArray(v)) return v as T[];
        if (typeof v === "string") { try { return JSON.parse(v) as T[]; } catch { return []; } }
        return [];
      };

      // 1. Create the matter
      const matterId = await createMatter({
        matterType,
        fileReference: ins.referenceNumber ?? undefined,
        status: "draft",
      });

      // 2. Clients
      const c1Name = fullName(ins.client1Prefix, ins.client1FirstName, ins.client1MiddleName, ins.client1LastName);
      const c1Address = buildAddress(ins.client1AddressLine1, ins.client1City, ins.client1Postcode);
      await upsertClient(matterId, "testator1", {
        fullName: c1Name,
        address: c1Address,
        dateOfBirth: ins.client1Dob ?? undefined,
        email: ins.client1Email ?? undefined,
        phone: ins.client1Mobile ?? ins.client1DaytimePhone ?? undefined,
      });

      if (isMirror) {
        const c2Name = fullName(ins.client2Prefix, ins.client2FirstName, ins.client2MiddleName, ins.client2LastName);
        const c2Address = buildAddress(ins.client2AddressLine1, ins.client2City, ins.client2Postcode);
        await upsertClient(matterId, "testator2", {
          fullName: c2Name,
          address: c2Address,
          dateOfBirth: ins.client2Dob ?? undefined,
          email: ins.client2Email ?? undefined,
          phone: ins.client2Mobile ?? ins.client2DaytimePhone ?? undefined,
        });
      }

      // 3. Executors
      type PersonEntry = { name?: string; fullName?: string; address?: string };
      const toExecRows = (arr: PersonEntry[], type: "primary" | "substitute") =>
        arr.map(p => ({ fullName: p.fullName ?? p.name ?? "", address: p.address ?? "", executorType: type }));

      if (isMirror) {
        await replaceExecutors(matterId, "testator1", [
          ...toExecRows(safeArr<PersonEntry>(ins.client1Executors), "primary"),
          ...toExecRows(safeArr<PersonEntry>(ins.client1ReservedExecutors), "substitute"),
        ]);
        await replaceExecutors(matterId, "testator2", [
          ...toExecRows(safeArr<PersonEntry>(ins.client2Executors), "primary"),
          ...toExecRows(safeArr<PersonEntry>(ins.client2ReservedExecutors), "substitute"),
        ]);
      } else {
        await replaceExecutors(matterId, "shared", [
          ...toExecRows(safeArr<PersonEntry>(ins.executors), "primary"),
          ...toExecRows(safeArr<PersonEntry>(ins.reservedExecutors), "substitute"),
        ]);
      }

      // 4. Guardians
      type GuardianEntry = { name?: string; fullName?: string; address?: string };
      const toGuardianRows = (arr: GuardianEntry[], type: "primary" | "substitute") =>
        arr.map(p => ({ fullName: p.fullName ?? p.name ?? "", address: p.address ?? "", guardianType: type }));

      if (isMirror) {
        const allGuards = [
          ...toGuardianRows(safeArr<GuardianEntry>(ins.client1Guardians), "primary"),
          ...toGuardianRows(safeArr<GuardianEntry>(ins.client1ReservedGuardians), "substitute"),
          ...toGuardianRows(safeArr<GuardianEntry>(ins.client2Guardians), "primary"),
          ...toGuardianRows(safeArr<GuardianEntry>(ins.client2ReservedGuardians), "substitute"),
        ];
        await replaceGuardians(matterId, allGuards);
      } else {
        await replaceGuardians(matterId, [
          ...toGuardianRows(safeArr<GuardianEntry>(ins.guardians), "primary"),
          ...toGuardianRows(safeArr<GuardianEntry>(ins.reservedGuardians), "substitute"),
        ]);
      }

      // 5. Beneficiaries
      type BenEntry = { name?: string; fullName?: string; address?: string; relationship?: string; share?: string };
      const toBenRows = (arr: BenEntry[], type: "primary" | "fallback") =>
        arr.map(p => ({
          fullName: p.fullName ?? p.name ?? "",
          address: p.address ?? "",
          relationship: p.relationship ?? "",
          shareFraction: p.share ?? "",
          beneficiaryType: type,
          includeIssue: 1,
        }));

      if (isMirror) {
        await replaceBeneficiaries(matterId, "testator1", toBenRows(safeArr<BenEntry>(ins.client1Beneficiaries), "primary"));
        await replaceBeneficiaries(matterId, "testator2", toBenRows(safeArr<BenEntry>(ins.client2Beneficiaries), "primary"));
      } else {
        await replaceBeneficiaries(matterId, "shared", toBenRows(safeArr<BenEntry>(ins.beneficiaries), "primary"));
      }

      // 6. Gifts
      type GiftEntry = { recipient?: string; recipientName?: string; recipientAddress?: string; description?: string; giftDescription?: string; type?: string; giftType?: string };
      const toGiftRows = (arr: GiftEntry[]) =>
        arr.map(g => ({
          recipientName: g.recipientName ?? g.recipient ?? "",
          recipientAddress: g.recipientAddress ?? "",
          giftDescription: g.giftDescription ?? g.description ?? "",
          giftType: (g.giftType ?? g.type ?? "asset") as "monetary" | "asset" | "residue",
        }));

      if (isMirror) {
        await replaceGifts(matterId, "testator1", toGiftRows(safeArr<GiftEntry>(ins.client1SpecificGifts)));
        await replaceGifts(matterId, "testator2", toGiftRows(safeArr<GiftEntry>(ins.client2SpecificGifts)));
      } else {
        await replaceGifts(matterId, "shared", toGiftRows(safeArr<GiftEntry>(ins.specificGifts)));
      }

      // 7. Property
      if (ins.propertyAddress) {
        const ownershipMap: Record<string, "sole" | "joint_tenants" | "tenants_in_common"> = {
          sole: "sole",
          joint: "joint_tenants",
          joint_tenants: "joint_tenants",
          tenants_in_common: "tenants_in_common",
        };
        const ownershipType = ownershipMap[ins.propertyOwnership ?? ""] ?? "sole";
        await replaceProperty(matterId, [{
          address: ins.propertyAddress,
          ownershipType,
          mortgageOutstanding: ins.mortgageOutstanding === "yes" ? 1 : 0,
          mortgageLender: ins.mortgageLender ?? undefined,
        }]);
      }

      // 8. Wishes
      const buildWishes = (funeralType: string | null | undefined, funeralWishes: string | null | undefined, organDonation: string | null | undefined, notes: string | null | undefined) => ({
        funeralWishes: [funeralType, funeralWishes].filter(Boolean).join(" — ") || undefined,
        organDonation: organDonation === "yes" ? 1 : 0,
        extraNotes: notes ?? undefined,
      });

      if (isMirror) {
        await upsertWishes(matterId, "testator1", buildWishes(ins.client1FuneralType, ins.client1FuneralWishes, ins.client1OrganDonation, ins.disasterClauseNotes));
        await upsertWishes(matterId, "testator2", buildWishes(ins.client2FuneralType, ins.client2FuneralWishes, ins.client2OrganDonation, ins.disasterClauseNotes));
      } else {
        await upsertWishes(matterId, "shared", buildWishes(ins.funeralType, ins.funeralWishes, ins.organDonation, ins.disasterClauseNotes ?? ins.additionalNotes ?? ins.specialNotes));
      }

      // 9. Seed the People Pool with all named people
      type PoolEntry = { fullName: string; address?: string; dateOfBirth?: string; sourceRole?: string };
      const poolPeople: PoolEntry[] = [];
      if (c1Name) poolPeople.push({ fullName: c1Name, address: c1Address, dateOfBirth: ins.client1Dob ?? undefined, sourceRole: "testator1" });
      if (isMirror) {
        const c2Name2 = fullName(ins.client2Prefix, ins.client2FirstName, ins.client2MiddleName, ins.client2LastName);
        const c2Address2 = buildAddress(ins.client2AddressLine1, ins.client2City, ins.client2Postcode);
        if (c2Name2) poolPeople.push({ fullName: c2Name2, address: c2Address2, dateOfBirth: ins.client2Dob ?? undefined, sourceRole: "testator2" });
      }
      const addToPool = (arr: PersonEntry[], role: string) => arr.forEach(p => {
        const n = p.fullName ?? p.name ?? "";
        if (n) poolPeople.push({ fullName: n, address: p.address ?? undefined, sourceRole: role });
      });
      addToPool(safeArr(isMirror ? ins.client1Executors : ins.executors), "executor");
      if (isMirror) addToPool(safeArr(ins.client2Executors), "executor");
      addToPool(safeArr(isMirror ? ins.client1Guardians : ins.guardians), "guardian");
      if (isMirror) addToPool(safeArr(ins.client2Guardians), "guardian");
      addToPool(safeArr(isMirror ? ins.client1Beneficiaries : ins.beneficiaries), "beneficiary");
      if (isMirror) addToPool(safeArr(ins.client2Beneficiaries), "beneficiary");

      const seen = new Set<string>();
      for (const p of poolPeople) {
        if (!p.fullName || seen.has(p.fullName)) continue;
        seen.add(p.fullName);
        await upsertPersonPool(matterId, p);
      }

      return { matterId };
    }),
});
