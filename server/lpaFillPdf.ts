/**
 * lpaFillPdf.ts
 * Pure Node.js LPA PDF filler using pdf-lib.
 * Works in both dev (sandbox) and production (Cloud Run Node-only).
 */
import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export interface LpaData {
  lpaType: "property_finance" | "health_welfare" | string;
  donorTitle?: string;
  donorFirstNames?: string;
  donorLastName?: string;
  donorOtherNames?: string;
  donorDob?: string; // "DD/MM/YYYY"
  donorAddress?: string;
  donorPostcode?: string;
  donorEmail?: string;
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
  replacementAttorneys?: Array<{
    title?: string;
    firstNames?: string;
    lastName?: string;
    dob?: string;
    address?: string;
    postcode?: string;
    email?: string;
  }>;
  attorneyDecisionType?: string;
  preferences?: string;
  instructions?: string;
  certProviderTitle?: string;
  certProviderFirstNames?: string;
  certProviderLastName?: string;
  certProviderAddress?: string;
  certProviderPostcode?: string;
  certProviderEmail?: string;
  peopleToNotify?: Array<{
    title?: string;
    firstNames?: string;
    lastName?: string;
    address?: string;
    postcode?: string;
  }>;
  whenAttorneysCanAct?: string;
  lifeSustainingTreatment?: string;
}

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
    const field = form.getTextField(name);
    field.setText(value ?? "");
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

/**
 * Fill an LPA PDF template with the provided data.
 * Returns the filled PDF as a Buffer.
 */
export async function fillLpaPdf(data: LpaData): Promise<Buffer> {
  const isFinance = data.lpaType === "property_finance";
  const templateName = isFinance ? "lpa-lp1f.pdf" : "lpa-lp1h.pdf";

  // Load template — try local file first (dev), then storage URL (production)
  let pdfBytes: Uint8Array;
  // Use import.meta.dirname (ESM-safe) or fall back to process.cwd()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metaAny = import.meta as any;
  const serverDir = typeof metaAny.dirname === "string"
    ? metaAny.dirname as string
    : path.join(process.cwd(), "server");
  const localPath = path.join(serverDir, templateName);
  if (fs.existsSync(localPath)) {
    pdfBytes = fs.readFileSync(localPath);
  } else {
    // Fallback: fetch from manus-storage (production) — must follow redirects
    const storageUrl = isFinance
      ? "/manus-storage/lpa-lp1f_3d2a3de9.pdf"
      : "/manus-storage/lpa-lp1h_b2d46e3d.pdf";
    const baseUrl = process.env.INTERNAL_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
    // node-fetch follows redirects by default (redirect: "follow")
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
  setText(form, "Email address optional", data.donorEmail ?? "");

  // ── Section 2: Attorneys (up to 4) ───────────────────────────────────────
  const attorneys = data.attorneys ?? [];

  // Attorney 1 (fields _2 / _3 are the two-column layout for attorney 1 & 2 on same page)
  if (attorneys[0]) {
    const a = attorneys[0];
    const dob = parseDob(a.dob);
    setText(form, "Title_2", a.title ?? "");
    setText(form, "First names_2", a.firstNames ?? "");
    setText(form, "Last name_2", a.lastName ?? "");
    setText(form, "Day_3", dob.day);
    setText(form, "Month_3", dob.month);
    setText(form, "Year_3", dob.year);
    setText(form, "Address 1_3", a.address ?? "");
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
    setText(form, "undefined_5", a.postcode ?? "");
    setText(form, "Email address optional_5", a.email ?? "");
  }

  if (attorneys.length > 4) {
    checkBox(form, "More attorneys  I want to appoint more than 4 attorneys Use Continuation sheet 1", true);
  }

  // ── Section 3: How attorneys make decisions ───────────────────────────────
  if (data.attorneyDecisionType === "jointly_severally") {
    checkBox(form, "Jointly and severally", true);
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
  const notifyTitleFields = ["Title_8","Title_9","Title_10","Title_11","Title_12"];
  const notifyFirstFields = ["First names_8","First names_9","First names_10","First names_11","First names_12"];
  const notifyLastFields = ["Last name_8","Last name_9","Last name_10","Last name_11","Last name_12"];
  const notifyAddrFields = ["undefined_8","undefined_9","undefined_10","undefined_11","undefined_15"];
  const notifyPcFields = ["undefined_8","undefined_9","undefined_10","undefined_11","undefined_14"];

  notify.slice(0, 5).forEach((p, i) => {
    setText(form, notifyTitleFields[i], p.title ?? "");
    setText(form, notifyFirstFields[i], p.firstNames ?? "");
    setText(form, notifyLastFields[i], p.lastName ?? "");
    setText(form, notifyAddrFields[i], p.address ?? "");
  });

  if (notify.length > 5) {
    checkBox(form, "I want to appoint another person to notify maximum is 5  use Continuation sheet 1", true);
  }

  // ── Section 7: Preferences & Instructions ────────────────────────────────
  setText(form, "Preferences  use words like prefer and would like", data.preferences ?? "");
  setText(form, "Instructions  use words like must and have to", data.instructions ?? "");

  // ── Section 10: Certificate provider ─────────────────────────────────────
  setText(form, "Title_12", data.certProviderTitle ?? "");
  setText(form, "First names_12", data.certProviderFirstNames ?? "");
  setText(form, "Last name_12", data.certProviderLastName ?? "");
  // cert provider address goes into the address block fields
  setText(form, "Address 1a", data.certProviderAddress ?? "");
  setText(form, "Postcode", data.certProviderPostcode ?? "");

  // Flatten form to prevent further editing (makes it look cleaner)
  try {
    form.flatten();
  } catch {
    // Some PDFs resist flattening — leave editable in that case
  }

  const filledBytes = await doc.save();
  return Buffer.from(filledBytes);
}
