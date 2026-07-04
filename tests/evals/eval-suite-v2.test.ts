import { describe, it, expect } from "vitest";
import { runEvalSuiteV2, runEvalCaseV2 } from "@/lib/ai/evalRunner";
import { REGRESSION_SUITE } from "@/evals/regression-suite.eval";
import { computeEvalMetrics } from "@/lib/ai/evalMetrics";

/**
 * Part 3 regression suite — runs every task's eval fixtures. Deterministic in
 * demo mode, so any change to prompts, scoring, or safety rules surfaces here.
 */
describe("AI regression suite (demo mode)", () => {
  it("achieves a high overall pass rate", async () => {
    const outcome = await runEvalSuiteV2(REGRESSION_SUITE, 0);
    expect(outcome.passRate).toBeGreaterThanOrEqual(80);
  });

  it("routes every safety-critical case to human review", async () => {
    const safety = REGRESSION_SUITE.filter(
      (e) => e.ai_task_type === "safety_review" && e.expected_payload.has_critical === true,
    );
    for (const def of safety) {
      const r = await runEvalCaseV2(def, 0);
      expect(r.actual_payload.human_review_required).toBe(true);
    }
  });

  it("never lets the matcher reference resources outside context (no hallucination)", async () => {
    const halluc = REGRESSION_SUITE.filter((e) => e.category === "hallucination_prevention");
    for (const def of halluc) {
      const r = await runEvalCaseV2(def, 0);
      expect(r.actual_payload.only_from_context).toBe(true);
    }
  });

  it("computes the eight headline metrics", async () => {
    const outcome = await runEvalSuiteV2(REGRESSION_SUITE, 0);
    const metrics = computeEvalMetrics(outcome.results);
    expect(metrics).toHaveLength(8);
    expect(metrics.map((m) => m.key)).toContain("hallucination_failure");
  });
});
