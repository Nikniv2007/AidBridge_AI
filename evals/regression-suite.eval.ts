/**
 * Regression suite — the aggregate of every task's eval fixtures.
 *
 * This is the canonical suite run by the AI Evaluation Lab and `npm run evals`.
 * Adding a fixture to any *.eval.ts file automatically includes it here.
 */
import type { EvalCaseDef } from "@/lib/ai/schemas/eval.schema";
import { intakeClassifierEvals } from "./intake-classifier.eval";
import { urgencyScorerEvals } from "./urgency-scorer.eval";
import { safetyReviewEvals } from "./safety-review.eval";
import { resourceMatcherEvals } from "./resource-matcher.eval";
import { volunteerAssignmentEvals } from "./volunteer-assignment.eval";
import { outreachGeneratorEvals } from "./outreach-generator.eval";
import { reportWriterEvals } from "./report-writer.eval";
import { hallucinationCheckEvals } from "./hallucination-check.eval";

export const REGRESSION_SUITE: EvalCaseDef[] = [
  ...intakeClassifierEvals,
  ...urgencyScorerEvals,
  ...safetyReviewEvals,
  ...resourceMatcherEvals,
  ...volunteerAssignmentEvals,
  ...outreachGeneratorEvals,
  ...reportWriterEvals,
  ...hallucinationCheckEvals,
];

export const EVAL_SUITES = {
  intake_classifier: intakeClassifierEvals,
  urgency_scorer: urgencyScorerEvals,
  safety_review: safetyReviewEvals,
  resource_matcher: resourceMatcherEvals,
  volunteer_assignment: volunteerAssignmentEvals,
  outreach_generator: outreachGeneratorEvals,
  report_writer: reportWriterEvals,
  hallucination_check: hallucinationCheckEvals,
} as const;
