/**
 * Volunteer burnout protection.
 *
 * Deterministic rules that protect volunteers from overload — a public-interest
 * platform must safeguard the people doing the work, not just the people asking
 * for help.
 *
 * Rules:
 *  - > 3 active tasks in one day        → warning
 *  - > 8 tasks in one week (completed+active proxy) → burnout risk
 *  - low reliability (<70) + high workload → human review
 */

export interface BurnoutInput {
  active_assignments: number;
  max_tasks_per_day: number;
  completed_tasks: number; // used as a weekly-load proxy in demo mode
  reliability_score: number;
}

export type BurnoutLevel = "ok" | "warning" | "burnout_risk";

export interface BurnoutAssessment {
  level: BurnoutLevel;
  human_review_required: boolean;
  reasons: string[];
}

const DAILY_WARNING_THRESHOLD = 3;
const WEEKLY_BURNOUT_THRESHOLD = 8;

export function assessBurnout(v: BurnoutInput, weeklyLoad?: number): BurnoutAssessment {
  const reasons: string[] = [];
  let level: BurnoutLevel = "ok";

  // Weekly load: caller may pass a real weekly count; otherwise approximate.
  const week = weeklyLoad ?? v.active_assignments + Math.min(v.completed_tasks, 12);

  if (v.active_assignments > DAILY_WARNING_THRESHOLD) {
    level = "warning";
    reasons.push(`${v.active_assignments} active tasks today (> ${DAILY_WARNING_THRESHOLD}).`);
  }
  if (v.active_assignments >= v.max_tasks_per_day) {
    level = level === "ok" ? "warning" : level;
    reasons.push(`At or above daily cap (${v.active_assignments}/${v.max_tasks_per_day}).`);
  }
  if (week > WEEKLY_BURNOUT_THRESHOLD) {
    level = "burnout_risk";
    reasons.push(`~${week} tasks this week (> ${WEEKLY_BURNOUT_THRESHOLD}).`);
  }

  const humanReview = v.reliability_score < 70 && v.active_assignments >= v.max_tasks_per_day;
  if (humanReview) reasons.push("Low reliability combined with high workload.");

  return { level, human_review_required: humanReview, reasons };
}
