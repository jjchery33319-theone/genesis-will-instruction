/**
 * Transcript text extraction utility
 * Extracts plain text from PDF, DOCX, and TXT files
 */

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
    // Dynamic import to avoid bundling issues
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
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
