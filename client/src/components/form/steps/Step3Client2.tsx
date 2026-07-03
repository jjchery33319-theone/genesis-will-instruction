import { WillFormData } from "../../../hooks/useWillForm";
import { FormCard } from "../FormCard";
import { ClientFields } from "../PersonFields";
import { Users, Info, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyUndo } from "../../../hooks/useCopyUndo";

interface Props {
  data: WillFormData;
  onChange: (updates: Partial<WillFormData>) => void;
  isMirrorWill: boolean;
}

export default function Step3Client2({ data, onChange, isMirrorWill }: Props) {
  const handleFieldChange = (field: string, value: string) => {
    onChange({ [field]: value } as Partial<WillFormData>);
  };

  const { hasSnapshot, saveSnapshot, undo } = useCopyUndo(data, onChange);

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

  const client1HasAddress = !!(data.client1AddressLine1 || data.client1City || data.client1Postcode);
  const client1HasContact = !!(data.client1DaytimePhone || data.client1Mobile || data.client1Email);
  const client1HasChildren =
    (data.client1ChildrenUnder18?.length ?? 0) + (data.client1ChildrenOver18?.length ?? 0) > 0;
  const client1HasAny = client1HasAddress || client1HasContact || client1HasChildren;

  const copyAddressFromClient1 = () => {
    saveSnapshot(["client2AddressLine1", "client2City", "client2Postcode"]);
    onChange({
      client2AddressLine1: data.client1AddressLine1,
      client2City: data.client1City,
      client2Postcode: data.client1Postcode,
    });
  };

  const copyContactFromClient1 = () => {
    saveSnapshot(["client2DaytimePhone", "client2Mobile", "client2Email"]);
    onChange({
      client2DaytimePhone: data.client1DaytimePhone,
      client2Mobile: data.client1Mobile,
      client2Email: data.client1Email,
    });
  };

  const copyAllFromClient1 = () => {
    saveSnapshot([
      "client2AddressLine1", "client2City", "client2Postcode",
      "client2DaytimePhone", "client2Mobile", "client2Email",
      "client2HasChildren", "client2ChildrenUnder18", "client2ChildrenOver18",
    ]);
    const srcUnder18 = data.client1ChildrenUnder18 ?? [];
    const srcOver18 = data.client1ChildrenOver18 ?? [];
    onChange({
      client2AddressLine1: data.client1AddressLine1,
      client2City: data.client1City,
      client2Postcode: data.client1Postcode,
      client2DaytimePhone: data.client1DaytimePhone,
      client2Mobile: data.client1Mobile,
      client2Email: data.client1Email,
      ...(client1HasChildren ? {
        client2HasChildren: "yes",
        client2ChildrenUnder18: srcUnder18.map(c => ({ ...c })),
        client2ChildrenOver18: srcOver18.map(c => ({ ...c })),
      } : {}),
    });
  };

  return (
    <div className="space-y-5">
      <FormCard
        title="Client 2 — Partner Details"
        subtitle="Second client's full personal information (for Mirror Wills)"
        icon={<Users className="w-4 h-4" />}
      >
        {/* Undo banner — shown immediately after any copy */}
        {hasSnapshot && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: "oklch(0.98 0.02 85)", border: "1px solid oklch(0.78 0.12 85 / 0.5)" }}>
            <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.55 0.12 85)" }} />
            <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.08 85)" }}>Details copied from Client 1. Changed your mind?</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              style={{ borderColor: "oklch(0.78 0.12 85 / 0.6)", color: "oklch(0.45 0.1 85)" }}
              onClick={undo}
            >
              <RotateCcw className="w-3 h-3" /> Undo Copy
            </Button>
          </div>
        )}

        {/* Copy ALL banner */}
        {client1HasAny && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-3" style={{ background: "oklch(0.95 0.025 155)", border: "1px solid oklch(0.55 0.1 155 / 0.4)" }}>
            <Copy className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.28 0.07 155)" }} />
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: "oklch(0.28 0.07 155)" }}>Copy all shared details from Client 1</p>
              <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.08 155)" }}>
                Copies address{client1HasContact ? ", contact info" : ""}{client1HasChildren ? ", and children" : ""} in one click
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className="text-xs gap-1.5 font-semibold"
              style={{ background: "oklch(0.28 0.07 155)", color: "white" }}
              onClick={copyAllFromClient1}
            >
              <Copy className="w-3.5 h-3.5" /> Copy All Details
            </Button>
          </div>
        )}

        {/* Copy address banner */}
        {client1HasAddress && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg mb-2" style={{ background: "oklch(0.97 0.015 155)", border: "1px solid oklch(0.65 0.08 155 / 0.3)" }}>
            <Copy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.35 0.1 155)" }} />
            <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.1 155)" }}>Same home address as Client 1?</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              style={{ borderColor: "oklch(0.65 0.08 155 / 0.6)", color: "oklch(0.28 0.07 155)" }}
              onClick={copyAddressFromClient1}
            >
              <Copy className="w-3 h-3" /> Copy Address from Client 1
            </Button>
          </div>
        )}

        {/* Copy contact banner */}
        {client1HasContact && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg mb-4" style={{ background: "oklch(0.97 0.015 155)", border: "1px solid oklch(0.65 0.08 155 / 0.3)" }}>
            <Copy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.35 0.1 155)" }} />
            <span className="text-xs flex-1" style={{ color: "oklch(0.35 0.1 155)" }}>Same contact details as Client 1?</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              style={{ borderColor: "oklch(0.65 0.08 155 / 0.6)", color: "oklch(0.28 0.07 155)" }}
              onClick={copyContactFromClient1}
            >
              <Copy className="w-3 h-3" /> Copy Contact from Client 1
            </Button>
          </div>
        )}

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
