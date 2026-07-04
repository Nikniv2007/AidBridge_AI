import { OUTREACH_SCHEMA_ID } from "@/lib/ai/schemas/outreach.schema";
import { OUTREACH_VERSION } from "@/lib/ai/prompts/outreach-generator.prompt";
import { baseContext, type OrganizationRules, type UserRole } from "./types";

export interface OutreachContextInput {
  audience: string;
  channel: string;
  tone: string;
  language: string;
  context: string;
  caseSummary?: {
    case_type: string;
    city: string;
    recipient_first_name?: string;
  };
  orgRules?: OrganizationRules;
  userRole?: UserRole;
}

export function buildOutreachContext(input: OutreachContextInput) {
  return {
    ...baseContext({
      orgRules: input.orgRules,
      userRole: input.userRole,
      outputSchema: OUTREACH_SCHEMA_ID,
      promptVersion: OUTREACH_VERSION,
    }),
    request: {
      audience: input.audience,
      channel: input.channel,
      tone: input.tone,
      language: input.language,
      context: input.context,
    },
    case: input.caseSummary ?? null,
  };
}
