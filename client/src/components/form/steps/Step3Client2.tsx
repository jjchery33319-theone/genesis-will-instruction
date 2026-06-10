import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard } from "../FormCard";
import { ClientFields } from "../PersonFields";
import { Users, Info } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill: boolean;
}

export default function Step3Client2({ data, onChange, isMirrorWill }: Props) {
  const handleFieldChange = (field: string, value: string) => {
    onChange({ [field]: value } as Partial<WillFormData>);
  };

  if (!isMirrorWill) {
    return (
      <div className="space-y-5">
        <FormCard
          title="Client 2 — Partner Details"
          subtitle="Not required for Single Will"
          icon={<Users className="w-4 h-4" />}
        >
          <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ background: "oklch(0.97 0.015 155)", borderColor: "oklch(0.78 0.12 85 / 0.3)" }}>
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.12 85)" }} />
            <div>
              <p className="text-sm font-medium genesis-green-text">Single Will Selected</p>
              <p className="text-sm text-muted-foreground mt-1">
                Client 2 details are only required for Mirror Wills. If you need to add a second client,
                please go back to Step 1 and select "Mirror Wills" from the products list.
              </p>
            </div>
          </div>
        </FormCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <FormCard
        title="Client 2 — Partner Details"
        subtitle="Second client's full personal information (for Mirror Wills)"
        icon={<Users className="w-4 h-4" />}
      >
        <ClientFields
          fieldPrefix="client2"
          prefix={data.client2Prefix}
          firstName={data.client2FirstName}
          middleName={data.client2MiddleName}
          lastName={data.client2LastName}
          dob={data.client2Dob}
          addressLine1={data.client2AddressLine1}
          city={data.client2City}
          postcode={data.client2Postcode}
          maritalStatus={data.client2MaritalStatus}
          jobTitle={data.client2JobTitle}
          daytimePhone={data.client2DaytimePhone}
          mobile={data.client2Mobile}
          email={data.client2Email}
          nationality={data.client2Nationality}
          onChange={handleFieldChange}
        />
      </FormCard>
    </div>
  );
}
