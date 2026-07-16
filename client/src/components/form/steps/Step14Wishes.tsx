import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FUNERAL_TYPES } from "../../../../../shared/willConstants";
import { Flower2, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyUndo } from "../../../hooks/useCopyUndo";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

function ClientFuneralSection({
  label,
  fieldPrefix,
  data,
  onChange,
}: {
  label: string;
  fieldPrefix: "client1" | "client2";
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}) {
  const funeralTypeKey = `${fieldPrefix}FuneralType` as "client1FuneralType" | "client2FuneralType";
  const funeralWishesKey = `${fieldPrefix}FuneralWishes` as "client1FuneralWishes" | "client2FuneralWishes";
  const organDonationKey = `${fieldPrefix}OrganDonation` as "client1OrganDonation" | "client2OrganDonation";

  return (
    <div className="space-y-4">
      <SectionDivider title={label} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldRow label="Funeral Type">
          <Select
            value={data[funeralTypeKey] ?? ""}
            onValueChange={v => onChange({ [funeralTypeKey]: v } as Partial<WillFormData>)}
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
          rows={5}
          value={data[funeralWishesKey] ?? ""}
          onChange={e => onChange({ [funeralWishesKey]: e.target.value } as Partial<WillFormData>)}
          placeholder="e.g. I would like a quiet family service. No flowers, donations to Cancer Research UK…"
        />
      </FieldRow>

      <div className="flex items-center gap-3">
        <Switch
          id={`${fieldPrefix}-organ-donation`}
          checked={data[organDonationKey] === "yes"}
          onCheckedChange={v => onChange({ [organDonationKey]: v ? "yes" : "no" } as Partial<WillFormData>)}
        />
        <Label htmlFor={`${fieldPrefix}-organ-donation`} className="text-sm cursor-pointer">
          Wishes to register as an organ donor
        </Label>
      </div>
    </div>
  );
}

export default function Step14Wishes({ data, onChange }: Props) {
  const isMirrorWill =
    data.productsOrdered?.includes("mirror_wills") || data.willType === "Mirror Wills";

  const c1Name = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ") || "Client 1";
  const c2Name = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ") || "Client 2";

  return (
    <div className="space-y-5">
      <FormCard
        title="Funeral Wishes"
        subtitle="Each client's preferences for their funeral arrangements"
        icon={<Flower2 className="w-4 h-4" />}
      >
        <ClientFuneralSection
          label={c1Name}
          fieldPrefix="client1"
          data={data}
          onChange={onChange}
        />

        {isMirrorWill && (() => {
          const c1HasWishes = !!(data.client1FuneralType || data.client1FuneralWishes || data.client1OrganDonation);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { hasSnapshot: hasWishSnapshot, saveSnapshot: saveWishSnapshot, undo: undoWishes } = useCopyUndo(data, onChange);
          const copyWishesFromClient1 = () => {
            saveWishSnapshot(["client2FuneralType", "client2FuneralWishes", "client2OrganDonation"]);
            onChange({
              client2FuneralType: data.client1FuneralType,
              client2FuneralWishes: data.client1FuneralWishes,
              client2OrganDonation: data.client1OrganDonation,
            });
          };
          return (
            <>
              {hasWishSnapshot && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: "oklch(0.98 0.02 85)", border: "1px solid oklch(0.78 0.12 85 / 0.5)" }}>
                  <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.55 0.12 85)" }} />
                  <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.08 85)" }}>Funeral wishes copied from Client 1. Changed your mind?</span>
                  <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" style={{ borderColor: "oklch(0.78 0.12 85 / 0.6)", color: "oklch(0.45 0.1 85)" }} onClick={undoWishes}>
                    <RotateCcw className="w-3 h-3" /> Undo Copy
                  </Button>
                </div>
              )}
              {c1HasWishes && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: "oklch(0.97 0.015 155)", border: "1px solid oklch(0.65 0.08 155 / 0.3)" }}>
                  <Copy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.35 0.1 155)" }} />
                  <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.1 155)" }}>Copy funeral type, wishes &amp; organ donation preference from Client 1</span>
                  <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" style={{ borderColor: "oklch(0.65 0.08 155 / 0.6)", color: "oklch(0.28 0.07 155)" }} onClick={copyWishesFromClient1}>
                    <Copy className="w-3 h-3" /> Copy from Client 1
                  </Button>
                </div>
              )}
              <ClientFuneralSection
                label={c2Name}
                fieldPrefix="client2"
                data={data}
                onChange={onChange}
              />
            </>
          );
        })()}
      </FormCard>
    </div>
  );
}
