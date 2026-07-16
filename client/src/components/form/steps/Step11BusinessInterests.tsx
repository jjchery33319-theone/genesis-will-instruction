import { WillFormData, BusinessInterestEntry } from "../../../hooks/useWillForm";
import { FormCard, FieldRow } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Trash2 } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

const emptyBusiness = (): BusinessInterestEntry => ({
  businessName: "",
  natureOfBusiness: "",
  ownershipPercentage: "",
  notes: "",
});

export default function Step11BusinessInterests({ data, onChange }: Props) {
  const businesses = data.businessInterestsDetails ?? [];
  const hasInterests = data.hasBusinessInterests;

  const addBusiness = () => {
    onChange({ businessInterestsDetails: [...businesses, emptyBusiness()] });
  };

  const updateBusiness = (index: number, updates: Partial<BusinessInterestEntry>) => {
    const updated = businesses.map((b, i) => (i === index ? { ...b, ...updates } : b));
    onChange({ businessInterestsDetails: updated });
  };

  const removeBusiness = (index: number) => {
    onChange({ businessInterestsDetails: businesses.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-5">
      <FormCard
        title="Business Interests"
        subtitle="If the client owns or has an interest in a business, this should be noted"
        icon={<Briefcase className="w-4 h-4" />}
      >
        <FieldRow label="Does the client own or have an interest in a business?">
          <Select
            value={hasInterests ?? ""}
            onValueChange={v => {
              onChange({ hasBusinessInterests: v });
              if (v === "yes" && businesses.length === 0) {
                onChange({ businessInterestsDetails: [emptyBusiness()] });
              }
            }}
          >
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>

        {hasInterests === "yes" && (
          <div className="mt-6 space-y-4">
            {/* Business Relief notice */}
            <div
              className="rounded-lg p-3 text-xs"
              style={{ background: "oklch(0.97 0.03 90)", borderLeft: "3px solid oklch(0.65 0.14 80)" }}
            >
              <span className="font-semibold" style={{ color: "oklch(0.45 0.12 80)" }}>
                Business Relief (BR):
              </span>{" "}
              <span className="text-muted-foreground">
                Qualifying business interests may attract 100% Business Relief from Inheritance Tax.
                Consider whether a Business Will or shareholder agreement is in place.
              </span>
            </div>

            {businesses.map((biz, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 space-y-4"
                style={{ borderColor: "oklch(0.88 0.02 155)", background: "oklch(0.99 0.005 155)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>
                    Business {index + 1}
                  </span>
                  {businesses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBusiness(index)}
                      className="text-destructive hover:text-destructive h-7 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldRow label="Business Name">
                    <Input
                      value={biz.businessName}
                      onChange={e => updateBusiness(index, { businessName: e.target.value })}
                      placeholder="e.g. ABC Consulting Ltd"
                    />
                  </FieldRow>
                  <FieldRow label="Nature of Business">
                    <Input
                      value={biz.natureOfBusiness}
                      onChange={e => updateBusiness(index, { natureOfBusiness: e.target.value })}
                      placeholder="e.g. IT Consultancy, Retail, Property…"
                    />
                  </FieldRow>
                  <FieldRow label="Ownership Percentage" hint="e.g. 50%, 100%, minority shareholder">
                    <Input
                      value={biz.ownershipPercentage ?? ""}
                      onChange={e => updateBusiness(index, { ownershipPercentage: e.target.value })}
                      placeholder="e.g. 100%"
                    />
                  </FieldRow>
                </div>

                <FieldRow label="Notes" hint="Partnership agreements, shareholder agreements, succession plans, etc.">
                  <Textarea
                    rows={5}
                    value={biz.notes ?? ""}
                    onChange={e => updateBusiness(index, { notes: e.target.value })}
                    placeholder="e.g. Sole trader, no partnership agreement in place. Client wishes to leave business to son…"
                  />
                </FieldRow>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addBusiness}
              className="w-full gap-2 border-dashed"
              style={{ borderColor: "oklch(0.65 0.14 80)", color: "oklch(0.45 0.12 155)" }}
            >
              <Plus className="w-4 h-4" />
              Add Another Business
            </Button>
          </div>
        )}

        {hasInterests === "no" && (
          <div
            className="mt-4 rounded-lg p-3 text-sm"
            style={{ background: "oklch(0.97 0.015 155)", color: "oklch(0.45 0.08 155)" }}
          >
            No business interests noted. If the client acquires business interests in future, a Will review will be recommended.
          </div>
        )}
      </FormCard>
    </div>
  );
}
