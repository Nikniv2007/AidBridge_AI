/**
 * Deterministic resource-match scoring (0–100).
 *
 * Point system (per Part 2 spec) — the app never depends solely on AI:
 *   resource_type_match : 30
 *   availability        : 20
 *   delivery_fit        : 15
 *   distance_proxy      : 10
 *   eligibility_fit     : 10
 *   urgency_fit         : 10
 *   quantity_fit        :  5
 *   ───────────────────────
 *   total               : 100
 */

import type { CaseType } from "@/lib/ai/schemas/common";

export interface ScoreableResource {
  id: string;
  name: string;
  resource_type: string;
  zip: string;
  available_quantity: number;
  delivery_available: boolean;
  active: boolean;
  eligibility_rules?: Record<string, unknown> | string | null;
}

export interface ResourceScoreInput {
  caseType: CaseType;
  caseZip: string;
  peopleAffected: number;
  urgencyScore: number; // 0–100
  needsDelivery: boolean;
}

// Which resource_type values satisfy each case_type.
const CASE_TYPE_TO_RESOURCE: Record<string, string[]> = {
  food_support: ["food_pantry", "donation_pickup", "partner_org"],
  shelter_support: ["shelter", "partner_org"],
  transportation: ["transportation", "partner_org"],
  school_supplies: ["school_supplies", "donation_pickup", "partner_org"],
  clothing: ["clothing", "donation_pickup", "partner_org"],
  hygiene_kits: ["hygiene_kits", "donation_pickup", "partner_org"],
  medical_supplies: ["medical_supplies", "partner_org"],
  donation_pickup: ["donation_pickup", "partner_org"],
  volunteer_request: ["partner_org"],
  utilities_support: ["partner_org"],
  financial_hardship: ["partner_org"],
  other: ["partner_org"],
};

/** Rough ZIP proximity → miles. Placeholder for a real geocoder (TODO). */
export function zipProximityMiles(a: string, b: string): number {
  if (!a || !b) return 25;
  if (a === b) return 2;
  let shared = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) shared++;
    else break;
  }
  return Math.round(40 - shared * 7.5);
}

export interface ResourceScoreBreakdown {
  resource_type_match: number;
  availability: number;
  delivery_fit: number;
  distance_proxy: number;
  eligibility_fit: number;
  urgency_fit: number;
  quantity_fit: number;
}

export interface ResourceScore {
  score: number;
  breakdown: ResourceScoreBreakdown;
  reasons: string[];
  distanceMi: number;
  eligibilityFit: "fit" | "unknown";
  humanReviewRecommended: boolean;
}

export function calculateResourceMatchScore(
  resource: ScoreableResource,
  input: ResourceScoreInput,
): ResourceScore {
  const reasons: string[] = [];
  const allowed = CASE_TYPE_TO_RESOURCE[input.caseType] ?? ["partner_org"];

  // resource_type_match (30)
  let typePts = 0;
  if (allowed[0] === resource.resource_type) {
    typePts = 30;
    reasons.push(`Primary resource type for ${input.caseType.replace(/_/g, " ")}.`);
  } else if (allowed.includes(resource.resource_type)) {
    typePts = 18;
    reasons.push("Secondary resource type that can help.");
  }

  // availability (20)
  const availPts = resource.active && resource.available_quantity > 0 ? 20 : 0;
  if (availPts === 0) reasons.push("Currently unavailable / out of stock.");
  else reasons.push("Available now.");

  // delivery_fit (15)
  let deliveryPts = 0;
  if (input.needsDelivery) {
    deliveryPts = resource.delivery_available ? 15 : 0;
    reasons.push(resource.delivery_available ? "Offers delivery." : "No delivery (case needs it).");
  } else {
    deliveryPts = resource.delivery_available ? 8 : 6; // delivery optional
  }

  // distance_proxy (10)
  const distanceMi = zipProximityMiles(input.caseZip, resource.zip);
  const distancePts = Math.max(0, Math.round(10 - distanceMi * 0.25));
  reasons.push(`~${distanceMi} mi away.`);

  // eligibility_fit (10)
  const hasRules =
    resource.eligibility_rules != null &&
    (typeof resource.eligibility_rules === "string"
      ? resource.eligibility_rules.trim().length > 0
      : Object.keys(resource.eligibility_rules).length > 0);
  const eligibilityFit = hasRules ? "unknown" : "fit";
  const eligibilityPts = hasRules ? 5 : 10;
  if (hasRules) reasons.push("Eligibility rules apply — verify before confirming.");

  // urgency_fit (10)
  let urgencyPts = 0;
  if (input.urgencyScore >= 75) {
    urgencyPts = resource.delivery_available && distanceMi <= 10 ? 10 : 6;
  } else if (input.urgencyScore >= 55) {
    urgencyPts = 6;
  } else {
    urgencyPts = 4;
  }

  // quantity_fit (5)
  const quantityPts =
    resource.available_quantity >= input.peopleAffected ? 5 : resource.available_quantity > 0 ? 2 : 0;

  const breakdown: ResourceScoreBreakdown = {
    resource_type_match: typePts,
    availability: availPts,
    delivery_fit: deliveryPts,
    distance_proxy: distancePts,
    eligibility_fit: eligibilityPts,
    urgency_fit: urgencyPts,
    quantity_fit: quantityPts,
  };

  const score = Math.max(
    0,
    Math.min(
      100,
      typePts + availPts + deliveryPts + distancePts + eligibilityPts + urgencyPts + quantityPts,
    ),
  );

  return {
    score,
    breakdown,
    reasons,
    distanceMi,
    eligibilityFit,
    humanReviewRecommended: eligibilityFit === "unknown" || availPts === 0,
  };
}
