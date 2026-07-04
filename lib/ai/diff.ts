/**
 * AI Output Diff.
 *
 * Compares two structured AI outputs (e.g. from different prompt versions),
 * summarizes field-level differences, assesses safety impact, and reports schema
 * validation for both. Used by the AI Diff Viewer to make prompt changes
 * reviewable before they ship.
 */

import type { ZodTypeAny } from "zod";

export interface FieldChange {
  field: string;
  old: unknown;
  new: unknown;
}

export interface DiffResult {
  old_prompt_version: string;
  new_prompt_version: string;
  changes: FieldChange[];
  difference_summary: string;
  safety_impact: "none" | "improved" | "regressed" | "changed";
  old_schema_valid: boolean;
  new_schema_valid: boolean;
}

function flatten(obj: unknown, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, flatten(v, key));
      else out[key] = Array.isArray(v) ? JSON.stringify(v) : v;
    }
  } else {
    out[prefix || "value"] = obj;
  }
  return out;
}

export function diffOutputs(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  opts: {
    oldPromptVersion: string;
    newPromptVersion: string;
    schema?: ZodTypeAny;
  },
): DiffResult {
  const a = flatten(oldObj);
  const b = flatten(newObj);
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  const changes: FieldChange[] = [];
  for (const k of keys) {
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
      changes.push({ field: k, old: a[k], new: b[k] });
    }
  }

  // Safety impact heuristic from human_review_required + safety flag counts.
  let safety_impact: DiffResult["safety_impact"] = "none";
  const reviewChange = changes.find((c) => c.field === "human_review_required");
  if (reviewChange) {
    safety_impact = reviewChange.new === true ? "improved" : "regressed";
  } else {
    const flagsA = Array.isArray((oldObj as any).safety_flags) ? (oldObj as any).safety_flags.length : 0;
    const flagsB = Array.isArray((newObj as any).safety_flags) ? (newObj as any).safety_flags.length : 0;
    if (flagsB > flagsA) safety_impact = "improved";
    else if (flagsB < flagsA) safety_impact = "regressed";
    else if (changes.length) safety_impact = "changed";
  }

  const old_schema_valid = opts.schema ? opts.schema.safeParse(oldObj).success : true;
  const new_schema_valid = opts.schema ? opts.schema.safeParse(newObj).success : true;

  const difference_summary =
    changes.length === 0
      ? "No differences between the two outputs."
      : `${changes.length} field(s) changed: ${changes.slice(0, 6).map((c) => c.field).join(", ")}${changes.length > 6 ? "…" : ""}.`;

  return {
    old_prompt_version: opts.oldPromptVersion,
    new_prompt_version: opts.newPromptVersion,
    changes,
    difference_summary,
    safety_impact,
    old_schema_valid,
    new_schema_valid,
  };
}
