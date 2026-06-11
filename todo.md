# Genesis Estate Planning — Will Instruction Form TODO

## Foundation
- [x] Project initialised with db, server, user features
- [x] Database schema: will_instructions table (81 columns)
- [x] Global styles: dark green + gold branding, Google Fonts (Playfair Display + Inter)
- [x] Logo uploaded and referenced via CDN (/manus-storage/genesis-logo_48897107.png)

## Multi-Step Form (8 Steps)
- [x] Step 1: Appointment & Consultant Details (consultant selector with auto-fill, coordinator selector, products ordered, price, date)
- [x] Step 2: Client 1 Details (name, DOB, address, marital status, contact, job title, nationality)
- [x] Step 3: Client 2 Details (for Mirror Wills — skips for Single Will)
- [x] Step 4: Executors & Trustees & Guardians (full person entry with DOB, address, phone, email)
- [x] Step 5: Beneficiaries (shares, age conditions, disaster clause, vulnerable flag)
- [x] Step 6: Property & Assets (property details, mortgage, assets overview, care concerns)
- [x] Step 7: Specific Gifts, Residuary Estate, Funeral Wishes, Organ Donation, Special Notes
- [x] Step 8: Full Review & Submit (edit buttons per section, recommendation preview, submit button)

## Smart Recommendation Engine
- [x] Logic: detect PPT triggers (married, property owner, Mirror Wills)
- [x] Logic: detect AAT triggers (property ownership, care concerns)
- [x] Logic: detect LPA triggers (no LPA ordered)
- [x] Logic: detect Vulnerable Trust triggers (vulnerable beneficiaries)
- [x] Logic: detect Storage triggers (no storage ordered)
- [x] Display recommendation panel with priority badges and explanations

## Preview & Submission
- [x] Full review screen before submission (Step 8) with all sections visible
- [x] Edit buttons on each section in review
- [x] AI-generated recommendation narrative (admin use)
- [x] AI-generated client email draft (ready to forward)
- [x] Submission success page with reference number

## Email Notifications
- [x] On submit: send email to office@genesisestateplanning.info
- [x] On submit: send email to customer-support@genesisestateplanning.info
- [x] On submit: send email to amelia@genesisestateplanning.info
- [x] Email includes full instruction summary (all sections)
- [x] Email includes AI recommendation narrative
- [x] Email includes ready-to-send client email draft

## Admin Dashboard
- [x] List of all submitted instructions with stats
- [x] View individual submission detail page
- [x] Status tracking per submission
- [x] Recommendations and AI outputs visible per submission

## Testing
- [x] Vitest: recommendation engine logic (13 test cases)
- [x] Vitest: reference number format
- [x] Vitest: auth logout (existing template test)
- [x] All 14 tests passing

## New Sections (Phase 2 Extension)
- [x] Family Background section (marriage plans, children, family circumstances)
- [x] Additional Background section (residency, mental capacity, children from past relationships)
- [x] Due Diligence section (5 compliance questions with Yes/No/Notes)
- [x] Enhanced Property & Assets (assets outside UK)
- [x] Life Insurance & Protection section (policy details)
- [x] Business Interests section
- [x] Legacies & Gifts section (monetary/physical gifts to individuals or charities)
- [x] Pets section (provisions for pets)
- [x] Disaster Clause & Notes section
- [x] Database schema updated with all new fields
- [x] Review screen updated with new sections
- [x] Admin email updated with new sections

## UX Improvements (Phase 3)
- [x] Redesign step indicator: compact, readable, no text overflow
- [x] Rebuild children section: Yes/No, total count, special needs, under-18 panel, over-18 panel
- [x] Add reserved executors sub-section to Step 7
- [x] Add reserved guardians sub-section to Step 7
- [x] Add mortgage balance and term remaining fields (shown when mortgage outstanding = Yes)
- [x] Reorder steps: move Beneficiaries, Gifts/Legacies, Wishes to end (before Review)
- [x] Update willConstants FORM_STEPS to reflect new order
- [x] Update WillForm.tsx step routing to match new order
- [x] Update DB schema and server router for new fields
