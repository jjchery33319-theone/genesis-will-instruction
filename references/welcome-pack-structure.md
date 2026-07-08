# Welcome Pack — Content Structure & Design Notes

## Source: Wendy & Bryan Budd example (4 pages)

---

## Page 1 — Cover / Welcome Letter
- **Header:** Genesis logo (top-left), light grey background header bar
- **Title:** "Welcome to Genesis Wills and Estate Planning" (centred, bold)
- **Pack header block:**
  - "WELCOME PACK" (bold)
  - "Date:" (today's date)
- **Address block (Strictly Private and Confidential):**
  - Client 1 name, Client 2 name
  - Full address (line 1, city, county, postcode)
- **Salutation:** "Dear [First names],"
- **Welcome paragraph:** personalised with consultant name and will type (Mirror Will / Single Will etc.)
- **Support Team section:**
  - Intro line with general enquiries number
  - Table: Role | Name | Contact Email | Contact Phone
    - Your Consultant row
    - Case Coordinator row

---

## Page 2 — Client Details & Family
- **Client Details heading**
- **"Summary of Instructions — Please check the following details carefully."**
- **Client 1 block:**
  - Name, Date of Birth, Occupation, Marital Status, Address, Telephone, Email
- **Client 2 block (if mirror/joint):**
  - Same fields
- **Children section:**
  - "You have confirmed that you have the following children:"
  - List each child: Prefix + Full Name, Date of Birth
- **Executors section:**
  - Primary executors (each other if mirror, or named)
  - Replacement/substitute executors: bulleted list with name + DOB

---

## Page 3 — Assets, Funeral, Gifts, Distribution
- **Asset & Financial Overview:**
  - Property ownership type (jointly/sole)
  - Estimated Property Value
  - Mortgage: Yes/None
  - Life Insurance: Yes/No + Provider
  - Policy Written into Trust: Yes/No
  - Assets Outside the UK: Yes/None
- **Funeral Wishes & Organ Donation:**
  - Cremation/Burial preference
  - Organ donation: Yes/No
- **Gifts section:**
  - List of specific gifts per client (item → recipient)
  - Residual estate instruction
- **Distribution of your Estate:**
  - Primary distribution narrative
  - Beneficiary list with shares (%)
  - Disaster clause note

---

## Page 4 — Additional Services & Next Steps
- **Additional Services We Offer:**
  - LPAs, Trusts, Inheritance Tax Planning, Probate Administration
- **What Happens Next?** (numbered steps):
  1. Verification
  2. Drafting
  3. Review (approx. 2 weeks)
  4. Finalisation
- **Sign-off:**
  - "Yours sincerely,"
  - Case Coordinator name
  - Company name, phone, email

---

## Design Direction for New Version

### Visual Style
- **Colour palette:** Deep forest green (#1B4332 or similar) + gold/amber accent (#C9A84C) + white/cream background — matches Genesis brand
- **Typography:** Serif heading font (e.g. Playfair Display) for section titles; clean sans-serif (e.g. Inter or Lato) for body text
- **Layout:** Full-bleed cover page with decorative elements; content pages with left accent bar and section icons

### Visual Elements to Add
- **Cover page:** Full-bleed dark green background, large gold tree/crest illustration, client name in large serif font, decorative gold horizontal rule
- **Section icons/widgets:** Small illustrated icons beside each section heading (family silhouette for Children, scales of justice for Executors, house for Property, heart for Funeral, gift box for Gifts, pie chart for Distribution)
- **Info cards:** Key facts (DOB, address, will type) displayed in styled card boxes with subtle shadow
- **Progress timeline widget:** Visual "What Happens Next" timeline with numbered steps and connecting line
- **Decorative dividers:** Thin gold horizontal rules between sections
- **Footer:** Company branding, page number, confidentiality notice on every page

### Sections to Include (from form data)
1. Cover page with client name, reference number, date, will type
2. Welcome letter with consultant name and personalised paragraph
3. Support team table
4. Client details (1 and 2 if applicable)
5. Children
6. Executors (primary + substitute)
7. Guardians (if applicable)
8. Beneficiaries and distribution
9. Specific gifts
10. Property & assets overview
11. Life insurance
12. Funeral wishes & organ donation
13. Additional services
14. What happens next (timeline)
15. Sign-off

### Output Formats
- **PDF:** Generated server-side using Puppeteer (HTML→PDF) for full visual fidelity
- **Word (DOCX):** Generated using docx npm package with styled paragraphs, tables, and formatting — editable by admin
