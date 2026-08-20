export type V1SubmissionError = { path: string[]; message: string };

export function extractV1SubmissionError(error: unknown): V1SubmissionError | null {
  const source = error as { message?: unknown; cause?: unknown; data?: { zodError?: { issues?: unknown[] } } };
  const issue = source?.data?.zodError?.issues?.[0] as { path?: unknown; message?: unknown } | undefined;
  if (Array.isArray(issue?.path)) return { path: issue.path.map(String), message: String(issue.message ?? "Please review this field.") };
  const text = [source?.message, source?.cause instanceof Error ? source.cause.message : source?.cause].filter(Boolean).map(String).join(" ");
  const match = text.match(/\[\s*\{[\s\S]*?"path"\s*:\s*\[[\s\S]*?\][\s\S]*?\}\s*\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Array<{ path?: unknown; message?: unknown }>;
    if (Array.isArray(parsed[0]?.path)) return { path: parsed[0].path.map(String), message: String(parsed[0].message ?? "Please review this field.") };
  } catch { /* retain the normal toast when a malformed error cannot be parsed */ }
  return null;
}

const STEP_BY_ROOT: Record<string, number> = {
  client1TotalChildren: 3, client2TotalChildren: 3, client1HasChildren: 3, client2HasChildren: 3,
  lifeInsurancePolicies: 8, hasLifeInsurance: 8, lifeInsuranceNotes: 8,
  client1SpecificGifts: 12, client2SpecificGifts: 12,
  client1Beneficiaries: 13, client2Beneficiaries: 13, client1Exclusions: 13, client2Exclusions: 13,
  client1Executors: 6, client2Executors: 6, client1ReservedExecutors: 6, client2ReservedExecutors: 6,
  propertyOwned: 7, propertyAddress: 7, mortgageOutstanding: 7,
  hasBusinessInterests: 9, businessInterests: 9, hasPets: 10,
  client1FuneralWishes: 11, client2FuneralWishes: 11,
};

export function submissionErrorStep(path: string[]): number {
  return STEP_BY_ROOT[path[0] ?? ""] ?? 15;
}

export function submissionErrorFieldPath(path: string[]): string {
  return path.reduce((result, segment) => (/^\d+$/.test(segment) ? `${result}[${segment}]` : result ? `${result}.${segment}` : segment), "");
}
