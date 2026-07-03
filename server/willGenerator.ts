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
import https from "https";
import http from "http";

// Logo URL (served via Manus static storage proxy)
const LOGO_URL = "/manus-storage/GenesisEstatePlanningLogoUSETHISONE_edc6d153.png";

// Fetch a URL as a Buffer (works for both http and https)
function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, (res) => {
      // Follow redirects (manus-storage returns 307)
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

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
  share?: string;
  gender?: string;
  fullName?: string;
  dateOfBirth?: string;
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

function fullName(p: PersonEntry | null | undefined, includeDob = true): string {
  if (!p) return "";
  const name = [p.prefix, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ").trim();
  const dobPart = includeDob && p.dob ? ` (born ${p.dob})` : "";
  return name + dobPart;
}

function personAddress(p: PersonEntry | null | undefined): string {
  return safe(p?.address);
}

function relationship(p: PersonEntry | null | undefined): string {
  return safe(p?.relationship) || "person";
}

function pronoun(gender?: string | null): { subj: string; poss: string; obj: string; subjCap: string } {
  if (gender === "male") return { subj: "he", poss: "his", obj: "him", subjCap: "He" };
  if (gender === "female") return { subj: "she", poss: "her", obj: "her", subjCap: "She" };
  return { subj: "they", poss: "their", obj: "them", subjCap: "They" };
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

async function fetchLogoBuffer(): Promise<Buffer | null> {
  try {
    // Try local file first (dev sandbox)
    const fs = await import("fs");
    const path = await import("path");
    const localPath = path.join(process.cwd(), "../webdev-static-assets/GenesisEstatePlanningLogoUSETHISONE.png");
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
    // Fall back to the uploaded static URL via the local server proxy
    const baseUrl = `http://localhost:${process.env.PORT ?? 3000}`;
    return await fetchBuffer(`${baseUrl}${LOGO_URL}`);
  } catch {
    return null;
  }
}

function addCoverPage(doc: PDFDocument, testatorName: string, reference: string, logoBuffer?: Buffer | null) {
  // Outer border
  doc.rect(30, 30, PAGE_WIDTH - 60, doc.page.height - 60).stroke("#000000");
  // Inner border
  doc.rect(40, 40, PAGE_WIDTH - 80, doc.page.height - 80).stroke("#000000");

  // Logo — centred near top
  if (logoBuffer) {
    const logoW = 200;
    const logoX = (PAGE_WIDTH - logoW) / 2;
    try {
      doc.image(logoBuffer, logoX, 60, { width: logoW });
    } catch {
      // If image embedding fails, skip silently
    }
  }

  // Title block — centred box
  const boxTop = 145;
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

function buildReservedExecutorsClause(
  doc: PDFDocument,
  clauseNum: number,
  reservedExecutors: PersonEntry[]
) {
  if (!reservedExecutors.length) return;
  clauseHeading(doc, clauseNum, "Appointment of Reserve Executors");
  const names = reservedExecutors
    .map((e) => {
      let t = fullName(e);
      if (personAddress(e)) t += ` of ${personAddress(e)}`;
      return t;
    })
    .filter(Boolean);
  if (names.length === 1) {
    bodyText(doc, `In the event that my primary Executor is unable or unwilling to act I APPOINT ${names[0]} as Reserve Executor of this my Will (hereinafter also referred to as 'my Executors').`);
  } else {
    bodyText(doc, `In the event that my primary Executor is unable or unwilling to act I APPOINT ${names.join(" and ")} as Reserve Executors of this my Will (hereinafter also referred to as 'my Executors').`);
  }
}

function buildGuardiansClause(
  doc: PDFDocument,
  clauseNum: number,
  guardians: PersonEntry[],
  reservedGuardians: PersonEntry[]
) {
  if (!guardians.length && !reservedGuardians.length) return;
  clauseHeading(doc, clauseNum, "Appointment of Guardians");
  if (guardians.length > 0) {
    const names = guardians
      .map((g) => {
        let t = fullName(g);
        if (personAddress(g)) t += ` of ${personAddress(g)}`;
        return t;
      })
      .filter(Boolean);
    bodyText(
      doc,
      `In the event of my death whilst my children are under the age of eighteen years I APPOINT ${names.join(" and ")} to be the Guardian${names.length > 1 ? "s" : ""} of my minor children.`
    );
  }
  if (reservedGuardians.length > 0) {
    const rNames = reservedGuardians
      .map((g) => {
        let t = fullName(g);
        if (personAddress(g)) t += ` of ${personAddress(g)}`;
        return t;
      })
      .filter(Boolean);
    bodyText(
      doc,
      `In the event that the above-named Guardian${reservedGuardians.length > 1 ? "s are" : " is"} unable or unwilling to act I APPOINT ${rNames.join(" and ")} as Reserve Guardian${rNames.length > 1 ? "s" : ""} of my minor children.`
    );
  }
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

function buildFuneralWishesClause(doc: PDFDocument, clauseNum: number, funeralType: string, funeralWishes: string) {
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

function buildStepPowersClause(doc: PDFDocument, clauseNum: number) {
  clauseHeading(doc, clauseNum, "STEP Powers");
  bodyText(
    doc,
    "In this my Will where the context so admits any reference to the STEP Powers shall mean the Standard Provisions (2nd edition) of the Society of Trust and Estate Practitioners together with the Special Provisions (2nd edition) (with the exception of Special Provision 5) shall apply to this my Will"
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

// ─── Trust Clause Builders (Rich Multi-Instance) ─────────────────────────────

interface PPTClause {
  propertyAddress?: string;
  trustees?: PersonEntry[];
  lifeTenants?: PersonEntry[];
  terminationTriggers?: {
    onDeath?: boolean;
    onRemarriageOrCohabitation?: boolean;
    onCeasingToReside?: boolean;
    onBreachOfConditions?: boolean;
  };
  trustPeriodNotes?: string;
  ultimateBeneficiaries?: PersonEntry[];
  notes?: string;
}

interface DiscretionaryTrustClause {
  trustees?: PersonEntry[];
  beneficiaryClass?: string;
  additionalBeneficiaries?: PersonEntry[];
  terminationNotes?: string;
  notes?: string;
}

interface VulnerableTrustClause {
  vulnerableBeneficiary?: PersonEntry;
  trustees?: PersonEntry[];
  ultimateBeneficiaries?: PersonEntry[];
  notes?: string;
}

interface NilRateBandClause {
  trustees?: PersonEntry[];
  beneficiaries?: PersonEntry[];
  notes?: string;
}

interface BereavedMinorClause {
  beneficiary?: PersonEntry;
  trustees?: PersonEntry[];
  ageOfAbsoluteEntitlement?: string;
  notes?: string;
}

interface Age18To25Clause {
  beneficiary?: PersonEntry;
  trustees?: PersonEntry[];
  ageOfAbsoluteEntitlement?: string;
  notes?: string;
}

interface BusinessPropertyReliefClause {
  businessName?: string;
  trustees?: PersonEntry[];
  beneficiaries?: PersonEntry[];
  notes?: string;
}

function safeClauseArr<T>(v: unknown): T[] {
  if (!v) return [];
  if (typeof v === "string") { try { return JSON.parse(v) as T[]; } catch { return []; } }
  if (Array.isArray(v)) return v as T[];
  return [];
}

function trusteeNames(trustees: PersonEntry[] | undefined, fallback = "my Executors"): string {
  const names = (trustees ?? []).map(p => fullName(p)).filter(Boolean);
  if (names.length === 0) return fallback;
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

function beneficiaryNamesWithShares(people: PersonEntry[] | undefined, fallback = "my children and remoter issue in equal shares absolutely"): string {
  const parts = (people ?? []).map(p => {
    const n = fullName(p);
    return n && p.share ? `${n} as to ${p.share}` : n;
  }).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0] + " absolutely";
  return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] + " in the shares specified";
}

function buildPPTClause(doc: PDFDocument, clauseNum: number, clause: PPTClause) {
  const property = clause.propertyAddress || "my principal residence";
  const lifeTenantNames = (clause.lifeTenants ?? []).map(p => fullName(p)).filter(Boolean);
  const lifeTenantStr = lifeTenantNames.length > 0
    ? lifeTenantNames.join(" and ")
    : "my surviving spouse or civil partner";
  const trustees = trusteeNames(clause.trustees);
  const ultimateBens = beneficiaryNamesWithShares(clause.ultimateBeneficiaries);
  const triggers = clause.terminationTriggers ?? {};

  clauseHeading(doc, clauseNum, "Protective Property Trust (Lifetime Interest Trust)");
  bodyText(doc, `I DECLARE that my share of the property known as ${property} (hereinafter referred to as "the Property") shall not pass under the general gift of my Residuary Estate but shall instead be held upon the following trusts:`);

  subItem(doc, "a)", `The Trustees of this trust shall be ${trustees} (hereinafter referred to as "the Trustees") and the Trustees shall hold my share of the Property upon the trusts and with and subject to the powers and provisions hereinafter declared and contained.`);

  subItem(doc, "b)", `The Trustees shall hold my share of the Property upon trust to permit ${lifeTenantStr} (hereinafter referred to as "the Life Tenant") to have the right to reside in the Property during the Trust Period.`);

  // Termination triggers
  const terminationEvents: string[] = [];
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

function buildDiscretionaryTrustClause(doc: PDFDocument, clauseNum: number, clause: DiscretionaryTrustClause) {
  const trustees = trusteeNames(clause.trustees);
  const benefClass = clause.beneficiaryClass || "my children and remoter issue and such other persons as my Trustees shall in their absolute discretion determine";
  const additionalBens = (clause.additionalBeneficiaries ?? []).map(p => fullName(p)).filter(Boolean);

  clauseHeading(doc, clauseNum, "Discretionary Trust");
  bodyText(doc, `I DECLARE that the following provisions shall apply to the Discretionary Trust created by this my Will:`);

  subItem(doc, "a)", `The Trustees of this Discretionary Trust shall be ${trustees} or such other persons as shall be appointed as trustees hereof from time to time.`);

  const fullBenClass = additionalBens.length > 0
    ? `${benefClass}, together with ${additionalBens.join(", ")}`
    : benefClass;
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

function buildVulnerableTrustClause(doc: PDFDocument, clauseNum: number, clause: VulnerableTrustClause) {
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

function buildNilRateBandClause(doc: PDFDocument, clauseNum: number, clause: NilRateBandClause) {
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

function buildBereavedMinorClause(doc: PDFDocument, clauseNum: number, clause: BereavedMinorClause) {
  const bName = clause.beneficiary ? fullName(clause.beneficiary) || "[Beneficiary Name]" : "[Beneficiary Name]";
  const trustees = trusteeNames(clause.trustees);
  const age = clause.ageOfAbsoluteEntitlement || "18";

  clauseHeading(doc, clauseNum, "Bereaved Minor's Trust (s.71A IHTA 1984)");
  bodyText(doc, `I DECLARE that the following provisions shall apply to the trust created by this my Will for the benefit of ${bName} (hereinafter referred to as "the Beneficiary"):`)

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

function buildAge18To25Clause(doc: PDFDocument, clauseNum: number, clause: Age18To25Clause) {
  const bName = clause.beneficiary ? fullName(clause.beneficiary) || "[Beneficiary Name]" : "[Beneficiary Name]";
  const trustees = trusteeNames(clause.trustees);
  const age = clause.ageOfAbsoluteEntitlement || "25";

  clauseHeading(doc, clauseNum, `18-to-25 Trust (s.71D IHTA 1984)`);
  bodyText(doc, `I DECLARE that the following provisions shall apply to the trust created by this my Will for the benefit of ${bName} (hereinafter referred to as "the Beneficiary"):`)

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

function buildBusinessPropertyReliefClause(doc: PDFDocument, clauseNum: number, clause: BusinessPropertyReliefClause) {
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

// ─── Attestation Page ─────────────────────────────────────────────────────────

function addAttestationPage(doc: PDFDocument, testatorName: string) {
  doc.addPage();

  const pageWidth = doc.page.width;
  const colW = (CONTENT_WIDTH - 20) / 2; // two-column layout for witnesses

  // ── Title ──────────────────────────────────────────────────────────────────
  doc
    .font(GARAMOND_BOLD)
    .fontSize(14)
    .text("EXECUTION PAGE", PAGE_MARGIN, PAGE_MARGIN, { width: CONTENT_WIDTH, align: "center" });

  doc.moveDown(0.3);
  doc
    .font(GARAMOND)
    .fontSize(10)
    .fillColor("#555")
    .text("The Testimonium and Attestation Clause", PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH, align: "center" });
  doc.fillColor("#000");

  // Horizontal rule
  doc.moveDown(0.6);
  doc.moveTo(PAGE_MARGIN, doc.y).lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y).strokeColor("#888").lineWidth(0.5).stroke();
  doc.strokeColor("#000").lineWidth(1);

  // ── Testimonium ────────────────────────────────────────────────────────────
  doc.moveDown(0.8);
  doc
    .font(GARAMOND)
    .fontSize(11)
    .text(
      `I, ${testatorName}, declare this to be my last Will and Testament and I sign it as my Will in the presence of the witnesses named below, who each attest and subscribe it in my presence and in the presence of each other, all being present at the same time.`,
      PAGE_MARGIN,
      doc.y,
      { width: CONTENT_WIDTH, align: "justify" }
    );

  // ── Testator signature block ────────────────────────────────────────────────
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

  // ── Attestation statement ───────────────────────────────────────────────────
  doc.moveDown(0.3);
  const afterBox = boxTop + boxH + 10;
  doc
    .font(GARAMOND)
    .fontSize(10)
    .fillColor("#333")
    .text(
      "SIGNED by the above-named Testator as their last Will in our presence and attested by us in the presence of the Testator and of each other:",
      PAGE_MARGIN,
      afterBox,
      { width: CONTENT_WIDTH, align: "justify" }
    );
  doc.fillColor("#000");

  // ── Witness blocks (two columns) ────────────────────────────────────────────
  const witnessTop = afterBox + 30;
  const witnessBoxH = 180;

  function drawWitnessBox(label: string, x: number, y: number, w: number) {
    doc.rect(x, y, w, witnessBoxH).strokeColor("#aaa").lineWidth(0.5).stroke();
    doc.strokeColor("#000").lineWidth(1);
    const ix = x + 10;
    const iw = w - 20;
    doc.font(GARAMOND_BOLD).fontSize(10).text(label, ix, y + 8, { width: iw });
    doc.font(GARAMOND).fontSize(10);

    const rows: Array<{ label: string; lineH: number }> = [
      { label: "Signature:", lineH: 40 },
      { label: "Full Name:", lineH: 70 },
      { label: "Address:", lineH: 100 },
      { label: "", lineH: 120 },
      { label: "", lineH: 140 },
      { label: "Occupation:", lineH: 162 },
    ];

    rows.forEach(({ label: rowLabel, lineH }) => {
      if (rowLabel) doc.text(rowLabel, ix, y + lineH - 12, { width: 65 });
      doc.moveTo(ix + (rowLabel ? 68 : 10), y + lineH).lineTo(x + w - 10, y + lineH).strokeColor("#bbb").lineWidth(0.4).stroke();
    });
    doc.strokeColor("#000").lineWidth(1);
  }

  drawWitnessBox("WITNESS 1", PAGE_MARGIN, witnessTop, colW);
  drawWitnessBox("WITNESS 2", PAGE_MARGIN + colW + 20, witnessTop, colW);

  // ── Footer note ─────────────────────────────────────────────────────────────
  const footerY = witnessTop + witnessBoxH + 14;
  doc
    .font(GARAMOND)
    .fontSize(8)
    .fillColor("#666")
    .text(
      "Note: A witness must be 18 years or over, of sound mind, and must not be a beneficiary under this Will or the spouse/civil partner of a beneficiary.",
      PAGE_MARGIN,
      footerY,
      { width: CONTENT_WIDTH, align: "center" }
    );
  doc.fillColor("#000");
}

// ─── Main Generator ──────────────────────────────────────────────────────────

export async function generateWillDocument(
  record: WillInstruction,
  options: WillOptions
): Promise<Buffer> {
  // Fetch logo once before building the document
  const logoBuffer = await fetchLogoBuffer().catch(() => null);

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

    // ── Reserved executors ───────────────────────────────────────────────────
    let reservedExecutors: PersonEntry[] = [];
    if (options.willType === "mirror_client2") {
      reservedExecutors = safeArr(record.client2ReservedExecutors);
    } else {
      reservedExecutors = safeArr(record.client1ReservedExecutors);
    }

    // ── Guardians ────────────────────────────────────────────────────────────
    let guardians: PersonEntry[] = [];
    let reservedGuardians: PersonEntry[] = [];
    if (options.willType === "mirror_client2") {
      guardians = safeArr(record.client2Guardians);
      reservedGuardians = safeArr(record.client2ReservedGuardians);
    } else {
      guardians = safeArr(record.client1Guardians);
      reservedGuardians = safeArr(record.client1ReservedGuardians);
    }

    // ── Specific gifts ───────────────────────────────────────────────────────
    let specificGifts: Array<{ description?: string; recipient?: string; value?: string }> = [];
    if (options.willType === "mirror_client2") {
      specificGifts = safeArr(record.client2SpecificGifts) as typeof specificGifts;
    } else {
      // Use per-client field; fall back to legacy field for older records
      const perClient = safeArr(record.client1SpecificGifts) as typeof specificGifts;
      specificGifts = perClient.length > 0 ? perClient : (safeArr(record.specificGifts) as typeof specificGifts);
    }

    // ── Funeral / organ donation ─────────────────────────────────────────────
    let funeralWishes: string;
    let funeralType: string;
    let organDonation: boolean;
    if (options.willType === "mirror_client2") {
      funeralWishes = safe(record.client2FuneralWishes) || safe(record.funeralWishes);
      funeralType = safe(record.client2FuneralType) || safe((record as any).funeralType);
      organDonation = safe(record.client2OrganDonation).toLowerCase() === "yes";
    } else {
      funeralWishes = safe(record.client1FuneralWishes) || safe(record.funeralWishes);
      funeralType = safe(record.client1FuneralType) || safe((record as any).funeralType);
      organDonation = safe(record.client1OrganDonation).toLowerCase() === "yes" || safe(record.organDonation).toLowerCase() === "yes";
    }

    // ── Residual estate backup ────────────────────────────────────────────────
    const residualBackup = options.willType === "mirror_client2"
      ? safe(record.client2ResidualBackup)
      : safe(record.client1ResidualBackup);

    // ── Trust data ───────────────────────────────────────────────────────────
    const trustees = safeArr(record.trustees);
    const partnerName =
      options.willType === "mirror_client1"
        ? [safe(record.client2Prefix), safe(record.client2FirstName), safe(record.client2LastName)].filter(Boolean).join(" ")
        : [safe(record.client1Prefix), safe(record.client1FirstName), safe(record.client1LastName)].filter(Boolean).join(" ");

    const children = (options.willType === "mirror_client2"
      ? safeArr(record.client2ChildrenUnder18)
      : safeArr(record.client1ChildrenUnder18)
    ).map((c) => fullName(c as PersonEntry)).filter(Boolean);

    const vulnerableBeneficiary = options.willType === "mirror_client2"
      ? safe(record.client2VulnerableBeneficiaryDetails) || safe(record.vulnerableBeneficiaryDetails)
      : safe(record.client1VulnerableBeneficiaryDetails) || safe(record.vulnerableBeneficiaryDetails);

    // ── Build clause list ────────────────────────────────────────────────────
    let clauseNum = 1;

    // Cover page
    doc.addPage();
    addCoverPage(doc, testatorName, reference, logoBuffer);

    // Main content page
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

    // Rich multi-instance optional clauses from saved data
    for (const ppt of safeClauseArr<PPTClause>(record.protectivePropertyTrusts)) {
      buildPPTClause(doc, clauseNum++, ppt);
    }
    for (const dt of safeClauseArr<DiscretionaryTrustClause>(record.discretionaryTrusts)) {
      buildDiscretionaryTrustClause(doc, clauseNum++, dt);
    }
    for (const vt of safeClauseArr<VulnerableTrustClause>(record.vulnerablePersonTrusts)) {
      buildVulnerableTrustClause(doc, clauseNum++, vt);
    }
    for (const nrb of safeClauseArr<NilRateBandClause>(record.nilRateBandTrusts)) {
      buildNilRateBandClause(doc, clauseNum++, nrb);
    }
    for (const bm of safeClauseArr<BereavedMinorClause>(record.bereavedMinorTrusts)) {
      buildBereavedMinorClause(doc, clauseNum++, bm);
    }
    for (const a25 of safeClauseArr<Age18To25Clause>(record.age18To25Trusts)) {
      buildAge18To25Clause(doc, clauseNum++, a25);
    }
    for (const bpr of safeClauseArr<BusinessPropertyReliefClause>(record.businessPropertyReliefs)) {
      buildBusinessPropertyReliefClause(doc, clauseNum++, bpr);
    }
    // Legacy boolean fallbacks (for Wills generated before the new editor)
    if (options.includePPT && safeClauseArr(record.protectivePropertyTrusts).length === 0) {
      buildPPTClause(doc, clauseNum++, {});
    }
    if (options.includeDiscretionaryTrust && safeClauseArr(record.discretionaryTrusts).length === 0) {
      buildDiscretionaryTrustClause(doc, clauseNum++, { trustees });
    }
    if (options.includeVulnerableTrust && safeClauseArr(record.vulnerablePersonTrusts).length === 0) {
      buildVulnerableTrustClause(doc, clauseNum++, {
        vulnerableBeneficiary: { firstName: vulnerableBeneficiary },
        trustees,
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

    // Attestation page
    addAttestationPage(doc, testatorName);

    doc.end();
  });
}
