import { SectionHeading } from "@/components/ui/misc";
import { CasesTable } from "@/components/cases/cases-table";
import { cases } from "@/lib/data/mock";
import { Badge } from "@/components/ui/badge";

export default function CasesPage() {
  return (
    <>
      <SectionHeading
        title="Cases"
        description="Full case management across the community response lifecycle."
        action={<Badge tone="brand">{cases.length} total</Badge>}
      />
      <CasesTable cases={cases} />
    </>
  );
}
