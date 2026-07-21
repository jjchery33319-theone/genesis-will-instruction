import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3jH8p3qqQNaPpfE.root',
  password: 'HAnnvupa8TFGqvt7',
  database: 'genesis_wills',
  ssl: { rejectUnauthorized: true }
});

const [rows] = await conn.execute(
  "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='will_instructions' ORDER BY ORDINAL_POSITION"
);

const liveCols = new Set(rows.map(r => r.COLUMN_NAME));
const liveColTypes = {};
rows.forEach(r => { liveColTypes[r.COLUMN_NAME] = r.COLUMN_TYPE; });

console.log('Total live columns:', liveCols.size);

// All columns the code schema defines (from drizzle/schema.ts)
const codeCols = [
  'id','referenceNumber','appointmentDate','appointmentTime','consultantName','consultantEmail',
  'consultantPhone','caseCoordinatorName','caseCoordinatorEmail','caseCoordinatorPhone',
  'priceQuoted','estimatedDraftDate','productsOrdered','willType','lpaType',
  'client1Prefix','client1FirstName','client1MiddleName','client1LastName','client1Dob',
  'client1AddressLine1','client1City','client1Postcode','client1MaritalStatus','client1JobTitle',
  'client1DaytimePhone','client1Mobile','client1Email','client1Nationality',
  'client2Prefix','client2FirstName','client2MiddleName','client2LastName','client2Dob',
  'client2AddressLine1','client2City','client2Postcode','client2MaritalStatus','client2JobTitle',
  'client2DaytimePhone','client2Mobile','client2Email','client2Nationality',
  'client1MarriagePlans','client1MarriagePlanDetails','client1HasChildren','client1TotalChildren',
  'client1ChildrenSpecialNeeds','client1ChildrenSpecialNeedsDetails','client1ChildrenUnder18',
  'client1ChildrenOver18','client1ChildrenDetails','client1FamilyCircumstances',
  'client2MarriagePlans','client2MarriagePlanDetails','client2HasChildren','client2TotalChildren',
  'client2ChildrenSpecialNeeds','client2ChildrenSpecialNeedsDetails','client2ChildrenUnder18',
  'client2ChildrenOver18','client2ChildrenDetails','client2FamilyCircumstances',
  'client1Residency','client1DomiciledUK','client1MentalCapacity','client1MentalCapacityNotes',
  'client1ChildrenPastRelationships','client1ChildrenPastDetails',
  'client2Residency','client2DomiciledUK','client2MentalCapacity','client2MentalCapacityNotes',
  'client2ChildrenPastRelationships','client2ChildrenPastDetails',
  'ddArrangedAppointment','ddArrangedAppointmentNotes','ddKnowledgeOfEstate',
  'ddKnowledgeOfEstateNotes','ddKnewBeneficiaries','ddKnewBeneficiariesNotes',
  'ddSignsOfInfluence','ddSignsOfInfluenceNotes','ddKnewAppointees','ddKnewAppointeesNotes',
  'ddClientSince','ddFirstContactDate','ddMeetingType','ddOthersPresent','ddOthersPresentNotes',
  'ddClientCanSee','ddClientCanHear','ddClientCanSpeak',
  'executors','reservedExecutors','trustees','guardians','reservedGuardians','beneficiaries',
  'client1Executors','client1ReservedExecutors','client2Executors','client2ReservedExecutors',
  'client1Guardians','client1ReservedGuardians','client2Guardians','client2ReservedGuardians',
  'client1Beneficiaries','client2Beneficiaries',
  'client1SpecificGifts','client2SpecificGifts',
  'childrenBenefitAge','disasterClauseClient1','disasterClauseClient2',
  'client1ResidualEstate','client1ResidualBackup','client1ChildrenBenefitAge',
  'client1HasVulnerableBeneficiary','client1VulnerableBeneficiaryDetails',
  'client2ResidualEstate','client2ResidualBackup','client2ChildrenBenefitAge',
  'client2HasVulnerableBeneficiary','client2VulnerableBeneficiaryDetails',
  'client1FuneralType','client1FuneralWishes','client1OrganDonation',
  'client2FuneralType','client2FuneralWishes','client2OrganDonation',
  'propertyOwned','propertyAddress','propertyOwnership','mortgageOutstanding',
  'mortgageBalance','mortgageTermRemaining','mortgageLender','propertyValue',
  'hasOtherProperties','otherProperties','assetsOutsideUK','assetsOutsideUKDetails',
  'bankAccounts','investments','pensionDetails','estimatedEstateValue',
  'client2BankAccounts','client2Investments','client2PensionDetails','client2EstimatedEstateValue',
  'hasLifeInsurance','lifeInsurancePolicies','lifeInsuranceNotes',
  'hasBusinessInterests','businessInterests','businessInterestsDetails',
  'specificGifts','hasPets','petsDetails','petsCarer',
  'residuaryEstate','residuaryBackup','funeralType','funeralWishes','organDonation',
  'hasVulnerableBeneficiary','vulnerableBeneficiaryDetails',
  'careConcerns','careConcernDetails','disasterClauseNotes','additionalNotes','specialNotes',
  'protective_property_trusts','discretionary_trusts','vulnerable_person_trusts',
  'nil_rate_band_trusts','bereaved_minor_trusts','age_18_to_25_trusts','business_property_reliefs',
  'manualNeedsAssessment','considerLPA','considerPPT','considerAAT',
  'recommendationsJson','aiRecommendationNarrative','aiClientEmailDraft',
  'editedWillHtmlSingle','editedWillHtmlClient1','editedWillHtmlClient2','editedWelcomePackHtml',
  'optionalClauses',
  'status','currentStep','emailSent','createdAt','updatedAt'
];

const missing = codeCols.filter(c => !liveCols.has(c));
console.log('Columns in CODE but NOT in live DB:', missing.length, missing);

const extra = [...liveCols].filter(c => !codeCols.includes(c));
console.log('Columns in LIVE DB but NOT in code:', extra.length, extra);

// Also check column types for key fields
const checkTypes = ['ddClientSince', 'ddFirstContactDate', 'client1Dob', 'client2Dob', 'appointmentDate'];
for (const col of checkTypes) {
  if (liveColTypes[col]) {
    console.log(`Type of ${col}: ${liveColTypes[col]}`);
  }
}

await conn.end();
