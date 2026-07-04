import { NextResponse } from "next/server";
import { volunteers } from "@/lib/data/mock";

export const runtime = "nodejs";

/** GET /api/volunteers — list volunteers (mock store). */
export async function GET() {
  return NextResponse.json({ volunteers, total: volunteers.length });
}
