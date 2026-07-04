#!/usr/bin/env python3
"""Parse a volunteer roster CSV into normalized volunteer records.

Expected columns (flexible order):
    name,email,phone,city,skills,languages,vehicle_access,max_tasks_per_day,reliability_score

- skills: comma- or semicolon-separated
- languages: semicolon-separated ISO codes (en;es;hi;ur)
- vehicle_access: true/false/yes/no/1/0

Usage:
    python scripts/parse_volunteers.py roster.csv > volunteers.json
"""
from __future__ import annotations

import json
import sys

from parse_csv import parse_csv


def to_bool(v: str) -> bool:
    return str(v).strip().lower() in {"true", "yes", "1", "y"}


def split_multi(v: str):
    return [p.strip() for p in v.replace(";", ",").split(",") if p.strip()]


def normalize(row: dict) -> dict:
    return {
        "name": row.get("name", "").strip(),
        "email": row.get("email", "").strip(),
        "phone": row.get("phone", "").strip(),
        "city": row.get("city", "").strip(),
        "skills": split_multi(row.get("skills", "")),
        "languages": [c.strip().lower() for c in split_multi(row.get("languages", "")) or ["en"]],
        "vehicleAccess": to_bool(row.get("vehicle_access", "")),
        "maxTasksPerDay": int(row.get("max_tasks_per_day", "3") or 3),
        "reliabilityScore": int(row.get("reliability_score", "70") or 70),
        "backgroundCheck": "not_started",
        "completedTasks": 0,
        "activeAssignments": 0,
    }


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    text = open(sys.argv[1], encoding="utf-8").read()
    parsed = parse_csv(text)
    volunteers, errors = [], list(parsed["errors"])

    for i, row in enumerate(parsed["rows"], start=1):
        try:
            volunteers.append(normalize(row))
        except (ValueError, KeyError) as exc:
            errors.append(f"Row {i}: {exc}")

    print(json.dumps({"volunteers": volunteers, "count": len(volunteers), "errors": errors}, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
