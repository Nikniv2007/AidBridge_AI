/**
 * Urgency Scorer eval fixtures. `urgency_level` allows ±1 band tolerance in the
 * urgency_accuracy category.
 */
import type { EvalCaseDef } from "@/lib/ai/schemas/eval.schema";

export const urgencyScorerEvals: EvalCaseDef[] = [
  {
    eval_name: "Gas leak → critical",
    ai_task_type: "urgency_scorer",
    category: "urgency_accuracy",
    input_payload: { text: "There's a gas smell in my apartment and my kids are coughing, we need help now." },
    expected_payload: { urgency_level: "critical" },
  },
  {
    eval_name: "Elderly no food today → high",
    ai_task_type: "urgency_scorer",
    category: "urgency_accuracy",
    input_payload: { text: "My 78-year-old grandmother has no food today and cannot drive." },
    expected_payload: { urgency_level: "high" },
  },
  {
    eval_name: "School supplies next month → medium",
    ai_task_type: "urgency_scorer",
    category: "urgency_accuracy",
    input_payload: { text: "Need backpacks for two kids starting middle school next month." },
    expected_payload: { urgency_level: "medium" },
  },
];
