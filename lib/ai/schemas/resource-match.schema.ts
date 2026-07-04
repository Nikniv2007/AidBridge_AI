import { z } from "zod";
import { confidenceSchema } from "./common";

export const matchEntrySchema = z.object({
  resource_id: z.string(),
  name: z.string(),
  match_score: z.number().int().min(0).max(100),
  reason_summary: z.string(),
});
export type MatchEntry = z.infer<typeof matchEntrySchema>;

/** Output of the Resource Matcher. Mirrors the Part 2 spec exactly. */
export const resourceMatchSchema = z.object({
  recommended_match: matchEntrySchema.nullable(),
  backup_matches: z.array(matchEntrySchema).default([]),
  unmet_needs: z.array(z.string()).default([]),
  human_review_required: z.boolean(),
  confidence_score: confidenceSchema,
});
export type ResourceMatchResult = z.infer<typeof resourceMatchSchema>;

export const RESOURCE_MATCH_SCHEMA_ID = "resource_match_v1";
