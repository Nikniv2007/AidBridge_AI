import { SectionHeading } from "@/components/ui/misc";
import { AssignmentsClient } from "./assignments-client";
import { cases, volunteers } from "@/lib/data/mock";

export default function AssignmentsPage() {
  const triaged = cases.filter((c) => c.triage);
  return (
    <>
      <SectionHeading
        title="Volunteer Assignment"
        description="AI-recommended volunteers by availability, skills, location, language, vehicle access, workload, and reliability."
      />
      <AssignmentsClient cases={triaged} volunteers={volunteers} />
    </>
  );
}
