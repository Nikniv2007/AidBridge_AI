/**
 * Shared enums and primitives for AidBridge AI structured outputs (Part 2).
 *
 * The Part 2 AI layer uses snake_case JSON contracts (as documented in each
 * prompt) validated with Zod before anything is trusted or persisted.
 */

import { z } from "zod";

export const caseTypeSchema = z.enum([
  "food_support",
  "shelter_support",
  "transportation",
  "school_supplies",
  "clothing",
  "hygiene_kits",
  "medical_supplies",
  "donation_pickup",
  "volunteer_request",
  "utilities_support",
  "financial_hardship",
  "other",
]);
export type CaseType = z.infer<typeof caseTypeSchema>;

export const urgencyLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type UrgencyLevel = z.infer<typeof urgencyLevelSchema>;

export const languageSchema = z.enum(["English", "Spanish", "Hindi", "Urdu"]);
export type LanguageName = z.infer<typeof languageSchema>;

export const safetyFlagSchema = z.enum([
  "vulnerable_person",
  "same_day_need",
  "medical_risk",
  "legal_risk",
  "minor_involved",
  "housing_instability",
  "violence_or_self_harm",
  "immediate_danger",
  "emergency_services_needed",
  "unsafe_request",
  "sensitive_personal_data",
  "no_matching_resource",
  "low_confidence",
  "missing_critical_info",
]);
export type SafetyFlag = z.infer<typeof safetyFlagSchema>;

export const vulnerableFlagSchema = z.enum([
  "elderly",
  "child",
  "infant",
  "pregnant",
  "disabled",
  "limited_transportation",
  "limited_english",
  "chronic_illness",
  "unhoused",
]);
export type VulnerableFlag = z.infer<typeof vulnerableFlagSchema>;

/** 0–1 model/logic confidence, shared by every output. */
export const confidenceSchema = z.number().min(0).max(1);

/** Provenance stamped onto every AI result (not model-produced). */
export const aiRunMetaSchema = z.object({
  provider: z.enum(["live", "demo"]),
  model: z.string(),
  prompt_version: z.string(),
  demo_mode: z.boolean(),
  latency_ms: z.number(),
  task: z.string(),
});
export type AiRunMeta = z.infer<typeof aiRunMetaSchema>;
