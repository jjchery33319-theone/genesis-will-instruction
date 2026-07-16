import { getDb } from "./db";
import {
  matters,
  matterClients,
  matterExecutors,
  matterGuardians,
  matterBeneficiaries,
  matterWishes,
  matterGifts,
  matterPets,
  matterProperty,
  matterBusiness,
  matterTrustClauses,
  type Matter,
  type MatterClient,
  type MatterExecutor,
  type MatterGuardian,
  type MatterBeneficiary,
  type MatterWishes,
  type MatterGift,
  type MatterPet,
  type MatterPropertyRecord,
  type MatterBusinessRecord,
  type MatterTrustClause,
  type InsertMatter,
  type InsertMatterClient,
  type InsertMatterExecutor,
  type InsertMatterGuardian,
  type InsertMatterBeneficiary,
  type InsertMatterWishes,
  type InsertMatterGift,
  type InsertMatterPet,
  type InsertMatterPropertyRecord,
  type InsertMatterBusinessRecord,
  type NewMatterTrustClause,
  matterExclusions,
  type MatterExclusion,
  type NewMatterExclusion,
  matterLettersOfWishes,
  type MatterLetterOfWishes,
  matterPeoplePool,
  type MatterPersonPool,
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ── Auto-migration for new columns ───────────────────────────────────────────
let _migrated = false;
async function ensureClientNameColumns(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  if (_migrated) return;
  _migrated = true;
  try {
    await db.execute(sql`ALTER TABLE matter_clients ADD COLUMN title VARCHAR(20) AFTER client_role`);
  } catch { /* column already exists */ }
  try {
    await db.execute(sql`ALTER TABLE matter_clients ADD COLUMN first_name VARCHAR(128) AFTER title`);
  } catch { /* column already exists */ }
  try {
    await db.execute(sql`ALTER TABLE matter_clients ADD COLUMN middle_name VARCHAR(128) AFTER first_name`);
  } catch { /* column already exists */ }
  try {
    await db.execute(sql`ALTER TABLE matter_clients ADD COLUMN last_name VARCHAR(128) AFTER middle_name`);
  } catch { /* column already exists */ }
  // People Pool — store title & gender so "pick existing person" duplicates everything
  try {
    await db.execute(sql`ALTER TABLE matter_people_pool ADD COLUMN title VARCHAR(20) DEFAULT '' AFTER matter_id`);
  } catch { /* column already exists */ }
  try {
    await db.execute(sql`ALTER TABLE matter_people_pool ADD COLUMN gender VARCHAR(20) DEFAULT '' AFTER address`);
  } catch { /* column already exists */ }
}

async function d() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await ensureClientNameColumns(db);
  return db;
}

// ── Full matter type ──────────────────────────────────────────────────────────

export type FullMatter = Matter & {
  clients: MatterClient[];
  executors: MatterExecutor[];
  guardians: MatterGuardian[];
  beneficiaries: MatterBeneficiary[];
  wishes: MatterWishes[];
  gifts: MatterGift[];
  pets: MatterPet[];
  properties: MatterPropertyRecord[];
  businesses: MatterBusinessRecord[];
  trustClauses: MatterTrustClause[];
  exclusions: MatterExclusion[];
  lettersOfWishes: MatterLetterOfWishes[];
};

// ── Queries ───────────────────────────────────────────────────────────────────

export async function listMatters(): Promise<FullMatter[]> {
  const db = await d();
  const rows = await db.select().from(matters).orderBy(desc(matters.createdAt));
  return Promise.all(rows.map(enrichMatter));
}

export async function getMatterById(id: number): Promise<FullMatter | null> {
  const db = await d();
  const rows = await db.select().from(matters).where(eq(matters.id, id));
  if (!rows[0]) return null;
  return enrichMatter(rows[0]);
}

