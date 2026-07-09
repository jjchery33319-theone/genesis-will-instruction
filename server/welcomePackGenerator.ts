/**
 * welcomePackGenerator.ts
 * Generates a beautiful, branded Welcome Pack for Genesis Wills and Estate Planning.
 * Produces HTML that is then converted to PDF via Puppeteer, or to DOCX via html-to-docx.
 */

type WillRecord = Record<string, any>;

function fmt(v: any): string {
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}

function fmtDate(v: any): string {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return String(v);
  }
}

function fmtDateShort(v: any): string {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return String(v);
  }
}

function fullName(prefix: any, first: any, middle: any, last: any): string {
  return [prefix, first, middle, last].filter(Boolean).join(" ");
}

function personName(p: any): string {
  if (!p) return "";
  return [p.prefix, p.firstName, p.lastName].filter(Boolean).join(" ");
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function willTypeLabel(wt: string): string {
  const map: Record<string, string> = {
    "Single Will": "Single Will",
    "Mirror Will": "Mirror Wills",
    "Mirror Wills": "Mirror Wills",
    "Joint Will": "Joint Will",
    "single": "Single Will",
    "mirror": "Mirror Wills",
  };
  return map[wt] || wt || "Will";
}

export function generateWelcomePackHtml(record: WillRecord): string {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isMirror = (record.willType || "").toLowerCase().includes("mirror");

  const c1Name = fullName(record.client1Prefix, record.client1FirstName, record.client1MiddleName, record.client1LastName);
  const c2Name = isMirror ? fullName(record.client2Prefix, record.client2FirstName, record.client2MiddleName, record.client2LastName) : "";

  const salutation = isMirror && c2Name
    ? `Dear ${record.client1FirstName || "Client"} & ${record.client2FirstName || "Client"},`
    : `Dear ${record.client1FirstName || "Client"},`;

  const addressLines = [
    c1Name,
    isMirror && c2Name ? c2Name : null,
    record.client1AddressLine1,
    record.client1City,
    record.client1Postcode,
  ].filter(Boolean);

  const consultantName = fmt(record.consultantName) || "Your Consultant";
  const consultantEmail = fmt(record.consultantEmail);
  const consultantPhone = fmt(record.consultantPhone);
  const coordinatorName = fmt(record.caseCoordinatorName) || "Case Coordinator";
  const coordinatorEmail = fmt(record.caseCoordinatorEmail);
  const coordinatorPhone = fmt(record.caseCoordinatorPhone);

  // Children
  const c1Under18: any[] = Array.isArray(record.client1ChildrenUnder18) ? record.client1ChildrenUnder18 : [];
  const c1Over18: any[] = Array.isArray(record.client1ChildrenOver18) ? record.client1ChildrenOver18 : [];
  const c2Under18: any[] = Array.isArray(record.client2ChildrenUnder18) ? record.client2ChildrenUnder18 : [];
  const c2Over18: any[] = Array.isArray(record.client2ChildrenOver18) ? record.client2ChildrenOver18 : [];
  const allChildren = [...c1Under18, ...c1Over18, ...(isMirror ? [...c2Under18, ...c2Over18] : [])];
  // Deduplicate by name
  const seenChildren = new Set<string>();
  const uniqueChildren = allChildren.filter(c => {
    const key = personName(c);
    if (!key || seenChildren.has(key)) return false;
    seenChildren.add(key);
    return true;
  });

  // Executors
  const c1Execs: any[] = Array.isArray(record.client1Executors) ? record.client1Executors : (Array.isArray(record.executors) ? record.executors : []);
  const c1ResExecs: any[] = Array.isArray(record.client1ReservedExecutors) ? record.client1ReservedExecutors : (Array.isArray(record.reservedExecutors) ? record.reservedExecutors : []);
  const c2Execs: any[] = Array.isArray(record.client2Executors) ? record.client2Executors : [];
  const c2ResExecs: any[] = Array.isArray(record.client2ReservedExecutors) ? record.client2ReservedExecutors : [];

  // Guardians
  const c1Guards: any[] = Array.isArray(record.client1Guardians) ? record.client1Guardians : (Array.isArray(record.guardians) ? record.guardians : []);
  const c1ResGuards: any[] = Array.isArray(record.client1ReservedGuardians) ? record.client1ReservedGuardians : (Array.isArray(record.reservedGuardians) ? record.reservedGuardians : []);

  // Beneficiaries
  const c1Bens: any[] = Array.isArray(record.client1Beneficiaries) ? record.client1Beneficiaries : (Array.isArray(record.beneficiaries) ? record.beneficiaries : []);
  const c2Bens: any[] = Array.isArray(record.client2Beneficiaries) ? record.client2Beneficiaries : [];

  // Gifts
  const c1Gifts: any[] = Array.isArray(record.client1SpecificGifts) ? record.client1SpecificGifts : (Array.isArray(record.specificGifts) ? record.specificGifts : []);
  const c2Gifts: any[] = Array.isArray(record.client2SpecificGifts) ? record.client2SpecificGifts : [];
  const hasGifts = c1Gifts.length > 0 || c2Gifts.length > 0;

  // Property
  const propOwned = fmt(record.propertyOwned);
  const propAddress = fmt(record.propertyAddress);
  const propOwnership = fmt(record.propertyOwnership);
  const propValue = fmt(record.propertyValue);
  const mortgage = fmt(record.mortgageOutstanding);
  const lifeInsurance = fmt(record.hasLifeInsurance);
  const lifeInsurancePolicies: any[] = Array.isArray(record.lifeInsurancePolicies) ? record.lifeInsurancePolicies : [];
  const assetsOutsideUK = fmt(record.assetsOutsideUK);

  // Funeral
  const c1FuneralType = fmt(record.client1FuneralType) || fmt(record.funeralType);
  const c1FuneralWishes = fmt(record.client1FuneralWishes) || fmt(record.funeralWishes);
  const c1OrganDonation = fmt(record.client1OrganDonation) || fmt(record.organDonation);
  const c2FuneralType = fmt(record.client2FuneralType);
  const c2FuneralWishes = fmt(record.client2FuneralWishes);
  const c2OrganDonation = fmt(record.client2OrganDonation);

  const refNum = fmt(record.referenceNumber);
  const estimatedDraft = fmtDate(record.estimatedDraftDate);

  // SVG icons (inline, small, gold)
  const iconFamily = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  const iconScales = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
  const iconShield = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  const iconHeart = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  const iconGift = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
  const iconPie = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`;
  const iconHome = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  const iconStar = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const iconCheck = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const iconArrow = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

  // Tree SVG for cover page
  const treeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="160" height="176">
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#C9A84C" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#C9A84C" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#glow)"/>
    <!-- Trunk -->
    <rect x="90" y="140" width="20" height="60" rx="4" fill="#C9A84C" opacity="0.9"/>
    <!-- Roots -->
    <path d="M90 195 Q75 205 60 200" stroke="#C9A84C" stroke-width="3" fill="none" opacity="0.7"/>
    <path d="M110 195 Q125 205 140 200" stroke="#C9A84C" stroke-width="3" fill="none" opacity="0.7"/>
    <path d="M95 198 Q90 210 80 215" stroke="#C9A84C" stroke-width="2" fill="none" opacity="0.5"/>
    <path d="M105 198 Q110 210 120 215" stroke="#C9A84C" stroke-width="2" fill="none" opacity="0.5"/>
    <!-- Main canopy layers -->
    <ellipse cx="100" cy="110" rx="70" ry="50" fill="#1B4332" opacity="0.95"/>
    <ellipse cx="100" cy="85" rx="55" ry="42" fill="#2D6A4F" opacity="0.95"/>
    <ellipse cx="100" cy="62" rx="40" ry="32" fill="#1B4332" opacity="0.95"/>
    <ellipse cx="100" cy="42" rx="26" ry="22" fill="#2D6A4F" opacity="0.95"/>
    <!-- Gold leaf highlights -->
    <ellipse cx="70" cy="95" rx="18" ry="12" fill="#C9A84C" opacity="0.25"/>
    <ellipse cx="130" cy="90" rx="15" ry="10" fill="#C9A84C" opacity="0.2"/>
    <ellipse cx="100" cy="55" rx="14" ry="9" fill="#C9A84C" opacity="0.3"/>
    <!-- Small gold dots (berries/flowers) -->
    <circle cx="80" cy="88" r="3" fill="#C9A84C" opacity="0.8"/>
    <circle cx="120" cy="82" r="2.5" fill="#C9A84C" opacity="0.7"/>
    <circle cx="100" cy="48" r="3" fill="#C9A84C" opacity="0.9"/>
    <circle cx="88" cy="68" r="2" fill="#C9A84C" opacity="0.6"/>
    <circle cx="113" cy="72" r="2" fill="#C9A84C" opacity="0.6"/>
    <circle cx="65" cy="108" r="2" fill="#C9A84C" opacity="0.5"/>
    <circle cx="135" cy="105" r="2" fill="#C9A84C" opacity="0.5"/>
  </svg>`;

  // Helper: section heading
  function sectionHeading(icon: string, title: string): string {
    return `<div class="section-heading"><span class="section-icon">${icon}</span><span class="section-title">${title}</span></div>`;
  }

  // Helper: info card
  function infoCard(label: string, value: string): string {
    if (!value) return "";
    return `<div class="info-card"><div class="info-label">${label}</div><div class="info-value">${value}</div></div>`;
  }

  // Helper: person block
  function personBlock(label: string, p: any): string {
    const name = personName(p);
    if (!name) return "";
    const dob = p.dob || p.dateOfBirth ? fmtDateShort(p.dob || p.dateOfBirth) : "";
    const addr = p.address ? `<div class="person-detail"><span class="detail-label">Address:</span> ${p.address}</div>` : "";
    const dobHtml = dob ? `<div class="person-detail"><span class="detail-label">Date of Birth:</span> ${dob}</div>` : "";
    return `<div class="person-block"><div class="person-name">${name}</div>${dobHtml}${addr}</div>`;
  }

  // Helper: executor section HTML
  function executorSection(label: string, primaries: any[], substitutes: any[]): string {
    if (!primaries.length && !substitutes.length) return "";
    let html = `<div class="subsection"><div class="subsection-label">${label}</div>`;
    if (primaries.length) {
      html += `<p class="body-text">You have appointed the following as your <strong>Primary Executor${primaries.length > 1 ? "s" : ""}</strong>:</p>`;
      html += `<div class="person-grid">` + primaries.map(p => personBlock("", p)).join("") + `</div>`;
    }
    if (substitutes.length) {
      html += `<p class="body-text" style="margin-top:10px">Should ${primaries.length > 1 ? "any of them be" : "they be"} unable or unwilling to act, you have appointed the following <strong>Substitute Executor${substitutes.length > 1 ? "s" : ""}</strong>:</p>`;
      html += `<div class="person-grid">` + substitutes.map(p => personBlock("", p)).join("") + `</div>`;
    }
    html += `</div>`;
    return html;
  }

  // Helper: beneficiary list
  function benList(bens: any[]): string {
    if (!bens.length) return "";
    return `<ul class="ben-list">` + bens.map(b => {
      const name = personName(b);
      const share = b.share || b.shareFraction || b.sharePercentage || "";
      const shareStr = share ? ` <span class="share-badge">${share}</span>` : "";
      const rel = b.relationship ? ` <span class="rel-tag">${b.relationship}</span>` : "";
      return `<li class="ben-item"><span class="ben-name">${name}</span>${rel}${shareStr}</li>`;
    }).join("") + `</ul>`;
  }

  // Helper: gift list
  // Resolve recipient label: prefer group label over named individual
  function recipientLabel(g: any): string {
    const group = g.recipientGroup || "";
    if (group && group !== "__named" && group !== "named" && group !== "Named individual") {
      return group;
    }
    return g.recipient || g.recipientName || personName(g) || "";
  }

  function giftList(gifts: any[], clientLabel: string): string {
    if (!gifts.length) return "";
    let html = `<div class="gift-section"><div class="gift-client-label">${clientLabel}</div>`;
    html += `<div class="gift-grid">`;
    gifts.forEach(g => {
      const item = g.description || g.giftDescription || g.item || "";
      const recipient = recipientLabel(g);
      const giftTypeLabel = g.giftType === "monetary" ? " (Monetary)" : g.giftType === "property" ? " (Property)" : "";
      const onSecondDeath = g.onSecondDeath === 1 || g.onSecondDeath === true;
      if (!item && !recipient) return;
      html += `<div class="gift-card">`;
      html += `<div class="gift-item">${item}${giftTypeLabel}</div>`;
      html += `<div class="gift-to">→ ${recipient}</div>`;
      if (onSecondDeath) {
        html += `<div style="margin-top:5px;display:inline-block;background:#FFF3CD;border:1px solid #C9A84C;border-radius:4px;padding:2px 8px;font-size:8pt;color:#7D5A00;font-weight:600">⌛ Gift on 2nd death only</div>`;
      }
      html += `</div>`;
    });
    html += `</div></div>`;
    return html;
  }

  // Gift of Property clause helper (for V2 property data passed in)
  function giftOfPropertySection(properties: any[]): string {
    const withGift = properties.filter((p: any) => p.giftOfProperty === 1 || p.giftOfProperty === true);
    if (!withGift.length) return "";
    let html = `<div style="margin-top:14px">`;
    html += `<div style="font-weight:700;color:#1B4332;font-size:9.5pt;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Gift of Property Clause</div>`;
    withGift.forEach((p: any) => {
      const addr = fmt(p.address) || "Property";
      const group = p.giftRecipientGroup;
      const isNamed = !group || group === "__named" || group === "named" || group === "Named individual";
      const recipientDisplay = isNamed ? (fmt(p.giftRecipientName) || "Named individual") : group;
      html += `<div style="background:#f8faf9;border:1px solid #e0e8e4;border-left:3px solid #C9A84C;border-radius:6px;padding:10px 14px;margin-bottom:8px">`;
      html += `<div style="font-weight:600;color:#1B4332;font-size:9pt">${addr}</div>`;
      html += `<div style="color:#444;font-size:9pt;margin-top:4px">Gift to: <strong>${recipientDisplay}</strong></div>`;
      if (isNamed && fmt(p.giftRecipientAddress)) html += `<div style="color:#666;font-size:8.5pt;margin-top:2px">Address: ${fmt(p.giftRecipientAddress)}</div>`;
      if (fmt(p.giftCondition)) html += `<div style="color:#555;font-size:8.5pt;margin-top:4px;font-style:italic">Condition: ${fmt(p.giftCondition)}</div>`;
      if (fmt(p.giftNotes)) html += `<div style="color:#555;font-size:8.5pt;margin-top:4px">Notes: ${fmt(p.giftNotes)}</div>`;
      html += `</div>`;
    });
    html += `</div>`;
    return html;
  }

  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.6;
    }

    /* ── COVER PAGE ─────────────────────────────── */
    .cover-page {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(160deg, #0d2b1e 0%, #1B4332 45%, #2D6A4F 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      padding: 60px 40px;
    }

    .cover-bg-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(201,168,76,0.06);
    }
    .cover-bg-circle.c1 { width: 500px; height: 500px; top: -150px; right: -150px; }
    .cover-bg-circle.c2 { width: 350px; height: 350px; bottom: -100px; left: -80px; }
    .cover-bg-circle.c3 { width: 200px; height: 200px; top: 40%; left: 10%; }

    .cover-top-bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #C9A84C, #e8c96a, #C9A84C);
    }
    .cover-bottom-bar {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #C9A84C, #e8c96a, #C9A84C);
    }

    .cover-tree { margin-bottom: 28px; filter: drop-shadow(0 8px 24px rgba(201,168,76,0.3)); }

    .cover-company {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 13pt;
      color: #C9A84C;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 6px;
      opacity: 0.9;
    }

    .cover-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 28pt;
      font-weight: 700;
      color: #ffffff;
      text-align: center;
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .cover-subtitle {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 14pt;
      color: rgba(255,255,255,0.7);
      margin-bottom: 36px;
      font-style: italic;
    }

    .cover-divider {
      width: 80px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #C9A84C, transparent);
      margin: 0 auto 36px;
    }

    .cover-meta-box {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 12px;
      padding: 24px 36px;
      text-align: center;
      backdrop-filter: blur(4px);
      min-width: 320px;
    }

    .cover-meta-label {
      font-size: 8pt;
      color: #C9A84C;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .cover-client-name {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 18pt;
      color: #ffffff;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .cover-meta-row {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 12px;
    }

    .cover-meta-item {
      text-align: center;
    }

    .cover-meta-item-label {
      font-size: 7.5pt;
      color: rgba(201,168,76,0.8);
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .cover-meta-item-value {
      font-size: 9.5pt;
      color: rgba(255,255,255,0.9);
      font-weight: 500;
    }

    .cover-confidential {
      position: absolute;
      bottom: 28px;
      font-size: 7.5pt;
      color: rgba(255,255,255,0.4);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* ── CONTENT PAGES ──────────────────────────── */
    .content-page {
      padding: 0;
      page-break-before: always;
    }

    .page-header {
      background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
      padding: 18px 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-header-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-header-logo-tree {
      width: 32px;
      height: 32px;
    }

    .page-header-company {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 10pt;
      color: #C9A84C;
      letter-spacing: 1px;
    }

    .page-header-ref {
      font-size: 8pt;
      color: rgba(255,255,255,0.6);
      letter-spacing: 0.5px;
    }

    .page-content {
      padding: 32px 40px 40px;
    }

    .page-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 18pt;
      font-weight: 700;
      color: #1B4332;
      margin-bottom: 6px;
    }

    .page-title-bar {
      width: 50px;
      height: 3px;
      background: linear-gradient(90deg, #C9A84C, #e8c96a);
      border-radius: 2px;
      margin-bottom: 24px;
    }

    /* ── SECTION HEADINGS ───────────────────────── */
    .section-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 24px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #e8c96a;
    }

    .section-icon { display: flex; align-items: center; }

    .section-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      font-weight: 600;
      color: #1B4332;
      letter-spacing: 0.3px;
    }

    /* ── INFO CARDS ─────────────────────────────── */
    .info-cards-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 12px 0;
    }

    .info-card {
      background: #f8faf9;
      border: 1px solid #d4e8dc;
      border-left: 3px solid #C9A84C;
      border-radius: 6px;
      padding: 8px 14px;
      min-width: 140px;
      flex: 1;
    }

    .info-label {
      font-size: 7.5pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 2px;
    }

    .info-value {
      font-size: 10pt;
      color: #1a1a1a;
      font-weight: 500;
    }

    /* ── CLIENT DETAIL BLOCK ────────────────────── */
    .client-block {
      background: linear-gradient(135deg, #f0f7f3 0%, #fafffe 100%);
      border: 1px solid #c8e6d4;
      border-radius: 10px;
      padding: 18px 22px;
      margin: 12px 0;
    }

    .client-block-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }

    .client-badge {
      background: #1B4332;
      color: #C9A84C;
      font-size: 7.5pt;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 20px;
    }

    .client-full-name {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 13pt;
      font-weight: 600;
      color: #1B4332;
    }

    .client-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }

    .client-detail-item {
      display: flex;
      flex-direction: column;
    }

    .client-detail-label {
      font-size: 7.5pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .client-detail-value {
      font-size: 10pt;
      color: #1a1a1a;
    }

    /* ── PERSON BLOCKS ──────────────────────────── */
    .person-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 8px 0;
    }

    .person-block {
      background: #fff;
      border: 1px solid #d4e8dc;
      border-radius: 8px;
      padding: 10px 14px;
      min-width: 180px;
      flex: 1;
    }

    .person-name {
      font-weight: 600;
      color: #1B4332;
      font-size: 10pt;
      margin-bottom: 4px;
    }

    .person-detail {
      font-size: 9pt;
      color: #4b5563;
    }

    .detail-label {
      color: #9ca3af;
      font-size: 8.5pt;
    }

    /* ── SUBSECTION ─────────────────────────────── */
    .subsection {
      margin: 14px 0;
    }

    .subsection-label {
      font-size: 9pt;
      font-weight: 600;
      color: #2D6A4F;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }

    /* ── BENEFICIARY LIST ───────────────────────── */
    .ben-list {
      list-style: none;
      margin: 8px 0;
    }

    .ben-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 6px;
      margin-bottom: 4px;
      background: #f8faf9;
      border-left: 3px solid #2D6A4F;
    }

    .ben-item:nth-child(even) { background: #f0f7f3; }

    .ben-name { font-weight: 500; color: #1a1a1a; flex: 1; }

    .share-badge {
      background: #1B4332;
      color: #C9A84C;
      font-size: 8pt;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .rel-tag {
      font-size: 8pt;
      color: #6b7280;
      background: #f3f4f6;
      padding: 1px 6px;
      border-radius: 4px;
    }

    /* ── GIFT CARDS ─────────────────────────────── */
    .gift-section { margin: 10px 0; }

    .gift-client-label {
      font-size: 8.5pt;
      font-weight: 600;
      color: #2D6A4F;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }

    .gift-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .gift-card {
      background: linear-gradient(135deg, #fffbf0 0%, #fff8e7 100%);
      border: 1px solid #e8c96a;
      border-radius: 8px;
      padding: 10px 14px;
      min-width: 160px;
      flex: 1;
    }

    .gift-item {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 10pt;
      margin-bottom: 4px;
    }

    .gift-to {
      font-size: 9pt;
      color: #6b7280;
    }

    /* ── SUPPORT TABLE ──────────────────────────── */
    .support-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      border-radius: 8px;
      overflow: hidden;
    }

    .support-table th {
      background: #1B4332;
      color: #C9A84C;
      font-size: 8.5pt;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 10px 14px;
      text-align: left;
    }

    .support-table td {
      padding: 12px 14px;
      font-size: 9.5pt;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    .support-table tr:last-child td { border-bottom: none; }
    .support-table tr:nth-child(even) td { background: #f8faf9; }

    .support-table .role-cell {
      font-weight: 600;
      color: #1B4332;
    }

    .support-table a {
      color: #2D6A4F;
      text-decoration: none;
    }

    /* ── TIMELINE ───────────────────────────────── */
    .timeline {
      margin: 16px 0;
      position: relative;
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      align-items: flex-start;
    }

    .timeline-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1B4332, #2D6A4F);
      color: #C9A84C;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 13pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(27,67,50,0.3);
    }

    .timeline-content {
      flex: 1;
      padding-top: 4px;
    }

    .timeline-title {
      font-weight: 600;
      color: #1B4332;
      font-size: 10.5pt;
      margin-bottom: 2px;
    }

    .timeline-desc {
      font-size: 9.5pt;
      color: #4b5563;
      line-height: 1.5;
    }

    /* ── SERVICES GRID ──────────────────────────── */
    .services-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 12px 0;
    }

    .service-card {
      background: linear-gradient(135deg, #f0f7f3 0%, #fafffe 100%);
      border: 1px solid #c8e6d4;
      border-radius: 8px;
      padding: 12px 14px;
    }

    .service-card-title {
      font-weight: 600;
      color: #1B4332;
      font-size: 10pt;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .service-card-desc {
      font-size: 9pt;
      color: #4b5563;
      line-height: 1.4;
    }

    /* ── LETTER SECTION ─────────────────────────── */
    .letter-section {
      margin: 20px 0;
    }

    .address-block {
      margin: 16px 0;
    }

    .address-confidential {
      font-size: 9pt;
      font-weight: 600;
      color: #1B4332;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .address-line {
      font-size: 10pt;
      color: #1a1a1a;
      line-height: 1.7;
    }

    .salutation {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      font-weight: 600;
      color: #1B4332;
      margin: 20px 0 12px;
    }

    .body-text {
      font-size: 10pt;
      color: #374151;
      line-height: 1.7;
      margin-bottom: 10px;
    }

    /* ── SIGN-OFF ────────────────────────────────── */
    .signoff {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .signoff-text {
      font-size: 10pt;
      color: #374151;
      line-height: 1.8;
    }

    .signoff-name {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      font-weight: 600;
      color: #1B4332;
      margin-top: 4px;
    }

    /* ── PAGE FOOTER ────────────────────────────── */
    .page-footer {
      background: #f8faf9;
      border-top: 2px solid #C9A84C;
      padding: 10px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 32px;
    }

    .footer-company {
      font-size: 8pt;
      color: #6b7280;
    }

    .footer-confidential {
      font-size: 7.5pt;
      color: #9ca3af;
      letter-spacing: 0.5px;
    }

    .footer-ref {
      font-size: 8pt;
      color: #6b7280;
    }

    /* ── PRINT ──────────────────────────────────── */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cover-page { page-break-after: always; }
      .content-page { page-break-before: always; }
    }

    /* ── HIGHLIGHT BOX ──────────────────────────── */
    .highlight-box {
      background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
      border-radius: 10px;
      padding: 16px 20px;
      margin: 16px 0;
      color: white;
    }

    .highlight-box-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      color: #C9A84C;
      margin-bottom: 6px;
    }

    .highlight-box-text {
      font-size: 9.5pt;
      color: rgba(255,255,255,0.85);
      line-height: 1.6;
    }

    .gold-rule {
      border: none;
      border-top: 1.5px solid #C9A84C;
      margin: 20px 0;
      opacity: 0.5;
    }
  `;

  // Small tree for page headers
  const smallTree = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44" width="28" height="30">
    <rect x="17" y="28" width="6" height="14" rx="2" fill="#C9A84C" opacity="0.9"/>
    <ellipse cx="20" cy="22" rx="14" ry="10" fill="#1B4332"/>
    <ellipse cx="20" cy="16" rx="11" ry="8" fill="#2D6A4F"/>
    <ellipse cx="20" cy="11" rx="8" ry="6" fill="#1B4332"/>
    <circle cx="20" cy="9" r="2" fill="#C9A84C" opacity="0.8"/>
    <circle cx="14" cy="18" r="1.5" fill="#C9A84C" opacity="0.6"/>
    <circle cx="26" cy="17" r="1.5" fill="#C9A84C" opacity="0.6"/>
  </svg>`;

  function pageHeader(): string {
    return `<div class="page-header">
      <div class="page-header-logo">
        ${smallTree}
        <div class="page-header-company">Genesis Wills and Estate Planning</div>
      </div>
      <div class="page-header-ref">${refNum ? `Ref: ${refNum}` : ""}</div>
    </div>`;
  }

  function pageFooter(pageNum: number): string {
    return `<div class="page-footer">
      <div class="footer-company">Genesis Wills and Estate Planning</div>
      <div class="footer-confidential">Strictly Private &amp; Confidential</div>
      <div class="footer-ref">Page ${pageNum}</div>
    </div>`;
  }

  // ── PAGE 1: Cover ──────────────────────────────────────────────────────────
  const coverPage = `
  <div class="cover-page">
    <div class="cover-bg-circle c1"></div>
    <div class="cover-bg-circle c2"></div>
    <div class="cover-bg-circle c3"></div>
    <div class="cover-top-bar"></div>
    <div class="cover-bottom-bar"></div>

    <div class="cover-tree">${treeSvg}</div>

    <div class="cover-company">Genesis Wills and Estate Planning</div>
    <div class="cover-title">Welcome Pack</div>
    <div class="cover-subtitle">Your Estate Planning Journey Begins</div>
    <div class="cover-divider"></div>

    <div class="cover-meta-box">
      <div class="cover-meta-label">Prepared for</div>
      <div class="cover-client-name">${c1Name}${isMirror && c2Name ? `<br/><span style="font-size:14pt;opacity:0.8">&amp; ${c2Name}</span>` : ""}</div>
      <div class="cover-meta-row">
        <div class="cover-meta-item">
          <div class="cover-meta-item-label">Date</div>
          <div class="cover-meta-item-value">${today}</div>
        </div>
        ${refNum ? `<div class="cover-meta-item">
          <div class="cover-meta-item-label">Reference</div>
          <div class="cover-meta-item-value">${refNum}</div>
        </div>` : ""}
        ${record.willType ? `<div class="cover-meta-item">
          <div class="cover-meta-item-label">Document Type</div>
          <div class="cover-meta-item-value">${willTypeLabel(record.willType)}</div>
        </div>` : ""}
      </div>
    </div>

    <div class="cover-confidential">Strictly Private &amp; Confidential</div>
  </div>`;

  // ── PAGE 2: Welcome Letter ─────────────────────────────────────────────────
  const welcomeLetterPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Welcome Letter</div>
      <div class="page-title-bar"></div>

      <div class="letter-section">
        <div class="address-block">
          <div class="address-confidential">Strictly Private and Confidential</div>
          ${addressLines.map(l => `<div class="address-line">${l}</div>`).join("")}
        </div>

        <div class="body-text" style="margin-top:16px"><strong>Date:</strong> ${today}</div>

        <div class="salutation">${salutation}</div>

        <p class="body-text">
          Thank you for entrusting Genesis Wills and Estate Planning with your instructions. Following your recent meeting
          with our consultant, <strong>${consultantName}</strong>, I am writing to formally welcome you as our newest client
          and to confirm the details of your instructions for a <strong>${willTypeLabel(record.willType || "Will")}</strong>.
          We understand that estate planning is a significant step, and our team is dedicated to ensuring your wishes are
          documented accurately and professionally.
        </p>

        <p class="body-text">
          Enclosed in this Welcome Pack you will find a summary of the instructions we have recorded for you. Please review
          all details carefully and contact us immediately if any corrections are required before drafting begins.
        </p>

        ${sectionHeading(iconStar, "Your Support Team")}

        <p class="body-text">
          We are here to help you at every stage. If you have any questions about your documents or the process, please
          contact your dedicated team members below.
          ${coordinatorPhone ? `(<strong>General Enquiries:</strong> ${coordinatorPhone})` : ""}
        </p>

        <table class="support-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Name</th>
              <th>Contact Email</th>
              <th>Contact Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="role-cell">Your Consultant</td>
              <td>${consultantName}</td>
              <td>${consultantEmail ? `<a href="mailto:${consultantEmail}">${consultantEmail}</a>` : "—"}</td>
              <td>${consultantPhone || "—"}</td>
            </tr>
            <tr>
              <td class="role-cell">Case Coordinator</td>
              <td>${coordinatorName}</td>
              <td>${coordinatorEmail ? `<a href="mailto:${coordinatorEmail}">${coordinatorEmail}</a>` : "—"}</td>
              <td>${coordinatorPhone || "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    ${pageFooter(2)}
  </div>`;

  // ── PAGE 3: Client Details ─────────────────────────────────────────────────
  function clientBlock(num: 1 | 2): string {
    const p = num === 1 ? "client1" : "client2";
    const name = fullName(record[`${p}Prefix`], record[`${p}FirstName`], record[`${p}MiddleName`], record[`${p}LastName`]);
    if (!name) return "";
    const dob = fmtDate(record[`${p}Dob`]);
    const addr = [record[`${p}AddressLine1`], record[`${p}City`], record[`${p}Postcode`]].filter(Boolean).join(", ");
    const phone = fmt(record[`${p}Mobile`]) || fmt(record[`${p}DaytimePhone`]);
    const email = fmt(record[`${p}Email`]);
    const marital = capitalize(fmt(record[`${p}MaritalStatus`]));
    const job = fmt(record[`${p}JobTitle`]);
    const nationality = fmt(record[`${p}Nationality`]);

    return `<div class="client-block">
      <div class="client-block-header">
        <div class="client-badge">Client ${num}</div>
        <div class="client-full-name">${name}</div>
      </div>
      <div class="client-details-grid">
        ${dob ? `<div class="client-detail-item"><div class="client-detail-label">Date of Birth</div><div class="client-detail-value">${dob}</div></div>` : ""}
        ${marital ? `<div class="client-detail-item"><div class="client-detail-label">Marital Status</div><div class="client-detail-value">${marital}</div></div>` : ""}
        ${job ? `<div class="client-detail-item"><div class="client-detail-label">Occupation</div><div class="client-detail-value">${job}</div></div>` : ""}
        ${nationality ? `<div class="client-detail-item"><div class="client-detail-label">Nationality</div><div class="client-detail-value">${nationality}</div></div>` : ""}
        ${addr ? `<div class="client-detail-item" style="grid-column:1/-1"><div class="client-detail-label">Address</div><div class="client-detail-value">${addr}</div></div>` : ""}
        ${phone ? `<div class="client-detail-item"><div class="client-detail-label">Telephone</div><div class="client-detail-value">${phone}</div></div>` : ""}
        ${email ? `<div class="client-detail-item"><div class="client-detail-label">Email</div><div class="client-detail-value">${email}</div></div>` : ""}
      </div>
    </div>`;
  }

  const clientDetailsPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Summary of Instructions</div>
      <div class="page-title-bar"></div>

      <div class="highlight-box">
        <div class="highlight-box-title">Important — Please Review Carefully</div>
        <div class="highlight-box-text">
          The following details have been recorded from your appointment. It is essential that you verify all names,
          dates of birth, and addresses are 100% accurate before drafting begins. Please contact us immediately if
          any corrections are needed.
        </div>
      </div>

      ${sectionHeading(iconFamily, "Client Details")}
      ${clientBlock(1)}
      ${isMirror ? clientBlock(2) : ""}

      ${uniqueChildren.length > 0 ? `
        ${sectionHeading(iconFamily, "Children")}
        <p class="body-text">You have confirmed that you have the following children:</p>
        <div class="person-grid">
          ${uniqueChildren.map(c => personBlock("", c)).join("")}
        </div>
      ` : ""}

    </div>
    ${pageFooter(3)}
  </div>`;

  // ── PAGE 4: Executors & Guardians ──────────────────────────────────────────
  const execGuardPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Appointments</div>
      <div class="page-title-bar"></div>

      ${sectionHeading(iconScales, "Executors")}
      ${isMirror ? `
        ${executorSection("Client 1 — " + (record.client1FirstName || ""), c1Execs, c1ResExecs)}
        ${executorSection("Client 2 — " + (record.client2FirstName || ""), c2Execs, c2ResExecs)}
      ` : executorSection("", c1Execs, c1ResExecs)}

      ${(c1Guards.length > 0 || c1ResGuards.length > 0) ? `
        ${sectionHeading(iconShield, "Guardians")}
        <p class="body-text">You have appointed the following to act as guardians for any minor children:</p>
        ${executorSection("", c1Guards, c1ResGuards)}
      ` : ""}

      ${sectionHeading(iconPie, "Distribution of Your Estate")}
      ${isMirror ? `
        ${c1Bens.length > 0 ? `
          <div class="subsection">
            <div class="subsection-label">Client 1 — ${record.client1FirstName || ""}</div>
            <p class="body-text">Your estate will be distributed as follows:</p>
            ${benList(c1Bens)}
            ${record.client1ResidualEstate ? `<p class="body-text" style="margin-top:8px">Any remaining estate will pass to: <strong>${record.client1ResidualEstate}</strong></p>` : ""}
          </div>
        ` : ""}
        ${c2Bens.length > 0 ? `
          <div class="subsection" style="margin-top:14px">
            <div class="subsection-label">Client 2 — ${record.client2FirstName || ""}</div>
            <p class="body-text">Your estate will be distributed as follows:</p>
            ${benList(c2Bens)}
            ${record.client2ResidualEstate ? `<p class="body-text" style="margin-top:8px">Any remaining estate will pass to: <strong>${record.client2ResidualEstate}</strong></p>` : ""}
          </div>
        ` : ""}
      ` : `
        ${c1Bens.length > 0 ? benList(c1Bens) : ""}
        ${record.client1ResidualEstate ? `<p class="body-text" style="margin-top:8px">Any remaining estate will pass to: <strong>${record.client1ResidualEstate}</strong></p>` : ""}
      `}

      ${(record.disasterClauseNotes || record.disasterClauseClient1) ? `
        <div style="margin-top:12px;padding:12px 16px;background:#f8faf9;border-radius:8px;border-left:3px solid #2D6A4F">
          <div style="font-weight:600;color:#1B4332;font-size:9.5pt;margin-bottom:4px">Disaster Clause</div>
          <div class="body-text">${record.disasterClauseNotes || record.disasterClauseClient1}</div>
        </div>
      ` : ""}

    </div>
    ${pageFooter(4)}
  </div>`;

  // ── PAGE 5: Assets, Gifts & Funeral ───────────────────────────────────────
  const assetsFuneralPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Assets, Gifts &amp; Wishes</div>
      <div class="page-title-bar"></div>

      ${(propOwned === "yes" || propAddress || propValue) ? `
        ${sectionHeading(iconHome, "Property &amp; Financial Overview")}
        <div class="info-cards-row">
          ${propAddress ? infoCard("Property Address", propAddress) : ""}
          ${propOwnership ? infoCard("Ownership", capitalize(propOwnership)) : ""}
          ${propValue ? infoCard("Estimated Value", propValue.startsWith("£") ? propValue : `£${propValue}`) : ""}
          ${mortgage && mortgage !== "no" && mortgage !== "0" ? infoCard("Mortgage", mortgage) : infoCard("Mortgage", "None")}
          ${lifeInsurance === "yes" && lifeInsurancePolicies.length > 0 ? infoCard("Life Insurance", lifeInsurancePolicies.map((p: any) => p.provider || "").filter(Boolean).join(", ") || "Yes") : lifeInsurance === "yes" ? infoCard("Life Insurance", "Yes") : infoCard("Life Insurance", "None confirmed")}
          ${assetsOutsideUK === "yes" ? infoCard("Assets Outside UK", "Yes") : ""}
        </div>
        ${giftOfPropertySection(Array.isArray(record.properties) ? record.properties : [])}
      ` : ""}

      ${hasGifts ? `
        ${sectionHeading(iconGift, "Specific Gifts")}
        <p class="body-text">You have instructed that the following gifts are to be included within your Will${isMirror ? "s" : ""}:</p>
        ${giftList(c1Gifts, isMirror ? `Client 1 — ${record.client1FirstName || ""}` : "")}
        ${isMirror ? giftList(c2Gifts, `Client 2 — ${record.client2FirstName || ""}`) : ""}
      ` : ""}

      ${(c1FuneralType || c1FuneralWishes || c1OrganDonation) ? `
        ${sectionHeading(iconHeart, "Funeral Wishes &amp; Organ Donation")}
        ${isMirror ? `
          ${c1FuneralType || c1FuneralWishes || c1OrganDonation ? `
            <div class="subsection">
              <div class="subsection-label">Client 1 — ${record.client1FirstName || ""}</div>
              <div class="info-cards-row">
                ${c1FuneralType ? infoCard("Funeral Preference", capitalize(c1FuneralType)) : ""}
                ${c1OrganDonation ? infoCard("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No") : ""}
              </div>
              ${c1FuneralWishes ? `<p class="body-text" style="margin-top:8px;font-style:italic">"${c1FuneralWishes}"</p>` : ""}
            </div>
          ` : ""}
          ${c2FuneralType || c2FuneralWishes || c2OrganDonation ? `
            <div class="subsection" style="margin-top:12px">
              <div class="subsection-label">Client 2 — ${record.client2FirstName || ""}</div>
              <div class="info-cards-row">
                ${c2FuneralType ? infoCard("Funeral Preference", capitalize(c2FuneralType)) : ""}
                ${c2OrganDonation ? infoCard("Organ Donation", c2OrganDonation === "yes" ? "Yes" : "No") : ""}
              </div>
              ${c2FuneralWishes ? `<p class="body-text" style="margin-top:8px;font-style:italic">"${c2FuneralWishes}"</p>` : ""}
            </div>
          ` : ""}
        ` : `
          <div class="info-cards-row">
            ${c1FuneralType ? infoCard("Funeral Preference", capitalize(c1FuneralType)) : ""}
            ${c1OrganDonation ? infoCard("Organ Donation", c1OrganDonation === "yes" ? "Yes" : "No") : ""}
          </div>
          ${c1FuneralWishes ? `<p class="body-text" style="margin-top:8px;font-style:italic">"${c1FuneralWishes}"</p>` : ""}
        `}
      ` : ""}

      ${record.additionalNotes || record.specialNotes ? `
        <hr class="gold-rule"/>
        <div style="padding:14px 18px;background:#f8faf9;border-radius:8px;border-left:3px solid #C9A84C">
          <div style="font-weight:600;color:#1B4332;font-size:9.5pt;margin-bottom:6px">Additional Notes</div>
          <div class="body-text">${record.additionalNotes || record.specialNotes}</div>
        </div>
      ` : ""}

    </div>
    ${pageFooter(5)}
  </div>`;

  // ── PAGE 6: Additional Services & Next Steps ───────────────────────────────
  const nextStepsPage = `
  <div class="content-page">
    ${pageHeader()}
    <div class="page-content">
      <div class="page-title">Next Steps &amp; Our Services</div>
      <div class="page-title-bar"></div>

      ${sectionHeading(iconStar, "Additional Services We Offer")}
      <p class="body-text">While you have instructed us for a Will, we offer a comprehensive range of services to protect your assets and your family.</p>

      <div class="services-grid">
        <div class="service-card">
          <div class="service-card-title">${iconShield} Lasting Powers of Attorney</div>
          <div class="service-card-desc">Appoint someone to make decisions on your behalf regarding Health &amp; Welfare or Property &amp; Financial Affairs should you become mentally incapable.</div>
        </div>
        <div class="service-card">
          <div class="service-card-title">${iconHome} Trusts</div>
          <div class="service-card-desc">Valuable tools to protect assets and control how they are distributed to beneficiaries, including Protective Property Trusts and Discretionary Trusts.</div>
        </div>
        <div class="service-card">
          <div class="service-card-title">${iconPie} Inheritance Tax Planning</div>
          <div class="service-card-desc">Strategies to minimise the tax burden on your estate and ensure more of your wealth passes to your loved ones.</div>
        </div>
        <div class="service-card">
          <div class="service-card-title">${iconScales} Probate Administration</div>
          <div class="service-card-desc">Professional assistance for executors in gathering assets, paying debts, and distributing the estate efficiently and compliantly.</div>
        </div>
      </div>

      <p class="body-text" style="margin-top:8px">If you would like to know more about any of the additional services we provide, please do not hesitate to contact us. We are here to support you every step of the way.</p>

      ${sectionHeading(iconArrow, "What Happens Next?")}

      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-number">1</div>
          <div class="timeline-content">
            <div class="timeline-title">Verification</div>
            <div class="timeline-desc">Please review the Summary of Instructions in this pack carefully. It is vital that all names, addresses, and dates of birth are 100% accurate. Contact us immediately if any corrections are needed.</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-number">2</div>
          <div class="timeline-content">
            <div class="timeline-title">Cooling-Off Period</div>
            <div class="timeline-desc">We will begin work on your legal documents immediately upon the expiration of your 14-day cooling-off period.</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-number">3</div>
          <div class="timeline-content">
            <div class="timeline-title">Drafting</div>
            <div class="timeline-desc">You will receive your draft documents approximately <strong>2 weeks</strong> from today${estimatedDraft ? ` (estimated: ${estimatedDraft})` : ""}, depending on case complexity. You will have the opportunity to clarify instructions or make amendments at that stage.</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-number">4</div>
          <div class="timeline-content">
            <div class="timeline-title">Finalisation &amp; Signing</div>
            <div class="timeline-desc">Once you approve the drafts, we will prepare the final documents for signing (attestation). Our team will guide you through the signing process to ensure everything is legally valid.</div>
          </div>
        </div>
      </div>

      <hr class="gold-rule"/>

      <div class="signoff">
        <p class="body-text">If you spot any errors in the summary, please reply to this correspondence immediately so we can correct our records before drafting begins.</p>
        <div style="margin-top:20px">
          <div class="signoff-text">Yours sincerely,</div>
          <div class="signoff-name">${coordinatorName}</div>
          <div class="signoff-text">Genesis Wills and Estate Planning</div>
          ${coordinatorPhone ? `<div class="signoff-text">${coordinatorPhone}</div>` : ""}
          ${coordinatorEmail ? `<div class="signoff-text">${coordinatorEmail}</div>` : ""}
        </div>
      </div>

    </div>
    ${pageFooter(6)}
  </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome Pack — ${c1Name}</title>
  <style>${css}</style>
</head>
<body>
  ${coverPage}
  ${welcomeLetterPage}
  ${clientDetailsPage}
  ${execGuardPage}
  ${assetsFuneralPage}
  ${nextStepsPage}
</body>
</html>`;
}
