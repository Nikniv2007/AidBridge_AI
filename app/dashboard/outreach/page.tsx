import { SectionHeading } from "@/components/ui/misc";
import { OutreachClient } from "./outreach-client";

export default function OutreachPage() {
  return (
    <>
      <SectionHeading
        title="Outreach Center"
        description="Generate messages for requesters, volunteers, donors, and partners — in the right format, tone, and language."
      />
      <OutreachClient />
    </>
  );
}
