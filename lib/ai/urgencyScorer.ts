/**
 * Urgency Scorer.
 *
 * Deterministic 0–100 scoring with an explainable breakdown. Shared by the demo
 * path and reused by the intake classifier so demo and live agree on scoring.
 */

import type {
  UrgencyBreakdown,
  UrgencyResult,
} from "@/lib/ai/schemas/urgency.schema";
import type { CaseType, UrgencyLevel, VulnerableFlag } from "@/lib/ai/schemas/common";
import type { SafetyConcern } from "@/lib/ai/schemas/safety.schema";

const CATEGORY_CRITICAL_BASE: Record<CaseType, number> = {
  medical_supplies: 20,
  shelter_support: 18,
  food_support: 16,
  utilities_support: 15,
  transportation: 10,
  financial_hardship: 10,
  hygiene_kits: 8,
  clothing: 7,
  school_supplies: 6,
  donation_pickup: 5,
  volunteer_request: 5,
  other: 8,
};

const TIME_SIGNALS: { re: RegExp; weight: number }[] = [
  { re: /\b(today|right now|tonight|immediately|asap|urgent|now)\b/i, weight: 22 },
  { re: /\b(no power|lost power|no heat|no water|no food)\b/i, weight: 16 },
  { re: /\b(this week|soon|in a few days)\b/i, weight: 6 },
];

export interface UrgencyScoreInput {
  caseType: CaseType;
  text: string;
  peopleAffected: number;
  vulnerableFlags: VulnerableFlag[];
  concerns: SafetyConcern[];
  missingCriticalInfo: boolean;
  resourceScarcity?: number; // 0–10, optional external signal
}

export function scoreUrgency(input: UrgencyScoreInput): UrgencyResult {
  const drivers: string[] = [];

  const critical_needs = CATEGORY_CRITICAL_BASE[input.caseType] ?? 8;

  let time_sensitivity = 0;
  for (const sig of TIME_SIGNALS) {
    if (sig.re.test(input.text)) {
      time_sensitivity += sig.weight;
      if (sig.weight >= 16) drivers.push("time-sensitive need");
    }
  }
  time_sensitivity = Math.min(24, time_sensitivity);

  const vulnerable_population = Math.min(18, input.vulnerableFlags.length * 7);
  if (vulnerable_population > 0) drivers.push("vulnerable population");

  const people_affected = Math.min(12, Math.round(Math.log2(Math.max(1, input.peopleAffected)) * 5));

  const resource_scarcity = Math.min(10, input.resourceScarcity ?? 0);

  let safety_risk = 0;
  for (const c of input.concerns) {
    if (c.severity === "critical") safety_risk += 30;
    else if (c.severity === "warning") safety_risk += 12;
    else safety_risk += 3;
  }
  safety_risk = Math.min(40, safety_risk);
  if (safety_risk >= 30) drivers.push("safety-critical signal");

  const missing_information = input.missingCriticalInfo ? 4 : 0;
  const location_risk = 0; // placeholder for a future location-risk model

  const breakdown: UrgencyBreakdown = {
    vulnerable_population,
    time_sensitivity,
    critical_needs,
    people_affected,
    resource_scarcity,
    safety_risk,
    missing_information,
    location_risk,
  };

  const raw =
    vulnerable_population +
    time_sensitivity +
    critical_needs +
    people_affected +
    resource_scarcity +
    safety_risk +
    missing_information +
    location_risk;

  const urgency_score = Math.max(0, Math.min(100, Math.round(raw)));
  const urgency_level = bandFor(urgency_score);

  return {
    urgency_level,
    urgency_score,
    breakdown,
    drivers: drivers.length ? drivers : ["baseline need"],
    confidence_score: 0.85,
  };
}

export function bandFor(score: number): UrgencyLevel {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "medium";
  return "low";
}
