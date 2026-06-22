#!/usr/bin/env python3
"""
fill_lpa_pdf.py — Fill an LP1F or LP1H AcroForm PDF with LPA record data.

Usage:
    python3 fill_lpa_pdf.py <template_pdf> <output_pdf> <json_data>

json_data is a JSON string containing the LPA record fields.
"""

import sys
import json
import fitz  # PyMuPDF


def parse_dob(dob_str: str):
    """Parse DD/MM/YYYY or YYYY-MM-DD into (day, month, year) strings."""
    if not dob_str:
        return "", "", ""
    dob_str = dob_str.strip()
    if "/" in dob_str:
        parts = dob_str.split("/")
        if len(parts) == 3:
            return parts[0], parts[1], parts[2]
    if "-" in dob_str:
        parts = dob_str.split("-")
        if len(parts) == 3:
            # Could be YYYY-MM-DD or DD-MM-YYYY
            if len(parts[0]) == 4:
                return parts[2], parts[1], parts[0]
            return parts[0], parts[1], parts[2]
    return dob_str, "", ""


def set_field(doc, field_name: str, value: str):
    """Set a text field by name across all pages."""
    for page in doc:
        for widget in page.widgets():
            if widget.field_name == field_name:
                widget.field_value = value
                widget.update()
                return True
    return False


def check_field(doc, field_name: str, check: bool = True):
    """Check or uncheck a checkbox by name across all pages."""
    for page in doc:
        for widget in page.widgets():
            if widget.field_name == field_name and widget.field_type_string == "CheckBox":
                widget.field_value = "Yes" if check else "Off"
                widget.update()
                return True
    return False


def check_field_at_index(doc, field_name: str, index: int, check: bool = True):
    """Check the nth occurrence of a checkbox with the given name."""
    count = 0
    for page in doc:
        for widget in page.widgets():
            if widget.field_name == field_name and widget.field_type_string == "CheckBox":
                if count == index:
                    widget.field_value = "Yes" if check else "Off"
                    widget.update()
                    return True
                count += 1
    return False


# Attorney field suffixes for LP1F/LP1H (4 attorneys on pages 4-5)
ATTORNEY_FIELDS = [
    # (title, first_names, last_name, day, month, year, addr_a, addr_b, addr_c, postcode, email, trust_corp_checkbox)
    ("Title_2", "First names_2", "Last name_2", "Day_3", "Month_3", "Year_3",
     "Address 1_2", "Address 1_2b", "Address 1_2c", "undefined_2", "Email address optional_2",
     "This attorney is a trust corporation"),
    ("Title_3", "First names_3", "Last name_3", "Day_4", "Month_4", "Year_4",
     "Address 1_3", "Address 1_3b", "Address 1_3c", "undefined_3", "Email address optional_3",
     None),
    ("Title_4", "First names_4", "Last name_4", "Day_5", "Month_5", "Year_5",
     "Address 1_4a", "Address 1_4b", "Address 1_4c", "undefined_4", "Email address optional_4",
     None),
    ("Title_5", "First names_5", "Last name_5", "Day_6", "Month_6", "Year_6",
     "Address 1_5a", "Address 1_5b", "Address 1_5c", "undefined_5", "Email address optional_5",
     None),
]

# Replacement attorney fields (pages 7)
REPLACEMENT_FIELDS = [
    ("Title_6", "First names_6", "Last name_6", "Day_7", "Month_7", "Year_7",
     "Address 1_6a", "Address 1_6b", "Address 1_6c", "undefined_6", None,
     "This attorney is a trust corporation_2"),
    ("Title_7", "First names_7", "Last name_7", "Day_8", "Month_8", "Year_8",
     "Address 1_7a", "Address 1_7b", "Address 1_7c", "undefined_7", None,
     None),
]

# People to notify fields (page 9)
NOTIFY_FIELDS = [
    ("Title_8", "First names_8", "Last name_8", "Address 1_8a", "Address 1_8b", "Address 1_8c", "undefined_8"),
    ("Title_9", "First names_9", "Last name_9", "Address 1_9a", "Address 1_9b", "Address 1_9c", "undefined_9"),
    ("Title_10", "First names_10", "Last name_10", "Address 1_10a", "Address 1_10b", "Address 1_10c", "undefined_10"),
    ("Title_11", "First names_11", "Last name_11", "Address 1_11a", "Address 1_11b", "Address 1_11c", "undefined_11"),
]


