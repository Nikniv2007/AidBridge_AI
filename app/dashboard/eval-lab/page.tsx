import { SectionHeading } from "@/components/ui/misc";
import { EvalLabClient } from "./eval-lab-client";
import { REGRESSION_SUITE } from "@/evals/regression-suite.eval";

export default function EvalLabPage() {
  return (
    <>
      <SectionHeading
        title="AI Evaluation Lab"
        description="Run the regression suite against the current AI path. Scores JSON validity, schema compliance, classification & urgency accuracy, safety compliance, hallucination prevention, human-review routing, and outreach quality."
      />
      <EvalLabClient evals={REGRESSION_SUITE} />
    </>
  );
}
