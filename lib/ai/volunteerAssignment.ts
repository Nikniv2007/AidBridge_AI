/**
 * Volunteer Assignment Agent.
 *
 * Deterministic ranking + AI explanation. Never recommends a volunteer at max
 * workload; safety-critical cases are flagged for human review, not auto-assigned.
 */

import {
  volunteerAssignmentSchema,
  type VolunteerAssignmentResult,
} from "@/lib/ai/schemas/volunteer-assignment.schema";
import type { SafetyFlag } from "@/lib/ai/schemas/common";
import { rankVolunteers } from "@/lib/matching/rankVolunteers";
import type {
  ScoreableVolunteer,
  VolunteerScoreInput,
} from "@/lib/matching/calculateVolunteerAssignmentScore";
import {
  VOLUNTEER_ASSIGNMENT_SYSTEM_PROMPT,
  VOLUNTEER_ASSIGNMENT_VERSION,
  buildVolunteerAssignmentUserMessage,
} from "@/lib/ai/prompts/volunteer-assignment.prompt";
import { buildVolunteerAssignmentContext } from "@/lib/ai/context-builders/buildVolunteerAssignmentContext";
import { serializeContext } from "@/lib/ai/context-builders/types";
import { runStructuredTask } from "@/lib/ai/providers/aiProvider";

export interface AssignVolunteerInput {
  caseSummary: {
    case_type: string;
    urgency_level: string;
    city: string;
    zip: string;
    language: string; // en/es/hi/ur
    is_safety_critical: boolean;
  };
  taskType: string;
  taskDescription: string;
  requiredSkills: string[];
  needsVehicle: boolean;
  neededSlot?: string;
  volunteers: ScoreableVolunteer[];
}

function scoreInputFrom(input: AssignVolunteerInput): VolunteerScoreInput {
  return {
    caseZip: input.caseSummary.zip,
    language: input.caseSummary.language,
    requiredSkills: input.requiredSkills,
    needsVehicle: input.needsVehicle,
    neededSlot: input.neededSlot,
  };
}

export function demoAssignVolunteer(input: AssignVolunteerInput): VolunteerAssignmentResult {
  const ranked = rankVolunteers(input.volunteers, scoreInputFrom(input));
  // Exclude volunteers with a blocking concern (e.g. at max workload / inactive).
  const eligible = ranked.filter(
    (v) => !v.concerns.some((c) => /max tasks|inactive/i.test(c)),
  );

  const risk_flags: SafetyFlag[] = input.caseSummary.is_safety_critical
    ? ["unsafe_request"]
    : [];

  if (eligible.length === 0) {
    return {
      recommended_volunteer: null,
      backup_volunteers: [],
      risk_flags,
      human_review_required: true,
      confidence_score: 0.5,
    };
  }

  const top = eligible[0];
  return {
    recommended_volunteer: input.caseSummary.is_safety_critical
      ? null
      : {
          volunteer_id: top.volunteer_id,
          name: top.name,
          assignment_score: top.score,
          reason_summary: top.reasons.slice(0, 3).join(" "),
        },
    backup_volunteers: eligible.slice(input.caseSummary.is_safety_critical ? 0 : 1, 3).map((v) => ({
      volunteer_id: v.volunteer_id,
      name: v.name,
      assignment_score: v.score,
    })),
    risk_flags,
    human_review_required: input.caseSummary.is_safety_critical,
    confidence_score: top.score >= 70 ? 0.92 : 0.74,
  };
}

export async function assignVolunteer(input: AssignVolunteerInput) {
  const ranked = rankVolunteers(input.volunteers, scoreInputFrom(input));
  const context = buildVolunteerAssignmentContext({
    caseSummary: input.caseSummary,
    taskType: input.taskType,
    taskDescription: input.taskDescription,
    rankedVolunteers: ranked,
  });

  return runStructuredTask({
    task: "volunteer_assignment",
    promptVersion: VOLUNTEER_ASSIGNMENT_VERSION,
    systemPrompt: VOLUNTEER_ASSIGNMENT_SYSTEM_PROMPT,
    userMessage: buildVolunteerAssignmentUserMessage(serializeContext(context)),
    demo: () => demoAssignVolunteer(input),
    schema: volunteerAssignmentSchema,
    inputPayload: { case: input.caseSummary, task: input.taskType },
    extractLogFields: (d) => ({
      confidence: d.confidence_score,
      safetyFlags: d.risk_flags,
    }),
  });
}
