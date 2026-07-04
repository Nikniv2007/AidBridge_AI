import { SectionHeading } from "@/components/ui/misc";
import { MatchingClient } from "./matching-client";
import { cases, resources } from "@/lib/data/mock";

export default function MatchingPage() {
  // Only show cases that have been triaged (matching depends on category).
  const triaged = cases.filter((c) => c.triage);
  return (
    <>
      <SectionHeading
        title="Resource Matching"
        description="Explainable resource recommendations combining type fit, distance, availability, delivery, eligibility, and urgency."
      />
      <MatchingClient cases={triaged} resources={resources} />
    </>
  );
}
