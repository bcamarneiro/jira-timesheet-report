# Agents

This file provides context for AI coding agents working on this codebase.

## Project Overview

Jira Timesheet Report is a zero-backend, browser-based Jira workspace with two main surfaces:

- **Dashboard** for weekly gap triage, suggestions, reminders, and quick exports
- **Reports** for weekly team compliance, manager-mode trend review, read-only snapshots, and monthly calendar-based reporting

Everything runs client-side. Credentials and preferences are stored in `localStorage`, and API calls go directly to Jira, optionally through a local CORS proxy.

## Tech Stack

- **React 18** with **TypeScript 5.9**
- **Zustand 5** for persisted client state
- **TanStack Query 5** for server-state caching and prefetching
- **Rspack 1.5** as bundler
- **CSS Modules** with tokens in `frontend/react/styles/tokens.css`
- **Biome 2.3** for linting and formatting
- **Vitest 3.2** for unit tests, **Playwright** for E2E
- **MSW 2.11** for offline mode (`npm run dev:offline`)
- Direct `fetch` access to **Jira REST API v2**

## Architecture

```text
frontend/
  react/
    components/    UI components for dashboard, reports, settings, shared UI
    hooks/         Query hooks, calculations, URL sync, keyboard workflows
    pages/         Home, Dashboard, Reports, Settings
    utils/         Pure helpers (CSV, dates, formatting, summaries)
    constants/     Shared constants
    styles/        Global CSS and design tokens
  services/        Jira and auxiliary-source fetch logic
  stores/          Zustand stores
  mocks/           MSW handlers and mock data
types/             Shared TypeScript interfaces
e2e/               Playwright specs
```

## Key Stores

- **useConfigStore**: Jira connection, permissions, theme, rounding, auxiliary source config
- **useTimesheetStore**: monthly reporting state and derived grouped entries
- **useDashboardStore**: weekly dashboard state and derived day summaries
- **useTeamStore**: weekly team-report navigation state
- **useUserDataStore**: persisted personal helpers such as favorites, templates, calendar mappings, day notes, and report presets
- **useSettingsFormStore**: editable settings form state before save
- **useUIStore**: persisted UI preferences

## Data Flow

1. User configures Jira in Settings
2. Query hooks fetch Jira data through service modules
3. Zustand stores cache UI-specific derived state
4. Dashboard and Reports pages render from store selectors and query results

## Domain Conventions

- Use **Dashboard** for the weekly personal workflow
- Use **Reports** for the combined weekly team and monthly reporting area
- Prefer naming that reflects the current product language; avoid introducing new `team`/`timesheet` route names unless a feature is truly scoped that way

## Domain Invariants

These are load-bearing rules. Breaking them silently corrupts reports. Read before editing anything that touches worklog bucketing, error handling, or CSV output.

### Worklog classifier is the single source of truth for "what day does this count on"

`frontend/react/utils/worklogClassifier.ts` returns `{loggedOn, intendedFor, daysLate, isBackdated, source}`. All surfaces (Dashboard, Reports weekly/monthly, team summaries, CSV, snapshots) bucket by `classifyWorklog(wl).loggedOn` — never by `wl.started`.

Two backdate patterns the classifier handles:
- **Pattern A (comment-marker):** `started` is the actual log-day; the comment carries `Original Worklog Date was: YYYY/MM/DD`. `loggedOn = started`, `intendedFor = marker`.
- **Pattern B (jira-native):** `started` is the intended past date, `created` is the actual log-day. `loggedOn = created`, `intendedFor = started`.

Do not introduce a new `started`-based bucketing path. If a service-layer filter has to use `started` for the Jira query (JQL `worklogDate`), widen the fetch window by ±1 week and re-bucket client-side via classifier — see `frontend/services/teamService.ts` for the canonical pattern.

### Ghost reconciliation UX

Backdated entries (`classifyWorklog(wl).isBackdated === true`) are **never counted toward any total in the UI** — Dashboard, Reports weekly, Reports monthly, heatmaps, KPI cards, snapshots, copy-previous-week suggestions. They appear in two places, both informational:
- On their `intendedFor` day as a **non-counting ghost placeholder**.
- On their `loggedOn` day as a **non-counting side note** under the day total (e.g. `+2h backdated`) and in the day's "Backdated submissions" worklog section.

Filtering sites (each guards a summation with `if (classifyWorklog(wl).isBackdated) continue;`):
- **Day / Month**: `useDayCalculation`, `useMonthTotalCalculation`
- **Monthly Reports KPIs / tables**: `TimesheetStatsCards`, `OverviewTable`, `TimesheetPage.sumMonthlyHours`, `reportSnapshots.summarizeMonthlyEntries` / `buildDailyBreakdown`
- **Team weekly compliance**: `teamService` (daily/weekly totals — backdated tracked in a separate `backdatedSeconds` field), `teamReports.buildTeamSummaries`
- **Heatmap**: `useMonthHeatmapData.buildMonthHeatmapBuckets` (excludes from `data`, populates separate `backdatedSeconds` for the overlay)
- **Dashboard weekly**: `WorklogEntry.isBackdated` carried from `useDashboardDataFetcher.deriveWeekWorklogs` → consumed by `suggestionMerger.loggedByDay`
- **Copy previous week**: `useCopyPreviousWeek.deriveWeekWorklogs`

CSV exports (`csv.ts`, `weekCsvExport.ts`, `teamCsvExport.ts`) are the deliberate exception — they remain inclusive with `IsBackdated` / `BackdateSource` columns so downstream finance tooling can bucket on its own terms. The byte-stable invariant below applies.

### ServiceError, not raw Error

