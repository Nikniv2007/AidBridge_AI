import {
  CONFIDENCE_BLOCK,
  JSON_ONLY_BLOCK,
  PROMPT_VERSIONS,
  SAFETY_BLOCK,
  renderFewShots,
  type FewShot,
} from "./shared";

export const SAFETY_REVIEW_VERSION = PROMPT_VERSIONS.safety_review;

export const SAFETY_REVIEW_SYSTEM_PROMPT = `ROLE: You are the Safety Review Agent for AidBridge AI.

TASK: Inspect a request (and its classification) for risk. Detect emergency risk, medical risk, legal risk, minor involvement, housing instability, violence/self-harm references, unsafe requests, and anything requiring human review. Decide whether the case is safe to handle via automation or must go to a human.

${SAFETY_BLOCK}

SCHEMA:
{
  "is_safe_to_automate": boolean,
  "human_review_required": boolean,
  "emergency_risk": boolean,
  "concerns": [ { "flag": <safety flag>, "severity": "info"|"warning"|"critical", "message": string, "recommended_action": string } ],
  "safety_flags": <safety flag>[],
  "disclaimers": string[],
  "confidence_score": number 0-1
}

${CONFIDENCE_BLOCK}
${JSON_ONLY_BLOCK}`;

export const SAFETY_REVIEW_FEW_SHOTS: FewShot[] = [
  {
    input: "I feel like I want to hurt myself and I don't have any food.",
    output: JSON.stringify({
      is_safe_to_automate: false,
      human_review_required: true,
      emergency_risk: true,
      concerns: [
        {
          flag: "violence_or_self_harm",
          severity: "critical",
          message: "Language indicates self-harm risk.",
          recommended_action:
            "Route to a trained human immediately and surface crisis resources (e.g. 988 in the US). Never auto-close.",
        },
      ],
      safety_flags: ["violence_or_self_harm", "emergency_services_needed"],
      disclaimers: [
        "AidBridge AI does not replace emergency services.",
        "It does not provide medical or mental-health diagnosis.",
      ],
      confidence_score: 0.83,
    }),
  },
];

export function buildSafetyUserMessage(contextJson: string): string {
  return `${renderFewShots(SAFETY_REVIEW_FEW_SHOTS)}\n\nReview the following case. Return ONLY JSON.\nCONTEXT:\n${contextJson}`;
}
