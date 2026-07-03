/**
 * Will V2 Generator
 * Produces an Eleanor-style Last Will & Testament HTML document from a FullMatter.
 * For Mirror Wills, call with testatorRole = "testator1" or "testator2".
 */

import type { FullMatter } from "./mattersDb";
import type { MatterClient, MatterExecutor, MatterGuardian, MatterBeneficiary } from "../drizzle/schema";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Embed the Genesis logo as a base64 data URI so Puppeteer can render it without network calls */
function getLogoDataUri(): string {
  const candidates = [
    join(__dirname, "genesis-logo.png"),
    join(__dirname, "../server/genesis-logo.png"),
    join(process.cwd(), "server/genesis-logo.png"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      const data = readFileSync(p).toString("base64");
      return `data:image/png;base64,${data}`;
    }
  }
  // Fallback: use the deployed storage URL
  return "/manus-storage/GenesisEstatePlanningLogoUSETHISONE_ec7861e9.png";
}

const LOGO_DATA_URI = getLogoDataUri();

export type TestatorRole = "testator1" | "testator2";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso?: string | null): string {
  if (!iso) return "_______________";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function today(): string {
  const d = new Date();
  return `the ${ordinal(d.getDate())} day of ${d.toLocaleDateString("en-GB", { month: "long" })} ${d.getFullYear()}`;
}

function nameAndAddress(p: { title?: string | null; fullName?: string | null; address?: string | null }): string {
  const displayName = [p.title, p.fullName].filter(Boolean).join(" ") || "_______________";
  const parts = [displayName];
  if (p.address) parts.push(p.address);
  return parts.join(", ");
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateWillHtml(matter: FullMatter, testatorRole: TestatorRole = "testator1"): string {
  const client = matter.clients.find(c => c.clientRole === testatorRole);
  const partnerRole: TestatorRole = testatorRole === "testator1" ? "testator2" : "testator1";
  const partner = matter.matterType === "mirror" ? matter.clients.find(c => c.clientRole === partnerRole) : null;

  const name = client?.fullName || "_______________";
  const dob = formatDate(client?.dateOfBirth);
  const address = client?.address || "_______________";

  // Executors for this testator (or shared for single)
  const execRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const primaryExecutors = matter.executors.filter(e => e.clientRole === execRole && e.executorType === "primary");
  const substituteExecutors = matter.executors.filter(e => e.clientRole === execRole && e.executorType === "substitute");

  // Guardians (shared across both wills for mirror)
  const primaryGuardians = matter.guardians.filter(g => g.guardianType === "primary");
  const substituteGuardians = matter.guardians.filter(g => g.guardianType === "substitute");

  // Beneficiaries for this testator
  const benRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const primaryBeneficiaries = matter.beneficiaries.filter(b => b.clientRole === benRole && b.beneficiaryType === "primary");
  const fallbackBeneficiaries = matter.beneficiaries.filter(b => b.clientRole === benRole && b.beneficiaryType === "fallback");

  // Wishes for this testator
  const wishRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const wishes = matter.wishes.find(w => w.clientRole === wishRole) || matter.wishes[0];

  const ageCondition = wishes?.ageCondition ?? 18;
  const survivorshipDays = wishes?.survivorshipDays ?? 28;
  const organDonation = !!wishes?.organDonation;
  const organDonationText = wishes?.organDonationText || "I wish to donate my organs for medical purposes.";
  const funeralWishes = wishes?.funeralWishes || "";
  const residueToSpouseFirst = matter.matterType === "mirror" && (wishes?.residueToSpouseFirst ?? 1) === 1;
  const hasMinorChildren = (wishes as any)?.hasMinorChildren !== 0; // default true
  const disasterClauseNotes = (wishes as any)?.disasterClauseNotes || "";
  const generalNotes = (wishes as any)?.generalNotes || "";

  const fileRef = matter.fileReference || "";

  // Gifts for this testator
  const giftRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const specificGifts = (matter.gifts || []).filter(g => g.clientRole === giftRole);

  // Trust clauses for this testator (or shared)
  const trustRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const trustClauses = (matter.trustClauses || []).filter(tc =>
    tc.clientRole === trustRole && tc.enabled
  );

  // Exclusions for this testator
  const exclusionRole = testatorRole;
  const exclusions = (matter.exclusions || []).filter((e: any) => e.clientRole === exclusionRole && e.fullName?.trim());

  // Pets (shared)
  const pets = matter.pets || [];

  // Property
  const properties = matter.properties || [];

  // Business
  const businesses = matter.businesses || [];

  // ── Clause builders ───────────────────────────────────────────────────────

  const executorClause = buildExecutorClause(primaryExecutors, substituteExecutors, name);
  const guardianClause = hasMinorChildren ? buildGuardianClause(primaryGuardians, substituteGuardians) : null;
  const residueClause = buildResidueClause(
    primaryBeneficiaries,
    fallbackBeneficiaries,
    partner,
    residueToSpouseFirst,
    ageCondition,
    survivorshipDays
  );

  // Clause numbering — dynamic based on optional sections
  // If no minor children, clause 3 is skipped so numbering starts at 3 instead of 4
  let clauseNum = hasMinorChildren ? 4 : 3; // 1=Revocation, 2=Executors, [3=Guardians if applicable], then dynamic
  const clauses: string[] = [];

  // 4. Definition and Administration
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Definition and Administration of my Estate</h2>
  <p>My "Estate" shall mean all property, assets and rights to which I am beneficially entitled at the date of my death, including all property over which I have a general power of appointment or disposition by Will.</p>
  <p>My Executors and Trustees shall have the widest powers of management and administration in relation to my Estate as are set out in this Will and as are conferred by law.</p>
</div>`);

  // Property clause (if any)
  if (properties.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Property</h2>
  ${buildPropertyClause(properties)}
</div>`);
  }

  // Business interests clause (if any)
  if (businesses.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Business Interests</h2>
  ${buildBusinessClause(businesses)}
</div>`);
  }

  // Specific gifts clause (if any)
  if (specificGifts.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Specific Gifts</h2>
  ${buildGiftsClause(specificGifts)}
</div>`);
  }

  // Pets clause (if any)
  if (pets.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Provision for Pets</h2>
  ${buildPetsClause(pets)}
</div>`);
  }

  // Exclusion clause (if any) — inserted before residue
  if (exclusions.length > 0) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Exclusion of Persons from Benefit</h2>
  ${buildExclusionsClause(exclusions)}
</div>`);
  }

  // Trust Clauses (inserted before residue)
  for (const tc of trustClauses) {
    const trustHtml = buildTrustClauseHtml(tc, clauseNum);
    if (trustHtml) {
      clauses.push(`<div class="clause">${trustHtml}</div>`);
      clauseNum++;
    }
  }

  // Distribution of the Residue
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Distribution of the Residue</h2>
  ${residueClause}
