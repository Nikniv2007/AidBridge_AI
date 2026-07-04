/**
 * Resource & volunteer matching.
 *
 * Deterministic, explainable scoring — every match returns human-readable
 * `reasons` so coordinators understand *why* something was recommended and can
 * override it. No black boxes in the loop.
 */

import type {
  Case,
  Resource,
  ResourceMatch,
  ResourceType,
  Volunteer,
  VolunteerMatch,
} from "@/lib/types";

// Map case categories → the resource types that can satisfy them.
const CATEGORY_TO_RESOURCE: Record<string, ResourceType[]> = {
  food: ["food_pantry", "donation_pickup", "partner_org"],
  shelter: ["shelter", "partner_org"],
  transportation: ["transportation", "partner_org"],
  medical_supplies: ["medical_supplies", "partner_org"],
  hygiene: ["hygiene_kits", "donation_pickup", "partner_org"],
  school_supplies: ["school_supplies", "donation_pickup", "partner_org"],
  clothing: ["clothing", "donation_pickup", "partner_org"],
  utilities: ["partner_org"],
  financial_hardship: ["partner_org"],
  other: ["partner_org"],
};

/** Very rough ZIP proximity: shared prefix length → closer. Placeholder for a
 *  real geocoder (documented TODO). */
function zipProximityMiles(a: string, b: string): number {
  if (!a || !b) return 25;
  if (a === b) return 2;
  let shared = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) shared++;
    else break;
  }
  // 5 shared → ~2mi, 0 shared → ~40mi
  return Math.round(40 - shared * 7.5);
}

export function matchResources(c: Case, resources: Resource[]): ResourceMatch[] {
  const cat = c.triage?.category ?? "other";
  const wanted = CATEGORY_TO_RESOURCE[cat] ?? ["partner_org"];
  const urgencyScore = c.triage?.urgencyScore ?? 40;

  const matches: ResourceMatch[] = resources.map((r) => {
    const reasons: string[] = [];
    let score = 0;

    // Type fit (0–40)
    if (wanted[0] === r.type) {
      score += 40;
      reasons.push(`Primary resource type for ${cat.replace(/_/g, " ")}.`);
    } else if (wanted.includes(r.type)) {
      score += 24;
      reasons.push("Secondary resource type that can help.");
    }

    // Distance (0–20)
    const dist = zipProximityMiles(c.intake.zip, r.zip);
    const distPts = Math.max(0, 20 - dist * 0.5);
    score += distPts;
    reasons.push(`~${dist} mi away.`);

    // Availability / quantity (0–20)
    if (r.quantityAvailable > 0) {
      const qtyPts = Math.min(20, r.quantityAvailable);
      score += qtyPts;
      reasons.push(`${r.quantityAvailable} units available.`);
    } else {
      reasons.push("Out of stock.");
    }

    // Delivery for high-urgency / homebound (0–12)
    if (r.deliveryAvailable) {
      score += urgencyScore >= 55 ? 12 : 6;
      reasons.push("Delivery available.");
    }

    // Urgency fit (0–8): closer + delivery matter more at high urgency
    if (urgencyScore >= 75 && r.deliveryAvailable && dist <= 10) {
      score += 8;
      reasons.push("Well-suited to a critical, time-sensitive case.");
    }

    const eligibilityFit: ResourceMatch["eligibilityFit"] = r.eligibilityRules
      ? "unknown"
      : "fit";

    return {
      resourceId: r.id,
      score: Math.round(Math.max(0, Math.min(100, score))),
      reasons,
      distanceMiApprox: dist,
      eligibilityFit,
      humanReviewRecommended:
        eligibilityFit === "unknown" || r.quantityAvailable <= 0,
    };
  });

  return matches.sort((a, b) => b.score - a.score);
}

export function matchVolunteers(
  c: Case,
  volunteers: Volunteer[],
): VolunteerMatch[] {
  const lang = c.intake.preferredLanguage;
  const urgencyScore = c.triage?.urgencyScore ?? 40;
  const needsDriving =
    c.triage?.category === "transportation" ||
    c.triage?.neededResources.includes("transportation") ||
    /deliver|drive|ride|pickup/i.test(c.intake.description);

  const matches: VolunteerMatch[] = volunteers.map((v) => {
    const reasons: string[] = [];
    const concerns: string[] = [];
    let score = 20; // baseline for being active

    // Location
    const dist = zipProximityMiles(c.intake.zip, v.zip);
    score += Math.max(0, 22 - dist * 0.6);
    reasons.push(`~${dist} mi from requester.`);

    // Language
    if (v.languages.includes(lang)) {
      score += 16;
      reasons.push(`Speaks requester's language (${lang}).`);
    } else {
      concerns.push(`Does not speak ${lang}.`);
    }

    // Vehicle
    if (needsDriving) {
      if (v.vehicleAccess) {
        score += 18;
        reasons.push("Has vehicle access for delivery/transport.");
      } else {
        score -= 10;
        concerns.push("No vehicle access; case likely needs driving.");
      }
    }

    // Reliability
    score += (v.reliabilityScore / 100) * 12;
    if (v.reliabilityScore >= 85) reasons.push("High reliability score.");

    // Workload
    if (v.activeAssignments >= v.maxTasksPerDay) {
      score -= 25;
      concerns.push("At max tasks for the day.");
    } else {
      score += 6;
      reasons.push(
        `Capacity: ${v.activeAssignments}/${v.maxTasksPerDay} tasks today.`,
      );
    }

    // Experience
    score += Math.min(6, v.completedTasks * 0.2);

    if (urgencyScore >= 75 && v.reliabilityScore < 70) {
      concerns.push("Critical case — prefer a higher-reliability volunteer.");
    }

    return {
      volunteerId: v.id,
      score: Math.round(Math.max(0, Math.min(100, score))),
      reasons,
      concerns,
    };
  });

  return matches.sort((a, b) => b.score - a.score);
}
