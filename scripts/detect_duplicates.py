#!/usr/bin/env python3
"""Detect likely-duplicate cases in a JSON export.

Uses a lightweight blocking + fuzzy-similarity approach:
  - Block on (zip, requester_name-first-token) to limit comparisons.
  - Score pairs by SequenceMatcher over the request description + name overlap.
  - Flag pairs above --threshold for human review (never auto-merge).

Input: a JSON array of case objects, or {"cases": [...]}. Reads a file or stdin.

Usage:
    python scripts/detect_duplicates.py cases.json --threshold 0.82
"""
from __future__ import annotations

import argparse
import json
import sys
from difflib import SequenceMatcher
from itertools import combinations


def load_cases(path: str):
    text = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
    data = json.loads(text)
    return data["cases"] if isinstance(data, dict) and "cases" in data else data


def field(case: dict, *keys: str) -> str:
    node = case
    for k in keys:
        if isinstance(node, dict):
            node = node.get(k, "")
        else:
            return ""
    return str(node or "")


def block_key(case: dict) -> str:
    zip_code = field(case, "intake", "zip") or field(case, "zip")
    name = (field(case, "intake", "requesterName") or field(case, "requester_name")).split(" ")
    return f"{zip_code}|{name[0].lower() if name else ''}"


def similarity(a: dict, b: dict) -> float:
    da = field(a, "intake", "description") or field(a, "description")
    db = field(b, "intake", "description") or field(b, "description")
    desc = SequenceMatcher(None, da.lower(), db.lower()).ratio()
    na = field(a, "intake", "requesterName") or field(a, "requester_name")
    nb = field(b, "intake", "requesterName") or field(b, "requester_name")
    name = SequenceMatcher(None, na.lower(), nb.lower()).ratio()
    return round(0.7 * desc + 0.3 * name, 3)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--threshold", type=float, default=0.82)
    args = ap.parse_args()

    cases = load_cases(args.file)
    blocks: dict[str, list] = {}
    for c in cases:
        blocks.setdefault(block_key(c), []).append(c)

    dupes = []
    for group in blocks.values():
        for a, b in combinations(group, 2):
            score = similarity(a, b)
            if score >= args.threshold:
                dupes.append({
                    "caseA": a.get("id", "?"),
                    "caseB": b.get("id", "?"),
                    "score": score,
                    "action": "flag_for_human_review",
                })

    dupes.sort(key=lambda d: d["score"], reverse=True)
    print(json.dumps({
        "totalCases": len(cases),
        "duplicatePairs": dupes,
        "flagged": len(dupes),
        "threshold": args.threshold,
    }, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
