import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, tinyint, bigint } from "drizzle-orm/mysql-core";

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

  // ── Appointment ────────────────────────────────────────────────────────────
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

  // ── Client 1 ───────────────────────────────────────────────────────────────
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

  // ── Client 2 ───────────────────────────────────────────────────────────────
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

  // ── Family Background ──────────────────────────────────────────────────────
  client1MarriagePlans: varchar("client1MarriagePlans", { length: 8 }),        // yes/no
  client1MarriagePlanDetails: text("client1MarriagePlanDetails"),
  client1HasChildren: varchar("client1HasChildren", { length: 8 }),
  client1TotalChildren: varchar("client1TotalChildren", { length: 20 }),
  client1ChildrenSpecialNeeds: varchar("client1ChildrenSpecialNeeds", { length: 8 }),
  client1ChildrenSpecialNeedsDetails: text("client1ChildrenSpecialNeedsDetails"),
  client1ChildrenUnder18: json("client1ChildrenUnder18"),
  client1ChildrenOver18: json("client1ChildrenOver18"),
  client1ChildrenDetails: text("client1ChildrenDetails"),
  client1FamilyCircumstances: text("client1FamilyCircumstances"),
  client2MarriagePlans: varchar("client2MarriagePlans", { length: 8 }),
  client2MarriagePlanDetails: text("client2MarriagePlanDetails"),
  client2HasChildren: varchar("client2HasChildren", { length: 8 }),
  client2TotalChildren: varchar("client2TotalChildren", { length: 20 }),
  client2ChildrenSpecialNeeds: varchar("client2ChildrenSpecialNeeds", { length: 8 }),
  client2ChildrenSpecialNeedsDetails: text("client2ChildrenSpecialNeedsDetails"),
  client2ChildrenUnder18: json("client2ChildrenUnder18"),
  client2ChildrenOver18: json("client2ChildrenOver18"),
  client2ChildrenDetails: text("client2ChildrenDetails"),
  client2FamilyCircumstances: text("client2FamilyCircumstances"),

  // ── Additional Background ──────────────────────────────────────────────────
  client1Residency: varchar("client1Residency", { length: 64 }),               // UK/Non-UK/Dual
  client1DomiciledUK: varchar("client1DomiciledUK", { length: 8 }),
  client1MentalCapacity: varchar("client1MentalCapacity", { length: 8 }),      // yes/no
  client1MentalCapacityNotes: text("client1MentalCapacityNotes"),
  client1ChildrenPastRelationships: varchar("client1ChildrenPastRelationships", { length: 8 }),
  client1ChildrenPastDetails: text("client1ChildrenPastDetails"),
  client2Residency: varchar("client2Residency", { length: 64 }),
  client2DomiciledUK: varchar("client2DomiciledUK", { length: 8 }),
  client2MentalCapacity: varchar("client2MentalCapacity", { length: 8 }),
  client2MentalCapacityNotes: text("client2MentalCapacityNotes"),
  client2ChildrenPastRelationships: varchar("client2ChildrenPastRelationships", { length: 8 }),
  client2ChildrenPastDetails: text("client2ChildrenPastDetails"),

  // ── Due Diligence ──────────────────────────────────────────────────────────
  ddArrangedAppointment: varchar("ddArrangedAppointment", { length: 8 }),      // yes/no
  ddArrangedAppointmentNotes: text("ddArrangedAppointmentNotes"),
  ddKnowledgeOfEstate: varchar("ddKnowledgeOfEstate", { length: 8 }),
  ddKnowledgeOfEstateNotes: text("ddKnowledgeOfEstateNotes"),
  ddKnewBeneficiaries: varchar("ddKnewBeneficiaries", { length: 8 }),
  ddKnewBeneficiariesNotes: text("ddKnewBeneficiariesNotes"),
  ddSignsOfInfluence: varchar("ddSignsOfInfluence", { length: 8 }),
  ddSignsOfInfluenceNotes: text("ddSignsOfInfluenceNotes"),
  ddKnewAppointees: varchar("ddKnewAppointees", { length: 8 }),
  ddKnewAppointeesNotes: text("ddKnewAppointeesNotes"),

  // ── Extended Due Diligence ─────────────────────────────────────────────────
  ddClientSince: varchar("ddClientSince", { length: 128 }),
  ddFirstContactDate: varchar("ddFirstContactDate", { length: 32 }),
  ddMeetingType: varchar("ddMeetingType", { length: 64 }),     // Consultant office / Client house / Video Call / Telephone
  ddOthersPresent: varchar("ddOthersPresent", { length: 8 }),  // yes/no
  ddOthersPresentNotes: text("ddOthersPresentNotes"),
  ddClientCanSee: varchar("ddClientCanSee", { length: 8 }),    // yes/no
  ddClientCanHear: varchar("ddClientCanHear", { length: 8 }),  // yes/no
  ddClientCanSpeak: varchar("ddClientCanSpeak", { length: 8 }), // yes/no

  // ── People ─────────────────────────────────────────────────────────────────
  executors: json("executors"),
  reservedExecutors: json("reservedExecutors"),
  trustees: json("trustees"),
  guardians: json("guardians"),
  reservedGuardians: json("reservedGuardians"),
  beneficiaries: json("beneficiaries"),
  // Per-client people arrays (Mirror Wills support)
  client1Executors: json("client1Executors"),
  client1ReservedExecutors: json("client1ReservedExecutors"),
  client2Executors: json("client2Executors"),
  client2ReservedExecutors: json("client2ReservedExecutors"),
  client1Guardians: json("client1Guardians"),
  client1ReservedGuardians: json("client1ReservedGuardians"),
  client2Guardians: json("client2Guardians"),
  client2ReservedGuardians: json("client2ReservedGuardians"),
  client1Beneficiaries: json("client1Beneficiaries"),
  client2Beneficiaries: json("client2Beneficiaries"),
  client1SpecificGifts: json("client1SpecificGifts"),
  client2SpecificGifts: json("client2SpecificGifts"),
  childrenBenefitAge: varchar("childrenBenefitAge", { length: 8 }),
  disasterClauseClient1: text("disasterClauseClient1"),
  disasterClauseClient2: text("disasterClauseClient2"),

  // ── Per-client beneficiary extras ─────────────────────────────────────────
  client1ResidualEstate: text("client1ResidualEstate"),
  client1ResidualBackup: text("client1ResidualBackup"),
  client1ChildrenBenefitAge: varchar("client1ChildrenBenefitAge", { length: 8 }),
  client1HasVulnerableBeneficiary: varchar("client1HasVulnerableBeneficiary", { length: 8 }),
  client1VulnerableBeneficiaryDetails: text("client1VulnerableBeneficiaryDetails"),
  client2ResidualEstate: text("client2ResidualEstate"),
  client2ResidualBackup: text("client2ResidualBackup"),
  client2ChildrenBenefitAge: varchar("client2ChildrenBenefitAge", { length: 8 }),
  client2HasVulnerableBeneficiary: varchar("client2HasVulnerableBeneficiary", { length: 8 }),
  client2VulnerableBeneficiaryDetails: text("client2VulnerableBeneficiaryDetails"),

  // ── Per-client funeral wishes ──────────────────────────────────────────────
  client1FuneralType: varchar("client1FuneralType", { length: 32 }),
  client1FuneralWishes: text("client1FuneralWishes"),
  client1OrganDonation: varchar("client1OrganDonation", { length: 8 }),
  client2FuneralType: varchar("client2FuneralType", { length: 32 }),
  client2FuneralWishes: text("client2FuneralWishes"),
  client2OrganDonation: varchar("client2OrganDonation", { length: 8 }),

  // ── Property & Assets ──────────────────────────────────────────────────────
  propertyOwned: varchar("propertyOwned", { length: 8 }),
  propertyAddress: text("propertyAddress"),
  propertyOwnership: varchar("propertyOwnership", { length: 32 }),
  mortgageOutstanding: varchar("mortgageOutstanding", { length: 8 }),
  mortgageBalance: varchar("mortgageBalance", { length: 100 }),
  mortgageTermRemaining: varchar("mortgageTermRemaining", { length: 100 }),
  mortgageLender: varchar("mortgageLender", { length: 200 }),
  propertyValue: varchar("propertyValue", { length: 32 }),
  hasOtherProperties: varchar("hasOtherProperties", { length: 8 }),
  otherProperties: text("otherProperties"),
  assetsOutsideUK: varchar("assetsOutsideUK", { length: 8 }),                  // NEW
  assetsOutsideUKDetails: text("assetsOutsideUKDetails"),                      // NEW
  bankAccounts: text("bankAccounts"),
  investments: text("investments"),
  pensionDetails: text("pensionDetails"),
  estimatedEstateValue: varchar("estimatedEstateValue", { length: 32 }),

  // ── Client 2 Financial Assets (separate from Client 1) ────────────────────
  client2BankAccounts: text("client2BankAccounts"),
  client2Investments: text("client2Investments"),
  client2PensionDetails: text("client2PensionDetails"),
  client2EstimatedEstateValue: varchar("client2EstimatedEstateValue", { length: 32 }),

  // ── Life Insurance & Protection ────────────────────────────────────────────
  hasLifeInsurance: varchar("hasLifeInsurance", { length: 8 }),                // NEW
  lifeInsurancePolicies: json("lifeInsurancePolicies"),                        // NEW – array of policy objects
  lifeInsuranceNotes: text("lifeInsuranceNotes"),                              // NEW

  // ── Business Interests ─────────────────────────────────────────────────────
  hasBusinessInterests: varchar("hasBusinessInterests", { length: 8 }),        // NEW
  businessInterests: text("businessInterests"),
  businessInterestsDetails: json("businessInterestsDetails"),                  // NEW – structured

  // ── Legacies & Gifts ───────────────────────────────────────────────────────
  specificGifts: json("specificGifts"),

  // ── Pets ───────────────────────────────────────────────────────────────────
  hasPets: varchar("hasPets", { length: 8 }),                                  // NEW
  petsDetails: text("petsDetails"),                                            // NEW
  petsCarer: text("petsCarer"),                                                // NEW

  // ── Wishes ─────────────────────────────────────────────────────────────────
  residuaryEstate: text("residuaryEstate"),
  residuaryBackup: text("residuaryBackup"),
  funeralType: varchar("funeralType", { length: 32 }),
  funeralWishes: text("funeralWishes"),
  organDonation: varchar("organDonation", { length: 8 }),

  // ── Vulnerable & Care ──────────────────────────────────────────────────────
  hasVulnerableBeneficiary: varchar("hasVulnerableBeneficiary", { length: 8 }),
  vulnerableBeneficiaryDetails: text("vulnerableBeneficiaryDetails"),
  careConcerns: varchar("careConcerns", { length: 8 }),
  careConcernDetails: text("careConcernDetails"),

  // ── Disaster Clause & Notes ────────────────────────────────────────────────
  disasterClauseNotes: text("disasterClauseNotes"),                            // NEW – general disaster clause notes
  additionalNotes: text("additionalNotes"),                                    // NEW – replaces specialNotes for clarity
  specialNotes: text("specialNotes"),                                          // kept for backward compat

  // ── Optional Trust Clauses (rich multi-instance JSON) ────────────────────────
  protectivePropertyTrusts: json("protective_property_trusts"),    // Array<PPTClause>
  discretionaryTrusts: json("discretionary_trusts"),               // Array<DiscretionaryTrustClause>
  vulnerablePersonTrusts: json("vulnerable_person_trusts"),         // Array<VulnerableTrustClause>
  nilRateBandTrusts: json("nil_rate_band_trusts"),                  // Array<NilRateBandClause>
  bereavedMinorTrusts: json("bereaved_minor_trusts"),               // Array<BereavedMinorClause>
  age18To25Trusts: json("age_18_to_25_trusts"),                     // Array<Age18To25Clause>
  businessPropertyReliefs: json("business_property_reliefs"),       // Array<BusinessPropertyReliefClause>

  // ── Manual Needs Assessment ─────────────────────────────────────────────────
  manualNeedsAssessment: text("manualNeedsAssessment"),

  // ── AI Output ─────────────────────────────────────────────────────────────
  recommendationsJson: json("recommendationsJson"),
  aiRecommendationNarrative: text("aiRecommendationNarrative"),
  aiClientEmailDraft: text("aiClientEmailDraft"),

  // ── Edited Will HTML (manual back-office edits saved per willType) ───────────
  editedWillHtmlSingle: text("editedWillHtmlSingle"),
  editedWillHtmlClient1: text("editedWillHtmlClient1"),
  editedWillHtmlClient2: text("editedWillHtmlClient2"),

  // ── Meta ───────────────────────────────────────────────────────────────────
  status: mysqlEnum("status", ["draft", "submitted", "processing", "complete", "cancelled"]).default("submitted").notNull(),
  currentStep: int("currentStep").notNull().default(1),
  emailSent: int("emailSent").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WillInstruction = typeof willInstructions.$inferSelect;
