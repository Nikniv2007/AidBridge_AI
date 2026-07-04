import { NextResponse } from "next/server";
import { getAiOutputs, providerUsageCounts } from "@/lib/data/aiLog";

export const runtime = "nodejs";

/** GET /api/ai-outputs — recent AI output log + provider usage counts. */
export async function GET() {
  return NextResponse.json({
    outputs: getAiOutputs().slice(0, 50),
    usage: providerUsageCounts(),
  });
}
