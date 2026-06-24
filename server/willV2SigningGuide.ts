/**
 * Will V2 Signing Guide Generator
 * Produces a personalised single-page signing guide matching the Eleanor Breen precedent.
 */

import type { FullMatter } from "./mattersDb";
import type { TestatorRole } from "./willV2Generator";

export function generateSigningGuideHtml(matter: FullMatter, testatorRole: TestatorRole = "testator1"): string {
  const client = matter.clients.find(c => c.clientRole === testatorRole);
  const name = client?.fullName || "_______________";
  const fileRef = matter.fileReference || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Will Signing Guide — ${name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 11.5pt;
    line-height: 1.65;
    color: #1a1a1a;
    background: #fff;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 14mm 16mm 14mm 16mm;
    display: flex;
    flex-direction: column;
  }
  .header {
    text-align: center;
    margin-bottom: 8mm;
    border-bottom: 2px solid #1a3a5c;
    padding-bottom: 4mm;
  }
  .header-logo { font-size: 14pt; font-weight: 600; color: #1a3a5c; }
  .header-title { font-size: 11pt; color: #555; margin-top: 1mm; }
  .header-name { font-size: 12pt; font-weight: 600; color: #1a1a1a; margin-top: 1mm; }
  .two-col {
    display: flex;
    gap: 8mm;
    flex: 1;
  }
  .col-left { flex: 1; }
  .col-right { flex: 1; }
  h2 {
    font-size: 13pt;
    font-weight: 600;
    color: #1a3a5c;
    margin-bottom: 4mm;
    line-height: 1.3;
  }
  .intro {
    font-weight: 600;
    margin-bottom: 4mm;
  }
  .sign-now {
    color: #c0392b;
    font-weight: 600;
  }
  ul {
    list-style: disc;
    padding-left: 5mm;
    margin-bottom: 4mm;
  }
  li {
    margin-bottom: 2mm;
  }
  .example-box {
    border: 1px solid #ccc;
    padding: 4mm;
    background: #fafafa;
  }
  .example-title {
    font-size: 11pt;
    font-weight: 600;
    text-align: center;
    margin-bottom: 3mm;
    color: #1a3a5c;
  }
  .example-subtitle {
    font-size: 9pt;
    text-align: center;
    color: #555;
    margin-bottom: 4mm;
  }
  .sig-area {
    margin-bottom: 4mm;
  }
  .sig-line {
    border-bottom: 1px solid #333;
    width: 100%;
    height: 7mm;
    margin-top: 1mm;
    margin-bottom: 0.5mm;
  }
  .sig-label {
    font-size: 8pt;
    color: #666;
    font-style: italic;
  }
  .witness-block {
    border: 1px solid #ccc;
    padding: 2mm 3mm;
    margin-top: 3mm;
  }
  .witness-title { font-weight: 600; font-size: 10pt; margin-bottom: 2mm; }
  .witness-field { margin-top: 2mm; }
  .witness-field-line { border-bottom: 1px solid #333; width: 100%; height: 5mm; margin-top: 0.5mm; }
  .witness-field-label { font-size: 8pt; color: #666; font-style: italic; }
  .footer {
    text-align: center;
    margin-top: 6mm;
    padding-top: 3mm;
    border-top: 2px solid #c0392b;
    font-size: 13pt;
    font-weight: 600;
    color: #c0392b;
    letter-spacing: 0.03em;
  }
  @media print {
    /* ── Page setup ── */
    @page {
      size: A4;
      margin: 14mm 16mm 14mm 16mm;
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

    /* ── Page container: fits on one A4 sheet ── */
    .page {
      width: 100% !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      /* Signing guide is a single page — no forced breaks */
      break-after: avoid;
      page-break-after: avoid;
      /* Use flex column so two-col fills the page height */
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    /* ── Two-column layout fills remaining height ── */
    .two-col {
      flex: 1;
    }

    /* ── Keep each column's content together ── */
    .col-left, .col-right {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* ── Keep headings with their following content ── */
    h2 {
      break-after: avoid;
      page-break-after: avoid;
    }

    /* ── Keep example box together ── */
    .example-box {
      break-inside: avoid;
      page-break-inside: avoid;
      background: #fafafa !important;
    }

    /* ── Keep witness blocks together ── */
    .witness-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* ── Keep signature areas together ── */
    .sig-area {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* ── Preserve the red footer colour ── */
    .footer {
      border-top: 2px solid #c0392b !important;
      color: #c0392b !important;
      break-before: avoid;
      page-break-before: avoid;
    }

    /* ── Orphans / widows ── */
    p, li {
      orphans: 3;
      widows: 3;
    }
  }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="header-logo">GENESIS ESTATE PLANNING</div>
    <div class="header-title">Will Signing Guide${fileRef ? ` — Ref: ${fileRef}` : ""}</div>
    <div class="header-name">${name}</div>
  </div>

  <div class="two-col">

    <!-- ══ LEFT: Instructions ══════════════════════════════════════════════ -->
    <div class="col-left">
      <h2>Important notes on signing your Will</h2>

      <p class="intro">
        A Will becomes legally valid and binding as soon as it is signed by the Testator and observed by two Witnesses together, who will sign to confirm this fact.
      </p>

      <p>It is important that you <span class="sign-now">SIGN AND DATE</span> your Will in front of two Witnesses as soon as possible, <strong>BUT PLEASE READ THE REST OF THIS PAGE FIRST.</strong></p>

      <ul>
        <li>The signing of your Will involves <strong>THREE</strong> people — you and <strong>TWO</strong> Witnesses.</li>
        <li>All <strong>THREE</strong> must be over <strong>18</strong> years old.</li>
        <li>The <strong>WITNESSES</strong> should <strong>NOT</strong> be beneficiaries, spouses of beneficiaries, or members of your own family — even if named as a reserve beneficiary. Signing as a Witness means they will lose their inheritance.</li>
        <li>Make sure that the Witnesses are as <strong>independent</strong> as possible. Ideal Witnesses could be neighbours.</li>
        <li>All THREE people must be present together at the same time when the Will is signed.</li>
        <li>Ask your two <strong>WITNESSES</strong> to add their <strong>"usual" signatures</strong> where required.</li>
        <li>They should also print their <strong>names, addresses and occupations</strong> clearly for identification purposes.</li>
        <li>Do <strong>NOT</strong> make any alterations to the Will after it has been signed — this could invalidate it.</li>
      </ul>
    </div>

    <!-- ══ RIGHT: Example attestation ═════════════════════════════════════ -->
    <div class="col-right">
      <h2>An Example of how to sign your Will</h2>

      <div class="example-box">
        <div class="example-title">The Testimonium and Attestation</div>
        <div class="example-subtitle">SIGNED by <strong>${name}</strong></div>

        <div class="sig-area">
          <div class="sig-line"></div>
          <div class="sig-label">(Signature of Testator — ${name})</div>
        </div>
        <div class="sig-area" style="width:50%">
          <div class="sig-line"></div>
          <div class="sig-label">(Date)</div>
        </div>

        <p style="font-size:9pt; margin:3mm 0; font-style:italic;">
          SIGNED first by the Testator in our joint presence and then by each of us in the presence of the Testator and each other:
        </p>

        <div class="witness-block">
          <div class="witness-title">Witness 1</div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">(Signature of Witness 1)</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Full Name (Independent Witness 1 to print)</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Full Address of Witness 1</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Occupation of Witness 1</div>
          </div>
        </div>

        <div class="witness-block">
          <div class="witness-title">Witness 2</div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">(Signature of Witness 2)</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Full Name (Independent Witness 2 to print)</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Full Address of Witness 2</div>
          </div>
          <div class="witness-field">
            <div class="witness-field-line"></div>
            <div class="witness-field-label">Occupation of Witness 2</div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="footer">Don't Delay — Sign your Will Today!</div>

</div>
</body>
</html>`;
}
