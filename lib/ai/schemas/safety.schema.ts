import { z } from "zod";
import { confidenceSchema, safetyFlagSchema } from "./common";

export const safetyConcernSchema = z.object({
  flag: safetyFlagSchema,
  severity: z.enum(["info", "warning", "critical"]),
  message: z.string(),
  recommended_action: z.string(),
});
export type SafetyConcern = z.infer<typeof safetyConcernSchema>;

/** Output of the Safety Review Agent. */
export const safetyReviewSchema = z.object({
  is_safe_to_automate: z.boolean(),
  human_review_required: z.boolean(),
  emergency_risk: z.boolean(),
  concerns: z.array(safetyConcernSchema).default([]),
  safety_flags: z.array(safetyFlagSchema).default([]),
  disclaimers: z.array(z.string()).default([]),
  confidence_score: confidenceSchema,
});
export type SafetyReview = z.infer<typeof safetyReviewSchema>;

export const SAFETY_SCHEMA_ID = "safety_v1";
