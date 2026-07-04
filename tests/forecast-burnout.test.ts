import { describe, it, expect } from "vitest";
import { forecastShortages } from "@/lib/forecasting/shortageForecast";
import { assessBurnout } from "@/lib/volunteers/burnout";

const NOW = new Date("2026-07-04T14:00:00Z").getTime();
const iso = (minsAgo: number) => new Date(NOW - minsAgo * 60000).toISOString();

describe("shortage forecasting", () => {
  it("flags high risk when inventory is far below projected demand", () => {
    const cases = Array.from({ length: 14 }, () => ({ case_type: "food_support", created_at: iso(60) }));
    const forecasts = forecastShortages({
      cases,
      resources: [{ resource_type: "food_pantry", available_quantity: 2, active: true }],
      now: NOW,
      lookbackDays: 7,
    });
    const food = forecasts.find((f) => f.resource_type === "food_pantry");
    expect(food?.shortage_risk).toBe("high");
    expect(food?.recommended_action).toMatch(/additional/i);
  });

  it("reports low risk when inventory exceeds demand", () => {
    const cases = [{ case_type: "clothing", created_at: iso(60) }];
    const forecasts = forecastShortages({
      cases,
      resources: [{ resource_type: "clothing", available_quantity: 100, active: true }],
      now: NOW,
      lookbackDays: 7,
    });
    expect(forecasts.find((f) => f.resource_type === "clothing")?.shortage_risk).toBe("low");
  });
});

describe("volunteer burnout protection", () => {
  it("warns above the daily task threshold", () => {
    const b = assessBurnout({ active_assignments: 4, max_tasks_per_day: 5, completed_tasks: 0, reliability_score: 90 });
    expect(b.level).toBe("warning");
  });

  it("flags burnout risk above the weekly threshold", () => {
    const b = assessBurnout(
      { active_assignments: 2, max_tasks_per_day: 5, completed_tasks: 0, reliability_score: 90 },
      12,
    );
    expect(b.level).toBe("burnout_risk");
  });

  it("requires human review for low reliability + high workload", () => {
    const b = assessBurnout({ active_assignments: 3, max_tasks_per_day: 3, completed_tasks: 0, reliability_score: 60 });
    expect(b.human_review_required).toBe(true);
  });
});
