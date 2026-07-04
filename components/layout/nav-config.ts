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
  Map,
  TrendingDown,
  Beaker,
  GitCompareArrows,
  Building2,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "Operations" | "People" | "Insights" | "Tooling";
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
  { href: "/dashboard/map", label: "Map View", icon: Map, group: "Insights" },
  { href: "/dashboard/forecasting", label: "Shortage Forecast", icon: TrendingDown, group: "Insights" },
  { href: "/dashboard/simulation", label: "Simulation Sandbox", icon: Beaker, group: "Insights" },
  { href: "/dashboard/ai-diff", label: "AI Diff Viewer", icon: GitCompareArrows, group: "Insights" },
  { href: "/dashboard/partners", label: "Partner Portal", icon: Building2, group: "Insights" },
  { href: "/dashboard/documents", label: "Document Uploads", icon: FileUp, group: "Tooling" },
  { href: "/dashboard/automations", label: "Automation Logs", icon: Workflow, group: "Tooling" },
  { href: "/dashboard/reports", label: "Reports", icon: FileBarChart, group: "Tooling" },
  { href: "/dashboard/eval-lab", label: "AI Evaluation Lab", icon: FlaskConical, group: "Tooling" },
  { href: "/dashboard/settings", label: "Admin Settings", icon: Settings, group: "Tooling" },
];

export const NAV_GROUPS: NavItem["group"][] = ["Operations", "People", "Insights", "Tooling"];
