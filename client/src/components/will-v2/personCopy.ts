export type PersonCopySource = {
  fullName?: unknown;
  title?: unknown;
  address?: unknown;
  dateOfBirth?: unknown;
  gender?: unknown;
  relationship?: unknown;
};

export type CurrentMatterPerson = {
  _tempKey: string;
  fullName: string;
  title: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  relationship: string;
  sourceRole: string;
};

type PersonSection = {
  key: string;
  sourceRole: string;
  people: PersonCopySource[];
};

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

/** Returns the common personal details that can safely be copied into another V2 people entry. */
export function copiedPersonFields(source: PersonCopySource | null | undefined) {
  return {
    title: text(source?.title),
    fullName: text(source?.fullName),
    address: text(source?.address),
    dateOfBirth: text(source?.dateOfBirth),
    gender: text(source?.gender),
    relationship: text(source?.relationship),
  };
}

/**
 * Builds a de-duplicated, in-memory copy list. This makes a newly entered person
 * available in other V2 sections immediately, before the Matter is saved.
 */
export function buildCurrentMatterPeople(sections: PersonSection[]): CurrentMatterPerson[] {
  const seen = new Set<string>();
  const candidates: CurrentMatterPerson[] = [];

  sections.forEach(({ key, sourceRole, people }) => {
    people.forEach((person, index) => {
      const fields = copiedPersonFields(person);
      if (!fields.fullName) return;

      const fingerprint = [
        fields.fullName.toLowerCase(),
        fields.address.toLowerCase(),
        fields.dateOfBirth,
        fields.relationship.toLowerCase(),
      ].join("|");
      if (seen.has(fingerprint)) return;
      seen.add(fingerprint);

      candidates.push({
        _tempKey: `${key}-${index}`,
        sourceRole,
        ...fields,
      });
    });
  });

  return candidates;
}

/** Returns a small, case-insensitive suggestion list only after staff start typing a name. */
export function findMatchingMatterPeople(candidates: CurrentMatterPerson[], query: string, limit = 6): CurrentMatterPerson[] {
  const normalizedQuery = text(query).toLowerCase();
  if (!normalizedQuery) return [];

  return candidates
    .filter((person) => person.fullName.toLowerCase().includes(normalizedQuery))
    .slice(0, limit);
}
