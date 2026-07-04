/**
 * Rank resources for a case using the deterministic score, returning a sorted
 * list with breakdowns and reasons. AI explanation is layered on top elsewhere.
 */

import {
  calculateResourceMatchScore,
  type ResourceScore,
  type ResourceScoreInput,
  type ScoreableResource,
} from "@/lib/matching/calculateResourceMatchScore";

export interface RankedResource extends ResourceScore {
  resource_id: string;
  name: string;
}

export function rankResources(
  resources: ScoreableResource[],
  input: ResourceScoreInput,
): RankedResource[] {
  return resources
    .map((r) => ({
      resource_id: r.id,
      name: r.name,
      ...calculateResourceMatchScore(r, input),
    }))
    .sort((a, b) => b.score - a.score);
}