async function enrichMatter(matter: Matter): Promise<FullMatter> {
  const db = await d();
  const [clients, executors, guardians, beneficiaries, wishes, gifts, pets, properties, businesses, trustClauses, exclusions, lettersOfWishes] = await Promise.all([
    db.select().from(matterClients).where(eq(matterClients.matterId, matter.id)),
    db.select().from(matterExecutors).where(eq(matterExecutors.matterId, matter.id)).orderBy(matterExecutors.sortOrder),
    db.select().from(matterGuardians).where(eq(matterGuardians.matterId, matter.id)).orderBy(matterGuardians.sortOrder),
    db.select().from(matterBeneficiaries).where(eq(matterBeneficiaries.matterId, matter.id)).orderBy(matterBeneficiaries.sortOrder),
    db.select().from(matterWishes).where(eq(matterWishes.matterId, matter.id)),
    db.select().from(matterGifts).where(eq(matterGifts.matterId, matter.id)).orderBy(matterGifts.sortOrder),
    db.select().from(matterPets).where(eq(matterPets.matterId, matter.id)).orderBy(matterPets.sortOrder),
    db.select().from(matterProperty).where(eq(matterProperty.matterId, matter.id)).orderBy(matterProperty.sortOrder),
    db.select().from(matterBusiness).where(eq(matterBusiness.matterId, matter.id)).orderBy(matterBusiness.sortOrder),
    db.select().from(matterTrustClauses).where(eq(matterTrustClauses.matterId, matter.id)),
    db.select().from(matterExclusions).where(eq(matterExclusions.matterId, matter.id)).orderBy(matterExclusions.createdAt),
    db.select().from(matterLettersOfWishes).where(eq(matterLettersOfWishes.matterId, matter.id)),
  ]);
  return { ...matter, clients, executors, guardians, beneficiaries, wishes, gifts, pets, properties, businesses, trustClauses, exclusions, lettersOfWishes };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createMatter(data: InsertMatter): Promise<number> {
  const db = await d();
  const result = await db.insert(matters).values(data);
  return (result as any)[0].insertId as number;
}

export async function updateMatter(id: number, data: Partial<InsertMatter>): Promise<void> {
  const db = await d();
  await db.update(matters).set(data).where(eq(matters.id, id));
}

export async function deleteMatter(id: number): Promise<void> {
  const db = await d();
  await db.delete(matterExclusions).where(eq(matterExclusions.matterId, id));
  await db.delete(matterTrustClauses).where(eq(matterTrustClauses.matterId, id));
  await db.delete(matterBusiness).where(eq(matterBusiness.matterId, id));
  await db.delete(matterProperty).where(eq(matterProperty.matterId, id));
  await db.delete(matterPets).where(eq(matterPets.matterId, id));
  await db.delete(matterGifts).where(eq(matterGifts.matterId, id));
  await db.delete(matterWishes).where(eq(matterWishes.matterId, id));
  await db.delete(matterBeneficiaries).where(eq(matterBeneficiaries.matterId, id));
  await db.delete(matterGuardians).where(eq(matterGuardians.matterId, id));
  await db.delete(matterExecutors).where(eq(matterExecutors.matterId, id));
  await db.delete(matterClients).where(eq(matterClients.matterId, id));
  await db.delete(matters).where(eq(matters.id, id));
}

// ── Upsert helpers ────────────────────────────────────────────────────────────

export async function upsertClient(
  matterId: number,
  role: "testator1" | "testator2",
  data: Omit<InsertMatterClient, "matterId" | "clientRole">
): Promise<void> {
  const db = await d();
  const existing = await db.select().from(matterClients).where(
    and(eq(matterClients.matterId, matterId), eq(matterClients.clientRole, role))
  );
  if (existing[0]) {
    await db.update(matterClients).set(data).where(eq(matterClients.id, existing[0].id));
  } else {
    await db.insert(matterClients).values({ matterId, clientRole: role, ...data });
  }
}

export async function replaceExecutors(
  matterId: number,
  clientRole: "testator1" | "testator2" | "shared",
  rows: Array<Omit<InsertMatterExecutor, "matterId" | "clientRole">>
): Promise<void> {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterExecutors).where(
      and(eq(matterExecutors.matterId, matterId), eq(matterExecutors.clientRole, clientRole))
    );
    if (rows.length > 0) {
      await tx.insert(matterExecutors).values(
        rows.map((r, i) => ({ ...r, matterId, clientRole, sortOrder: i }))
      );
    }
  });
}

export async function replaceGuardians(
  matterId: number,
  rows: Array<Omit<InsertMatterGuardian, "matterId">>
): Promise<void> {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterGuardians).where(eq(matterGuardians.matterId, matterId));
    if (rows.length > 0) {
      await tx.insert(matterGuardians).values(
        rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
      );
    }
  });
}

