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

## Optional Clause Enhancements (Phase 13)
- [x] Audit all optional clause data models, form steps, and generator logic
- [x] Extend Zod input schema: protective_property_trusts as array with trustees[], life_tenants[], termination_triggers{}, ultimate_beneficiaries[], trust_period_notes
- [x] Same rich structure for: discretionary_trust, business_property_relief, nil_rate_band_trust, bereaved_minor_trust, 18_to_25_trust, vulnerable_beneficiary_trust
- [x] Add/update DB columns for rich optional clause JSON arrays (7 new columns)
- [x] Rebuild optional clause admin editor UI: multi-instance cards, add/remove, trustees, life tenants, termination triggers, beneficiaries (OptionalClausesEditor.tsx)
- [x] Rewrite PPT legal text in willGenerator.ts: loop through array, formal clause per instance
- [x] Rewrite all other optional clause legal text in willGenerator.ts with same pattern
- [x] Rewrite PPT and all optional clause legal text in willDocxGenerator.ts
- [x] Legacy boolean fallbacks preserved for Wills generated before the new editor
- [x] Build passes (0 errors), all 19 tests pass

## Mirror Will Generation (Phase 14)
- [x] handleRegenerate() now accepts clientNumber (1 | 2) parameter
- [x] For Mirror Wills: header shows C1 PDF, C1 Word, C2 PDF, C2 Word buttons
- [x] For Single Wills: header shows PDF, Word buttons (unchanged)
- [x] Each button passes clientNumber to /api/submissions/:id/will-pdf and /api/submissions/:id/will-docx
- [x] Downloaded filename uses the respective client's name
- [x] Build passes (0 errors), all 19 tests pass

## Submission & Due Diligence Improvements (Phase 15)
- [x] Confirmed all willInstructionInputSchema fields are .optional() — no required fields block submission
- [x] Added 8 new due diligence DB columns: ddClientSince, ddFirstContactDate, ddMeetingType, ddOthersPresent, ddOthersPresentNotes, ddClientCanSee, ddClientCanHear, ddClientCanSpeak
- [x] Added new fields to willInstructionInputSchema (all optional)
- [x] Due Diligence tab in AdminSubmissionEditor rebuilt into 3 sections: Meeting Details, Client Capacity, Compliance Questions
- [x] Meeting Details: client since, first contact date, meeting type dropdown (Consultant office / Client house / Video Call / Telephone), others present Yes/No with conditional notes field
- [x] Client Capacity: can see, can hear, can speak Yes/No questions
- [x] Build passes (0 errors), all 19 tests pass

## LPA PDF Field Mapping Fixes (Phase 16)
- [ ] LPA PDF: populate donor address lines (Address 1_2, Address 1_2b, Address 1_2c) and postcode (Postcode)
- [ ] LPA PDF: populate attorney 1 address lines (Address 1_2, Address 1_2b, Address 1_2c) and postcode (undefined_2)
- [ ] LPA PDF: populate attorney 2 address lines (Address 1_3, Address 1_3b, Address 1_3c) and postcode (undefined_3)
- [ ] LPA PDF: populate attorney 3 address lines (Address 1_4a, Address 1_4b, Address 1_4c) and postcode (undefined_4)
- [ ] LPA PDF: populate attorney 4 address lines (Address 1_5a, Address 1_5b, Address 1_5c) and postcode (undefined_5)
- [ ] LPA PDF: populate replacement attorney 1 address lines (Address 1_6a, Address 1_6b, Address 1_6c) and postcode (undefined_6)
- [ ] LPA PDF: populate replacement attorney 2 address lines (Address 1_7a, Address 1_7b, Address 1_7c) and postcode (undefined_7)
- [ ] LPA PDF: populate certificate provider address lines (Address 1_8a, Address 1_8b, Address 1_8c)
- [ ] LPA PDF: populate section 11 attorney name fields (Title_13/First names_13/Last name_13 through Title_16/First names_16/Last name_16)
- [ ] LPA PDF: populate section 12 applicant fields (Title_17 through Title_20 / First names / Last name) based on who is applying
- [ ] LPA PDF: tick Donor or Attorney(s) checkbox in section 12 based on applicant selection
- [ ] LPA PDF: populate section 13 recipient fields (Title_21, First names_21, Last name_21, Company, Address 1_18a/b/c, undefined_29)
- [ ] LPA PDF: tick section 13 delivery preference checkboxes (Post, Phone, Email, receive the lpa)
- [ ] LPA PDF: populate section 14 fee fields (Your phone number, I want to apply to pay a reduced fee, Im making a repeat application, Case number)
- [ ] DB schema: add registration fields to lpa_records (applicantType, recipientType, recipientName, recipientCompany, recipientAddress, deliveryPreference, feePaymentMethod, reducedFee, repeatApplication, caseNumber, contactPhone)
- [ ] LPA admin editor: add Registration tab with all section 12-14 fields

