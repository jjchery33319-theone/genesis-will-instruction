/**
 * welcomePackDocxGenerator.ts
 * Generates an editable Word (.docx) Welcome Pack using the `docx` library.
 * Mirrors the content of the HTML/PDF version but in a fully editable format.
 */
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageBreak, Header, Footer, NumberFormat,
  convertMillimetersToTwip,
} from "docx";

type WillRecord = Record<string, any>;

function fmt(v: any): string {
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}

function fmtDate(v: any): string {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch { return String(v); }
}

function fmtDateShort(v: any): string {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return String(v); }
}

function fullName(...parts: any[]): string {
  return parts.filter(Boolean).join(" ");
}

function personName(p: any): string {
  if (!p) return "";
  return [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ");
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function willTypeLabel(wt: string): string {
  const map: Record<string, string> = {
    "Single Will": "Single Will", "Mirror Will": "Mirror Wills",
    "Mirror Wills": "Mirror Wills", "Joint Will": "Joint Will",
    "single": "Single Will", "mirror": "Mirror Wills",
  };
  return map[wt] || wt || "Will";
}

// Colour constants
const GREEN = "1B4332";
const GOLD = "C9A84C";
const LIGHT_GREEN = "2D6A4F";
const LIGHT_BG = "F0F7F3";
const WHITE = "FFFFFF";

// Shared text run helpers
const goldRun = (text: string) => new TextRun({ text, color: GOLD, bold: true });
const greenRun = (text: string) => new TextRun({ text, color: GREEN, bold: true });
const boldRun = (text: string) => new TextRun({ text, bold: true });
const normalRun = (text: string) => new TextRun({ text });
const italicRun = (text: string) => new TextRun({ text, italics: true });

function heading1(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, color: GREEN, bold: true, size: 28, font: "Georgia" })],
    spacing: { before: 240, after: 120 },
    border: { bottom: { color: GOLD, size: 6, space: 4, style: BorderStyle.SINGLE } },
  });
}

function heading2(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, color: LIGHT_GREEN, bold: true, size: 22, font: "Georgia" })],
    spacing: { before: 200, after: 80 },
  });
}

function bodyPara(text: string, spacing = 120): Paragraph {
  return new Paragraph({
    children: [normalRun(text)],
    spacing: { after: spacing },
  });
}

function boldBodyPara(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [boldRun(label + ": "), normalRun(value)],
    spacing: { after: 60 },
  });
}

function dividerPara(): Paragraph {
  return new Paragraph({
    children: [],
    border: { bottom: { color: GOLD, size: 4, space: 2, style: BorderStyle.SINGLE } },
    spacing: { before: 160, after: 160 },
  });
}

function spacerPara(): Paragraph {
  return new Paragraph({ children: [], spacing: { after: 120 } });
}

function pageBreakPara(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `◆  ${text}`, color: GREEN, bold: true, size: 22, font: "Georgia" })],
    spacing: { before: 240, after: 100 },
    border: { bottom: { color: GOLD, size: 4, space: 3, style: BorderStyle.SINGLE } },
  });
}

function labelValuePara(label: string, value: string): Paragraph {
  if (!value) return new Paragraph({ children: [] });
  return new Paragraph({
    children: [
      new TextRun({ text: label + ": ", bold: true, color: "374151", size: 20 }),
      new TextRun({ text: value, size: 20 }),
    ],
    spacing: { after: 60 },
  });
}

function personPara(p: any): Paragraph[] {
  const name = personName(p);
  if (!name) return [];
  const dob = p.dob || p.dateOfBirth ? fmtDateShort(p.dob || p.dateOfBirth) : "";
  const addr = p.address || "";
  const paras: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: name, bold: true, color: GREEN, size: 21 })],
      spacing: { after: 40 },
    }),
  ];
  if (dob) paras.push(new Paragraph({ children: [new TextRun({ text: `Date of Birth: ${dob}`, size: 20, color: "4B5563" })], spacing: { after: 40 } }));
  if (addr) paras.push(new Paragraph({ children: [new TextRun({ text: `Address: ${addr}`, size: 20, color: "4B5563" })], spacing: { after: 40 } }));
  paras.push(spacerPara());
  return paras;
}

