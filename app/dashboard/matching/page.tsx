import { SectionHeading } from "@/components/ui/misc";
import { MatchingClient } from "./matching-client";
import { cases } from "@/lib/data/db";

export default function MatchingPage() {
  const options = cases.slice(0, 40).map((c) => ({
    id: c.id,
    requester_name: c.requester_name,
    original_request: c.original_request,
    case_type: c.case_type,
    urgency_level: c.urgency_level,
    urgency_score: c.urgency_score,
  }));
  return (
    <>
      <SectionHeading
        title="Resource Matching"
        description="Deterministic 7-factor scoring (type, availability, delivery, distance, eligibility, urgency, quantity) plus a short AI explanation. The AI can only reference resources in context."
      />
      <MatchingClient cases={options} />
    </>
  );
}
