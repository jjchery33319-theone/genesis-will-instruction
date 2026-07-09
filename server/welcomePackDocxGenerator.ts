/**
 * welcomePackDocxGenerator.ts
 * Generates a fully editable Word (.docx) Welcome Pack.
 *
 * Design philosophy: ZERO paragraph borders, ZERO table cell shading that can't
 * be deleted. Every visual separator is a plain paragraph (a row of dashes or a
 * blank line) that the user can select and delete with a single keypress.
 * Colour, bold, and font size are used for hierarchy instead of borders/rules.
 */
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  PageBreak, Header, Footer,
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

// ── Colour constants ──────────────────────────────────────────────────────────
const GREEN = "1B4332";
const GOLD = "C9A84C";
const LIGHT_GREEN = "2D6A4F";
const LIGHT_BG = "F0F7F3";
const WHITE = "FFFFFF";

// ── Paragraph helpers (NO borders anywhere) ───────────────────────────────────

/** Large page title */
function titlePara(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 52, color: GREEN, font: "Georgia" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 200 },
  });
}

/** Subtitle / company name */
function subtitlePara(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 26, color: GOLD })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
  });
}

/**
 * Section heading — bold, coloured, slightly larger.
 * NO border. A plain dash-line divider paragraph is added before it instead.
 */
function heading1(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 30, color: GREEN, font: "Georgia" })],
    spacing: { before: 320, after: 160 },
  });
}

/** Sub-section heading */
function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, color: LIGHT_GREEN, font: "Georgia" })],
    spacing: { before: 240, after: 100 },
  });
}

/**
 * Visual divider — a plain paragraph containing a row of dashes.
 * The user can click on this line and press Delete to remove it.
 */
function dividerPara(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: "─────────────────────────────────────────────────────────────────", color: GOLD, size: 16 })],
    spacing: { before: 120, after: 120 },
  });
}

function spacerPara(): Paragraph {
  return new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 120 } });
}

function pageBreakPara(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

function bodyPara(text: string, spacing = 120): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 20 })],
    spacing: { after: spacing },
  });
}

function boldBodyPara(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: label + ": ", bold: true, size: 20 }),
      new TextRun({ text: value, size: 20 }),
    ],
    spacing: { after: 60 },
  });
}

function labelValuePara(label: string, value: string): Paragraph {
  if (!value) return new Paragraph({ children: [] });
  return new Paragraph({
    children: [
      new TextRun({ text: label + ": ", bold: true, size: 20 }),
      new TextRun({ text: value, size: 20 }),
    ],
    spacing: { after: 60 },
  });
}

function bulletPara(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `•  ${text}`, size: 20 })],
    spacing: { after: 60 },
    indent: { left: convertMillimetersToTwip(5) },
  });
}

function personPara(p: any): Paragraph[] {
  const name = personName(p);
  if (!name) return [];
  const dob = (p.dob || p.dateOfBirth) ? fmtDateShort(p.dob || p.dateOfBirth) : "";
  const addr = p.address || "";
  const paras: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: name, bold: true, size: 21, color: GREEN })],
      spacing: { after: 40 },
    }),
  ];
  if (dob) paras.push(new Paragraph({ children: [new TextRun({ text: `Date of Birth: ${dob}`, size: 20 })], spacing: { after: 40 } }));
  if (addr) paras.push(new Paragraph({ children: [new TextRun({ text: `Address: ${addr}`, size: 20 })], spacing: { after: 40 } }));
  paras.push(spacerPara());
  return paras;
}

/**
 * Support team table — uses plain borders (no shading on header cells).
 * The user can click inside any cell and edit or delete the content.
 * The table itself can be deleted by selecting all rows and pressing Delete.
 */
function supportTable(consultant: any, coordinator: any): Table {
  const plainBorder = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" };
  const borders = { top: plainBorder, bottom: plainBorder, left: plainBorder, right: plainBorder };

  const headerCell = (text: string) => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: GREEN })] })],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    borders,
  });

  const dataCell = (text: string, bold = false) => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold, size: 19 })] })],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    borders,
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: plainBorder, bottom: plainBorder, left: plainBorder, right: plainBorder },
    rows: [
      new TableRow({
        children: [headerCell("Role"), headerCell("Name"), headerCell("Email"), headerCell("Phone")],
        tableHeader: true,
      }),
      new TableRow({
        children: [dataCell("Your Consultant", true), dataCell(consultant.name), dataCell(consultant.email), dataCell(consultant.phone)],
      }),
      new TableRow({
        children: [dataCell("Case Coordinator", true), dataCell(coordinator.name), dataCell(coordinator.email), dataCell(coordinator.phone)],
      }),
    ],
  });
}

