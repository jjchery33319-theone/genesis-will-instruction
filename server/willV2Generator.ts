/**
 * Will V2 Generator
 * Produces an Eleanor-style Last Will & Testament HTML document from a FullMatter.
 * For Mirror Wills, call with testatorRole = "testator1" or "testator2".
 */

import type { FullMatter } from "./mattersDb";
import type { MatterClient, MatterExecutor, MatterGuardian, MatterBeneficiary, MatterWishes } from "../drizzle/schema";

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

function pronouns(name: string): { sub: string; obj: string; pos: string; ref: string } {
  // Default to neutral — in practice the form could capture gender
  return { sub: "they", obj: "them", pos: "their", ref: "the Testator" };
}

function listNames(people: Array<{ fullName?: string | null }>): string {
  const names = people.map(p => p.fullName || "_______________").filter(Boolean);
  if (names.length === 0) return "_______________";
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

function nameAndAddress(p: { fullName?: string | null; address?: string | null }): string {
  const parts = [p.fullName || "_______________"];
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

  const fileRef = matter.fileReference || "";

  // ── Clause builders ───────────────────────────────────────────────────────

  const executorClause = buildExecutorClause(primaryExecutors, substituteExecutors, name);
  const guardianClause = buildGuardianClause(primaryGuardians, substituteGuardians, primaryExecutors);
  const residueClause = buildResidueClause(
    primaryBeneficiaries,
    fallbackBeneficiaries,
    partner,
    residueToSpouseFirst,
    ageCondition,
    survivorshipDays
  );

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
    justify-content: center;
    text-align: center;
    min-height: 297mm;
  }
  .cover-logo {
    font-size: 22pt;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #1a3a5c;
    margin-bottom: 8mm;
  }
  .cover-title {
    font-size: 28pt;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #1a3a5c;
    margin-bottom: 6mm;
    line-height: 1.3;
  }
  .cover-subtitle {
    font-size: 14pt;
    color: #555;
    margin-bottom: 16mm;
  }
  .cover-name {
    font-size: 18pt;
    font-weight: 600;
    color: #1a1a1a;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 4mm 10mm;
    margin-bottom: 6mm;
  }
  .cover-ref {
    font-size: 10pt;
    color: #888;
  }
  .cover-footer {
    margin-top: auto;
    padding-top: 20mm;
    font-size: 9pt;
    color: #aaa;
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
  .clause {
    margin-bottom: 6mm;
  }
  .clause-num {
    font-weight: 600;
    display: inline;
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
    .page { margin: 0; }
  }
</style>
</head>
<body>

<!-- ══ COVER PAGE ══════════════════════════════════════════════════════════ -->
<div class="page cover">
  <div class="cover-logo">GENESIS ESTATE PLANNING</div>
  <div class="cover-title">The Last Will<br>&amp; Testament</div>
  <div class="cover-subtitle">of</div>
  <div class="cover-name">${name}</div>
  <div class="cover-ref">${fileRef ? `File Reference: ${fileRef}` : ""}</div>
  <div class="cover-footer">
    This document is strictly private and confidential.<br>
    Genesis Estate Planning Ltd &bull; England &amp; Wales
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

<!-- 3. Appointment of Guardians -->
<div class="clause">
  <h2>3. Appointment of Guardians</h2>
  ${guardianClause}
</div>

<!-- 4. Definition and Administration -->
<div class="clause">
  <h2>4. Definition and Administration of my Estate</h2>
  <p>My "Estate" shall mean all property, assets and rights to which I am beneficially entitled at the date of my death, including all property over which I have a general power of appointment or disposition by Will.</p>
  <p>My Executors and Trustees shall have the widest powers of management and administration in relation to my Estate as are set out in this Will and as are conferred by law.</p>
</div>

<!-- 5. Distribution of the Residue -->
<div class="clause">
  <h2>5. Distribution of the Residue</h2>
  ${residueClause}
</div>

<!-- 6. Conditional Gift -->
<div class="clause">
  <h2>6. Conditional Gift at Specified Age of ${ageCondition} Years</h2>
  <p>Any beneficiary who has not yet attained the age of ${ageCondition} years at the date of my death shall not be entitled to receive their share of my Estate absolutely until they attain that age. Until such time, my Trustees shall hold the share on trust for that beneficiary, with power to apply the income and capital for their maintenance, education and benefit.</p>
  <p>If any beneficiary should die before attaining the age of ${ageCondition} years, their share shall pass as if they had predeceased me.</p>
</div>

<!-- 7. Executor and Trustee Powers -->
<div class="clause">
  <h2>7. Executor and Trustee Powers</h2>
  <p>My Executors and Trustees shall have the following powers in addition to those conferred by law:</p>
  <p>(a) Power to sell, call in and convert into money all or any part of my Estate at such time and in such manner as they think fit, with power to postpone such sale, calling in and conversion for so long as they think fit without being liable for any loss.</p>
  <p>(b) Power to invest the proceeds of sale and any ready money forming part of my Estate in any investments authorised by law for the investment of trust funds.</p>
  <p>(c) Power to apply the income or capital of any share held on trust for a minor beneficiary for or towards the maintenance, education or benefit of that beneficiary.</p>
  <p>(d) Power to appropriate any part of my Estate in or towards satisfaction of any legacy or share without requiring the consent of any beneficiary.</p>
  <p>(e) Power to insure any property forming part of my Estate against any risk and to pay the premiums out of the income or capital of my Estate.</p>
</div>

<!-- 8. Survivorship -->
<div class="clause">
  <h2>8. Survivorship</h2>
  <p>Any beneficiary under this Will must survive me by a period of ${survivorshipDays} days in order to benefit under this Will. If any beneficiary fails to survive me by ${survivorshipDays} days, the gift to that beneficiary shall lapse and shall fall into the residue of my Estate to be distributed as if that beneficiary had predeceased me.</p>
</div>

<!-- 9. Organ Donation -->
<div class="clause">
  <h2>9. Organ Donation</h2>
  ${organDonation
    ? `<p>${organDonationText}</p>`
    : `<p>I do not wish to make any specific direction in relation to organ donation.</p>`
  }
</div>

<!-- 10. Funeral Wishes -->
<div class="clause">
  <h2>10. Funeral Wishes</h2>
  ${funeralWishes
    ? `<p>${funeralWishes}</p>`
    : `<p>I leave my funeral arrangements to the discretion of my Executors, having regard to any wishes I may have expressed to them during my lifetime.</p>`
  }
</div>

<!-- 11. STEP Powers -->
<div class="clause">
  <h2>11. STEP Powers</h2>
  <p>My Executors and Trustees shall have the benefit of the standard provisions of the Society of Trust and Estate Practitioners (1st Edition) as amended and updated from time to time, insofar as they are not inconsistent with the provisions of this Will.</p>
</div>

<!-- 12. For the Avoidance of Doubt -->
<div class="clause">
  <h2>12. For the Avoidance of Doubt</h2>
  <p>For the avoidance of doubt, any reference in this Will to a person's children shall include any child of that person whether legitimate, illegitimate or adopted, but shall not include any step-child unless expressly stated.</p>
  <p>Words importing the masculine gender shall include the feminine and vice versa. Words in the singular shall include the plural and vice versa.</p>
</div>

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
  Genesis Estate Planning Ltd &bull; ${name} &bull; Last Will &amp; Testament
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
      ? ` In the event that ${substitute.length === 1 ? "the above Executor is" : "both of the above Executors are"} unable or unwilling to act, I appoint <strong>${nameAndAddress(substitute[0])}</strong> as substitute Executor.`
      : ` In the event that the above Executor${primary.length > 1 ? "s are" : " is"} unable or unwilling to act, I appoint <strong>${substitute.map(nameAndAddress).join("</strong> and <strong>")}</strong> as substitute Executors.`;
  }

  return `<p>${primaryText}${substituteText}</p>`;
}

