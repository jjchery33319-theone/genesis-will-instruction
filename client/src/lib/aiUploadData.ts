export function captureAiFieldSnapshot<T extends Record<string, unknown>>(
  currentData: T,
  populatedFields: string[]
): Partial<T> {
  return Object.fromEntries(
    populatedFields.map((field) => [field, currentData[field as keyof T]])
  ) as Partial<T>;
}
