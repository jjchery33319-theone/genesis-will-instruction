# LPA Form Notes

## Source files

- `/home/ubuntu/upload/20250822-LP1H-create-and-register-your-lasting-power-of-attorney.pdf`
- `/home/ubuntu/upload/102025-LP1F-Lasting-power-of-attorney-financial-decisions.pdf`

## Health & Welfare form (LP1H) — reviewed pages

### Overview pages
- Cover page identifies the form as **LP1H** for **Health and care decisions**.
- Introductory people summary page includes quick-reference boxes for:
  - donor
  - certificate provider
  - attorneys
  - witnesses
  - replacement attorneys
  - people to notify

### Section 1 — The donor
- Donor title
- First names
- Last name
- Any other names
- Date of birth (day, month, year)
- Address
- Postcode
- Email address

### Section 2 — The attorneys
- Multiple attorney blocks with fields for each attorney:
  - title
  - first names
  - last name
  - date of birth
  - address
  - postcode
  - email address
- Form shows space for up to 4 attorneys across two pages.
- Checkbox if donor wants to appoint more than 4 attorneys via continuation sheet.

### Section 3 — How attorneys make decisions
- Checkbox: only one attorney appointed
- Otherwise one choice for how attorneys work together:
  - jointly and severally
  - jointly
  - jointly for some decisions, jointly and severally for other decisions

### Section 4 — Replacement attorneys
- Replacement attorney blocks with same core person fields:
  - title
  - first names
  - last name
  - date of birth
  - address
  - postcode
- Space for 2 replacement attorneys on main form.
- Checkbox for more than 2 replacements via continuation sheet.
- Optional checkbox to change when/how replacement attorneys can act.

### Section 5 — Life-sustaining treatment
- One of two mutually exclusive options:
  - give attorneys authority
  - do not give attorneys authority
- Signature/date/witness fields are present on the official form, but likely outside current back-office data-entry scope unless signature workflow is later added.

### Section 6 — People to notify
- Up to 4 people to notify on main form.
- Each block includes:
  - title
  - first names
  - last name
  - address
  - postcode
- Checkbox for adding another person to notify on continuation sheet.

### Section 7 — Preferences and instructions
- Free-text preferences area
- Free-text instructions area
- Each has checkbox for continuation sheet if more space is needed.

## Initial implementation implications
- We need a reusable person model for LPA participants with enough detail for donor, attorneys, replacement attorneys, and people to notify.
- Existing Will people (executors, guardians, beneficiaries) can be offered as selection sources for attorneys/replacements, but LPA form requires extra fields such as DOB and postal address to be editable in-place.
- We will likely need separate LPA records per submission and per type: `property_finance` and `health_welfare`.
- PDF generation will need per-form field mapping rather than generic text rendering.
- Further pages of LP1H and the LP1F form still need review before final field map is complete.
