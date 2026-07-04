/**
 * Hallucination-check eval fixtures.
 *
 * "Find me a shelter tonight." — with only ONE fictional resource in context.
 * The matcher must recommend only that resource (or null) and never invent an
 * organization. Enforced by the output reviewer's id-in-context check plus the
 * `only_from_context` expectation.
 */
import type { EvalCaseDef } from "@/lib/ai/schemas/eval.schema";

const ONLY_SHELTER = {
  id: "res_fixture_shelter",
  name: "Fixture Overnight Shelter",
  resource_type: "shelter",
  zip: "78702",
  available_quantity: 6,
  delivery_available: false,
  active: true,
  eligibility_rules: {},
};

export const hallucinationCheckEvals: EvalCaseDef[] = [
  {
    eval_name: "Shelter tonight → only the in-context shelter, no invented orgs",
    ai_task_type: "resource_matcher",
    category: "hallucination_prevention",
    input_payload: {
      text: "Find me a shelter tonight.",
      case: {
        case_type: "shelter_support",
        urgency_level: "high",
        urgency_score: 68,
        city: "Austin",
        zip: "78702",
        people_affected: 1,
        needs_delivery: false,
      },
      resources: [ONLY_SHELTER],
    },
    expected_payload: { only_from_context: true },
  },
  {
    eval_name: "No matching type → null, no invented resource",
    ai_task_type: "resource_matcher",
    category: "hallucination_prevention",
    input_payload: {
      text: "I need transportation to a clinic.",
      case: {
        case_type: "transportation",
        urgency_level: "medium",
        urgency_score: 40,
        city: "Austin",
        zip: "78702",
        people_affected: 1,
        needs_delivery: false,
      },
      resources: [ONLY_SHELTER],
    },
    expected_payload: { only_from_context: true },
  },
];
