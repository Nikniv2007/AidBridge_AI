import type { TimelineEvent } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/format";
import {
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
  UserCheck,
  Users,
  AlertTriangle,
  Circle,
} from "lucide-react";

const ICONS: Record<TimelineEvent["type"], React.ReactNode> = {
  created: <FileText className="h-3.5 w-3.5" />,
  triaged: <Sparkles className="h-3.5 w-3.5" />,
  review: <AlertTriangle className="h-3.5 w-3.5" />,
  matched: <CheckCircle2 className="h-3.5 w-3.5" />,
  assigned: <Users className="h-3.5 w-3.5" />,
  contacted: <MessageSquare className="h-3.5 w-3.5" />,
  status_change: <Circle className="h-3.5 w-3.5" />,
  note: <FileText className="h-3.5 w-3.5" />,
  outreach: <UserCheck className="h-3.5 w-3.5" />,
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[1.90rem] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
            {ICONS[e.type]}
          </span>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm">{e.message}</p>
            <time className="text-xs text-muted-foreground">
              {formatDateTime(e.at)}
            </time>
          </div>
          <p className="text-xs text-muted-foreground">by {e.actor}</p>
        </li>
      ))}
    </ol>
  );
}
