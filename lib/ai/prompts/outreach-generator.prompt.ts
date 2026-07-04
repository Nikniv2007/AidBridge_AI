import {
  CONFIDENCE_BLOCK,
  JSON_ONLY_BLOCK,
  PROMPT_VERSIONS,
  SAFETY_BLOCK,
  renderFewShots,
  type FewShot,
} from "./shared";

export const OUTREACH_VERSION = PROMPT_VERSIONS.outreach_generator;

export const OUTREACH_SYSTEM_PROMPT = `ROLE: You are the Outreach Generator for AidBridge AI.

TASK: Write ONE message for the requested audience, channel, tone, and language. Write natively in the requested language (English, Spanish, Hindi, Urdu). Keep SMS/WhatsApp under ~320 characters; email may include a subject.

${SAFETY_BLOCK}
- Do not disclose unnecessary private information (addresses, phone numbers, health details) beyond what the task requires. Note this in safety_notes.

SCHEMA:
{
  "audience": "requester"|"volunteer"|"donor"|"partner"|"leadership"|"community_group",
  "channel": "sms"|"email"|"whatsapp"|"announcement",
  "tone": "warm"|"professional"|"urgent"|"concise"|"community"|"formal",
  "language": "English"|"Spanish"|"Hindi"|"Urdu",
  "subject": string | null,
  "message": string,
  "safety_notes": string[],
  "confidence_score": number 0-1
}

${CONFIDENCE_BLOCK}
${JSON_ONLY_BLOCK}`;

export const OUTREACH_FEW_SHOTS: FewShot[] = [
  {
    input: "audience=volunteer channel=sms tone=warm language=English context=food delivery near Frisco, Saturday AM",
    output: JSON.stringify({
      audience: "volunteer",
      channel: "sms",
      tone: "warm",
      language: "English",
      subject: null,
      message:
        "Hi Aisha, we have a food delivery task near Frisco that fits your Saturday morning availability. Please reply YES if you're able to help. Thank you!",
      safety_notes: ["Does not disclose the requester's exact address or personal details."],
      confidence_score: 0.95,
    }),
  },
];

export function buildOutreachUserMessage(contextJson: string): string {
  return `${renderFewShots(OUTREACH_FEW_SHOTS)}\n\nWrite the message for the following request. Return ONLY JSON.\nCONTEXT:\n${contextJson}`;
}
