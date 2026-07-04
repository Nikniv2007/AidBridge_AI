/**
 * Deterministic demo AI engine.
 *
 * This is what makes AidBridge AI fully usable with NO API keys. It produces
 * realistic, structured, schema-valid outputs using the same rule-based
 * scoring/safety backbone the live path validates against. Because it's
 * deterministic, it's also perfect for prompt-regression and eval tests.
 */

import {
  scanForSafetyFlags,
  safetyForcesHumanReview,
} from "@/lib/safety";
import { computeUrgencyScore, urgencyBand } from "@/lib/scoring";
import type {
  CaseCategory,
  Language,
  OutreachRequest,
  ResourceType,
  TriageOutput,
} from "@/lib/types";
import type { TriageModelOutput } from "@/lib/ai/schema";
import { PROMPT_VERSION } from "@/lib/ai/prompts";

// Keyword → category signals. Ordered so that concrete *needs* (medical,
// shelter, food, supplies) outrank constraint-like signals (transportation,
// utilities) — e.g. "needs meals but cannot drive" is a food case, not a
// transportation case. The first match becomes the primary category.
const CATEGORY_SIGNALS: { cat: CaseCategory; re: RegExp }[] = [
  { cat: "medical_supplies", re: /\b(medicine|prescription|insulin|oxygen|wheelchair|walker|medical|diabet)\b/i },
  { cat: "shelter", re: /\b(shelter|homeless|evict|nowhere to stay|place to sleep|housing)\b/i },
  { cat: "food", re: /\b(food|meal|meals|hungry|groceries|eat|pantry|vegetarian|halal|comida)\b/i },
  { cat: "school_supplies", re: /\b(school supplies|backpack|backpacks|notebook|pencil|classroom)\b/i },
  { cat: "hygiene", re: /\b(hygiene|diaper|diapers|soap|toiletries|sanitary|shower)\b/i },
  { cat: "clothing", re: /\b(clothes|clothing|coat|jacket|shoes|winter wear|ropa)\b/i },
  { cat: "transportation", re: /\b(ride|drive|transport|car|bus|cannot drive|can't drive|stranded|pickup)\b/i },
  { cat: "utilities", re: /\b(power|electricity|heat|water|gas bill|utility|utilities)\b/i },
  { cat: "financial_hardship", re: /\b(rent money|cash|bill|financial|can't afford|pay for)\b/i },
];

const RESOURCE_BY_CATEGORY: Record<CaseCategory, ResourceType[]> = {
  food: ["food_pantry", "donation_pickup"],
  shelter: ["shelter"],
  transportation: ["transportation"],
  medical_supplies: ["medical_supplies"],
  hygiene: ["hygiene_kits"],
  school_supplies: ["school_supplies"],
  clothing: ["clothing"],
  utilities: ["partner_org"],
  financial_hardship: ["partner_org"],
  other: ["partner_org"],
};

function detectLanguage(text: string): Language {
  if (/[؀-ۿ]/.test(text)) return "ur"; // Arabic script (Urdu)
  if (/[ऀ-ॿ]/.test(text)) return "hi"; // Devanagari (Hindi)
  if (/\b(necesito|ayuda|comida|ropa|hijos|por favor|gracias)\b/i.test(text)) return "es";
  return "en";
}

function detectCategories(text: string): { primary: CaseCategory; secondary: CaseCategory[] } {
  const hits: CaseCategory[] = [];
  for (const { cat, re } of CATEGORY_SIGNALS) {
    if (re.test(text) && !hits.includes(cat)) hits.push(cat);
  }
  if (hits.length === 0) return { primary: "other", secondary: [] };
  return { primary: hits[0], secondary: hits.slice(1, 3) };
}

function estimatePeople(text: string, fallback: number): number {
  const m = text.match(/\b(\d+)\s+(people|kids|children|hijos|family members|persons)\b/i);
  if (m) return Math.max(1, parseInt(m[1], 10));
  if (/\bfamily\b/i.test(text)) return Math.max(fallback, 3);
  return Math.max(1, fallback);
}

export interface DemoTriageInput {
  description: string;
  peopleAffected: number;
  preferredLanguage?: Language;
}

/** Produce a schema-valid triage output deterministically. */
export function demoTriage(input: DemoTriageInput): TriageModelOutput {
  const text = input.description;
  const { primary, secondary } = detectCategories(text);
  const safetyFlags = scanForSafetyFlags(text);
  const peopleAffected = estimatePeople(text, input.peopleAffected);

  const urgencyScore = computeUrgencyScore({
    category: primary,
    description: text,
    peopleAffected,
    safetyFlags,
  });
  const urgency = urgencyBand(urgencyScore);

  const forced = safetyForcesHumanReview(safetyFlags);
  const lowConfidence = primary === "other";
  const confidence = lowConfidence ? 0.52 : forced ? 0.8 : 0.87;
  const humanReviewRequired = forced || urgencyScore >= 85 || confidence < 0.6;

  const neededResources = RESOURCE_BY_CATEGORY[primary];

  const nextSteps: string[] = [];
  if (forced) {
    nextSteps.push("Escalate to a human coordinator immediately.");
    nextSteps.push(
      "If life-safety is involved, advise the requester to contact emergency services.",
    );
  }
  nextSteps.push(
    `Match a ${primary.replace(/_/g, " ")} resource near the requester.`,
  );
  if (/deliver|homebound|cannot drive|can't drive|elderly|disabled/i.test(text)) {
    nextSteps.push("Prioritize a volunteer with vehicle access for delivery.");
  }
  nextSteps.push("Send confirmation outreach in the requester's language.");

  const detectedLanguage = input.preferredLanguage ?? detectLanguage(text);

  return {
    summary: buildSummary(text, primary, peopleAffected),
    category: primary,
    secondaryCategories: secondary,
    urgency,
    urgencyScore,
    neededResources,
    peopleAffected,
    safetyFlags,
    humanReviewRequired,
    humanReviewReason: humanReviewRequired
      ? forced
        ? "Safety-critical signals detected — human escalation required."
        : lowConfidence
          ? "Low classification confidence — needs human confirmation."
          : "Very high urgency — human confirmation before dispatch."
      : null,
    confidence,
    suggestedNextSteps: nextSteps,
    detectedLanguage,
  };
}

function buildSummary(text: string, cat: CaseCategory, people: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const short = clean.length > 120 ? clean.slice(0, 117) + "…" : clean;
  const who = people > 1 ? `${people} people` : "1 person";
  return `${cat.replace(/_/g, " ")} need affecting ${who}: ${short}`.slice(0, 200);
}

export function toFullTriageOutput(
  model: TriageModelOutput,
  meta: TriageOutput["meta"],
): TriageOutput {
  return { ...model, meta } as TriageOutput;
}

// ── Demo outreach ────────────────────────────────────────────────────────────

const OUTREACH_TEMPLATES: Record<Language, (r: OutreachRequest) => { subject: string | null; body: string }> = {
  en: (r) => ({
    subject: r.format === "email" ? "AidBridge AI — Update on your request" : null,
    body: outreachBodyEn(r),
  }),
  es: (r) => ({
    subject: r.format === "email" ? "AidBridge AI — Actualización de su solicitud" : null,
    body: `Hola, le escribimos de parte de nuestro equipo comunitario sobre su solicitud. Estamos coordinando ayuda y un voluntario se comunicará pronto. Esto no reemplaza los servicios de emergencia. Gracias.`,
  }),
  hi: (r) => ({
    subject: r.format === "email" ? "AidBridge AI — आपके अनुरोध पर अपडेट" : null,
    body: `नमस्ते, हम आपके अनुरोध के संबंध में अपनी सामुदायिक टीम की ओर से लिख रहे हैं। हम सहायता का समन्वय कर रहे हैं और एक स्वयंसेवक जल्द ही संपर्क करेगा। यह आपातकालीन सेवाओं का विकल्प नहीं है। धन्यवाद।`,
  }),
  ur: (r) => ({
    subject: r.format === "email" ? "AidBridge AI — آپ کی درخواست پر اپ ڈیٹ" : null,
    body: `السلام علیکم، ہم آپ کی درخواست کے حوالے سے اپنی کمیونٹی ٹیم کی جانب سے لکھ رہے ہیں۔ ہم مدد کا انتظام کر رہے ہیں اور ایک رضاکار جلد رابطہ کرے گا۔ یہ ہنگامی خدمات کا متبادل نہیں ہے۔ شکریہ۔`,
  }),
};

function outreachBodyEn(r: OutreachRequest): string {
  const ctx = r.context?.trim() ? ` Regarding: ${r.context.trim()}.` : "";
  switch (r.audience) {
    case "volunteer":
      return `Hi! You've been matched to a community aid task.${ctx} Please confirm availability and review the case details in AidBridge. Follow the safety checklist and contact your coordinator with any concerns. Thank you for volunteering!`;
    case "donor":
      return `Thank you for supporting our community response.${ctx} Your contribution is helping us match neighbors with food, shelter, and essential resources. We'll share impact updates soon.`;
    case "partner":
      return `Hello, we're coordinating community aid and would like to partner on an active need.${ctx} Could you confirm current availability and eligibility requirements? We keep a human in the loop on every referral.`;
    case "leadership":
      return `Operations update:${ctx} Active cases are being triaged and matched. High-urgency and safety-flagged cases are routed to human review. Full metrics are in the Command Center.`;
    case "community_group":
      return `Hello neighbors — we're organizing community support this week.${ctx} If you or someone you know needs help, you can submit a request and our team will follow up. This does not replace emergency services (call 911 for emergencies).`;
    default:
      return `Hello, we received your request and our team is coordinating help.${ctx} A volunteer or partner will reach out soon. Please note this service does not replace emergency services — call 911 in an emergency. Thank you.`;
  }
}

export function demoOutreach(r: OutreachRequest): { subject: string | null; body: string } {
  const tmpl = OUTREACH_TEMPLATES[r.language] ?? OUTREACH_TEMPLATES.en;
  let out = tmpl(r);
  // Tone/format shaping for SMS/WhatsApp: trim length.
  if (r.format === "sms" || r.format === "whatsapp") {
    out = { subject: null, body: out.body.slice(0, 300) };
  }
  if (r.tone === "urgent") {
    out = { ...out, body: `[Time-sensitive] ${out.body}` };
  }
  return out;
}
