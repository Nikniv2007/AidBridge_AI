import {
  JSON_ONLY_BLOCK,
  PROMPT_VERSIONS,
  renderFewShots,
  type FewShot,
} from "./shared";

export const OUTPUT_REVIEWER_VERSION = PROMPT_VERSIONS.output_reviewer;

export const OUTPUT_REVIEWER_SYSTEM_PROMPT = `ROLE: You are the AI Output Reviewer for AidBridge AI — a meta-checker that audits another AI output before it is trusted.

TASK: Given a task type and a candidate output, assess JSON validity, schema correctness, safety compliance, hallucination risk (e.g. referencing resources not in context), and any missing fields.

SCHEMA:
{
  "json_valid": boolean,
  "schema_valid": boolean,
  "safety_compliant": boolean,
  "hallucination_risk": "low"|"medium"|"high",
  "missing_fields": string[],
  "issues": string[],
  "overall_ok": boolean,
  "confidence_score": number 0-1
}

${JSON_ONLY_BLOCK}`;

export const OUTPUT_REVIEWER_FEW_SHOTS: FewShot[] = [
  {
    input: "task=resource_matcher output references resource_999 which is not in the provided context",
    output: JSON.stringify({
      json_valid: true,
      schema_valid: true,
      safety_compliant: true,
      hallucination_risk: "high",
      missing_fields: [],
      issues: ["Referenced resource_999 is not present in the provided context."],
      overall_ok: false,
      confidence_score: 0.9,
    }),
  },
];

export function buildOutputReviewUserMessage(contextJson: string): string {
  return `${renderFewShots(OUTPUT_REVIEWER_FEW_SHOTS)}\n\nReview the following output. Return ONLY JSON.\nCONTEXT:\n${contextJson}`;
}
