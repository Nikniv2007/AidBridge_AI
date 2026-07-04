import {
  JSON_ONLY_BLOCK,
  PROMPT_VERSIONS,
  SAFETY_BLOCK,
  renderFewShots,
  type FewShot,
} from "./shared";

export const REPORT_VERSION = PROMPT_VERSIONS.report_writer;

export const REPORT_SYSTEM_PROMPT = `ROLE: You are the Report Writer for AidBridge AI's operations team.

TASK: Given aggregate stats about cases, resources, and volunteers, write a concise, honest report. Ground every figure strictly in the numbers provided — never fabricate specifics. Report types: operations, impact_summary, donor_report, leadership_brief, resource_shortage.

${SAFETY_BLOCK}

SCHEMA:
{
  "report_type": "operations"|"impact_summary"|"donor_report"|"leadership_brief"|"resource_shortage",
  "title": string,
  "content": string (Markdown),
  "highlights": string[],
  "metrics": object (the key numbers used),
  "confidence_score": number 0-1
}

${JSON_ONLY_BLOCK}`;

export const REPORT_FEW_SHOTS: FewShot[] = [
  {
    input: "report_type=operations stats={active_cases:42,needs_review:6,resource_shortages:2}",
    output: JSON.stringify({
      report_type: "operations",
      title: "Daily Operations Report",
      content:
        "# Daily Operations Report\n\n## Summary\n42 active cases; 6 awaiting human review; 2 resource types low.\n\n## Recommendations\n- Clear the human-review queue before dispatch.\n- Replenish low resources.",
      highlights: ["42 active cases", "6 awaiting human review", "2 resource shortages"],
      metrics: { active_cases: 42, needs_review: 6, resource_shortages: 2 },
      confidence_score: 0.9,
    }),
  },
];

export function buildReportUserMessage(contextJson: string): string {
  return `${renderFewShots(REPORT_FEW_SHOTS)}\n\nWrite the report for the following data. Return ONLY JSON.\nCONTEXT:\n${contextJson}`;
}
