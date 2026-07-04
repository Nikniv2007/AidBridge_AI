import { RESOURCE_MATCH_SCHEMA_ID } from "@/lib/ai/schemas/resource-match.schema";
import { RESOURCE_MATCH_VERSION } from "@/lib/ai/prompts/resource-matcher.prompt";
import type { RankedResource } from "@/lib/matching/rankResources";
import { baseContext, type OrganizationRules, type UserRole } from "./types";

export interface ResourceMatchContextInput {
  caseSummary: {
    case_type: string;
    urgency_level: string;
    urgency_score: number;
    city: string;
    zip: string;
    resources_needed: string[];
    people_affected: number;
  };
  /** Deterministic pre-scored, ranked candidates (top N). */
  rankedResources: RankedResource[];
  orgRules?: OrganizationRules;
  userRole?: UserRole;
}

export function buildResourceMatchContext(input: ResourceMatchContextInput) {
  return {
    ...baseContext({
      orgRules: input.orgRules,
      userRole: input.userRole,
      outputSchema: RESOURCE_MATCH_SCHEMA_ID,
      promptVersion: RESOURCE_MATCH_VERSION,
    }),
    case: input.caseSummary,
    // Only resources present here may be referenced (anti-hallucination).
    available_resources: input.rankedResources.slice(0, 6).map((r) => ({
      resource_id: r.resource_id,
      name: r.name,
      pre_score: r.score,
      distance_mi: r.distanceMi,
      eligibility_fit: r.eligibilityFit,
      reasons: r.reasons.slice(0, 4),
    })),
  };
}
