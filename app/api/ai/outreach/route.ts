import { NextResponse } from "next/server";
import { z } from "zod";
import { runOutreach } from "@/lib/ai/provider";

export const runtime = "nodejs";

const bodySchema = z.object({
  audience: z.enum([
    "requester",
    "volunteer",
    "donor",
    "partner",
    "leadership",
    "community_group",
  ]),
  format: z.enum([
    "sms",
    "email",
    "whatsapp",
    "announcement",
    "volunteer_instructions",
    "donor_update",
    "partner_request",
  ]),
  tone: z.enum(["warm", "professional", "urgent", "concise", "community", "formal"]),
  language: z.enum(["en", "es", "hi", "ur"]),
  caseId: z.string().optional(),
  context: z.string().default(""),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 422 },
    );
  }

  const out = await runOutreach(parsed.data);
  return NextResponse.json(out);
}
