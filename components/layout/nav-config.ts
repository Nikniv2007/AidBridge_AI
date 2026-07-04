import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Inbox,
  ListChecks,
  FolderKanban,
  Boxes,
  Combine,
  Users,
  UserPlus,
  MessageSquare,
  FileUp,
  Workflow,
  FileBarChart,
  FlaskConical,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "Operations" | "People" | "Tooling";
}

export const DASHBOARD_NAV: NavItem[] = [
  { href: "/dashboard/command-center", label: "Command Center", icon: LayoutDashboard, group: "Operations" },
  { href: "/dashboard/intake", label: "Case Intake", icon: Inbox, group: "Operations" },
  { href: "/dashboard/triage", label: "AI Triage Queue", icon: ListChecks, group: "Operations" },
  { href: "/dashboard/cases", label: "Cases", icon: FolderKanban, group: "Operations" },
  { href: "/dashboard/resources", label: "Resource Directory", icon: Boxes, group: "Operations" },
  { href: "/dashboard/matching", label: "Resource Matching", icon: Combine, group: "Operations" },
  { href: "/dashboard/volunteers", label: "Volunteers", icon: Users, group: "People" },
  { href: "/dashboard/assignments", label: "Volunteer Assignment", icon: UserPlus, group: "People" },
  { href: "/dashboard/outreach", label: "Outreach Center", icon: MessageSquare, group: "People" },
  { href: "/dashboard/documents", label: "Document Uploads", icon: FileUp, group: "Tooling" },
  { href: "/dashboard/automations", label: "Automation Logs", icon: Workflow, group: "Tooling" },
  { href: "/dashboard/reports", label: "Reports", icon: FileBarChart, group: "Tooling" },
  { href: "/dashboard/eval-lab", label: "AI Evaluation Lab", icon: FlaskConical, group: "Tooling" },
  { href: "/dashboard/settings", label: "Admin Settings", icon: Settings, group: "Tooling" },
];

export const NAV_GROUPS: NavItem["group"][] = ["Operations", "People", "Tooling"];
