import { describe, it, expect } from "vitest";
import { scanForSafetyFlags, safetyForcesHumanReview } from "@/lib/safety";
import { demoTriage } from "@/lib/ai/demo";

describe("safety rules engine", () => {
  it("flags a medical emergency as critical", () => {
    const flags = scanForSafetyFlags("my husband is having chest pain and can't breathe");
    expect(flags.some((f) => f.code === "medical_emergency")).toBe(true);
    expect(safetyForcesHumanReview(flags)).toBe(true);
  });

  it("flags self-harm language", () => {
    const flags = scanForSafetyFlags("I want to hurt myself");
    expect(flags.some((f) => f.code === "mental_health_crisis")).toBe(true);
  });

  it("does not flag a benign clothing request", () => {
    const flags = scanForSafetyFlags("I need a winter coat for my son");
    expect(flags.length).toBe(0);
    expect(safetyForcesHumanReview(flags)).toBe(false);
  });

  it("forces human review on critical triage regardless of category", () => {
    const out = demoTriage({
      description: "there's a gas leak and my kids are coughing, help now",
      peopleAffected: 3,
    });
    expect(out.humanReviewRequired).toBe(true);
    expect(out.safetyFlags.some((f) => f.severity === "critical")).toBe(true);
  });
});
