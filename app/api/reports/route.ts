import { NextResponse } from "next/server";
import { z } from "zod";
import { runReport } from "@/lib/ai/provider";
import { commandCenterStats } from "@/lib/data/metrics";
import type { ReportType } from "@/lib/types";

export const runtime = "nodejs";

const REPORT_TITLES: Record<ReportType, string> = {
  daily_ops: "Daily Operations Report",
  weekly_impact: "Weekly Impact Report",
  resource_shortage: "Resource Shortage Report",
  volunteer_performance: "Volunteer Performance Report",
  cases_by_category: "Cases by Category Report",
  donor_summary: "Donor-Friendly Impact Summary",
};

const bodySchema = z.object({
  type: z.enum([
    "daily_ops",
    "weekly_impact",
    "resource_shortage",
    "volunteer_performance",
    "cases_by_category",
    "donor_summary",
  ]),
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
    return NextResponse.json({ error: "Invalid report type." }, { status: 422 });
  }

  const stats = commandCenterStats();
  const report = await runReport(
    parsed.data.type,
    REPORT_TITLES[parsed.data.type],
    "Today",
    stats as unknown as Record<string, unknown>,
  );
  return NextResponse.json(report);
}
