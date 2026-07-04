/**
 * Intake Classifier.
 *
 * Converts a raw request into a validated `IntakeClassification`. The demo
 * generator combines the deterministic urgency scorer, emergency-flag engine,
 * and human-review router so output is realistic, safe, and stable.
 */

import {
  intakeClassificationSchema,
  type IntakeClassification,
} from "@/lib/ai/schemas/intake.schema";
import type { CaseType, VulnerableFlag, SafetyFlag } from "@/lib/ai/schemas/common";
import {
  detectEmergencyConcerns,
  detectVulnerableFlags,
  hasCriticalConcern,
} from "@/lib/safety/emergencyFlags";
import { decideHumanReview } from "@/lib/safety/humanReviewRules";
import { scoreUrgency } from "@/lib/ai/urgencyScorer";
import {
  INTAKE_SYSTEM_PROMPT,
  INTAKE_VERSION,
  buildIntakeUserMessage,
} from "@/lib/ai/prompts/intake-classifier.prompt";
import {
  buildIntakeContext,
  type IntakeContextInput,
} from "@/lib/ai/context-builders/buildIntakeContext";
import { serializeContext, DEFAULT_ORG_RULES } from "@/lib/ai/context-builders/types";
import { detectLanguageName } from "@/lib/ai/providers/demoProvider";
import { runStructuredTask } from "@/lib/ai/providers/aiProvider";

