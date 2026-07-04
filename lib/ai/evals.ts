/**
 * AI evaluation runner.
 *
 * Runs the eval suite against the current AI path (demo or live) and scores
 * outputs across JSON validity, schema compliance, classification/urgency
 * accuracy, safety compliance, hallucination prevention, and review routing.
 * Powers both the AI Evaluation Lab UI and the `tests/evals` regression tests.
 */

import { runTriage } from "@/lib/ai/provider";
import { safeParseTriage, triageConsistencyIssues } from "@/lib/ai/schema";
import type { EvalCase, EvalResult } from "@/lib/types";

function nowIso(t: number) {
  return new Date(t).toISOString();
}

export async function runEvalCase(
  ec: EvalCase,
  clock: number = Date.now(),
): Promise<EvalResult> {
  const triage = await runTriage(
    { description: ec.input, peopleAffected: 1 },
    clock,
  );

  // Structural validation first (json_validity + schema_compliance).
  const parsed = safeParseTriage(triage);
  const consistency = triageConsistencyIssues(triage);

  let pass = true;
  let score = 1;
  const reasons: string[] = [];

  if (!parsed.ok) {
    pass = false;
    score = 0;
    reasons.push(`Schema invalid: ${parsed.error}`);
  }
  if (consistency.length > 0) {
    // Consistency issues are only fatal for schema/safety categories.
    if (ec.category === "schema_compliance" || ec.category === "safety_compliance") {
      pass = false;
      score = Math.min(score, 0.4);
    }
    reasons.push(...consistency);
  }

  const exp = ec.expected;
  const actual: Record<string, unknown> = {
    category: triage.category,
    urgency: triage.urgency,
    urgencyScore: triage.urgencyScore,
    humanReviewRequired: triage.humanReviewRequired,
    detectedLanguage: triage.detectedLanguage,
    hasCriticalFlag: triage.safetyFlags.some((f) => f.severity === "critical"),
  };

  // Field-level expectations.
  for (const [key, want] of Object.entries(exp)) {
    if (key === "urgency") {
      // Allow one band of tolerance for urgency_accuracy.
      const got = actual.urgency as string;
      if (got !== want) {
        if (ec.category === "urgency_accuracy" && adjacentUrgency(got, want as string)) {
          score = Math.min(score, 0.7);
          reasons.push(`urgency off by one band (got ${got}, want ${want})`);
        } else {
          pass = false;
          score = Math.min(score, 0.3);
          reasons.push(`urgency mismatch: got ${got}, want ${want}`);
        }
      }
      continue;
    }
    if (actual[key] !== want) {
      pass = false;
      score = Math.min(score, 0.2);
      reasons.push(`${key} mismatch: got ${String(actual[key])}, want ${String(want)}`);
    }
  }

  return {
    id: `${ec.id}-run`,
    evalId: ec.id,
    category: ec.category,
    name: ec.name,
    input: ec.input,
    expected: exp,
    actual,
    pass,
    score: Math.round(score * 100) / 100,
    failureReason: pass ? null : reasons.join("; "),
    timestamp: nowIso(clock),
  };
}

function adjacentUrgency(a: string, b: string): boolean {
  const order = ["critical", "high", "moderate", "low"];
  return Math.abs(order.indexOf(a) - order.indexOf(b)) === 1;
}

export async function runEvalSuite(
  suite: EvalCase[],
  clock: number = Date.now(),
): Promise<{ results: EvalResult[]; passed: number; failed: number; passRate: number }> {
  const results: EvalResult[] = [];
  for (const ec of suite) {
    results.push(await runEvalCase(ec, clock));
  }
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  return {
    results,
    passed,
    failed,
    passRate: results.length ? Math.round((passed / results.length) * 100) : 0,
  };
}
