import { writeFileSync } from "node:fs";
import { generateWelcomePackDocx } from "./server/welcomePackDocxGenerator";

const documentBuffer = await generateWelcomePackDocx({
  willType: "Mirror Wills",
  client1FirstName: "Alice",
  client1LastName: "Example",
  client2FirstName: "Brian",
  client2LastName: "Example",
  client1Exclusions: [{
    fullName: "Morgan Example",
    relationship: "Son",
    reason: "relationship_breakdown",
    notes: "No provision is to be made for this person.",
  }],
  client2Exclusions: [{
    fullName: "Robin Example",
    relationship: "Former partner",
    reason: "other",
    otherReason: "Independent financial provision already agreed",
  }],
} as never);

writeFileSync("/tmp/v1-exclusion-verification.docx", documentBuffer);
