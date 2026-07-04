#!/usr/bin/env python3
"""Generate a plain-text/Markdown operations report from a cases JSON export.

Deterministic and offline — grounds every figure strictly in the input data,
mirroring the demo-mode report writer in `lib/ai/provider.ts`.

Usage:
    python scripts/generate_report.py cases.json --type daily_ops
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter

CLOSED = {"completed", "closed", "unable_to_fulfill"}


def load(path: str):
    text = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
    data = json.loads(text)
    return data["cases"] if isinstance(data, dict) and "cases" in data else data


def triage(c: dict) -> dict:
    return c.get("triage") or {}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--type", default="daily_ops")
    args = ap.parse_args()

    cases = load(args.file)
    active = [c for c in cases if c.get("status") not in CLOSED]
    needs_review = [c for c in cases if c.get("status") == "needs_human_review" or triage(c).get("humanReviewRequired")]
    by_category = Counter(triage(c).get("category", "unknown") for c in cases)
    by_urgency = Counter(triage(c).get("urgency", "unknown") for c in cases)

    lines = [
        f"# AidBridge AI — {args.type.replace('_', ' ').title()} Report",
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
    lines += ["", "## Cases by category"]
    for k, v in by_category.most_common():
        lines.append(f"- {k}: {v}")
    lines += [
        "",
        "> AidBridge AI supports human coordinators; it does not replace emergency services.",
    ]

    print(json.dumps({
        "type": args.type,
        "markdown": "\n".join(lines),
        "highlights": [
            f"{len(active)} active cases.",
            f"{len(needs_review)} awaiting human review.",
        ],
    }, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
