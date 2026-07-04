/**
 * Resource shortage forecasting.
 *
 * Deterministic estimate of 7-day shortage risk per resource type by comparing
 * current inventory against recent demand (projected forward). This is a
 * transparent heuristic, not a statistical model — a documented starting point
 * a real deployment would replace with historical time-series data.
 */

import type { CaseType } from "@/lib/ai/schemas/common";

export interface ForecastInput {
  cases: { case_type: string; created_at: string }[];
  resources: { resource_type: string; available_quantity: number; active: boolean }[];
  /** Reference "now" (ms) — passed in so the function stays pure/testable. */
  now: number;
  lookbackDays?: number;
}

export interface ShortageForecast {
  resource_type: string;
  current_inventory: number;
  projected_7_day_demand: number;
  shortage_risk: "low" | "medium" | "high";
  recommended_action: string;
}

// Which resource type serves each case type (primary bucket).
const CASE_TO_RESOURCE: Record<string, string> = {
  food_support: "food_pantry",
  shelter_support: "shelter",
  transportation: "transportation",
  school_supplies: "school_supplies",
  clothing: "clothing",
  hygiene_kits: "hygiene_kits",
  medical_supplies: "medical_supplies",
  donation_pickup: "donation_pickup",
};

function label(resourceType: string): string {
  return resourceType.replace(/_/g, " ");
}

export function forecastShortages(input: ForecastInput): ShortageForecast[] {
  const lookback = input.lookbackDays ?? 7;
  const cutoff = input.now - lookback * 24 * 60 * 60 * 1000;

  // Demand: recent cases per resource type.
  const demand = new Map<string, number>();
  for (const c of input.cases) {
    if (new Date(c.created_at).getTime() < cutoff) continue;
    const rt = CASE_TO_RESOURCE[c.case_type];
    if (!rt) continue;
    demand.set(rt, (demand.get(rt) ?? 0) + 1);
  }

  // Inventory: sum of active resource availability per type.
  const inventory = new Map<string, number>();
  for (const r of input.resources) {
    if (!r.active) continue;
    inventory.set(r.resource_type, (inventory.get(r.resource_type) ?? 0) + r.available_quantity);
  }

  const types = new Set<string>([...demand.keys(), ...inventory.keys()]);
  const forecasts: ShortageForecast[] = [];

  for (const rt of types) {
    if (rt === "partner_org") continue;
    const recent = demand.get(rt) ?? 0;
    // Project the lookback demand forward to a 7-day window (with a small buffer).
    const projected = Math.round((recent / lookback) * 7 * 1.15);
    const current = inventory.get(rt) ?? 0;

    let risk: ShortageForecast["shortage_risk"] = "low";
    if (current <= projected * 0.5) risk = "high";
    else if (current <= projected) risk = "medium";

    const gap = Math.max(0, projected - current);
    const recommended_action =
      risk === "high"
        ? `Request at least ${Math.max(10, gap)} additional ${label(rt)} units this week.`
        : risk === "medium"
          ? `Monitor closely and pre-stage ~${Math.max(5, gap)} additional ${label(rt)} units.`
          : `Inventory is sufficient for projected ${label(rt)} demand.`;

    forecasts.push({
      resource_type: rt,
      current_inventory: current,
      projected_7_day_demand: projected,
      shortage_risk: risk,
      recommended_action,
    });
  }

  const riskOrder = { high: 0, medium: 1, low: 2 };
  return forecasts.sort((a, b) => riskOrder[a.shortage_risk] - riskOrder[b.shortage_risk]);
}

export const FORECAST_CASE_TYPES = Object.keys(CASE_TO_RESOURCE) as CaseType[];
