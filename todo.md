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

## Auto-Save Feature (Phase 4)
- [x] Auto-save form data to localStorage on every field change (debounced 1s)
- [x] Show auto-save status indicator (saving... / saved / unsaved changes)
- [x] On page load: detect saved draft and show restore banner with timestamp
- [x] Restore button: reload all form state from localStorage and resume at saved step
- [x] Discard button: clear localStorage draft and start fresh
- [x] Clear localStorage draft on successful form submission
- [x] Handle localStorage quota errors gracefully

## Structural Rebuild (Phase 6)
- [x] Merge Client 1 and Client 2 onto one step (side by side with tabs or stacked sections)
- [x] Client 2 address: "Same as Client 1" toggle
- [x] Hide "plans to marry" question when marital status is Married/Civil Partnership
- [x] Executors: split into Client 1 Primary, Client 1 Reserved, Client 2 Primary, Client 2 Reserved
- [x] Guardians: split into Client 1 Guardians, Client 1 Reserved, Client 2 Guardians, Client 2 Reserved
- [x] Funeral Wishes: split into Client 1 and Client 2 sections on same step
- [x] Gifts/Legacies: split into Client 1 and Client 2 sections on same step
- [x] Residuary Estate: split into Client 1 and Client 2 on Beneficiaries step
- [x] Named Beneficiaries: split into Client 1 and Client 2 on Beneficiaries step
- [x] Update useWillForm state for all new per-client arrays
- [x] Update FORM_STEPS to remove redundant Client 2 step
- [x] Update WillForm routing
- [x] Update Step8Review with new structure
- [x] Update email service with new structure
- [x] Update DB schema and server router

## Draft & Mirror Wills Features (Phase 7)
- [x] Add `status` column to will_instructions table (draft / submitted)
- [x] Add `saveDraft` tRPC procedure (upsert with status=draft)
- [x] Add `listDrafts` tRPC procedure
- [x] Add `deleteDraft` tRPC procedure
- [x] Add `getDraft` tRPC procedure (load draft by id)
- [x] Mirror Wills: "Appoint each other as Executor" button in Step4Executors
- [x] Save Draft button on WillForm (visible on every step)
- [x] Resume draft from URL param (?draftId=xxx)
- [x] Admin Dashboard: Drafts tab listing all in-progress instructions
- [x] Drafts tab: Resume and Delete actions per draft

## Phase 8 Fixes
- [x] Removed all required/mandatory field asterisks globally from FormCard.tsx
- [x] Mirror Wills executor — "Appoint as First Executor" button places partner at position #1 in each other's executor list
- [x] Guardians section — only shown when minor children (under-18) have been entered in Family Background
- [x] Financial assets Client 2 — confirmed rendering correctly (conditional on client2 name being present)
- [x] Life Insurance — added "Term Remaining" field to each policy entry (UI + Zod schema + TypeScript type)
- [x] Removed localStorage auto-save (debounced useEffect, saveDraft helpers, AutoSaveBadge, DraftRestoreBanner) — manual Save Draft button retained

## OneDrive Integration (Phase 9)
- [x] Install @azure/msal-node and @microsoft/microsoft-graph-client packages
- [x] Build oneDriveService.ts — MSAL client-credentials token acquisition + Graph API upload helper
- [x] Build willDocumentFormatter.ts — converts WillInstruction record to a clean plain-text document
- [x] Wire upload into submit procedure (non-blocking, like email — failure does not block submission)
- [x] Azure credentials stored as secrets (AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_CLIENT_SECRET, ONEDRIVE_FOLDER_PATH)
- [x] Vitest: credential validation test + document formatter tests (5 tests, all passing)
- [x] Total tests: 19 passing

