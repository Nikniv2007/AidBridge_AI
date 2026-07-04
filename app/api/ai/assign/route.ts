import { NextResponse } from "next/server";
import { z } from "zod";
import { assignVolunteer } from "@/lib/ai/volunteerAssignment";
import { cases, volunteers } from "@/lib/data/db";
import type { ScoreableVolunteer } from "@/lib/matching/calculateVolunteerAssignmentScore";

export const runtime = "nodejs";

const bodySchema = z.object({ case_id: z.string() });

const CRITICAL_FLAGS = ["immediate_danger", "emergency_services_needed", "violence_or_self_harm"];
const LANG_TO_ISO: Record<string, string> = { English: "en", Spanish: "es", Hindi: "hi", Urdu: "ur" };

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "case_id is required." }, { status: 422 });
  }

  const c = cases.find((x) => x.id === parsed.data.case_id);
  if (!c) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  const scoreable: ScoreableVolunteer[] = volunteers.map((v) => ({
    id: v.id,
    name: v.name,
    zip: v.zip,
    skills: v.skills,
    languages: v.languages,
    has_vehicle: v.has_vehicle,
    availability: v.availability,
    max_tasks_per_day: v.max_tasks_per_day,
    active_assignments: v.active_assignments,
    reliability_score: v.reliability_score,
    active: v.active,
  }));

  const needsVehicle = /deliver|drive|ride|pickup|transport/i.test(c.original_request);
  const isCritical = c.safety_flags.some((f) => CRITICAL_FLAGS.includes(f));

  const { data, meta, validation } = await assignVolunteer({
    caseSummary: {
      case_type: c.case_type,
      urgency_level: c.urgency_level,
      city: c.city,
      zip: c.zip,
      language: LANG_TO_ISO[c.preferred_language] ?? "en",
      is_safety_critical: isCritical,
    },
    taskType: c.case_type,
    taskDescription: c.original_request.slice(0, 160),
    requiredSkills: needsVehicle ? ["driving", "delivery"] : [],
    needsVehicle,
    volunteers: scoreable,
  });

  return NextResponse.json({ result: data, meta, validation });
}
