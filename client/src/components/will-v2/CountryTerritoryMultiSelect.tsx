import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getForeignAssetCountryOptions, type ForeignAssetCountryOption } from "@shared/foreignAssetCountries";

interface CountryTerritoryMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  id?: string;
}

export function CountryTerritoryMultiSelect({ value, onChange, id = "foreign-assets-countries" }: CountryTerritoryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const options = useMemo(() => getForeignAssetCountryOptions(), []);
  const selected = useMemo(() => options.filter(option => value.includes(option.code)), [options, value]);
  const query = search.trim().toLocaleLowerCase();
  const visibleOptions = useMemo(() => options.filter(option =>
    !query || option.label.toLocaleLowerCase().includes(query) || option.code.toLocaleLowerCase().includes(query)
  ), [options, query]);

  const toggle = (option: ForeignAssetCountryOption) => {
    onChange(value.includes(option.code)
      ? value.filter(code => code !== option.code)
      : [...value, option.code]);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs">Country or territory</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-9 w-full justify-between bg-background text-sm font-normal"
          >
            <span className="truncate">{selected.length ? `${selected.length} selected` : "Select country or territory…"}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search countries or territories…"
            className="mb-2 h-8 text-sm"
            autoFocus
          />
          <div className="max-h-56 overflow-y-auto pr-1" role="listbox" aria-multiselectable="true">
            {visibleOptions.length ? visibleOptions.map(option => {
              const isSelected = value.includes(option.code);
              return (
                <button
                  key={option.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(option)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                >
                  <span className={cn("flex h-4 w-4 items-center justify-center rounded border", isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            }) : <p className="px-2 py-3 text-xs text-muted-foreground">No country or territory found.</p>}
          </div>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Selected countries or territories">
          {selected.map(option => (
            <span key={option.code} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
              {option.label}
              <button type="button" onClick={() => toggle(option)} className="rounded-full text-muted-foreground hover:text-foreground" aria-label={`Remove ${option.label}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
