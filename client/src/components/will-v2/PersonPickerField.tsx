/**
 * PersonPickerField
 *
 * A reusable "Select an existing person or add new" dropdown that sits at the
 * top of any person-entry card in the V2 MatterForm.
 *
 * Behaviour:
 *  - Loads the People Pool for the given matterId via tRPC.
 *  - Renders a Select with one option per pooled person plus an "Add new person"
 *    sentinel at the top.
 *  - On select: calls onSelect(person) so the parent can fill its local state.
 *  - On "Add new": calls onSelect(null) so the parent can clear its fields.
 *  - The component is purely presentational — it does NOT mutate the pool
 *    itself; the parent is responsible for calling upsertPersonPool when fields
 *    change (handled in MatterForm's save flow).
 */
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

export interface PoolPerson {
  id: number;
  fullName: string;
  dateOfBirth?: string | null;
  address?: string | null;
  relationship?: string | null;
  sourceRole?: string | null;
}

interface PersonPickerFieldProps {
  matterId: number;
  /** The currently selected pool person id, or undefined if "add new" */
  selectedId?: number;
  onSelect: (person: PoolPerson | null) => void;
  label?: string;
}

const ADD_NEW_VALUE = "__add_new__";

export function PersonPickerField({
  matterId,
  selectedId,
  onSelect,
  label = "Select existing person",
}: PersonPickerFieldProps) {
  const { data: pool = [] } = trpc.matters.listPeoplePool.useQuery(
    { matterId },
    { staleTime: 30_000 }
  );

  if (pool.length === 0) return null;

  const handleChange = (value: string) => {
    if (value === ADD_NEW_VALUE) {
      onSelect(null);
      return;
    }
    const id = parseInt(value, 10);
    const person = pool.find((p) => p.id === id) ?? null;
    onSelect(person);
  };

  return (
    <div className="space-y-1 col-span-2">
      <Label className="text-xs flex items-center gap-1 text-muted-foreground">
        <Users className="h-3 w-3" />
        {label}
      </Label>
      <Select
        value={selectedId !== undefined ? String(selectedId) : ADD_NEW_VALUE}
        onValueChange={handleChange}
      >
        <SelectTrigger className="h-8 text-sm border-dashed border-muted-foreground/40 bg-muted/20">
          <SelectValue placeholder="Select an existing person or add new…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ADD_NEW_VALUE}>
            <span className="text-muted-foreground italic">— Add new person —</span>
          </SelectItem>
          {pool.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.fullName}
              {p.relationship ? ` (${p.relationship})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
