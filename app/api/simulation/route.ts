import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSimulation, SCENARIOS } from "@/lib/simulation/scenarios";

export const runtime = "nodejs";

const bodySchema = z.object({
  scenario: z.string(),
  count: z.coerce.number().int().min(10).max(25).default(12),
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
    return NextResponse.json({ error: "Invalid simulation request." }, { status: 422 });
  }
  if (!SCENARIOS.some((s) => s.id === parsed.data.scenario)) {
    return NextResponse.json({ error: "Unknown scenario." }, { status: 404 });
  }

  const result = generateSimulation(parsed.data.scenario, parsed.data.count, Date.now());
  return NextResponse.json(result);
}
