import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const willInstructions = mysqlTable("will_instructions", {
  id: int("id").autoincrement().primaryKey(),
  referenceNumber: varchar("referenceNumber", { length: 32 }).notNull().unique(),

  // Appointment
  appointmentDate: varchar("appointmentDate", { length: 32 }),
  appointmentTime: varchar("appointmentTime", { length: 16 }),
  consultantName: varchar("consultantName", { length: 128 }),
  consultantEmail: varchar("consultantEmail", { length: 320 }),
  consultantPhone: varchar("consultantPhone", { length: 32 }),
  caseCoordinatorName: varchar("caseCoordinatorName", { length: 128 }),
  caseCoordinatorEmail: varchar("caseCoordinatorEmail", { length: 320 }),
  caseCoordinatorPhone: varchar("caseCoordinatorPhone", { length: 32 }),
  priceQuoted: varchar("priceQuoted", { length: 32 }),
  estimatedDraftDate: varchar("estimatedDraftDate", { length: 32 }),
  productsOrdered: json("productsOrdered"),
  willType: varchar("willType", { length: 32 }),
  lpaType: varchar("lpaType", { length: 64 }),

  // Client 1
  client1Prefix: varchar("client1Prefix", { length: 16 }),
  client1FirstName: varchar("client1FirstName", { length: 128 }),
  client1MiddleName: varchar("client1MiddleName", { length: 128 }),
  client1LastName: varchar("client1LastName", { length: 128 }),
  client1Dob: varchar("client1Dob", { length: 16 }),
  client1AddressLine1: varchar("client1AddressLine1", { length: 256 }),
  client1City: varchar("client1City", { length: 128 }),
  client1Postcode: varchar("client1Postcode", { length: 16 }),
  client1MaritalStatus: varchar("client1MaritalStatus", { length: 32 }),
  client1JobTitle: varchar("client1JobTitle", { length: 128 }),
  client1DaytimePhone: varchar("client1DaytimePhone", { length: 32 }),
  client1Mobile: varchar("client1Mobile", { length: 32 }),
  client1Email: varchar("client1Email", { length: 320 }),
  client1Nationality: varchar("client1Nationality", { length: 64 }),

  // Client 2
  client2Prefix: varchar("client2Prefix", { length: 16 }),
  client2FirstName: varchar("client2FirstName", { length: 128 }),
  client2MiddleName: varchar("client2MiddleName", { length: 128 }),
  client2LastName: varchar("client2LastName", { length: 128 }),
  client2Dob: varchar("client2Dob", { length: 16 }),
  client2AddressLine1: varchar("client2AddressLine1", { length: 256 }),
  client2City: varchar("client2City", { length: 128 }),
  client2Postcode: varchar("client2Postcode", { length: 16 }),
  client2MaritalStatus: varchar("client2MaritalStatus", { length: 32 }),
  client2JobTitle: varchar("client2JobTitle", { length: 128 }),
  client2DaytimePhone: varchar("client2DaytimePhone", { length: 32 }),
  client2Mobile: varchar("client2Mobile", { length: 32 }),
  client2Email: varchar("client2Email", { length: 320 }),
  client2Nationality: varchar("client2Nationality", { length: 64 }),

  // People
  executors: json("executors"),
  trustees: json("trustees"),
  guardians: json("guardians"),
  beneficiaries: json("beneficiaries"),
  childrenBenefitAge: varchar("childrenBenefitAge", { length: 8 }),
  disasterClauseClient1: text("disasterClauseClient1"),
  disasterClauseClient2: text("disasterClauseClient2"),

  // Property
  propertyOwned: varchar("propertyOwned", { length: 8 }),
  propertyAddress: text("propertyAddress"),
  propertyOwnership: varchar("propertyOwnership", { length: 32 }),
  mortgageOutstanding: varchar("mortgageOutstanding", { length: 8 }),
  propertyValue: varchar("propertyValue", { length: 32 }),
  hasOtherProperties: varchar("hasOtherProperties", { length: 8 }),
  otherProperties: text("otherProperties"),
  bankAccounts: text("bankAccounts"),
  investments: text("investments"),
  pensionDetails: text("pensionDetails"),
  lifeInsurance: text("lifeInsurance"),
  businessInterests: text("businessInterests"),
  estimatedEstateValue: varchar("estimatedEstateValue", { length: 32 }),

  // Wishes
  specificGifts: json("specificGifts"),
  residuaryEstate: text("residuaryEstate"),
  residuaryBackup: text("residuaryBackup"),
  funeralType: varchar("funeralType", { length: 32 }),
  funeralWishes: text("funeralWishes"),
  organDonation: varchar("organDonation", { length: 8 }),

  // Vulnerable & care
  hasVulnerableBeneficiary: varchar("hasVulnerableBeneficiary", { length: 8 }),
  vulnerableBeneficiaryDetails: text("vulnerableBeneficiaryDetails"),
  careConcerns: varchar("careConcerns", { length: 8 }),
  careConcernDetails: text("careConcernDetails"),

  // Notes
  specialNotes: text("specialNotes"),

  // AI output
  recommendationsJson: json("recommendationsJson"),
  aiRecommendationNarrative: text("aiRecommendationNarrative"),
  aiClientEmailDraft: text("aiClientEmailDraft"),

  // Meta
  status: mysqlEnum("status", ["draft", "submitted", "processing", "complete"]).default("submitted").notNull(),
  emailSent: int("emailSent").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WillInstruction = typeof willInstructions.$inferSelect;
export type InsertWillInstruction = typeof willInstructions.$inferInsert;
