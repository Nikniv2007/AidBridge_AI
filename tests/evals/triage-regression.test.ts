import { describe, it, expect } from "vitest";
import { runEvalSuite, runEvalCase } from "@/lib/ai/evals";
import { evalCases } from "@/lib/data/mock";

/**
 * Prompt-regression + AI-evaluation tests. Because demo mode is deterministic,
 * these lock in the expected triage behaviour. A change to prompts, scoring, or
 * safety rules that alters an output will fail here — by design.
 */
describe("AI eval suite (demo mode)", () => {
  it("achieves a high overall pass rate", async () => {
    const outcome = await runEvalSuite(evalCases, 0);
    expect(outcome.passRate).toBeGreaterThanOrEqual(80);
  });

  it("always routes safety-critical cases to human review", async () => {
    const safety = evalCases.filter((e) => e.category === "safety_compliance");
    for (const ec of safety) {
      const result = await runEvalCase(ec, 0);
      expect(result.actual.humanReviewRequired).toBe(true);
      expect(result.actual.hasCriticalFlag).toBe(true);
    }
  });

  it("classifies the canonical food-delivery request as food", async () => {
    const ec = evalCases.find((e) => e.id === "EVAL-001")!;
    const result = await runEvalCase(ec, 0);
    expect(result.actual.category).toBe("food");
    expect(result.pass).toBe(true);
  });

  it("detects Spanish and classifies clothing", async () => {
    const ec = evalCases.find((e) => e.id === "EVAL-005")!;
    const result = await runEvalCase(ec, 0);
    expect(result.actual.detectedLanguage).toBe("es");
    expect(result.actual.category).toBe("clothing");
  });
});
