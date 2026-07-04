import { describe, it, expect } from "vitest";
import { parseCsv, detectDataset } from "@/lib/automation/csv";

describe("CSV parser", () => {
  it("parses simple rows", () => {
    const { headers, rows, errors } = parseCsv("a,b,c\n1,2,3\n4,5,6");
    expect(headers).toEqual(["a", "b", "c"]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ a: "1", b: "2", c: "3" });
    expect(errors).toHaveLength(0);
  });

  it("handles quoted fields with commas", () => {
    const { rows } = parseCsv('name,skills\n"Doe, Jane","driving,translation"');
    expect(rows[0].name).toBe("Doe, Jane");
    expect(rows[0].skills).toBe("driving,translation");
  });

  it("handles escaped quotes", () => {
    const { rows } = parseCsv('note\n"She said ""hello"""');
    expect(rows[0].note).toBe('She said "hello"');
  });

  it("reports column-count mismatches", () => {
    const { errors } = parseCsv("a,b,c\n1,2");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("detects a volunteer dataset from headers", () => {
    expect(
      detectDataset(["name", "skills", "vehicle_access", "max_tasks_per_day", "reliability_score"]),
    ).toBe("volunteers");
  });

  it("detects a resource dataset from headers", () => {
    expect(
      detectDataset(["name", "resource_type", "quantity_available", "delivery_available"]),
    ).toBe("resources");
  });
});
