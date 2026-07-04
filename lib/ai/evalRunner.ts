/**
 * Part 2 AI evaluation runner.
 *
 * Runs eval cases against the intake classifier and safety review (demo or live)
 * and scores structural validity + field expectations. Reuses the schemas and
 * the output reviewer, and mirrors the `ai_evaluations` table shape.
 */

import { classifyIntake } from "@/lib/ai/intakeClassifier";
import { reviewSafety } from "@/lib/ai/safetyReview";
import { intakeClassificationSchema } from "@/lib/ai/schemas/intake.schema";
import { reviewOutput } from "@/lib/ai/outputReviewer";
import type { EvalCaseDef, EvalRunResult } from "@/lib/ai/schemas/eval.schema";

function adjacentUrgency(a: string, b: string): boolean {
  const order = ["critical", "high", "medium", "low"];
  return Math.abs(order.indexOf(a) - order.indexOf(b)) === 1;
}

export async function runEvalCaseV2(
  def: EvalCaseDef,
  clock: number = Date.now(),
): Promise<EvalRunResult> {
  const input = (def.input_payload.text as string) ?? "";
  let actual: Record<string, unknown> = {};
  let passed = true;
  let score = 1;
  const reasons: string[] = [];

  if (def.ai_task_type === "safety_review") {
    const { data } = await reviewSafety(input);
    actual = {
      human_review_required: data.human_review_required,
      emergency_risk: data.emergency_risk,
      has_critical: data.concerns.some((c) => c.severity === "critical"),
      safety_flags: data.safety_flags,
    };
  } else {
    const { data } = await classifyIntake({
      requestText: input,
      peopleAffected: 1,
    });
    // Structural validation via the output reviewer.
    const review = reviewOutput({
      taskType: "intake_classifier",
      candidate: data,
      schema: intakeClassificationSchema,
    });
    if (!review.overall_ok) {
      passed = false;
      score = Math.min(score, 0.3);
      reasons.push(...review.issues);
    }
    actual = {
      case_type: data.case_type,
      urgency_level: data.urgency_level,
      urgency_score: data.urgency_score,
      human_review_required: data.human_review_required,
      detected_language: data.detected_language,
      has_critical: data.safety_flags.includes("emergency_services_needed") ||
        data.safety_flags.includes("immediate_danger") ||
        data.safety_flags.includes("violence_or_self_harm"),
    };
  }

  for (const [key, want] of Object.entries(def.expected_payload)) {
    if (key === "urgency_level") {
      const got = actual.urgency_level as string;
      if (got !== want) {
        if (def.category === "urgency_accuracy" && adjacentUrgency(got, String(want))) {
          score = Math.min(score, 0.7);
          reasons.push(`urgency off by one band (got ${got}, want ${want})`);
        } else {
          passed = false;
          score = Math.min(score, 0.3);
          reasons.push(`urgency mismatch: got ${got}, want ${want}`);
        }
      }
      continue;
    }
    if (actual[key] !== want) {
      passed = false;
      score = Math.min(score, 0.2);
      reasons.push(`${key} mismatch: got ${String(actual[key])}, want ${String(want)}`);
    }
  }

  return {
    eval_name: def.eval_name,
    ai_task_type: def.ai_task_type,
    category: def.category,
    input_payload: def.input_payload,
    expected_payload: def.expected_payload,
    actual_payload: actual,
    passed,
    score: Math.round(score * 100) / 100,
    failure_reason: passed ? null : reasons.join("; "),
    created_at: new Date(clock).toISOString(),
  };
}

export async function runEvalSuiteV2(
  suite: EvalCaseDef[],
  clock: number = Date.now(),
): Promise<{ results: EvalRunResult[]; passed: number; failed: number; passRate: number }> {
  const results: EvalRunResult[] = [];
  for (const def of suite) results.push(await runEvalCaseV2(def, clock));
  const passed = results.filter((r) => r.passed).length;
  return {
    results,
    passed,
    failed: results.length - passed,
    passRate: results.length ? Math.round((passed / results.length) * 100) : 0,
  };
}
