/**
 * Urgency scoring.
 *
 * Converts qualitative signals into a 0–100 urgency score and a categorical
 * `Urgency` band. Kept rule-based and pure so it is deterministic and testable,
 * and so demo mode and live mode share the same scoring backbone.
 */

import type {
  CaseCategory,
  SafetyFlag,
  Urgency,
} from "@/lib/types";

const CATEGORY_BASE: Record<CaseCategory, number> = {
  medical_supplies: 40,
  shelter: 38,
  food: 32,
  utilities: 30,
  transportation: 22,
  financial_hardship: 20,
  hygiene: 16,
  clothing: 14,
  school_supplies: 12,
  other: 15,
};

const TIME_SIGNALS: { re: RegExp; weight: number }[] = [
  { re: /\b(today|right now|tonight|immediately|asap|urgent)\b/i, weight: 22 },
  { re: /\b(no power|lost power|no heat|no water|no food)\b/i, weight: 18 },
  { re: /\b(elderly|senior|disabled|infant|newborn|pregnant|baby)\b/i, weight: 14 },
  { re: /\b(cannot drive|no transportation|stranded|homebound)\b/i, weight: 10 },
  { re: /\b(this week|soon|in a few days)\b/i, weight: 6 },
];

export interface ScoreInput {
  category: CaseCategory;
  description: string;
  peopleAffected: number;
  safetyFlags: SafetyFlag[];
}

export function computeUrgencyScore(input: ScoreInput): number {
  let score = CATEGORY_BASE[input.category] ?? 15;

  for (const sig of TIME_SIGNALS) {
    if (sig.re.test(input.description)) score += sig.weight;
  }

  // People affected: diminishing returns, capped.
  score += Math.min(18, Math.log2(Math.max(1, input.peopleAffected)) * 6);

  // Safety severity dominates.
  for (const flag of input.safetyFlags) {
    if (flag.severity === "critical") score += 40;
    else if (flag.severity === "warning") score += 18;
    else score += 4;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function urgencyBand(score: number): Urgency {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "moderate";
  return "low";
}
