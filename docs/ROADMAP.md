# Roadmap

## MVP roadmap (shipped)

- [x] Next.js app shell, public site, dashboard (19 pages)
- [x] Case intake → AI triage → structured JSON (Zod-validated)
- [x] Deterministic resource & volunteer matching + AI explanation
- [x] Multilingual outreach with an outbound safety gate
- [x] Reports (operations / impact / donor / leadership / shortage)
- [x] AI Evaluation Lab + regression suite + eight headline metrics
- [x] Rule-based safety engine + human-review routing
- [x] Python automation scripts + Supabase schema/migrations + demo data
- [x] Demo mode (zero keys) with automatic live fallback

## Advanced roadmap (scaffolded / partial)

- [x] Map view (location cards), shortage forecasting, burnout protection
- [x] Simulation sandbox, AI output diff viewer, partner-portal scaffold
- [ ] Supabase Auth + RLS persistence and data adapters
- [ ] Real geocoding for distance-based matching
- [ ] Historical time-series shortage forecasting
- [ ] PDF/Excel document parsing (server-side extraction)
- [ ] Live LLM provider hardening + streaming
- [ ] Partner self-service write-back with per-org RLS

## Future features

- Volunteer mobile self-service (accept/decline, check-in)
- Requester status portal and two-way messaging
- Configurable per-org prompt packs and thresholds UI
- Impact analytics + exportable donor dashboards
- Offline-first intake for field use
- Accessibility audit (WCAG 2.2 AA) and full i18n

## Suggested GitHub issues

See [GITHUB_PROJECT_PLAN.md](GITHUB_PROJECT_PLAN.md) for 25 ready-to-open issue
titles/descriptions, suggested milestones, and labels.
