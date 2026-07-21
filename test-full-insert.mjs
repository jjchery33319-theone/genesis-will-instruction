/**
 * Reproduce the exact submission error by running the exact params from the error message
 */
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3jH8p3qqQNaPpfE.root',
  password: 'HAnnvupa8TFGqvt7',
  database: 'genesis_wills',
  ssl: { rejectUnauthorized: true }
});

// These are the exact params from the error message (in order)
const params = [
  'GEP-STILLWELLBAKER-TEST',  // referenceNumber
  '2026-06-02',               // appointmentDate
  '11:00',                    // appointmentTime
  'Jacques Chery',            // consultantName
  'jacques.chery@genesisestateplanning.co.uk', // consultantEmail
  '+44 7479 538275',          // consultantPhone
  'Amelia Fox',               // caseCoordinatorName
  'amelia@genesisestateplanning.info', // caseCoordinatorEmail
  '0330 118 0937',            // caseCoordinatorPhone
  '2026-08-04',               // estimatedDraftDate
  JSON.stringify(['mirror_wills']), // productsOrdered
  'Mirror Wills',             // willType
  'Mrs',                      // client1Prefix
  'Linda',                    // client1FirstName
  'Sue',                      // client1MiddleName
  'Stillwell-Baker',          // client1LastName
  '1961-06-19',               // client1Dob
  '18 Apley close',           // client1AddressLine1
  'Harrogate',                // client1City
  'HG2 8PS',                  // client1Postcode
  'Married',                  // client1MaritalStatus
  '07788888323',              // client1Mobile
  'lindastillwell@blueyonder.co.uk', // client1Email
  'British',                  // client1Nationality
  'Mr',                       // client2Prefix
  'David',                    // client2FirstName
  '',                         // client2MiddleName
  'Scarlet-Baker',            // client2LastName
  '1962-03-03',               // client2Dob
  '18 Apley close',           // client2AddressLine1
  'Harrogate',                // client2City
  'HG2 8PS',                  // client2Postcode
  'Married',                  // client2MaritalStatus
  '07979323676',              // client2Mobile
  'david.baker@qmul.ac.uk',  // client2Email
  'British',                  // client2Nationality
  'not_applicable',           // client1MarriagePlans
  'no',                       // client1HasChildren
  JSON.stringify([]),         // client1ChildrenUnder18
  JSON.stringify([]),         // client1ChildrenOver18
  'not_applicable',           // client2MarriagePlans
  'no',                       // client2HasChildren
  JSON.stringify([]),         // client2ChildrenUnder18
  JSON.stringify([]),         // client2ChildrenOver18
  'UK',                       // client1Residency
  'yes',                      // client1DomiciledUK
  'yes',                      // client1MentalCapacity
  'no',                       // client1ChildrenPastRelationships
  'UK',                       // client2Residency
  'yes',                      // client2DomiciledUK
  'yes',                      // client2MentalCapacity
  '',                         // client2MentalCapacityNotes (null in error)
  'no',                       // client2ChildrenPastRelationships
  '',                         // client2ChildrenPastDetails (null in error)
  'yes',                      // ddArrangedAppointment
  'yes',                      // ddKnowledgeOfEstate
  'yes',                      // ddKnewBeneficiaries
  'no',                       // ddSignsOfInfluence
  'yes',                      // ddKnewAppointees
  JSON.stringify([{"firstName":"Kelly","lastName":"Jackson","dob":"1987-04-10"},{"firstName":"Leon","lastName":"Baker","dob":"1983-03-11"}]), // executors (from error)
  JSON.stringify([]),         // reservedExecutors
  JSON.stringify([]),         // trustees
  JSON.stringify([]),         // guardians
  JSON.stringify([]),         // reservedGuardians
  JSON.stringify([{"firstName":"Colin","lastName":"Baker","relationship":"brother"},{"firstName":"Kelly","lastName":"Baker","relationship":"niece/nephew"},{"firstName":"Leon","lastName":"Baker","relationship":"niece/nephew"},{"firstName":"Mary","lastName":"Stillwell","relationship":"relative"},{"firstName":"Kevin","lastName":"Stillwell","relationship":"niece/nephew"},{"firstName":"Kennedy","lastName":"Stillwell","relationship":"niece/nephew"}]), // beneficiaries
  JSON.stringify([{"prefix":"Mr","firstName":"David","lastName":"Scarlet-Baker","relationship":"Spouse / Partner","address":"18 Apley close, Harrogate, HG2 8PS","phone":"07979323676","email":"david.baker@qmul.ac.uk","dob":"1962-03-03"}]), // client1Executors
  JSON.stringify([{"prefix":"Mrs","firstName":"Kelly","lastName":"Jackson","address":"256 Skipton Road, Harrogate, HG1 3NB","dob":"1987-04-10"},{"prefix":"Mr","firstName":"Leon Peter","lastName":"Baker","address":"12 Larkspur Grove, Harrogate, HG3 2YA","dob":"1983-03-11"}]), // client1ReservedExecutors
  JSON.stringify([{"prefix":"Mrs","firstName":"Linda","lastName":"Stillwell-Baker","relationship":"Spouse / Partner","address":"18 Apley close, Harrogate, HG2 8PS","phone":"07788888323","email":"lindastillwell@blueyonder.co.uk","dob":"1961-06-19"},{"prefix":"Mr","firstName":"David","lastName":"Scarlet-Baker","relationship":"Spouse / Partner","address":"18 Apley close, Harrogate, HG2 8PS","phone":"07979323676","email":"david.baker@qmul.ac.uk","dob":"1962-03-03"}]), // client2Executors
  JSON.stringify([{"prefix":"Mrs","firstName":"Kelly","lastName":"Jackson","address":"256 Skipton Road, Harrogate, HG1 3NB","dob":"1987-04-10"},{"prefix":"Mr","firstName":"Leon Peter","lastName":"Baker","address":"12 Larkspur Grove, Harrogate, HG3 2YA","dob":"1983-03-11"}]), // client2ReservedExecutors
  JSON.stringify([]),         // client1Guardians
  JSON.stringify([]),         // client1ReservedGuardians
  JSON.stringify([]),         // client2Guardians
  JSON.stringify([]),         // client2ReservedGuardians
  JSON.stringify([]),         // client1Beneficiaries
  JSON.stringify([]),         // client2Beneficiaries
  JSON.stringify([{"description":"All of Linda's jewelry, as well as her Mulberry and other high-end handbags","recipient":"Kelly Jackson","value":"","isCharity":false,"notes":""}]), // client1SpecificGifts
  JSON.stringify([{"description":"A World War I George V item and the fighting fish and seahorse statues","recipient":"Leon Peter Baker","value":"","isCharity":false,"notes":""}]), // client2SpecificGifts
  "To Mary Katherine Stillwell-Martin, Kevin Clark and Kennedy Charles Nortness in equal shares", // client1ResidualEstate
  "to my brother Colin Baker, Kelly Jackson (nee Baker) and Leon Peter Baker in equal shares ", // client2ResidualEstate
  'Cremation',                // client1FuneralType
  "I wish my ashes to be returned to the U.S.A and ashes spread on Haytack rock cannon beach, Mount Hood, Oregon; Wakeema Falls, Columbia Gorge", // client1FuneralWishes
  'Cremation',                // client2FuneralType
  'yes',                      // propertyOwned
  '18 Apley close, Harrogate, HG2 8PS', // propertyAddress
  'Joint Tenants',            // propertyOwnership
  '1 million',                // propertyValue
  'no',                       // mortgageOutstanding
  JSON.stringify([]),         // otherProperties (as array - this is what the form sends!)
  'no',                       // hasPets
  'no_preference',            // organDonation (used as funeralType backup)
  'Ashes to be scattered in a specific location', // funeralWishes
  'not_stated',               // hasVulnerableBeneficiary
  "Specific gifts to be handled through a separate Letter of Wishes. Total estate value estimated at £1.3 million or more. David has approximately £200,000 in savings. Linda has a private pension worth roughly £110,000. David has a large active pension pot from which he draws roughly £60,000 a year, which passes to Linda upon his death.", // additionalNotes
  JSON.stringify([]),         // protective_property_trusts
  JSON.stringify([]),         // discretionary_trusts
  JSON.stringify([]),         // vulnerable_person_trusts
  JSON.stringify([]),         // nil_rate_band_trusts
  JSON.stringify([]),         // bereaved_minor_trusts
  JSON.stringify([]),         // age_18_to_25_trusts
  JSON.stringify([]),         // business_property_reliefs
  1,                          // considerLPA
  1,                          // considerPPT
  1,                          // considerAAT
  JSON.stringify([]),         // recommendationsJson
  'No needs assessment or recommendations were recorded for this instruction.', // aiRecommendationNarrative
  '',                         // aiClientEmailDraft
  'submitted',                // status
  0,                          // emailSent
];

try {
  // Use a simplified insert to find the problematic column
  // First check if otherProperties column type is string or JSON
  const [colInfo] = await conn.execute(
    "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='will_instructions' AND COLUMN_NAME='otherProperties'"
  );
  console.log('otherProperties column type:', colInfo);

  // Try inserting with otherProperties as JSON array vs string
  await conn.execute(
    'INSERT INTO will_instructions (referenceNumber, willType, client1FirstName, client1LastName, client1MarriagePlans, client2MarriagePlans, propertyOwnership, otherProperties, status, considerLPA, considerPPT, considerAAT, emailSent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['TEST-DELETE-ME-3', 'Mirror Wills', 'Linda', 'Stillwell-Baker', 'not_applicable', 'not_applicable', 'Joint Tenants', JSON.stringify([]), 'submitted', 1, 1, 1, 0]
  );
  console.log('Insert with otherProperties as JSON array: OK');
  await conn.execute('DELETE FROM will_instructions WHERE referenceNumber = ?', ['TEST-DELETE-ME-3']);
} catch(e) {
  console.error('Insert with otherProperties as JSON array FAILED:', e.message);
  console.error('SQL State:', e.sqlState, 'Error Code:', e.errno);
}

await conn.end();
