import {
  CONFIDENCE_BLOCK,
  JSON_ONLY_BLOCK,
  PROMPT_VERSIONS,
  SAFETY_BLOCK,
  renderFewShots,
  type FewShot,
} from "./shared";

export const VOLUNTEER_ASSIGNMENT_VERSION = PROMPT_VERSIONS.volunteer_assignment;

export const VOLUNTEER_ASSIGNMENT_SYSTEM_PROMPT = `ROLE: You are the Volunteer Assignment Agent for AidBridge AI.

TASK: Given a case, a task type, and AVAILABLE volunteers (with deterministic pre-scores), recommend the best-fit volunteer and backups. Only reference volunteers present in context. Respect workload caps and never auto-assign an unsafe case — flag it for human review instead.

${SAFETY_BLOCK}

SCHEMA:
{
  "recommended_volunteer": { "volunteer_id": string, "name": string, "assignment_score": integer 0-100, "reason_summary": string } | null,
  "backup_volunteers": [ { "volunteer_id": string, "name": string, "assignment_score": integer 0-100 } ],
  "risk_flags": <safety flag>[],
  "human_review_required": boolean,
  "confidence_score": number 0-1
}

Rules:
- Never recommend a volunteer already at their max_tasks_per_day.
- For safety-critical cases, set human_review_required=true and do not auto-assign.

${CONFIDENCE_BLOCK}
${JSON_ONLY_BLOCK}`;

export const VOLUNTEER_ASSIGNMENT_FEW_SHOTS: FewShot[] = [
  {
    input:
      "Task: food delivery near Frisco Saturday AM. Volunteers: [vol_001 Aisha Khan score 94 vehicle yes avail sat_am], [vol_002 Daniel Lee score 82]",
    output: JSON.stringify({
      recommended_volunteer: {
        volunteer_id: "vol_001",
        name: "Aisha Khan",
        assignment_score: 94,
        reason_summary:
          "Nearby, available Saturday morning, has a vehicle, and has completed similar tasks.",
      },
      backup_volunteers: [{ volunteer_id: "vol_002", name: "Daniel Lee", assignment_score: 82 }],
      risk_flags: [],
      human_review_required: false,
      confidence_score: 0.93,
    }),
  },
];

export function buildVolunteerAssignmentUserMessage(contextJson: string): string {
  return `${renderFewShots(VOLUNTEER_ASSIGNMENT_FEW_SHOTS)}\n\nAssign a volunteer for the following case. Return ONLY JSON.\nCONTEXT:\n${contextJson}`;
}
