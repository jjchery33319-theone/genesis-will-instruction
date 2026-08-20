import { describe, expect, it } from "vitest";
import { extractTextFromBuffer } from "./transcriptExtractor";
import { readFile } from "node:fs/promises";
import { Document, Packer, Paragraph } from "docx";

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

  it("extracts a PDF through the Node parser without requiring DOMMatrix", async () => {
    const pdf = await readFile(new URL("./lpa-lp1f.pdf", import.meta.url));
    const text = await extractTextFromBuffer(pdf, "application/pdf", "instructions.pdf");
    expect(typeof text).toBe("string");
  }, 30_000);

  it("continues to extract text from Word instruction files", async () => {
    const document = new Document({ sections: [{ children: [new Paragraph("Appoint Taylor Jones as executor.")] }] });
    const text = await extractTextFromBuffer(
      Buffer.from(await Packer.toBuffer(document)),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "instructions.docx"
    );
    expect(text).toContain("Taylor Jones");
  });

  it("rejects unsupported files without attempting to parse them", async () => {
    await expect(
      extractTextFromBuffer(Buffer.from("not a supported document"), "image/png", "image.png")
    ).rejects.toThrow("Unsupported file type");
  });
});