export type InsertWillInstruction = typeof willInstructions.$inferInsert;

// ── LPA Records ───────────────────────────────────────────────────────────────
export const lpaRecords = mysqlTable("lpa_records", {
  id: int("id").autoincrement().primaryKey(),
  willInstructionId: int("willInstructionId").notNull(),
  matterId: int("matter_id"),  // nullable — set when LPA is created from a V2 matter
  clientNumber: int("clientNumber").notNull().default(1), // 1 or 2
  lpaType: mysqlEnum("lpaType", ["property_finance", "health_welfare"]).notNull(),

  // ── Donor (pre-filled from will instruction client data) ──────────────────
  donorTitle: varchar("donorTitle", { length: 16 }),
  donorFirstNames: varchar("donorFirstNames", { length: 128 }),
  donorLastName: varchar("donorLastName", { length: 128 }),
  donorOtherNames: varchar("donorOtherNames", { length: 128 }),
  donorDob: varchar("donorDob", { length: 16 }),
  donorAddress: text("donorAddress"),
  donorPostcode: varchar("donorPostcode", { length: 16 }),
  donorEmail: varchar("donorEmail", { length: 320 }),

  // ── Attorneys (JSON array of person objects) ──────────────────────────────
  attorneys: json("attorneys"),          // [{ title, firstNames, lastName, dob, address, postcode, email, isTrustCorporation? }]
  replacementAttorneys: json("replacementAttorneys"),

  // ── How attorneys make decisions ──────────────────────────────────────────
  // "jointly_severally" | "jointly" | "jointly_some" | "single"
  attorneyDecisionType: varchar("attorneyDecisionType", { length: 32 }),
  attorneyDecisionDetails: text("attorneyDecisionDetails"), // for jointly_some
  replacementDecisionDetails: text("replacementDecisionDetails"),

  // ── Certificate provider ──────────────────────────────────────────────────
  certProviderTitle: varchar("certProviderTitle", { length: 16 }),
  certProviderFirstNames: varchar("certProviderFirstNames", { length: 128 }),
  certProviderLastName: varchar("certProviderLastName", { length: 128 }),
  certProviderAddress: text("certProviderAddress"),
  certProviderPostcode: varchar("certProviderPostcode", { length: 16 }),
  certProviderEmail: varchar("certProviderEmail", { length: 320 }),

  // ── People to notify ──────────────────────────────────────────────────────
  peopleToNotify: json("peopleToNotify"),  // [{ title, firstNames, lastName, address, postcode }]

  // ── LP1H-specific: life-sustaining treatment ──────────────────────────────
  lifeSustainingTreatment: varchar("lifeSustainingTreatment", { length: 16 }), // "give_authority" | "do_not_give"

  // ── LP1F-specific: when attorneys can act ────────────────────────────────
  whenAttorneysCanAct: varchar("whenAttorneysCanAct", { length: 32 }), // "capacity" | "whenever"

  // ── Preferences & instructions (Section 7) ───────────────────────────────
  preferences: text("preferences"),
  instructions: text("instructions"),

  // ── Section 12: Registration applicant ─────────────────────────────────
  applicantType: varchar("applicant_type", { length: 20 }),  // 'donor' | 'attorneys'

  // ── Section 13: Who receives the LPA ────────────────────────────────────
  recipientType: varchar("recipient_type", { length: 20 }),  // 'donor' | 'attorney' | 'other'
  recipientTitle: varchar("recipient_title", { length: 20 }),
  recipientFirstNames: varchar("recipient_first_names", { length: 100 }),
  recipientLastName: varchar("recipient_last_name", { length: 100 }),
  recipientCompany: varchar("recipient_company", { length: 200 }),
  recipientAddressLine1: varchar("recipient_address_line1", { length: 200 }),
  recipientAddressLine2: varchar("recipient_address_line2", { length: 200 }),
  recipientAddressLine3: varchar("recipient_address_line3", { length: 200 }),
  recipientPostcode: varchar("recipient_postcode", { length: 20 }),
  deliveryPost: int("delivery_post").default(0),
  deliveryPhone: int("delivery_phone").default(0),
  deliveryEmail: int("delivery_email").default(0),
  deliveryWelsh: int("delivery_welsh").default(0),

  // ── Section 14: Application fee ─────────────────────────────────────────
  feePaymentMethod: varchar("fee_payment_method", { length: 20 }),  // 'card' | 'cheque'
  feeContactPhone: varchar("fee_contact_phone", { length: 30 }),
  reducedFee: int("reduced_fee").default(0),
  repeatApplication: int("repeat_application").default(0),
  caseNumber: varchar("case_number", { length: 50 }),

  // ── Meta ──────────────────────────────────────────────────────────────────
  status: mysqlEnum("status", ["draft", "complete"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LpaRecord = typeof lpaRecords.$inferSelect;
export type InsertLpaRecord = typeof lpaRecords.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// Will V2 — Matters, Clients, Executors, Guardians, Beneficiaries, Wishes
// ─────────────────────────────────────────────────────────────────────────────

export const matters = mysqlTable("matters", {
  id: int("id").primaryKey().autoincrement(),
  matterType: mysqlEnum("matter_type", ["single", "mirror"]).notNull(),
  fileReference: varchar("file_reference", { length: 100 }),
  status: mysqlEnum("status", ["draft", "complete"]).default("draft").notNull(),
  editedWillHtmlTestator1: text("edited_will_html_testator1"),
  editedWillHtmlTestator2: text("edited_will_html_testator2"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type Matter = typeof matters.$inferSelect;
export type InsertMatter = typeof matters.$inferInsert;

export const matterClients = mysqlTable("matter_clients", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  clientRole: mysqlEnum("client_role", ["testator1", "testator2"]).notNull(),
  fullName: varchar("full_name", { length: 200 }),
  address: text("address"),
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  email: varchar("email", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type MatterClient = typeof matterClients.$inferSelect;
export type InsertMatterClient = typeof matterClients.$inferInsert;

export const matterExecutors = mysqlTable("matter_executors", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  clientRole: mysqlEnum("client_role", ["testator1", "testator2", "shared"]).default("shared").notNull(),
  executorType: mysqlEnum("executor_type", ["primary", "substitute"]).default("primary").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  fullName: varchar("full_name", { length: 200 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type MatterExecutor = typeof matterExecutors.$inferSelect;
export type InsertMatterExecutor = typeof matterExecutors.$inferInsert;

export const matterGuardians = mysqlTable("matter_guardians", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  guardianType: mysqlEnum("guardian_type", ["primary", "substitute"]).default("primary").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  fullName: varchar("full_name", { length: 200 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type MatterGuardian = typeof matterGuardians.$inferSelect;
export type InsertMatterGuardian = typeof matterGuardians.$inferInsert;

export const matterBeneficiaries = mysqlTable("matter_beneficiaries", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  clientRole: mysqlEnum("client_role", ["testator1", "testator2", "shared"]).default("shared").notNull(),
  beneficiaryType: mysqlEnum("beneficiary_type", ["primary", "fallback"]).default("primary").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  fullName: varchar("full_name", { length: 200 }),
  relationship: varchar("relationship", { length: 100 }),
  shareFraction: varchar("share_fraction", { length: 50 }),
  includeIssue: int("include_issue").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type MatterBeneficiary = typeof matterBeneficiaries.$inferSelect;
export type InsertMatterBeneficiary = typeof matterBeneficiaries.$inferInsert;

export const matterWishes = mysqlTable("matter_wishes", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  clientRole: mysqlEnum("client_role", ["testator1", "testator2", "shared"]).default("shared").notNull(),
  ageCondition: int("age_condition").default(18),
  survivorshipDays: int("survivorship_days").default(28),
  organDonation: int("organ_donation").default(0),
  organDonationText: text("organ_donation_text"),
  funeralWishes: text("funeral_wishes"),
  extraNotes: text("extra_notes"),
  residueToSpouseFirst: int("residue_to_spouse_first").default(1),
  hasMinorChildren: tinyint("has_minor_children").default(1),
  disasterClauseNotes: text("disaster_clause_notes"),
  generalNotes: text("general_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type MatterWishes = typeof matterWishes.$inferSelect;
export type InsertMatterWishes = typeof matterWishes.$inferInsert;

// ── Matter Gifts ──────────────────────────────────────────────────────────────
export const matterGifts = mysqlTable("matter_gifts", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  clientRole: mysqlEnum("client_role", ["testator1", "testator2", "shared"]).default("shared").notNull(),
  sortOrder: int("sort_order").default(1).notNull(),
  recipientName: varchar("recipient_name", { length: 255 }),
  recipientAddress: text("recipient_address"),
  giftDescription: text("gift_description"),
  giftType: mysqlEnum("gift_type", ["monetary", "asset", "residue"]).default("asset").notNull(),
});
export type MatterGift = typeof matterGifts.$inferSelect;
export type InsertMatterGift = typeof matterGifts.$inferInsert;

// ── Matter Pets ───────────────────────────────────────────────────────────────
export const matterPets = mysqlTable("matter_pets", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  sortOrder: int("sort_order").default(1).notNull(),
  petName: varchar("pet_name", { length: 255 }),
  petType: varchar("pet_type", { length: 100 }),
  carerName: varchar("carer_name", { length: 255 }),
  carerAddress: text("carer_address"),
  careNotes: text("care_notes"),
});
export type MatterPet = typeof matterPets.$inferSelect;
export type InsertMatterPet = typeof matterPets.$inferInsert;

// ── Matter Property ───────────────────────────────────────────────────────────
export const matterProperty = mysqlTable("matter_property", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  sortOrder: int("sort_order").default(1).notNull(),
  address: text("address"),
  ownershipType: mysqlEnum("ownership_type", ["sole", "joint_tenants", "tenants_in_common"]).default("sole").notNull(),
  mortgageOutstanding: int("mortgage_outstanding").default(0),
  mortgageLender: varchar("mortgage_lender", { length: 255 }),
  propertyNotes: text("property_notes"),
});
export type MatterPropertyRecord = typeof matterProperty.$inferSelect;
export type InsertMatterPropertyRecord = typeof matterProperty.$inferInsert;

// ── Matter Business ───────────────────────────────────────────────────────────
export const matterBusiness = mysqlTable("matter_business", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  sortOrder: int("sort_order").default(1).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  businessType: varchar("business_type", { length: 100 }),
  sharePercentage: varchar("share_percentage", { length: 50 }),
  businessNotes: text("business_notes"),
});
export type MatterBusinessRecord = typeof matterBusiness.$inferSelect;
export type InsertMatterBusinessRecord = typeof matterBusiness.$inferInsert;

// ── Matter Trust Clauses ──────────────────────────────────────────────────────

export const matterTrustClauses = mysqlTable("matter_trust_clauses", {
  id: int("id").primaryKey().autoincrement(),
  matterId: int("matter_id").notNull(),
  clientRole: varchar("client_role", { length: 20 }).notNull().default("shared"),
  trustType: varchar("trust_type", { length: 50 }).notNull(),
  enabled: tinyint("enabled").notNull().default(0),
  trustees: json("trustees").$type<Array<{ name: string; address: string }>>(),
  lifeTenants: json("life_tenants").$type<Array<{ name: string; address: string }>>(),
  beneficiaries: json("beneficiaries").$type<Array<{ name: string; relationship: string }>>(),
  propertyAddress: text("property_address"),
  sharePercentage: varchar("share_percentage", { length: 20 }),
  namedBeneficiary: varchar("named_beneficiary", { length: 255 }),
  namedBeneficiaryDisability: text("named_beneficiary_disability"),
  ageVesting: int("age_vesting"),
  notes: text("notes"),
  createdAt: bigint("created_at", { mode: "number" }).notNull().default(0),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull().default(0),
});

export type MatterTrustClause = typeof matterTrustClauses.$inferSelect;
export type NewMatterTrustClause = typeof matterTrustClauses.$inferInsert;
