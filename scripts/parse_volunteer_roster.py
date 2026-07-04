#!/usr/bin/env python3
"""Parse a volunteer roster CSV into normalized volunteer records.

Expected columns (flexible order):
    name, email, phone, city, skills, languages, has_vehicle,
    max_tasks_per_day, reliability_score

- skills: comma- or semicolon-separated
- languages: semicolon-separated ISO codes (en;es;hi;ur)
- has_vehicle: true/false/yes/no/1/0

Usage:
    python scripts/parse_volunteer_roster.py roster.csv --out scripts/output/volunteers.json
"""
from __future__ import annotations

import argparse
import json
import os
import sys

from parse_csv import parse_csv


def to_bool(v: str) -> bool:
    return str(v).strip().lower() in {"true", "yes", "1", "y"}


def split_multi(v: str):
    return [p.strip() for p in v.replace(";", ",").split(",") if p.strip()]


def normalize(row: dict) -> dict:
    langs = [c.strip().lower() for c in split_multi(row.get("languages", ""))] or ["en"]
    return {
        "name": row.get("name", "").strip(),
        "email": row.get("email", "").strip(),
        "phone": row.get("phone", "").strip(),
        "city": row.get("city", "").strip(),
        "skills": split_multi(row.get("skills", "")),
        "languages": langs,
        "has_vehicle": to_bool(row.get("has_vehicle", row.get("vehicle_access", ""))),
        "max_tasks_per_day": int(row.get("max_tasks_per_day", "3") or 3),
        "reliability_score": int(row.get("reliability_score", "70") or 70),
        "completed_tasks": 0,
        "active_assignments": 0,
        "active": True,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Normalize a volunteer roster CSV into JSON.")
    ap.add_argument("file")
    ap.add_argument("--out")
    args = ap.parse_args()

    try:
        text = sys.stdin.read() if args.file == "-" else open(args.file, encoding="utf-8").read()
    except OSError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    parsed = parse_csv(text)
    volunteers, errors = [], list(parsed["errors"])
    for i, row in enumerate(parsed["rows"], start=1):
        if not row.get("name", "").strip():
            errors.append(f"Row {i}: missing name — skipped.")
            continue
        try:
            volunteers.append(normalize(row))
        except (ValueError, KeyError) as exc:
            errors.append(f"Row {i}: {exc}")

    result = {"count": len(volunteers), "errors": errors, "volunteers": volunteers}
    out = json.dumps(result, indent=2, ensure_ascii=False)
    if args.out:
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        open(args.out, "w", encoding="utf-8").write(out)
        print(f"Wrote {len(volunteers)} volunteers to {args.out} ({len(errors)} warnings).")
    else:
        print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
