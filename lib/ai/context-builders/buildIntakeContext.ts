import { INTAKE_SCHEMA_ID } from "@/lib/ai/schemas/intake.schema";
import { INTAKE_VERSION } from "@/lib/ai/prompts/intake-classifier.prompt";
import {
  baseContext,
  type OrganizationRules,
  type UserRole,
} from "./types";

export interface IntakeContextInput {
  requestText: string;
  requester?: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
    zip?: string;
    preferredLanguage?: string;
    peopleAffected?: number;
  };
  priorNotes?: string[];
  documentSummaries?: string[];
  orgRules?: OrganizationRules;
  userRole?: UserRole;
}

export function buildIntakeContext(input: IntakeContextInput) {
  return {
    ...baseContext({
      orgRules: input.orgRules,
      userRole: input.userRole,
      outputSchema: INTAKE_SCHEMA_ID,
      promptVersion: INTAKE_VERSION,
    }),
    request: {
      text: input.requestText,
      requester_metadata: input.requester ?? {},
    },
    prior_case_notes: (input.priorNotes ?? []).slice(0, 5),
    document_summaries: (input.documentSummaries ?? []).slice(0, 3),
  };
}
