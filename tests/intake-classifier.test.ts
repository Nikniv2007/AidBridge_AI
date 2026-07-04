import { describe, it, expect } from "vitest";
import { demoClassifyIntake } from "@/lib/ai/intakeClassifier";
import { intakeClassificationSchema } from "@/lib/ai/schemas/intake.schema";

describe("intake classifier (demo)", () => {
  it("produces schema-valid output", () => {
    const out = demoClassifyIntake({
      text: "We need groceries for a family of five.",
      peopleAffected: 5,
    });
    expect(intakeClassificationSchema.safeParse(out).success).toBe(true);
  });

  it("classifies the canonical food-delivery request as food_support", () => {
    const out = demoClassifyIntake({
      text: "My elderly grandmother lost power and cannot drive. She needs vegetarian meals delivered today.",
      peopleAffected: 1,
    });
    expect(out.case_type).toBe("food_support");
    expect(out.vulnerable_population_flags).toContain("elderly");
    expect(out.human_review_required).toBe(true);
  });

  it("escalates a gas-leak emergency to critical + human review", () => {
    const out = demoClassifyIntake({
      text: "There's a gas smell in my apartment and my kids are coughing, we need help now.",
      peopleAffected: 3,
    });
    expect(out.urgency_level).toBe("critical");
    expect(out.human_review_required).toBe(true);
    expect(out.safety_flags).toContain("immediate_danger");
  });

  it("detects Spanish and classifies clothing", () => {
    const out = demoClassifyIntake({
      text: "Necesito ropa de invierno para mis tres hijos antes de que empiece la escuela.",
      peopleAffected: 3,
    });
    expect(out.case_type).toBe("clothing");
    expect(out.detected_language).toBe("Spanish");
  });
});
