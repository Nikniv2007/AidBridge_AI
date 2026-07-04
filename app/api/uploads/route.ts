import { NextResponse } from "next/server";
import { z } from "zod";
import { parseCsv, detectDataset } from "@/lib/automation/csv";

export const runtime = "nodejs";

const bodySchema = z.object({
  filename: z.string().default("upload.csv"),
  content: z.string().min(1, "CSV content is empty."),
});

/**
 * POST /api/uploads — parse pasted/uploaded CSV content and return a preview +
 * inferred dataset type (volunteers, resources, cases). Storage to Supabase is
 * a documented TODO.
 */
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 422 },
    );
  }

  try {
    const { headers, rows, errors } = parseCsv(parsed.data.content);
    const datasetType = detectDataset(headers);
    return NextResponse.json({
      filename: parsed.data.filename,
      datasetType,
      headers,
      rowCount: rows.length,
      preview: rows.slice(0, 10),
      errors,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to parse CSV." },
      { status: 422 },
    );
  }
}
