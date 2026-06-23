/**
 * lpaFillPdf.ts
 * Pure Node.js LPA PDF filler using pdf-lib.
 * Works in both dev (sandbox) and production (Cloud Run Node-only).
 *
 * Field mapping verified against the official LP1F and LP1H AcroForm field names
 * by visual inspection of a debug PDF with every field filled with its own name.
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

/**
 * Split a free-text address into up to 3 lines.
 * Tries to split on commas first; falls back to 60-char word-wrap.
 */
function splitAddress(address?: string): [string, string, string] {
  if (!address) return ["", "", ""];
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return [parts[0], parts[1], parts.slice(2).join(", ")];
  }
  if (parts.length === 2) {
    return [parts[0], parts[1], ""];
  }
  // Single-line: word-wrap at 60 chars
  const line = address.trim();
  if (line.length <= 60) return [line, "", ""];
  const cut = line.lastIndexOf(" ", 60);
  const a = cut > 0 ? line.slice(0, cut) : line.slice(0, 60);
  const rest = cut > 0 ? line.slice(cut + 1) : line.slice(60);
  if (rest.length <= 60) return [a, rest, ""];
  const cut2 = rest.lastIndexOf(" ", 60);
  const b = cut2 > 0 ? rest.slice(0, cut2) : rest.slice(0, 60);
  const c = cut2 > 0 ? rest.slice(cut2 + 1) : rest.slice(60);
  return [a, b, c.slice(0, 60)];
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
  setText(form, "Title", data.donorTitle ?? "");
  setText(form, "First names", data.donorFirstNames ?? "");
  setText(form, "Last name", data.donorLastName ?? "");
  setText(form, "Any other names youre known by optional  eg your married name", data.donorOtherNames ?? "");
  const donorDob = parseDob(data.donorDob);
  setText(form, "Day", donorDob.day);
  setText(form, "Month", donorDob.month);
  setText(form, "Year", donorDob.year);
  // Donor address — three separate lines
  const [da1, da2, da3] = splitAddress(data.donorAddress);
  setText(form, "Address 1_2", da1);
  setText(form, "Address 1_2b", da2);
  setText(form, "Address 1_2c", da3);
  setText(form, "Postcode", data.donorPostcode ?? "");
  setText(form, "Email address optional", data.donorEmail ?? "");

  // ── Section 2: Attorneys (up to 4) ───────────────────────────────────────
  const attorneys = data.attorneys ?? [];

  // Attorney 1
  if (attorneys[0]) {
    const a = attorneys[0];
    const dob = parseDob(a.dob);
    setText(form, "Title_2", a.title ?? "");
    setText(form, "First names_2", a.firstNames ?? "");
    setText(form, "Last name_2", a.lastName ?? "");
    setText(form, "Day_3", dob.day);
    setText(form, "Month_3", dob.month);
    setText(form, "Year_3", dob.year);
    const [l1, l2, l3] = splitAddress(a.address);
    setText(form, "Address 1_3", l1);
    setText(form, "Address 1_3b", l2);
    setText(form, "Address 1_3c", l3);
    setText(form, "undefined_2", a.postcode ?? "");
    setText(form, "Email address optional_2", a.email ?? "");
    if (a.isTrustCorporation) checkBox(form, "This attorney is a trust corporation", true);
  }

  // Attorney 2
  if (attorneys[1]) {
    const a = attorneys[1];
    const dob = parseDob(a.dob);
    setText(form, "Title_3", a.title ?? "");
    setText(form, "First names_3", a.firstNames ?? "");
    setText(form, "Last name_3", a.lastName ?? "");
    setText(form, "Day_4", dob.day);
    setText(form, "Month_4", dob.month);
    setText(form, "Year_4", dob.year);
    const [l1, l2, l3] = splitAddress(a.address);
    setText(form, "Address 1_4a", l1);
    setText(form, "Address 1_4b", l2);
    setText(form, "Address 1_4c", l3);
    setText(form, "undefined_3", a.postcode ?? "");
    setText(form, "Email address optional_3", a.email ?? "");
  }

  // Attorney 3
  if (attorneys[2]) {
    const a = attorneys[2];
    const dob = parseDob(a.dob);
    setText(form, "Title_4", a.title ?? "");
    setText(form, "First names_4", a.firstNames ?? "");
    setText(form, "Last name_4", a.lastName ?? "");
    setText(form, "Day_5", dob.day);
    setText(form, "Month_5", dob.month);
    setText(form, "Year_5", dob.year);
    const [l1, l2, l3] = splitAddress(a.address);
    setText(form, "Address 1_5a", l1);
    setText(form, "Address 1_5b", l2);
    setText(form, "Address 1_5c", l3);
    setText(form, "undefined_4", a.postcode ?? "");
    setText(form, "Email address optional_4", a.email ?? "");
  }

  // Attorney 4
  if (attorneys[3]) {
    const a = attorneys[3];
    const dob = parseDob(a.dob);
    setText(form, "Title_5", a.title ?? "");
    setText(form, "First names_5", a.firstNames ?? "");
    setText(form, "Last name_5", a.lastName ?? "");
    setText(form, "Day_6", dob.day);
    setText(form, "Month_6", dob.month);
    setText(form, "Year_6", dob.year);
    const [l1, l2, l3] = splitAddress(a.address);
    setText(form, "Address 1_6a", l1);
    setText(form, "Address 1_6b", l2);
    setText(form, "Address 1_6c", l3);
    setText(form, "undefined_5", a.postcode ?? "");
    setText(form, "Email address optional_5", a.email ?? "");
  }

  if (attorneys.length > 4) {
    checkBox(form, "More attorneys  I want to appoint more than 4 attorneys Use Continuation sheet 1", true);
  }

  // ── Section 3: How attorneys make decisions ───────────────────────────────
  if (data.attorneyDecisionType === "jointly_severally") {
    checkBox(form, "Jointly and severally", true);
  } else if (data.attorneyDecisionType === "jointly") {
    checkBox(form, "Jointly", true);
  } else if (data.attorneyDecisionType === "jointly_some") {
    checkBox(form, "Jointly for some decisions and jointly and severally for other decisions", true);
    setText(form, "Details", data.attorneyDecisionDetails ?? "");
  }

  // ── Section 4: Replacement attorneys (up to 2) ───────────────────────────
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
    const [l1, l2, l3] = splitAddress(r.address);
    setText(form, "Address 1_7a", l1);
    setText(form, "Address 1_7b", l2);
    setText(form, "Address 1_7c", l3);
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
    const [l1, l2, l3] = splitAddress(r.address);
    setText(form, "Address 1_8a", l1);
    setText(form, "Address 1_8b", l2);
    setText(form, "Address 1_8c", l3);
    setText(form, "undefined_7", r.postcode ?? "");
  }

  if (replacements.length > 2) {
    checkBox(form, "More replacements   I want to appoint more than two replacements Use Continuation sheet 1", true);
  }

  // ── Section 5: When attorneys can act (LP1F only) ─────────────────────────
  if (isFinance && data.whenAttorneysCanAct === "whenever") {
    checkBox(form, "As soon as my LPA has been registered", true);
  }

  // ── Section 6: People to notify (up to 5) ────────────────────────────────
  const notify = data.peopleToNotify ?? [];
  // Notify person name fields (Title_8 through Title_12 are used for notify persons 1-5)
  const notifyTitleFields  = ["Title_8", "Title_9", "Title_10", "Title_11", "Title_12"];
  const notifyFirstFields  = ["First names_8", "First names_9", "First names_10", "First names_11", "First names_12"];
  const notifyLastFields   = ["Last name_8", "Last name_9", "Last name_10", "Last name_11", "Last name_12"];
  // Notify person address fields — each person has a single address text field
  const notifyAddrFields   = ["undefined_8", "undefined_9", "undefined_10", "undefined_11", "undefined_15"];
  const notifyPcFields     = ["undefined_12", "undefined_13", "undefined_14", "undefined_16", "undefined_17"];

  notify.slice(0, 5).forEach((p, i) => {
    setText(form, notifyTitleFields[i], p.title ?? "");
    setText(form, notifyFirstFields[i], p.firstNames ?? "");
    setText(form, notifyLastFields[i], p.lastName ?? "");
    setText(form, notifyAddrFields[i], p.address ?? "");
    setText(form, notifyPcFields[i], p.postcode ?? "");
  });

  if (notify.length > 5) {
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
  // Note: Title_12 is also used for notify person 5 — the cert provider uses Title_12 on a different page
  setText(form, "Title_12", data.certProviderTitle ?? "");
  setText(form, "First names_12", data.certProviderFirstNames ?? "");
  setText(form, "Last name_12", data.certProviderLastName ?? "");
  const [ca1, ca2, ca3] = splitAddress(data.certProviderAddress);
  setText(form, "Address 1_9a", ca1);
  setText(form, "Address 1_9b", ca2);
  setText(form, "Address 1_9c", ca3);
  setText(form, "undefined_18", data.certProviderPostcode ?? "");

  // ── Section 11: Attorney / replacement attorney signature pages ───────────
  // The PDF has 4 repeated copies of section 11 (one per attorney).
  // We fill in the attorney name fields for each copy so the attorney knows which copy to sign.
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
  // Tick whether the donor or the attorneys are applying to register.
  if (data.applicantType === "donor") {
    checkBox(form, "Donor", true);
    // Pre-fill applicant name from donor
    setText(form, "Title_17", data.donorTitle ?? "");
    setText(form, "First names_17", data.donorFirstNames ?? "");
    setText(form, "Last name_17", data.donorLastName ?? "");
  } else if (data.applicantType === "attorneys") {
    checkBox(form, "Attorneys", true);
    // Pre-fill up to 4 attorney names as applicants
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
  if (data.recipientType === "donor") {
    checkBox(form, "The donor", true);
  } else if (data.recipientType === "attorney") {
    checkBox(form, "An attorney", true);
  } else if (data.recipientType === "other") {
    checkBox(form, "Other", true);
    setText(form, "Title_21", data.recipientTitle ?? "");
    setText(form, "First names_21", data.recipientFirstNames ?? "");
    setText(form, "Last name_21", data.recipientLastName ?? "");
    setText(form, "Company", data.recipientCompany ?? "");
    setText(form, "Address 1_18a", data.recipientAddressLine1 ?? "");
    setText(form, "Address 1_18b", data.recipientAddressLine2 ?? "");
    setText(form, "Address 1_18c", data.recipientAddressLine3 ?? "");
    setText(form, "undefined_29", data.recipientPostcode ?? "");
  }
  // Contact preferences for the recipient
  if (data.deliveryPost)  checkBox(form, "Post", true);
  if (data.deliveryPhone) checkBox(form, "Phone", true);
  if (data.deliveryEmail) checkBox(form, "Email", true);
  if (data.deliveryWelsh) checkBox(form, "Welsh", true);

  // ── Section 14: Application fee ───────────────────────────────────────────
  if (data.feePaymentMethod === "card") {
    checkBox(form, "Card", true);
    setText(form, "Your phone number", data.feeContactPhone ?? "");
  } else if (data.feePaymentMethod === "cheque") {
    checkBox(form, "Cheque", true);
  }
  if (data.reducedFee) {
    checkBox(form, "I want to apply to pay a reduced fee", true);
  }
  if (data.repeatApplication) {
    checkBox(form, "Im making a repeat application", true);
    setText(form, "Case number", data.caseNumber ?? "");
  }

  // Flatten form to prevent further editing (makes it look cleaner)
  try {
    form.flatten();
  } catch {
    // Some PDFs resist flattening — leave editable in that case
  }

  const filledBytes = await doc.save();
  return Buffer.from(filledBytes);
}
