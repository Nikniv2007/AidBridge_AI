import { z } from "zod";
import {
  caseTypeSchema,
  confidenceSchema,
  safetyFlagSchema,
  urgencyLevelSchema,
  vulnerableFlagSchema,
} from "./common";

/** Structured output of the Intake Classifier. Contract is JSON-only. */
export const intakeClassificationSchema = z.object({
  case_type: caseTypeSchema,
  urgency_level: urgencyLevelSchema,
  urgency_score: z.number().int().min(0).max(100),
  people_affected: z.number().int().min(1),
  resources_needed: z.array(z.string()).default([]),
  vulnerable_population_flags: z.array(vulnerableFlagSchema).default([]),
  missing_fields: z.array(z.string()).default([]),
  recommended_next_steps: z.array(z.string()).min(1),
  human_review_required: z.boolean(),
  safety_flags: z.array(safetyFlagSchema).default([]),
  confidence_score: confidenceSchema,
  summary: z.string().min(1).max(400),
  detected_language: z.enum(["English", "Spanish", "Hindi", "Urdu"]),
});

export type IntakeClassification = z.infer<typeof intakeClassificationSchema>;

export const INTAKE_SCHEMA_ID = "intake_v1";
