import { WillFormData, SpecificGift } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FUNERAL_TYPES } from "../../../../../shared/willConstants";
import { Gift, Flower2, Plus, Trash2 } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

export default function Step7Wishes({ data, onChange }: Props) {
  const gifts = data.specificGifts ?? [];

  const addGift = () => {
    onChange({ specificGifts: [...gifts, { description: "", recipient: "" }] });
  };

  const updateGift = (index: number, field: keyof SpecificGift, value: string) => {
    const updated = gifts.map((g, i) => (i === index ? { ...g, [field]: value } : g));
    onChange({ specificGifts: updated });
  };

  const removeGift = (index: number) => {
    onChange({ specificGifts: gifts.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-5">
      {/* Specific Gifts */}
      <FormCard
        title="Specific Gifts & Legacies"
        subtitle="Items or sums of money left to specific individuals or organisations"
        icon={<Gift className="w-4 h-4" />}
      >
        <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}>
          <strong>Guidance:</strong> Specific gifts are made before the residuary estate is distributed. Examples include jewellery, vehicles, cash sums, or charitable donations. Leave blank if no specific gifts are required.
        </div>

        <div className="space-y-3">
          {gifts.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No specific gifts added yet.</p>
          )}
          {gifts.map((gift, index) => (
            <div
              key={index}
              className="border border-border rounded-lg p-4 space-y-3"
              style={{ background: "oklch(0.99 0.005 155)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Gift {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGift(index)}
                  className="text-destructive hover:text-destructive h-7 w-7 p-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldRow label="Description of Gift">
                  <Input
                    value={gift.description}
                    onChange={e => updateGift(index, "description", e.target.value)}
                    placeholder="e.g. My gold watch, £5,000 cash, my car…"
                  />
                </FieldRow>
                <FieldRow label="Recipient">
                  <Input
                    value={gift.recipient}
                    onChange={e => updateGift(index, "recipient", e.target.value)}
                    placeholder="Full name of recipient"
                  />
                </FieldRow>
              </div>
              <FieldRow label="Notes">
                <Input
                  value={gift.notes ?? ""}
                  onChange={e => updateGift(index, "notes", e.target.value)}
                  placeholder="Any conditions or additional notes…"
                />
              </FieldRow>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addGift}
            className="gap-2 border-dashed"
            style={{ borderColor: "oklch(0.78 0.12 85)", color: "oklch(0.28 0.07 155)" }}
          >
            <Plus className="w-4 h-4" />
            Add Specific Gift
          </Button>
        </div>

        <SectionDivider title="Residuary Estate" />

        <div className="space-y-4">
          <FieldRow
            label="Residuary Estate — Who inherits the remainder?"
            hint="The residuary estate is everything left after specific gifts and debts have been paid"
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

        <SectionDivider title="Special Notes" />

        <FieldRow label="Special Notes / Additional Instructions" hint="Any other information relevant to this Will instruction">
          <Textarea
            rows={4}
            value={data.specialNotes ?? ""}
            onChange={e => onChange({ specialNotes: e.target.value })}
            placeholder="Any additional notes, special circumstances, or instructions for the drafting team…"
          />
        </FieldRow>
      </FormCard>
    </div>
  );
}