// Keyword → case_type. Concrete needs outrank constraint-like signals.
const CASE_TYPE_SIGNALS: { type: CaseType; re: RegExp }[] = [
  { type: "medical_supplies", re: /\b(medicine|prescription|insulin|oxygen|wheelchair|walker|medical|diabet)\b/i },
  { type: "shelter_support", re: /\b(shelter|homeless|evict|nowhere to stay|place to sleep|housing)\b/i },
  { type: "food_support", re: /\b(food|meal|meals|hungry|groceries|eat|pantry|vegetarian|halal|comida)\b/i },
  { type: "school_supplies", re: /\b(school supplies|backpack|backpacks|notebook|pencil|classroom)\b/i },
  { type: "hygiene_kits", re: /\b(hygiene|diaper|diapers|soap|toiletries|sanitary|shower)\b/i },
  { type: "clothing", re: /\b(clothes|clothing|coat|jacket|shoes|winter wear|ropa)\b/i },
  { type: "donation_pickup", re: /\b(donate|donation|pick ?up donation|drop off)\b/i },
  { type: "volunteer_request", re: /\b(volunteer|help out|sign up to help)\b/i },
  { type: "transportation", re: /\b(ride|drive|transport|bus|cannot drive|can't drive|stranded|pickup)\b/i },
  { type: "utilities_support", re: /\b(power|electricity|heat|water|gas bill|utility|utilities)\b/i },
  { type: "financial_hardship", re: /\b(rent money|cash|bill|financial|can't afford|pay for)\b/i },
];

function detectCaseType(text: string): { primary: CaseType } {
  for (const { type, re } of CASE_TYPE_SIGNALS) {
    if (re.test(text)) return { primary: type };
  }
  return { primary: "other" };
}

function estimatePeople(text: string, fallback: number): number {
  const m = text.match(/\b(\d+)\s+(people|kids|children|hijos|family members|persons)\b/i);
  if (m) return Math.max(1, parseInt(m[1], 10));
  if (/\bfamily\b/i.test(text)) return Math.max(fallback, 3);
  return Math.max(1, fallback);
}

function resourcesNeeded(type: CaseType, text: string): string[] {
  const needs: Record<CaseType, string[]> = {
    food_support: ["meals or groceries"],
    shelter_support: ["emergency shelter"],
    transportation: ["transportation/ride"],
    school_supplies: ["school supplies"],
    clothing: ["clothing"],
    hygiene_kits: ["hygiene kit"],
    medical_supplies: ["non-prescription medical supplies"],
    donation_pickup: ["donation pickup"],
    volunteer_request: ["volunteer coordination"],
    utilities_support: ["utility assistance referral"],
    financial_hardship: ["financial assistance referral"],
    other: ["general assistance"],
  };
  const base = [...needs[type]];
  if (/deliver|delivered|delivery|homebound|cannot drive|can't drive/i.test(text)) {
    base.push("delivery driver");
  }
  if (/vegetarian/i.test(text)) base.unshift("vegetarian meals");
  return base;
}

export function demoClassifyIntake(input: {
  text: string;
  peopleAffected: number;
  preferredLanguage?: string;
}): IntakeClassification {
  const text = input.text;
  const { primary } = detectCaseType(text);
  const concerns = detectEmergencyConcerns(text);
  const vulnerable = detectVulnerableFlags(text) as VulnerableFlag[];
  const peopleAffected = estimatePeople(text, input.peopleAffected);

  const missingFields: string[] = [];
  if (/deliver|delivered|delivery/i.test(text) && !/\d+\s+\w+\s+(st|ave|road|rd|street|blvd)/i.test(text)) {
    missingFields.push("exact delivery address");
  }
  if (!input.preferredLanguage) missingFields.push("preferred language confirmation");

  const urgency = scoreUrgency({
    caseType: primary,
    text,
    peopleAffected,
    vulnerableFlags: vulnerable,
    concerns,
    missingCriticalInfo: missingFields.length > 0,
  });

  const lowConfidence = primary === "other";
  const confidence = lowConfidence ? 0.55 : hasCriticalConcern(concerns) ? 0.82 : 0.9;

  const missingCriticalInfo = missingFields.some((f) => /address|location|phone/i.test(f));
  const review = decideHumanReview({
    urgencyLevel: urgency.urgency_level,
    concerns,
    confidence,
    confidenceThreshold: DEFAULT_ORG_RULES.human_review_confidence_threshold,
    missingCriticalInfo,
    validationFailed: false,
    noMatchingResource: false,
  });

  const safetyFlags = new Set<SafetyFlag>(concerns.map((c) => c.flag));
  if (vulnerable.length) safetyFlags.add("vulnerable_person");
  if (/today|now|tonight|asap/i.test(text)) safetyFlags.add("same_day_need");
  if (lowConfidence) safetyFlags.add("low_confidence");

  const nextSteps: string[] = [];
  if (review.required) nextSteps.push("Route to human review");
  nextSteps.push(`Check ${primary.replace(/_/g, " ")} resources`);
  if (/deliver|delivered|delivery|cannot drive|can't drive|homebound/i.test(text)) {
    nextSteps.push("Find a delivery volunteer with a vehicle");
  }
  nextSteps.push("Send confirmation outreach in the requester's language");

  return {
    case_type: primary,
    urgency_level: urgency.urgency_level,
    urgency_score: urgency.urgency_score,
    people_affected: peopleAffected,
    resources_needed: resourcesNeeded(primary, text),
    vulnerable_population_flags: vulnerable,
    missing_fields: missingFields,
    recommended_next_steps: nextSteps,
    human_review_required: review.required,
    safety_flags: [...safetyFlags],
    confidence_score: confidence,
    summary: buildSummary(text, primary, peopleAffected),
    detected_language: input.preferredLanguage
      ? mapLangName(input.preferredLanguage)
      : detectLanguageName(text),
  };
}

function mapLangName(v: string): "English" | "Spanish" | "Hindi" | "Urdu" {
  const s = v.toLowerCase();
  if (s === "es" || s === "spanish") return "Spanish";
  if (s === "hi" || s === "hindi") return "Hindi";
  if (s === "ur" || s === "urdu") return "Urdu";
  return "English";
}

function buildSummary(text: string, type: CaseType, people: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const short = clean.length > 110 ? clean.slice(0, 107) + "…" : clean;
  const who = people > 1 ? `${people} people` : "1 person";
  return `${type.replace(/_/g, " ")} need affecting ${who}: ${short}`.slice(0, 200);
}

export interface ClassifyIntakeInput extends IntakeContextInput {
  peopleAffected: number;
}

export async function classifyIntake(input: ClassifyIntakeInput) {
  const context = buildIntakeContext(input);
  const preferredLanguage = input.requester?.preferredLanguage;
  return runStructuredTask({
    task: "intake_classifier",
    promptVersion: INTAKE_VERSION,
    systemPrompt: INTAKE_SYSTEM_PROMPT,
    userMessage: buildIntakeUserMessage(serializeContext(context)),
    demo: () =>
      demoClassifyIntake({
        text: input.requestText,
        peopleAffected: input.peopleAffected,
        preferredLanguage,
      }),
    schema: intakeClassificationSchema,
    inputPayload: { text: input.requestText.slice(0, 500) },
    extractLogFields: (d) => ({
      confidence: d.confidence_score,
      safetyFlags: d.safety_flags,
    }),
  });
}
