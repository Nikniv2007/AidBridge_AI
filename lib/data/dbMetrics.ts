/**
 * Derived metrics over the Part 2 demo database. Pure functions, easy to test,
 * and reused by the reports endpoint and the command center.
 */

import { cases, resources, volunteers, organization } from "@/lib/data/db";
import { getAiOutputs, getValidationFailures, providerUsageCounts } from "@/lib/data/aiLog";

const CLOSED = new Set(["completed", "closed", "unable_to_fulfill"]);
const SHORTAGE_THRESHOLD = 5;

export function operationalStats(): Record<string, number | string> {
  const active = cases.filter((c) => !CLOSED.has(c.status));
  const shortages = resources.filter((r) => r.active && r.available_quantity <= SHORTAGE_THRESHOLD);
  return {
    organization: organization.name,
    total_cases: cases.length,
    active_cases: active.length,
    critical_cases: cases.filter((c) => c.urgency_level === "critical").length,
    high_cases: cases.filter((c) => c.urgency_level === "high").length,
    needs_review: cases.filter((c) => c.human_review_required || c.status === "needs_human_review").length,
    unmatched: active.filter((c) => !c.matched_resource_id).length,
    completed: cases.filter((c) => c.status === "completed").length,
    available_volunteers: volunteers.filter((v) => v.active && v.active_assignments < v.max_tasks_per_day).length,
    resource_shortages: shortages.length,
    ai_validation_failures: getValidationFailures().length,
    ai_outputs_logged: getAiOutputs().length,
  };
}

export function casesByType(): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const c of cases) map.set(c.case_type, (map.get(c.case_type) ?? 0) + 1);
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function casesByUrgency(): { label: string; value: number }[] {
  const order = ["critical", "high", "medium", "low"];
  return order.map((label) => ({ label, value: cases.filter((c) => c.urgency_level === label).length }));
}

export function providerUsage() {
  return providerUsageCounts();
}
