import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "default" | "danger" | "warning" | "success" | "brand";
  hint?: string;
}) {
  const accent = {
    default: "text-muted-foreground",
    danger: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    success: "text-emerald-600 dark:text-emerald-400",
    brand: "text-brand-600 dark:text-brand-400",
  }[tone];

  const iconBg = {
    default: "bg-muted text-muted-foreground",
    danger: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400",
  }[tone];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-1.5 text-2xl font-semibold tabular-nums", accent)}>
            {value}
          </p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && (
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconBg)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
