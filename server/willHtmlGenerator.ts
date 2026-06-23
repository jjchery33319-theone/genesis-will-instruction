/**
 * willHtmlGenerator.ts
 *
 * Generates a Will document as styled HTML so it can be previewed and
 * edited in-browser (contentEditable), then exported as PDF or .docx.
 *
 * The output is a complete self-contained HTML string.
 */

import type { WillInstruction } from "../drizzle/schema";

export interface WillHtmlOptions {
  willType: "single" | "mirror_client1" | "mirror_client2";
  includePPT?: boolean;
  includeDiscretionaryTrust?: boolean;
  includeVulnerableTrust?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safe(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function parseJson<T>(v: unknown, fallback: T): T {
  if (!v) return fallback;
  try {
    return JSON.parse(String(v)) as T;
  } catch {
    return fallback;
  }
}

function fullName(...parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function clauseHtml(num: number, title: string, body: string): string {
  return `
  <div class="clause">
    <p class="clause-title">${num}. ${title}</p>
    <div class="clause-body">${body}</div>
  </div>`;
}

// ─── Clause builders ─────────────────────────────────────────────────────────

function revocationClause(
  num: number,
  testatorName: string,
  dob: string,
  address: string
): string {
  const dobStr = dob ? ` born ${dob}` : "";
  return clauseHtml(
    num,
    "Revocation",
    `<p>I, <strong>${testatorName}</strong>${dobStr}, of ${address || "[address]"}, hereby revoke all former Wills and Testamentary dispositions previously made by me and declare this to be my last Will and Testament.</p>`
  );
}

function executorsClause(num: number, executors: string[], reservedExecutors: string[]): string {
  if (!executors.length) executors = ["[Executor Name]"];
  const list = executors.map((e) => `<li>${e}</li>`).join("\n");
  const appoint =
    executors.length === 1
      ? `I appoint <strong>${executors[0]}</strong> to be the Executor of this my Will.`
      : `I appoint the following persons to be the Executors of this my Will:\n<ol>${list}</ol>`;
  let reservedHtml = "";
  if (reservedExecutors.length) {
    const rList = reservedExecutors.map((e) => `<li>${e}</li>`).join("\n");
    reservedHtml = `<p><strong>Reserve Executors:</strong> In the event that all of the above-named Executors shall predecease me or be unable or unwilling to act, I appoint the following as Reserve Executor(s):</p><ol>${rList}</ol>`;
  }
  return clauseHtml(
    num,
    "Appointment of Executors",
    `<p>${appoint}</p>${reservedHtml}`
  );
}

function definitionClause(num: number): string {
  return clauseHtml(
    num,
    "Definitions",
    `<p>In this Will:</p>
     <ul>
       <li><strong>"my Trustees"</strong> means the Executors and Trustees of this Will for the time being.</li>
       <li><strong>"my children"</strong> means all children of mine whether born before or after the date of this Will, including any legally adopted children.</li>
       <li><strong>"the statutory age"</strong> means the age of eighteen (18) years.</li>
     </ul>`
  );
}

function distributionClause(
  num: number,
  primaryBeneficiary: string,
  residuaryBeneficiaries: string[],
  specificGifts: Array<{ description: string; recipient: string }>
): string {
  let specificHtml = "";
  if (specificGifts.length) {
    const items = specificGifts
      .map((g) => `<li>I give <strong>${g.description || "[item]"}</strong> to <strong>${g.recipient || "[recipient]"}</strong>.</li>`)
      .join("\n");
    specificHtml = `<p><strong>Specific Gifts</strong></p><ul>${items}</ul>`;
  }

  const primaryHtml = primaryBeneficiary
    ? `<p>Subject to the payment of my debts, funeral and testamentary expenses, I give all my real and personal property (my <strong>"Estate"</strong>) to <strong>${primaryBeneficiary}</strong> absolutely.</p>`
    : `<p>Subject to the payment of my debts, funeral and testamentary expenses, I give all my real and personal property (my <strong>"Estate"</strong>) to my Trustees upon the trusts set out below.</p>`;

  const residuaryHtml =
    residuaryBeneficiaries.length
      ? `<p>If <strong>${primaryBeneficiary || "the primary beneficiary"}</strong> shall predecease me or fail to survive me by thirty (30) days, I give my Estate in equal shares to: <strong>${residuaryBeneficiaries.join(", ")}</strong>.</p>`
      : "";

  return clauseHtml(
    num,
    "Distribution of Estate",
    specificHtml + primaryHtml + residuaryHtml
  );
}

function pptClause(
  num: number,
  testatorName: string,
  partnerName: string,
  children: string[]
): string {
  const childrenList = children.length
    ? children.map((c) => `<li>${c}</li>`).join("\n")
    : "<li>[children]</li>";
  return clauseHtml(
    num,
    "Protective Property Trust (Lifetime Trust)",
    `<p>I direct my Trustees to hold my share of the property known as my principal residence (<strong>"the Property"</strong>) upon the following trusts:</p>
     <p><strong>(a) Life Interest:</strong> My Trustees shall hold the Property on trust to permit <strong>${partnerName || "[partner]"}</strong> (<strong>"the Life Tenant"</strong>) to occupy the Property for the remainder of their life or until they permanently vacate the Property, whichever is the earlier. The Life Tenant shall be responsible for all outgoings in respect of the Property during the period of occupation.</p>
     <p><strong>(b) Remainder:</strong> Subject to the Life Interest, my Trustees shall hold the Property on trust for the following persons in equal shares absolutely:</p>
     <ul>${childrenList}</ul>
     <p><strong>(c) Powers of Trustees:</strong> My Trustees shall have power to sell the Property and to apply the net proceeds of sale in the purchase of another property to be held on the same trusts, or to invest the same in accordance with the investment powers set out in this Will.</p>
     <p><strong>(d) Termination:</strong> The Life Interest shall terminate upon the death of the Life Tenant, their remarriage or entry into a new civil partnership, or their permanent vacation of the Property.</p>`
  );
}

function discretionaryTrustClause(
  num: number,
  trustees: string[],
  beneficiaryClass: string
): string {
  const trusteeList = trustees.length
    ? trustees.map((t) => `<li>${t}</li>`).join("\n")
    : "<li>[Trustee Name]</li>";
  return clauseHtml(
    num,
    "Discretionary Trust",
    `<p>I direct my Trustees to hold the residue of my Estate (<strong>"the Trust Fund"</strong>) upon the following discretionary trusts:</p>
     <p><strong>(a) Beneficiaries:</strong> The beneficiaries of this Trust shall be ${beneficiaryClass} (<strong>"the Beneficiaries"</strong>).</p>
     <p><strong>(b) Trustees:</strong></p>
     <ul>${trusteeList}</ul>
     <p><strong>(c) Discretion:</strong> My Trustees shall have an absolute and uncontrolled discretion to pay or apply the whole or any part of the income or capital of the Trust Fund to or for the benefit of any one or more of the Beneficiaries in such shares and proportions and in such manner as my Trustees in their absolute discretion think fit.</p>
     <p><strong>(d) Accumulation:</strong> My Trustees may accumulate the whole or any part of the income of the Trust Fund during the Trust Period and add the same to the capital of the Trust Fund.</p>
     <p><strong>(e) Trust Period:</strong> The Trust Period shall be 125 years from the date of my death (the statutory period under the Perpetuities and Accumulations Act 2009).</p>`
  );
}

function vulnerableTrustClause(
  num: number,
  vulnerableBeneficiary: string,
  trustees: string[]
): string {
  const trusteeList = trustees.length
    ? trustees.map((t) => `<li>${t}</li>`).join("\n")
    : "<li>[Trustee Name]</li>";
  return clauseHtml(
    num,
    "Vulnerable Person's Trust",
    `<p>I direct my Trustees to hold such share of my Estate as is specified herein (<strong>"the Vulnerable Person's Fund"</strong>) upon the following trusts for the benefit of <strong>${vulnerableBeneficiary || "[vulnerable beneficiary]"}</strong> (<strong>"the Vulnerable Beneficiary"</strong>):</p>
     <p><strong>(a) Qualifying Trust:</strong> This Trust is intended to be a Qualifying Trust for the purposes of Section 30 of the Finance Act 2005 and my Trustees shall administer the Trust accordingly.</p>
     <p><strong>(b) Trustees:</strong></p>
     <ul>${trusteeList}</ul>
     <p><strong>(c) Application of Income and Capital:</strong> My Trustees shall have an absolute discretion to pay or apply the whole or any part of the income and capital of the Vulnerable Person's Fund for the maintenance, support, education, or benefit of the Vulnerable Beneficiary during their lifetime.</p>
     <p><strong>(d) Remainder:</strong> Subject to the above, upon the death of the Vulnerable Beneficiary, the Vulnerable Person's Fund shall fall into and form part of the residue of my Estate and be distributed accordingly.</p>
     <p><strong>(e) Trustee Powers:</strong> My Trustees shall have the widest powers of investment and management as if they were the absolute owners of the Trust Fund.</p>`
  );
}

function ageConditionClause(num: number): string {
  return clauseHtml(
    num,
    "Age Condition",
    `<p>Any beneficiary who has not attained the age of eighteen (18) years at the date of my death shall not be entitled to receive any benefit under this Will until they attain that age. Until such time my Trustees shall hold such beneficiary's share on trust and may apply the income and capital thereof for the maintenance, education, or benefit of such beneficiary.</p>`
  );
}

function executorPowersClause(num: number): string {
  return clauseHtml(
    num,
    "Powers of Executors and Trustees",
    `<p>My Trustees shall have the following powers in addition to those conferred by law:</p>
     <p><strong>(a) Investment:</strong> Power to invest trust monies in any investments as if they were the absolute owners thereof, including the power to retain existing investments.</p>
     <p><strong>(b) Sale:</strong> Power to sell, call in, and convert into money all or any part of my Estate at such time and in such manner as they think fit.</p>
     <p><strong>(c) Appropriation:</strong> Power to appropriate any part of my Estate in or towards satisfaction of any share or interest without requiring the consent of any beneficiary.</p>
     <p><strong>(d) Receipts:</strong> Power to give receipts for money and other assets.</p>
     <p><strong>(e) Delegation:</strong> Power to employ and pay agents, including solicitors and accountants, and to act on their advice.</p>
     <p><strong>(f) Insurance:</strong> Power to insure any property forming part of my Estate against any risk and to pay premiums from the income or capital of my Estate.</p>`
  );
}

function survivorshipClause(num: number): string {
  return clauseHtml(
    num,
    "Survivorship",
    `<p>For the purposes of this Will, a beneficiary shall be deemed to have predeceased me if they do not survive me by a period of thirty (30) clear days. In such circumstances, any gift to that beneficiary shall lapse and fall into the residue of my Estate unless otherwise provided in this Will.</p>`
  );
}

function organDonationClause(num: number): string {
  return clauseHtml(
    num,
    "Organ Donation",
    `<p>I express my wish that upon my death my body or any part thereof may be used for the purposes of transplantation, research, or any other therapeutic purpose. I request that my Executors and next of kin give effect to this wish insofar as it is lawfully possible to do so.</p>`
  );
}

function funeralWishesClause(num: number, funeralType: string, funeralWishes: string): string {
  let typeText = "";
  const ft = funeralType ? funeralType.toLowerCase() : "";
  if (ft === "burial" || ft === "burial") {
    typeText = `<p>I desire that my body be <strong>buried</strong> and the expense thereof shall be a first charge on my Estate.</p>`;
  } else if (ft === "cremation") {
    typeText = `<p>I desire that my body be <strong>cremated</strong> and my ashes disposed of as my Executors shall think fit, and the expense thereof shall be a first charge on my Estate.</p>`;
  } else if (ft === "no preference" || ft === "no_preference") {
    typeText = `<p>I leave the choice of burial or cremation to the discretion of my Executors.</p>`;
  } else {
    typeText = `<p>I desire that my body be [cremated/buried] and the expense thereof shall be a first charge on my Estate.</p>`;
  }
  const notesText = funeralWishes ? `<p>${funeralWishes}</p>` : "";
  return clauseHtml(
    num,
    "Funeral Wishes",
    typeText + notesText + `<p>These wishes are not legally binding on my Executors but I ask that they be given due consideration.</p>`
  );
}

function stepPowersClause(num: number): string {
  return clauseHtml(
    num,
    "Trustee Act 2000",
    `<p>The provisions of the Trustee Act 2000 shall apply to this Will save that the duty of care set out in Section 1 of that Act shall not apply to my Trustees when exercising the powers of investment conferred by this Will.</p>`
  );
}

function avoidanceOfDoubtClause(num: number): string {
  return clauseHtml(
    num,
    "Avoidance of Doubt",
    `<p>For the avoidance of doubt, any reference in this Will to a person's children shall include all children of that person whether born before or after the date of this Will, including any legally adopted children, but shall not include step-children unless expressly stated otherwise.</p>`
  );
}

// ─── Attestation HTML ────────────────────────────────────────────────────────

function attestationHtml(testatorName: string): string {
  return `
  <div class="page-break"></div>
  <div class="execution-page">
    <h2 class="execution-title">EXECUTION PAGE</h2>
    <p class="execution-subtitle">The Testimonium and Attestation Clause</p>
    <hr class="exec-rule" />

    <p class="testimonium">
      I, <strong>${testatorName}</strong>, declare this to be my last Will and Testament and I sign it as my Will
      in the presence of the witnesses named below, who each attest and subscribe it in my presence and in the
      presence of each other, all being present at the same time.
    </p>

    <div class="sig-box testator-box">
      <div class="sig-box-label">TESTATOR</div>
      <div class="sig-row">
        <span class="sig-label">Full Name:</span>
        <span class="sig-line prefilled">${testatorName}</span>
      </div>
      <div class="sig-row">
        <span class="sig-label">Signature:</span>
        <span class="sig-line"></span>
      </div>
      <div class="sig-row">
        <span class="sig-label">Date:</span>
        <span class="sig-line short"></span>
      </div>
    </div>

    <p class="attestation-stmt">
      SIGNED by the above-named Testator as their last Will in our presence and attested by us in the presence
      of the Testator and of each other:
    </p>

    <div class="witness-row">
      <div class="sig-box witness-box">
        <div class="sig-box-label">WITNESS 1</div>
        <div class="sig-row"><span class="sig-label">Signature:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Full Name:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Address:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label"></span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label"></span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Occupation:</span><span class="sig-line"></span></div>
      </div>
      <div class="sig-box witness-box">
        <div class="sig-box-label">WITNESS 2</div>
        <div class="sig-row"><span class="sig-label">Signature:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Full Name:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Address:</span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label"></span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label"></span><span class="sig-line"></span></div>
        <div class="sig-row"><span class="sig-label">Occupation:</span><span class="sig-line"></span></div>
      </div>
    </div>

    <p class="witness-note">
      <em>Note: A witness must be 18 years or over, of sound mind, and must not be a beneficiary under this Will
      or the spouse/civil partner of a beneficiary.</em>
    </p>
  </div>`;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  * { box-sizing: border-box; }
  body {
    font-family: "Garamond", "EB Garamond", Georgia, serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #111;
    background: #fff;
    margin: 0;
    padding: 0;
  }
  .will-document {
    max-width: 21cm;
    margin: 0 auto;
    padding: 2.5cm 2.5cm 3cm;
  }
  /* Cover / header */
  .will-header {
    text-align: center;
    margin-bottom: 2em;
    border-bottom: 2px solid #1a3a2a;
    padding-bottom: 1.5em;
  }
  .will-header .firm-name {
    font-size: 10pt;
    color: #555;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 0.5em;
  }
  .will-header h1 {
    font-size: 18pt;
    font-weight: bold;
    margin: 0.2em 0;
    color: #1a3a2a;
  }
  .will-header .testator-details {
    font-size: 11pt;
    margin-top: 0.8em;
    color: #333;
  }
  .will-header .ref {
    font-size: 9pt;
    color: #888;
    margin-top: 0.5em;
  }
  /* Clauses */
  .clause {
    margin-bottom: 1.4em;
  }
  .clause-title {
    font-weight: bold;
    font-size: 12pt;
    margin-bottom: 0.3em;
    color: #1a3a2a;
  }
  .clause-body p { margin: 0.4em 0; }
  .clause-body ul, .clause-body ol {
    margin: 0.4em 0 0.4em 1.5em;
    padding: 0;
  }
  .clause-body li { margin-bottom: 0.2em; }
  /* Execution page */
  .page-break { page-break-before: always; }
  .execution-page {
    padding-top: 1em;
  }
  .execution-title {
    text-align: center;
    font-size: 16pt;
    font-weight: bold;
    color: #1a3a2a;
    margin-bottom: 0.2em;
  }
  .execution-subtitle {
    text-align: center;
    font-size: 10pt;
    color: #666;
    margin-bottom: 0.8em;
  }
  .exec-rule {
    border: none;
    border-top: 1px solid #aaa;
    margin: 0.5em 0 1.2em;
  }
  .testimonium {
    margin-bottom: 1.2em;
    text-align: justify;
  }
  .attestation-stmt {
    font-size: 10pt;
    color: #444;
    margin: 1em 0 0.8em;
    text-align: justify;
  }
  .sig-box {
    border: 1px solid #bbb;
    border-radius: 4px;
    padding: 10px 14px 14px;
    margin-bottom: 1em;
  }
  .sig-box-label {
    font-weight: bold;
    font-size: 10pt;
    margin-bottom: 8px;
    color: #1a3a2a;
  }
  .sig-row {
    display: flex;
    align-items: flex-end;
    margin-bottom: 10px;
    gap: 8px;
  }
  .sig-label {
    min-width: 90px;
    font-size: 10pt;
    color: #444;
    flex-shrink: 0;
  }
  .sig-line {
    flex: 1;
    border-bottom: 1px solid #999;
    min-height: 22px;
    display: block;
  }
  .sig-line.short { max-width: 200px; }
  .sig-line.prefilled {
    font-weight: bold;
    font-size: 10pt;
    border-bottom: 1px solid #bbb;
    color: #222;
  }
  .witness-row {
    display: flex;
    gap: 16px;
  }
  .witness-box { flex: 1; }
  .witness-note {
    font-size: 8pt;
    color: #888;
    text-align: center;
    margin-top: 1em;
  }
  /* Print */
  @media print {
    body { background: #fff; }
    .will-document { padding: 1.5cm 2cm; }
    .page-break { page-break-before: always; }
  }
`;

// ─── Main HTML generator ──────────────────────────────────────────────────────

export function generateWillHtml(
  record: WillInstruction,
  options: WillHtmlOptions
): string {
  const isClient2 = options.willType === "mirror_client2";

  const prefix = isClient2 ? safe(record.client2Prefix) : safe(record.client1Prefix);
  const firstName = isClient2 ? safe(record.client2FirstName) : safe(record.client1FirstName);
  const middleName = isClient2 ? safe(record.client2MiddleName) : safe(record.client1MiddleName);
  const lastName = isClient2 ? safe(record.client2LastName) : safe(record.client1LastName);
  const dob = isClient2 ? safe(record.client2Dob) : safe(record.client1Dob);
  const addr1 = isClient2 ? safe(record.client2AddressLine1) : safe(record.client1AddressLine1);
  const city = isClient2 ? safe(record.client2City) : safe(record.client1City);
  const postcode = isClient2 ? safe(record.client2Postcode) : safe(record.client1Postcode);

  const testatorName = fullName(prefix, firstName, middleName, lastName) || "Testator";
  const fullAddress = [addr1, city, postcode].filter(Boolean).join(", ");
  const reference = safe(record.referenceNumber);

  // Executors (with DOB)
  type PersonEntry = { firstName?: string; lastName?: string; relationship?: string; dob?: string };
  const rawExec = isClient2
    ? parseJson<PersonEntry[]>(record.client2Executors, [])
    : parseJson<PersonEntry[]>(record.client1Executors, []);
  const executors = rawExec.map((e) => {
    const name = fullName(safe(e.firstName), safe(e.lastName));
    const dobPart = e.dob ? ` (born ${e.dob})` : "";
    return name ? name + dobPart : "";
  }).filter(Boolean);

  // Beneficiaries (with DOB)
  const rawBenef = isClient2
    ? parseJson<PersonEntry[]>(record.client2Beneficiaries, [])
    : parseJson<PersonEntry[]>(record.client1Beneficiaries, []);
  const beneficiaries = rawBenef.map((b) => {
    const name = fullName(safe(b.firstName), safe(b.lastName));
    const dobPart = b.dob ? ` (born ${b.dob})` : "";
    return name ? name + dobPart : "";
  }).filter(Boolean);
  const primaryBeneficiary = beneficiaries[0] || "";
  const residuaryBeneficiaries = beneficiaries.slice(1);

  // Specific gifts (per-client, with legacy fallback)
  type GiftEntry = { description?: string; recipient?: string };
  const specificGifts = parseJson<GiftEntry[]>(
    isClient2 ? record.client2SpecificGifts : (record.client1SpecificGifts || record.specificGifts),
    []
  ).map((g) => ({
    description: safe(g.description),
    recipient: safe(g.recipient),
  }));

  // Partner name (for PPT)
  const partnerPrefix = isClient2 ? safe(record.client1Prefix) : safe(record.client2Prefix);
  const partnerFirst = isClient2 ? safe(record.client1FirstName) : safe(record.client2FirstName);
  const partnerLast = isClient2 ? safe(record.client1LastName) : safe(record.client2LastName);
  const partnerName = fullName(partnerPrefix, partnerFirst, partnerLast);

  // Children
  type ChildEntry = { firstName?: string; lastName?: string };
  const childrenUnder18 = parseJson<ChildEntry[]>(
    isClient2 ? record.client2ChildrenUnder18 : record.client1ChildrenUnder18,
    []
  );
  const childrenOver18 = parseJson<ChildEntry[]>(
    isClient2 ? record.client2ChildrenOver18 : record.client1ChildrenOver18,
    []
  );
  const children = [...childrenUnder18, ...childrenOver18]
    .map((c) => fullName(safe(c.firstName), safe(c.lastName)))
    .filter(Boolean);

  // Reserved executors
  type ReservedExecEntry = { firstName?: string; lastName?: string; dob?: string };
  const rawReservedExec = isClient2
    ? parseJson<ReservedExecEntry[]>(record.client2ReservedExecutors, [])
    : parseJson<ReservedExecEntry[]>(record.client1ReservedExecutors, []);
  const reservedExecutors = rawReservedExec
    .map((e) => {
      const name = fullName(safe(e.firstName), safe(e.lastName));
      const dobPart = e.dob ? ` (born ${e.dob})` : "";
      return name ? name + dobPart : "";
    })
    .filter(Boolean);

  // Guardians
  type GuardianEntry = { firstName?: string; lastName?: string; dob?: string };
  const rawGuardians = isClient2
    ? parseJson<GuardianEntry[]>(record.client2Guardians, [])
    : parseJson<GuardianEntry[]>(record.client1Guardians, []);
  const guardians = rawGuardians
    .map((g) => {
      const name = fullName(safe(g.firstName), safe(g.lastName));
      const dobPart = g.dob ? ` (born ${g.dob})` : "";
      return name ? name + dobPart : "";
    })
    .filter(Boolean);

  const rawReservedGuardians = isClient2
    ? parseJson<GuardianEntry[]>(record.client2ReservedGuardians, [])
    : parseJson<GuardianEntry[]>(record.client1ReservedGuardians, []);
  const reservedGuardians = rawReservedGuardians
    .map((g) => {
      const name = fullName(safe(g.firstName), safe(g.lastName));
      const dobPart = g.dob ? ` (born ${g.dob})` : "";
      return name ? name + dobPart : "";
    })
    .filter(Boolean);

  // Trustees (executors act as trustees)
  const trustees = executors.length ? executors : ["[Trustee Name]"];

  // Vulnerable beneficiary (first beneficiary with disability flag or just first)
  const vulnerableBeneficiary = beneficiaries[0] || "[Vulnerable Beneficiary]";

  const organDonation = (isClient2
    ? safe(record.client2OrganDonation)
    : safe(record.client1OrganDonation) || safe(record.organDonation)
  ).toLowerCase() === "yes";
  const funeralType = isClient2 ? safe(record.client2FuneralType) : safe(record.client1FuneralType) || safe((record as any).funeralType);
  const funeralWishes = isClient2
    ? safe(record.client2FuneralWishes)
    : safe(record.client1FuneralWishes) || safe(record.funeralWishes);

  // Build clauses
  let clauseNum = 1;
  let clausesHtml = "";
  clausesHtml += revocationClause(clauseNum++, testatorName, dob, fullAddress);
  clausesHtml += executorsClause(clauseNum++, executors, reservedExecutors);
  clausesHtml += definitionClause(clauseNum++);
  clausesHtml += distributionClause(clauseNum++, primaryBeneficiary, residuaryBeneficiaries, specificGifts);

  if (options.includePPT) {
    clausesHtml += pptClause(clauseNum++, testatorName, partnerName, children);
  }
  if (options.includeDiscretionaryTrust) {
    clausesHtml += discretionaryTrustClause(clauseNum++, trustees, "my children and remoter issue");
  }
  if (options.includeVulnerableTrust) {
    clausesHtml += vulnerableTrustClause(clauseNum++, vulnerableBeneficiary, trustees);
  }

  // Guardians clause
  if (guardians.length) {
    const gList = guardians.map((g) => `<li>${g}</li>`).join("\n");
    let guardianBody = `<p>In the event of my death while any of my children are minors, I appoint the following as Guardian(s) of my minor children:</p><ol>${gList}</ol>`;
    if (reservedGuardians.length) {
      const rgList = reservedGuardians.map((g) => `<li>${g}</li>`).join("\n");
      guardianBody += `<p>In the event that the above-named Guardian(s) shall predecease me or be unable or unwilling to act, I appoint the following as Reserve Guardian(s):</p><ol>${rgList}</ol>`;
    }
    clausesHtml += clauseHtml(clauseNum++, "Appointment of Guardians", guardianBody);
  }

  clausesHtml += ageConditionClause(clauseNum++);
  clausesHtml += executorPowersClause(clauseNum++);
  clausesHtml += survivorshipClause(clauseNum++);
  clausesHtml += funeralWishesClause(clauseNum++, funeralType, funeralWishes);
  if (organDonation) clausesHtml += organDonationClause(clauseNum++);
  clausesHtml += clauseHtml(clauseNum++, "STEP Powers",
    "<p>In this my Will where the context so admits any reference to the STEP Powers shall mean the Standard Provisions (2nd edition) of the Society of Trust and Estate Practitioners together with the Special Provisions (2nd edition) (with the exception of Special Provision 5) shall apply to this my Will.</p>");
  clausesHtml += avoidanceOfDoubtClause(clauseNum++);
  clausesHtml += attestationHtml(testatorName);

  const willTypeLabel =
    options.willType === "single"
      ? "Last Will and Testament"
      : options.willType === "mirror_client1"
      ? "Last Will and Testament (Mirror — Client 1)"
      : "Last Will and Testament (Mirror — Client 2)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${willTypeLabel} — ${testatorName}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="will-document" id="will-content">
    <div class="will-header">
      <div class="firm-name">Genesis Wills and Estate Planning</div>
      <h1>${willTypeLabel}</h1>
      <div class="testator-details">
        <strong>${testatorName}</strong><br />
        ${fullAddress}
      </div>
      ${reference ? `<div class="ref">Reference: ${reference}</div>` : ""}
    </div>

    ${clausesHtml}
  </div>
</body>
</html>`;
}
