import { describe, expect, it } from "vitest";
import { generateWelcomePackHtml } from "./welcomePackGenerator";

describe("V1 welcome pack completeness", () => {
  it("includes entered V1 information that was previously absent from the concise summary", () => {
    const html = generateWelcomePackHtml({
      referenceNumber: "GEP-WP-001",
      willType: "Mirror Wills",
      productsOrdered: ["mirror_wills", "lpa_property_finance"],
      client1FirstName: "Alice",
      client1LastName: "Example",
      client2FirstName: "Brian",
      client2LastName: "Example",
      client1MarriagePlans: "yes",
      client1MarriagePlanDetails: "Ceremony planned for spring 2027",
      client1MentalCapacityNotes: "Capacity note unique value",
      ddMeetingType: "Video Call",
      ddOthersPresentNotes: "Independent interpreter attended",
      client1Guardians: [{ firstName: "Grace", lastName: "Guardian", address: "1 Guardian Road" }],
      client2Guardians: [{ firstName: "Hannah", lastName: "Guardian", address: "2 Guardian Road" }],
      trustees: [{ firstName: "Trevor", lastName: "Trustee", address: "3 Trustee Road" }],
      client1ResidualBackup: "Fallback family trust",
      client1VulnerableBeneficiaryDetails: "Support arrangements unique value",
      mortgageLender: "Example Building Society",
      mortgageBalance: "125000",
      client2BankAccounts: "Brian savings account unique value",
      assetsOutsideUKDetails: "French apartment unique value",
      lifeInsurancePolicies: [{ provider: "Example Life", policyNumber: "POL-UNIQUE-123", sumAssured: "250000" }],
      lifeInsuranceNotes: "Life policy note unique value",
      businessInterestsDetails: [{ businessName: "Example Trading Ltd", natureOfBusiness: "Consulting", ownershipPercentage: "50" }],
      petsDetails: "Milo the spaniel",
      petsCarer: "Pat Carer",
      protectivePropertyTrusts: [{ trustees: [{ name: "Trustee Unique" }], notes: "PPT note unique value" }],
      lpaDetails: { certProvider: { firstName: "Catherine", lastName: "Certificate", email: "certificate@example.test" } },
    });

    [
      "Ceremony planned for spring 2027",
      "Capacity note unique value",
      "Independent interpreter attended",
      "First Name: Hannah; Last Name: Guardian",
      "First Name: Trevor; Last Name: Trustee",
      "Fallback family trust",
      "Support arrangements unique value",
      "Example Building Society",
      "Brian savings account unique value",
      "French apartment unique value",
      "POL-UNIQUE-123",
      "Life policy note unique value",
      "Example Trading Ltd",
      "Milo the spaniel",
      "PPT note unique value",
      "certificate@example.test",
    ].forEach(value => expect(html).toContain(value));
  });

  it("renders JSON-stored named beneficiaries and their shares in Distribution of Your Estate", () => {
    const html = generateWelcomePackHtml({
      willType: "Mirror Wills",
      client1FirstName: "Alice",
      client1LastName: "Example",
      client2FirstName: "Brian",
      client2LastName: "Example",
      client1Beneficiaries: JSON.stringify([
        { firstName: "Sophie", lastName: "Beneficiary", relationship: "Daughter", share: "60%" },
      ]),
      client2Beneficiaries: JSON.stringify([
        { firstName: "David", lastName: "Beneficiary", relationship: "Son", sharePercentage: "40%" },
      ]),
      client1ResidualEstate: "The Example Children",
      client2ResidualEstate: "The Example Children",
    });

    expect(html).toContain("Distribution of Your Estate");
    expect(html).toContain("Sophie Beneficiary");
    expect(html).toContain("60%");
    expect(html).toContain("David Beneficiary");
    expect(html).toContain("40%");
  });
});
