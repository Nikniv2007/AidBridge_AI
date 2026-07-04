/**
 * AI provider dispatcher + structured-task runner.
 *
 * Responsibilities:
 *  - Decide live vs demo (demo is the default; live requires AI_PROVIDER=live,
 *    AI_DEMO_MODE!=true, and a configured LLM endpoint+key).
 *  - Run a task: in demo mode call the module's deterministic generator; in live
 *    mode call the generic endpoint, parse JSON, and on ANY failure fall back to
 *    the deterministic demo output.
 *  - Validate EVERY output with Zod. Malformed output is never silently
 *    accepted — it's logged, recorded for the AI Evaluation Lab, and replaced by
 *    the safe demo fallback.
 *  - Log which provider was used and the validated output.
 */

import type { ZodType, ZodTypeDef } from "zod";
import type { AiRunMeta } from "@/lib/ai/schemas/common";
import type { AiTaskType } from "@/lib/ai/schemas/eval.schema";
import {
  callLiveLLM,
  extractJson,
  getLiveConfig,
} from "@/lib/ai/providers/liveProvider";
import { DEMO_MODEL } from "@/lib/ai/providers/demoProvider";
import { logAiOutput } from "@/lib/data/aiLog";

export type Provider = "live" | "demo";

export function resolveProvider(): { provider: Provider; model: string; demoMode: boolean } {
  const forcedDemo = (process.env.AI_DEMO_MODE ?? "true").toLowerCase() === "true";
  const configured = (process.env.AI_PROVIDER ?? "demo").toLowerCase();
  const live = getLiveConfig();

  if (!forcedDemo && configured === "live" && live) {
    return { provider: "live", model: live.model, demoMode: false };
  }
  return { provider: "demo", model: DEMO_MODEL, demoMode: true };
}

function nowMs(startedAt?: number): number {
  return startedAt ?? Date.now();
}

export interface StructuredTaskInput<T> {
  task: AiTaskType;
  promptVersion: string;
  systemPrompt: string;
  userMessage: string;
  /** Deterministic, schema-valid demo output (raw object). */
  demo: () => unknown;
  schema: ZodType<T, ZodTypeDef, any>;
  /** For logging / eval attribution. */
  inputPayload?: unknown;
  /** Extracts confidence + safety flags for logging. */
  extractLogFields?: (data: T) => { confidence: number | null; safetyFlags: string[] };
  startedAt?: number;
}

export interface StructuredTaskResult<T> {
  data: T;
  meta: AiRunMeta;
  validation: { passed: boolean; error: string | null; usedFallback: boolean };
}

/**
 * The single entry point every AI task module uses. Guarantees a validated,
 * schema-correct result or throws a clean error (never returns malformed data).
 */
export async function runStructuredTask<T>(
  input: StructuredTaskInput<T>,
): Promise<StructuredTaskResult<T>> {
  const start = nowMs(input.startedAt);
  const { provider, model } = resolveProvider();

  let raw: unknown;
  let usedFallback = false;
  let effectiveProvider: Provider = provider;

  if (provider === "live") {
    try {
      const cfg = getLiveConfig()!;
      const text = await callLiveLLM(input.systemPrompt, input.userMessage, cfg);
      raw = extractJson(text);
    } catch {
      // Resilient: live failure → deterministic demo output.
      raw = input.demo();
      usedFallback = true;
      effectiveProvider = "demo";
    }
  } else {
    raw = input.demo();
  }

  let parsed = input.schema.safeParse(raw);
  let validationError: string | null = null;

  if (!parsed.success) {
    validationError = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    // Never accept malformed output — fall back to the safe demo response.
    const fallback = input.demo();
    parsed = input.schema.safeParse(fallback);
    usedFallback = true;
    effectiveProvider = "demo";
    if (!parsed.success) {
      // Demo generator itself is broken — log and throw a clean error.
      logFailure(input, model, "demo", raw, validationError);
      throw new Error(`AI ${input.task} output failed validation: ${validationError}`);
    }
  }

  const data = parsed.data;
  const meta: AiRunMeta = {
    provider: effectiveProvider,
    model: effectiveProvider === "demo" ? DEMO_MODEL : model,
    prompt_version: input.promptVersion,
    demo_mode: effectiveProvider === "demo",
    latency_ms: Date.now() - start,
    task: input.task,
  };

  const logFields = input.extractLogFields?.(data) ?? { confidence: null, safetyFlags: [] };
  logAiOutput({
    ai_task_type: input.task,
    prompt_version: meta.prompt_version,
    model_used: meta.model,
    provider: meta.provider,
    input_payload: input.inputPayload ?? { message: input.userMessage.slice(0, 500) },
    output_payload: data,
    validation_passed: validationError === null,
    validation_error: validationError,
    confidence_score: logFields.confidence,
    safety_flags: logFields.safetyFlags,
  });

  return { data, meta, validation: { passed: validationError === null, error: validationError, usedFallback } };
}

function logFailure<T>(
  input: StructuredTaskInput<T>,
  model: string,
  provider: Provider,
  raw: unknown,
  error: string,
) {
  logAiOutput({
    ai_task_type: input.task,
    prompt_version: input.promptVersion,
    model_used: model,
    provider,
    input_payload: input.inputPayload ?? {},
    output_payload: raw,
    validation_passed: false,
    validation_error: error,
    confidence_score: null,
    safety_flags: [],
  });
}
