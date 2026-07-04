import { NextResponse } from "next/server";
import { resources } from "@/lib/data/mock";

export const runtime = "nodejs";

/** GET /api/resources — list resources (mock store). */
export async function GET() {
  return NextResponse.json({ resources, total: resources.length });
}