</div>`);

  // Conditional Gift
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Conditional Gift at Specified Age of ${ageCondition} Years</h2>
  <p>Any beneficiary who has not yet attained the age of ${ageCondition} years at the date of my death shall not be entitled to receive their share of my Estate absolutely until they attain that age. Until such time, my Trustees shall hold the share on trust for that beneficiary, with power to apply the income and capital for their maintenance, education and benefit.</p>
  <p>If any beneficiary should die before attaining the age of ${ageCondition} years, their share shall pass as if they had predeceased me.</p>
</div>`);

  // Executor and Trustee Powers
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Executor and Trustee Powers</h2>
  <p>My Executors and Trustees shall have the following powers in addition to those conferred by law:</p>
  <p>(a) Power to sell, call in and convert into money all or any part of my Estate at such time and in such manner as they think fit, with power to postpone such sale, calling in and conversion for so long as they think fit without being liable for any loss.</p>
  <p>(b) Power to invest the proceeds of sale and any ready money forming part of my Estate in any investments authorised by law for the investment of trust funds.</p>
  <p>(c) Power to apply the income or capital of any share held on trust for a minor beneficiary for or towards the maintenance, education or benefit of that beneficiary.</p>
  <p>(d) Power to appropriate any part of my Estate in or towards satisfaction of any legacy or share without requiring the consent of any beneficiary.</p>
  <p>(e) Power to insure any property forming part of my Estate against any risk and to pay the premiums out of the income or capital of my Estate.</p>
</div>`);

  // Survivorship
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Survivorship</h2>
  <p>Any beneficiary under this Will must survive me by a period of ${survivorshipDays} days in order to benefit under this Will. If any beneficiary fails to survive me by ${survivorshipDays} days, the gift to that beneficiary shall lapse and shall fall into the residue of my Estate to be distributed as if that beneficiary had predeceased me.</p>
</div>`);

  // Disaster Clause (if notes provided)
  if (disasterClauseNotes) {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Disaster Clause</h2>
  <p>${disasterClauseNotes}</p>
</div>`);
  } else {
    clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Disaster Clause</h2>
  <p>In the event that all of my beneficiaries named in this Will predecease me or fail to survive me by the required survivorship period, the residue of my Estate shall pass in accordance with the laws of intestacy applicable in England and Wales at the date of my death.</p>
</div>`);
  }

  // Organ Donation
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Organ Donation</h2>
  ${organDonation
    ? `<p>${organDonationText}</p>`
    : `<p>I do not wish to make any specific direction in relation to organ donation.</p>`
  }
</div>`);

  // Funeral Wishes
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. Funeral Wishes</h2>
  ${funeralWishes
    ? `<p>${funeralWishes}</p>`
    : `<p>I leave my funeral arrangements to the discretion of my Executors, having regard to any wishes I may have expressed to them during my lifetime.</p>`
  }
</div>`);

  // STEP Powers
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. STEP Powers</h2>
  <p>My Executors and Trustees shall have the benefit of the standard provisions of the Society of Trust and Estate Practitioners (1st Edition) as amended and updated from time to time, insofar as they are not inconsistent with the provisions of this Will.</p>
</div>`);

  // For the Avoidance of Doubt
  clauses.push(`<div class="clause">
  <h2>${clauseNum++}. For the Avoidance of Doubt</h2>
  <p>For the avoidance of doubt, any reference in this Will to a person's children shall include any child of that person whether legitimate, illegitimate or adopted, but shall not include any step-child unless expressly stated.</p>
  <p>Words importing the masculine gender shall include the feminine and vice versa. Words in the singular shall include the plural and vice versa.</p>
