#!/usr/bin/env python3
"""Generate a daily operations report (Markdown + JSON) from a cases export.

Deterministic and offline — grounds every figure strictly in the input,
mirroring the demo-mode Report Writer in lib/ai/reportWriter.ts.

Input: JSON array of cases or {"cases": [...]}. Reads a file or stdin.

Usage:
    python scripts/generate_daily_report.py cases.json --out scripts/output/daily_report.md
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from collections import Counter

CLOSED = {"completed", "closed", "unable_to_fulfill"}


def load(path: str):
    text = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
    data = json.loads(text)
    return data["cases"] if isinstance(data, dict) and "cases" in data else data


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate a daily operations report.")
    ap.add_argument("file")
    ap.add_argument("--out", help="write the Markdown report to this path")
    args = ap.parse_args()

    try:
        cases = load(args.file)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    active = [c for c in cases if c.get("status") not in CLOSED]
    needs_review = [c for c in cases if c.get("human_review_required") or c.get("status") == "needs_human_review"]
    by_type = Counter(c.get("case_type", "unknown") for c in cases)
    by_urgency = Counter(c.get("urgency_level", "unknown") for c in cases)

    lines = [
        "# AidBridge AI — Daily Operations Report",
        "",
        "## Summary",
        f"- Total cases: {len(cases)}",
        f"- Active cases: {len(active)}",
        f"- Awaiting human review: {len(needs_review)}",
        "",
        "## Cases by urgency",
    ]
    for k, v in by_urgency.most_common():
        lines.append(f"- {k}: {v}")
    lines += ["", "## Cases by type"]
    for k, v in by_type.most_common():
        lines.append(f"- {k}: {v}")
    lines += [
        "",
        "> AidBridge AI supports human coordinators; it does not replace emergency services.",
        "> All sample data is fictional.",
    ]
    markdown = "\n".join(lines)

    metrics = {
        "total_cases": len(cases),
        "active_cases": len(active),
        "needs_review": len(needs_review),
        "by_urgency": dict(by_urgency),
        "by_type": dict(by_type),
    }

    if args.out:
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        open(args.out, "w", encoding="utf-8").write(markdown)
        json_path = os.path.splitext(args.out)[0] + ".json"
        open(json_path, "w", encoding="utf-8").write(json.dumps(metrics, indent=2))
        print(f"Wrote report to {args.out} and metrics to {json_path}.")
    else:
        print(markdown)
        print("\n--- metrics ---")
        print(json.dumps(metrics, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