## Build Fix & Word Export (Phase 10)
- [x] Remove html-docx-js (incompatible with Vite/Rollup ESM — uses `with` statements)
- [x] Install docx 9.7.1 (server-side Word generation, fully ESM-compatible)
- [x] Create server/willDocxGenerator.ts — generates .docx using `docx` library
- [x] Fix all curly/smart quote characters in willDocxGenerator.ts (TypeScript string literal errors)
- [x] Add /api/submissions/:id/will-docx endpoint to server/_core/index.ts
- [x] Update WillPreview.tsx — replace html-docx-js browser import with fetch call to server endpoint
- [x] Production build passes (pnpm run build — 0 errors)
- [x] All 19 tests passing
- [x] Fix willDocxGenerator.ts: add safeArr() JSON-string parsing for Drizzle JSON columns
- [x] Fix willDocxGenerator.ts: mirror Wills now prepend partner as primary executor and primary beneficiary
- [x] Fix willDocxGenerator.ts: use client1FuneralWishes/client2FuneralWishes (not non-existent funeralWishesNotes)
- [x] Fix willDocxGenerator.ts: use per-client guardians (client1Guardians/client2Guardians)
- [x] Fix willDocxGenerator.ts: use per-client organ donation fields
- [x] Fix willDocxGenerator.ts: use per-client vulnerable beneficiary details
- [x] Fix willDocxGenerator.ts: use per-client specific gifts (client1SpecificGifts/client2SpecificGifts)

## Comprehensive Back-Office Admin Editor (Phase 11)
- [x] Add `updateSubmission` tRPC procedure (admin-only, full record upsert)
- [x] Add missing DB columns: client1ResidualEstate, client2ResidualEstate, client1ResidualBackup, client2ResidualBackup, client1ChildrenBenefitAge, client2ChildrenBenefitAge, client1FuneralType, client1FuneralWishes, client1OrganDonation, client2FuneralType, client2FuneralWishes, client2OrganDonation, client1HasVulnerableBeneficiary, client1VulnerableBeneficiaryDetails, client2HasVulnerableBeneficiary, client2VulnerableBeneficiaryDetails
- [x] Build AdminSubmissionEditor.tsx — tabbed editor with all sections
- [x] Tab: Appointment (date, time, consultant, coordinator, products, price)
- [x] Tab: Clients (Client 1 + Client 2 side by side, all personal details)
- [x] Tab: Executors (Client 1 primary/reserved, Client 2 primary/reserved, "Appoint Genesis Wills Ltd" button)
- [x] Tab: Guardians (Client 1 primary/reserved, Client 2 primary/reserved)
- [x] Tab: Beneficiaries (Client 1 + Client 2 named beneficiaries, residual estate, backup)
- [x] Tab: Gifts & Legacies (Client 1 + Client 2 specific gifts)
- [x] Tab: Property & Assets (property, mortgage, bank accounts, investments, pensions, life insurance, business)
- [x] Tab: Wishes & Funeral (Client 1 + Client 2 funeral wishes, organ donation, disaster clause, pets, notes)
- [x] Tab: Family & Background (children, marriage plans, residency, mental capacity, past relationships)
- [x] Tab: Due Diligence (5 compliance questions)
- [x] Tab: Status & Notes (status dropdown, manual needs assessment, AI outputs read-only)
- [x] Person editor sub-component (reusable: name, DOB, address, phone, email, relationship, share)
- [x] "Appoint Genesis Wills and Estate Planning Ltd" button inserts company as executor
- [x] Save button with optimistic update and success toast
- [x] Register /admin/submissions/:id/edit route in App.tsx
- [x] Link "Edit" button from AdminSubmissionDetail to the new editor

## LPA Back-Office & PDF Population (Phase 12)
- [x] Review LP1H and LP1F PDFs and map all required fields (272 LP1F / 279 LP1H AcroForm fields)
- [x] Add lpa_records DB table with all LPA fields linked to will_instructions
- [x] Add lpaRouter with list, getById, upsert, delete procedures
- [x] Build LpaManager.tsx — full tabbed editor for both LP1F and LP1H
- [x] Attorney selection from Will instruction people (executors, beneficiaries, guardians)
- [x] Allow manual editing of all attorney, replacement attorney, donor, certificate provider, and people-to-notify details
- [x] "Appoint Genesis Wills and Estate Planning Ltd" button for attorneys
- [x] Support separate LPA records per client per type (property_finance and health_welfare)
- [x] Write fill_lpa_pdf.py Python script using PyMuPDF to fill AcroForm fields
- [x] Add /api/lpa/:id/pdf server endpoint calling Python filler
- [x] Populate LP1F PDF from saved LPA data
- [x] Populate LP1H PDF from saved LPA data
- [x] Add Download PDF button to each LPA card in LpaManager
- [x] Add LPAs button to SubmissionDetail header
- [x] Register /admin/submission/:id/lpa route in App.tsx
- [x] Production build passes (0 errors)
- [x] All 19 tests passing
