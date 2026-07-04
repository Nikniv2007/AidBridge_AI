#!/usr/bin/env python3
"""Emit demo seed data (resources, volunteers, sample cases) as JSON and CSV.

Handy for populating a fresh Supabase instance or for local testing without the
Node runtime. Writes to scripts/output/ by default.

Usage:
    python scripts/seed_demo_data.py
    python scripts/seed_demo_data.py --out ./scripts/output
"""
from __future__ import annotations

import argparse
import csv
import json
import os

RESOURCES = [
    {"name": "Northside Community Food Pantry", "resource_type": "food_pantry", "city": "Austin", "state": "TX", "zip": "78701", "quantity_available": 120, "delivery_available": "true"},
    {"name": "Hope Shelter Downtown", "resource_type": "shelter", "city": "Austin", "state": "TX", "zip": "78702", "quantity_available": 8, "delivery_available": "false"},
    {"name": "RideShare Volunteers Co-op", "resource_type": "transportation", "city": "Austin", "state": "TX", "zip": "78704", "quantity_available": 6, "delivery_available": "true"},
    {"name": "CareLink Medical Supplies", "resource_type": "medical_supplies", "city": "Austin", "state": "TX", "zip": "78723", "quantity_available": 0, "delivery_available": "true"},
]

VOLUNTEERS = [
    {"name": "Aisha Rahman", "email": "aisha.r@example.org", "city": "Austin", "skills": "driving;translation", "languages": "en;ur;hi", "vehicle_access": "true", "max_tasks_per_day": 3, "reliability_score": 94},
    {"name": "Carlos Mendez", "email": "carlos.m@example.org", "city": "Austin", "skills": "driving;lifting", "languages": "en;es", "vehicle_access": "true", "max_tasks_per_day": 4, "reliability_score": 88},
]

CASES = [
    {"requester_name": "Helen Whitmore", "city": "Austin", "zip": "78701", "people_affected": 1, "description": "My elderly grandmother lost power and cannot drive. She needs vegetarian meals delivered today."},
    {"requester_name": "Marcus Bell", "city": "Austin", "zip": "78702", "people_affected": 4, "description": "Family of four evicted this week, need emergency shelter and food tonight."},
]


def write_csv(path: str, rows: list[dict]) -> None:
    if not rows:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="scripts/output")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    write_csv(os.path.join(args.out, "resources.csv"), RESOURCES)
    write_csv(os.path.join(args.out, "volunteers.csv"), VOLUNTEERS)
    write_csv(os.path.join(args.out, "cases.csv"), CASES)
    with open(os.path.join(args.out, "seed.json"), "w", encoding="utf-8") as f:
        json.dump({"resources": RESOURCES, "volunteers": VOLUNTEERS, "cases": CASES}, f, indent=2)

    print(f"Wrote demo seed data to {args.out}/ "
          f"({len(RESOURCES)} resources, {len(VOLUNTEERS)} volunteers, {len(CASES)} cases).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
