/**
 * Reproduce the exact submission error by sending the same data to the local dev server
 */
const BASE = 'http://localhost:3000';

const payload = {
  willType: "Mirror Wills",
  appointmentDate: "2026-06-02",
  appointmentTime: "11:00",
  consultantName: "Jacques Chery",
  consultantEmail: "jacques.chery@genesisestateplanning.co.uk",
  consultantPhone: "+44 7479 538275",
  caseCoordinatorName: "Amelia Fox",
  caseCoordinatorEmail: "amelia@genesisestateplanning.info",
  caseCoordinatorPhone: "0330 118 0937",
  estimatedDraftDate: "2026-08-04",
  productsOrdered: ["mirror_wills"],
  client1Prefix: "Mrs",
  client1FirstName: "Linda",
  client1MiddleName: "Sue",
  client1LastName: "Stillwell-Baker",
  client1Dob: "1961-06-19",
  client1AddressLine1: "18 Apley close",
  client1City: "Harrogate",
  client1Postcode: "HG2 8PS",
  client1MaritalStatus: "Married",
  client1Mobile: "07788888323",
  client1Email: "lindastillwell@blueyonder.co.uk",
  client1Nationality: "British",
  client2Prefix: "Mr",
  client2FirstName: "David",
  client2MiddleName: "",
  client2LastName: "Scarlet-Baker",
  client2Dob: "1962-03-03",
  client2AddressLine1: "18 Apley close",
  client2City: "Harrogate",
  client2Postcode: "HG2 8PS",
  client2MaritalStatus: "Married",
  client2Mobile: "07979323676",
  client2Email: "david.baker@qmul.ac.uk",
  client2Nationality: "British",
  client1MarriagePlans: "not_applicable",
  client1HasChildren: "no",
  client1ChildrenUnder18: [],
  client1ChildrenOver18: [],
  client2MarriagePlans: "not_applicable",
  client2HasChildren: "no",
  client2ChildrenUnder18: [],
  client2ChildrenOver18: [],
  client1Residency: "UK",
  client1DomiciledUK: "yes",
  client1MentalCapacity: "yes",
  client2Residency: "UK",
  client2DomiciledUK: "yes",
  client2MentalCapacity: "yes",
  ddArrangedAppointment: "yes",
  ddKnowledgeOfEstate: "yes",
  ddKnewBeneficiaries: "yes",
  ddSignsOfInfluence: "no",
  ddKnewAppointees: "yes",
  executors: [],
  reservedExecutors: [],
  trustees: [],
  guardians: [],
  reservedGuardians: [],
  beneficiaries: [],
  client1Executors: [{"prefix":"Mr","firstName":"David","lastName":"Scarlet-Baker","relationship":"Spouse / Partner","address":"18 Apley close, Harrogate, HG2 8PS","phone":"07979323676","email":"david.baker@qmul.ac.uk","dob":"1962-03-03"}],
  client1ReservedExecutors: [{"prefix":"Mrs","firstName":"Kelly","lastName":"Jackson","address":"256 Skipton Road, Harrogate, HG1 3NB","dob":"1987-04-10"},{"prefix":"Mr","firstName":"Leon Peter","lastName":"Baker","address":"12 Larkspur Grove, Harrogate, HG3 2YA","dob":"1983-03-11"}],
  client2Executors: [{"prefix":"Mrs","firstName":"Linda","lastName":"Stillwell-Baker","relationship":"Spouse / Partner","address":"18 Apley close, Harrogate, HG2 8PS","phone":"07788888323","email":"lindastillwell@blueyonder.co.uk","dob":"1961-06-19"},{"prefix":"Mr","firstName":"David","lastName":"Scarlet-Baker","relationship":"Spouse / Partner","address":"18 Apley close, Harrogate, HG2 8PS","phone":"07979323676","email":"david.baker@qmul.ac.uk","dob":"1962-03-03"}],
  client2ReservedExecutors: [{"prefix":"Mrs","firstName":"Kelly","lastName":"Jackson","address":"256 Skipton Road, Harrogate, HG1 3NB","dob":"1987-04-10"},{"prefix":"Mr","firstName":"Leon Peter","lastName":"Baker","address":"12 Larkspur Grove, Harrogate, HG3 2YA","dob":"1983-03-11"}],
  client1Guardians: [],
  client1ReservedGuardians: [],
  client2Guardians: [],
  client2ReservedGuardians: [],
  client1Beneficiaries: [],
  client2Beneficiaries: [],
  client1SpecificGifts: [{"description":"All of Linda's jewelry, as well as her Mulberry and other high-end handbags","recipient":"Kelly Jackson","value":"","isCharity":false,"notes":""}],
  client2SpecificGifts: [{"description":"A World War I George V item and the fighting fish and seahorse statues","recipient":"Leon Peter Baker","value":"","isCharity":false,"notes":""}],
  client1ResidualEstate: "To Mary Katherine Stillwell-Martin, Kevin Clark and Kennedy Charles Nortness in equal shares",
  client2ResidualEstate: "to my brother Colin Baker, Kelly Jackson (nee Baker) and Leon Peter Baker in equal shares",
  client1FuneralType: "Cremation",
  client1FuneralWishes: "I wish my ashes to be returned to the U.S.A and ashes spread on Haytack rock cannon beach, Mount Hood, Oregon; Wakeema Falls, Columbia Gorge",
  client2FuneralType: "Cremation",
  propertyOwned: "yes",
  propertyAddress: "18 Apley close, Harrogate, HG2 8PS",
  propertyOwnership: "Joint Tenants",
  propertyValue: "1 million",
  mortgageOutstanding: "no",
  otherProperties: [],
  specificGifts: [{"description":"All of Linda's jewelry and high-end handbags","recipient":"Kelly Jackson"},{"description":"World War I George V item and fighting fish and seahorse statues","recipient":"Leon Peter Baker"}],
  hasPets: "no",
  organDonation: "no_preference",
  funeralWishes: "Ashes to be scattered in a specific location",
  additionalNotes: "Specific gifts to be handled through a separate Letter of Wishes. Total estate value estimated at £1.3 million or more. David has approximately £200,000 in savings. Linda has a private pension worth roughly £110,000. David has a large active pension pot from which he draws roughly £60,000 a year, which passes to Linda upon his death.",
  protectivePropertyTrusts: [],
  discretionaryTrusts: [],
  vulnerablePersonTrusts: [],
  nilRateBandTrusts: [],
  bereavedMinorTrusts: [],
  age18To25Trusts: [],
  businessPropertyReliefs: [],
  considerLPA: true,
  considerPPT: true,
  considerAAT: true,
  currentStep: 1,
};

try {
  const resp = await fetch(`${BASE}/api/trpc/will.submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ json: payload })
  });
  const data = await resp.json();
  if (data.error) {
    console.error('TRPC Error:', JSON.stringify(data.error, null, 2));
  } else {
    console.log('Success! Reference:', data.result?.data?.json?.referenceNumber);
    // Clean up - delete the test record
    const refNum = data.result?.data?.json?.referenceNumber;
    if (refNum) {
      const del = await fetch(`${BASE}/api/trpc/will.delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: { id: data.result?.data?.json?.id } })
      });
      console.log('Cleanup:', del.status);
    }
  }
} catch(e) {
  console.error('Fetch error:', e.message);
}
