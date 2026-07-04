import { NextResponse } from "next/server";
import { runEvalSuite } from "@/lib/ai/evals";
import { evalCases } from "@/lib/data/mock";

export const runtime = "nodejs";

/** POST /api/evals — run the full eval suite against the current AI path. */
export async function POST() {
  const outcome = await runEvalSuite(evalCases);
  return NextResponse.json(outcome);
}

/** GET /api/evals — list the eval cases without running them. */
export async function GET() {
  return NextResponse.json({ evals: evalCases, total: evalCases.length });
}
