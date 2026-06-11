import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FUNERAL_TYPES } from "../../../../../shared/willConstants";
import { Flower2, BookOpen } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

export default function Step14Wishes({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      {/* Residuary Estate */}
      <FormCard
        title="Residuary Estate"
        subtitle="Who inherits the remainder of the estate after all gifts, debts, and expenses have been settled"
        icon={<BookOpen className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <FieldRow
            label="Residuary Estate — Who inherits the remainder?"
            hint="The residuary estate is everything left after specific gifts and debts have been paid"
            required
          >
            <Textarea
              rows={3}
              value={data.residuaryEstate ?? ""}
              onChange={e => onChange({ residuaryEstate: e.target.value })}
              placeholder="e.g. To my spouse absolutely, or if they predecease me, equally between my children…"
            />
          </FieldRow>

          <FieldRow
            label="Backup / Substitution Clause"
            hint="What happens if the primary residuary beneficiary predeceases the client?"
          >
            <Textarea
              rows={3}
              value={data.residuaryBackup ?? ""}
              onChange={e => onChange({ residuaryBackup: e.target.value })}
              placeholder="e.g. If my spouse predeceases me, I leave the residue equally between my children…"
            />
          </FieldRow>
        </div>
      </FormCard>

      {/* Funeral Wishes */}
      <FormCard
        title="Funeral Wishes"
        subtitle="The client's preferences for their funeral arrangements"
        icon={<Flower2 className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow label="Funeral Type">
              <Select
                value={data.funeralType ?? ""}
                onValueChange={v => onChange({ funeralType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preference…" />
                </SelectTrigger>
                <SelectContent>
                  {FUNERAL_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
          </div>

          <FieldRow label="Funeral Wishes & Instructions" hint="Any specific requests for the funeral service">
            <Textarea
              rows={4}
              value={data.funeralWishes ?? ""}
              onChange={e => onChange({ funeralWishes: e.target.value })}
              placeholder="e.g. I would like a quiet family service. No flowers, donations to Cancer Research UK…"
            />
          </FieldRow>

          <div className="flex items-center gap-3">
            <Switch
              checked={data.organDonation === "yes"}
              onCheckedChange={v => onChange({ organDonation: v ? "yes" : "no" })}
            />
            <Label className="text-sm cursor-pointer">
              Client wishes to register as an organ donor
            </Label>
          </div>
        </div>
      </FormCard>
    </div>
  );
}
