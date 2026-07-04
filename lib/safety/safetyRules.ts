/**
 * Non-negotiable safety rules for AidBridge AI.
 *
 * These are the behavioural boundaries enforced across the whole system. They
 * are asserted in prompts AND checked in code (`validateSafeOutput`) so a model
 * cannot violate them even if jailbroken.
 */

export const SAFETY_RULES = {
  never_promise_guaranteed_aid: true,
  never_provide_medical_diagnosis: true,
  never_provide_legal_advice: true,
  never_provide_financial_advice: true,
  never_discourage_emergency_services: true,
  never_invent_resources: true,
  never_auto_assign_unsafe_cases: true,
  never_auto_close_critical_cases: true,
  never_share_unnecessary_private_data: true,
} as const;

export const STANDARD_DISCLAIMERS = [
  "AidBridge AI does not replace 911 or emergency services.",
  "It does not provide medical, legal, tax, or financial advice.",
  "It does not guarantee that aid will be delivered.",
  "A human reviews high-risk and low-confidence cases before action.",
  "All AI outputs are logged for review and evaluation.",
];

/**
 * Phrases that must never appear in outbound AI text. Used by
 * `validateSafeOutput` to hard-block unsafe generations.
 */
export const FORBIDDEN_OUTPUT_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\b(guarantee|guaranteed|we promise|you will definitely (get|receive))\b/i,
    reason: "Promises guaranteed aid.",
  },
  {
    pattern: /\b(you (have|are) (a )?(diagnos|suffering from)|you should take \w+ (mg|milligrams))\b/i,
    reason: "Provides a medical diagnosis or dosage.",
  },
  {
    pattern: /\b(do ?n'?t (call|contact) (911|emergency)|no need to call (911|emergency))\b/i,
    reason: "Discourages contacting emergency services.",
  },
  {
    pattern: /\b(as your (lawyer|attorney)|legal advice is|you will win your case)\b/i,
    reason: "Provides legal advice.",
  },
];

export const AI_TASK_TYPES = [
  "intake_classifier",
  "urgency_scorer",
  "safety_review",
  "resource_matcher",
  "volunteer_assignment",
  "outreach_generator",
  "report_writer",
  "output_reviewer",
] as const;