export async function replaceBeneficiaries(
  matterId: number,
  clientRole: "testator1" | "testator2" | "shared",
  rows: Array<Omit<InsertMatterBeneficiary, "matterId" | "clientRole">>
): Promise<void> {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterBeneficiaries).where(
      and(eq(matterBeneficiaries.matterId, matterId), eq(matterBeneficiaries.clientRole, clientRole))
    );
    if (rows.length > 0) {
      await tx.insert(matterBeneficiaries).values(
        rows.map((r, i) => ({ ...r, matterId, clientRole, sortOrder: i }))
      );
    }
  });
}

export async function upsertWishes(
  matterId: number,
  clientRole: "testator1" | "testator2" | "shared",
  data: Omit<InsertMatterWishes, "matterId" | "clientRole">
): Promise<void> {
  const db = await d();
  const existing = await db.select().from(matterWishes).where(
    and(eq(matterWishes.matterId, matterId), eq(matterWishes.clientRole, clientRole))
  );
  if (existing[0]) {
    await db.update(matterWishes).set(data).where(eq(matterWishes.id, existing[0].id));
  } else {
    await db.insert(matterWishes).values({ matterId, clientRole, ...data });
  }
}

export async function replaceGifts(
  matterId: number,
  clientRole: "testator1" | "testator2" | "shared",
  rows: Array<Omit<InsertMatterGift, "matterId" | "clientRole">>
): Promise<void> {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterGifts).where(
      and(eq(matterGifts.matterId, matterId), eq(matterGifts.clientRole, clientRole))
    );
    if (rows.length > 0) {
      await tx.insert(matterGifts).values(
        rows.map((r, i) => ({ ...r, matterId, clientRole, sortOrder: i }))
      );
    }
  });
}

export async function replacePets(
  matterId: number,
  rows: Array<Omit<InsertMatterPet, "matterId">>
): Promise<void> {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterPets).where(eq(matterPets.matterId, matterId));
    if (rows.length > 0) {
      await tx.insert(matterPets).values(
        rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
      );
    }
  });
}

export async function replaceProperty(
  matterId: number,
  rows: Array<Omit<InsertMatterPropertyRecord, "matterId">>
): Promise<void> {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterProperty).where(eq(matterProperty.matterId, matterId));
    if (rows.length > 0) {
      await tx.insert(matterProperty).values(
        rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
      );
    }
  });
}

export async function replaceBusiness(
  matterId: number,
  rows: Array<Omit<InsertMatterBusinessRecord, "matterId">>
): Promise<void> {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterBusiness).where(eq(matterBusiness.matterId, matterId));
    if (rows.length > 0) {
      await tx.insert(matterBusiness).values(
        rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
      );
    }
  });
}

export async function replaceTrustClauses(
  matterId: number,
  clientRole: string,
  rows: Array<Omit<NewMatterTrustClause, "matterId" | "clientRole">>
): Promise<void> {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterTrustClauses).where(
      and(eq(matterTrustClauses.matterId, matterId), eq(matterTrustClauses.clientRole, clientRole))
    );
    if (rows.length > 0) {
      const now = Date.now();
      await tx.insert(matterTrustClauses).values(
        rows.map(r => ({ ...r, matterId, clientRole, createdAt: now, updatedAt: now }))
      );
    }
  });
}

export async function saveEditedWillHtml(
  matterId: number,
  testatorKey: "testator1" | "testator2",
  html: string
): Promise<void> {
  const db = await d();
  if (testatorKey === "testator1") {
    await db.update(matters).set({ editedWillHtmlTestator1: html }).where(eq(matters.id, matterId));
  } else {
    await db.update(matters).set({ editedWillHtmlTestator2: html }).where(eq(matters.id, matterId));
  }
}

// ── Exclusion helpers ────────────────────────────────────────────────────────

export async function listExclusions(matterId: number): Promise<MatterExclusion[]> {
  const db = await d();
  return db.select().from(matterExclusions)
    .where(eq(matterExclusions.matterId, matterId))
    .orderBy(matterExclusions.createdAt);
}

export async function upsertExclusion(
  matterId: number,
  data: Omit<NewMatterExclusion, "matterId">
): Promise<number> {
  const db = await d();
  const now = Date.now();
  if (data.id) {
    await db.update(matterExclusions)
      .set({ ...data, updatedAt: now })
      .where(and(eq(matterExclusions.id, data.id), eq(matterExclusions.matterId, matterId)));
    return data.id;
  }
  const result = await db.insert(matterExclusions).values({ ...data, matterId, createdAt: now, updatedAt: now });
  return (result as any)[0].insertId as number;
}

