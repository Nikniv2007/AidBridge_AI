import { z } from "zod";
import { confidenceSchema } from "./common";

export const reportTypeSchema = z.enum([
  "operations",
  "impact_summary",
  "donor_report",
  "leadership_brief",
  "resource_shortage",
]);
export type ReportType = z.infer<typeof reportTypeSchema>;

/** Output of the Report Writer. `content` is Markdown; metrics stay structured. */
export const reportSchema = z.object({
  report_type: reportTypeSchema,
  title: z.string().min(1),
  content: z.string().min(1),
  highlights: z.array(z.string()).default([]),
  metrics: z.record(z.union([z.number(), z.string()])).default({}),
  confidence_score: confidenceSchema,
});
export type ReportResult = z.infer<typeof reportSchema>;

export const REPORT_SCHEMA_ID = "report_v1";
