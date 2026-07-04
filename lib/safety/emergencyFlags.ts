/**
 * Emergency & risk signal detection.
 *
 * Deterministic, regex-based detection of high-risk language. Kept in code
 * (not model-only) so safety behaviour is testable and cannot be prompted away.
 * Produces structured `SafetyConcern`s consumed by the Safety Review Agent and
 * the human-review router.
 */

import type { SafetyConcern } from "@/lib/ai/schemas/safety.schema";
import type { SafetyFlag, VulnerableFlag } from "@/lib/ai/schemas/common";

interface Rule {
  flag: SafetyFlag;
  severity: SafetyConcern["severity"];
  patterns: RegExp[];
  message: string;
  recommended_action: string;
}

export const EMERGENCY_RULES: Rule[] = [
  {
    flag: "emergency_services_needed",
    severity: "critical",
    patterns: [
      /\b(chest pain|not breathing|can't breathe|cannot breathe|unconscious|stroke|heart attack|severe bleeding|overdose|seizure)\b/i,
    ],
    message: "Language suggests a possible medical emergency.",
    recommended_action:
      "Advise the requester to call 911 / local emergency services immediately. Do not queue as routine aid; escalate to a human coordinator.",
  },
  {
    flag: "immediate_danger",
    severity: "critical",
    patterns: [
      /\b(in danger|being threatened|someone is trying to hurt|trapped|fire|drowning|flooding now)\b/i,
      /\bgas (leak|smell)\b/i,
      /\bsmell(s|ing)?( of| like)? gas\b/i,
    ],
    message: "Language suggests immediate physical danger.",
    recommended_action:
      "Escalate immediately and advise contacting emergency services. Never rely on volunteer dispatch for life-safety.",
  },
  {
    flag: "violence_or_self_harm",
    severity: "critical",
    patterns: [
      /\b(suicid\w*|kill myself|end my life|self[- ]?harm|want to die|hurt myself|domestic violence|being abused|my partner hit)\b/i,
    ],
    message: "Language suggests violence or self-harm risk.",
    recommended_action:
      "Route to a trained human immediately. Surface crisis resources (e.g. 988 in the US). Never auto-close.",
  },
  {
    flag: "minor_involved",
    severity: "warning",
    patterns: [/\b(unaccompanied minor|child alone|kids? home alone|runaway|my (baby|infant|newborn|toddler))\b/i],
    message: "Request may involve a minor or unaccompanied child.",
    recommended_action:
      "Requires human review; consider mandated-reporter obligations. Do not dispatch a lone volunteer.",
  },
  {
    flag: "medical_risk",
    severity: "warning",
    patterns: [/\b(insulin|oxygen|dialysis|prescription|medication|medical device|wheelchair|walker)\b/i],
    message: "Request involves medical needs.",
    recommended_action:
      "Do not provide medical advice or diagnosis. Route to human review and verified medical partners.",
  },
  {
    flag: "housing_instability",
    severity: "warning",
    patterns: [/\b(evict\w+|homeless|nowhere to stay|about to lose (my|our) (home|apartment)|sleeping in (my|the) car)\b/i],
    message: "Request indicates housing instability.",
    recommended_action:
      "Prioritize shelter partners and human review; handle location data with care.",
  },
  {
    flag: "legal_risk",
    severity: "info",
    patterns: [/\b(deportation|immigration case|lawsuit|court date|legal advice|restraining order)\b/i],
    message: "Request touches a legal matter.",
    recommended_action: "Do not provide legal advice. Refer to qualified legal-aid partners.",
  },
  {
    flag: "sensitive_personal_data",
    severity: "info",
    patterns: [/\b(ssn|social security number|\d{3}-\d{2}-\d{4}|passport number|credit card number)\b/i],
    message: "Request appears to contain sensitive identifiers.",
    recommended_action: "Minimize storage of sensitive identifiers; redact where possible.",
  },
];

const VULNERABLE_RULES: { flag: VulnerableFlag; re: RegExp }[] = [
  { flag: "elderly", re: /\b(elderly|senior|grandmother|grandfather|82|90-year|older adult)\b/i },
  { flag: "infant", re: /\b(infant|newborn|baby)\b/i },
  { flag: "child", re: /\b(child|children|kids?|hijos)\b/i },
  { flag: "pregnant", re: /\b(pregnant|expecting)\b/i },
  { flag: "disabled", re: /\b(disabled|disability|wheelchair|homebound)\b/i },
  { flag: "limited_transportation", re: /\b(cannot drive|can't drive|no car|no transportation|stranded)\b/i },
  { flag: "limited_english", re: /\b(no hablo|limited english|do not speak english)\b/i },
  { flag: "chronic_illness", re: /\b(diabet\w+|dialysis|cancer|chronic)\b/i },
  { flag: "unhoused", re: /\b(homeless|unhoused|sleeping outside)\b/i },
];

export function detectEmergencyConcerns(text: string): SafetyConcern[] {
  const concerns: SafetyConcern[] = [];
  for (const rule of EMERGENCY_RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      concerns.push({
        flag: rule.flag,
        severity: rule.severity,
        message: rule.message,
        recommended_action: rule.recommended_action,
      });
    }
  }
  return concerns;
}

export function detectVulnerableFlags(text: string): VulnerableFlag[] {
  const flags = new Set<VulnerableFlag>();
  for (const rule of VULNERABLE_RULES) {
    if (rule.re.test(text)) flags.add(rule.flag);
  }
  return [...flags];
}

export function hasCriticalConcern(concerns: SafetyConcern[]): boolean {
  return concerns.some((c) => c.severity === "critical");
}
