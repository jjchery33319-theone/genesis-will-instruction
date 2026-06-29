/**
 * Will V2 Testimonium & Attestation Generator
 * Produces a personalised single-page signing witness form per testator.
 * For single wills: one document. For mirror wills: two separate documents.
 */
import type { FullMatter } from "./mattersDb";
import type { TestatorRole } from "./willV2Generator";

export function generateTestimoniumHtml(matter: FullMatter, testatorRole: TestatorRole = "testator1"): string {
  const client = matter.clients.find(c => c.clientRole === testatorRole);
  const name = client?.fullName || "_______________";
  const fileRef = matter.fileReference || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Testimonium &amp; Attestation — ${name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
    background: #fff;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 18mm 20mm 18mm 20mm;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* ── Header ── */
  .header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10mm;
  }
  .company-block {
    text-align: right;
    font-size: 10pt;
    line-height: 1.5;
  }
  .company-name {
    font-weight: bold;
    font-size: 11pt;
  }
  .logo-circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 2.5px solid #1a1a1a;
    border-radius: 50%;
    font-weight: bold;
    font-size: 12pt;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  /* ── Title ── */
  .doc-title {
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 5mm;
  }

  /* ── Body text ── */
  .intro-para {
    margin-bottom: 6mm;
    line-height: 1.7;
  }
  .signed-line {
    margin-bottom: 8mm;
  }

  /* ── Witness sections ── */
  .witness-heading {
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 3mm;
    margin-top: 2mm;
  }
  .field-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 3.5mm;
    gap: 4px;
  }
  .field-label {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 11pt;
  }
  .field-line {
    flex: 1;
    border-bottom: 1px solid #1a1a1a;
    min-width: 60px;
    height: 1.2em;
  }
  .field-row-two {
    display: flex;
    gap: 8mm;
    margin-bottom: 3.5mm;
  }
  .field-row-two .field-row {
    flex: 1;
    margin-bottom: 0;
  }
  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 6mm;
    margin-bottom: 5mm;
    font-size: 11pt;
  }
  .checkbox-row .field-label {
    margin-right: 4mm;
  }
  .cb-option {
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .cb-box {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1px solid #1a1a1a;
    margin-right: 3px;
    vertical-align: middle;
  }

  .divider {
    border: none;
    border-top: 1px solid #ccc;
    margin: 5mm 0;
  }

  /* ── Please Return footer ── */
  .please-return {
    text-align: center;
    font-weight: bold;
    font-size: 12pt;
    margin-top: auto;
    padding-top: 8mm;
  }

  /* ── Bottom footer ── */
  .page-footer {
    text-align: center;
    font-size: 8.5pt;
    color: #555;
    margin-top: 6mm;
    border-top: 1px solid #ccc;
    padding-top: 3mm;
  }
  .page-footer a { color: #555; }

  @media print {
    body { background: #fff; }
    .page { margin: 0; padding: 14mm 16mm; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="company-block">
      <div><div class="logo-circle">GW</div></div>
      <div class="company-name">Genesis Wills and Estate Planning Ltd</div>
      <div>The Business Village, Innovation Way</div>
      <div>Barnsley, South Yorkshire S75 1JL</div>
      <div>office@genesisestateplanning.info</div>
      <div>0330 1180937</div>
      <div>https://www.genesisestateplanning.net/</div>
    </div>
  </div>

  <!-- Title -->
  <div class="doc-title">RE: TESTIMONIUM &amp; ATTESTATION${fileRef ? ` &nbsp;&nbsp; Ref: ${fileRef}` : ""}</div>

  <!-- Intro paragraph -->
  <p class="intro-para">
    I <strong>${name}</strong> confirm I have signed and have had my Will witnessed today by the two
    witnesses together and named below on: (date) &nbsp;<span style="display:inline-block;width:36mm;border-bottom:1px solid #1a1a1a;">&nbsp;</span>
  </p>

  <!-- Signed line -->
  <div class="signed-line">
    (Signed) &nbsp;<span style="display:inline-block;width:52mm;border-bottom:1px solid #1a1a1a;">&nbsp;</span>
  </div>

  <!-- Witness 1 -->
  <div class="witness-heading">Witness 1:</div>

  <div class="field-row">
    <span class="field-label">Full Name of 1st Witness:</span>
    <span class="field-line"></span>
  </div>
  <div class="field-row">
    <span class="field-label">Address of 1st Witness:</span>
    <span class="field-line"></span>
  </div>
  <div class="field-row-two">
    <div class="field-row">
      <span class="field-label">Phone:</span>
      <span class="field-line"></span>
    </div>
    <div class="field-row">
      <span class="field-label">Mobile:</span>
      <span class="field-line"></span>
    </div>
  </div>
  <div class="field-row-two">
    <div class="field-row">
      <span class="field-label">Occupation:</span>
      <span class="field-line"></span>
    </div>
    <div class="field-row">
      <span class="field-label">Email:</span>
      <span class="field-line"></span>
    </div>
  </div>
  <div class="checkbox-row">
    <span class="field-label">Contact me about making a Will</span>
    <span class="cb-option"><span class="cb-box"></span> Yes</span>
    <span class="cb-option"><span class="cb-box"></span> No</span>
  </div>

  <hr class="divider" />

  <!-- Witness 2 -->
  <div class="witness-heading">Witness 2:</div>

  <div class="field-row">
    <span class="field-label">Full Name of 2nd Witness:</span>
    <span class="field-line"></span>
  </div>
  <div class="field-row">
    <span class="field-label">Address of 2nd Witness:</span>
    <span class="field-line"></span>
  </div>
  <div class="field-row-two">
    <div class="field-row">
      <span class="field-label">Phone:</span>
      <span class="field-line"></span>
    </div>
    <div class="field-row">
      <span class="field-label">Mobile:</span>
      <span class="field-line"></span>
    </div>
  </div>
  <div class="field-row-two">
    <div class="field-row">
      <span class="field-label">Occupation:</span>
      <span class="field-line"></span>
    </div>
    <div class="field-row">
      <span class="field-label">Email:</span>
      <span class="field-line"></span>
    </div>
  </div>
  <div class="checkbox-row">
    <span class="field-label">Contact me about making a Will</span>
    <span class="cb-option"><span class="cb-box"></span> Yes</span>
    <span class="cb-option"><span class="cb-box"></span> No</span>
  </div>

  <!-- Please Return -->
  <div class="please-return">Please Return</div>

  <!-- Page footer -->
  <div class="page-footer">
    Genesis Wills and Estate Planning Ltd, The Business Village, Innovation Way, Barnsley, South Yorkshire S75 1JL &nbsp;|&nbsp; 0330 1180937
  </div>

</div>
</body>
</html>`;
}
