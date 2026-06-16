/**
 * Formats a WillInstruction database record into a clean plain-text document
 * suitable for uploading to OneDrive.
 */

import type { WillInstruction } from "../drizzle/schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function line(label: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  return `  ${label.padEnd(32)} ${String(value)}\n`;
}

function section(title: string): string {
  const bar = "─".repeat(60);
  return `\n${bar}\n  ${title.toUpperCase()}\n${bar}\n`;
}

function formatPersonList(persons: unknown): string {
  if (!Array.isArray(persons) || persons.length === 0) return "  None specified\n";
  return (persons as Record<string, string>[])
    .map((p, i) => {
      const name = [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ");
      const parts = [
        `  ${i + 1}. ${name || "Unnamed"}`,
        p.relationship ? `(${p.relationship})` : "",
      ].filter(Boolean).join(" ");
      const details = [
        p.dob ? `     DOB: ${p.dob}` : "",
        p.address ? `     Address: ${p.address}` : "",
        p.phone ? `     Phone: ${p.phone}` : "",
        p.email ? `     Email: ${p.email}` : "",
        p.notes ? `     Notes: ${p.notes}` : "",
      ].filter(Boolean).join("\n");
      return parts + "\n" + details;
    })
    .join("\n") + "\n";
}

function formatGiftList(gifts: unknown): string {
  if (!Array.isArray(gifts) || gifts.length === 0) return "  None specified\n";
  return (gifts as Record<string, string>[])
    .map((g, i) =>
      `  ${i + 1}. ${g.description ?? "Gift"} → ${g.recipient ?? "Unknown recipient"}${g.value ? ` (£${g.value})` : ""}${g.isCharity ? " [Charity]" : ""}${g.notes ? `\n     Notes: ${g.notes}` : ""}`
    )
    .join("\n") + "\n";
}

function formatPolicies(policies: unknown): string {
  if (!Array.isArray(policies) || policies.length === 0) return "  None specified\n";
  return (policies as Record<string, unknown>[])
    .map((p, i) => [
      `  Policy ${i + 1}:`,
      p.provider ? `     Provider:        ${p.provider}` : "",
      p.policyNumber ? `     Policy No:       ${p.policyNumber}` : "",
      p.sumAssured ? `     Sum Assured:     £${p.sumAssured}` : "",
      p.termRemaining ? `     Term Remaining:  ${p.termRemaining}` : "",
      p.beneficiary ? `     Beneficiary:     ${p.beneficiary}` : "",
      p.inTrust ? `     In Trust:        Yes` : "",
      p.notes ? `     Notes:           ${p.notes}` : "",
    ].filter(Boolean).join("\n"))
    .join("\n") + "\n";
}

function formatProductsList(products: unknown): string {
  if (!Array.isArray(products) || products.length === 0) return "None specified";
  const labels: Record<string, string> = {
    single_will: "Single Will",
    mirror_wills: "Mirror Wills",
    lpa_property_finance: "LPA – Property & Finance",
    lpa_health_welfare: "LPA – Health & Welfare",
    both_lpas: "Both LPAs",
    ppt: "Protective Property Trust (PPT)",
    aat: "Asset Allocation Trust (AAT)",
    right_to_occupy: "Right To Occupy",
    discretionary_trust: "Discretionary Trust",
    vulnerable_trust: "Vulnerable Person's Trust",
    storage: "Will Storage",
  };
  return (products as string[]).map(p => labels[p] ?? p).join(", ");
}

function yesNo(val: unknown): string {
  if (val === "yes" || val === true) return "Yes";
  if (val === "no" || val === false) return "No";
  if (val === "unsure") return "Unsure / To Confirm";
  return val ? String(val) : "Not specified";
}

// ─── Main formatter ───────────────────────────────────────────────────────────
export function formatWillDocument(record: WillInstruction): string {
  const r = record as unknown as Record<string, unknown>;
  const client1Name = [r.client1Prefix, r.client1FirstName, r.client1LastName].filter(Boolean).join(" ") || "Client 1";
  const client2Name = r.client2FirstName
    ? [r.client2Prefix, r.client2FirstName, r.client2LastName].filter(Boolean).join(" ")
    : null;

  const now = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });

  let doc = "";

  // ── Header ──────────────────────────────────────────────────────────────────
  doc += "═".repeat(60) + "\n";
  doc += "  GENESIS ESTATE PLANNING\n";
  doc += "  WILL INSTRUCTION FORM\n";
  doc += "═".repeat(60) + "\n\n";
  doc += `  Reference:    ${record.referenceNumber}\n`;
  doc += `  Generated:    ${now}\n`;
  doc += `  Client(s):    ${client1Name}${client2Name ? ` & ${client2Name}` : ""}\n`;
  doc += `  Products:     ${formatProductsList(r.productsOrdered)}\n`;

  // ── Appointment ─────────────────────────────────────────────────────────────
  doc += section("1. Appointment Details");
  doc += line("Date:", r.appointmentDate);
  doc += line("Time:", r.appointmentTime);
  doc += line("Consultant:", r.consultantName);
  doc += line("Consultant Email:", r.consultantEmail);
  doc += line("Consultant Phone:", r.consultantPhone);
  doc += line("Case Coordinator:", r.caseCoordinatorName);
  doc += line("Coordinator Email:", r.caseCoordinatorEmail);
  doc += line("Price Quoted (£):", r.priceQuoted);
  doc += line("Estimated Draft Date:", r.estimatedDraftDate);

  // ── Client 1 ────────────────────────────────────────────────────────────────
  doc += section(`2. Client 1 — ${client1Name}`);
  doc += line("Full Name:", client1Name);
  doc += line("Date of Birth:", r.client1Dob);
  doc += line("Address:", [r.client1AddressLine1, r.client1City, r.client1Postcode].filter(Boolean).join(", "));
  doc += line("Marital Status:", r.client1MaritalStatus);
  doc += line("Job Title:", r.client1JobTitle);
  doc += line("Daytime Phone:", r.client1DaytimePhone);
  doc += line("Mobile:", r.client1Mobile);
  doc += line("Email:", r.client1Email);
  doc += line("Nationality:", r.client1Nationality);

  // ── Client 2 ────────────────────────────────────────────────────────────────
  if (client2Name) {
    doc += section(`3. Client 2 — ${client2Name}`);
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

  // ── Family Background ───────────────────────────────────────────────────────
  doc += section("4. Family Background");
  doc += `  CLIENT 1:\n`;
  doc += line("  Marriage Plans:", r.client1MarriagePlans);
  doc += line("  Has Children:", yesNo(r.client1HasChildren));
  doc += line("  Total Children:", r.client1TotalChildren);
  doc += line("  Children Special Needs:", yesNo(r.client1ChildrenSpecialNeeds));
  if (Array.isArray(r.client1ChildrenUnder18) && r.client1ChildrenUnder18.length > 0) {
    doc += `  Children Under 18:\n` + formatPersonList(r.client1ChildrenUnder18);
  }
  if (client2Name) {
    doc += `\n  CLIENT 2:\n`;
    doc += line("  Marriage Plans:", r.client2MarriagePlans);
    doc += line("  Has Children:", yesNo(r.client2HasChildren));
    doc += line("  Total Children:", r.client2TotalChildren);
    if (Array.isArray(r.client2ChildrenUnder18) && r.client2ChildrenUnder18.length > 0) {
      doc += `  Children Under 18:\n` + formatPersonList(r.client2ChildrenUnder18);
    }
  }

  // ── Due Diligence ───────────────────────────────────────────────────────────
  doc += section("5. Due Diligence");
  doc += line("Arranged appointment?", yesNo(r.ddArrangedAppointment));
  doc += line("Knowledge of estate?", yesNo(r.ddKnowledgeOfEstate));
  doc += line("Knew beneficiaries?", yesNo(r.ddKnewBeneficiaries));
  doc += line("Signs of influence?", yesNo(r.ddSignsOfInfluence));
  doc += line("Knew appointees?", yesNo(r.ddKnewAppointees));

  // ── Executors ───────────────────────────────────────────────────────────────
  doc += section("6. Executors & Trustees");
  doc += `  CLIENT 1 — PRIMARY EXECUTORS:\n`;
  doc += formatPersonList(r.client1Executors);
  doc += `  CLIENT 1 — RESERVED EXECUTORS:\n`;
  doc += formatPersonList(r.client1ReservedExecutors);
  if (client2Name) {
    doc += `  CLIENT 2 — PRIMARY EXECUTORS:\n`;
    doc += formatPersonList(r.client2Executors);
    doc += `  CLIENT 2 — RESERVED EXECUTORS:\n`;
    doc += formatPersonList(r.client2ReservedExecutors);
  }
  doc += `  TRUSTEES:\n`;
  doc += formatPersonList(r.trustees);

  // ── Guardians ───────────────────────────────────────────────────────────────
  const hasGuardians =
    (Array.isArray(r.client1Guardians) && r.client1Guardians.length > 0) ||
    (Array.isArray(r.client2Guardians) && r.client2Guardians.length > 0);
  if (hasGuardians) {
    doc += section("7. Guardians for Minor Children");
    doc += `  CLIENT 1 — PRIMARY GUARDIANS:\n`;
    doc += formatPersonList(r.client1Guardians);
    doc += `  CLIENT 1 — RESERVED GUARDIANS:\n`;
    doc += formatPersonList(r.client1ReservedGuardians);
    if (client2Name) {
      doc += `  CLIENT 2 — PRIMARY GUARDIANS:\n`;
      doc += formatPersonList(r.client2Guardians);
      doc += `  CLIENT 2 — RESERVED GUARDIANS:\n`;
      doc += formatPersonList(r.client2ReservedGuardians);
    }
  }

  // ── Property & Assets ───────────────────────────────────────────────────────
  doc += section("8. Property & Assets");
  doc += line("Property Owned:", yesNo(r.propertyOwned));
  doc += line("Property Address:", r.propertyAddress);
  doc += line("Ownership Type:", r.propertyOwnership);
  doc += line("Property Value (£):", r.propertyValue);
  doc += line("Mortgage Outstanding:", yesNo(r.mortgageOutstanding));
  doc += line("Mortgage Balance (£):", r.mortgageBalance);
  doc += line("Mortgage Term Remaining:", r.mortgageTermRemaining);
  doc += line("Mortgage Lender:", r.mortgageLender);
  doc += line("Other Properties:", yesNo(r.hasOtherProperties));
  doc += line("Other Properties Details:", r.otherProperties);
  doc += line("Assets Outside UK:", yesNo(r.assetsOutsideUK));
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
  doc += line("Care Concerns:", yesNo(r.careConcerns));
  doc += line("Care Concern Details:", r.careConcernDetails);

  // ── Life Insurance ──────────────────────────────────────────────────────────
  doc += section("9. Life Insurance & Protection");
  doc += line("Has Life Insurance:", yesNo(r.hasLifeInsurance));
  if (r.hasLifeInsurance === "yes") {
    doc += formatPolicies(r.lifeInsurancePolicies);
  }
  doc += line("Additional Notes:", r.lifeInsuranceNotes);

  // ── Business Interests ──────────────────────────────────────────────────────
  doc += section("10. Business Interests");
  doc += line("Has Business Interests:", yesNo(r.hasBusinessInterests));
  doc += line("Details:", r.businessInterests);

  // ── Beneficiaries ───────────────────────────────────────────────────────────
  doc += section("11. Beneficiaries");
  doc += `  CLIENT 1 BENEFICIARIES:\n`;
  doc += formatPersonList(r.client1Beneficiaries);
  doc += line("  Residual Estate:", r.client1ResidualEstate);
  doc += line("  Residual Backup:", r.client1ResidualBackup);
  doc += line("  Children Benefit Age:", r.client1ChildrenBenefitAge);
  if (client2Name) {
    doc += `\n  CLIENT 2 BENEFICIARIES:\n`;
    doc += formatPersonList(r.client2Beneficiaries);
    doc += line("  Residual Estate:", r.client2ResidualEstate);
    doc += line("  Residual Backup:", r.client2ResidualBackup);
    doc += line("  Children Benefit Age:", r.client2ChildrenBenefitAge);
  }

  // ── Specific Gifts ──────────────────────────────────────────────────────────
  const hasGifts =
    (Array.isArray(r.client1SpecificGifts) && r.client1SpecificGifts.length > 0) ||
    (Array.isArray(r.client2SpecificGifts) && r.client2SpecificGifts.length > 0);
  if (hasGifts) {
    doc += section("12. Specific Gifts & Legacies");
    doc += `  CLIENT 1 GIFTS:\n`;
    doc += formatGiftList(r.client1SpecificGifts);
    if (client2Name) {
      doc += `\n  CLIENT 2 GIFTS:\n`;
      doc += formatGiftList(r.client2SpecificGifts);
    }
  }

  // ── Pets ────────────────────────────────────────────────────────────────────
  doc += section("13. Pets");
  doc += line("Has Pets:", yesNo(r.hasPets));
  doc += line("Pets Details:", r.petsDetails);
  doc += line("Pets Carer:", r.petsCarer);

  // ── Funeral Wishes ──────────────────────────────────────────────────────────
  doc += section("14. Funeral Wishes");
  doc += `  CLIENT 1:\n`;
  doc += line("  Funeral Type:", r.client1FuneralType);
  doc += line("  Wishes:", r.client1FuneralWishes);
  doc += line("  Organ Donation:", yesNo(r.client1OrganDonation));
  if (client2Name) {
    doc += `\n  CLIENT 2:\n`;
    doc += line("  Funeral Type:", r.client2FuneralType);
    doc += line("  Wishes:", r.client2FuneralWishes);
    doc += line("  Organ Donation:", yesNo(r.client2OrganDonation));
  }

  // ── Disaster Clause & Notes ─────────────────────────────────────────────────
  doc += section("15. Disaster Clause & Additional Notes");
  doc += line("Disaster Clause (Client 1):", r.disasterClauseClient1);
  if (client2Name) doc += line("Disaster Clause (Client 2):", r.disasterClauseClient2);
  doc += line("Disaster Clause Notes:", r.disasterClauseNotes);
  doc += line("Additional Notes:", r.additionalNotes);
  doc += line("Special Notes:", r.specialNotes);

  // ── AI Recommendations ──────────────────────────────────────────────────────
  if (record.aiRecommendationNarrative) {
    doc += section("16. AI Recommendations");
    doc += record.aiRecommendationNarrative + "\n";
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  doc += "\n" + "═".repeat(60) + "\n";
  doc += `  END OF INSTRUCTION — ${record.referenceNumber}\n`;
  doc += "═".repeat(60) + "\n";

  return doc;
}

// ─── Filename generator ───────────────────────────────────────────────────────
export function buildFilename(record: WillInstruction): string {
  const r = record as unknown as Record<string, unknown>;
  const client1 = [r.client1FirstName, r.client1LastName].filter(Boolean).join("_") || "Client";
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const ref = record.referenceNumber ?? "REF";
  return `${date}_${client1}_${ref}.txt`;
}
