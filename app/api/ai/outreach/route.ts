import { NextResponse } from "next/server";
import { z } from "zod";
import { generateOutreach } from "@/lib/ai/outreachGenerator";

export const runtime = "nodejs";

const bodySchema = z.object({
  audience: z.enum(["requester", "volunteer", "donor", "partner", "leadership", "community_group"]),
  channel: z.enum(["sms", "email", "whatsapp", "announcement"]),
  tone: z.enum(["warm", "professional", "urgent", "concise", "community", "formal"]),
  language: z.enum(["English", "Spanish", "Hindi", "Urdu"]),
  context: z.string().default(""),
  recipientFirstName: z.string().optional(),
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

  const { data, meta } = await generateOutreach(parsed.data);
  return NextResponse.json({ ...data, meta });
}
