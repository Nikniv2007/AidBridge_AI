/**
 * Derived metrics for the Command Center. Pure functions over the case /
 * resource / volunteer collections so they're trivial to unit-test and reuse.
 */

import { cases, resources, volunteers, defaultSettings } from "@/lib/data/mock";
import type {
  Case,
  CaseCategory,
  Urgency,
} from "@/lib/types";

export interface CommandCenterStats {
  activeCases: number;
  criticalCases: number;
  highUrgencyCases: number;
  needsReview: number;
  unmatched: number;
  availableVolunteers: number;
  completedToday: number;
  aiValidationFailures: number;
  resourceShortages: number;
  openAutomationRuns: number;
}

const CLOSED: Case["status"][] = ["completed", "closed", "unable_to_fulfill"];

export function commandCenterStats(): CommandCenterStats {
  const active = cases.filter((c) => !CLOSED.includes(c.status));
  return {
    activeCases: active.length,
    criticalCases: cases.filter((c) => c.triage?.urgency === "critical").length,
    highUrgencyCases: cases.filter((c) => c.triage?.urgency === "high").length,
    needsReview: cases.filter(
      (c) => c.status === "needs_human_review" || c.triage?.humanReviewRequired,
    ).length,
    unmatched: active.filter((c) => !c.matchedResourceId).length,
    availableVolunteers: volunteers.filter(
      (v) => v.activeAssignments < v.maxTasksPerDay,
    ).length,
    completedToday: cases.filter((c) => c.status === "completed").length,
    aiValidationFailures: 1,
    resourceShortages: resources.filter(
      (r) => r.quantityAvailable <= defaultSettings.resourceShortageThreshold,
    ).length,
    openAutomationRuns: 1,
  };
}

export function casesByUrgency(): { label: Urgency; value: number }[] {
  const order: Urgency[] = ["critical", "high", "moderate", "low"];
  return order.map((u) => ({
    label: u,
    value: cases.filter((c) => c.triage?.urgency === u).length,
  }));
}

export function casesByCategory(): { label: CaseCategory; value: number }[] {
  const map = new Map<CaseCategory, number>();
  for (const c of cases) {
    const cat = c.triage?.category ?? "other";
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function casesByCity(): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const c of cases) {
    const city = c.intake.city;
    map.set(city, (map.get(city) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, value]) => ({ label, value }));
}

export function volunteerWorkload(): { label: string; value: number; max: number }[] {
  return volunteers.map((v) => ({
    label: v.name.split(" ")[0],
    value: v.activeAssignments,
    max: v.maxTasksPerDay,
  }));
}

export function resourceShortages(): { label: string; value: number }[] {
  return resources
    .map((r) => ({ label: r.name, value: r.quantityAvailable }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 6);
}

export function evalPassRate(): { pass: number; fail: number; rate: number } {
  // Mirrors the last eval_suite automation run (11/12).
  const pass = 11;
  const fail = 1;
  return { pass, fail, rate: Math.round((pass / (pass + fail)) * 100) };
}
