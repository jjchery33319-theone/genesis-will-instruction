type InstructionFields = Record<string, unknown>;



function asText(value: unknown): string | undefined {
  
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
  
}



function asArray(value: unknown): unknown[] {
  
  if (Array.isArray(value)) return value;
  
  if (typeof value === "string") {
    
    try {
      
      const parsed = JSON.parse(value);
      
      return Array.isArray(parsed) ? parsed : [];
      
    } catch {
      
      return [];
      
    }
    
  }
  
  return [];
  
}



function preferredArray(preferred: unknown, fallback: unknown): unknown {
  
  return asArray(preferred).length > 0 ? preferred : fallback;
  
}



function preferredText(preferred: unknown, fallback: unknown): unknown {
  
  return asText(preferred) ?? fallback;
  
}



function childNames(value: unknown): string | undefined {
  
  const names = asArray(value)
  
    .map((child) => {
      
      if (!child || typeof child !== "object") return undefined;
      
      const entry = child as Record<string, unknown>;
      
      const componentName = [entry.firstName, entry.middleName, entry.lastName]
      
        .map(asText)
      
        .filter(Boolean)
      
        .join(" ");
      
      return asText(entry.fullName) ?? (componentName || undefined);
      
    })
  
    .filter((name): name is string => Boolean(name));
  

  
  return names.length ? names.join(", ") : undefined;
  
}



/**

 * Back Office single-Will imports store details in client1-prefixed fields.
 
 * Earlier V1 records used shared fields, so normalise before V2 conversion.
 
 */

export function normalizeInstructionForMatterTransfer<T extends InstructionFields>(instruction: T): T {
  
  const isMirror = instruction.willType === "mirror" || instruction.willType === "mirrorWills";
  
  const notes = [asText(instruction.additionalNotes), asText(instruction.specialNotes)];
  

  
  const residualEstate = isMirror
  
    ? [asText(instruction.client1ResidualEstate), asText(instruction.client2ResidualEstate)]
    
        .filter(Boolean)
    
        .join(" | ")
    
    : asText(instruction.client1ResidualEstate) ?? asText(instruction.residualEstate);
  
  if (residualEstate) notes.push(`Legacy residuary estate instruction: ${residualEstate}`);
  

  
  const childSummary = [childNames(instruction.client1ChildrenUnder18), childNames(instruction.client1ChildrenOver18)]
  
    .filter(Boolean)
  
    .join("; ");
  
  if (childSummary) notes.push(`Legacy family information: ${childSummary}`);
  

  
  const propertySummary = [
    
    asText(instruction.propertyOwnership) ? `ownership: ${asText(instruction.propertyOwnership)}` : undefined,
    
    asText(instruction.propertyValue) ? `stated value: £${asText(instruction.propertyValue)}` : undefined,
    
    asText(instruction.mortgageBalance) ? `mortgage: £${asText(instruction.mortgageBalance)}` : undefined,
    
  ].filter(Boolean).join("; ");
  
  if (propertySummary) notes.push(`Legacy property details: ${propertySummary}`);
  

  
  const combinedNotes = Array.from(new Set(notes.filter(Boolean))).join("\n\n") || undefined;
  
  if (isMirror) return { ...instruction, additionalNotes: combinedNotes } as T;
  

  
  return {
    
    ...instruction,
    
    executors: preferredArray(instruction.client1Executors, instruction.executors),
    
    reservedExecutors: preferredArray(instruction.client1ReservedExecutors, instruction.reservedExecutors),
    
    guardians: preferredArray(instruction.client1Guardians, instruction.guardians),
    
    reservedGuardians: preferredArray(instruction.client1ReservedGuardians, instruction.reservedGuardians),
    
    beneficiaries: preferredArray(instruction.client1Beneficiaries, instruction.beneficiaries),
    
    specificGifts: preferredArray(instruction.client1SpecificGifts, instruction.specificGifts),
    funeralType: preferredText(instruction.client1FuneralType, instruction.funeralType),
    funeralWishes: preferredText(instruction.client1FuneralWishes, instruction.funeralWishes),
    organDonation: preferredText(instruction.client1OrganDonation, instruction.organDonation),
    additionalNotes: combinedNotes,
  } as T;
}
