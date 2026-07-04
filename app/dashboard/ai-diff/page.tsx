import { SectionHeading } from "@/components/ui/misc";
import { AiDiffClient } from "./ai-diff-client";

export default function AiDiffPage() {
  return (
    <>
      <SectionHeading
        title="AI Diff Viewer"
        description="Compare two AI outputs across prompt versions before shipping a prompt change. Shows field-level differences, safety impact, and schema validation for each side."
      />
      <AiDiffClient />
    </>
  );
}
