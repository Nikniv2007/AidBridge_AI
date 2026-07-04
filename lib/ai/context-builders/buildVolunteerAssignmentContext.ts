import { VOLUNTEER_ASSIGNMENT_SCHEMA_ID } from "@/lib/ai/schemas/volunteer-assignment.schema";
import { VOLUNTEER_ASSIGNMENT_VERSION } from "@/lib/ai/prompts/volunteer-assignment.prompt";
import type { RankedVolunteer } from "@/lib/matching/rankVolunteers";
import { baseContext, type OrganizationRules, type UserRole } from "./types";

export interface VolunteerAssignmentContextInput {
  caseSummary: {
    case_type: string;
    urgency_level: string;
    city: string;
    zip: string;
    language: string;
  };
  taskType: string;
  taskDescription: string;
  rankedVolunteers: RankedVolunteer[];
  orgRules?: OrganizationRules;
  userRole?: UserRole;
}

export function buildVolunteerAssignmentContext(input: VolunteerAssignmentContextInput) {
  return {
    ...baseContext({
      orgRules: input.orgRules,
      userRole: input.userRole,
      outputSchema: VOLUNTEER_ASSIGNMENT_SCHEMA_ID,
      promptVersion: VOLUNTEER_ASSIGNMENT_VERSION,
    }),
    case: input.caseSummary,
    task: { type: input.taskType, description: input.taskDescription },
    available_volunteers: input.rankedVolunteers.slice(0, 6).map((v) => ({
      volunteer_id: v.volunteer_id,
      name: v.name,
      pre_score: v.score,
      reasons: v.reasons.slice(0, 4),
      concerns: v.concerns.slice(0, 3),
    })),
  };
}
