# Will V2 Precedent Notes

## Sources reviewed

1. `/home/ubuntu/upload/pasted_content.txt`
2. `/home/ubuntu/upload/EleanorAngelaBreen-LastWillandTestament.pdf`
3. `/home/ubuntu/upload/EleanorAngelaBreen-Willcommentary.pdf`

## Product scope requested by user

The user wants the internal Will Instruction and Drafting app rebuilt into a cleaner Version 2 focused only on:

- Single Will (England & Wales)
- Mirror Wills (England & Wales)

The user explicitly wants the LPA area left as-is because it is working satisfactorily, and wants the Will instruction flow rebuilt because it is missing parts and does not flow properly.

The user also wants the system to generate three outputs per matter:

- the Will itself
- the Will commentary
- the Will signing guide / signing notes

## Requested target workflow from pasted_content.txt

The requested simplified matter structure is:

- Matter type: `single` or `mirror`
- Single matters link to one client
- Mirror matters link to two clients
- Clear steps for client details, executors, guardians, residue, and conditions/wishes
- Clean split between left-side matter list and right-side instruction form/draft view
- No LPA / trusts / probate clutter inside the Will drafting Version 2 flow

## Eleanor Will precedent: clause order and document structure

From `EleanorAngelaBreen-LastWillandTestament.pdf`, the precedent Will uses this structure:

1. Cover page titled `THE LAST WILL & TESTAMENT`
2. Opening identification paragraph naming the testator, DOB, and address
3. `Revocation`
4. `Appointment of Executors`
5. `Appointment of Guardians`
6. `Definition and Administration of my Estate`
7. `Distribution of the Residue`
8. `Conditional Gift at Specified Age of 18 Years`
9. `Executor and Trustee Powers`
10. `Survivorship`
11. `Organ Donation`
12. `Funeral Wishes`
13. `STEP Powers`
14. `For the Avoidance of Doubt`
15. Final attestation / signing page

Other observed formatting characteristics:

- Separate cover page with Genesis branding and file reference
- Numbered clauses with classic legal formatting
- Page numbering shown as `Page X of 5`
- Formal recital paragraph at start before numbered clauses
- Final page reserved for attestation wording and signatures/witnessing

## Eleanor Commentary precedent: structure and purpose

From `EleanorAngelaBreen-Willcommentary.pdf`, the commentary has two major parts.

### Part 1: named people / outputs summary

This part explains, in plain English, who the chosen people are and who benefits. It includes sections for:

1. Executors
2. Guardians
3. Beneficiaries of the residuary estate

Observed traits:

- It names primary and reserve roles separately
- It explains each role in plain-English advisory text
- It states the beneficiary structure and age of attainment
- It includes explanation of terms such as issue, remoter issue, and substitution

### Part 2: clause-by-clause explanation

This part explains each clause of the Will in order. Observed clause list:

1. Revocation
2. Appointment of Executors
3. Appointment of Guardians
4. Definition and Administration of my Estate
5. Distribution of the Residue
6. Conditional Gift at Specified Age of 18 Years
7. Executor and Trustee Powers
8. Survivorship
9. Organ Donation
10. Funeral Wishes
11. STEP Powers
12. For the Avoidance of Doubt
13. Attestation

Observed traits:

- Commentary is not a legal document and states it does not require signature
- Uses professional but plain-English explanations
- Includes practical explanation of executor and trustee responsibilities
- Includes a guardianship explanation including parental responsibility notes
- Ends with important reminder that correct signing and witnessing is essential
- Refers the user to accompanying signing instructions if not using document checking/storage

## Immediate design implications for Will V2

1. The app should generate three linked artifacts from one matter dataset:
   - legal Will draft
   - commentary / explanatory document
   - signing notes / guide
2. The clause order of the legal Will should follow the Eleanor precedent closely.
3. The commentary should be generated from the same matter data and should include both:
   - summary of appointed people / beneficiaries
   - clause-by-clause explanation
4. Mirror Wills should likely reuse the same clause order and stylistic pattern, while swapping names, pronouns, reciprocal gift structure, and surviving spouse wording.
5. The form should be simplified around the actual drafting data needed for the above outputs rather than the broader legacy instruction flow.
6. The signing guide PDF still needs to be reviewed separately from the supplied signing notes PDF before final implementation planning.

## Eleanor Signing Notes precedent: structure and purpose

From `EleanorAngelaBreen-WillSigningNotes.pdf`, the signing guide is a single-page document with two columns:

### Left column: "Important notes on signing your Will"

- A Will becomes legally valid and binding as soon as it is signed by the Testator/Testatrix and observed by two Witnesses together, who will sign to confirm this fact.
- The testator must SIGN AND DATE the Will in front of two Witnesses as soon as possible.
- The signing involves THREE people: the testator plus TWO witnesses.
- All THREE must be over 18 years old.
- Witnesses should NOT be beneficiaries, spouses of beneficiaries, or members of the testator's own family (even if named as reserve beneficiary — signing as a witness means they lose their inheritance).
- Witnesses should be as independent as possible — ideal witnesses could be neighbours.
- Witnesses should add their "usual" signatures where required.
- Witnesses should print their names, addresses, and occupations clearly for identification purposes.

### Right column: "An Example of how to sign your Will"

Shows a sample Testimonium and Attestation block with:
- "SIGNED by JOHN SMITH on the 21st day of March 2009"
- Testator signature line with printed name below
- "SIGNED first by the Testator/Testatrix in our joint presence and then by each of us in the presence of the Testator/Testatrix and each other."
- Witness 1 block: signature, full name, full address, occupation
- Witness 2 block: signature, full name, full address, occupation

### Design implications for the signing guide generator

The system should produce a personalised single-page signing guide for each matter that:
- Replaces "JOHN SMITH" with the testator's actual name
- Includes the same bullet-point instructions
- Includes the sample attestation block with the testator's name pre-filled
- For Mirror Wills: produce one signing guide per testator (two documents), or a combined two-testator version
- Footer: "Don't Delay - Sign your Will Today!"
