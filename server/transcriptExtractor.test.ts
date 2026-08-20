import { describe, expect, it } from "vitest";
import { extractTextFromBuffer } from "./transcriptExtractor";

describe("V1 instruction upload text extraction", () => {
  it("extracts plain text from a TXT instruction file", async () => {
    const text = await extractTextFromBuffer(
      Buffer.from("Client: Jane Smith\nPlease appoint Alex Smith as executor."),
      "text/plain",
      "instructions.txt"
    );

    expect(text).toContain("Jane Smith");
    expect(text).toContain("Alex Smith");
  });

  it("recognises a TXT file by extension when its browser MIME type is absent", async () => {
    const text = await extractTextFromBuffer(Buffer.from("Will instruction notes"), "", "notes.txt");
    expect(text).toBe("Will instruction notes");
  });

  it("rejects unsupported files without attempting to parse them", async () => {
    await expect(
      extractTextFromBuffer(Buffer.from("not a supported document"), "image/png", "image.png")
    ).rejects.toThrow("Unsupported file type");
  });
});
