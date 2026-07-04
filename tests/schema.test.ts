import { describe, it, expect } from "vitest";
import {
  safeParseTriage,
  triageConsistencyIssues,
} from "@/lib/ai/schema";
import { demoTriage } from "@/lib/ai/demo";

describe("triage schema validation", () => {
  it("accepts a well-formed demo triage output", () => {
    const out = demoTriage({
      description: "We need food for a family of four today.",
      peopleAffected: 4,
    });
    const parsed = safeParseTriage(out);
    expect(parsed.ok).toBe(true);
  });

  it("rejects out-of-range urgencyScore", () => {
    const bad = {
      summary: "x",
      category: "food",
      secondaryCategories: [],
      urgency: "high",
      urgencyScore: 250,
      neededResources: [],
      peopleAffected: 1,
      safetyFlags: [],
      humanReviewRequired: false,
      humanReviewReason: null,
      confidence: 0.9,
      suggestedNextSteps: ["do a thing"],
      detectedLanguage: "en",
    };
    const parsed = safeParseTriage(bad);
    expect(parsed.ok).toBe(false);
  });

  it("rejects an unknown category", () => {
    const parsed = safeParseTriage({
      summary: "x",
      category: "spaceship",
      secondaryCategories: [],
      urgency: "low",
      urgencyScore: 10,
      neededResources: [],
      peopleAffected: 1,
      safetyFlags: [],
      humanReviewRequired: false,
      humanReviewReason: null,
      confidence: 0.5,
      suggestedNextSteps: ["x"],
      detectedLanguage: "en",
    });
    expect(parsed.ok).toBe(false);
  });

  it("flags urgency/score inconsistency", () => {
    const out = demoTriage({ description: "need clothes", peopleAffected: 1 });
    const issues = triageConsistencyIssues({ ...out, urgency: "critical" });
    expect(issues.some((i) => i.includes("urgency"))).toBe(true);
  });
});
