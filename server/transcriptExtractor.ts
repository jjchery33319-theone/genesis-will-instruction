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
    // pdf-parse 1.x uses PDF.js 1.x and runs entirely in Node. It avoids the
    // DOMMatrix dependency introduced by the newer browser-oriented parser.
    const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (input: Buffer) => Promise<{ text: string }>;
    const result = await pdfParse(buffer);
    return result.text;
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
