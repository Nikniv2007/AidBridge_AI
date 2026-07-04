import { NextResponse } from "next/server";
import { runEvalSuiteV2 } from "@/lib/ai/evalRunner";
import { computeEvalMetrics } from "@/lib/ai/evalMetrics";
import { REGRESSION_SUITE } from "@/evals/regression-suite.eval";

export const runtime = "nodejs";

/** POST /api/evals — run the full regression suite and compute headline metrics. */
export async function POST() {
  const outcome = await runEvalSuiteV2(REGRESSION_SUITE);
  const metrics = computeEvalMetrics(outcome.results);
  return NextResponse.json({ ...outcome, metrics });
}

/** GET /api/evals — list the eval fixtures without running them. */
export async function GET() {
  return NextResponse.json({ evals: REGRESSION_SUITE, total: REGRESSION_SUITE.length });
}