/**
 * Client details table — plain borders, no background shading.
 * Every cell is fully editable and deletable.
 */
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
    ["Full Name", name], ["Date of Birth", dob], ["Marital Status", marital],
    ["Occupation", job], ["Nationality", nationality], ["Address", addr],
    ["Telephone", phone], ["Email", email],
  ].filter(([, v]) => v) as [string, string][];

  const plainBorder = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" };
  const borders = { top: plainBorder, bottom: plainBorder, left: plainBorder, right: plainBorder };

  const tableRows = rows.map(([label, value]) => new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 19 })] })],
        width: { size: 30, type: WidthType.PERCENTAGE },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        borders,
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 19 })] })],
        width: { size: 70, type: WidthType.PERCENTAGE },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        borders,
      }),
    ],
  }));

  return [
    new Paragraph({
      children: [new TextRun({ text: `Client ${num}`, bold: true, size: 22, color: LIGHT_GREEN })],
      spacing: { before: 160, after: 80 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: plainBorder, bottom: plainBorder, left: plainBorder, right: plainBorder },
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
    return bulletPara(parts);
  });
}

function giftParas(gifts: any[], label: string): Paragraph[] {
  if (!gifts.length) return [];
  const paras: Paragraph[] = [];
  if (label) paras.push(new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: LIGHT_GREEN })], spacing: { after: 60 } }));
  gifts.forEach(g => {
    const item = g.description || g.giftDescription || g.item || "";
    const group = g.recipientGroup || "";
    const isNamed = !group || group === "__named" || group === "named" || group === "Named individual";
    const recipient = isNamed
      ? (g.recipient || g.recipientName || personName(g) || "")
      : group;
    const giftTypeLabel = g.giftType === "monetary" ? " (Monetary)" : g.giftType === "property" ? " (Property)" : "";
    if (!item && !recipient) return;
    paras.push(bulletPara([`${item}${giftTypeLabel}`, recipient ? `→ ${recipient}` : ""].filter(Boolean).join("  ")));
  });
  paras.push(spacerPara());
  return paras;
}

