/**
 * In-memory AI output + validation-failure log.
 *
 * Every structured AI task records an entry here (mirrors the `ai_outputs`
 * Supabase table). Validation failures are additionally surfaced so the AI
 * Evaluation Lab can display them — malformed output is never silently accepted.
 */

import type { AiRunMeta } from "@/lib/ai/schemas/common";
import type { AiTaskType } from "@/lib/ai/schemas/eval.schema";

export interface AiOutputRecord {
  id: string;
  ai_task_type: AiTaskType;
  prompt_version: string;
  model_used: string;
  provider: "live" | "demo";
  input_payload: unknown;
  output_payload: unknown;
  validation_passed: boolean;
  validation_error: string | null;
  confidence_score: number | null;
  safety_flags: string[];
  created_at: string;
}

const MAX = 200;
const store: AiOutputRecord[] = [];
let seq = 0;

export function logAiOutput(record: Omit<AiOutputRecord, "id" | "created_at"> & { created_at?: string }): AiOutputRecord {
  seq += 1;
  const entry: AiOutputRecord = {
    id: `AIO-${seq.toString(36).toUpperCase()}`,
    created_at: record.created_at ?? new Date().toISOString(),
    ...record,
  };
  store.unshift(entry);
  if (store.length > MAX) store.length = MAX;
  return entry;
}

export function getAiOutputs(): AiOutputRecord[] {
  return store;
}

export function getValidationFailures(): AiOutputRecord[] {
  return store.filter((r) => !r.validation_passed);
}

export function providerUsageCounts(): { live: number; demo: number } {
  return store.reduce(
    (acc, r) => {
      acc[r.provider] += 1;
      return acc;
    },
    { live: 0, demo: 0 },
  );
}

export function metaToRecordFields(meta: AiRunMeta) {
  return {
    prompt_version: meta.prompt_version,
    model_used: meta.model,
    provider: meta.provider,
  };
}
