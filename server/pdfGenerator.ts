import PDFDocument from "pdfkit";
import type { WillInstruction } from "../drizzle/schema";

// ─── Colour palette ───────────────────────────────────────────────────────────
const GREEN = "#1a4d35";
const GOLD = "#b8860b";
const LIGHT_GREEN = "#e8f5ee";
const GREY = "#6b7280";
const BLACK = "#111827";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safe(v: string | null | undefined): string {
  return v?.trim() || "—";
}

function yesNo(v: string | null | undefined): string {
  if (!v) return "—";
  return v === "yes" ? "Yes" : v === "no" ? "No" : v;
}

function safeArr(v: unknown): unknown[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v as string) || []; } catch { return []; }
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function generateWillPdf(record: WillInstruction): Promise<Buffer> {
  return new Promise((resolve, reject) => {
  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  doc.on("error", reject);

  const pageW = doc.page.width - 100; // usable width

  // ── Cover / Header ─────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 110).fill(GREEN);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20)
    .text("Genesis Wills and Estate Planning", 50, 30);
  doc.font("Helvetica").fontSize(11).fillColor(GOLD)
    .text("Will Instruction Summary", 50, 56);
  doc.fillColor("#ffffff").fontSize(9)
    .text(`Reference: ${safe(record.referenceNumber)}   |   Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, 50, 80);
  doc.y = 130;

  // ── Helper: section heading ─────────────────────────────────────────────────
  const sectionHeading = (title: string) => {
    if (doc.y > doc.page.height - 120) doc.addPage();
    doc.moveDown(0.5);
    doc.rect(50, doc.y, pageW, 22).fill(GREEN);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10)
      .text(title.toUpperCase(), 58, doc.y - 18);
    doc.moveDown(0.8);
    doc.fillColor(BLACK);
  };

  // ── Helper: two-column field row ────────────────────────────────────────────
  const field = (label: string, value: string) => {
    if (doc.y > doc.page.height - 60) doc.addPage();
    const startY = doc.y;
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(GREY)
      .text(label, 50, startY, { width: 160, continued: false });
    doc.font("Helvetica").fontSize(8.5).fillColor(BLACK)
      .text(value, 220, startY, { width: pageW - 170 });
    doc.moveDown(0.35);
  };

  // ── Helper: sub-heading ─────────────────────────────────────────────────────
  const subHeading = (title: string) => {
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD).text(title, 50);
    doc.font("Helvetica").fillColor(BLACK);
    doc.moveDown(0.3);
  };

  // ── 1. Appointment ─────────────────────────────────────────────────────────
  sectionHeading("1. Appointment Details");
  field("Date", safe(record.appointmentDate));
  field("Time", safe(record.appointmentTime));
  field("Price Quoted", safe(record.priceQuoted));
  field("Estimated Draft Date", safe(record.estimatedDraftDate));
  field("Will Type", safe(record.willType));
  const products = safeArr(record.productsOrdered) as string[];
  field("Products Ordered", products.length ? products.join(", ") : "—");

  subHeading("Consultant");
  field("Name", safe(record.consultantName));
  field("Email", safe(record.consultantEmail));
  field("Phone", safe(record.consultantPhone));

  subHeading("Case Coordinator");
  field("Name", safe(record.caseCoordinatorName));
  field("Email", safe(record.caseCoordinatorEmail));
  field("Phone", safe(record.caseCoordinatorPhone));

  // ── 2. Client 1 ────────────────────────────────────────────────────────────
  sectionHeading("2. Client 1");
  const c1Name = [record.client1Prefix, record.client1FirstName, record.client1MiddleName, record.client1LastName].filter(Boolean).join(" ");
  field("Full Name", safe(c1Name));
  field("Date of Birth", safe(record.client1Dob));
  field("Marital Status", safe(record.client1MaritalStatus));
  field("Nationality", safe(record.client1Nationality));
  field("Job Title", safe(record.client1JobTitle));
  field("Address", [record.client1AddressLine1, record.client1City, record.client1Postcode].filter(Boolean).join(", ") || "—");
  field("Daytime Phone", safe(record.client1DaytimePhone));
  field("Mobile", safe(record.client1Mobile));
  field("Email", safe(record.client1Email));

  // ── 3. Client 2 (if present) ───────────────────────────────────────────────
  if (record.client2FirstName || record.client2LastName) {
    sectionHeading("3. Client 2");
    const c2Name = [record.client2Prefix, record.client2FirstName, record.client2MiddleName, record.client2LastName].filter(Boolean).join(" ");
    field("Full Name", safe(c2Name));
    field("Date of Birth", safe(record.client2Dob));
    field("Marital Status", safe(record.client2MaritalStatus));
    field("Nationality", safe(record.client2Nationality));
    field("Job Title", safe(record.client2JobTitle));
    field("Address", [record.client2AddressLine1, record.client2City, record.client2Postcode].filter(Boolean).join(", ") || "—");
    field("Daytime Phone", safe(record.client2DaytimePhone));
    field("Mobile", safe(record.client2Mobile));
    field("Email", safe(record.client2Email));
  }

  // ── 4. Family Background ───────────────────────────────────────────────────
  sectionHeading("4. Family Background");
  subHeading("Client 1");
  field("Marriage Plans", yesNo(record.client1MarriagePlans));
  if (record.client1MarriagePlanDetails) field("Details", safe(record.client1MarriagePlanDetails));
  field("Has Children", yesNo(record.client1HasChildren));
  field("Total Children", safe(record.client1TotalChildren));
  const c1Under18 = safeArr(record.client1ChildrenUnder18) as Array<{ name?: string; dob?: string }>;
  if (c1Under18.length) {
    subHeading("Minor Children (Client 1)");
    c1Under18.forEach((child, i) => field(`Child ${i + 1}`, `${safe(child.name)} — DOB: ${safe(child.dob)}`));
  }
  if (record.client2FirstName) {
    subHeading("Client 2");
    field("Marriage Plans", yesNo(record.client2MarriagePlans));
    field("Has Children", yesNo(record.client2HasChildren));
    field("Total Children", safe(record.client2TotalChildren));
    const c2Under18 = safeArr(record.client2ChildrenUnder18) as Array<{ name?: string; dob?: string }>;
    if (c2Under18.length) {
      subHeading("Minor Children (Client 2)");
      c2Under18.forEach((child, i) => field(`Child ${i + 1}`, `${safe(child.name)} — DOB: ${safe(child.dob)}`));
    }
  }

  // ── 5. Due Diligence ───────────────────────────────────────────────────────
  sectionHeading("5. Due Diligence");
  field("Arranged Appointment", yesNo(record.ddArrangedAppointment));
  field("Knowledge of Estate", yesNo(record.ddKnowledgeOfEstate));
  field("Knew Beneficiaries", yesNo(record.ddKnewBeneficiaries));
  field("Signs of Influence", yesNo(record.ddSignsOfInfluence));
  field("Knew Appointees", yesNo(record.ddKnewAppointees));
  field("Mental Capacity (C1)", yesNo(record.client1MentalCapacity));
  if (record.client2FirstName) field("Mental Capacity (C2)", yesNo(record.client2MentalCapacity));

  // ── 6. Executors & Guardians ───────────────────────────────────────────────
  sectionHeading("6. Executors & Guardians");
  const executors = safeArr(record.executors) as Array<{ firstName?: string; lastName?: string; relationship?: string }>;
  if (executors.length) {
    subHeading("Executors");
    executors.forEach((e, i) => field(`Executor ${i + 1}`, `${safe(e.firstName)} ${safe(e.lastName)} — ${safe(e.relationship)}`));
  }
  const reservedExecutors = safeArr(record.reservedExecutors) as Array<{ firstName?: string; lastName?: string }>;
  if (reservedExecutors.length) {
    subHeading("Reserved Executors");
    reservedExecutors.forEach((e, i) => field(`Reserved ${i + 1}`, `${safe(e.firstName)} ${safe(e.lastName)}`));
  }
  const guardians = safeArr(record.guardians) as Array<{ firstName?: string; lastName?: string; relationship?: string }>;
  if (guardians.length) {
    subHeading("Guardians");
    guardians.forEach((g, i) => field(`Guardian ${i + 1}`, `${safe(g.firstName)} ${safe(g.lastName)} — ${safe(g.relationship)}`));
  }

  // ── 7. Property & Assets ───────────────────────────────────────────────────
  sectionHeading("7. Property & Assets");
  field("Property Owned", yesNo(record.propertyOwned));
  if (record.propertyOwned === "yes") {
    field("Address", safe(record.propertyAddress));
    field("Ownership Type", safe(record.propertyOwnership));
    field("Property Value", safe(record.propertyValue));
    field("Mortgage Outstanding", yesNo(record.mortgageOutstanding));
    if (record.mortgageOutstanding === "yes") {
      field("Mortgage Balance", safe(record.mortgageBalance));
      field("Mortgage Term Remaining", safe(record.mortgageTermRemaining));
      field("Mortgage Lender", safe(record.mortgageLender));
    }
  }
  subHeading("Client 1 Financial Assets");
  field("Bank Accounts", safe(record.bankAccounts));
  field("Investments", safe(record.investments));
  field("Pension Details", safe(record.pensionDetails));
  field("Estimated Estate Value", safe(record.estimatedEstateValue));
  if (record.client2FirstName) {
    subHeading("Client 2 Financial Assets");
    field("Bank Accounts", safe(record.client2BankAccounts));
    field("Investments", safe(record.client2Investments));
    field("Pension Details", safe(record.client2PensionDetails));
    field("Estimated Estate Value", safe(record.client2EstimatedEstateValue));
  }

  // ── 8. Life Insurance ─────────────────────────────────────────────────────
  sectionHeading("8. Life Insurance");
  field("Has Life Insurance", yesNo(record.hasLifeInsurance));
  const policies = safeArr(record.lifeInsurancePolicies) as Array<{
    provider?: string; policyNumber?: string; sumAssured?: string;
    termRemaining?: string; inTrust?: boolean; beneficiary?: string; notes?: string;
  }>;
  if (policies.length) {
    policies.forEach((p, i) => {
      subHeading(`Policy ${i + 1}`);
      field("Provider", safe(p.provider));
      field("Policy Number", safe(p.policyNumber));
      field("Sum Assured", safe(p.sumAssured));
      field("Term Remaining", safe(p.termRemaining));
      field("In Trust", p.inTrust ? "Yes" : "No");
      field("Beneficiary", safe(p.beneficiary));
      if (p.notes) field("Notes", safe(p.notes));
    });
  }
  if (record.lifeInsuranceNotes) field("General Notes", safe(record.lifeInsuranceNotes));

  // ── 9. Business Interests ─────────────────────────────────────────────────
  if (record.hasBusinessInterests === "yes") {
    sectionHeading("9. Business Interests");
    const businesses = safeArr(record.businessInterestsDetails) as Array<{
      businessName?: string; natureOfBusiness?: string; ownershipPercentage?: string; notes?: string;
    }>;
    businesses.forEach((b, i) => {
      subHeading(`Business ${i + 1}`);
      field("Name", safe(b.businessName));
      field("Nature", safe(b.natureOfBusiness));
      field("Ownership %", safe(b.ownershipPercentage));
      if (b.notes) field("Notes", safe(b.notes));
    });
  }

  // ── 10. Wishes & Beneficiaries ────────────────────────────────────────────
  sectionHeading("10. Wishes & Beneficiaries");
  const beneficiaries = safeArr(record.beneficiaries) as Array<{ firstName?: string; lastName?: string; share?: string; relationship?: string }>;
  if (beneficiaries.length) {
    subHeading("Beneficiaries");
    beneficiaries.forEach((b, i) => field(`Beneficiary ${i + 1}`, `${safe(b.firstName)} ${safe(b.lastName)} — ${safe(b.share)} (${safe(b.relationship)})`));
  }
  field("Children Benefit Age", safe(record.childrenBenefitAge));
  field("Residuary Estate", safe(record.residuaryEstate));
  field("Backup Clause", safe(record.residuaryBackup));

  const gifts = safeArr(record.specificGifts) as Array<{ description?: string; recipient?: string; value?: string; isCharity?: boolean }>;
  if (gifts.length) {
    subHeading("Specific Gifts");
    gifts.forEach((g, i) => field(`Gift ${i + 1}`, `${safe(g.description)} → ${safe(g.recipient)}${g.value ? ` (${g.value})` : ""}${g.isCharity ? " [Charity]" : ""}`));
  }

  // ── 11. Funeral Wishes ────────────────────────────────────────────────────
  sectionHeading("11. Funeral Wishes");
  field("Funeral Type", safe(record.funeralType));
  field("Funeral Wishes", safe(record.funeralWishes));
  field("Organ Donation", yesNo(record.organDonation));

  // ── 12. Pets ─────────────────────────────────────────────────────────────
  if (record.hasPets === "yes") {
    sectionHeading("12. Pets");
    field("Pet Details", safe(record.petsDetails));
    field("Preferred Carer", safe(record.petsCarer));
  }

  // ── 13. Additional Notes ─────────────────────────────────────────────────
  sectionHeading("13. Additional Notes & Disaster Clause");
  field("Disaster Clause Notes", safe(record.disasterClauseNotes));
  field("Additional Notes", safe(record.additionalNotes));
  field("Special Notes", safe(record.specialNotes));

  // ── 14. AI Recommendations ───────────────────────────────────────────────
  if (record.aiRecommendationNarrative) {
    sectionHeading("14. AI Recommendations");
    doc.font("Helvetica").fontSize(8.5).fillColor(BLACK)
      .text(record.aiRecommendationNarrative, 50, doc.y, { width: pageW, align: "left" });
    doc.moveDown(0.5);
  }

  // ── Footer on every page ─────────────────────────────────────────────────
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    const footerY = doc.page.height - 35;
    doc.rect(0, footerY - 5, doc.page.width, 40).fill(GREEN);
    doc.fillColor("#ffffff").font("Helvetica").fontSize(7.5)
      .text(`Genesis Wills and Estate Planning  |  Will Instruction — ${safe(record.referenceNumber)}  |  CONFIDENTIAL`, 50, footerY, { width: pageW - 60, align: "left" });
    doc.text(`Page ${i + 1} of ${totalPages}`, 50, footerY, { width: pageW, align: "right" });
  }

  doc.end();
  doc.on("end", () => resolve(Buffer.concat(chunks)));
  }); // end Promise
}
