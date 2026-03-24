# Agents

This file provides context for AI coding agents working on this codebase.

## Project Overview

Jira Timesheet Report is a zero-backend, browser-based Jira workspace with two main surfaces:

- **Dashboard** for weekly gap triage, suggestions, reminders, and quick exports
- **Reports** for weekly team compliance and monthly calendar-based reporting

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

## Repository Hygiene

- Generated artifacts such as `playwright-report/` and `test-results/` are ignored
- There are pre-existing product-evolution seams in naming; prefer incremental alignment over broad rewrites
