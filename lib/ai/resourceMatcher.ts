/**
 * Resource Matcher.
 *
 * Deterministic ranking (lib/matching) provides the scores; the AI layer adds a
 * short reason_summary. Demo output derives entirely from the ranked candidates,
 * so it can never hallucinate a resource that isn't in context.
 */

import {
  resourceMatchSchema,
  type ResourceMatchResult,
} from "@/lib/ai/schemas/resource-match.schema";
import {
  rankResources,
} from "@/lib/matching/rankResources";
import type { ScoreableResource, ResourceScoreInput } from "@/lib/matching/calculateResourceMatchScore";
import {
  RESOURCE_MATCH_SYSTEM_PROMPT,
  RESOURCE_MATCH_VERSION,
  buildResourceMatchUserMessage,
} from "@/lib/ai/prompts/resource-matcher.prompt";
import { buildResourceMatchContext } from "@/lib/ai/context-builders/buildResourceMatchContext";
import { serializeContext } from "@/lib/ai/context-builders/types";
import { runStructuredTask } from "@/lib/ai/providers/aiProvider";

export interface MatchResourcesInput {
  caseSummary: {
    case_type: string;
    urgency_level: string;
    urgency_score: number;
    city: string;
    zip: string;
    resources_needed: string[];
    people_affected: number;
    needs_delivery: boolean;
  };
  resources: ScoreableResource[];
}

export function demoMatchResources(input: MatchResourcesInput): ResourceMatchResult {
  const scoreInput: ResourceScoreInput = {
    caseType: input.caseSummary.case_type as ResourceScoreInput["caseType"],
    caseZip: input.caseSummary.zip,
    peopleAffected: input.caseSummary.people_affected,
    urgencyScore: input.caseSummary.urgency_score,
    needsDelivery: input.caseSummary.needs_delivery,
  };
  const ranked = rankResources(input.resources, scoreInput);
  const viable = ranked.filter((r) => r.score >= 35);

  if (viable.length === 0) {
    return {
      recommended_match: null,
      backup_matches: [],
      unmet_needs: input.caseSummary.resources_needed,
      human_review_required: true,
      confidence_score: 0.5,
    };
  }

  const top = viable[0];
  const backups = viable.slice(1, 3).map((r) => ({
    resource_id: r.resource_id,
    name: r.name,
    match_score: r.score,
    reason_summary: r.reasons.slice(0, 2).join(" "),
  }));

  return {
    recommended_match: {
      resource_id: top.resource_id,
      name: top.name,
      match_score: top.score,
      reason_summary: top.reasons.slice(0, 3).join(" "),
    },
    backup_matches: backups,
    unmet_needs: [],
    human_review_required: top.humanReviewRecommended,
    confidence_score: top.score >= 70 ? 0.89 : 0.72,
  };
}

export async function matchResources(input: MatchResourcesInput) {
  const scoreInput: ResourceScoreInput = {
    caseType: input.caseSummary.case_type as ResourceScoreInput["caseType"],
    caseZip: input.caseSummary.zip,
    peopleAffected: input.caseSummary.people_affected,
    urgencyScore: input.caseSummary.urgency_score,
    needsDelivery: input.caseSummary.needs_delivery,
  };
  const ranked = rankResources(input.resources, scoreInput);
  const context = buildResourceMatchContext({
    caseSummary: input.caseSummary,
    rankedResources: ranked,
  });

  return runStructuredTask({
    task: "resource_matcher",
    promptVersion: RESOURCE_MATCH_VERSION,
    systemPrompt: RESOURCE_MATCH_SYSTEM_PROMPT,
    userMessage: buildResourceMatchUserMessage(serializeContext(context)),
    demo: () => demoMatchResources(input),
    schema: resourceMatchSchema,
    inputPayload: { case: input.caseSummary },
    extractLogFields: (d) => ({
      confidence: d.confidence_score,
      safetyFlags: d.human_review_required ? ["no_matching_resource"] : [],
    }),
  });
}
