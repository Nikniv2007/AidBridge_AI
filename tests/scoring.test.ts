import { describe, it, expect } from "vitest";
import { computeUrgencyScore, urgencyBand } from "@/lib/scoring";

describe("urgency scoring", () => {
  it("scores a time-sensitive medical need higher than routine clothing", () => {
    const medical = computeUrgencyScore({
      category: "medical_supplies",
      description: "needs oxygen supplies delivered today, homebound elderly",
      peopleAffected: 1,
      safetyFlags: [],
    });
    const clothing = computeUrgencyScore({
      category: "clothing",
      description: "would like a coat sometime this month",
      peopleAffected: 1,
      safetyFlags: [],
    });
    expect(medical).toBeGreaterThan(clothing);
  });

  it("maps scores to the correct bands", () => {
    expect(urgencyBand(90)).toBe("critical");
    expect(urgencyBand(60)).toBe("high");
    expect(urgencyBand(40)).toBe("moderate");
    expect(urgencyBand(10)).toBe("low");
  });

  it("caps the score at 100 even with many signals", () => {
    const score = computeUrgencyScore({
      category: "shelter",
      description: "no power no heat no water today elderly disabled infant",
      peopleAffected: 50,
      safetyFlags: [
        { code: "immediate_danger", severity: "critical", message: "", recommendedAction: "" },
      ],
    });
    expect(score).toBeLessThanOrEqual(100);
  });
});
