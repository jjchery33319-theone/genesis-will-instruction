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
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

async function d() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
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
  const [clients, executors, guardians, beneficiaries, wishes, gifts, pets, properties, businesses, trustClauses] = await Promise.all([
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
  ]);
  return { ...matter, clients, executors, guardians, beneficiaries, wishes, gifts, pets, properties, businesses, trustClauses };
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
  await db.delete(matterExecutors).where(
    and(eq(matterExecutors.matterId, matterId), eq(matterExecutors.clientRole, clientRole))
  );
  if (rows.length > 0) {
    await db.insert(matterExecutors).values(
      rows.map((r, i) => ({ ...r, matterId, clientRole, sortOrder: i }))
    );
  }
}

export async function replaceGuardians(
  matterId: number,
  rows: Array<Omit<InsertMatterGuardian, "matterId">>
): Promise<void> {
  const db = await d();
  await db.delete(matterGuardians).where(eq(matterGuardians.matterId, matterId));
  if (rows.length > 0) {
    await db.insert(matterGuardians).values(
      rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
    );
  }
}

export async function replaceBeneficiaries(
  matterId: number,
  clientRole: "testator1" | "testator2" | "shared",
  rows: Array<Omit<InsertMatterBeneficiary, "matterId" | "clientRole">>
): Promise<void> {
  const db = await d();
  await db.delete(matterBeneficiaries).where(
    and(eq(matterBeneficiaries.matterId, matterId), eq(matterBeneficiaries.clientRole, clientRole))
  );
  if (rows.length > 0) {
    await db.insert(matterBeneficiaries).values(
      rows.map((r, i) => ({ ...r, matterId, clientRole, sortOrder: i }))
    );
  }
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
  await db.delete(matterGifts).where(
    and(eq(matterGifts.matterId, matterId), eq(matterGifts.clientRole, clientRole))
  );
  if (rows.length > 0) {
    await db.insert(matterGifts).values(
      rows.map((r, i) => ({ ...r, matterId, clientRole, sortOrder: i }))
    );
  }
}

export async function replacePets(
  matterId: number,
  rows: Array<Omit<InsertMatterPet, "matterId">>
): Promise<void> {
  const db = await d();
  await db.delete(matterPets).where(eq(matterPets.matterId, matterId));
  if (rows.length > 0) {
    await db.insert(matterPets).values(
      rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
    );
  }
}

export async function replaceProperty(
  matterId: number,
  rows: Array<Omit<InsertMatterPropertyRecord, "matterId">>
): Promise<void> {
  const db = await d();
  await db.delete(matterProperty).where(eq(matterProperty.matterId, matterId));
  if (rows.length > 0) {
    await db.insert(matterProperty).values(
      rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
    );
  }
}

export async function replaceBusiness(
  matterId: number,
  rows: Array<Omit<InsertMatterBusinessRecord, "matterId">>
): Promise<void> {
  const db = await d();
  await db.delete(matterBusiness).where(eq(matterBusiness.matterId, matterId));
  if (rows.length > 0) {
    await db.insert(matterBusiness).values(
      rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
    );
  }
}

export async function replaceTrustClauses(
  matterId: number,
  clientRole: string,
  rows: Array<Omit<NewMatterTrustClause, "matterId" | "clientRole">>
): Promise<void> {
  const db = await d();
  await db.delete(matterTrustClauses).where(
    and(eq(matterTrustClauses.matterId, matterId), eq(matterTrustClauses.clientRole, clientRole))
  );
  if (rows.length > 0) {
    const now = Date.now();
    await db.insert(matterTrustClauses).values(
      rows.map(r => ({ ...r, matterId, clientRole, createdAt: now, updatedAt: now }))
    );
  }
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
