import { z } from "zod";
import { confidenceSchema, languageSchema } from "./common";

/** Output of the Outreach Generator. */
export const outreachSchema = z.object({
  audience: z.enum([
    "requester",
    "volunteer",
    "donor",
    "partner",
    "leadership",
    "community_group",
  ]),
  channel: z.enum(["sms", "email", "whatsapp", "announcement"]),
  tone: z.enum(["warm", "professional", "urgent", "concise", "community", "formal"]),
  language: languageSchema,
  subject: z.string().nullable(),
  message: z.string().min(1),
  safety_notes: z.array(z.string()).default([]),
  confidence_score: confidenceSchema,
});
export type OutreachResult = z.infer<typeof outreachSchema>;

export const OUTREACH_SCHEMA_ID = "outreach_v1";
