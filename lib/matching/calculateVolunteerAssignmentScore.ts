/**
 * Deterministic volunteer-assignment scoring (0–100).
 *
 * Point system (per Part 2 spec):
 *   availability_match : 25
 *   skill_match        : 20
 *   location_match     : 15
 *   vehicle_fit        : 15
 *   language_fit       : 10
 *   low_workload       : 10
 *   reliability        :  5
 *   ──────────────────────
 *   total              : 100
 */

import { zipProximityMiles } from "@/lib/matching/calculateResourceMatchScore";

export interface ScoreableVolunteer {
  id: string;
  name: string;
  zip: string;
  skills: string[];
  languages: string[]; // ISO codes: en/es/hi/ur
  has_vehicle: boolean;
  availability: string[];
  max_tasks_per_day: number;
  active_assignments: number;
  reliability_score: number; // 0–100
  active: boolean;
}

export interface VolunteerScoreInput {
  caseZip: string;
  language: string; // en/es/hi/ur
  requiredSkills: string[];
  needsVehicle: boolean;
  neededSlot?: string; // e.g. "sat_am"
}

export interface VolunteerScoreBreakdown {
  availability_match: number;
  skill_match: number;
  location_match: number;
  vehicle_fit: number;
  language_fit: number;
  low_workload: number;
  reliability: number;
}

export interface VolunteerScore {
  score: number;
  breakdown: VolunteerScoreBreakdown;
  reasons: string[];
  concerns: string[];
}

export function calculateVolunteerAssignmentScore(
  v: ScoreableVolunteer,
  input: VolunteerScoreInput,
): VolunteerScore {
  const reasons: string[] = [];
  const concerns: string[] = [];

  // availability_match (25)
  let availabilityPts = 0;
  const hasCapacity = v.active && v.active_assignments < v.max_tasks_per_day;
  if (!v.active) {
    concerns.push("Volunteer is inactive.");
  } else if (input.neededSlot && v.availability.includes(input.neededSlot)) {
    availabilityPts = 25;
    reasons.push(`Available for the ${input.neededSlot.replace(/_/g, " ")} slot.`);
  } else if (v.availability.includes("daily") || v.availability.length > 0) {
    availabilityPts = hasCapacity ? 18 : 8;
    reasons.push("Has general availability.");
  }

  // skill_match (20)
  const matchedSkills = input.requiredSkills.filter((s) =>
    v.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase()),
  );
  const skillPts =
    input.requiredSkills.length === 0
      ? 12
      : Math.round((matchedSkills.length / input.requiredSkills.length) * 20);
  if (matchedSkills.length) reasons.push(`Skills match: ${matchedSkills.join(", ")}.`);
  else if (input.requiredSkills.length) concerns.push("Missing requested skills.");

  // location_match (15)
  const distanceMi = zipProximityMiles(input.caseZip, v.zip);
  const locationPts = Math.max(0, Math.round(15 - distanceMi * 0.4));
  reasons.push(`~${distanceMi} mi from the requester.`);

  // vehicle_fit (15)
  let vehiclePts = 0;
  if (input.needsVehicle) {
    vehiclePts = v.has_vehicle ? 15 : 0;
    if (v.has_vehicle) reasons.push("Has a vehicle for delivery/transport.");
    else concerns.push("No vehicle; case likely needs driving.");
  } else {
    vehiclePts = 8;
  }

  // language_fit (10)
  const languagePts = v.languages.includes(input.language) ? 10 : 0;
  if (languagePts) reasons.push(`Speaks the requester's language (${input.language}).`);
  else concerns.push(`Does not speak ${input.language}.`);

  // low_workload (10)
  let workloadPts = 0;
  if (hasCapacity) {
    const ratio = v.active_assignments / Math.max(1, v.max_tasks_per_day);
    workloadPts = Math.round((1 - ratio) * 10);
    reasons.push(`Capacity: ${v.active_assignments}/${v.max_tasks_per_day} tasks today.`);
  } else {
    concerns.push("At max tasks for the day.");
  }

  // reliability (5)
  const reliabilityPts = Math.round((v.reliability_score / 100) * 5);
  if (v.reliability_score >= 85) reasons.push("High reliability score.");

  const breakdown: VolunteerScoreBreakdown = {
    availability_match: availabilityPts,
    skill_match: skillPts,
    location_match: locationPts,
    vehicle_fit: vehiclePts,
    language_fit: languagePts,
    low_workload: workloadPts,
    reliability: reliabilityPts,
  };

  const score = Math.max(
    0,
    Math.min(
      100,
      availabilityPts + skillPts + locationPts + vehiclePts + languagePts + workloadPts + reliabilityPts,
    ),
  );

  return { score, breakdown, reasons, concerns };
}
