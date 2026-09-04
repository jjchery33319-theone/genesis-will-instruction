export type ForeignAssetCountryOption = {
  code: string;
  label: string;
};

// Complete ISO 3166-1 alpha-2 codes, including territories, taken from the
// ISO-3166 country-and-regional-code dataset reviewed for this feature.
export const FOREIGN_ASSET_COUNTRY_CODES = (
  "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW"
).split(" ");

function getRegionDisplayNames(): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
}

export function getForeignAssetCountryOptions(): ForeignAssetCountryOption[] {
  const displayNames = getRegionDisplayNames();

  return FOREIGN_ASSET_COUNTRY_CODES
    .map(code => ({ code, label: displayNames?.of(code) || code }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function parseForeignAssetCountryCodes(value: unknown): string[] {
  const parsed = typeof value === "string"
    ? (() => {
        try { return JSON.parse(value); } catch { return []; }
      })()
    : value;

  if (!Array.isArray(parsed)) return [];
  return Array.from(new Set(parsed
    .filter((code): code is string => typeof code === "string" && FOREIGN_ASSET_COUNTRY_CODES.includes(code.toUpperCase()))
    .map(code => code.toUpperCase())));
}

export function isForeignAssetCountryCode(code: string): boolean {
  return FOREIGN_ASSET_COUNTRY_CODES.includes(code);
}

export function formatForeignAssetCountryCodes(codes: unknown): string {
  const normalized = parseForeignAssetCountryCodes(codes);
  const displayNames = getRegionDisplayNames();
  return normalized.map(code => displayNames?.of(code) || code).join(", ");
}

export function describeForeignAssetScope(details: unknown, countryCodes: unknown): string {
  const assetDetails = typeof details === "string" ? details.trim() : "";
  const countries = formatForeignAssetCountryCodes(countryCodes);
  if (assetDetails && countries) return `${assetDetails} situated in ${countries}`;
  if (countries) return `assets situated in ${countries}`;
  if (assetDetails) return assetDetails;
  return "the overseas assets identified in my instructions";
}
