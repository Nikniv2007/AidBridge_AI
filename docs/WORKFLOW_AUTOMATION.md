# Workflow Automation

Python scripts under `scripts/` handle bulk data work outside the Next.js
runtime. They use **only the Python standard library** — no install step — so
they run anywhere. Shared CSV parsing lives in `scripts/parse_csv.py` and mirrors
`lib/automation/csv.ts` so TypeScript and Python agree on how CSVs are read.

## Scripts

| Script | Purpose | Example |
| --- | --- | --- |
| `parse_intake_csv.py` | Community requests CSV → normalized JSON cases | `python scripts/parse_intake_csv.py requests.csv --out scripts/output/cases.json` |
| `parse_volunteer_roster.py` | Roster CSV → normalized volunteers | `python scripts/parse_volunteer_roster.py roster.csv` |
| `parse_inventory_sheet.py` | Inventory CSV → resources + low-stock flags | `python scripts/parse_inventory_sheet.py inventory.csv --threshold 5` |
| `dedupe_cases.py` | Flag likely-duplicate cases for human review | `python scripts/dedupe_cases.py cases.json --threshold 0.8` |
| `generate_daily_report.py` | Daily operations report (Markdown + JSON) | `python scripts/generate_daily_report.py cases.json --out scripts/output/daily.md` |
| `validate_ai_output.py` | Validate intake JSON vs. the schema rules | `cat output.json \| python scripts/validate_ai_output.py -` |
| `seed_demo_data.py` | Generate fictional demo data (JSON + CSV) | `python scripts/seed_demo_data.py --cases 100` |

Legacy Part 1 helpers (`parse_csv.py`, `parse_volunteers.py`,
`parse_inventory.py`, `detect_duplicates.py`, `generate_report.py`,
`validate_json.py`) remain available and share the same parser.

## Conventions

Every script: has a CLI (`argparse`) with `--help`, reads a file or `-` (stdin),
handles errors gracefully (never a raw traceback for expected failures), prints
useful logs, and writes to `scripts/output/` when `--out` is given.

## Automation flows (in-app)

The **Automation Logs** page shows sample runs mirroring the `automation_runs`
table: CSV imports, duplicate detection, AI triage, daily report, inventory
low-stock alert, volunteer reminders, and the eval suite — each with status,
records processed, errors, and a summary. In production these would be triggered
by scheduled jobs or Supabase Edge Functions calling the same logic.

## Duplicate detection

`dedupe_cases.py` blocks on `(zip, first-name initial)`, then scores pairs on
text similarity, name similarity, phone match, ZIP match, and case-type match. It
**flags** likely duplicates for human review — it never auto-merges.

## Data disclaimer

All generated and sample data is fictional and for demonstration only.
