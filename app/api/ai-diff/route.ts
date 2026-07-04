import { NextResponse } from "next/server";
import { z } from "zod";
import { classifyIntake } from "@/lib/ai/intakeClassifier";
import { INTAKE_VERSION } from "@/lib/ai/prompts/intake-classifier.prompt";
import { intakeClassificationSchema, type IntakeClassification } from "@/lib/ai/schemas/intake.schema";
import { diffOutputs } from "@/lib/ai/diff";

export const runtime = "nodejs";

const bodySchema = z.object({ text: z.string().min(3) });

/**
 * Simulate a prompt-version upgrade: the current classifier is the "new" (v2)
 * output; a mutated copy stands in for an older "v1" prompt that under-flagged
 * safety. The diff makes the change reviewable before shipping.
 */
function simulateV1(newOut: IntakeClassification): IntakeClassification {
  const downgradeUrgency: Record<string, IntakeClassification["urgency_level"]> = {
    critical: "high",
    high: "medium",
    medium: "medium",
    low: "low",
  };
  return {
    ...newOut,
    urgency_level: downgradeUrgency[newOut.urgency_level],
    urgency_score: Math.max(0, newOut.urgency_score - 12),
    // Older prompt was less conservative about routing to a human.
    human_review_required: false,
    safety_flags: newOut.safety_flags.filter((f) => f !== "same_day_need" && f !== "vulnerable_person"),
    vulnerable_population_flags: [],
    missing_fields: [],
  };
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide request text." }, { status: 422 });
  }

  const { data: newOut } = await classifyIntake({ requestText: parsed.data.text, peopleAffected: 1 });
  const oldOut = simulateV1(newOut);

  const diff = diffOutputs(
    oldOut as unknown as Record<string, unknown>,
    newOut as unknown as Record<string, unknown>,
    {
      oldPromptVersion: "intake-v1.0.0",
      newPromptVersion: INTAKE_VERSION,
      schema: intakeClassificationSchema,
    },
  );

  return NextResponse.json({ old: oldOut, new: newOut, diff });
}
