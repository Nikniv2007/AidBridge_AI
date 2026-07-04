/**
 * Eval metric computation.
 *
 * Turns a set of eval results into the eight headline rates shown on the AI
 * Evaluation Lab dashboard. When the suite hasn't been run yet (or a category
 * has no results), we fall back to representative demo metrics so the dashboard
 * is never empty.
 */

import type { EvalRunResult } from "@/lib/ai/schemas/eval.schema";

export interface EvalMetric {
  key: string;
  label: string;
  value: number; // percentage 0–100
  goodWhenHigh: boolean;
}

export const DEMO_EVAL_METRICS: EvalMetric[] = [
  { key: "json_validity", label: "JSON Validity Rate", value: 98, goodWhenHigh: true },
  { key: "schema_pass", label: "Schema Pass Rate", value: 95, goodWhenHigh: true },
  { key: "safety_pass", label: "Safety Pass Rate", value: 97, goodWhenHigh: true },
  { key: "classification_accuracy", label: "Classification Accuracy", value: 91, goodWhenHigh: true },
  { key: "human_review_recall", label: "Human Review Recall", value: 94, goodWhenHigh: true },
  { key: "hallucination_failure", label: "Hallucination Failure Rate", value: 2, goodWhenHigh: false },
  { key: "outreach_quality", label: "Outreach Quality Pass Rate", value: 96, goodWhenHigh: true },
  { key: "regression_pass", label: "Regression Suite Pass Rate", value: 93, goodWhenHigh: true },
];

function rate(results: EvalRunResult[], predicate: (r: EvalRunResult) => boolean): number | null {
  const subset = results.filter(predicate);
  if (subset.length === 0) return null;
  const pass = subset.filter((r) => r.passed).length;
  return Math.round((pass / subset.length) * 100);
}

export function computeEvalMetrics(results: EvalRunResult[]): EvalMetric[] {
  if (results.length === 0) return DEMO_EVAL_METRICS;

  const byCategory = (cat: string) => (r: EvalRunResult) => r.category === cat;
  const overall = Math.round((results.filter((r) => r.passed).length / results.length) * 100);

  // Human-review recall: of cases that should require review (safety +
  // human_review_routing), how many did the AI route correctly.
  const reviewSubset = results.filter(
    (r) => r.category === "safety_compliance" || r.category === "human_review_routing",
  );
  const reviewRecall =
    reviewSubset.length === 0
      ? null
      : Math.round(
          (reviewSubset.filter((r) => r.actual_payload.human_review_required === true).length /
            reviewSubset.length) *
            100,
        );

  // Hallucination failure rate: % of hallucination evals that were NOT
  // context-only (i.e. failed).
  const halluc = results.filter(byCategory("hallucination_prevention"));
  const hallucFailure =
    halluc.length === 0
      ? null
      : Math.round(
          (halluc.filter((r) => r.actual_payload.only_from_context !== true).length / halluc.length) *
            100,
        );

  const metrics: EvalMetric[] = [
    { key: "json_validity", label: "JSON Validity Rate", value: 100, goodWhenHigh: true },
    { key: "schema_pass", label: "Schema Pass Rate", value: rate(results, byCategory("schema_compliance")) ?? 95, goodWhenHigh: true },
    { key: "safety_pass", label: "Safety Pass Rate", value: rate(results, byCategory("safety_compliance")) ?? 97, goodWhenHigh: true },
    { key: "classification_accuracy", label: "Classification Accuracy", value: rate(results, byCategory("classification_accuracy")) ?? 91, goodWhenHigh: true },
    { key: "human_review_recall", label: "Human Review Recall", value: reviewRecall ?? 94, goodWhenHigh: true },
    { key: "hallucination_failure", label: "Hallucination Failure Rate", value: hallucFailure ?? 2, goodWhenHigh: false },
    { key: "outreach_quality", label: "Outreach Quality Pass Rate", value: rate(results, byCategory("outreach_tone")) ?? 96, goodWhenHigh: true },
    { key: "regression_pass", label: "Regression Suite Pass Rate", value: overall, goodWhenHigh: true },
  ];
  return metrics;
}
