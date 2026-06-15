import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PROPERTY_OWNERSHIP_TYPES } from "../../../../../shared/willConstants";
import { Home, Landmark, AlertCircle, User } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

export default function Step6Property({ data, onChange }: Props) {
  const ownsProperty = data.propertyOwned === "yes";
  const hasOtherProperties = data.hasOtherProperties === "yes";
  const hasCareConerns = data.careConcerns === "yes";

  const c1Name = [data.client1FirstName, data.client1LastName].filter(Boolean).join(" ") || "Client 1";
  const c2Name = [data.client2FirstName, data.client2LastName].filter(Boolean).join(" ") || "Client 2";
  const hasClient2 = !!(data.client2FirstName || data.client2LastName);

  return (
    <div className="space-y-5">
      {/* Main Property */}
      <FormCard
        title="Main Residence"
        subtitle="Details of the client's primary property"
        icon={<Home className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={ownsProperty}
              onCheckedChange={v => onChange({ propertyOwned: v ? "yes" : "no" })}
            />
            <Label className="text-sm cursor-pointer">
              Client owns a property / main residence
            </Label>
          </div>

          {ownsProperty && (
            <div className="space-y-4 pt-2">
              <FieldRow label="Property Address">
                <Textarea
                  rows={2}
                  value={data.propertyAddress ?? ""}
                  onChange={e => onChange({ propertyAddress: e.target.value })}
                  placeholder="Full property address including postcode"
                />
              </FieldRow>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow label="Ownership Type">
                  <Select
                    value={data.propertyOwnership ?? ""}
                    onValueChange={v => onChange({ propertyOwnership: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ownership type…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_OWNERSHIP_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>

                <FieldRow label="Estimated Property Value (£)">
                  <Input
                    value={data.propertyValue ?? ""}
                    onChange={e => onChange({ propertyValue: e.target.value })}
                    placeholder="e.g. 350000"
                  />
                </FieldRow>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={data.mortgageOutstanding === "yes"}
                    onCheckedChange={v => onChange({ mortgageOutstanding: v ? "yes" : "no" })}
                  />
                  <Label className="text-sm cursor-pointer">
                    Mortgage outstanding on this property
                  </Label>
                </div>

                {data.mortgageOutstanding === "yes" && (
                  <div
                    className="rounded-lg border p-4 space-y-4"
                    style={{ background: "oklch(0.98 0.01 155 / 0.4)", borderColor: "oklch(0.65 0.08 155 / 0.3)" }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FieldRow label="Mortgage Lender">
                        <Input
                          value={data.mortgageLender ?? ""}
                          onChange={e => onChange({ mortgageLender: e.target.value })}
                          placeholder="e.g. Halifax, Nationwide"
                        />
                      </FieldRow>
                      <FieldRow label="Outstanding Balance (£)" hint="Approximate current balance">
                        <Input
                          value={data.mortgageBalance ?? ""}
                          onChange={e => onChange({ mortgageBalance: e.target.value })}
                          placeholder="e.g. 180000"
                        />
                      </FieldRow>
                      <FieldRow label="Term Remaining" hint="Years or months left">
                        <Input
                          value={data.mortgageTermRemaining ?? ""}
                          onChange={e => onChange({ mortgageTermRemaining: e.target.value })}
                          placeholder="e.g. 18 years"
                        />
                      </FieldRow>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={hasOtherProperties}
                  onCheckedChange={v => onChange({ hasOtherProperties: v ? "yes" : "no" })}
                />
                <Label className="text-sm cursor-pointer">
                  Client owns additional properties
                </Label>
              </div>

              {hasOtherProperties && (
                <FieldRow label="Other Properties Details">
                  <Textarea
                    rows={3}
                    value={data.otherProperties ?? ""}
                    onChange={e => onChange({ otherProperties: e.target.value })}
                    placeholder="Address, ownership type, and estimated value of each additional property…"
                  />
                </FieldRow>
              )}
            </div>
          )}
        </div>
      </FormCard>

      {/* Financial Assets — Client 1 */}
      <FormCard
        title={`Financial Assets — ${c1Name}`}
        subtitle={`Bank accounts, investments, pensions and estate value for ${c1Name}`}
        icon={<Landmark className="w-4 h-4" />}
      >
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.28 0.07 155)" }}>
          <User className="w-3.5 h-3.5" />
          {c1Name}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Bank / Building Society Accounts" hint="List main accounts and approximate balances">
            <Textarea
              rows={3}
              value={data.bankAccounts ?? ""}
              onChange={e => onChange({ bankAccounts: e.target.value })}
              placeholder="e.g. Barclays current account, HSBC savings…"
            />
          </FieldRow>
          <FieldRow label="Investments / Stocks & Shares" hint="ISAs, shares, bonds, etc.">
            <Textarea
              rows={3}
              value={data.investments ?? ""}
              onChange={e => onChange({ investments: e.target.value })}
              placeholder="e.g. Stocks & Shares ISA with Hargreaves Lansdown…"
            />
          </FieldRow>
          <FieldRow label="Pension Details" hint="Workplace and personal pensions">
            <Textarea
              rows={3}
              value={data.pensionDetails ?? ""}
              onChange={e => onChange({ pensionDetails: e.target.value })}
              placeholder="e.g. NHS pension, private pension with Aviva…"
            />
          </FieldRow>
          <FieldRow label="Estimated Total Estate Value (£)" hint="Approximate gross estate value">
            <Input
              value={data.estimatedEstateValue ?? ""}
              onChange={e => onChange({ estimatedEstateValue: e.target.value })}
              placeholder="e.g. 500000"
            />
          </FieldRow>
        </div>
      </FormCard>

      {/* Financial Assets — Client 2 (only shown when Client 2 exists) */}
      {hasClient2 && (
        <FormCard
          title={`Financial Assets — ${c2Name}`}
          subtitle={`Bank accounts, investments, pensions and estate value for ${c2Name}`}
          icon={<Landmark className="w-4 h-4" />}
        >
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.28 0.07 155)" }}>
            <User className="w-3.5 h-3.5" />
            {c2Name}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow label="Bank / Building Society Accounts" hint="List main accounts and approximate balances">
              <Textarea
                rows={3}
                value={data.client2BankAccounts ?? ""}
                onChange={e => onChange({ client2BankAccounts: e.target.value })}
                placeholder="e.g. Lloyds current account, Nationwide savings…"
              />
            </FieldRow>
            <FieldRow label="Investments / Stocks & Shares" hint="ISAs, shares, bonds, etc.">
              <Textarea
                rows={3}
                value={data.client2Investments ?? ""}
                onChange={e => onChange({ client2Investments: e.target.value })}
                placeholder="e.g. Cash ISA with Halifax…"
              />
            </FieldRow>
            <FieldRow label="Pension Details" hint="Workplace and personal pensions">
              <Textarea
                rows={3}
                value={data.client2PensionDetails ?? ""}
                onChange={e => onChange({ client2PensionDetails: e.target.value })}
                placeholder="e.g. Teacher's pension, SIPP with Vanguard…"
              />
            </FieldRow>
            <FieldRow label="Estimated Total Estate Value (£)" hint="Approximate gross estate value">
              <Input
                value={data.client2EstimatedEstateValue ?? ""}
                onChange={e => onChange({ client2EstimatedEstateValue: e.target.value })}
                placeholder="e.g. 350000"
              />
            </FieldRow>
          </div>
        </FormCard>
      )}

      {/* Overseas Assets */}
      <FormCard
        title="Assets Outside the UK"
        subtitle="Property, bank accounts, or investments held outside the United Kingdom"
        icon={<Landmark className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={data.assetsOutsideUK === "yes"}
              onCheckedChange={v => onChange({ assetsOutsideUK: v ? "yes" : "no" })}
            />
            <Label className="text-sm cursor-pointer">
              Client has assets outside the UK
            </Label>
          </div>

          {data.assetsOutsideUK === "yes" && (
            <div
              className="p-4 rounded-lg border space-y-3"
              style={{ background: "oklch(0.99 0.01 85 / 0.5)", borderColor: "oklch(0.78 0.12 85 / 0.4)" }}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.65 0.14 80)" }} />
                <p className="text-sm" style={{ color: "oklch(0.28 0.07 155)" }}>
                  <strong>Note:</strong> Assets held outside the UK may require a separate Will in the relevant jurisdiction. The client should be advised to seek local legal advice.
                </p>
              </div>
              <FieldRow label="Details of Overseas Assets" hint="Country, type of asset, and approximate value">
                <Textarea
                  rows={4}
                  value={data.assetsOutsideUKDetails ?? ""}
                  onChange={e => onChange({ assetsOutsideUKDetails: e.target.value })}
                  placeholder="e.g. Property in Spain (Costa del Sol) — approx. €150,000. Bank account in France…"
                />
              </FieldRow>
            </div>
          )}
        </div>
      </FormCard>

      {/* Care Concerns */}
      <FormCard
        title="Care Cost Concerns"
        subtitle="Does the client have concerns about future care home fees?"
        icon={<AlertCircle className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={hasCareConerns}
              onCheckedChange={v => onChange({ careConcerns: v ? "yes" : "no" })}
            />
            <Label className="text-sm cursor-pointer">
              Client has concerns about care home fees / asset protection
            </Label>
          </div>

          {hasCareConerns && (
            <div
              className="p-4 rounded-lg border space-y-3"
              style={{ background: "oklch(0.99 0.01 85 / 0.5)", borderColor: "oklch(0.78 0.12 85 / 0.4)" }}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.65 0.14 80)" }} />
                <p className="text-sm" style={{ color: "oklch(0.28 0.07 155)" }}>
                  <strong>Recommendation:</strong> An Asset Allocation Trust (Care Protection Trust) may be appropriate to help protect assets from local authority means-testing for care fees.
                </p>
              </div>
              <FieldRow label="Care Concern Details">
                <Textarea
                  rows={3}
                  value={data.careConcernDetails ?? ""}
                  onChange={e => onChange({ careConcernDetails: e.target.value })}
                  placeholder="Please describe the client's care concerns and current situation…"
                />
              </FieldRow>
            </div>
          )}
        </div>
      </FormCard>
    </div>
  );
}
