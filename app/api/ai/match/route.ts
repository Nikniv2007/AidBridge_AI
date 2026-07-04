import { NextResponse } from "next/server";
import { z } from "zod";
import { matchResources } from "@/lib/ai/resourceMatcher";
import { cases, resources } from "@/lib/data/db";
import type { ScoreableResource } from "@/lib/matching/calculateResourceMatchScore";

export const runtime = "nodejs";

const bodySchema = z.object({ case_id: z.string() });

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

  const scoreable: ScoreableResource[] = resources.map((r) => ({
    id: r.id,
    name: r.name,
    resource_type: r.resource_type,
    zip: r.zip,
    available_quantity: r.available_quantity,
    delivery_available: r.delivery_available,
    active: r.active,
    eligibility_rules: r.eligibility_rules,
  }));

  const needsDelivery = /deliver|homebound|cannot drive|can't drive/i.test(c.original_request);

  const { data, meta, validation } = await matchResources({
    caseSummary: {
      case_type: c.case_type,
      urgency_level: c.urgency_level,
      urgency_score: c.urgency_score,
      city: c.city,
      zip: c.zip,
      resources_needed: [],
      people_affected: c.people_affected,
      needs_delivery: needsDelivery,
    },
    resources: scoreable,
  });

  return NextResponse.json({ result: data, meta, validation });
}