def fill_person_address(doc, addr_a, addr_b, addr_c, postcode_field, address: str, postcode: str):
    """Split address into lines and fill address fields."""
    lines = [l.strip() for l in address.replace("\n", ",").split(",") if l.strip()]
    set_field(doc, addr_a, lines[0] if len(lines) > 0 else "")
    set_field(doc, addr_b, lines[1] if len(lines) > 1 else "")
    set_field(doc, addr_c, lines[2] if len(lines) > 2 else "")
    if postcode_field:
        set_field(doc, postcode_field, postcode or "")


def fill_lpa(template_path: str, output_path: str, data: dict):
    doc = fitz.open(template_path)

    # ── Section 1: Donor ──────────────────────────────────────────────────────
    set_field(doc, "Title", data.get("donorTitle", ""))
    set_field(doc, "First names", data.get("donorFirstNames", ""))
    set_field(doc, "Last name", data.get("donorLastName", ""))
    set_field(doc, "Any other names youre known by optional  eg your married name", data.get("donorOtherNames", ""))

    day, month, year = parse_dob(data.get("donorDob", ""))
    set_field(doc, "Day", day)
    set_field(doc, "Month", month)
    set_field(doc, "Year", year)

    # Donor address
    donor_addr = data.get("donorAddress", "")
    donor_lines = [l.strip() for l in donor_addr.replace("\n", ",").split(",") if l.strip()]
    set_field(doc, "Address 1a", donor_lines[0] if len(donor_lines) > 0 else "")
    set_field(doc, "Address 1b", donor_lines[1] if len(donor_lines) > 1 else "")
    set_field(doc, "Address 1cc", donor_lines[2] if len(donor_lines) > 2 else "")
    set_field(doc, "Postcode", data.get("donorPostcode", ""))
    set_field(doc, "Email address optional", data.get("donorEmail", ""))

    # ── Section 2: Attorneys ──────────────────────────────────────────────────
    attorneys = data.get("attorneys", [])
    for i, atty in enumerate(attorneys[:4]):
        if i >= len(ATTORNEY_FIELDS):
            break
        fields = ATTORNEY_FIELDS[i]
        set_field(doc, fields[0], atty.get("title", ""))
        set_field(doc, fields[1], atty.get("firstNames", ""))
        set_field(doc, fields[2], atty.get("lastName", ""))
        d, m, y = parse_dob(atty.get("dob", ""))
        set_field(doc, fields[3], d)
        set_field(doc, fields[4], m)
        set_field(doc, fields[5], y)
        fill_person_address(doc, fields[6], fields[7], fields[8], fields[9],
                            atty.get("address", ""), atty.get("postcode", ""))
        if fields[10]:
            set_field(doc, fields[10], atty.get("email", ""))
        if fields[11] and atty.get("isTrustCorporation"):
            check_field(doc, fields[11], True)

    if len(attorneys) > 4:
        check_field(doc, "More attorneys  I want to appoint more than 4 attorneys Use Continuation sheet 1", True)

    # ── Section 3: How attorneys make decisions ───────────────────────────────
    decision_type = data.get("attorneyDecisionType", "")
    if len(attorneys) > 1:
        # The form has 4 checkboxes all named "Jointly and severally" for different options
        # Index 0 = jointly and severally; 1 = jointly; 2 = jointly for some
        if decision_type == "jointly_severally":
            check_field_at_index(doc, "Jointly and severally", 0, True)
        elif decision_type == "jointly":
            check_field_at_index(doc, "Jointly and severally", 1, True)
        elif decision_type == "jointly_some":
            check_field_at_index(doc, "Jointly and severally", 2, True)

    # ── Section 4: Replacement attorneys ─────────────────────────────────────
    replacements = data.get("replacementAttorneys", [])
    for i, rep in enumerate(replacements[:2]):
        if i >= len(REPLACEMENT_FIELDS):
            break
        fields = REPLACEMENT_FIELDS[i]
        set_field(doc, fields[0], rep.get("title", ""))
        set_field(doc, fields[1], rep.get("firstNames", ""))
        set_field(doc, fields[2], rep.get("lastName", ""))
        d, m, y = parse_dob(rep.get("dob", ""))
        set_field(doc, fields[3], d)
        set_field(doc, fields[4], m)
        set_field(doc, fields[5], y)
        fill_person_address(doc, fields[6], fields[7], fields[8], fields[9],
                            rep.get("address", ""), rep.get("postcode", ""))
        if fields[11] and rep.get("isTrustCorporation"):
            check_field(doc, fields[11], True)

    if len(replacements) > 2:
        check_field(doc, "More replacements   I want to appoint more than two replacements Use Continuation sheet 1", True)

    # ── Section 5 LP1F: When attorneys can act ────────────────────────────────
    lpa_type = data.get("lpaType", "")
    if lpa_type == "property_finance":
        when = data.get("whenAttorneysCanAct", "")
        if when == "whenever":
            # "As soon as my LPA has been registered" — check first occurrence
            check_field_at_index(doc, "As soon as my LPA has been registered", 0, True)
        # "Only when I lack capacity" is the default (no checkbox needed — it's the alternative option)

    # ── Section 5 LP1H: Life-sustaining treatment ─────────────────────────────
    # LP1H does not have AcroForm checkboxes for this section — it requires physical signature.
    # We note the choice in the preferences field instead.
    if lpa_type == "health_welfare":
        life = data.get("lifeSustainingTreatment", "")
        if life:
            existing_prefs = data.get("preferences", "") or ""
            life_note = ""
            if life == "give_authority":
                life_note = "LIFE-SUSTAINING TREATMENT (Section 5): Option A selected — I give my attorneys authority to consent to or refuse life-sustaining treatment on my behalf."
            elif life == "do_not_give":
                life_note = "LIFE-SUSTAINING TREATMENT (Section 5): Option B selected — I do NOT give my attorneys authority over life-sustaining treatment."
            combined = (life_note + "\n\n" + existing_prefs).strip() if existing_prefs else life_note
            data = {**data, "preferences": combined}

    # ── Certificate provider (page 13 LP1F / LP1H) ───────────────────────────
    set_field(doc, "Title_12", data.get("certProviderTitle", ""))
    set_field(doc, "First names_12", data.get("certProviderFirstNames", ""))
    set_field(doc, "Last name_12", data.get("certProviderLastName", ""))
    fill_person_address(doc, "Address 1_13a", "Address 1_13b", "Address 1_13c", "undefined_15",
                        data.get("certProviderAddress", ""), data.get("certProviderPostcode", ""))

    # ── Section 6: People to notify (page 9) ─────────────────────────────────
    notify = data.get("peopleToNotify", [])
    for i, person in enumerate(notify[:4]):
        if i >= len(NOTIFY_FIELDS):
            break
        fields = NOTIFY_FIELDS[i]
        set_field(doc, fields[0], person.get("title", ""))
        set_field(doc, fields[1], person.get("firstNames", ""))
        set_field(doc, fields[2], person.get("lastName", ""))
        fill_person_address(doc, fields[3], fields[4], fields[5], fields[6],
                            person.get("address", ""), person.get("postcode", ""))

    if len(notify) > 4:
        check_field(doc, "I want to appoint another person to notify maximum is 5  use Continuation sheet 1", True)

    # ── Section 7: Preferences & Instructions (page 10) ──────────────────────
    prefs = data.get("preferences", "")
    instrs = data.get("instructions", "")
    set_field(doc, "Preferences  use words like prefer and would like", prefs or "")
    set_field(doc, "Instructions  use words like must and have to", instrs or "")

    # Save
    doc.save(output_path)
    doc.close()
    print(f"Saved: {output_path}", file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: fill_lpa_pdf.py <template> <output> <json_data>", file=sys.stderr)
        sys.exit(1)

    template_path = sys.argv[1]
    output_path = sys.argv[2]
    json_data = sys.argv[3]

    try:
        data = json.loads(json_data)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}", file=sys.stderr)
        sys.exit(1)

    fill_lpa(template_path, output_path, data)
