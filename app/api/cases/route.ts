import { NextResponse } from "next/server";
import { z } from "zod";
import { cases } from "@/lib/data/mock";
import { runTriage } from "@/lib/ai/provider";
import { safetyForcesHumanReview } from "@/lib/safety";
import type { Case } from "@/lib/types";
import { nextId } from "@/lib/utils/id";

export const runtime = "nodejs";

const intakeSchema = z.object({
  requesterName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  description: z.string().min(3),
  peopleAffected: z.coerce.number().int().min(1).default(1),
  preferredLanguage: z.enum(["en", "es", "hi", "ur"]).default("en"),
  notes: z.string().optional(),
});

/** GET /api/cases — list current cases (mock store). */
export async function GET() {
  return NextResponse.json({ cases, total: cases.length });
}

/** POST /api/cases — create a case, triage it, and return the structured case. */
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = intakeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") },
      { status: 422 },
    );
  }

  const intake = parsed.data;
  const triage = await runTriage({
    description: intake.description,
    peopleAffected: intake.peopleAffected,
    preferredLanguage: intake.preferredLanguage,
  });

  const forced =
    triage.humanReviewRequired || safetyForcesHumanReview(triage.safetyFlags);
  const now = new Date().toISOString();
  const id = nextId("CASE");

  const newCase: Case = {
    id,
    createdAt: now,
    updatedAt: now,
    intake: { ...intake, email: intake.email || undefined },
    triage,
    status: forced ? "needs_human_review" : "ai_triaged",
    assignedVolunteerId: null,
    matchedResourceId: null,
    timeline: [
      {
        id: `${id}-t1`,
        at: now,
        actor: "system",
        type: "created",
        message: "Case created from community intake form.",
      },
      {
        id: `${id}-t2`,
        at: now,
        actor: "AI Triage",
        type: "triaged",
        message: `Classified as ${triage.category} · urgency ${triage.urgency} (${triage.urgencyScore}).`,
      },
    ],
    notes: [],
  };

  // NOTE: in-memory only for the demo. Persisted via Supabase once wired.
  cases.unshift(newCase);

  return NextResponse.json(newCase, { status: 201 });
}
