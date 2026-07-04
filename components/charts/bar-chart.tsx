import { cn } from "@/lib/utils/cn";

export interface BarDatum {
  label: string;
  value: number;
  hint?: string;
}

const PALETTE = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
];

/** Simple horizontal bar chart — dependency-free, theme-aware. */
export function BarChart({
  data,
  colorByIndex = false,
  className,
}: {
  data: BarDatum[];
  colorByIndex?: boolean;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={cn("space-y-2.5", className)}>
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 shrink-0 truncate text-sm capitalize text-muted-foreground">
            {d.label}
          </div>
          <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
            <div
              className={cn(
                "flex h-full items-center justify-end rounded px-2 text-xs font-medium text-white transition-all",
                colorByIndex ? PALETTE[i % PALETTE.length] : "bg-brand-500",
              )}
              style={{ width: `${Math.max(6, (d.value / max) * 100)}%` }}
            >
              {d.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
