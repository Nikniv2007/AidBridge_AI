import { SectionHeading } from "@/components/ui/misc";
import { AssignmentsClient } from "./assignments-client";
import { cases } from "@/lib/data/db";

export default function AssignmentsPage() {
  const options = cases.slice(0, 40).map((c) => ({
    id: c.id,
    requester_name: c.requester_name,
    original_request: c.original_request,
    case_type: c.case_type,
    urgency_level: c.urgency_level,
    preferred_language: c.preferred_language,
    city: c.city,
  }));
  return (
    <>
      <SectionHeading
        title="Volunteer Assignment"
        description="Deterministic 7-factor fit scoring (availability, skills, location, vehicle, language, workload, reliability) plus an AI explanation. Safety-critical cases are never auto-assigned."
      />
      <AssignmentsClient cases={options} />
    </>
  );
}
