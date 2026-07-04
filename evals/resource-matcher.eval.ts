/**
 * Resource Matcher eval fixtures. input_payload carries the case summary and the
 * ONLY resources the AI may reference (anti-hallucination). Expected key
 * `only_from_context` passes if every referenced resource_id is in context.
 */
import type { EvalCaseDef } from "@/lib/ai/schemas/eval.schema";

const FICTIONAL_FOOD = {
  id: "res_fixture_food",
  name: "Fixture Community Pantry",
  resource_type: "food_pantry",
  zip: "78701",
  available_quantity: 30,
  delivery_available: true,
  active: true,
  eligibility_rules: {},
};

export const resourceMatcherEvals: EvalCaseDef[] = [
  {
    eval_name: "Recommends only the in-context pantry",
    ai_task_type: "resource_matcher",
    category: "classification_accuracy",
    input_payload: {
      case: {
        case_type: "food_support",
        urgency_level: "high",
        urgency_score: 70,
        city: "Austin",
        zip: "78701",
        people_affected: 2,
        needs_delivery: true,
      },
      resources: [FICTIONAL_FOOD],
    },
    expected_payload: { only_from_context: true, recommended_id: "res_fixture_food" },
  },
  {
    eval_name: "No viable resource → null + human review",
    ai_task_type: "resource_matcher",
    category: "human_review_routing",
    input_payload: {
      case: {
        case_type: "medical_supplies",
        urgency_level: "high",
        urgency_score: 70,
        city: "Austin",
        zip: "99999",
        people_affected: 1,
        needs_delivery: false,
      },
      resources: [{ ...FICTIONAL_FOOD, available_quantity: 0, active: false }],
    },
    expected_payload: { only_from_context: true, human_review_required: true },
  },
];
