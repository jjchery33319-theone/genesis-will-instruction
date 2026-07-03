import nodemailer from "nodemailer";
import type { WillInstruction } from "../drizzle/schema";
import { PRODUCTS } from "../shared/willConstants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildConsiderHtml(record: any): string {
  const considerLPA = !!record.considerLPA;
  const considerPPT = !!record.considerPPT;
  const considerAAT = !!record.considerAAT;
  const manualNeeds = (record.manualNeedsAssessment as string | null | undefined)?.trim();
  if (!considerLPA && !considerPPT && !considerAAT && !manualNeeds) return "";

  const bullets: string[] = [];
  if (considerLPA) bullets.push(
    `<li style="margin:0 0 8px;font-size:13px;color:#374151;line-height:1.6;">` +
    `<strong>Lasting Power of Attorney (LPA)</strong> &mdash; A legal document appointing trusted people to manage health, welfare, property and finances if mental capacity is lost.</li>`
  );
  if (considerPPT) bullets.push(
    `<li style="margin:0 0 8px;font-size:13px;color:#374151;line-height:1.6;">` +
    `<strong>Protective Property Trust (PPT)</strong> &mdash; A Will trust that ring-fences the deceased&rsquo;s share of the family home, protecting it from care-home fees, remarriage or creditors while allowing the survivor to remain in the property.</li>`
  );
  if (considerAAT) bullets.push(
    `<li style="margin:0 0 8px;font-size:13px;color:#374151;line-height:1.6;">` +
    `<strong>Asset Allocation Trust (AAT)</strong> &mdash; A flexible trust giving trustees discretion over how and when assets are distributed to beneficiaries, ideal for protecting inheritances for vulnerable or young beneficiaries.</li>`
  );

  let html = `<div style="background:#f0f7f3;border-left:4px solid #1a4d35;border-radius:4px;padding:18px 20px;">
    <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:15px;font-weight:bold;color:#1a4d35;">
      Needs Assessment &amp; Recommendations
    </p>`;

  if (bullets.length) {
    html += `<p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#1a4d35;">Client should consider:</p>
    <ul style="margin:0 0 12px;padding-left:18px;">${bullets.join("")}</ul>`;
  }
  if (manualNeeds) {
    if (bullets.length) {
      html += `<p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#1a4d35;">Additional notes:</p>`;
    }
    html += `<p style="margin:0;font-size:13px;color:#374151;line-height:1.6;white-space:pre-line;">${manualNeeds}</p>`;
  }
  html += `</div>`;
  return html;
}

function buildConsiderText(record: any): string {
  const considerLPA = !!record.considerLPA;
  const considerPPT = !!record.considerPPT;
  const considerAAT = !!record.considerAAT;
  const manualNeeds = (record.manualNeedsAssessment as string | null | undefined)?.trim();
  if (!considerLPA && !considerPPT && !considerAAT && !manualNeeds) {
    return "No needs assessment or recommendations were recorded for this instruction.";
  }
  const lines: string[] = [];
  if (considerLPA || considerPPT || considerAAT) {
    lines.push("Client should consider:");
    if (considerLPA) lines.push("  • Lasting Power of Attorney (LPA) — A legal document appointing trusted people to manage health, welfare, property and finances if mental capacity is lost.");
    if (considerPPT) lines.push("  • Protective Property Trust (PPT) — A Will trust that ring-fences the deceased's share of the family home, protecting it from care-home fees, remarriage or creditors while allowing the survivor to remain in the property.");
    if (considerAAT) lines.push("  • Asset Allocation Trust (AAT) — A flexible trust giving trustees discretion over how and when assets are distributed to beneficiaries, ideal for protecting inheritances for vulnerable or young beneficiaries.");
  }
  if (manualNeeds) {
    if (lines.length) lines.push("");
    lines.push("Additional notes:");
    lines.push(manualNeeds);
  }
  return lines.join("\n");
}

function safe(v: string | null | undefined): string {
  return v?.trim() || "—";
}

function safeArr(v: unknown): unknown[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v as string) || []; } catch { return []; }
}

function getProductLabel(id: string): string {
  return PRODUCTS.find(p => p.id === id)?.label ?? id;
}

function formatProductsList(products: unknown): string {
  const arr = safeArr(products) as string[];
  if (!arr.length) return "—";
  return arr.map(getProductLabel).join(", ");
}

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[ClientEmail] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping client email.");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

