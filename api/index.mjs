var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  lpaRecords: () => lpaRecords,
  matterBeneficiaries: () => matterBeneficiaries,
  matterBusiness: () => matterBusiness,
  matterClients: () => matterClients,
  matterExclusions: () => matterExclusions,
  matterExecutors: () => matterExecutors,
  matterGifts: () => matterGifts,
  matterGuardians: () => matterGuardians,
  matterLettersOfWishes: () => matterLettersOfWishes,
  matterPeoplePool: () => matterPeoplePool,
  matterPets: () => matterPets,
  matterProperty: () => matterProperty,
  matterTrustClauses: () => matterTrustClauses,
  matterWishes: () => matterWishes,
  matters: () => matters,
  users: () => users,
  willInstructions: () => willInstructions
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, tinyint, bigint } from "drizzle-orm/mysql-core";
var users, willInstructions, lpaRecords, matters, matterClients, matterExecutors, matterGuardians, matterBeneficiaries, matterWishes, matterGifts, matterPets, matterProperty, matterBusiness, matterTrustClauses, matterExclusions, matterLettersOfWishes, matterPeoplePool;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    willInstructions = mysqlTable("will_instructions", {
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
      client1MarriagePlans: varchar("client1MarriagePlans", { length: 32 }),
      // yes/no/not_applicable
      client1MarriagePlanDetails: text("client1MarriagePlanDetails"),
      client1HasChildren: varchar("client1HasChildren", { length: 8 }),
      client1TotalChildren: varchar("client1TotalChildren", { length: 20 }),
      client1ChildrenSpecialNeeds: varchar("client1ChildrenSpecialNeeds", { length: 8 }),
      client1ChildrenSpecialNeedsDetails: text("client1ChildrenSpecialNeedsDetails"),
      client1ChildrenUnder18: json("client1ChildrenUnder18"),
      client1ChildrenOver18: json("client1ChildrenOver18"),
      client1ChildrenDetails: text("client1ChildrenDetails"),
      client1FamilyCircumstances: text("client1FamilyCircumstances"),
      client2MarriagePlans: varchar("client2MarriagePlans", { length: 32 }),
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
      client1Residency: varchar("client1Residency", { length: 64 }),
      // UK/Non-UK/Dual
      client1DomiciledUK: varchar("client1DomiciledUK", { length: 8 }),
      client1MentalCapacity: varchar("client1MentalCapacity", { length: 8 }),
      // yes/no
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
      ddArrangedAppointment: varchar("ddArrangedAppointment", { length: 8 }),
      // yes/no
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
      ddMeetingType: varchar("ddMeetingType", { length: 64 }),
      // Consultant office / Client house / Video Call / Telephone
      ddOthersPresent: varchar("ddOthersPresent", { length: 8 }),
      // yes/no
      ddOthersPresentNotes: text("ddOthersPresentNotes"),
      ddClientCanSee: varchar("ddClientCanSee", { length: 8 }),
      // yes/no
      ddClientCanHear: varchar("ddClientCanHear", { length: 8 }),
      // yes/no
      ddClientCanSpeak: varchar("ddClientCanSpeak", { length: 8 }),
      // yes/no
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
      propertyOwnership: varchar("propertyOwnership", { length: 64 }),
      mortgageOutstanding: varchar("mortgageOutstanding", { length: 8 }),
      mortgageBalance: varchar("mortgageBalance", { length: 100 }),
      mortgageTermRemaining: varchar("mortgageTermRemaining", { length: 100 }),
      mortgageLender: varchar("mortgageLender", { length: 200 }),
      propertyValue: varchar("propertyValue", { length: 32 }),
      hasOtherProperties: varchar("hasOtherProperties", { length: 8 }),
      otherProperties: text("otherProperties"),
      assetsOutsideUK: varchar("assetsOutsideUK", { length: 8 }),
      // NEW
      assetsOutsideUKDetails: text("assetsOutsideUKDetails"),
      // NEW
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
      hasLifeInsurance: varchar("hasLifeInsurance", { length: 8 }),
      // NEW
      lifeInsurancePolicies: json("lifeInsurancePolicies"),
      // NEW – array of policy objects
      lifeInsuranceNotes: text("lifeInsuranceNotes"),
      // NEW
      // ── Business Interests ─────────────────────────────────────────────────────
      hasBusinessInterests: varchar("hasBusinessInterests", { length: 8 }),
      // NEW
      businessInterests: text("businessInterests"),
      businessInterestsDetails: json("businessInterestsDetails"),
      // NEW – structured
      // ── Legacies & Gifts ───────────────────────────────────────────────────────
      specificGifts: json("specificGifts"),
      // ── Pets ───────────────────────────────────────────────────────────────────
      hasPets: varchar("hasPets", { length: 8 }),
      // NEW
      petsDetails: text("petsDetails"),
      // NEW
      petsCarer: text("petsCarer"),
      // NEW
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
      disasterClauseNotes: text("disasterClauseNotes"),
      // NEW – general disaster clause notes
      additionalNotes: text("additionalNotes"),
      // NEW – replaces specialNotes for clarity
      specialNotes: text("specialNotes"),
      // kept for backward compat
      // ── Optional Trust Clauses (rich multi-instance JSON) ────────────────────────
      protectivePropertyTrusts: json("protective_property_trusts"),
      // Array<PPTClause>
      discretionaryTrusts: json("discretionary_trusts"),
      // Array<DiscretionaryTrustClause>
      vulnerablePersonTrusts: json("vulnerable_person_trusts"),
      // Array<VulnerableTrustClause>
      nilRateBandTrusts: json("nil_rate_band_trusts"),
      // Array<NilRateBandClause>
      bereavedMinorTrusts: json("bereaved_minor_trusts"),
      // Array<BereavedMinorClause>
      age18To25Trusts: json("age_18_to_25_trusts"),
      // Array<Age18To25Clause>
      businessPropertyReliefs: json("business_property_reliefs"),
      // Array<BusinessPropertyReliefClause>
      // ── Manual Needs Assessment ─────────────────────────────────────────────────
      manualNeedsAssessment: text("manualNeedsAssessment"),
      considerLPA: tinyint("considerLPA").default(0),
      considerPPT: tinyint("considerPPT").default(0),
      considerAAT: tinyint("considerAAT").default(0),
      // ── AI Output ─────────────────────────────────────────────────────────────
      recommendationsJson: json("recommendationsJson"),
      aiRecommendationNarrative: text("aiRecommendationNarrative"),
      aiClientEmailDraft: text("aiClientEmailDraft"),
      // ── Edited Will HTML (manual back-office edits saved per willType) ───────────
      editedWillHtmlSingle: text("editedWillHtmlSingle"),
      editedWillHtmlClient1: text("editedWillHtmlClient1"),
      editedWillHtmlClient2: text("editedWillHtmlClient2"),
      // ── Edited Welcome Pack HTML (manual back-office edits) ──────────────────────
      editedWelcomePackHtml: text("editedWelcomePackHtml"),
      // ── Meta ───────────────────────────────────────────────────────────────────
      status: mysqlEnum("status", ["draft", "submitted", "processing", "complete", "cancelled"]).default("submitted").notNull(),
      currentStep: int("currentStep").notNull().default(1),
      emailSent: int("emailSent").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    lpaRecords = mysqlTable("lpa_records", {
      id: int("id").autoincrement().primaryKey(),
      willInstructionId: int("willInstructionId").notNull(),
      matterId: int("matter_id"),
      // nullable — set when LPA is created from a V2 matter
      clientNumber: int("clientNumber").notNull().default(1),
      // 1 or 2
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
      attorneys: json("attorneys"),
      // [{ title, firstNames, lastName, dob, address, postcode, email, isTrustCorporation? }]
      replacementAttorneys: json("replacementAttorneys"),
      // ── How attorneys make decisions ──────────────────────────────────────────
      // "jointly_severally" | "jointly" | "jointly_some" | "single"
      attorneyDecisionType: varchar("attorneyDecisionType", { length: 32 }),
      attorneyDecisionDetails: text("attorneyDecisionDetails"),
      // for jointly_some
      replacementDecisionDetails: text("replacementDecisionDetails"),
      // ── Certificate provider ──────────────────────────────────────────────────
      certProviderTitle: varchar("certProviderTitle", { length: 16 }),
      certProviderFirstNames: varchar("certProviderFirstNames", { length: 128 }),
      certProviderLastName: varchar("certProviderLastName", { length: 128 }),
      certProviderAddress: text("certProviderAddress"),
      certProviderPostcode: varchar("certProviderPostcode", { length: 16 }),
      certProviderEmail: varchar("certProviderEmail", { length: 320 }),
      // ── People to notify ──────────────────────────────────────────────────────
      peopleToNotify: json("peopleToNotify"),
      // [{ title, firstNames, lastName, address, postcode }]
      // ── LP1H-specific: life-sustaining treatment ──────────────────────────────
      lifeSustainingTreatment: varchar("lifeSustainingTreatment", { length: 16 }),
      // "give_authority" | "do_not_give"
      // ── LP1F-specific: when attorneys can act ────────────────────────────────
      whenAttorneysCanAct: varchar("whenAttorneysCanAct", { length: 32 }),
      // "capacity" | "whenever"
      // ── Preferences & instructions (Section 7) ───────────────────────────────
      preferences: text("preferences"),
      instructions: text("instructions"),
      // ── Section 12: Registration applicant ─────────────────────────────────
      applicantType: varchar("applicant_type", { length: 20 }),
      // 'donor' | 'attorneys'
      // ── Section 13: Who receives the LPA ────────────────────────────────────
      recipientType: varchar("recipient_type", { length: 20 }),
      // 'donor' | 'attorney' | 'other'
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
      feePaymentMethod: varchar("fee_payment_method", { length: 20 }),
      // 'card' | 'cheque'
      feeContactPhone: varchar("fee_contact_phone", { length: 30 }),
      reducedFee: int("reduced_fee").default(0),
      repeatApplication: int("repeat_application").default(0),
      caseNumber: varchar("case_number", { length: 50 }),
      // ── Meta ──────────────────────────────────────────────────────────────────
      status: mysqlEnum("status", ["draft", "complete"]).default("draft").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    matters = mysqlTable("matters", {
      id: int("id").primaryKey().autoincrement(),
      matterType: mysqlEnum("matter_type", ["single", "mirror"]).notNull(),
      fileReference: varchar("file_reference", { length: 100 }),
      status: mysqlEnum("status", ["draft", "complete"]).default("draft").notNull(),
      editedWillHtmlTestator1: text("edited_will_html_testator1"),
      editedWillHtmlTestator2: text("edited_will_html_testator2"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
    });
    matterClients = mysqlTable("matter_clients", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      clientRole: mysqlEnum("client_role", ["testator1", "testator2"]).notNull(),
      fullName: varchar("full_name", { length: 200 }),
      address: text("address"),
      dateOfBirth: varchar("date_of_birth", { length: 20 }),
      email: varchar("email", { length: 200 }),
      phone: varchar("phone", { length: 50 }),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
    });
    matterExecutors = mysqlTable("matter_executors", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      clientRole: mysqlEnum("client_role", ["testator1", "testator2", "shared"]).default("shared").notNull(),
      executorType: mysqlEnum("executor_type", ["primary", "substitute"]).default("primary").notNull(),
      sortOrder: int("sort_order").default(0).notNull(),
      title: varchar("title", { length: 20 }),
      fullName: varchar("full_name", { length: 200 }),
      address: text("address"),
      gender: varchar("gender", { length: 20 }),
      relationship: varchar("relationship", { length: 50 }),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    matterGuardians = mysqlTable("matter_guardians", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      guardianType: mysqlEnum("guardian_type", ["primary", "substitute"]).default("primary").notNull(),
      sortOrder: int("sort_order").default(0).notNull(),
      title: varchar("title", { length: 20 }),
      fullName: varchar("full_name", { length: 200 }),
      address: text("address"),
      gender: varchar("gender", { length: 20 }),
      relationship: varchar("relationship", { length: 50 }),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    matterBeneficiaries = mysqlTable("matter_beneficiaries", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      clientRole: mysqlEnum("client_role", ["testator1", "testator2", "shared"]).default("shared").notNull(),
      beneficiaryType: mysqlEnum("beneficiary_type", ["primary", "fallback"]).default("primary").notNull(),
      sortOrder: int("sort_order").default(0).notNull(),
      title: varchar("title", { length: 20 }),
      fullName: varchar("full_name", { length: 200 }),
      address: text("address"),
      relationship: varchar("relationship", { length: 100 }),
      shareFraction: varchar("share_fraction", { length: 50 }),
      includeIssue: int("include_issue").default(1),
      gender: varchar("gender", { length: 20 }),
      recipientGroup: varchar("recipient_group", { length: 100 }),
      divisionType: varchar("division_type", { length: 50 }),
      divisionNotes: text("division_notes"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    matterWishes = mysqlTable("matter_wishes", {
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
      updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
    });
    matterGifts = mysqlTable("matter_gifts", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      clientRole: mysqlEnum("client_role", ["testator1", "testator2", "shared"]).default("shared").notNull(),
      sortOrder: int("sort_order").default(1).notNull(),
      recipientGroup: varchar("recipient_group", { length: 100 }),
      recipientName: varchar("recipient_name", { length: 255 }),
      recipientAddress: text("recipient_address"),
      giftDescription: text("gift_description"),
      giftType: mysqlEnum("gift_type", ["monetary", "asset", "residue", "property"]).default("asset").notNull(),
      onSecondDeath: tinyint("on_second_death").default(0).notNull(),
      divisionType: varchar("division_type", { length: 20 }).default("equally"),
      divisionNotes: text("division_notes")
    });
    matterPets = mysqlTable("matter_pets", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      sortOrder: int("sort_order").default(1).notNull(),
      petName: varchar("pet_name", { length: 255 }),
      petType: varchar("pet_type", { length: 100 }),
      carerName: varchar("carer_name", { length: 255 }),
      carerAddress: text("carer_address"),
      careNotes: text("care_notes")
    });
    matterProperty = mysqlTable("matter_property", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      sortOrder: int("sort_order").default(1).notNull(),
      address: text("address"),
      ownershipType: mysqlEnum("ownership_type", ["sole", "joint_tenants", "tenants_in_common"]).default("sole").notNull(),
      mortgageOutstanding: int("mortgage_outstanding").default(0),
      mortgageLender: varchar("mortgage_lender", { length: 255 }),
      propertyNotes: text("property_notes"),
      giftOfProperty: int("gift_of_property").default(0),
      giftRecipientGroup: varchar("gift_recipient_group", { length: 100 }),
      giftRecipientName: varchar("gift_recipient_name", { length: 255 }),
      giftRecipientAddress: text("gift_recipient_address"),
      giftCondition: varchar("gift_condition", { length: 500 }),
      giftNotes: text("gift_notes")
    });
    matterBusiness = mysqlTable("matter_business", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      sortOrder: int("sort_order").default(1).notNull(),
      businessName: varchar("business_name", { length: 255 }),
      businessType: varchar("business_type", { length: 100 }),
      sharePercentage: varchar("share_percentage", { length: 50 }),
      businessNotes: text("business_notes")
    });
    matterTrustClauses = mysqlTable("matter_trust_clauses", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      clientRole: varchar("client_role", { length: 20 }).notNull().default("shared"),
      trustType: varchar("trust_type", { length: 50 }).notNull(),
      enabled: tinyint("enabled").notNull().default(0),
      trustees: json("trustees").$type(),
      lifeTenants: json("life_tenants").$type(),
      beneficiaries: json("beneficiaries").$type(),
      propertyAddress: text("property_address"),
      sharePercentage: varchar("share_percentage", { length: 20 }),
      namedBeneficiary: varchar("named_beneficiary", { length: 255 }),
      namedBeneficiaryDisability: text("named_beneficiary_disability"),
      ageVesting: int("age_vesting"),
      notes: text("notes"),
      // PPT termination triggers (1 = checked/enabled, default all on)
      terminateDeath: tinyint("terminate_death").notNull().default(1),
      terminateRemarriage: tinyint("terminate_remarriage").notNull().default(1),
      terminateCohabitation: tinyint("terminate_cohabitation").notNull().default(1),
      createdAt: bigint("created_at", { mode: "number" }).notNull().default(0),
      updatedAt: bigint("updated_at", { mode: "number" }).notNull().default(0)
    });
    matterExclusions = mysqlTable("matter_exclusions", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      clientRole: varchar("client_role", { length: 20 }).notNull().default("testator1"),
      fullName: varchar("full_name", { length: 255 }).notNull().default(""),
      relationship: varchar("relationship", { length: 128 }).notNull().default(""),
      reasonPreset: varchar("reason_preset", { length: 128 }),
      reasonCustom: text("reason_custom"),
      createdAt: bigint("created_at", { mode: "number" }).notNull().default(0),
      updatedAt: bigint("updated_at", { mode: "number" }).notNull().default(0)
    });
    matterLettersOfWishes = mysqlTable("matter_letters_of_wishes", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      clientRole: varchar("client_role", { length: 20 }).notNull().default("testator1"),
      content: text("content"),
      createdAt: bigint("created_at", { mode: "number" }).notNull().default(0),
      updatedAt: bigint("updated_at", { mode: "number" }).notNull().default(0)
    });
    matterPeoplePool = mysqlTable("matter_people_pool", {
      id: int("id").primaryKey().autoincrement(),
      matterId: int("matter_id").notNull(),
      fullName: varchar("full_name", { length: 255 }).notNull().default(""),
      dateOfBirth: varchar("date_of_birth", { length: 20 }).default(""),
      address: text("address"),
      relationship: varchar("relationship", { length: 128 }).default(""),
      sourceRole: varchar("source_role", { length: 64 }).default(""),
      createdAt: bigint("created_at", { mode: "number" }).notNull().default(0),
      updatedAt: bigint("updated_at", { mode: "number" }).notNull().default(0)
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  getDb: () => getDb,
  getUserByOpenId: () => getUserByOpenId,
  upsertUser: () => upsertUser
});
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/mattersDb.ts
var mattersDb_exports = {};
__export(mattersDb_exports, {
  clearEditedWillHtml: () => clearEditedWillHtml,
  createMatter: () => createMatter,
  deleteExclusion: () => deleteExclusion,
  deleteMatter: () => deleteMatter,
  deletePersonPool: () => deletePersonPool,
  getLetterOfWishes: () => getLetterOfWishes,
  getMatterById: () => getMatterById,
  listExclusions: () => listExclusions,
  listMatters: () => listMatters,
  listPeoplePool: () => listPeoplePool,
  replaceBeneficiaries: () => replaceBeneficiaries,
  replaceBusiness: () => replaceBusiness,
  replaceExecutors: () => replaceExecutors,
  replaceGifts: () => replaceGifts,
  replaceGuardians: () => replaceGuardians,
  replacePets: () => replacePets,
  replaceProperty: () => replaceProperty,
  replaceTrustClauses: () => replaceTrustClauses,
  saveEditedWillHtml: () => saveEditedWillHtml,
  updateMatter: () => updateMatter,
  upsertClient: () => upsertClient,
  upsertExclusion: () => upsertExclusion,
  upsertLetterOfWishes: () => upsertLetterOfWishes,
  upsertPersonPool: () => upsertPersonPool,
  upsertWishes: () => upsertWishes
});
import { eq as eq4, and, desc as desc2 } from "drizzle-orm";
async function d() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}
async function listMatters() {
  const db = await d();
  const rows = await db.select().from(matters).orderBy(desc2(matters.createdAt));
  return Promise.all(rows.map(enrichMatter));
}
async function getMatterById(id) {
  const db = await d();
  const rows = await db.select().from(matters).where(eq4(matters.id, id));
  if (!rows[0]) return null;
  return enrichMatter(rows[0]);
}
async function enrichMatter(matter) {
  const db = await d();
  const [clients, executors, guardians, beneficiaries, wishes, gifts, pets, properties, businesses, trustClauses, exclusions] = await Promise.all([
    db.select().from(matterClients).where(eq4(matterClients.matterId, matter.id)),
    db.select().from(matterExecutors).where(eq4(matterExecutors.matterId, matter.id)).orderBy(matterExecutors.sortOrder),
    db.select().from(matterGuardians).where(eq4(matterGuardians.matterId, matter.id)).orderBy(matterGuardians.sortOrder),
    db.select().from(matterBeneficiaries).where(eq4(matterBeneficiaries.matterId, matter.id)).orderBy(matterBeneficiaries.sortOrder),
    db.select().from(matterWishes).where(eq4(matterWishes.matterId, matter.id)),
    db.select().from(matterGifts).where(eq4(matterGifts.matterId, matter.id)).orderBy(matterGifts.sortOrder),
    db.select().from(matterPets).where(eq4(matterPets.matterId, matter.id)).orderBy(matterPets.sortOrder),
    db.select().from(matterProperty).where(eq4(matterProperty.matterId, matter.id)).orderBy(matterProperty.sortOrder),
    db.select().from(matterBusiness).where(eq4(matterBusiness.matterId, matter.id)).orderBy(matterBusiness.sortOrder),
    db.select().from(matterTrustClauses).where(eq4(matterTrustClauses.matterId, matter.id)),
    db.select().from(matterExclusions).where(eq4(matterExclusions.matterId, matter.id)).orderBy(matterExclusions.createdAt)
  ]);
  return { ...matter, clients, executors, guardians, beneficiaries, wishes, gifts, pets, properties, businesses, trustClauses, exclusions };
}
async function createMatter(data) {
  const db = await d();
  const result = await db.insert(matters).values(data);
  return result[0].insertId;
}
async function updateMatter(id, data) {
  const db = await d();
  await db.update(matters).set(data).where(eq4(matters.id, id));
}
async function deleteMatter(id) {
  const db = await d();
  await db.delete(matterExclusions).where(eq4(matterExclusions.matterId, id));
  await db.delete(matterTrustClauses).where(eq4(matterTrustClauses.matterId, id));
  await db.delete(matterBusiness).where(eq4(matterBusiness.matterId, id));
  await db.delete(matterProperty).where(eq4(matterProperty.matterId, id));
  await db.delete(matterPets).where(eq4(matterPets.matterId, id));
  await db.delete(matterGifts).where(eq4(matterGifts.matterId, id));
  await db.delete(matterWishes).where(eq4(matterWishes.matterId, id));
  await db.delete(matterBeneficiaries).where(eq4(matterBeneficiaries.matterId, id));
  await db.delete(matterGuardians).where(eq4(matterGuardians.matterId, id));
  await db.delete(matterExecutors).where(eq4(matterExecutors.matterId, id));
  await db.delete(matterClients).where(eq4(matterClients.matterId, id));
  await db.delete(matters).where(eq4(matters.id, id));
}
async function upsertClient(matterId, role, data) {
  const db = await d();
  const existing = await db.select().from(matterClients).where(
    and(eq4(matterClients.matterId, matterId), eq4(matterClients.clientRole, role))
  );
  if (existing[0]) {
    await db.update(matterClients).set(data).where(eq4(matterClients.id, existing[0].id));
  } else {
    await db.insert(matterClients).values({ matterId, clientRole: role, ...data });
  }
}
async function replaceExecutors(matterId, clientRole, rows) {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterExecutors).where(
      and(eq4(matterExecutors.matterId, matterId), eq4(matterExecutors.clientRole, clientRole))
    );
    if (rows.length > 0) {
      await tx.insert(matterExecutors).values(
        rows.map((r, i) => ({ ...r, matterId, clientRole, sortOrder: i }))
      );
    }
  });
}
async function replaceGuardians(matterId, rows) {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterGuardians).where(eq4(matterGuardians.matterId, matterId));
    if (rows.length > 0) {
      await tx.insert(matterGuardians).values(
        rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
      );
    }
  });
}
async function replaceBeneficiaries(matterId, clientRole, rows) {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterBeneficiaries).where(
      and(eq4(matterBeneficiaries.matterId, matterId), eq4(matterBeneficiaries.clientRole, clientRole))
    );
    if (rows.length > 0) {
      await tx.insert(matterBeneficiaries).values(
        rows.map((r, i) => ({ ...r, matterId, clientRole, sortOrder: i }))
      );
    }
  });
}
async function upsertWishes(matterId, clientRole, data) {
  const db = await d();
  const existing = await db.select().from(matterWishes).where(
    and(eq4(matterWishes.matterId, matterId), eq4(matterWishes.clientRole, clientRole))
  );
  if (existing[0]) {
    await db.update(matterWishes).set(data).where(eq4(matterWishes.id, existing[0].id));
  } else {
    await db.insert(matterWishes).values({ matterId, clientRole, ...data });
  }
}
async function replaceGifts(matterId, clientRole, rows) {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterGifts).where(
      and(eq4(matterGifts.matterId, matterId), eq4(matterGifts.clientRole, clientRole))
    );
    if (rows.length > 0) {
      await tx.insert(matterGifts).values(
        rows.map((r, i) => ({ ...r, matterId, clientRole, sortOrder: i }))
      );
    }
  });
}
async function replacePets(matterId, rows) {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterPets).where(eq4(matterPets.matterId, matterId));
    if (rows.length > 0) {
      await tx.insert(matterPets).values(
        rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
      );
    }
  });
}
async function replaceProperty(matterId, rows) {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterProperty).where(eq4(matterProperty.matterId, matterId));
    if (rows.length > 0) {
      await tx.insert(matterProperty).values(
        rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
      );
    }
  });
}
async function replaceBusiness(matterId, rows) {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterBusiness).where(eq4(matterBusiness.matterId, matterId));
    if (rows.length > 0) {
      await tx.insert(matterBusiness).values(
        rows.map((r, i) => ({ ...r, matterId, sortOrder: i }))
      );
    }
  });
}
async function replaceTrustClauses(matterId, clientRole, rows) {
  const db = await d();
  await db.transaction(async (tx) => {
    await tx.delete(matterTrustClauses).where(
      and(eq4(matterTrustClauses.matterId, matterId), eq4(matterTrustClauses.clientRole, clientRole))
    );
    if (rows.length > 0) {
      const now = Date.now();
      await tx.insert(matterTrustClauses).values(
        rows.map((r) => ({ ...r, matterId, clientRole, createdAt: now, updatedAt: now }))
      );
    }
  });
}
async function saveEditedWillHtml(matterId, testatorKey, html) {
  const db = await d();
  if (testatorKey === "testator1") {
    await db.update(matters).set({ editedWillHtmlTestator1: html }).where(eq4(matters.id, matterId));
  } else {
    await db.update(matters).set({ editedWillHtmlTestator2: html }).where(eq4(matters.id, matterId));
  }
}
async function listExclusions(matterId) {
  const db = await d();
  return db.select().from(matterExclusions).where(eq4(matterExclusions.matterId, matterId)).orderBy(matterExclusions.createdAt);
}
async function upsertExclusion(matterId, data) {
  const db = await d();
  const now = Date.now();
  if (data.id) {
    await db.update(matterExclusions).set({ ...data, updatedAt: now }).where(and(eq4(matterExclusions.id, data.id), eq4(matterExclusions.matterId, matterId)));
    return data.id;
  }
  const result = await db.insert(matterExclusions).values({ ...data, matterId, createdAt: now, updatedAt: now });
  return result[0].insertId;
}
async function deleteExclusion(id, matterId) {
  const db = await d();
  await db.delete(matterExclusions).where(
    and(eq4(matterExclusions.id, id), eq4(matterExclusions.matterId, matterId))
  );
}
async function getLetterOfWishes(matterId, clientRole) {
  const db = await d();
  const rows = await db.select().from(matterLettersOfWishes).where(
    and(eq4(matterLettersOfWishes.matterId, matterId), eq4(matterLettersOfWishes.clientRole, clientRole))
  );
  return rows[0] ?? null;
}
async function upsertLetterOfWishes(matterId, clientRole, content) {
  const db = await d();
  const now = Date.now();
  const existing = await db.select().from(matterLettersOfWishes).where(
    and(eq4(matterLettersOfWishes.matterId, matterId), eq4(matterLettersOfWishes.clientRole, clientRole))
  );
  if (existing[0]) {
    await db.update(matterLettersOfWishes).set({ content, updatedAt: now }).where(eq4(matterLettersOfWishes.id, existing[0].id));
  } else {
    await db.insert(matterLettersOfWishes).values({ matterId, clientRole, content, createdAt: now, updatedAt: now });
  }
}
async function listPeoplePool(matterId) {
  const db = await d();
  return db.select().from(matterPeoplePool).where(eq4(matterPeoplePool.matterId, matterId)).orderBy(matterPeoplePool.fullName);
}
async function upsertPersonPool(matterId, data) {
  const db = await d();
  const now = Date.now();
  if (data.id) {
    await db.update(matterPeoplePool).set({ fullName: data.fullName, dateOfBirth: data.dateOfBirth ?? "", address: data.address ?? "", relationship: data.relationship ?? "", sourceRole: data.sourceRole ?? "", updatedAt: now }).where(and(eq4(matterPeoplePool.id, data.id), eq4(matterPeoplePool.matterId, matterId)));
    return data.id;
  }
  const existing = await db.select().from(matterPeoplePool).where(and(eq4(matterPeoplePool.matterId, matterId), eq4(matterPeoplePool.fullName, data.fullName)));
  if (existing[0]) {
    await db.update(matterPeoplePool).set({ dateOfBirth: data.dateOfBirth ?? existing[0].dateOfBirth ?? "", address: data.address ?? existing[0].address ?? "", relationship: data.relationship ?? existing[0].relationship ?? "", sourceRole: data.sourceRole ?? existing[0].sourceRole ?? "", updatedAt: now }).where(eq4(matterPeoplePool.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(matterPeoplePool).values({ matterId, fullName: data.fullName, dateOfBirth: data.dateOfBirth ?? "", address: data.address ?? "", relationship: data.relationship ?? "", sourceRole: data.sourceRole ?? "", createdAt: now, updatedAt: now });
  return result[0].insertId;
}
async function deletePersonPool(id, matterId) {
  const db = await d();
  await db.delete(matterPeoplePool).where(
    and(eq4(matterPeoplePool.id, id), eq4(matterPeoplePool.matterId, matterId))
  );
}
async function clearEditedWillHtml(matterId, testatorKey) {
  const db = await d();
  if (testatorKey === "testator1") {
    await db.update(matters).set({ editedWillHtmlTestator1: null }).where(eq4(matters.id, matterId));
  } else {
    await db.update(matters).set({ editedWillHtmlTestator2: null }).where(eq4(matters.id, matterId));
  }
}
var init_mattersDb = __esm({
  "server/mattersDb.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/_core/index.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
init_env();
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body2 = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body2}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();
import { z as z6 } from "zod";
import { SignJWT as SignJWT2 } from "jose";

// server/routers/willInstructions.ts
import { z as z2 } from "zod";
init_db();
init_schema();
import { eq as eq2, desc } from "drizzle-orm";

// server/_core/llm.ts
init_env();

// server/emailService.ts
import nodemailer from "nodemailer";

// shared/willConstants.ts
var PRODUCTS = [
  { id: "single_will", label: "Single Will" },
  { id: "mirror_wills", label: "Mirror Wills" },
  { id: "lpa_property_finance", label: "LPA \u2013 Property & Finance" },
  { id: "lpa_health_welfare", label: "LPA \u2013 Health & Welfare" },
  { id: "both_lpas", label: "Both LPAs (Property & Finance + Health & Welfare)" },
  { id: "ppt", label: "Protective Property Trust (PPT)" },
  { id: "aat", label: "Family Trust (Asset Allocation Trust / AAT)" },
  { id: "right_to_occupy", label: "Right To Occupy" },
  { id: "discretionary_trust", label: "Discretionary Trust" },
  { id: "vulnerable_trust", label: "Vulnerable Person's Trust" },
  { id: "storage", label: "Will Storage" },
  { id: "bpr_trust", label: "BPR Trust (Business Property Relief Trust)" }
];
var ADMIN_EMAILS = [
  "office@genesisestateplanning.info",
  "customer-support@genesisestateplanning.info",
  "amelia@genesisestateplanning.info"
];

// server/emailService.ts
function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[Email] GMAIL_USER or GMAIL_APP_PASSWORD not set \u2014 email sending disabled");
    return null;
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    // SSL
    auth: { user, pass }
  });
}
function formatProductsList(products) {
  if (!Array.isArray(products) || products.length === 0) return "None specified";
  const labels = {
    single_will: "Single Will",
    mirror_wills: "Mirror Wills",
    lpa_property_finance: "LPA \u2013 Property & Finance",
    lpa_health_welfare: "LPA \u2013 Health & Welfare",
    both_lpas: "Both LPAs",
    ppt: "Protective Property Trust (PPT)",
    aat: "Asset Allocation Trust (AAT)",
    right_to_occupy: "Right To Occupy",
    discretionary_trust: "Discretionary Trust",
    vulnerable_trust: "Vulnerable Person's Trust",
    storage: "Will Storage"
  };
  return products.map((p) => labels[p] ?? p).join(", ");
}
function formatPersonList(persons) {
  if (!Array.isArray(persons) || persons.length === 0) return "None specified";
  return persons.map(
    (p) => `${p.prefix ?? ""} ${p.firstName ?? ""} ${p.lastName ?? ""}${p.relationship ? ` (${p.relationship})` : ""}`.trim()
  ).join("; ");
}
function buildEmailHtml(record, oneDriveUrl) {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim();
  const client2Name = record.client2FirstName ? `${record.client2Prefix ?? ""} ${record.client2FirstName} ${record.client2LastName ?? ""}`.trim() : null;
  const recommendations = Array.isArray(record.recommendationsJson) ? record.recommendationsJson : [];
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Georgia, serif; color: #1a3a2a; background: #f9f7f2; margin: 0; padding: 0; }
  .wrapper { max-width: 700px; margin: 0 auto; background: #fff; }
  .header { background: #1a3a2a; padding: 32px 40px; text-align: center; }
  .header h1 { color: #c9a84c; font-size: 22px; margin: 12px 0 4px; letter-spacing: 1px; }
  .header p { color: #a8c4b0; font-size: 13px; margin: 0; }
  .ref-badge { background: #c9a84c; color: #1a3a2a; font-weight: bold; padding: 8px 20px; border-radius: 4px; display: inline-block; margin: 20px 0; font-size: 14px; }
  .section { padding: 24px 40px; border-bottom: 1px solid #e8f0ec; }
  .section h2 { color: #1a3a2a; font-size: 16px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #c9a84c; }
  .field { display: flex; margin-bottom: 8px; }
  .field-label { font-weight: 600; min-width: 200px; color: #2d5a3d; font-size: 13px; }
  .field-value { color: #1a3a2a; font-size: 13px; }
  .rec-item { background: #f0f7f3; border-left: 4px solid #c9a84c; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 4px 4px 0; }
  .rec-item.high { border-left-color: #c0392b; }
  .rec-title { font-weight: 700; color: #1a3a2a; font-size: 14px; margin-bottom: 4px; }
  .rec-reason { color: #2d5a3d; font-size: 13px; }
  .email-draft { background: #f9f7f2; border: 1px solid #d4e6da; border-radius: 6px; padding: 20px; white-space: pre-wrap; font-family: Georgia, serif; font-size: 13px; color: #1a3a2a; line-height: 1.6; }
  .footer { background: #1a3a2a; padding: 20px 40px; text-align: center; }
  .footer p { color: #a8c4b0; font-size: 12px; margin: 4px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>GENESIS ESTATE PLANNING</h1>
    <p>Will Instruction \u2014 New Submission</p>
    <div class="ref-badge">Ref: ${record.referenceNumber}</div>
  </div>

  ${oneDriveUrl ? `<div style="background:#f0f7f3;border-bottom:3px solid #c9a84c;padding:18px 40px;text-align:center;">
    <a href="${oneDriveUrl}" style="display:inline-block;background:#1a3a2a;color:#c9a84c;font-family:Georgia,serif;font-size:14px;font-weight:bold;padding:11px 30px;border-radius:4px;text-decoration:none;letter-spacing:0.5px;">&#128196;&nbsp; View Full Document on OneDrive</a>
    <p style="margin:8px 0 0;font-size:11px;color:#5a8a6a;">Document automatically uploaded to your Will Instructions folder</p>
  </div>` : ""}

  <div class="section">
    <h2>Appointment Details</h2>
    <div class="field"><span class="field-label">Consultant:</span><span class="field-value">${record.consultantName ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Consultant Email:</span><span class="field-value">${record.consultantEmail ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Appointment Date:</span><span class="field-value">${record.appointmentDate ?? "\u2014"} ${record.appointmentTime ?? ""}</span></div>
    <div class="field"><span class="field-label">Case Coordinator:</span><span class="field-value">${record.caseCoordinatorName ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Price Quoted:</span><span class="field-value">${record.priceQuoted ? `\xA3${record.priceQuoted}` : "\u2014"}</span></div>
    <div class="field"><span class="field-label">Products Ordered:</span><span class="field-value">${formatProductsList(record.productsOrdered)}</span></div>
  </div>

  <div class="section">
    <h2>Client 1 \u2014 ${client1Name}</h2>
    <div class="field"><span class="field-label">Date of Birth:</span><span class="field-value">${record.client1Dob ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Address:</span><span class="field-value">${[record.client1AddressLine1, record.client1City, record.client1Postcode].filter(Boolean).join(", ") || "\u2014"}</span></div>
    <div class="field"><span class="field-label">Marital Status:</span><span class="field-value">${record.client1MaritalStatus ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Email:</span><span class="field-value">${record.client1Email ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Mobile:</span><span class="field-value">${record.client1Mobile ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Nationality:</span><span class="field-value">${record.client1Nationality ?? "\u2014"}</span></div>
  </div>

  ${client2Name ? `
  <div class="section">
    <h2>Client 2 \u2014 ${client2Name}</h2>
    <div class="field"><span class="field-label">Date of Birth:</span><span class="field-value">${record.client2Dob ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Address:</span><span class="field-value">${[record.client2AddressLine1, record.client2City, record.client2Postcode].filter(Boolean).join(", ") || "\u2014"}</span></div>
    <div class="field"><span class="field-label">Marital Status:</span><span class="field-value">${record.client2MaritalStatus ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Email:</span><span class="field-value">${record.client2Email ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Mobile:</span><span class="field-value">${record.client2Mobile ?? "\u2014"}</span></div>
  </div>
  ` : ""}

  <div class="section">
    <h2>Family Background</h2>
    <div class="field"><span class="field-label">C1 Marriage Plans:</span><span class="field-value">${record.client1MarriagePlans === "yes" ? `Yes \u2014 ${record.client1MarriagePlanDetails ?? ""}` : record.client1MarriagePlans === "no" ? "No" : "\u2014"}</span></div>
    <div class="field"><span class="field-label">C1 Has Children:</span><span class="field-value">${record.client1HasChildren === "yes" ? `Yes \u2014 ${record.client1ChildrenDetails ?? ""}` : record.client1HasChildren === "no" ? "No" : "\u2014"}</span></div>
    ${record.client1FamilyCircumstances ? `<div class="field"><span class="field-label">C1 Family Circumstances:</span><span class="field-value">${record.client1FamilyCircumstances}</span></div>` : ""}
    ${record.client2FirstName ? `
    <div class="field"><span class="field-label">C2 Marriage Plans:</span><span class="field-value">${record.client2MarriagePlans === "yes" ? `Yes \u2014 ${record.client2MarriagePlanDetails ?? ""}` : record.client2MarriagePlans === "no" ? "No" : "\u2014"}</span></div>
    <div class="field"><span class="field-label">C2 Has Children:</span><span class="field-value">${record.client2HasChildren === "yes" ? `Yes \u2014 ${record.client2ChildrenDetails ?? ""}` : record.client2HasChildren === "no" ? "No" : "\u2014"}</span></div>
    ` : ""}
  </div>

  <div class="section">
    <h2>Additional Background</h2>
    <div class="field"><span class="field-label">C1 Residency:</span><span class="field-value">${record.client1Residency ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">C1 Domiciled UK:</span><span class="field-value">${record.client1DomiciledUK ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">C1 Mental Capacity:</span><span class="field-value">${record.client1MentalCapacity ?? "\u2014"}</span></div>
    ${record.client1MentalCapacityNotes ? `<div class="field"><span class="field-label">C1 Capacity Notes:</span><span class="field-value">${record.client1MentalCapacityNotes}</span></div>` : ""}
    <div class="field"><span class="field-label">C1 Children (Past Rels):</span><span class="field-value">${record.client1ChildrenPastRelationships === "yes" ? `Yes \u2014 ${record.client1ChildrenPastDetails ?? ""}` : record.client1ChildrenPastRelationships === "no" ? "No" : "\u2014"}</span></div>
    ${record.client2FirstName ? `
    <div class="field"><span class="field-label">C2 Residency:</span><span class="field-value">${record.client2Residency ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">C2 Mental Capacity:</span><span class="field-value">${record.client2MentalCapacity ?? "\u2014"}</span></div>
    ` : ""}
  </div>

  <div class="section" style="background:#fff8f8;">
    <h2 style="color:#c0392b;">Due Diligence &amp; Compliance</h2>
    <div class="field"><span class="field-label">Arranged Appointment:</span><span class="field-value">${record.ddArrangedAppointment ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Knowledge of Estate:</span><span class="field-value">${record.ddKnowledgeOfEstate ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Knew Beneficiaries:</span><span class="field-value">${record.ddKnewBeneficiaries ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Signs of Influence:</span><span class="field-value" style="${record.ddSignsOfInfluence === "yes" ? "color:#c0392b;font-weight:bold;" : ""}">${record.ddSignsOfInfluence === "yes" ? `\u26A0 YES \u2014 ${record.ddSignsOfInfluenceNotes ?? ""}` : record.ddSignsOfInfluence === "no" ? "No" : "\u2014"}</span></div>
    <div class="field"><span class="field-label">Knew Appointees:</span><span class="field-value">${record.ddKnewAppointees ?? "\u2014"}</span></div>
  </div>

  <div class="section">
    <h2>Executors, Trustees &amp; Guardians</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="width:50%;vertical-align:top;padding-right:16px;">
        <strong style="color:#c9a84c;">Client 1</strong><br/>
        <div class="field"><span class="field-label">Primary Executors:</span><span class="field-value">${formatPersonList(record.client1Executors ?? record.executors)}</span></div>
        <div class="field"><span class="field-label">Reserved Executors:</span><span class="field-value">${formatPersonList(record.client1ReservedExecutors)}</span></div>
        <div class="field"><span class="field-label">Primary Guardians:</span><span class="field-value">${formatPersonList(record.client1Guardians ?? record.guardians)}</span></div>
        <div class="field"><span class="field-label">Reserved Guardians:</span><span class="field-value">${formatPersonList(record.client1ReservedGuardians)}</span></div>
      </td>${client2Name ? `<td style="width:50%;vertical-align:top;padding-left:16px;border-left:1px solid #e8f0ec;">
        <strong style="color:#c9a84c;">Client 2</strong><br/>
        <div class="field"><span class="field-label">Primary Executors:</span><span class="field-value">${formatPersonList(record.client2Executors)}</span></div>
        <div class="field"><span class="field-label">Reserved Executors:</span><span class="field-value">${formatPersonList(record.client2ReservedExecutors)}</span></div>
        <div class="field"><span class="field-label">Primary Guardians:</span><span class="field-value">${formatPersonList(record.client2Guardians)}</span></div>
        <div class="field"><span class="field-label">Reserved Guardians:</span><span class="field-value">${formatPersonList(record.client2ReservedGuardians)}</span></div>
      </td>` : ""}</tr>
    </table>
    <div class="field" style="margin-top:12px;"><span class="field-label">Trustees (Shared):</span><span class="field-value">${formatPersonList(record.trustees)}</span></div>
  </div>

  <div class="section">
    <h2>Funeral Wishes</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="width:50%;vertical-align:top;padding-right:16px;">
        <strong style="color:#c9a84c;">Client 1</strong><br/>
        <div class="field"><span class="field-label">Funeral Type:</span><span class="field-value">${record.client1FuneralType ?? record.funeralType ?? "\u2014"}</span></div>
        <div class="field"><span class="field-label">Wishes:</span><span class="field-value">${record.client1FuneralWishes ?? record.funeralWishes ?? "\u2014"}</span></div>
        <div class="field"><span class="field-label">Organ Donation:</span><span class="field-value">${(record.client1OrganDonation ?? record.organDonation) === "yes" ? "Yes" : (record.client1OrganDonation ?? record.organDonation) === "no" ? "No" : "\u2014"}</span></div>
      </td>${client2Name ? `<td style="width:50%;vertical-align:top;padding-left:16px;border-left:1px solid #e8f0ec;">
        <strong style="color:#c9a84c;">Client 2</strong><br/>
        <div class="field"><span class="field-label">Funeral Type:</span><span class="field-value">${record.client2FuneralType ?? "\u2014"}</span></div>
        <div class="field"><span class="field-label">Wishes:</span><span class="field-value">${record.client2FuneralWishes ?? "\u2014"}</span></div>
        <div class="field"><span class="field-label">Organ Donation:</span><span class="field-value">${record.client2OrganDonation === "yes" ? "Yes" : record.client2OrganDonation === "no" ? "No" : "\u2014"}</span></div>
      </td>` : ""}</tr>
    </table>
  </div>

  <div class="section">
    <h2>Legacies &amp; Gifts</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="width:50%;vertical-align:top;padding-right:16px;">
        <strong style="color:#c9a84c;">Client 1</strong><br/>
        ${Array.isArray(record.client1SpecificGifts) && record.client1SpecificGifts.length > 0 ? record.client1SpecificGifts.map((g, i) => `<div class="field"><span class="field-label">${g.isCharity ? `Charity ${i + 1}` : `Gift ${i + 1}`}:</span><span class="field-value">${g.description} \u2192 ${g.recipient}${g.value ? ` (${g.value})` : ""}</span></div>`).join("") : "<span style='color:#888;font-size:13px;'>No specific gifts</span>"}
      </td>${client2Name ? `<td style="width:50%;vertical-align:top;padding-left:16px;border-left:1px solid #e8f0ec;">
        <strong style="color:#c9a84c;">Client 2</strong><br/>
        ${Array.isArray(record.client2SpecificGifts) && record.client2SpecificGifts.length > 0 ? record.client2SpecificGifts.map((g, i) => `<div class="field"><span class="field-label">${g.isCharity ? `Charity ${i + 1}` : `Gift ${i + 1}`}:</span><span class="field-value">${g.description} \u2192 ${g.recipient}${g.value ? ` (${g.value})` : ""}</span></div>`).join("") : "<span style='color:#888;font-size:13px;'>No specific gifts</span>"}
      </td>` : ""}</tr>
    </table>
  </div>

  <div class="section">
    <h2>Beneficiaries &amp; Residuary Estate</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="width:50%;vertical-align:top;padding-right:16px;">
        <strong style="color:#c9a84c;">Client 1</strong><br/>
        <div class="field"><span class="field-label">Residuary Estate:</span><span class="field-value">${record.client1ResidualEstate ?? record.residuaryEstate ?? "\u2014"}</span></div>
        <div class="field"><span class="field-label">Beneficiaries:</span><span class="field-value">${formatPersonList(record.client1Beneficiaries ?? record.beneficiaries)}</span></div>
        <div class="field"><span class="field-label">Children Benefit Age:</span><span class="field-value">${record.client1ChildrenBenefitAge ?? record.childrenBenefitAge ?? "\u2014"}</span></div>
        ${record.client1HasVulnerableBeneficiary === "yes" ? `<div class="field"><span class="field-label">Vulnerable Beneficiary:</span><span class="field-value">Yes \u2014 ${record.client1VulnerableBeneficiaryDetails ?? ""}</span></div>` : ""}
      </td>${client2Name ? `<td style="width:50%;vertical-align:top;padding-left:16px;border-left:1px solid #e8f0ec;">
        <strong style="color:#c9a84c;">Client 2</strong><br/>
        <div class="field"><span class="field-label">Residuary Estate:</span><span class="field-value">${record.client2ResidualEstate ?? "\u2014"}</span></div>
        <div class="field"><span class="field-label">Beneficiaries:</span><span class="field-value">${formatPersonList(record.client2Beneficiaries)}</span></div>
        <div class="field"><span class="field-label">Children Benefit Age:</span><span class="field-value">${record.client2ChildrenBenefitAge ?? "\u2014"}</span></div>
        ${record.client2HasVulnerableBeneficiary === "yes" ? `<div class="field"><span class="field-label">Vulnerable Beneficiary:</span><span class="field-value">Yes \u2014 ${record.client2VulnerableBeneficiaryDetails ?? ""}</span></div>` : ""}
      </td>` : ""}</tr>
    </table>
  </div>

  <div class="section">
    <h2>Life Insurance &amp; Protection</h2>
    <div class="field"><span class="field-label">Has Life Insurance:</span><span class="field-value">${record.hasLifeInsurance === "yes" ? "Yes" : record.hasLifeInsurance === "no" ? "No" : "\u2014"}</span></div>
    ${record.hasLifeInsurance === "yes" && Array.isArray(record.lifeInsurancePolicies) && record.lifeInsurancePolicies.length > 0 ? record.lifeInsurancePolicies.map((p, i) => `<div class="field"><span class="field-label">Policy ${i + 1}:</span><span class="field-value">${p.provider}${p.sumAssured ? ` \u2014 \xA3${p.sumAssured}` : ""}${p.inTrust ? " (In Trust)" : ""}</span></div>`).join("") : ""}
    ${record.lifeInsuranceNotes ? `<div class="field"><span class="field-label">Notes:</span><span class="field-value">${record.lifeInsuranceNotes}</span></div>` : ""}
  </div>

  <div class="section">
    <h2>Business Interests</h2>
    <div class="field"><span class="field-label">Has Business Interests:</span><span class="field-value">${record.hasBusinessInterests === "yes" ? "Yes" : record.hasBusinessInterests === "no" ? "No" : "\u2014"}</span></div>
    ${record.hasBusinessInterests === "yes" && Array.isArray(record.businessInterestsDetails) && record.businessInterestsDetails.length > 0 ? record.businessInterestsDetails.map((b, i) => `<div class="field"><span class="field-label">Business ${i + 1}:</span><span class="field-value">${b.businessName} \u2014 ${b.natureOfBusiness}${b.ownershipPercentage ? ` (${b.ownershipPercentage}%)` : ""}</span></div>`).join("") : ""}
  </div>

  <div class="section">
    <h2>Property &amp; Assets</h2>
    <div class="field"><span class="field-label">Property Owned:</span><span class="field-value">${record.propertyOwned === "yes" ? "Yes" : "No"}</span></div>
    ${record.propertyOwned === "yes" ? `
    <div class="field"><span class="field-label">Property Address:</span><span class="field-value">${record.propertyAddress ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Ownership Type:</span><span class="field-value">${record.propertyOwnership ?? "\u2014"}</span></div>
    <div class="field"><span class="field-label">Mortgage Outstanding:</span><span class="field-value">${record.mortgageOutstanding === "yes" ? "Yes" : "No"}</span></div>
    <div class="field"><span class="field-label">Estimated Value:</span><span class="field-value">${record.propertyValue ? `\xA3${record.propertyValue}` : "\u2014"}</span></div>
    ` : ""}
    <div class="field"><span class="field-label">Estimated Estate Value:</span><span class="field-value">${record.estimatedEstateValue ? `\xA3${record.estimatedEstateValue}` : "\u2014"}</span></div>
    <div class="field"><span class="field-label">Assets Outside UK:</span><span class="field-value">${record.assetsOutsideUK === "yes" ? `Yes \u2014 ${record.assetsOutsideUKDetails ?? ""}` : record.assetsOutsideUK === "no" ? "No" : "\u2014"}</span></div>
    <div class="field"><span class="field-label">Care Concerns:</span><span class="field-value">${record.careConcerns === "yes" ? `Yes \u2014 ${record.careConcernDetails ?? ""}` : "No"}</span></div>
  </div>



  <div class="section">
    <h2>Pets</h2>
    <div class="field"><span class="field-label">Has Pets:</span><span class="field-value">${record.hasPets === "yes" ? `Yes \u2014 ${record.petsDetails ?? ""}` : record.hasPets === "no" ? "No" : "\u2014"}</span></div>
    ${record.petsCarer ? `<div class="field"><span class="field-label">Proposed Carer:</span><span class="field-value">${record.petsCarer}</span></div>` : ""}
  </div>



  <div class="section">
    <h2>Disaster Clause &amp; Final Notes</h2>
    ${record.disasterClauseClient1 ? `<div class="field"><span class="field-label">C1 Disaster Clause:</span><span class="field-value">${record.disasterClauseClient1}</span></div>` : ""}
    ${record.disasterClauseClient2 ? `<div class="field"><span class="field-label">C2 Disaster Clause:</span><span class="field-value">${record.disasterClauseClient2}</span></div>` : ""}
    ${record.disasterClauseNotes ? `<div class="field"><span class="field-label">Disaster Clause Notes:</span><span class="field-value">${record.disasterClauseNotes}</span></div>` : ""}
    ${record.additionalNotes ? `<div class="field"><span class="field-label">Additional Notes:</span><span class="field-value">${record.additionalNotes}</span></div>` : ""}
  </div>

  ${recommendations.length > 0 ? `
  <div class="section">
    <h2>Estate Planning Recommendations</h2>
    ${recommendations.map((r) => `
    <div class="rec-item${r.priority === "high" ? " high" : ""}">
      <div class="rec-title">&#11088; ${r.title}</div>
      <div class="rec-reason">${r.reason}</div>
    </div>`).join("")}
  </div>

  <div class="section">
    <h2>Internal Recommendation Narrative</h2>
    <p style="color:#1a3a2a;font-size:14px;line-height:1.7;">${(record.aiRecommendationNarrative ?? "").replace(/\n/g, "<br/>")}</p>
  </div>

  <div class="section">
    <h2>&#128231; Client Email Draft \u2014 Ready to Send</h2>
    <p style="font-size:12px;color:#666;margin-bottom:12px;">Copy and forward this email to the client at <strong>${record.client1Email ?? "client's email"}</strong></p>
    <div class="email-draft">${record.aiClientEmailDraft ?? ""}</div>
  </div>
  ` : `
  <div class="section">
    <h2>Estate Planning Recommendations</h2>
    <p style="color:#2d5a3d;">The client's current instruction covers all key estate planning areas. No additional recommendations at this time.</p>
  </div>
  `}

  <div class="footer">
    <p>Genesis Wills and Estate Planning | genesisestateplanning.info</p>
    <p>This is an automated notification. Reference: ${record.referenceNumber}</p>
  </div>
</div>
</body>
</html>`;
}
function buildEmailText(record, oneDriveUrl) {
  const client1Name = `${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim();
  return [
    `GENESIS ESTATE PLANNING \u2014 NEW WILL INSTRUCTION`,
    `Reference: ${record.referenceNumber}`,
    ``,
    `CLIENT: ${client1Name}`,
    `Consultant: ${record.consultantName ?? "\u2014"}`,
    `Date: ${record.appointmentDate ?? "\u2014"}`,
    `Products: ${formatProductsList(record.productsOrdered)}`,
    ``,
    `Please log in to the admin dashboard to view the full instruction and AI recommendations.`,
    ...oneDriveUrl ? [``, `OneDrive Document: ${oneDriveUrl}`] : []
  ].join("\n");
}
async function sendAdminEmail(record, oneDriveUrl, pdfBuffer) {
  const transporter = createTransporter();
  if (!transporter) return;
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim();
  const subject = `[Genesis EP] New Will Instruction \u2014 ${client1Name} | Ref: ${record.referenceNumber}`;
  const html = buildEmailHtml(record, oneDriveUrl);
  const text2 = buildEmailText(record, oneDriveUrl);
  const fromAddress = process.env.GMAIL_USER;
  const filename = `Genesis_${record.referenceNumber ?? record.id}.pdf`;
  for (const recipient of ADMIN_EMAILS) {
    try {
      const info = await transporter.sendMail({
        from: `"Genesis Wills and Estate Planning" <${fromAddress}>`,
        to: recipient,
        subject,
        text: text2,
        html,
        ...pdfBuffer ? {
          attachments: [{
            filename,
            content: pdfBuffer,
            contentType: "application/pdf"
          }]
        } : {}
      });
      console.log(`[Email] Sent to ${recipient} \u2014 messageId: ${info.messageId}`);
    } catch (err) {
      console.error(`[Email] Failed to send to ${recipient}:`, err);
    }
  }
}

// server/clientEmailService.ts
import nodemailer2 from "nodemailer";
function buildConsiderHtml(record) {
  const considerLPA = !!record.considerLPA;
  const considerPPT = !!record.considerPPT;
  const considerAAT = !!record.considerAAT;
  const manualNeeds = record.manualNeedsAssessment?.trim();
  if (!considerLPA && !considerPPT && !considerAAT && !manualNeeds) return "";
  const bullets = [];
  if (considerLPA) bullets.push(
    `<li style="margin:0 0 8px;font-size:13px;color:#374151;line-height:1.6;"><strong>Lasting Power of Attorney (LPA)</strong> &mdash; A legal document appointing trusted people to manage health, welfare, property and finances if mental capacity is lost.</li>`
  );
  if (considerPPT) bullets.push(
    `<li style="margin:0 0 8px;font-size:13px;color:#374151;line-height:1.6;"><strong>Protective Property Trust (PPT)</strong> &mdash; A Will trust that ring-fences the deceased&rsquo;s share of the family home, protecting it from care-home fees, remarriage or creditors while allowing the survivor to remain in the property.</li>`
  );
  if (considerAAT) bullets.push(
    `<li style="margin:0 0 8px;font-size:13px;color:#374151;line-height:1.6;"><strong>Asset Allocation Trust (AAT)</strong> &mdash; An Asset Allocation Trust (AAT) is a flexible discretionary trust that helps you manage inheritance tax, reduce probate delays on trust&#8209;owned assets, and protect family inheritances from the impact of future care fees.</li>`
  );
  let html = `<div style="background:#f0f7f3;border-left:4px solid #1a4d35;border-radius:4px;padding:18px 20px;">
    <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:15px;font-weight:bold;color:#1a4d35;">
      Needs Assessment &amp; Recommendations
    </p>`;
  if (bullets.length) {
    html += `<p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#1a4d35;">Client should consider:</p>
    <ul style="margin:0 0 12px;padding-left:18px;">${bullets.join("")}</ul>`;
  }
  if (manualNeeds) {
    if (bullets.length) {
      html += `<p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#1a4d35;">Additional notes:</p>`;
    }
    html += `<p style="margin:0;font-size:13px;color:#374151;line-height:1.6;white-space:pre-line;">${manualNeeds}</p>`;
  }
  html += `</div>`;
  return html;
}
function buildConsiderText(record) {
  const considerLPA = !!record.considerLPA;
  const considerPPT = !!record.considerPPT;
  const considerAAT = !!record.considerAAT;
  const manualNeeds = record.manualNeedsAssessment?.trim();
  if (!considerLPA && !considerPPT && !considerAAT && !manualNeeds) {
    return "No needs assessment or recommendations were recorded for this instruction.";
  }
  const lines = [];
  if (considerLPA || considerPPT || considerAAT) {
    lines.push("Client should consider:");
    if (considerLPA) lines.push("  \u2022 Lasting Power of Attorney (LPA) \u2014 A legal document appointing trusted people to manage health, welfare, property and finances if mental capacity is lost.");
    if (considerPPT) lines.push("  \u2022 Protective Property Trust (PPT) \u2014 A Will trust that ring-fences the deceased's share of the family home, protecting it from care-home fees, remarriage or creditors while allowing the survivor to remain in the property.");
    if (considerAAT) lines.push("  \u2022 Asset Allocation Trust (AAT) \u2014 An Asset Allocation Trust (AAT) is a flexible discretionary trust that helps you manage inheritance tax, reduce probate delays on trust\u2011owned assets, and protect family inheritances from the impact of future care fees.");
  }
  if (manualNeeds) {
    if (lines.length) lines.push("");
    lines.push("Additional notes:");
    lines.push(manualNeeds);
  }
  return lines.join("\n");
}
function safe(v) {
  return v?.trim() || "\u2014";
}
function safeArr(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    return JSON.parse(v) || [];
  } catch {
    return [];
  }
}
function getProductLabel(id) {
  return PRODUCTS.find((p) => p.id === id)?.label ?? id;
}
function formatProductsList2(products) {
  const arr = safeArr(products);
  if (!arr.length) return "\u2014";
  return arr.map(getProductLabel).join(", ");
}
function createTransporter2() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[ClientEmail] GMAIL_USER or GMAIL_APP_PASSWORD not set \u2014 skipping client email.");
    return null;
  }
  return nodemailer2.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass }
  });
}
function buildClientEmailPreview(record) {
  return buildClientEmailHtml(record);
}
function buildClientEmailHtml(record) {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const products = formatProductsList2(record.productsOrdered);
  const ref = safe(record.referenceNumber);
  const appointmentDate = record.appointmentDate ? new Date(record.appointmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "\u2014";
  const consultantName = safe(record.consultantName);
  const _recsInner1 = buildConsiderHtml(record);
  const recsHtml = _recsInner1 ? `<tr><td style="padding:0 32px 24px;">${_recsInner1}</td></tr>` : `<tr><td style="padding:0 32px 24px;">
          <div style="background:#f0f7f3;border-left:4px solid #1a4d35;border-radius:4px;padding:18px 20px;">
            <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:15px;font-weight:bold;color:#1a4d35;">Your Recommendations</p>
            <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">You will receive a follow-up email containing the full details of the recommendations discussed during your appointment.</p>
          </div></td></tr>`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a4d35 0%,#2d6b4a 100%);padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:0.3px;">
                      Genesis Wills and Estate Planning
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#b8d4c2;">Will Instruction Confirmation</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 20px;">
              <p style="margin:0 0 12px;font-size:15px;color:#111827;line-height:1.6;">
                Dear ${client1Name},
              </p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">
                Thank you for your appointment with us at Genesis Wills and Estate Planning. We are pleased to confirm that your Will instruction has been received from your adviser and is now being processed by our admin team.
              </p>
            </td>
          </tr>

          <!-- Reference box -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a4d35;border-radius:8px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#b8d4c2;text-transform:uppercase;letter-spacing:1px;">Reference Number</p>
                    <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#b8860b;letter-spacing:1px;">${ref}</p>
                    <p style="margin:8px 0 0;font-size:12px;color:#b8d4c2;">Please quote this reference in all correspondence with us.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Appointment summary -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:15px;font-weight:bold;color:#1a4d35;">Appointment Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <tr style="background:#f9fafb;">
                  <td style="padding:10px 16px;font-size:12px;font-weight:bold;color:#6b7280;width:40%;border-bottom:1px solid #e5e7eb;">Appointment Date</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">${appointmentDate}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:12px;font-weight:bold;color:#6b7280;border-bottom:1px solid #e5e7eb;">Consultant</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">${consultantName}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td style="padding:10px 16px;font-size:12px;font-weight:bold;color:#6b7280;">Products Ordered</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;">${products}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Recommendations -->
          ${recsHtml}

          <!-- Next steps -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:15px;font-weight:bold;color:#1a4d35;">What Happens Next</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
    ["1", "Instruction Review", "Our team will review your completed Will instruction and prepare your Welcome pack which is a summary of the information taken during the appointment (it is for you to review to make sure all information is correct before production of your draft)."],
    ["2", "Recommendations Follow-Up", "You will receive a separate email with the full details of the estate planning recommendations discussed during your appointment."],
    ["3", "Draft Documents", "Your draft Will (and any other documents ordered) will be sent to you for review and approval."],
    ["4", "Signing & Execution", "Once approved, we will guide you through the signing process to make your Will legally valid."]
  ].map(([num, title, desc3]) => `
                <tr>
                  <td style="padding:0 0 14px;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:12px;">
                          <div style="width:24px;height:24px;background:#1a4d35;border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:bold;color:#ffffff;">${num}</div>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 2px;font-size:13px;font-weight:bold;color:#111827;">${title}</p>
                          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">${desc3}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="background:#fef9ec;border:1px solid #b8860b;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#92660a;">Questions?</p>
                <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                  If you have any questions about your instruction, please contact your consultant
                  <strong>${consultantName !== "\u2014" ? ` ${consultantName}` : ""}</strong>
                  or reply to this email and our team will be happy to help.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a4d35;padding:20px 32px;">
              <p style="margin:0;font-size:11px;color:#b8d4c2;text-align:center;line-height:1.6;">
                Genesis Wills and Estate Planning &nbsp;|&nbsp; Will Instruction Confirmation &nbsp;|&nbsp; Ref: ${ref}
              </p>
              <p style="margin:6px 0 0;font-size:10px;color:#6b9e80;text-align:center;">
                This email is intended solely for the named recipient. If you have received this in error, please disregard it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function buildClientEmailText(record) {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const products = formatProductsList2(record.productsOrdered);
  const ref = safe(record.referenceNumber);
  const appointmentDate = record.appointmentDate ? new Date(record.appointmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "\u2014";
  const recs = safeArr(record.recommendationsJson);
  return [
    `Dear ${client1Name},`,
    ``,
    `Thank you for your appointment with us at Genesis Wills and Estate Planning. We are pleased to confirm that your Will instruction has been received from your adviser and is now being processed by our admin team.`,
    ``,
    `REFERENCE NUMBER: ${ref}`,
    `Please quote this reference in all correspondence with us.`,
    ``,
    `APPOINTMENT SUMMARY`,
    `Date: ${appointmentDate}`,
    `Consultant: ${safe(record.consultantName)}`,
    `Products Ordered: ${products}`,
    ``,
    `RECOMMENDATIONS`,
    ...recs.length ? [
      `The following recommendations were discussed during your appointment. You will receive a follow-up email with the full details shortly.`,
      ``,
      ...recs.map((r, i) => `${i + 1}. ${r.title ?? "Recommendation"}${r.description ? `: ${r.description}` : ""}`)
    ] : [`You will receive a follow-up email containing the full details of the recommendations discussed during your appointment.`],
    ``,
    `WHAT HAPPENS NEXT`,
    `1. Our team will review your completed Will instruction and prepare your Welcome pack which is a summary of the information taken during the appointment (it is for you to review to make sure all information is correct before production of your draft).`,
    `2. You will receive a separate email with the full estate planning recommendations.`,
    `3. Your draft Will will be sent to you for review and approval.`,
    `4. Once approved, we will guide you through the signing process.`,
    ``,
    `If you have any questions, please contact your consultant or reply to this email.`,
    ``,
    `Genesis Wills and Estate Planning`
  ].join("\n");
}
async function sendClientConfirmationEmail(record) {
  const clientEmail = record.client1Email?.trim();
  if (!clientEmail) {
    console.log("[ClientEmail] No client email address on record \u2014 skipping client confirmation.");
    return;
  }
  const transporter = createTransporter2();
  if (!transporter) return;
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const subject = `Your Will Instruction Confirmation \u2014 Ref: ${safe(record.referenceNumber)} | Genesis Wills and Estate Planning`;
  const html = buildClientEmailHtml(record);
  const text2 = buildClientEmailText(record);
  const fromAddress = process.env.GMAIL_USER;
  try {
    const info = await transporter.sendMail({
      from: `"Genesis Wills and Estate Planning" <${fromAddress}>`,
      to: clientEmail,
      subject,
      text: text2,
      html
    });
    console.log(`[ClientEmail] Confirmation sent to ${clientEmail} \u2014 messageId: ${info.messageId}`);
    const client2Email = record.client2Email?.trim();
    if (client2Email && client2Email !== clientEmail) {
      const c2Name = `${record.client2Prefix ?? ""} ${record.client2FirstName ?? ""} ${record.client2LastName ?? ""}`.trim() || "Client 2";
      await transporter.sendMail({
        from: `"Genesis Wills and Estate Planning" <${fromAddress}>`,
        to: client2Email,
        subject,
        text: text2.replace(`Dear ${client1Name}`, `Dear ${c2Name}`),
        html: html.replace(`Dear ${client1Name}`, `Dear ${c2Name}`)
      });
      console.log(`[ClientEmail] Confirmation sent to Client 2 at ${client2Email}`);
    }
  } catch (err) {
    console.error(`[ClientEmail] Failed to send confirmation to ${clientEmail}:`, err);
  }
}
function buildAdviserEmailHtml(record) {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const client2Name = record.client2FirstName ? `${record.client2Prefix ?? ""} ${record.client2FirstName ?? ""} ${record.client2LastName ?? ""}`.trim() : null;
  const clientDisplay = client2Name ? `${client1Name} &amp; ${client2Name}` : client1Name;
  const ref = safe(record.referenceNumber);
  const products = formatProductsList2(record.productsOrdered);
  const appointmentDate = record.appointmentDate ? new Date(record.appointmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "\u2014";
  const consultantName = safe(record.consultantName);
  const _recsInner2 = buildConsiderHtml(record);
  const needsSection = _recsInner2 ? `<tr><td style="padding:0 32px 24px;">${_recsInner2}</td></tr>` : `<tr><td style="padding:0 32px 24px;">
          <div style="background:#f9fafb;border-left:4px solid #d1d5db;border-radius:4px;padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">No needs assessment or recommendations were recorded for this instruction.</p>
          </div></td></tr>`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a4d35 0%,#2d6b4a 100%);padding:28px 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#d4af37;letter-spacing:0.5px;">
                Genesis Wills and Estate Planning
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:1px;text-transform:uppercase;">
                Adviser Instruction Confirmation
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 16px;">
              <p style="margin:0 0 12px;font-size:15px;color:#111827;line-height:1.6;">
                Dear ${consultantName},
              </p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">
                This is to confirm that a Will instruction has been successfully submitted for the following client(s). Please find the details below for your records.
              </p>
            </td>
          </tr>

          <!-- Reference Banner -->
          <tr>
            <td style="padding:0 32px 20px;">
              <div style="background:linear-gradient(135deg,#1a4d35,#2d6b4a);border-radius:8px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">
                <div>
                  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;">Reference Number</p>
                  <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#d4af37;">${ref}</p>
                </div>
                <div style="text-align:right;">
                  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;">Appointment Date</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#ffffff;">${appointmentDate}</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Client Details -->
          <tr>
            <td style="padding:0 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <tr>
                  <td colspan="2" style="background:#f9fafb;padding:10px 16px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;font-weight:bold;color:#1a4d35;text-transform:uppercase;letter-spacing:0.5px;">Client Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#6b7280;width:40%;border-bottom:1px solid #f3f4f6;">Client(s)</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">${clientDisplay}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#6b7280;width:40%;">Products Ordered</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;font-weight:600;">${products}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Needs Assessment -->
          ${needsSection}

          <!-- Footer -->
          <tr>
            <td style="background:#1a4d35;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.6);">
                Genesis Wills and Estate Planning &nbsp;|&nbsp; This email is for adviser reference only
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function buildAdviserEmailText(record) {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const client2Name = record.client2FirstName ? `${record.client2Prefix ?? ""} ${record.client2FirstName ?? ""} ${record.client2LastName ?? ""}`.trim() : null;
  const clientDisplay = client2Name ? `${client1Name} & ${client2Name}` : client1Name;
  const ref = safe(record.referenceNumber);
  const products = formatProductsList2(record.productsOrdered);
  const appointmentDate = record.appointmentDate ? new Date(record.appointmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "\u2014";
  const consultantName = safe(record.consultantName);
  return `Genesis Wills and Estate Planning \u2014 Adviser Instruction Confirmation

Dear ${consultantName},

This is to confirm that a Will instruction has been successfully submitted for the following client(s).

Reference Number: ${ref}
Appointment Date: ${appointmentDate}
Client(s): ${clientDisplay}
Products Ordered: ${products}

NEEDS ASSESSMENT & RECOMMENDATIONS
${buildConsiderText(record)}

---
Genesis Wills and Estate Planning | This email is for adviser reference only
`;
}
async function sendAdviserConfirmationEmail(record) {
  const consultantEmail = record.consultantEmail?.trim();
  if (!consultantEmail) {
    console.log("[AdviserEmail] No consultant email on record \u2014 skipping adviser confirmation.");
    return;
  }
  const transporter = createTransporter2();
  if (!transporter) return;
  const ref = safe(record.referenceNumber);
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const subject = `Instruction Submitted \u2014 ${client1Name} | Ref: ${ref} | Genesis Wills and Estate Planning`;
  const html = buildAdviserEmailHtml(record);
  const text2 = buildAdviserEmailText(record);
  const fromAddress = process.env.GMAIL_USER;
  try {
    const info = await transporter.sendMail({
      from: `"Genesis Wills and Estate Planning" <${fromAddress}>`,
      to: consultantEmail,
      subject,
      html,
      text: text2
    });
    console.log(`[AdviserEmail] Confirmation sent to adviser ${consultantEmail} \u2014 messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[AdviserEmail] Failed to send adviser confirmation to ${consultantEmail}:`, err);
  }
}

// server/pdfGenerator.ts
import PDFDocument from "pdfkit";
import https from "https";
import http from "http";
var LOGO_URL = "/manus-storage/GenesisEstatePlanningLogoUSETHISONE_52afc400.png";
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}
async function fetchLogoBuffer() {
  try {
    const fs3 = await import("fs");
    const path3 = await import("path");
    const localPath = path3.join(process.cwd(), "../webdev-static-assets/GenesisEstatePlanningLogoUSETHISONE.png");
    if (fs3.existsSync(localPath)) return fs3.readFileSync(localPath);
    const baseUrl = `http://localhost:${process.env.PORT ?? 3e3}`;
    return await fetchBuffer(`${baseUrl}${LOGO_URL}`);
  } catch {
    return null;
  }
}
var GREEN = "#1a4d35";
var GOLD = "#b8860b";
var GREY = "#6b7280";
var BLACK = "#111827";
function safe2(v) {
  return v?.trim() || "\u2014";
}
function yesNo(v) {
  if (!v) return "\u2014";
  return v === "yes" ? "Yes" : v === "no" ? "No" : v;
}
function safeArr2(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    return JSON.parse(v) || [];
  } catch {
    return [];
  }
}
async function generateWillPdf(record) {
  const logoBuffer = await fetchLogoBuffer().catch(() => null);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    const pageW = doc.page.width - 100;
    doc.rect(0, 0, doc.page.width, 110).fill(GREEN);
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, doc.page.width - 180, 10, { height: 85, fit: [160, 85] });
      } catch {
      }
    }
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text("Genesis Wills and Estate Planning", 50, 30);
    doc.font("Helvetica").fontSize(11).fillColor(GOLD).text("Will Instruction Summary", 50, 56);
    doc.fillColor("#ffffff").fontSize(9).text(`Reference: ${safe2(record.referenceNumber)}   |   Generated: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, 50, 80);
    doc.y = 130;
    const sectionHeading2 = (title) => {
      if (doc.y > doc.page.height - 120) doc.addPage();
      doc.moveDown(0.5);
      doc.rect(50, doc.y, pageW, 22).fill(GREEN);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text(title.toUpperCase(), 58, doc.y - 18);
      doc.moveDown(0.8);
      doc.fillColor(BLACK);
    };
    const field = (label, value) => {
      if (doc.y > doc.page.height - 60) doc.addPage();
      const startY = doc.y;
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(GREY).text(label, 50, startY, { width: 160, continued: false });
      doc.font("Helvetica").fontSize(8.5).fillColor(BLACK).text(value, 220, startY, { width: pageW - 170 });
      doc.moveDown(0.35);
    };
    const subHeading = (title) => {
      doc.moveDown(0.4);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD).text(title, 50);
      doc.font("Helvetica").fillColor(BLACK);
      doc.moveDown(0.3);
    };
    sectionHeading2("1. Appointment Details");
    field("Date", safe2(record.appointmentDate));
    field("Time", safe2(record.appointmentTime));
    field("Price Quoted", safe2(record.priceQuoted));
    field("Estimated Draft Date", safe2(record.estimatedDraftDate));
    field("Will Type", safe2(record.willType));
    const products = safeArr2(record.productsOrdered);
    field("Products Ordered", products.length ? products.join(", ") : "\u2014");
    subHeading("Consultant");
    field("Name", safe2(record.consultantName));
    field("Email", safe2(record.consultantEmail));
    field("Phone", safe2(record.consultantPhone));
    subHeading("Case Coordinator");
    field("Name", safe2(record.caseCoordinatorName));
    field("Email", safe2(record.caseCoordinatorEmail));
    field("Phone", safe2(record.caseCoordinatorPhone));
    sectionHeading2("2. Client 1");
    const c1Name = [record.client1Prefix, record.client1FirstName, record.client1MiddleName, record.client1LastName].filter(Boolean).join(" ");
    field("Full Name", safe2(c1Name));
    field("Date of Birth", safe2(record.client1Dob));
    field("Marital Status", safe2(record.client1MaritalStatus));
    field("Nationality", safe2(record.client1Nationality));
    field("Job Title", safe2(record.client1JobTitle));
    field("Address", [record.client1AddressLine1, record.client1City, record.client1Postcode].filter(Boolean).join(", ") || "\u2014");
    field("Daytime Phone", safe2(record.client1DaytimePhone));
    field("Mobile", safe2(record.client1Mobile));
    field("Email", safe2(record.client1Email));
    if (record.client2FirstName || record.client2LastName) {
      sectionHeading2("3. Client 2");
      const c2Name = [record.client2Prefix, record.client2FirstName, record.client2MiddleName, record.client2LastName].filter(Boolean).join(" ");
      field("Full Name", safe2(c2Name));
      field("Date of Birth", safe2(record.client2Dob));
      field("Marital Status", safe2(record.client2MaritalStatus));
      field("Nationality", safe2(record.client2Nationality));
      field("Job Title", safe2(record.client2JobTitle));
      field("Address", [record.client2AddressLine1, record.client2City, record.client2Postcode].filter(Boolean).join(", ") || "\u2014");
      field("Daytime Phone", safe2(record.client2DaytimePhone));
      field("Mobile", safe2(record.client2Mobile));
      field("Email", safe2(record.client2Email));
    }
    sectionHeading2("4. Family Background");
    subHeading("Client 1");
    field("Marriage Plans", yesNo(record.client1MarriagePlans));
    if (record.client1MarriagePlanDetails) field("Details", safe2(record.client1MarriagePlanDetails));
    field("Has Children", yesNo(record.client1HasChildren));
    field("Total Children", safe2(record.client1TotalChildren));
    const c1Under18 = safeArr2(record.client1ChildrenUnder18);
    if (c1Under18.length) {
      subHeading("Minor Children (Client 1)");
      c1Under18.forEach((child, i) => field(`Child ${i + 1}`, `${safe2(child.name)} \u2014 DOB: ${safe2(child.dob)}`));
    }
    if (record.client2FirstName) {
      subHeading("Client 2");
      field("Marriage Plans", yesNo(record.client2MarriagePlans));
      field("Has Children", yesNo(record.client2HasChildren));
      field("Total Children", safe2(record.client2TotalChildren));
      const c2Under18 = safeArr2(record.client2ChildrenUnder18);
      if (c2Under18.length) {
        subHeading("Minor Children (Client 2)");
        c2Under18.forEach((child, i) => field(`Child ${i + 1}`, `${safe2(child.name)} \u2014 DOB: ${safe2(child.dob)}`));
      }
    }
    sectionHeading2("5. Due Diligence");
    field("Arranged Appointment", yesNo(record.ddArrangedAppointment));
    field("Knowledge of Estate", yesNo(record.ddKnowledgeOfEstate));
    field("Knew Beneficiaries", yesNo(record.ddKnewBeneficiaries));
    field("Signs of Influence", yesNo(record.ddSignsOfInfluence));
    field("Knew Appointees", yesNo(record.ddKnewAppointees));
    field("Mental Capacity (C1)", yesNo(record.client1MentalCapacity));
    if (record.client2FirstName) field("Mental Capacity (C2)", yesNo(record.client2MentalCapacity));
    sectionHeading2("6. Executors & Guardians");
    const executors = safeArr2(record.executors);
    if (executors.length) {
      subHeading("Executors");
      executors.forEach((e, i) => field(`Executor ${i + 1}`, `${safe2(e.firstName)} ${safe2(e.lastName)} \u2014 ${safe2(e.relationship)}`));
    }
    const reservedExecutors = safeArr2(record.reservedExecutors);
    if (reservedExecutors.length) {
      subHeading("Reserved Executors");
      reservedExecutors.forEach((e, i) => field(`Reserved ${i + 1}`, `${safe2(e.firstName)} ${safe2(e.lastName)}`));
    }
    const guardians = safeArr2(record.guardians);
    if (guardians.length) {
      subHeading("Guardians");
      guardians.forEach((g, i) => field(`Guardian ${i + 1}`, `${safe2(g.firstName)} ${safe2(g.lastName)} \u2014 ${safe2(g.relationship)}`));
    }
    sectionHeading2("7. Property & Assets");
    field("Property Owned", yesNo(record.propertyOwned));
    if (record.propertyOwned === "yes") {
      field("Address", safe2(record.propertyAddress));
      field("Ownership Type", safe2(record.propertyOwnership));
      field("Property Value", safe2(record.propertyValue));
      field("Mortgage Outstanding", yesNo(record.mortgageOutstanding));
      if (record.mortgageOutstanding === "yes") {
        field("Mortgage Balance", safe2(record.mortgageBalance));
        field("Mortgage Term Remaining", safe2(record.mortgageTermRemaining));
        field("Mortgage Lender", safe2(record.mortgageLender));
      }
    }
    subHeading("Client 1 Financial Assets");
    field("Bank Accounts", safe2(record.bankAccounts));
    field("Investments", safe2(record.investments));
    field("Pension Details", safe2(record.pensionDetails));
    field("Estimated Estate Value", safe2(record.estimatedEstateValue));
    if (record.client2FirstName) {
      subHeading("Client 2 Financial Assets");
      field("Bank Accounts", safe2(record.client2BankAccounts));
      field("Investments", safe2(record.client2Investments));
      field("Pension Details", safe2(record.client2PensionDetails));
      field("Estimated Estate Value", safe2(record.client2EstimatedEstateValue));
    }
    sectionHeading2("8. Life Insurance");
    field("Has Life Insurance", yesNo(record.hasLifeInsurance));
    const policies = safeArr2(record.lifeInsurancePolicies);
    if (policies.length) {
      policies.forEach((p, i) => {
        subHeading(`Policy ${i + 1}`);
        field("Provider", safe2(p.provider));
        field("Policy Number", safe2(p.policyNumber));
        field("Sum Assured", safe2(p.sumAssured));
        field("Term Remaining", safe2(p.termRemaining));
        field("In Trust", p.inTrust ? "Yes" : "No");
        field("Beneficiary", safe2(p.beneficiary));
        if (p.notes) field("Notes", safe2(p.notes));
      });
    }
    if (record.lifeInsuranceNotes) field("General Notes", safe2(record.lifeInsuranceNotes));
    if (record.hasBusinessInterests === "yes") {
      sectionHeading2("9. Business Interests");
      const businesses = safeArr2(record.businessInterestsDetails);
      businesses.forEach((b, i) => {
        subHeading(`Business ${i + 1}`);
        field("Name", safe2(b.businessName));
        field("Nature", safe2(b.natureOfBusiness));
        field("Ownership %", safe2(b.ownershipPercentage));
        if (b.notes) field("Notes", safe2(b.notes));
      });
    }
    sectionHeading2("10. Wishes & Beneficiaries");
    const beneficiaries = safeArr2(record.beneficiaries);
    if (beneficiaries.length) {
      subHeading("Beneficiaries");
      beneficiaries.forEach((b, i) => field(`Beneficiary ${i + 1}`, `${safe2(b.firstName)} ${safe2(b.lastName)} \u2014 ${safe2(b.share)} (${safe2(b.relationship)})`));
    }
    field("Children Benefit Age", safe2(record.childrenBenefitAge));
    field("Residuary Estate", safe2(record.residuaryEstate));
    field("Backup Clause", safe2(record.residuaryBackup));
    const gifts = safeArr2(record.specificGifts);
    if (gifts.length) {
      subHeading("Specific Gifts");
      gifts.forEach((g, i) => field(`Gift ${i + 1}`, `${safe2(g.description)} \u2192 ${safe2(g.recipient)}${g.value ? ` (${g.value})` : ""}${g.isCharity ? " [Charity]" : ""}`));
    }
    sectionHeading2("11. Funeral Wishes");
    field("Funeral Type", safe2(record.funeralType));
    field("Funeral Wishes", safe2(record.funeralWishes));
    field("Organ Donation", yesNo(record.organDonation));
    if (record.hasPets === "yes") {
      sectionHeading2("12. Pets");
      field("Pet Details", safe2(record.petsDetails));
      field("Preferred Carer", safe2(record.petsCarer));
    }
    sectionHeading2("13. Additional Notes & Disaster Clause");
    field("Disaster Clause Notes", safe2(record.disasterClauseNotes));
    field("Additional Notes", safe2(record.additionalNotes));
    field("Special Notes", safe2(record.specialNotes));
    {
      const r = record;
      const considerLPA = !!r.considerLPA;
      const considerPPT = !!r.considerPPT;
      const considerAAT = !!r.considerAAT;
      const needsText = r.manualNeedsAssessment || record.aiRecommendationNarrative;
      if (considerLPA || considerPPT || considerAAT || needsText) {
        sectionHeading2("14. Needs Assessment & Recommendations");
        if (considerLPA || considerPPT || considerAAT) {
          doc.font("Helvetica-Bold").fontSize(8.5).fillColor(BLACK).text("Client should consider:", 50, doc.y, { width: pageW });
          doc.moveDown(0.3);
          if (considerLPA) {
            doc.font("Helvetica").fontSize(8.5).fillColor(BLACK).text("\u2022  Lasting Power of Attorney (LPA) \u2014 A legal document appointing trusted people to manage health, welfare, property and finances if mental capacity is lost.", 55, doc.y, { width: pageW - 5 });
            doc.moveDown(0.25);
          }
          if (considerPPT) {
            doc.font("Helvetica").fontSize(8.5).fillColor(BLACK).text("\u2022  Protective Property Trust (PPT) \u2014 A Will trust that ring-fences the deceased\u2019s share of the family home, protecting it from care-home fees, remarriage or creditors while allowing the survivor to remain in the property.", 55, doc.y, { width: pageW - 5 });
            doc.moveDown(0.25);
          }
          if (considerAAT) {
            doc.font("Helvetica").fontSize(8.5).fillColor(BLACK).text("\u2022  Asset Allocation Trust (AAT) \u2014 A flexible trust giving trustees discretion over how and when assets are distributed to beneficiaries, ideal for protecting inheritances for vulnerable or young beneficiaries.", 55, doc.y, { width: pageW - 5 });
            doc.moveDown(0.25);
          }
          doc.moveDown(0.25);
        }
        if (needsText) {
          if (considerLPA || considerPPT || considerAAT) {
            doc.font("Helvetica-Bold").fontSize(8.5).fillColor(BLACK).text("Additional notes:", 50, doc.y, { width: pageW });
            doc.moveDown(0.2);
          }
          doc.font("Helvetica").fontSize(8.5).fillColor(BLACK).text(needsText, 50, doc.y, { width: pageW, align: "left" });
          doc.moveDown(0.5);
        }
      }
    }
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      const footerY = doc.page.height - 35;
      doc.rect(0, footerY - 5, doc.page.width, 40).fill(GREEN);
      doc.fillColor("#ffffff").font("Helvetica").fontSize(7.5).text(`Genesis Wills and Estate Planning  |  Will Instruction \u2014 ${safe2(record.referenceNumber)}  |  CONFIDENTIAL`, 50, footerY, { width: pageW - 60, align: "left" });
      doc.text(`Page ${i + 1} of ${totalPages}`, 50, footerY, { width: pageW, align: "right" });
    }
    doc.end();
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// server/oneDriveService.ts
import { ConfidentialClientApplication } from "@azure/msal-node";
async function getAccessToken() {
  const clientId = process.env.AZURE_CLIENT_ID;
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  if (!clientId || !tenantId || !clientSecret) {
    throw new Error(
      "[OneDrive] AZURE_CLIENT_ID, AZURE_TENANT_ID, or AZURE_CLIENT_SECRET not set"
    );
  }
  const cca = new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret
    }
  });
  const result = await cca.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"]
  });
  if (!result?.accessToken) {
    throw new Error("[OneDrive] Failed to acquire access token");
  }
  return result.accessToken;
}
async function graphRequest(method, path3, token, body2, contentType) {
  const fetch3 = (await import("node-fetch")).default;
  const res = await fetch3(`https://graph.microsoft.com/v1.0${path3}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...contentType ? { "Content-Type": contentType } : {}
    },
    ...body2 !== void 0 ? { body: body2 } : {}
  });
  if (!res.ok) {
    const text3 = await res.text();
    throw new Error(`[OneDrive] Graph API ${method} ${path3} \u2192 ${res.status}: ${text3}`);
  }
  const text2 = await res.text();
  return text2 ? JSON.parse(text2) : null;
}
async function ensureFolder(token, folderPath) {
  const parts = folderPath.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length === 0) return;
  let currentPath = "/me/drive/root";
  for (const part of parts) {
    const encodedPart = encodeURIComponent(part);
    const checkPath = `${currentPath}:/${encodedPart}`;
    try {
      await graphRequest("GET", checkPath, token);
      currentPath = `${currentPath}:/${encodedPart}`;
    } catch {
      const parentChildrenPath = `${currentPath}/children`;
      await graphRequest("POST", parentChildrenPath, token, JSON.stringify({
        name: part,
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename"
      }), "application/json");
      currentPath = `${currentPath}:/${encodedPart}`;
    }
  }
}
async function uploadToOneDrive(filename, content) {
  const folderPath = (process.env.ONEDRIVE_FOLDER_PATH ?? "/Will Instructions").replace(/\/$/, "");
  const token = await getAccessToken();
  await ensureFolder(token, folderPath);
  const encodedFolder = folderPath.replace(/^\//, "").split("/").map(encodeURIComponent).join("/");
  const encodedFilename = encodeURIComponent(filename);
  const uploadPath = `/me/drive/root:/${encodedFolder}/${encodedFilename}:/content`;
  const result = await graphRequest(
    "PUT",
    uploadPath,
    token,
    Buffer.from(content, "utf-8"),
    "text/plain; charset=utf-8"
  );
  return { webUrl: result?.webUrl ?? "" };
}

// server/willDocumentFormatter.ts
function line(label, value) {
  if (value === null || value === void 0 || value === "") return "";
  return `  ${label.padEnd(32)} ${String(value)}
`;
}
function section(title) {
  const bar = "\u2500".repeat(60);
  return `
${bar}
  ${title.toUpperCase()}
${bar}
`;
}
function formatPersonList2(persons) {
  if (!Array.isArray(persons) || persons.length === 0) return "  None specified\n";
  return persons.map((p, i) => {
    const name = [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ");
    const parts = [
      `  ${i + 1}. ${name || "Unnamed"}`,
      p.relationship ? `(${p.relationship})` : ""
    ].filter(Boolean).join(" ");
    const details = [
      p.dob ? `     DOB: ${p.dob}` : "",
      p.address ? `     Address: ${p.address}` : "",
      p.phone ? `     Phone: ${p.phone}` : "",
      p.email ? `     Email: ${p.email}` : "",
      p.notes ? `     Notes: ${p.notes}` : ""
    ].filter(Boolean).join("\n");
    return parts + "\n" + details;
  }).join("\n") + "\n";
}
function formatGiftList(gifts) {
  if (!Array.isArray(gifts) || gifts.length === 0) return "  None specified\n";
  return gifts.map(
    (g, i) => `  ${i + 1}. ${g.description ?? "Gift"} \u2192 ${g.recipient ?? "Unknown recipient"}${g.value ? ` (\xA3${g.value})` : ""}${g.isCharity ? " [Charity]" : ""}${g.notes ? `
     Notes: ${g.notes}` : ""}`
  ).join("\n") + "\n";
}
function formatPolicies(policies) {
  if (!Array.isArray(policies) || policies.length === 0) return "  None specified\n";
  return policies.map((p, i) => [
    `  Policy ${i + 1}:`,
    p.provider ? `     Provider:        ${p.provider}` : "",
    p.policyNumber ? `     Policy No:       ${p.policyNumber}` : "",
    p.sumAssured ? `     Sum Assured:     \xA3${p.sumAssured}` : "",
    p.termRemaining ? `     Term Remaining:  ${p.termRemaining}` : "",
    p.beneficiary ? `     Beneficiary:     ${p.beneficiary}` : "",
    p.inTrust ? `     In Trust:        Yes` : "",
    p.notes ? `     Notes:           ${p.notes}` : ""
  ].filter(Boolean).join("\n")).join("\n") + "\n";
}
function formatProductsList3(products) {
  if (!Array.isArray(products) || products.length === 0) return "None specified";
  const labels = {
    single_will: "Single Will",
    mirror_wills: "Mirror Wills",
    lpa_property_finance: "LPA \u2013 Property & Finance",
    lpa_health_welfare: "LPA \u2013 Health & Welfare",
    both_lpas: "Both LPAs",
    ppt: "Protective Property Trust (PPT)",
    aat: "Asset Allocation Trust (AAT)",
    right_to_occupy: "Right To Occupy",
    discretionary_trust: "Discretionary Trust",
    vulnerable_trust: "Vulnerable Person's Trust",
    storage: "Will Storage"
  };
  return products.map((p) => labels[p] ?? p).join(", ");
}
function yesNo2(val) {
  if (val === "yes" || val === true) return "Yes";
  if (val === "no" || val === false) return "No";
  if (val === "unsure") return "Unsure / To Confirm";
  return val ? String(val) : "Not specified";
}
function formatWillDocument(record) {
  const r = record;
  const client1Name = [r.client1Prefix, r.client1FirstName, r.client1LastName].filter(Boolean).join(" ") || "Client 1";
  const client2Name = r.client2FirstName ? [r.client2Prefix, r.client2FirstName, r.client2LastName].filter(Boolean).join(" ") : null;
  const now = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", { timeZone: "Europe/London" });
  let doc = "";
  doc += "\u2550".repeat(60) + "\n";
  doc += "  GENESIS ESTATE PLANNING\n";
  doc += "  WILL INSTRUCTION FORM\n";
  doc += "\u2550".repeat(60) + "\n\n";
  doc += `  Reference:    ${record.referenceNumber}
`;
  doc += `  Generated:    ${now}
`;
  doc += `  Client(s):    ${client1Name}${client2Name ? ` & ${client2Name}` : ""}
`;
  doc += `  Products:     ${formatProductsList3(r.productsOrdered)}
`;
  doc += section("1. Appointment Details");
  doc += line("Date:", r.appointmentDate);
  doc += line("Time:", r.appointmentTime);
  doc += line("Consultant:", r.consultantName);
  doc += line("Consultant Email:", r.consultantEmail);
  doc += line("Consultant Phone:", r.consultantPhone);
  doc += line("Case Coordinator:", r.caseCoordinatorName);
  doc += line("Coordinator Email:", r.caseCoordinatorEmail);
  doc += line("Price Quoted (\xA3):", r.priceQuoted);
  doc += line("Estimated Draft Date:", r.estimatedDraftDate);
  doc += section(`2. Client 1 \u2014 ${client1Name}`);
  doc += line("Full Name:", client1Name);
  doc += line("Date of Birth:", r.client1Dob);
  doc += line("Address:", [r.client1AddressLine1, r.client1City, r.client1Postcode].filter(Boolean).join(", "));
  doc += line("Marital Status:", r.client1MaritalStatus);
  doc += line("Job Title:", r.client1JobTitle);
  doc += line("Daytime Phone:", r.client1DaytimePhone);
  doc += line("Mobile:", r.client1Mobile);
  doc += line("Email:", r.client1Email);
  doc += line("Nationality:", r.client1Nationality);
  if (client2Name) {
    doc += section(`3. Client 2 \u2014 ${client2Name}`);
    doc += line("Full Name:", client2Name);
    doc += line("Date of Birth:", r.client2Dob);
    doc += line("Address:", [r.client2AddressLine1, r.client2City, r.client2Postcode].filter(Boolean).join(", "));
    doc += line("Marital Status:", r.client2MaritalStatus);
    doc += line("Job Title:", r.client2JobTitle);
    doc += line("Daytime Phone:", r.client2DaytimePhone);
    doc += line("Mobile:", r.client2Mobile);
    doc += line("Email:", r.client2Email);
    doc += line("Nationality:", r.client2Nationality);
  }
  doc += section("4. Family Background");
  doc += `  CLIENT 1:
`;
  doc += line("  Marriage Plans:", r.client1MarriagePlans);
  doc += line("  Has Children:", yesNo2(r.client1HasChildren));
  doc += line("  Total Children:", r.client1TotalChildren);
  doc += line("  Children Special Needs:", yesNo2(r.client1ChildrenSpecialNeeds));
  if (Array.isArray(r.client1ChildrenUnder18) && r.client1ChildrenUnder18.length > 0) {
    doc += `  Children Under 18:
` + formatPersonList2(r.client1ChildrenUnder18);
  }
  if (client2Name) {
    doc += `
  CLIENT 2:
`;
    doc += line("  Marriage Plans:", r.client2MarriagePlans);
    doc += line("  Has Children:", yesNo2(r.client2HasChildren));
    doc += line("  Total Children:", r.client2TotalChildren);
    if (Array.isArray(r.client2ChildrenUnder18) && r.client2ChildrenUnder18.length > 0) {
      doc += `  Children Under 18:
` + formatPersonList2(r.client2ChildrenUnder18);
    }
  }
  doc += section("5. Due Diligence");
  doc += line("Arranged appointment?", yesNo2(r.ddArrangedAppointment));
  doc += line("Knowledge of estate?", yesNo2(r.ddKnowledgeOfEstate));
  doc += line("Knew beneficiaries?", yesNo2(r.ddKnewBeneficiaries));
  doc += line("Signs of influence?", yesNo2(r.ddSignsOfInfluence));
  doc += line("Knew appointees?", yesNo2(r.ddKnewAppointees));
  doc += section("6. Executors & Trustees");
  doc += `  CLIENT 1 \u2014 PRIMARY EXECUTORS:
`;
  doc += formatPersonList2(r.client1Executors);
  doc += `  CLIENT 1 \u2014 RESERVED EXECUTORS:
`;
  doc += formatPersonList2(r.client1ReservedExecutors);
  if (client2Name) {
    doc += `  CLIENT 2 \u2014 PRIMARY EXECUTORS:
`;
    doc += formatPersonList2(r.client2Executors);
    doc += `  CLIENT 2 \u2014 RESERVED EXECUTORS:
`;
    doc += formatPersonList2(r.client2ReservedExecutors);
  }
  doc += `  TRUSTEES:
`;
  doc += formatPersonList2(r.trustees);
  const hasGuardians = Array.isArray(r.client1Guardians) && r.client1Guardians.length > 0 || Array.isArray(r.client2Guardians) && r.client2Guardians.length > 0;
  if (hasGuardians) {
    doc += section("7. Guardians for Minor Children");
    doc += `  CLIENT 1 \u2014 PRIMARY GUARDIANS:
`;
    doc += formatPersonList2(r.client1Guardians);
    doc += `  CLIENT 1 \u2014 RESERVED GUARDIANS:
`;
    doc += formatPersonList2(r.client1ReservedGuardians);
    if (client2Name) {
      doc += `  CLIENT 2 \u2014 PRIMARY GUARDIANS:
`;
      doc += formatPersonList2(r.client2Guardians);
      doc += `  CLIENT 2 \u2014 RESERVED GUARDIANS:
`;
      doc += formatPersonList2(r.client2ReservedGuardians);
    }
  }
  doc += section("8. Property & Assets");
  doc += line("Property Owned:", yesNo2(r.propertyOwned));
  doc += line("Property Address:", r.propertyAddress);
  doc += line("Ownership Type:", r.propertyOwnership);
  doc += line("Property Value (\xA3):", r.propertyValue);
  doc += line("Mortgage Outstanding:", yesNo2(r.mortgageOutstanding));
  doc += line("Mortgage Balance (\xA3):", r.mortgageBalance);
  doc += line("Mortgage Term Remaining:", r.mortgageTermRemaining);
  doc += line("Mortgage Lender:", r.mortgageLender);
  doc += line("Other Properties:", yesNo2(r.hasOtherProperties));
  doc += line("Other Properties Details:", r.otherProperties);
  doc += line("Assets Outside UK:", yesNo2(r.assetsOutsideUK));
  doc += line("Assets Outside UK Details:", r.assetsOutsideUKDetails);
  doc += "\n  CLIENT 1 FINANCIAL ASSETS:\n";
  doc += line("  Bank Accounts:", r.bankAccounts);
  doc += line("  Investments:", r.investments);
  doc += line("  Pension Details:", r.pensionDetails);
  doc += line("  Estimated Estate Value:", r.estimatedEstateValue);
  if (client2Name) {
    doc += "\n  CLIENT 2 FINANCIAL ASSETS:\n";
    doc += line("  Bank Accounts:", r.client2BankAccounts);
    doc += line("  Investments:", r.client2Investments);
    doc += line("  Pension Details:", r.client2PensionDetails);
    doc += line("  Estimated Estate Value:", r.client2EstimatedEstateValue);
  }
  doc += line("Care Concerns:", yesNo2(r.careConcerns));
  doc += line("Care Concern Details:", r.careConcernDetails);
  doc += section("9. Life Insurance & Protection");
  doc += line("Has Life Insurance:", yesNo2(r.hasLifeInsurance));
  if (r.hasLifeInsurance === "yes") {
    doc += formatPolicies(r.lifeInsurancePolicies);
  }
  doc += line("Additional Notes:", r.lifeInsuranceNotes);
  doc += section("10. Business Interests");
  doc += line("Has Business Interests:", yesNo2(r.hasBusinessInterests));
  doc += line("Details:", r.businessInterests);
  doc += section("11. Beneficiaries");
  doc += `  CLIENT 1 BENEFICIARIES:
`;
  doc += formatPersonList2(r.client1Beneficiaries);
  doc += line("  Residual Estate:", r.client1ResidualEstate);
  doc += line("  Residual Backup:", r.client1ResidualBackup);
  doc += line("  Children Benefit Age:", r.client1ChildrenBenefitAge);
  if (client2Name) {
    doc += `
  CLIENT 2 BENEFICIARIES:
`;
    doc += formatPersonList2(r.client2Beneficiaries);
    doc += line("  Residual Estate:", r.client2ResidualEstate);
    doc += line("  Residual Backup:", r.client2ResidualBackup);
    doc += line("  Children Benefit Age:", r.client2ChildrenBenefitAge);
  }
  const hasGifts = Array.isArray(r.client1SpecificGifts) && r.client1SpecificGifts.length > 0 || Array.isArray(r.client2SpecificGifts) && r.client2SpecificGifts.length > 0;
  if (hasGifts) {
    doc += section("12. Specific Gifts & Legacies");
    doc += `  CLIENT 1 GIFTS:
`;
    doc += formatGiftList(r.client1SpecificGifts);
    if (client2Name) {
      doc += `
  CLIENT 2 GIFTS:
`;
      doc += formatGiftList(r.client2SpecificGifts);
    }
  }
  doc += section("13. Pets");
  doc += line("Has Pets:", yesNo2(r.hasPets));
  doc += line("Pets Details:", r.petsDetails);
  doc += line("Pets Carer:", r.petsCarer);
  doc += section("14. Funeral Wishes");
  doc += `  CLIENT 1:
`;
  doc += line("  Funeral Type:", r.client1FuneralType);
  doc += line("  Wishes:", r.client1FuneralWishes);
  doc += line("  Organ Donation:", yesNo2(r.client1OrganDonation));
  if (client2Name) {
    doc += `
  CLIENT 2:
`;
    doc += line("  Funeral Type:", r.client2FuneralType);
    doc += line("  Wishes:", r.client2FuneralWishes);
    doc += line("  Organ Donation:", yesNo2(r.client2OrganDonation));
  }
  doc += section("15. Disaster Clause & Additional Notes");
  doc += line("Disaster Clause (Client 1):", r.disasterClauseClient1);
  if (client2Name) doc += line("Disaster Clause (Client 2):", r.disasterClauseClient2);
  doc += line("Disaster Clause Notes:", r.disasterClauseNotes);
  doc += line("Additional Notes:", r.additionalNotes);
  doc += line("Special Notes:", r.specialNotes);
  if (record.aiRecommendationNarrative) {
    doc += section("16. AI Recommendations");
    doc += record.aiRecommendationNarrative + "\n";
  }
  doc += "\n" + "\u2550".repeat(60) + "\n";
  doc += `  END OF INSTRUCTION \u2014 ${record.referenceNumber}
`;
  doc += "\u2550".repeat(60) + "\n";
  return doc;
}
function buildFilename(record) {
  const r = record;
  const client1 = [r.client1FirstName, r.client1LastName].filter(Boolean).join("_") || "Client";
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const ref = record.referenceNumber ?? "REF";
  return `${date}_${client1}_${ref}.txt`;
}

// server/routers/willInstructions.ts
var personSchema = z2.object({
  prefix: z2.string().optional(),
  firstName: z2.string().optional(),
  lastName: z2.string().optional(),
  relationship: z2.string().optional(),
  address: z2.string().optional(),
  phone: z2.string().optional(),
  email: z2.string().optional(),
  dob: z2.string().optional(),
  share: z2.string().optional(),
  isVulnerable: z2.boolean().optional(),
  notes: z2.string().optional()
});
var specificGiftSchema = z2.object({
  description: z2.string().optional(),
  recipient: z2.string().optional(),
  value: z2.string().optional(),
  isCharity: z2.boolean().optional(),
  notes: z2.string().optional()
});
var lifeInsurancePolicySchema = z2.object({
  provider: z2.string().optional(),
  policyNumber: z2.string().optional(),
  sumAssured: z2.string().optional(),
  termRemaining: z2.string().optional(),
  inTrust: z2.boolean().optional(),
  beneficiary: z2.string().optional(),
  notes: z2.string().optional()
});
var businessInterestSchema = z2.object({
  businessName: z2.string().optional(),
  natureOfBusiness: z2.string().optional(),
  ownershipPercentage: z2.string().optional(),
  notes: z2.string().optional()
});
var pptTerminationTriggersSchema = z2.object({
  onDeath: z2.boolean().optional(),
  onRemarriageOrCohabitation: z2.boolean().optional(),
  onCeasingToReside: z2.boolean().optional(),
  onBreachOfConditions: z2.boolean().optional()
});
var pptClauseSchema = z2.object({
  propertyAddress: z2.string().optional(),
  trustees: z2.array(personSchema).optional(),
  lifeTenants: z2.array(personSchema).optional(),
  terminationTriggers: pptTerminationTriggersSchema.optional(),
  trustPeriodNotes: z2.string().optional(),
  ultimateBeneficiaries: z2.array(personSchema).optional(),
  notes: z2.string().optional()
});
var discretionaryTrustClauseSchema = z2.object({
  trustees: z2.array(personSchema).optional(),
  beneficiaryClass: z2.string().optional(),
  additionalBeneficiaries: z2.array(personSchema).optional(),
  terminationNotes: z2.string().optional(),
  notes: z2.string().optional()
});
var vulnerableTrustClauseSchema = z2.object({
  vulnerableBeneficiary: personSchema.optional(),
  trustees: z2.array(personSchema).optional(),
  ultimateBeneficiaries: z2.array(personSchema).optional(),
  notes: z2.string().optional()
});
var nilRateBandClauseSchema = z2.object({
  trustees: z2.array(personSchema).optional(),
  beneficiaries: z2.array(personSchema).optional(),
  notes: z2.string().optional()
});
var bereavedMinorClauseSchema = z2.object({
  beneficiary: personSchema.optional(),
  trustees: z2.array(personSchema).optional(),
  ageOfAbsoluteEntitlement: z2.string().optional(),
  notes: z2.string().optional()
});
var age18To25ClauseSchema = z2.object({
  beneficiary: personSchema.optional(),
  trustees: z2.array(personSchema).optional(),
  ageOfAbsoluteEntitlement: z2.string().optional(),
  notes: z2.string().optional()
});
var businessPropertyReliefClauseSchema = z2.object({
  businessName: z2.string().optional(),
  trustees: z2.array(personSchema).optional(),
  beneficiaries: z2.array(personSchema).optional(),
  notes: z2.string().optional()
});
function nullify(obj) {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = v === void 0 ? null : v;
  }
  return result;
}
var willInstructionInputSchema = z2.object({
  // Appointment
  appointmentDate: z2.string().optional(),
  appointmentTime: z2.string().optional(),
  consultantName: z2.string().optional(),
  consultantEmail: z2.string().optional(),
  consultantPhone: z2.string().optional(),
  caseCoordinatorName: z2.string().optional(),
  caseCoordinatorEmail: z2.string().optional(),
  caseCoordinatorPhone: z2.string().optional(),
  priceQuoted: z2.string().optional(),
  estimatedDraftDate: z2.string().optional(),
  productsOrdered: z2.array(z2.string()).optional(),
  willType: z2.string().optional(),
  lpaType: z2.string().optional(),
  // Client 1
  client1Prefix: z2.string().optional(),
  client1FirstName: z2.string().optional(),
  client1MiddleName: z2.string().optional(),
  client1LastName: z2.string().optional(),
  client1Dob: z2.string().optional(),
  client1AddressLine1: z2.string().optional(),
  client1City: z2.string().optional(),
  client1Postcode: z2.string().optional(),
  client1MaritalStatus: z2.string().optional(),
  client1JobTitle: z2.string().optional(),
  client1DaytimePhone: z2.string().optional(),
  client1Mobile: z2.string().optional(),
  client1Email: z2.string().optional(),
  client1Nationality: z2.string().optional(),
  // Client 2
  client2Prefix: z2.string().optional(),
  client2FirstName: z2.string().optional(),
  client2MiddleName: z2.string().optional(),
  client2LastName: z2.string().optional(),
  client2Dob: z2.string().optional(),
  client2AddressLine1: z2.string().optional(),
  client2City: z2.string().optional(),
  client2Postcode: z2.string().optional(),
  client2MaritalStatus: z2.string().optional(),
  client2JobTitle: z2.string().optional(),
  client2DaytimePhone: z2.string().optional(),
  client2Mobile: z2.string().optional(),
  client2Email: z2.string().optional(),
  client2Nationality: z2.string().optional(),
  // Client 2 same address
  client2SameAddressAsClient1: z2.boolean().optional(),
  // Per-client executors
  client1Executors: z2.array(personSchema).optional(),
  client1ReservedExecutors: z2.array(personSchema).optional(),
  client2Executors: z2.array(personSchema).optional(),
  client2ReservedExecutors: z2.array(personSchema).optional(),
  // Per-client guardians
  client1Guardians: z2.array(personSchema).optional(),
  client1ReservedGuardians: z2.array(personSchema).optional(),
  client2Guardians: z2.array(personSchema).optional(),
  client2ReservedGuardians: z2.array(personSchema).optional(),
  // Shared trustees
  trustees: z2.array(personSchema).optional(),
  // Legacy shared fields
  executors: z2.array(personSchema).optional(),
  reservedExecutors: z2.array(personSchema).optional(),
  guardians: z2.array(personSchema).optional(),
  reservedGuardians: z2.array(personSchema).optional(),
  beneficiaries: z2.array(personSchema).optional(),
  childrenBenefitAge: z2.string().optional(),
  disasterClauseClient1: z2.string().optional(),
  disasterClauseClient2: z2.string().optional(),
  // Property & Assets
  propertyOwned: z2.string().optional(),
  propertyAddress: z2.string().optional(),
  propertyOwnership: z2.string().optional(),
  mortgageOutstanding: z2.string().optional(),
  mortgageBalance: z2.string().optional(),
  mortgageTermRemaining: z2.string().optional(),
  mortgageLender: z2.string().optional(),
  propertyValue: z2.string().optional(),
  hasOtherProperties: z2.string().optional(),
  otherProperties: z2.string().optional(),
  bankAccounts: z2.string().optional(),
  investments: z2.string().optional(),
  pensionDetails: z2.string().optional(),
  estimatedEstateValue: z2.string().optional(),
  // Per-client beneficiaries
  client1Beneficiaries: z2.array(personSchema).optional(),
  client1ResidualEstate: z2.string().optional(),
  client1ResidualBackup: z2.string().optional(),
  client1ChildrenBenefitAge: z2.string().optional(),
  client1HasVulnerableBeneficiary: z2.string().optional(),
  client1VulnerableBeneficiaryDetails: z2.string().optional(),
  client2Beneficiaries: z2.array(personSchema).optional(),
  client2ResidualEstate: z2.string().optional(),
  client2ResidualBackup: z2.string().optional(),
  client2ChildrenBenefitAge: z2.string().optional(),
  client2HasVulnerableBeneficiary: z2.string().optional(),
  client2VulnerableBeneficiaryDetails: z2.string().optional(),
  // Per-client gifts
  client1SpecificGifts: z2.array(specificGiftSchema).optional(),
  client2SpecificGifts: z2.array(specificGiftSchema).optional(),
  // Per-client funeral wishes
  client1FuneralType: z2.string().optional(),
  client1FuneralWishes: z2.string().optional(),
  client1OrganDonation: z2.string().optional(),
  client2FuneralType: z2.string().optional(),
  client2FuneralWishes: z2.string().optional(),
  client2OrganDonation: z2.string().optional(),
  // Legacy shared gifts & wishes
  specificGifts: z2.array(specificGiftSchema).optional(),
  residuaryEstate: z2.string().optional(),
  residuaryBackup: z2.string().optional(),
  funeralType: z2.string().optional(),
  funeralWishes: z2.string().optional(),
  organDonation: z2.string().optional(),
  // Vulnerable & care
  hasVulnerableBeneficiary: z2.string().optional(),
  vulnerableBeneficiaryDetails: z2.string().optional(),
  careConcerns: z2.string().optional(),
  careConcernDetails: z2.string().optional(),
  // Family Background
  client1MarriagePlans: z2.string().optional(),
  client1MarriagePlanDetails: z2.string().optional(),
  client1HasChildren: z2.string().optional(),
  client1TotalChildren: z2.string().optional(),
  client1ChildrenSpecialNeeds: z2.string().optional(),
  client1ChildrenSpecialNeedsDetails: z2.string().optional(),
  client1ChildrenUnder18: z2.array(z2.any()).optional(),
  client1ChildrenOver18: z2.array(z2.any()).optional(),
  client1ChildrenDetails: z2.string().optional(),
  client1FamilyCircumstances: z2.string().optional(),
  client2MarriagePlans: z2.string().optional(),
  client2MarriagePlanDetails: z2.string().optional(),
  client2HasChildren: z2.string().optional(),
  client2TotalChildren: z2.string().optional(),
  client2ChildrenSpecialNeeds: z2.string().optional(),
  client2ChildrenSpecialNeedsDetails: z2.string().optional(),
  client2ChildrenUnder18: z2.array(z2.any()).optional(),
  client2ChildrenOver18: z2.array(z2.any()).optional(),
  client2ChildrenDetails: z2.string().optional(),
  client2FamilyCircumstances: z2.string().optional(),
  // Additional Background
  client1Residency: z2.string().optional(),
  client1DomiciledUK: z2.string().optional(),
  client1MentalCapacity: z2.string().optional(),
  client1MentalCapacityNotes: z2.string().optional(),
  client1ChildrenPastRelationships: z2.string().optional(),
  client1ChildrenPastDetails: z2.string().optional(),
  client2Residency: z2.string().optional(),
  client2DomiciledUK: z2.string().optional(),
  client2MentalCapacity: z2.string().optional(),
  client2MentalCapacityNotes: z2.string().optional(),
  client2ChildrenPastRelationships: z2.string().optional(),
  client2ChildrenPastDetails: z2.string().optional(),
  // Due Diligence
  ddArrangedAppointment: z2.string().optional(),
  ddArrangedAppointmentNotes: z2.string().optional(),
  ddKnowledgeOfEstate: z2.string().optional(),
  ddKnowledgeOfEstateNotes: z2.string().optional(),
  ddKnewBeneficiaries: z2.string().optional(),
  ddKnewBeneficiariesNotes: z2.string().optional(),
  ddSignsOfInfluence: z2.string().optional(),
  ddSignsOfInfluenceNotes: z2.string().optional(),
  ddKnewAppointees: z2.string().optional(),
  ddKnewAppointeesNotes: z2.string().optional(),
  // Extended Due Diligence
  ddClientSince: z2.string().optional(),
  ddFirstContactDate: z2.string().optional(),
  ddMeetingType: z2.string().optional(),
  ddOthersPresent: z2.string().optional(),
  ddOthersPresentNotes: z2.string().optional(),
  ddClientCanSee: z2.string().optional(),
  ddClientCanHear: z2.string().optional(),
  ddClientCanSpeak: z2.string().optional(),
  // Overseas assets
  assetsOutsideUK: z2.string().optional(),
  assetsOutsideUKDetails: z2.string().optional(),
  // Client 2 financial assets
  client2BankAccounts: z2.string().optional(),
  client2Investments: z2.string().optional(),
  client2PensionDetails: z2.string().optional(),
  client2EstimatedEstateValue: z2.string().optional(),
  // Life Insurance
  hasLifeInsurance: z2.string().optional(),
  lifeInsurancePolicies: z2.array(lifeInsurancePolicySchema).optional(),
  lifeInsuranceNotes: z2.string().optional(),
  // Business Interests
  hasBusinessInterests: z2.string().optional(),
  businessInterests: z2.string().optional(),
  businessInterestsDetails: z2.array(businessInterestSchema).optional(),
  // Pets
  hasPets: z2.string().optional(),
  petsDetails: z2.string().optional(),
  petsCarer: z2.string().optional(),
  // Disaster Clause & Notes
  disasterClauseNotes: z2.string().optional(),
  additionalNotes: z2.string().optional(),
  // Notes
  specialNotes: z2.string().optional(),
  // Optional Trust Clauses (rich multi-instance)
  protectivePropertyTrusts: z2.array(pptClauseSchema).optional(),
  discretionaryTrusts: z2.array(discretionaryTrustClauseSchema).optional(),
  vulnerablePersonTrusts: z2.array(vulnerableTrustClauseSchema).optional(),
  nilRateBandTrusts: z2.array(nilRateBandClauseSchema).optional(),
  bereavedMinorTrusts: z2.array(bereavedMinorClauseSchema).optional(),
  age18To25Trusts: z2.array(age18To25ClauseSchema).optional(),
  businessPropertyReliefs: z2.array(businessPropertyReliefClauseSchema).optional(),
  // Manual Needs Assessment / Recommendations
  manualNeedsAssessment: z2.string().optional(),
  considerLPA: z2.union([z2.boolean(), z2.number()]).transform((v) => Boolean(v)).optional(),
  considerPPT: z2.union([z2.boolean(), z2.number()]).transform((v) => Boolean(v)).optional(),
  considerAAT: z2.union([z2.boolean(), z2.number()]).transform((v) => Boolean(v)).optional()
});
var willInstructionsRouter = router({
  submit: publicProcedure.input(willInstructionInputSchema).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const surname = (input.client1LastName ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "CLIENT";
    const randomNum = Math.floor(1e5 + Math.random() * 9e5);
    const referenceNumber = `GEP-${surname}-${randomNum}`;
    let recommendations = [];
    let narrative = "";
    let clientEmailDraft = "";
    if (input.manualNeedsAssessment?.trim()) {
      narrative = input.manualNeedsAssessment.trim();
    } else {
      narrative = "No needs assessment or recommendations were recorded for this instruction.";
    }
    const { client2SameAddressAsClient1: _sameAddr, ...insertInput } = input;
    const insertData = nullify({
      referenceNumber,
      ...insertInput,
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
      protectivePropertyTrusts: input.protectivePropertyTrusts ?? [],
      discretionaryTrusts: input.discretionaryTrusts ?? [],
      vulnerablePersonTrusts: input.vulnerablePersonTrusts ?? [],
      nilRateBandTrusts: input.nilRateBandTrusts ?? [],
      bereavedMinorTrusts: input.bereavedMinorTrusts ?? [],
      age18To25Trusts: input.age18To25Trusts ?? [],
      businessPropertyReliefs: input.businessPropertyReliefs ?? [],
      considerLPA: input.considerLPA ? 1 : 0,
      considerPPT: input.considerPPT ? 1 : 0,
      considerAAT: input.considerAAT ? 1 : 0,
      recommendationsJson: recommendations,
      aiRecommendationNarrative: narrative,
      aiClientEmailDraft: clientEmailDraft,
      status: "submitted",
      emailSent: 0
    });
    try {
      await db.insert(willInstructions).values(insertData);
    } catch (insertErr) {
      const msg = insertErr instanceof Error ? insertErr.message : String(insertErr);
      console.error("[Submit] DB insert failed. Keys in insertData:", Object.keys(insertData).join(", "));
      console.error("[Submit] DB insert error:", msg);
      throw new Error(`Failed query: ${msg}`);
    }
    const [record] = await db.select().from(willInstructions).where(eq2(willInstructions.referenceNumber, referenceNumber)).limit(1);
    let pdfBuffer;
    try {
      pdfBuffer = await generateWillPdf(record);
    } catch (pdfErr) {
      console.error("[PDF] Failed to generate PDF for email attachment:", pdfErr);
    }
    const docContent = formatWillDocument(record);
    const filename = buildFilename(record);
    uploadToOneDrive(filename, docContent).then(({ webUrl }) => {
      console.log(`[OneDrive] Uploaded ${filename} \u2192 ${webUrl}`);
      return sendAdminEmail(record, webUrl, pdfBuffer);
    }).catch((err) => {
      console.error("[OneDrive] Upload failed, sending email without link:", err);
      sendAdminEmail(record, void 0, pdfBuffer).catch(
        (e) => console.error("[Email] Failed to send admin notification:", e)
      );
    });
    await Promise.allSettled([
      sendClientConfirmationEmail(record).catch(
        (e) => console.error("[ClientEmail] Failed to send client confirmation:", e)
      ),
      sendAdviserConfirmationEmail(record).catch(
        (e) => console.error("[AdviserEmail] Failed to send adviser confirmation:", e)
      )
    ]);
    return { success: true, referenceNumber, id: record.id, recommendations, narrative, clientEmailDraft };
  }),
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select({
      id: willInstructions.id,
      referenceNumber: willInstructions.referenceNumber,
      client1FirstName: willInstructions.client1FirstName,
      client1LastName: willInstructions.client1LastName,
      consultantName: willInstructions.consultantName,
      willType: willInstructions.willType,
      productsOrdered: willInstructions.productsOrdered,
      status: willInstructions.status,
      createdAt: willInstructions.createdAt
    }).from(willInstructions).orderBy(desc(willInstructions.createdAt));
  }),
  getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const [record] = await db.select().from(willInstructions).where(eq2(willInstructions.id, input.id)).limit(1);
    return record ?? null;
  }),
  getByRef: publicProcedure.input(z2.object({ ref: z2.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const [record] = await db.select().from(willInstructions).where(eq2(willInstructions.referenceNumber, input.ref)).limit(1);
    return record ?? null;
  }),
  // ─── Draft procedures ────────────────────────────────────────────────────
  saveDraft: publicProcedure.input(willInstructionInputSchema.extend({
    draftId: z2.number().optional(),
    currentStep: z2.number().optional()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { draftId, currentStep, client2SameAddressAsClient1: _sameAddrDraft, ...formData } = input;
    const draftData = nullify({
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
      considerLPA: formData.considerLPA ? 1 : 0,
      considerPPT: formData.considerPPT ? 1 : 0,
      considerAAT: formData.considerAAT ? 1 : 0,
      status: "draft",
      currentStep: currentStep ?? 1,
      emailSent: 0
    });
    try {
      if (draftId) {
        await db.update(willInstructions).set({ ...draftData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(willInstructions.id, draftId));
        return { success: true, draftId };
      } else {
        const draftSurname = (draftData.client1LastName ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "DRAFT";
        const draftRandomNum = Math.floor(1e5 + Math.random() * 9e5);
        const referenceNumber = `GEP-${draftSurname}-${draftRandomNum}`;
        await db.insert(willInstructions).values({ ...draftData, referenceNumber });
        const [record] = await db.select({ id: willInstructions.id }).from(willInstructions).where(eq2(willInstructions.referenceNumber, referenceNumber)).limit(1);
        return { success: true, draftId: record?.id };
      }
    } catch (draftErr) {
      const msg = draftErr instanceof Error ? draftErr.message : String(draftErr);
      console.error("[SaveDraft] DB operation failed. Keys in draftData:", Object.keys(draftData).join(", "));
      console.error("[SaveDraft] DB error:", msg);
      throw new Error(`Failed query: ${msg}`);
    }
  }),
  listDrafts: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select({
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
      createdAt: willInstructions.createdAt
    }).from(willInstructions).where(eq2(willInstructions.status, "draft")).orderBy(desc(willInstructions.updatedAt));
  }),
  getDraft: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const [record] = await db.select().from(willInstructions).where(eq2(willInstructions.id, input.id)).limit(1);
    if (!record || record.status !== "draft") return null;
    return record;
  }),
  deleteDraft: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(willInstructions).where(eq2(willInstructions.id, input.id));
    return { success: true };
  }),
  // Delete a submitted instruction (admin only)
  deleteSubmission: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(willInstructions).where(eq2(willInstructions.id, input.id));
    return { success: true };
  }),
  // Admin: full update of any submission
  updateSubmission: publicProcedure.input(willInstructionInputSchema.extend({
    id: z2.number(),
    status: z2.enum(["draft", "submitted", "processing", "complete", "cancelled"]).optional(),
    manualNeedsAssessment: z2.string().optional()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, client2SameAddressAsClient1: _sameAddr, ...formData } = input;
    const updateData = nullify({
      ...formData,
      productsOrdered: formData.productsOrdered ?? void 0,
      executors: formData.executors ?? void 0,
      reservedExecutors: formData.reservedExecutors ?? void 0,
      trustees: formData.trustees ?? void 0,
      guardians: formData.guardians ?? void 0,
      reservedGuardians: formData.reservedGuardians ?? void 0,
      beneficiaries: formData.beneficiaries ?? void 0,
      specificGifts: formData.specificGifts ?? void 0,
      client1Executors: formData.client1Executors ?? void 0,
      client1ReservedExecutors: formData.client1ReservedExecutors ?? void 0,
      client2Executors: formData.client2Executors ?? void 0,
      client2ReservedExecutors: formData.client2ReservedExecutors ?? void 0,
      client1Guardians: formData.client1Guardians ?? void 0,
      client1ReservedGuardians: formData.client1ReservedGuardians ?? void 0,
      client2Guardians: formData.client2Guardians ?? void 0,
      client2ReservedGuardians: formData.client2ReservedGuardians ?? void 0,
      client1Beneficiaries: formData.client1Beneficiaries ?? void 0,
      client2Beneficiaries: formData.client2Beneficiaries ?? void 0,
      client1SpecificGifts: formData.client1SpecificGifts ?? void 0,
      client2SpecificGifts: formData.client2SpecificGifts ?? void 0,
      client1ChildrenUnder18: formData.client1ChildrenUnder18 ?? void 0,
      client1ChildrenOver18: formData.client1ChildrenOver18 ?? void 0,
      client2ChildrenUnder18: formData.client2ChildrenUnder18 ?? void 0,
      client2ChildrenOver18: formData.client2ChildrenOver18 ?? void 0,
      lifeInsurancePolicies: formData.lifeInsurancePolicies ?? void 0,
      businessInterestsDetails: formData.businessInterestsDetails ?? void 0,
      protectivePropertyTrusts: formData.protectivePropertyTrusts ?? void 0,
      discretionaryTrusts: formData.discretionaryTrusts ?? void 0,
      vulnerablePersonTrusts: formData.vulnerablePersonTrusts ?? void 0,
      nilRateBandTrusts: formData.nilRateBandTrusts ?? void 0,
      bereavedMinorTrusts: formData.bereavedMinorTrusts ?? void 0,
      age18To25Trusts: formData.age18To25Trusts ?? void 0,
      businessPropertyReliefs: formData.businessPropertyReliefs ?? void 0,
      considerLPA: formData.considerLPA ? 1 : 0,
      considerPPT: formData.considerPPT ? 1 : 0,
      considerAAT: formData.considerAAT ? 1 : 0,
      updatedAt: /* @__PURE__ */ new Date()
    });
    try {
      await db.update(willInstructions).set(updateData).where(eq2(willInstructions.id, id));
    } catch (updateErr) {
      const msg = updateErr instanceof Error ? updateErr.message : String(updateErr);
      console.error("[UpdateSubmission] DB update failed. Keys in updateData:", Object.keys(updateData).join(", "));
      console.error("[UpdateSubmission] DB update error:", msg);
      throw new Error(`Failed query: ${msg}`);
    }
    return { success: true };
  }),
  // Preview the client confirmation email HTML for a given submission
  previewEmail: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [record] = await db.select().from(willInstructions).where(eq2(willInstructions.id, input.id)).limit(1);
    if (!record) throw new Error("Submission not found");
    return { html: buildClientEmailPreview(record) };
  }),
  // Update status of a submitted instruction
  updateStatus: publicProcedure.input(z2.object({ id: z2.number(), status: z2.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(willInstructions).set({ status: input.status, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(willInstructions.id, input.id));
    return { success: true };
  })
});

// server/routers/lpa.ts
import { z as z3 } from "zod";
init_db();
init_schema();
import { eq as eq3 } from "drizzle-orm";
import { TRPCError as TRPCError3 } from "@trpc/server";
var lpaPersonSchema = z3.object({
  title: z3.string().optional(),
  firstNames: z3.string().optional(),
  lastName: z3.string().optional(),
  dob: z3.string().optional(),
  address: z3.string().optional(),
  postcode: z3.string().optional(),
  email: z3.string().optional(),
  isTrustCorporation: z3.boolean().optional()
});
var notifyPersonSchema = z3.object({
  title: z3.string().optional(),
  firstNames: z3.string().optional(),
  lastName: z3.string().optional(),
  address: z3.string().optional(),
  postcode: z3.string().optional()
});
var lpaInputSchema = z3.object({
  willInstructionId: z3.number().default(0),
  matterId: z3.number().optional(),
  clientNumber: z3.number().min(1).max(2).default(1),
  lpaType: z3.enum(["property_finance", "health_welfare"]),
  // Donor
  donorTitle: z3.string().optional(),
  donorFirstNames: z3.string().optional(),
  donorLastName: z3.string().optional(),
  donorOtherNames: z3.string().optional(),
  donorDob: z3.string().optional(),
  donorAddress: z3.string().optional(),
  donorPostcode: z3.string().optional(),
  donorEmail: z3.string().optional(),
  // Attorneys
  attorneys: z3.array(lpaPersonSchema).optional(),
  replacementAttorneys: z3.array(lpaPersonSchema).optional(),
  // Decision type
  attorneyDecisionType: z3.string().optional(),
  // "single" | "jointly_severally" | "jointly" | "jointly_some" | ""
  attorneyDecisionDetails: z3.string().optional(),
  replacementDecisionDetails: z3.string().optional(),
  // Certificate provider
  certProviderTitle: z3.string().optional(),
  certProviderFirstNames: z3.string().optional(),
  certProviderLastName: z3.string().optional(),
  certProviderAddress: z3.string().optional(),
  certProviderPostcode: z3.string().optional(),
  certProviderEmail: z3.string().optional(),
  // People to notify
  peopleToNotify: z3.array(notifyPersonSchema).optional(),
  // LP1H specific
  lifeSustainingTreatment: z3.string().optional(),
  // "give_authority" | "do_not_give" | ""
  // LP1F specific
  whenAttorneysCanAct: z3.string().optional(),
  // "capacity" | "whenever" | ""
  // Preferences & instructions
  preferences: z3.string().optional(),
  instructions: z3.string().optional(),
  // Section 12: who is applying to register
  applicantType: z3.string().optional(),
  // 'donor' | 'attorneys'
  // Section 13: who receives the LPA
  recipientType: z3.string().optional(),
  // 'donor' | 'attorney' | 'other'
  recipientTitle: z3.string().optional(),
  recipientFirstNames: z3.string().optional(),
  recipientLastName: z3.string().optional(),
  recipientCompany: z3.string().optional(),
  recipientAddressLine1: z3.string().optional(),
  recipientAddressLine2: z3.string().optional(),
  recipientAddressLine3: z3.string().optional(),
  recipientPostcode: z3.string().optional(),
  deliveryPost: z3.boolean().optional(),
  deliveryPhone: z3.boolean().optional(),
  deliveryEmail: z3.boolean().optional(),
  deliveryWelsh: z3.boolean().optional(),
  // Section 14: application fee
  feePaymentMethod: z3.string().optional(),
  // 'card' | 'cheque'
  feeContactPhone: z3.string().optional(),
  reducedFee: z3.boolean().optional(),
  repeatApplication: z3.boolean().optional(),
  caseNumber: z3.string().optional(),
  status: z3.enum(["draft", "complete"]).optional()
});
function requireAdmin(role) {
  if (role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Admin access required" });
  }
}
var lpaRouter = router({
  // List all LPAs for a submission
  listBySubmission: protectedProcedure.input(z3.object({ willInstructionId: z3.number() })).query(async ({ ctx, input }) => {
    requireAdmin(ctx.user?.role);
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const records = await db.select().from(lpaRecords).where(eq3(lpaRecords.willInstructionId, input.willInstructionId));
    return records;
  }),
  // Get a single LPA record
  getById: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ ctx, input }) => {
    requireAdmin(ctx.user?.role);
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const [record] = await db.select().from(lpaRecords).where(eq3(lpaRecords.id, input.id));
    if (!record) throw new TRPCError3({ code: "NOT_FOUND" });
    return record;
  }),
  // Create a new LPA record
  create: protectedProcedure.input(lpaInputSchema).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx.user?.role);
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
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
      caseNumber: input.caseNumber
    });
    return { success: true };
  }),
  // Update an existing LPA record
  update: protectedProcedure.input(lpaInputSchema.extend({ id: z3.number() })).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx.user?.role);
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { id, willInstructionId, clientNumber, lpaType, ...rest } = input;
    await db.update(lpaRecords).set({
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
      caseNumber: rest.caseNumber
    }).where(eq3(lpaRecords.id, id));
    return { success: true };
  }),
  // Delete an LPA record
  delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx.user?.role);
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    await db.delete(lpaRecords).where(eq3(lpaRecords.id, input.id));
    return { success: true };
  }),
  // List LPAs linked to a V2 matter
  listByMatter: protectedProcedure.input(z3.object({ matterId: z3.number() })).query(async ({ ctx, input }) => {
    requireAdmin(ctx.user?.role);
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const records = await db.select().from(lpaRecords).where(eq3(lpaRecords.matterId, input.matterId));
    return records;
  }),
  // Create pre-filled LPA records from a V2 matter's client data
  createFromMatter: protectedProcedure.input(z3.object({
    matterId: z3.number(),
    // Which LPA types to create: pf = Property & Finance, hw = Health & Welfare
    createPF: z3.boolean().default(true),
    createHW: z3.boolean().default(true),
    // Which clients to create for (testator1, testator2, or both for mirror)
    clients: z3.array(z3.enum(["testator1", "testator2"])).min(1),
    // When true, copy the matter's executors into the LPA attorney fields
    useExecutorsAsAttorneys: z3.boolean().default(true)
  })).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx.user?.role);
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const [matter] = await db.select().from(matters).where(eq3(matters.id, input.matterId));
    if (!matter) throw new TRPCError3({ code: "NOT_FOUND", message: "Matter not found" });
    const clients = await db.select().from(matterClients).where(eq3(matterClients.matterId, input.matterId));
    const executors = await db.select().from(matterExecutors).where(eq3(matterExecutors.matterId, input.matterId));
    const MATTER_PLACEHOLDER_WI_ID = 0;
    const created = [];
    for (const clientRole of input.clients) {
      const clientNum = clientRole === "testator1" ? 1 : 2;
      const client = clients.find((c) => c.clientRole === clientRole);
      if (!client) continue;
      const clientExecs = executors.filter(
        (e) => e.clientRole === clientRole || e.clientRole === "shared"
      );
      const attorneys = input.useExecutorsAsAttorneys ? clientExecs.filter((e) => e.executorType === "primary").map((e) => ({ firstNames: e.fullName, lastName: "", address: e.address ?? "" })) : [];
      const replacementAttorneys = input.useExecutorsAsAttorneys ? clientExecs.filter((e) => e.executorType === "substitute").map((e) => ({ firstNames: e.fullName, lastName: "", address: e.address ?? "" })) : [];
      const nameParts = (client.fullName ?? "").trim().split(/\s+/);
      const donorFirstNames = nameParts.slice(0, -1).join(" ") || client.fullName || "";
      const donorLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
      const donorAddress = client.address ?? "";
      const donorPostcode = "";
      const donorDob = client.dateOfBirth ?? "";
      const donorEmail = client.email ?? "";
      const lpaTypes = [];
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
          status: "draft"
        });
        created.push(result.insertId ?? 0);
      }
    }
    return { success: true, created };
  }),
  // Import a V1 will_instruction submission into a new V2 matter
  importFromV1: protectedProcedure.input(z3.object({ willInstructionId: z3.number() })).mutation(async ({ ctx, input }) => {
    requireAdmin(ctx.user?.role);
    const db = await getDb();
    if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const [sub] = await db.select().from(willInstructions).where(eq3(willInstructions.id, input.willInstructionId));
    if (!sub) throw new TRPCError3({ code: "NOT_FOUND", message: "Submission not found" });
    const products = Array.isArray(sub.productsOrdered) ? sub.productsOrdered : [];
    const isMirror = products.some((p) => typeof p === "string" && p.toLowerCase().includes("mirror")) || sub.willType?.toLowerCase().includes("mirror") || !!sub.client2FirstName;
    const matterType = isMirror ? "mirror" : "single";
    const matterResult = await db.insert(matters).values({
      matterType,
      fileReference: sub.referenceNumber ?? `V1-${sub.id}`,
      status: "draft"
    });
    const matterId = matterResult.insertId;
    const c1Name = [
      sub.client1Prefix,
      sub.client1FirstName,
      sub.client1MiddleName,
      sub.client1LastName
    ].filter(Boolean).join(" ").trim();
    const c1Address = [
      sub.client1AddressLine1,
      sub.client1City,
      sub.client1Postcode
    ].filter(Boolean).join(", ");
    await db.insert(matterClients).values({
      matterId,
      clientRole: "testator1",
      fullName: c1Name || "Client 1",
      address: c1Address || null,
      dateOfBirth: sub.client1Dob || null,
      email: sub.client1Email || null,
      phone: sub.client1DaytimePhone || sub.client1Mobile || null
    });
    if (isMirror && sub.client2FirstName) {
      const c2Name = [
        sub.client2Prefix,
        sub.client2FirstName,
        sub.client2MiddleName,
        sub.client2LastName
      ].filter(Boolean).join(" ").trim();
      const c2Address = [
        sub.client2AddressLine1,
        sub.client2City,
        sub.client2Postcode
      ].filter(Boolean).join(", ");
      await db.insert(matterClients).values({
        matterId,
        clientRole: "testator2",
        fullName: c2Name || "Client 2",
        address: c2Address || null,
        dateOfBirth: sub.client2Dob || null,
        email: sub.client2Email || null,
        phone: sub.client2DaytimePhone || sub.client2Mobile || null
      });
    }
    const c1Execs = Array.isArray(sub.client1Executors) ? sub.client1Executors : [];
    const c1ResExecs = Array.isArray(sub.client1ReservedExecutors) ? sub.client1ReservedExecutors : [];
    for (let i = 0; i < c1Execs.length; i++) {
      const e = c1Execs[i];
      await db.insert(matterExecutors).values({
        matterId,
        clientRole: "testator1",
        executorType: "primary",
        sortOrder: i,
        fullName: [e.title, e.firstName, e.lastName].filter(Boolean).join(" ") || e.name || "",
        address: e.address || null
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
        address: e.address || null
      });
    }
    if (isMirror) {
      const c2Execs = Array.isArray(sub.client2Executors) ? sub.client2Executors : [];
      const c2ResExecs = Array.isArray(sub.client2ReservedExecutors) ? sub.client2ReservedExecutors : [];
      for (let i = 0; i < c2Execs.length; i++) {
        const e = c2Execs[i];
        await db.insert(matterExecutors).values({
          matterId,
          clientRole: "testator2",
          executorType: "primary",
          sortOrder: i,
          fullName: [e.title, e.firstName, e.lastName].filter(Boolean).join(" ") || e.name || "",
          address: e.address || null
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
          address: e.address || null
        });
      }
    }
    const guardians = Array.isArray(sub.client1Guardians) ? sub.client1Guardians : [];
    const resGuardians = Array.isArray(sub.client1ReservedGuardians) ? sub.client1ReservedGuardians : [];
    for (let i = 0; i < guardians.length; i++) {
      const g = guardians[i];
      await db.insert(matterGuardians).values({
        matterId,
        guardianType: "primary",
        sortOrder: i,
        fullName: [g.title, g.firstName, g.lastName].filter(Boolean).join(" ") || g.name || "",
        address: g.address || null
      });
    }
    for (let i = 0; i < resGuardians.length; i++) {
      const g = resGuardians[i];
      await db.insert(matterGuardians).values({
        matterId,
        guardianType: "substitute",
        sortOrder: i,
        fullName: [g.title, g.firstName, g.lastName].filter(Boolean).join(" ") || g.name || "",
        address: g.address || null
      });
    }
    const c1Bens = Array.isArray(sub.client1Beneficiaries) ? sub.client1Beneficiaries : [];
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
        includeIssue: 0
      });
    }
    if (isMirror) {
      const c2Bens = Array.isArray(sub.client2Beneficiaries) ? sub.client2Beneficiaries : [];
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
          includeIssue: 0
        });
      }
    }
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
      generalNotes: sub.additionalNotes || sub.specialNotes || null
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
        generalNotes: null
      });
    }
    return { success: true, matterId, matterType };
  })
});

// server/routers/matters.ts
import { z as z4 } from "zod";
init_mattersDb();
var personSchema2 = z4.object({
  title: z4.string().optional(),
  fullName: z4.string().optional(),
  address: z4.string().optional(),
  gender: z4.string().optional(),
  relationship: z4.string().optional()
});
var executorSchema = personSchema2.extend({
  executorType: z4.enum(["primary", "substitute"]).default("primary")
});
var guardianSchema = personSchema2.extend({
  guardianType: z4.enum(["primary", "substitute"]).default("primary")
});
var beneficiarySchema = personSchema2.extend({
  beneficiaryType: z4.enum(["primary", "fallback"]).default("primary"),
  relationship: z4.string().optional(),
  shareFraction: z4.string().optional(),
  includeIssue: z4.number().int().min(0).max(1).default(1),
  recipientGroup: z4.string().optional(),
  divisionType: z4.string().optional(),
  divisionNotes: z4.string().optional()
});
var wishesSchema = z4.object({
  ageCondition: z4.number().int().min(0).max(99).default(18),
  survivorshipDays: z4.number().int().min(0).max(365).default(28),
  organDonation: z4.number().int().min(0).max(1).default(0),
  organDonationText: z4.string().optional(),
  funeralWishes: z4.string().optional(),
  extraNotes: z4.string().optional(),
  residueToSpouseFirst: z4.number().int().min(0).max(1).default(1),
  hasMinorChildren: z4.number().int().min(0).max(1).default(1),
  disasterClauseNotes: z4.string().optional(),
  generalNotes: z4.string().optional()
});
var giftSchema = z4.object({
  recipientGroup: z4.string().optional(),
  recipientName: z4.string().optional(),
  recipientAddress: z4.string().optional(),
  giftDescription: z4.string().optional(),
  giftType: z4.enum(["monetary", "asset", "residue", "property"]).default("asset"),
  onSecondDeath: z4.union([z4.boolean(), z4.number()]).transform((v) => v ? 1 : 0).optional(),
  divisionType: z4.string().optional(),
  divisionNotes: z4.string().optional()
});
var petSchema = z4.object({
  petName: z4.string().optional(),
  petType: z4.string().optional(),
  carerName: z4.string().optional(),
  carerAddress: z4.string().optional(),
  careNotes: z4.string().optional()
});
var propertySchema = z4.object({
  address: z4.string().optional(),
  ownershipType: z4.enum(["sole", "joint_tenants", "tenants_in_common"]).default("sole"),
  mortgageOutstanding: z4.number().int().min(0).max(1).default(0),
  mortgageLender: z4.string().optional(),
  propertyNotes: z4.string().optional(),
  giftOfProperty: z4.number().int().min(0).max(1).default(0),
  giftRecipientGroup: z4.string().optional(),
  giftRecipientName: z4.string().optional(),
  giftRecipientAddress: z4.string().optional(),
  giftCondition: z4.string().optional(),
  giftNotes: z4.string().optional()
});
var businessSchema = z4.object({
  businessName: z4.string().optional(),
  businessType: z4.string().optional(),
  sharePercentage: z4.string().optional(),
  businessNotes: z4.string().optional()
});
var mattersRouter = router({
  list: protectedProcedure.query(async () => {
    return listMatters();
  }),
  getById: protectedProcedure.input(z4.object({ id: z4.number().int() })).query(async ({ input }) => {
    const matter = await getMatterById(input.id);
    if (!matter) throw new Error("Matter not found");
    return matter;
  }),
  create: protectedProcedure.input(z4.object({
    matterType: z4.enum(["single", "mirror"]),
    fileReference: z4.string().optional()
  })).mutation(async ({ input }) => {
    const id = await createMatter({
      matterType: input.matterType,
      fileReference: input.fileReference ?? null,
      status: "draft"
    });
    return { id };
  }),
  updateMeta: protectedProcedure.input(z4.object({
    id: z4.number().int(),
    fileReference: z4.string().optional(),
    status: z4.enum(["draft", "complete"]).optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await updateMatter(id, data);
    return { success: true };
  }),
  delete: protectedProcedure.input(z4.object({ id: z4.number().int() })).mutation(async ({ input }) => {
    await deleteMatter(input.id);
    return { success: true };
  }),
  saveClient: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    clientRole: z4.enum(["testator1", "testator2"]),
    fullName: z4.string().optional(),
    address: z4.string().optional(),
    dateOfBirth: z4.string().optional(),
    email: z4.string().optional(),
    phone: z4.string().optional()
  })).mutation(async ({ input }) => {
    const { matterId, clientRole, ...data } = input;
    await upsertClient(matterId, clientRole, data);
    return { success: true };
  }),
  saveExecutors: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    clientRole: z4.enum(["testator1", "testator2", "shared"]),
    executors: z4.array(executorSchema)
  })).mutation(async ({ input }) => {
    await replaceExecutors(input.matterId, input.clientRole, input.executors);
    return { success: true };
  }),
  saveGuardians: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    guardians: z4.array(guardianSchema)
  })).mutation(async ({ input }) => {
    await replaceGuardians(input.matterId, input.guardians);
    return { success: true };
  }),
  saveBeneficiaries: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    clientRole: z4.enum(["testator1", "testator2", "shared"]),
    beneficiaries: z4.array(beneficiarySchema)
  })).mutation(async ({ input }) => {
    await replaceBeneficiaries(input.matterId, input.clientRole, input.beneficiaries);
    return { success: true };
  }),
  saveWishes: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    clientRole: z4.enum(["testator1", "testator2", "shared"]),
    wishes: wishesSchema
  })).mutation(async ({ input }) => {
    await upsertWishes(input.matterId, input.clientRole, input.wishes);
    return { success: true };
  }),
  saveGifts: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    clientRole: z4.enum(["testator1", "testator2", "shared"]),
    gifts: z4.array(giftSchema)
  })).mutation(async ({ input }) => {
    await replaceGifts(input.matterId, input.clientRole, input.gifts);
    return { success: true };
  }),
  savePets: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    pets: z4.array(petSchema)
  })).mutation(async ({ input }) => {
    await replacePets(input.matterId, input.pets);
    return { success: true };
  }),
  saveProperty: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    properties: z4.array(propertySchema)
  })).mutation(async ({ input }) => {
    await replaceProperty(input.matterId, input.properties);
    return { success: true };
  }),
  saveBusiness: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    businesses: z4.array(businessSchema)
  })).mutation(async ({ input }) => {
    await replaceBusiness(input.matterId, input.businesses);
    return { success: true };
  }),
  saveEditedWill: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    testatorRole: z4.enum(["testator1", "testator2"]),
    html: z4.string()
  })).mutation(async ({ input }) => {
    await saveEditedWillHtml(input.matterId, input.testatorRole, input.html);
    return { success: true };
  }),
  clearEditedWill: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    testatorRole: z4.enum(["testator1", "testator2"])
  })).mutation(async ({ input }) => {
    await clearEditedWillHtml(input.matterId, input.testatorRole);
    return { success: true };
  }),
  saveTrustClauses: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    clientRole: z4.string().default("shared"),
    clauses: z4.array(z4.object({
      trustType: z4.string(),
      enabled: z4.number().int().min(0).max(1).default(0),
      trustees: z4.array(z4.object({ name: z4.string(), address: z4.string() })).optional(),
      lifeTenants: z4.array(z4.object({ name: z4.string(), address: z4.string() })).optional(),
      beneficiaries: z4.array(z4.object({ name: z4.string(), relationship: z4.string() })).optional(),
      propertyAddress: z4.string().optional(),
      sharePercentage: z4.string().optional(),
      namedBeneficiary: z4.string().optional(),
      namedBeneficiaryDisability: z4.string().optional(),
      ageVesting: z4.number().int().optional(),
      notes: z4.string().optional(),
      terminateDeath: z4.number().int().min(0).max(1).optional(),
      terminateRemarriage: z4.number().int().min(0).max(1).optional(),
      terminateCohabitation: z4.number().int().min(0).max(1).optional()
    }))
  })).mutation(async ({ input }) => {
    await replaceTrustClauses(input.matterId, input.clientRole, input.clauses);
    return { success: true };
  }),
  // ── Exclusions ──────────────────────────────────────────────────────────────────
  listExclusions: protectedProcedure.input(z4.object({ matterId: z4.number().int() })).query(async ({ input }) => {
    return listExclusions(input.matterId);
  }),
  upsertExclusion: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    id: z4.number().int().optional(),
    clientRole: z4.enum(["testator1", "testator2"]).default("testator1"),
    fullName: z4.string().default(""),
    relationship: z4.string().default(""),
    reasonPreset: z4.string().optional(),
    reasonCustom: z4.string().optional()
  })).mutation(async ({ input }) => {
    const { matterId, ...data } = input;
    const id = await upsertExclusion(matterId, data);
    return { id };
  }),
  deleteExclusion: protectedProcedure.input(z4.object({
    id: z4.number().int(),
    matterId: z4.number().int()
  })).mutation(async ({ input }) => {
    await deleteExclusion(input.id, input.matterId);
    return { success: true };
  }),
  // ── Letter of Wishes ─────────────────────────────────────────────────────────────────
  getLetterOfWishes: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    clientRole: z4.enum(["testator1", "testator2"])
  })).query(async ({ input }) => {
    return getLetterOfWishes(input.matterId, input.clientRole);
  }),
  upsertLetterOfWishes: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    clientRole: z4.enum(["testator1", "testator2"]),
    content: z4.string()
  })).mutation(async ({ input }) => {
    await upsertLetterOfWishes(input.matterId, input.clientRole, input.content);
    return { success: true };
  }),
  // ── People Pool ────────────────────────────────────────────────────────────────────
  listPeoplePool: protectedProcedure.input(z4.object({ matterId: z4.number().int() })).query(async ({ input }) => listPeoplePool(input.matterId)),
  upsertPersonPool: protectedProcedure.input(z4.object({
    matterId: z4.number().int(),
    id: z4.number().int().optional(),
    fullName: z4.string(),
    dateOfBirth: z4.string().optional(),
    address: z4.string().optional(),
    relationship: z4.string().optional(),
    sourceRole: z4.string().optional()
  })).mutation(async ({ input }) => {
    const { matterId, ...data } = input;
    const id = await upsertPersonPool(matterId, data);
    return { id };
  }),
  deletePersonPool: protectedProcedure.input(z4.object({ id: z4.number().int(), matterId: z4.number().int() })).mutation(async ({ input }) => {
    await deletePersonPool(input.id, input.matterId);
    return { success: true };
  }),
  // ── Transfer from Will Instruction to V2 Matter ──────────────────────────
  transferFromInstruction: protectedProcedure.input(z4.object({ instructionId: z4.number().int() })).mutation(async ({ input }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { willInstructions: willInstructions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq7 } = await import("drizzle-orm");
    const db = await getDb2();
    if (!db) throw new Error("Database unavailable");
    const rows = await db.select().from(willInstructions2).where(eq7(willInstructions2.id, input.instructionId)).limit(1);
    const ins = rows[0];
    if (!ins) throw new Error("Instruction not found");
    const isMirror = ins.willType === "mirror" || ins.willType === "mirrorWills";
    const matterType = isMirror ? "mirror" : "single";
    const fullName5 = (prefix, first, middle, last) => [prefix, first, middle, last].filter(Boolean).join(" ").trim() || void 0;
    const buildAddress = (line1, city, postcode) => [line1, city, postcode].filter(Boolean).join(", ").trim() || void 0;
    const safeArr5 = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      if (typeof v === "string") {
        try {
          return JSON.parse(v);
        } catch {
          return [];
        }
      }
      return [];
    };
    const matterId = await createMatter({
      matterType,
      fileReference: ins.referenceNumber ?? void 0,
      status: "draft"
    });
    const c1Name = fullName5(ins.client1Prefix, ins.client1FirstName, ins.client1MiddleName, ins.client1LastName);
    const c1Address = buildAddress(ins.client1AddressLine1, ins.client1City, ins.client1Postcode);
    await upsertClient(matterId, "testator1", {
      fullName: c1Name,
      address: c1Address,
      dateOfBirth: ins.client1Dob ?? void 0,
      email: ins.client1Email ?? void 0,
      phone: ins.client1Mobile ?? ins.client1DaytimePhone ?? void 0
    });
    if (isMirror) {
      const c2Name = fullName5(ins.client2Prefix, ins.client2FirstName, ins.client2MiddleName, ins.client2LastName);
      const c2Address = buildAddress(ins.client2AddressLine1, ins.client2City, ins.client2Postcode);
      await upsertClient(matterId, "testator2", {
        fullName: c2Name,
        address: c2Address,
        dateOfBirth: ins.client2Dob ?? void 0,
        email: ins.client2Email ?? void 0,
        phone: ins.client2Mobile ?? ins.client2DaytimePhone ?? void 0
      });
    }
    const personFullName2 = (p) => {
      if (p.fullName && typeof p.fullName === "string" && p.fullName.trim()) return p.fullName.trim();
      const parts = [p.prefix, p.firstName, p.middleName, p.lastName].filter((v) => typeof v === "string" && v.trim());
      if (parts.length > 0) return parts.join(" ").trim();
      return typeof p.name === "string" ? p.name.trim() : "";
    };
    const toExecRows = (arr, type) => arr.map((p) => ({ fullName: personFullName2(p), address: typeof p.address === "string" ? p.address : "", executorType: type }));
    if (isMirror) {
      await replaceExecutors(matterId, "testator1", [
        ...toExecRows(safeArr5(ins.client1Executors), "primary"),
        ...toExecRows(safeArr5(ins.client1ReservedExecutors), "substitute")
      ]);
      await replaceExecutors(matterId, "testator2", [
        ...toExecRows(safeArr5(ins.client2Executors), "primary"),
        ...toExecRows(safeArr5(ins.client2ReservedExecutors), "substitute")
      ]);
    } else {
      await replaceExecutors(matterId, "shared", [
        ...toExecRows(safeArr5(ins.executors), "primary"),
        ...toExecRows(safeArr5(ins.reservedExecutors), "substitute")
      ]);
    }
    const toGuardianRows = (arr, type) => arr.map((p) => ({ fullName: personFullName2(p), address: typeof p.address === "string" ? p.address : "", guardianType: type }));
    if (isMirror) {
      const allGuards = [
        ...toGuardianRows(safeArr5(ins.client1Guardians), "primary"),
        ...toGuardianRows(safeArr5(ins.client1ReservedGuardians), "substitute"),
        ...toGuardianRows(safeArr5(ins.client2Guardians), "primary"),
        ...toGuardianRows(safeArr5(ins.client2ReservedGuardians), "substitute")
      ];
      await replaceGuardians(matterId, allGuards);
    } else {
      await replaceGuardians(matterId, [
        ...toGuardianRows(safeArr5(ins.guardians), "primary"),
        ...toGuardianRows(safeArr5(ins.reservedGuardians), "substitute")
      ]);
    }
    const toBenRows = (arr, type) => arr.map((p) => ({
      fullName: personFullName2(p),
      address: typeof p.address === "string" ? p.address : "",
      relationship: typeof p.relationship === "string" ? p.relationship : "",
      shareFraction: typeof p.share === "string" ? p.share : "",
      beneficiaryType: type,
      includeIssue: 1
    }));
    if (isMirror) {
      await replaceBeneficiaries(matterId, "testator1", toBenRows(safeArr5(ins.client1Beneficiaries), "primary"));
      await replaceBeneficiaries(matterId, "testator2", toBenRows(safeArr5(ins.client2Beneficiaries), "primary"));
    } else {
      await replaceBeneficiaries(matterId, "shared", toBenRows(safeArr5(ins.beneficiaries), "primary"));
    }
    const toGiftRows = (arr) => arr.map((g) => ({
      recipientName: (typeof g.recipientName === "string" ? g.recipientName : null) ?? (typeof g.recipient === "string" ? g.recipient : ""),
      recipientAddress: typeof g.recipientAddress === "string" ? g.recipientAddress : "",
      giftDescription: (typeof g.giftDescription === "string" ? g.giftDescription : null) ?? (typeof g.description === "string" ? g.description : ""),
      giftType: (typeof g.giftType === "string" ? g.giftType : null) ?? (typeof g.type === "string" ? g.type : "asset"),
      onSecondDeath: g.onSecondDeath ? 1 : 0,
      divisionType: typeof g.divisionType === "string" ? g.divisionType : "equally",
      divisionNotes: typeof g.divisionNotes === "string" ? g.divisionNotes : null
    }));
    if (isMirror) {
      await replaceGifts(matterId, "testator1", toGiftRows(safeArr5(ins.client1SpecificGifts)));
      await replaceGifts(matterId, "testator2", toGiftRows(safeArr5(ins.client2SpecificGifts)));
    } else {
      await replaceGifts(matterId, "shared", toGiftRows(safeArr5(ins.specificGifts)));
    }
    if (ins.propertyAddress) {
      const ownershipMap = {
        sole: "sole",
        joint: "joint_tenants",
        joint_tenants: "joint_tenants",
        tenants_in_common: "tenants_in_common"
      };
      const ownershipType = ownershipMap[ins.propertyOwnership ?? ""] ?? "sole";
      await replaceProperty(matterId, [{
        address: ins.propertyAddress,
        ownershipType,
        mortgageOutstanding: ins.mortgageOutstanding === "yes" ? 1 : 0,
        mortgageLender: ins.mortgageLender ?? void 0
      }]);
    }
    const buildWishes = (funeralType, funeralWishes, organDonation, notes) => ({
      funeralWishes: [funeralType, funeralWishes].filter(Boolean).join(" \u2014 ") || void 0,
      organDonation: organDonation === "yes" ? 1 : 0,
      extraNotes: notes ?? void 0
    });
    if (isMirror) {
      await upsertWishes(matterId, "testator1", buildWishes(ins.client1FuneralType, ins.client1FuneralWishes, ins.client1OrganDonation, ins.disasterClauseNotes));
      await upsertWishes(matterId, "testator2", buildWishes(ins.client2FuneralType, ins.client2FuneralWishes, ins.client2OrganDonation, ins.disasterClauseNotes));
    } else {
      await upsertWishes(matterId, "shared", buildWishes(ins.funeralType, ins.funeralWishes, ins.organDonation, ins.disasterClauseNotes ?? ins.additionalNotes ?? ins.specialNotes));
    }
    const poolPeople = [];
    if (c1Name) poolPeople.push({ fullName: c1Name, address: c1Address, dateOfBirth: ins.client1Dob ?? void 0, sourceRole: "testator1" });
    if (isMirror) {
      const c2Name2 = fullName5(ins.client2Prefix, ins.client2FirstName, ins.client2MiddleName, ins.client2LastName);
      const c2Address2 = buildAddress(ins.client2AddressLine1, ins.client2City, ins.client2Postcode);
      if (c2Name2) poolPeople.push({ fullName: c2Name2, address: c2Address2, dateOfBirth: ins.client2Dob ?? void 0, sourceRole: "testator2" });
    }
    const addToPool = (arr, role) => arr.forEach((p) => {
      const n = personFullName2(p);
      if (n) poolPeople.push({ fullName: n, address: typeof p.address === "string" ? p.address : void 0, sourceRole: role });
    });
    addToPool(safeArr5(isMirror ? ins.client1Executors : ins.executors), "executor");
    if (isMirror) addToPool(safeArr5(ins.client2Executors), "executor");
    addToPool(safeArr5(isMirror ? ins.client1Guardians : ins.guardians), "guardian");
    if (isMirror) addToPool(safeArr5(ins.client2Guardians), "guardian");
    addToPool(safeArr5(isMirror ? ins.client1Beneficiaries : ins.beneficiaries), "beneficiary");
    if (isMirror) addToPool(safeArr5(ins.client2Beneficiaries), "beneficiary");
    const seen = /* @__PURE__ */ new Set();
    for (const p of poolPeople) {
      if (!p.fullName || seen.has(p.fullName)) continue;
      seen.add(p.fullName);
      await upsertPersonPool(matterId, p);
    }
    return { matterId };
  })
});

// server/routers/users.ts
init_schema();
init_db();
import { eq as eq5 } from "drizzle-orm";
import { z as z5 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";
async function d2() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}
var usersRouter = router({
  /** List all registered users — admin only */
  list: adminProcedure.query(async () => {
    const db = await d2();
    const rows = await db.select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role
    }).from(users).orderBy(users.id);
    return rows;
  }),
  /** Promote or demote a user — any admin can do this */
  setRole: adminProcedure.input(
    z5.object({
      userId: z5.number(),
      role: z5.enum(["user", "admin"])
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await d2();
    const [target] = await db.select({ openId: users.openId }).from(users).where(eq5(users.id, input.userId));
    if (!target) {
      throw new TRPCError4({ code: "NOT_FOUND", message: "User not found." });
    }
    if (target.openId === ctx.user.openId && input.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "You cannot demote yourself."
      });
    }
    await db.update(users).set({ role: input.role }).where(eq5(users.id, input.userId));
    return { success: true };
  })
});

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    login: publicProcedure.input(z6.object({ password: z6.string() })).mutation(async ({ input, ctx }) => {
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        throw new Error("ADMIN_PASSWORD environment variable is not configured on the server.");
      }
      if (input.password !== adminPassword) {
        throw new Error("Incorrect password.");
      }
      const openId = "local-admin";
      await upsertUser({
        openId,
        name: "Admin",
        role: "admin",
        loginMethod: "password",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "genesis-default-secret");
      const token = await new SignJWT2({ openId, appId: "local", name: "Admin" }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1e3)).sign(secret);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS
      });
      return { success: true };
    })
  }),
  will: willInstructionsRouter,
  lpa: lpaRouter,
  matters: mattersRouter,
  users: usersRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/willGenerator.ts
import PDFDocumentLib from "pdfkit";
import https2 from "https";
import http2 from "http";
var LOGO_URL2 = "/manus-storage/GenesisEstatePlanningLogoUSETHISONE_edc6d153.png";
function fetchBuffer2(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https2 : http2;
    mod.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer2(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}
function safe3(v) {
  return v?.trim() || "";
}
function safeArr3(v) {
  if (!v) return [];
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (Array.isArray(v)) return v;
  return [];
}
function fullName(p, includeDob = true) {
  if (!p) return "";
  const name = [p.title, p.prefix, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ").trim();
  const dobPart = includeDob && p.dob ? ` (born ${p.dob})` : "";
  return name + dobPart;
}
function personAddress(p) {
  return safe3(p?.address);
}
function relationship(p) {
  return safe3(p?.relationship) || "person";
}
function pronoun(gender) {
  if (gender === "male") return { subj: "he", poss: "his", obj: "him", subjCap: "He" };
  if (gender === "female") return { subj: "she", poss: "her", obj: "her", subjCap: "She" };
  return { subj: "they", poss: "their", obj: "them", subjCap: "They" };
}
var GARAMOND = "Times-Roman";
var GARAMOND_BOLD = "Times-Bold";
var PAGE_MARGIN = 72;
var PAGE_WIDTH = 595.28;
var CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
async function fetchLogoBuffer2() {
  try {
    const fs3 = await import("fs");
    const path3 = await import("path");
    const localPath = path3.join(process.cwd(), "../webdev-static-assets/GenesisEstatePlanningLogoUSETHISONE.png");
    if (fs3.existsSync(localPath)) {
      return fs3.readFileSync(localPath);
    }
    const baseUrl = `http://localhost:${process.env.PORT ?? 3e3}`;
    return await fetchBuffer2(`${baseUrl}${LOGO_URL2}`);
  } catch {
    return null;
  }
}
function addCoverPage(doc, testatorName, reference, logoBuffer) {
  doc.rect(30, 30, PAGE_WIDTH - 60, doc.page.height - 60).stroke("#000000");
  doc.rect(40, 40, PAGE_WIDTH - 80, doc.page.height - 80).stroke("#000000");
  if (logoBuffer) {
    const logoW = 200;
    const logoX = (PAGE_WIDTH - logoW) / 2;
    try {
      doc.image(logoBuffer, logoX, 60, { width: logoW });
    } catch {
    }
  }
  const boxTop = 145;
  const boxHeight = 160;
  const boxLeft = 100;
  const boxWidth = PAGE_WIDTH - 200;
  doc.rect(boxLeft, boxTop, boxWidth, boxHeight).stroke("#000000");
  doc.font(GARAMOND).fontSize(18).text("THE LAST WILL & TESTAMENT", boxLeft, boxTop + 24, {
    width: boxWidth,
    align: "center"
  });
  doc.font(GARAMOND).fontSize(14).text("of", boxLeft, boxTop + 56, { width: boxWidth, align: "center" });
  doc.font(GARAMOND_BOLD).fontSize(18).text(testatorName, boxLeft, boxTop + 80, { width: boxWidth, align: "center" });
  if (reference) {
    doc.font(GARAMOND).fontSize(11).text(`(${reference})`, boxLeft, boxTop + 118, { width: boxWidth, align: "center" });
  }
  const footerTop = doc.page.height - 200;
  doc.font(GARAMOND).fontSize(10).fillColor("#333333").text("Genesis Wills and Estate Planning Ltd", 0, footerTop, {
    width: PAGE_WIDTH,
    align: "center"
  }).text("The Business Village Innovation Way Barnsley", { width: PAGE_WIDTH, align: "center" }).text("South Yorkshire S75 1JL", { width: PAGE_WIDTH, align: "center" }).text("office@genesisestateplanning.info", { width: PAGE_WIDTH, align: "center" }).text("0330 1180937", { width: PAGE_WIDTH, align: "center" }).text("https://www.genesisestateplanning.net/", { width: PAGE_WIDTH, align: "center" });
  doc.fillColor("#000000");
}
function addPageHeader(doc, testatorName, addressLine1, addressLine2) {
  doc.font(GARAMOND_BOLD).fontSize(13).text("This is the last Will and Testament", PAGE_MARGIN, PAGE_MARGIN, {
    width: CONTENT_WIDTH,
    align: "center"
  });
  doc.font(GARAMOND).fontSize(12).text(`- of - ${testatorName}`, { width: CONTENT_WIDTH, align: "center" });
  if (addressLine1) doc.text(addressLine1, { width: CONTENT_WIDTH, align: "center" });
  if (addressLine2) doc.text(addressLine2, { width: CONTENT_WIDTH, align: "center" });
  doc.moveDown(1.5);
}
function clauseHeading(doc, num, title) {
  doc.moveDown(0.8);
  doc.font(GARAMOND_BOLD).fontSize(12).text(`${num}.  ${title}`, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.4);
}
function bodyText(doc, text2) {
  doc.font(GARAMOND).fontSize(11).text(text2, PAGE_MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    align: "justify",
    lineGap: 3
  });
  doc.moveDown(0.5);
}
function subItem(doc, label, text2, indent = 20) {
  doc.font(GARAMOND).fontSize(11).text(`${label}  ${text2}`, PAGE_MARGIN + indent, doc.y, {
    width: CONTENT_WIDTH - indent,
    align: "justify",
    lineGap: 3
  });
  doc.moveDown(0.4);
}
function buildRevocationClause(doc, clauseNum, testatorName, dob, fullAddress, excludedCountry) {
  clauseHeading(doc, clauseNum, "Revocation");
  const excl = excludedCountry ? ` excluding that in ${excludedCountry.toUpperCase()}` : "";
  bodyText(
    doc,
    `I ${testatorName}${dob ? ` date of birth ${dob}` : ""} of ${fullAddress || "[address]"} do hereby revoke all former Wills and testamentary dispositions so far as they relate to my property of every kind wherever situate${excl} and declare that the law of England & Wales shall apply to this my will hereinafter referred to as my Will in relation to my property of every kind wherever situate${excl}`
  );
}
function buildExecutorsClause(doc, clauseNum, executors) {
  clauseHeading(doc, clauseNum, "Appointment of Executors");
  if (!executors.length) {
    bodyText(doc, "I appoint [Executor Name] to be the sole executor of this my Will.");
  } else {
    const primary = executors[0];
    const substitutes = executors.slice(1);
    let text2 = `I appoint ${fullName(primary)}`;
    if (personAddress(primary)) text2 += ` of ${personAddress(primary)}`;
    text2 += ` to be the sole executor of this my Will`;
    if (substitutes.length > 0) {
      text2 += ` but if my ${relationship(primary)} is unable or unwilling to prove my Will then I APPOINT `;
      text2 += substitutes.map((s) => {
        let t2 = fullName(s);
        if (personAddress(s)) t2 += ` of ${personAddress(s)}`;
        return t2;
      }).join(" and ");
      text2 += ` to be the executors of this my Will (hereinafter referred to as 'my Executors')`;
    } else {
      text2 += ` (hereinafter referred to as 'my Executors')`;
    }
    bodyText(doc, text2);
  }
  doc.moveDown(0.4);
  bodyText(
    doc,
    "Always provided that if a trust is created in the following clauses of this my Will and no appointment of a trustee is made in relation to that trust I direct that my Executor shall be appointed as my trustee hereinafter referred to as 'my trustees' which expression shall include the trustee or trustees for the time being hereof"
  );
}
function buildReservedExecutorsClause(doc, clauseNum, reservedExecutors) {
  if (!reservedExecutors.length) return;
  clauseHeading(doc, clauseNum, "Appointment of Reserve Executors");
  const names = reservedExecutors.map((e) => {
    let t2 = fullName(e);
    if (personAddress(e)) t2 += ` of ${personAddress(e)}`;
    return t2;
  }).filter(Boolean);
  if (names.length === 1) {
    bodyText(doc, `In the event that my primary Executor is unable or unwilling to act I APPOINT ${names[0]} as Reserve Executor of this my Will (hereinafter also referred to as 'my Executors').`);
  } else {
    bodyText(doc, `In the event that my primary Executor is unable or unwilling to act I APPOINT ${names.join(" and ")} as Reserve Executors of this my Will (hereinafter also referred to as 'my Executors').`);
  }
}
function buildGuardiansClause(doc, clauseNum, guardians, reservedGuardians) {
  if (!guardians.length && !reservedGuardians.length) return;
  clauseHeading(doc, clauseNum, "Appointment of Guardians");
  if (guardians.length > 0) {
    const names = guardians.map((g) => {
      let t2 = fullName(g);
      if (personAddress(g)) t2 += ` of ${personAddress(g)}`;
      return t2;
    }).filter(Boolean);
    bodyText(
      doc,
      `In the event of my death whilst my children are under the age of eighteen years I APPOINT ${names.join(" and ")} to be the Guardian${names.length > 1 ? "s" : ""} of my minor children.`
    );
  }
  if (reservedGuardians.length > 0) {
    const rNames = reservedGuardians.map((g) => {
      let t2 = fullName(g);
      if (personAddress(g)) t2 += ` of ${personAddress(g)}`;
      return t2;
    }).filter(Boolean);
    bodyText(
      doc,
      `In the event that the above-named Guardian${reservedGuardians.length > 1 ? "s are" : " is"} unable or unwilling to act I APPOINT ${rNames.join(" and ")} as Reserve Guardian${rNames.length > 1 ? "s" : ""} of my minor children.`
    );
  }
}
function buildDefinitionClause(doc, clauseNum, excludedCountry) {
  clauseHeading(doc, clauseNum, "Definition and Administration of my Estate");
  const excl = excludedCountry ? ` excluding that in ${excludedCountry.toUpperCase()}` : "";
  subItem(doc, "a)", "In this my Will where the context so admits my Estate shall mean:");
  subItem(doc, "i)", `all my real and personal property of every kind wherever situate${excl} including that over which I have a general power of appointment and`, 40);
  subItem(doc, "ii)", "the money investments and property from time to time representing all such property", 40);
  subItem(doc, "b)", "My Executors shall hold my Estate upon trust");
  subItem(doc, "i)", "to pay and discharge all my debts funeral testamentary and administration expenses and", 40);
  subItem(doc, "ii)", "to give effect to all legacies", 40);
}
function buildDistributionClause(doc, clauseNum, primaryBeneficiary, beneficiaries, specificGifts) {
  clauseHeading(doc, clauseNum, "Distribution of the Residue");
  bodyText(doc, "SUBJECT to the trusts DECLARED above my Executors SHALL HOLD my Estate as follows:");
  if (primaryBeneficiary && fullName(primaryBeneficiary)) {
    subItem(
      doc,
      "a)",
      `Upon trust absolutely for my ${relationship(primaryBeneficiary)} ${fullName(primaryBeneficiary)} if ${pronoun(primaryBeneficiary.gender).subj} shall survive me for the period of twenty eight days but if my said ${relationship(primaryBeneficiary)} shall die in my lifetime or shall not survive me for the period aforesaid or if this gift fails or lapses for any other reason and subject thereto`
    );
  } else {
    subItem(doc, "a)", "Upon trust absolutely for [Primary Beneficiary] if they shall survive me for the period of twenty eight days but if my said beneficiary shall die in my lifetime or shall not survive me for the period aforesaid or if this gift fails or lapses for any other reason and subject thereto");
  }
  if (beneficiaries.length > 0) {
    subItem(doc, "b)", "Upon trust in the following shares:");
    const equalShare = Math.floor(100 / beneficiaries.length);
    beneficiaries.forEach((b, i) => {
      const name = fullName(b) || "[Beneficiary]";
      const share = b.share || `${equalShare}%`;
      const label = `${["i)", "ii)", "iii)", "iv)", "v)", "vi)", "vii)", "viii)"][i] || `${i + 1})`}`;
      subItem(
        doc,
        label,
        `${share} to ${name} Provided that if my said ${name} shall die without having attained a vested interest leaving issue who survive me then such issue shall take by substitution such failed share and if there shall be more than one of such issue they shall take in equal shares per stirpes but so that no issue shall take whose parent is alive and so capable of taking`,
        40
      );
    });
    doc.moveDown(0.4);
    bodyText(
      doc,
      "If any of the share or shares under this sub clause b) shall fail in their entirety that share or those shares shall be added proportionally to the other shares that have not failed (and this provision shall apply to both an original share and an augmented share)"
    );
  }
  if (specificGifts.length > 0) {
    doc.moveDown(0.4);
    specificGifts.forEach((g) => {
      if (g.description || g.recipient) {
        bodyText(doc, `I give ${safe3(g.description) || "[item]"} to ${safe3(g.recipient) || "[recipient]"}${g.value ? ` (estimated value: ${g.value})` : ""}.`);
      }
    });
  }
}
function buildAgeConditionClause(doc, clauseNum) {
  clauseHeading(doc, clauseNum, "Conditional Gift at Specified Age of 18 Years");
  bodyText(
    doc,
    "Any interest left in this my Will to a beneficiary shall be conditional on them attaining the age of 18 years and shall carry the intermediate interest until that age I give the power to my Executors in their absolute discretion to advance part or all of such entitlement which my Executors deem to be appropriate"
  );
}
function buildExecutorPowersClause(doc, clauseNum) {
  clauseHeading(doc, clauseNum, "Executor and Trustee Powers");
  bodyText(
    doc,
    "My Executors and trustees shall in addition to and without prejudice to all statutory powers have the powers and immunities set out in The STEP Powers provided they shall not exercise any of their powers so as to conflict with the beneficial provisions of this my Will"
  );
}
function buildSurvivorshipClause(doc, clauseNum) {
  clauseHeading(doc, clauseNum, "Survivorship");
  bodyText(
    doc,
    "Any Person who does not survive me by twenty eight days who would otherwise be a beneficiary under this my Will shall be treated for the purposes of my Will as having died in my lifetime"
  );
}
function buildOrganDonationClause(doc, clauseNum) {
  clauseHeading(doc, clauseNum, "Organ Donation");
  bodyText(
    doc,
    "I declare that it is my desire that after my death any of my organs can be used for therapeutic purposes"
  );
}
function buildFuneralWishesClause(doc, clauseNum, funeralType, funeralWishes) {
  clauseHeading(doc, clauseNum, "Funeral Wishes");
  const ft = funeralType ? funeralType.toLowerCase() : "";
  if (ft === "burial") {
    bodyText(doc, "I desire that my body be buried and the expense thereof shall be a first charge on my Estate.");
  } else if (ft === "cremation") {
    bodyText(doc, "I desire that my body be cremated and my ashes disposed of as my Executors shall think fit, and the expense thereof shall be a first charge on my Estate.");
  } else if (ft === "no preference" || ft === "no_preference") {
    bodyText(doc, "I leave the choice of burial or cremation to the discretion of my Executors.");
  } else {
    bodyText(doc, "I desire that my body be [cremated/buried] and the expense thereof shall be a first charge on my Estate.");
  }
  if (funeralWishes && funeralWishes.trim()) {
    bodyText(doc, funeralWishes.trim());
  }
  bodyText(doc, "These wishes are not legally binding on my Executors but I ask that they be given due consideration.");
}
function buildStepPowersClause(doc, clauseNum) {
  clauseHeading(doc, clauseNum, "STEP Powers");
  bodyText(
    doc,
    "In this my Will where the context so admits any reference to the STEP Powers shall mean the Standard Provisions (2nd edition) of the Society of Trust and Estate Practitioners together with the Special Provisions (2nd edition) (with the exception of Special Provision 5) shall apply to this my Will"
  );
}
function buildAvoidanceOfDoubtClause(doc, clauseNum) {
  clauseHeading(doc, clauseNum, "For the Avoidance of Doubt");
  bodyText(doc, "I declare that");
  subItem(doc, "a)", "Clause headings are included for reference purposes only and do not affect the interpretation of this my Will");
  subItem(doc, "b)", "Words denoting the singular shall include the plural and vice versa and the masculine includes the feminine and vice versa");
  subItem(doc, "c)", "Person shall include a body of persons either corporate or incorporate");
  subItem(doc, "d)", "References to any statutory provision shall include any statutory modification or re-enactment of such provisions");
  subItem(doc, "e)", "Due to printing limitations the reverse side of every page of this my Will may be left blank");
  subItem(doc, "f)", "This is to be the last clause of my Will and shall be followed only by the attestation clause");
}
function safeClauseArr(v) {
  if (!v) return [];
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (Array.isArray(v)) return v;
  return [];
}
function trusteeNames(trustees, fallback = "my Executors") {
  const names = (trustees ?? []).map((p) => fullName(p)).filter(Boolean);
  if (names.length === 0) return fallback;
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}
function beneficiaryNamesWithShares(people, fallback = "my children and remoter issue in equal shares absolutely") {
  const parts = (people ?? []).map((p) => {
    const n = fullName(p);
    return n && p.share ? `${n} as to ${p.share}` : n;
  }).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0] + " absolutely";
  return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] + " in the shares specified";
}
function buildPPTClause(doc, clauseNum, clause) {
  const property = clause.propertyAddress || "my principal residence";
  const lifeTenantNames = (clause.lifeTenants ?? []).map((p) => fullName(p)).filter(Boolean);
  const lifeTenantStr = lifeTenantNames.length > 0 ? lifeTenantNames.join(" and ") : "my surviving spouse or civil partner";
  const trustees = trusteeNames(clause.trustees);
  const ultimateBens = beneficiaryNamesWithShares(clause.ultimateBeneficiaries);
  const triggers = clause.terminationTriggers ?? {};
  clauseHeading(doc, clauseNum, "Protective Property Trust (Lifetime Interest Trust)");
  bodyText(doc, `I DECLARE that my share of the property known as ${property} (hereinafter referred to as "the Property") shall not pass under the general gift of my Residuary Estate but shall instead be held upon the following trusts:`);
  subItem(doc, "a)", `The Trustees of this trust shall be ${trustees} (hereinafter referred to as "the Trustees") and the Trustees shall hold my share of the Property upon the trusts and with and subject to the powers and provisions hereinafter declared and contained.`);
  subItem(doc, "b)", `The Trustees shall hold my share of the Property upon trust to permit ${lifeTenantStr} (hereinafter referred to as "the Life Tenant") to have the right to reside in the Property during the Trust Period.`);
  const terminationEvents = [];
  if (triggers.onDeath !== false) {
    terminationEvents.push("the death of the Life Tenant");
  }
  if (triggers.onRemarriageOrCohabitation) {
    terminationEvents.push("the Life Tenant remarrying, entering into a civil partnership, or beginning to cohabit with another person as defined by applicable law");
  }
  if (triggers.onCeasingToReside) {
    terminationEvents.push("the Life Tenant ceasing to permanently reside in the Property for a continuous period, including (without limitation) moving into long-term residential care or permanently vacating the Property");
  }
  if (triggers.onBreachOfConditions) {
    terminationEvents.push("the Life Tenant failing to comply with the conditions of this trust, including the obligation to keep the Property insured to its full reinstatement value, maintained in good repair, and to pay all outgoings including rates, taxes, and service charges");
  }
  if (terminationEvents.length > 0) {
    const triggerList = terminationEvents.map((e, i) => `(${String.fromCharCode(105 + i)}) ${e}`).join("; or ");
    subItem(doc, "c)", `The Trust Period shall commence on the date of my death and shall terminate upon the first to occur of the following events: ${triggerList}.`);
  } else {
    subItem(doc, "c)", "The Trust Period shall commence on the date of my death and shall terminate upon the death of the Life Tenant.");
  }
  if (clause.trustPeriodNotes) {
    subItem(doc, "d)", clause.trustPeriodNotes);
    subItem(doc, "e)", `Upon the termination of the Trust Period the Trustees shall hold the Property (or the net proceeds of sale thereof) upon trust for ${ultimateBens}.`);
    subItem(doc, "f)", "The Life Tenant shall be responsible for the payment of all outgoings in respect of the Property including rates, taxes, insurance, and the cost of all repairs and maintenance.");
    subItem(doc, "g)", "The Trustees shall have power to sell the Property and to apply the proceeds of sale in the purchase of another property to be held upon the same trusts or to invest the same as if they were absolute beneficial owners thereof.");
    subItem(doc, "h)", "The Trustees shall have all the powers of an absolute owner in relation to the Property and shall have the widest possible powers of management and investment.");
  } else {
    subItem(doc, "d)", `Upon the termination of the Trust Period the Trustees shall hold the Property (or the net proceeds of sale thereof) upon trust for ${ultimateBens}.`);
    subItem(doc, "e)", "The Life Tenant shall be responsible for the payment of all outgoings in respect of the Property including rates, taxes, insurance, and the cost of all repairs and maintenance.");
    subItem(doc, "f)", "The Trustees shall have power to sell the Property and to apply the proceeds of sale in the purchase of another property to be held upon the same trusts or to invest the same as if they were absolute beneficial owners thereof.");
    subItem(doc, "g)", "The Trustees shall have all the powers of an absolute owner in relation to the Property and shall have the widest possible powers of management and investment.");
  }
  if (clause.notes) {
    doc.moveDown(0.3);
    bodyText(doc, clause.notes);
  }
}
function buildDiscretionaryTrustClause(doc, clauseNum, clause) {
  const trustees = trusteeNames(clause.trustees);
  const benefClass = clause.beneficiaryClass || "my children and remoter issue and such other persons as my Trustees shall in their absolute discretion determine";
  const additionalBens = (clause.additionalBeneficiaries ?? []).map((p) => fullName(p)).filter(Boolean);
  clauseHeading(doc, clauseNum, "Discretionary Trust");
  bodyText(doc, `I DECLARE that the following provisions shall apply to the Discretionary Trust created by this my Will:`);
  subItem(doc, "a)", `The Trustees of this Discretionary Trust shall be ${trustees} or such other persons as shall be appointed as trustees hereof from time to time.`);
  const fullBenClass = additionalBens.length > 0 ? `${benefClass}, together with ${additionalBens.join(", ")}` : benefClass;
  subItem(doc, "b)", `The Beneficiaries of this Discretionary Trust shall be ${fullBenClass}.`);
  subItem(doc, "c)", "My Trustees shall hold the trust fund upon trust to pay or apply the income and/or capital thereof to or for the benefit of all or any one or more of the Beneficiaries in such shares and proportions and in such manner as my Trustees shall in their absolute discretion think fit.");
  subItem(doc, "d)", "My Trustees shall have the widest possible powers of investment as if they were absolute beneficial owners of the trust fund and shall not be restricted to investments authorised by law for trustees.");
  subItem(doc, "e)", "This Discretionary Trust shall terminate on the expiry of the period of 125 years from the date of my death (which period shall be the perpetuity period applicable to this trust) and upon such termination the trust fund shall be held for such of the Beneficiaries as are then living in equal shares absolutely.");
  if (clause.terminationNotes) {
    doc.moveDown(0.3);
    bodyText(doc, clause.terminationNotes);
  }
  if (clause.notes) {
    doc.moveDown(0.3);
    bodyText(doc, clause.notes);
  }
}
function buildVulnerableTrustClause(doc, clauseNum, clause) {
  const vbName = clause.vulnerableBeneficiary ? fullName(clause.vulnerableBeneficiary) || "[Vulnerable Beneficiary Name]" : "[Vulnerable Beneficiary Name]";
  const trustees = trusteeNames(clause.trustees);
  const ultimateBens = beneficiaryNamesWithShares(clause.ultimateBeneficiaries, "my children and remoter issue as shall then be living in equal shares absolutely or if none for my estate");
  clauseHeading(doc, clauseNum, "Vulnerable Person's Trust");
  bodyText(doc, `I DECLARE that the following provisions shall apply to the Vulnerable Person's Trust created by this my Will for the benefit of ${vbName} (hereinafter referred to as "the Vulnerable Beneficiary"):`);
  subItem(doc, "a)", `The Trustees of this trust shall be ${trustees}.`);
  subItem(doc, "b)", "This trust is intended to qualify as a Vulnerable Beneficiary Trust within the meaning of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to qualify as such.");
  subItem(doc, "c)", "My Trustees shall hold the trust fund upon trust to apply the income and capital thereof for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees in their absolute discretion think fit having regard to the needs and welfare of the Vulnerable Beneficiary.");
  subItem(doc, "d)", `Subject to the life interest of the Vulnerable Beneficiary the trust fund shall on the death of the Vulnerable Beneficiary be held for ${ultimateBens}.`);
  subItem(doc, "e)", "My Trustees shall have power to apply capital for the benefit of the Vulnerable Beneficiary at any time and from time to time as they in their absolute discretion think fit.");
  if (clause.notes) {
    doc.moveDown(0.3);
    bodyText(doc, clause.notes);
  }
}
function buildNilRateBandClause(doc, clauseNum, clause) {
  const trustees = trusteeNames(clause.trustees);
  const bens = beneficiaryNamesWithShares(clause.beneficiaries);
  clauseHeading(doc, clauseNum, "Nil-Rate Band Discretionary Trust");
  bodyText(doc, "I DECLARE that the following provisions shall apply to the Nil-Rate Band Discretionary Trust created by this my Will:");
  subItem(doc, "a)", `The Trustees of this trust shall be ${trustees}.`);
  subItem(doc, "b)", `I GIVE to my Trustees such sum as equals my available nil-rate band for inheritance tax purposes at the date of my death (the "NRB Sum") to hold upon the trusts hereinafter declared.`);
  subItem(doc, "c)", `My Trustees shall hold the NRB Sum upon trust for ${bens}.`);
  subItem(doc, "d)", "My Trustees shall have the widest possible powers of investment and management as if they were absolute beneficial owners of the trust fund.");
  subItem(doc, "e)", "This trust shall terminate on the expiry of 125 years from the date of my death (the perpetuity period) and upon such termination the trust fund shall be distributed to such of the Beneficiaries as are then living in equal shares absolutely.");
  if (clause.notes) {
    doc.moveDown(0.3);
    bodyText(doc, clause.notes);
  }
}
function buildBereavedMinorClause(doc, clauseNum, clause) {
  const bName = clause.beneficiary ? fullName(clause.beneficiary) || "[Beneficiary Name]" : "[Beneficiary Name]";
  const trustees = trusteeNames(clause.trustees);
  const age = clause.ageOfAbsoluteEntitlement || "18";
  clauseHeading(doc, clauseNum, "Bereaved Minor's Trust (s.71A IHTA 1984)");
  bodyText(doc, `I DECLARE that the following provisions shall apply to the trust created by this my Will for the benefit of ${bName} (hereinafter referred to as "the Beneficiary"):`);
  subItem(doc, "a)", `The Trustees of this trust shall be ${trustees}.`);
  subItem(doc, "b)", `This trust is intended to qualify as a Bereaved Minor's Trust within the meaning of section 71A of the Inheritance Tax Act 1984 and my Trustees shall use their best endeavours to ensure that the trust continues to qualify as such.`);
  subItem(doc, "c)", `My Trustees shall hold the trust fund upon trust to accumulate the income thereof until the Beneficiary attains the age of ${age} years and thereafter to pay the income to the Beneficiary until the Beneficiary attains the age of ${age} years.`);
  subItem(doc, "d)", `Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.`);
  subItem(doc, "e)", `If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.`);
  if (clause.notes) {
    doc.moveDown(0.3);
    bodyText(doc, clause.notes);
  }
}
function buildAge18To25Clause(doc, clauseNum, clause) {
  const bName = clause.beneficiary ? fullName(clause.beneficiary) || "[Beneficiary Name]" : "[Beneficiary Name]";
  const trustees = trusteeNames(clause.trustees);
  const age = clause.ageOfAbsoluteEntitlement || "25";
  clauseHeading(doc, clauseNum, `18-to-25 Trust (s.71D IHTA 1984)`);
  bodyText(doc, `I DECLARE that the following provisions shall apply to the trust created by this my Will for the benefit of ${bName} (hereinafter referred to as "the Beneficiary"):`);
  subItem(doc, "a)", `The Trustees of this trust shall be ${trustees}.`);
  subItem(doc, "b)", `This trust is intended to qualify as an 18-to-25 trust within the meaning of section 71D of the Inheritance Tax Act 1984 and my Trustees shall use their best endeavours to ensure that the trust continues to qualify as such.`);
  subItem(doc, "c)", `My Trustees shall hold the trust fund upon trust to accumulate the income thereof until the Beneficiary attains the age of 18 years and thereafter to pay the income to the Beneficiary until the Beneficiary attains the age of ${age} years.`);
  subItem(doc, "d)", `Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.`);
  subItem(doc, "e)", `If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.`);
  if (clause.notes) {
    doc.moveDown(0.3);
    bodyText(doc, clause.notes);
  }
}
function buildBusinessPropertyReliefClause(doc, clauseNum, clause) {
  const bizName = clause.businessName || "my business interests";
  const trustees = trusteeNames(clause.trustees);
  const bens = beneficiaryNamesWithShares(clause.beneficiaries);
  clauseHeading(doc, clauseNum, "Business Property Relief Trust");
  bodyText(doc, `I DECLARE that the following provisions shall apply to the Business Property Relief Trust created by this my Will in respect of ${bizName} (hereinafter referred to as "the Business Assets"):`);
  subItem(doc, "a)", `The Trustees of this trust shall be ${trustees}.`);
  subItem(doc, "b)", "I GIVE my Business Assets to my Trustees to hold upon the trusts hereinafter declared, it being my intention that the Business Assets shall qualify for Business Property Relief pursuant to Chapter I of Part V of the Inheritance Tax Act 1984 and that such relief shall be preserved by the terms of this trust.");
  subItem(doc, "c)", `My Trustees shall hold the Business Assets upon trust for ${bens}.`);
  subItem(doc, "d)", "My Trustees shall have the widest possible powers to manage, invest, realise, and deal with the Business Assets as if they were absolute beneficial owners thereof.");
  subItem(doc, "e)", "My Trustees shall use their best endeavours to ensure that the Business Assets continue to qualify for Business Property Relief and shall not take any action that would jeopardise such qualification without first obtaining appropriate professional advice.");
  if (clause.notes) {
    doc.moveDown(0.3);
    bodyText(doc, clause.notes);
  }
}
function addAttestationPage(doc, testatorName) {
  doc.addPage();
  const pageWidth = doc.page.width;
  const colW = (CONTENT_WIDTH - 20) / 2;
  doc.font(GARAMOND_BOLD).fontSize(14).text("EXECUTION PAGE", PAGE_MARGIN, PAGE_MARGIN, { width: CONTENT_WIDTH, align: "center" });
  doc.moveDown(0.3);
  doc.font(GARAMOND).fontSize(10).fillColor("#555").text("The Testimonium and Attestation Clause", PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH, align: "center" });
  doc.fillColor("#000");
  doc.moveDown(0.6);
  doc.moveTo(PAGE_MARGIN, doc.y).lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y).strokeColor("#888").lineWidth(0.5).stroke();
  doc.strokeColor("#000").lineWidth(1);
  doc.moveDown(0.8);
  doc.font(GARAMOND).fontSize(11).text(
    `I, ${testatorName}, declare this to be my last Will and Testament and I sign it as my Will in the presence of the witnesses named below, who each attest and subscribe it in my presence and in the presence of each other, all being present at the same time.`,
    PAGE_MARGIN,
    doc.y,
    { width: CONTENT_WIDTH, align: "justify" }
  );
  doc.moveDown(1.2);
  const boxTop = doc.y;
  const boxH = 110;
  doc.rect(PAGE_MARGIN, boxTop, CONTENT_WIDTH, boxH).strokeColor("#aaa").lineWidth(0.5).stroke();
  doc.strokeColor("#000").lineWidth(1);
  const innerX = PAGE_MARGIN + 12;
  const innerW = CONTENT_WIDTH - 24;
  doc.font(GARAMOND_BOLD).fontSize(10).text("TESTATOR", innerX, boxTop + 8, { width: innerW });
  doc.font(GARAMOND).fontSize(10);
  doc.text("Full Name:", innerX, boxTop + 24, { continued: false });
  doc.moveTo(innerX + 70, boxTop + 34).lineTo(innerX + innerW, boxTop + 34).strokeColor("#aaa").lineWidth(0.5).stroke();
  doc.font(GARAMOND_BOLD).fontSize(9).fillColor("#333").text(testatorName, innerX + 72, boxTop + 22, { width: innerW - 72 });
  doc.fillColor("#000").font(GARAMOND).fontSize(10);
  doc.text("Signature:", innerX, boxTop + 48, { continued: false });
  doc.moveTo(innerX + 70, boxTop + 68).lineTo(innerX + innerW, boxTop + 68).strokeColor("#aaa").lineWidth(0.5).stroke();
  doc.text("Date:", innerX, boxTop + 80, { continued: false });
  doc.moveTo(innerX + 70, boxTop + 90).lineTo(innerX + 250, boxTop + 90).strokeColor("#aaa").lineWidth(0.5).stroke();
  doc.strokeColor("#000").lineWidth(1);
  doc.moveDown(0.3);
  const afterBox = boxTop + boxH + 10;
  doc.font(GARAMOND).fontSize(10).fillColor("#333").text(
    "SIGNED by the above-named Testator as their last Will in our presence and attested by us in the presence of the Testator and of each other:",
    PAGE_MARGIN,
    afterBox,
    { width: CONTENT_WIDTH, align: "justify" }
  );
  doc.fillColor("#000");
  const witnessTop = afterBox + 30;
  const witnessBoxH = 180;
  function drawWitnessBox(label, x, y, w) {
    doc.rect(x, y, w, witnessBoxH).strokeColor("#aaa").lineWidth(0.5).stroke();
    doc.strokeColor("#000").lineWidth(1);
    const ix = x + 10;
    const iw = w - 20;
    doc.font(GARAMOND_BOLD).fontSize(10).text(label, ix, y + 8, { width: iw });
    doc.font(GARAMOND).fontSize(10);
    const rows = [
      { label: "Signature:", lineH: 40 },
      { label: "Full Name:", lineH: 70 },
      { label: "Address:", lineH: 100 },
      { label: "", lineH: 120 },
      { label: "", lineH: 140 },
      { label: "Occupation:", lineH: 162 }
    ];
    rows.forEach(({ label: rowLabel, lineH }) => {
      if (rowLabel) doc.text(rowLabel, ix, y + lineH - 12, { width: 65 });
      doc.moveTo(ix + (rowLabel ? 68 : 10), y + lineH).lineTo(x + w - 10, y + lineH).strokeColor("#bbb").lineWidth(0.4).stroke();
    });
    doc.strokeColor("#000").lineWidth(1);
  }
  drawWitnessBox("WITNESS 1", PAGE_MARGIN, witnessTop, colW);
  drawWitnessBox("WITNESS 2", PAGE_MARGIN + colW + 20, witnessTop, colW);
  const footerY = witnessTop + witnessBoxH + 14;
  doc.font(GARAMOND).fontSize(8).fillColor("#666").text(
    "Note: A witness must be 18 years or over, of sound mind, and must not be a beneficiary under this Will or the spouse/civil partner of a beneficiary.",
    PAGE_MARGIN,
    footerY,
    { width: CONTENT_WIDTH, align: "center" }
  );
  doc.fillColor("#000");
}
async function generateWillDocument(record, options) {
  const logoBuffer = await fetchLogoBuffer2().catch(() => null);
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocumentLib({
      size: "A4",
      margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
      autoFirstPage: false
    });
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    const isClient2 = options.willType === "mirror_client2";
    const prefix = isClient2 ? safe3(record.client2Prefix) : safe3(record.client1Prefix);
    const firstName = isClient2 ? safe3(record.client2FirstName) : safe3(record.client1FirstName);
    const middleName = isClient2 ? safe3(record.client2MiddleName) : safe3(record.client1MiddleName);
    const lastName = isClient2 ? safe3(record.client2LastName) : safe3(record.client1LastName);
    const dob = isClient2 ? safe3(record.client2Dob) : safe3(record.client1Dob);
    const addr1 = isClient2 ? safe3(record.client2AddressLine1) : safe3(record.client1AddressLine1);
    const city = isClient2 ? safe3(record.client2City) : safe3(record.client1City);
    const postcode = isClient2 ? safe3(record.client2Postcode) : safe3(record.client1Postcode);
    const testatorName = [prefix, firstName, middleName, lastName].filter(Boolean).join(" ") || "Testator";
    const fullAddress = [addr1, city, postcode].filter(Boolean).join(" ") || "";
    const addressLine1 = addr1 || "";
    const addressLine2 = [city, postcode].filter(Boolean).join(" ");
    const reference = safe3(record.referenceNumber);
    let executors = [];
    if (options.willType === "mirror_client1") {
      const partnerEntry = {
        prefix: safe3(record.client2Prefix),
        firstName: safe3(record.client2FirstName),
        lastName: safe3(record.client2LastName),
        address: [safe3(record.client2AddressLine1), safe3(record.client2City), safe3(record.client2Postcode)].filter(Boolean).join(" "),
        relationship: "spouse/partner"
      };
      const substitutes = safeArr3(record.client1Executors);
      executors = [partnerEntry, ...substitutes];
    } else if (options.willType === "mirror_client2") {
      const partnerEntry = {
        prefix: safe3(record.client1Prefix),
        firstName: safe3(record.client1FirstName),
        lastName: safe3(record.client1LastName),
        address: [safe3(record.client1AddressLine1), safe3(record.client1City), safe3(record.client1Postcode)].filter(Boolean).join(" "),
        relationship: "spouse/partner"
      };
      const substitutes = safeArr3(record.client2Executors);
      executors = [partnerEntry, ...substitutes];
    } else {
      executors = safeArr3(record.client1Executors);
    }
    let primaryBeneficiary = null;
    let residuaryBeneficiaries = [];
    if (options.willType === "mirror_client1") {
      primaryBeneficiary = {
        prefix: safe3(record.client2Prefix),
        firstName: safe3(record.client2FirstName),
        lastName: safe3(record.client2LastName),
        relationship: "spouse/partner"
      };
      residuaryBeneficiaries = safeArr3(record.client1Beneficiaries);
    } else if (options.willType === "mirror_client2") {
      primaryBeneficiary = {
        prefix: safe3(record.client1Prefix),
        firstName: safe3(record.client1FirstName),
        lastName: safe3(record.client1LastName),
        relationship: "spouse/partner"
      };
      residuaryBeneficiaries = safeArr3(record.client2Beneficiaries);
    } else {
      const allBeneficiaries = safeArr3(record.client1Beneficiaries);
      if (allBeneficiaries.length > 0) {
        primaryBeneficiary = allBeneficiaries[0];
        residuaryBeneficiaries = allBeneficiaries.slice(1);
      }
    }
    let reservedExecutors = [];
    if (options.willType === "mirror_client2") {
      reservedExecutors = safeArr3(record.client2ReservedExecutors);
    } else {
      reservedExecutors = safeArr3(record.client1ReservedExecutors);
    }
    let guardians = [];
    let reservedGuardians = [];
    if (options.willType === "mirror_client2") {
      guardians = safeArr3(record.client2Guardians);
      reservedGuardians = safeArr3(record.client2ReservedGuardians);
    } else {
      guardians = safeArr3(record.client1Guardians);
      reservedGuardians = safeArr3(record.client1ReservedGuardians);
    }
    let specificGifts = [];
    if (options.willType === "mirror_client2") {
      specificGifts = safeArr3(record.client2SpecificGifts);
    } else {
      const perClient = safeArr3(record.client1SpecificGifts);
      specificGifts = perClient.length > 0 ? perClient : safeArr3(record.specificGifts);
    }
    let funeralWishes;
    let funeralType;
    let organDonation;
    if (options.willType === "mirror_client2") {
      funeralWishes = safe3(record.client2FuneralWishes) || safe3(record.funeralWishes);
      funeralType = safe3(record.client2FuneralType) || safe3(record.funeralType);
      organDonation = safe3(record.client2OrganDonation).toLowerCase() === "yes";
    } else {
      funeralWishes = safe3(record.client1FuneralWishes) || safe3(record.funeralWishes);
      funeralType = safe3(record.client1FuneralType) || safe3(record.funeralType);
      organDonation = safe3(record.client1OrganDonation).toLowerCase() === "yes" || safe3(record.organDonation).toLowerCase() === "yes";
    }
    const residualBackup = options.willType === "mirror_client2" ? safe3(record.client2ResidualBackup) : safe3(record.client1ResidualBackup);
    const trustees = safeArr3(record.trustees);
    const partnerName = options.willType === "mirror_client1" ? [safe3(record.client2Prefix), safe3(record.client2FirstName), safe3(record.client2LastName)].filter(Boolean).join(" ") : [safe3(record.client1Prefix), safe3(record.client1FirstName), safe3(record.client1LastName)].filter(Boolean).join(" ");
    const children = (options.willType === "mirror_client2" ? safeArr3(record.client2ChildrenUnder18) : safeArr3(record.client1ChildrenUnder18)).map((c) => fullName(c)).filter(Boolean);
    const vulnerableBeneficiary = options.willType === "mirror_client2" ? safe3(record.client2VulnerableBeneficiaryDetails) || safe3(record.vulnerableBeneficiaryDetails) : safe3(record.client1VulnerableBeneficiaryDetails) || safe3(record.vulnerableBeneficiaryDetails);
    let clauseNum = 1;
    doc.addPage();
    addCoverPage(doc, testatorName, reference, logoBuffer);
    doc.addPage();
    addPageHeader(doc, testatorName, addressLine1, addressLine2);
    buildRevocationClause(doc, clauseNum++, testatorName, dob, fullAddress);
    buildExecutorsClause(doc, clauseNum++, executors);
    if (reservedExecutors.length > 0) {
      buildReservedExecutorsClause(doc, clauseNum++, reservedExecutors);
    }
    if (guardians.length > 0 || reservedGuardians.length > 0) {
      buildGuardiansClause(doc, clauseNum++, guardians, reservedGuardians);
    }
    buildDefinitionClause(doc, clauseNum++);
    buildDistributionClause(doc, clauseNum++, primaryBeneficiary, residuaryBeneficiaries, specificGifts);
    for (const ppt of safeClauseArr(record.protectivePropertyTrusts)) {
      buildPPTClause(doc, clauseNum++, ppt);
    }
    for (const dt of safeClauseArr(record.discretionaryTrusts)) {
      buildDiscretionaryTrustClause(doc, clauseNum++, dt);
    }
    for (const vt of safeClauseArr(record.vulnerablePersonTrusts)) {
      buildVulnerableTrustClause(doc, clauseNum++, vt);
    }
    for (const nrb of safeClauseArr(record.nilRateBandTrusts)) {
      buildNilRateBandClause(doc, clauseNum++, nrb);
    }
    for (const bm of safeClauseArr(record.bereavedMinorTrusts)) {
      buildBereavedMinorClause(doc, clauseNum++, bm);
    }
    for (const a25 of safeClauseArr(record.age18To25Trusts)) {
      buildAge18To25Clause(doc, clauseNum++, a25);
    }
    for (const bpr of safeClauseArr(record.businessPropertyReliefs)) {
      buildBusinessPropertyReliefClause(doc, clauseNum++, bpr);
    }
    if (options.includePPT && safeClauseArr(record.protectivePropertyTrusts).length === 0) {
      buildPPTClause(doc, clauseNum++, {});
    }
    if (options.includeDiscretionaryTrust && safeClauseArr(record.discretionaryTrusts).length === 0) {
      buildDiscretionaryTrustClause(doc, clauseNum++, { trustees });
    }
    if (options.includeVulnerableTrust && safeClauseArr(record.vulnerablePersonTrusts).length === 0) {
      buildVulnerableTrustClause(doc, clauseNum++, {
        vulnerableBeneficiary: { firstName: vulnerableBeneficiary },
        trustees
      });
    }
    buildAgeConditionClause(doc, clauseNum++);
    buildExecutorPowersClause(doc, clauseNum++);
    buildSurvivorshipClause(doc, clauseNum++);
    if (organDonation) {
      buildOrganDonationClause(doc, clauseNum++);
    }
    buildFuneralWishesClause(doc, clauseNum++, funeralType, funeralWishes);
    buildStepPowersClause(doc, clauseNum++);
    buildAvoidanceOfDoubtClause(doc, clauseNum++);
    addAttestationPage(doc, testatorName);
    doc.end();
  });
}

// server/willHtmlGenerator.ts
function safe4(v) {
  if (v === null || v === void 0) return "";
  return String(v).trim();
}
function parseJson(v, fallback) {
  if (!v) return fallback;
  try {
    return JSON.parse(String(v));
  } catch {
    return fallback;
  }
}
function fullName2(...parts) {
  return parts.filter(Boolean).join(" ");
}
function clauseHtml(num, title, body2) {
  return `
  <div class="clause">
    <p class="clause-title">${num}. ${title}</p>
    <div class="clause-body">${body2}</div>
  </div>`;
}
function revocationClause(num, testatorName, dob, address) {
  const dobStr = dob ? ` born ${dob}` : "";
  return clauseHtml(
    num,
    "Revocation",
    `<p>I, <strong>${testatorName}</strong>${dobStr}, of ${address || "[address]"}, hereby revoke all former Wills and Testamentary dispositions previously made by me and declare this to be my last Will and Testament.</p>`
  );
}
function executorsClause(num, executors, reservedExecutors) {
  if (!executors.length) executors = ["[Executor Name]"];
  const list = executors.map((e) => `<li>${e}</li>`).join("\n");
  const appoint = executors.length === 1 ? `I appoint <strong>${executors[0]}</strong> to be the Executor of this my Will.` : `I appoint the following persons to be the Executors of this my Will:
<ol>${list}</ol>`;
  let reservedHtml = "";
  if (reservedExecutors.length) {
    const rList = reservedExecutors.map((e) => `<li>${e}</li>`).join("\n");
    reservedHtml = `<p><strong>Reserve Executors:</strong> In the event that all of the above-named Executors shall predecease me or be unable or unwilling to act, I appoint the following as Reserve Executor(s):</p><ol>${rList}</ol>`;
  }
  return clauseHtml(
    num,
    "Appointment of Executors",
    `<p>${appoint}</p>${reservedHtml}`
  );
}
function definitionClause(num) {
  return clauseHtml(
    num,
    "Definitions",
    `<p>In this Will:</p>
     <ul>
       <li><strong>"my Trustees"</strong> means the Executors and Trustees of this Will for the time being.</li>
       <li><strong>"my children"</strong> means all children of mine whether born before or after the date of this Will, including any legally adopted children.</li>
       <li><strong>"the statutory age"</strong> means the age of eighteen (18) years.</li>
     </ul>`
  );
}
function distributionClause(num, primaryBeneficiary, residuaryBeneficiaries, specificGifts) {
  let specificHtml = "";
  if (specificGifts.length) {
    const items = specificGifts.map((g) => `<li>I give <strong>${g.description || "[item]"}</strong> to <strong>${g.recipient || "[recipient]"}</strong>.</li>`).join("\n");
    specificHtml = `<p><strong>Specific Gifts</strong></p><ul>${items}</ul>`;
  }
  const primaryHtml = primaryBeneficiary ? `<p>Subject to the payment of my debts, funeral and testamentary expenses, I give all my real and personal property (my <strong>"Estate"</strong>) to <strong>${primaryBeneficiary}</strong> absolutely.</p>` : `<p>Subject to the payment of my debts, funeral and testamentary expenses, I give all my real and personal property (my <strong>"Estate"</strong>) to my Trustees upon the trusts set out below.</p>`;
  const residuaryHtml = residuaryBeneficiaries.length ? `<p>If <strong>${primaryBeneficiary || "the primary beneficiary"}</strong> shall predecease me or fail to survive me by thirty (30) days, I give my Estate in equal shares to: <strong>${residuaryBeneficiaries.join(", ")}</strong>.</p>` : "";
  return clauseHtml(
    num,
    "Distribution of Estate",
    specificHtml + primaryHtml + residuaryHtml
  );
}
function pptClause(num, testatorName, partnerName, children) {
  const childrenList = children.length ? children.map((c) => `<li>${c}</li>`).join("\n") : "<li>[children]</li>";
  return clauseHtml(
    num,
    "Protective Property Trust (Lifetime Trust)",
    `<p>I direct my Trustees to hold my share of the property known as my principal residence (<strong>"the Property"</strong>) upon the following trusts:</p>
     <p><strong>(a) Life Interest:</strong> My Trustees shall hold the Property on trust to permit <strong>${partnerName || "[partner]"}</strong> (<strong>"the Life Tenant"</strong>) to occupy the Property for the remainder of their life or until they permanently vacate the Property, whichever is the earlier. The Life Tenant shall be responsible for all outgoings in respect of the Property during the period of occupation.</p>
     <p><strong>(b) Remainder:</strong> Subject to the Life Interest, my Trustees shall hold the Property on trust for the following persons in equal shares absolutely:</p>
     <ul>${childrenList}</ul>
     <p><strong>(c) Powers of Trustees:</strong> My Trustees shall have power to sell the Property and to apply the net proceeds of sale in the purchase of another property to be held on the same trusts, or to invest the same in accordance with the investment powers set out in this Will.</p>
     <p><strong>(d) Termination:</strong> The Life Interest shall terminate upon the death of the Life Tenant, their remarriage or entry into a new civil partnership, or their permanent vacation of the Property.</p>`
  );
}
function discretionaryTrustClause(num, trustees, beneficiaryClass) {
  const trusteeList = trustees.length ? trustees.map((t2) => `<li>${t2}</li>`).join("\n") : "<li>[Trustee Name]</li>";
  return clauseHtml(
    num,
    "Discretionary Trust",
    `<p>I direct my Trustees to hold the residue of my Estate (<strong>"the Trust Fund"</strong>) upon the following discretionary trusts:</p>
     <p><strong>(a) Beneficiaries:</strong> The beneficiaries of this Trust shall be ${beneficiaryClass} (<strong>"the Beneficiaries"</strong>).</p>
     <p><strong>(b) Trustees:</strong></p>
     <ul>${trusteeList}</ul>
     <p><strong>(c) Discretion:</strong> My Trustees shall have an absolute and uncontrolled discretion to pay or apply the whole or any part of the income or capital of the Trust Fund to or for the benefit of any one or more of the Beneficiaries in such shares and proportions and in such manner as my Trustees in their absolute discretion think fit.</p>
     <p><strong>(d) Accumulation:</strong> My Trustees may accumulate the whole or any part of the income of the Trust Fund during the Trust Period and add the same to the capital of the Trust Fund.</p>
     <p><strong>(e) Trust Period:</strong> The Trust Period shall be 125 years from the date of my death (the statutory period under the Perpetuities and Accumulations Act 2009).</p>`
  );
}
function vulnerableTrustClause(num, vulnerableBeneficiary, trustees) {
  const trusteeList = trustees.length ? trustees.map((t2) => `<li>${t2}</li>`).join("\n") : "<li>[Trustee Name]</li>";
  return clauseHtml(
    num,
    "Vulnerable Person's Trust",
    `<p>I direct my Trustees to hold such share of my Estate as is specified herein (<strong>"the Vulnerable Person's Fund"</strong>) upon the following trusts for the benefit of <strong>${vulnerableBeneficiary || "[vulnerable beneficiary]"}</strong> (<strong>"the Vulnerable Beneficiary"</strong>):</p>
     <p><strong>(a) Qualifying Trust:</strong> This Trust is intended to be a Qualifying Trust for the purposes of Section 30 of the Finance Act 2005 and my Trustees shall administer the Trust accordingly.</p>
     <p><strong>(b) Trustees:</strong></p>
     <ul>${trusteeList}</ul>
     <p><strong>(c) Application of Income and Capital:</strong> My Trustees shall have an absolute discretion to pay or apply the whole or any part of the income and capital of the Vulnerable Person's Fund for the maintenance, support, education, or benefit of the Vulnerable Beneficiary during their lifetime.</p>
     <p><strong>(d) Remainder:</strong> Subject to the above, upon the death of the Vulnerable Beneficiary, the Vulnerable Person's Fund shall fall into and form part of the residue of my Estate and be distributed accordingly.</p>
     <p><strong>(e) Trustee Powers:</strong> My Trustees shall have the widest powers of investment and management as if they were the absolute owners of the Trust Fund.</p>`
  );
}
function ageConditionClause(num) {
  return clauseHtml(
    num,
    "Age Condition",
    `<p>Any beneficiary who has not attained the age of eighteen (18) years at the date of my death shall not be entitled to receive any benefit under this Will until they attain that age. Until such time my Trustees shall hold such beneficiary's share on trust and may apply the income and capital thereof for the maintenance, education, or benefit of such beneficiary.</p>`
  );
}
function executorPowersClause(num) {
  return clauseHtml(
    num,
    "Powers of Executors and Trustees",
    `<p>My Trustees shall have the following powers in addition to those conferred by law:</p>
     <p><strong>(a) Investment:</strong> Power to invest trust monies in any investments as if they were the absolute owners thereof, including the power to retain existing investments.</p>
     <p><strong>(b) Sale:</strong> Power to sell, call in, and convert into money all or any part of my Estate at such time and in such manner as they think fit.</p>
     <p><strong>(c) Appropriation:</strong> Power to appropriate any part of my Estate in or towards satisfaction of any share or interest without requiring the consent of any beneficiary.</p>
     <p><strong>(d) Receipts:</strong> Power to give receipts for money and other assets.</p>
     <p><strong>(e) Delegation:</strong> Power to employ and pay agents, including solicitors and accountants, and to act on their advice.</p>
     <p><strong>(f) Insurance:</strong> Power to insure any property forming part of my Estate against any risk and to pay premiums from the income or capital of my Estate.</p>`
  );
}
function survivorshipClause(num) {
  return clauseHtml(
    num,
    "Survivorship",
    `<p>For the purposes of this Will, a beneficiary shall be deemed to have predeceased me if they do not survive me by a period of thirty (30) clear days. In such circumstances, any gift to that beneficiary shall lapse and fall into the residue of my Estate unless otherwise provided in this Will.</p>`
  );
}
function organDonationClause(num) {
  return clauseHtml(
    num,
    "Organ Donation",
    `<p>I express my wish that upon my death my body or any part thereof may be used for the purposes of transplantation, research, or any other therapeutic purpose. I request that my Executors and next of kin give effect to this wish insofar as it is lawfully possible to do so.</p>`
  );
}
function funeralWishesClause(num, funeralType, funeralWishes) {
  let typeText = "";
  const ft = funeralType ? funeralType.toLowerCase() : "";
  if (ft === "burial" || ft === "burial") {
    typeText = `<p>I desire that my body be <strong>buried</strong> and the expense thereof shall be a first charge on my Estate.</p>`;
  } else if (ft === "cremation") {
    typeText = `<p>I desire that my body be <strong>cremated</strong> and my ashes disposed of as my Executors shall think fit, and the expense thereof shall be a first charge on my Estate.</p>`;
  } else if (ft === "no preference" || ft === "no_preference") {
    typeText = `<p>I leave the choice of burial or cremation to the discretion of my Executors.</p>`;
  } else {
    typeText = `<p>I desire that my body be [cremated/buried] and the expense thereof shall be a first charge on my Estate.</p>`;
  }
  const notesText = funeralWishes ? `<p>${funeralWishes}</p>` : "";
  return clauseHtml(
    num,
    "Funeral Wishes",
    typeText + notesText + `<p>These wishes are not legally binding on my Executors but I ask that they be given due consideration.</p>`
  );
}
function avoidanceOfDoubtClause(num) {
  return clauseHtml(
    num,
    "Avoidance of Doubt",
    `<p>For the avoidance of doubt, any reference in this Will to a person's children shall include all children of that person whether born before or after the date of this Will, including any legally adopted children, but shall not include step-children unless expressly stated otherwise.</p>`
  );
}
function attestationHtml(testatorName) {
  return `
  <div class="page-break"></div>
  <div class="execution-page">
    <h2 class="execution-title">EXECUTION PAGE</h2>
    <p class="execution-subtitle">The Testimonium and Attestation Clause</p>
    <hr class="exec-rule" />

    <p class="testimonium">
      I, <strong>${testatorName}</strong>, declare this to be my last Will and Testament and I sign it as my Will
      in the presence of the witnesses named below, who each attest and subscribe it in my presence and in the
      presence of each other, all being present at the same time.
    </p>

    <div class="sig-box testator-box">
      <div class="sig-box-label">TESTATOR</div>
      <div class="sig-row">
        <span class="sig-label">Full Name:</span>
        <span class="sig-line prefilled">${testatorName}</span>
      </div>
      <div class="sig-row">
        <span class="sig-label">Signature:</span>
        <span class="sig-line"></span>
      </div>
      <div class="sig-row">
        <span class="sig-label">Date:</span>
        <span class="sig-line short"></span>
      </div>
    </div>

    <p class="attestation-stmt">
      SIGNED by the above-named Testator as their last Will in our presence and attested by us in the presence
      of the Testator and of each other:
    </p>

    <div class="witness-row">
      <div class="sig-box witness-box">
        <div class="sig-box-label">WITNESS 1</div>
        <div class="sig-row"><span class="sig-label">Signature:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Full Name:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Address:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label"></span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label"></span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Occupation:</span><span class="sig-line"></span></div>
      </div>
      <div class="sig-box witness-box">
        <div class="sig-box-label">WITNESS 2</div>
        <div class="sig-row"><span class="sig-label">Signature:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Full Name:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Address:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label"></span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label"></span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Occupation:</span><span class="sig-line"></span></div>
      </div>
    </div>

    <p class="witness-note">
      <em>Note: A witness must be 18 years or over, of sound mind, and must not be a beneficiary under this Will
      or the spouse/civil partner of a beneficiary.</em>
    </p>
  </div>`;
}
var CSS = `
  * { box-sizing: border-box; }
  body {
    font-family: "Garamond", "EB Garamond", Georgia, serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #111;
    background: #fff;
    margin: 0;
    padding: 0;
  }
  .will-document {
    max-width: 21cm;
    margin: 0 auto;
    padding: 2.5cm 2.5cm 3cm;
  }
  /* Cover / header */
  .will-header {
    text-align: center;
    margin-bottom: 2em;
    border-bottom: 2px solid #1a3a2a;
    padding-bottom: 1.5em;
  }
  .will-header .firm-name {
    font-size: 10pt;
    color: #555;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 0.5em;
  }
  .will-header h1 {
    font-size: 18pt;
    font-weight: bold;
    margin: 0.2em 0;
    color: #1a3a2a;
  }
  .will-header .testator-details {
    font-size: 11pt;
    margin-top: 0.8em;
    color: #333;
  }
  .will-header .ref {
    font-size: 9pt;
    color: #888;
    margin-top: 0.5em;
  }
  /* Clauses */
  .clause {
    margin-bottom: 1.4em;
  }
  .clause-title {
    font-weight: bold;
    font-size: 12pt;
    margin-bottom: 0.3em;
    color: #1a3a2a;
  }
  .clause-body p { margin: 0.4em 0; }
  .clause-body ul, .clause-body ol {
    margin: 0.4em 0 0.4em 1.5em;
    padding: 0;
  }
  .clause-body li { margin-bottom: 0.2em; }
  /* Execution page */
  .page-break { page-break-before: always; }
  .execution-page {
    padding-top: 1em;
  }
  .execution-title {
    text-align: center;
    font-size: 16pt;
    font-weight: bold;
    color: #1a3a2a;
    margin-bottom: 0.2em;
  }
  .execution-subtitle {
    text-align: center;
    font-size: 10pt;
    color: #666;
    margin-bottom: 0.8em;
  }
  .exec-rule {
    border: none;
    border-top: 1px solid #aaa;
    margin: 0.5em 0 1.2em;
  }
  .testimonium {
    margin-bottom: 1.2em;
    text-align: justify;
  }
  .attestation-stmt {
    font-size: 10pt;
    color: #444;
    margin: 1em 0 0.8em;
    text-align: justify;
  }
  .sig-box {
    border: 1px solid #bbb;
    border-radius: 4px;
    padding: 10px 14px 14px;
    margin-bottom: 1em;
  }
  .sig-box-label {
    font-weight: bold;
    font-size: 10pt;
    margin-bottom: 8px;
    color: #1a3a2a;
  }
  .sig-row {
    display: flex;
    align-items: flex-end;
    margin-bottom: 10px;
    gap: 8px;
  }
  .sig-label {
    min-width: 90px;
    font-size: 10pt;
    color: #444;
    flex-shrink: 0;
  }
  .sig-line {
    flex: 1;
    border-bottom: 1px solid #999;
    min-height: 22px;
    display: block;
  }
  .sig-line.short { max-width: 200px; }
  .sig-line.prefilled {
    font-weight: bold;
    font-size: 10pt;
    border-bottom: 1px solid #bbb;
    color: #222;
  }
  .witness-row {
    display: flex;
    gap: 16px;
  }
  .witness-box { flex: 1; }
  .witness-note {
    font-size: 8pt;
    color: #888;
    text-align: center;
    margin-top: 1em;
  }
  /* Print */
  @media print {
    body { background: #fff; }
    .will-document { padding: 1.5cm 2cm; }
    .page-break { page-break-before: always; }
  }
`;
function generateWillHtml(record, options) {
  const isClient2 = options.willType === "mirror_client2";
  const prefix = isClient2 ? safe4(record.client2Prefix) : safe4(record.client1Prefix);
  const firstName = isClient2 ? safe4(record.client2FirstName) : safe4(record.client1FirstName);
  const middleName = isClient2 ? safe4(record.client2MiddleName) : safe4(record.client1MiddleName);
  const lastName = isClient2 ? safe4(record.client2LastName) : safe4(record.client1LastName);
  const dob = isClient2 ? safe4(record.client2Dob) : safe4(record.client1Dob);
  const addr1 = isClient2 ? safe4(record.client2AddressLine1) : safe4(record.client1AddressLine1);
  const city = isClient2 ? safe4(record.client2City) : safe4(record.client1City);
  const postcode = isClient2 ? safe4(record.client2Postcode) : safe4(record.client1Postcode);
  const testatorName = fullName2(prefix, firstName, middleName, lastName) || "Testator";
  const fullAddress = [addr1, city, postcode].filter(Boolean).join(", ");
  const reference = safe4(record.referenceNumber);
  const rawExec = isClient2 ? parseJson(record.client2Executors, []) : parseJson(record.client1Executors, []);
  const executors = rawExec.map((e) => {
    const name = fullName2(safe4(e.firstName), safe4(e.lastName));
    const dobPart = e.dob ? ` (born ${e.dob})` : "";
    return name ? name + dobPart : "";
  }).filter(Boolean);
  const rawBenef = isClient2 ? parseJson(record.client2Beneficiaries, []) : parseJson(record.client1Beneficiaries, []);
  const beneficiaries = rawBenef.map((b) => {
    const name = fullName2(safe4(b.firstName), safe4(b.lastName));
    const dobPart = b.dob ? ` (born ${b.dob})` : "";
    return name ? name + dobPart : "";
  }).filter(Boolean);
  const primaryBeneficiary = beneficiaries[0] || "";
  const residuaryBeneficiaries = beneficiaries.slice(1);
  const specificGifts = parseJson(
    isClient2 ? record.client2SpecificGifts : record.client1SpecificGifts || record.specificGifts,
    []
  ).map((g) => ({
    description: safe4(g.description),
    recipient: safe4(g.recipient)
  }));
  const partnerPrefix = isClient2 ? safe4(record.client1Prefix) : safe4(record.client2Prefix);
  const partnerFirst = isClient2 ? safe4(record.client1FirstName) : safe4(record.client2FirstName);
  const partnerLast = isClient2 ? safe4(record.client1LastName) : safe4(record.client2LastName);
  const partnerName = fullName2(partnerPrefix, partnerFirst, partnerLast);
  const childrenUnder18 = parseJson(
    isClient2 ? record.client2ChildrenUnder18 : record.client1ChildrenUnder18,
    []
  );
  const childrenOver18 = parseJson(
    isClient2 ? record.client2ChildrenOver18 : record.client1ChildrenOver18,
    []
  );
  const children = [...childrenUnder18, ...childrenOver18].map((c) => fullName2(safe4(c.firstName), safe4(c.lastName))).filter(Boolean);
  const rawReservedExec = isClient2 ? parseJson(record.client2ReservedExecutors, []) : parseJson(record.client1ReservedExecutors, []);
  const reservedExecutors = rawReservedExec.map((e) => {
    const name = fullName2(safe4(e.firstName), safe4(e.lastName));
    const dobPart = e.dob ? ` (born ${e.dob})` : "";
    return name ? name + dobPart : "";
  }).filter(Boolean);
  const rawGuardians = isClient2 ? parseJson(record.client2Guardians, []) : parseJson(record.client1Guardians, []);
  const guardians = rawGuardians.map((g) => {
    const name = fullName2(safe4(g.firstName), safe4(g.lastName));
    const dobPart = g.dob ? ` (born ${g.dob})` : "";
    return name ? name + dobPart : "";
  }).filter(Boolean);
  const rawReservedGuardians = isClient2 ? parseJson(record.client2ReservedGuardians, []) : parseJson(record.client1ReservedGuardians, []);
  const reservedGuardians = rawReservedGuardians.map((g) => {
    const name = fullName2(safe4(g.firstName), safe4(g.lastName));
    const dobPart = g.dob ? ` (born ${g.dob})` : "";
    return name ? name + dobPart : "";
  }).filter(Boolean);
  const trustees = executors.length ? executors : ["[Trustee Name]"];
  const vulnerableBeneficiary = beneficiaries[0] || "[Vulnerable Beneficiary]";
  const organDonation = (isClient2 ? safe4(record.client2OrganDonation) : safe4(record.client1OrganDonation) || safe4(record.organDonation)).toLowerCase() === "yes";
  const funeralType = isClient2 ? safe4(record.client2FuneralType) : safe4(record.client1FuneralType) || safe4(record.funeralType);
  const funeralWishes = isClient2 ? safe4(record.client2FuneralWishes) : safe4(record.client1FuneralWishes) || safe4(record.funeralWishes);
  let clauseNum = 1;
  let clausesHtml = "";
  clausesHtml += revocationClause(clauseNum++, testatorName, dob, fullAddress);
  clausesHtml += executorsClause(clauseNum++, executors, reservedExecutors);
  clausesHtml += definitionClause(clauseNum++);
  clausesHtml += distributionClause(clauseNum++, primaryBeneficiary, residuaryBeneficiaries, specificGifts);
  if (options.includePPT) {
    clausesHtml += pptClause(clauseNum++, testatorName, partnerName, children);
  }
  if (options.includeDiscretionaryTrust) {
    clausesHtml += discretionaryTrustClause(clauseNum++, trustees, "my children and remoter issue");
  }
  if (options.includeVulnerableTrust) {
    clausesHtml += vulnerableTrustClause(clauseNum++, vulnerableBeneficiary, trustees);
  }
  if (guardians.length) {
    const gList = guardians.map((g) => `<li>${g}</li>`).join("\n");
    let guardianBody = `<p>In the event of my death while any of my children are minors, I appoint the following as Guardian(s) of my minor children:</p><ol>${gList}</ol>`;
    if (reservedGuardians.length) {
      const rgList = reservedGuardians.map((g) => `<li>${g}</li>`).join("\n");
      guardianBody += `<p>In the event that the above-named Guardian(s) shall predecease me or be unable or unwilling to act, I appoint the following as Reserve Guardian(s):</p><ol>${rgList}</ol>`;
    }
    clausesHtml += clauseHtml(clauseNum++, "Appointment of Guardians", guardianBody);
  }
  clausesHtml += ageConditionClause(clauseNum++);
  clausesHtml += executorPowersClause(clauseNum++);
  clausesHtml += survivorshipClause(clauseNum++);
  clausesHtml += funeralWishesClause(clauseNum++, funeralType, funeralWishes);
  if (organDonation) clausesHtml += organDonationClause(clauseNum++);
  clausesHtml += clauseHtml(
    clauseNum++,
    "STEP Powers",
    "<p>In this my Will where the context so admits any reference to the STEP Powers shall mean the Standard Provisions (2nd edition) of the Society of Trust and Estate Practitioners together with the Special Provisions (2nd edition) (with the exception of Special Provision 5) shall apply to this my Will.</p>"
  );
  clausesHtml += avoidanceOfDoubtClause(clauseNum++);
  clausesHtml += attestationHtml(testatorName);
  const willTypeLabel3 = options.willType === "single" ? "Last Will and Testament" : options.willType === "mirror_client1" ? "Last Will and Testament (Mirror \u2014 Client 1)" : "Last Will and Testament (Mirror \u2014 Client 2)";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${willTypeLabel3} \u2014 ${testatorName}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="will-document" id="will-content">
    <div class="will-header">
      <div class="firm-name">Genesis Wills and Estate Planning</div>
      <h1>${willTypeLabel3}</h1>
      <div class="testator-details">
        <strong>${testatorName}</strong><br />
        ${fullAddress}
      </div>
      ${reference ? `<div class="ref">Reference: ${reference}</div>` : ""}
    </div>

    ${clausesHtml}
  </div>
</body>
</html>`;
}

// server/willDocxGenerator.ts
import fs from "fs";
import path from "path";
import https3 from "https";
import http3 from "http";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  PageBreak
} from "docx";
var LOGO_URL3 = "http://localhost:" + (process.env.PORT ?? "3000") + "/manus-storage/GenesisEstatePlanningLogoUSETHISONE_edc6d153.png";
var LOCAL_LOGO = path.join(process.cwd(), "../webdev-static-assets/GenesisEstatePlanningLogoUSETHISONE.png");
function fetchBuffer3(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https3 : http3;
    mod.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer3(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}
async function fetchLogoBuffer3() {
  try {
    if (fs.existsSync(LOCAL_LOGO)) return fs.readFileSync(LOCAL_LOGO);
    return await fetchBuffer3(LOGO_URL3);
  } catch {
    return null;
  }
}
function safe5(v) {
  if (v == null) return "";
  return String(v).trim();
}
function safeArr4(v) {
  if (!v) return [];
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (Array.isArray(v)) return v;
  return [];
}
function safeGiftArr(v) {
  if (!v) return [];
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (Array.isArray(v)) return v;
  return [];
}
function personFullName(p, includeDob = true) {
  if (!p) return "";
  const name = [p.title, p.prefix, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ").trim();
  const dobPart = includeDob && p.dob ? ` (born ${p.dob})` : "";
  return name + dobPart;
}
function personRel(p) {
  return safe5(p?.relationship) || "person";
}
function clauseHeading2(num, title) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}. ${title.toUpperCase()}`, bold: true, size: 24 })
    ],
    spacing: { before: 240, after: 80 }
  });
}
function body(text2) {
  return new Paragraph({
    children: [new TextRun({ text: text2, size: 24 })],
    spacing: { before: 60, after: 60 },
    alignment: AlignmentType.JUSTIFIED
  });
}
function subItem2(label, text2, indent = 0) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}	${text2}`, size: 24 })
    ],
    indent: { left: 360 + indent },
    spacing: { before: 40, after: 40 },
    alignment: AlignmentType.JUSTIFIED
  });
}
function sigBlock(label) {
  return [
    new Paragraph({
      children: [new TextRun({ text: label, bold: true, size: 24 })],
      spacing: { before: 160, after: 20 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "Signature: " + "_".repeat(55) })],
      spacing: { before: 20, after: 40 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "Full Name: " + "_".repeat(55) })],
      spacing: { before: 20, after: 40 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "Date:      " + "_".repeat(55) })],
      spacing: { before: 20, after: 40 }
    })
  ];
}
function witnessSigBlock(num) {
  return [
    new Paragraph({
      children: [new TextRun({ text: `WITNESS ${num}`, bold: true, size: 24 })],
      spacing: { before: 200, after: 20 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "Signature:  " + "_".repeat(53) })],
      spacing: { before: 20, after: 40 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "Full Name:  " + "_".repeat(53) })],
      spacing: { before: 20, after: 40 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "Address:    " + "_".repeat(53) })],
      spacing: { before: 20, after: 20 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "            " + "_".repeat(53) })],
      spacing: { before: 0, after: 40 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "Occupation: " + "_".repeat(53) })],
      spacing: { before: 20, after: 40 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "Date:       " + "_".repeat(53) })],
      spacing: { before: 20, after: 40 }
    })
  ];
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}
async function generateWillDocx(record, opts) {
  const logoBuffer = await fetchLogoBuffer3();
  const isClient2 = opts.willType === "mirror_client2";
  const isMirror = opts.willType !== "single";
  const prefix = isClient2 ? safe5(record.client2Prefix) : safe5(record.client1Prefix);
  const firstName = isClient2 ? safe5(record.client2FirstName) : safe5(record.client1FirstName);
  const middleName = isClient2 ? safe5(record.client2MiddleName) : safe5(record.client1MiddleName);
  const lastName = isClient2 ? safe5(record.client2LastName) : safe5(record.client1LastName);
  const dob = isClient2 ? safe5(record.client2Dob) : safe5(record.client1Dob);
  const addr1 = isClient2 ? safe5(record.client2AddressLine1) : safe5(record.client1AddressLine1);
  const city = isClient2 ? safe5(record.client2City) : safe5(record.client1City);
  const postcode = isClient2 ? safe5(record.client2Postcode) : safe5(record.client1Postcode);
  const testatorName = [prefix, firstName, middleName, lastName].filter(Boolean).join(" ") || "Testator";
  const fullAddress = [addr1, city, postcode].filter(Boolean).join(", ") || "";
  let executors = [];
  if (opts.willType === "mirror_client1") {
    const partnerEntry = {
      prefix: safe5(record.client2Prefix),
      firstName: safe5(record.client2FirstName),
      lastName: safe5(record.client2LastName),
      address: [safe5(record.client2AddressLine1), safe5(record.client2City), safe5(record.client2Postcode)].filter(Boolean).join(" "),
      relationship: "spouse/partner"
    };
    executors = [partnerEntry, ...safeArr4(record.client1Executors)];
  } else if (opts.willType === "mirror_client2") {
    const partnerEntry = {
      prefix: safe5(record.client1Prefix),
      firstName: safe5(record.client1FirstName),
      lastName: safe5(record.client1LastName),
      address: [safe5(record.client1AddressLine1), safe5(record.client1City), safe5(record.client1Postcode)].filter(Boolean).join(" "),
      relationship: "spouse/partner"
    };
    executors = [partnerEntry, ...safeArr4(record.client2Executors)];
  } else {
    executors = safeArr4(record.client1Executors);
  }
  const guardians = isClient2 ? safeArr4(record.client2Guardians) : safeArr4(record.client1Guardians);
  const reservedExecutors = isClient2 ? safeArr4(record.client2ReservedExecutors) : safeArr4(record.client1ReservedExecutors);
  const reservedGuardians = isClient2 ? safeArr4(record.client2ReservedGuardians) : safeArr4(record.client1ReservedGuardians);
  let primaryBeneficiary = null;
  let residuaryBeneficiaries = [];
  if (opts.willType === "mirror_client1") {
    primaryBeneficiary = {
      prefix: safe5(record.client2Prefix),
      firstName: safe5(record.client2FirstName),
      lastName: safe5(record.client2LastName),
      relationship: "spouse/partner"
    };
    residuaryBeneficiaries = safeArr4(record.client1Beneficiaries);
  } else if (opts.willType === "mirror_client2") {
    primaryBeneficiary = {
      prefix: safe5(record.client1Prefix),
      firstName: safe5(record.client1FirstName),
      lastName: safe5(record.client1LastName),
      relationship: "spouse/partner"
    };
    residuaryBeneficiaries = safeArr4(record.client2Beneficiaries);
  } else {
    const allBeneficiaries = safeArr4(record.client1Beneficiaries);
    if (allBeneficiaries.length > 0) {
      primaryBeneficiary = allBeneficiaries[0];
      residuaryBeneficiaries = allBeneficiaries.slice(1);
    }
  }
  const specificGifts = isClient2 ? safeGiftArr(record.client2SpecificGifts) : safeGiftArr(record.client1SpecificGifts);
  const funeralWishes = isClient2 ? safe5(record.client2FuneralWishes) || safe5(record.funeralWishes) : safe5(record.client1FuneralWishes) || safe5(record.funeralWishes);
  const funeralType = isClient2 ? safe5(record.client2FuneralType) || safe5(record.funeralType) : safe5(record.client1FuneralType) || safe5(record.funeralType);
  const organDonation = isClient2 ? safe5(record.client2OrganDonation).toLowerCase() === "yes" : safe5(record.client1OrganDonation).toLowerCase() === "yes" || safe5(record.organDonation).toLowerCase() === "yes";
  const vulnerableBeneficiaryDetails = isClient2 ? safe5(record.client2VulnerableBeneficiaryDetails) || safe5(record.vulnerableBeneficiaryDetails) : safe5(record.client1VulnerableBeneficiaryDetails) || safe5(record.vulnerableBeneficiaryDetails);
  const partnerName = opts.willType === "mirror_client1" ? [safe5(record.client2Prefix), safe5(record.client2FirstName), safe5(record.client2LastName)].filter(Boolean).join(" ") : [safe5(record.client1Prefix), safe5(record.client1FirstName), safe5(record.client1LastName)].filter(Boolean).join(" ");
  const paras = [];
  if (logoBuffer) {
    paras.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 200, height: 77 },
            type: "png"
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160 }
      })
    );
  }
  paras.push(
    new Paragraph({
      children: [new TextRun({ text: "LAST WILL AND TESTAMENT", bold: true, size: 40 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 }
    }),
    new Paragraph({
      children: [new TextRun({ text: "of", size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 }
    }),
    new Paragraph({
      children: [new TextRun({ text: testatorName.toUpperCase(), bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 320 }
    })
  );
  let clauseNum = 1;
  paras.push(clauseHeading2(clauseNum++, "Revocation"));
  paras.push(body(
    `I ${testatorName}${dob ? ` date of birth ${dob}` : ""}${fullAddress ? ` of ${fullAddress}` : ""} do hereby revoke all former Wills and testamentary dispositions so far as they relate to my property of every kind wherever situate and declare that the law of England & Wales shall apply to this my Will in relation to my property of every kind wherever situate.`
  ));
  paras.push(clauseHeading2(clauseNum++, "Appointment of Executors"));
  if (!executors.length) {
    paras.push(body("I appoint [Executor Name] to be the sole executor of this my Will."));
  } else {
    const primary = executors[0];
    const substitutes = executors.slice(1);
    let execText = `I appoint ${personFullName(primary)}`;
    if (primary.address) execText += ` of ${primary.address}`;
    execText += ` to be the sole executor of this my Will`;
    if (substitutes.length > 0) {
      execText += ` but if my ${personRel(primary)} is unable or unwilling to prove my Will then I APPOINT `;
      execText += substitutes.map((s) => {
        let t2 = personFullName(s);
        if (s.address) t2 += ` of ${s.address}`;
        return t2;
      }).join(" and ");
      execText += ` to be the executors of this my Will (hereinafter referred to as 'my Executors')`;
    } else {
      execText += ` (hereinafter referred to as 'my Executor')`;
    }
    paras.push(body(execText + "."));
    paras.push(body(
      "Always provided that if a trust is created in the following clauses of this my Will and no appointment of a trustee is made in relation to that trust I direct that my Executor shall be appointed as my trustee hereinafter referred to as 'my trustees' which expression shall include the trustee or trustees for the time being hereof."
    ));
  }
  if (reservedExecutors.length > 0) {
    paras.push(clauseHeading2(clauseNum++, "Appointment of Reserve Executors"));
    const rExecNames = reservedExecutors.map((e) => {
      let t2 = personFullName(e) || "[Reserve Executor]";
      if (e.address) t2 += ` of ${e.address}`;
      return t2;
    });
    paras.push(body(
      `In the event that my primary Executor is unable or unwilling to act I APPOINT ${rExecNames.join(" and ")} as Reserve Executor${rExecNames.length > 1 ? "s" : ""} of this my Will (hereinafter also referred to as 'my Executors').`
    ));
  }
  if (guardians.length > 0 || reservedGuardians.length > 0) {
    paras.push(clauseHeading2(clauseNum++, "Appointment of Guardians"));
    if (guardians.length > 0) {
      const gNames = guardians.map((g) => {
        let t2 = personFullName(g) || "[Guardian]";
        if (g.address) t2 += ` of ${g.address}`;
        return t2;
      });
      paras.push(body(
        `In the event of my death whilst my children are under the age of eighteen years I APPOINT ${gNames.join(" and ")} to be the Guardian${gNames.length > 1 ? "s" : ""} of my minor children.`
      ));
    }
    if (reservedGuardians.length > 0) {
      const rgNames = reservedGuardians.map((g) => {
        let t2 = personFullName(g) || "[Reserve Guardian]";
        if (g.address) t2 += ` of ${g.address}`;
        return t2;
      });
      paras.push(body(
        `In the event that the above-named Guardian${reservedGuardians.length > 1 ? "s are" : " is"} unable or unwilling to act I APPOINT ${rgNames.join(" and ")} as Reserve Guardian${rgNames.length > 1 ? "s" : ""} of my minor children.`
      ));
    }
  }
  paras.push(clauseHeading2(clauseNum++, "Definition and Administration of my Estate"));
  paras.push(subItem2("a)", "In this my Will where the context so admits my Estate shall mean:"));
  paras.push(subItem2("i)", "all my real and personal property of every kind wherever situate including that over which I have a general power of appointment and", 40));
  paras.push(subItem2("ii)", "the money investments and property from time to time representing all such property", 40));
  paras.push(subItem2("b)", "My Executors shall hold my Estate upon trust"));
  paras.push(subItem2("i)", "to pay and discharge all my debts funeral testamentary and administration expenses and", 40));
  paras.push(subItem2("ii)", "to give effect to all legacies", 40));
  paras.push(clauseHeading2(clauseNum++, "Distribution of the Residue"));
  paras.push(body("SUBJECT to the trusts DECLARED above my Executors SHALL HOLD my Estate as follows:"));
  if (primaryBeneficiary && personFullName(primaryBeneficiary)) {
    paras.push(subItem2(
      "a)",
      `Upon trust absolutely for my ${personRel(primaryBeneficiary)} ${personFullName(primaryBeneficiary)} if they shall survive me for the period of twenty eight days but if my said ${personRel(primaryBeneficiary)} shall die in my lifetime or shall not survive me for the period aforesaid or if this gift fails or lapses for any other reason and subject thereto`
    ));
  } else {
    paras.push(subItem2("a)", "Upon trust absolutely for [Primary Beneficiary] if they shall survive me for the period of twenty eight days but if my said beneficiary shall die in my lifetime or shall not survive me for the period aforesaid or if this gift fails or lapses for any other reason and subject thereto"));
  }
  if (residuaryBeneficiaries.length > 0) {
    paras.push(subItem2("b)", "Upon trust in the following shares:"));
    const romanLabels = ["i)", "ii)", "iii)", "iv)", "v)", "vi)", "vii)", "viii)", "ix)", "x)"];
    const equalShare = Math.floor(100 / residuaryBeneficiaries.length);
    residuaryBeneficiaries.forEach((b, i) => {
      const name = personFullName(b) || "[Beneficiary]";
      const share = b.share || `${equalShare}%`;
      const label = romanLabels[i] || `${i + 1})`;
      paras.push(subItem2(
        label,
        `${share} to ${name} Provided that if my said ${name} shall die without having attained a vested interest leaving issue who survive me then such issue shall take by substitution such failed share and if there shall be more than one of such issue they shall take in equal shares per stirpes but so that no issue shall take whose parent is alive and so capable of taking`,
        40
      ));
    });
    paras.push(body(
      "If any of the share or shares under this sub clause b) shall fail in their entirety that share or those shares shall be added proportionally to the other shares that have not failed."
    ));
  }
  if (specificGifts.length > 0) {
    specificGifts.forEach((g) => {
      if (g.description || g.recipient) {
        paras.push(body(
          `I give ${safe5(g.description) || "[item]"} to ${safe5(g.recipient) || "[recipient]"}${g.value ? ` (estimated value: ${g.value})` : ""}.`
        ));
      }
    });
  }
  paras.push(clauseHeading2(clauseNum++, "Conditional Gift at Specified Age of 18 Years"));
  paras.push(body(
    "Any interest left in this my Will to a beneficiary shall be conditional on them attaining the age of 18 years and shall carry the intermediate interest until that age I give the power to my Executors in their absolute discretion to advance part or all of such entitlement which my Executors deem to be appropriate."
  ));
  paras.push(clauseHeading2(clauseNum++, "Executor and Trustee Powers"));
  paras.push(body(
    "My Executors and trustees shall in addition to and without prejudice to all statutory powers have the powers and immunities set out in The STEP Powers provided they shall not exercise any of their powers so as to conflict with the beneficial provisions of this my Will."
  ));
  paras.push(clauseHeading2(clauseNum++, "Survivorship"));
  paras.push(body(
    "Any Person who does not survive me by twenty eight days who would otherwise be a beneficiary under this my Will shall be treated for the purposes of my Will as having died in my lifetime."
  ));
  function docxTrusteeNames(trustees, fallback = "my Executors") {
    const names = (trustees ?? []).map((p) => [p.prefix, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")).filter(Boolean);
    if (names.length === 0) return fallback;
    if (names.length === 1) return names[0];
    return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  }
  function docxBenNames(people, fallback = "my children and remoter issue in equal shares absolutely") {
    const parts = (people ?? []).map((p) => {
      const n = [p.prefix, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
      return n && p.share ? `${n} as to ${p.share}` : n;
    }).filter(Boolean);
    if (parts.length === 0) return fallback;
    if (parts.length === 1) return parts[0] + " absolutely";
    return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] + " in the shares specified";
  }
  function safeCA(v) {
    if (!v) return [];
    if (typeof v === "string") {
      try {
        return JSON.parse(v);
      } catch {
        return [];
      }
    }
    if (Array.isArray(v)) return v;
    return [];
  }
  for (const ppt of safeCA(record.protectivePropertyTrusts)) {
    const property = ppt.propertyAddress || "my principal residence";
    const lifeTenants = ppt.lifeTenants;
    const ltNames = (lifeTenants ?? []).map((p) => [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ")).filter(Boolean);
    const ltStr = ltNames.length > 0 ? ltNames.join(" and ") : "my surviving spouse or civil partner";
    const trNames = docxTrusteeNames(ppt.trustees);
    const ultBens = docxBenNames(ppt.ultimateBeneficiaries);
    const triggers = ppt.terminationTriggers ?? {};
    const terminationEvents = [];
    if (triggers.onDeath !== false) terminationEvents.push("the death of the Life Tenant");
    if (triggers.onRemarriageOrCohabitation) terminationEvents.push("the Life Tenant remarrying, entering into a civil partnership, or beginning to cohabit with another person");
    if (triggers.onCeasingToReside) terminationEvents.push("the Life Tenant ceasing to permanently reside in the Property");
    if (triggers.onBreachOfConditions) terminationEvents.push("the Life Tenant failing to comply with the conditions of this trust");
    const triggerStr = terminationEvents.length > 0 ? `The Trust Period shall terminate upon the first to occur of the following events: ${terminationEvents.map((e, i) => `(${String.fromCharCode(105 + i)}) ${e}`).join("; or ")}.` : "The Trust Period shall terminate upon the death of the Life Tenant.";
    paras.push(clauseHeading2(clauseNum++, "Protective Property Trust (Lifetime Interest Trust)"));
    paras.push(body(`I DECLARE that my share of the property known as ${property} (hereinafter referred to as "the Property") shall not pass under the general gift of my Residuary Estate but shall instead be held upon the following trusts:`));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) The Trustees shall hold my share of the Property upon trust to permit ${ltStr} (hereinafter referred to as "the Life Tenant") to have the right to reside in the Property during the Trust Period.`));
    paras.push(body(`(c) ${triggerStr}`));
    paras.push(body(`(d) Upon the termination of the Trust Period the Trustees shall hold the Property (or the net proceeds of sale thereof) upon trust for ${ultBens}.`));
    paras.push(body("(e) The Life Tenant shall be responsible for the payment of all outgoings in respect of the Property including rates, taxes, insurance, and the cost of all repairs and maintenance."));
    paras.push(body("(f) The Trustees shall have power to sell the Property and to apply the proceeds of sale in the purchase of another property to be held upon the same trusts or to invest the same as if they were absolute beneficial owners thereof."));
    if (ppt.notes) paras.push(body(ppt.notes));
  }
  if (opts.ppt && safeCA(record.protectivePropertyTrusts).length === 0) {
    paras.push(clauseHeading2(clauseNum++, "Protective Property Trust (Lifetime Trust)"));
    paras.push(body(`Notwithstanding the foregoing, my Trustees shall hold my share of the matrimonial home upon trust to permit my ${isMirror && partnerName ? partnerName : "spouse/civil partner"} to reside therein during their lifetime or until they remarry or enter into a new civil partnership. Upon the termination of such life interest, my Trustees shall hold the property (or the net proceeds of sale thereof) for the residuary beneficiaries named above in equal shares absolutely.`));
    paras.push(body("My Trustees shall have power to sell the property and apply the proceeds to purchase alternative accommodation for my said beneficiary on the same trusts."));
  }
  for (const dt of safeCA(record.discretionaryTrusts)) {
    const trNames = docxTrusteeNames(dt.trustees);
    const benefClass = dt.beneficiaryClass || "my children and remoter issue and such other persons as my Trustees shall in their absolute discretion determine";
    const addBens = (dt.additionalBeneficiaries ?? []).map((p) => [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ")).filter(Boolean);
    const fullBenClass = addBens.length > 0 ? `${benefClass}, together with ${addBens.join(", ")}` : benefClass;
    paras.push(clauseHeading2(clauseNum++, "Discretionary Trust"));
    paras.push(body(`(a) The Trustees of this Discretionary Trust shall be ${trNames} or such other persons as shall be appointed as trustees hereof from time to time.`));
    paras.push(body(`(b) The Beneficiaries of this Discretionary Trust shall be ${fullBenClass}.`));
    paras.push(body("(c) My Trustees shall hold the trust fund upon trust to pay or apply the income and/or capital thereof to or for the benefit of all or any one or more of the Beneficiaries in such shares and proportions and in such manner as my Trustees shall in their absolute discretion think fit."));
    paras.push(body("(d) My Trustees shall have the widest possible powers of investment as if they were absolute beneficial owners of the trust fund and shall not be restricted to investments authorised by law for trustees."));
    paras.push(body("(e) This Discretionary Trust shall terminate on the expiry of the period of 125 years from the date of my death (which period shall be the perpetuity period applicable to this trust) and upon such termination the trust fund shall be held for such of the Beneficiaries as are then living in equal shares absolutely."));
    if (dt.notes) paras.push(body(dt.notes));
  }
  if (opts.discretionary && safeCA(record.discretionaryTrusts).length === 0) {
    paras.push(clauseHeading2(clauseNum++, "Discretionary Trust"));
    paras.push(body("My Trustees shall hold the Trust Fund upon discretionary trusts for the benefit of such one or more of the Discretionary Beneficiaries as my Trustees shall in their absolute discretion determine, and in such shares and upon such terms and conditions as my Trustees shall think fit."));
    paras.push(body("The 'Discretionary Beneficiaries' means my spouse/civil partner, my children and remoter issue, and any other person or class of persons added by my Trustees by deed during the Trust Period."));
    paras.push(body("The 'Trust Period' means the period of 125 years from the date of my death (which shall be the perpetuity period applicable to this trust)."));
  }
  for (const vt of safeCA(record.vulnerablePersonTrusts)) {
    const vb = vt.vulnerableBeneficiary;
    const vbName = vb ? [vb.prefix, vb.firstName, vb.lastName].filter(Boolean).join(" ") || "[Vulnerable Beneficiary Name]" : "[Vulnerable Beneficiary Name]";
    const trNames = docxTrusteeNames(vt.trustees);
    const ultBens = docxBenNames(vt.ultimateBeneficiaries, "my children and remoter issue as shall then be living in equal shares absolutely or if none for my estate");
    paras.push(clauseHeading2(clauseNum++, "Vulnerable Person's Trust"));
    paras.push(body(`I DECLARE that the following provisions shall apply to the Vulnerable Person's Trust created by this my Will for the benefit of ${vbName} (hereinafter referred to as "the Vulnerable Beneficiary"):`));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body("(b) This trust is intended to qualify as a Vulnerable Beneficiary Trust within the meaning of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to qualify as such."));
    paras.push(body("(c) My Trustees shall hold the trust fund upon trust to apply the income and capital thereof for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees in their absolute discretion think fit having regard to the needs and welfare of the Vulnerable Beneficiary."));
    paras.push(body(`(d) Subject to the life interest of the Vulnerable Beneficiary the trust fund shall on the death of the Vulnerable Beneficiary be held for ${ultBens}.`));
    paras.push(body("(e) My Trustees shall have power to apply capital for the benefit of the Vulnerable Beneficiary at any time and from time to time as they in their absolute discretion think fit."));
    if (vt.notes) paras.push(body(vt.notes));
  }
  if (opts.vulnerable && safeCA(record.vulnerablePersonTrusts).length === 0) {
    paras.push(clauseHeading2(clauseNum++, "Vulnerable Person's Trust"));
    const vulnName = vulnerableBeneficiaryDetails || "[VULNERABLE BENEFICIARY NAME]";
    paras.push(body(`My Trustees shall hold the share of my Estate which would otherwise pass to ${vulnName} ('the Vulnerable Beneficiary') upon the trusts set out in this clause.`));
    paras.push(body("This trust is intended to qualify as a 'vulnerable person's trust' within the meaning of section 30 of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to so qualify throughout the Trust Period."));
    paras.push(body("My Trustees shall apply the income and capital of the trust fund for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees think fit, having regard to the needs, disability, and best interests of the Vulnerable Beneficiary."));
  }
  for (const nrb of safeCA(record.nilRateBandTrusts)) {
    const trNames = docxTrusteeNames(nrb.trustees);
    const bens = docxBenNames(nrb.beneficiaries);
    paras.push(clauseHeading2(clauseNum++, "Nil-Rate Band Discretionary Trust"));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) I GIVE to my Trustees such sum as equals my available nil-rate band for inheritance tax purposes at the date of my death (the "NRB Sum") to hold upon the trusts hereinafter declared.`));
    paras.push(body(`(c) My Trustees shall hold the NRB Sum upon trust for ${bens}.`));
    paras.push(body("(d) My Trustees shall have the widest possible powers of investment and management as if they were absolute beneficial owners of the trust fund."));
    paras.push(body("(e) This trust shall terminate on the expiry of 125 years from the date of my death and upon such termination the trust fund shall be distributed to such of the Beneficiaries as are then living in equal shares absolutely."));
    if (nrb.notes) paras.push(body(nrb.notes));
  }
  for (const bm of safeCA(record.bereavedMinorTrusts)) {
    const ben = bm.beneficiary;
    const bName = ben ? [ben.prefix, ben.firstName, ben.lastName].filter(Boolean).join(" ") || "[Beneficiary Name]" : "[Beneficiary Name]";
    const trNames = docxTrusteeNames(bm.trustees);
    const age = bm.ageOfAbsoluteEntitlement || "18";
    paras.push(clauseHeading2(clauseNum++, "Bereaved Minor's Trust (s.71A IHTA 1984)"));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) This trust is intended to qualify as a Bereaved Minor's Trust within the meaning of section 71A of the Inheritance Tax Act 1984.`));
    paras.push(body(`(c) My Trustees shall hold the trust fund upon trust to accumulate the income thereof until ${bName} ("the Beneficiary") attains the age of ${age} years and thereafter to pay the income to the Beneficiary.`));
    paras.push(body(`(d) Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.`));
    paras.push(body(`(e) If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.`));
    if (bm.notes) paras.push(body(bm.notes));
  }
  for (const a25 of safeCA(record.age18To25Trusts)) {
    const ben = a25.beneficiary;
    const bName = ben ? [ben.prefix, ben.firstName, ben.lastName].filter(Boolean).join(" ") || "[Beneficiary Name]" : "[Beneficiary Name]";
    const trNames = docxTrusteeNames(a25.trustees);
    const age = a25.ageOfAbsoluteEntitlement || "25";
    paras.push(clauseHeading2(clauseNum++, `18-to-25 Trust (s.71D IHTA 1984)`));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) This trust is intended to qualify as an 18-to-25 trust within the meaning of section 71D of the Inheritance Tax Act 1984.`));
    paras.push(body(`(c) My Trustees shall hold the trust fund upon trust to accumulate the income thereof until ${bName} ("the Beneficiary") attains the age of 18 years and thereafter to pay the income to the Beneficiary until the Beneficiary attains the age of ${age} years.`));
    paras.push(body(`(d) Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.`));
    paras.push(body(`(e) If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.`));
    if (a25.notes) paras.push(body(a25.notes));
  }
  for (const bpr of safeCA(record.businessPropertyReliefs)) {
    const bizName = bpr.businessName || "my business interests";
    const trNames = docxTrusteeNames(bpr.trustees);
    const bens = docxBenNames(bpr.beneficiaries);
    paras.push(clauseHeading2(clauseNum++, "Business Property Relief Trust"));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) I GIVE my business interests known as ${bizName} to my Trustees to hold upon the trusts hereinafter declared, it being my intention that the Business Assets shall qualify for Business Property Relief pursuant to Chapter I of Part V of the Inheritance Tax Act 1984.`));
    paras.push(body(`(c) My Trustees shall hold the Business Assets upon trust for ${bens}.`));
    paras.push(body("(d) My Trustees shall have the widest possible powers to manage, invest, realise, and deal with the Business Assets as if they were absolute beneficial owners thereof."));
    paras.push(body("(e) My Trustees shall use their best endeavours to ensure that the Business Assets continue to qualify for Business Property Relief and shall not take any action that would jeopardise such qualification without first obtaining appropriate professional advice."));
    if (bpr.notes) paras.push(body(bpr.notes));
  }
  if (organDonation) {
    paras.push(clauseHeading2(clauseNum++, "Organ Donation"));
    paras.push(body(
      "I declare that it is my desire that after my death any of my organs can be used for therapeutic purposes."
    ));
  }
  paras.push(clauseHeading2(clauseNum++, "Funeral Wishes"));
  {
    const ft = funeralType ? funeralType.toLowerCase() : "";
    if (ft === "burial") {
      paras.push(body("I desire that my body be buried and the expense thereof shall be a first charge on my Estate."));
    } else if (ft === "cremation") {
      paras.push(body("I desire that my body be cremated and my ashes disposed of as my Executors shall think fit, and the expense thereof shall be a first charge on my Estate."));
    } else if (ft === "no preference" || ft === "no_preference") {
      paras.push(body("I leave the choice of burial or cremation to the discretion of my Executors."));
    } else {
      paras.push(body("I desire that my body be [cremated/buried] and the expense thereof shall be a first charge on my Estate."));
    }
    if (funeralWishes) paras.push(body(funeralWishes));
    paras.push(body("These wishes are not legally binding on my Executors but I ask that they be given due consideration."));
  }
  paras.push(clauseHeading2(clauseNum++, "STEP Powers"));
  paras.push(body(
    "In this my Will where the context so admits any reference to the STEP Powers shall mean the Standard Provisions and all of the Special Provisions (with the exception of Special Provision 6) of the Society of Trust and Estate Practitioners (2nd edition) shall apply."
  ));
  paras.push(
    new Paragraph({ spacing: { before: 240, after: 0 } }),
    body(
      `IN WITNESS whereof I, ${testatorName}, have hereunto set my hand to this my Last Will and Testament this _______ day of _____________ 20____.`
    )
  );
  paras.push(pageBreak());
  paras.push(
    new Paragraph({
      children: [new TextRun({ text: "EXECUTION PAGE", bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 }
    }),
    body(
      "SIGNED as a Will by the above-named TESTATOR in our presence and then by us in the presence of the Testator and of each other:"
    )
  );
  paras.push(...sigBlock("TESTATOR"));
  paras.push(...witnessSigBlock(1));
  paras.push(...witnessSigBlock(2));
  const doc = new Document({
    creator: "Genesis Wills and Estate Planning",
    title: `Last Will and Testament of ${testatorName}`,
    description: "Generated by Genesis Wills and Estate Planning",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: paras
      }
    ],
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24 }
        },
        heading1: {
          run: { bold: true, size: 28, color: "1a3a2a" }
        }
      }
    }
  });
  return await Packer.toBuffer(doc);
}

// server/_core/index.ts
init_db();
init_schema();
import { eq as eq6, sql } from "drizzle-orm";

// server/lpaFillPdf.ts
import { PDFDocument as PDFDocument2 } from "pdf-lib";
import fs2 from "fs";
import path2 from "path";
import fetch2 from "node-fetch";
function parseDob(dob) {
  if (!dob) return { day: "", month: "", year: "" };
  const parts = dob.split("/");
  return {
    day: parts[0] ?? "",
    month: parts[1] ?? "",
    year: parts[2] ?? ""
  };
}
function setText(form, name, value) {
  try {
    form.getTextField(name).setText(value ?? "");
  } catch {
  }
}
function checkBox(form, name, checked) {
  try {
    const field = form.getCheckBox(name);
    if (checked) field.check();
    else field.uncheck();
  } catch {
  }
}
async function fillLpaPdf(data) {
  const isFinance = data.lpaType === "property_finance";
  const templateName = isFinance ? "lpa-lp1f.pdf" : "lpa-lp1h.pdf";
  let pdfBytes;
  const metaAny = import.meta;
  const serverDir = typeof metaAny.dirname === "string" ? metaAny.dirname : path2.join(process.cwd(), "server");
  const localPath = path2.join(serverDir, templateName);
  if (fs2.existsSync(localPath)) {
    pdfBytes = fs2.readFileSync(localPath);
  } else {
    const storageUrl = isFinance ? "/manus-storage/lpa-lp1f_3d2a3de9.pdf" : "/manus-storage/lpa-lp1h_b2d46e3d.pdf";
    const baseUrl = process.env.INTERNAL_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3e3}`;
    const res = await fetch2(`${baseUrl}${storageUrl}`, { redirect: "follow" });
    if (!res.ok) throw new Error(`Failed to fetch LPA template: ${res.status} ${storageUrl}`);
    pdfBytes = new Uint8Array(await res.arrayBuffer());
  }
  const doc = await PDFDocument2.load(pdfBytes, { ignoreEncryption: true });
  const form = doc.getForm();
  setText(form, "Title", data.donorTitle ?? "");
  setText(form, "First names", data.donorFirstNames ?? "");
  setText(form, "Last name", data.donorLastName ?? "");
  setText(form, "Any other names youre known by optional  eg your married name", data.donorOtherNames ?? "");
  const donorDob = parseDob(data.donorDob);
  setText(form, "Day", donorDob.day);
  setText(form, "Month", donorDob.month);
  setText(form, "Year", donorDob.year);
  const donorAddr = (data.donorAddress ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  setText(form, "Address 1a", donorAddr[0] ?? "");
  setText(form, "Address 1b", donorAddr[1] ?? "");
  setText(form, "Address 1cc", donorAddr.slice(2).join(", ") ?? "");
  setText(form, "Postcode", data.donorPostcode ?? "");
  setText(form, "Email address optional", data.donorEmail ?? "");
  const attorneys = data.attorneys ?? [];
  if (attorneys[0]) {
    const a = attorneys[0];
    const dob = parseDob(a.dob);
    setText(form, "Title_2", a.title ?? "");
    setText(form, "First names_2", a.firstNames ?? "");
    setText(form, "Last name_2", a.lastName ?? "");
    setText(form, "Day_3", dob.day);
    setText(form, "Month_3", dob.month);
    setText(form, "Year_3", dob.year);
    const addr1 = (a.address ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    setText(form, "Address 1_2", addr1[0] ?? "");
    setText(form, "Address 1_2b", addr1[1] ?? "");
    setText(form, "Address 1_2c", addr1.slice(2).join(", ") ?? "");
    setText(form, "undefined_2", a.postcode ?? "");
    setText(form, "Email address optional_2", a.email ?? "");
    if (a.isTrustCorporation) checkBox(form, "This attorney is a trust corporation", true);
  }
  if (attorneys[1]) {
    const a = attorneys[1];
    const dob = parseDob(a.dob);
    setText(form, "Title_3", a.title ?? "");
    setText(form, "First names_3", a.firstNames ?? "");
    setText(form, "Last name_3", a.lastName ?? "");
    setText(form, "Day_4", dob.day);
    setText(form, "Month_4", dob.month);
    setText(form, "Year_4", dob.year);
    const addr2 = (a.address ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    setText(form, "Address 1_3", addr2[0] ?? "");
    setText(form, "Address 1_3b", addr2[1] ?? "");
    setText(form, "Address 1_3c", addr2.slice(2).join(", ") ?? "");
    setText(form, "undefined_3", a.postcode ?? "");
    setText(form, "Email address optional_3", a.email ?? "");
  }
  if (attorneys[2]) {
    const a = attorneys[2];
    const dob = parseDob(a.dob);
    setText(form, "Title_4", a.title ?? "");
    setText(form, "First names_4", a.firstNames ?? "");
    setText(form, "Last name_4", a.lastName ?? "");
    setText(form, "Day_5", dob.day);
    setText(form, "Month_5", dob.month);
    setText(form, "Year_5", dob.year);
    const addr3 = (a.address ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    setText(form, "Address 1_4a", addr3[0] ?? "");
    setText(form, "Address 1_4b", addr3[1] ?? "");
    setText(form, "Address 1_4c", addr3.slice(2).join(", ") ?? "");
    setText(form, "undefined_4", a.postcode ?? "");
    setText(form, "Email address optional_4", a.email ?? "");
  }
  if (attorneys[3]) {
    const a = attorneys[3];
    const dob = parseDob(a.dob);
    setText(form, "Title_5", a.title ?? "");
    setText(form, "First names_5", a.firstNames ?? "");
    setText(form, "Last name_5", a.lastName ?? "");
    setText(form, "Day_6", dob.day);
    setText(form, "Month_6", dob.month);
    setText(form, "Year_6", dob.year);
    const addr4 = (a.address ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    setText(form, "Address 1_5a", addr4[0] ?? "");
    setText(form, "Address 1_5b", addr4[1] ?? "");
    setText(form, "Address 1_5c", addr4.slice(2).join(", ") ?? "");
    setText(form, "undefined_5", a.postcode ?? "");
    setText(form, "Email address optional_5", a.email ?? "");
  }
  if (attorneys.length > 4) {
    checkBox(form, "More attorneys  I want to appoint more than 4 attorneys Use Continuation sheet 1", true);
  }
  if (data.attorneyDecisionType === "jointly_severally") {
    checkBox(form, "Jointly and severally", true);
  }
  if (data.attorneyDecisionType === "jointly_some" && data.attorneyDecisionDetails) {
    setText(form, "Details", data.attorneyDecisionDetails);
  }
  const replacements = data.replacementAttorneys ?? [];
  if (replacements[0]) {
    const r = replacements[0];
    const dob = parseDob(r.dob);
    setText(form, "Title_6", r.title ?? "");
    setText(form, "First names_6", r.firstNames ?? "");
    setText(form, "Last name_6", r.lastName ?? "");
    setText(form, "Day_7", dob.day);
    setText(form, "Month_7", dob.month);
    setText(form, "Year_7", dob.year);
    const rAddr1 = (r.address ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    setText(form, "Address 1_6a", rAddr1[0] ?? "");
    setText(form, "Address 1_6b", rAddr1[1] ?? "");
    setText(form, "Address 1_6c", rAddr1.slice(2).join(", ") ?? "");
    setText(form, "undefined_6", r.postcode ?? "");
  }
  if (replacements[1]) {
    const r = replacements[1];
    const dob = parseDob(r.dob);
    setText(form, "Title_7", r.title ?? "");
    setText(form, "First names_7", r.firstNames ?? "");
    setText(form, "Last name_7", r.lastName ?? "");
    setText(form, "Day_8", dob.day);
    setText(form, "Month_8", dob.month);
    setText(form, "Year_8", dob.year);
    const rAddr2 = (r.address ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    setText(form, "Address 1_7a", rAddr2[0] ?? "");
    setText(form, "Address 1_7b", rAddr2[1] ?? "");
    setText(form, "Address 1_7c", rAddr2.slice(2).join(", ") ?? "");
    setText(form, "undefined_7", r.postcode ?? "");
  }
  if (replacements.length > 2) {
    checkBox(form, "More replacements   I want to appoint more than two replacements Use Continuation sheet 1", true);
  }
  if (isFinance && data.whenAttorneysCanAct === "whenever") {
    checkBox(form, "As soon as my LPA has been registered", true);
  }
  const notify = data.peopleToNotify ?? [];
  const notifyTitleFields = ["Title_8", "Title_9", "Title_10", "Title_11"];
  const notifyFirstFields = ["First names_8", "First names_9", "First names_10", "First names_11"];
  const notifyLastFields = ["Last name_8", "Last name_9", "Last name_10", "Last name_11"];
  const notifyAddrFields = ["undefined_8", "undefined_10", "undefined_12", "undefined_13"];
  const notifyPcFields = ["undefined_9", "undefined_11", "undefined_14", "undefined_16"];
  notify.slice(0, 4).forEach((p, i) => {
    setText(form, notifyTitleFields[i], p.title ?? "");
    setText(form, notifyFirstFields[i], p.firstNames ?? "");
    setText(form, notifyLastFields[i], p.lastName ?? "");
    setText(form, notifyAddrFields[i], p.address ?? "");
    setText(form, notifyPcFields[i], p.postcode ?? "");
  });
  if (notify.length > 4) {
    checkBox(form, "I want to appoint another person to notify maximum is 5  use Continuation sheet 1", true);
  }
  setText(form, "Preferences  use words like prefer and would like", data.preferences ?? "");
  setText(form, "Instructions  use words like must and have to", data.instructions ?? "");
  if (!isFinance) {
    if (data.lifeSustainingTreatment === "give_authority") {
      checkBox(form, "I give my attorneys authority to give or refuse consent to life-sustaining treatment on my behalf", true);
    } else if (data.lifeSustainingTreatment === "do_not_give") {
      checkBox(form, "I do not give my attorneys authority to give or refuse consent to life-sustaining treatment on my behalf", true);
    }
  }
  setText(form, "Title_12", data.certProviderTitle ?? "");
  setText(form, "First names_12", data.certProviderFirstNames ?? "");
  setText(form, "Last name_12", data.certProviderLastName ?? "");
  const certAddr = (data.certProviderAddress ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  setText(form, "Address 1_13a", certAddr[0] ?? "");
  setText(form, "Address 1_13b", certAddr[1] ?? "");
  setText(form, "Address 1_13c", certAddr.slice(2).join(", ") ?? "");
  setText(form, "undefined_15", data.certProviderPostcode ?? "");
  const allSigners = [...attorneys, ...replacements].slice(0, 4);
  const sec11TitleFields = ["Title_13", "Title_14", "Title_15", "Title_16"];
  const sec11FirstFields = ["First names_13", "First names_14", "First names_15", "First names_16"];
  const sec11LastFields = ["Last name_13", "Last name_14", "Last name_15", "Last name_16"];
  allSigners.forEach((p, i) => {
    setText(form, sec11TitleFields[i], p.title ?? "");
    setText(form, sec11FirstFields[i], p.firstNames ?? "");
    setText(form, sec11LastFields[i], p.lastName ?? "");
  });
  if (data.applicantType === "donor") {
    checkBox(form, "Donor the donor needs to sign section 15", true);
    setText(form, "Title_17", data.donorTitle ?? "");
    setText(form, "First names_17", data.donorFirstNames ?? "");
    setText(form, "Last name_17", data.donorLastName ?? "");
  } else if (data.applicantType === "attorneys") {
    checkBox(form, "security", true);
    const applicantTitles = ["Title_17", "Title_18", "Title_19", "Title_20"];
    const applicantFirsts = ["First names_17", "First names_18", "First names_19", "First names_20"];
    const applicantLasts = ["Last name_17", "Last name_18", "Last name_19", "Last name_20"];
    attorneys.slice(0, 4).forEach((a, i) => {
      setText(form, applicantTitles[i], a.title ?? "");
      setText(form, applicantFirsts[i], a.firstNames ?? "");
      setText(form, applicantLasts[i], a.lastName ?? "");
    });
  }
  if (data.recipientType === "donor") {
    checkBox(form, "Donor the donor needs to sign section 15", true);
  } else if (data.recipientType === "attorney") {
    checkBox(form, "receive the lpa", true);
  } else if (data.recipientType === "other") {
    checkBox(form, "undefined_30", true);
    setText(form, "Title_21", data.recipientTitle ?? "");
    setText(form, "First names_21", data.recipientFirstNames ?? "");
    setText(form, "Last name_21", data.recipientLastName ?? "");
    setText(form, "Company", data.recipientCompany ?? "");
    setText(form, "Address 1_18a", data.recipientAddressLine1 ?? "");
    setText(form, "Address 1_18b", data.recipientAddressLine2 ?? "");
    setText(form, "Address 1_18c", data.recipientAddressLine3 ?? "");
    setText(form, "undefined_29", data.recipientPostcode ?? "");
  }
  if (data.deliveryPost) checkBox(form, "Post", true);
  if (data.deliveryPhone) setText(form, "Phone", data.feeContactPhone ?? "");
  if (data.deliveryEmail) checkBox(form, "Email", true);
  if (data.deliveryWelsh) checkBox(form, "Welsh we will write to the person in Welsh", true);
  if (data.feeContactPhone) {
    setText(form, "Your phone number", data.feeContactPhone);
  }
  if (data.reducedFee) {
    checkBox(form, "I want to apply to pay a reduced fee", true);
  }
  if (data.repeatApplication) {
    checkBox(form, "Im making a repeat application", true);
    setText(form, "Case number", data.caseNumber ?? "");
  }
  const filledBytes = await doc.save();
  return Buffer.from(filledBytes);
}

// server/willV2Generator.ts
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
var __dirname = dirname(fileURLToPath(import.meta.url));
function getLogoDataUri() {
  const candidates = [
    join(__dirname, "genesis-logo.png"),
    join(__dirname, "../server/genesis-logo.png"),
    join(process.cwd(), "server/genesis-logo.png")
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      const data = readFileSync(p).toString("base64");
      return `data:image/png;base64,${data}`;
    }
  }
  return "/manus-storage/GenesisEstatePlanningLogoUSETHISONE_ec7861e9.png";
}
var LOGO_DATA_URI = getLogoDataUri();
function formatDate(iso) {
  if (!iso) return "_______________";
  const d3 = new Date(iso);
  if (isNaN(d3.getTime())) return iso;
  return d3.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function today() {
  const d3 = /* @__PURE__ */ new Date();
  return `the ${ordinal(d3.getDate())} day of ${d3.toLocaleDateString("en-GB", { month: "long" })} ${d3.getFullYear()}`;
}
function nameAndAddress(p) {
  const displayName = [p.title, p.fullName].filter(Boolean).join(" ") || "_______________";
  const parts = [displayName];
  if (p.address) parts.push(p.address);
  return parts.join(", ");
}
function generateWillHtml2(matter, testatorRole = "testator1") {
  const client = matter.clients.find((c) => c.clientRole === testatorRole);
  const partnerRole = testatorRole === "testator1" ? "testator2" : "testator1";
  const partner = matter.matterType === "mirror" ? matter.clients.find((c) => c.clientRole === partnerRole) : null;
  const name = client?.fullName || "_______________";
  const dob = formatDate(client?.dateOfBirth);
  const address = client?.address || "_______________";
  const execRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const primaryExecutors = matter.executors.filter((e) => e.clientRole === execRole && e.executorType === "primary");
  const substituteExecutors = matter.executors.filter((e) => e.clientRole === execRole && e.executorType === "substitute");
  const primaryGuardians = matter.guardians.filter((g) => g.guardianType === "primary");
  const substituteGuardians = matter.guardians.filter((g) => g.guardianType === "substitute");
  const benRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const primaryBeneficiaries = matter.beneficiaries.filter((b) => b.clientRole === benRole && b.beneficiaryType === "primary");
  const fallbackBeneficiaries = matter.beneficiaries.filter((b) => b.clientRole === benRole && b.beneficiaryType === "fallback");
  const wishRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const wishes = matter.wishes.find((w) => w.clientRole === wishRole) || matter.wishes[0];
  const ageCondition = wishes?.ageCondition ?? 18;
  const survivorshipDays = wishes?.survivorshipDays ?? 28;
  const organDonation = !!wishes?.organDonation;
  const organDonationText = wishes?.organDonationText || "I wish to donate my organs for medical purposes.";
  const funeralWishes = wishes?.funeralWishes || "";
  const residueToSpouseFirst = matter.matterType === "mirror" && (wishes?.residueToSpouseFirst ?? 1) === 1;
  const hasMinorChildren = wishes?.hasMinorChildren !== 0;
  const disasterClauseNotes = wishes?.disasterClauseNotes || "";
  const generalNotes = wishes?.generalNotes || "";
  const fileRef = matter.fileReference || "";
  const giftRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const specificGifts = (matter.gifts || []).filter((g) => g.clientRole === giftRole);
  const trustRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const trustClauses = (matter.trustClauses || []).filter(
    (tc) => tc.clientRole === trustRole && tc.enabled
  );
  const exclusionRole = testatorRole;
  const exclusions = (matter.exclusions || []).filter((e) => e.clientRole === exclusionRole && e.fullName?.trim());
  const pets = matter.pets || [];
  const properties = matter.properties || [];
  const businesses = matter.businesses || [];
  const executorClause = buildExecutorClause(primaryExecutors, substituteExecutors, name);
  const guardianClause = hasMinorChildren ? buildGuardianClause(primaryGuardians, substituteGuardians) : null;
  const residueClause = buildResidueClause(
    primaryBeneficiaries,
    fallbackBeneficiaries,
    partner,
    residueToSpouseFirst,
    ageCondition,
    survivorshipDays
  );
  let clauseNum = hasMinorChildren ? 4 : 3;
  const clauses = [];
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Definition and Administration of my Estate</h2>
  <p>My "Estate" shall mean all property, assets and rights to which I am beneficially entitled at the date of my death, including all property over which I have a general power of appointment or disposition by Will.</p>
  <p>My Executors and Trustees shall have the widest powers of management and administration in relation to my Estate as are set out in this Will and as are conferred by law.</p>
</div>`);
  if (properties.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Property</h2>
  ${buildPropertyClause(properties)}
</div>`);
  }
  if (businesses.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Business Interests</h2>
  ${buildBusinessClause(businesses)}
</div>`);
  }
  if (specificGifts.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Specific Gifts</h2>
  ${buildGiftsClause(specificGifts)}
</div>`);
  }
  if (pets.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Provision for Pets</h2>
  ${buildPetsClause(pets)}
</div>`);
  }
  if (exclusions.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Exclusion of Persons from Benefit</h2>
  ${buildExclusionsClause(exclusions)}
</div>`);
  }
  for (const tc of trustClauses) {
    const trustHtml = buildTrustClauseHtml(tc, clauseNum);
    if (trustHtml) {
      clauses.push(`<div class="clause">${trustHtml}</div>`);
      clauseNum++;
    }
  }
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Distribution of the Residue</h2>
  ${residueClause}
</div>`);
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Conditional Gift at Specified Age of ${ageCondition} Years</h2>
  <p>Any beneficiary who has not yet attained the age of ${ageCondition} years at the date of my death shall not be entitled to receive their share of my Estate absolutely until they attain that age. Until such time, my Trustees shall hold the share on trust for that beneficiary, with power to apply the income and capital for their maintenance, education and benefit.</p>
  <p>If any beneficiary should die before attaining the age of ${ageCondition} years, their share shall pass as if they had predeceased me.</p>
</div>`);
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Executor and Trustee Powers</h2>
  <p>My Executors and Trustees shall have the following powers in addition to those conferred by law:</p>
  <p>(a) Power to sell, call in and convert into money all or any part of my Estate at such time and in such manner as they think fit, with power to postpone such sale, calling in and conversion for so long as they think fit without being liable for any loss.</p>
  <p>(b) Power to invest the proceeds of sale and any ready money forming part of my Estate in any investments authorised by law for the investment of trust funds.</p>
  <p>(c) Power to apply the income or capital of any share held on trust for a minor beneficiary for or towards the maintenance, education or benefit of that beneficiary.</p>
  <p>(d) Power to appropriate any part of my Estate in or towards satisfaction of any legacy or share without requiring the consent of any beneficiary.</p>
  <p>(e) Power to insure any property forming part of my Estate against any risk and to pay the premiums out of the income or capital of my Estate.</p>
</div>`);
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Survivorship</h2>
  <p>Any beneficiary under this Will must survive me by a period of ${survivorshipDays} days in order to benefit under this Will. If any beneficiary fails to survive me by ${survivorshipDays} days, the gift to that beneficiary shall lapse and shall fall into the residue of my Estate to be distributed as if that beneficiary had predeceased me.</p>
</div>`);
  if (disasterClauseNotes) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Disaster Clause</h2>
  <p>${disasterClauseNotes}</p>
</div>`);
  } else {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Disaster Clause</h2>
  <p>In the event that all of my beneficiaries named in this Will predecease me or fail to survive me by the required survivorship period, the residue of my Estate shall pass in accordance with the laws of intestacy applicable in England and Wales at the date of my death.</p>
</div>`);
  }
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Organ Donation</h2>
  ${organDonation ? `<p>${organDonationText}</p>` : `<p>I do not wish to make any specific direction in relation to organ donation.</p>`}
</div>`);
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Funeral Wishes</h2>
  ${funeralWishes ? `<p>${funeralWishes}</p>` : `<p>I leave my funeral arrangements to the discretion of my Executors, having regard to any wishes I may have expressed to them during my lifetime.</p>`}
</div>`);
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. STEP Powers</h2>
  <p>My Executors and Trustees shall have the benefit of the standard provisions of the Society of Trust and Estate Practitioners (1st Edition) as amended and updated from time to time, insofar as they are not inconsistent with the provisions of this Will.</p>
</div>`);
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. For the Avoidance of Doubt</h2>
  <p>For the avoidance of doubt, any reference in this Will to a person's children shall include any child of that person whether legitimate, illegitimate or adopted, but shall not include any step-child unless expressly stated.</p>
  <p>Words importing the masculine gender shall include the feminine and vice versa. Words in the singular shall include the plural and vice versa.</p>
</div>`);
  const generalNotesSection = generalNotes ? `
<div class="clause" style="border-top:2px solid #1a3a5c; margin-top:10mm; padding-top:6mm;">
  <h2>Solicitor's Notes</h2>
  <p style="font-style:italic; color:#555;">${generalNotes}</p>
</div>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Last Will &amp; Testament \u2014 ${name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #1a1a1a;
    background: #fff;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 20mm 22mm 20mm 22mm;
    page-break-after: always;
  }
  .cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
    min-height: 297mm;
    padding: 20mm 22mm;
    position: relative;
    /* Double-line border: outer line via box-shadow, inner line via border */
    border: 3px solid #1a1a1a;
    box-shadow: inset 0 0 0 5px #fff, inset 0 0 0 8px #1a1a1a;
  }
  .cover-box {
    border: 1px solid #1a1a1a;
    padding: 12mm 16mm;
    margin-top: 30mm;
    margin-bottom: 0;
    width: 100%;
    max-width: 140mm;
  }
  .cover-title {
    font-size: 16pt;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #1a1a1a;
    margin-bottom: 5mm;
    line-height: 1.3;
  }
  .cover-subtitle {
    font-size: 13pt;
    color: #1a1a1a;
    margin-bottom: 5mm;
  }
  .cover-name {
    font-size: 16pt;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 5mm;
  }
  .cover-ref {
    font-size: 10pt;
    color: #555;
    font-style: italic;
  }
  .cover-company {
    margin-top: auto;
    padding-top: 20mm;
    font-size: 9.5pt;
    color: #333;
    line-height: 1.8;
    text-align: center;
  }
  .cover-logo-img {
    margin-top: 5mm;
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 160px;
  }
  h2 {
    font-size: 13pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 8mm;
    margin-bottom: 3mm;
    color: #1a3a5c;
  }
  h3 {
    font-size: 11.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 5mm;
    margin-bottom: 2mm;
    color: #1a3a5c;
  }
  .clause {
    margin-bottom: 6mm;
  }
  p {
    margin-bottom: 3mm;
    text-align: justify;
  }
  .recital {
    margin-bottom: 8mm;
    font-style: italic;
  }
  .attestation {
    margin-top: 12mm;
  }
  .sig-block {
    margin-top: 8mm;
    border-top: 1px solid #ccc;
    padding-top: 4mm;
  }
  .sig-line {
    margin-top: 10mm;
    border-bottom: 1px solid #333;
    width: 80mm;
    display: inline-block;
  }
  .sig-label {
    font-size: 9pt;
    color: #555;
    margin-top: 1mm;
  }
  .witness-block {
    margin-top: 8mm;
    padding: 4mm;
    border: 1px solid #ccc;
  }
  .witness-title {
    font-weight: 600;
    margin-bottom: 2mm;
  }
  .witness-field {
    margin-top: 5mm;
  }
  .witness-field-line {
    border-bottom: 1px solid #333;
    width: 100%;
    margin-top: 1mm;
    height: 6mm;
  }
  .witness-field-label {
    font-size: 9pt;
    color: #555;
  }
  .page-footer {
    text-align: center;
    font-size: 9pt;
    color: #888;
    margin-top: 10mm;
    border-top: 1px solid #eee;
    padding-top: 3mm;
  }
  @media print {
    /* \u2500\u2500 Page setup \u2500\u2500 */
    @page {
      size: A4;
      margin: 18mm 20mm 18mm 20mm;
    }
    @page :first {
      margin: 0;
    }

    /* \u2500\u2500 Reset screen chrome \u2500\u2500 */
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      width: 100%;
      background: #fff !important;
    }

    /* \u2500\u2500 Page containers \u2500\u2500 */
    .page {
      width: 100% !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      /* Each .page div = one printed page */
      break-after: page;
      page-break-after: always;
    }
    /* Don't force a blank page after the very last div */
    .page:last-child {
      break-after: avoid;
      page-break-after: avoid;
    }

    /* \u2500\u2500 Cover page: fill the first printed page \u2500\u2500 */
    .cover {
      min-height: 0 !important;
      height: 100vh;
      padding: 18mm 20mm !important;
      /* Preserve double-line border in print */
      border: 3pt solid #1a1a1a !important;
      box-shadow: inset 0 0 0 5pt #fff, inset 0 0 0 8pt #1a1a1a !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* \u2500\u2500 Keep headings with their following content \u2500\u2500 */
    h2, h3 {
      break-after: avoid;
      page-break-after: avoid;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Keep clauses together where possible \u2500\u2500 */
    .clause {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Attestation block must never split across pages \u2500\u2500 */
    .attestation {
      break-inside: avoid;
      page-break-inside: avoid;
      break-before: auto;
      page-break-before: auto;
    }

    /* \u2500\u2500 Witness blocks must stay together \u2500\u2500 */
    .witness-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Signature lines \u2500\u2500 */
    .sig-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Orphans / widows \u2500\u2500 */
    p {
      orphans: 3;
      widows: 3;
    }

    /* \u2500\u2500 Footer: keep with preceding content \u2500\u2500 */
    .page-footer {
      break-before: avoid;
      page-break-before: avoid;
    }
  }
</style>
</head>
<body>

<!-- \u2550\u2550 COVER PAGE \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
<div class="page cover">
  <div class="cover-box">
    <div class="cover-title">The Last Will &amp; Testament</div>
    <div class="cover-subtitle">of</div>
    <div class="cover-name">${name}</div>
    ${fileRef ? `<div class="cover-ref">(REFERENCE / ${fileRef})</div>` : ""}
  </div>

  <div class="cover-company">
    Genesis Wills and Estate Planning Ltd<br>
    The Business Village Innovation Way Barnsley<br>
    South Yorkshire S75 1JL<br>
    office@genesisestateplanning.info<br>
    0330 1180937<br>
    https://www.genesisestateplanning.net/
    <img
      src="${LOGO_DATA_URI}"
      alt="Genesis Estate Planning"
      class="cover-logo-img"
    />
  </div>
</div>

<!-- \u2550\u2550 WILL BODY \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
<div class="page">

<p class="recital">
  THIS IS THE LAST WILL AND TESTAMENT of me, <strong>${name}</strong>,
  ${dob !== "_______________" ? `born on <strong>${dob}</strong>,` : ""}
  of <strong>${address}</strong>,
  made this ${today()}.
</p>

<!-- 1. Revocation -->
<div class="clause">
  <h2>1. Revocation</h2>
  <p>I hereby revoke all former Wills and Testamentary dispositions previously made by me and declare this to be my Last Will and Testament.</p>
</div>

<!-- 2. Appointment of Executors -->
<div class="clause">
  <h2>2. Appointment of Executors</h2>
  ${executorClause}
</div>

${hasMinorChildren ? `
<!-- 3. Appointment of Guardians -->
<div class="clause">
  <h2>3. Appointment of Guardians</h2>
  ${guardianClause}
</div>
` : ""}

${clauses.join("\n\n")}

${generalNotesSection}

<!-- \u2550\u2550 ATTESTATION \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
<div class="attestation">
  <h2>The Testimonium and Attestation</h2>
  <p>IN WITNESS whereof I have hereunto set my hand to this my Last Will and Testament on the day and year first above written.</p>

  <div class="sig-block">
    <p><strong>SIGNED</strong> by the above-named Testator <strong>${name}</strong></p>
    <p>as their Last Will in our joint presence and then by each of us in the presence of the Testator and each other:</p>
    <br>
    <div class="sig-line"></div>
    <div class="sig-label">(Signature of Testator \u2014 ${name})</div>
    <br>
    <div class="sig-line" style="width:40mm"></div>
    <div class="sig-label">(Date)</div>
  </div>

  <div style="display:flex; gap:8mm; margin-top:8mm;">
    <div class="witness-block" style="flex:1;">
      <div class="witness-title">Witness 1</div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">(Signature of Witness 1)</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Full Name (print)</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Address</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Occupation</div>
      </div>
    </div>
    <div class="witness-block" style="flex:1;">
      <div class="witness-title">Witness 2</div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">(Signature of Witness 2)</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Full Name (print)</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Address</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Occupation</div>
      </div>
    </div>
  </div>
</div>

<div class="page-footer">
  Genesis Wills and Estate Planning Ltd &bull; ${name} &bull; Last Will &amp; Testament
  ${fileRef ? `&bull; Ref: ${fileRef}` : ""}
</div>

</div>
</body>
</html>`;
}
function buildExecutorClause(primary, substitute, testatorName) {
  if (primary.length === 0) {
    return `<p>I appoint _______________ of _______________ to be the Executor of this my Will.</p>`;
  }
  const primaryText = primary.length === 1 ? `I appoint <strong>${nameAndAddress(primary[0])}</strong> to be the Executor of this my Will.` : `I appoint <strong>${primary.map(nameAndAddress).join("</strong> and <strong>")}</strong> to be the Executors of this my Will.`;
  let substituteText = "";
  if (substitute.length > 0) {
    substituteText = substitute.length === 1 ? ` In the event that ${primary.length === 1 ? "the above Executor is" : "all of the above Executors are"} unable or unwilling to act, I appoint <strong>${nameAndAddress(substitute[0])}</strong> as substitute Executor.` : ` In the event that the above Executor${primary.length > 1 ? "s are" : " is"} unable or unwilling to act, I appoint <strong>${substitute.map(nameAndAddress).join("</strong> and <strong>")}</strong> as substitute Executors.`;
  }
  return `<p>${primaryText}${substituteText}</p>`;
}
function buildGuardianClause(primary, substitute) {
  if (primary.length === 0) {
    return `<p>In the event that any of my children are under the age of 18 years at the date of my death, I appoint my Executor(s) as Guardian(s) of my minor children.</p>`;
  }
  const primaryText = primary.length === 1 ? `In the event that any of my children are under the age of 18 years at the date of my death, I appoint <strong>${nameAndAddress(primary[0])}</strong> to be the Guardian of my minor children.` : `In the event that any of my children are under the age of 18 years at the date of my death, I appoint <strong>${primary.map(nameAndAddress).join("</strong> and <strong>")}</strong> to be the Guardians of my minor children.`;
  let substituteText = "";
  if (substitute.length > 0) {
    substituteText = ` In the event that the above Guardian${substitute.length > 1 ? "s are" : " is"} unable or unwilling to act, I appoint <strong>${substitute.map(nameAndAddress).join("</strong> and <strong>")}</strong> as substitute Guardian${substitute.length > 1 ? "s" : ""}.`;
  }
  return `<p>${primaryText}${substituteText}</p>`;
}
function buildResidueClause(primary, fallback, partner, residueToSpouseFirst, ageCondition, survivorshipDays) {
  const parts = [];
  if (residueToSpouseFirst && partner?.fullName) {
    parts.push(`<p>I give the whole of my Estate to my partner <strong>${partner.fullName}</strong> absolutely, provided they survive me by ${survivorshipDays} days.</p>`);
    parts.push(`<p>In the event that <strong>${partner.fullName}</strong> does not survive me by ${survivorshipDays} days, or in the event that the above gift fails for any reason, I direct that the residue of my Estate shall be held on trust and distributed as follows:</p>`);
  }
  function benPronoun(b) {
    if (b.gender === "male") return { subj: "he", poss: "his" };
    if (b.gender === "female") return { subj: "she", poss: "her" };
    return { subj: "they", poss: "their" };
  }
  if (primary.length === 0) {
    parts.push(`<p>I give the whole of my Estate to such of my children as survive me and attain the age of ${ageCondition} years, and if more than one in equal shares.</p>`);
  } else if (primary.length === 1) {
    const b = primary[0];
    const share = b.shareFraction ? ` (${b.shareFraction})` : "";
    const { subj, poss } = benPronoun(b);
    const bDisplayName = [b.title, b.fullName].filter(Boolean).join(" ") || "_______________";
    parts.push(`<p>I give the whole of my Estate${share} to <strong>${bDisplayName}</strong>${b.relationship ? `, my ${b.relationship},` : ""} absolutely, provided ${subj} survive${subj === "they" ? "" : "s"} me by ${survivorshipDays} days.</p>`);
    if (b.includeIssue) {
      parts.push(`<p>If <strong>${bDisplayName}</strong> does not survive me by ${survivorshipDays} days, ${poss} share shall pass to ${poss} issue in equal shares per stirpes.</p>`);
    }
  } else {
    const shareText = primary.map((b) => {
      const share = b.shareFraction ? ` (${b.shareFraction})` : "";
      const bName = [b.title, b.fullName].filter(Boolean).join(" ") || "_______________";
      return `<strong>${bName}</strong>${b.relationship ? `, my ${b.relationship},` : ""}${share}`;
    }).join("; ");
    parts.push(`<p>I give the residue of my Estate to the following beneficiaries in the shares set out: ${shareText}; provided each survives me by ${survivorshipDays} days.</p>`);
    const withIssue = primary.filter((b) => b.includeIssue);
    if (withIssue.length > 0) {
      parts.push(`<p>If any of the above beneficiaries does not survive me by ${survivorshipDays} days, their share shall pass to their issue in equal shares per stirpes.</p>`);
    }
  }
  if (fallback.length > 0) {
    const fallbackText = fallback.map((b) => {
      const bName = [b.title, b.fullName].filter(Boolean).join(" ") || "_______________";
      return `<strong>${bName}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`;
    }).join(" and ");
    parts.push(`<p>In the event that all of the above gifts fail, I give the residue of my Estate to ${fallbackText} in equal shares absolutely.</p>`);
  } else {
    parts.push(`<p>In the event that all of the above gifts fail, the residue of my Estate shall pass in accordance with the laws of intestacy applicable in England and Wales.</p>`);
  }
  return parts.join("\n  ");
}
function trusteeNames2(trustees) {
  if (!trustees || trustees.length === 0) return "my Executors";
  return trustees.map((t2) => `<strong>${t2.name}</strong>${t2.address ? ` of ${t2.address}` : ""}`).join(" and ");
}
function buildTerminationClause(tc) {
  const triggers = [];
  if ((tc.terminateDeath ?? 1) === 1) triggers.push("upon the death of the Life Tenant");
  if ((tc.terminateRemarriage ?? 1) === 1) triggers.push("upon the Life Tenant remarrying or entering into a new civil partnership");
  if ((tc.terminateCohabitation ?? 1) === 1) triggers.push("upon the Life Tenant ceasing to permanently reside in the Property");
  if (triggers.length === 0) {
    return "The Trust Period shall terminate upon the death of the Life Tenant.";
  }
  if (triggers.length === 1) {
    return `The Trust Period shall terminate ${triggers[0]}.`;
  }
  const joined = triggers.slice(0, -1).join(", or ") + ", or " + triggers[triggers.length - 1];
  return `The Trust Period shall terminate ${joined}, whichever shall first occur.`;
}
function buildTrustClauseHtml(tc, num) {
  const trNames = trusteeNames2(tc.trustees);
  const notes = tc.notes ? `<p>${tc.notes}</p>` : "";
  switch (tc.trustType) {
    case "ppt": {
      const property = tc.propertyAddress || "my principal residence";
      const ltName = tc.lifeTenants && tc.lifeTenants.length > 0 ? tc.lifeTenants.map((lt) => `<strong>${lt.name}</strong>`).join(" and ") : "my surviving spouse or civil partner";
      const remaindermen = tc.beneficiaries && tc.beneficiaries.length > 0 ? tc.beneficiaries.map((b) => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(" and ") : "my Residuary Beneficiaries";
      return `
  <h2>${num}. LIFE INTEREST TRUST COMPONENT</h2>

  <h3>${num}.1 DEFINITIONS</h3>
  <p>"The Property" shall mean my property known as <strong>${property}</strong> or any other property which I may own at the date of my death and use as my principal private residence.</p>
  <p>"The Life Tenant" shall mean ${ltName}.</p>
  <p>"The Remaindermen" shall mean ${remaindermen}.</p>
  <p>"The Trust Fund" shall mean the Property together with any cash or replacement property held under the terms of this Trust.</p>

  <h3>${num}.2 GIFT OF LIFE INTEREST</h3>
  <p>I give my interest in the Property to my Trustees upon trust to permit the Life Tenant to reside personally in the Property for as long as they desire during the Trust Period.</p>

  <h3>${num}.3 CONDITIONS OF OCCUPANCY</h3>
  <p>During the Trust Period, the Life Tenant shall be responsible for:</p>
  <p>(a) Keeping the Property in good repair and decorative condition;</p>
  <p>(b) Keeping the Property fully insured to its full reinstatement value against comprehensive risks to the satisfaction of my Trustees;</p>
  <p>(c) Paying all rates, taxes, utilities, council tax, and other outgoings relating to the Property.</p>

  <h3>${num}.4 TERMINATION OF THE TRUST</h3>
  <p>${buildTerminationClause(tc)}</p>

  <h3>${num}.5 POWER OF SALE AND REINVESTMENT</h3>
  <p>My Trustees shall have the power, with the written consent of the Life Tenant during their lifetime, to sell the Property and apply all or part of the net proceeds toward the purchase of a replacement property (which shall be held on the same trusts as herein declared). Any surplus proceeds not used for a replacement property shall be invested to generate an income, which shall be paid to the Life Tenant for the remainder of the Trust Period.</p>

  <h3>${num}.6 ULTIMATE GIFT (ON TERMINATION)</h3>
  <p>Upon the termination of the Trust Period, my Trustees shall hold the Trust Fund (including the Property or any replacement assets) absolutely for The Remaindermen, and if more than one in equal shares.</p>
  ${notes}`;
    }
    case "discretionary": {
      const benClass = tc.beneficiaries && tc.beneficiaries.length > 0 ? tc.beneficiaries.map((b) => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(", ") : "my children and remoter issue and such other persons as my Trustees shall in their absolute discretion determine";
      return `
  <h2>${num}. Discretionary Trust</h2>
  <p>(a) The Trustees of this Discretionary Trust shall be ${trNames} or such other persons as shall be appointed as trustees hereof from time to time.</p>
  <p>(b) The Beneficiaries of this Discretionary Trust shall be ${benClass}.</p>
  <p>(c) My Trustees shall hold the trust fund upon trust to pay or apply the income and/or capital thereof to or for the benefit of all or any one or more of the Beneficiaries in such shares and proportions and in such manner as my Trustees shall in their absolute discretion think fit.</p>
  <p>(d) My Trustees shall have the widest possible powers of investment as if they were absolute beneficial owners of the trust fund and shall not be restricted to investments authorised by law for trustees.</p>
  <p>(e) This Discretionary Trust shall terminate on the expiry of the period of 125 years from the date of my death (which period shall be the perpetuity period applicable to this trust) and upon such termination the trust fund shall be held for such of the Beneficiaries as are then living in equal shares absolutely.</p>
  ${notes}`;
    }
    case "vulnerable": {
      const vbName = tc.namedBeneficiary || "[Vulnerable Beneficiary Name]";
      const disability = tc.namedBeneficiaryDisability ? `<p>The Vulnerable Beneficiary has the following disability or condition: ${tc.namedBeneficiaryDisability}.</p>` : "";
      const ultBens = tc.beneficiaries && tc.beneficiaries.length > 0 ? tc.beneficiaries.map((b) => `<strong>${b.name}</strong>`).join(" and ") : "my children and remoter issue as shall then be living in equal shares absolutely";
      return `
  <h2>${num}. Vulnerable Person's Trust (Finance Act 2005)</h2>
  <p>I DECLARE that the following provisions shall apply to the Vulnerable Person's Trust created by this my Will for the benefit of <strong>${vbName}</strong> (hereinafter referred to as "the Vulnerable Beneficiary"):</p>
  ${disability}
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) This trust is intended to qualify as a Vulnerable Beneficiary Trust within the meaning of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to qualify as such.</p>
  <p>(c) My Trustees shall hold the trust fund upon trust to apply the income and capital thereof for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees in their absolute discretion think fit having regard to the needs and welfare of the Vulnerable Beneficiary.</p>
  <p>(d) Subject to the life interest of the Vulnerable Beneficiary, the trust fund shall on the death of the Vulnerable Beneficiary be held for ${ultBens}.</p>
  <p>(e) My Trustees shall have power to apply capital for the benefit of the Vulnerable Beneficiary at any time and from time to time as they in their absolute discretion think fit.</p>
  ${notes}`;
    }
    case "nrb": {
      const bens = tc.beneficiaries && tc.beneficiaries.length > 0 ? tc.beneficiaries.map((b) => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(" and ") : "my children and remoter issue in equal shares absolutely";
      return `
  <h2>${num}. Nil-Rate Band Discretionary Trust</h2>
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) I GIVE to my Trustees such sum as equals my available nil-rate band for inheritance tax purposes at the date of my death (the "NRB Sum") to hold upon the trusts hereinafter declared.</p>
  <p>(c) My Trustees shall hold the NRB Sum upon trust for ${bens}.</p>
  <p>(d) My Trustees shall have the widest possible powers of investment and management as if they were absolute beneficial owners of the trust fund.</p>
  <p>(e) This trust shall terminate on the expiry of 125 years from the date of my death and upon such termination the trust fund shall be distributed to such of the Beneficiaries as are then living in equal shares absolutely.</p>
  ${notes}`;
    }
    case "rnrb": {
      const property = tc.propertyAddress || "my principal residence";
      const bens = tc.beneficiaries && tc.beneficiaries.length > 0 ? tc.beneficiaries.map((b) => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(" and ") : "my lineal descendants";
      return `
  <h2>${num}. Residential Nil-Rate Band (RNRB)</h2>
  <p>I direct that my Executors and Trustees shall use their best endeavours to ensure that the Residential Nil-Rate Band (as defined in section 8D of the Inheritance Tax Act 1984) is claimed in respect of my Estate.</p>
  <p>For the purposes of qualifying for the Residential Nil-Rate Band, I give my interest in the property known as <strong>${property}</strong> to ${bens} absolutely, or if that property has been sold prior to my death, to such replacement residential property as I may own at the date of my death.</p>
  <p>My Executors shall take all steps necessary to claim any transferable Residential Nil-Rate Band that may be available from my deceased spouse or civil partner's estate.</p>
  ${notes}`;
    }
    case "bereaved_minor": {
      const bName = tc.namedBeneficiary || "[Beneficiary Name]";
      const age = tc.ageVesting ?? 18;
      return `
  <h2>${num}. Bereaved Minor's Trust (s.71A IHTA 1984)</h2>
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) This trust is intended to qualify as a Bereaved Minor's Trust within the meaning of section 71A of the Inheritance Tax Act 1984.</p>
  <p>(c) My Trustees shall hold the trust fund upon trust to accumulate the income thereof until <strong>${bName}</strong> ("the Beneficiary") attains the age of ${age} years and thereafter to pay the income to the Beneficiary.</p>
  <p>(d) Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.</p>
  <p>(e) If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.</p>
  ${notes}`;
    }
    case "age18to25": {
      const bName = tc.namedBeneficiary || "[Beneficiary Name]";
      const age = tc.ageVesting ?? 25;
      return `
  <h2>${num}. 18-to-25 Trust (s.71D IHTA 1984)</h2>
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) This trust is intended to qualify as an 18-to-25 trust within the meaning of section 71D of the Inheritance Tax Act 1984.</p>
  <p>(c) My Trustees shall hold the trust fund upon trust to accumulate the income thereof until <strong>${bName}</strong> ("the Beneficiary") attains the age of 18 years and thereafter to pay the income to the Beneficiary until the Beneficiary attains the age of ${age} years.</p>
  <p>(d) Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.</p>
  <p>(e) If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.</p>
  ${notes}`;
    }
    case "bpr": {
      const bizName = tc.propertyAddress || "my business interests";
      const bens = tc.beneficiaries && tc.beneficiaries.length > 0 ? tc.beneficiaries.map((b) => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(" and ") : "my children and remoter issue in equal shares absolutely";
      return `
  <h2>${num}. Business Property Relief Trust</h2>
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) I GIVE my business interests known as <strong>${bizName}</strong> to my Trustees to hold upon the trusts hereinafter declared, it being my intention that the Business Assets shall qualify for Business Property Relief pursuant to Chapter I of Part V of the Inheritance Tax Act 1984.</p>
  <p>(c) My Trustees shall hold the Business Assets upon trust for ${bens}.</p>
  <p>(d) My Trustees shall have the widest possible powers to manage, invest, realise, and deal with the Business Assets as if they were absolute beneficial owners thereof.</p>
  <p>(e) My Trustees shall use their best endeavours to ensure that the Business Assets continue to qualify for Business Property Relief and shall not take any action that would jeopardise such qualification without first obtaining appropriate professional advice.</p>
  ${notes}`;
    }
    default:
      return "";
  }
}
function buildGiftsClause(gifts) {
  if (gifts.length === 0) return "";
  const items = gifts.map((g) => {
    const recipient = g.recipientName ? `<strong>${g.recipientName}</strong>${g.recipientAddress ? ` of ${g.recipientAddress}` : ""}` : "_______________";
    const description = g.giftDescription || "_______________";
    if (g.giftType === "monetary") {
      return `<p>I give the sum of ${description} to ${recipient} absolutely, provided they survive me.</p>`;
    }
    return `<p>I give ${description} to ${recipient} absolutely, provided they survive me.</p>`;
  });
  return items.join("\n  ");
}
function buildPetsClause(pets) {
  if (pets.length === 0) return "";
  const items = pets.map((p) => {
    const petDesc = [p.petName, p.petType].filter(Boolean).join(" the ") || "my pet";
    const carer = p.carerName ? `<strong>${p.carerName}</strong>${p.carerAddress ? ` of ${p.carerAddress}` : ""}` : "my Executors";
    const notes = p.careNotes ? ` ${p.careNotes}` : "";
    return `<p>I request that ${carer} take care of ${petDesc} and I ask that my Executors make such reasonable financial provision for their care as they see fit.${notes}</p>`;
  });
  return items.join("\n  ");
}
function buildPropertyClause(properties) {
  if (properties.length === 0) return "";
  const items = properties.map((p) => {
    const addr = p.address || "_______________";
    const ownership = p.ownershipType === "joint_tenants" ? "held as joint tenants" : p.ownershipType === "tenants_in_common" ? "held as tenants in common" : "held in my sole name";
    const mortgage = p.mortgageOutstanding ? ` There is an outstanding mortgage with ${p.mortgageLender || "the mortgage lender"} which my Executors shall discharge from my Estate.` : "";
    const notes = p.propertyNotes ? ` ${p.propertyNotes}` : "";
    return `<p>The property at <strong>${addr}</strong> is ${ownership}.${mortgage}${notes}</p>`;
  });
  const hasTIC = properties.some((p) => p.ownershipType === "tenants_in_common");
  const ticNote = hasTIC ? `<p>Where any property is held as tenants in common, my share in that property shall form part of my Estate and shall pass in accordance with the terms of this Will.</p>` : "";
  return items.join("\n  ") + (ticNote ? "\n  " + ticNote : "");
}
function buildBusinessClause(businesses) {
  if (businesses.length === 0) return "";
  const items = businesses.map((b) => {
    const bizName = b.businessName ? `<strong>${b.businessName}</strong>` : "my business interest";
    const bizType = b.businessType ? ` (${b.businessType})` : "";
    const share = b.sharePercentage ? `, representing approximately ${b.sharePercentage} of the issued share capital,` : "";
    const notes = b.businessNotes ? ` ${b.businessNotes}` : "";
    return `<p>My interest in ${bizName}${bizType}${share} shall form part of my Estate. My Executors shall have full power to deal with, sell, or continue my business interests as they consider appropriate in the best interests of my Estate and beneficiaries.${notes}</p>`;
  });
  return items.join("\n  ") + `
  <p>For the avoidance of doubt, my Executors shall be entitled to claim Business Property Relief where applicable in accordance with the Inheritance Tax Act 1984.</p>`;
}
function buildExclusionsClause(exclusions) {
  const items = exclusions.map((e) => {
    const name = `<strong>${e.fullName}</strong>`;
    const rel = e.relationship ? `, my ${e.relationship},` : "";
    return `<p>I have intentionally made no provision in this my Will for ${name}${rel} and I do not wish for them to inherit any part of my estate, whether under this Will or on an intestacy. I have reached this decision after careful consideration, and it is my express wish that they receive no benefit from my estate.</p>`;
  });
  return items.join("\n  ");
}

// server/willV2Commentary.ts
function generateCommentaryHtml(matter, testatorRole = "testator1") {
  const client = matter.clients.find((c) => c.clientRole === testatorRole);
  const partnerRole = testatorRole === "testator1" ? "testator2" : "testator1";
  const partner = matter.matterType === "mirror" ? matter.clients.find((c) => c.clientRole === partnerRole) : null;
  const name = client?.fullName || "_______________";
  const fileRef = matter.fileReference || "";
  const execRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const primaryExecutors = matter.executors.filter((e) => e.clientRole === execRole && e.executorType === "primary");
  const substituteExecutors = matter.executors.filter((e) => e.clientRole === execRole && e.executorType === "substitute");
  const primaryGuardians = matter.guardians.filter((g) => g.guardianType === "primary");
  const substituteGuardians = matter.guardians.filter((g) => g.guardianType === "substitute");
  const benRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const primaryBeneficiaries = matter.beneficiaries.filter((b) => b.clientRole === benRole && b.beneficiaryType === "primary");
  const fallbackBeneficiaries = matter.beneficiaries.filter((b) => b.clientRole === benRole && b.beneficiaryType === "fallback");
  const wishRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const wishes = matter.wishes.find((w) => w.clientRole === wishRole) || matter.wishes[0];
  const ageCondition = wishes?.ageCondition ?? 18;
  const survivorshipDays = wishes?.survivorshipDays ?? 28;
  const organDonation = !!wishes?.organDonation;
  const funeralWishes = wishes?.funeralWishes || "";
  const residueToSpouseFirst = matter.matterType === "mirror" && (wishes?.residueToSpouseFirst ?? 1) === 1;
  const disasterClauseNotes = wishes?.disasterClauseNotes || "";
  const giftRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const specificGifts = (matter.gifts || []).filter((g) => g.clientRole === giftRole || g.clientRole === "shared");
  const pets = matter.pets || [];
  const properties = matter.properties || [];
  const businesses = matter.businesses || [];
  const trustRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const trustClauses = (matter.trustClauses || []).filter(
    (tc) => (tc.clientRole === trustRole || tc.clientRole === "shared") && tc.enabled
  );
  const executorSummary = buildExecutorSummary(primaryExecutors, substituteExecutors);
  const guardianSummary = buildGuardianSummary(primaryGuardians, substituteGuardians);
  const beneficiarySummary = buildBeneficiarySummary(primaryBeneficiaries, fallbackBeneficiaries, partner, residueToSpouseFirst, ageCondition);
  const giftsSummary = specificGifts.length > 0 ? buildGiftsSummary(specificGifts) : "";
  const petsSummary = pets.length > 0 ? buildPetsSummary(pets) : "";
  const propertySummary = properties.length > 0 ? buildPropertySummary(properties) : "";
  const businessSummary = businesses.length > 0 ? buildBusinessSummary(businesses) : "";
  let clauseNum = 4;
  const clauseMap = {};
  clauseMap["definition"] = clauseNum++;
  if (properties.length > 0) clauseMap["property"] = clauseNum++;
  if (businesses.length > 0) clauseMap["business"] = clauseNum++;
  if (specificGifts.length > 0) clauseMap["gifts"] = clauseNum++;
  if (pets.length > 0) clauseMap["pets"] = clauseNum++;
  const trustClauseNums = [];
  for (const tc of trustClauses) {
    trustClauseNums.push(clauseNum);
    clauseMap[`trust_${tc.trustType}_${trustClauseNums.length}`] = clauseNum++;
  }
  clauseMap["residue"] = clauseNum++;
  clauseMap["conditional"] = clauseNum++;
  clauseMap["powers"] = clauseNum++;
  clauseMap["survivorship"] = clauseNum++;
  clauseMap["disaster"] = clauseNum++;
  clauseMap["organ"] = clauseNum++;
  clauseMap["funeral"] = clauseNum++;
  clauseMap["step"] = clauseNum++;
  clauseMap["avoidance"] = clauseNum++;
  const part2Clauses = [];
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause 1 \u2014 Revocation</div>
    <p>This clause cancels all previous Wills and codicils you may have made. It is essential that a Will contains a revocation clause so that there is no ambiguity about which document represents your current wishes. Only one Will can be valid at any time.</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause 2 \u2014 Appointment of Executors</div>
    <p>This clause formally appoints the person${primaryExecutors.length > 1 ? "s" : ""} who will administer your Estate. ${primaryExecutors.length > 0 ? `You have appointed <strong>${primaryExecutors.map((e) => e.fullName || "_______________").join(" and ")}</strong> as your primary Executor${primaryExecutors.length > 1 ? "s" : ""}.` : ""}${substituteExecutors.length > 0 ? ` Should ${primaryExecutors.length > 1 ? "they be" : "this person be"} unable or unwilling to act, <strong>${substituteExecutors.map((e) => e.fullName || "_______________").join(" and ")}</strong> will step in as substitute Executor${substituteExecutors.length > 1 ? "s" : ""}.` : ""}</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause 3 \u2014 Appointment of Guardians</div>
    <p>${primaryGuardians.length > 0 ? `You have appointed <strong>${primaryGuardians.map((g) => g.fullName || "_______________").join(" and ")}</strong> as Guardian${primaryGuardians.length > 1 ? "s" : ""} for any of your children who are under 18 at the time of your death.` : "This clause provides for the appointment of a Guardian for any minor children. As no specific Guardian has been named, your Executor(s) will be responsible for making appropriate arrangements."}${substituteGuardians.length > 0 ? ` <strong>${substituteGuardians.map((g) => g.fullName || "_______________").join(" and ")}</strong> will act as substitute Guardian${substituteGuardians.length > 1 ? "s" : ""} if the primary appointment cannot take effect.` : ""}</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["definition"]} \u2014 Definition and Administration of your Estate</div>
    <p>This clause defines what is meant by "your Estate" for the purposes of the Will. It includes all assets you own at the date of your death, including property over which you have a general power of appointment. It also confirms that your Executors and Trustees have the widest powers of management and administration permitted by law.</p>
  </div>`);
  if (clauseMap["property"]) {
    part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["property"]} \u2014 Property</div>
    <p>This clause sets out the property interests you hold at the date of this Will. ${properties.some((p) => p.ownershipType === "tenants_in_common") ? "Where property is held as tenants in common, your share forms part of your Estate and passes under this Will. You may wish to consider whether a Deed of Severance is appropriate to convert any joint tenancy into a tenancy in common, which can be important for inheritance tax planning." : "Your property interests will form part of your Estate and will be dealt with by your Executors in accordance with this Will."} If there is an outstanding mortgage, your Executors will need to consider whether this should be repaid from your Estate or whether any mortgage protection policy is in place.</p>
  </div>`);
  }
  if (clauseMap["business"]) {
    part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["business"]} \u2014 Business Interests</div>
    <p>This clause addresses your business interests. Business assets may qualify for Business Property Relief (BPR) for inheritance tax purposes, which can significantly reduce the tax payable on your Estate. Your Executors will have full power to deal with, sell, or continue your business interests as they consider appropriate. It is important that your business partners or co-directors are aware of the provisions of your Will and that any shareholders' agreement or partnership agreement is consistent with your testamentary wishes.</p>
    ${businesses.map((b) => b.businessName ? `<p>Your interest in <strong>${b.businessName}</strong>${b.sharePercentage ? ` (${b.sharePercentage})` : ""} will be administered by your Executors.</p>` : "").join("")}
  </div>`);
  }
  if (clauseMap["gifts"]) {
    part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["gifts"]} \u2014 Specific Gifts</div>
    <p>This clause deals with specific gifts you have chosen to make to named individuals. These gifts are paid out of your Estate before the residue is distributed. If the item or sum no longer forms part of your Estate at the date of your death (for example, if you have sold a specific item), the gift will fail \u2014 this is known as "ademption". It is important to review your specific gifts periodically to ensure they remain appropriate.</p>
    ${specificGifts.map((g) => `<p>You have left ${g.giftDescription || "a gift"} to <strong>${g.recipientName || "_______________"}</strong>.</p>`).join("")}
  </div>`);
  }
  if (clauseMap["pets"]) {
    part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["pets"]} \u2014 Provision for Pets</div>
    <p>This clause records your wishes regarding the care of your pets after your death. Whilst pets cannot legally inherit under English law, this clause requests that a named person takes responsibility for their care and asks your Executors to make reasonable financial provision for that purpose. It is important that you discuss this arrangement with the named carer in advance to ensure they are willing and able to take on this responsibility.</p>
    ${pets.map((p) => `<p>You have requested that <strong>${p.carerName || "your Executors"}</strong> care for ${[p.petName, p.petType].filter(Boolean).join(" the ") || "your pet"}.</p>`).join("")}
  </div>`);
  }
  trustClauses.forEach((tc, i) => {
    const num = trustClauseNums[i];
    part2Clauses.push(buildTrustClauseCommentary(tc, num));
  });
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["residue"]} \u2014 Distribution of the Residue</div>
    <p>This is the most important clause in your Will as it sets out who will receive your Estate. ${residueToSpouseFirst && partner?.fullName ? `Your Estate passes first to your partner <strong>${partner.fullName}</strong>, provided they survive you by ${survivorshipDays} days. ` : ""}${primaryBeneficiaries.length > 0 ? `The residue is then distributed to ${primaryBeneficiaries.map((b) => `<strong>${b.fullName || "_______________"}</strong>${b.relationship ? ` (your ${b.relationship})` : ""}${b.shareFraction ? ` \u2014 ${b.shareFraction}` : ""}`).join(", ")}.` : "Your Estate passes to your children in equal shares."} The term "issue" means children and remoter descendants. If a beneficiary predeceases you, their share passes to their own children in equal shares.</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["conditional"]} \u2014 Conditional Gift at Age ${ageCondition}</div>
    <p>Where a beneficiary is under the age of ${ageCondition} at the time of your death, they will not receive their inheritance outright until they reach that age. In the meantime, your Trustees will hold the funds on trust and may use income and capital for that beneficiary's maintenance, education and general benefit. This is a protective measure to ensure that younger beneficiaries do not receive large sums before they are mature enough to manage them responsibly.</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["powers"]} \u2014 Executor and Trustee Powers</div>
    <p>This clause sets out the specific powers available to your Executors and Trustees to enable them to administer your Estate efficiently. These include the power to sell assets, invest proceeds, apply funds for minor beneficiaries, appropriate assets in satisfaction of legacies, and insure estate property. These powers are in addition to those already conferred by statute.</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["survivorship"]} \u2014 Survivorship</div>
    <p>This clause requires any beneficiary to survive you by ${survivorshipDays} days in order to inherit. This is a standard provision designed to avoid the complications that arise when two people die in close succession \u2014 for example, in an accident. Without this clause, assets could pass rapidly through two Estates, incurring double administration costs and potentially creating inheritance tax complications.</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["disaster"]} \u2014 Disaster Clause</div>
    <p>${disasterClauseNotes ? "This clause sets out specific instructions for the distribution of your Estate in the event of a catastrophic scenario where all primary beneficiaries predecease you." : "This clause provides a safety net in the event that all of your named beneficiaries predecease you or fail to survive you by the required period. In that unlikely scenario, your Estate would pass under the intestacy rules applicable in England and Wales. You may wish to consider naming a charity or other long-stop beneficiary to avoid this outcome."}</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["organ"]} \u2014 Organ Donation</div>
    <p>${organDonation ? "You have included a direction in your Will regarding organ donation. Whilst a Will is not the primary mechanism for registering organ donation wishes (the NHS Organ Donor Register is the most effective route), this clause records your intentions formally." : "No specific direction has been included regarding organ donation. If you wish to donate your organs, we recommend registering on the NHS Organ Donor Register at www.organdonation.nhs.uk."}</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["funeral"]} \u2014 Funeral Wishes</div>
    <p>${funeralWishes ? "You have included specific funeral wishes in your Will. Whilst your Executors are not legally bound to follow these wishes, they will be aware of your preferences and will take them into account when making arrangements." : "No specific funeral wishes have been recorded in your Will. Your Executors will make appropriate arrangements having regard to any wishes you may have expressed to them during your lifetime."} It is worth noting that a Will is often not read until after the funeral has taken place, so it is advisable to communicate your wishes directly to your family and Executors.</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["step"]} \u2014 STEP Powers</div>
    <p>The Society of Trust and Estate Practitioners (STEP) has produced a set of standard provisions that are widely used in professionally drafted Wills. By incorporating these provisions, your Will benefits from a comprehensive set of administrative powers and protections that have been developed and refined over many years by leading practitioners in the field.</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Clause ${clauseMap["avoidance"]} \u2014 For the Avoidance of Doubt</div>
    <p>This clause clarifies certain definitions used in the Will. It confirms that references to "children" include legitimate, illegitimate and adopted children but not stepchildren unless expressly stated. It also confirms that masculine pronouns include feminine and vice versa, and that singular words include the plural. These clarifications help to prevent ambiguity and potential disputes.</p>
  </div>`);
  part2Clauses.push(`<div class="clause-commentary">
    <div class="clause-title">Attestation Clause</div>
    <p>The attestation clause records the formal signing and witnessing of your Will. It is essential that your Will is signed and witnessed correctly \u2014 failure to do so will render the Will invalid. Please refer to the accompanying Signing Guide for full instructions on how to sign your Will correctly.</p>
  </div>`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Will Commentary \u2014 ${name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #1a1a1a;
    background: #fff;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 20mm 22mm 20mm 22mm;
    page-break-after: always;
  }
  .cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 297mm;
  }
  .cover-logo { font-size: 22pt; font-weight: 600; color: #1a3a5c; margin-bottom: 8mm; }
  .cover-title { font-size: 24pt; font-weight: 600; color: #1a3a5c; margin-bottom: 4mm; text-transform: uppercase; letter-spacing: 0.06em; }
  .cover-subtitle { font-size: 14pt; color: #555; margin-bottom: 10mm; }
  .cover-name { font-size: 18pt; font-weight: 600; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 4mm 10mm; margin-bottom: 6mm; }
  .cover-ref { font-size: 10pt; color: #888; }
  .cover-note { margin-top: 16mm; font-size: 10pt; color: #888; font-style: italic; max-width: 120mm; }
  .cover-footer { margin-top: auto; padding-top: 20mm; font-size: 9pt; color: #aaa; }
  h2 { font-size: 14pt; font-weight: 600; color: #1a3a5c; margin-top: 8mm; margin-bottom: 3mm; border-bottom: 1px solid #dde; padding-bottom: 1mm; }
  h3 { font-size: 12pt; font-weight: 600; color: #1a3a5c; margin-top: 5mm; margin-bottom: 2mm; }
  p { margin-bottom: 3mm; text-align: justify; }
  .section { margin-bottom: 8mm; }
  .person-card { background: #f8f9fb; border-left: 3px solid #1a3a5c; padding: 3mm 5mm; margin-bottom: 3mm; }
  .person-role { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.08em; color: #1a3a5c; font-weight: 600; }
  .person-name { font-size: 12pt; font-weight: 600; }
  .person-address { font-size: 10pt; color: #555; }
  .clause-commentary { margin-bottom: 6mm; }
  .clause-title { font-weight: 600; font-size: 12pt; color: #1a3a5c; margin-bottom: 2mm; }
  .page-footer { text-align: center; font-size: 9pt; color: #888; margin-top: 10mm; border-top: 1px solid #eee; padding-top: 3mm; }
  @media print {
    /* \u2500\u2500 Page setup \u2500\u2500 */
    @page {
      size: A4;
      margin: 18mm 20mm 18mm 20mm;
    }
    @page :first {
      margin: 0;
    }

    /* \u2500\u2500 Reset screen chrome \u2500\u2500 */
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      width: 100%;
      background: #fff !important;
    }

    /* \u2500\u2500 Page containers \u2500\u2500 */
    .page {
      width: 100% !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      break-after: page;
      page-break-after: always;
    }
    .page:last-child {
      break-after: avoid;
      page-break-after: avoid;
    }

    /* \u2500\u2500 Cover page \u2500\u2500 */
    .cover {
      min-height: 0 !important;
      height: 100vh;
    }

    /* \u2500\u2500 Keep headings with their following content \u2500\u2500 */
    h2, h3 {
      break-after: avoid;
      page-break-after: avoid;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Keep commentary sections together \u2500\u2500 */
    .section {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Keep clause commentary blocks together \u2500\u2500 */
    .clause-commentary {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Person cards must not split \u2500\u2500 */
    .person-card {
      break-inside: avoid;
      page-break-inside: avoid;
      /* Preserve the coloured left border in print */
      background: #f8f9fb !important;
      border-left: 3px solid #1a3a5c !important;
    }

    /* \u2500\u2500 Orphans / widows \u2500\u2500 */
    p {
      orphans: 3;
      widows: 3;
    }

    /* \u2500\u2500 Footer: keep with preceding content \u2500\u2500 */
    .page-footer {
      break-before: avoid;
      page-break-before: avoid;
    }
  }
</style>
</head>
<body>

<!-- \u2550\u2550 COVER PAGE \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
<div class="page cover">
  <div class="cover-logo">GENESIS WILLS AND ESTATE PLANNING</div>
  <div class="cover-title">Will Commentary</div>
  <div class="cover-subtitle">for</div>
  <div class="cover-name">${name}</div>
  <div class="cover-ref">${fileRef ? `File Reference: ${fileRef}` : ""}</div>
  <div class="cover-note">
    This commentary is provided to help you understand the contents of your Will. It is written in plain English and is not itself a legal document \u2014 it does not require a signature.
  </div>
  <div class="cover-footer">
    Genesis Wills and Estate Planning Ltd &bull; England &amp; Wales
  </div>
</div>

<!-- \u2550\u2550 PART 1: NAMED PEOPLE \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
<div class="page">
  <h2>Part 1 \u2014 The People Named in Your Will</h2>
  <p>This section sets out who you have chosen for each role in your Will, together with a brief explanation of what each role involves.</p>

  <div class="section">
    <h3>Executors</h3>
    <p>Your Executor${primaryExecutors.length > 1 ? "s are" : " is"} the person${primaryExecutors.length > 1 ? "s" : ""} responsible for administering your Estate after your death. This includes gathering your assets, paying any debts and liabilities, and distributing what remains to your beneficiaries in accordance with your Will.</p>
    ${executorSummary}
  </div>

  <div class="section">
    <h3>Guardians</h3>
    <p>A Guardian is the person you have chosen to take parental responsibility for any of your children who are under the age of 18 at the time of your death.</p>
    ${guardianSummary}
  </div>

  ${propertySummary ? `<div class="section">
    <h3>Property</h3>
    ${propertySummary}
  </div>` : ""}

  ${businessSummary ? `<div class="section">
    <h3>Business Interests</h3>
    ${businessSummary}
  </div>` : ""}

  ${giftsSummary ? `<div class="section">
    <h3>Specific Gifts</h3>
    <p>You have chosen to make the following specific gifts from your Estate:</p>
    ${giftsSummary}
  </div>` : ""}

  ${petsSummary ? `<div class="section">
    <h3>Pets</h3>
    ${petsSummary}
  </div>` : ""}

  <div class="section">
    <h3>Beneficiaries of the Residuary Estate</h3>
    <p>Your residuary estate is everything that remains after your debts, funeral expenses, and any specific gifts have been paid.</p>
    ${beneficiarySummary}
  </div>

  <div class="page-footer">
    Will Commentary \u2014 ${name}${fileRef ? ` \u2014 Ref: ${fileRef}` : ""} \u2014 Part 1
  </div>
</div>

<!-- \u2550\u2550 PART 2: CLAUSE-BY-CLAUSE \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
<div class="page">
  <h2>Part 2 \u2014 Explanation of Each Clause</h2>
  <p>The following explains each clause of your Will in plain English. The clause numbers correspond to those in your Will document.</p>

  ${part2Clauses.join("\n\n  ")}

  <div style="margin-top:10mm; padding:4mm 6mm; background:#fff8e7; border:1px solid #e6c84a;">
    <p><strong>Important Reminder:</strong> Your Will only becomes legally valid once it has been correctly signed and witnessed in accordance with the requirements of the Wills Act 1837. Please read the Signing Guide carefully before signing your Will.</p>
  </div>

  <div class="page-footer">
    Will Commentary \u2014 ${name}${fileRef ? ` \u2014 Ref: ${fileRef}` : ""} \u2014 Part 2 &bull; This document does not require a signature.
  </div>
</div>

</body>
</html>`;
}
function buildExecutorSummary(primary, substitute) {
  const cards = primary.map((e, i) => `
    <div class="person-card">
      <div class="person-role">Primary Executor ${primary.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${e.fullName || "_______________"}</div>
      ${e.address ? `<div class="person-address">${e.address}</div>` : ""}
    </div>`).join("");
  const subCards = substitute.map((e, i) => `
    <div class="person-card">
      <div class="person-role">Substitute Executor ${substitute.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${e.fullName || "_______________"}</div>
      ${e.address ? `<div class="person-address">${e.address}</div>` : ""}
    </div>`).join("");
  if (!cards && !subCards) return `<p>No Executors have been specified.</p>`;
  return cards + subCards;
}
function buildGuardianSummary(primary, substitute) {
  if (primary.length === 0) return `<p>No specific Guardians have been named. Your Executors will be responsible for making appropriate arrangements for any minor children.</p>`;
  const cards = primary.map((g, i) => `
    <div class="person-card">
      <div class="person-role">Guardian ${primary.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${g.fullName || "_______________"}</div>
      ${g.address ? `<div class="person-address">${g.address}</div>` : ""}
    </div>`).join("");
  const subCards = substitute.map((g, i) => `
    <div class="person-card">
      <div class="person-role">Substitute Guardian ${substitute.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${g.fullName || "_______________"}</div>
      ${g.address ? `<div class="person-address">${g.address}</div>` : ""}
    </div>`).join("");
  return cards + subCards;
}
function buildBeneficiarySummary(primary, fallback, partner, residueToSpouseFirst, ageCondition) {
  const parts = [];
  if (residueToSpouseFirst && partner?.fullName) {
    parts.push(`
    <div class="person-card">
      <div class="person-role">Primary Beneficiary \u2014 Surviving Partner</div>
      <div class="person-name">${partner.fullName}</div>
      <div class="person-address">Receives the whole Estate if they survive you by the required period.</div>
    </div>`);
  }
  if (primary.length > 0) {
    const label = residueToSpouseFirst ? "Substitute Beneficiar" : "Beneficiar";
    primary.forEach((b, i) => {
      parts.push(`
    <div class="person-card">
      <div class="person-role">${label}${primary.length > 1 ? `y ${i + 1}` : "y"}</div>
      <div class="person-name">${b.fullName || "_______________"}${b.relationship ? ` \u2014 ${b.relationship}` : ""}</div>
      ${b.shareFraction ? `<div class="person-address">Share: ${b.shareFraction}</div>` : ""}
      ${b.includeIssue ? `<div class="person-address">If they predecease you, their share passes to their children (issue) in equal shares.</div>` : ""}
    </div>`);
    });
  }
  if (fallback.length > 0) {
    fallback.forEach((b, i) => {
      parts.push(`
    <div class="person-card">
      <div class="person-role">Fallback Beneficiary ${fallback.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${b.fullName || "_______________"}${b.relationship ? ` \u2014 ${b.relationship}` : ""}</div>
      <div class="person-address">Receives the Estate only if all primary gifts fail.</div>
    </div>`);
    });
  }
  if (parts.length === 0) {
    parts.push(`<p>No beneficiaries have been specified. Your Estate would pass under the intestacy rules.</p>`);
  }
  if (ageCondition > 0) {
    parts.push(`<p style="margin-top:3mm;font-size:10pt;color:#555;">Note: Any beneficiary who has not yet reached the age of ${ageCondition} at the date of your death will not receive their inheritance outright until they attain that age.</p>`);
  }
  return parts.join("\n");
}
function buildGiftsSummary(gifts) {
  return gifts.map((g) => `
    <div class="person-card">
      <div class="person-role">${g.giftType === "monetary" ? "Monetary Gift" : "Specific Gift"}</div>
      <div class="person-name">${g.recipientName || "_______________"}</div>
      <div class="person-address">${g.giftDescription || "_______________"}</div>
      ${g.recipientAddress ? `<div class="person-address">${g.recipientAddress}</div>` : ""}
    </div>`).join("");
}
function buildPetsSummary(pets) {
  return pets.map((p) => `
    <div class="person-card">
      <div class="person-role">Pet \u2014 ${p.petType || "Animal"}</div>
      <div class="person-name">${p.petName || "Unnamed pet"}</div>
      <div class="person-address">Carer: ${p.carerName || "Executors"}</div>
      ${p.careNotes ? `<div class="person-address">${p.careNotes}</div>` : ""}
    </div>`).join("");
}
function buildPropertySummary(properties) {
  const cards = properties.map((p) => {
    const ownershipLabel = p.ownershipType === "joint_tenants" ? "Joint Tenants" : p.ownershipType === "tenants_in_common" ? "Tenants in Common" : "Sole Ownership";
    return `
    <div class="person-card">
      <div class="person-role">Property \u2014 ${ownershipLabel}</div>
      <div class="person-name">${p.address || "_______________"}</div>
      ${p.mortgageOutstanding ? `<div class="person-address">Mortgage outstanding: ${p.mortgageLender || "lender not specified"}</div>` : ""}
      ${p.propertyNotes ? `<div class="person-address">${p.propertyNotes}</div>` : ""}
    </div>`;
  }).join("");
  return `<p>The following property interests have been recorded:</p>${cards}`;
}
function buildBusinessSummary(businesses) {
  const cards = businesses.map((b) => `
    <div class="person-card">
      <div class="person-role">Business Interest${b.businessType ? ` \u2014 ${b.businessType}` : ""}</div>
      <div class="person-name">${b.businessName || "_______________"}</div>
      ${b.sharePercentage ? `<div class="person-address">Share: ${b.sharePercentage}</div>` : ""}
      ${b.businessNotes ? `<div class="person-address">${b.businessNotes}</div>` : ""}
    </div>`).join("");
  return `<p>The following business interests have been recorded:</p>${cards}`;
}
function buildTrustClauseCommentary(tc, num) {
  const TRUST_LABELS = {
    ppt: "Protective Property Trust (Lifetime Interest Trust)",
    discretionary: "Discretionary Trust",
    vulnerable: "Vulnerable Person's Trust (Finance Act 2005)",
    nrb: "Nil-Rate Band Discretionary Trust",
    rnrb: "Residential Nil-Rate Band (RNRB)",
    bereaved_minor: "Bereaved Minor's Trust (s.71A IHTA 1984)",
    age18to25: "18-to-25 Trust (s.71D IHTA 1984)",
    bpr: "Business Property Relief Trust"
  };
  const TRUST_COMMENTARY = {
    ppt: `A Protective Property Trust (also known as a Lifetime Interest Trust or Life Interest Trust) is designed to protect your share of the family home for your chosen remainder beneficiaries whilst providing security of occupation for your surviving spouse or civil partner. When you die, your share of the property is held in trust rather than passing outright to your partner. Your partner has the right to live in the property for the rest of their life (or until a specified event such as remarriage or ceasing to reside there). On the termination of the life interest, your share passes to the remainder beneficiaries you have named. This trust is particularly useful where there are children from a previous relationship, or where there is a concern that the surviving partner might remarry and the property could then pass outside the family.`,
    discretionary: `A Discretionary Trust gives your Trustees the widest possible flexibility in distributing your Estate. Rather than specifying fixed shares for named beneficiaries, the Trustees have full discretion to decide who benefits, when, and in what proportions, from within a defined class of potential beneficiaries. This flexibility can be very valuable \u2014 for example, if a beneficiary's circumstances change (such as bankruptcy, divorce, or disability), the Trustees can adjust distributions accordingly. Discretionary Trusts can also be useful for inheritance tax planning, as assets held in trust do not form part of a beneficiary's estate for IHT purposes. The trust will last for up to 125 years (the perpetuity period).`,
    vulnerable: `A Vulnerable Person's Trust (also known as a Disabled Person's Trust) is specifically designed for a named beneficiary who has a disability or vulnerability within the meaning of the Finance Act 2005. The trust qualifies for special tax treatment, meaning that the income and gains of the trust are taxed as if they belonged to the vulnerable beneficiary personally \u2014 which can result in significant tax savings. The Trustees hold the trust fund for the benefit of the vulnerable beneficiary during their lifetime, applying income and capital as needed for their care and welfare. On the death of the vulnerable beneficiary, the remaining trust fund passes to the ultimate beneficiaries you have named.`,
    nrb: `A Nil-Rate Band Discretionary Trust directs a sum equal to your available nil-rate band for inheritance tax (currently \xA3325,000, though this may change) into a discretionary trust rather than passing it directly to your surviving spouse or civil partner. This can preserve the nil-rate band and prevent it from being "wasted" on a straightforward gift to a surviving spouse (who would inherit free of IHT in any event). The trust fund is held for a class of discretionary beneficiaries and can be used flexibly. This type of trust is less commonly used since the introduction of the transferable nil-rate band in 2007, but may still be appropriate in certain circumstances \u2014 your adviser will have discussed this with you.`,
    rnrb: `The Residential Nil-Rate Band (RNRB) is an additional inheritance tax allowance (currently up to \xA3175,000 per person) available where a residence is passed to direct descendants on death. This clause directs your Executors to claim the RNRB and, where applicable, any transferable RNRB from a deceased spouse or civil partner's estate. It also directs your interest in the specified residential property to your lineal descendants to ensure the relief is available. The RNRB is subject to tapering for estates over \xA32 million and is only available where the property passes to a direct descendant (children, grandchildren, etc.).`,
    bereaved_minor: `A Bereaved Minor's Trust is a statutory trust under section 71A of the Inheritance Tax Act 1984 designed for a child who has lost a parent. The trust qualifies for IHT exemption \u2014 no IHT entry charge, no periodic charges, and no exit charges \u2014 provided the beneficiary becomes absolutely entitled to the trust fund at age 18. The Trustees accumulate income until the beneficiary reaches 18, then pay income to the beneficiary until they become absolutely entitled. If the beneficiary dies before reaching 18, the trust fund falls back into the residuary estate.${tc.namedBeneficiary ? ` This trust has been created for the benefit of <strong>${tc.namedBeneficiary}</strong>.` : ""}`,
    age18to25: `An 18-to-25 Trust is a statutory trust under section 71D of the Inheritance Tax Act 1984 for bereaved young people who will become absolutely entitled to the trust fund between the ages of 18 and 25. It qualifies for partial IHT relief \u2014 no entry charge and no periodic charges, but exit charges may apply between ages 18 and the vesting age. The Trustees accumulate income until the beneficiary reaches 18, then pay income until the vesting age${tc.ageVesting ? ` (${tc.ageVesting} in this case)` : ""}, at which point the beneficiary becomes absolutely entitled. This trust is useful where you wish to delay full inheritance beyond age 18 whilst still benefiting from IHT relief.${tc.namedBeneficiary ? ` This trust has been created for the benefit of <strong>${tc.namedBeneficiary}</strong>.` : ""}`,
    bpr: `A Business Property Relief (BPR) Trust is designed to preserve Business Property Relief by directing qualifying business assets into a discretionary trust rather than allowing them to pass as an outright gift to a surviving spouse. If qualifying business assets pass directly to a surviving spouse, the BPR is effectively "wasted" \u2014 the spouse inherits free of IHT in any event, and the BPR cannot be transferred. By directing the assets into a BPR Trust, the relief is used on the first death, and the trust fund can benefit the wider family. The Trustees must use their best endeavours to ensure the assets continue to qualify for BPR.${tc.propertyAddress ? ` This trust relates to the business interests known as <strong>${tc.propertyAddress}</strong>.` : ""}`
  };
  const label = TRUST_LABELS[tc.trustType] || "Trust Clause";
  const commentary = TRUST_COMMENTARY[tc.trustType] || "This clause creates a trust as part of your estate planning arrangements. Your adviser will have explained the specific purpose and effect of this trust.";
  return `<div class="clause-commentary">
    <div class="clause-title">Clause ${num} \u2014 ${label}</div>
    <p>${commentary}</p>
  </div>`;
}

// server/willV2SigningGuide.ts
function generateSigningGuideHtml(matter, testatorRole = "testator1") {
  const client = matter.clients.find((c) => c.clientRole === testatorRole);
  const name = client?.fullName || "_______________";
  const fileRef = matter.fileReference || "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Will Signing Guide \u2014 ${name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 11.5pt;
    line-height: 1.65;
    color: #1a1a1a;
    background: #fff;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 14mm 16mm 14mm 16mm;
    display: flex;
    flex-direction: column;
  }
  .header {
    text-align: center;
    margin-bottom: 8mm;
    border-bottom: 2px solid #1a3a5c;
    padding-bottom: 4mm;
  }
  .header-logo { font-size: 14pt; font-weight: 600; color: #1a3a5c; }
  .header-title { font-size: 11pt; color: #555; margin-top: 1mm; }
  .header-name { font-size: 12pt; font-weight: 600; color: #1a1a1a; margin-top: 1mm; }
  .two-col {
    display: flex;
    gap: 8mm;
    flex: 1;
  }
  .col-left { flex: 1; }
  .col-right { flex: 1; }
  h2 {
    font-size: 13pt;
    font-weight: 600;
    color: #1a3a5c;
    margin-bottom: 4mm;
    line-height: 1.3;
  }
  .intro {
    font-weight: 600;
    margin-bottom: 4mm;
  }
  .sign-now {
    color: #c0392b;
    font-weight: 600;
  }
  ul {
    list-style: disc;
    padding-left: 5mm;
    margin-bottom: 4mm;
  }
  li {
    margin-bottom: 2mm;
  }
  .example-box {
    border: 1px solid #ccc;
    padding: 4mm;
    background: #fafafa;
  }
  .example-title {
    font-size: 11pt;
    font-weight: 600;
    text-align: center;
    margin-bottom: 3mm;
    color: #1a3a5c;
  }
  .example-subtitle {
    font-size: 9pt;
    text-align: center;
    color: #555;
    margin-bottom: 4mm;
  }
  .sig-area {
    margin-bottom: 4mm;
  }
  .sig-line {
    border-bottom: 1px solid #333;
    width: 100%;
    height: 7mm;
    margin-top: 1mm;
    margin-bottom: 0.5mm;
  }
  .sig-label {
    font-size: 8pt;
    color: #666;
    font-style: italic;
  }
  .witness-block {
    border: 1px solid #ccc;
    padding: 2mm 3mm;
    margin-top: 3mm;
  }
  .witness-title { font-weight: 600; font-size: 10pt; margin-bottom: 2mm; }
  .witness-field { margin-top: 2mm; }
  .witness-field-line { border-bottom: 1px solid #333; width: 100%; height: 5mm; margin-top: 0.5mm; }
  .witness-field-label { font-size: 8pt; color: #666; font-style: italic; }
  .footer {
    text-align: center;
    margin-top: 6mm;
    padding-top: 3mm;
    border-top: 2px solid #c0392b;
    font-size: 13pt;
    font-weight: 600;
    color: #c0392b;
    letter-spacing: 0.03em;
  }
  @media print {
    /* \u2500\u2500 Page setup \u2500\u2500 */
    @page {
      size: A4;
      margin: 14mm 16mm 14mm 16mm;
    }

    /* \u2500\u2500 Reset screen chrome \u2500\u2500 */
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      width: 100%;
      background: #fff !important;
    }

    /* \u2500\u2500 Page container: fits on one A4 sheet \u2500\u2500 */
    .page {
      width: 100% !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      /* Signing guide is a single page \u2014 no forced breaks */
      break-after: avoid;
      page-break-after: avoid;
      /* Use flex column so two-col fills the page height */
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    /* \u2500\u2500 Two-column layout fills remaining height \u2500\u2500 */
    .two-col {
      flex: 1;
    }

    /* \u2500\u2500 Keep each column's content together \u2500\u2500 */
    .col-left, .col-right {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Keep headings with their following content \u2500\u2500 */
    h2 {
      break-after: avoid;
      page-break-after: avoid;
    }

    /* \u2500\u2500 Keep example box together \u2500\u2500 */
    .example-box {
      break-inside: avoid;
      page-break-inside: avoid;
      background: #fafafa !important;
    }

    /* \u2500\u2500 Keep witness blocks together \u2500\u2500 */
    .witness-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Keep signature areas together \u2500\u2500 */
    .sig-area {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* \u2500\u2500 Preserve the red footer colour \u2500\u2500 */
    .footer {
      border-top: 2px solid #c0392b !important;
      color: #c0392b !important;
      break-before: avoid;
      page-break-before: avoid;
    }

    /* \u2500\u2500 Orphans / widows \u2500\u2500 */
    p, li {
      orphans: 3;
      widows: 3;
    }
  }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="header-logo">GENESIS ESTATE PLANNING</div>
    <div class="header-title">Will Signing Guide${fileRef ? ` \u2014 Ref: ${fileRef}` : ""}</div>
    <div class="header-name">${name}</div>
  </div>

  <div class="two-col">

    <!-- \u2550\u2550 LEFT: Instructions \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
    <div class="col-left">
      <h2>Important notes on signing your Will</h2>

      <p class="intro">
        A Will becomes legally valid and binding as soon as it is signed by the Testator and observed by two Witnesses together, who will sign to confirm this fact.
      </p>

      <p>It is important that you <span class="sign-now">SIGN AND DATE</span> your Will in front of two Witnesses as soon as possible, <strong>BUT PLEASE READ THE REST OF THIS PAGE FIRST.</strong></p>

      <ul>
        <li>The signing of your Will involves <strong>THREE</strong> people \u2014 you and <strong>TWO</strong> Witnesses.</li>
        <li>All <strong>THREE</strong> must be over <strong>18</strong> years old.</li>
        <li>The <strong>WITNESSES</strong> should <strong>NOT</strong> be beneficiaries, spouses of beneficiaries, or members of your own family \u2014 even if named as a reserve beneficiary. Signing as a Witness means they will lose their inheritance.</li>
        <li>Make sure that the Witnesses are as <strong>independent</strong> as possible. Ideal Witnesses could be neighbours.</li>
        <li>All THREE people must be present together at the same time when the Will is signed.</li>
        <li>Ask your two <strong>WITNESSES</strong> to add their <strong>"usual" signatures</strong> where required.</li>
        <li>They should also print their <strong>names, addresses and occupations</strong> clearly for identification purposes.</li>
        <li>Do <strong>NOT</strong> make any alterations to the Will after it has been signed \u2014 this could invalidate it.</li>
      </ul>
    </div>

    <!-- \u2550\u2550 RIGHT: Example attestation \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
    <div class="col-right">
      <h2>An Example of how to sign your Will</h2>

      <div class="example-box">
        <div class="example-title">The Testimonium and Attestation</div>
        <div class="example-subtitle">SIGNED by <strong>${name}</strong></div>

        <div class="sig-area">
          <div class="sig-line"></div>
          <div class="sig-label">(Signature of Testator \u2014 ${name})</div>
        </div>
        <div class="sig-area" style="width:50%">
          <div class="sig-line"></div>
          <div class="sig-label">(Date)</div>
        </div>

        <p style="font-size:9pt; margin:3mm 0; font-style:italic;">
          SIGNED first by the Testator in our joint presence and then by each of us in the presence of the Testator and each other:
        </p>

        <div class="witness-block">
          <div class="witness-title">Witness 1</div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">(Signature of Witness 1)</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Full Name (Independent Witness 1 to print)</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Full Address of Witness 1</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Occupation of Witness 1</div>
          </div>
        </div>

        <div class="witness-block">
          <div class="witness-title">Witness 2</div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">(Signature of Witness 2)</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Full Name (Independent Witness 2 to print)</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Full Address of Witness 2</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Occupation of Witness 2</div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="footer">Don't Delay \u2014 Sign your Will Today!</div>

</div>
</body>
</html>`;
}

// server/willV2LetterOfWishes.ts
function generateLetterOfWishesHtml(matter, clientRole) {
  const client = (matter.clients || []).find((c) => c.clientRole === clientRole);
  const name = client?.fullName || "Unknown";
  const fileRef = matter.fileRef || matter.reference || "";
  const low = (matter.lettersOfWishes || []).find((l) => l.clientRole === clientRole);
  const content = low?.content || "";
  const willDateRaw = matter.willDate || matter.createdAt;
  let willDate = "";
  if (willDateRaw) {
    try {
      const d3 = new Date(typeof willDateRaw === "number" ? willDateRaw : willDateRaw);
      willDate = d3.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      willDate = "";
    }
  }
  const willDateText = willDate ? willDate : "[Date of Will]";
  const paragraphs = content.split(/\n\n+/).map((para) => para.trim()).filter((para) => para.length > 0).map((para) => {
    const lines = para.split(/\n/).map((l) => escapeHtml(l)).join("<br>");
    return `<p>${lines}</p>`;
  }).join("\n    ");
  const bodyContent = paragraphs || `<p class="empty-notice">No wishes have been recorded for this Letter of Wishes.</p>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Letter of Wishes \u2014 ${escapeHtml(name)}</title>
<style>
  /* \u2500\u2500 Base \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a1a1a;
    background: #fff;
  }

  /* \u2500\u2500 Page layout \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .page {
    max-width: 170mm;
    margin: 0 auto;
    padding: 20mm 0;
    min-height: 100vh;
  }

  /* \u2500\u2500 Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .doc-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 2px solid #1a3a5c;
    padding-bottom: 6mm;
    margin-bottom: 10mm;
  }

  .doc-header-brand {
    font-family: "Arial", sans-serif;
    font-size: 13pt;
    font-weight: 700;
    color: #1a3a5c;
    letter-spacing: 0.02em;
    line-height: 1.3;
  }

  .doc-header-sub {
    font-family: "Arial", sans-serif;
    font-size: 8.5pt;
    color: #666;
    margin-top: 2px;
  }

  .doc-header-ref {
    font-family: "Arial", sans-serif;
    font-size: 8.5pt;
    color: #888;
    text-align: right;
    line-height: 1.5;
  }

  /* \u2500\u2500 Document title \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .doc-title {
    font-family: "Arial", sans-serif;
    font-size: 17pt;
    font-weight: 700;
    color: #1a3a5c;
    text-align: center;
    margin-bottom: 2mm;
  }

  .doc-subtitle {
    font-family: "Arial", sans-serif;
    font-size: 11pt;
    color: #555;
    text-align: center;
    margin-bottom: 8mm;
  }

  .doc-name {
    font-family: "Arial", sans-serif;
    font-size: 13pt;
    font-weight: 600;
    color: #1a3a5c;
    text-align: center;
    margin-bottom: 10mm;
  }

  /* \u2500\u2500 Intro box \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .intro-box {
    border-left: 4px solid #1a3a5c;
    background: #f5f8fc;
    padding: 5mm 6mm;
    margin-bottom: 10mm;
    font-size: 10.5pt;
    color: #333;
    font-style: italic;
    line-height: 1.75;
  }

  /* \u2500\u2500 Body content \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .wishes-body p {
    margin-bottom: 5mm;
    text-align: justify;
  }

  .wishes-body .empty-notice {
    color: #999;
    font-style: italic;
  }

  /* \u2500\u2500 Signature block \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .sig-block {
    margin-top: 16mm;
    border-top: 1px solid #ccc;
    padding-top: 6mm;
  }

  .sig-block p {
    font-size: 10pt;
    color: #555;
    margin-bottom: 3mm;
  }

  .sig-line {
    display: flex;
    gap: 20mm;
    margin-top: 8mm;
  }

  .sig-field {
    flex: 1;
  }

  .sig-field-label {
    font-size: 9pt;
    color: #888;
    margin-bottom: 8mm;
  }

  .sig-field-line {
    border-bottom: 1px solid #333;
    height: 8mm;
  }

  /* \u2500\u2500 Footer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .doc-footer {
    margin-top: 12mm;
    padding-top: 4mm;
    border-top: 1px solid #e0e0e0;
    font-family: "Arial", sans-serif;
    font-size: 8.5pt;
    color: #aaa;
    text-align: center;
    line-height: 1.5;
  }

  /* \u2500\u2500 Print \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  @page {
    size: A4 portrait;
    margin: 20mm 20mm 18mm 20mm;
  }

  @page :first {
    margin-top: 15mm;
  }

  @media print {
    html, body { background: #fff !important; }
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;

    .page {
      max-width: 100%;
      padding: 0;
      min-height: unset;
    }

    .doc-header { break-after: avoid; }
    .intro-box { break-inside: avoid; }
    .sig-block { break-inside: avoid; break-before: avoid; }
    .doc-footer { break-before: avoid; }

    .wishes-body p {
      orphans: 3;
      widows: 3;
    }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="doc-header">
    <div>
      <div class="doc-header-brand">GENESIS WILLS AND ESTATE PLANNING</div>
      <div class="doc-header-sub">England &amp; Wales</div>
    </div>
    <div class="doc-header-ref">
      ${fileRef ? `File Ref: ${escapeHtml(fileRef)}<br>` : ""}
      Letter of Wishes
    </div>
  </div>

  <!-- Title -->
  <div class="doc-title">Letter of Wishes</div>
  <div class="doc-subtitle">prepared by</div>
  <div class="doc-name">${escapeHtml(name)}</div>

  <!-- Introduction -->
  <div class="intro-box">
    This Letter of Wishes is written to accompany my Will dated ${escapeHtml(willDateText)}, and it is intended to provide
    guidance to my Trustees and Executors regarding the administration of my estate. While this document is not
    legally binding, I trust that it will be treated with serious consideration and will serve to clarify my
    intentions for the distribution and management of my assets. The requests and suggestions outlined below are
    made with the aim of ensuring that my wishes are respected and that my family and beneficiaries are provided
    for in accordance with my personal values and long-term objectives.
  </div>

  <!-- Wishes body -->
  <div class="wishes-body">
    ${bodyContent}
  </div>

  <!-- Signature block -->
  <div class="sig-block">
    <p>Signed by the above-named as their Letter of Wishes:</p>
    <div class="sig-line">
      <div class="sig-field">
        <div class="sig-field-line"></div>
        <div class="sig-field-label">Signature of ${escapeHtml(name)}</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line"></div>
        <div class="sig-field-label">Date</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    Genesis Wills and Estate Planning Ltd &bull; This Letter of Wishes is not a legally binding document.
    ${fileRef ? `&bull; File Ref: ${escapeHtml(fileRef)}` : ""}
  </div>

</div>
</body>
</html>`;
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// server/willV2Testimonium.ts
function generateTestimoniumHtml(matter, testatorRole = "testator1") {
  const client = matter.clients.find((c) => c.clientRole === testatorRole);
  const name = client?.fullName || "_______________";
  const fileRef = matter.fileReference || "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Testimonium &amp; Attestation \u2014 ${name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
    background: #fff;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 18mm 20mm 18mm 20mm;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* \u2500\u2500 Header \u2500\u2500 */
  .header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10mm;
  }
  .company-block {
    text-align: right;
    font-size: 10pt;
    line-height: 1.5;
  }
  .company-name {
    font-weight: bold;
    font-size: 11pt;
  }
  .logo-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 2.5px solid #1a1a1a;
    border-radius: 50%;
    font-weight: bold;
    font-size: 12pt;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  /* \u2500\u2500 Title \u2500\u2500 */
  .doc-title {
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 5mm;
  }

  /* \u2500\u2500 Body text \u2500\u2500 */
  .intro-para {
    margin-bottom: 6mm;
    line-height: 1.7;
  }
  .signed-line {
    margin-bottom: 8mm;
  }

  /* \u2500\u2500 Witness sections \u2500\u2500 */
  .witness-heading {
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 3mm;
    margin-top: 2mm;
  }
  .field-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 3.5mm;
    gap: 4px;
  }
  .field-label {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 11pt;
  }
  .field-line {
    flex: 1;
    border-bottom: 1px solid #1a1a1a;
    min-width: 60px;
    height: 1.2em;
  }
  .field-row-two {
    display: flex;
    gap: 8mm;
    margin-bottom: 3.5mm;
  }
  .field-row-two .field-row {
    flex: 1;
    margin-bottom: 0;
  }
  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 6mm;
    margin-bottom: 5mm;
    font-size: 11pt;
  }
  .checkbox-row .field-label {
    margin-right: 4mm;
  }
  .cb-option {
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .cb-box {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1px solid #1a1a1a;
    margin-right: 3px;
    vertical-align: middle;
  }

  .divider {
    border: none;
    border-top: 1px solid #ccc;
    margin: 5mm 0;
  }

  /* \u2500\u2500 Please Return footer \u2500\u2500 */
  .please-return {
    text-align: center;
    font-weight: bold;
    font-size: 12pt;
    margin-top: auto;
    padding-top: 8mm;
  }

  /* \u2500\u2500 Bottom footer \u2500\u2500 */
  .page-footer {
    text-align: center;
    font-size: 8.5pt;
    color: #555;
    margin-top: 6mm;
    border-top: 1px solid #ccc;
    padding-top: 3mm;
  }
  .page-footer a { color: #555; }

  @media print {
    body { background: #fff; }
    .page { margin: 0; padding: 14mm 16mm; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="company-block">
      <div><div class="logo-circle">GW</div></div>
      <div class="company-name">Genesis Wills and Estate Planning Ltd</div>
      <div>The Business Village, Innovation Way</div>
      <div>Barnsley, South Yorkshire S75 1JL</div>
      <div>office@genesisestateplanning.info</div>
      <div>0330 1180937</div>
      <div>https://www.genesisestateplanning.net/</div>
    </div>
  </div>

  <!-- Title -->
  <div class="doc-title">RE: TESTIMONIUM &amp; ATTESTATION${fileRef ? ` &nbsp;&nbsp; Ref: ${fileRef}` : ""}</div>

  <!-- Intro paragraph -->
  <p class="intro-para">
    I <strong>${name}</strong> confirm I have signed and have had my Will witnessed today by the two
    witnesses together and named below on: (date) &nbsp;<span style="display:inline-block;width:36mm;border-bottom:1px solid #1a1a1a;">&nbsp;</span>
  </p>

  <!-- Signed line -->
  <div class="signed-line">
    (Signed) &nbsp;<span style="display:inline-block;width:52mm;border-bottom:1px solid #1a1a1a;">&nbsp;</span>
  </div>

  <!-- Witness 1 -->
  <div class="witness-heading">Witness 1:</div>

  <div class="field-row">
    <span class="field-label">Full Name of 1st Witness:</span>
    <span class="field-line"></span>
  </div>
  <div class="field-row">
    <span class="field-label">Address of 1st Witness:</span>
    <span class="field-line"></span>
  </div>
  <div class="field-row-two">
    <div class="field-row">
      <span class="field-label">Phone:</span>
      <span class="field-line"></span>
    </div>
    <div class="field-row">
      <span class="field-label">Mobile:</span>
      <span class="field-line"></span>
    </div>
  </div>
  <div class="field-row-two">
    <div class="field-row">
      <span class="field-label">Occupation:</span>
      <span class="field-line"></span>
    </div>
    <div class="field-row">
      <span class="field-label">Email:</span>
      <span class="field-line"></span>
    </div>
  </div>
  <div class="checkbox-row">
    <span class="field-label">Contact me about making a Will</span>
    <span class="cb-option"><span class="cb-box"></span> Yes</span>
    <span class="cb-option"><span class="cb-box"></span> No</span>
  </div>

  <hr class="divider" />

  <!-- Witness 2 -->
  <div class="witness-heading">Witness 2:</div>

  <div class="field-row">
    <span class="field-label">Full Name of 2nd Witness:</span>
    <span class="field-line"></span>
  </div>
  <div class="field-row">
    <span class="field-label">Address of 2nd Witness:</span>
    <span class="field-line"></span>
  </div>
  <div class="field-row-two">
    <div class="field-row">
      <span class="field-label">Phone:</span>
      <span class="field-line"></span>
    </div>
    <div class="field-row">
      <span class="field-label">Mobile:</span>
      <span class="field-line"></span>
    </div>
  </div>
  <div class="field-row-two">
    <div class="field-row">
      <span class="field-label">Occupation:</span>
      <span class="field-line"></span>
    </div>
    <div class="field-row">
      <span class="field-label">Email:</span>
      <span class="field-line"></span>
    </div>
  </div>
  <div class="checkbox-row">
    <span class="field-label">Contact me about making a Will</span>
    <span class="cb-option"><span class="cb-box"></span> Yes</span>
    <span class="cb-option"><span class="cb-box"></span> No</span>
  </div>

  <!-- Please Return -->
  <div class="please-return">Please Return</div>

  <!-- Page footer -->
  <div class="page-footer">
    Genesis Wills and Estate Planning Ltd, The Business Village, Innovation Way, Barnsley, South Yorkshire S75 1JL &nbsp;|&nbsp; 0330 1180937
  </div>

</div>
</body>
</html>`;
}

// server/_core/index.ts
init_mattersDb();

// server/htmlToPdf.ts
import puppeteer from "puppeteer-core";
import { existsSync as existsSync2 } from "fs";
async function getExecutablePath() {
  try {
    const chromium = await import("@sparticuz/chromium");
    const path3 = await chromium.default.executablePath();
    if (path3 && existsSync2(path3)) {
      return path3;
    }
  } catch {
  }
  const candidates = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable"
  ];
  for (const p of candidates) {
    if (existsSync2(p)) return p;
  }
  throw new Error(
    "No Chromium binary found. Install @sparticuz/chromium or ensure a system Chromium is available."
  );
}
async function getLaunchArgs() {
  try {
    const chromium = await import("@sparticuz/chromium");
    return chromium.default.args;
  } catch {
    return [];
  }
}
async function htmlToPdf(html) {
  const executablePath = await getExecutablePath();
  const extraArgs = await getLaunchArgs();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      ...extraArgs,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none"
    ]
  });
  try {
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 6e4 });
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" }
      });
      return Buffer.from(pdf);
    } finally {
      await page.close().catch(() => {
      });
    }
  } finally {
    await browser.close().catch(() => {
    });
  }
}

// server/welcomePackGenerator.ts
function fmt(v) {
  if (v === null || v === void 0 || v === "") return "";
  return String(v);
}
function fmtDate(v) {
  if (!v) return "";
  try {
    const d3 = new Date(v);
    if (isNaN(d3.getTime())) return String(v);
    return d3.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return String(v);
  }
}
function fmtDateShort(v) {
  if (!v) return "";
  try {
    const d3 = new Date(v);
    if (isNaN(d3.getTime())) return String(v);
    return d3.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return String(v);
  }
}
function fullName3(prefix, first, middle, last) {
  return [prefix, first, middle, last].filter(Boolean).join(" ");
}
function personName(p) {
  if (!p) return "";
  return [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ");
}
function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
function willTypeLabel(wt) {
  const map = {
    "Single Will": "Single Will",
    "Mirror Will": "Mirror Wills",
    "Mirror Wills": "Mirror Wills",
    "Joint Will": "Joint Will",
    "single": "Single Will",
    "mirror": "Mirror Wills"
  };
  return map[wt] || wt || "Will";
}
function generateWelcomePackHtml(record) {
  const today2 = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isMirror = (record.willType || "").toLowerCase().includes("mirror");
  const c1Name = fullName3(record.client1Prefix, record.client1FirstName, record.client1MiddleName, record.client1LastName);
  const c2Name = isMirror ? fullName3(record.client2Prefix, record.client2FirstName, record.client2MiddleName, record.client2LastName) : "";
  const salutation = isMirror && c2Name ? `Dear ${record.client1FirstName || "Client"} & ${record.client2FirstName || "Client"},` : `Dear ${record.client1FirstName || "Client"},`;
  const addressLines = [
    c1Name,
    isMirror && c2Name ? c2Name : null,
    record.client1AddressLine1,
    record.client1City,
    record.client1Postcode
  ].filter(Boolean);
  const consultantName = fmt(record.consultantName) || "Your Consultant";
  const consultantEmail = fmt(record.consultantEmail);
  const consultantPhone = fmt(record.consultantPhone);
  const coordinatorName = fmt(record.caseCoordinatorName) || "Case Coordinator";
  const coordinatorEmail = fmt(record.caseCoordinatorEmail);
  const coordinatorPhone = fmt(record.caseCoordinatorPhone);
  const c1Under18 = Array.isArray(record.client1ChildrenUnder18) ? record.client1ChildrenUnder18 : [];
  const c1Over18 = Array.isArray(record.client1ChildrenOver18) ? record.client1ChildrenOver18 : [];
  const c2Under18 = Array.isArray(record.client2ChildrenUnder18) ? record.client2ChildrenUnder18 : [];
  const c2Over18 = Array.isArray(record.client2ChildrenOver18) ? record.client2ChildrenOver18 : [];
  const allChildren = [...c1Under18, ...c1Over18, ...isMirror ? [...c2Under18, ...c2Over18] : []];
  const seenChildren = /* @__PURE__ */ new Set();
  const uniqueChildren = allChildren.filter((c) => {
    const key = personName(c);
    if (!key || seenChildren.has(key)) return false;
    seenChildren.add(key);
    return true;
  });
  const c1Execs = Array.isArray(record.client1Executors) ? record.client1Executors : Array.isArray(record.executors) ? record.executors : [];
  const c1ResExecs = Array.isArray(record.client1ReservedExecutors) ? record.client1ReservedExecutors : Array.isArray(record.reservedExecutors) ? record.reservedExecutors : [];
  const c2Execs = Array.isArray(record.client2Executors) ? record.client2Executors : [];
  const c2ResExecs = Array.isArray(record.client2ReservedExecutors) ? record.client2ReservedExecutors : [];
  const c1Guards = Array.isArray(record.client1Guardians) ? record.client1Guardians : Array.isArray(record.guardians) ? record.guardians : [];
  const c1ResGuards = Array.isArray(record.client1ReservedGuardians) ? record.client1ReservedGuardians : Array.isArray(record.reservedGuardians) ? record.reservedGuardians : [];
  const c1Bens = Array.isArray(record.client1Beneficiaries) ? record.client1Beneficiaries : Array.isArray(record.beneficiaries) ? record.beneficiaries : [];
  const c2Bens = Array.isArray(record.client2Beneficiaries) ? record.client2Beneficiaries : [];
  const c1Gifts = Array.isArray(record.client1SpecificGifts) ? record.client1SpecificGifts : Array.isArray(record.specificGifts) ? record.specificGifts : [];
  const c2Gifts = Array.isArray(record.client2SpecificGifts) ? record.client2SpecificGifts : [];
  const hasGifts = c1Gifts.length > 0 || c2Gifts.length > 0;
  const propOwned = fmt(record.propertyOwned);
  const propAddress = fmt(record.propertyAddress);
  const propOwnership = fmt(record.propertyOwnership);
  const propValue = fmt(record.propertyValue);
  const mortgage = fmt(record.mortgageOutstanding);
  const lifeInsurance = fmt(record.hasLifeInsurance);
  const lifeInsurancePolicies = Array.isArray(record.lifeInsurancePolicies) ? record.lifeInsurancePolicies : [];
  const assetsOutsideUK = fmt(record.assetsOutsideUK);
  const c1FuneralType = fmt(record.client1FuneralType) || fmt(record.funeralType);
  const c1FuneralWishes = fmt(record.client1FuneralWishes) || fmt(record.funeralWishes);
  const c1OrganDonation = fmt(record.client1OrganDonation) || fmt(record.organDonation);
  const c2FuneralType = fmt(record.client2FuneralType);
  const c2FuneralWishes = fmt(record.client2FuneralWishes);
  const c2OrganDonation = fmt(record.client2OrganDonation);
  const refNum = fmt(record.referenceNumber);
  const estimatedDraft = fmtDate(record.estimatedDraftDate);
  const iconFamily = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  const iconScales = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
  const iconShield = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  const iconHeart = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  const iconGift = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
  const iconPie = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`;
  const iconHome = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  const iconStar = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const iconCheck = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const iconArrow = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
  const treeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="160" height="176">
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#C9A84C" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#C9A84C" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#glow)"/>
    <!-- Trunk -->
    <rect x="90" y="140" width="20" height="60" rx="4" fill="#C9A84C" opacity="0.9"/>
    <!-- Roots -->
    <path d="M90 195 Q75 205 60 200" stroke="#C9A84C" stroke-width="3" fill="none" opacity="0.7"/>
    <path d="M110 195 Q125 205 140 200" stroke="#C9A84C" stroke-width="3" fill="none" opacity="0.7"/>
    <path d="M95 198 Q90 210 80 215" stroke="#C9A84C" stroke-width="2" fill="none" opacity="0.5"/>
    <path d="M105 198 Q110 210 120 215" stroke="#C9A84C" stroke-width="2" fill="none" opacity="0.5"/>
    <!-- Main canopy layers -->
    <ellipse cx="100" cy="110" rx="70" ry="50" fill="#1B4332" opacity="0.95"/>
    <ellipse cx="100" cy="85" rx="55" ry="42" fill="#2D6A4F" opacity="0.95"/>
    <ellipse cx="100" cy="62" rx="40" ry="32" fill="#1B4332" opacity="0.95"/>
    <ellipse cx="100" cy="42" rx="26" ry="22" fill="#2D6A4F" opacity="0.95"/>
    <!-- Gold leaf highlights -->
    <ellipse cx="70" cy="95" rx="18" ry="12" fill="#C9A84C" opacity="0.25"/>
    <ellipse cx="130" cy="90" rx="15" ry="10" fill="#C9A84C" opacity="0.2"/>
    <ellipse cx="100" cy="55" rx="14" ry="9" fill="#C9A84C" opacity="0.3"/>
    <!-- Small gold dots (berries/flowers) -->
    <circle cx="80" cy="88" r="3" fill="#C9A84C" opacity="0.8"/>
    <circle cx="120" cy="82" r="2.5" fill="#C9A84C" opacity="0.7"/>
    <circle cx="100" cy="48" r="3" fill="#C9A84C" opacity="0.9"/>
    <circle cx="88" cy="68" r="2" fill="#C9A84C" opacity="0.6"/>
    <circle cx="113" cy="72" r="2" fill="#C9A84C" opacity="0.6"/>
    <circle cx="65" cy="108" r="2" fill="#C9A84C" opacity="0.5"/>
    <circle cx="135" cy="105" r="2" fill="#C9A84C" opacity="0.5"/>
  </svg>`;
  function sectionHeading2(icon, title) {
    return `<div class="section-heading"><span class="section-icon">${icon}</span><span class="section-title">${title}</span></div>`;
  }
  function infoCard(label, value) {
    if (!value) return "";
    return `<div class="info-card"><div class="info-label">${label}</div><div class="info-value">${value}</div></div>`;
  }
  function personBlock(label, p) {
    const name = personName(p);
    if (!name) return "";
    const dob = p.dob || p.dateOfBirth ? fmtDateShort(p.dob || p.dateOfBirth) : "";
    const addr = p.address ? `<div class="person-detail"><span class="detail-label">Address:</span> ${p.address}</div>` : "";
    const dobHtml = dob ? `<div class="person-detail"><span class="detail-label">Date of Birth:</span> ${dob}</div>` : "";
    return `<div class="person-block"><div class="person-name">${name}</div>${dobHtml}${addr}</div>`;
  }
  function executorSection(label, primaries, substitutes) {
    if (!primaries.length && !substitutes.length) return "";
    let html = `<div class="subsection"><div class="subsection-label">${label}</div>`;
    if (primaries.length) {
      html += `<p class="body-text">You have appointed the following as your <strong>Primary Executor${primaries.length > 1 ? "s" : ""}</strong>:</p>`;
      html += `<div class="person-grid">` + primaries.map((p) => personBlock("", p)).join("") + `</div>`;
    }
    if (substitutes.length) {
      html += `<p class="body-text" style="margin-top:10px">Should ${primaries.length > 1 ? "any of them be" : "they be"} unable or unwilling to act, you have appointed the following <strong>Substitute Executor${substitutes.length > 1 ? "s" : ""}</strong>:</p>`;
      html += `<div class="person-grid">` + substitutes.map((p) => personBlock("", p)).join("") + `</div>`;
    }
    html += `</div>`;
    return html;
  }
  function benList(bens) {
    if (!bens.length) return "";
    return `<ul class="ben-list">` + bens.map((b) => {
      const name = personName(b);
      const share = b.share || b.shareFraction || b.sharePercentage || "";
      const shareStr = share ? ` <span class="share-badge">${share}</span>` : "";
      const rel = b.relationship ? ` <span class="rel-tag">${b.relationship}</span>` : "";
      return `<li class="ben-item"><span class="ben-name">${name}</span>${rel}${shareStr}</li>`;
    }).join("") + `</ul>`;
  }
  function recipientLabel(g) {
    const group = g.recipientGroup || "";
    if (group && group !== "__named" && group !== "named" && group !== "Named individual") {
      return group;
    }
    return g.recipient || g.recipientName || personName(g) || "";
  }
  function giftList(gifts, clientLabel) {
    if (!gifts.length) return "";
    let html = `<div class="gift-section"><div class="gift-client-label">${clientLabel}</div>`;
    html += `<div class="gift-grid">`;
    gifts.forEach((g) => {
      const item = g.description || g.giftDescription || g.item || "";
      const recipient = recipientLabel(g);
      const giftTypeLabel = g.giftType === "monetary" ? " (Monetary)" : g.giftType === "property" ? " (Property)" : "";
      const onSecondDeath = g.onSecondDeath === 1 || g.onSecondDeath === true;
      if (!item && !recipient) return;
      html += `<div class="gift-card">`;
      html += `<div class="gift-item">${item}${giftTypeLabel}</div>`;
      html += `<div class="gift-to">\u2192 ${recipient}</div>`;
      const divType = g.divisionType || "equally";
      const divNotes = g.divisionNotes || "";
      const isGroupGift = !!(g.recipientGroup && g.recipientGroup !== "__named" && g.recipientGroup !== "named" && g.recipientGroup !== "Named individual");
      if (isGroupGift) {
        const divLabel = divType === "equally" ? "Divided equally between all members" : divType === "per_stirpes" ? "Per stirpes (equally, passing to their children if predeceased)" : divType === "eldest" ? "To the eldest surviving member only" : divType === "youngest" ? "To the youngest surviving member only" : divType === "percentage" ? `Specific percentages: ${divNotes || "(see notes)"}` : divType === "custom" ? `Custom: ${divNotes || "(see notes)"}` : divType;
        html += `<div style="margin-top:4px;font-size:8pt;color:#2D5016;font-style:italic">\u2697\uFE0F ${divLabel}</div>`;
      }
      if (onSecondDeath) {
        html += `<div style="margin-top:5px;display:inline-block;background:#FFF3CD;border:1px solid #C9A84C;border-radius:4px;padding:2px 8px;font-size:8pt;color:#7D5A00;font-weight:600">\u231B Gift on 2nd death only</div>`;
      }
      html += `</div>`;
    });
    html += `</div></div>`;
    return html;
  }
  function giftOfPropertySection(properties) {
    const withGift = properties.filter((p) => p.giftOfProperty === 1 || p.giftOfProperty === true);
    if (!withGift.length) return "";
    let html = `<div style="margin-top:14px">`;
    html += `<div style="font-weight:700;color:#1B4332;font-size:9.5pt;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Gift of Property Clause</div>`;
    withGift.forEach((p) => {
      const addr = fmt(p.address) || "Property";
      const group = p.giftRecipientGroup;
      const isNamed = !group || group === "__named" || group === "named" || group === "Named individual";
      const recipientDisplay = isNamed ? fmt(p.giftRecipientName) || "Named individual" : group;
      html += `<div style="background:#f8faf9;border:1px solid #e0e8e4;border-left:3px solid #C9A84C;border-radius:6px;padding:10px 14px;margin-bottom:8px">`;
      html += `<div style="font-weight:600;color:#1B4332;font-size:9pt">${addr}</div>`;
      html += `<div style="color:#444;font-size:9pt;margin-top:4px">Gift to: <strong>${recipientDisplay}</strong></div>`;
      if (isNamed && fmt(p.giftRecipientAddress)) html += `<div style="color:#666;font-size:8.5pt;margin-top:2px">Address: ${fmt(p.giftRecipientAddress)}</div>`;
      if (fmt(p.giftCondition)) html += `<div style="color:#555;font-size:8.5pt;margin-top:4px;font-style:italic">Condition: ${fmt(p.giftCondition)}</div>`;
      if (fmt(p.giftNotes)) html += `<div style="color:#555;font-size:8.5pt;margin-top:4px">Notes: ${fmt(p.giftNotes)}</div>`;
      html += `</div>`;
    });
    html += `</div>`;
    return html;
  }
  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.6;
    }

    /* \u2500\u2500 COVER PAGE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .cover-page {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(160deg, #0d2b1e 0%, #1B4332 45%, #2D6A4F 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      padding: 60px 40px;
    }

    .cover-bg-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(201,168,76,0.06);
    }
    .cover-bg-circle.c1 { width: 500px; height: 500px; top: -150px; right: -150px; }
    .cover-bg-circle.c2 { width: 350px; height: 350px; bottom: -100px; left: -80px; }
    .cover-bg-circle.c3 { width: 200px; height: 200px; top: 40%; left: 10%; }

    .cover-top-bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #C9A84C, #e8c96a, #C9A84C);
    }
    .cover-bottom-bar {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #C9A84C, #e8c96a, #C9A84C);
    }

    .cover-tree { margin-bottom: 28px; filter: drop-shadow(0 8px 24px rgba(201,168,76,0.3)); }

    .cover-company {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 13pt;
      color: #C9A84C;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 6px;
      opacity: 0.9;
    }

    .cover-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 28pt;
      font-weight: 700;
      color: #ffffff;
      text-align: center;
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .cover-subtitle {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 14pt;
      color: rgba(255,255,255,0.7);
      margin-bottom: 36px;
      font-style: italic;
    }

    .cover-divider {
      width: 80px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #C9A84C, transparent);
      margin: 0 auto 36px;
    }

    .cover-meta-box {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 12px;
      padding: 24px 36px;
      text-align: center;
      backdrop-filter: blur(4px);
      min-width: 320px;
    }

    .cover-meta-label {
      font-size: 8pt;
      color: #C9A84C;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .cover-client-name {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 18pt;
      color: #ffffff;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .cover-meta-row {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 12px;
    }

    .cover-meta-item {
      text-align: center;
    }

    .cover-meta-item-label {
      font-size: 7.5pt;
      color: rgba(201,168,76,0.8);
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .cover-meta-item-value {
      font-size: 9.5pt;
      color: rgba(255,255,255,0.9);
      font-weight: 500;
    }

    .cover-confidential {
      position: absolute;
      bottom: 28px;
      font-size: 7.5pt;
      color: rgba(255,255,255,0.4);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* \u2500\u2500 CONTENT PAGES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .content-page {
      padding: 0;
      page-break-before: always;
    }

    .page-header {
      background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
      padding: 18px 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-header-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-header-logo-tree {
      width: 32px;
      height: 32px;
    }

    .page-header-company {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 10pt;
      color: #C9A84C;
      letter-spacing: 1px;
    }

    .page-header-ref {
      font-size: 8pt;
      color: rgba(255,255,255,0.6);
      letter-spacing: 0.5px;
    }

    .page-content {
      padding: 32px 40px 40px;
    }

    .page-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 18pt;
      font-weight: 700;
      color: #1B4332;
      margin-bottom: 6px;
    }

    .page-title-bar {
      width: 50px;
      height: 3px;
      background: linear-gradient(90deg, #C9A84C, #e8c96a);
      border-radius: 2px;
      margin-bottom: 24px;
    }

    /* \u2500\u2500 SECTION HEADINGS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .section-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 24px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e8c96a;
    }

    .section-icon { display: flex; align-items: center; }

    .section-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      font-weight: 600;
      color: #1B4332;
      letter-spacing: 0.3px;
    }

    /* \u2500\u2500 INFO CARDS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .info-cards-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 12px 0;
    }

    .info-card {
      background: #f8faf9;
      border: 1px solid #d4e8dc;
      border-left: 3px solid #C9A84C;
      border-radius: 6px;
      padding: 8px 14px;
      min-width: 140px;
      flex: 1;
    }

    .info-label {
      font-size: 7.5pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 2px;
    }

    .info-value {
      font-size: 10pt;
      color: #1a1a1a;
      font-weight: 500;
    }

    /* \u2500\u2500 CLIENT DETAIL BLOCK \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .client-block {
      background: linear-gradient(135deg, #f0f7f3 0%, #fafffe 100%);
      border: 1px solid #c8e6d4;
      border-radius: 10px;
      padding: 18px 22px;
      margin: 12px 0;
    }

    .client-block-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }

    .client-badge {
      background: #1B4332;
      color: #C9A84C;
      font-size: 7.5pt;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 20px;
    }

    .client-full-name {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 13pt;
      font-weight: 600;
      color: #1B4332;
    }

    .client-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }

    .client-detail-item {
      display: flex;
      flex-direction: column;
    }

    .client-detail-label {
      font-size: 7.5pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .client-detail-value {
      font-size: 10pt;
      color: #1a1a1a;
    }

    /* \u2500\u2500 PERSON BLOCKS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .person-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 8px 0;
    }

    .person-block {
      background: #fff;
      border: 1px solid #d4e8dc;
      border-radius: 8px;
      padding: 10px 14px;
      min-width: 180px;
      flex: 1;
    }

    .person-name {
      font-weight: 600;
      color: #1B4332;
      font-size: 10pt;
      margin-bottom: 4px;
    }

    .person-detail {
      font-size: 9pt;
      color: #4b5563;
    }

    .detail-label {
      color: #9ca3af;
      font-size: 8.5pt;
    }

    /* \u2500\u2500 SUBSECTION \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .subsection {
      margin: 14px 0;
    }

    .subsection-label {
      font-size: 9pt;
      font-weight: 600;
      color: #2D6A4F;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }

    /* \u2500\u2500 BENEFICIARY LIST \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ben-list {
      list-style: none;
      margin: 8px 0;
    }

    .ben-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 6px;
      margin-bottom: 4px;
      background: #f8faf9;
      border-left: 3px solid #2D6A4F;
    }

    .ben-item:nth-child(even) { background: #f0f7f3; }

    .ben-name { font-weight: 500; color: #1a1a1a; flex: 1; }

    .share-badge {
      background: #1B4332;
      color: #C9A84C;
      font-size: 8pt;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .rel-tag {
      font-size: 8pt;
      color: #6b7280;
      background: #f3f4f6;
      padding: 1px 6px;
      border-radius: 4px;
    }

    /* \u2500\u2500 GIFT CARDS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .gift-section { margin: 10px 0; }

    .gift-client-label {
      font-size: 8.5pt;
      font-weight: 600;
      color: #2D6A4F;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }

    .gift-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .gift-card {
      background: linear-gradient(135deg, #fffbf0 0%, #fff8e7 100%);
      border: 1px solid #e8c96a;
      border-radius: 8px;
      padding: 10px 14px;
      min-width: 160px;
      flex: 1;
    }

    .gift-item {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 10pt;
      margin-bottom: 4px;
    }

    .gift-to {
      font-size: 9pt;
      color: #6b7280;
    }

    /* \u2500\u2500 SUPPORT TABLE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .support-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      border-radius: 8px;
      overflow: hidden;
    }

    .support-table th {
      background: #1B4332;
      color: #C9A84C;
      font-size: 8.5pt;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 10px 14px;
      text-align: left;
    }

    .support-table td {
      padding: 12px 14px;
      font-size: 9.5pt;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    .support-table tr:last-child td { border-bottom: none; }
    .support-table tr:nth-child(even) td { background: #f8faf9; }

    .support-table .role-cell {
      font-weight: 600;
      color: #1B4332;
    }

    .support-table a {
      color: #2D6A4F;
      text-decoration: none;
    }

    /* \u2500\u2500 TIMELINE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .timeline {
      margin: 16px 0;
      position: relative;
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      align-items: flex-start;
    }

    .timeline-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1B4332, #2D6A4F);
      color: #C9A84C;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 13pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(27,67,50,0.3);
    }

    .timeline-content {
      flex: 1;
      padding-top: 4px;
    }

    .timeline-title {
      font-weight: 600;
      color: #1B4332;
      font-size: 10.5pt;
      margin-bottom: 2px;
    }

    .timeline-desc {
      font-size: 9.5pt;
      color: #4b5563;
      line-height: 1.5;
    }

    /* \u2500\u2500 SERVICES GRID \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .services-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 12px 0;
    }

    .service-card {
      background: linear-gradient(135deg, #f0f7f3 0%, #fafffe 100%);
      border: 1px solid #c8e6d4;
      border-radius: 8px;
      padding: 12px 14px;
    }

    .service-card-title {
      font-weight: 600;
      color: #1B4332;
      font-size: 10pt;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .service-card-desc {
      font-size: 9pt;
      color: #4b5563;
      line-height: 1.4;
    }

    /* \u2500\u2500 LETTER SECTION \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .letter-section {
      margin: 20px 0;
    }

    .address-block {
      margin: 16px 0;
    }

    .address-confidential {
      font-size: 9pt;
      font-weight: 600;
      color: #1B4332;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .address-line {
      font-size: 10pt;
      color: #1a1a1a;
      line-height: 1.7;
    }

    .salutation {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      font-weight: 600;
      color: #1B4332;
      margin: 20px 0 12px;
    }

    .body-text {
      font-size: 10pt;
      color: #374151;
      line-height: 1.7;
      margin-bottom: 10px;
    }

    /* \u2500\u2500 SIGN-OFF \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .signoff {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .signoff-text {
      font-size: 10pt;
      color: #374151;
      line-height: 1.8;
    }

    .signoff-name {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      font-weight: 600;
      color: #1B4332;
      margin-top: 4px;
    }

    /* \u2500\u2500 PAGE FOOTER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .page-footer {
      background: #f8faf9;
      border-top: 2px solid #C9A84C;
      padding: 10px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 32px;
    }

    .footer-company {
      font-size: 8pt;
      color: #6b7280;
    }

    .footer-confidential {
      font-size: 7.5pt;
      color: #9ca3af;
      letter-spacing: 0.5px;
    }

    .footer-ref {
      font-size: 8pt;
      color: #6b7280;
    }

    /* \u2500\u2500 PRINT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cover-page { page-break-after: always; }
      .content-page { page-break-before: always; }
    }

    /* \u2500\u2500 HIGHLIGHT BOX \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .highlight-box {
      background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
      border-radius: 10px;
      padding: 16px 20px;
      margin: 16px 0;
      color: white;
    }

    .highlight-box-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      color: #C9A84C;
      margin-bottom: 6px;
    }

    .highlight-box-text {
      font-size: 9.5pt;
      color: rgba(255,255,255,0.85);
      line-height: 1.6;
    }

    .gold-rule {
      border: none;
      border-top: 1.5px solid #C9A84C;
      margin: 20px 0;
      opacity: 0.5;
    }
  `;
  const smallTree = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44" width="28" height="30">
    <rect x="17" y="28" width="6" height="14" rx="2" fill="#C9A84C" opacity="0.9"/>
    <ellipse cx="20" cy="22" rx="14" ry="10" fill="#1B4332"/>
    <ellipse cx="20" cy="16" rx="11" ry="8" fill="#2D6A4F"/>
    <ellipse cx="20" cy="11" rx="8" ry="6" fill="#1B4332"/>
    <circle cx="20" cy="9" r="2" fill="#C9A84C" opacity="0.8"/>
    <circle cx="14" cy="18" r="1.5" fill="#C9A84C" opacity="0.6"/>
    <circle cx="26" cy="17" r="1.5" fill="#C9A84C" opacity="0.6"/>
  </svg>`;
  function pageHeader() {
    return `<div class="page-header">
      <div class="page-header-logo">
        ${smallTree}
        <div class="page-header-company">Genesis Wills and Estate Planning</div>
      </div>
      <div class="page-header-ref">${refNum ? `Ref: ${refNum}` : ""}</div>
    </div>`;
  }
  function pageFooter(pageNum) {
    return `<div class="page-footer">
      <div class="footer-company">Genesis Wills and Estate Planning</div>
      <div class="footer-confidential">Strictly Private &amp; Confidential</div>
      <div class="footer-ref">Page ${pageNum}</div>
    </div>`;
  }
  const coverPage = `
  <div class="cover-page">
    <div class="cover-bg-circle c1"></div>
    <div class="cover-bg-circle c2"></div>
    <div class="cover-bg-circle c3"></div>
    <div class="cover-top-bar"></div>
    <div class="cover-bottom-bar"></div>

    <div class="cover-tree">${treeSvg}</div>

    <div class="cover-company">Genesis Wills and Estate Planning</div>
    <div class="cover-title">Welcome Pack</div>
    <div class="cover-subtitle">Your Estate Planning Journey Begins</div>
    <div class="cover-divider"></div>

    <div class="cover-meta-box">
      <div class="cover-meta-label">Prepared for</div>
      <div class="cover-client-name">${c1Name}${isMirror && c2Name ? `<br/><span style="font-size:14pt;opacity:0.8">&amp; ${c2Name}</span>` : ""}</div>
      <div class="cover-meta-row">
        <div class="cover-meta-item">
          <div class="cover-meta-item-label">Date</div>
          <div class="cover-meta-item-value">${today2}</div>
        </div>
        ${refNum ? `<div class="cover-meta-item">
          <div class="cover-meta-item-label">Reference</div>
          <div class="cover-meta-item-value">${refNum}</div>
        </div>` : ""}
        ${record.willType ? `<div class="cover-meta-item">
          <div class="cover-meta-item-label">Document Type</div>
          <div class="cover-meta-item-value">${willTypeLabel(record.willType)}</div>
        </div>` : ""}
      </div>
    </div>

    <div class="cover-confidential">Strictly Private &amp; Confidential</div>
  </div>`;
  const welcomeLetterPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Welcome Letter</div>
      <div class="page-title-bar"></div>

      <div class="letter-section">
        <div class="address-block">
          <div class="address-confidential">Strictly Private and Confidential</div>
          ${addressLines.map((l) => `<div class="address-line">${l}</div>`).join("")}
        </div>

        <div class="body-text" style="margin-top:16px"><strong>Date:</strong> ${today2}</div>

        <div class="salutation">${salutation}</div>

        <p class="body-text">
          Thank you for entrusting Genesis Wills and Estate Planning with your instructions. Following your recent meeting
          with our consultant, <strong>${consultantName}</strong>, I am writing to formally welcome you as our newest client
          and to confirm the details of your instructions for a <strong>${willTypeLabel(record.willType || "Will")}</strong>.
          We understand that estate planning is a significant step, and our team is dedicated to ensuring your wishes are
          documented accurately and professionally.
        </p>

        <p class="body-text">
          Enclosed in this Welcome Pack you will find a summary of the instructions we have recorded for you. Please review
          all details carefully and contact us immediately if any corrections are required before drafting begins.
        </p>

        ${sectionHeading2(iconStar, "Your Support Team")}

        <p class="body-text">
          We are here to help you at every stage. If you have any questions about your documents or the process, please
          contact your dedicated team members below.
          ${coordinatorPhone ? `(<strong>General Enquiries:</strong> ${coordinatorPhone})` : ""}
        </p>

        <table class="support-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Name</th>
              <th>Contact Email</th>
              <th>Contact Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="role-cell">Your Consultant</td>
              <td>${consultantName}</td>
              <td>${consultantEmail ? `<a href="mailto:${consultantEmail}">${consultantEmail}</a>` : "\u2014"}</td>
              <td>${consultantPhone || "\u2014"}</td>
            </tr>
            <tr>
              <td class="role-cell">Case Coordinator</td>
              <td>${coordinatorName}</td>
              <td>${coordinatorEmail ? `<a href="mailto:${coordinatorEmail}">${coordinatorEmail}</a>` : "\u2014"}</td>
              <td>${coordinatorPhone || "\u2014"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    ${pageFooter(2)}
  </div>`;
  function clientBlock(num) {
    const p = num === 1 ? "client1" : "client2";
    const name = fullName3(record[`${p}Prefix`], record[`${p}FirstName`], record[`${p}MiddleName`], record[`${p}LastName`]);
    if (!name) return "";
    const dob = fmtDate(record[`${p}Dob`]);
    const addr = [record[`${p}AddressLine1`], record[`${p}City`], record[`${p}Postcode`]].filter(Boolean).join(", ");
    const phone = fmt(record[`${p}Mobile`]) || fmt(record[`${p}DaytimePhone`]);
    const email = fmt(record[`${p}Email`]);
    const marital = capitalize(fmt(record[`${p}MaritalStatus`]));
    const job = fmt(record[`${p}JobTitle`]);
    const nationality = fmt(record[`${p}Nationality`]);
    return `<div class="client-block">
      <div class="client-block-header">
        <div class="client-badge">Client ${num}</div>
        <div class="client-full-name">${name}</div>
      </div>
      <div class="client-details-grid">
        ${dob ? `<div class="client-detail-item"><div class="client-detail-label">Date of Birth</div><div class="client-detail-value">${dob}</div></div>` : ""}
        ${marital ? `<div class="client-detail-item"><div class="client-detail-label">Marital Status</div><div class="client-detail-value">${marital}</div></div>` : ""}
        ${job ? `<div class="client-detail-item"><div class="client-detail-label">Occupation</div><div class="client-detail-value">${job}</div></div>` : ""}
        ${nationality ? `<div class="client-detail-item"><div class="client-detail-label">Nationality</div><div class="client-detail-value">${nationality}</div></div>` : ""}
        ${addr ? `<div class="client-detail-item" style="grid-column:1/-1"><div class="client-detail-label">Address</div><div class="client-detail-value">${addr}</div></div>` : ""}
        ${phone ? `<div class="client-detail-item"><div class="client-detail-label">Telephone</div><div class="client-detail-value">${phone}</div></div>` : ""}
        ${email ? `<div class="client-detail-item"><div class="client-detail-label">Email</div><div class="client-detail-value">${email}</div></div>` : ""}
      </div>
    </div>`;
  }
  const clientDetailsPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Summary of Instructions</div>
      <div class="page-title-bar"></div>

      <div class="highlight-box">
        <div class="highlight-box-title">Important \u2014 Please Review Carefully</div>
        <div class="highlight-box-text">
          The following details have been recorded from your appointment. It is essential that you verify all names,
          dates of birth, and addresses are 100% accurate before drafting begins. Please contact us immediately if
          any corrections are needed.
        </div>
      </div>

      ${sectionHeading2(iconFamily, "Client Details")}
      ${clientBlock(1)}
      ${isMirror ? clientBlock(2) : ""}

      ${uniqueChildren.length > 0 ? `
        ${sectionHeading2(iconFamily, "Children")}
        <p class="body-text">You have confirmed that you have the following children:</p>
        <div class="person-grid">
          ${uniqueChildren.map((c) => personBlock("", c)).join("")}
        </div>
      ` : ""}

    </div>
    ${pageFooter(3)}
  </div>`;
  const execGuardPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Appointments</div>
      <div class="page-title-bar"></div>

      ${sectionHeading2(iconScales, "Executors")}
      ${isMirror ? `
        ${executorSection("Client 1 \u2014 " + (record.client1FirstName || ""), c1Execs, c1ResExecs)}
        ${executorSection("Client 2 \u2014 " + (record.client2FirstName || ""), c2Execs, c2ResExecs)}
      ` : executorSection("", c1Execs, c1ResExecs)}

      ${c1Guards.length > 0 || c1ResGuards.length > 0 ? `
        ${sectionHeading2(iconShield, "Guardians")}
        <p class="body-text">You have appointed the following to act as guardians for any minor children:</p>
        ${executorSection("", c1Guards, c1ResGuards)}
      ` : ""}

      ${sectionHeading2(iconPie, "Distribution of Your Estate")}
      ${isMirror ? `
        ${c1Bens.length > 0 ? `
          <div class="subsection">
            <div class="subsection-label">Client 1 \u2014 ${record.client1FirstName || ""}</div>
            <p class="body-text">Your estate will be distributed as follows:</p>
            ${benList(c1Bens)}
            ${record.client1ResidualEstate ? `<p class="body-text" style="margin-top:8px">Any remaining estate will pass to: <strong>${record.client1ResidualEstate}</strong></p>` : ""}
          </div>
        ` : ""}
        ${c2Bens.length > 0 ? `
          <div class="subsection" style="margin-top:14px">
            <div class="subsection-label">Client 2 \u2014 ${record.client2FirstName || ""}</div>
            <p class="body-text">Your estate will be distributed as follows:</p>
            ${benList(c2Bens)}
            ${record.client2ResidualEstate ? `<p class="body-text" style="margin-top:8px">Any remaining estate will pass to: <strong>${record.client2ResidualEstate}</strong></p>` : ""}
          </div>
        ` : ""}
      ` : `
        ${c1Bens.length > 0 ? benList(c1Bens) : ""}
        ${record.client1ResidualEstate ? `<p class="body-text" style="margin-top:8px">Any remaining estate will pass to: <strong>${record.client1ResidualEstate}</strong></p>` : ""}
      `}

      ${record.disasterClauseNotes || record.disasterClauseClient1 ? `
        <div style="margin-top:12px;padding:12px 16px;background:#f8faf9;border-radius:8px;border-left:3px solid #2D6A4F">
          <div style="font-weight:600;color:#1B4332;font-size:9.5pt;margin-bottom:4px">Disaster Clause</div>
          <div class="body-text">${record.disasterClauseNotes || record.disasterClauseClient1}</div>
        </div>
      ` : ""}

    </div>
    ${pageFooter(4)}
  </div>`;
  const assetsFuneralPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Assets, Gifts &amp; Wishes</div>
      <div class="page-title-bar"></div>

      ${propOwned === "yes" || propAddress || propValue ? `
        ${sectionHeading2(iconHome, "Property &amp; Financial Overview")}
        <div class="info-cards-row">
          ${propAddress ? infoCard("Property Address", propAddress) : ""}
          ${propOwnership ? infoCard("Ownership", capitalize(propOwnership)) : ""}
          ${propValue ? infoCard("Estimated Value", propValue.startsWith("\xA3") ? propValue : `\xA3${propValue}`) : ""}
          ${mortgage && mortgage !== "no" && mortgage !== "0" ? infoCard("Mortgage", mortgage) : infoCard("Mortgage", "None")}
          ${lifeInsurance === "yes" && lifeInsurancePolicies.length > 0 ? infoCard("Life Insurance", lifeInsurancePolicies.map((p) => p.provider || "").filter(Boolean).join(", ") || "Yes") : lifeInsurance === "yes" ? infoCard("Life Insurance", "Yes") : infoCard("Life Insurance", "None confirmed")}
          ${assetsOutsideUK === "yes" ? infoCard("Assets Outside UK", "Yes") : ""}
        </div>
        ${giftOfPropertySection(Array.isArray(record.properties) ? record.properties : [])}
      ` : ""}

      ${hasGifts ? `
        ${sectionHeading2(iconGift, "Specific Gifts")}
        <p class="body-text">You have instructed that the following gifts are to be included within your Will${isMirror ? "s" : ""}:</p>
        ${giftList(c1Gifts, isMirror ? `Client 1 \u2014 ${record.client1FirstName || ""}` : "")}
        ${isMirror ? giftList(c2Gifts, `Client 2 \u2014 ${record.client2FirstName || ""}`) : ""}
      ` : ""}

      ${c1FuneralType || c1FuneralWishes || c1OrganDonation ? `
        ${sectionHeading2(iconHeart, "Funeral Wishes &amp; Organ Donation")}
        ${isMirror ? `
          ${c1FuneralType || c1FuneralWishes || c1OrganDonation ? `
            <div class="subsection">
              <div class="subsection-label">Client 1 \u2014 ${record.client1FirstName || ""}</div>
              <div class="info-cards-row">
                ${c1FuneralType ? infoCard("Funeral Preference", capitalize(c1FuneralType)) : ""}
                ${c1OrganDonation ? infoCard("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No") : ""}
              </div>
              ${c1FuneralWishes ? `<p class="body-text" style="margin-top:8px;font-style:italic">"${c1FuneralWishes}"</p>` : ""}
            </div>
          ` : ""}
          ${c2FuneralType || c2FuneralWishes || c2OrganDonation ? `
            <div class="subsection" style="margin-top:12px">
              <div class="subsection-label">Client 2 \u2014 ${record.client2FirstName || ""}</div>
              <div class="info-cards-row">
                ${c2FuneralType ? infoCard("Funeral Preference", capitalize(c2FuneralType)) : ""}
                ${c2OrganDonation ? infoCard("Organ Donation", c2OrganDonation === "yes" ? "Yes" : "No") : ""}
              </div>
              ${c2FuneralWishes ? `<p class="body-text" style="margin-top:8px;font-style:italic">"${c2FuneralWishes}"</p>` : ""}
            </div>
          ` : ""}
        ` : `
          <div class="info-cards-row">
            ${c1FuneralType ? infoCard("Funeral Preference", capitalize(c1FuneralType)) : ""}
            ${c1OrganDonation ? infoCard("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No") : ""}
          </div>
          ${c1FuneralWishes ? `<p class="body-text" style="margin-top:8px;font-style:italic">"${c1FuneralWishes}"</p>` : ""}
        `}
      ` : ""}

      ${record.additionalNotes || record.specialNotes ? `
        <hr class="gold-rule"/>
        <div style="padding:14px 18px;background:#f8faf9;border-radius:8px;border-left:3px solid #C9A84C">
          <div style="font-weight:600;color:#1B4332;font-size:9.5pt;margin-bottom:6px">Additional Notes</div>
          <div class="body-text">${record.additionalNotes || record.specialNotes}</div>
        </div>
      ` : ""}

    </div>
    ${pageFooter(5)}
  </div>`;
  const nextStepsPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Next Steps &amp; Our Services</div>
      <div class="page-title-bar"></div>

      ${sectionHeading2(iconStar, "Additional Services We Offer")}
      <p class="body-text">While you have instructed us for a Will, we offer a comprehensive range of services to protect your assets and your family.</p>

      <div class="services-grid">
        <div class="service-card">
          <div class="service-card-title">${iconShield} Lasting Powers of Attorney</div>
          <div class="service-card-desc">Appoint someone to make decisions on your behalf regarding Health &amp; Welfare or Property &amp; Financial Affairs should you become mentally incapable.</div>
        </div>
        <div class="service-card">
          <div class="service-card-title">${iconHome} Trusts</div>
          <div class="service-card-desc">Valuable tools to protect assets and control how they are distributed to beneficiaries, including Protective Property Trusts and Discretionary Trusts.</div>
        </div>
        <div class="service-card">
          <div class="service-card-title">${iconPie} Inheritance Tax Planning</div>
          <div class="service-card-desc">Strategies to minimise the tax burden on your estate and ensure more of your wealth passes to your loved ones.</div>
        </div>
        <div class="service-card">
          <div class="service-card-title">${iconScales} Probate Administration</div>
          <div class="service-card-desc">Professional assistance for executors in gathering assets, paying debts, and distributing the estate efficiently and compliantly.</div>
        </div>
      </div>

      <p class="body-text" style="margin-top:8px">If you would like to know more about any of the additional services we provide, please do not hesitate to contact us. We are here to support you every step of the way.</p>

      ${sectionHeading2(iconArrow, "What Happens Next?")}

      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-number">1</div>
          <div class="timeline-content">
            <div class="timeline-title">Verification</div>
            <div class="timeline-desc">Please review the Summary of Instructions in this pack carefully. It is vital that all names, addresses, and dates of birth are 100% accurate. Contact us immediately if any corrections are needed.</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-number">2</div>
          <div class="timeline-content">
            <div class="timeline-title">Cooling-Off Period</div>
            <div class="timeline-desc">We will begin work on your legal documents immediately upon the expiration of your 14-day cooling-off period.</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-number">3</div>
          <div class="timeline-content">
            <div class="timeline-title">Drafting</div>
            <div class="timeline-desc">You will receive your draft documents approximately <strong>2 weeks</strong> from today${estimatedDraft ? ` (estimated: ${estimatedDraft})` : ""}, depending on case complexity. You will have the opportunity to clarify instructions or make amendments at that stage.</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-number">4</div>
          <div class="timeline-content">
            <div class="timeline-title">Finalisation &amp; Signing</div>
            <div class="timeline-desc">Once you approve the drafts, we will prepare the final documents for signing (attestation). Our team will guide you through the signing process to ensure everything is legally valid.</div>
          </div>
        </div>
      </div>

      <hr class="gold-rule"/>

      <div class="signoff">
        <p class="body-text">If you spot any errors in the summary, please reply to this correspondence immediately so we can correct our records before drafting begins.</p>
        <div style="margin-top:20px">
          <div class="signoff-text">Yours sincerely,</div>
          <div class="signoff-name">${coordinatorName}</div>
          <div class="signoff-text">Genesis Wills and Estate Planning</div>
          ${coordinatorPhone ? `<div class="signoff-text">${coordinatorPhone}</div>` : ""}
          ${coordinatorEmail ? `<div class="signoff-text">${coordinatorEmail}</div>` : ""}
        </div>
      </div>

    </div>
    ${pageFooter(6)}
  </div>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome Pack \u2014 ${c1Name}</title>
  <style>${css}</style>
</head>
<body>
  ${coverPage}
  ${welcomeLetterPage}
  ${clientDetailsPage}
  ${execGuardPage}
  ${assetsFuneralPage}
  ${nextStepsPage}
</body>
</html>`;
}

// server/welcomePackDocxGenerator.ts
import {
  Document as Document2,
  Packer as Packer2,
  Paragraph as Paragraph2,
  TextRun as TextRun2,
  Table,
  TableRow,
  TableCell,
  AlignmentType as AlignmentType2,
  BorderStyle,
  WidthType,
  PageBreak as PageBreak2,
  Header,
  Footer,
  convertMillimetersToTwip
} from "docx";
function fmt2(v) {
  if (v === null || v === void 0 || v === "") return "";
  return String(v);
}
function fmtDate2(v) {
  if (!v) return "";
  try {
    const d3 = new Date(v);
    if (isNaN(d3.getTime())) return String(v);
    return d3.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return String(v);
  }
}
function fmtDateShort2(v) {
  if (!v) return "";
  try {
    const d3 = new Date(v);
    if (isNaN(d3.getTime())) return String(v);
    return d3.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return String(v);
  }
}
function fullName4(...parts) {
  return parts.filter(Boolean).join(" ");
}
function personName2(p) {
  if (!p) return "";
  return [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ");
}
function capitalize2(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
function willTypeLabel2(wt) {
  const map = {
    "Single Will": "Single Will",
    "Mirror Will": "Mirror Wills",
    "Mirror Wills": "Mirror Wills",
    "Joint Will": "Joint Will",
    "single": "Single Will",
    "mirror": "Mirror Wills"
  };
  return map[wt] || wt || "Will";
}
var GREEN2 = "1B4332";
var GOLD2 = "C9A84C";
var LIGHT_GREEN = "2D6A4F";
function titlePara(text2) {
  return new Paragraph2({
    children: [new TextRun2({ text: text2, bold: true, size: 52, color: GREEN2, font: "Georgia" })],
    alignment: AlignmentType2.CENTER,
    spacing: { before: 600, after: 200 }
  });
}
function subtitlePara(text2) {
  return new Paragraph2({
    children: [new TextRun2({ text: text2, size: 26, color: GOLD2 })],
    alignment: AlignmentType2.CENTER,
    spacing: { after: 120 }
  });
}
function heading1(text2) {
  return new Paragraph2({
    children: [new TextRun2({ text: text2.toUpperCase(), bold: true, size: 30, color: GREEN2, font: "Georgia" })],
    spacing: { before: 320, after: 160 }
  });
}
function sectionHeading(text2) {
  return new Paragraph2({
    children: [new TextRun2({ text: text2, bold: true, size: 24, color: LIGHT_GREEN, font: "Georgia" })],
    spacing: { before: 240, after: 100 }
  });
}
function dividerPara() {
  return new Paragraph2({
    children: [new TextRun2({ text: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", color: GOLD2, size: 16 })],
    spacing: { before: 120, after: 120 }
  });
}
function spacerPara() {
  return new Paragraph2({ children: [new TextRun2({ text: "" })], spacing: { after: 120 } });
}
function pageBreakPara() {
  return new Paragraph2({ children: [new PageBreak2()] });
}
function bodyPara(text2, spacing = 120) {
  return new Paragraph2({
    children: [new TextRun2({ text: text2, size: 20 })],
    spacing: { after: spacing }
  });
}
function boldBodyPara(label, value) {
  return new Paragraph2({
    children: [
      new TextRun2({ text: label + ": ", bold: true, size: 20 }),
      new TextRun2({ text: value, size: 20 })
    ],
    spacing: { after: 60 }
  });
}
function labelValuePara(label, value) {
  if (!value) return new Paragraph2({ children: [] });
  return new Paragraph2({
    children: [
      new TextRun2({ text: label + ": ", bold: true, size: 20 }),
      new TextRun2({ text: value, size: 20 })
    ],
    spacing: { after: 60 }
  });
}
function bulletPara(text2) {
  return new Paragraph2({
    children: [new TextRun2({ text: `\u2022  ${text2}`, size: 20 })],
    spacing: { after: 60 },
    indent: { left: convertMillimetersToTwip(5) }
  });
}
function personPara(p) {
  const name = personName2(p);
  if (!name) return [];
  const dob = p.dob || p.dateOfBirth ? fmtDateShort2(p.dob || p.dateOfBirth) : "";
  const addr = p.address || "";
  const paras = [
    new Paragraph2({
      children: [new TextRun2({ text: name, bold: true, size: 21, color: GREEN2 })],
      spacing: { after: 40 }
    })
  ];
  if (dob) paras.push(new Paragraph2({ children: [new TextRun2({ text: `Date of Birth: ${dob}`, size: 20 })], spacing: { after: 40 } }));
  if (addr) paras.push(new Paragraph2({ children: [new TextRun2({ text: `Address: ${addr}`, size: 20 })], spacing: { after: 40 } }));
  paras.push(spacerPara());
  return paras;
}
function supportTable(consultant, coordinator) {
  const plainBorder = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" };
  const borders = { top: plainBorder, bottom: plainBorder, left: plainBorder, right: plainBorder };
  const headerCell = (text2) => new TableCell({
    children: [new Paragraph2({ children: [new TextRun2({ text: text2, bold: true, size: 18, color: GREEN2 })] })],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    borders
  });
  const dataCell = (text2, bold = false) => new TableCell({
    children: [new Paragraph2({ children: [new TextRun2({ text: text2, bold, size: 19 })] })],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    borders
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: plainBorder, bottom: plainBorder, left: plainBorder, right: plainBorder },
    rows: [
      new TableRow({
        children: [headerCell("Role"), headerCell("Name"), headerCell("Email"), headerCell("Phone")],
        tableHeader: true
      }),
      new TableRow({
        children: [dataCell("Your Consultant", true), dataCell(consultant.name), dataCell(consultant.email), dataCell(consultant.phone)]
      }),
      new TableRow({
        children: [dataCell("Case Coordinator", true), dataCell(coordinator.name), dataCell(coordinator.email), dataCell(coordinator.phone)]
      })
    ]
  });
}
function clientTable(record, num) {
  const p = num === 1 ? "client1" : "client2";
  const name = fullName4(record[`${p}Prefix`], record[`${p}FirstName`], record[`${p}MiddleName`], record[`${p}LastName`]);
  if (!name) return [];
  const dob = fmtDate2(record[`${p}Dob`]);
  const addr = [record[`${p}AddressLine1`], record[`${p}City`], record[`${p}Postcode`]].filter(Boolean).join(", ");
  const phone = fmt2(record[`${p}Mobile`]) || fmt2(record[`${p}DaytimePhone`]);
  const email = fmt2(record[`${p}Email`]);
  const marital = capitalize2(fmt2(record[`${p}MaritalStatus`]));
  const job = fmt2(record[`${p}JobTitle`]);
  const nationality = fmt2(record[`${p}Nationality`]);
  const rows = [
    ["Full Name", name],
    ["Date of Birth", dob],
    ["Marital Status", marital],
    ["Occupation", job],
    ["Nationality", nationality],
    ["Address", addr],
    ["Telephone", phone],
    ["Email", email]
  ].filter(([, v]) => v);
  const plainBorder = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" };
  const borders = { top: plainBorder, bottom: plainBorder, left: plainBorder, right: plainBorder };
  const tableRows = rows.map(([label, value]) => new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph2({ children: [new TextRun2({ text: label, bold: true, size: 19 })] })],
        width: { size: 30, type: WidthType.PERCENTAGE },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        borders
      }),
      new TableCell({
        children: [new Paragraph2({ children: [new TextRun2({ text: value, size: 19 })] })],
        width: { size: 70, type: WidthType.PERCENTAGE },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        borders
      })
    ]
  }));
  return [
    new Paragraph2({
      children: [new TextRun2({ text: `Client ${num}`, bold: true, size: 22, color: LIGHT_GREEN })],
      spacing: { before: 160, after: 80 }
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: plainBorder, bottom: plainBorder, left: plainBorder, right: plainBorder },
      rows: tableRows
    }),
    spacerPara()
  ];
}
function benListParas(bens) {
  if (!bens.length) return [];
  return bens.map((b) => {
    const name = personName2(b);
    const share = b.share || b.shareFraction || b.sharePercentage || "";
    const rel = b.relationship || "";
    const parts = [name, rel ? `(${rel})` : "", share ? `\u2014 ${share}` : ""].filter(Boolean).join("  ");
    return bulletPara(parts);
  });
}
function giftParas(gifts, label) {
  if (!gifts.length) return [];
  const paras = [];
  if (label) paras.push(new Paragraph2({ children: [new TextRun2({ text: label, bold: true, size: 20, color: LIGHT_GREEN })], spacing: { after: 60 } }));
  gifts.forEach((g) => {
    const item = g.description || g.giftDescription || g.item || "";
    const group = g.recipientGroup || "";
    const isNamed = !group || group === "__named" || group === "named" || group === "Named individual";
    const recipient = isNamed ? g.recipient || g.recipientName || personName2(g) || "" : group;
    const giftTypeLabel = g.giftType === "monetary" ? " (Monetary)" : g.giftType === "property" ? " (Property)" : "";
    const onSecondDeath = g.onSecondDeath === 1 || g.onSecondDeath === true;
    const divType = g.divisionType || "equally";
    const divNotes = g.divisionNotes || "";
    const isGroupGift = !!(group && group !== "__named" && group !== "named" && group !== "Named individual");
    if (!item && !recipient) return;
    paras.push(bulletPara([`${item}${giftTypeLabel}`, recipient ? `\u2192 ${recipient}` : ""].filter(Boolean).join("  ")));
    if (isGroupGift) {
      const divLabel = divType === "equally" ? "Divided equally between all members" : divType === "per_stirpes" ? "Per stirpes (equally, passing to their children if predeceased)" : divType === "eldest" ? "To the eldest surviving member only" : divType === "youngest" ? "To the youngest surviving member only" : divType === "percentage" ? `Specific percentages: ${divNotes || "(see notes)"}` : divType === "custom" ? `Custom: ${divNotes || "(see notes)"}` : divType;
      paras.push(new Paragraph2({
        children: [new TextRun2({ text: `Division: ${divLabel}`, size: 17, color: LIGHT_GREEN, italics: true })],
        indent: { left: 360 },
        spacing: { after: 40 }
      }));
    }
    if (onSecondDeath) {
      paras.push(new Paragraph2({
        children: [
          new TextRun2({ text: "\u231B Gift on 2nd death only", bold: true, size: 17, color: "7D5A00", italics: true })
        ],
        indent: { left: 360 },
        spacing: { after: 40 }
      }));
    }
  });
  paras.push(spacerPara());
  return paras;
}
async function generateWelcomePackDocx(record) {
  const today2 = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isMirror = (record.willType || "").toLowerCase().includes("mirror");
  const c1Name = fullName4(record.client1Prefix, record.client1FirstName, record.client1MiddleName, record.client1LastName);
  const c2Name = isMirror ? fullName4(record.client2Prefix, record.client2FirstName, record.client2MiddleName, record.client2LastName) : "";
  const salutation = isMirror && c2Name ? `Dear ${record.client1FirstName || "Client"} & ${record.client2FirstName || "Client"},` : `Dear ${record.client1FirstName || "Client"},`;
  const addressLines = [
    c1Name,
    isMirror && c2Name ? c2Name : null,
    record.client1AddressLine1,
    record.client1City,
    record.client1Postcode
  ].filter(Boolean);
  const consultantName = fmt2(record.consultantName) || "Your Consultant";
  const consultantEmail = fmt2(record.consultantEmail);
  const consultantPhone = fmt2(record.consultantPhone);
  const coordinatorName = fmt2(record.caseCoordinatorName) || "Case Coordinator";
  const coordinatorEmail = fmt2(record.caseCoordinatorEmail);
  const coordinatorPhone = fmt2(record.caseCoordinatorPhone);
  const refNum = fmt2(record.referenceNumber);
  const estimatedDraft = fmtDate2(record.estimatedDraftDate);
  const c1Execs = Array.isArray(record.client1Executors) ? record.client1Executors : Array.isArray(record.executors) ? record.executors : [];
  const c1ResExecs = Array.isArray(record.client1ReservedExecutors) ? record.client1ReservedExecutors : Array.isArray(record.reservedExecutors) ? record.reservedExecutors : [];
  const c2Execs = Array.isArray(record.client2Executors) ? record.client2Executors : [];
  const c2ResExecs = Array.isArray(record.client2ReservedExecutors) ? record.client2ReservedExecutors : [];
  const c1Guards = Array.isArray(record.client1Guardians) ? record.client1Guardians : Array.isArray(record.guardians) ? record.guardians : [];
  const c1ResGuards = Array.isArray(record.client1ReservedGuardians) ? record.client1ReservedGuardians : Array.isArray(record.reservedGuardians) ? record.reservedGuardians : [];
  const c1Bens = Array.isArray(record.client1Beneficiaries) ? record.client1Beneficiaries : Array.isArray(record.beneficiaries) ? record.beneficiaries : [];
  const c2Bens = Array.isArray(record.client2Beneficiaries) ? record.client2Beneficiaries : [];
  const c1Gifts = Array.isArray(record.client1SpecificGifts) ? record.client1SpecificGifts : Array.isArray(record.specificGifts) ? record.specificGifts : [];
  const c2Gifts = Array.isArray(record.client2SpecificGifts) ? record.client2SpecificGifts : [];
  const c1Under18 = Array.isArray(record.client1ChildrenUnder18) ? record.client1ChildrenUnder18 : [];
  const c1Over18 = Array.isArray(record.client1ChildrenOver18) ? record.client1ChildrenOver18 : [];
  const c2Under18 = Array.isArray(record.client2ChildrenUnder18) ? record.client2ChildrenUnder18 : [];
  const c2Over18 = Array.isArray(record.client2ChildrenOver18) ? record.client2ChildrenOver18 : [];
  const allChildren = [...c1Under18, ...c1Over18, ...isMirror ? [...c2Under18, ...c2Over18] : []];
  const seenChildren = /* @__PURE__ */ new Set();
  const uniqueChildren = allChildren.filter((c) => {
    const key = personName2(c);
    if (!key || seenChildren.has(key)) return false;
    seenChildren.add(key);
    return true;
  });
  const c1FuneralType = fmt2(record.client1FuneralType) || fmt2(record.funeralType);
  const c1FuneralWishes = fmt2(record.client1FuneralWishes) || fmt2(record.funeralWishes);
  const c1OrganDonation = fmt2(record.client1OrganDonation) || fmt2(record.organDonation);
  const c2FuneralType = fmt2(record.client2FuneralType);
  const c2FuneralWishes = fmt2(record.client2FuneralWishes);
  const c2OrganDonation = fmt2(record.client2OrganDonation);
  const propAddress = fmt2(record.propertyAddress);
  const propOwnership = fmt2(record.propertyOwnership);
  const propValue = fmt2(record.propertyValue);
  const mortgage = fmt2(record.mortgageOutstanding);
  const lifeInsurance = fmt2(record.hasLifeInsurance);
  const lifeInsurancePolicies = Array.isArray(record.lifeInsurancePolicies) ? record.lifeInsurancePolicies : [];
  const assetsOutsideUK = fmt2(record.assetsOutsideUK);
  const children = [];
  children.push(
    titlePara("WELCOME PACK"),
    subtitlePara("Genesis Wills and Estate Planning"),
    spacerPara(),
    new Paragraph2({
      children: [new TextRun2({ text: c1Name + (isMirror && c2Name ? ` & ${c2Name}` : ""), bold: true, size: 36, color: GREEN2, font: "Georgia" })],
      alignment: AlignmentType2.CENTER,
      spacing: { after: 120 }
    }),
    new Paragraph2({
      children: [new TextRun2({ text: today2, size: 22, color: "6B7280" })],
      alignment: AlignmentType2.CENTER,
      spacing: { after: 120 }
    }),
    refNum ? new Paragraph2({
      children: [new TextRun2({ text: `Reference: ${refNum}`, size: 22, color: "6B7280" })],
      alignment: AlignmentType2.CENTER,
      spacing: { after: 120 }
    }) : spacerPara(),
    record.willType ? new Paragraph2({
      children: [new TextRun2({ text: willTypeLabel2(record.willType), size: 22, color: "6B7280", italics: true })],
      alignment: AlignmentType2.CENTER,
      spacing: { after: 400 }
    }) : spacerPara(),
    dividerPara(),
    pageBreakPara()
  );
  children.push(
    heading1("Welcome Letter"),
    boldBodyPara("Date", today2),
    new Paragraph2({
      children: [new TextRun2({ text: "Strictly Private and Confidential", bold: true, size: 20 })],
      spacing: { after: 120 }
    }),
    ...addressLines.map((l) => new Paragraph2({ children: [new TextRun2({ text: l, size: 20 })], spacing: { after: 40 } })),
    spacerPara(),
    new Paragraph2({
      children: [new TextRun2({ text: salutation, bold: true, size: 24, color: GREEN2, font: "Georgia" })],
      spacing: { before: 160, after: 120 }
    }),
    new Paragraph2({
      children: [
        new TextRun2({ text: "Thank you for entrusting Genesis Wills and Estate Planning with your instructions. Following your recent meeting with our consultant, ", size: 20 }),
        new TextRun2({ text: consultantName, bold: true, size: 20 }),
        new TextRun2({ text: `, I am writing to formally welcome you as our newest client and to confirm the details of your instructions for a `, size: 20 }),
        new TextRun2({ text: willTypeLabel2(record.willType || "Will"), bold: true, size: 20 }),
        new TextRun2({ text: ". We understand that estate planning is a significant step, and our team is dedicated to ensuring your wishes are documented accurately and professionally.", size: 20 })
      ],
      spacing: { after: 120 }
    }),
    bodyPara("Enclosed in this Welcome Pack you will find a summary of the instructions we have recorded for you. Please review all details carefully and contact us immediately if any corrections are required before drafting begins."),
    dividerPara(),
    sectionHeading("Your Support Team"),
    bodyPara(`We are here to help you at every stage. If you have any questions, please contact your dedicated team members below.`),
    spacerPara(),
    supportTable(
      { name: consultantName, email: consultantEmail, phone: consultantPhone },
      { name: coordinatorName, email: coordinatorEmail, phone: coordinatorPhone }
    ),
    pageBreakPara()
  );
  children.push(
    heading1("Summary of Instructions"),
    bodyPara("Please check the following details carefully. It is vital that all names, addresses, and dates of birth are 100% accurate. Contact us immediately if any corrections are needed."),
    dividerPara(),
    sectionHeading("Client Details"),
    ...clientTable(record, 1),
    ...isMirror ? clientTable(record, 2) : []
  );
  if (uniqueChildren.length > 0) {
    children.push(
      dividerPara(),
      sectionHeading("Children"),
      bodyPara("You have confirmed that you have the following children:"),
      ...uniqueChildren.flatMap((c) => personPara(c))
    );
  }
  children.push(pageBreakPara());
  children.push(heading1("Appointments"));
  children.push(dividerPara());
  children.push(sectionHeading("Executors"));
  function addExecSection(label, primaries, substitutes) {
    if (!primaries.length && !substitutes.length) return;
    if (label) children.push(new Paragraph2({ children: [new TextRun2({ text: label, bold: true, size: 20 })], spacing: { after: 80 } }));
    if (primaries.length) {
      children.push(new Paragraph2({
        children: [
          new TextRun2({ text: "You have appointed the following as your ", size: 20 }),
          new TextRun2({ text: `Primary Executor${primaries.length > 1 ? "s" : ""}:`, bold: true, size: 20 })
        ],
        spacing: { after: 80 }
      }));
      primaries.forEach((p) => children.push(...personPara(p)));
    }
    if (substitutes.length) {
      children.push(new Paragraph2({
        children: [
          new TextRun2({ text: "Should they be unable or unwilling to act, you have appointed the following ", size: 20 }),
          new TextRun2({ text: `Substitute Executor${substitutes.length > 1 ? "s" : ""}:`, bold: true, size: 20 })
        ],
        spacing: { after: 80 }
      }));
      substitutes.forEach((p) => children.push(...personPara(p)));
    }
  }
  if (isMirror) {
    addExecSection(`Client 1 \u2014 ${record.client1FirstName || ""}`, c1Execs, c1ResExecs);
    addExecSection(`Client 2 \u2014 ${record.client2FirstName || ""}`, c2Execs, c2ResExecs);
  } else {
    addExecSection("", c1Execs, c1ResExecs);
  }
  if (c1Guards.length > 0 || c1ResGuards.length > 0) {
    children.push(dividerPara());
    children.push(sectionHeading("Guardians"));
    children.push(bodyPara("You have appointed the following to act as guardians for any minor children:"));
    c1Guards.forEach((p) => children.push(...personPara(p)));
    if (c1ResGuards.length) {
      children.push(new Paragraph2({ children: [new TextRun2({ text: "Substitute Guardians:", bold: true, size: 20 })], spacing: { after: 80 } }));
      c1ResGuards.forEach((p) => children.push(...personPara(p)));
    }
  }
  children.push(dividerPara());
  children.push(sectionHeading("Distribution of Your Estate"));
  if (isMirror) {
    if (c1Bens.length) {
      children.push(new Paragraph2({ children: [new TextRun2({ text: `Client 1 \u2014 ${record.client1FirstName || ""}`, bold: true, size: 20 })], spacing: { after: 80 } }));
      children.push(bodyPara("Your estate will be distributed as follows:"));
      children.push(...benListParas(c1Bens));
      if (record.client1ResidualEstate) children.push(boldBodyPara("Any remaining estate will pass to", record.client1ResidualEstate));
    }
    if (c2Bens.length) {
      children.push(new Paragraph2({ children: [new TextRun2({ text: `Client 2 \u2014 ${record.client2FirstName || ""}`, bold: true, size: 20 })], spacing: { before: 120, after: 80 } }));
      children.push(bodyPara("Your estate will be distributed as follows:"));
      children.push(...benListParas(c2Bens));
      if (record.client2ResidualEstate) children.push(boldBodyPara("Any remaining estate will pass to", record.client2ResidualEstate));
    }
  } else {
    children.push(...benListParas(c1Bens));
    if (record.client1ResidualEstate) children.push(boldBodyPara("Any remaining estate will pass to", record.client1ResidualEstate));
  }
  if (record.disasterClauseNotes || record.disasterClauseClient1) {
    children.push(spacerPara());
    children.push(new Paragraph2({ children: [new TextRun2({ text: "Disaster Clause", bold: true, size: 20 })], spacing: { after: 60 } }));
    children.push(bodyPara(record.disasterClauseNotes || record.disasterClauseClient1));
  }
  children.push(pageBreakPara());
  children.push(heading1("Assets, Gifts & Wishes"));
  if (propAddress || propValue) {
    children.push(dividerPara());
    children.push(sectionHeading("Property & Financial Overview"));
    if (propAddress) children.push(labelValuePara("Property Address", propAddress));
    if (propOwnership) children.push(labelValuePara("Ownership", capitalize2(propOwnership)));
    if (propValue) children.push(labelValuePara("Estimated Value", propValue.startsWith("\xA3") ? propValue : `\xA3${propValue}`));
    if (mortgage && mortgage !== "no" && mortgage !== "0") children.push(labelValuePara("Mortgage", mortgage));
    else children.push(labelValuePara("Mortgage", "None"));
    if (lifeInsurance === "yes") {
      const provider = lifeInsurancePolicies.map((p) => p.provider || "").filter(Boolean).join(", ");
      children.push(labelValuePara("Life Insurance", provider || "Yes"));
    }
    if (assetsOutsideUK === "yes") children.push(labelValuePara("Assets Outside UK", "Yes"));
    const propertiesWithGift = (Array.isArray(record.properties) ? record.properties : []).filter((p) => p.giftOfProperty === 1 || p.giftOfProperty === true);
    if (propertiesWithGift.length > 0) {
      children.push(new Paragraph2({ children: [new TextRun2({ text: "Gift of Property Clause", bold: true, size: 20, color: LIGHT_GREEN })], spacing: { before: 160, after: 80 } }));
      propertiesWithGift.forEach((p) => {
        const addr = fmt2(p.address) || "Property";
        const group = p.giftRecipientGroup;
        const isNamed = !group || group === "__named" || group === "named" || group === "Named individual";
        const recipientDisplay = isNamed ? fmt2(p.giftRecipientName) || "Named individual" : group;
        children.push(new Paragraph2({ children: [new TextRun2({ text: addr, bold: true, size: 20 })], spacing: { after: 40 } }));
        children.push(labelValuePara("Gift to", recipientDisplay));
        if (isNamed && fmt2(p.giftRecipientAddress)) children.push(labelValuePara("Recipient Address", fmt2(p.giftRecipientAddress)));
        if (fmt2(p.giftCondition)) children.push(labelValuePara("Condition", fmt2(p.giftCondition)));
        if (fmt2(p.giftNotes)) children.push(labelValuePara("Notes", fmt2(p.giftNotes)));
        children.push(spacerPara());
      });
    }
    children.push(spacerPara());
  }
  if (c1Gifts.length > 0 || c2Gifts.length > 0) {
    children.push(dividerPara());
    children.push(sectionHeading("Specific Gifts"));
    children.push(bodyPara(`You have instructed that the following gifts are to be included within your Will${isMirror ? "s" : ""}:`));
    if (isMirror) {
      children.push(...giftParas(c1Gifts, `Client 1 \u2014 ${record.client1FirstName || ""}`));
      children.push(...giftParas(c2Gifts, `Client 2 \u2014 ${record.client2FirstName || ""}`));
    } else {
      children.push(...giftParas(c1Gifts, ""));
    }
  }
  if (c1FuneralType || c1FuneralWishes || c1OrganDonation) {
    children.push(dividerPara());
    children.push(sectionHeading("Funeral Wishes & Organ Donation"));
    if (isMirror) {
      if (c1FuneralType || c1FuneralWishes || c1OrganDonation) {
        children.push(new Paragraph2({ children: [new TextRun2({ text: `Client 1 \u2014 ${record.client1FirstName || ""}`, bold: true, size: 20 })], spacing: { after: 80 } }));
        if (c1FuneralType) children.push(labelValuePara("Funeral Preference", capitalize2(c1FuneralType)));
        if (c1OrganDonation) children.push(labelValuePara("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No"));
        if (c1FuneralWishes) children.push(new Paragraph2({ children: [new TextRun2({ text: `"${c1FuneralWishes}"`, italics: true, size: 20 })], spacing: { after: 80 } }));
      }
      if (c2FuneralType || c2FuneralWishes || c2OrganDonation) {
        children.push(new Paragraph2({ children: [new TextRun2({ text: `Client 2 \u2014 ${record.client2FirstName || ""}`, bold: true, size: 20 })], spacing: { before: 120, after: 80 } }));
        if (c2FuneralType) children.push(labelValuePara("Funeral Preference", capitalize2(c2FuneralType)));
        if (c2OrganDonation) children.push(labelValuePara("Organ Donation", c2OrganDonation === "yes" ? "Yes" : "No"));
        if (c2FuneralWishes) children.push(new Paragraph2({ children: [new TextRun2({ text: `"${c2FuneralWishes}"`, italics: true, size: 20 })], spacing: { after: 80 } }));
      }
    } else {
      if (c1FuneralType) children.push(labelValuePara("Funeral Preference", capitalize2(c1FuneralType)));
      if (c1OrganDonation) children.push(labelValuePara("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No"));
      if (c1FuneralWishes) children.push(new Paragraph2({ children: [new TextRun2({ text: `"${c1FuneralWishes}"`, italics: true, size: 20 })], spacing: { after: 80 } }));
    }
  }
  if (record.additionalNotes || record.specialNotes) {
    children.push(dividerPara());
    children.push(new Paragraph2({ children: [new TextRun2({ text: "Additional Notes", bold: true, size: 22 })], spacing: { after: 80 } }));
    children.push(bodyPara(record.additionalNotes || record.specialNotes));
  }
  children.push(pageBreakPara());
  children.push(heading1("Next Steps & Our Services"));
  children.push(dividerPara());
  children.push(sectionHeading("Additional Services We Offer"));
  children.push(bodyPara("While you have instructed us for a Will, we offer a comprehensive range of services to protect your assets and your family:"));
  spacerPara();
  const services = [
    ["Lasting Powers of Attorney (LPAs)", "Appoint someone to make decisions on your behalf regarding Health & Welfare or Property & Financial Affairs should you become mentally incapable."],
    ["Trusts", "Valuable tools to protect assets and control how they are distributed to beneficiaries."],
    ["Inheritance Tax Planning", "Strategies to minimise the tax burden on your estate."],
    ["Probate Administration", "Professional assistance for executors in gathering assets, paying debts, and distributing the estate."]
  ];
  services.forEach(([title, desc3]) => {
    children.push(new Paragraph2({
      children: [
        new TextRun2({ text: `${title}: `, bold: true, size: 20 }),
        new TextRun2({ text: desc3, size: 20 })
      ],
      spacing: { after: 80 },
      indent: { left: convertMillimetersToTwip(5) }
    }));
  });
  children.push(spacerPara());
  children.push(dividerPara());
  children.push(sectionHeading("What Happens Next?"));
  const steps = [
    ["1. Verification", "Please review the Summary of Instructions in this pack carefully. It is vital that all names, addresses, and dates of birth are 100% accurate."],
    ["2. Cooling-Off Period", "We will begin work on your legal documents immediately upon the expiration of your 14-day cooling-off period."],
    ["3. Drafting", `You will receive your draft documents approximately 2 weeks from today${estimatedDraft ? ` (estimated: ${estimatedDraft})` : ""}, depending on case complexity.`],
    ["4. Finalisation & Signing", "Once you approve the drafts, we will prepare the final documents for signing (attestation)."]
  ];
  steps.forEach(([title, desc3]) => {
    children.push(new Paragraph2({
      children: [
        new TextRun2({ text: `${title}: `, bold: true, size: 20 }),
        new TextRun2({ text: desc3, size: 20 })
      ],
      spacing: { after: 100 }
    }));
  });
  children.push(dividerPara());
  children.push(bodyPara("If you spot any errors in the summary, please reply to this correspondence immediately so we can correct our records before drafting begins."));
  children.push(spacerPara());
  children.push(new Paragraph2({ children: [new TextRun2({ text: "Yours sincerely,", size: 20 })], spacing: { after: 80 } }));
  children.push(spacerPara());
  children.push(new Paragraph2({ children: [new TextRun2({ text: coordinatorName, bold: true, size: 24, color: GREEN2, font: "Georgia" })], spacing: { after: 60 } }));
  children.push(new Paragraph2({ children: [new TextRun2({ text: "Genesis Wills and Estate Planning", size: 20 })], spacing: { after: 60 } }));
  if (coordinatorPhone) children.push(new Paragraph2({ children: [new TextRun2({ text: coordinatorPhone, size: 20 })], spacing: { after: 60 } }));
  if (coordinatorEmail) children.push(new Paragraph2({ children: [new TextRun2({ text: coordinatorEmail, size: 20 })], spacing: { after: 60 } }));
  const plainBorder = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" };
  const doc = new Document2({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20 }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(20),
            right: convertMillimetersToTwip(22),
            bottom: convertMillimetersToTwip(20),
            left: convertMillimetersToTwip(22)
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph2({
              children: [
                new TextRun2({ text: "Genesis Wills and Estate Planning", color: GREEN2, size: 16, bold: true }),
                new TextRun2({ text: "  |  Strictly Private & Confidential", color: "9CA3AF", size: 16 }),
                refNum ? new TextRun2({ text: `  |  Ref: ${refNum}`, color: "9CA3AF", size: 16 }) : new TextRun2({ text: "" })
              ],
              // NO border on header paragraph — the user can delete the header entirely
              spacing: { after: 80 }
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph2({
              children: [
                new TextRun2({ text: "Genesis Wills and Estate Planning  |  Confidential  |  ", color: "9CA3AF", size: 14 }),
                new TextRun2({ text: today2, color: "9CA3AF", size: 14 })
              ],
              alignment: AlignmentType2.CENTER,
              spacing: { before: 80 }
            })
          ]
        })
      },
      children
    }]
  });
  return Buffer.from(await Packer2.toBuffer(doc));
}

// server/_core/index.ts
import { createRequire } from "module";
var _require = createRequire(import.meta.url);
async function createApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/debug", async (_req, res) => {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlLen = (process.env.DATABASE_URL ?? "").length;
    let dbOk = false;
    let dbError = "";
    try {
      const db = await getDb();
      if (db) {
        const result = await db.execute(sql`SELECT 1 as test`);
        dbOk = true;
      } else {
        dbError = "getDb() returned null";
      }
    } catch (e) {
      dbError = e.message ?? String(e);
    }
    res.json({
      dbUrlSet: hasDbUrl,
      dbUrlLength: dbUrlLen,
      dbConnected: dbOk,
      dbError: dbError || void 0,
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      ts: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.get("/api/submissions/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const rows = await db.select().from(willInstructions).where(eq6(willInstructions.id, id)).limit(1);
      if (!rows.length) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const pdfBuffer = await generateWillPdf(rows[0]);
      const filename = `Genesis_${rows[0].referenceNumber ?? id}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[PDF] Error generating PDF:", err);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });
  app.get("/api/submissions/:id/welcome-pack-pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const rows = await db.select().from(willInstructions).where(eq6(willInstructions.id, id)).limit(1);
      if (!rows.length) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const record = rows[0];
      const savedHtml = record.editedWelcomePackHtml;
      const html = savedHtml || generateWelcomePackHtml(record);
      const pdfBuffer = await htmlToPdf(html);
      const clientName = [record.client1FirstName, record.client1LastName].filter(Boolean).join("_") || String(id);
      const editedSuffix = savedHtml ? "_edited" : "";
      const filename = `WelcomePack_${clientName}_${record.referenceNumber ?? id}${editedSuffix}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[WelcomePack PDF] Error:", err);
      res.status(500).json({ error: "Failed to generate Welcome Pack PDF" });
    }
  });
  app.get("/api/submissions/:id/welcome-pack-preview", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const rows = await db.select().from(willInstructions).where(eq6(willInstructions.id, id)).limit(1);
      if (!rows.length) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const record = rows[0];
      const savedHtml = record.editedWelcomePackHtml;
      const html = savedHtml || generateWelcomePackHtml(record);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("X-Welcome-Pack-Edited", savedHtml ? "true" : "false");
      res.send(html);
    } catch (err) {
      console.error("[WelcomePack Preview] Error:", err);
      res.status(500).json({ error: "Failed to generate Welcome Pack preview" });
    }
  });
  app.post("/api/submissions/:id/welcome-pack-html", express.json({ limit: "10mb" }), async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const { html } = req.body;
      if (!html || typeof html !== "string") {
        res.status(400).json({ error: "html required" });
        return;
      }
      await db.update(willInstructions).set({ editedWelcomePackHtml: html }).where(eq6(willInstructions.id, id));
      res.json({ ok: true });
    } catch (err) {
      console.error("[WelcomePack Save] Error:", err);
      res.status(500).json({ error: "Failed to save Welcome Pack HTML" });
    }
  });
  app.delete("/api/submissions/:id/welcome-pack-html", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      await db.update(willInstructions).set({ editedWelcomePackHtml: null }).where(eq6(willInstructions.id, id));
      res.json({ ok: true });
    } catch (err) {
      console.error("[WelcomePack Reset] Error:", err);
      res.status(500).json({ error: "Failed to reset Welcome Pack HTML" });
    }
  });
  app.get("/api/submissions/:id/welcome-pack-docx", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const rows = await db.select().from(willInstructions).where(eq6(willInstructions.id, id)).limit(1);
      if (!rows.length) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const record = rows[0];
      const clientName = [record.client1FirstName, record.client1LastName].filter(Boolean).join("_") || String(id);
      const savedHtml = record.editedWelcomePackHtml;
      if (savedHtml) {
        const HTMLtoDOCX = __require("html-to-docx");
        const docxBuffer2 = await HTMLtoDOCX(savedHtml, null, {
          title: `Welcome Pack - ${clientName || record.referenceNumber}`,
          font: "Calibri",
          fontSize: 22,
          margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        });
        const filename2 = `WelcomePack_${clientName}_${record.referenceNumber ?? id}_edited.docx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${filename2}"`);
        res.send(Buffer.from(docxBuffer2));
        return;
      }
      const docxBuffer = await generateWelcomePackDocx(record);
      const filename = `WelcomePack_${clientName}_${record.referenceNumber ?? id}.docx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(docxBuffer);
    } catch (err) {
      console.error("[WelcomePack DOCX] Error:", err);
      res.status(500).json({ error: "Failed to generate Welcome Pack Word document" });
    }
  });
  app.get("/api/submissions/:id/will", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const rows = await db.select().from(willInstructions).where(eq6(willInstructions.id, id)).limit(1);
      if (!rows.length) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const willType = req.query.willType || "single";
      const record = rows[0];
      const clientName = willType === "mirror_client2" ? [rows[0].client2FirstName, rows[0].client2LastName].filter(Boolean).join("_") : [rows[0].client1FirstName, rows[0].client1LastName].filter(Boolean).join("_");
      const savedHtmlKey = willType === "mirror_client2" ? "editedWillHtmlClient2" : willType === "mirror_client1" ? "editedWillHtmlClient1" : "editedWillHtmlSingle";
      const savedHtml = record[savedHtmlKey];
      if (savedHtml) {
        const printableHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Will</title><style>@media print{body{margin:0}}body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:20px}</style></head><body>${savedHtml}<script>window.onload=function(){window.print()}</script></body></html>`;
        const filename2 = `Will_${clientName || rows[0].referenceNumber}_${willType}_edited.html`;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename2}"`);
        res.send(printableHtml);
        return;
      }
      const options = {
        willType,
        includePPT: req.query.ppt === "1",
        includeDiscretionaryTrust: req.query.discretionary === "1",
        includeVulnerableTrust: req.query.vulnerable === "1"
      };
      const pdfBuffer = await generateWillDocument(rows[0], options);
      const filename = `Will_${clientName || rows[0].referenceNumber}_${willType}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[Will] Error generating Will:", err);
      res.status(500).json({ error: "Failed to generate Will" });
    }
  });
  app.get("/api/submissions/:id/will-docx", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const rows = await db.select().from(willInstructions).where(eq6(willInstructions.id, id)).limit(1);
      if (!rows.length) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const willType = req.query.willType || "single";
      const record = rows[0];
      const clientName = willType === "mirror_client2" ? [rows[0].client2FirstName, rows[0].client2LastName].filter(Boolean).join("_") : [rows[0].client1FirstName, rows[0].client1LastName].filter(Boolean).join("_");
      const savedHtmlKey = willType === "mirror_client2" ? "editedWillHtmlClient2" : willType === "mirror_client1" ? "editedWillHtmlClient1" : "editedWillHtmlSingle";
      const savedHtml = record[savedHtmlKey];
      if (savedHtml) {
        const HTMLtoDOCX = __require("html-to-docx");
        const docxBuffer2 = await HTMLtoDOCX(savedHtml, null, {
          title: `Will - ${clientName || rows[0].referenceNumber}`,
          font: "Times New Roman",
          fontSize: 24,
          margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        });
        const filename2 = `Will_${clientName || rows[0].referenceNumber}_${willType}_edited.docx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${filename2}"`);
        res.send(Buffer.from(docxBuffer2));
        return;
      }
      const opts = {
        willType,
        ppt: req.query.ppt === "1",
        discretionary: req.query.discretionary === "1",
        vulnerable: req.query.vulnerable === "1"
      };
      const docxBuffer = await generateWillDocx(record, opts);
      const filename = `Will_${clientName || rows[0].referenceNumber}_${willType}.docx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(docxBuffer);
    } catch (err) {
      console.error("[WillDocx] Error:", err);
      res.status(500).json({ error: "Failed to generate Word document" });
    }
  });
  app.get("/api/submissions/:id/will-html", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const rows = await db.select().from(willInstructions).where(eq6(willInstructions.id, id)).limit(1);
      if (!rows.length) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const willType = req.query.willType || "single";
      const record = rows[0];
      const savedHtmlKey = willType === "mirror_client2" ? "editedWillHtmlClient2" : willType === "mirror_client1" ? "editedWillHtmlClient1" : "editedWillHtmlSingle";
      const savedHtml = record[savedHtmlKey];
      if (savedHtml) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Will-Edited", "true");
        res.send(savedHtml);
        return;
      }
      const options = {
        willType,
        includePPT: req.query.ppt === "1",
        includeDiscretionaryTrust: req.query.discretionary === "1",
        includeVulnerableTrust: req.query.vulnerable === "1"
      };
      const html = generateWillHtml(rows[0], options);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Will-Edited", "false");
      res.send(html);
    } catch (err) {
      console.error("[WillHTML] Error:", err);
      res.status(500).json({ error: "Failed to generate Will HTML" });
    }
  });
  app.post("/api/submissions/:id/will-html", express.json({ limit: "10mb" }), async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const { html, willType } = req.body;
      if (!html || typeof html !== "string") {
        res.status(400).json({ error: "html required" });
        return;
      }
      const wt = willType || "single";
      const colName = wt === "mirror_client2" ? "editedWillHtmlClient2" : wt === "mirror_client1" ? "editedWillHtmlClient1" : "editedWillHtmlSingle";
      await db.update(willInstructions).set({ [colName]: html }).where(eq6(willInstructions.id, id));
      res.json({ ok: true });
    } catch (err) {
      console.error("[WillHTML Save] Error:", err);
      res.status(500).json({ error: "Failed to save Will HTML" });
    }
  });
  app.delete("/api/submissions/:id/will-html", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const wt = req.query.willType || "single";
      const colName = wt === "mirror_client2" ? "editedWillHtmlClient2" : wt === "mirror_client1" ? "editedWillHtmlClient1" : "editedWillHtmlSingle";
      await db.update(willInstructions).set({ [colName]: null }).where(eq6(willInstructions.id, id));
      res.json({ ok: true });
    } catch (err) {
      console.error("[WillHTML Reset] Error:", err);
      res.status(500).json({ error: "Failed to reset Will HTML" });
    }
  });
  app.get("/api/lpa/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const rows = await db.select().from(lpaRecords).where(eq6(lpaRecords.id, id)).limit(1);
      if (!rows.length) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const lpa = rows[0];
      const lpaType = lpa.lpaType ?? "property_finance";
      const safeArr5 = (v) => {
        if (!v) return [];
        if (Array.isArray(v)) return v;
        try {
          return JSON.parse(v) ?? [];
        } catch {
          return [];
        }
      };
      const data = {
        ...lpa,
        lpaType,
        attorneys: safeArr5(lpa.attorneys),
        replacementAttorneys: safeArr5(lpa.replacementAttorneys),
        peopleToNotify: safeArr5(lpa.peopleToNotify),
        // Section 12: applicant type — DB stores as snake_case
        applicantType: lpa.applicant_type ?? lpa.applicantType ?? "",
        // Section 13: recipient — DB stores as snake_case
        recipientType: lpa.recipient_type ?? lpa.recipientType ?? "",
        recipientTitle: lpa.recipient_title ?? lpa.recipientTitle ?? "",
        recipientFirstNames: lpa.recipient_first_names ?? lpa.recipientFirstNames ?? "",
        recipientLastName: lpa.recipient_last_name ?? lpa.recipientLastName ?? "",
        recipientCompany: lpa.recipient_company ?? lpa.recipientCompany ?? "",
        recipientAddressLine1: lpa.recipient_address_line1 ?? lpa.recipientAddressLine1 ?? "",
        recipientAddressLine2: lpa.recipient_address_line2 ?? lpa.recipientAddressLine2 ?? "",
        recipientAddressLine3: lpa.recipient_address_line3 ?? lpa.recipientAddressLine3 ?? "",
        recipientPostcode: lpa.recipient_postcode ?? lpa.recipientPostcode ?? "",
        // Section 13: delivery preferences stored as 0/1 ints — convert to boolean
        deliveryPost: !!(lpa.delivery_post ?? lpa.deliveryPost),
        deliveryPhone: !!(lpa.delivery_phone ?? lpa.deliveryPhone),
        deliveryEmail: !!(lpa.delivery_email ?? lpa.deliveryEmail),
        deliveryWelsh: !!(lpa.delivery_welsh ?? lpa.deliveryWelsh),
        // Section 14: fee options — DB stores as snake_case
        feePaymentMethod: lpa.fee_payment_method ?? lpa.feePaymentMethod ?? "",
        feeContactPhone: lpa.fee_contact_phone ?? lpa.feeContactPhone ?? "",
        reducedFee: !!(lpa.reduced_fee ?? lpa.reducedFee),
        repeatApplication: !!(lpa.repeat_application ?? lpa.repeatApplication),
        caseNumber: lpa.case_number ?? lpa.caseNumber ?? ""
      };
      const pdfBuffer = await fillLpaPdf(data);
      const donorName = [lpa.donorFirstNames, lpa.donorLastName].filter(Boolean).join("_") || String(id);
      const typeLabel = lpaType === "property_finance" ? "LP1F" : "LP1H";
      const filename = `LPA_${typeLabel}_${donorName}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[LPA PDF] Error:", err);
      res.status(500).json({ error: "Failed to generate LPA PDF" });
    }
  });
  app.post("/api/lpa/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }
      const rows = await db.select().from(lpaRecords).where(eq6(lpaRecords.id, id)).limit(1);
      if (!rows.length) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const lpa = rows[0];
      const overrides = req.body ?? {};
      const lpaType = overrides.lpaType ?? lpa.lpaType ?? "property_finance";
      const safeArr5 = (v) => {
        if (!v) return [];
        if (Array.isArray(v)) return v;
        try {
          return JSON.parse(v) ?? [];
        } catch {
          return [];
        }
      };
      const data = {
        ...lpa,
        ...overrides,
        lpaType,
        attorneys: Array.isArray(overrides.attorneys) ? overrides.attorneys : safeArr5(lpa.attorneys),
        replacementAttorneys: Array.isArray(overrides.replacementAttorneys) ? overrides.replacementAttorneys : safeArr5(lpa.replacementAttorneys),
        peopleToNotify: Array.isArray(overrides.peopleToNotify) ? overrides.peopleToNotify : safeArr5(lpa.peopleToNotify),
        applicantType: overrides.applicantType ?? lpa.applicant_type ?? lpa.applicantType ?? "",
        recipientType: overrides.recipientType ?? lpa.recipient_type ?? "",
        recipientTitle: overrides.recipientTitle ?? lpa.recipient_title ?? "",
        recipientFirstNames: overrides.recipientFirstNames ?? lpa.recipient_first_names ?? "",
        recipientLastName: overrides.recipientLastName ?? lpa.recipient_last_name ?? "",
        recipientCompany: overrides.recipientCompany ?? lpa.recipient_company ?? "",
        recipientAddressLine1: overrides.recipientAddressLine1 ?? lpa.recipient_address_line1 ?? "",
        recipientAddressLine2: overrides.recipientAddressLine2 ?? lpa.recipient_address_line2 ?? "",
        recipientAddressLine3: overrides.recipientAddressLine3 ?? lpa.recipient_address_line3 ?? "",
        recipientPostcode: overrides.recipientPostcode ?? lpa.recipient_postcode ?? "",
        deliveryPost: overrides.deliveryPost !== void 0 ? !!overrides.deliveryPost : !!(lpa.delivery_post ?? lpa.deliveryPost),
        deliveryPhone: overrides.deliveryPhone !== void 0 ? !!overrides.deliveryPhone : !!(lpa.delivery_phone ?? lpa.deliveryPhone),
        deliveryEmail: overrides.deliveryEmail !== void 0 ? !!overrides.deliveryEmail : !!(lpa.delivery_email ?? lpa.deliveryEmail),
        deliveryWelsh: overrides.deliveryWelsh !== void 0 ? !!overrides.deliveryWelsh : !!(lpa.delivery_welsh ?? lpa.deliveryWelsh),
        feePaymentMethod: overrides.feePaymentMethod ?? lpa.fee_payment_method ?? "",
        feeContactPhone: overrides.feeContactPhone ?? lpa.fee_contact_phone ?? "",
        reducedFee: overrides.reducedFee !== void 0 ? !!overrides.reducedFee : !!(lpa.reduced_fee ?? lpa.reducedFee),
        repeatApplication: overrides.repeatApplication !== void 0 ? !!overrides.repeatApplication : !!(lpa.repeat_application ?? lpa.repeatApplication),
        caseNumber: overrides.caseNumber ?? lpa.case_number ?? ""
      };
      const pdfBuffer = await fillLpaPdf(data);
      const d3 = data;
      const donorName = [d3.donorFirstNames, d3.donorLastName].filter(Boolean).join("_") || String(id);
      const typeLabel = lpaType === "property_finance" ? "LP1F" : "LP1H";
      const filename = `LPA_${typeLabel}_${donorName}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[LPA PDF POST] Error:", err);
      res.status(500).json({ error: "Failed to generate LPA PDF" });
    }
  });
  function injectDraftWatermark(html, draft) {
    if (!draft) return html;
    const style = `<style id="draft-watermark-style">
  /* Watermark repeats on every .page block (one per printed page) */
  .page { position: relative !important; overflow: hidden; }
  .page::before {
    content: 'DRAFT';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 110pt;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: rgba(170,170,170,0.22);
    pointer-events: none;
    z-index: 9999;
    white-space: nowrap;
    user-select: none;
  }
  @media print {
    .page::before {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>`;
    if (html.includes("</head>")) {
      return html.replace("</head>", `${style}
</head>`);
    }
    if (html.includes("<body")) {
      return html.replace(/(<body[^>]*>)/, `${style}
$1`);
    }
    return style + html;
  }
  app.get("/api/matters/:id/will", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const matter = await getMatterById(id);
      if (!matter) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const savedHtml = testatorRole === "testator1" ? matter.editedWillHtmlTestator1 : matter.editedWillHtmlTestator2;
      let html = savedHtml || generateWillHtml2(matter, testatorRole);
      const isEdited = !!savedHtml;
      const isDraft = req.query.draft === "1";
      html = injectDraftWatermark(html, isDraft);
      if (req.query.print === "1") {
        html = html.replace("</body>", `<script>window.onload=function(){window.print();}</script></body>`);
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Will-Edited", isEdited ? "true" : "false");
      res.send(html);
    } catch (err) {
      console.error("[Will V2] Error:", err);
      res.status(500).json({ error: "Failed to generate Will" });
    }
  });
  app.get("/api/matters/:id/will-pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const matter = await getMatterById(id);
      if (!matter) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const savedHtml = testatorRole === "testator1" ? matter.editedWillHtmlTestator1 : matter.editedWillHtmlTestator2;
      const html = savedHtml || generateWillHtml2(matter, testatorRole);
      const client = matter.clients.find((c) => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "Will").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      const pdfBuffer = await htmlToPdf(html);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}-Will.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Will V2 PDF] Error:", msg, err);
      res.status(500).json({ error: "Failed to generate Will PDF", detail: msg });
    }
  });
  app.post("/api/matters/:id/will-html", express.json({ limit: "10mb" }), async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const { html, testatorRole } = req.body;
      if (!html) {
        res.status(400).json({ error: "html is required" });
        return;
      }
      const role = testatorRole === "testator2" ? "testator2" : "testator1";
      const { saveEditedWillHtml: saveEditedWillHtml2 } = await Promise.resolve().then(() => (init_mattersDb(), mattersDb_exports));
      await saveEditedWillHtml2(id, role, html);
      res.json({ success: true });
    } catch (err) {
      console.error("[Will V2 Save] Error:", err);
      res.status(500).json({ error: "Failed to save Will HTML" });
    }
  });
  app.delete("/api/matters/:id/will-html", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      const { clearEditedWillHtml: clearEditedWillHtml2 } = await Promise.resolve().then(() => (init_mattersDb(), mattersDb_exports));
      await clearEditedWillHtml2(id, testatorRole);
      res.json({ success: true });
    } catch (err) {
      console.error("[Will V2 Reset] Error:", err);
      res.status(500).json({ error: "Failed to reset Will HTML" });
    }
  });
  app.get("/api/matters/:id/commentary", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const matter = await getMatterById(id);
      if (!matter) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      let html = generateCommentaryHtml(matter, testatorRole);
      const client = matter.clients.find((c) => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "Commentary").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      html = injectDraftWatermark(html, req.query.draft === "1");
      if (req.query.print === "1") {
        html = html.replace("</body>", `<script>window.onload=function(){window.print();}</script></body>`);
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `inline; filename="${safeName}-WillCommentary.html"`);
      res.send(html);
    } catch (err) {
      console.error("[Commentary] Error:", err);
      res.status(500).json({ error: "Failed to generate commentary" });
    }
  });
  app.get("/api/matters/:id/commentary-pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const matter = await getMatterById(id);
      if (!matter) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const html = generateCommentaryHtml(matter, testatorRole);
      const client = matter.clients.find((c) => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "Commentary").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      const pdfBuffer = await htmlToPdf(html);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}-WillCommentary.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Commentary PDF] Error:", msg, err);
      res.status(500).json({ error: "Failed to generate commentary PDF", detail: msg });
    }
  });
  app.get("/api/matters/:id/commentary-docx", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const matter = await getMatterById(id);
      if (!matter) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const html = generateCommentaryHtml(matter, testatorRole);
      const client = matter.clients.find((c) => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "Commentary").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      const HTMLtoDOCX = _require("html-to-docx");
      const docxBuffer = await HTMLtoDOCX(html, null, {
        title: `${safeName} \u2014 Will Commentary`,
        font: "Times New Roman",
        fontSize: 24,
        margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}-WillCommentary.docx"`);
      res.send(Buffer.from(docxBuffer));
    } catch (err) {
      console.error("[Commentary DOCX] Error:", err);
      res.status(500).json({ error: "Failed to generate commentary Word document" });
    }
  });
  app.get("/api/matters/:id/signing-guide", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const matter = await getMatterById(id);
      if (!matter) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      let html = generateSigningGuideHtml(matter, testatorRole);
      const client = matter.clients.find((c) => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "SigningGuide").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      html = injectDraftWatermark(html, req.query.draft === "1");
      if (req.query.print === "1") {
        html = html.replace("</body>", `<script>window.onload=function(){window.print();}</script></body>`);
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `inline; filename="${safeName}-WillSigningGuide.html"`);
      res.send(html);
    } catch (err) {
      console.error("[Signing Guide] Error:", err);
      res.status(500).json({ error: "Failed to generate signing guide" });
    }
  });
  app.get("/api/matters/:id/signing-guide-pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const matter = await getMatterById(id);
      if (!matter) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const html = generateSigningGuideHtml(matter, testatorRole);
      const client = matter.clients.find((c) => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "SigningGuide").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      const pdfBuffer = await htmlToPdf(html);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}-WillSigningGuide.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Signing Guide PDF] Error:", msg, err);
      res.status(500).json({ error: "Failed to generate signing guide PDF", detail: msg });
    }
  });
  app.get("/api/matters/:id/letter-of-wishes", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }
      const matter = await getMatterById(id);
      if (!matter) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      let html = generateLetterOfWishesHtml(matter, testatorRole);
      const client = matter.clients.find((c) => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "LetterOfWishes").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      html = injectDraftWatermark(html, req.query.draft === "1");
      if (req.query.print === "1") {
        html = html.replace("</body>", `<script>window.onload=function(){window.print();}</script></body>`);
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `inline; filename="${safeName}-LetterOfWishes.html"`);
      res.send(html);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Letter of Wishes] Error:", msg, err);
      res.status(500).json({ error: "Failed to generate Letter of Wishes", detail: msg });
    }
  });
  app.get("/api/matters/:id/testimonium", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = req.query.testator === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) {
        res.status(404).json({ error: "Invalid id" });
        return;
      }
      const matter = await getMatterById(id);
      if (!matter) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      let html = generateTestimoniumHtml(matter, testatorRole);
      const client = matter.clients.find((c) => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "Testimonium").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      if (req.query.print === "1") {
        html = html.replace("</body>", `<script>window.onload=function(){window.print();}</script></body>`);
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `inline; filename="${safeName}-Testimonium.html"`);
      res.send(html);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Testimonium] Error:", msg, err);
      res.status(500).json({ error: "Failed to generate Testimonium", detail: msg });
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  return app;
}

// server/vercel/handler.ts
var appPromise = null;
var loadError = null;
function getApp() {
  if (!appPromise) {
    appPromise = createApp().catch((err) => {
      loadError = err instanceof Error ? `${err.message}
${err.stack}` : String(err);
      console.error("[API] createApp failed:", loadError);
      return null;
    });
  }
  return appPromise;
}
async function handler(req, res) {
  try {
    const app = await getApp();
    if (!app) {
      res.status(500).json({ error: "App init failed", detail: loadError });
      return;
    }
    app(req, res);
  } catch (err) {
    const msg = err instanceof Error ? `${err.message}
${err.stack}` : String(err);
    res.status(500).json({ error: "Handler error", detail: msg });
  }
}
export {
  handler as default
};
