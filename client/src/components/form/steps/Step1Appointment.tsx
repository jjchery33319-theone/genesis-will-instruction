import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard, FieldRow, SectionDivider } from "../FormCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CONSULTANTS, CASE_COORDINATORS, PRODUCTS } from "../../../../../shared/willConstants";
import { Calendar, Users, ShoppingBag, DollarSign } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

export default function Step1Appointment({ data, onChange }: Props) {
  const selectedConsultant = CONSULTANTS.find(c => c.name === data.consultantName);
  const selectedCoordinator = CASE_COORDINATORS.find(c => c.name === data.caseCoordinatorName);

  const handleConsultantChange = (name: string) => {
    const consultant = CONSULTANTS.find(c => c.name === name);
    if (consultant) {
      onChange({
        consultantName: consultant.name,
        consultantEmail: consultant.email,
        consultantPhone: consultant.phone,
      });
    }
  };

  const handleCoordinatorChange = (name: string) => {
    const coordinator = CASE_COORDINATORS.find(c => c.name === name);
    if (coordinator) {
      onChange({
        caseCoordinatorName: coordinator.name,
        caseCoordinatorEmail: coordinator.email,
        caseCoordinatorPhone: coordinator.phone,
      });
    }
  };

  const toggleProduct = (productId: string) => {
    const current = data.productsOrdered ?? [];
    const updated = current.includes(productId)
      ? current.filter(p => p !== productId)
      : [...current, productId];
    onChange({ productsOrdered: updated });

    // Auto-set will type
    if (productId === "mirror_wills" && !current.includes("mirror_wills")) {
      onChange({ productsOrdered: updated, willType: "Mirror Wills" });
    } else if (productId === "single_will" && !current.includes("single_will")) {
      onChange({ productsOrdered: updated, willType: "Single Will" });
    }
  };

  return (
    <div className="space-y-5">
      {/* Appointment Details */}
      <FormCard
        title="Appointment Details"
        subtitle="Date, time, and pricing information"
        icon={<Calendar className="w-4 h-4" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FieldRow label="Date of Appointment" required>
            <Input
              type="date"
              value={data.appointmentDate ?? ""}
              onChange={e => onChange({ appointmentDate: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="Time of Appointment">
            <Input
              type="time"
              value={data.appointmentTime ?? ""}
              onChange={e => onChange({ appointmentTime: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="Price Quoted (£)">
            <Input
              type="text"
              placeholder="e.g. 595"
              value={data.priceQuoted ?? ""}
              onChange={e => onChange({ priceQuoted: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="Estimated Draft Date">
            <Input
              type="date"
              value={data.estimatedDraftDate ?? ""}
              onChange={e => onChange({ estimatedDraftDate: e.target.value })}
            />
          </FieldRow>
        </div>
      </FormCard>

      {/* Consultant Details */}
      <FormCard
        title="Consultant"
        subtitle="Select the consultant handling this instruction"
        icon={<Users className="w-4 h-4" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Consultant Name" required>
            <Select value={data.consultantName ?? ""} onValueChange={handleConsultantChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select consultant…" />
              </SelectTrigger>
              <SelectContent>
                {CONSULTANTS.map(c => (
                  <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Consultant Email">
            <Input
              type="email"
              value={data.consultantEmail ?? ""}
              onChange={e => onChange({ consultantEmail: e.target.value })}
              placeholder="Auto-filled on selection"
              className="bg-muted/50"
            />
          </FieldRow>
          <FieldRow label="Consultant Phone">
            <Input
              value={data.consultantPhone ?? ""}
              onChange={e => onChange({ consultantPhone: e.target.value })}
              placeholder="Auto-filled on selection"
              className="bg-muted/50"
            />
          </FieldRow>
        </div>

        <SectionDivider title="Case Coordinator" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Case Coordinator" required>
            <Select value={data.caseCoordinatorName ?? ""} onValueChange={handleCoordinatorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select coordinator…" />
              </SelectTrigger>
              <SelectContent>
                {CASE_COORDINATORS.map(c => (
                  <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Coordinator Email">
            <Input
              type="email"
              value={data.caseCoordinatorEmail ?? ""}
              onChange={e => onChange({ caseCoordinatorEmail: e.target.value })}
              placeholder="Auto-filled on selection"
              className="bg-muted/50"
            />
          </FieldRow>
          <FieldRow label="Coordinator Phone">
            <Input
              value={data.caseCoordinatorPhone ?? ""}
              onChange={e => onChange({ caseCoordinatorPhone: e.target.value })}
              placeholder="Auto-filled on selection"
              className="bg-muted/50"
            />
          </FieldRow>
        </div>
      </FormCard>

      {/* Products Ordered */}
      <FormCard
        title="Products & Services Ordered"
        subtitle="Select all products the client is purchasing"
        icon={<ShoppingBag className="w-4 h-4" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRODUCTS.map(product => {
            const isChecked = data.productsOrdered?.includes(product.id) ?? false;
            return (
              <label
                key={product.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-150 ${
                  isChecked
                    ? "border-[oklch(0.78_0.12_85)] bg-[oklch(0.97_0.015_90)]"
                    : "border-border hover:border-[oklch(0.78_0.12_85/0.4)] hover:bg-muted/30"
                }`}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleProduct(product.id)}
                  className="flex-shrink-0"
                />
                <span className="text-sm font-medium text-foreground">{product.label}</span>
              </label>
            );
          })}
        </div>

        {(data.productsOrdered?.length ?? 0) > 0 && (
          <div className="mt-4 p-3 rounded-lg border" style={{ background: "oklch(0.97 0.015 155)", borderColor: "oklch(0.78 0.12 85 / 0.3)" }}>
            <p className="text-xs font-semibold genesis-green-text mb-1">Selected Products:</p>
            <p className="text-sm text-foreground">
              {data.productsOrdered?.map(id => PRODUCTS.find(p => p.id === id)?.label).filter(Boolean).join(" · ")}
            </p>
          </div>
        )}
      </FormCard>
    </div>
  );
}
