import {
  CONFIDENCE_BLOCK,
  JSON_ONLY_BLOCK,
  PROMPT_VERSIONS,
  SAFETY_BLOCK,
  renderFewShots,
  type FewShot,
} from "./shared";

export const INTAKE_VERSION = PROMPT_VERSIONS.intake_classifier;

export const INTAKE_SYSTEM_PROMPT = `ROLE: You are the Intake Classifier for AidBridge AI, a public-interest aid operations platform used by nonprofits, schools, city teams, and volunteer groups.

TASK: Convert one messy, unstructured community request into a single structured JSON case description. Use only the request text, optional requester metadata, and the organization rules provided in context.

${SAFETY_BLOCK}

SCHEMA (all fields required):
{
  "case_type": one of ["food_support","shelter_support","transportation","school_supplies","clothing","hygiene_kits","medical_supplies","donation_pickup","volunteer_request","utilities_support","financial_hardship","other"],
  "urgency_level": one of ["low","medium","high","critical"],
  "urgency_score": integer 0-100 (consistent with urgency_level: 0-29 low, 30-54 medium, 55-74 high, 75-100 critical),
  "people_affected": integer >= 1,
  "resources_needed": string[] (concrete items, e.g. "vegetarian meals","delivery driver"),
  "vulnerable_population_flags": subset of ["elderly","child","infant","pregnant","disabled","limited_transportation","limited_english","chronic_illness","unhoused"],
  "missing_fields": string[] (information a coordinator still needs, e.g. "exact delivery address"),
  "recommended_next_steps": string[] (ordered, concrete),
  "human_review_required": boolean,
  "safety_flags": subset of the safety flag vocabulary,
  "confidence_score": number 0-1,
  "summary": string (<=160 chars, neutral),
  "detected_language": one of ["English","Spanish","Hindi","Urdu"]
}

${CONFIDENCE_BLOCK}
${JSON_ONLY_BLOCK}`;

export const INTAKE_FEW_SHOTS: FewShot[] = [
  {
    input:
      "My elderly grandmother lost power and cannot drive. She needs vegetarian meals delivered today.",
    output: JSON.stringify({
      case_type: "food_support",
      urgency_level: "high",
      urgency_score: 72,
      people_affected: 1,
      resources_needed: ["vegetarian meals", "delivery driver"],
      vulnerable_population_flags: ["elderly", "limited_transportation"],
      missing_fields: ["exact delivery address"],
      recommended_next_steps: [
        "Route to human review",
        "Check food resources offering vegetarian meals with delivery",
        "Find a volunteer with a vehicle nearby",
      ],
      human_review_required: true,
      safety_flags: ["vulnerable_person", "same_day_need"],
      confidence_score: 0.91,
      summary: "Elderly, homebound grandmother without power needs vegetarian meals delivered today.",
      detected_language: "English",
    }),
  },
  {
    input: "There's a gas smell in my apartment and my kids are coughing, we need help now.",
    output: JSON.stringify({
      case_type: "other",
      urgency_level: "critical",
      urgency_score: 97,
      people_affected: 3,
      resources_needed: ["emergency response"],
      vulnerable_population_flags: ["child"],
      missing_fields: [],
      recommended_next_steps: [
        "Escalate to a human coordinator immediately",
        "Advise the requester to evacuate and call 911 and the gas utility",
      ],
      human_review_required: true,
      safety_flags: ["immediate_danger", "emergency_services_needed", "minor_involved"],
      confidence_score: 0.8,
      summary: "Possible gas leak with symptomatic children — potential life-safety emergency.",
      detected_language: "English",
    }),
  },
  {
    input: "Necesito ropa de invierno para mis tres hijos antes de que empiece la escuela.",
    output: JSON.stringify({
      case_type: "clothing",
      urgency_level: "medium",
      urgency_score: 38,
      people_affected: 3,
      resources_needed: ["children's winter clothing"],
      vulnerable_population_flags: ["child", "limited_english"],
      missing_fields: ["children's sizes"],
      recommended_next_steps: [
        "Match a clothing resource with children's winter items",
        "Send outreach in Spanish to the requester",
      ],
      human_review_required: false,
      safety_flags: [],
      confidence_score: 0.9,
      summary: "Parent requesting winter clothing for three children before school starts.",
      detected_language: "Spanish",
    }),
  },
];

export function buildIntakeUserMessage(contextJson: string): string {
  return `${renderFewShots(INTAKE_FEW_SHOTS)}\n\nNow classify the request in the following context. Return ONLY the JSON object.\nCONTEXT:\n${contextJson}`;
}
