import { ADMIN_EMAILS } from "../shared/willConstants";
import type { WillInstruction } from "../drizzle/schema";

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

function formatProductsList(products: unknown): string {
  if (!Array.isArray(products) || products.length === 0) return "None specified";
  const labels: Record<string, string> = {
    single_will: "Single Will",
    mirror_wills: "Mirror Wills",
    lpa_property_finance: "LPA – Property & Finance",
    lpa_health_welfare: "LPA – Health & Welfare",
    both_lpas: "Both LPAs",
    ppt: "Protective Property Trust (PPT)",
    aat: "Asset Allocation Trust (AAT)",
    right_to_occupy: "Right To Occupy",
    discretionary_trust: "Discretionary Trust",
    vulnerable_trust: "Vulnerable Person's Trust",
    storage: "Will Storage",
  };
  return products.map((p: string) => labels[p] ?? p).join(", ");
}

function formatPersonList(persons: unknown): string {
  if (!Array.isArray(persons) || persons.length === 0) return "None specified";
  return persons
    .map((p: Record<string, string>) =>
      `${p.prefix ?? ""} ${p.firstName ?? ""} ${p.lastName ?? ""}${p.relationship ? ` (${p.relationship})` : ""}`.trim()
    )
    .join("; ");
}

function buildEmailHtml(record: WillInstruction): string {
  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim();
  const client2Name = record.client2FirstName
    ? `${record.client2Prefix ?? ""} ${record.client2FirstName} ${record.client2LastName ?? ""}`.trim()
    : null;

  const recommendations = Array.isArray(record.recommendationsJson) ? record.recommendationsJson : [];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  body { font-family: Georgia, serif; color: #1a3a2a; background: #f9f7f2; margin: 0; padding: 0; }
  .wrapper { max-width: 700px; margin: 0 auto; background: #fff; }
  .header { background: #1a3a2a; padding: 32px 40px; text-align: center; }
  .header h1 { color: #c9a84c; font-size: 22px; margin: 12px 0 4px; letter-spacing: 1px; }
  .header p { color: #a8c4b0; font-size: 13px; margin: 0; }
  .ref-badge { background: #c9a84c; color: #1a3a2a; font-weight: bold; padding: 8px 20px; border-radius: 4px; display: inline-block; margin: 20px 0; font-size: 14px; }
  .section { padding: 24px 40px; border-bottom: 1px solid #e8f0ec; }
  .section h2 { color: #1a3a2a; font-size: 16px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #c9a84c; }
  .field { display: flex; margin-bottom: 8px; }
  .field-label { font-weight: 600; min-width: 200px; color: #2d5a3d; font-size: 13px; }
  .field-value { color: #1a3a2a; font-size: 13px; }
  .rec-item { background: #f0f7f3; border-left: 4px solid #c9a84c; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 4px 4px 0; }
  .rec-title { font-weight: 700; color: #1a3a2a; font-size: 14px; margin-bottom: 4px; }
  .rec-reason { color: #2d5a3d; font-size: 13px; }
  .rec-priority-high { border-left-color: #c0392b; }
  .rec-priority-medium { border-left-color: #c9a84c; }
  .email-draft { background: #f9f7f2; border: 1px solid #d4e6da; border-radius: 6px; padding: 20px; white-space: pre-wrap; font-family: Georgia, serif; font-size: 13px; color: #1a3a2a; line-height: 1.6; }
  .footer { background: #1a3a2a; padding: 20px 40px; text-align: center; }
  .footer p { color: #a8c4b0; font-size: 12px; margin: 4px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>GENESIS ESTATE PLANNING</h1>
    <p>Will Instruction — New Submission</p>
    <div class="ref-badge">Ref: ${record.referenceNumber}</div>
  </div>

  <div class="section">
    <h2>Appointment Details</h2>
    <div class="field"><span class="field-label">Consultant:</span><span class="field-value">${record.consultantName ?? "—"}</span></div>
    <div class="field"><span class="field-label">Consultant Email:</span><span class="field-value">${record.consultantEmail ?? "—"}</span></div>
    <div class="field"><span class="field-label">Appointment Date:</span><span class="field-value">${record.appointmentDate ?? "—"} ${record.appointmentTime ?? ""}</span></div>
    <div class="field"><span class="field-label">Case Coordinator:</span><span class="field-value">${record.caseCoordinatorName ?? "—"}</span></div>
    <div class="field"><span class="field-label">Price Quoted:</span><span class="field-value">${record.priceQuoted ? `£${record.priceQuoted}` : "—"}</span></div>
    <div class="field"><span class="field-label">Products Ordered:</span><span class="field-value">${formatProductsList(record.productsOrdered)}</span></div>
  </div>

  <div class="section">
    <h2>Client 1 — ${client1Name}</h2>
    <div class="field"><span class="field-label">Date of Birth:</span><span class="field-value">${record.client1Dob ?? "—"}</span></div>
    <div class="field"><span class="field-label">Address:</span><span class="field-value">${[record.client1AddressLine1, record.client1City, record.client1Postcode].filter(Boolean).join(", ") || "—"}</span></div>
    <div class="field"><span class="field-label">Marital Status:</span><span class="field-value">${record.client1MaritalStatus ?? "—"}</span></div>
    <div class="field"><span class="field-label">Email:</span><span class="field-value">${record.client1Email ?? "—"}</span></div>
    <div class="field"><span class="field-label">Mobile:</span><span class="field-value">${record.client1Mobile ?? "—"}</span></div>
    <div class="field"><span class="field-label">Nationality:</span><span class="field-value">${record.client1Nationality ?? "—"}</span></div>
  </div>

  ${client2Name ? `
  <div class="section">
    <h2>Client 2 — ${client2Name}</h2>
    <div class="field"><span class="field-label">Date of Birth:</span><span class="field-value">${record.client2Dob ?? "—"}</span></div>
    <div class="field"><span class="field-label">Address:</span><span class="field-value">${[record.client2AddressLine1, record.client2City, record.client2Postcode].filter(Boolean).join(", ") || "—"}</span></div>
    <div class="field"><span class="field-label">Marital Status:</span><span class="field-value">${record.client2MaritalStatus ?? "—"}</span></div>
    <div class="field"><span class="field-label">Email:</span><span class="field-value">${record.client2Email ?? "—"}</span></div>
    <div class="field"><span class="field-label">Mobile:</span><span class="field-value">${record.client2Mobile ?? "—"}</span></div>
  </div>
  ` : ""}

  <div class="section">
    <h2>Executors, Trustees & Guardians</h2>
    <div class="field"><span class="field-label">Executors:</span><span class="field-value">${formatPersonList(record.executors)}</span></div>
    <div class="field"><span class="field-label">Trustees:</span><span class="field-value">${formatPersonList(record.trustees)}</span></div>
    <div class="field"><span class="field-label">Guardians:</span><span class="field-value">${formatPersonList(record.guardians)}</span></div>
  </div>

  <div class="section">
    <h2>Beneficiaries</h2>
    <div class="field"><span class="field-label">Beneficiaries:</span><span class="field-value">${formatPersonList(record.beneficiaries)}</span></div>
    <div class="field"><span class="field-label">Children Benefit Age:</span><span class="field-value">${record.childrenBenefitAge ?? "—"}</span></div>
    <div class="field"><span class="field-label">Vulnerable Beneficiary:</span><span class="field-value">${record.hasVulnerableBeneficiary === "yes" ? `Yes — ${record.vulnerableBeneficiaryDetails ?? ""}` : "No"}</span></div>
  </div>

  <div class="section">
    <h2>Property & Assets</h2>
    <div class="field"><span class="field-label">Property Owned:</span><span class="field-value">${record.propertyOwned === "yes" ? "Yes" : "No"}</span></div>
    ${record.propertyOwned === "yes" ? `
    <div class="field"><span class="field-label">Property Address:</span><span class="field-value">${record.propertyAddress ?? "—"}</span></div>
    <div class="field"><span class="field-label">Ownership Type:</span><span class="field-value">${record.propertyOwnership ?? "—"}</span></div>
    <div class="field"><span class="field-label">Mortgage Outstanding:</span><span class="field-value">${record.mortgageOutstanding === "yes" ? "Yes" : "No"}</span></div>
    <div class="field"><span class="field-label">Estimated Value:</span><span class="field-value">${record.propertyValue ? `£${record.propertyValue}` : "—"}</span></div>
    ` : ""}
    <div class="field"><span class="field-label">Estimated Estate Value:</span><span class="field-value">${record.estimatedEstateValue ? `£${record.estimatedEstateValue}` : "—"}</span></div>
    <div class="field"><span class="field-label">Care Concerns:</span><span class="field-value">${record.careConcerns === "yes" ? `Yes — ${record.careConcernDetails ?? ""}` : "No"}</span></div>
  </div>

  <div class="section">
    <h2>Wishes</h2>
    <div class="field"><span class="field-label">Residuary Estate:</span><span class="field-value">${record.residuaryEstate ?? "—"}</span></div>
    <div class="field"><span class="field-label">Funeral Type:</span><span class="field-value">${record.funeralType ?? "—"}</span></div>
    <div class="field"><span class="field-label">Funeral Wishes:</span><span class="field-value">${record.funeralWishes ?? "—"}</span></div>
    <div class="field"><span class="field-label">Organ Donation:</span><span class="field-value">${record.organDonation ?? "—"}</span></div>
    ${record.specialNotes ? `<div class="field"><span class="field-label">Special Notes:</span><span class="field-value">${record.specialNotes}</span></div>` : ""}
  </div>

  ${recommendations.length > 0 ? `
  <div class="section">
    <h2>Estate Planning Recommendations</h2>
    ${recommendations.map((r: Record<string, string>) => `
    <div class="rec-item rec-priority-${r.priority}">
      <div class="rec-title">⭐ ${r.title}</div>
      <div class="rec-reason">${r.reason}</div>
    </div>`).join("")}
  </div>

  <div class="section">
    <h2>Internal Recommendation Narrative</h2>
    <p style="color:#1a3a2a;font-size:14px;line-height:1.7;">${(record.aiRecommendationNarrative ?? "").replace(/\n/g, "<br/>")}</p>
  </div>

  <div class="section">
    <h2>📧 Client Email Draft — Ready to Send</h2>
    <p style="font-size:12px;color:#666;margin-bottom:12px;">Copy and forward this email to the client at <strong>${record.client1Email ?? "client's email"}</strong></p>
    <div class="email-draft">${record.aiClientEmailDraft ?? ""}</div>
  </div>
  ` : `
  <div class="section">
    <h2>Estate Planning Recommendations</h2>
    <p style="color:#2d5a3d;">The client's current instruction covers all key estate planning areas. No additional recommendations at this time.</p>
  </div>
  `}

  <div class="footer">
    <p>Genesis Estate Planning | genesisestateplanning.info</p>
    <p>This is an automated notification. Reference: ${record.referenceNumber}</p>
  </div>
</div>
</body>
</html>`;
}

export async function sendAdminEmail(record: WillInstruction): Promise<void> {
  if (!FORGE_API_URL || !FORGE_API_KEY) {
    console.warn("[Email] Forge API credentials not available — skipping email send");
    return;
  }

  const client1Name = `${record.client1Prefix ?? ""} ${record.client1FirstName ?? ""} ${record.client1LastName ?? ""}`.trim();
  const subject = `[Genesis EP] New Will Instruction — ${client1Name} | Ref: ${record.referenceNumber}`;
  const html = buildEmailHtml(record);

  for (const recipient of ADMIN_EMAILS) {
    try {
      const response = await fetch(`${FORGE_API_URL}/v1/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FORGE_API_KEY}`,
        },
        body: JSON.stringify({
          to: recipient,
          subject,
          html,
          from_name: "Genesis Estate Planning",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[Email] Failed to send to ${recipient}: ${response.status} ${text}`);
      } else {
        console.log(`[Email] Sent successfully to ${recipient}`);
      }
    } catch (err: unknown) {
      console.error(`[Email] Error sending to ${recipient}:`, err);
    }
  }
}
