import { SectionHeading } from "@/components/ui/misc";
import { EvalLabClient } from "./eval-lab-client";
import { evalDefs } from "@/lib/data/db";

export default function EvalLabPage() {
  return (
    <>
      <SectionHeading
        title="AI Evaluation Lab"
        description="Run the regression suite against the current AI path. Scores JSON validity, schema compliance, classification & urgency accuracy, safety compliance, hallucination prevention, and human-review routing."
      />
      <EvalLabClient evals={evalDefs} />
    </>
  );
}
