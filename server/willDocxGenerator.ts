/**
 * willDocxGenerator.ts
 *
 * Generates a Word (.docx) document from a Will Instruction record using the
 * `docx` library (no legacy JS syntax, fully compatible with Vite/Rollup build).
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  PageBreak,
  ShadingType,
} from "docx";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WillOptions {
  willType: "single" | "mirror_client1" | "mirror_client2";
  ppt: boolean;
  discretionary: boolean;
  vulnerable: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function heading1(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
  });
}

function heading2(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
  });
}

function clauseTitle(num: string, title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}. ${title.toUpperCase()}`, bold: true }),
    ],
    spacing: { before: 200, after: 60 },
  });
}

function body(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 24 })],
    spacing: { before: 60, after: 60 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text })],
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
  });
}

function sigLine(label: string): Paragraph[] {
  return [
    new Paragraph({
      children: [new TextRun({ text: label, bold: true })],
      spacing: { before: 120, after: 20 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "_".repeat(60) })],
      spacing: { before: 0, after: 60 },
    }),
  ];
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

// ─── Main generator ──────────────────────────────────────────────────────────

export async function generateWillDocx(
  record: Record<string, unknown>,
  opts: WillOptions
): Promise<Buffer> {
  const isMirror = opts.willType !== "single";
  const isClient2 = opts.willType === "mirror_client2";

  // ── Select testator fields ──────────────────────────────────────────────
  const firstName = isClient2
    ? (record.client2FirstName as string) || ""
    : (record.client1FirstName as string) || "";
  const lastName = isClient2
    ? (record.client2LastName as string) || ""
    : (record.client1LastName as string) || "";
  const address = isClient2
    ? (record.client2Address as string) || ""
    : (record.client1Address as string) || "";
  const dob = isClient2
    ? (record.client2Dob as string) || ""
    : (record.client1Dob as string) || "";

  const fullName = `${firstName} ${lastName}`.trim() || "TESTATOR";

  // ── Executors ───────────────────────────────────────────────────────────
  type Person = { firstName?: string; lastName?: string; relationship?: string; address?: string };
  const rawExecutors = isClient2
    ? (record.client2Executors as Person[]) || []
    : (record.client1Executors as Person[]) || [];
  const executors: Person[] = Array.isArray(rawExecutors) ? rawExecutors : [];

  // ── Guardians ───────────────────────────────────────────────────────────
  const rawGuardians = (record.guardians as Person[]) || [];
  const guardians: Person[] = Array.isArray(rawGuardians) ? rawGuardians : [];

  // ── Beneficiaries ───────────────────────────────────────────────────────
  type Beneficiary = { firstName?: string; lastName?: string; relationship?: string; share?: string };
  const rawBeneficiaries = isClient2
    ? (record.client2Beneficiaries as Beneficiary[]) || []
    : (record.client1Beneficiaries as Beneficiary[]) || [];
  const beneficiaries: Beneficiary[] = Array.isArray(rawBeneficiaries) ? rawBeneficiaries : [];

  // ── Specific gifts ──────────────────────────────────────────────────────
  type Gift = { description?: string; recipient?: string };
  const rawGifts = isClient2
    ? (record.client2SpecificGifts as Gift[]) || []
    : (record.client1SpecificGifts as Gift[]) || [];
  const gifts: Gift[] = Array.isArray(rawGifts) ? rawGifts : [];

  // ── Funeral wishes ──────────────────────────────────────────────────────
  const funeralType = (record.funeralType as string) || "";
  const funeralNotes = (record.funeralWishesNotes as string) || "";
  const organDonation = record.organDonation as boolean | null;

  // ── Partner (for mirror Wills) ──────────────────────────────────────────
  const partnerFirst = isClient2
    ? (record.client1FirstName as string) || ""
    : (record.client2FirstName as string) || "";
  const partnerLast = isClient2
    ? (record.client1LastName as string) || ""
    : (record.client2LastName as string) || "";
  const partnerName = `${partnerFirst} ${partnerLast}`.trim();

  // ─────────────────────────────────────────────────────────────────────────
  // Build document sections
  // ─────────────────────────────────────────────────────────────────────────

  const children: Paragraph[] = [];

  // ── Title ────────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "LAST WILL AND TESTAMENT", bold: true, size: 36 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `of`, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: fullName.toUpperCase(), bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    })
  );

  // ── Preamble ─────────────────────────────────────────────────────────────
  children.push(
    clauseTitle("1", "Revocation"),
    body(
      `I, ${fullName}${address ? ` of ${address}` : ""}${dob ? `, born ${dob}` : ""}, ` +
        `hereby revoke all former Wills and testamentary dispositions previously made by me and declare this to be my Last Will and Testament.`
    )
  );

  // ── Executors ────────────────────────────────────────────────────────────
  children.push(clauseTitle("2", "Appointment of Executors"));
  if (executors.length > 0) {
    if (isMirror && partnerName) {
      children.push(
        body(
          `I appoint my ${isClient2 ? "husband/wife/civil partner" : "husband/wife/civil partner"}, ` +
            `${partnerName}, as my First Executor.`
        )
      );
    }
    const others = executors.filter(
      (e) => `${e.firstName} ${e.lastName}`.trim() !== partnerName
    );
    if (others.length > 0) {
      children.push(
        body(
          `I also appoint the following as Executor${others.length > 1 ? "s" : ""} (and Trustee${others.length > 1 ? "s" : ""}) of this my Will:`
        )
      );
      others.forEach((e) => {
        const name = `${e.firstName || ""} ${e.lastName || ""}`.trim();
        const rel = e.relationship ? ` (${e.relationship})` : "";
        const addr = e.address ? ` of ${e.address}` : "";
        children.push(bullet(`${name}${rel}${addr}`));
      });
    }
  } else {
    children.push(body("I appoint [EXECUTOR NAME] of [ADDRESS] as Executor of this my Will."));
  }

  // ── Guardians ────────────────────────────────────────────────────────────
  if (guardians.length > 0) {
    children.push(clauseTitle("3", "Appointment of Guardians"));
    children.push(
      body(
        "In the event that my spouse/civil partner shall predecease me or die within 30 days of my death, I appoint the following as Guardian(s) of any of my children who are under the age of 18 years at the date of my death:"
      )
    );
    guardians.forEach((g) => {
      const name = `${g.firstName || ""} ${g.lastName || ""}`.trim();
      const rel = g.relationship ? ` (${g.relationship})` : "";
      children.push(bullet(`${name}${rel}`));
    });
  }

  // ── Specific gifts ───────────────────────────────────────────────────────
  if (gifts.length > 0) {
    children.push(clauseTitle("4", "Specific Gifts"));
    children.push(body("I give the following specific gifts free of inheritance tax:"));
    gifts.forEach((g) => {
      children.push(bullet(`${g.description || "[Item]"} to ${g.recipient || "[Recipient]"}`));
    });
  }

  // ── Residuary estate ─────────────────────────────────────────────────────
  children.push(clauseTitle("5", "Residuary Estate"));
  if (isMirror && partnerName) {
    children.push(
      body(
        `I give all my property and assets (my "Estate") to my ${isClient2 ? "husband/wife/civil partner" : "husband/wife/civil partner"}, ` +
          `${partnerName}, if they survive me by 30 days.`
      ),
      body(
        "If my said spouse/civil partner shall predecease me or fail to survive me by 30 days, I give my Estate to the following beneficiaries in equal shares (or as specified):"
      )
    );
  } else {
    children.push(body("I give all my property and assets (my Estate) to the following beneficiaries:"));
  }

  if (beneficiaries.length > 0) {
    beneficiaries.forEach((b) => {
      const name = `${b.firstName || ""} ${b.lastName || ""}`.trim();
      const rel = b.relationship ? ` (${b.relationship})` : "";
      const share = b.share ? ` -- ${b.share}` : "";
      children.push(bullet(`${name}${rel}${share}`));
    });
  } else {
    children.push(bullet("[Beneficiary Name] ([Relationship]) -- [Share]"));
  }

  // ── PPT clause ───────────────────────────────────────────────────────────
  if (opts.ppt) {
    children.push(
      clauseTitle("6", "Protective Property Trust (Lifetime Trust)"),
      body(
        "Notwithstanding the foregoing, my Trustees shall hold my share of the matrimonial home (the 'Property') upon trust to permit my spouse/civil partner to reside in the Property during their lifetime or until they remarry or enter into a new civil partnership. Upon the termination of such life interest, my Trustees shall hold the Property (or the net proceeds of sale thereof) for the residuary beneficiaries named above in equal shares absolutely."
      ),
      body(
        "My Trustees shall have power to sell the Property and apply the proceeds to purchase alternative accommodation for my spouse/civil partner on the same trusts."
      )
    );
  }

  // ── Discretionary Trust ──────────────────────────────────────────────────
  if (opts.discretionary) {
    children.push(
      clauseTitle(opts.ppt ? "7" : "6", "Discretionary Trust"),
      body(
        "My Trustees shall hold the Trust Fund upon discretionary trusts for the benefit of such one or more of the Discretionary Beneficiaries as my Trustees shall in their absolute discretion determine, and in such shares and upon such terms and conditions as my Trustees shall think fit."
      ),
      body(
        "The 'Discretionary Beneficiaries' means my spouse/civil partner, my children and remoter issue, and any other person or class of persons added by my Trustees by deed during the Trust Period."
      ),
      body(
        "The 'Trust Period' means the period of 125 years from the date of my death (which shall be the perpetuity period applicable to this trust)."
      )
    );
  }

  // ── Vulnerable Person's Trust ────────────────────────────────────────────
  if (opts.vulnerable) {
    children.push(
      clauseTitle(opts.ppt && opts.discretionary ? "8" : opts.ppt || opts.discretionary ? "7" : "6", "Vulnerable Person's Trust"),
      body(
        "My Trustees shall hold the share of my Estate which would otherwise pass to [VULNERABLE BENEFICIARY NAME] ('the Vulnerable Beneficiary') upon the trusts set out in this clause."
      ),
      body(
        "This trust is intended to qualify as a 'vulnerable person's trust' within the meaning of section 30 of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to so qualify throughout the Trust Period."
      ),
      body(
        "My Trustees shall apply the income and capital of the trust fund for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees think fit, having regard to the needs, disability, and best interests of the Vulnerable Beneficiary."
      )
    );
  }

  // ── Funeral wishes ───────────────────────────────────────────────────────
  if (funeralType || funeralNotes || organDonation !== null) {
    children.push(clauseTitle("FUNERAL WISHES", "Funeral Wishes (Non-Binding)"));
    if (funeralType) children.push(body(`Funeral type: ${funeralType}`));
    if (funeralNotes) children.push(body(funeralNotes));
    if (organDonation === true) children.push(body("I wish to donate my organs for medical purposes."));
    if (organDonation === false) children.push(body("I do not wish to donate my organs."));
  }

  // ── Testimonium ──────────────────────────────────────────────────────────
  children.push(
    clauseTitle("TESTIMONIUM", ""),
    body(
      `IN WITNESS whereof I, ${fullName}, have hereunto set my hand to this my Last Will and Testament this _______ day of _____________ 20____.`
    )
  );

  // ── Attestation / Execution page ─────────────────────────────────────────
  children.push(pageBreak());
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "EXECUTION PAGE", bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "SIGNED as a Will by the above-named TESTATOR in our presence and then by us in the presence of the Testator and of each other:",
        }),
      ],
      spacing: { before: 0, after: 240 },
    })
  );

  // Testator signature block
  children.push(
    new Paragraph({ children: [new TextRun({ text: "TESTATOR", bold: true })], spacing: { before: 120, after: 20 } }),
    ...sigLine("Signature:"),
    ...sigLine("Full Name:"),
    ...sigLine("Date:")
  );

  // Witness 1
  children.push(
    new Paragraph({ children: [new TextRun({ text: "WITNESS 1", bold: true })], spacing: { before: 200, after: 20 } }),
    ...sigLine("Signature:"),
    ...sigLine("Full Name:"),
    ...sigLine("Address:"),
    ...sigLine("Occupation:"),
    ...sigLine("Date:")
  );

  // Witness 2
  children.push(
    new Paragraph({ children: [new TextRun({ text: "WITNESS 2", bold: true })], spacing: { before: 200, after: 20 } }),
    ...sigLine("Signature:"),
    ...sigLine("Full Name:"),
    ...sigLine("Address:"),
    ...sigLine("Occupation:"),
    ...sigLine("Date:")
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Assemble document
  // ─────────────────────────────────────────────────────────────────────────

  const doc = new Document({
    creator: "Genesis Wills and Estate Planning",
    title: `Last Will and Testament of ${fullName}`,
    description: "Generated by Genesis Wills and Estate Planning",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,   // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: "Garamond", size: 24 },
        },
        heading1: {
          run: { bold: true, size: 32, color: "1a3a2a" },
        },
        heading2: {
          run: { bold: true, size: 26, color: "1a3a2a" },
        },
      },
    },
  });

  return await Packer.toBuffer(doc);
}