export async function deleteExclusion(id: number, matterId: number): Promise<void> {
  const db = await d();
  await db.delete(matterExclusions).where(
    and(eq(matterExclusions.id, id), eq(matterExclusions.matterId, matterId))
  );
}

// ── Letter of Wishes helpers ─────────────────────────────────────────────────

export async function getLetterOfWishes(
  matterId: number,
  clientRole: "testator1" | "testator2"
): Promise<MatterLetterOfWishes | null> {
  const db = await d();
  const rows = await db.select().from(matterLettersOfWishes).where(
    and(eq(matterLettersOfWishes.matterId, matterId), eq(matterLettersOfWishes.clientRole, clientRole))
  );
  return rows[0] ?? null;
}

export async function upsertLetterOfWishes(
  matterId: number,
  clientRole: "testator1" | "testator2",
  content: string
): Promise<void> {
  const db = await d();
  const now = Date.now();
  const existing = await db.select().from(matterLettersOfWishes).where(
    and(eq(matterLettersOfWishes.matterId, matterId), eq(matterLettersOfWishes.clientRole, clientRole))
  );
  if (existing[0]) {
    await db.update(matterLettersOfWishes)
      .set({ content, updatedAt: now })
      .where(eq(matterLettersOfWishes.id, existing[0].id));
  } else {
    await db.insert(matterLettersOfWishes).values({ matterId, clientRole, content, createdAt: now, updatedAt: now });
  }
}

// ── People Pool helpers ─────────────────────────────────────────────────────

export async function listPeoplePool(matterId: number): Promise<MatterPersonPool[]> {
  const db = await d();
  return db.select().from(matterPeoplePool)
    .where(eq(matterPeoplePool.matterId, matterId))
    .orderBy(matterPeoplePool.fullName);
}

export async function upsertPersonPool(
  matterId: number,
  data: { id?: number; fullName: string; title?: string; dateOfBirth?: string; address?: string; gender?: string; relationship?: string; sourceRole?: string }
): Promise<number> {
  const db = await d();
  const now = Date.now();
  if (data.id) {
    await db.update(matterPeoplePool)
      .set({ fullName: data.fullName, title: data.title ?? "", dateOfBirth: data.dateOfBirth ?? "", address: data.address ?? "", gender: data.gender ?? "", relationship: data.relationship ?? "", sourceRole: data.sourceRole ?? "", updatedAt: now })
      .where(and(eq(matterPeoplePool.id, data.id), eq(matterPeoplePool.matterId, matterId)));
    return data.id;
  }
  // Check for existing person with same name (case-insensitive)
  const existing = await db.select().from(matterPeoplePool)
    .where(and(eq(matterPeoplePool.matterId, matterId), eq(matterPeoplePool.fullName, data.fullName)));
  if (existing[0]) {
    await db.update(matterPeoplePool)
      .set({ title: data.title ?? existing[0].title ?? "", dateOfBirth: data.dateOfBirth ?? existing[0].dateOfBirth ?? "", address: data.address ?? existing[0].address ?? "", gender: data.gender ?? existing[0].gender ?? "", relationship: data.relationship ?? existing[0].relationship ?? "", sourceRole: data.sourceRole ?? existing[0].sourceRole ?? "", updatedAt: now })
      .where(eq(matterPeoplePool.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(matterPeoplePool).values({ matterId, fullName: data.fullName, title: data.title ?? "", dateOfBirth: data.dateOfBirth ?? "", address: data.address ?? "", gender: data.gender ?? "", relationship: data.relationship ?? "", sourceRole: data.sourceRole ?? "", createdAt: now, updatedAt: now });
  return (result as any)[0].insertId as number;
}

export async function deletePersonPool(id: number, matterId: number): Promise<void> {
  const db = await d();
  await db.delete(matterPeoplePool).where(
    and(eq(matterPeoplePool.id, id), eq(matterPeoplePool.matterId, matterId))
  );
}

export async function clearEditedWillHtml(
  matterId: number,
  testatorKey: "testator1" | "testator2"
): Promise<void> {
  const db = await d();
  if (testatorKey === "testator1") {
    await db.update(matters).set({ editedWillHtmlTestator1: null }).where(eq(matters.id, matterId));
  } else {
    await db.update(matters).set({ editedWillHtmlTestator2: null }).where(eq(matters.id, matterId));
  }
}