All service-layer throws go through `frontend/services/serviceErrors.ts`:
- `fromHttpResponse(source, status)` for plain HTTP status mapping
- `fromRichMessage(source, status, message)` when the source has a pre-built user-facing message (GitLab, Calendar)
- `new ServiceError({kind, status, source, message})` for typed cases like `kind: 'invalid-token'`

Never `throw new Error(...)` from a service module.

### Finance-grade CSV is byte-stable (per setting)

Monthly/team/week CSVs preserve byte-for-byte output across refactors **for a given `includeAbsenceInCsv` setting**. Two intentional toggles change the shape:
- `includeAbsenceInCsv` (Config flag, default `true`): adds `IsAbsence` / `AbsenceKind` columns and an `AbsenceDays` / `Absence Days` subtotal block to all three exports. When `false`, output is byte-identical to the pre-ADA-240 shape.
- The fixed `IsBackdated` column is always present; `BackdateSource` was retired in the column trim.

When extracting helpers, parameterise rather than diverging — see `csvHelpers` for the existing shape.

### Per-day target (ADA-236)

`frontend/react/utils/dayTarget.ts` is the single source of truth. Rules:

- Weekend → 0
- Weekday, not absent → 8h
- Weekday, absent, 0h logged → 0
- Weekday, absent, 0 < X ≤ 8h logged → X (partial day, 100% compliant)
- Weekday, absent, >8h logged → 8h (cap)

All rollups (DayCell, OverviewTable, TimesheetGrid, teamService, teamReports, suggestionMerger, monthly snapshot) **must** call `computeDayTargetSeconds` or `sumWeekdayTargetSeconds`. Do NOT reintroduce `weekdays × 8h − absenceDays × 8h` arithmetic — it loses partial-day fidelity. `countAbsenceWorkdaysIn*` helpers were retired for this reason.

### Calendar feed types

`CalendarFeed.type` is `'suggestion' | 'absence' | 'holiday'`:
- `suggestion`: drives Dashboard worklog suggestions.
- `absence`: per-user PTO. Needs `absenceAttribution: 'self' | 'shared'` and (for `'shared'`) `AbsenceAssignment[]` patterns mapping event titles to user emails.
- `holiday`: public holidays. **Nationwide by default** — events apply to every user automatically. **Regional holidays** are scoped by adding an `AbsenceAssignment` whose pattern matches the event title; the assignment's `userEmails` list determines who gets the holiday. A holiday with no matching assignment stays nationwide.

`AbsenceAssignment` shape is `{ pattern: string; userEmails: string[] }`. Same record powers both shared-absence and regional-holiday scoping. The legacy v5 single-email shape `{ pattern, userEmail }` is auto-migrated to `userEmails: [userEmail]` by `normalizeAbsenceAssignment`.

`AbsenceKind` is `'vacation' | 'sick' | 'off' | 'holiday'`. The per-day target rule treats all four identically — what changes is the label users see.

### Stores have a migration scaffold

`useConfigStore`, `useUserDataStore`, `useUIStore` use Zustand persist with a versioned `migrate` and a defensive `merge`. Bumping `*_STORAGE_VERSION` requires a `v(N) → v(N+1)` step in `migratePersistedConfigState` (or the equivalent for the other stores). The scaffold tests in `__tests__/useConfigStore.test.ts` rehearse this.

### Audit follow-up tickets

Remaining audit-driven tech-debt lives in the Linear project **"Jira Timesheet Report — audit follow-up"** (`https://linear.app/adamastor/project/jira-timesheet-report-audit-follow-up-d976deb130a5`). Check there before starting a refactor that "feels obvious" — it's likely already scoped.

## Conventions

- **CSS**: use tokens from `tokens.css`; avoid hardcoded colors and spacing
- **Components**: functional components with CSS Modules
- **State**: selectors for Zustand reads, props for local component data
- **Testing**: colocated unit tests in `__tests__/`, E2E in `e2e/`
- **Formatting**: Biome handles imports, quotes, and layout

## Running

```bash
npm install
npm run dev
npm run dev:offline
npm run test:run
npm run lint
npm run format
npm run build
```

## Real-Data Validation

- Use `scripts/validate-real-data-consistency.cjs` when you need to compare Dashboard and Reports with a real exported settings backup
- The validator supports SOCKS5 proxies, compares per-user weekly totals, and excludes partial boundary weeks from the main verdict
- It writes Markdown and CSV summaries so the result can be reviewed without digging through raw JSON
- The `Reports` page also has an in-app weekly-vs-monthly consistency check for the currently selected week

## Common Tasks

### Add a new setting
1. Extend `Config` in `frontend/stores/useConfigStore.ts`
2. Add the default value in the store
3. Wire the field into `frontend/react/components/settings/SettingsForm.tsx`
4. Update offline/mock setup and relevant tests

### Add a new data source or dashboard signal
1. Create or extend a service in `frontend/services/`
2. Add a query hook in `frontend/react/hooks/`
3. Keep source-specific state out of generic stores unless it is shared UI state

### Modify monthly reporting
- `TimesheetPage` is the current Reports page
- Monthly mode uses `useTimesheetStore` and `useTimesheetDataFetcher`
- Calendar rendering goes through `TimesheetGrid` and `DayCell`
- Reports filters, presets, and shareable URLs flow through `useReportsURLState` plus `useUserDataStore`
- Read-only report snapshots are generated from `frontend/react/utils/reportSnapshots.ts`

## Repository Hygiene

- Generated artifacts such as `playwright-report/` and `test-results/` are ignored
- There are pre-existing product-evolution seams in naming; prefer incremental alignment over broad rewrites
