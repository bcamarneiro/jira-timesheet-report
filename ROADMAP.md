# Jira Timesheet Report Roadmap

This roadmap reflects the current product direction as of March 25, 2026.

The next step is not "more screens". It is making the app easier to adopt, easier to trust, and more obviously valuable on a weekly basis.

## Product Direction

Jira Timesheet Report should be treated as a **zero-backend Jira worklog companion** with two clear surfaces:

- **Dashboard** for personal weekly close and worklog triage
- **Reports** for team visibility and monthly reporting

Settings and diagnostics should support those two surfaces, not compete with them.

## Roadmap Phases

## Phase 1: Adoptability

- GitHub Pages deployment
- landing page refresh
- first-run setup wizard
- connection diagnostics and permission checks
- PWA installability
- visible one-click demo path

## Phase 2: Daily Value

- weekly close assistant
- suggestion explainability
- recent issue history and reuse flows
- reports filters, presets, and shareable URLs
- secret-safe config share packs
- richer exports

## Phase 3: Team Trust

- in-app consistency validation
- multi-week trend and manager views
- read-only snapshots for sharing
- better source-health and validation feedback
- expanded trust-oriented test coverage

## Architecture Direction

- Keep **TanStack Query** responsible for remote data and cache
- Keep **Zustand** responsible for workflow state, drafts, and local preferences
- Keep derived calculations in pure helpers and selectors
- Introduce stronger boundaries around `jira`, `dashboard`, `reports`, `settings`, `diagnostics`, and `exports`
- Version persisted config and backup formats

## Delivery Notes

- Prefer static hosting and zero-backend constraints
- Favor onboarding and trust improvements over niche feature growth
- Treat cross-view data consistency as a product feature, not just a test concern

## Reference Documents

- Product plan: `docs/product-plan.md`
- Linear-ready issue drafts: `docs/linear-issue-drafts.md`
