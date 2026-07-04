/**
 * Zod schemas that validate every AI output before we trust it.
 *
 * This is the contract-enforcement layer: the model can return anything, but
 * nothing downstream (matching, UI, DB) sees an output until it passes here.
 * The AI Evaluation Lab reuses these schemas for the `schema_compliance` and
 * `json_validity` test categories.
 */

import { z } from "zod";
import { type TriageOutput } from "@/lib/types";

const categoryEnum = z.enum([
  "food",
  "shelter",
  "transportation",
  "medical_supplies",
  "hygiene",
  "school_supplies",
  "clothing",
  "utilities",
  "financial_hardship",
  "other",
]);
const urgencyEnum = z.enum(["critical", "high", "moderate", "low"]);
const resourceTypeEnum = z.enum([
  "food_pantry",
  "shelter",
  "transportation",
  "hygiene_kits",
  "school_supplies",
  "clothing",
  "medical_supplies",
  "donation_pickup",
  "partner_org",
]);
const langEnum = z.enum(["en", "es", "hi", "ur"]);

export const safetyFlagSchema = z.object({
  code: z.enum([
    "medical_emergency",
    "mental_health_crisis",
    "domestic_violence",
    "minor_unaccompanied",
    "immediate_danger",
    "legal_matter",
    "financial_advice_requested",
    "sensitive_personal_data",
  ]),
  severity: z.enum(["info", "warning", "critical"]),
  message: z.string(),
  recommendedAction: z.string(),
});

/** Schema for the RAW model output (before we attach `meta`). */
export const triageModelSchema = z.object({
  summary: z.string().min(1).max(400),
  category: categoryEnum,
  secondaryCategories: z.array(categoryEnum).default([]),
  urgency: urgencyEnum,
  urgencyScore: z.number().min(0).max(100),
  neededResources: z.array(resourceTypeEnum).default([]),
  peopleAffected: z.number().int().min(1),
  safetyFlags: z.array(safetyFlagSchema).default([]),
  humanReviewRequired: z.boolean(),
  humanReviewReason: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  suggestedNextSteps: z.array(z.string()).min(1),
  detectedLanguage: langEnum,
});

export type TriageModelOutput = z.infer<typeof triageModelSchema>;

export const outreachModelSchema = z.object({
  subject: z.string().nullable(),
  body: z.string().min(1),
});

export const reportModelSchema = z.object({
  title: z.string().min(1),
  markdown: z.string().min(1),
  highlights: z.array(z.string()).default([]),
});

/** Parse + validate, returning a discriminated result for easy eval reporting. */
export function safeParseTriage(raw: unknown):
  | { ok: true; data: TriageModelOutput }
  | { ok: false; error: string } {
  const parsed = triageModelSchema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };
  return {
    ok: false,
    error: parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; "),
  };
}

/** Cross-field consistency check beyond raw schema (urgency ↔ score band). */
export function triageConsistencyIssues(o: TriageOutput | TriageModelOutput): string[] {
  const issues: string[] = [];
  const band =
    o.urgencyScore >= 75
      ? "critical"
      : o.urgencyScore >= 55
        ? "high"
        : o.urgencyScore >= 30
          ? "moderate"
          : "low";
  if (band !== o.urgency) {
    issues.push(
      `urgency "${o.urgency}" does not match urgencyScore ${o.urgencyScore} (expected "${band}")`,
    );
  }
  if (o.humanReviewRequired && !o.humanReviewReason) {
    issues.push("humanReviewRequired is true but humanReviewReason is null");
  }
  const hasCritical = o.safetyFlags.some((f) => f.severity === "critical");
  if (hasCritical && !o.humanReviewRequired) {
    issues.push("critical safety flag present but humanReviewRequired is false");
  }
  return issues;
}