</div>`);

  // General Notes (internal, shown as a note at the end if present)
  const generalNotesSection = generalNotes ? `
<div class="clause" style="border-top:2px solid #1a3a5c; margin-top:10mm; padding-top:6mm;">
  <h2>Solicitor's Notes</h2>
  <p style="font-style:italic; color:#555;">${generalNotes}</p>
</div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Last Will &amp; Testament — ${name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #1a1a1a;
    background: #fff;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 20mm 22mm 20mm 22mm;
    page-break-after: always;
  }
  .cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
    min-height: 297mm;
    padding: 20mm 22mm;
    position: relative;
    /* Double-line border: outer line via box-shadow, inner line via border */
    border: 3px solid #1a1a1a;
    box-shadow: inset 0 0 0 5px #fff, inset 0 0 0 8px #1a1a1a;
  }
  .cover-box {
    border: 1px solid #1a1a1a;
    padding: 12mm 16mm;
    margin-top: 30mm;
    margin-bottom: 0;
    width: 100%;
    max-width: 140mm;
  }
  .cover-title {
    font-size: 16pt;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #1a1a1a;
    margin-bottom: 5mm;
    line-height: 1.3;
  }
  .cover-subtitle {
    font-size: 13pt;
    color: #1a1a1a;
    margin-bottom: 5mm;
  }
  .cover-name {
    font-size: 16pt;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 5mm;
  }
  .cover-ref {
    font-size: 10pt;
    color: #555;
    font-style: italic;
  }
  .cover-company {
    margin-top: auto;
    padding-top: 20mm;
    font-size: 9.5pt;
    color: #333;
    line-height: 1.8;
    text-align: center;
  }
  .cover-logo-img {
    margin-top: 5mm;
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 160px;
  }
  h2 {
    font-size: 13pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 8mm;
    margin-bottom: 3mm;
    color: #1a3a5c;
  }
  h3 {
    font-size: 11.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 5mm;
    margin-bottom: 2mm;
    color: #1a3a5c;
  }
  .clause {
    margin-bottom: 6mm;
  }
  p {
    margin-bottom: 3mm;
    text-align: justify;
  }
  .recital {
    margin-bottom: 8mm;
    font-style: italic;
  }
  .attestation {
    margin-top: 12mm;
  }
  .sig-block {
    margin-top: 8mm;
    border-top: 1px solid #ccc;
    padding-top: 4mm;
  }
  .sig-line {
    margin-top: 10mm;
    border-bottom: 1px solid #333;
    width: 80mm;
    display: inline-block;
  }
  .sig-label {
    font-size: 9pt;
    color: #555;
    margin-top: 1mm;
  }
  .witness-block {
    margin-top: 8mm;
    padding: 4mm;
    border: 1px solid #ccc;
  }
  .witness-title {
    font-weight: 600;
    margin-bottom: 2mm;
  }
  .witness-field {
    margin-top: 5mm;
  }
  .witness-field-line {
    border-bottom: 1px solid #333;
    width: 100%;
    margin-top: 1mm;
    height: 6mm;
  }
  .witness-field-label {
    font-size: 9pt;
    color: #555;
  }
  .page-footer {
    text-align: center;
    font-size: 9pt;
    color: #888;
    margin-top: 10mm;
    border-top: 1px solid #eee;
    padding-top: 3mm;
  }
  @media print {
    /* ── Page setup ── */
    @page {
      size: A4;
      margin: 18mm 20mm 18mm 20mm;
    }
    @page :first {
      margin: 0;
    }

    /* ── Reset screen chrome ── */
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      width: 100%;
      background: #fff !important;
    }

    /* ── Page containers ── */
    .page {
      width: 100% !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      /* Each .page div = one printed page */
      break-after: page;
      page-break-after: always;
    }
    /* Don't force a blank page after the very last div */
    .page:last-child {
      break-after: avoid;
      page-break-after: avoid;
    }

    /* ── Cover page: fill the first printed page ── */
    .cover {
      min-height: 0 !important;
      height: 100vh;
      padding: 18mm 20mm !important;
      /* Preserve double-line border in print */
      border: 3pt solid #1a1a1a !important;
      box-shadow: inset 0 0 0 5pt #fff, inset 0 0 0 8pt #1a1a1a !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Keep headings with their following content ── */
    h2, h3 {
      break-after: avoid;
      page-break-after: avoid;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* ── Keep clauses together where possible ── */
    .clause {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* ── Attestation block must never split across pages ── */
    .attestation {
      break-inside: avoid;
      page-break-inside: avoid;
      break-before: auto;
      page-break-before: auto;
    }

    /* ── Witness blocks must stay together ── */
    .witness-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* ── Signature lines ── */
    .sig-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* ── Orphans / widows ── */
    p {
      orphans: 3;
      widows: 3;
    }

    /* ── Footer: keep with preceding content ── */
    .page-footer {
      break-before: avoid;
      page-break-before: avoid;
    }
  }
</style>
</head>
<body>

<!-- ══ COVER PAGE ══════════════════════════════════════════════════════════ -->
<div class="page cover">
  <div class="cover-box">
    <div class="cover-title">The Last Will &amp; Testament</div>
    <div class="cover-subtitle">of</div>
    <div class="cover-name">${name}</div>
    ${fileRef ? `<div class="cover-ref">(REFERENCE / ${fileRef})</div>` : ""}
  </div>

  <div class="cover-company">
    Genesis Wills and Estate Planning Ltd<br>
    The Business Village Innovation Way Barnsley<br>
    South Yorkshire S75 1JL<br>
    office@genesisestateplanning.info<br>
    0330 1180937<br>
    https://www.genesisestateplanning.net/
    <img
      src="${LOGO_DATA_URI}"
      alt="Genesis Estate Planning"
      class="cover-logo-img"
    />
  </div>
</div>

<!-- ══ WILL BODY ═══════════════════════════════════════════════════════════ -->
<div class="page">

<p class="recital">
  THIS IS THE LAST WILL AND TESTAMENT of me, <strong>${name}</strong>,
  ${dob !== "_______________" ? `born on <strong>${dob}</strong>,` : ""}
  of <strong>${address}</strong>,
  made this ${today()}.
</p>

<!-- 1. Revocation -->
<div class="clause">
  <h2>1. Revocation</h2>
  <p>I hereby revoke all former Wills and Testamentary dispositions previously made by me and declare this to be my Last Will and Testament.</p>
</div>

<!-- 2. Appointment of Executors -->
<div class="clause">
  <h2>2. Appointment of Executors</h2>
  ${executorClause}
</div>

${hasMinorChildren ? `
<!-- 3. Appointment of Guardians -->
<div class="clause">
  <h2>3. Appointment of Guardians</h2>
  ${guardianClause}
</div>
` : ""}

${clauses.join("\n\n")}

${generalNotesSection}

<!-- ══ ATTESTATION ══════════════════════════════════════════════════════════ -->
<div class="attestation">
  <h2>The Testimonium and Attestation</h2>
  <p>IN WITNESS whereof I have hereunto set my hand to this my Last Will and Testament on the day and year first above written.</p>

  <div class="sig-block">
    <p><strong>SIGNED</strong> by the above-named Testator <strong>${name}</strong></p>
    <p>as their Last Will in our joint presence and then by each of us in the presence of the Testator and each other:</p>
    <br>
    <div class="sig-line"></div>
    <div class="sig-label">(Signature of Testator — ${name})</div>
    <br>
    <div class="sig-line" style="width:40mm"></div>
    <div class="sig-label">(Date)</div>
  </div>

  <div style="display:flex; gap:8mm; margin-top:8mm;">
    <div class="witness-block" style="flex:1;">
      <div class="witness-title">Witness 1</div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">(Signature of Witness 1)</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Full Name (print)</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Address</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Occupation</div>
      </div>
    </div>
    <div class="witness-block" style="flex:1;">
      <div class="witness-title">Witness 2</div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">(Signature of Witness 2)</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Full Name (print)</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Address</div>
      </div>
      <div class="witness-field">
        <div class="witness-field-line"></div>
        <div class="witness-field-label">Occupation</div>
      </div>
    </div>
  </div>
</div>

<div class="page-footer">
  Genesis Wills and Estate Planning Ltd &bull; ${name} &bull; Last Will &amp; Testament
  ${fileRef ? `&bull; Ref: ${fileRef}` : ""}
</div>

</div>
</body>
</html>`;
}

// ── Clause builders ───────────────────────────────────────────────────────────

function buildExecutorClause(
  primary: MatterExecutor[],
  substitute: MatterExecutor[],
  testatorName: string
): string {
  if (primary.length === 0) {
    return `<p>I appoint _______________ of _______________ to be the Executor of this my Will.</p>`;
  }

  const primaryText = primary.length === 1
    ? `I appoint <strong>${nameAndAddress(primary[0])}</strong> to be the Executor of this my Will.`
    : `I appoint <strong>${primary.map(nameAndAddress).join("</strong> and <strong>")}</strong> to be the Executors of this my Will.`;

  let substituteText = "";
  if (substitute.length > 0) {
    substituteText = substitute.length === 1
      ? ` In the event that ${primary.length === 1 ? "the above Executor is" : "all of the above Executors are"} unable or unwilling to act, I appoint <strong>${nameAndAddress(substitute[0])}</strong> as substitute Executor.`
      : ` In the event that the above Executor${primary.length > 1 ? "s are" : " is"} unable or unwilling to act, I appoint <strong>${substitute.map(nameAndAddress).join("</strong> and <strong>")}</strong> as substitute Executors.`;
  }

  return `<p>${primaryText}${substituteText}</p>`;
}

function buildGuardianClause(
  primary: MatterGuardian[],
  substitute: MatterGuardian[]
): string {
  if (primary.length === 0) {
    return `<p>In the event that any of my children are under the age of 18 years at the date of my death, I appoint my Executor(s) as Guardian(s) of my minor children.</p>`;
  }

  const primaryText = primary.length === 1
    ? `In the event that any of my children are under the age of 18 years at the date of my death, I appoint <strong>${nameAndAddress(primary[0])}</strong> to be the Guardian of my minor children.`
    : `In the event that any of my children are under the age of 18 years at the date of my death, I appoint <strong>${primary.map(nameAndAddress).join("</strong> and <strong>")}</strong> to be the Guardians of my minor children.`;

  let substituteText = "";
  if (substitute.length > 0) {
    substituteText = ` In the event that the above Guardian${substitute.length > 1 ? "s are" : " is"} unable or unwilling to act, I appoint <strong>${substitute.map(nameAndAddress).join("</strong> and <strong>")}</strong> as substitute Guardian${substitute.length > 1 ? "s" : ""}.`;
  }

  return `<p>${primaryText}${substituteText}</p>`;
}

function buildResidueClause(
  primary: MatterBeneficiary[],
  fallback: MatterBeneficiary[],
  partner: MatterClient | null | undefined,
  residueToSpouseFirst: boolean,
  ageCondition: number,
  survivorshipDays: number
): string {
  const parts: string[] = [];

  if (residueToSpouseFirst && partner?.fullName) {
    parts.push(`<p>I give the whole of my Estate to my partner <strong>${partner.fullName}</strong> absolutely, provided they survive me by ${survivorshipDays} days.</p>`);
    parts.push(`<p>In the event that <strong>${partner.fullName}</strong> does not survive me by ${survivorshipDays} days, or in the event that the above gift fails for any reason, I direct that the residue of my Estate shall be held on trust and distributed as follows:</p>`);
  }

  function benPronoun(b: MatterBeneficiary) {
    if (b.gender === "male") return { subj: "he", poss: "his" };
    if (b.gender === "female") return { subj: "she", poss: "her" };
    return { subj: "they", poss: "their" };
  }

  if (primary.length === 0) {
    parts.push(`<p>I give the whole of my Estate to such of my children as survive me and attain the age of ${ageCondition} years, and if more than one in equal shares.</p>`);
  } else if (primary.length === 1) {
    const b = primary[0];
    const share = b.shareFraction ? ` (${b.shareFraction})` : "";
    const { subj, poss } = benPronoun(b);
    const bDisplayName = [b.title, b.fullName].filter(Boolean).join(" ") || "_______________";
    parts.push(`<p>I give the whole of my Estate${share} to <strong>${bDisplayName}</strong>${b.relationship ? `, my ${b.relationship},` : ""} absolutely, provided ${subj} survive${subj === "they" ? "" : "s"} me by ${survivorshipDays} days.</p>`);
    if (b.includeIssue) {
      parts.push(`<p>If <strong>${bDisplayName}</strong> does not survive me by ${survivorshipDays} days, ${poss} share shall pass to ${poss} issue in equal shares per stirpes.</p>`);
    }
  } else {
    const shareText = primary.map(b => {
      const share = b.shareFraction ? ` (${b.shareFraction})` : "";
      const bName = [b.title, b.fullName].filter(Boolean).join(" ") || "_______________";
      return `<strong>${bName}</strong>${b.relationship ? `, my ${b.relationship},` : ""}${share}`;
    }).join("; ");
    parts.push(`<p>I give the residue of my Estate to the following beneficiaries in the shares set out: ${shareText}; provided each survives me by ${survivorshipDays} days.</p>`);
    const withIssue = primary.filter(b => b.includeIssue);
    if (withIssue.length > 0) {
      parts.push(`<p>If any of the above beneficiaries does not survive me by ${survivorshipDays} days, their share shall pass to their issue in equal shares per stirpes.</p>`);
    }
  }

  if (fallback.length > 0) {
    const fallbackText = fallback.map(b => {
      const bName = [b.title, b.fullName].filter(Boolean).join(" ") || "_______________";
      return `<strong>${bName}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`;
    }).join(" and ");
    parts.push(`<p>In the event that all of the above gifts fail, I give the residue of my Estate to ${fallbackText} in equal shares absolutely.</p>`);
  } else {
    parts.push(`<p>In the event that all of the above gifts fail, the residue of my Estate shall pass in accordance with the laws of intestacy applicable in England and Wales.</p>`);
  }

  return parts.join("\n  ");
}

// ── Trust Clause HTML builder ─────────────────────────────────────────────────

function trusteeNames(trustees?: Array<{ name: string; address: string }> | null): string {
  if (!trustees || trustees.length === 0) return "my Executors";
  return trustees.map(t => `<strong>${t.name}</strong>${t.address ? ` of ${t.address}` : ""}`).join(" and ");
}

/** Build the dynamic termination clause for PPT based on selected triggers */
function buildTerminationClause(tc: { terminateDeath?: number | null; terminateRemarriage?: number | null; terminateCohabitation?: number | null }): string {
  const triggers: string[] = [];
  if ((tc.terminateDeath ?? 1) === 1) triggers.push("upon the death of the Life Tenant");
  if ((tc.terminateRemarriage ?? 1) === 1) triggers.push("upon the Life Tenant remarrying or entering into a new civil partnership");
  if ((tc.terminateCohabitation ?? 1) === 1) triggers.push("upon the Life Tenant ceasing to permanently reside in the Property");

  if (triggers.length === 0) {
    // Fallback — should never happen if at least one is checked
    return "The Trust Period shall terminate upon the death of the Life Tenant.";
  }
  if (triggers.length === 1) {
    return `The Trust Period shall terminate ${triggers[0]}.`;
  }
  // 2 or 3 triggers — join with ", or " and append "whichever shall first occur"
  const joined = triggers.slice(0, -1).join(", or ") + ", or " + triggers[triggers.length - 1];
  return `The Trust Period shall terminate ${joined}, whichever shall first occur.`;
}

function buildTrustClauseHtml(tc: { trustType: string; trustees?: Array<{ name: string; address: string }> | null; lifeTenants?: Array<{ name: string; address: string }> | null; beneficiaries?: Array<{ name: string; relationship: string }> | null; propertyAddress?: string | null; sharePercentage?: string | null; namedBeneficiary?: string | null; namedBeneficiaryDisability?: string | null; ageVesting?: number | null; notes?: string | null; terminateDeath?: number | null; terminateRemarriage?: number | null; terminateCohabitation?: number | null }, num: number): string {
  const trNames = trusteeNames(tc.trustees);
  const notes = tc.notes ? `<p>${tc.notes}</p>` : "";

  switch (tc.trustType) {
    case "ppt": {
      const property = tc.propertyAddress || "my principal residence";
      const ltName = tc.lifeTenants && tc.lifeTenants.length > 0
        ? tc.lifeTenants.map(lt => `<strong>${lt.name}</strong>`).join(" and ")
        : "my surviving spouse or civil partner";
      const remaindermen = tc.beneficiaries && tc.beneficiaries.length > 0
        ? tc.beneficiaries.map(b => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(" and ")
        : "my Residuary Beneficiaries";
      return `
  <h2>${num}. LIFE INTEREST TRUST COMPONENT</h2>

  <h3>${num}.1 DEFINITIONS</h3>
  <p>"The Property" shall mean my property known as <strong>${property}</strong> or any other property which I may own at the date of my death and use as my principal private residence.</p>
  <p>"The Life Tenant" shall mean ${ltName}.</p>
  <p>"The Remaindermen" shall mean ${remaindermen}.</p>
  <p>"The Trust Fund" shall mean the Property together with any cash or replacement property held under the terms of this Trust.</p>

  <h3>${num}.2 GIFT OF LIFE INTEREST</h3>
  <p>I give my interest in the Property to my Trustees upon trust to permit the Life Tenant to reside personally in the Property for as long as they desire during the Trust Period.</p>

  <h3>${num}.3 CONDITIONS OF OCCUPANCY</h3>
  <p>During the Trust Period, the Life Tenant shall be responsible for:</p>
  <p>(a) Keeping the Property in good repair and decorative condition;</p>
  <p>(b) Keeping the Property fully insured to its full reinstatement value against comprehensive risks to the satisfaction of my Trustees;</p>
  <p>(c) Paying all rates, taxes, utilities, council tax, and other outgoings relating to the Property.</p>

  <h3>${num}.4 TERMINATION OF THE TRUST</h3>
  <p>${buildTerminationClause(tc)}</p>

  <h3>${num}.5 POWER OF SALE AND REINVESTMENT</h3>
  <p>My Trustees shall have the power, with the written consent of the Life Tenant during their lifetime, to sell the Property and apply all or part of the net proceeds toward the purchase of a replacement property (which shall be held on the same trusts as herein declared). Any surplus proceeds not used for a replacement property shall be invested to generate an income, which shall be paid to the Life Tenant for the remainder of the Trust Period.</p>

  <h3>${num}.6 ULTIMATE GIFT (ON TERMINATION)</h3>
  <p>Upon the termination of the Trust Period, my Trustees shall hold the Trust Fund (including the Property or any replacement assets) absolutely for The Remaindermen, and if more than one in equal shares.</p>
  ${notes}`;
    }

    case "discretionary": {
      const benClass = tc.beneficiaries && tc.beneficiaries.length > 0
        ? tc.beneficiaries.map(b => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(", ")
        : "my children and remoter issue and such other persons as my Trustees shall in their absolute discretion determine";
      return `
  <h2>${num}. Discretionary Trust</h2>
  <p>(a) The Trustees of this Discretionary Trust shall be ${trNames} or such other persons as shall be appointed as trustees hereof from time to time.</p>
  <p>(b) The Beneficiaries of this Discretionary Trust shall be ${benClass}.</p>
  <p>(c) My Trustees shall hold the trust fund upon trust to pay or apply the income and/or capital thereof to or for the benefit of all or any one or more of the Beneficiaries in such shares and proportions and in such manner as my Trustees shall in their absolute discretion think fit.</p>
  <p>(d) My Trustees shall have the widest possible powers of investment as if they were absolute beneficial owners of the trust fund and shall not be restricted to investments authorised by law for trustees.</p>
  <p>(e) This Discretionary Trust shall terminate on the expiry of the period of 125 years from the date of my death (which period shall be the perpetuity period applicable to this trust) and upon such termination the trust fund shall be held for such of the Beneficiaries as are then living in equal shares absolutely.</p>
  ${notes}`;
    }

    case "vulnerable": {
      const vbName = tc.namedBeneficiary || "[Vulnerable Beneficiary Name]";
      const disability = tc.namedBeneficiaryDisability ? `<p>The Vulnerable Beneficiary has the following disability or condition: ${tc.namedBeneficiaryDisability}.</p>` : "";
      const ultBens = tc.beneficiaries && tc.beneficiaries.length > 0
        ? tc.beneficiaries.map(b => `<strong>${b.name}</strong>`).join(" and ")
        : "my children and remoter issue as shall then be living in equal shares absolutely";
      return `
  <h2>${num}. Vulnerable Person's Trust (Finance Act 2005)</h2>
  <p>I DECLARE that the following provisions shall apply to the Vulnerable Person's Trust created by this my Will for the benefit of <strong>${vbName}</strong> (hereinafter referred to as "the Vulnerable Beneficiary"):</p>
  ${disability}
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) This trust is intended to qualify as a Vulnerable Beneficiary Trust within the meaning of the Finance Act 2005 and my Trustees shall use their best endeavours to ensure that the trust continues to qualify as such.</p>
  <p>(c) My Trustees shall hold the trust fund upon trust to apply the income and capital thereof for the benefit of the Vulnerable Beneficiary during their lifetime in such manner as my Trustees in their absolute discretion think fit having regard to the needs and welfare of the Vulnerable Beneficiary.</p>
  <p>(d) Subject to the life interest of the Vulnerable Beneficiary, the trust fund shall on the death of the Vulnerable Beneficiary be held for ${ultBens}.</p>
  <p>(e) My Trustees shall have power to apply capital for the benefit of the Vulnerable Beneficiary at any time and from time to time as they in their absolute discretion think fit.</p>
  ${notes}`;
    }

    case "nrb": {
      const bens = tc.beneficiaries && tc.beneficiaries.length > 0
        ? tc.beneficiaries.map(b => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(" and ")
        : "my children and remoter issue in equal shares absolutely";
      return `
  <h2>${num}. Nil-Rate Band Discretionary Trust</h2>
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) I GIVE to my Trustees such sum as equals my available nil-rate band for inheritance tax purposes at the date of my death (the "NRB Sum") to hold upon the trusts hereinafter declared.</p>
  <p>(c) My Trustees shall hold the NRB Sum upon trust for ${bens}.</p>
  <p>(d) My Trustees shall have the widest possible powers of investment and management as if they were absolute beneficial owners of the trust fund.</p>
  <p>(e) This trust shall terminate on the expiry of 125 years from the date of my death and upon such termination the trust fund shall be distributed to such of the Beneficiaries as are then living in equal shares absolutely.</p>
  ${notes}`;
    }

    case "rnrb": {
      const property = tc.propertyAddress || "my principal residence";
      const bens = tc.beneficiaries && tc.beneficiaries.length > 0
        ? tc.beneficiaries.map(b => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(" and ")
        : "my lineal descendants";
      return `
  <h2>${num}. Residential Nil-Rate Band (RNRB)</h2>
  <p>I direct that my Executors and Trustees shall use their best endeavours to ensure that the Residential Nil-Rate Band (as defined in section 8D of the Inheritance Tax Act 1984) is claimed in respect of my Estate.</p>
  <p>For the purposes of qualifying for the Residential Nil-Rate Band, I give my interest in the property known as <strong>${property}</strong> to ${bens} absolutely, or if that property has been sold prior to my death, to such replacement residential property as I may own at the date of my death.</p>
  <p>My Executors shall take all steps necessary to claim any transferable Residential Nil-Rate Band that may be available from my deceased spouse or civil partner's estate.</p>
  ${notes}`;
    }

    case "bereaved_minor": {
      const bName = tc.namedBeneficiary || "[Beneficiary Name]";
      const age = tc.ageVesting ?? 18;
      return `
  <h2>${num}. Bereaved Minor's Trust (s.71A IHTA 1984)</h2>
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) This trust is intended to qualify as a Bereaved Minor's Trust within the meaning of section 71A of the Inheritance Tax Act 1984.</p>
  <p>(c) My Trustees shall hold the trust fund upon trust to accumulate the income thereof until <strong>${bName}</strong> ("the Beneficiary") attains the age of ${age} years and thereafter to pay the income to the Beneficiary.</p>
  <p>(d) Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.</p>
  <p>(e) If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.</p>
  ${notes}`;
    }

    case "age18to25": {
      const bName = tc.namedBeneficiary || "[Beneficiary Name]";
      const age = tc.ageVesting ?? 25;
      return `
  <h2>${num}. 18-to-25 Trust (s.71D IHTA 1984)</h2>
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) This trust is intended to qualify as an 18-to-25 trust within the meaning of section 71D of the Inheritance Tax Act 1984.</p>
  <p>(c) My Trustees shall hold the trust fund upon trust to accumulate the income thereof until <strong>${bName}</strong> ("the Beneficiary") attains the age of 18 years and thereafter to pay the income to the Beneficiary until the Beneficiary attains the age of ${age} years.</p>
  <p>(d) Upon the Beneficiary attaining the age of ${age} years the Trustees shall hold the trust fund upon trust for the Beneficiary absolutely.</p>
  <p>(e) If the Beneficiary shall die before attaining the age of ${age} years the trust fund shall fall into and form part of my Residuary Estate.</p>
  ${notes}`;
    }

    case "bpr": {
      const bizName = tc.propertyAddress || "my business interests";
      const bens = tc.beneficiaries && tc.beneficiaries.length > 0
        ? tc.beneficiaries.map(b => `<strong>${b.name}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(" and ")
        : "my children and remoter issue in equal shares absolutely";
      return `
  <h2>${num}. Business Property Relief Trust</h2>
  <p>(a) The Trustees of this trust shall be ${trNames}.</p>
  <p>(b) I GIVE my business interests known as <strong>${bizName}</strong> to my Trustees to hold upon the trusts hereinafter declared, it being my intention that the Business Assets shall qualify for Business Property Relief pursuant to Chapter I of Part V of the Inheritance Tax Act 1984.</p>
  <p>(c) My Trustees shall hold the Business Assets upon trust for ${bens}.</p>
  <p>(d) My Trustees shall have the widest possible powers to manage, invest, realise, and deal with the Business Assets as if they were absolute beneficial owners thereof.</p>
  <p>(e) My Trustees shall use their best endeavours to ensure that the Business Assets continue to qualify for Business Property Relief and shall not take any action that would jeopardise such qualification without first obtaining appropriate professional advice.</p>
  ${notes}`;
    }

    default:
      return "";
  }
}

