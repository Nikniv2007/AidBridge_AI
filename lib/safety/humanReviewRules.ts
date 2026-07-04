/**
 * Human-review routing rules.
 *
 * Deterministically decides whether a case/output must go to a human before any
 * action. This is the safety net over the AI: even a confident model output is
 * overridden into human review when any of these conditions hold.
 */

import type { SafetyConcern } from "@/lib/ai/schemas/safety.schema";
import type { UrgencyLevel } from "@/lib/ai/schemas/common";
import { hasCriticalConcern } from "@/lib/safety/emergencyFlags";

export interface HumanReviewInput {
  urgencyLevel: UrgencyLevel;
  concerns: SafetyConcern[];
  confidence: number;
  confidenceThreshold: number;
  missingCriticalInfo: boolean;
  validationFailed: boolean;
  noMatchingResource: boolean;
}

export interface HumanReviewDecision {
  required: boolean;
  reasons: string[];
}

export function decideHumanReview(input: HumanReviewInput): HumanReviewDecision {
  const reasons: string[] = [];

  if (input.urgencyLevel === "critical") reasons.push("Critical urgency.");
  if (hasCriticalConcern(input.concerns)) reasons.push("Critical safety concern detected.");

  const flags = new Set(input.concerns.map((c) => c.flag));
  if (flags.has("medical_risk") || flags.has("emergency_services_needed"))
    reasons.push("Medical-related request.");
  if (flags.has("legal_risk")) reasons.push("Legal-related request.");
  if (flags.has("minor_involved")) reasons.push("A minor may be involved.");
  if (flags.has("housing_instability")) reasons.push("Housing instability.");
  if (flags.has("immediate_danger")) reasons.push("Immediate danger.");
  if (flags.has("violence_or_self_harm")) reasons.push("Violence or self-harm risk.");

  if (input.confidence < input.confidenceThreshold)
    reasons.push(`Low AI confidence (${input.confidence.toFixed(2)}).`);
  if (input.missingCriticalInfo) reasons.push("Missing critical information.");
  if (input.validationFailed) reasons.push("AI output failed validation.");
  if (input.noMatchingResource) reasons.push("No matching resource found.");

  return { required: reasons.length > 0, reasons };
}
