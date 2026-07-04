import { SectionHeading } from "@/components/ui/misc";
import { IntakeForm } from "./intake-form";

export default function IntakePage() {
  return (
    <>
      <SectionHeading
        title="Case Intake"
        description="Enter a community request. AidBridge AI will classify it and create a structured, trackable case."
      />
      <IntakeForm />
    </>
  );
}
