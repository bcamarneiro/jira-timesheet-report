# Agents

This file provides context for AI coding agents working on this codebase.

## Project Overview

Jira Timesheet Report is a zero-backend, browser-based dashboard for viewing, filtering, and exporting Jira worklogs. Everything runs client-side — credentials are stored in `localStorage`, and API calls go directly to Jira (optionally through a local CORS proxy).

## Tech Stack

- **React 18** with **TypeScript 5.9** — strict mode enabled
- **Zustand 5** for state management — stores in `frontend/stores/`, persisted to localStorage
- **Rspack 1.5** as bundler (webpack-compatible, Rust-based) — config in `rspack.config.ts`
- **CSS Modules** with design tokens in `frontend/react/styles/tokens.css` — use existing tokens, never hardcode colors/spacing
- **Biome 2.3** for linting and formatting — run `npm run format` before committing
- **Vitest 3.2** for unit tests, **Playwright** for E2E
- **MSW 2.11** for offline mock mode (`npm run dev:offline`)
- **jira.js 5.2** for Jira Cloud REST API v2

## Architecture

```
frontend/
  react/
    components/    # UI components (calendar grid, day cells, modals, forms)
    hooks/         # Custom hooks (data fetching, calculations, URL sync)
    pages/         # Route pages (Home, Timesheet, Settings)
    utils/         # Pure functions (CSV, date helpers, formatting)
    constants/     # Shared constants
    styles/        # Global CSS, design tokens (tokens.css, global.css)
  stores/          # Zustand stores (config, timesheet data, UI state)
  mocks/           # MSW handlers and mock data
types/             # Shared TypeScript interfaces
e2e/               # Playwright E2E tests
```

### Key Stores

- **useConfigStore** — Jira connection settings + worklog permission flags. Persisted to localStorage.
- **useTimesheetStore** — Current month, worklogs, grouped data, users, loading/error state. Derived state (grouped, visibleEntries) is computed on `setData`.
- **useJiraClientStore** — Lazy-initialized `Version2Client` from jira.js. Auto-recreates when config changes.
- **useSettingsFormStore** — Form state for settings page. Separate from config to allow discard.
- **useUIStore** — UI preferences (column visibility, etc.). Persisted.

### Data Flow

1. User configures Jira host/email/token in Settings (stored in `useConfigStore`)
2. `useTimesheetDataFetcher` hook fetches worklogs for selected month via jira.js
3. Raw worklogs are enriched with issue data and stored in `useTimesheetStore.setData()`
4. `setData` computes derived state: groups by user/date, extracts issue summaries, builds visible entries
5. Components read from the store via selectors and render the calendar grid

### Worklog Operations

- Create/edit/delete go through `useWorklogOperations` hook which calls Jira REST API directly via fetch
- Worklog permissions (`canAddWorklogs`, `canEditWorklogs`, `canDeleteWorklogs`) are in config store
- Permissions are auto-detected during "Test Connection" and can be overridden in Settings

## Conventions

- **CSS**: Use tokens from `tokens.css`. All colors, spacing, font sizes, radii, shadows, transitions are tokenized. Dark mode is automatic via `prefers-color-scheme`.
- **Components**: Functional components only. Keep under ~150 lines. Use CSS Modules (`.module.css`).
- **State**: Read from Zustand stores via selectors, not props, for shared state. Props for component-specific data.
- **Testing**: Unit tests in `__tests__/` next to the code. Use existing mock helpers. E2E tests in `e2e/`.
- **Formatting**: Biome handles everything. Single quotes, tab indentation, organized imports.

## Running

```bash
npm install
npm run dev:offline    # development with mock data (port 5174)
npm run dev            # development against real Jira (port 5173)
npm run test:run       # run all tests
npm run lint           # check linting
npm run format         # auto-format
npm run build          # production build
```

## Common Tasks

### Adding a new setting
1. Add the field to `Config` interface in `frontend/stores/useConfigStore.ts`
2. Add default value in the store's initial state
3. Add form field in `frontend/react/components/settings/SettingsForm.tsx`
4. Update mock config in `frontend/main.tsx` (offline mode) and test files

### Adding a new component
1. Create `ComponentName.tsx` + `ComponentName.module.css` in the appropriate directory
2. Use tokens from `tokens.css` for all visual values
3. Import as `import * as styles from './ComponentName.module.css'`

### Modifying the calendar grid
- `TimesheetGrid` renders `DayCell` for each day of the month
- `DayCell` handles worklog display, create/edit/delete modals
- Day coloring is based on `useDayCalculation` (complete/incomplete/overtime/weekend)

## Known Type Issues

There are a few pre-existing TypeScript errors around `JiraWorklog` vs `EnrichedJiraWorklog` compatibility and optional fields in jira.js types. These don't affect runtime behavior. Fix them if you touch those files, but don't let them block other work.
