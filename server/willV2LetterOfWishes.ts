/**
 * Will V2 Letter of Wishes Generator
 * Produces a printable Letter of Wishes HTML document from a FullMatter.
 */

export function generateLetterOfWishesHtml(matter: any, clientRole: "testator1" | "testator2"): string {
  const client = (matter.clients || []).find((c: any) => c.clientRole === clientRole);
  const name = client?.fullName || "Unknown";
  const fileRef = matter.fileRef || matter.reference || "";

  // Find the letter of wishes content for this testator
  const low = (matter.lettersOfWishes || []).find((l: any) => l.clientRole === clientRole);
  const content = low?.content || "";

  // Format the will date — use matter's willDate if available, otherwise today
  const willDateRaw = matter.willDate || matter.createdAt;
  let willDate = "";
  if (willDateRaw) {
    try {
      const d = new Date(typeof willDateRaw === "number" ? willDateRaw : willDateRaw);
      willDate = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      willDate = "";
    }
  }
  const willDateText = willDate ? willDate : "[Date of Will]";

  // Convert plain text content to paragraphs
  const paragraphs = content
    .split(/\n\n+/)
    .map((para: string) => para.trim())
    .filter((para: string) => para.length > 0)
    .map((para: string) => {
      // Convert single newlines within a paragraph to <br>
      const lines = para.split(/\n/).map((l: string) => escapeHtml(l)).join("<br>");
      return `<p>${lines}</p>`;
    })
    .join("\n    ");

  const bodyContent = paragraphs || `<p class="empty-notice">No wishes have been recorded for this Letter of Wishes.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Letter of Wishes — ${escapeHtml(name)}</title>
<style>
  /* ── Base ──────────────────────────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a1a1a;
    background: #fff;
  }

  /* ── Page layout ───────────────────────────────────────────────────────── */
  .page {
    max-width: 170mm;
    margin: 0 auto;
    padding: 20mm 0;
    min-height: 100vh;
  }

  /* ── Header ────────────────────────────────────────────────────────────── */
  .doc-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 2px solid #1a3a5c;
    padding-bottom: 6mm;
    margin-bottom: 10mm;
  }

  .doc-header-brand {
    font-family: "Arial", sans-serif;
    font-size: 13pt;
    font-weight: 700;
    color: #1a3a5c;
    letter-spacing: 0.02em;
    line-height: 1.3;
  }

  .doc-header-sub {
    font-family: "Arial", sans-serif;
    font-size: 8.5pt;
    color: #666;
    margin-top: 2px;
  }

  .doc-header-ref {
    font-family: "Arial", sans-serif;
    font-size: 8.5pt;
    color: #888;
    text-align: right;
    line-height: 1.5;
  }

  /* ── Document title ────────────────────────────────────────────────────── */
  .doc-title {
    font-family: "Arial", sans-serif;
    font-size: 17pt;
    font-weight: 700;
    color: #1a3a5c;
    text-align: center;
    margin-bottom: 2mm;
  }

  .doc-subtitle {
    font-family: "Arial", sans-serif;
    font-size: 11pt;
    color: #555;
    text-align: center;
    margin-bottom: 8mm;
  }

  .doc-name {
    font-family: "Arial", sans-serif;
    font-size: 13pt;
    font-weight: 600;
    color: #1a3a5c;
    text-align: center;
    margin-bottom: 10mm;
  }

  /* ── Intro box ─────────────────────────────────────────────────────────── */
  .intro-box {
    border-left: 4px solid #1a3a5c;
    background: #f5f8fc;
    padding: 5mm 6mm;
    margin-bottom: 10mm;
    font-size: 10.5pt;
    color: #333;
    font-style: italic;
    line-height: 1.75;
  }

  /* ── Body content ──────────────────────────────────────────────────────── */
  .wishes-body p {
    margin-bottom: 5mm;
    text-align: justify;
  }

  .wishes-body .empty-notice {
    color: #999;
    font-style: italic;
  }

  /* ── Signature block ───────────────────────────────────────────────────── */
  .sig-block {
    margin-top: 16mm;
    border-top: 1px solid #ccc;
    padding-top: 6mm;
  }

  .sig-block p {
    font-size: 10pt;
    color: #555;
    margin-bottom: 3mm;
  }

  .sig-line {
    display: flex;
    gap: 20mm;
    margin-top: 8mm;
  }

  .sig-field {
    flex: 1;
  }

  .sig-field-label {
    font-size: 9pt;
    color: #888;
    margin-bottom: 8mm;
  }

  .sig-field-line {
    border-bottom: 1px solid #333;
    height: 8mm;
  }

  /* ── Footer ────────────────────────────────────────────────────────────── */
  .doc-footer {
    margin-top: 12mm;
    padding-top: 4mm;
    border-top: 1px solid #e0e0e0;
    font-family: "Arial", sans-serif;
    font-size: 8.5pt;
    color: #aaa;
    text-align: center;
    line-height: 1.5;
  }

  /* ── Print ─────────────────────────────────────────────────────────────── */
  @page {
    size: A4 portrait;
    margin: 20mm 20mm 18mm 20mm;
  }

  @page :first {
    margin-top: 15mm;
  }

  @media print {
    html, body { background: #fff !important; }
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;

    .page {
      max-width: 100%;
      padding: 0;
      min-height: unset;
    }

    .doc-header { break-after: avoid; }
    .intro-box { break-inside: avoid; }
    .sig-block { break-inside: avoid; break-before: avoid; }
    .doc-footer { break-before: avoid; }

    .wishes-body p {
      orphans: 3;
      widows: 3;
    }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="doc-header">
    <div>
      <div class="doc-header-brand">GENESIS WILLS AND ESTATE PLANNING</div>
      <div class="doc-header-sub">England &amp; Wales</div>
    </div>
    <div class="doc-header-ref">
      ${fileRef ? `File Ref: ${escapeHtml(fileRef)}<br>` : ""}
      Letter of Wishes
    </div>
  </div>

  <!-- Title -->
  <div class="doc-title">Letter of Wishes</div>
  <div class="doc-subtitle">prepared by</div>
  <div class="doc-name">${escapeHtml(name)}</div>

  <!-- Introduction -->
  <div class="intro-box">
    This Letter of Wishes is written to accompany my Will dated ${escapeHtml(willDateText)}, and it is intended to provide
    guidance to my Trustees and Executors regarding the administration of my estate. While this document is not
    legally binding, I trust that it will be treated with serious consideration and will serve to clarify my
    intentions for the distribution and management of my assets. The requests and suggestions outlined below are
    made with the aim of ensuring that my wishes are respected and that my family and beneficiaries are provided
    for in accordance with my personal values and long-term objectives.
  </div>

  <!-- Wishes body -->
  <div class="wishes-body">
    ${bodyContent}
  </div>

  <!-- Signature block -->
  <div class="sig-block">
    <p>Signed by the above-named as their Letter of Wishes:</p>
    <div class="sig-line">
      <div class="sig-field">
        <div class="sig-field-line"></div>
        <div class="sig-field-label">Signature of ${escapeHtml(name)}</div>
      </div>
      <div class="sig-field">
        <div class="sig-field-line"></div>
        <div class="sig-field-label">Date</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    Genesis Wills and Estate Planning Ltd &bull; This Letter of Wishes is not a legally binding document.
    ${fileRef ? `&bull; File Ref: ${escapeHtml(fileRef)}` : ""}
  </div>

</div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
