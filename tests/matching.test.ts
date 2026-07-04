import { describe, it, expect } from "vitest";
import { matchResources, matchVolunteers } from "@/lib/matching";
import { cases, resources, volunteers, getCase } from "@/lib/data/mock";

describe("resource matching", () => {
  it("ranks a same-category, in-stock, nearby resource first", () => {
    const foodCase = cases.find((c) => c.triage?.category === "food");
    expect(foodCase).toBeDefined();
    const matches = matchResources(foodCase!, resources);
    expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
    // Top match should be a food-type resource.
    const top = resources.find((r) => r.id === matches[0].resourceId);
    expect(["food_pantry", "donation_pickup", "partner_org"]).toContain(top!.type);
  });

  it("recommends human review for out-of-stock resources", () => {
    const anyCase = cases[0];
    const matches = matchResources(anyCase, resources);
    const outOfStock = matches.find(
      (m) => resources.find((r) => r.id === m.resourceId)!.quantityAvailable === 0,
    );
    if (outOfStock) expect(outOfStock.humanReviewRecommended).toBe(true);
  });
});

describe("volunteer matching", () => {
  it("returns concerns for volunteers at max workload", () => {
    const c = cases[0];
    const matches = matchVolunteers(c, volunteers);
    const maxed = matches.find((m) => {
      const v = volunteers.find((x) => x.id === m.volunteerId)!;
      return v.activeAssignments >= v.maxTasksPerDay;
    });
    if (maxed) expect(maxed.concerns.length).toBeGreaterThan(0);
  });

  it("rewards a language match", () => {
    const spanishCase = getCase("CASE-0003");
    expect(spanishCase).toBeDefined();
    const matches = matchVolunteers(spanishCase!, volunteers);
    // Carlos (es speaker) should reason about the language match.
    const carlos = matches.find((m) => m.volunteerId === "VOL-0002");
    expect(carlos?.reasons.some((r) => /language/i.test(r))).toBe(true);
  });
});
