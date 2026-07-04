/**
 * Deterministic demo provider utilities.
 *
 * The demo provider is what makes AidBridge AI fully usable with NO API keys.
 * Each AI task module supplies its own deterministic generator (built on the
 * shared scoring/safety cores), so demo output is realistic AND stable — which
 * also makes it perfect for prompt-regression evals.
 */

import type { AiRunMeta } from "@/lib/ai/schemas/common";
import type { AiTaskType } from "@/lib/ai/schemas/eval.schema";

export const DEMO_MODEL = "aidbridge-demo-1";

export function demoMeta(task: AiTaskType, latencyMs: number, promptVersion: string): AiRunMeta {
  return {
    provider: "demo",
    model: DEMO_MODEL,
    prompt_version: promptVersion,
    demo_mode: true,
    latency_ms: latencyMs,
    task,
  };
}

/** Simple deterministic language detection shared by demo generators. */
export function detectLanguageName(text: string): "English" | "Spanish" | "Hindi" | "Urdu" {
  if (/[؀-ۿ]/.test(text)) return "Urdu";
  if (/[ऀ-ॿ]/.test(text)) return "Hindi";
  if (/\b(necesito|ayuda|comida|ropa|hijos|por favor|gracias)\b/i.test(text)) return "Spanish";
  return "English";
}
