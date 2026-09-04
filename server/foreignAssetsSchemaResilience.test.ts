import { describe, expect, it } from "vitest";
import { isDelayedForeignAssetColumnError } from "./mattersDb";

describe("foreign-assets schema resilience", () => {
  it("recognises each delayed foreign-assets column error", () => {
    expect(isDelayedForeignAssetColumnError(new Error("Unknown column 'foreign_assets_treatment' in 'field list'"))).toBe(true);
    expect(isDelayedForeignAssetColumnError(new Error("Unknown column `foreign_asset_country_codes` in 'field list'"))).toBe(true);
    expect(isDelayedForeignAssetColumnError(new Error("Unknown column 'other_column' in 'field list'"))).toBe(false);
  });

  it("does not hide unrelated database failures", () => {
    expect(isDelayedForeignAssetColumnError(new Error("Table 'matter_wishes' doesn't exist"))).toBe(false);
    expect(isDelayedForeignAssetColumnError(new Error("Access denied for user"))).toBe(false);
  });
});
