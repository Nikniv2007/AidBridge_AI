import {
  CONFIDENCE_BLOCK,
  JSON_ONLY_BLOCK,
  PROMPT_VERSIONS,
  SAFETY_BLOCK,
  renderFewShots,
  type FewShot,
} from "./shared";

export const RESOURCE_MATCH_VERSION = PROMPT_VERSIONS.resource_matcher;

export const RESOURCE_MATCH_SYSTEM_PROMPT = `ROLE: You are the Resource Matcher for AidBridge AI.

TASK: Given a case and a list of AVAILABLE resources (with deterministic pre-scores), recommend the best match and backups. You may ONLY reference resources present in the provided context — never invent a resource, name, or availability. Explain each match in one short reason_summary.

${SAFETY_BLOCK}

SCHEMA:
{
  "recommended_match": { "resource_id": string, "name": string, "match_score": integer 0-100, "reason_summary": string } | null,
  "backup_matches": [ { "resource_id": string, "name": string, "match_score": integer 0-100, "reason_summary": string } ],
  "unmet_needs": string[],
  "human_review_required": boolean,
  "confidence_score": number 0-1
}

Rules:
- If no resource meaningfully fits, set recommended_match=null, list unmet_needs, and human_review_required=true.
- Prefer the deterministic scores provided; your job is to explain and, if appropriate, reorder for eligibility/urgency fit.

${CONFIDENCE_BLOCK}
${JSON_ONLY_BLOCK}`;

export const RESOURCE_MATCH_FEW_SHOTS: FewShot[] = [
  {
    input:
      "Case: vegetarian meal delivery, high urgency. Resources: [resource_123 Community Meal Volunteers score 91 delivery yes], [resource_456 North Texas Food Pantry score 78 delivery no]",
    output: JSON.stringify({
      recommended_match: {
        resource_id: "resource_123",
        name: "Community Meal Volunteers",
        match_score: 91,
        reason_summary:
          "Supports vegetarian meals and delivery in the requester's area.",
      },
      backup_matches: [
        {
          resource_id: "resource_456",
          name: "North Texas Food Pantry",
          match_score: 78,
          reason_summary: "Strong food match but delivery is unavailable.",
        },
      ],
      unmet_needs: [],
      human_review_required: false,
      confidence_score: 0.89,
    }),
  },
];

export function buildResourceMatchUserMessage(contextJson: string): string {
  return `${renderFewShots(RESOURCE_MATCH_FEW_SHOTS)}\n\nMatch the following case. Return ONLY JSON.\nCONTEXT:\n${contextJson}`;
}
