<p align="center">
  <h1 align="center">Jira Timesheet Report</h1>
  <p align="center">
    A zero-backend Jira workspace for weekly worklog triage, monthly reporting,<br/>team visibility, and exports.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Rspack-1.5-ff7043?logo=webpack&logoColor=white" alt="Rspack" />
  <img src="https://img.shields.io/badge/TanStack_Query-5-ff4154?logo=reactquery&logoColor=white" alt="TanStack Query 5" />
  <img src="https://img.shields.io/badge/Zustand-5-433e38?logo=npm&logoColor=white" alt="Zustand 5" />
</p>

---

## What It Is

Jira Timesheet Report is a client-side app for working with Jira worklogs without a backend. It combines:

- A **weekly dashboard** for finding gaps, copying previous work, and exporting summaries
- A **reports workspace** with weekly team compliance and monthly calendar reporting
- **Direct worklog CRUD** against Jira
- **Offline mode** backed by MSW for development and demos

Credentials stay in `localStorage`, and API requests go directly to Jira, optionally through the included local CORS proxy.

## Current Product Areas

- **Dashboard**: weekly gap-focused workflow with suggestions, templates, pinned items, heatmap, a weekly close assistant, reminders, and Markdown/CSV export
- **Reports**: weekly team table plus monthly calendar reporting with local people filters, saved presets, shareable URLs, read-only HTML/Markdown snapshots, an in-app weekly-vs-monthly consistency check, and manager mode with multi-week trend signals
- **Settings**: guided setup wizard, diagnostics for trust/readiness, normalized host/proxy config, permissions, JQL, theme, rounding, calendar feeds, auxiliary source credentials, full backups, and secret-safe share packs
- **Installability**: PWA manifest plus install prompt support for static hosting and GitHub Pages
- **Offline mode**: mock data via MSW on port `5174`

## Tech Stack

| Layer | Choice |
|-------|--------|
| UI | React 18 + TypeScript 5.9 |
| State | Zustand 5 |
| Server state | TanStack Query 5 |
| Bundler | Rspack 1.5 |
| Styling | CSS Modules + shared design tokens |
| Testing | Vitest + Playwright |
| Mocking | MSW 2.11 |
| Jira access | Direct `fetch` calls to Jira REST API v2 |

## Getting Started

### Prerequisites

- Node.js 18+
- A Jira Cloud account with API token access

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Open `http://localhost:5173`.

For offline development:

```bash
npm run dev:offline
```

Open `http://localhost:5174`.

## Rollout And Onboarding Docs

- Maintainer rollout guide: `docs/rollout-guide.md`
- Teammate onboarding guide: `docs/teammate-onboarding.md`

## Configure Jira

1. Open `Settings`
2. Use the setup wizard to fill in Jira host, email, and API token
3. Optionally set a local CORS proxy URL and reporting scope
4. Run the built-in diagnostics and Jira connection test
5. Save once the setup is marked ready
6. Use `Dashboard` for your weekly workflow and `Reports` for team/month views
7. Use `Backup`, `Share Pack`, and `Import` in `Settings` to move between full local restores and teammate-friendly setup packs
8. Use `Reports` presets and share links when you want to reuse or hand off the same reporting slice

## CORS Proxy

If the browser blocks Jira requests with CORS errors, run the included local proxy:

```bash
npm run cors-proxy
```

Then set `http://localhost:8081` in the `CORS Proxy` setting.

For SOCKS5 environments:

```bash
npm run cors-proxy:socks
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the app against real Jira |
| `npm run dev:offline` | Start the app with MSW mock data |
| `npm run build` | Build production assets |
| `npm run build:pages` | Build the GitHub Pages variant with hash routing |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright tests |
| `npm run lint` | Run Biome lint checks |
| `npm run format` | Format the repo with Biome |
| `npm run cors-proxy` | Start the local CORS proxy |
| `npm run cors-proxy:socks` | Start the local CORS proxy through SOCKS5 |

GitHub Pages deployment is automated via `.github/workflows/deploy-pages.yml` and uses hash routing plus a repository base path so direct links remain reliable on static hosting.

The Pages build also ships a manifest and service worker so the app can be installed as a lightweight PWA on supported browsers.

Route-level lazy loading and chunk splitting are enabled so static deployments do not ship the full workspace on first paint.

## Real-Data Validation

For a quick product-level check, the `Reports` page can validate the current weekly table against the monthly source directly in the UI.

For consistency checks against a real exported settings backup, use:

```bash
node scripts/validate-real-data-consistency.cjs ~/Downloads/jira-timesheet-settings.json
```

For SOCKS5 environments:

```bash
node scripts/validate-real-data-consistency.cjs \
  ~/Downloads/jira-timesheet-settings.json \
  socks5h://127.0.0.1:8080 \
  2
```

The validator:

- compares `Reports` weekly vs monthly totals for the requested period
- compares per-user weekly totals, not just aggregates
- treats only full weeks inside the requested window as part of the main conclusion
- writes Markdown and CSV reports to `./tmp` by default

## Architecture Snapshot

```text
frontend/
  react/
    components/    UI building blocks and page sections
    hooks/         Data fetching and derived UI behavior
    pages/         Home, Dashboard, Reports, Settings
    utils/         Pure helpers for date, CSV, formatting, summaries
    styles/        Global CSS and tokens
  services/        Jira and external-source fetch logic
  stores/          Zustand app state
  mocks/           MSW handlers and sample data
types/             Shared TS types
e2e/               Playwright coverage
```

## Notes For Contributors

- `npm run test:run` currently passes
- `Settings` backups are plain JSON and currently include `config` plus `calendarMappings`
- Generated artifacts such as `playwright-report/` and `test-results/` are ignored
- The app has evolved beyond a simple timesheet viewer; keep docs and route names aligned with the current product areas

## License

[ISC](LICENSE)
