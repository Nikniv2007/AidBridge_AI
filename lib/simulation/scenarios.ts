/**
 * Simulation Sandbox.
 *
 * Generates a batch of FICTIONAL crisis cases for a chosen scenario, classifies
 * each through the deterministic intake engine, and produces a resource/volunteer
 * demand summary, a shortage prediction, and a recommended operational plan.
 * Everything is invented for demonstration and stress-testing only.
 */

import { demoClassifyIntake } from "@/lib/ai/intakeClassifier";
import { forecastShortages, type ShortageForecast } from "@/lib/forecasting/shortageForecast";
import type { IntakeClassification } from "@/lib/ai/schemas/intake.schema";

export interface Scenario {
  id: string;
  label: string;
  description: string;
  templates: { text: string; people: number; lang?: string }[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "winter_storm",
    label: "Winter storm",
    description: "Power outages and freezing temperatures drive heating, food, and shelter needs.",
    templates: [
      { text: "We lost power in the storm and have no heat, elderly parent at home.", people: 2 },
      { text: "Roads are iced over and we can't drive to get food or medicine.", people: 3 },
      { text: "Need warm blankets and a shelter tonight, our heat is out.", people: 4 },
      { text: "My insulin needs refrigeration and the power is out.", people: 1 },
    ],
  },
  {
    id: "flood",
    label: "Flood",
    description: "Rising water displaces families and cuts off transportation.",
    templates: [
      { text: "Our home is flooding now and we need to evacuate.", people: 4 },
      { text: "We're safe but displaced, need shelter and food for two kids.", people: 3 },
      { text: "Lost everything in the flood, need clothing and hygiene kits.", people: 5 },
      { text: "Elderly neighbor is stranded and cannot drive out.", people: 1 },
    ],
  },
  {
    id: "school_closure",
    label: "School closure",
    description: "Extended closures remove school meals and childcare for working families.",
    templates: [
      { text: "School is closed and my kids relied on school meals, we're low on food.", people: 4 },
      { text: "Need school supplies and backpacks now that classes moved online.", people: 2 },
      { text: "Working parent needs childcare support during the closure.", people: 3 },
    ],
  },
  {
    id: "food_shortage",
    label: "Food shortage",
    description: "A regional food shortage spikes pantry demand.",
    templates: [
      { text: "We are out of groceries for a family of five.", people: 5 },
      { text: "Need vegetarian meals delivered, I'm homebound.", people: 1 },
      { text: "Running low on baby formula and food.", people: 2 },
    ],
  },
  {
    id: "shelter_overflow",
    label: "Shelter overflow",
    description: "Shelters exceed capacity, pushing families toward alternative housing.",
    templates: [
      { text: "Shelter is full, family of four needs a place to stay tonight.", people: 4 },
      { text: "Evicted this week and the shelters are at capacity.", people: 3 },
      { text: "Sleeping in our car, need any housing help.", people: 2 },
    ],
  },
  {
    id: "heat_wave",
    label: "Heat wave",
    description: "Extreme heat endangers vulnerable residents without cooling.",
    templates: [
      { text: "It's over 100 degrees and my elderly mother has no AC.", people: 1 },
      { text: "Need water and a cooling center, we have an infant.", people: 3 },
      { text: "My medication requires cooling and our power keeps cutting out.", people: 1 },
    ],
  },
];

export interface SimulatedCase {
  id: string;
  original_request: string;
  classification: IntakeClassification;
}

export interface SimulationResult {
  scenario: string;
  scenario_label: string;
  generated: number;
  cases: SimulatedCase[];
  resource_needs: { resource: string; count: number }[];
  volunteer_demand: { drivers_needed: number; total_tasks: number };
  human_review_count: number;
  critical_count: number;
  shortage_prediction: ShortageForecast[];
  operational_plan: string[];
}

const CITIES = [
  { city: "Austin", zip: "78701" },
  { city: "Austin", zip: "78745" },
  { city: "Round Rock", zip: "78664" },
];

const RES_INVENTORY = [
  { resource_type: "food_pantry", available_quantity: 40, active: true },
  { resource_type: "shelter", available_quantity: 8, active: true },
  { resource_type: "transportation", available_quantity: 6, active: true },
  { resource_type: "clothing", available_quantity: 30, active: true },
  { resource_type: "hygiene_kits", available_quantity: 20, active: true },
  { resource_type: "medical_supplies", available_quantity: 4, active: true },
  { resource_type: "school_supplies", available_quantity: 12, active: true },
];

/**
 * Generate a simulation. `count` clamped to 10–25. `now` passed in for pure,
 * deterministic output (no Date.now / Math.random).
 */
export function generateSimulation(scenarioId: string, count: number, now: number): SimulationResult {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const n = Math.max(10, Math.min(25, count));

  const cases: SimulatedCase[] = [];
  for (let i = 0; i < n; i++) {
    const tmpl = scenario.templates[i % scenario.templates.length];
    const classification = demoClassifyIntake({
      text: tmpl.text,
      peopleAffected: tmpl.people,
      preferredLanguage: tmpl.lang,
    });
    cases.push({
      id: `sim_${scenario.id}_${String(i + 1).padStart(2, "0")}`,
      original_request: tmpl.text,
      classification,
    });
  }

  // Resource needs by case_type.
  const resMap = new Map<string, number>();
  let drivers = 0;
  for (const c of cases) {
    resMap.set(c.classification.case_type, (resMap.get(c.classification.case_type) ?? 0) + 1);
    if (c.classification.recommended_next_steps.some((s) => /delivery|vehicle|drive/i.test(s))) {
      drivers++;
    }
  }
  const resource_needs = [...resMap.entries()]
    .map(([resource, count]) => ({ resource, count }))
    .sort((a, b) => b.count - a.count);

  const human_review_count = cases.filter((c) => c.classification.human_review_required).length;
  const critical_count = cases.filter((c) => c.classification.urgency_level === "critical").length;

  // Shortage prediction: treat simulated cases as this week's demand.
  const shortage_prediction = forecastShortages({
    cases: cases.map((c) => ({ case_type: c.classification.case_type, created_at: new Date(now).toISOString() })),
    resources: RES_INVENTORY,
    now,
    lookbackDays: 7,
  });

  const highRisk = shortage_prediction.filter((s) => s.shortage_risk === "high");
  const operational_plan = [
    `Stand up a coordinator for the ${scenario.label.toLowerCase()} response and open the human-review queue (${human_review_count} cases flagged).`,
    critical_count > 0
      ? `Escalate ${critical_count} critical case(s) immediately; advise emergency services where life-safety is involved.`
      : "No critical life-safety cases in this batch; proceed with standard triage.",
    `Recruit ~${Math.max(1, drivers)} driver-volunteers for deliveries and transport.`,
    highRisk.length
      ? `Pre-order additional inventory for high-risk resources: ${highRisk.map((s) => s.resource_type.replace(/_/g, " ")).join(", ")}.`
      : "Current inventory is projected to meet demand; keep monitoring.",
    "Send localized outreach confirmations to requesters and volunteers; keep humans in the loop on every dispatch.",
  ];

  return {
    scenario: scenario.id,
    scenario_label: scenario.label,
    generated: n,
    cases,
    resource_needs,
    volunteer_demand: { drivers_needed: drivers, total_tasks: n },
    human_review_count,
    critical_count,
    shortage_prediction,
    operational_plan,
  };
}