// ── Main generator ─────────────────────────────────────────────────────────────

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

  const propAddress = fmt(record.propertyAddress);
  const propOwnership = fmt(record.propertyOwnership);
  const propValue = fmt(record.propertyValue);
  const mortgage = fmt(record.mortgageOutstanding);
  const lifeInsurance = fmt(record.hasLifeInsurance);
  const lifeInsurancePolicies: any[] = Array.isArray(record.lifeInsurancePolicies) ? record.lifeInsurancePolicies : [];
  const assetsOutsideUK = fmt(record.assetsOutsideUK);

  // ── Build document body ────────────────────────────────────────────────────
  const children: (Paragraph | Table)[] = [];

  // ── COVER ──────────────────────────────────────────────────────────────────
  children.push(
    titlePara("WELCOME PACK"),
    subtitlePara("Genesis Wills and Estate Planning"),
    spacerPara(),
    new Paragraph({
      children: [new TextRun({ text: c1Name + (isMirror && c2Name ? ` & ${c2Name}` : ""), bold: true, size: 36, color: GREEN, font: "Georgia" })],
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
    }) : spacerPara(),
    record.willType ? new Paragraph({
      children: [new TextRun({ text: willTypeLabel(record.willType), size: 22, color: "6B7280", italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }) : spacerPara(),
    dividerPara(),
    pageBreakPara(),
  );

  // ── WELCOME LETTER ─────────────────────────────────────────────────────────
  children.push(
    heading1("Welcome Letter"),
    boldBodyPara("Date", today),
    new Paragraph({
      children: [new TextRun({ text: "Strictly Private and Confidential", bold: true, size: 20 })],
      spacing: { after: 120 },
    }),
    ...addressLines.map(l => new Paragraph({ children: [new TextRun({ text: l, size: 20 })], spacing: { after: 40 } })),
    spacerPara(),
    new Paragraph({
      children: [new TextRun({ text: salutation, bold: true, size: 24, color: GREEN, font: "Georgia" })],
      spacing: { before: 160, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Thank you for entrusting Genesis Wills and Estate Planning with your instructions. Following your recent meeting with our consultant, ", size: 20 }),
        new TextRun({ text: consultantName, bold: true, size: 20 }),
        new TextRun({ text: `, I am writing to formally welcome you as our newest client and to confirm the details of your instructions for a `, size: 20 }),
        new TextRun({ text: willTypeLabel(record.willType || "Will"), bold: true, size: 20 }),
        new TextRun({ text: ". We understand that estate planning is a significant step, and our team is dedicated to ensuring your wishes are documented accurately and professionally.", size: 20 }),
      ],
      spacing: { after: 120 },
    }),
    bodyPara("Enclosed in this Welcome Pack you will find a summary of the instructions we have recorded for you. Please review all details carefully and contact us immediately if any corrections are required before drafting begins."),
    dividerPara(),
    sectionHeading("Your Support Team"),
    bodyPara(`We are here to help you at every stage. If you have any questions, please contact your dedicated team members below.`),
    spacerPara(),
    supportTable(
      { name: consultantName, email: consultantEmail, phone: consultantPhone },
      { name: coordinatorName, email: coordinatorEmail, phone: coordinatorPhone }
    ),
    pageBreakPara(),
  );

  // ── SUMMARY OF INSTRUCTIONS ────────────────────────────────────────────────
  children.push(
    heading1("Summary of Instructions"),
    bodyPara("Please check the following details carefully. It is vital that all names, addresses, and dates of birth are 100% accurate. Contact us immediately if any corrections are needed."),
    dividerPara(),
    sectionHeading("Client Details"),
    ...(clientTable(record, 1) as (Paragraph | Table)[]),
    ...(isMirror ? clientTable(record, 2) as (Paragraph | Table)[] : []),
  );

  if (uniqueChildren.length > 0) {
    children.push(
      dividerPara(),
      sectionHeading("Children"),
      bodyPara("You have confirmed that you have the following children:"),
      ...uniqueChildren.flatMap(c => personPara(c)),
    );
  }

  children.push(pageBreakPara());

  // ── APPOINTMENTS ───────────────────────────────────────────────────────────
  children.push(heading1("Appointments"));
  children.push(dividerPara());
  children.push(sectionHeading("Executors"));

  function addExecSection(label: string, primaries: any[], substitutes: any[]) {
    if (!primaries.length && !substitutes.length) return;
    if (label) children.push(new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })], spacing: { after: 80 } }));
    if (primaries.length) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: "You have appointed the following as your ", size: 20 }),
          new TextRun({ text: `Primary Executor${primaries.length > 1 ? "s" : ""}:`, bold: true, size: 20 }),
        ],
        spacing: { after: 80 },
      }));
      primaries.forEach(p => children.push(...personPara(p)));
    }
    if (substitutes.length) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: "Should they be unable or unwilling to act, you have appointed the following ", size: 20 }),
          new TextRun({ text: `Substitute Executor${substitutes.length > 1 ? "s" : ""}:`, bold: true, size: 20 }),
        ],
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
    children.push(dividerPara());
    children.push(sectionHeading("Guardians"));
    children.push(bodyPara("You have appointed the following to act as guardians for any minor children:"));
    c1Guards.forEach(p => children.push(...personPara(p)));
    if (c1ResGuards.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: "Substitute Guardians:", bold: true, size: 20 })], spacing: { after: 80 } }));
      c1ResGuards.forEach(p => children.push(...personPara(p)));
    }
  }

  children.push(dividerPara());
  children.push(sectionHeading("Distribution of Your Estate"));
  if (isMirror) {
    if (c1Bens.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: `Client 1 — ${record.client1FirstName || ""}`, bold: true, size: 20 })], spacing: { after: 80 } }));
      children.push(bodyPara("Your estate will be distributed as follows:"));
      children.push(...benListParas(c1Bens));
      if (record.client1ResidualEstate) children.push(boldBodyPara("Any remaining estate will pass to", record.client1ResidualEstate));
    }
    if (c2Bens.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: `Client 2 — ${record.client2FirstName || ""}`, bold: true, size: 20 })], spacing: { before: 120, after: 80 } }));
      children.push(bodyPara("Your estate will be distributed as follows:"));
      children.push(...benListParas(c2Bens));
      if (record.client2ResidualEstate) children.push(boldBodyPara("Any remaining estate will pass to", record.client2ResidualEstate));
    }
  } else {
    children.push(...benListParas(c1Bens));
    if (record.client1ResidualEstate) children.push(boldBodyPara("Any remaining estate will pass to", record.client1ResidualEstate));
  }

  if (record.disasterClauseNotes || record.disasterClauseClient1) {
    children.push(spacerPara());
    children.push(new Paragraph({ children: [new TextRun({ text: "Disaster Clause", bold: true, size: 20 })], spacing: { after: 60 } }));
    children.push(bodyPara(record.disasterClauseNotes || record.disasterClauseClient1));
  }

  children.push(pageBreakPara());

  // ── ASSETS, GIFTS & WISHES ─────────────────────────────────────────────────
  children.push(heading1("Assets, Gifts & Wishes"));

  if (propAddress || propValue) {
    children.push(dividerPara());
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
    // Gift of Property Clause (V2 data)
    const propertiesWithGift = (Array.isArray(record.properties) ? record.properties : []).filter((p: any) => p.giftOfProperty === 1 || p.giftOfProperty === true);
    if (propertiesWithGift.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: "Gift of Property Clause", bold: true, size: 20, color: LIGHT_GREEN })], spacing: { before: 160, after: 80 } }));
      propertiesWithGift.forEach((p: any) => {
        const addr = fmt(p.address) || "Property";
        const group = p.giftRecipientGroup;
        const isNamed = !group || group === "__named" || group === "named" || group === "Named individual";
        const recipientDisplay = isNamed ? (fmt(p.giftRecipientName) || "Named individual") : group;
        children.push(new Paragraph({ children: [new TextRun({ text: addr, bold: true, size: 20 })], spacing: { after: 40 } }));
        children.push(labelValuePara("Gift to", recipientDisplay));
        if (isNamed && fmt(p.giftRecipientAddress)) children.push(labelValuePara("Recipient Address", fmt(p.giftRecipientAddress)));
        if (fmt(p.giftCondition)) children.push(labelValuePara("Condition", fmt(p.giftCondition)));
        if (fmt(p.giftNotes)) children.push(labelValuePara("Notes", fmt(p.giftNotes)));
        children.push(spacerPara());
      });
    }
    children.push(spacerPara());
  }

  if (c1Gifts.length > 0 || c2Gifts.length > 0) {
    children.push(dividerPara());
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
    children.push(dividerPara());
    children.push(sectionHeading("Funeral Wishes & Organ Donation"));
    if (isMirror) {
      if (c1FuneralType || c1FuneralWishes || c1OrganDonation) {
        children.push(new Paragraph({ children: [new TextRun({ text: `Client 1 — ${record.client1FirstName || ""}`, bold: true, size: 20 })], spacing: { after: 80 } }));
        if (c1FuneralType) children.push(labelValuePara("Funeral Preference", capitalize(c1FuneralType)));
        if (c1OrganDonation) children.push(labelValuePara("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No"));
        if (c1FuneralWishes) children.push(new Paragraph({ children: [new TextRun({ text: `"${c1FuneralWishes}"`, italics: true, size: 20 })], spacing: { after: 80 } }));
      }
      if (c2FuneralType || c2FuneralWishes || c2OrganDonation) {
        children.push(new Paragraph({ children: [new TextRun({ text: `Client 2 — ${record.client2FirstName || ""}`, bold: true, size: 20 })], spacing: { before: 120, after: 80 } }));
        if (c2FuneralType) children.push(labelValuePara("Funeral Preference", capitalize(c2FuneralType)));
        if (c2OrganDonation) children.push(labelValuePara("Organ Donation", c2OrganDonation === "yes" ? "Yes" : "No"));
        if (c2FuneralWishes) children.push(new Paragraph({ children: [new TextRun({ text: `"${c2FuneralWishes}"`, italics: true, size: 20 })], spacing: { after: 80 } }));
      }
    } else {
      if (c1FuneralType) children.push(labelValuePara("Funeral Preference", capitalize(c1FuneralType)));
      if (c1OrganDonation) children.push(labelValuePara("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No"));
      if (c1FuneralWishes) children.push(new Paragraph({ children: [new TextRun({ text: `"${c1FuneralWishes}"`, italics: true, size: 20 })], spacing: { after: 80 } }));
    }
  }

  if (record.additionalNotes || record.specialNotes) {
    children.push(dividerPara());
    children.push(new Paragraph({ children: [new TextRun({ text: "Additional Notes", bold: true, size: 22 })], spacing: { after: 80 } }));
    children.push(bodyPara(record.additionalNotes || record.specialNotes));
  }

  children.push(pageBreakPara());

  // ── NEXT STEPS & SERVICES ──────────────────────────────────────────────────
  children.push(heading1("Next Steps & Our Services"));
  children.push(dividerPara());
  children.push(sectionHeading("Additional Services We Offer"));
  children.push(bodyPara("While you have instructed us for a Will, we offer a comprehensive range of services to protect your assets and your family:"));
  spacerPara();

  const services = [
    ["Lasting Powers of Attorney (LPAs)", "Appoint someone to make decisions on your behalf regarding Health & Welfare or Property & Financial Affairs should you become mentally incapable."],
    ["Trusts", "Valuable tools to protect assets and control how they are distributed to beneficiaries."],
    ["Inheritance Tax Planning", "Strategies to minimise the tax burden on your estate."],
    ["Probate Administration", "Professional assistance for executors in gathering assets, paying debts, and distributing the estate."],
  ];
  services.forEach(([title, desc]) => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${title}: `, bold: true, size: 20 }),
        new TextRun({ text: desc, size: 20 }),
      ],
      spacing: { after: 80 },
      indent: { left: convertMillimetersToTwip(5) },
    }));
  });

  children.push(spacerPara());
  children.push(dividerPara());
  children.push(sectionHeading("What Happens Next?"));

  const steps = [
    ["1. Verification", "Please review the Summary of Instructions in this pack carefully. It is vital that all names, addresses, and dates of birth are 100% accurate."],
    ["2. Cooling-Off Period", "We will begin work on your legal documents immediately upon the expiration of your 14-day cooling-off period."],
    ["3. Drafting", `You will receive your draft documents approximately 2 weeks from today${estimatedDraft ? ` (estimated: ${estimatedDraft})` : ""}, depending on case complexity.`],
    ["4. Finalisation & Signing", "Once you approve the drafts, we will prepare the final documents for signing (attestation)."],
  ];
  steps.forEach(([title, desc]) => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${title}: `, bold: true, size: 20 }),
        new TextRun({ text: desc, size: 20 }),
      ],
      spacing: { after: 100 },
    }));
  });

  children.push(dividerPara());
  children.push(bodyPara("If you spot any errors in the summary, please reply to this correspondence immediately so we can correct our records before drafting begins."));
  children.push(spacerPara());
  children.push(new Paragraph({ children: [new TextRun({ text: "Yours sincerely,", size: 20 })], spacing: { after: 80 } }));
  children.push(spacerPara());
  children.push(new Paragraph({ children: [new TextRun({ text: coordinatorName, bold: true, size: 24, color: GREEN, font: "Georgia" })], spacing: { after: 60 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: "Genesis Wills and Estate Planning", size: 20 })], spacing: { after: 60 } }));
  if (coordinatorPhone) children.push(new Paragraph({ children: [new TextRun({ text: coordinatorPhone, size: 20 })], spacing: { after: 60 } }));
  if (coordinatorEmail) children.push(new Paragraph({ children: [new TextRun({ text: coordinatorEmail, size: 20 })], spacing: { after: 60 } }));

  // ── Assemble document ──────────────────────────────────────────────────────
  const plainBorder = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" };

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
            right: convertMillimetersToTwip(22),
            bottom: convertMillimetersToTwip(20),
            left: convertMillimetersToTwip(22),
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
              // NO border on header paragraph — the user can delete the header entirely
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
                new TextRun({ text: "Genesis Wills and Estate Planning  |  Confidential  |  ", color: "9CA3AF", size: 14 }),
                new TextRun({ text: today, color: "9CA3AF", size: 14 }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 80 },
            }),
          ],
        }),
      },
      children,
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
