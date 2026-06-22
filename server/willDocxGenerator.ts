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

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from "docx";

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
  if (opts.ppt) {
    paras.push(clauseHeading(clauseNum++, "Protective Property Trust (Lifetime Trust)"));
    paras.push(body(
      `Notwithstanding the foregoing, my Trustees shall hold my share of the matrimonial home upon trust to permit my ${isMirror && partnerName ? partnerName : "spouse/civil partner"} to reside therein during their lifetime or until they remarry or enter into a new civil partnership. Upon the termination of such life interest, my Trustees shall hold the property (or the net proceeds of sale thereof) for the residuary beneficiaries named above in equal shares absolutely.`
    ));
    paras.push(body(
      "My Trustees shall have power to sell the property and apply the proceeds to purchase alternative accommodation for my said beneficiary on the same trusts."
    ));
  }

  // ── Discretionary Trust ───────────────────────────────────────────────────
  if (opts.discretionary) {
    paras.push(clauseHeading(clauseNum++, "Discretionary Trust"));
    paras.push(body(
      "My Trustees shall hold the Trust Fund upon discretionary trusts for the benefit of such one or more of the Discretionary Beneficiaries as my Trustees shall in their absolute discretion determine, and in such shares and upon such terms and conditions as my Trustees shall think fit."
    ));
    paras.push(body(
      "The 'Discretionary Beneficiaries' means my spouse/civil partner, my children and remoter issue, and any other person or class of persons added by my Trustees by deed during the Trust Period."
    ));
    paras.push(body(
      "The 'Trust Period' means the period of 125 years from the date of my death (which shall be the perpetuity period applicable to this trust)."
    ));
  }

  // ── Vulnerable Person's Trust ─────────────────────────────────────────────
  if (opts.vulnerable) {
    paras.push(clauseHeading(clauseNum++, "Vulnerable Person's Trust"));
    const vulnName = vulnerableBeneficiaryDetails || "[VULNERABLE BENEFICIARY NAME]";
    paras.push(body(
      `My Trustees shall hold the share of my Estate which would otherwise pass to ${vulnName} ('the Vulnerable Beneficiary') upon the trusts set out in this clause.`
    ));
    paras.push(body(
      "This trust is intended to qualify as a 'vulnerable person's trust' within the meaning of section 30 of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to so qualify throughout the Trust Period."
    ));
    paras.push(body(
      "My Trustees shall apply the income and capital of the trust fund for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees think fit, having regard to the needs, disability, and best interests of the Vulnerable Beneficiary."
    ));
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
