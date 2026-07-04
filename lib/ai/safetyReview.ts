/**
 * Safety Review Agent.
 *
 * Wraps the deterministic emergency-flag engine into a schema-validated task.
 * In demo mode this is pure rules; in live mode the model may add nuance but the
 * result is validated and the code-based critical flags always win.
 */

import {
  detectEmergencyConcerns,
  hasCriticalConcern,
} from "@/lib/safety/emergencyFlags";
import { STANDARD_DISCLAIMERS } from "@/lib/safety/safetyRules";
import {
  safetyReviewSchema,
  type SafetyReview,
} from "@/lib/ai/schemas/safety.schema";
import type { SafetyFlag } from "@/lib/ai/schemas/common";
import {
  SAFETY_REVIEW_SYSTEM_PROMPT,
  SAFETY_REVIEW_VERSION,
  buildSafetyUserMessage,
} from "@/lib/ai/prompts/safety-review.prompt";
import { runStructuredTask } from "@/lib/ai/providers/aiProvider";
import { serializeContext } from "@/lib/ai/context-builders/types";

export function demoSafetyReview(text: string): SafetyReview {
  const concerns = detectEmergencyConcerns(text);
  const critical = hasCriticalConcern(concerns);
  const flags = [...new Set(concerns.map((c) => c.flag))] as SafetyFlag[];
  return {
    is_safe_to_automate: !critical,
    human_review_required: critical || concerns.some((c) => c.severity === "warning"),
    emergency_risk: critical,
    concerns,
    safety_flags: flags,
    disclaimers: STANDARD_DISCLAIMERS,
    confidence_score: critical ? 0.82 : 0.9,
  };
}

export async function reviewSafety(text: string) {
  return runStructuredTask({
    task: "safety_review",
    promptVersion: SAFETY_REVIEW_VERSION,
    systemPrompt: SAFETY_REVIEW_SYSTEM_PROMPT,
    userMessage: buildSafetyUserMessage(serializeContext({ request_text: text })),
    demo: () => demoSafetyReview(text),
    schema: safetyReviewSchema,
    inputPayload: { text: text.slice(0, 500) },
    extractLogFields: (d) => ({
      confidence: d.confidence_score,
      safetyFlags: d.safety_flags,
    }),
  });
}