// ─── HTML builder ─────────────────────────────────────────────────────────────
export function buildClientEmailPreview(record: WillInstruction): string {
  return buildClientEmailHtml(record);
}

function buildClientEmailHtml(record: WillInstruction): string {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const products = formatProductsList(record.productsOrdered);
  const ref = safe(record.referenceNumber);
  const appointmentDate = record.appointmentDate
    ? new Date(record.appointmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
  const consultantName = safe(record.consultantName);

  const _recsInner1 = buildConsiderHtml(record as any);
  const recsHtml = _recsInner1
    ? `<tr><td style="padding:0 32px 24px;">${_recsInner1}</td></tr>`
    : `<tr><td style="padding:0 32px 24px;">
          <div style="background:#f0f7f3;border-left:4px solid #1a4d35;border-radius:4px;padding:18px 20px;">
            <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:15px;font-weight:bold;color:#1a4d35;">Your Recommendations</p>
            <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">You will receive a follow-up email containing the full details of the recommendations discussed during your appointment.</p>
          </div></td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a4d35 0%,#2d6b4a 100%);padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:0.3px;">
                      Genesis Wills and Estate Planning
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#b8d4c2;">Will Instruction Confirmation</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 20px;">
              <p style="margin:0 0 12px;font-size:15px;color:#111827;line-height:1.6;">
                Dear ${client1Name},
              </p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">
                Thank you for your appointment with us at Genesis Wills and Estate Planning. We are pleased to confirm that your Will instruction has been received from your adviser and is now being processed by our admin team.
              </p>
            </td>
          </tr>

          <!-- Reference box -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a4d35;border-radius:8px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#b8d4c2;text-transform:uppercase;letter-spacing:1px;">Reference Number</p>
                    <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#b8860b;letter-spacing:1px;">${ref}</p>
                    <p style="margin:8px 0 0;font-size:12px;color:#b8d4c2;">Please quote this reference in all correspondence with us.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Appointment summary -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:15px;font-weight:bold;color:#1a4d35;">Appointment Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <tr style="background:#f9fafb;">
                  <td style="padding:10px 16px;font-size:12px;font-weight:bold;color:#6b7280;width:40%;border-bottom:1px solid #e5e7eb;">Appointment Date</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">${appointmentDate}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:12px;font-weight:bold;color:#6b7280;border-bottom:1px solid #e5e7eb;">Consultant</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;">${consultantName}</td>
                </tr>
                <tr style="background:#f9fafb;">
                  <td style="padding:10px 16px;font-size:12px;font-weight:bold;color:#6b7280;">Products Ordered</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;">${products}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Recommendations -->
          ${recsHtml}

          <!-- Next steps -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:15px;font-weight:bold;color:#1a4d35;">What Happens Next</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  ["1", "Instruction Review", "Our team will review your completed Will instruction and prepare your Welcome pack which is a summary of the information taken during the appointment (it is for you to review to make sure all information is correct before production of your draft)."],
                  ["2", "Recommendations Follow-Up", "You will receive a separate email with the full details of the estate planning recommendations discussed during your appointment."],
                  ["3", "Draft Documents", "Your draft Will (and any other documents ordered) will be sent to you for review and approval."],
                  ["4", "Signing & Execution", "Once approved, we will guide you through the signing process to make your Will legally valid."],
                ].map(([num, title, desc]) => `
                <tr>
                  <td style="padding:0 0 14px;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:12px;">
                          <div style="width:24px;height:24px;background:#1a4d35;border-radius:50%;text-align:center;line-height:24px;font-size:11px;font-weight:bold;color:#ffffff;">${num}</div>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 2px;font-size:13px;font-weight:bold;color:#111827;">${title}</p>
                          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">${desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="background:#fef9ec;border:1px solid #b8860b;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#92660a;">Questions?</p>
                <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                  If you have any questions about your instruction, please contact your consultant
                  <strong>${consultantName !== "—" ? ` ${consultantName}` : ""}</strong>
                  or reply to this email and our team will be happy to help.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a4d35;padding:20px 32px;">
              <p style="margin:0;font-size:11px;color:#b8d4c2;text-align:center;line-height:1.6;">
                Genesis Wills and Estate Planning &nbsp;|&nbsp; Will Instruction Confirmation &nbsp;|&nbsp; Ref: ${ref}
              </p>
              <p style="margin:6px 0 0;font-size:10px;color:#6b9e80;text-align:center;">
                This email is intended solely for the named recipient. If you have received this in error, please disregard it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Plain-text fallback ──────────────────────────────────────────────────────
function buildClientEmailText(record: WillInstruction): string {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const products = formatProductsList(record.productsOrdered);
  const ref = safe(record.referenceNumber);
  const appointmentDate = record.appointmentDate
    ? new Date(record.appointmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
  const recs = safeArr(record.recommendationsJson) as Array<{ title?: string; description?: string }>;

  return [
    `Dear ${client1Name},`,
    ``,
    `Thank you for your appointment with us at Genesis Wills and Estate Planning. We are pleased to confirm that your Will instruction has been received from your adviser and is now being processed by our admin team.`,
    ``,
    `REFERENCE NUMBER: ${ref}`,
    `Please quote this reference in all correspondence with us.`,
    ``,
    `APPOINTMENT SUMMARY`,
    `Date: ${appointmentDate}`,
    `Consultant: ${safe(record.consultantName)}`,
    `Products Ordered: ${products}`,
    ``,
    `RECOMMENDATIONS`,
    ...(recs.length
      ? [
          `The following recommendations were discussed during your appointment. You will receive a follow-up email with the full details shortly.`,
          ``,
          ...recs.map((r, i) => `${i + 1}. ${r.title ?? "Recommendation"}${r.description ? `: ${r.description}` : ""}`),
        ]
      : [`You will receive a follow-up email containing the full details of the recommendations discussed during your appointment.`]),
    ``,
    `WHAT HAPPENS NEXT`,
    `1. Our team will review your completed Will instruction and prepare your Welcome pack which is a summary of the information taken during the appointment (it is for you to review to make sure all information is correct before production of your draft).`,
    `2. You will receive a separate email with the full estate planning recommendations.`,
    `3. Your draft Will will be sent to you for review and approval.`,
    `4. Once approved, we will guide you through the signing process.`,
    ``,
    `If you have any questions, please contact your consultant or reply to this email.`,
    ``,
    `Genesis Wills and Estate Planning`,
  ].join("\n");
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function sendClientConfirmationEmail(record: WillInstruction): Promise<void> {
  const clientEmail = record.client1Email?.trim();
  if (!clientEmail) {
    console.log("[ClientEmail] No client email address on record — skipping client confirmation.");
    return;
  }

  const transporter = createTransporter();
  if (!transporter) return;

  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const subject = `Your Will Instruction Confirmation — Ref: ${safe(record.referenceNumber)} | Genesis Wills and Estate Planning`;
  const html = buildClientEmailHtml(record);
  const text = buildClientEmailText(record);
  const fromAddress = process.env.GMAIL_USER!;

  try {
    const info = await transporter.sendMail({
      from: `"Genesis Wills and Estate Planning" <${fromAddress}>`,
      to: clientEmail,
      subject,
      text,
      html,
    });
    console.log(`[ClientEmail] Confirmation sent to ${clientEmail} — messageId: ${info.messageId}`);

    // Also send to Client 2 if they have an email
    const client2Email = record.client2Email?.trim();
    if (client2Email && client2Email !== clientEmail) {
      const c2Name = `${record.client2Prefix ?? ""} ${record.client2FirstName ?? ""} ${record.client2LastName ?? ""}`.trim() || "Client 2";
      await transporter.sendMail({
        from: `"Genesis Wills and Estate Planning" <${fromAddress}>`,
        to: client2Email,
        subject,
        text: text.replace(`Dear ${client1Name}`, `Dear ${c2Name}`),
        html: html.replace(`Dear ${client1Name}`, `Dear ${c2Name}`),
      });
      console.log(`[ClientEmail] Confirmation sent to Client 2 at ${client2Email}`);
    }
  } catch (err) {
    console.error(`[ClientEmail] Failed to send confirmation to ${clientEmail}:`, err);
  }
}

// ─── Adviser Confirmation Email ───────────────────────────────────────────────

function buildAdviserEmailHtml(record: WillInstruction): string {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const client2Name = record.client2FirstName
    ? `${record.client2Prefix ?? ""} ${record.client2FirstName ?? ""} ${record.client2LastName ?? ""}`.trim()
    : null;
  const clientDisplay = client2Name ? `${client1Name} &amp; ${client2Name}` : client1Name;
  const ref = safe(record.referenceNumber);
  const products = formatProductsList(record.productsOrdered);
  const appointmentDate = record.appointmentDate
    ? new Date(record.appointmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
  const consultantName = safe(record.consultantName);
  const _recsInner2 = buildConsiderHtml(record as any);
  const needsSection = _recsInner2
    ? `<tr><td style="padding:0 32px 24px;">${_recsInner2}</td></tr>`
    : `<tr><td style="padding:0 32px 24px;">
          <div style="background:#f9fafb;border-left:4px solid #d1d5db;border-radius:4px;padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">No needs assessment or recommendations were recorded for this instruction.</p>
          </div></td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a4d35 0%,#2d6b4a 100%);padding:28px 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#d4af37;letter-spacing:0.5px;">
                Genesis Wills and Estate Planning
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:1px;text-transform:uppercase;">
                Adviser Instruction Confirmation
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 16px;">
              <p style="margin:0 0 12px;font-size:15px;color:#111827;line-height:1.6;">
                Dear ${consultantName},
              </p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">
                This is to confirm that a Will instruction has been successfully submitted for the following client(s). Please find the details below for your records.
              </p>
            </td>
          </tr>

          <!-- Reference Banner -->
          <tr>
            <td style="padding:0 32px 20px;">
              <div style="background:linear-gradient(135deg,#1a4d35,#2d6b4a);border-radius:8px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">
                <div>
                  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;">Reference Number</p>
                  <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#d4af37;">${ref}</p>
                </div>
                <div style="text-align:right;">
                  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;">Appointment Date</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#ffffff;">${appointmentDate}</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Client Details -->
          <tr>
            <td style="padding:0 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <tr>
                  <td colspan="2" style="background:#f9fafb;padding:10px 16px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;font-weight:bold;color:#1a4d35;text-transform:uppercase;letter-spacing:0.5px;">Client Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#6b7280;width:40%;border-bottom:1px solid #f3f4f6;">Client(s)</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">${clientDisplay}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:13px;color:#6b7280;width:40%;">Products Ordered</td>
                  <td style="padding:10px 16px;font-size:13px;color:#111827;font-weight:600;">${products}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Needs Assessment -->
          ${needsSection}

          <!-- Footer -->
          <tr>
            <td style="background:#1a4d35;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.6);">
                Genesis Wills and Estate Planning &nbsp;|&nbsp; This email is for adviser reference only
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAdviserEmailText(record: WillInstruction): string {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const client2Name = record.client2FirstName
    ? `${record.client2Prefix ?? ""} ${record.client2FirstName ?? ""} ${record.client2LastName ?? ""}`.trim()
    : null;
  const clientDisplay = client2Name ? `${client1Name} & ${client2Name}` : client1Name;
  const ref = safe(record.referenceNumber);
  const products = formatProductsList(record.productsOrdered);
  const appointmentDate = record.appointmentDate
    ? new Date(record.appointmentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
  const consultantName = safe(record.consultantName);

  return `Genesis Wills and Estate Planning — Adviser Instruction Confirmation

Dear ${consultantName},

This is to confirm that a Will instruction has been successfully submitted for the following client(s).

Reference Number: ${ref}
Appointment Date: ${appointmentDate}
Client(s): ${clientDisplay}
Products Ordered: ${products}

NEEDS ASSESSMENT & RECOMMENDATIONS
${buildConsiderText(record as any)}

---
Genesis Wills and Estate Planning | This email is for adviser reference only
`;
}

export async function sendAdviserConfirmationEmail(record: WillInstruction): Promise<void> {
  const consultantEmail = record.consultantEmail?.trim();
  if (!consultantEmail) {
    console.log("[AdviserEmail] No consultant email on record — skipping adviser confirmation.");
    return;
  }

  const transporter = createTransporter();
  if (!transporter) return;

  const ref = safe(record.referenceNumber);
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim() || "Client";
  const subject = `Instruction Submitted — ${client1Name} | Ref: ${ref} | Genesis Wills and Estate Planning`;
  const html = buildAdviserEmailHtml(record);
  const text = buildAdviserEmailText(record);
  const fromAddress = process.env.GMAIL_USER!;

  try {
    const info = await transporter.sendMail({
      from: `"Genesis Wills and Estate Planning" <${fromAddress}>`,
      to: consultantEmail,
      subject,
      html,
      text,
    });
    console.log(`[AdviserEmail] Confirmation sent to adviser ${consultantEmail} — messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[AdviserEmail] Failed to send adviser confirmation to ${consultantEmail}:`, err);
  }
}
