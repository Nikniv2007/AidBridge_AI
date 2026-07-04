import { NextResponse } from "next/server";
import { z } from "zod";
import { classifyIntake } from "@/lib/ai/intakeClassifier";

export const runtime = "nodejs";

const bodySchema = z.object({
  requestText: z.string().min(3, "Please describe the request."),
  peopleAffected: z.coerce.number().int().min(1).default(1),
  requester: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      preferredLanguage: z.string().optional(),
      peopleAffected: z.number().optional(),
    })
    .optional(),
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

  const { data, meta, validation } = await classifyIntake({
    requestText: parsed.data.requestText,
    peopleAffected: parsed.data.peopleAffected,
    requester: parsed.data.requester,
  });

  return NextResponse.json({ classification: data, meta, validation });
}