function buildGiftsClause(gifts: FullMatter["gifts"]): string {
  if (gifts.length === 0) return "";
  const items = gifts.map(g => {
    const recipient = g.recipientName ? `<strong>${g.recipientName}</strong>${g.recipientAddress ? ` of ${g.recipientAddress}` : ""}` : "_______________";
    const description = g.giftDescription || "_______________";
    if (g.giftType === "monetary") {
      return `<p>I give the sum of ${description} to ${recipient} absolutely, provided they survive me.</p>`;
    }
    return `<p>I give ${description} to ${recipient} absolutely, provided they survive me.</p>`;
  });
  return items.join("\n  ");
}

function buildPetsClause(pets: FullMatter["pets"]): string {
  if (pets.length === 0) return "";
  const items = pets.map(p => {
    const petDesc = [p.petName, p.petType].filter(Boolean).join(" the ") || "my pet";
    const carer = p.carerName ? `<strong>${p.carerName}</strong>${p.carerAddress ? ` of ${p.carerAddress}` : ""}` : "my Executors";
    const notes = p.careNotes ? ` ${p.careNotes}` : "";
    return `<p>I request that ${carer} take care of ${petDesc} and I ask that my Executors make such reasonable financial provision for their care as they see fit.${notes}</p>`;
  });
  return items.join("\n  ");
}

