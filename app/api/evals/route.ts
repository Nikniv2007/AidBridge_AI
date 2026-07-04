import { NextResponse } from "next/server";
import { runEvalSuiteV2 } from "@/lib/ai/evalRunner";
import { evalDefs } from "@/lib/data/db";

export const runtime = "nodejs";

/** POST /api/evals — run the Part 2 eval suite against the current AI path. */
export async function POST() {
  const outcome = await runEvalSuiteV2(evalDefs);
  return NextResponse.json(outcome);
}

/** GET /api/evals — list the eval definitions without running them. */
export async function GET() {
  return NextResponse.json({ evals: evalDefs, total: evalDefs.length });
}
