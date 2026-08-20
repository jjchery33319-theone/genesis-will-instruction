/**
 * Transcript text extraction utility
 * Extracts plain text from PDF, DOCX, and TXT files
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimetype: string,
  originalname: string
): Promise<string> {
  const ext = originalname.split(".").pop()?.toLowerCase() ?? "";

  // Plain text
  if (mimetype === "text/plain" || ext === "txt") {
    return buffer.toString("utf-8");
  }

  // PDF
  if (mimetype === "application/pdf" || ext === "pdf") {
    // Use the CommonJS Node entry point. The ESM/browser condition of pdf-parse
    // selects a PDF.js bundle that expects DOMMatrix, which does not exist on
    // Vercel's Node runtime.
    const { PDFParse } = require("pdf-parse") as {
      PDFParse: new (options: { data: Buffer }) => {
        getText: () => Promise<{ text: string }>;
        destroy: () => Promise<void>;
      };
    };
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  // DOCX / Word
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword" ||
    ext === "docx" ||
    ext === "doc"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(
    `Unsupported file type: ${mimetype || ext}. Please upload a PDF, Word (.docx), or plain text (.txt) file.`
  );
}
