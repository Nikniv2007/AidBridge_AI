import { z } from "zod";

export const aiTaskTypeSchema = z.enum([
  "intake_classifier",
  "urgency_scorer",
  "safety_review",
  "resource_matcher",
  "volunteer_assignment",
  "outreach_generator",
  "report_writer",
  "output_reviewer",
]);
export type AiTaskType = z.infer<typeof aiTaskTypeSchema>;

/** A single eval case definition. */
export const evalCaseSchema = z.object({
  eval_name: z.string(),
  ai_task_type: aiTaskTypeSchema,
  category: z.enum([
    "json_validity",
    "schema_compliance",
    "classification_accuracy",
    "urgency_accuracy",
    "safety_compliance",
    "hallucination_prevention",
    "human_review_routing",
    "outreach_tone",
  ]),
  input_payload: z.record(z.unknown()),
  expected_payload: z.record(z.unknown()),
});
export type EvalCaseDef = z.infer<typeof evalCaseSchema>;

/** Result of running an eval case. */
export const evalResultSchema = z.object({
  eval_name: z.string(),
  ai_task_type: aiTaskTypeSchema,
  category: evalCaseSchema.shape.category,
  prompt_version: z.string().default("n/a"),
  input_payload: z.record(z.unknown()),
  expected_payload: z.record(z.unknown()),
  actual_payload: z.record(z.unknown()),
  passed: z.boolean(),
  score: z.number().min(0).max(1),
  failure_reason: z.string().nullable(),
  created_at: z.string(),
});
export type EvalRunResult = z.infer<typeof evalResultSchema>;

/**
 * Output of the AI Output Reviewer — a meta-check over another AI output.
 */
export const outputReviewSchema = z.object({
  json_valid: z.boolean(),
  schema_valid: z.boolean(),
  safety_compliant: z.boolean(),
  hallucination_risk: z.enum(["low", "medium", "high"]),
  missing_fields: z.array(z.string()).default([]),
  issues: z.array(z.string()).default([]),
  overall_ok: z.boolean(),
  confidence_score: z.number().min(0).max(1),
});
export type OutputReview = z.infer<typeof outputReviewSchema>;

export const EVAL_SCHEMA_ID = "eval_v1";
