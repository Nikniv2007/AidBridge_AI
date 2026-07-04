"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Check, Copy } from "lucide-react";

/** Lightweight syntax-highlighted JSON viewer with copy button. */
export function JsonViewer({
  data,
  className,
  maxHeight = "22rem",
}: {
  data: unknown;
  className?: string;
  maxHeight?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const text = React.useMemo(() => JSON.stringify(data, null, 2), [data]);

  const onCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-slate-950 text-slate-50",
        className,
      )}
    >
      <button
        onClick={onCopy}
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        className="overflow-auto p-4 text-xs leading-relaxed"
        style={{ maxHeight }}
      >
        <code dangerouslySetInnerHTML={{ __html: highlight(text) }} />
      </pre>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlight(json: string): string {
  return escapeHtml(json).replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-300"; // number
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-sky-300" : "text-emerald-300";
      } else if (/true|false/.test(match)) {
        cls = "text-violet-300";
      } else if (/null/.test(match)) {
        cls = "text-slate-400";
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}
