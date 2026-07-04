/**
 * AidBridge AI — Core domain types.
 *
 * These are the single source of truth for the shape of data flowing through
 * intake → AI triage → matching → assignment → outreach → reporting → evals.
 * The Supabase schema in `supabase/schema.sql` mirrors these types.
 */

// ── Enums / unions ───────────────────────────────────────────────────────────

export type CaseCategory =
  | "food"
  | "shelter"
  | "transportation"
  | "medical_supplies"
  | "hygiene"
  | "school_supplies"
  | "clothing"
  | "utilities"
  | "financial_hardship"
  | "other";

export const CASE_CATEGORIES: CaseCategory[] = [
  "food",
  "shelter",
  "transportation",
  "medical_supplies",
  "hygiene",
  "school_supplies",
  "clothing",
  "utilities",
  "financial_hardship",
  "other",
];

export type Urgency = "critical" | "high" | "moderate" | "low";

export const URGENCIES: Urgency[] = ["critical", "high", "moderate", "low"];

export type CaseStatus =
  | "new"
  | "ai_triaged"
  | "needs_human_review"
  | "matched"
  | "volunteer_assigned"
  | "contacted"
  | "in_progress"
  | "completed"
  | "unable_to_fulfill"
  | "escalated"
  | "closed";

export const CASE_STATUSES: CaseStatus[] = [
  "new",
  "ai_triaged",
  "needs_human_review",
  "matched",
  "volunteer_assigned",
  "contacted",
  "in_progress",
  "completed",
  "unable_to_fulfill",
  "escalated",
  "closed",
];

export type ResourceType =
  | "food_pantry"
  | "shelter"
  | "transportation"
  | "hygiene_kits"
  | "school_supplies"
  | "clothing"
  | "medical_supplies"
  | "donation_pickup"
  | "partner_org";

export type Language = "en" | "es" | "hi" | "ur";

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
];

// ── Safety flags ─────────────────────────────────────────────────────────────

export type SafetyFlagCode =
  | "medical_emergency"
  | "mental_health_crisis"
  | "domestic_violence"
  | "minor_unaccompanied"
  | "immediate_danger"
  | "legal_matter"
  | "financial_advice_requested"
  | "sensitive_personal_data";

export interface SafetyFlag {
  code: SafetyFlagCode;
  severity: "info" | "warning" | "critical";
  message: string;
  recommendedAction: string;
}

// ── AI structured triage output ──────────────────────────────────────────────

/**
 * The canonical structured output the model MUST return for a triage request.
 * Validated with Zod (`lib/ai/schema.ts`) before we ever trust it.
 */
export interface TriageOutput {
  summary: string;
  category: CaseCategory;
  secondaryCategories: CaseCategory[];
  urgency: Urgency;
  /** 0–100 numeric urgency score used for sorting and thresholds. */
  urgencyScore: number;
  neededResources: ResourceType[];
  peopleAffected: number;
  safetyFlags: SafetyFlag[];
  humanReviewRequired: boolean;
  humanReviewReason: string | null;
  /** 0–1 model self-reported confidence. */
  confidence: number;
  suggestedNextSteps: string[];
  detectedLanguage: Language;
  /** Model + prompt provenance for auditability. */
  meta: AiRunMeta;
}

export interface AiRunMeta {
  provider: "live" | "demo";
  model: string;
  promptVersion: string;
  demoMode: boolean;
  latencyMs: number;
  tokensIn?: number;
  tokensOut?: number;
}

// ── Cases ────────────────────────────────────────────────────────────────────

export interface IntakeInput {
  requesterName: string;
  phone?: string;
  email?: string;
  city: string;
  state: string;
  zip: string;
  description: string;
  peopleAffected: number;
  preferredLanguage: Language;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  at: string; // ISO
  actor: string; // "AI Triage" | "system" | volunteer/user name
  type:
    | "created"
    | "triaged"
    | "review"
    | "matched"
    | "assigned"
    | "contacted"
    | "status_change"
    | "note"
    | "outreach";
  message: string;
}

export interface CaseNote {
  id: string;
  at: string;
  author: string;
  body: string;
}

