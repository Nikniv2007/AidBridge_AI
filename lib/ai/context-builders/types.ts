/**
 * Shared context types. Every builder produces a layered context package the
 * AI receives: system safety rules → org rules → user role → case → resources →
 * volunteers → prior notes → document summaries → output schema → prompt version.
 */

import { SAFETY_RULES, STANDARD_DISCLAIMERS } from "@/lib/safety/safetyRules";

export interface OrganizationRules {
  do_not_promise_guaranteed_aid: boolean;
  human_review_required_for_medical_cases: boolean;
  human_review_required_for_minors: boolean;
  max_volunteer_tasks_per_day: number;
  resource_shortage_threshold: number;
  human_review_confidence_threshold: number;
}

export const DEFAULT_ORG_RULES: OrganizationRules = {
  do_not_promise_guaranteed_aid: true,
  human_review_required_for_medical_cases: true,
  human_review_required_for_minors: true,
  max_volunteer_tasks_per_day: 3,
  resource_shortage_threshold: 5,
  human_review_confidence_threshold: 0.6,
};

export type UserRole = "case_manager" | "coordinator" | "admin" | "volunteer";

export interface BaseContext {
  system_safety_rules: typeof SAFETY_RULES;
  standard_disclaimers: string[];
  organization_rules: OrganizationRules;
  user_role: UserRole;
  output_schema: string;
  prompt_version: string;
}

export function baseContext(opts: {
  orgRules?: OrganizationRules;
  userRole?: UserRole;
  outputSchema: string;
  promptVersion: string;
}): BaseContext {
  return {
    system_safety_rules: SAFETY_RULES,
    standard_disclaimers: STANDARD_DISCLAIMERS,
    organization_rules: opts.orgRules ?? DEFAULT_ORG_RULES,
    user_role: opts.userRole ?? "coordinator",
    output_schema: opts.outputSchema,
    prompt_version: opts.promptVersion,
  };
}

/** Token-efficient serialization used as the model's user message. */
export function serializeContext(ctx: unknown): string {
  return JSON.stringify(ctx);
}
