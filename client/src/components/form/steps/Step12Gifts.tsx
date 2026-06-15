import { WillFormData, SpecificGift } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Gift, Plus, Trash2, Heart } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

function GiftList({
  gifts,
  onChange,
  label,
}: {
  gifts: SpecificGift[];
  onChange: (gifts: SpecificGift[]) => void;
  label: string;
}) {
  const addGift = () => {
    onChange([...gifts, { description: "", recipient: "", value: "", isCharity: false, notes: "" }]);
  };

  const updateGift = (index: number, updates: Partial<SpecificGift>) => {
    onChange(gifts.map((g, i) => (i === index ? { ...g, ...updates } : g)));
  };

  const removeGift = (index: number) => {
    onChange(gifts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <SectionDivider title={label} />

      {gifts.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No specific gifts or legacies added yet.</p>
      )}

      {gifts.map((gift, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 space-y-3"
          style={{
            background: gift.isCharity ? "oklch(0.98 0.02 90)" : "oklch(0.99 0.005 155)",
            borderColor: gift.isCharity ? "oklch(0.78 0.12 85)" : "oklch(0.88 0.02 155)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {gift.isCharity ? (
                <Heart className="w-4 h-4" style={{ color: "oklch(0.55 0.18 25)" }} />
              ) : (
                <Gift className="w-4 h-4" style={{ color: "oklch(0.45 0.12 155)" }} />
              )}
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {gift.isCharity ? `Charitable Legacy ${index + 1}` : `Gift / Legacy ${index + 1}`}
              </span>
            </div>
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

          <div className="flex items-center gap-3">
            <Switch
              id={`charity-${label}-${index}`}
              checked={gift.isCharity ?? false}
              onCheckedChange={v => updateGift(index, { isCharity: v })}
            />
            <Label htmlFor={`charity-${label}-${index}`} className="text-sm cursor-pointer">
              This is a charitable legacy
            </Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldRow label={gift.isCharity ? "Charity Name" : "Description of Gift"}>
              <Input
                value={gift.description}
                onChange={e => updateGift(index, { description: e.target.value })}
                placeholder={gift.isCharity ? "e.g. Cancer Research UK…" : "e.g. My gold watch, £5,000 cash…"}
              />
            </FieldRow>
            <FieldRow label={gift.isCharity ? "Registered Charity Number" : "Recipient"}>
              <Input
                value={gift.recipient}
                onChange={e => updateGift(index, { recipient: e.target.value })}
                placeholder={gift.isCharity ? "e.g. 1089464 (optional)" : "Full name of recipient"}
              />
            </FieldRow>
            <FieldRow label="Value / Amount" hint="Cash amount or estimated value">
              <Input
                value={gift.value ?? ""}
                onChange={e => updateGift(index, { value: e.target.value })}
                placeholder="e.g. £5,000 or 'the item itself'"
              />
            </FieldRow>
            <FieldRow label="Notes / Conditions">
              <Input
                value={gift.notes ?? ""}
                onChange={e => updateGift(index, { notes: e.target.value })}
                placeholder="Any conditions, e.g. only if they survive me by 30 days…"
              />
            </FieldRow>
          </div>
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
        Add Gift / Legacy
      </Button>
    </div>
  );
}

export default function Step12Gifts({ data, onChange }: Props) {
  const isMirrorWill =
    data.productsOrdered?.includes("mirror_wills") || data.willType === "Mirror Wills";

  const c1Name = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ") || "Client 1";
  const c2Name = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ") || "Client 2";

  return (
    <div className="space-y-5">
      <FormCard
        title="Legacies & Gifts"
        subtitle="Specific monetary or physical gifts to be left to individuals or charities"
        icon={<Gift className="w-4 h-4" />}
      >
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.28 0.07 155)" }}
        >
          <strong>Guidance:</strong> Specific gifts are distributed before the residuary estate. They can include
          cash sums, jewellery, vehicles, property, or charitable donations. If no specific gifts are required,
          leave this section blank and proceed.
        </div>

        <GiftList
          gifts={data.client1SpecificGifts ?? []}
          onChange={gifts => onChange({ client1SpecificGifts: gifts })}
          label={c1Name}
        />

        {isMirrorWill && (
          <GiftList
            gifts={data.client2SpecificGifts ?? []}
            onChange={gifts => onChange({ client2SpecificGifts: gifts })}
            label={c2Name}
          />
        )}
      </FormCard>
    </div>
  );
}