## Will Generator Rewrite — STEP Powers / England & Wales (Phase 17)

- [ ] Audit willGenerator.ts against full DB schema — list every missing field
- [ ] Fix missing reserved executors in PDF (client1ReservedExecutors, client2ReservedExecutors, reservedExecutors)
- [ ] Fix missing reserved guardians in PDF (client1ReservedGuardians, client2ReservedGuardians)
- [ ] Fix missing trustees in PDF
- [ ] Fix missing specific gifts in PDF (client1SpecificGifts, client2SpecificGifts)
- [ ] Fix missing children lists in PDF (under-18 and over-18 per client)
- [ ] Fix missing trust provisions in PDF (PPT, AAT, discretionary, vulnerable, NRB, bereaved minor, age 18-25)
- [ ] Add full STEP Standard Provisions 2nd Edition clause
- [ ] Add proper attestation clause for England & Wales
- [ ] Add proper revocation clause
- [ ] Add proper residuary estate clause with backup provisions
- [ ] Ensure Mirror Will structure correctly separates Client 1 and Client 2 Wills
- [ ] Rewrite willDocxGenerator.ts to match corrected PDF structure

## Save Manual Will Edits Feature (Phase 18)
- [x] Add edited_will_html_single, edited_will_html_client1, edited_will_html_client2 columns to will_instructions table
- [x] Add POST /api/submissions/:id/will-html endpoint to save edited HTML keyed by willType
- [x] Update GET /api/submissions/:id/will-html to return saved HTML when present (X-Will-Edited: true header), else regenerate
- [x] Update PDF download endpoint to serve saved HTML as printable HTML page when saved version exists
- [x] Update Word download endpoint to convert saved HTML to DOCX via html-to-docx when saved version exists
- [x] Add DELETE /api/submissions/:id/will-html endpoint to clear saved version (reset to original)
- [x] Add "Save Edits" button to WillPreview toolbar with success/error toast
- [x] Show green "✓ Edited version saved" badge in WillPreview when a saved version exists
- [x] Show amber "Unsaved changes" badge when edits are pending
- [x] Add "Reset to Original" button with AlertDialog confirmation that clears saved HTML and reloads
- [x] Footer hint updates based on whether edited or original version is showing
- [x] Download dropdown labels update to "Download Edited PDF/Word" when edited version is saved

## Will Instruction App — Version 2 Rebuild (Phase 19)

### Database & schema
- [x] Create `matters` table: id, matter_type (single|mirror), file_reference, status, created_at, updated_at
- [x] Create `matter_clients` table: id, matter_id, client_role (testator1|testator2), full_name, address, date_of_birth, email, phone
- [x] Create `matter_executors` table: id, matter_id, client_role (testator1|testator2|shared), executor_type (primary|substitute), sort_order, full_name, address
- [x] Create `matter_guardians` table: id, matter_id, guardian_type (primary|substitute), sort_order, full_name, address
- [x] Create `matter_beneficiaries` table: id, matter_id, client_role, beneficiary_type (primary|fallback), sort_order, full_name, relationship, share_fraction, include_issue
- [x] Create `matter_wishes` table: id, matter_id, client_role, age_condition (default 18), survivorship_days (default 28), organ_donation, organ_donation_text, funeral_wishes, extra_notes, residue_to_spouse_first
- [x] All tables created directly via SQL (drizzle-kit generate bypassed due to snapshot state)

### tRPC procedures
- [x] matters.list — list all matters with client names and status
- [x] matters.getById — full matter with all related data
- [x] matters.create — create matter + initial client records
- [x] matters.update — update matter metadata
- [x] matters.delete — delete matter and all related records
- [x] matters.saveClient — upsert client record for a matter
- [x] matters.saveExecutors — upsert executor list for a matter
- [x] matters.saveGuardians — upsert guardian list for a matter
- [x] matters.saveBeneficiaries — upsert beneficiary list for a matter
- [x] matters.saveWishes — upsert wishes record for a matter

### Will generation (server-side)
- [x] Write `server/willV2Generator.ts` — generates Eleanor-style Will HTML from matter data
- [x] Single Will: 12-clause structure matching Eleanor precedent exactly
- [x] Mirror Wills: generate two separate Wills (one per testator) with reciprocal gift structure
- [x] Cover page with Genesis branding, testator name, file reference
- [x] Numbered page footer (Page X of Y)
- [x] Final attestation page with blank signing/witnessing lines
- [x] Add GET /api/matters/:id/will endpoint (returns HTML, accepts ?testator=testator1|testator2)
- [x] Add GET /api/matters/:id/will-pdf endpoint (returns printable HTML page)

