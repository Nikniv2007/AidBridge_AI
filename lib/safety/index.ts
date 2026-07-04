/**
 * Safety rules engine.
 *
 * AidBridge AI is decision *support*, never a replacement for emergency
 * services or professional advice. This module scans free-text requests for
 * high-risk signals and produces structured `SafetyFlag`s. Flags drive
 * human-review routing and are surfaced prominently in the UI and audit log.
 *
 * These rules are intentionally rule-based (not LLM-only) so that safety
 * behaviour is deterministic, testable, and cannot be "prompted away".
 */

import type { SafetyFlag, SafetyFlagCode } from "@/lib/types";

interface Rule {
  code: SafetyFlagCode;
  severity: SafetyFlag["severity"];
  patterns: RegExp[];
  message: string;
  recommendedAction: string;
}

const RULES: Rule[] = [
  {
    code: "medical_emergency",
    severity: "critical",
    patterns: [
      /\b(chest pain|not breathing|can't breathe|cannot breathe|unconscious|stroke|heart attack|severe bleeding|overdose|seizure)\b/i,
    ],
    message: "Language suggests a possible medical emergency.",
    recommendedAction:
      "Do not queue as routine aid. Direct the requester to call 911 / local emergency services immediately and escalate to a human coordinator.",
  },
  {
    code: "immediate_danger",
    severity: "critical",
    patterns: [
      /\b(in danger|being threatened|someone is trying to hurt|trapped|fire|gas leak|flooding now|drowning)\b/i,
    ],
    message: "Language suggests immediate physical danger.",
    recommendedAction:
      "Escalate immediately. Advise contacting emergency services. Do not rely on volunteer dispatch for life-safety situations.",
  },
  {
    code: "mental_health_crisis",
    severity: "critical",
    patterns: [
      /\b(suicid\w*|kill myself|end my life|self[- ]?harm|want to die|hurt myself)\b/i,
    ],
    message: "Language suggests a mental-health crisis.",
    recommendedAction:
      "Route to a trained human immediately. Surface crisis-line resources (e.g. 988 in the US). Never auto-close.",
  },
  {
    code: "domestic_violence",
    severity: "warning",
    patterns: [
      /\b(domestic violence|abus\w+|my partner hit|afraid of my (husband|wife|partner)|restraining order)\b/i,
    ],
    message: "Language may indicate domestic violence.",
    recommendedAction:
      "Handle with confidentiality. Do not share requester location with unvetted volunteers. Route to a human with DV training.",
  },
  {
    code: "minor_unaccompanied",
    severity: "warning",
    patterns: [/\b(unaccompanied minor|child alone|kids? home alone|runaway)\b/i],
    message: "Request may involve an unaccompanied minor.",
    recommendedAction:
      "Requires human review and possibly mandated-reporter obligations. Do not dispatch a lone volunteer.",
  },
  {
    code: "legal_matter",
    severity: "info",
    patterns: [/\b(evict\w+|deportation|immigration case|lawsuit|court date|legal advice)\b/i],
    message: "Request touches a legal matter.",
    recommendedAction:
      "Do not provide legal advice. Refer to qualified legal aid partners.",
  },
  {
    code: "financial_advice_requested",
    severity: "info",
    patterns: [/\b(tax advice|invest\w*|loan advice|financial advice|which stock)\b/i],
    message: "Request asks for financial/tax advice.",
    recommendedAction:
      "Do not provide financial, tax, or investment advice. Refer to certified partners.",
  },
  {
    code: "sensitive_personal_data",
    severity: "info",
    patterns: [
      /\b(ssn|social security number|\d{3}-\d{2}-\d{4}|passport number|credit card number)\b/i,
    ],
    message: "Request appears to contain sensitive personal identifiers.",
    recommendedAction:
      "Minimize storage of sensitive identifiers. Redact where possible and restrict access.",
  },
];

export function scanForSafetyFlags(text: string): SafetyFlag[] {
  const flags: SafetyFlag[] = [];
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      flags.push({
        code: rule.code,
        severity: rule.severity,
        message: rule.message,
        recommendedAction: rule.recommendedAction,
      });
    }
  }
  return flags;
}

/** Any critical flag forces human review, no matter what the model says. */
export function safetyForcesHumanReview(flags: SafetyFlag[]): boolean {
  return flags.some((f) => f.severity === "critical");
}

export const SAFETY_DISCLAIMERS = [
  "AidBridge AI does not replace 911 or emergency services.",
  "It does not provide medical, legal, tax, or financial advice.",
  "It does not guarantee that aid will be delivered.",
  "A human reviews high-risk and low-confidence cases before action.",
  "All AI outputs are logged for review and evaluation.",
];
