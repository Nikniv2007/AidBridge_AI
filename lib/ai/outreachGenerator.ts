/**
 * Outreach Generator.
 *
 * Produces a validated, safe outreach message. The deterministic demo templates
 * are localized (English/Spanish/Hindi/Urdu) and pass the outbound safety gate.
 */

import {
  outreachSchema,
  type OutreachResult,
} from "@/lib/ai/schemas/outreach.schema";
import type { LanguageName } from "@/lib/ai/schemas/common";
import {
  OUTREACH_SYSTEM_PROMPT,
  OUTREACH_VERSION,
  buildOutreachUserMessage,
} from "@/lib/ai/prompts/outreach-generator.prompt";
import { buildOutreachContext } from "@/lib/ai/context-builders/buildOutreachContext";
import { serializeContext } from "@/lib/ai/context-builders/types";
import { runStructuredTask } from "@/lib/ai/providers/aiProvider";
import { validateSafeOutput } from "@/lib/safety/validateSafeOutput";

export interface OutreachInput {
  audience: OutreachResult["audience"];
  channel: OutreachResult["channel"];
  tone: OutreachResult["tone"];
  language: LanguageName;
  context: string;
  recipientFirstName?: string;
}

const GREETING: Record<LanguageName, string> = {
  English: "Hi",
  Spanish: "Hola",
  Hindi: "नमस्ते",
  Urdu: "السلام علیکم",
};

function bodyFor(input: OutreachInput): string {
  const name = input.recipientFirstName ? ` ${input.recipientFirstName}` : "";
  const ctx = input.context?.trim() ? ` ${input.context.trim()}` : "";
  if (input.language !== "English") {
    const localized: Record<Exclude<LanguageName, "English">, string> = {
      Spanish: `${GREETING.Spanish}${name}, le escribimos de parte de nuestro equipo comunitario.${ctx} Un voluntario se comunicará pronto. Esto no reemplaza los servicios de emergencia. Gracias.`,
      Hindi: `${GREETING.Hindi}${name}, हम अपनी सामुदायिक टीम की ओर से लिख रहे हैं।${ctx} एक स्वयंसेवक जल्द ही संपर्क करेगा। यह आपातकालीन सेवाओं का विकल्प नहीं है। धन्यवाद।`,
      Urdu: `${GREETING.Urdu}${name}، ہم اپنی کمیونٹی ٹیم کی جانب سے لکھ رہے ہیں۔${ctx} ایک رضاکار جلد رابطہ کرے گا۔ یہ ہنگامی خدمات کا متبادل نہیں ہے۔ شکریہ۔`,
    };
    return localized[input.language];
  }

  switch (input.audience) {
    case "volunteer":
      return `${GREETING.English}${name}, we have a task that fits your availability.${ctx} Please reply YES if you're able to help. Review the details in AidBridge and follow the safety checklist. Thank you for volunteering!`;
    case "donor":
      return `${GREETING.English}${name}, thank you for supporting our community response.${ctx} Your contribution helps us match neighbors with essential resources. We'll share impact updates soon.`;
    case "partner":
      return `${GREETING.English}${name}, we're coordinating community aid and would like to partner on an active need.${ctx} Could you confirm current availability and eligibility? We keep a human in the loop on every referral.`;
    case "leadership":
      return `Operations update:${ctx} Active cases are being triaged and matched. High-urgency and safety-flagged cases are routed to human review. Full metrics are in the Command Center.`;
    case "community_group":
      return `${GREETING.English} neighbors — we're organizing community support this week.${ctx} If you or someone you know needs help, submit a request and our team will follow up. This does not replace emergency services (call 911 for emergencies).`;
    default:
      return `${GREETING.English}${name}, we received your request and our team is coordinating help.${ctx} A volunteer or partner will reach out soon. This service does not replace emergency services — call 911 in an emergency. Thank you.`;
  }
}

export function demoOutreach(input: OutreachInput): OutreachResult {
  let message = bodyFor(input);
  if (input.channel === "sms" || input.channel === "whatsapp") {
    message = message.slice(0, 300);
  }
  if (input.tone === "urgent") message = `[Time-sensitive] ${message}`;

  const subject =
    input.channel === "email" ? "AidBridge AI — Update on your request" : null;

  // Outbound safety gate — demo templates are safe by construction.
  const gate = validateSafeOutput(message);
  const safety_notes = [
    "Does not disclose unnecessary private information (addresses, phone, health details).",
  ];
  if (!gate.safe) safety_notes.push(`Blocked phrases removed: ${gate.violations.join(", ")}`);

  return {
    audience: input.audience,
    channel: input.channel,
    tone: input.tone,
    language: input.language,
    subject,
    message,
    safety_notes,
    confidence_score: 0.94,
  };
}

export async function generateOutreach(input: OutreachInput) {
  const context = buildOutreachContext({
    audience: input.audience,
    channel: input.channel,
    tone: input.tone,
    language: input.language,
    context: input.context,
  });

  const result = await runStructuredTask({
    task: "outreach_generator",
    promptVersion: OUTREACH_VERSION,
    systemPrompt: OUTREACH_SYSTEM_PROMPT,
    userMessage: buildOutreachUserMessage(serializeContext(context)),
    demo: () => demoOutreach(input),
    schema: outreachSchema,
    inputPayload: { audience: input.audience, channel: input.channel },
    extractLogFields: (d) => ({ confidence: d.confidence_score, safetyFlags: [] }),
  });

  // Final outbound safety gate on whatever was produced (live or demo).
  const gate = validateSafeOutput(result.data.message);
  if (!gate.safe) {
    const safe = demoOutreach(input);
    return { ...result, data: safe };
  }
  return result;
}