function supportTable(consultant: any, coordinator: any): Table {
  const headerCell = (text: string) => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: GOLD, size: 18 })] })],
    shading: { type: ShadingType.SOLID, color: GREEN },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
  });

  const dataCell = (text: string, bold = false) => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold, size: 19 })] })],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          headerCell("Role"),
          headerCell("Name"),
          headerCell("Contact Email"),
          headerCell("Contact Phone"),
        ],
        tableHeader: true,
      }),
      new TableRow({
        children: [
          dataCell("Your Consultant", true),
          dataCell(consultant.name),
          dataCell(consultant.email),
          dataCell(consultant.phone),
        ],
      }),
      new TableRow({
        children: [
          dataCell("Case Coordinator", true),
          dataCell(coordinator.name),
          dataCell(coordinator.email),
          dataCell(coordinator.phone),
        ],
      }),
    ],
  });
}

function clientTable(record: WillRecord, num: 1 | 2): (Paragraph | Table)[] {
  const p = num === 1 ? "client1" : "client2";
  const name = fullName(record[`${p}Prefix`], record[`${p}FirstName`], record[`${p}MiddleName`], record[`${p}LastName`]);
  if (!name) return [];
  const dob = fmtDate(record[`${p}Dob`]);
  const addr = [record[`${p}AddressLine1`], record[`${p}City`], record[`${p}Postcode`]].filter(Boolean).join(", ");
  const phone = fmt(record[`${p}Mobile`]) || fmt(record[`${p}DaytimePhone`]);
  const email = fmt(record[`${p}Email`]);
  const marital = capitalize(fmt(record[`${p}MaritalStatus`]));
  const job = fmt(record[`${p}JobTitle`]);
  const nationality = fmt(record[`${p}Nationality`]);

  const rows: [string, string][] = [
    ["Full Name", name],
    ["Date of Birth", dob],
    ["Marital Status", marital],
    ["Occupation", job],
    ["Nationality", nationality],
    ["Address", addr],
    ["Telephone", phone],
    ["Email", email],
  ].filter(([, v]) => v) as [string, string][];

  const tableRows = rows.map(([label, value]) => new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 19, color: "374151" })] })],
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: LIGHT_BG },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 19 })] })],
        width: { size: 70, type: WidthType.PERCENTAGE },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
      }),
    ],
  }));

  return [
    new Paragraph({
      children: [new TextRun({ text: `Client ${num}`, bold: true, color: WHITE, size: 20 })],
      shading: { type: ShadingType.SOLID, color: GREEN },
      spacing: { before: 160, after: 0 },
      indent: { left: 100 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }),
    spacerPara(),
  ];
}

function benListParas(bens: any[]): Paragraph[] {
  if (!bens.length) return [];
  return bens.map(b => {
    const name = personName(b);
    const share = b.share || b.shareFraction || b.sharePercentage || "";
    const rel = b.relationship || "";
    const parts = [name, rel ? `(${rel})` : "", share ? `— ${share}` : ""].filter(Boolean).join("  ");
    return new Paragraph({
      children: [new TextRun({ text: `•  ${parts}`, size: 20 })],
      spacing: { after: 60 },
      indent: { left: convertMillimetersToTwip(5) },
    });
  });
}

function giftParas(gifts: any[], label: string): Paragraph[] {
  if (!gifts.length) return [];
  const paras: Paragraph[] = [];
  if (label) paras.push(new Paragraph({ children: [new TextRun({ text: label, bold: true, color: LIGHT_GREEN, size: 20 })], spacing: { after: 60 } }));
  gifts.forEach(g => {
    const item = g.description || g.giftDescription || g.item || "";
    const recipient = g.recipient || g.recipientName || personName(g) || "";
    if (!item && !recipient) return;
    paras.push(new Paragraph({
      children: [boldRun(item), normalRun(recipient ? ` → ${recipient}` : "")],
      spacing: { after: 60 },
      indent: { left: convertMillimetersToTwip(5) },
    }));
  });
  paras.push(spacerPara());
  return paras;
}

