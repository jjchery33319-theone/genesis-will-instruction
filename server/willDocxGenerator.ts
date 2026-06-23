/**
 * willDocxGenerator.ts
 *
 * Generates a Word (.docx) document from a Will Instruction record using the
 * `docx` library (fully ESM-compatible, no `with` statements).
 *
 * Data mapping mirrors willGenerator.ts exactly:
 *  - Mirror Wills: partner is prepended as primary executor and primary beneficiary
 *  - safeArr() handles JSON strings returned by Drizzle
 *  - Per-client funeral wishes / organ donation fields used
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from "docx";

// ─── Logo helpers ─────────────────────────────────────────────────────────────

const LOGO_URL = "http://localhost:" + (process.env.PORT ?? "3000") + "/manus-storage/GenesisEstatePlanningLogoUSETHISONE_edc6d153.png";
const LOCAL_LOGO = path.join(process.cwd(), "../webdev-static-assets/GenesisEstatePlanningLogoUSETHISONE.png");

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

async function fetchLogoBuffer(): Promise<Buffer | null> {
  try {
    if (fs.existsSync(LOCAL_LOGO)) return fs.readFileSync(LOCAL_LOGO);
    return await fetchBuffer(LOGO_URL);
  } catch {
    return null;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WillDocxOptions {
  willType: "single" | "mirror_client1" | "mirror_client2";
  ppt: boolean;
  discretionary: boolean;
  vulnerable: boolean;
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
}

interface GiftEntry {
  description?: string;
  recipient?: string;
  value?: string;
}

// ─── Data helpers (mirrors willGenerator.ts) ─────────────────────────────────

function safe(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function safeArr(v: unknown): PersonEntry[] {
  if (!v) return [];
  if (typeof v === "string") {
    try { return JSON.parse(v) as PersonEntry[]; } catch { return []; }
  }
  if (Array.isArray(v)) return v as PersonEntry[];
  return [];
}

function safeGiftArr(v: unknown): GiftEntry[] {
  if (!v) return [];
  if (typeof v === "string") {
    try { return JSON.parse(v) as GiftEntry[]; } catch { return []; }
  }
  if (Array.isArray(v)) return v as GiftEntry[];
  return [];
}

function personFullName(p: PersonEntry | null | undefined): string {
  if (!p) return "";
  return [p.prefix, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ").trim();
}

function personRel(p: PersonEntry | null | undefined): string {
  return safe(p?.relationship) || "person";
}

// ─── Document helpers ─────────────────────────────────────────────────────────

function h1(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
  });
}

function clauseHeading(num: number | string, title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}. ${title.toUpperCase()}`, bold: true, size: 24 }),
    ],
    spacing: { before: 240, after: 80 },
  });
}

function body(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 24 })],
    spacing: { before: 60, after: 60 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function subItem(label: string, text: string, indent = 0): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}\t${text}`, size: 24 }),
    ],
    indent: { left: 360 + indent },
    spacing: { before: 40, after: 40 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function sigBlock(label: string): Paragraph[] {
  return [
    new Paragraph({
      children: [new TextRun({ text: label, bold: true, size: 24 })],
      spacing: { before: 160, after: 20 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Signature: " + "_".repeat(55) })],
      spacing: { before: 20, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Full Name: " + "_".repeat(55) })],
      spacing: { before: 20, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Date:      " + "_".repeat(55) })],
      spacing: { before: 20, after: 40 },
    }),
  ];
}

function witnessSigBlock(num: number): Paragraph[] {
  return [
    new Paragraph({
      children: [new TextRun({ text: `WITNESS ${num}`, bold: true, size: 24 })],
      spacing: { before: 200, after: 20 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Signature:  " + "_".repeat(53) })],
      spacing: { before: 20, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Full Name:  " + "_".repeat(53) })],
      spacing: { before: 20, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Address:    " + "_".repeat(53) })],
      spacing: { before: 20, after: 20 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "            " + "_".repeat(53) })],
      spacing: { before: 0, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Occupation: " + "_".repeat(53) })],
      spacing: { before: 20, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Date:       " + "_".repeat(53) })],
      spacing: { before: 20, after: 40 },
    }),
  ];
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── Main generator ──────────────────────────────────────────────────────────

export async function generateWillDocx(
  record: Record<string, unknown>,
  opts: WillDocxOptions
): Promise<Buffer> {
  const logoBuffer = await fetchLogoBuffer();
  const isClient2 = opts.willType === "mirror_client2";
  const isMirror = opts.willType !== "single";

  // ── Testator identity ─────────────────────────────────────────────────────
  const prefix     = isClient2 ? safe(record.client2Prefix)     : safe(record.client1Prefix);
  const firstName  = isClient2 ? safe(record.client2FirstName)  : safe(record.client1FirstName);
  const middleName = isClient2 ? safe(record.client2MiddleName) : safe(record.client1MiddleName);
  const lastName   = isClient2 ? safe(record.client2LastName)   : safe(record.client1LastName);
  const dob        = isClient2 ? safe(record.client2Dob)        : safe(record.client1Dob);
  const addr1      = isClient2 ? safe(record.client2AddressLine1) : safe(record.client1AddressLine1);
  const city       = isClient2 ? safe(record.client2City)       : safe(record.client1City);
  const postcode   = isClient2 ? safe(record.client2Postcode)   : safe(record.client1Postcode);

  const testatorName = [prefix, firstName, middleName, lastName].filter(Boolean).join(" ") || "Testator";
  const fullAddress  = [addr1, city, postcode].filter(Boolean).join(", ") || "";

  // ── Executors (mirrors willGenerator.ts logic) ────────────────────────────
  let executors: PersonEntry[] = [];
  if (opts.willType === "mirror_client1") {
    const partnerEntry: PersonEntry = {
      prefix:       safe(record.client2Prefix),
      firstName:    safe(record.client2FirstName),
      lastName:     safe(record.client2LastName),
      address:      [safe(record.client2AddressLine1), safe(record.client2City), safe(record.client2Postcode)].filter(Boolean).join(" "),
      relationship: "spouse/partner",
    };
    executors = [partnerEntry, ...safeArr(record.client1Executors)];
  } else if (opts.willType === "mirror_client2") {
    const partnerEntry: PersonEntry = {
      prefix:       safe(record.client1Prefix),
      firstName:    safe(record.client1FirstName),
      lastName:     safe(record.client1LastName),
      address:      [safe(record.client1AddressLine1), safe(record.client1City), safe(record.client1Postcode)].filter(Boolean).join(" "),
      relationship: "spouse/partner",
    };
    executors = [partnerEntry, ...safeArr(record.client2Executors)];
  } else {
    executors = safeArr(record.client1Executors);
  }

  // ── Guardians ─────────────────────────────────────────────────────────────
  const guardians: PersonEntry[] = isClient2
    ? safeArr(record.client2Guardians)
    : safeArr(record.client1Guardians);

  // ── Beneficiaries (mirrors willGenerator.ts logic) ────────────────────────
  let primaryBeneficiary: PersonEntry | null = null;
  let residuaryBeneficiaries: PersonEntry[] = [];

  if (opts.willType === "mirror_client1") {
    primaryBeneficiary = {
      prefix:       safe(record.client2Prefix),
      firstName:    safe(record.client2FirstName),
      lastName:     safe(record.client2LastName),
      relationship: "spouse/partner",
    };
    residuaryBeneficiaries = safeArr(record.client1Beneficiaries);
  } else if (opts.willType === "mirror_client2") {
    primaryBeneficiary = {
      prefix:       safe(record.client1Prefix),
      firstName:    safe(record.client1FirstName),
      lastName:     safe(record.client1LastName),
      relationship: "spouse/partner",
    };
    residuaryBeneficiaries = safeArr(record.client2Beneficiaries);
  } else {
    const allBeneficiaries = safeArr(record.client1Beneficiaries);
    if (allBeneficiaries.length > 0) {
      primaryBeneficiary = allBeneficiaries[0];
      residuaryBeneficiaries = allBeneficiaries.slice(1);
    }
  }

  // ── Specific gifts ────────────────────────────────────────────────────────
  const specificGifts: GiftEntry[] = isClient2
    ? safeGiftArr(record.client2SpecificGifts)
    : safeGiftArr(record.client1SpecificGifts);

  // ── Funeral wishes ────────────────────────────────────────────────────────
  const funeralWishes = isClient2
    ? safe(record.client2FuneralWishes) || safe(record.funeralWishes)
    : safe(record.client1FuneralWishes) || safe(record.funeralWishes);
  const organDonation = isClient2
    ? safe(record.client2OrganDonation).toLowerCase() === "yes"
    : safe(record.client1OrganDonation).toLowerCase() === "yes" || safe(record.organDonation).toLowerCase() === "yes";

  // ── Vulnerable beneficiary ────────────────────────────────────────────────
  const vulnerableBeneficiaryDetails = isClient2
    ? safe(record.client2VulnerableBeneficiaryDetails) || safe(record.vulnerableBeneficiaryDetails)
    : safe(record.client1VulnerableBeneficiaryDetails) || safe(record.vulnerableBeneficiaryDetails);

  // ── Partner name (for mirror Will clauses) ────────────────────────────────
  const partnerName = opts.willType === "mirror_client1"
    ? [safe(record.client2Prefix), safe(record.client2FirstName), safe(record.client2LastName)].filter(Boolean).join(" ")
    : [safe(record.client1Prefix), safe(record.client1FirstName), safe(record.client1LastName)].filter(Boolean).join(" ");

  // ─────────────────────────────────────────────────────────────────────────
  // Build document paragraphs
  // ─────────────────────────────────────────────────────────────────────────

  const paras: Paragraph[] = [];

  // ── Cover / Title ─────────────────────────────────────────────────────────
  // Logo (centred, 200pt wide × 77pt tall — preserves 419×162 aspect ratio)
  if (logoBuffer) {
    paras.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 200, height: 77 },
            type: "png",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160 },
      })
    );
  }

  paras.push(
    new Paragraph({
      children: [new TextRun({ text: "LAST WILL AND TESTAMENT", bold: true, size: 40 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "of", size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: testatorName.toUpperCase(), bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 320 },
    })
  );

  // ── 1. Revocation ─────────────────────────────────────────────────────────
  let clauseNum = 1;
  paras.push(clauseHeading(clauseNum++, "Revocation"));
  paras.push(body(
    `I ${testatorName}${dob ? ` date of birth ${dob}` : ""}${fullAddress ? ` of ${fullAddress}` : ""} do hereby revoke all former Wills and testamentary dispositions so far as they relate to my property of every kind wherever situate and declare that the law of England & Wales shall apply to this my Will in relation to my property of every kind wherever situate.`
  ));

  // ── 2. Appointment of Executors ───────────────────────────────────────────
  paras.push(clauseHeading(clauseNum++, "Appointment of Executors"));
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
      execText += substitutes.map(s => {
        let t = personFullName(s);
        if (s.address) t += ` of ${s.address}`;
        return t;
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

  // ── 3. Guardians (only if present) ───────────────────────────────────────
  if (guardians.length > 0) {
    paras.push(clauseHeading(clauseNum++, "Appointment of Guardians"));
    paras.push(body(
      "In the event that my spouse/civil partner shall predecease me or die within 30 days of my death, I appoint the following as Guardian(s) of any of my children who are under the age of 18 years at the date of my death:"
    ));
    guardians.forEach(g => {
      const name = personFullName(g) || "[Guardian]";
      const rel  = g.relationship ? ` (${g.relationship})` : "";
      const addr = g.address ? ` of ${g.address}` : "";
      paras.push(body(`${name}${rel}${addr}`));
    });
  }

  // ── Definition / Administration ───────────────────────────────────────────
  paras.push(clauseHeading(clauseNum++, "Definition and Administration of my Estate"));
  paras.push(subItem("a)", "In this my Will where the context so admits my Estate shall mean:"));
  paras.push(subItem("i)", "all my real and personal property of every kind wherever situate including that over which I have a general power of appointment and", 40));
  paras.push(subItem("ii)", "the money investments and property from time to time representing all such property", 40));
  paras.push(subItem("b)", "My Executors shall hold my Estate upon trust"));
  paras.push(subItem("i)", "to pay and discharge all my debts funeral testamentary and administration expenses and", 40));
  paras.push(subItem("ii)", "to give effect to all legacies", 40));

  // ── Distribution of the Residue ───────────────────────────────────────────
  paras.push(clauseHeading(clauseNum++, "Distribution of the Residue"));
  paras.push(body("SUBJECT to the trusts DECLARED above my Executors SHALL HOLD my Estate as follows:"));

  if (primaryBeneficiary && personFullName(primaryBeneficiary)) {
    paras.push(subItem(
      "a)",
      `Upon trust absolutely for my ${personRel(primaryBeneficiary)} ${personFullName(primaryBeneficiary)} if they shall survive me for the period of twenty eight days but if my said ${personRel(primaryBeneficiary)} shall die in my lifetime or shall not survive me for the period aforesaid or if this gift fails or lapses for any other reason and subject thereto`
    ));
  } else {
    paras.push(subItem("a)", "Upon trust absolutely for [Primary Beneficiary] if they shall survive me for the period of twenty eight days but if my said beneficiary shall die in my lifetime or shall not survive me for the period aforesaid or if this gift fails or lapses for any other reason and subject thereto"));
  }

  if (residuaryBeneficiaries.length > 0) {
    paras.push(subItem("b)", "Upon trust in the following shares:"));
    const romanLabels = ["i)", "ii)", "iii)", "iv)", "v)", "vi)", "vii)", "viii)", "ix)", "x)"];
    const equalShare = Math.floor(100 / residuaryBeneficiaries.length);
    residuaryBeneficiaries.forEach((b, i) => {
      const name  = personFullName(b) || "[Beneficiary]";
      const share = b.share || `${equalShare}%`;
      const label = romanLabels[i] || `${i + 1})`;
      paras.push(subItem(
        label,
        `${share} to ${name} Provided that if my said ${name} shall die without having attained a vested interest leaving issue who survive me then such issue shall take by substitution such failed share and if there shall be more than one of such issue they shall take in equal shares per stirpes but so that no issue shall take whose parent is alive and so capable of taking`,
        40
      ));
    });
    paras.push(body(
      "If any of the share or shares under this sub clause b) shall fail in their entirety that share or those shares shall be added proportionally to the other shares that have not failed."
    ));
  }

  // Specific gifts
  if (specificGifts.length > 0) {
    specificGifts.forEach(g => {
      if (g.description || g.recipient) {
        paras.push(body(
          `I give ${safe(g.description) || "[item]"} to ${safe(g.recipient) || "[recipient]"}${g.value ? ` (estimated value: ${g.value})` : ""}.`
        ));
      }
    });
  }

  // ── Age Condition ─────────────────────────────────────────────────────────
  paras.push(clauseHeading(clauseNum++, "Conditional Gift at Specified Age of 18 Years"));
  paras.push(body(
    "Any interest left in this my Will to a beneficiary shall be conditional on them attaining the age of 18 years and shall carry the intermediate interest until that age I give the power to my Executors in their absolute discretion to advance part or all of such entitlement which my Executors deem to be appropriate."
  ));

  // ── Executor / Trustee Powers ─────────────────────────────────────────────
  paras.push(clauseHeading(clauseNum++, "Executor and Trustee Powers"));
  paras.push(body(
    "My Executors and trustees shall in addition to and without prejudice to all statutory powers have the powers and immunities set out in The STEP Powers provided they shall not exercise any of their powers so as to conflict with the beneficial provisions of this my Will."
  ));

  // ── Survivorship ──────────────────────────────────────────────────────────
  paras.push(clauseHeading(clauseNum++, "Survivorship"));
  paras.push(body(
    "Any Person who does not survive me by twenty eight days who would otherwise be a beneficiary under this my Will shall be treated for the purposes of my Will as having died in my lifetime."
  ));

  // ── PPT clause ────────────────────────────────────────────────────────────
  // ── Rich multi-instance optional clauses ─────────────────────────────────────────────────────────────────────────────

  function docxTrusteeNames(trustees: PersonEntry[] | undefined, fallback = "my Executors"): string {
    const names = (trustees ?? []).map(p => [p.prefix, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")).filter(Boolean);
    if (names.length === 0) return fallback;
    if (names.length === 1) return names[0];
    return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  }

  function docxBenNames(people: PersonEntry[] | undefined, fallback = "my children and remoter issue in equal shares absolutely"): string {
    const parts = (people ?? []).map(p => {
      const n = [p.prefix, p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");
      return n && p.share ? `${n} as to ${p.share}` : n;
    }).filter(Boolean);
    if (parts.length === 0) return fallback;
    if (parts.length === 1) return parts[0] + " absolutely";
    return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] + " in the shares specified";
  }

  function safeCA<T>(v: unknown): T[] {
    if (!v) return [];
    if (typeof v === "string") { try { return JSON.parse(v) as T[]; } catch { return []; } }
    if (Array.isArray(v)) return v as T[];
    return [];
  }

  // Protective Property Trusts
  for (const ppt of safeCA<Record<string, unknown>>(record.protectivePropertyTrusts)) {
    const property = (ppt.propertyAddress as string) || "my principal residence";
    const lifeTenants = ppt.lifeTenants as PersonEntry[] | undefined;
    const ltNames = (lifeTenants ?? []).map(p => [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ")).filter(Boolean);
    const ltStr = ltNames.length > 0 ? ltNames.join(" and ") : "my surviving spouse or civil partner";
    const trNames = docxTrusteeNames(ppt.trustees as PersonEntry[] | undefined);
    const ultBens = docxBenNames(ppt.ultimateBeneficiaries as PersonEntry[] | undefined);
    const triggers = (ppt.terminationTriggers ?? {}) as Record<string, boolean>;
    const terminationEvents: string[] = [];
    if (triggers.onDeath !== false) terminationEvents.push("the death of the Life Tenant");
    if (triggers.onRemarriageOrCohabitation) terminationEvents.push("the Life Tenant remarrying, entering into a civil partnership, or beginning to cohabit with another person");
    if (triggers.onCeasingToReside) terminationEvents.push("the Life Tenant ceasing to permanently reside in the Property");
    if (triggers.onBreachOfConditions) terminationEvents.push("the Life Tenant failing to comply with the conditions of this trust");
    const triggerStr = terminationEvents.length > 0
      ? `The Trust Period shall terminate upon the first to occur of the following events: ${terminationEvents.map((e, i) => `(${String.fromCharCode(105 + i)}) ${e}`).join("; or ")}.`
      : "The Trust Period shall terminate upon the death of the Life Tenant.";

    paras.push(clauseHeading(clauseNum++, "Protective Property Trust (Lifetime Interest Trust)"));
    paras.push(body(`I DECLARE that my share of the property known as ${property} (hereinafter referred to as "the Property") shall not pass under the general gift of my Residuary Estate but shall instead be held upon the following trusts:`));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) The Trustees shall hold my share of the Property upon trust to permit ${ltStr} (hereinafter referred to as "the Life Tenant") to have the right to reside in the Property during the Trust Period.`));
    paras.push(body(`(c) ${triggerStr}`));
    paras.push(body(`(d) Upon the termination of the Trust Period the Trustees shall hold the Property (or the net proceeds of sale thereof) upon trust for ${ultBens}.`));
    paras.push(body("(e) The Life Tenant shall be responsible for the payment of all outgoings in respect of the Property including rates, taxes, insurance, and the cost of all repairs and maintenance."));
    paras.push(body("(f) The Trustees shall have power to sell the Property and to apply the proceeds of sale in the purchase of another property to be held upon the same trusts or to invest the same as if they were absolute beneficial owners thereof."));
    if (ppt.notes) paras.push(body(ppt.notes as string));
  }

  // Legacy PPT fallback
  if (opts.ppt && safeCA(record.protectivePropertyTrusts).length === 0) {
    paras.push(clauseHeading(clauseNum++, "Protective Property Trust (Lifetime Trust)"));
    paras.push(body(`Notwithstanding the foregoing, my Trustees shall hold my share of the matrimonial home upon trust to permit my ${isMirror && partnerName ? partnerName : "spouse/civil partner"} to reside therein during their lifetime or until they remarry or enter into a new civil partnership. Upon the termination of such life interest, my Trustees shall hold the property (or the net proceeds of sale thereof) for the residuary beneficiaries named above in equal shares absolutely.`));
    paras.push(body("My Trustees shall have power to sell the property and apply the proceeds to purchase alternative accommodation for my said beneficiary on the same trusts."));
  }

  // Discretionary Trusts
  for (const dt of safeCA<Record<string, unknown>>(record.discretionaryTrusts)) {
    const trNames = docxTrusteeNames(dt.trustees as PersonEntry[] | undefined);
    const benefClass = (dt.beneficiaryClass as string) || "my children and remoter issue and such other persons as my Trustees shall in their absolute discretion determine";
    const addBens = (dt.additionalBeneficiaries as PersonEntry[] | undefined ?? []).map(p => [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ")).filter(Boolean);
    const fullBenClass = addBens.length > 0 ? `${benefClass}, together with ${addBens.join(", ")}` : benefClass;
    paras.push(clauseHeading(clauseNum++, "Discretionary Trust"));
    paras.push(body(`(a) The Trustees of this Discretionary Trust shall be ${trNames} or such other persons as shall be appointed as trustees hereof from time to time.`));
    paras.push(body(`(b) The Beneficiaries of this Discretionary Trust shall be ${fullBenClass}.`));
    paras.push(body("(c) My Trustees shall hold the trust fund upon trust to pay or apply the income and/or capital thereof to or for the benefit of all or any one or more of the Beneficiaries in such shares and proportions and in such manner as my Trustees shall in their absolute discretion think fit."));
    paras.push(body("(d) My Trustees shall have the widest possible powers of investment as if they were absolute beneficial owners of the trust fund and shall not be restricted to investments authorised by law for trustees."));
    paras.push(body("(e) This Discretionary Trust shall terminate on the expiry of the period of 125 years from the date of my death (which period shall be the perpetuity period applicable to this trust) and upon such termination the trust fund shall be held for such of the Beneficiaries as are then living in equal shares absolutely."));
    if (dt.notes) paras.push(body(dt.notes as string));
  }

  // Legacy Discretionary Trust fallback
  if (opts.discretionary && safeCA(record.discretionaryTrusts).length === 0) {
    paras.push(clauseHeading(clauseNum++, "Discretionary Trust"));
    paras.push(body("My Trustees shall hold the Trust Fund upon discretionary trusts for the benefit of such one or more of the Discretionary Beneficiaries as my Trustees shall in their absolute discretion determine, and in such shares and upon such terms and conditions as my Trustees shall think fit."));
    paras.push(body("The 'Discretionary Beneficiaries' means my spouse/civil partner, my children and remoter issue, and any other person or class of persons added by my Trustees by deed during the Trust Period."));
    paras.push(body("The 'Trust Period' means the period of 125 years from the date of my death (which shall be the perpetuity period applicable to this trust)."));
  }

  // Vulnerable Person's Trusts
  for (const vt of safeCA<Record<string, unknown>>(record.vulnerablePersonTrusts)) {
    const vb = vt.vulnerableBeneficiary as PersonEntry | undefined;
    const vbName = vb ? [vb.prefix, vb.firstName, vb.lastName].filter(Boolean).join(" ") || "[Vulnerable Beneficiary Name]" : "[Vulnerable Beneficiary Name]";
    const trNames = docxTrusteeNames(vt.trustees as PersonEntry[] | undefined);
    const ultBens = docxBenNames(vt.ultimateBeneficiaries as PersonEntry[] | undefined, "my children and remoter issue as shall then be living in equal shares absolutely or if none for my estate");
    paras.push(clauseHeading(clauseNum++, "Vulnerable Person's Trust"));
    paras.push(body(`I DECLARE that the following provisions shall apply to the Vulnerable Person's Trust created by this my Will for the benefit of ${vbName} (hereinafter referred to as "the Vulnerable Beneficiary"):`));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body("(b) This trust is intended to qualify as a Vulnerable Beneficiary Trust within the meaning of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to qualify as such."));
    paras.push(body("(c) My Trustees shall hold the trust fund upon trust to apply the income and capital thereof for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees in their absolute discretion think fit having regard to the needs and welfare of the Vulnerable Beneficiary."));
    paras.push(body(`(d) Subject to the life interest of the Vulnerable Beneficiary the trust fund shall on the death of the Vulnerable Beneficiary be held for ${ultBens}.`));
    paras.push(body("(e) My Trustees shall have power to apply capital for the benefit of the Vulnerable Beneficiary at any time and from time to time as they in their absolute discretion think fit."));
    if (vt.notes) paras.push(body(vt.notes as string));
  }

  // Legacy Vulnerable Trust fallback
  if (opts.vulnerable && safeCA(record.vulnerablePersonTrusts).length === 0) {
    paras.push(clauseHeading(clauseNum++, "Vulnerable Person's Trust"));
    const vulnName = vulnerableBeneficiaryDetails || "[VULNERABLE BENEFICIARY NAME]";
    paras.push(body(`My Trustees shall hold the share of my Estate which would otherwise pass to ${vulnName} ('the Vulnerable Beneficiary') upon the trusts set out in this clause.`));
    paras.push(body("This trust is intended to qualify as a 'vulnerable person's trust' within the meaning of section 30 of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to so qualify throughout the Trust Period."));
    paras.push(body("My Trustees shall apply the income and capital of the trust fund for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees think fit, having regard to the needs, disability, and best interests of the Vulnerable Beneficiary."));
  }

  // Nil-Rate Band Trusts
  for (const nrb of safeCA<Record<string, unknown>>(record.nilRateBandTrusts)) {
    const trNames = docxTrusteeNames(nrb.trustees as PersonEntry[] | undefined);
    const bens = docxBenNames(nrb.beneficiaries as PersonEntry[] | undefined);
    paras.push(clauseHeading(clauseNum++, "Nil-Rate Band Discretionary Trust"));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) I GIVE to my Trustees such sum as equals my available nil-rate band for inheritance tax purposes at the date of my death (the "NRB Sum") to hold upon the trusts hereinafter declared.`));
    paras.push(body(`(c) My Trustees shall hold the NRB Sum upon trust for ${bens}.`));
    paras.push(body("(d) My Trustees shall have the widest possible powers of investment and management as if they were absolute beneficial owners of the trust fund."));
    paras.push(body("(e) This trust shall terminate on the expiry of 125 years from the date of my death and upon such termination the trust fund shall be distributed to such of the Beneficiaries as are then living in equal shares absolutely."));
    if (nrb.notes) paras.push(body(nrb.notes as string));
  }

  // Bereaved Minor Trusts
  for (const bm of safeCA<Record<string, unknown>>(record.bereavedMinorTrusts)) {
    const ben = bm.beneficiary as PersonEntry | undefined;
    const bName = ben ? [ben.prefix, ben.firstName, ben.lastName].filter(Boolean).join(" ") || "[Beneficiary Name]" : "[Beneficiary Name]";
    const trNames = docxTrusteeNames(bm.trustees as PersonEntry[] | undefined);
    const age = (bm.ageOfAbsoluteEntitlement as string) || "18";
    paras.push(clauseHeading(clauseNum++, "Bereaved Minor's Trust (s.71A IHTA 1984)"));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) This trust is intended to qualify as a Bereaved Minor's Trust within the meaning of section 71A of the Inheritance Tax Act 1984.`));
    paras.push(body(`(c) My Trustees shall hold the trust fund upon trust to accumulate the income thereof until ${bName} ("the Beneficiary") attains the age of ${age} years and thereafter to pay the income to the Beneficiary.`));
    paras.push(body(`(d) Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.`));
    paras.push(body(`(e) If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.`));
    if (bm.notes) paras.push(body(bm.notes as string));
  }

  // 18-to-25 Trusts
  for (const a25 of safeCA<Record<string, unknown>>(record.age18To25Trusts)) {
    const ben = a25.beneficiary as PersonEntry | undefined;
    const bName = ben ? [ben.prefix, ben.firstName, ben.lastName].filter(Boolean).join(" ") || "[Beneficiary Name]" : "[Beneficiary Name]";
    const trNames = docxTrusteeNames(a25.trustees as PersonEntry[] | undefined);
    const age = (a25.ageOfAbsoluteEntitlement as string) || "25";
    paras.push(clauseHeading(clauseNum++, `18-to-25 Trust (s.71D IHTA 1984)`));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) This trust is intended to qualify as an 18-to-25 trust within the meaning of section 71D of the Inheritance Tax Act 1984.`));
    paras.push(body(`(c) My Trustees shall hold the trust fund upon trust to accumulate the income thereof until ${bName} ("the Beneficiary") attains the age of 18 years and thereafter to pay the income to the Beneficiary until the Beneficiary attains the age of ${age} years.`));
    paras.push(body(`(d) Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.`));
    paras.push(body(`(e) If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.`));
    if (a25.notes) paras.push(body(a25.notes as string));
  }

  // Business Property Relief Trusts
  for (const bpr of safeCA<Record<string, unknown>>(record.businessPropertyReliefs)) {
    const bizName = (bpr.businessName as string) || "my business interests";
    const trNames = docxTrusteeNames(bpr.trustees as PersonEntry[] | undefined);
    const bens = docxBenNames(bpr.beneficiaries as PersonEntry[] | undefined);
    paras.push(clauseHeading(clauseNum++, "Business Property Relief Trust"));
    paras.push(body(`(a) The Trustees of this trust shall be ${trNames}.`));
    paras.push(body(`(b) I GIVE my business interests known as ${bizName} to my Trustees to hold upon the trusts hereinafter declared, it being my intention that the Business Assets shall qualify for Business Property Relief pursuant to Chapter I of Part V of the Inheritance Tax Act 1984.`));
    paras.push(body(`(c) My Trustees shall hold the Business Assets upon trust for ${bens}.`));
    paras.push(body("(d) My Trustees shall have the widest possible powers to manage, invest, realise, and deal with the Business Assets as if they were absolute beneficial owners thereof."));
    paras.push(body("(e) My Trustees shall use their best endeavours to ensure that the Business Assets continue to qualify for Business Property Relief and shall not take any action that would jeopardise such qualification without first obtaining appropriate professional advice."));
    if (bpr.notes) paras.push(body(bpr.notes as string));
  }

  // ── Organ Donation ────────────────────────────────────────────────────────
  if (organDonation) {
    paras.push(clauseHeading(clauseNum++, "Organ Donation"));
    paras.push(body(
      "I declare that it is my desire that after my death any of my organs can be used for therapeutic purposes."
    ));
  }

  // ── Funeral Wishes ────────────────────────────────────────────────────────
  paras.push(clauseHeading(clauseNum++, "Funeral Wishes"));
  if (funeralWishes) {
    paras.push(body(funeralWishes));
  } else {
    paras.push(body(
      "I desire that my body be [cremated/buried] and my ashes disposed of by my trustees and the expense thereof shall be a first charge on my Estate."
    ));
  }

  // ── STEP Powers ───────────────────────────────────────────────────────────
  paras.push(clauseHeading(clauseNum++, "STEP Powers"));
  paras.push(body(
    "In this my Will where the context so admits any reference to the STEP Powers shall mean the Standard Provisions and all of the Special Provisions (with the exception of 18.2) of the Society of Trust and Estate Practitioners (3rd edition) shall apply."
  ));

  // ── Testimonium ───────────────────────────────────────────────────────────
  paras.push(
    new Paragraph({ spacing: { before: 240, after: 0 } }),
    body(
      `IN WITNESS whereof I, ${testatorName}, have hereunto set my hand to this my Last Will and Testament this _______ day of _____________ 20____.`
    )
  );

  // ── Attestation / Execution page ──────────────────────────────────────────
  paras.push(pageBreak());
  paras.push(
    new Paragraph({
      children: [new TextRun({ text: "EXECUTION PAGE", bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
    body(
      "SIGNED as a Will by the above-named TESTATOR in our presence and then by us in the presence of the Testator and of each other:"
    )
  );

  // Testator
  paras.push(...sigBlock("TESTATOR"));

  // Witnesses
  paras.push(...witnessSigBlock(1));
  paras.push(...witnessSigBlock(2));

  // ─────────────────────────────────────────────────────────────────────────
  // Assemble document
  // ─────────────────────────────────────────────────────────────────────────

  const doc = new Document({
    creator: "Genesis Wills and Estate Planning",
    title: `Last Will and Testament of ${testatorName}`,
    description: "Generated by Genesis Wills and Estate Planning",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: paras,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24 },
        },
        heading1: {
          run: { bold: true, size: 28, color: "1a3a2a" },
        },
      },
    },
  });

  return await Packer.toBuffer(doc);
}
