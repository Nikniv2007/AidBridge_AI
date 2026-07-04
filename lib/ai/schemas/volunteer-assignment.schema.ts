import { z } from "zod";
import { confidenceSchema, safetyFlagSchema } from "./common";

export const volunteerEntrySchema = z.object({
  volunteer_id: z.string(),
  name: z.string(),
  assignment_score: z.number().int().min(0).max(100),
  reason_summary: z.string().optional(),
});
export type VolunteerEntry = z.infer<typeof volunteerEntrySchema>;

/** Output of the Volunteer Assignment Agent. */
export const volunteerAssignmentSchema = z.object({
  recommended_volunteer: volunteerEntrySchema.nullable(),
  backup_volunteers: z.array(volunteerEntrySchema).default([]),
  risk_flags: z.array(safetyFlagSchema).default([]),
  human_review_required: z.boolean(),
  confidence_score: confidenceSchema,
});
export type VolunteerAssignmentResult = z.infer<typeof volunteerAssignmentSchema>;

export const VOLUNTEER_ASSIGNMENT_SCHEMA_ID = "volunteer_assignment_v1";
