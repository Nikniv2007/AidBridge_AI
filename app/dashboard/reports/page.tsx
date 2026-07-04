import { SectionHeading } from "@/components/ui/misc";
import { ReportsClient } from "./reports-client";

export default function ReportsPage() {
  return (
    <>
      <SectionHeading
        title="Reports"
        description="Generate operational and impact reports grounded strictly in your live data — using live AI or deterministic demo mode."
      />
      <ReportsClient />
    </>
  );
}
