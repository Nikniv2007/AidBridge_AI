import { SectionHeading } from "@/components/ui/misc";
import { SimulationClient } from "./simulation-client";
import { SCENARIOS } from "@/lib/simulation/scenarios";

export default function SimulationPage() {
  const scenarios = SCENARIOS.map((s) => ({ id: s.id, label: s.label, description: s.description }));
  return (
    <>
      <SectionHeading
        title="Simulation Sandbox"
        description="Generate fictional crisis scenarios and run them through AI triage to stress-test operations. All generated cases are invented for demonstration."
      />
      <SimulationClient scenarios={scenarios} />
    </>
  );
}
