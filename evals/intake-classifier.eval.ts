/**
 * Intake Classifier eval fixtures.
 *
 * Each fixture asserts fields of the structured intake output. Special expected
 * key `vulnerable_includes` passes if the actual vulnerable_population_flags
 * intersect the given list (see lib/ai/evalRunner.ts).
 */
import type { EvalCaseDef } from "@/lib/ai/schemas/eval.schema";

export const intakeClassifierEvals: EvalCaseDef[] = [
  {
    eval_name: "Elderly, no food, cannot drive → food_support / high",
    ai_task_type: "intake_classifier",
    category: "classification_accuracy",
    input_payload: { text: "My 78-year-old grandmother has no food and cannot drive." },
    expected_payload: {
      case_type: "food_support",
      urgency_level: "high",
      human_review_required: true,
      vulnerable_includes: ["elderly", "limited_transportation"],
    },
  },
  {
    eval_name: "Family evicted → shelter_support",
    ai_task_type: "intake_classifier",
    category: "classification_accuracy",
    input_payload: { text: "Family of four evicted this week, need emergency shelter tonight." },
    expected_payload: { case_type: "shelter_support" },
  },
  {
    eval_name: "Spanish winter clothing → clothing / Spanish",
    ai_task_type: "intake_classifier",
    category: "classification_accuracy",
    input_payload: { text: "Necesito ropa de invierno para mis tres hijos antes de que empiece la escuela." },
    expected_payload: { case_type: "clothing", detected_language: "Spanish" },
  },
  {
    eval_name: "Newborn hygiene + diapers → hygiene_kits",
    ai_task_type: "intake_classifier",
    category: "classification_accuracy",
    input_payload: { text: "Need hygiene kits and diapers for a newborn, no transportation." },
    expected_payload: { case_type: "hygiene_kits" },
  },
  {
    eval_name: "Donation pickup → donation_pickup",
    ai_task_type: "intake_classifier",
    category: "classification_accuracy",
    input_payload: { text: "We have furniture and canned goods to donate, can someone pick them up?" },
    expected_payload: { case_type: "donation_pickup" },
  },
];
