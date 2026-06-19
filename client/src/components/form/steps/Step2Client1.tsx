import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard } from "../FormCard";
import { ClientFields } from "../PersonFields";
import { User } from "lucide-react";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
}

export default function Step2Client1({ data, onChange }: Props) {
  const handleFieldChange = (field: string, value: string) => {
    onChange({ [field]: value } as Partial<WillFormData>);
  };

  return (
    <div className="space-y-5">
      <FormCard
        title="Client 1 — Personal Details"
        subtitle="Primary client's full personal information"
        icon={<User className="w-4 h-4" />}
      >
        <ClientFields
          fieldPrefix="client1"
          prefix={data.client1Prefix}
          firstName={data.client1FirstName}
          middleName={data.client1MiddleName}
          lastName={data.client1LastName}
          dob={data.client1Dob}
          addressLine1={data.client1AddressLine1}
          city={data.client1City}
          postcode={data.client1Postcode}
          maritalStatus={data.client1MaritalStatus}
          jobTitle={data.client1JobTitle}
          daytimePhone={data.client1DaytimePhone}
          mobile={data.client1Mobile}
          email={data.client1Email}
          nationality={data.client1Nationality}
          onChange={handleFieldChange}
        />
      </FormCard>
    </div>
  );
}
