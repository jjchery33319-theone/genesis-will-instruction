export function captureAiFieldSnapshot<T extends Record<string, unknown>>(
  currentData: T,
  populatedFields: string[]
): Partial<T> {
  return Object.fromEntries(
    populatedFields.map((field) => [field, currentData[field as keyof T]])
  ) as Partial<T>;
}

export function parseStructuredAiSummaryEdit(rawValue: string):
  | { ok: true; value: unknown }
  | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(rawValue) };
  } catch {
    return { ok: false, error: "Use valid JSON for this structured value." };
  }
}
