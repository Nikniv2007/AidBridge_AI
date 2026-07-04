#!/usr/bin/env python3
"""Detect likely-duplicate community cases.

Scores candidate pairs on:
  - Name similarity (fuzzy)
  - Phone match (normalized digits)
  - ZIP code match
  - Request type match (case_type)
  - Text similarity (SequenceMatcher over original_request)

Blocks on (zip, first-name initial) to keep comparisons tractable, then flags
pairs above --threshold for HUMAN REVIEW (never auto-merges).

Input: JSON array of cases, or {"cases": [...]}. Reads a file or stdin.

Usage:
    python scripts/dedupe_cases.py cases.json --threshold 0.8
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from difflib import SequenceMatcher
from itertools import combinations


def load(path: str):
    text = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
    data = json.loads(text)
    return data["cases"] if isinstance(data, dict) and "cases" in data else data


def g(case: dict, *keys: str) -> str:
    for k in keys:
        if isinstance(case, dict) and case.get(k):
            return str(case[k])
    return ""


def digits(s: str) -> str:
    return re.sub(r"\D", "", s or "")


def block_key(case: dict) -> str:
    zip_code = g(case, "zip")
    name = g(case, "requester_name", "name").strip().lower()
    return f"{zip_code}|{name[:1]}"


def pair_score(a: dict, b: dict) -> dict:
    name = SequenceMatcher(
        None, g(a, "requester_name", "name").lower(), g(b, "requester_name", "name").lower()
    ).ratio()
    text = SequenceMatcher(
        None, g(a, "original_request", "description").lower(), g(b, "original_request", "description").lower()
    ).ratio()
    phone_match = bool(digits(g(a, "requester_phone", "phone"))) and digits(
        g(a, "requester_phone", "phone")
    ) == digits(g(b, "requester_phone", "phone"))
    zip_match = g(a, "zip") == g(b, "zip") and g(a, "zip") != ""
    type_match = g(a, "case_type") == g(b, "case_type") and g(a, "case_type") != ""

    composite = (
        0.35 * text
        + 0.25 * name
        + (0.20 if phone_match else 0)
        + (0.10 if zip_match else 0)
        + (0.10 if type_match else 0)
    )
    return {
        "score": round(composite, 3),
        "signals": {
            "name_similarity": round(name, 3),
            "text_similarity": round(text, 3),
            "phone_match": phone_match,
            "zip_match": zip_match,
            "type_match": type_match,
        },
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Flag likely-duplicate cases for human review.")
    ap.add_argument("file")
    ap.add_argument("--threshold", type=float, default=0.8)
    args = ap.parse_args()

    try:
        cases = load(args.file)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    blocks: dict[str, list] = {}
    for c in cases:
        blocks.setdefault(block_key(c), []).append(c)

    flagged = []
    for group in blocks.values():
        for a, b in combinations(group, 2):
            ps = pair_score(a, b)
            if ps["score"] >= args.threshold:
                flagged.append({
                    "case_a": g(a, "id", "external_ref") or "?",
                    "case_b": g(b, "id", "external_ref") or "?",
                    "score": ps["score"],
                    "signals": ps["signals"],
                    "action": "flag_for_human_review",
                })

    flagged.sort(key=lambda d: d["score"], reverse=True)
    print(json.dumps({
        "total_cases": len(cases),
        "flagged": len(flagged),
        "threshold": args.threshold,
        "duplicate_pairs": flagged,
    }, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
