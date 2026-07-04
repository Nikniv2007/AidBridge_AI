/**
 * Rank volunteers for a case task using the deterministic assignment score.
 */

import {
  calculateVolunteerAssignmentScore,
  type ScoreableVolunteer,
  type VolunteerScore,
  type VolunteerScoreInput,
} from "@/lib/matching/calculateVolunteerAssignmentScore";

export interface RankedVolunteer extends VolunteerScore {
  volunteer_id: string;
  name: string;
}

export function rankVolunteers(
  volunteers: ScoreableVolunteer[],
  input: VolunteerScoreInput,
): RankedVolunteer[] {
  return volunteers
    .map((v) => ({
      volunteer_id: v.id,
      name: v.name,
      ...calculateVolunteerAssignmentScore(v, input),
    }))
    .sort((a, b) => b.score - a.score);
}
