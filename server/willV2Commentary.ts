/**
 * Will V2 Commentary Generator
 * Produces an Eleanor-style Will Commentary HTML document from a FullMatter.
 */

import type { FullMatter } from "./mattersDb";
import type { MatterClient, MatterExecutor, MatterGuardian, MatterBeneficiary, MatterWishes } from "../drizzle/schema";
import type { TestatorRole } from "./willV2Generator";

function nameAndAddress(p: { fullName?: string | null; address?: string | null }): string {
  const parts = [p.fullName || "_______________"];
  if (p.address) parts.push(p.address);
  return parts.join(", ");
}

export function generateCommentaryHtml(matter: FullMatter, testatorRole: TestatorRole = "testator1"): string {
  const client = matter.clients.find(c => c.clientRole === testatorRole);
  const partnerRole: TestatorRole = testatorRole === "testator1" ? "testator2" : "testator1";
  const partner = matter.matterType === "mirror" ? matter.clients.find(c => c.clientRole === partnerRole) : null;

  const name = client?.fullName || "_______________";
  const fileRef = matter.fileReference || "";

  const execRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const primaryExecutors = matter.executors.filter(e => e.clientRole === execRole && e.executorType === "primary");
  const substituteExecutors = matter.executors.filter(e => e.clientRole === execRole && e.executorType === "substitute");

  const primaryGuardians = matter.guardians.filter(g => g.guardianType === "primary");
  const substituteGuardians = matter.guardians.filter(g => g.guardianType === "substitute");

  const benRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const primaryBeneficiaries = matter.beneficiaries.filter(b => b.clientRole === benRole && b.beneficiaryType === "primary");
  const fallbackBeneficiaries = matter.beneficiaries.filter(b => b.clientRole === benRole && b.beneficiaryType === "fallback");

  const wishRole = matter.matterType === "mirror" ? testatorRole : "shared";
  const wishes = matter.wishes.find(w => w.clientRole === wishRole) || matter.wishes[0];

  const ageCondition = wishes?.ageCondition ?? 18;
  const survivorshipDays = wishes?.survivorshipDays ?? 28;
  const organDonation = !!wishes?.organDonation;
  const funeralWishes = wishes?.funeralWishes || "";
  const residueToSpouseFirst = matter.matterType === "mirror" && (wishes?.residueToSpouseFirst ?? 1) === 1;

  // ── Part 1: Named People Summary ─────────────────────────────────────────

  const executorSummary = buildExecutorSummary(primaryExecutors, substituteExecutors);
  const guardianSummary = buildGuardianSummary(primaryGuardians, substituteGuardians);
  const beneficiarySummary = buildBeneficiarySummary(primaryBeneficiaries, fallbackBeneficiaries, partner, residueToSpouseFirst, ageCondition);

  // ── Part 2: Clause-by-clause explanation ─────────────────────────────────

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Will Commentary — ${name}</title>
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
  .cover-logo { font-size: 22pt; font-weight: 600; color: #1a3a5c; margin-bottom: 8mm; }
  .cover-title { font-size: 24pt; font-weight: 600; color: #1a3a5c; margin-bottom: 4mm; text-transform: uppercase; letter-spacing: 0.06em; }
  .cover-subtitle { font-size: 14pt; color: #555; margin-bottom: 10mm; }
  .cover-name { font-size: 18pt; font-weight: 600; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 4mm 10mm; margin-bottom: 6mm; }
  .cover-ref { font-size: 10pt; color: #888; }
  .cover-note { margin-top: 16mm; font-size: 10pt; color: #888; font-style: italic; max-width: 120mm; }
  .cover-footer { margin-top: auto; padding-top: 20mm; font-size: 9pt; color: #aaa; }
  h2 { font-size: 14pt; font-weight: 600; color: #1a3a5c; margin-top: 8mm; margin-bottom: 3mm; border-bottom: 1px solid #dde; padding-bottom: 1mm; }
  h3 { font-size: 12pt; font-weight: 600; color: #1a3a5c; margin-top: 5mm; margin-bottom: 2mm; }
  p { margin-bottom: 3mm; text-align: justify; }
  .section { margin-bottom: 8mm; }
  .person-card { background: #f8f9fb; border-left: 3px solid #1a3a5c; padding: 3mm 5mm; margin-bottom: 3mm; }
  .person-role { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.08em; color: #1a3a5c; font-weight: 600; }
  .person-name { font-size: 12pt; font-weight: 600; }
  .person-address { font-size: 10pt; color: #555; }
  .clause-commentary { margin-bottom: 6mm; }
  .clause-title { font-weight: 600; font-size: 12pt; color: #1a3a5c; margin-bottom: 2mm; }
  .page-footer { text-align: center; font-size: 9pt; color: #888; margin-top: 10mm; border-top: 1px solid #eee; padding-top: 3mm; }
  @media print { .page { margin: 0; } }
</style>
</head>
<body>

<!-- ══ COVER PAGE ══════════════════════════════════════════════════════════ -->
<div class="page cover">
  <div class="cover-logo">GENESIS ESTATE PLANNING</div>
  <div class="cover-title">Will Commentary</div>
  <div class="cover-subtitle">for</div>
  <div class="cover-name">${name}</div>
  <div class="cover-ref">${fileRef ? `File Reference: ${fileRef}` : ""}</div>
  <div class="cover-note">
    This commentary is provided to help you understand the contents of your Will. It is written in plain English and is not itself a legal document — it does not require a signature.
  </div>
  <div class="cover-footer">
    Genesis Estate Planning Ltd &bull; England &amp; Wales
  </div>
</div>

<!-- ══ PART 1: NAMED PEOPLE ════════════════════════════════════════════════ -->
<div class="page">
  <h2>Part 1 — The People Named in Your Will</h2>
  <p>This section sets out who you have chosen for each role in your Will, together with a brief explanation of what each role involves.</p>

  <div class="section">
    <h3>Executors</h3>
    <p>Your Executor${primaryExecutors.length > 1 ? "s are" : " is"} the person${primaryExecutors.length > 1 ? "s" : ""} responsible for administering your Estate after your death. This includes gathering your assets, paying any debts and liabilities, and distributing what remains to your beneficiaries in accordance with your Will. Being an Executor is a significant responsibility and can take many months to complete.</p>
    ${executorSummary}
  </div>

  <div class="section">
    <h3>Guardians</h3>
    <p>A Guardian is the person you have chosen to take parental responsibility for any of your children who are under the age of 18 at the time of your death. The appointment of a Guardian only takes effect if there is no surviving parent with parental responsibility. It is important that you discuss this appointment with the person you have chosen, as they must be willing and able to take on this role.</p>
    ${guardianSummary}
  </div>

  <div class="section">
    <h3>Beneficiaries of the Residuary Estate</h3>
    <p>Your residuary estate is everything that remains after your debts, funeral expenses, and any specific gifts have been paid. The following sets out how you have directed that the residue of your Estate should be distributed.</p>
    ${beneficiarySummary}
  </div>

  <div class="page-footer">
    Will Commentary — ${name}${fileRef ? ` — Ref: ${fileRef}` : ""} — Part 1
  </div>
</div>

<!-- ══ PART 2: CLAUSE-BY-CLAUSE ════════════════════════════════════════════ -->
<div class="page">
  <h2>Part 2 — Explanation of Each Clause</h2>
  <p>The following explains each clause of your Will in plain English. The clause numbers correspond to those in your Will document.</p>

  <div class="clause-commentary">
    <div class="clause-title">Clause 1 — Revocation</div>
    <p>This clause cancels all previous Wills and codicils you may have made. It is essential that a Will contains a revocation clause so that there is no ambiguity about which document represents your current wishes. Only one Will can be valid at any time.</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 2 — Appointment of Executors</div>
    <p>This clause formally appoints the person${primaryExecutors.length > 1 ? "s" : ""} who will administer your Estate. ${primaryExecutors.length > 0 ? `You have appointed <strong>${primaryExecutors.map(e => e.fullName || "_______________").join(" and ")}</strong> as your primary Executor${primaryExecutors.length > 1 ? "s" : ""}.` : ""}${substituteExecutors.length > 0 ? ` Should ${primaryExecutors.length > 1 ? "they be" : "this person be"} unable or unwilling to act, <strong>${substituteExecutors.map(e => e.fullName || "_______________").join(" and ")}</strong> will step in as substitute Executor${substituteExecutors.length > 1 ? "s" : ""}.` : ""}</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 3 — Appointment of Guardians</div>
    <p>${primaryGuardians.length > 0
      ? `You have appointed <strong>${primaryGuardians.map(g => g.fullName || "_______________").join(" and ")}</strong> as Guardian${primaryGuardians.length > 1 ? "s" : ""} for any of your children who are under 18 at the time of your death. This appointment is important if both parents were to die simultaneously or in close succession.`
      : "This clause provides for the appointment of a Guardian for any minor children. As no specific Guardian has been named, your Executor(s) will be responsible for making appropriate arrangements."
    }${substituteGuardians.length > 0 ? ` <strong>${substituteGuardians.map(g => g.fullName || "_______________").join(" and ")}</strong> will act as substitute Guardian${substituteGuardians.length > 1 ? "s" : ""} if the primary appointment cannot take effect.` : ""}</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 4 — Definition and Administration of your Estate</div>
    <p>This clause defines what is meant by "your Estate" for the purposes of the Will. It includes all assets you own at the date of your death, including property over which you have a general power of appointment. It also confirms that your Executors and Trustees have the widest powers of management and administration permitted by law.</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 5 — Distribution of the Residue</div>
    <p>This is the most important clause in your Will as it sets out who will receive your Estate. ${residueToSpouseFirst && partner?.fullName ? `Your Estate passes first to your partner <strong>${partner.fullName}</strong>, provided they survive you by ${survivorshipDays} days. ` : ""}${primaryBeneficiaries.length > 0 ? `The residue is then distributed to ${primaryBeneficiaries.map(b => `<strong>${b.fullName || "_______________"}</strong>${b.relationship ? ` (your ${b.relationship})` : ""}${b.shareFraction ? ` — ${b.shareFraction}` : ""}`).join(", ")}.` : "Your Estate passes to your children in equal shares."} The term "issue" means children and remoter descendants. If a beneficiary predeceases you, their share passes to their own children in equal shares.</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 6 — Conditional Gift at Age ${ageCondition}</div>
    <p>Where a beneficiary is under the age of ${ageCondition} at the time of your death, they will not receive their inheritance outright until they reach that age. In the meantime, your Trustees will hold the funds on trust and may use income and capital for that beneficiary's maintenance, education and general benefit. This is a protective measure to ensure that younger beneficiaries do not receive large sums before they are mature enough to manage them responsibly.</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 7 — Executor and Trustee Powers</div>
    <p>This clause sets out the specific powers available to your Executors and Trustees to enable them to administer your Estate efficiently. These include the power to sell assets, invest proceeds, apply funds for minor beneficiaries, appropriate assets in satisfaction of legacies, and insure estate property. These powers are in addition to those already conferred by statute.</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 8 — Survivorship</div>
    <p>This clause requires any beneficiary to survive you by ${survivorshipDays} days in order to inherit. This is a standard provision designed to avoid the complications that arise when two people die in close succession — for example, in an accident. Without this clause, assets could pass rapidly through two Estates, incurring double administration costs and potentially creating inheritance tax complications.</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 9 — Organ Donation</div>
    <p>${organDonation
      ? "You have included a direction in your Will regarding organ donation. Whilst a Will is not the primary mechanism for registering organ donation wishes (the NHS Organ Donor Register is the most effective route), this clause records your intentions formally."
      : "No specific direction has been included regarding organ donation. If you wish to donate your organs, we recommend registering on the NHS Organ Donor Register at www.organdonation.nhs.uk."
    }</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 10 — Funeral Wishes</div>
    <p>${funeralWishes
      ? "You have included specific funeral wishes in your Will. Whilst your Executors are not legally bound to follow these wishes, they will be aware of your preferences and will take them into account when making arrangements."
      : "No specific funeral wishes have been recorded in your Will. Your Executors will make appropriate arrangements having regard to any wishes you may have expressed to them during your lifetime."
    } It is worth noting that a Will is often not read until after the funeral has taken place, so it is advisable to communicate your wishes directly to your family and Executors.</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 11 — STEP Powers</div>
    <p>The Society of Trust and Estate Practitioners (STEP) has produced a set of standard provisions that are widely used in professionally drafted Wills. By incorporating these provisions, your Will benefits from a comprehensive set of administrative powers and protections that have been developed and refined over many years by leading practitioners in the field.</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Clause 12 — For the Avoidance of Doubt</div>
    <p>This clause clarifies certain definitions used in the Will. It confirms that references to "children" include legitimate, illegitimate and adopted children but not stepchildren unless expressly stated. It also confirms that masculine pronouns include feminine and vice versa, and that singular words include the plural. These clarifications help to prevent ambiguity and potential disputes.</p>
  </div>

  <div class="clause-commentary">
    <div class="clause-title">Attestation Clause</div>
    <p>The attestation clause records the formal signing and witnessing of your Will. It is essential that your Will is signed and witnessed correctly — failure to do so will render the Will invalid. Please refer to the accompanying Signing Guide for full instructions on how to sign your Will correctly.</p>
  </div>

  <div style="margin-top:10mm; padding:4mm 6mm; background:#fff8e7; border:1px solid #e6c84a;">
    <p><strong>Important Reminder:</strong> Your Will only becomes legally valid once it has been correctly signed and witnessed in accordance with the requirements of the Wills Act 1837. Please read the Signing Guide carefully before signing your Will. If you are using our document checking and storage service, please return your signed Will to us for safekeeping.</p>
  </div>

  <div class="page-footer">
    Will Commentary — ${name}${fileRef ? ` — Ref: ${fileRef}` : ""} — Part 2 &bull; This document does not require a signature.
  </div>
</div>

</body>
</html>`;
}

// ── Summary builders ──────────────────────────────────────────────────────────

function buildExecutorSummary(primary: MatterExecutor[], substitute: MatterExecutor[]): string {
  const cards = primary.map((e, i) => `
    <div class="person-card">
      <div class="person-role">Primary Executor ${primary.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${e.fullName || "_______________"}</div>
      ${e.address ? `<div class="person-address">${e.address}</div>` : ""}
    </div>`).join("");

  const subCards = substitute.map((e, i) => `
    <div class="person-card">
      <div class="person-role">Substitute Executor ${substitute.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${e.fullName || "_______________"}</div>
      ${e.address ? `<div class="person-address">${e.address}</div>` : ""}
    </div>`).join("");

  if (!cards && !subCards) return `<p>No Executors have been specified.</p>`;
  return cards + subCards;
}

function buildGuardianSummary(primary: MatterGuardian[], substitute: MatterGuardian[]): string {
  if (primary.length === 0) return `<p>No specific Guardians have been named. Your Executors will be responsible for making appropriate arrangements for any minor children.</p>`;

  const cards = primary.map((g, i) => `
    <div class="person-card">
      <div class="person-role">Guardian ${primary.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${g.fullName || "_______________"}</div>
      ${g.address ? `<div class="person-address">${g.address}</div>` : ""}
    </div>`).join("");

  const subCards = substitute.map((g, i) => `
    <div class="person-card">
      <div class="person-role">Substitute Guardian ${substitute.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${g.fullName || "_______________"}</div>
      ${g.address ? `<div class="person-address">${g.address}</div>` : ""}
    </div>`).join("");

  return cards + subCards;
}

function buildBeneficiarySummary(
  primary: MatterBeneficiary[],
  fallback: MatterBeneficiary[],
  partner: MatterClient | null | undefined,
  residueToSpouseFirst: boolean,
  ageCondition: number
): string {
  const parts: string[] = [];

  if (residueToSpouseFirst && partner?.fullName) {
    parts.push(`
    <div class="person-card">
      <div class="person-role">Primary Beneficiary — Surviving Partner</div>
      <div class="person-name">${partner.fullName}</div>
      <div class="person-address">Receives the whole Estate if they survive you by the required period.</div>
    </div>`);
  }

  if (primary.length > 0) {
    const label = residueToSpouseFirst ? "Substitute Beneficiar" : "Beneficiar";
    primary.forEach((b, i) => {
      parts.push(`
    <div class="person-card">
      <div class="person-role">${label}${primary.length > 1 ? `y ${i + 1}` : "y"}</div>
      <div class="person-name">${b.fullName || "_______________"}${b.relationship ? ` — ${b.relationship}` : ""}</div>
      ${b.shareFraction ? `<div class="person-address">Share: ${b.shareFraction}</div>` : ""}
      ${b.includeIssue ? `<div class="person-address">If they predecease you, their share passes to their children (issue) in equal shares.</div>` : ""}
    </div>`);
    });
  }

  if (fallback.length > 0) {
    fallback.forEach((b, i) => {
      parts.push(`
    <div class="person-card">
      <div class="person-role">Fallback Beneficiary ${fallback.length > 1 ? i + 1 : ""}</div>
      <div class="person-name">${b.fullName || "_______________"}${b.relationship ? ` — ${b.relationship}` : ""}</div>
      <div class="person-address">Receives the Estate only if all primary gifts fail.</div>
    </div>`);
    });
  }

  if (parts.length === 0) {
    parts.push(`<p>No beneficiaries have been specified. Your Estate would pass under the intestacy rules.</p>`);
  }

  if (ageCondition > 0) {
    parts.push(`<p style="margin-top:3mm;font-size:10pt;color:#555;">Note: Any beneficiary who has not yet reached the age of ${ageCondition} at the date of your death will not receive their inheritance outright until they attain that age.</p>`);
  }

  return parts.join("\n");
}
