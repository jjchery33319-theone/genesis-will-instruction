/**
 * Will V2 Generator Tests
 * Validates the structure of generated Will, Commentary, and Signing Guide HTML.
 */

import { describe, it, expect } from "vitest";
import { generateWillHtml } from "./willV2Generator";
import { generateCommentaryHtml } from "./willV2Commentary";
import { generateSigningGuideHtml } from "./willV2SigningGuide";
import type { FullMatter } from "./mattersDb";

// ── Test fixture ──────────────────────────────────────────────────────────────

const singleMatter: FullMatter = {
  id: 1,
  matterType: "single",
  fileReference: "GEP-TEST-001",
  status: "draft",
  editedWillHtmlTestator1: null,
  editedWillHtmlTestator2: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  clients: [
    {
      id: 1,
      matterId: 1,
      clientRole: "testator1",
      fullName: "Eleanor Angela Breen",
      address: "1 Test Street, London, W1A 1AA",
      dateOfBirth: "1960-05-15",
      email: "eleanor@test.com",
      phone: "07700000000",
    },
  ],
  executors: [
    {
      id: 1,
      matterId: 1,
      clientRole: "shared",
      executorType: "primary",
      sortOrder: 1,
      fullName: "James Breen",
      address: "2 Test Street, London, W1A 1AB",
    },
    {
      id: 2,
      matterId: 1,
      clientRole: "shared",
      executorType: "substitute",
      sortOrder: 1,
      fullName: "Sarah Breen",
      address: "3 Test Street, London, W1A 1AC",
    },
  ],
  guardians: [],
  beneficiaries: [
    {
      id: 1,
      matterId: 1,
      clientRole: "shared",
      beneficiaryType: "primary",
      sortOrder: 1,
      fullName: "James Breen",
      address: "2 Test Street, London",
      relationship: "son",
      shareFraction: "equal share",
      includeIssue: 1,
    },
    {
      id: 2,
      matterId: 1,
      clientRole: "shared",
      beneficiaryType: "primary",
      sortOrder: 2,
      fullName: "Sarah Breen",
      address: "3 Test Street, London",
      relationship: "daughter",
      shareFraction: "equal share",
      includeIssue: 1,
    },
  ],
  wishes: [
    {
      id: 1,
      matterId: 1,
      clientRole: "shared",
      ageCondition: 18,
      survivorshipDays: 28,
      organDonation: 0,
      organDonationText: null,
      funeralWishes: "I wish to be cremated.",
      extraNotes: null,
      residueToSpouseFirst: 0,
    },
  ],
};

const mirrorMatter: FullMatter = {
  ...singleMatter,
  id: 2,
  matterType: "mirror",
  fileReference: "GEP-TEST-002",
  clients: [
    {
      id: 3,
      matterId: 2,
      clientRole: "testator1",
      fullName: "Eleanor Angela Breen",
      address: "1 Test Street, London, W1A 1AA",
      dateOfBirth: "1960-05-15",
      email: "eleanor@test.com",
      phone: "07700000000",
    },
    {
      id: 4,
      matterId: 2,
      clientRole: "testator2",
      fullName: "Michael Patrick Breen",
      address: "1 Test Street, London, W1A 1AA",
      dateOfBirth: "1958-03-20",
      email: "michael@test.com",
      phone: "07700000001",
    },
  ],
  executors: [
    {
      id: 3,
      matterId: 2,
      clientRole: "testator1",
      executorType: "primary",
      sortOrder: 1,
      fullName: "Michael Patrick Breen",
      address: "1 Test Street, London",
    },
    {
      id: 4,
      matterId: 2,
      clientRole: "testator2",
      executorType: "primary",
      sortOrder: 1,
      fullName: "Eleanor Angela Breen",
      address: "1 Test Street, London",
    },
  ],
  guardians: [],
  beneficiaries: [
    {
      id: 3,
      matterId: 2,
      clientRole: "testator1",
      beneficiaryType: "primary",
      sortOrder: 1,
      fullName: "James Breen",
      address: "2 Test Street, London",
      relationship: "son",
      shareFraction: "equal share",
      includeIssue: 1,
    },
    {
      id: 4,
      matterId: 2,
      clientRole: "testator2",
      beneficiaryType: "primary",
      sortOrder: 1,
      fullName: "James Breen",
      address: "2 Test Street, London",
      relationship: "son",
      shareFraction: "equal share",
      includeIssue: 1,
    },
  ],
  wishes: [
    {
      id: 2,
      matterId: 2,
      clientRole: "testator1",
      ageCondition: 18,
      survivorshipDays: 28,
      organDonation: 0,
      organDonationText: null,
      funeralWishes: null,
      extraNotes: null,
      residueToSpouseFirst: 1,
    },
    {
      id: 3,
      matterId: 2,
      clientRole: "testator2",
      ageCondition: 18,
      survivorshipDays: 28,
      organDonation: 0,
      organDonationText: null,
      funeralWishes: null,
      extraNotes: null,
      residueToSpouseFirst: 1,
    },
  ],
};

