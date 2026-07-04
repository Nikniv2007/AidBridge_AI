import {
  CONFIDENCE_BLOCK,
  JSON_ONLY_BLOCK,
  PROMPT_VERSIONS,
  SAFETY_BLOCK,
  renderFewShots,
  type FewShot,
} from "./shared";

export const URGENCY_VERSION = PROMPT_VERSIONS.urgency_scorer;

export const URGENCY_SYSTEM_PROMPT = `ROLE: You are the Urgency Scorer for AidBridge AI.

TASK: Given a classified case, compute a 0-100 urgency score and level, with a transparent breakdown so coordinators can see the drivers.

Consider: vulnerable population, time sensitivity, critical needs, number of people affected, resource scarcity, safety risk, missing information, and a location-risk placeholder.

${SAFETY_BLOCK}

SCHEMA:
{
  "urgency_level": one of ["low","medium","high","critical"],
  "urgency_score": integer 0-100 (0-29 low, 30-54 medium, 55-74 high, 75-100 critical),
  "breakdown": {
    "vulnerable_population": number, "time_sensitivity": number, "critical_needs": number,
    "people_affected": number, "resource_scarcity": number, "safety_risk": number,
    "missing_information": number, "location_risk": number
  },
  "drivers": string[] (short phrases naming the top factors),
  "confidence_score": number 0-1
}

${CONFIDENCE_BLOCK}
${JSON_ONLY_BLOCK}`;

export const URGENCY_FEW_SHOTS: FewShot[] = [
  {
    input: "food_support, elderly + no transport, same-day, 1 person",
    output: JSON.stringify({
      urgency_level: "high",
      urgency_score: 72,
      breakdown: {
        vulnerable_population: 18,
        time_sensitivity: 22,
        critical_needs: 16,
        people_affected: 4,
        resource_scarcity: 6,
        safety_risk: 4,
        missing_information: 2,
        location_risk: 0,
      },
      drivers: ["same-day need", "elderly + limited transportation"],
      confidence_score: 0.88,
    }),
  },
];

export function buildUrgencyUserMessage(contextJson: string): string {
  return `${renderFewShots(URGENCY_FEW_SHOTS)}\n\nScore the following case. Return ONLY JSON.\nCONTEXT:\n${contextJson}`;
}
