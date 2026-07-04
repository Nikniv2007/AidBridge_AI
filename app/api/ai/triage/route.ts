import { NextResponse } from "next/server";
import { z } from "zod";
import { runTriage } from "@/lib/ai/provider";

export const runtime = "nodejs";

const bodySchema = z.object({
  description: z.string().min(3, "Please describe the request."),
  peopleAffected: z.number().int().min(1).default(1),
  preferredLanguage: z.enum(["en", "es", "hi", "ur"]).optional(),
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

  try {
    const triage = await runTriage(parsed.data);
    return NextResponse.json(triage);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Triage failed." },
      { status: 500 },
    );
  }
}
