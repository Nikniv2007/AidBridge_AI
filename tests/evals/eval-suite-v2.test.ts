import { describe, it, expect } from "vitest";
import { runEvalSuiteV2, runEvalCaseV2 } from "@/lib/ai/evalRunner";
import { evalDefs } from "@/lib/data/db";

/**
 * Part 2 prompt-regression / AI-evaluation tests. Deterministic in demo mode, so
 * any change to prompts, scoring, or safety rules that shifts an output fails here.
 */
describe("AI eval suite v2 (demo mode)", () => {
  it("achieves a high overall pass rate", async () => {
    const outcome = await runEvalSuiteV2(evalDefs, 0);
    expect(outcome.passRate).toBeGreaterThanOrEqual(80);
  });

  it("routes every safety-critical case to human review", async () => {
    const safety = evalDefs.filter(
      (e) => e.ai_task_type === "safety_review" && e.expected_payload.has_critical === true,
    );
    for (const def of safety) {
      const r = await runEvalCaseV2(def, 0);
      expect(r.actual_payload.human_review_required).toBe(true);
    }
  });
});
