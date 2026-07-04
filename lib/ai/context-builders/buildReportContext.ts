import { REPORT_SCHEMA_ID } from "@/lib/ai/schemas/report.schema";
import { REPORT_VERSION } from "@/lib/ai/prompts/report-writer.prompt";
import { baseContext, type OrganizationRules, type UserRole } from "./types";

export interface ReportContextInput {
  reportType: string;
  periodLabel: string;
  stats: Record<string, number | string>;
  orgName: string;
  orgRules?: OrganizationRules;
  userRole?: UserRole;
}

export function buildReportContext(input: ReportContextInput) {
  return {
    ...baseContext({
      orgRules: input.orgRules,
      userRole: input.userRole,
      outputSchema: REPORT_SCHEMA_ID,
      promptVersion: REPORT_VERSION,
    }),
    report_request: {
      report_type: input.reportType,
      period: input.periodLabel,
      organization: input.orgName,
    },
    stats: input.stats,
  };
}