export interface Case {
  id: string;
  createdAt: string;
  updatedAt: string;
  intake: IntakeInput;
  triage: TriageOutput | null;
  status: CaseStatus;
  assignedVolunteerId: string | null;
  matchedResourceId: string | null;
  timeline: TimelineEvent[];
  notes: CaseNote[];
}

// ── Resources ────────────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  city: string;
  state: string;
  zip: string;
  quantityAvailable: number;
  deliveryAvailable: boolean;
  hours: string;
  eligibilityRules: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes?: string;
}

// ── Volunteers ───────────────────────────────────────────────────────────────

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zip: string;
  skills: string[];
  languages: Language[];
  vehicleAccess: boolean;
  availability: string[]; // e.g. ["mon_am", "wed_pm"]
  maxTasksPerDay: number;
  reliabilityScore: number; // 0–100
  backgroundCheck: "pending" | "cleared" | "not_started";
  completedTasks: number;
  activeAssignments: number;
}

// ── Matching / assignment recommendations ────────────────────────────────────

export interface ResourceMatch {
  resourceId: string;
  score: number; // 0–100
  reasons: string[];
  distanceMiApprox: number;
  eligibilityFit: "fit" | "unknown" | "mismatch";
  humanReviewRecommended: boolean;
}

export interface VolunteerMatch {
  volunteerId: string;
  score: number; // 0–100
  reasons: string[];
  concerns: string[];
}

// ── Outreach ─────────────────────────────────────────────────────────────────

export type OutreachAudience =
  | "requester"
  | "volunteer"
  | "donor"
  | "partner"
  | "leadership"
  | "community_group";

export type OutreachFormat =
  | "sms"
  | "email"
  | "whatsapp"
  | "announcement"
  | "volunteer_instructions"
  | "donor_update"
  | "partner_request";

export type OutreachTone =
  | "warm"
  | "professional"
  | "urgent"
  | "concise"
  | "community"
  | "formal";

export interface OutreachRequest {
  audience: OutreachAudience;
  format: OutreachFormat;
  tone: OutreachTone;
  language: Language;
  caseId?: string;
  context: string;
}

export interface OutreachOutput {
  subject: string | null;
  body: string;
  language: Language;
  wordCount: number;
  meta: AiRunMeta;
}

// ── Automations ──────────────────────────────────────────────────────────────

export type AutomationName =
  | "csv_import"
  | "duplicate_detection"
  | "ai_triage"
  | "report_generation"
  | "inventory_low_stock"
  | "volunteer_reminders"
  | "eval_suite";

export interface AutomationRun {
  id: string;
  name: AutomationName;
  status: "running" | "success" | "failed" | "partial";
  startedAt: string;
  completedAt: string | null;
  recordsProcessed: number;
  errors: number;
  summary: string;
}

// ── Reports ──────────────────────────────────────────────────────────────────

export type ReportType =
  | "daily_ops"
  | "weekly_impact"
  | "resource_shortage"
  | "volunteer_performance"
  | "cases_by_category"
  | "donor_summary";

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: string;
  periodLabel: string;
  markdown: string;
  highlights: string[];
  meta: AiRunMeta;
}

// ── AI Evaluations ───────────────────────────────────────────────────────────

export type EvalCategory =
  | "json_validity"
  | "schema_compliance"
  | "classification_accuracy"
  | "urgency_accuracy"
  | "safety_compliance"
  | "hallucination_prevention"
  | "human_review_routing"
  | "outreach_tone";

export interface EvalCase {
  id: string;
  category: EvalCategory;
  name: string;
  input: string;
  expected: Record<string, unknown>;
}

export interface EvalResult {
  id: string;
  evalId: string;
  category: EvalCategory;
  name: string;
  input: string;
  expected: Record<string, unknown>;
  actual: Record<string, unknown>;
  pass: boolean;
  score: number; // 0–1
  failureReason: string | null;
  timestamp: string;
}

// ── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  organizationName: string;
  demoMode: boolean;
  aiProvider: "live" | "demo";
  safetyRulesEnabled: boolean;
  humanReviewUrgencyThreshold: number; // 0–100
  humanReviewConfidenceThreshold: number; // 0–1
  maxVolunteerTasksPerDay: number;
  resourceShortageThreshold: number;
  promptVersion: string;
}
