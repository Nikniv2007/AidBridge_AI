/**
 * AI Output Reviewer.
 *
 * A deterministic meta-checker that audits another AI output for JSON validity,
 * schema correctness, safety compliance, hallucination risk, and missing fields.
 * Powers the AI Evaluation Lab's per-output review and can gate persistence.
 */

import type { ZodType } from "zod";
import {
  outputReviewSchema,
  type OutputReview,
} from "@/lib/ai/schemas/eval.schema";
import { validateSafeOutput } from "@/lib/safety/validateSafeOutput";

export interface ReviewInput {
  taskType: string;
  candidate: unknown;
  schema: ZodType<unknown>;
  /** Ids the candidate is allowed to reference (anti-hallucination check). */
  allowedIds?: string[];
  /** Free text portion to run through the outbound safety gate. */
  text?: string;
}

export function reviewOutput(input: ReviewInput): OutputReview {
  const issues: string[] = [];
  const missing_fields: string[] = [];

  // JSON validity: can it be serialized/parsed round-trip?
  let json_valid = true;
  try {
    JSON.parse(JSON.stringify(input.candidate));
  } catch {
    json_valid = false;
    issues.push("Output is not valid JSON.");
  }

  // Schema validity.
  const parsed = input.schema.safeParse(input.candidate);
  const schema_valid = parsed.success;
  if (!parsed.success) {
    for (const iss of parsed.error.issues) {
      const path = iss.path.join(".");
      issues.push(`${path}: ${iss.message}`);
      if (iss.code === "invalid_type" && iss.message.includes("required")) missing_fields.push(path);
    }
  }

  // Hallucination check: does it reference ids not in the allowed set?
  let hallucination_risk: OutputReview["hallucination_risk"] = "low";
  if (input.allowedIds && input.allowedIds.length > 0) {
    const text = JSON.stringify(input.candidate);
    const referenced = [...text.matchAll(/"(resource_id|volunteer_id)":\s*"([^"]+)"/g)].map(
      (m) => m[2],
    );
    const invented = referenced.filter((id) => !input.allowedIds!.includes(id));
    if (invented.length > 0) {
      hallucination_risk = "high";
      issues.push(`References ids not in context: ${invented.join(", ")}.`);
    }
  }

  // Safety compliance on any outbound text.
  let safety_compliant = true;
  if (input.text) {
    const gate = validateSafeOutput(input.text);
    safety_compliant = gate.safe;
    if (!gate.safe) issues.push(...gate.violations.map((v) => `Safety: ${v}`));
  }

  const overall_ok =
    json_valid && schema_valid && safety_compliant && hallucination_risk !== "high";

  const review: OutputReview = {
    json_valid,
    schema_valid,
    safety_compliant,
    hallucination_risk,
    missing_fields,
    issues,
    overall_ok,
    confidence_score: overall_ok ? 0.92 : 0.6,
  };

  // Validate our own output shape (defensive).
  return outputReviewSchema.parse(review);
}
