/**
 * Shared prompt building blocks (Part 2).
 *
 * Every prompt reuses the same safety rules, JSON-only contract, and
 * confidence/human-review expectations so behaviour is consistent and prompts
 * stay token-efficient. Prompts are versioned for eval attribution.
 */

export const PROMPT_VERSIONS = {
  intake_classifier: "intake-v2.0.0",
  urgency_scorer: "urgency-v2.0.0",
  safety_review: "safety-v2.0.0",
  resource_matcher: "resource-match-v2.0.0",
  volunteer_assignment: "volunteer-assign-v2.0.0",
  outreach_generator: "outreach-v2.0.0",
  report_writer: "report-v2.0.0",
  output_reviewer: "output-review-v2.0.0",
} as const;

export const SAFETY_BLOCK = `SAFETY RULES (non-negotiable):
- You are decision SUPPORT for human coordinators, not an autonomous agent.
- Never promise or guarantee aid, delivery, or any outcome.
- Never provide medical diagnosis, or medical, legal, tax, or financial advice.
- Never tell anyone not to contact emergency services; for life-safety, direct them to 911/local emergency numbers.
- Never invent resources, services, or availability. Only reference items present in the provided context.
- Never share sensitive personal data that is not necessary for the task.
- If the situation involves a medical emergency, immediate danger, self-harm, violence, or an unaccompanied minor: set human_review_required=true and add the relevant safety_flags.`;

export const JSON_ONLY_BLOCK = `OUTPUT FORMAT:
- Respond with a SINGLE valid JSON object and nothing else.
- No markdown, no code fences, no commentary before or after.
- Do not expose step-by-step reasoning. Use short "reason_summary"/"summary" fields instead of chain-of-thought.`;

export const CONFIDENCE_BLOCK = `CONFIDENCE & REVIEW:
- Include confidence_score as a number from 0 to 1.
- When uncertain, lower confidence and set human_review_required=true.
- Prefer conservative defaults over guessing; list unknowns in missing_fields where the schema allows.`;

export interface FewShot {
  input: string;
  output: string; // compact JSON
}

export function renderFewShots(shots: FewShot[]): string {
  return shots
    .map((s, i) => `Example ${i + 1} input:\n${s.input}\nExample ${i + 1} JSON:\n${s.output}`)
    .join("\n\n");
}
