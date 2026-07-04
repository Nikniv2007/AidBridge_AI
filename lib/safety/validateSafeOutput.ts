/**
 * Final gate for any outbound AI text (outreach, reports).
 *
 * Scans generated text against `FORBIDDEN_OUTPUT_PATTERNS`. If a violation is
 * found the caller must NOT send/save the output and should fall back to a safe
 * template + route to human review.
 */

import { FORBIDDEN_OUTPUT_PATTERNS } from "@/lib/safety/safetyRules";

export interface SafeOutputResult {
  safe: boolean;
  violations: string[];
}

export function validateSafeOutput(text: string): SafeOutputResult {
  const violations: string[] = [];
  for (const { pattern, reason } of FORBIDDEN_OUTPUT_PATTERNS) {
    if (pattern.test(text)) violations.push(reason);
  }
  return { safe: violations.length === 0, violations };
}