### Will Commentary generation (server-side)
- [x] Write `server/willV2Commentary.ts` — generates Eleanor-style commentary from matter data
- [x] Part 1: named people summary (executors, guardians, beneficiaries with plain-English explanations)
- [x] Part 2: clause-by-clause explanation (all 13 clauses)
- [x] Cover page: "THE [CLIENT NAME] WILL COMMENTARY" with reference and question-mark image style
- [x] Footer note: "This is not a legal document and will not require a signature."
- [x] Add GET /api/matters/:id/commentary endpoint

### Will Signing Guide generation (server-side)
- [x] Write `server/willV2SigningGuide.ts` — generates personalised signing guide
- [x] Two-column layout: instructions on left, sample attestation block on right
- [x] Testator name pre-filled in the sample attestation block
- [x] For Mirror Wills: one guide per testator
- [x] Footer: "Don't Delay - Sign your Will Today!"
- [x] Add GET /api/matters/:id/signing-guide endpoint

### Frontend — Will V2 UI
- [x] Create `/admin/wills` route in App.tsx
- [x] Build `WillDraftingV2.tsx` — two-panel layout (left: matter list + new matter dialog, right: form/preview)
- [x] Build `MatterForm.tsx` — tabbed instruction form: Clients, Executors, Guardians, Beneficiaries, Wishes
- [x] Build `MatterPreview.tsx` — Will/Commentary/Signing Guide preview with download toolbar and inline edit+save
- [x] Register route and add "Will Drafting" button in AdminDashboard header
- [x] Ensure LPA section is unaffected and still accessible

### Tests
- [x] Vitest: will V2 generator — single will clause presence (9 tests)
- [x] Vitest: will V2 generator — mirror will generates two separate documents (6 tests)
- [x] Vitest: commentary generator — Part 1 and Part 2 sections present (6 tests)
- [x] Vitest: signing guide — testator name appears in attestation block (5 tests)
- [x] Total: 45 tests passing (19 existing + 26 new V2 tests)

## Will V2 — Extended Sections (Phase 20)

### Database
- [ ] Add `matter_gifts` table: id, matter_id, client_role, sort_order, recipient_name, recipient_address, gift_description, gift_type (monetary|asset|residue)
- [ ] Add `matter_pets` table: id, matter_id, sort_order, pet_name, pet_type, carer_name, carer_address, care_notes
- [ ] Add `matter_property` table: id, matter_id, sort_order, address, ownership_type (sole|joint_tenants|tenants_in_common), mortgage_outstanding, mortgage_lender, property_notes
- [ ] Add `matter_business` table: id, matter_id, sort_order, business_name, business_type, share_percentage, business_notes
- [ ] Add disaster_clause_notes, extra_notes columns to matter_wishes (or separate matter_extras table)

### tRPC procedures
- [x] matters.saveGifts — upsert gifts list per client_role
- [x] matters.savePets — upsert pets list
- [x] matters.saveProperty — upsert property list
- [x] matters.saveBusiness — upsert business list
- [x] matters.saveWishes extended with disasterClauseNotes + generalNotes

### Will generator updates
- [x] Add specific gifts clause (before residuary estate)
- [x] Add pets provision clause
- [x] Add disaster clause (if notes provided; standard intestacy fallback if not)
- [x] Add business interests clause (with BPR reference if applicable)
- [x] Add property clause (tenancy severance note if tenants in common)

### Commentary generator updates
- [x] Add gifts section to Part 1 named people
- [x] Add pets section to Part 1
- [x] Add property section to Part 1
- [x] Add business section to Part 1
- [x] Add disaster clause explanation to Part 2
- [x] Add business interests explanation to Part 2

### Frontend form tabs
- [x] Add "Gifts" tab to MatterForm with per-client gift rows (recipient, description, type, address)
- [x] Add "Pets" tab to MatterForm with pet rows (name, type, carer details, care notes)
- [x] Add "Property" tab to MatterForm with property rows (address, ownership type, mortgage toggle + lender, notes)
- [x] Add "Business" tab to MatterForm with business rows (pre-filled with Genesis Wills and Estate Planning Ltd)
- [x] Wishes tab extended with Disaster Clause textarea and General Notes textarea
- [x] TypeScript: 0 errors | Tests: 45/45 passing

## Will V2 — Mirror Will Auto-fill & Trust Clauses (Phase 21)

### Database
- [ ] Create `matter_trust_clauses` table: id, matter_id, client_role, trust_type (enum), enabled (bool), trustees (JSON), life_tenants (JSON), beneficiaries (JSON), property_address, share_percentage, named_beneficiary, named_beneficiary_disability, age_vesting, notes

### tRPC
- [ ] matters.saveTrustClauses — upsert trust clause records for a matter

