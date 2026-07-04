import { describe, it, expect } from "vitest";
import { calculateResourceMatchScore } from "@/lib/matching/calculateResourceMatchScore";
import { calculateVolunteerAssignmentScore } from "@/lib/matching/calculateVolunteerAssignmentScore";

describe("resource match scoring (point system)", () => {
  const base = {
    id: "res_1",
    name: "Food Pantry",
    resource_type: "food_pantry",
    zip: "78701",
    available_quantity: 20,
    delivery_available: true,
    active: true,
    eligibility_rules: {},
  };

  it("rewards a primary type + delivery + availability", () => {
    const s = calculateResourceMatchScore(base, {
      caseType: "food_support",
      caseZip: "78701",
      peopleAffected: 2,
      urgencyScore: 80,
      needsDelivery: true,
    });
    expect(s.breakdown.resource_type_match).toBe(30);
    expect(s.breakdown.availability).toBe(20);
    expect(s.breakdown.delivery_fit).toBe(15);
    expect(s.score).toBeGreaterThan(70);
    expect(s.score).toBeLessThanOrEqual(100);
  });

  it("zeroes availability when out of stock and recommends review", () => {
    const s = calculateResourceMatchScore(
      { ...base, available_quantity: 0, active: true },
      { caseType: "food_support", caseZip: "78701", peopleAffected: 1, urgencyScore: 50, needsDelivery: false },
    );
    expect(s.breakdown.availability).toBe(0);
    expect(s.humanReviewRecommended).toBe(true);
  });
});

describe("volunteer assignment scoring (point system)", () => {
  const v = {
    id: "vol_1",
    name: "Aisha Khan",
    zip: "78701",
    skills: ["driving", "delivery"],
    languages: ["en", "es"],
    has_vehicle: true,
    availability: ["sat_am"],
    max_tasks_per_day: 3,
    active_assignments: 0,
    reliability_score: 95,
    active: true,
  };

  it("rewards a full-fit volunteer", () => {
    const s = calculateVolunteerAssignmentScore(v, {
      caseZip: "78701",
      language: "es",
      requiredSkills: ["driving"],
      needsVehicle: true,
      neededSlot: "sat_am",
    });
    expect(s.breakdown.availability_match).toBe(25);
    expect(s.breakdown.vehicle_fit).toBe(15);
    expect(s.breakdown.language_fit).toBe(10);
    expect(s.score).toBeGreaterThan(80);
  });

  it("flags a maxed-out volunteer with a concern", () => {
    const s = calculateVolunteerAssignmentScore(
      { ...v, active_assignments: 3 },
      { caseZip: "78701", language: "en", requiredSkills: [], needsVehicle: false },
    );
    expect(s.concerns.some((c) => /max tasks/i.test(c))).toBe(true);
  });
});
