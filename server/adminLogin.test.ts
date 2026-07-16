import { describe, it, expect } from "vitest";

describe("Admin login - ADMIN_PASSWORD secret validation", () => {
  it("ADMIN_PASSWORD env var is set and non-empty", () => {
    const pw = process.env.ADMIN_PASSWORD;
    expect(pw, "ADMIN_PASSWORD must be set").toBeTruthy();
    expect(pw!.length, "ADMIN_PASSWORD must be at least 6 chars").toBeGreaterThanOrEqual(6);
  });

  it("ADMIN_PASSWORD matches expected value", () => {
    // Validate the secret is correctly configured
    const pw = process.env.ADMIN_PASSWORD;
    expect(pw).toBe("Rightway101@");
  });
});