### Will generator
- [ ] PPT clause — lifetime trust for property share, occupation right for surviving spouse
- [ ] Discretionary Trust clause — trustees full discretion
- [ ] Vulnerable Person's Trust clause — Finance Act 2005, named beneficiary
- [ ] Nil-Rate Band Trust clause
- [ ] RNRB clause — residential nil-rate band direction
- [ ] Bereaved Minor Trust clause — s.71A IHTA 1984, absolute entitlement at 18
- [ ] 18-to-25 Trust clause — s.71D IHTA 1984, entitlement between 18 and 25
- [ ] BPR Trust clause — qualifying business assets into trust

### Commentary generator
- [ ] Add trust clauses section to Part 1 (named trustees, life tenants, beneficiaries)
- [ ] Add clause-by-clause explanation for each enabled trust in Part 2

### Frontend
- [ ] Add "Trust Clauses" tab to MatterForm with toggle cards for all 8 trust types
- [ ] Each trust card: enabled toggle, description, and relevant configuration fields
- [ ] Add "Mirror from Client 1 →" button in Clients tab (mirror Wills only) that copies executors, guardians, beneficiaries, wishes, gifts, pets, property, business, trust clauses from testator1 to testator2 with reciprocal name swaps

## Mirror Will — Separate Document Sets Per Testator (Phase 22)
- [x] Audit willV2Generator: confirmed testator1/testator2 cover page uses correct client name, address, DOB (scoped by testatorRole)
- [x] Audit willV2Commentary: confirmed each testator's commentary uses their own name on cover and throughout
- [x] Audit willV2SigningGuide: confirmed each testator's signing guide uses their own name in the attestation block
- [x] Update MatterPreview for Mirror Wills: testator selector at top, each testator gets their own TestatorDocSet panel with Will/Commentary/SigningGuide tabs and a "Download All — [Name]" button
- [x] Add clear per-testator labels to the download toolbar for Mirror Wills
- [x] Verified testator2 cover page shows testator2's name (generator scoped by testatorRole)
- [x] Verified testator2 Will body correctly names testator2 as testator and testator1 as primary beneficiary
- [x] TypeScript: 0 errors | Tests: 45/45 passing

## LPA ↔ Will V2 Integration & V1 Import (Phase 23)

### LPA ↔ Will V2 linkage
- [ ] Add `matter_id` nullable FK column to `lpa_records` table
- [ ] Add `lpaRouter.createFromMatter` procedure — creates up to 4 LPA records (P&F and H&W per client) pre-populated from matter client/executor data
- [ ] Add `lpaRouter.listByMatter` procedure — returns all LPA records linked to a matter
- [ ] Add "LPA Ordered" button to Will V2 MatterForm (top toolbar or Clients tab) — triggers createFromMatter and navigates to LPA manager
- [ ] Show LPA status badge on matter list (e.g. "2 LPAs" or "LPAs ordered") when lpa_records exist for the matter
- [ ] In LPA Manager, show a "Back to Matter" link when the LPA was created from a matter

### V1 Submission → V2 Import
- [ ] Add `importToV2` tRPC procedure — reads a will_instruction record and creates a new matter + clients + executors + guardians + beneficiaries + wishes from the V1 data
- [ ] Add "Import to Will V2" button on AdminSubmissionDetail page
- [ ] On click: show a confirmation dialog ("This will create a new V2 matter from this submission's client data. Continue?")
- [ ] After import: navigate to the new matter in the Will Drafting V2 page
- [ ] Map V1 fields to V2 schema: client1Name→testator1.fullName, client1Address→testator1.address, client1DateOfBirth→testator1.dateOfBirth, client1Email→testator1.email, client1Phone→testator1.phone, executors→matter_executors, guardians→matter_guardians, beneficiaries→matter_beneficiaries, funeralWishes→matter_wishes, etc.
- [ ] Set matter_type based on V1 productsOrdered (mirror if "Mirror Wills" in products, else single)
- [ ] Set fileReference from V1 referenceNumber

## LPA Manager Dual Mode (Phase 24)
- [x] Detect matter mode vs submission mode from URL path (/wills/ vs /submissions/)
- [x] In matter mode: query trpc.matters.getById + trpc.lpa.listByMatter
- [x] In matter mode: derive clientName and hasClient2 from matter.clients (clientRole testator1/testator2)
- [x] In matter mode: LpaEditorForm uses matterId in save payload, invalidates listByMatter
- [x] In matter mode: duplicateLpa uses matter client data for donor defaults
- [x] In matter mode: back button navigates to /admin/wills, subtitle shows matter file reference
- [x] Extend lpaInputSchema: willInstructionId default 0, add optional matterId
- [x] create mutation inserts matterId when provided
- [x] Add "View LPAs" button in WillDraftingV2 toolbar that navigates to /admin/wills/:id/lpa
- [x] TypeScript: 0 errors | Tests: 45/45 passing