// ── Will Generator Tests ──────────────────────────────────────────────────────

describe("willV2Generator — single will", () => {
  const html = generateWillHtml(singleMatter, "testator1");

  it("contains the testator full name", () => {
    expect(html).toContain("Eleanor Angela Breen");
  });

  it("contains the file reference", () => {
    expect(html).toContain("GEP-TEST-001");
  });

  it("contains the revocation clause", () => {
    expect(html.toLowerCase()).toContain("revoke");
  });

  it("contains the executor appointment clause", () => {
    expect(html.toLowerCase()).toContain("executor");
    expect(html).toContain("James Breen");
  });

  it("contains the substitute executor", () => {
    expect(html).toContain("Sarah Breen");
  });

  it("contains the beneficiary names", () => {
    expect(html).toContain("James Breen");
    expect(html).toContain("Sarah Breen");
  });

  it("contains the attestation / signing block", () => {
    expect(html.toLowerCase()).toContain("signed");
    expect(html.toLowerCase()).toContain("witness");
  });

  it("contains STEP powers reference", () => {
    expect(html.toUpperCase()).toContain("STEP");
  });

  it("contains the funeral wishes", () => {
    expect(html).toContain("cremated");
  });
});

describe("willV2Generator — mirror will", () => {
  const html1 = generateWillHtml(mirrorMatter, "testator1");
  const html2 = generateWillHtml(mirrorMatter, "testator2");

  it("testator1 will contains Eleanor's name", () => {
    expect(html1).toContain("Eleanor Angela Breen");
  });

  it("testator2 will contains Michael's name", () => {
    expect(html2).toContain("Michael Patrick Breen");
  });

  it("testator1 will appoints Michael as executor", () => {
    expect(html1).toContain("Michael Patrick Breen");
  });

  it("testator2 will appoints Eleanor as executor", () => {
    expect(html2).toContain("Eleanor Angela Breen");
  });

  it("testator1 will includes residue-to-spouse clause", () => {
    expect(html1.toLowerCase()).toContain("michael");
  });

  it("generates two distinct documents", () => {
    expect(html1).not.toEqual(html2);
  });
});

// ── Commentary Generator Tests ────────────────────────────────────────────────

describe("willV2Commentary", () => {
  const html = generateCommentaryHtml(singleMatter, "testator1");

  it("contains the commentary title", () => {
    expect(html.toUpperCase()).toContain("COMMENTARY");
  });

  it("contains Part 1 — named people", () => {
    expect(html).toContain("Part 1");
  });

  it("contains Part 2 — clause explanations", () => {
    expect(html).toContain("Part 2");
  });

  it("contains the testator name", () => {
    expect(html).toContain("Eleanor Angela Breen");
  });

  it("contains executor section", () => {
    expect(html.toLowerCase()).toContain("executor");
  });

  it("contains the not-a-legal-document footer", () => {
    expect(html.toLowerCase()).toContain("does not require a signature");
  });
});

// ── Signing Guide Tests ───────────────────────────────────────────────────────

describe("willV2SigningGuide", () => {
  const html = generateSigningGuideHtml(singleMatter, "testator1");

  it("contains the testator name in the attestation block", () => {
    expect(html).toContain("Eleanor Angela Breen");
  });

  it("contains signing instructions", () => {
    expect(html.toLowerCase()).toContain("sign");
  });

  it("contains witness instructions", () => {
    expect(html.toLowerCase()).toContain("witness");
  });

  it("contains the footer slogan", () => {
    expect(html).toContain("Sign your Will Today");
  });

  it("contains the file reference", () => {
    expect(html).toContain("GEP-TEST-001");
  });
});
