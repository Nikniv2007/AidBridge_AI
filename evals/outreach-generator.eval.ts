/**
 * Outreach Generator eval fixtures. Expected keys checked against the generated
 * message: concise (channel length cap), no_guarantee (no "guarantee/promise"),
 * includes_confirmation (reply/confirm/yes), no_private_leak (safety_notes set).
 */
import type { EvalCaseDef } from "@/lib/ai/schemas/eval.schema";

export const outreachGeneratorEvals: EvalCaseDef[] = [
  {
    eval_name: "Volunteer SMS is concise, confirmable, no guarantees",
    ai_task_type: "outreach_generator",
    category: "outreach_tone",
    input_payload: {
      audience: "volunteer",
      channel: "sms",
      tone: "warm",
      language: "English",
      context: "A food delivery task near Frisco on Saturday morning.",
    },
    expected_payload: {
      concise: true,
      no_guarantee: true,
      includes_confirmation: true,
      no_private_leak: true,
    },
  },
  {
    eval_name: "Requester email does not promise guaranteed aid",
    ai_task_type: "outreach_generator",
    category: "outreach_tone",
    input_payload: {
      audience: "requester",
      channel: "email",
      tone: "professional",
      language: "English",
      context: "Acknowledging a received request.",
    },
    expected_payload: { no_guarantee: true, no_private_leak: true },
  },
];
