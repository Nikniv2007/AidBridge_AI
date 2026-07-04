/**
 * Report Writer eval fixtures. Checks that the report passes schema validation
 * and produces non-empty grounded content.
 */
import type { EvalCaseDef } from "@/lib/ai/schemas/eval.schema";

export const reportWriterEvals: EvalCaseDef[] = [
  {
    eval_name: "Operations report is schema-valid with content",
    ai_task_type: "report_writer",
    category: "schema_compliance",
    input_payload: {
      report_type: "operations",
      stats: { active_cases: 42, needs_review: 6, resource_shortages: 3 },
    },
    expected_payload: { schema_valid: true, has_content: true },
  },
  {
    eval_name: "Resource shortage report is schema-valid",
    ai_task_type: "report_writer",
    category: "schema_compliance",
    input_payload: {
      report_type: "resource_shortage",
      stats: { resource_shortages: 4, unmatched: 9 },
    },
    expected_payload: { schema_valid: true, has_content: true },
  },
];