export async function generateWelcomePackDocx(record: WillRecord): Promise<Buffer> {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isMirror = (record.willType || "").toLowerCase().includes("mirror");

  const c1Name = fullName(record.client1Prefix, record.client1FirstName, record.client1MiddleName, record.client1LastName);
  const c2Name = isMirror ? fullName(record.client2Prefix, record.client2FirstName, record.client2MiddleName, record.client2LastName) : "";
  const salutation = isMirror && c2Name
    ? `Dear ${record.client1FirstName || "Client"} & ${record.client2FirstName || "Client"},`
    : `Dear ${record.client1FirstName || "Client"},`;

  const addressLines = [
    c1Name,
    isMirror && c2Name ? c2Name : null,
    record.client1AddressLine1,
    record.client1City,
    record.client1Postcode,
  ].filter(Boolean) as string[];

  const consultantName = fmt(record.consultantName) || "Your Consultant";
  const consultantEmail = fmt(record.consultantEmail);
  const consultantPhone = fmt(record.consultantPhone);
  const coordinatorName = fmt(record.caseCoordinatorName) || "Case Coordinator";
  const coordinatorEmail = fmt(record.caseCoordinatorEmail);
  const coordinatorPhone = fmt(record.caseCoordinatorPhone);
  const refNum = fmt(record.referenceNumber);
  const estimatedDraft = fmtDate(record.estimatedDraftDate);

  const c1Execs: any[] = Array.isArray(record.client1Executors) ? record.client1Executors : (Array.isArray(record.executors) ? record.executors : []);
  const c1ResExecs: any[] = Array.isArray(record.client1ReservedExecutors) ? record.client1ReservedExecutors : (Array.isArray(record.reservedExecutors) ? record.reservedExecutors : []);
  const c2Execs: any[] = Array.isArray(record.client2Executors) ? record.client2Executors : [];
  const c2ResExecs: any[] = Array.isArray(record.client2ReservedExecutors) ? record.client2ReservedExecutors : [];
  const c1Guards: any[] = Array.isArray(record.client1Guardians) ? record.client1Guardians : (Array.isArray(record.guardians) ? record.guardians : []);
  const c1ResGuards: any[] = Array.isArray(record.client1ReservedGuardians) ? record.client1ReservedGuardians : (Array.isArray(record.reservedGuardians) ? record.reservedGuardians : []);
  const c1Bens: any[] = Array.isArray(record.client1Beneficiaries) ? record.client1Beneficiaries : (Array.isArray(record.beneficiaries) ? record.beneficiaries : []);
  const c2Bens: any[] = Array.isArray(record.client2Beneficiaries) ? record.client2Beneficiaries : [];
  const c1Gifts: any[] = Array.isArray(record.client1SpecificGifts) ? record.client1SpecificGifts : (Array.isArray(record.specificGifts) ? record.specificGifts : []);
  const c2Gifts: any[] = Array.isArray(record.client2SpecificGifts) ? record.client2SpecificGifts : [];

  const c1Under18: any[] = Array.isArray(record.client1ChildrenUnder18) ? record.client1ChildrenUnder18 : [];
  const c1Over18: any[] = Array.isArray(record.client1ChildrenOver18) ? record.client1ChildrenOver18 : [];
  const c2Under18: any[] = Array.isArray(record.client2ChildrenUnder18) ? record.client2ChildrenUnder18 : [];
  const c2Over18: any[] = Array.isArray(record.client2ChildrenOver18) ? record.client2ChildrenOver18 : [];
  const allChildren = [...c1Under18, ...c1Over18, ...(isMirror ? [...c2Under18, ...c2Over18] : [])];
  const seenChildren = new Set<string>();
  const uniqueChildren = allChildren.filter(c => {
    const key = personName(c);
    if (!key || seenChildren.has(key)) return false;
    seenChildren.add(key);
    return true;
  });

  const c1FuneralType = fmt(record.client1FuneralType) || fmt(record.funeralType);
  const c1FuneralWishes = fmt(record.client1FuneralWishes) || fmt(record.funeralWishes);
  const c1OrganDonation = fmt(record.client1OrganDonation) || fmt(record.organDonation);
  const c2FuneralType = fmt(record.client2FuneralType);
  const c2FuneralWishes = fmt(record.client2FuneralWishes);
  const c2OrganDonation = fmt(record.client2OrganDonation);

  // ── Build document sections ──────────────────────────────────────────────
  const children: (Paragraph | Table)[] = [];

  // Cover / Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "WELCOME PACK", bold: true, size: 48, color: GREEN, font: "Georgia" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Genesis Wills and Estate Planning", size: 28, color: GOLD })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: c1Name + (isMirror && c2Name ? ` & ${c2Name}` : ""), bold: true, size: 32, color: GREEN, font: "Georgia" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: today, size: 22, color: "6B7280" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    refNum ? new Paragraph({
      children: [new TextRun({ text: `Reference: ${refNum}`, size: 22, color: "6B7280" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }) : new Paragraph({ children: [] }),
    record.willType ? new Paragraph({
      children: [new TextRun({ text: willTypeLabel(record.willType), size: 22, color: "6B7280", italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }) : new Paragraph({ children: [] }),
    dividerPara(),
    pageBreakPara(),
  );

  // Welcome Letter
  children.push(
    heading1("Welcome Letter"),
    new Paragraph({
      children: [boldRun("WELCOME PACK")],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [boldRun("Date: "), normalRun(today)],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [boldRun("Strictly Private and Confidential")],
      spacing: { after: 60 },
    }),
    ...addressLines.map(l => new Paragraph({ children: [normalRun(l)], spacing: { after: 40 } })),
    spacerPara(),
    new Paragraph({
      children: [new TextRun({ text: salutation, bold: true, size: 24, color: GREEN, font: "Georgia" })],
      spacing: { before: 160, after: 120 },
    }),
    new Paragraph({
      children: [
        normalRun("Thank you for entrusting Genesis Wills and Estate Planning with your instructions. Following your recent meeting with our consultant, "),
        boldRun(consultantName),
        normalRun(`, I am writing to formally welcome you as our newest client and to confirm the details of your instructions for a `),
        boldRun(willTypeLabel(record.willType || "Will")),
        normalRun(". We understand that estate planning is a significant step, and our team is dedicated to ensuring your wishes are documented accurately and professionally."),
      ],
      spacing: { after: 120 },
    }),
    bodyPara("Enclosed in this Welcome Pack you will find a summary of the instructions we have recorded for you. Please review all details carefully and contact us immediately if any corrections are required before drafting begins."),
    dividerPara(),
    sectionHeading("Your Support Team"),
    bodyPara(`We are here to help you at every stage. If you have any questions about your documents or the process, please contact your dedicated team members below.${coordinatorPhone ? ` (General Enquiries: ${coordinatorPhone})` : ""}`),
    spacerPara(),
    supportTable(
      { name: consultantName, email: consultantEmail, phone: consultantPhone },
      { name: coordinatorName, email: coordinatorEmail, phone: coordinatorPhone }
    ),
    pageBreakPara(),
  );

  // Client Details
  children.push(
    heading1("Summary of Instructions"),
    bodyPara("Please check the following details carefully. It is vital that all names, addresses, and dates of birth are 100% accurate. Contact us immediately if any corrections are needed."),
    sectionHeading("Client Details"),
    ...(clientTable(record, 1) as (Paragraph | Table)[]),
    ...(isMirror ? clientTable(record, 2) as (Paragraph | Table)[] : []),
  );

  if (uniqueChildren.length > 0) {
    children.push(
      sectionHeading("Children"),
      bodyPara("You have confirmed that you have the following children:"),
      ...uniqueChildren.flatMap(c => personPara(c)),
    );
  }

  children.push(pageBreakPara());

  // Executors & Guardians
  children.push(heading1("Appointments"));
  children.push(sectionHeading("Executors"));

  function addExecSection(label: string, primaries: any[], substitutes: any[]) {
    if (!primaries.length && !substitutes.length) return;
    if (label) children.push(new Paragraph({ children: [boldRun(label)], spacing: { after: 80 } }));
    if (primaries.length) {
      children.push(new Paragraph({
        children: [normalRun("You have appointed the following as your "), boldRun(`Primary Executor${primaries.length > 1 ? "s" : ""}:`), normalRun("")],
        spacing: { after: 80 },
      }));
      primaries.forEach(p => children.push(...personPara(p)));
    }
    if (substitutes.length) {
      children.push(new Paragraph({
        children: [normalRun("Should they be unable or unwilling to act, you have appointed the following "), boldRun(`Substitute Executor${substitutes.length > 1 ? "s" : ""}:`), normalRun("")],
        spacing: { after: 80 },
      }));
      substitutes.forEach(p => children.push(...personPara(p)));
    }
  }

  if (isMirror) {
    addExecSection(`Client 1 — ${record.client1FirstName || ""}`, c1Execs, c1ResExecs);
    addExecSection(`Client 2 — ${record.client2FirstName || ""}`, c2Execs, c2ResExecs);
  } else {
    addExecSection("", c1Execs, c1ResExecs);
  }

  if (c1Guards.length > 0 || c1ResGuards.length > 0) {
    children.push(sectionHeading("Guardians"));
    children.push(bodyPara("You have appointed the following to act as guardians for any minor children:"));
    c1Guards.forEach(p => children.push(...personPara(p)));
    if (c1ResGuards.length) {
      children.push(new Paragraph({ children: [boldRun("Substitute Guardians:")], spacing: { after: 80 } }));
      c1ResGuards.forEach(p => children.push(...personPara(p)));
    }
  }

  children.push(sectionHeading("Distribution of Your Estate"));
  if (isMirror) {
    if (c1Bens.length) {
      children.push(new Paragraph({ children: [boldRun(`Client 1 — ${record.client1FirstName || ""}`)], spacing: { after: 80 } }));
      children.push(bodyPara("Your estate will be distributed as follows:"));
      children.push(...benListParas(c1Bens));
      if (record.client1ResidualEstate) children.push(new Paragraph({ children: [normalRun("Any remaining estate will pass to: "), boldRun(record.client1ResidualEstate)], spacing: { after: 80 } }));
    }
    if (c2Bens.length) {
      children.push(new Paragraph({ children: [boldRun(`Client 2 — ${record.client2FirstName || ""}`)], spacing: { before: 120, after: 80 } }));
      children.push(bodyPara("Your estate will be distributed as follows:"));
      children.push(...benListParas(c2Bens));
      if (record.client2ResidualEstate) children.push(new Paragraph({ children: [normalRun("Any remaining estate will pass to: "), boldRun(record.client2ResidualEstate)], spacing: { after: 80 } }));
    }
  } else {
    children.push(...benListParas(c1Bens));
    if (record.client1ResidualEstate) children.push(new Paragraph({ children: [normalRun("Any remaining estate will pass to: "), boldRun(record.client1ResidualEstate)], spacing: { after: 80 } }));
  }

  if (record.disasterClauseNotes || record.disasterClauseClient1) {
    children.push(new Paragraph({ children: [boldRun("Disaster Clause")], spacing: { before: 120, after: 60 } }));
    children.push(bodyPara(record.disasterClauseNotes || record.disasterClauseClient1));
  }

  children.push(pageBreakPara());

  // Assets, Gifts & Funeral
  children.push(heading1("Assets, Gifts & Wishes"));

  const propAddress = fmt(record.propertyAddress);
  const propOwnership = fmt(record.propertyOwnership);
  const propValue = fmt(record.propertyValue);
  const mortgage = fmt(record.mortgageOutstanding);
  const lifeInsurance = fmt(record.hasLifeInsurance);
  const lifeInsurancePolicies: any[] = Array.isArray(record.lifeInsurancePolicies) ? record.lifeInsurancePolicies : [];
  const assetsOutsideUK = fmt(record.assetsOutsideUK);

  if (propAddress || propValue) {
    children.push(sectionHeading("Property & Financial Overview"));
    if (propAddress) children.push(labelValuePara("Property Address", propAddress));
    if (propOwnership) children.push(labelValuePara("Ownership", capitalize(propOwnership)));
    if (propValue) children.push(labelValuePara("Estimated Value", propValue.startsWith("£") ? propValue : `£${propValue}`));
    if (mortgage && mortgage !== "no" && mortgage !== "0") children.push(labelValuePara("Mortgage", mortgage));
    else children.push(labelValuePara("Mortgage", "None"));
    if (lifeInsurance === "yes") {
      const provider = lifeInsurancePolicies.map((p: any) => p.provider || "").filter(Boolean).join(", ");
      children.push(labelValuePara("Life Insurance", provider || "Yes"));
    }
    if (assetsOutsideUK === "yes") children.push(labelValuePara("Assets Outside UK", "Yes"));
    children.push(spacerPara());
  }

  if (c1Gifts.length > 0 || c2Gifts.length > 0) {
    children.push(sectionHeading("Specific Gifts"));
    children.push(bodyPara(`You have instructed that the following gifts are to be included within your Will${isMirror ? "s" : ""}:`));
    if (isMirror) {
      children.push(...giftParas(c1Gifts, `Client 1 — ${record.client1FirstName || ""}`));
      children.push(...giftParas(c2Gifts, `Client 2 — ${record.client2FirstName || ""}`));
    } else {
      children.push(...giftParas(c1Gifts, ""));
    }
  }

  if (c1FuneralType || c1FuneralWishes || c1OrganDonation) {
    children.push(sectionHeading("Funeral Wishes & Organ Donation"));
    if (isMirror) {
      if (c1FuneralType || c1FuneralWishes || c1OrganDonation) {
        children.push(new Paragraph({ children: [boldRun(`Client 1 — ${record.client1FirstName || ""}`)], spacing: { after: 80 } }));
        if (c1FuneralType) children.push(labelValuePara("Funeral Preference", capitalize(c1FuneralType)));
        if (c1OrganDonation) children.push(labelValuePara("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No"));
        if (c1FuneralWishes) children.push(new Paragraph({ children: [italicRun(`"${c1FuneralWishes}"`), normalRun("")], spacing: { after: 80 } }));
      }
      if (c2FuneralType || c2FuneralWishes || c2OrganDonation) {
        children.push(new Paragraph({ children: [boldRun(`Client 2 — ${record.client2FirstName || ""}`)], spacing: { before: 120, after: 80 } }));
        if (c2FuneralType) children.push(labelValuePara("Funeral Preference", capitalize(c2FuneralType)));
        if (c2OrganDonation) children.push(labelValuePara("Organ Donation", c2OrganDonation === "yes" ? "Yes" : "No"));
        if (c2FuneralWishes) children.push(new Paragraph({ children: [italicRun(`"${c2FuneralWishes}"`), normalRun("")], spacing: { after: 80 } }));
      }
    } else {
      if (c1FuneralType) children.push(labelValuePara("Funeral Preference", capitalize(c1FuneralType)));
      if (c1OrganDonation) children.push(labelValuePara("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No"));
      if (c1FuneralWishes) children.push(new Paragraph({ children: [italicRun(`"${c1FuneralWishes}"`), normalRun("")], spacing: { after: 80 } }));
    }
  }

  if (record.additionalNotes || record.specialNotes) {
    children.push(dividerPara());
    children.push(new Paragraph({ children: [boldRun("Additional Notes")], spacing: { after: 80 } }));
    children.push(bodyPara(record.additionalNotes || record.specialNotes));
  }

  children.push(pageBreakPara());

  // Additional Services & Next Steps
  children.push(heading1("Next Steps & Our Services"));
  children.push(sectionHeading("Additional Services We Offer"));
  children.push(bodyPara("While you have instructed us for a Will, we offer a comprehensive range of services to protect your assets and your family:"));

  const services = [
    ["Lasting Powers of Attorney (LPAs)", "Appoint someone to make decisions on your behalf regarding Health & Welfare or Property & Financial Affairs should you become mentally incapable."],
    ["Trusts", "Valuable tools to protect assets and control how they are distributed to beneficiaries."],
    ["Inheritance Tax Planning", "Strategies to minimise the tax burden on your estate."],
    ["Probate Administration", "Professional assistance for executors in gathering assets, paying debts, and distributing the estate."],
  ];
  services.forEach(([title, desc]) => {
    children.push(new Paragraph({
      children: [boldRun(`${title}: `), normalRun(desc)],
      spacing: { after: 80 },
      indent: { left: convertMillimetersToTwip(5) },
    }));
  });

  children.push(spacerPara());
  children.push(sectionHeading("What Happens Next?"));

  const steps = [
    ["Verification", "Please review the Summary of Instructions in this pack carefully. It is vital that all names, addresses, and dates of birth are 100% accurate."],
    ["Cooling-Off Period", "We will begin work on your legal documents immediately upon the expiration of your 14-day cooling-off period."],
    ["Drafting", `You will receive your draft documents approximately 2 weeks from today${estimatedDraft ? ` (estimated: ${estimatedDraft})` : ""}, depending on case complexity.`],
    ["Finalisation & Signing", "Once you approve the drafts, we will prepare the final documents for signing (attestation)."],
  ];
  steps.forEach(([title, desc], i) => {
    children.push(new Paragraph({
      children: [boldRun(`${i + 1}. ${title}: `), normalRun(desc)],
      spacing: { after: 100 },
    }));
  });

  children.push(dividerPara());
  children.push(bodyPara("If you spot any errors in the summary, please reply to this correspondence immediately so we can correct our records before drafting begins."));
  children.push(spacerPara());
  children.push(new Paragraph({ children: [normalRun("Yours sincerely,")], spacing: { after: 80 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: coordinatorName, bold: true, size: 24, color: GREEN, font: "Georgia" })], spacing: { after: 60 } }));
  children.push(new Paragraph({ children: [normalRun("Genesis Wills and Estate Planning")], spacing: { after: 60 } }));
  if (coordinatorPhone) children.push(new Paragraph({ children: [normalRun(coordinatorPhone)], spacing: { after: 60 } }));
  if (coordinatorEmail) children.push(new Paragraph({ children: [normalRun(coordinatorEmail)], spacing: { after: 60 } }));

  // Build document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20 },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(20),
            right: convertMillimetersToTwip(20),
            bottom: convertMillimetersToTwip(20),
            left: convertMillimetersToTwip(20),
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Genesis Wills and Estate Planning", color: GREEN, size: 16, bold: true }),
                new TextRun({ text: "  |  Strictly Private & Confidential", color: "9CA3AF", size: 16 }),
                refNum ? new TextRun({ text: `  |  Ref: ${refNum}`, color: "9CA3AF", size: 16 }) : new TextRun({ text: "" }),
              ],
              border: { bottom: { color: GOLD, size: 4, space: 2, style: BorderStyle.SINGLE } },
              spacing: { after: 80 },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Genesis Wills and Estate Planning  |  ", color: "9CA3AF", size: 16 }),
                new TextRun({ text: "Page ", color: "9CA3AF", size: 16 }),
              ],
              border: { top: { color: GOLD, size: 4, space: 2, style: BorderStyle.SINGLE } },
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
