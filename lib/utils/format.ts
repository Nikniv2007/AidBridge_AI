import type {
  CaseCategory,
  CaseStatus,
  ResourceType,
  Urgency,
} from "@/lib/types";

/** Turn a snake_case / kebab enum into Title Case label. */
export function humanize(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export const CATEGORY_LABELS: Record<CaseCategory, string> = {
  food: "Food",
  shelter: "Shelter",
  transportation: "Transportation",
  medical_supplies: "Medical Supplies",
  hygiene: "Hygiene",
  school_supplies: "School Supplies",
  clothing: "Clothing",
  utilities: "Utilities",
  financial_hardship: "Financial Hardship",
  other: "Other",
};

export const STATUS_LABELS: Record<CaseStatus, string> = {
  new: "New",
  ai_triaged: "AI Triaged",
  needs_human_review: "Needs Human Review",
  matched: "Matched",
  volunteer_assigned: "Volunteer Assigned",
  contacted: "Contacted",
  in_progress: "In Progress",
  completed: "Completed",
  unable_to_fulfill: "Unable to Fulfill",
  escalated: "Escalated",
  closed: "Closed",
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  food_pantry: "Food Pantry",
  shelter: "Shelter",
  transportation: "Transportation",
  hygiene_kits: "Hygiene Kits",
  school_supplies: "School Supplies",
  clothing: "Clothing",
  medical_supplies: "Medical Supplies",
  donation_pickup: "Donation Pickup",
  partner_org: "Partner Organization",
};

export const URGENCY_ORDER: Record<Urgency, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
};
