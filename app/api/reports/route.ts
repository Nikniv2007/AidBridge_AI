import { NextResponse } from "next/server";
import { z } from "zod";
import { writeReport } from "@/lib/ai/reportWriter";
import { operationalStats } from "@/lib/data/dbMetrics";
import { organization } from "@/lib/data/db";

export const runtime = "nodejs";

const bodySchema = z.object({
  type: z.enum([
    "operations",
    "impact_summary",
    "donor_report",
    "leadership_brief",
    "resource_shortage",
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

  const stats = operationalStats();
  const { data, meta } = await writeReport({
    reportType: parsed.data.type,
    periodLabel: "Today",
    orgName: organization.name,
    stats,
  });

  return NextResponse.json({ report: data, meta });
}
