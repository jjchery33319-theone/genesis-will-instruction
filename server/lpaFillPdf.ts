/**
 * lpaFillPdf.ts
 * Pure Node.js LPA PDF filler using pdf-lib.
 * Works in both dev (sandbox) and production (Cloud Run Node-only).
 *
 * Field mapping verified by:
 *  1. Extracting all 264 AcroForm field names from LP1F with pdf-lib
 *  2. Visual inspection of a debug PDF with every field filled with its own name
 *
 * IMPORTANT: The PDF is NOT flattened after filling so it stays manually editable.
 */
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export interface LpaData {
  lpaType: "property_finance" | "health_welfare" | string;

  // Section 1: Donor
  donorTitle?: string;
  donorFirstNames?: string;
  donorLastName?: string;
  donorOtherNames?: string;
  donorDob?: string; // "DD/MM/YYYY"
  donorAddress?: string;   // full address — will be split across 3 lines
  donorPostcode?: string;
  donorEmail?: string;

  // Section 2: Attorneys (up to 4)
  attorneys?: Array<{
    title?: string;
    firstNames?: string;
    lastName?: string;
    dob?: string;
    address?: string;
    postcode?: string;
    email?: string;
    isTrustCorporation?: boolean;
  }>;

  // Section 3: How attorneys make decisions
  attorneyDecisionType?: string;  // "jointly_severally" | "jointly" | "jointly_some" | "single"
  attorneyDecisionDetails?: string;

  // Section 4: Replacement attorneys (up to 2)
  replacementAttorneys?: Array<{
    title?: string;
    firstNames?: string;
    lastName?: string;
    dob?: string;
    address?: string;
    postcode?: string;
    email?: string;
  }>;
  replacementDecisionDetails?: string;

  // Section 5 (LP1F): When attorneys can act
  whenAttorneysCanAct?: string;  // "capacity" | "whenever"

  // Section 6: People to notify (up to 5)
  peopleToNotify?: Array<{
    title?: string;
    firstNames?: string;
    lastName?: string;
    address?: string;
    postcode?: string;
  }>;

  // Section 7: Preferences & instructions
  preferences?: string;
  instructions?: string;

  // Section 9 (LP1H): Life-sustaining treatment
  lifeSustainingTreatment?: string;  // "give_authority" | "do_not_give"

  // Section 10: Certificate provider
  certProviderTitle?: string;
  certProviderFirstNames?: string;
  certProviderLastName?: string;
  certProviderAddress?: string;
  certProviderPostcode?: string;
  certProviderEmail?: string;

  // Section 12: Who is applying to register
  applicantType?: string;  // "donor" | "attorneys"

  // Section 13: Who receives the LPA
  recipientType?: string;  // "donor" | "attorney" | "other"
  recipientTitle?: string;
  recipientFirstNames?: string;
  recipientLastName?: string;
  recipientCompany?: string;
  recipientAddressLine1?: string;
  recipientAddressLine2?: string;
  recipientAddressLine3?: string;
  recipientPostcode?: string;
  deliveryPost?: boolean;
  deliveryPhone?: boolean;
  deliveryEmail?: boolean;
  deliveryWelsh?: boolean;

  // Section 14: Application fee
  feePaymentMethod?: string;  // "card" | "cheque"
  feeContactPhone?: string;
  reducedFee?: boolean;
  repeatApplication?: boolean;
  caseNumber?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Split "DD/MM/YYYY" into { day, month, year } */
function parseDob(dob?: string) {
  if (!dob) return { day: "", month: "", year: "" };
  const parts = dob.split("/");
  return {
    day: parts[0] ?? "",
    month: parts[1] ?? "",
    year: parts[2] ?? "",
  };
}

/** Safely set a text field — ignores if field doesn't exist */
function setText(form: ReturnType<PDFDocument["getForm"]>, name: string, value: string) {
  try {
    form.getTextField(name).setText(value ?? "");
  } catch {
    // field not found — skip silently
  }
}

/** Safely check a checkbox — ignores if field doesn't exist */
function checkBox(form: ReturnType<PDFDocument["getForm"]>, name: string, checked: boolean) {
  try {
    const field = form.getCheckBox(name);
    if (checked) field.check();
    else field.uncheck();
  } catch {
    // field not found — skip silently
  }
}

// ── Main filler ───────────────────────────────────────────────────────────────

/**
 * Fill an LPA PDF template with the provided data.
 * Returns the filled PDF as a Buffer.
 * The PDF is NOT flattened so it remains manually editable after download.
 */
export async function fillLpaPdf(data: LpaData): Promise<Buffer> {
  const isFinance = data.lpaType === "property_finance";
  const templateName = isFinance ? "lpa-lp1f.pdf" : "lpa-lp1h.pdf";

  // Load template — try local file first (dev), then storage URL (production)
  let pdfBytes: Uint8Array;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metaAny = import.meta as any;
  const serverDir = typeof metaAny.dirname === "string"
    ? (metaAny.dirname as string)
    : path.join(process.cwd(), "server");
  const localPath = path.join(serverDir, templateName);
  if (fs.existsSync(localPath)) {
    pdfBytes = fs.readFileSync(localPath);
  } else {
    const storageUrl = isFinance
      ? "/manus-storage/lpa-lp1f_3d2a3de9.pdf"
      : "/manus-storage/lpa-lp1h_b2d46e3d.pdf";
    const baseUrl = process.env.INTERNAL_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
    const res = await fetch(`${baseUrl}${storageUrl}`, { redirect: "follow" });
    if (!res.ok) throw new Error(`Failed to fetch LPA template: ${res.status} ${storageUrl}`);
    pdfBytes = new Uint8Array(await res.arrayBuffer());
  }

  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = doc.getForm();

  // ── Section 1: Donor ──────────────────────────────────────────────────────
  // Confirmed field names from visual inspection of LP1F:
  // Title, First names, Last name, Day, Month, Year, Address 1a/1b/1cc, Postcode, Email address optional
  setText(form, "Title", data.donorTitle ?? "");
  setText(form, "First names", data.donorFirstNames ?? "");
  setText(form, "Last name", data.donorLastName ?? "");
  setText(form, "Any other names youre known by optional  eg your married name", data.donorOtherNames ?? "");
  const donorDob = parseDob(data.donorDob);
  setText(form, "Day", donorDob.day);
  setText(form, "Month", donorDob.month);
  setText(form, "Year", donorDob.year);
  // Donor address uses Address 1a, Address 1b, Address 1cc (confirmed from field list indices 213-215)
  const donorAddr = (data.donorAddress ?? "").split(",").map(s => s.trim()).filter(Boolean);
  setText(form, "Address 1a", donorAddr[0] ?? "");
  setText(form, "Address 1b", donorAddr[1] ?? "");
  setText(form, "Address 1cc", donorAddr.slice(2).join(", ") ?? "");
  setText(form, "Postcode", data.donorPostcode ?? "");
  setText(form, "Email address optional", data.donorEmail ?? "");

  // ── Section 2: Attorneys (up to 4) ───────────────────────────────────────
  // Confirmed from field positions (page 4, x coordinates):
  // Attorney 1 (LEFT column, x≈41): Title_2, First names_2, Last name_2, Day_3/Month_3/Year_3
  //   Address: Address 1_2 (x=41,y=302), Address 1_2b (x=41,y=281), Address 1_2c (x=40,y=261)
  //   Postcode: undefined_2 (x=90), Email: Email address optional_2 (x=42)
  // Attorney 2 (RIGHT column, x≈309): Title_3, First names_3, Last name_3, Day_4/Month_4/Year_4
  //   Address: Address 1_3 (x=309,y=?), Address 1_3b (x=309,y=281), Address 1_3c (x=309,y=262)
  //   Postcode: undefined_3 (x=357), Email: Email address optional_3 (x=310)
  // Attorney 3: Title_4, First names_4, Last name_4, Day_5/Month_5/Year_5, Address 1_4a/4b/4c, undefined_4
  // Attorney 4: Title_5, First names_5, Last name_5, Day_6/Month_6/Year_6, Address 1_5a/5b/5c, undefined_5
  const attorneys = data.attorneys ?? [];

  // Attorney 1 — LEFT column — address uses Address 1_2 / Address 1_2b / Address 1_2c
  if (attorneys[0]) {
    const a = attorneys[0];
    const dob = parseDob(a.dob);
    setText(form, "Title_2", a.title ?? "");
    setText(form, "First names_2", a.firstNames ?? "");
    setText(form, "Last name_2", a.lastName ?? "");
    setText(form, "Day_3", dob.day);
    setText(form, "Month_3", dob.month);
    setText(form, "Year_3", dob.year);
    const addr1 = (a.address ?? "").split(",").map(s => s.trim()).filter(Boolean);
    setText(form, "Address 1_2", addr1[0] ?? "");
    setText(form, "Address 1_2b", addr1[1] ?? "");
    setText(form, "Address 1_2c", addr1.slice(2).join(", ") ?? "");
    setText(form, "undefined_2", a.postcode ?? "");
    setText(form, "Email address optional_2", a.email ?? "");
    if (a.isTrustCorporation) checkBox(form, "This attorney is a trust corporation", true);
  }

  // Attorney 2 — RIGHT column — address uses Address 1_3 / Address 1_3b / Address 1_3c
  if (attorneys[1]) {
    const a = attorneys[1];
    const dob = parseDob(a.dob);
    setText(form, "Title_3", a.title ?? "");
    setText(form, "First names_3", a.firstNames ?? "");
    setText(form, "Last name_3", a.lastName ?? "");
    setText(form, "Day_4", dob.day);
    setText(form, "Month_4", dob.month);
    setText(form, "Year_4", dob.year);
    const addr2 = (a.address ?? "").split(",").map(s => s.trim()).filter(Boolean);
    setText(form, "Address 1_3", addr2[0] ?? "");
    setText(form, "Address 1_3b", addr2[1] ?? "");
    setText(form, "Address 1_3c", addr2.slice(2).join(", ") ?? "");
    setText(form, "undefined_3", a.postcode ?? "");
    setText(form, "Email address optional_3", a.email ?? "");
  }

  // Attorney 3 — address uses Address 1_4a/4b/4c (confirmed from field list 216-218)
  if (attorneys[2]) {
    const a = attorneys[2];
    const dob = parseDob(a.dob);
    setText(form, "Title_4", a.title ?? "");
    setText(form, "First names_4", a.firstNames ?? "");
    setText(form, "Last name_4", a.lastName ?? "");
    setText(form, "Day_5", dob.day);
    setText(form, "Month_5", dob.month);
    setText(form, "Year_5", dob.year);
    const addr3 = (a.address ?? "").split(",").map(s => s.trim()).filter(Boolean);
    setText(form, "Address 1_4a", addr3[0] ?? "");
    setText(form, "Address 1_4b", addr3[1] ?? "");
    setText(form, "Address 1_4c", addr3.slice(2).join(", ") ?? "");
    setText(form, "undefined_4", a.postcode ?? "");
    setText(form, "Email address optional_4", a.email ?? "");
  }

  // Attorney 4 — address uses Address 1_5a/5b/5c (confirmed from field list 219-221)
  if (attorneys[3]) {
    const a = attorneys[3];
    const dob = parseDob(a.dob);
    setText(form, "Title_5", a.title ?? "");
    setText(form, "First names_5", a.firstNames ?? "");
    setText(form, "Last name_5", a.lastName ?? "");
    setText(form, "Day_6", dob.day);
    setText(form, "Month_6", dob.month);
    setText(form, "Year_6", dob.year);
    const addr4 = (a.address ?? "").split(",").map(s => s.trim()).filter(Boolean);
    setText(form, "Address 1_5a", addr4[0] ?? "");
    setText(form, "Address 1_5b", addr4[1] ?? "");
    setText(form, "Address 1_5c", addr4.slice(2).join(", ") ?? "");
    setText(form, "undefined_5", a.postcode ?? "");
    setText(form, "Email address optional_5", a.email ?? "");
  }

  if (attorneys.length > 4) {
    checkBox(form, "More attorneys  I want to appoint more than 4 attorneys Use Continuation sheet 1", true);
  }

  // ── Section 3: How attorneys make decisions ───────────────────────────────
  // Only "Jointly and severally" is a named checkbox (confirmed field 188).
  // The other options ("Jointly", "Jointly for some") are visual boxes not exposed as AcroForm fields.
  if (data.attorneyDecisionType === "jointly_severally") {
    checkBox(form, "Jointly and severally", true);
  }
  // For jointly_some, fill the details continuation field
  if (data.attorneyDecisionType === "jointly_some" && data.attorneyDecisionDetails) {
    setText(form, "Details", data.attorneyDecisionDetails);
  }

  // ── Section 4: Replacement attorneys (up to 2) ───────────────────────────
  // Replacement 1: Title_6, First names_6, Last name_6, Day_7, Month_7, Year_7
  //   Address: Address 1_6a/6b/6c (confirmed field list 222-224), postcode: undefined_6
  // Replacement 2: Title_7, First names_7, Last name_7, Day_8, Month_8, Year_8
  //   Address: Address 1_7a/7b/7c (confirmed field list 225-227), postcode: undefined_7
  const replacements = data.replacementAttorneys ?? [];

  if (replacements[0]) {
    const r = replacements[0];
    const dob = parseDob(r.dob);
    setText(form, "Title_6", r.title ?? "");
    setText(form, "First names_6", r.firstNames ?? "");
    setText(form, "Last name_6", r.lastName ?? "");
    setText(form, "Day_7", dob.day);
    setText(form, "Month_7", dob.month);
    setText(form, "Year_7", dob.year);
    const rAddr1 = (r.address ?? "").split(",").map(s => s.trim()).filter(Boolean);
    setText(form, "Address 1_6a", rAddr1[0] ?? "");
    setText(form, "Address 1_6b", rAddr1[1] ?? "");
    setText(form, "Address 1_6c", rAddr1.slice(2).join(", ") ?? "");
    setText(form, "undefined_6", r.postcode ?? "");
  }

  if (replacements[1]) {
    const r = replacements[1];
    const dob = parseDob(r.dob);
    setText(form, "Title_7", r.title ?? "");
    setText(form, "First names_7", r.firstNames ?? "");
    setText(form, "Last name_7", r.lastName ?? "");
    setText(form, "Day_8", dob.day);
    setText(form, "Month_8", dob.month);
    setText(form, "Year_8", dob.year);
    const rAddr2 = (r.address ?? "").split(",").map(s => s.trim()).filter(Boolean);
    setText(form, "Address 1_7a", rAddr2[0] ?? "");
    setText(form, "Address 1_7b", rAddr2[1] ?? "");
    setText(form, "Address 1_7c", rAddr2.slice(2).join(", ") ?? "");
    setText(form, "undefined_7", r.postcode ?? "");
  }

  if (replacements.length > 2) {
    checkBox(form, "More replacements   I want to appoint more than two replacements Use Continuation sheet 1", true);
  }

  // ── Section 5: When attorneys can act (LP1F only) ─────────────────────────
  // "As soon as my LPA has been registered" is confirmed checkbox (field 189)
  if (isFinance && data.whenAttorneysCanAct === "whenever") {
    checkBox(form, "As soon as my LPA has been registered", true);
  }

  // ── Section 6: People to notify (up to 5) ────────────────────────────────
  // Confirmed field names from field list:
  // Person 1: Title_8, First names_8, Last name_8, undefined_8 (address), undefined_9 (postcode)
  // Person 2: Title_9, First names_9, Last name_9, undefined_10, undefined_11
  // Person 3: Title_10, First names_10, Last name_10, undefined_12 (not confirmed)
  // Person 4: Title_11, First names_11, Last name_11, undefined_13
  // Person 5: (uses continuation sheet)
  const notify = data.peopleToNotify ?? [];
  const notifyTitleFields  = ["Title_8",  "Title_9",  "Title_10",  "Title_11"];
  const notifyFirstFields  = ["First names_8",  "First names_9",  "First names_10",  "First names_11"];
  const notifyLastFields   = ["Last name_8",  "Last name_9",  "Last name_10",  "Last name_11"];
  const notifyAddrFields   = ["undefined_8",  "undefined_10", "undefined_12", "undefined_13"];
  const notifyPcFields     = ["undefined_9",  "undefined_11", "undefined_14", "undefined_16"];

  notify.slice(0, 4).forEach((p, i) => {
    setText(form, notifyTitleFields[i], p.title ?? "");
    setText(form, notifyFirstFields[i], p.firstNames ?? "");
    setText(form, notifyLastFields[i], p.lastName ?? "");
    setText(form, notifyAddrFields[i], p.address ?? "");
    setText(form, notifyPcFields[i], p.postcode ?? "");
  });

  if (notify.length > 4) {
    checkBox(form, "I want to appoint another person to notify maximum is 5  use Continuation sheet 1", true);
  }

  // ── Section 7: Preferences & Instructions ────────────────────────────────
  setText(form, "Preferences  use words like prefer and would like", data.preferences ?? "");
  setText(form, "Instructions  use words like must and have to", data.instructions ?? "");

  // ── Section 9 (LP1H): Life-sustaining treatment ───────────────────────────
  if (!isFinance) {
    if (data.lifeSustainingTreatment === "give_authority") {
      checkBox(form, "I give my attorneys authority to give or refuse consent to life-sustaining treatment on my behalf", true);
    } else if (data.lifeSustainingTreatment === "do_not_give") {
      checkBox(form, "I do not give my attorneys authority to give or refuse consent to life-sustaining treatment on my behalf", true);
    }
  }

  // ── Section 10: Certificate provider ─────────────────────────────────────
  // Confirmed from visual inspection: Title_12, First names_12, Last name_12
  // Address: Address 1_13a, Address 1_13b, Address 1_13c (confirmed field list 243-245)
  // Postcode: undefined_15 (confirmed from visual inspection)
  setText(form, "Title_12", data.certProviderTitle ?? "");
  setText(form, "First names_12", data.certProviderFirstNames ?? "");
  setText(form, "Last name_12", data.certProviderLastName ?? "");
  const certAddr = (data.certProviderAddress ?? "").split(",").map(s => s.trim()).filter(Boolean);
  setText(form, "Address 1_13a", certAddr[0] ?? "");
  setText(form, "Address 1_13b", certAddr[1] ?? "");
  setText(form, "Address 1_13c", certAddr.slice(2).join(", ") ?? "");
  setText(form, "undefined_15", data.certProviderPostcode ?? "");

  // ── Section 11: Attorney / replacement attorney signature pages ───────────
  // Confirmed from visual inspection: four copies of section 11, each with:
  // Copy 1: Title_13, First names_13, Last name_13
  // Copy 2: Title_14, First names_14, Last name_14
  // Copy 3: Title_15, First names_15, Last name_15
  // Copy 4: Title_16, First names_16, Last name_16
  const allSigners = [...attorneys, ...replacements].slice(0, 4);
  const sec11TitleFields = ["Title_13", "Title_14", "Title_15", "Title_16"];
  const sec11FirstFields = ["First names_13", "First names_14", "First names_15", "First names_16"];
  const sec11LastFields  = ["Last name_13", "Last name_14", "Last name_15", "Last name_16"];

  allSigners.forEach((p, i) => {
    setText(form, sec11TitleFields[i], p.title ?? "");
    setText(form, sec11FirstFields[i], p.firstNames ?? "");
    setText(form, sec11LastFields[i], p.lastName ?? "");
  });

  // ── Section 12: The applicant ─────────────────────────────────────────────
  // Confirmed from visual inspection and field list:
  // Donor checkbox: "Donor the donor needs to sign section 15" (field 206)
  // Attorneys checkbox: "security" (field 207)
  // Applicant name blocks: Title_17/18/19/20, First names_17/18/19/20, Last name_17/18/19/20
  if (data.applicantType === "donor") {
    checkBox(form, "Donor the donor needs to sign section 15", true);
    setText(form, "Title_17", data.donorTitle ?? "");
    setText(form, "First names_17", data.donorFirstNames ?? "");
    setText(form, "Last name_17", data.donorLastName ?? "");
  } else if (data.applicantType === "attorneys") {
    checkBox(form, "security", true);
    const applicantTitles = ["Title_17", "Title_18", "Title_19", "Title_20"];
    const applicantFirsts = ["First names_17", "First names_18", "First names_19", "First names_20"];
    const applicantLasts  = ["Last name_17", "Last name_18", "Last name_19", "Last name_20"];
    attorneys.slice(0, 4).forEach((a, i) => {
      setText(form, applicantTitles[i], a.title ?? "");
      setText(form, applicantFirsts[i], a.firstNames ?? "");
      setText(form, applicantLasts[i], a.lastName ?? "");
    });
  }

  // ── Section 13: Who receives the LPA ─────────────────────────────────────
  // Confirmed from visual inspection and field list:
  // "The donor" checkbox: "Donor the donor needs to sign section 15" is already used for section 12;
  //   section 13 donor checkbox is a separate widget on a different page but same field name
  // "An attorney" checkbox: "receive the lpa" (field 263)
  // "Other" checkbox: "undefined_30" (field 157)
  // Recipient name: Title_21, First names_21, Last name_21, Company
  // Recipient address: Address 1_18a/18b/18c (confirmed field list 258-260), postcode: undefined_29
  // Contact preferences: Post (checkbox 156), Phone (text field 160), Email (checkbox 158), Welsh (checkbox 159)
  if (data.recipientType === "donor") {
    // The donor checkbox on section 13 shares the same field name as section 12 donor checkbox.
    // pdf-lib will fill both widgets when we set this field. This is correct behaviour.
    checkBox(form, "Donor the donor needs to sign section 15", true);
  } else if (data.recipientType === "attorney") {
    checkBox(form, "receive the lpa", true);
  } else if (data.recipientType === "other") {
    checkBox(form, "undefined_30", true);
    setText(form, "Title_21", data.recipientTitle ?? "");
    setText(form, "First names_21", data.recipientFirstNames ?? "");
    setText(form, "Last name_21", data.recipientLastName ?? "");
    setText(form, "Company", data.recipientCompany ?? "");
    setText(form, "Address 1_18a", data.recipientAddressLine1 ?? "");
    setText(form, "Address 1_18b", data.recipientAddressLine2 ?? "");
    setText(form, "Address 1_18c", data.recipientAddressLine3 ?? "");
    setText(form, "undefined_29", data.recipientPostcode ?? "");
  }
  // Contact preferences
  if (data.deliveryPost)  checkBox(form, "Post", true);
  if (data.deliveryPhone) setText(form, "Phone", data.feeContactPhone ?? "");
  if (data.deliveryEmail) checkBox(form, "Email", true);
  if (data.deliveryWelsh) checkBox(form, "Welsh we will write to the person in Welsh", true);

  // ── Section 14: Application fee ───────────────────────────────────────────
  // Confirmed from visual inspection and field list:
  // Card and Cheque are NOT AcroForm checkboxes — they are visual boxes that cannot be pre-filled.
  // The only fillable fields are:
  //   Phone number: "Your phone number" (field 162)
  //   Reduced fee: "I want to apply to pay a reduced fee" (field 163)
  //   Repeat application: "Im making a repeat application" (field 164)
  //   Case number: "Case number" (field 165)
  if (data.feeContactPhone) {
    setText(form, "Your phone number", data.feeContactPhone);
  }
  if (data.reducedFee) {
    checkBox(form, "I want to apply to pay a reduced fee", true);
  }
  if (data.repeatApplication) {
    checkBox(form, "Im making a repeat application", true);
    setText(form, "Case number", data.caseNumber ?? "");
  }

  // ── Save (no flatten — keep PDF editable for manual corrections) ──────────
  const filledBytes = await doc.save();
  return Buffer.from(filledBytes);
}
