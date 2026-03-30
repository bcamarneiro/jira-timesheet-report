# Product Plan

This document captures the next step for Jira Timesheet Report: move from "powerful internal tool" to "easy-to-adopt product".

## Product Direction

### Positioning

The app should be positioned as a **zero-backend Jira worklog companion** with two clear surfaces:

- **Dashboard**: personal weekly workflow for closing the week, filling gaps, and exporting summaries
- **Reports**: team and monthly reporting for visibility, compliance, and audits

This keeps the product focused:

- `Dashboard` is the primary value proposition
- `Reports` is a strong secondary surface
- `Settings` should feel like onboarding, not a technical admin page

### Core User Jobs

1. Help an individual close the week faster and with less guesswork
2. Let a team lead check compliance and produce a usable report quickly
3. Make setup simple enough that a non-expert can succeed without pairing

### Product Principles

- Stay **zero-backend** unless a new capability clearly justifies changing that constraint
- Favor **fast setup** over adding more niche workflows
- Keep **real Jira data trustworthy** across all views
- Ship capabilities that feel like a product, not a collection of screens

## Three-Phase Roadmap

## Phase 1: Adoptability

Goal: make the app easy to discover, open, configure, and trust.

### Outcomes

- A new user can open the app and understand it in under 30 seconds
- Setup succeeds without reading the source code
- The app is easy to distribute as a static site

### Priorities

1. GitHub Pages deployment
2. First-run setup wizard
3. Connection diagnostics and permission checks
4. PWA installability
5. Demo mode that is visible and one click away
6. Better docs and screenshots

## Phase 2: Daily Value

Goal: make the app something people actively want to use each week.

### Outcomes

- Weekly close becomes the "default ritual"
- Suggestions are easier to trust and act on
- Reports become easier to slice and export

### Priorities

1. Weekly close assistant
2. Suggestion explainability
3. Recent issue history and favorites quality-of-life improvements
4. Report filters and saved presets
5. Shareable, non-secret config packs
6. Better CSV/Markdown exports

## Phase 3: Team Trust

Goal: make the app credible for broader team usage, not just personal usage.

### Outcomes

- Team leads can rely on reports without second-guessing totals
- The app can explain data quality issues
- Sharing output is easier without sharing credentials

### Priorities

1. In-app consistency validation for current period
2. Trend and manager views
3. Read-only snapshot export
4. More explicit source health and failure diagnostics
5. Trust-oriented tests around multi-view consistency

## Architecture Target

## App Surfaces

- **Home / Landing**: explain the product and route users to Demo or Setup
- **Setup / Settings**: guided onboarding, credentials, permissions, imports
- **Dashboard**: personal weekly workflow
- **Reports**: weekly team and monthly reporting
- **Diagnostics**: connection health, permissions, source status, validation

## State Boundaries

### TanStack Query

Use query hooks for:

- Jira worklogs and issue data
- auxiliary source fetches
- diagnostics and validation fetches
- cached remote state and prefetching

### Zustand

Use stores for:

- view mode
- selected week/month
- column visibility
- onboarding progress
- drafts and preferences
- persisted local presets

### Pure Utilities / Selectors

Keep derived logic in pure modules for:

- grouped worklog calculations
- weekly and monthly summaries
- export formatting
- validation logic
- config migration helpers

## Domain Modules

Keep the codebase organized around domain areas instead of screen-specific coupling:

- `jira/`: raw Jira API access and normalization
- `dashboard/`: personal weekly workflow logic
- `reports/`: team and monthly reporting logic
- `sources/`: calendars, auxiliary data, absence feeds
- `settings/`: config parsing, migrations, backup/import/export
- `diagnostics/`: connectivity, permissions, validation
- `exports/`: CSV, Markdown, snapshot generation

## Configuration Strategy

### Versioned Config

Persisted config should carry an explicit version and migration path so new settings can be introduced safely.

### Secret-Safe Sharing

Support two backup modes:

- **Full backup**: includes secrets for personal restore
- **Share pack**: excludes token/secret fields and is safe to send to teammates

## Deployment Strategy

## GitHub Pages

GitHub Pages is a good fit because the app is static and zero-backend, but it needs explicit handling for SPA routing.

### Recommended approach

- Add a production build target for GitHub Pages
- Configure the app base path correctly
- Choose a routing strategy

Recommended first choice:

- keep clean routes with a static `404.html` redirect fallback for GitHub Pages

Fallback choice if simplicity matters more than URLs:

- use hash routing in the GitHub Pages build only

## PWA

The hosted app should feel installable:

- manifest
- icons
- theme metadata
- offline app shell
- install prompt guidance

## Trust and Observability

Add lightweight product diagnostics that stay within the zero-backend model:

- connection success/failure summary
- Jira permission summary
- last successful fetch timestamps
- current source health
- cross-view validation summary for the selected period

## Success Metrics

The next stage should optimize for:

- faster first-run success
- fewer setup failures
- more weekly repeat usage
- lower support burden when onboarding teammates
- zero known inconsistencies between Dashboard and Reports for supported configurations

## Recommended Execution Order

1. GitHub Pages deployment and routing strategy
2. Landing page and one-click Demo path
3. Setup wizard
4. Diagnostics page
5. Config migrations and share packs
6. PWA installability
7. Weekly close assistant
8. Reports filters and presets
9. In-app consistency validation
10. Manager mode and trend views
