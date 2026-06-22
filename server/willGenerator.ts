/**
 * willGenerator.ts
 * Generates a properly formatted Last Will & Testament PDF document
 * matching the Genesis Wills and Estate Planning house style.
 *
 * Supports: Single Will, Mirror Will (Client 1 or Client 2)
 * Optional trust clauses: PPT (Protective Property Trust), Discretionary Trust, Vulnerable Person's Trust
 */

import PDFDocumentLib from "pdfkit";
type PDFDocument = InstanceType<typeof PDFDocumentLib>;
import type { WillInstruction } from "../drizzle/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WillType = "single" | "mirror_client1" | "mirror_client2";

export interface WillOptions {
  willType: WillType;
  includePPT: boolean;
  includeDiscretionaryTrust: boolean;
  includeVulnerableTrust: boolean;
}

interface PersonEntry {
  prefix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  address?: string;
  relationship?: string;
  dob?: string;
  email?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safe(v: string | null | undefined): string {
  return v?.trim() || "";
}

function safeArr(v: unknown): PersonEntry[] {
  if (!v) return [];
  if (typeof v === "string") {
    try { return JSON.parse(v) as PersonEntry[]; } catch { return []; }
  }
  if (Array.isArray(v)) return v as PersonEntry[];
  return [];
}

function fullName(p: PersonEntry | null | undefined): string {
  if (!p) return "";
  return [p.prefix, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ").trim();
}

function personAddress(p: PersonEntry | null | undefined): string {
  return safe(p?.address);
}

function relationship(p: PersonEntry | null | undefined): string {
  return safe(p?.relationship) || "person";
}

function pronoun(gender?: string): { subj: string; poss: string; obj: string } {
  // We don't have gender stored, so we use neutral defaults
  return { subj: "they", poss: "their", obj: "them" };
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── PDF Drawing Helpers ──────────────────────────────────────────────────────

const GARAMOND = "Times-Roman";
const GARAMOND_BOLD = "Times-Bold";
const GARAMOND_ITALIC = "Times-Italic";

const PAGE_MARGIN = 72; // 1 inch
const PAGE_WIDTH = 595.28; // A4
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

function addCoverPage(doc: PDFDocument, testatorName: string, reference: string) {
  // Outer border
  doc.rect(30, 30, PAGE_WIDTH - 60, doc.page.height - 60).stroke("#000000");
  // Inner border
  doc.rect(40, 40, PAGE_WIDTH - 80, doc.page.height - 80).stroke("#000000");

  // Title block — centred box
  const boxTop = 130;
  const boxHeight = 160;
  const boxLeft = 100;
  const boxWidth = PAGE_WIDTH - 200;
  doc.rect(boxLeft, boxTop, boxWidth, boxHeight).stroke("#000000");

  doc
    .font(GARAMOND)
    .fontSize(18)
    .text("THE LAST WILL & TESTAMENT", boxLeft, boxTop + 24, {
      width: boxWidth,
      align: "center",
    });

  doc
    .font(GARAMOND)
    .fontSize(14)
    .text("of", boxLeft, boxTop + 56, { width: boxWidth, align: "center" });

  doc
    .font(GARAMOND_BOLD)
    .fontSize(18)
    .text(testatorName, boxLeft, boxTop + 80, { width: boxWidth, align: "center" });

  if (reference) {
    doc
      .font(GARAMOND)
      .fontSize(11)
      .text(`(${reference})`, boxLeft, boxTop + 118, { width: boxWidth, align: "center" });
  }

  // Footer company details
  const footerTop = doc.page.height - 200;
  doc
    .font(GARAMOND)
    .fontSize(10)
    .fillColor("#333333")
    .text("Genesis Wills and Estate Planning Ltd", 0, footerTop, {
      width: PAGE_WIDTH,
      align: "center",
    })
    .text("The Business Village Innovation Way Barnsley", { width: PAGE_WIDTH, align: "center" })
    .text("South Yorkshire S75 1JL", { width: PAGE_WIDTH, align: "center" })
    .text("office@genesisestateplanning.info", { width: PAGE_WIDTH, align: "center" })
    .text("0330 1180937", { width: PAGE_WIDTH, align: "center" })
    .text("https://www.genesisestateplanning.net/", { width: PAGE_WIDTH, align: "center" });

  doc.fillColor("#000000");
}

function addPageHeader(doc: PDFDocument, testatorName: string, addressLine1: string, addressLine2: string) {
  doc
    .font(GARAMOND_BOLD)
    .fontSize(13)
    .text("This is the last Will and Testament", PAGE_MARGIN, PAGE_MARGIN, {
      width: CONTENT_WIDTH,
      align: "center",
    });
  doc
    .font(GARAMOND)
    .fontSize(12)
    .text(`- of - ${testatorName}`, { width: CONTENT_WIDTH, align: "center" });
  if (addressLine1) doc.text(addressLine1, { width: CONTENT_WIDTH, align: "center" });
  if (addressLine2) doc.text(addressLine2, { width: CONTENT_WIDTH, align: "center" });
  doc.moveDown(1.5);
}

function addPageNumber(doc: PDFDocument, pageNum: number, totalPages: number) {
  doc
    .font(GARAMOND)
    .fontSize(10)
    .text(`Page ${pageNum} of ${totalPages}`, 0, doc.page.height - 40, {
      width: PAGE_WIDTH,
      align: "center",
    });
}

function clauseHeading(doc: PDFDocument, num: number, title: string) {
  doc.moveDown(0.8);
  doc
    .font(GARAMOND_BOLD)
    .fontSize(12)
    .text(`${num}.  ${title}`, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.4);
}

function bodyText(doc: PDFDocument, text: string) {
  doc
    .font(GARAMOND)
    .fontSize(11)
    .text(text, PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: "justify",
      lineGap: 3,
    });
  doc.moveDown(0.5);
}

function subItem(doc: PDFDocument, label: string, text: string, indent = 20) {
  doc
    .font(GARAMOND)
    .fontSize(11)
    .text(`${label}  ${text}`, PAGE_MARGIN + indent, doc.y, {
      width: CONTENT_WIDTH - indent,
      align: "justify",
      lineGap: 3,
    });
  doc.moveDown(0.4);
}

// ─── Clause Builders ─────────────────────────────────────────────────────────

function buildRevocationClause(
  doc: PDFDocument,
  clauseNum: number,
  testatorName: string,
  dob: string,
  fullAddress: string,
  excludedCountry?: string
) {
  clauseHeading(doc, clauseNum, "Revocation");
  const excl = excludedCountry ? ` excluding that in ${excludedCountry.toUpperCase()}` : "";
  bodyText(
    doc,
    `I ${testatorName}${dob ? ` date of birth ${dob}` : ""} of ${fullAddress || "[address]"} do hereby revoke all former Wills and testamentary dispositions so far as they relate to my property of every kind wherever situate${excl} and declare that the law of England & Wales shall apply to this my will hereinafter referred to as my Will in relation to my property of every kind wherever situate${excl}`
  );
}

function buildExecutorsClause(
  doc: PDFDocument,
  clauseNum: number,
  executors: PersonEntry[]
) {
  clauseHeading(doc, clauseNum, "Appointment of Executors");

  if (!executors.length) {
    bodyText(doc, "I appoint [Executor Name] to be the sole executor of this my Will.");
  } else {
    const primary = executors[0];
    const substitutes = executors.slice(1);

    let text = `I appoint ${fullName(primary)}`;
    if (personAddress(primary)) text += ` of ${personAddress(primary)}`;
    text += ` to be the sole executor of this my Will`;

    if (substitutes.length > 0) {
      text += ` but if my ${relationship(primary)} is unable or unwilling to prove my Will then I APPOINT `;
      text += substitutes
        .map((s) => {
          let t = fullName(s);
          if (personAddress(s)) t += ` of ${personAddress(s)}`;
          return t;
        })
        .join(" and ");
      text += ` to be the executors of this my Will (hereinafter referred to as 'my Executors')`;
    } else {
      text += ` (hereinafter referred to as 'my Executors')`;
    }

    bodyText(doc, text);
  }

  doc.moveDown(0.4);
  bodyText(
    doc,
    "Always provided that if a trust is created in the following clauses of this my Will and no appointment of a trustee is made in relation to that trust I direct that my Executor shall be appointed as my trustee hereinafter referred to as 'my trustees' which expression shall include the trustee or trustees for the time being hereof"
  );
}

function buildDefinitionClause(doc: PDFDocument, clauseNum: number, excludedCountry?: string) {
  clauseHeading(doc, clauseNum, "Definition and Administration of my Estate");
  const excl = excludedCountry ? ` excluding that in ${excludedCountry.toUpperCase()}` : "";
  subItem(doc, "a)", "In this my Will where the context so admits my Estate shall mean:");
  subItem(doc, "i)", `all my real and personal property of every kind wherever situate${excl} including that over which I have a general power of appointment and`, 40);
  subItem(doc, "ii)", "the money investments and property from time to time representing all such property", 40);
  subItem(doc, "b)", "My Executors shall hold my Estate upon trust");
  subItem(doc, "i)", "to pay and discharge all my debts funeral testamentary and administration expenses and", 40);
  subItem(doc, "ii)", "to give effect to all legacies", 40);
}

function buildDistributionClause(
  doc: PDFDocument,
  clauseNum: number,
  primaryBeneficiary: PersonEntry | null,
  beneficiaries: PersonEntry[],
  specificGifts: Array<{ description?: string; recipient?: string; value?: string }>
) {
  clauseHeading(doc, clauseNum, "Distribution of the Residue");
  bodyText(doc, "SUBJECT to the trusts DECLARED above my Executors SHALL HOLD my Estate as follows:");

  if (primaryBeneficiary && fullName(primaryBeneficiary)) {
    subItem(
      doc,
      "a)",
      `Upon trust absolutely for my ${relationship(primaryBeneficiary)} ${fullName(primaryBeneficiary)} if ${safe(primaryBeneficiary.relationship) ? "he/she" : "they"} shall survive me for the period of twenty eight days but if my said ${relationship(primaryBeneficiary)} shall die in my lifetime or shall not survive me for the period aforesaid or if this gift fails or lapses for any other reason and subject thereto`
    );
  } else {
    subItem(doc, "a)", "Upon trust absolutely for [Primary Beneficiary] if they shall survive me for the period of twenty eight days but if my said beneficiary shall die in my lifetime or shall not survive me for the period aforesaid or if this gift fails or lapses for any other reason and subject thereto");
  }

  if (beneficiaries.length > 0) {
    subItem(doc, "b)", "Upon trust in the following shares:");
    const equalShare = Math.floor(100 / beneficiaries.length);
    beneficiaries.forEach((b, i) => {
      const name = fullName(b) || "[Beneficiary]";
      const share = (b as PersonEntry & { share?: string }).share || `${equalShare}%`;
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

  // Specific gifts
  if (specificGifts.length > 0) {
    doc.moveDown(0.4);
    specificGifts.forEach((g) => {
      if (g.description || g.recipient) {
        bodyText(doc, `I give ${safe(g.description) || "[item]"} to ${safe(g.recipient) || "[recipient]"}${g.value ? ` (estimated value: ${g.value})` : ""}.`);
      }
    });
  }
}

function buildAgeConditionClause(doc: PDFDocument, clauseNum: number) {
  clauseHeading(doc, clauseNum, "Conditional Gift at Specified Age of 18 Years");
  bodyText(
    doc,
    "Any interest left in this my Will to a beneficiary shall be conditional on them attaining the age of 18 years and shall carry the intermediate interest until that age I give the power to my Executors in their absolute discretion to advance part or all of such entitlement which my Executors deem to be appropriate"
  );
}

function buildExecutorPowersClause(doc: PDFDocument, clauseNum: number) {
  clauseHeading(doc, clauseNum, "Executor and Trustee Powers");
  bodyText(
    doc,
    "My Executors and trustees shall in addition to and without prejudice to all statutory powers have the powers and immunities set out in The STEP Powers provided they shall not exercise any of their powers so as to conflict with the beneficial provisions of this my Will"
  );
}

function buildSurvivorshipClause(doc: PDFDocument, clauseNum: number) {
  clauseHeading(doc, clauseNum, "Survivorship");
  bodyText(
    doc,
    "Any Person who does not survive me by twenty eight days who would otherwise be a beneficiary under this my Will shall be treated for the purposes of my Will as having died in my lifetime"
  );
}

function buildOrganDonationClause(doc: PDFDocument, clauseNum: number) {
  clauseHeading(doc, clauseNum, "Organ Donation");
  bodyText(
    doc,
    "I declare that it is my desire that after my death any of my organs can be used for therapeutic purposes"
  );
}

function buildFuneralWishesClause(doc: PDFDocument, clauseNum: number, funeralWishes: string) {
  clauseHeading(doc, clauseNum, "Funeral Wishes");
  if (funeralWishes && funeralWishes.trim()) {
    bodyText(doc, funeralWishes.trim());
  } else {
    bodyText(
      doc,
      "I Desire that my body be [cremated/buried] and my ashes disposed of by my trustees and the expense thereof shall be a first charge on my Estate"
    );
  }
}

function buildStepPowersClause(doc: PDFDocument, clauseNum: number) {
  clauseHeading(doc, clauseNum, "STEP Powers");
  bodyText(
    doc,
    "In this my Will where the context so admits any reference to the STEP Powers shall mean the Standard Provisions and all of the Special Provisions (with the exception of 18.2) of the Society of Trust and Estate Practitioners (3rd edition) shall apply"
  );
}

function buildAvoidanceOfDoubtClause(doc: PDFDocument, clauseNum: number) {
  clauseHeading(doc, clauseNum, "For the Avoidance of Doubt");
  bodyText(doc, "I declare that");
  subItem(doc, "a)", "Clause headings are included for reference purposes only and do not affect the interpretation of this my Will");
  subItem(doc, "b)", "Words denoting the singular shall include the plural and vice versa and the masculine includes the feminine and vice versa");
  subItem(doc, "c)", "Person shall include a body of persons either corporate or incorporate");
  subItem(doc, "d)", "References to any statutory provision shall include any statutory modification or re-enactment of such provisions");
  subItem(doc, "e)", "Due to printing limitations the reverse side of every page of this my Will may be left blank");
  subItem(doc, "f)", "This is to be the last clause of my Will and shall be followed only by the attestation clause");
}

// ─── Trust Clause Builders ───────────────────────────────────────────────────

function buildPPTClause(doc: PDFDocument, clauseNum: number, testatorName: string, partnerName: string, children: string[]) {
  clauseHeading(doc, clauseNum, "Protective Property Trust (Lifetime Interest Trust)");
  bodyText(
    doc,
    `Notwithstanding the provisions of Clause 4 above I DECLARE that my share of the property known as my principal residence (hereinafter referred to as 'the Property') shall be held upon the following trusts:`
  );
  subItem(doc, "a)", `Upon trust to permit my ${partnerName ? `${partnerName}` : "surviving spouse/civil partner"} to reside in the Property during their lifetime or until they shall remarry or enter into a new civil partnership (hereinafter referred to as the 'Life Tenant') and`);
  subItem(doc, "b)", `Subject to the life interest aforesaid upon trust for ${children.length > 0 ? children.join(", ") : "my children"} in equal shares absolutely`);
  subItem(doc, "c)", "My Trustees shall have power to sell the Property and to apply the proceeds of sale in the purchase of another property to be held upon the same trusts or to invest the same as if they were absolute owners thereof");
  subItem(doc, "d)", "The Life Tenant shall be responsible for the payment of all outgoings in respect of the Property including rates taxes insurance and the cost of repairs and maintenance");
  doc.moveDown(0.4);
  bodyText(doc, "This trust is commonly referred to as a Protective Property Trust and is intended to protect the testator's share of the property for the benefit of the remainder beneficiaries whilst providing security of occupation for the surviving spouse or civil partner.");
}

function buildDiscretionaryTrustClause(doc: PDFDocument, clauseNum: number, trustees: PersonEntry[], beneficiaryClass: string) {
  clauseHeading(doc, clauseNum, "Discretionary Trust");
  bodyText(
    doc,
    `I DECLARE that the following provisions shall apply to the Discretionary Trust created by this my Will:`
  );
  subItem(doc, "a)", `The Trustees of this Discretionary Trust shall be ${trustees.length > 0 ? trustees.map(fullName).filter(Boolean).join(" and ") : "my Executors"} or such other persons as shall be appointed as trustees hereof from time to time`);
  subItem(doc, "b)", `The Beneficiaries of this Discretionary Trust shall be ${beneficiaryClass || "my children and remoter issue and such other persons as my Trustees shall in their absolute discretion determine"}`);
  subItem(doc, "c)", "My Trustees shall hold the trust fund upon trust to pay or apply the income and/or capital thereof to or for the benefit of all or any one or more of the Beneficiaries in such shares and proportions and in such manner as my Trustees shall in their absolute discretion think fit");
  subItem(doc, "d)", "My Trustees shall have the widest possible powers of investment as if they were absolute beneficial owners of the trust fund and shall not be restricted to investments authorised by law for trustees");
  subItem(doc, "e)", "This Discretionary Trust shall terminate on the expiry of the period of 125 years from the date of my death (which period shall be the perpetuity period applicable to this trust) and upon such termination the trust fund shall be held for such of the Beneficiaries as are then living in equal shares absolutely");
}

function buildVulnerableTrustClause(doc: PDFDocument, clauseNum: number, vulnerableBeneficiary: string, trustees: PersonEntry[]) {
  clauseHeading(doc, clauseNum, "Vulnerable Person's Trust");
  bodyText(
    doc,
    `I DECLARE that the following provisions shall apply to the Vulnerable Person's Trust created by this my Will for the benefit of ${vulnerableBeneficiary || "[Vulnerable Beneficiary Name]"} (hereinafter referred to as 'the Vulnerable Beneficiary'):`
  );
  subItem(doc, "a)", `The Trustees of this trust shall be ${trustees.length > 0 ? trustees.map(fullName).filter(Boolean).join(" and ") : "my Executors"}`);
  subItem(doc, "b)", "This trust is intended to qualify as a Vulnerable Beneficiary Trust within the meaning of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to qualify as such");
  subItem(doc, "c)", "My Trustees shall hold the trust fund upon trust to apply the income and capital thereof for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees in their absolute discretion think fit having regard to the needs and welfare of the Vulnerable Beneficiary");
  subItem(doc, "d)", "Subject to the life interest of the Vulnerable Beneficiary the trust fund shall on the death of the Vulnerable Beneficiary be held for such of my children and remoter issue as shall then be living in equal shares absolutely or if none for my estate");
  subItem(doc, "e)", "My Trustees shall have power to apply capital for the benefit of the Vulnerable Beneficiary at any time and from time to time as they in their absolute discretion think fit");
}

// ─── Attestation Page ─────────────────────────────────────────────────────────

function addAttestationPage(doc: PDFDocument, testatorName: string) {
  doc.addPage();

  doc
    .font(GARAMOND_BOLD)
    .fontSize(14)
    .text("The Testimonium and Attestation", PAGE_MARGIN, PAGE_MARGIN, {
      width: CONTENT_WIDTH,
      align: "center",
    });

  doc
    .font(GARAMOND_BOLD)
    .fontSize(12)
    .text(`SIGNED by ${testatorName}`, { width: CONTENT_WIDTH, align: "center" });

  doc.moveDown(1.5);

  doc
    .font(GARAMOND)
    .fontSize(11)
    .text("on the ________________ day of _________________________ 20_____", PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: "left",
    });

  doc.moveDown(1);
  doc.text("Signature of Testator:  _____________________________________________");
  doc.moveDown(0.5);
  doc.text(testatorName);
  doc.moveDown(1);
  doc.text(
    "SIGNED by the Testator in our presence and attested by us in the presence of the Testator and of each other",
    PAGE_MARGIN,
    doc.y,
    { width: CONTENT_WIDTH }
  );

  doc.moveDown(1.5);

  // Witness 1
  doc.font(GARAMOND_BOLD).text("Witness 1");
  doc.moveDown(0.5);
  doc.font(GARAMOND).fontSize(11);
  const witnessFields = ["Signature", "Full Name", "Address", "", "Occupation"];
  witnessFields.forEach((label) => {
    doc.text(`${label.padEnd(14)}  _____________________________________________`, PAGE_MARGIN + 20, doc.y);
    doc.moveDown(0.8);
  });

  doc.moveDown(0.5);
  doc.font(GARAMOND_BOLD).text("Witness 2");
  doc.moveDown(0.5);
  doc.font(GARAMOND).fontSize(11);
  witnessFields.forEach((label) => {
    doc.text(`${label.padEnd(14)}  _____________________________________________`, PAGE_MARGIN + 20, doc.y);
    doc.moveDown(0.8);
  });
}

// ─── Main Generator ──────────────────────────────────────────────────────────

export function generateWillDocument(
  record: WillInstruction,
  options: WillOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocumentLib({
      size: "A4",
      margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
      autoFirstPage: false,
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Determine which client we are drafting for ──────────────────────────
    const isClient2 = options.willType === "mirror_client2";

    const prefix = isClient2 ? safe(record.client2Prefix) : safe(record.client1Prefix);
    const firstName = isClient2 ? safe(record.client2FirstName) : safe(record.client1FirstName);
    const middleName = isClient2 ? safe(record.client2MiddleName) : safe(record.client1MiddleName);
    const lastName = isClient2 ? safe(record.client2LastName) : safe(record.client1LastName);
    const dob = isClient2 ? safe(record.client2Dob) : safe(record.client1Dob);
    const addr1 = isClient2 ? safe(record.client2AddressLine1) : safe(record.client1AddressLine1);
    const city = isClient2 ? safe(record.client2City) : safe(record.client1City);
    const postcode = isClient2 ? safe(record.client2Postcode) : safe(record.client1Postcode);

    const testatorName = [prefix, firstName, middleName, lastName].filter(Boolean).join(" ") || "Testator";
    const fullAddress = [addr1, city, postcode].filter(Boolean).join(" ") || "";
    const addressLine1 = addr1 || "";
    const addressLine2 = [city, postcode].filter(Boolean).join(" ");

    const reference = safe(record.referenceNumber);

    // ── Executors ────────────────────────────────────────────────────────────
    // For mirror wills, the partner is the primary executor
    let executors: PersonEntry[] = [];
    if (options.willType === "mirror_client1") {
      // Client 1's Will: partner (Client 2) is primary executor
      const partnerEntry: PersonEntry = {
        prefix: safe(record.client2Prefix),
        firstName: safe(record.client2FirstName),
        lastName: safe(record.client2LastName),
        address: [safe(record.client2AddressLine1), safe(record.client2City), safe(record.client2Postcode)].filter(Boolean).join(" "),
        relationship: "spouse/partner",
      };
      const substitutes = safeArr(record.client1Executors);
      executors = [partnerEntry, ...substitutes];
    } else if (options.willType === "mirror_client2") {
      // Client 2's Will: partner (Client 1) is primary executor
      const partnerEntry: PersonEntry = {
        prefix: safe(record.client1Prefix),
        firstName: safe(record.client1FirstName),
        lastName: safe(record.client1LastName),
        address: [safe(record.client1AddressLine1), safe(record.client1City), safe(record.client1Postcode)].filter(Boolean).join(" "),
        relationship: "spouse/partner",
      };
      const substitutes = safeArr(record.client2Executors);
      executors = [partnerEntry, ...substitutes];
    } else {
      executors = safeArr(record.client1Executors);
    }

    // ── Beneficiaries ────────────────────────────────────────────────────────
    let primaryBeneficiary: PersonEntry | null = null;
    let residuaryBeneficiaries: PersonEntry[] = [];

    if (options.willType === "mirror_client1") {
      // Client 1's Will: partner is primary beneficiary
      primaryBeneficiary = {
        prefix: safe(record.client2Prefix),
        firstName: safe(record.client2FirstName),
        lastName: safe(record.client2LastName),
        relationship: "spouse/partner",
      };
      residuaryBeneficiaries = safeArr(record.client1Beneficiaries);
    } else if (options.willType === "mirror_client2") {
      primaryBeneficiary = {
        prefix: safe(record.client1Prefix),
        firstName: safe(record.client1FirstName),
        lastName: safe(record.client1LastName),
        relationship: "spouse/partner",
      };
      residuaryBeneficiaries = safeArr(record.client2Beneficiaries);
    } else {
      // Single will: first beneficiary is primary if present
      const allBeneficiaries = safeArr(record.client1Beneficiaries);
      if (allBeneficiaries.length > 0) {
        primaryBeneficiary = allBeneficiaries[0];
        residuaryBeneficiaries = allBeneficiaries.slice(1);
      }
    }

    // ── Specific gifts ───────────────────────────────────────────────────────
    const specificGifts = safeArr(record.specificGifts) as Array<{
      description?: string;
      recipient?: string;
   
    }>;

    // ── Funeral / organ donation ─────────────────────────────────────────────
    const funeralWishes = safe(record.funeralWishes);
    const organDonation = safe(record.organDonation).toLowerCase() === "yes";

    // ── Trust data ───────────────────────────────────────────────────────────
    const trustees = safeArr(record.trustees);
    const partnerName =
      options.willType === "mirror_client1"
        ? [safe(record.client2Prefix), safe(record.client2FirstName), safe(record.client2LastName)].filter(Boolean).join(" ")
        : [safe(record.client1Prefix), safe(record.client1FirstName), safe(record.client1LastName)].filter(Boolean).join(" ");

    const children = safeArr(record.client1ChildrenUnder18).map((c) =>
      fullName(c as PersonEntry)
    ).filter(Boolean);

    const vulnerableBeneficiary = safe(record.vulnerableBeneficiaryDetails);

    // ── Build clause list ────────────────────────────────────────────────────
    let clauseNum = 1;

    // Cover page
    doc.addPage();
    addCoverPage(doc, testatorName, reference);

    // Main content page
    doc.addPage();
    addPageHeader(doc, testatorName, addressLine1, addressLine2);

    buildRevocationClause(doc, clauseNum++, testatorName, dob, fullAddress);
    buildExecutorsClause(doc, clauseNum++, executors);
    buildDefinitionClause(doc, clauseNum++);
    buildDistributionClause(doc, clauseNum++, primaryBeneficiary, residuaryBeneficiaries, specificGifts);

    if (options.includePPT) {
      buildPPTClause(doc, clauseNum++, testatorName, partnerName, children);
    }

    if (options.includeDiscretionaryTrust) {
      buildDiscretionaryTrustClause(doc, clauseNum++, trustees, "my children and remoter issue");
    }

    if (options.includeVulnerableTrust) {
      buildVulnerableTrustClause(doc, clauseNum++, vulnerableBeneficiary, trustees);
    }

    buildAgeConditionClause(doc, clauseNum++);
    buildExecutorPowersClause(doc, clauseNum++);
    buildSurvivorshipClause(doc, clauseNum++);

    if (organDonation) {
      buildOrganDonationClause(doc, clauseNum++);
    }

    buildFuneralWishesClause(doc, clauseNum++, funeralWishes);
    buildStepPowersClause(doc, clauseNum++);
    buildAvoidanceOfDoubtClause(doc, clauseNum++);

    // Attestation page
    addAttestationPage(doc, testatorName);

    doc.end();
  });
}
