import { z } from "zod";
import { confidenceSchema, urgencyLevelSchema } from "./common";

/** Breakdown produced by the Urgency Scorer so scores are explainable. */
export const urgencyBreakdownSchema = z.object({
  vulnerable_population: z.number().min(0),
  time_sensitivity: z.number().min(0),
  critical_needs: z.number().min(0),
  people_affected: z.number().min(0),
  resource_scarcity: z.number().min(0),
  safety_risk: z.number().min(0),
  missing_information: z.number().min(0),
  location_risk: z.number().min(0),
});
export type UrgencyBreakdown = z.infer<typeof urgencyBreakdownSchema>;

export const urgencyResultSchema = z.object({
  urgency_level: urgencyLevelSchema,
  urgency_score: z.number().int().min(0).max(100),
  breakdown: urgencyBreakdownSchema,
  drivers: z.array(z.string()).default([]),
  confidence_score: confidenceSchema,
});
export type UrgencyResult = z.infer<typeof urgencyResultSchema>;

export const URGENCY_SCHEMA_ID = "urgency_v1";
