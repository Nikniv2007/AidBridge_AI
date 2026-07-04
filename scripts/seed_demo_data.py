#!/usr/bin/env python3
"""Generate fictional demo data for AidBridge AI (org, users, cases, volunteers,
resources) as JSON + CSV.

⚠️  ALL GENERATED DATA IS FICTIONAL — invented for demonstration only. It does
    not represent real people, organizations, or requests.

Deterministic (seeded) so output is reproducible. Writes to scripts/output/.

Usage:
    python scripts/seed_demo_data.py
    python scripts/seed_demo_data.py --cases 100 --volunteers 30 --resources 25 --out scripts/output
"""
from __future__ import annotations

import argparse
import csv
import json
import os

DISCLAIMER = (
    "All AidBridge AI sample data is fictional and for demonstration only. "
    "It does not represent real people, organizations, or requests."
)

CITIES = [("Austin", "78701"), ("Austin", "78702"), ("Round Rock", "78664"), ("Pflugerville", "78660")]
REQUESTS = [
    ("food_support", "My elderly grandmother lost power and cannot drive. She needs vegetarian meals delivered today.", 1),
    ("shelter_support", "Family of four evicted this week, need emergency shelter and food tonight.", 4),
    ("clothing", "Necesito ropa de invierno para mis tres hijos antes de que empiece la escuela.", 3),
    ("medical_supplies", "My father needs his walker repaired or replaced.", 1),
    ("school_supplies", "Need backpacks for two kids starting middle school.", 2),
    ("hygiene_kits", "Need hygiene kits and diapers for a newborn, no transportation.", 2),
    ("donation_pickup", "We have furniture and canned goods to donate, can someone pick them up?", 1),
    ("transportation", "I need a ride to my dialysis appointment three times a week.", 1),
]
FIRST = ["Aisha", "Carlos", "Emily", "David", "Sofia", "Omar", "Grace", "Leo", "Nina", "Sam"]
LAST = ["Khan", "Mendez", "Chen", "Okafor", "Ramirez", "Farouk", "Kim", "Rivera", "Patel", "Bell"]
RES_TYPES = ["food_pantry", "shelter", "transportation", "school_supplies", "clothing", "hygiene_kits", "medical_supplies", "donation_pickup"]


def gen_org() -> dict:
    return {
        "id": "org_0001",
        "name": "Community Response Collective",
        "mission": "Coordinate food, shelter, and essential aid for neighbors in crisis.",
        "city": "Austin",
        "state": "TX",
    }


def gen_users(n=5) -> list[dict]:
    roles = ["admin", "case_manager", "coordinator", "case_manager", "coordinator"]
    return [
        {"id": f"user_{i+1:04d}", "email": f"user{i+1}@example.org",
         "full_name": f"{FIRST[i % len(FIRST)]} {LAST[i % len(LAST)]}", "role": roles[i % len(roles)]}
        for i in range(n)
    ]


def gen_cases(n) -> list[dict]:
    out = []
    for i in range(n):
        ctype, text, people = REQUESTS[i % len(REQUESTS)]
        city, zip_code = CITIES[i % len(CITIES)]
        out.append({
            "id": f"case_{i+1:04d}",
            "requester_name": f"{FIRST[i % len(FIRST)]} {LAST[(i+1) % len(LAST)]}",
            "requester_phone": f"512-555-{(i+400) % 9999:04d}",
            "original_request": text,
            "case_type": ctype,
            "city": city, "state": "TX", "zip": zip_code,
            "people_affected": people,
            "preferred_language": "Spanish" if "Necesito" in text else "English",
        })
    return out


def gen_volunteers(n) -> list[dict]:
    out = []
    for i in range(n):
        city, zip_code = CITIES[i % len(CITIES)]
        out.append({
            "name": f"{FIRST[i % len(FIRST)]} {LAST[i % len(LAST)]}",
            "email": f"volunteer{i+1}@example.org",
            "phone": f"512-555-{(i+300) % 9999:04d}",
            "city": city,
            "skills": "driving;delivery" if i % 2 == 0 else "translation;coordination",
            "languages": "en;es" if i % 2 else "en;ur;hi",
            "has_vehicle": "true" if i % 3 != 1 else "false",
            "max_tasks_per_day": 2 + (i % 4),
            "reliability_score": 70 + (i * 13) % 30,
        })
    return out


def gen_resources(n) -> list[dict]:
    out = []
    for i in range(n):
        city, zip_code = CITIES[i % len(CITIES)]
        rtype = RES_TYPES[i % len(RES_TYPES)]
        out.append({
            "name": f"{city} {rtype.replace('_', ' ')} #{i+1}",
            "resource_type": rtype,
            "description": f"Provides {rtype.replace('_', ' ')}.",
            "city": city, "state": "TX", "zip": zip_code,
            "available_quantity": (i * 7) % 40,
            "delivery_available": "true" if i % 3 != 0 else "false",
            "hours": "9am-5pm",
            "contact_name": "Coordinator",
            "contact_phone": f"512-555-{(i+10) % 9999:04d}",
        })
    return out


def write_csv(path: str, rows: list[dict]) -> None:
    if not rows:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate fictional AidBridge AI demo data.")
    ap.add_argument("--cases", type=int, default=100)
    ap.add_argument("--volunteers", type=int, default=30)
    ap.add_argument("--resources", type=int, default=25)
    ap.add_argument("--out", default="scripts/output")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    org = gen_org()
    users = gen_users()
    cases = gen_cases(args.cases)
    volunteers = gen_volunteers(args.volunteers)
    resources = gen_resources(args.resources)

    bundle = {
        "disclaimer": DISCLAIMER,
        "organization": org,
        "users": users,
        "cases": cases,
        "volunteers": volunteers,
        "resources": resources,
    }
    with open(os.path.join(args.out, "seed.json"), "w", encoding="utf-8") as f:
        json.dump(bundle, f, indent=2, ensure_ascii=False)
    write_csv(os.path.join(args.out, "cases.csv"), cases)
    write_csv(os.path.join(args.out, "volunteers.csv"), volunteers)
    write_csv(os.path.join(args.out, "resources.csv"), resources)

    print(
        f"Wrote demo data to {args.out}/ "
        f"({len(cases)} cases, {len(volunteers)} volunteers, {len(resources)} resources, {len(users)} users).\n"
        f"{DISCLAIMER}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