function buildPropertyClause(properties: FullMatter["properties"]): string {
  if (properties.length === 0) return "";
  const items = properties.map(p => {
    const addr = p.address || "_______________";
    const ownership = p.ownershipType === "joint_tenants"
      ? "held as joint tenants"
      : p.ownershipType === "tenants_in_common"
      ? "held as tenants in common"
      : "held in my sole name";
    const mortgage = p.mortgageOutstanding
      ? ` There is an outstanding mortgage with ${p.mortgageLender || "the mortgage lender"} which my Executors shall discharge from my Estate.`
      : "";
    const notes = p.propertyNotes ? ` ${p.propertyNotes}` : "";
    return `<p>The property at <strong>${addr}</strong> is ${ownership}.${mortgage}${notes}</p>`;
  });

  const hasTIC = properties.some(p => p.ownershipType === "tenants_in_common");
  const ticNote = hasTIC ? `<p>Where any property is held as tenants in common, my share in that property shall form part of my Estate and shall pass in accordance with the terms of this Will.</p>` : "";

  return items.join("\n  ") + (ticNote ? "\n  " + ticNote : "");
}

function buildBusinessClause(businesses: FullMatter["businesses"]): string {
  if (businesses.length === 0) return "";
  const items = businesses.map(b => {
    const bizName = b.businessName ? `<strong>${b.businessName}</strong>` : "my business interest";
    const bizType = b.businessType ? ` (${b.businessType})` : "";
    const share = b.sharePercentage ? `, representing approximately ${b.sharePercentage} of the issued share capital,` : "";
    const notes = b.businessNotes ? ` ${b.businessNotes}` : "";
    return `<p>My interest in ${bizName}${bizType}${share} shall form part of my Estate. My Executors shall have full power to deal with, sell, or continue my business interests as they consider appropriate in the best interests of my Estate and beneficiaries.${notes}</p>`;
  });

  return items.join("\n  ") + `\n  <p>For the avoidance of doubt, my Executors shall be entitled to claim Business Property Relief where applicable in accordance with the Inheritance Tax Act 1984.</p>`;
}

function buildExclusionsClause(exclusions: Array<{ fullName: string; relationship?: string | null; reasonPreset?: string | null; reasonCustom?: string | null }>): string {
  const items = exclusions.map(e => {
    const name = `<strong>${e.fullName}</strong>`;
    const rel = e.relationship ? `, my ${e.relationship},` : "";
    return `<p>I have intentionally made no provision in this my Will for ${name}${rel} and I do not wish for them to inherit any part of my estate, whether under this Will or on an intestacy. I have reached this decision after careful consideration, and it is my express wish that they receive no benefit from my estate.</p>`;
  });
  return items.join("\n  ");
}