function buildGuardianClause(
  primary: MatterGuardian[],
  substitute: MatterGuardian[],
  executors: MatterExecutor[]
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

  if (primary.length === 0) {
    parts.push(`<p>I give the whole of my Estate to such of my children as survive me and attain the age of ${ageCondition} years, and if more than one in equal shares.</p>`);
  } else if (primary.length === 1) {
    const b = primary[0];
    const share = b.shareFraction ? ` (${b.shareFraction})` : "";
    parts.push(`<p>I give the whole of my Estate${share} to <strong>${b.fullName || "_______________"}</strong>${b.relationship ? `, my ${b.relationship},` : ""} absolutely, provided they survive me by ${survivorshipDays} days.</p>`);
    if (b.includeIssue) {
      parts.push(`<p>If <strong>${b.fullName || "the above beneficiary"}</strong> does not survive me by ${survivorshipDays} days, their share shall pass to their issue in equal shares per stirpes.</p>`);
    }
  } else {
    const shareText = primary.map(b => {
      const share = b.shareFraction ? ` (${b.shareFraction})` : "";
      return `<strong>${b.fullName || "_______________"}</strong>${b.relationship ? `, my ${b.relationship},` : ""}${share}`;
    }).join("; ");
    parts.push(`<p>I give the residue of my Estate to the following beneficiaries in the shares set out: ${shareText}; provided each survives me by ${survivorshipDays} days.</p>`);
    const withIssue = primary.filter(b => b.includeIssue);
    if (withIssue.length > 0) {
      parts.push(`<p>If any of the above beneficiaries does not survive me by ${survivorshipDays} days, their share shall pass to their issue in equal shares per stirpes.</p>`);
    }
  }

  if (fallback.length > 0) {
    const fallbackText = fallback.map(b => `<strong>${b.fullName || "_______________"}</strong>${b.relationship ? `, my ${b.relationship}` : ""}`).join(" and ");
    parts.push(`<p>In the event that all of the above gifts fail, I give the residue of my Estate to ${fallbackText} in equal shares absolutely.</p>`);
  } else {
    parts.push(`<p>In the event that all of the above gifts fail, the residue of my Estate shall pass in accordance with the laws of intestacy applicable in England and Wales.</p>`);
  }

  return parts.join("\n  ");
}
