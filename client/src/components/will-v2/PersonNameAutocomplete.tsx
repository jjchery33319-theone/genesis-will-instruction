import { useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { UserRound } from "lucide-react";
import { findMatchingMatterPeople, type CurrentMatterPerson } from "./personCopy";

interface PersonNameAutocompleteProps {
  value: string;
  candidates: CurrentMatterPerson[];
  onValueChange: (value: string) => void;
  onSelect: (person: CurrentMatterPerson) => void;
  placeholder?: string;
}

/**
 * A Matter-local name field. It preserves ordinary typing while offering explicit
 * suggestions that, when chosen, allow the parent row to copy personal details.
 */
export function PersonNameAutocomplete({
  value,
  candidates,
  onValueChange,
  onSelect,
  placeholder = "Full legal name",
}: PersonNameAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const matches = useMemo(() => findMatchingMatterPeople(candidates, value), [candidates, value]);
  const showSuggestions = isOpen && matches.length > 0;

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
        placeholder={placeholder}
        className="h-8 text-sm"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? listboxId : undefined}
      />
      {showSuggestions && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="People already entered in this Matter"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="border-b border-border bg-muted/50 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
            Existing people in this Matter
          </div>
          {matches.map((person) => (
            <button
              key={person._tempKey}
              type="button"
              role="option"
              aria-selected={false}
              className="flex w-full items-start gap-2 px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(person);
                setIsOpen(false);
              }}
            >
              <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{person.fullName}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[person.relationship, person.sourceRole].filter(Boolean).join(" · ") || "Previously entered"}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
