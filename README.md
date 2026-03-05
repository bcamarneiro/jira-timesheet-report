<p align="center">
  <h1 align="center">Jira Timesheet Report</h1>
  <p align="center">
    A zero-backend, browser-based dashboard for viewing, filtering, and exporting<br/>your team's Jira worklogs in a clean calendar interface.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Rspack-1.5-ff7043?logo=webpack&logoColor=white" alt="Rspack" />
  <img src="https://img.shields.io/badge/Zustand-5-433e38?logo=npm&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/license-ISC-blue" alt="License" />
</p>

---

## Why?

Jira's built-in time reporting is limited. This tool gives you a **calendar-based view** of your team's worklogs with filtering, CSV exports, and retroactive logging detection — all running entirely in the browser with no server to deploy.

## Features

- **Monthly calendar view** — Worklogs organized day-by-day, with daily totals and summaries
- **Team overview table** — Aggregated view of all team members: days worked, entries, total hours
- **User filtering** — View a specific team member or the full team at once
- **CSV export** — Download individual or bulk timesheet reports (per-user and summary)
- **Retroactive detection** — Spot worklogs that were logged for past dates after the fact
- **Time-off tracking** — Record time-off hours alongside work entries
- **Offline mode** — Develop and test with mock data, no Jira credentials needed
- **URL-synced filters** — Selected user and month are reflected in the URL for easy bookmarking
- **CORS proxy included** — Local proxy with optional SOCKS5 support for corporate networks

## Getting Started

### Prerequisites

- **Node.js 18+** (or Bun 1.1+)
- A **Jira Cloud** account with [API token access](https://id.atlassian.com/manage-profile/security/api-tokens)

### Install & Run

```bash
git clone https://github.com/bcamarneiro/jira-timesheet-report.git
cd jira-timesheet-report
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Configure Jira

1. Go to **Settings** in the app
2. Fill in your credentials:

   | Field | Value |
   |-------|-------|
   | **Jira Host** | `your-company.atlassian.net` |
   | **Email** | Your Jira account email |
   | **API Token** | [Generate one here](https://id.atlassian.com/manage-profile/security/api-tokens) |

3. Click **Test Connection** to verify
4. Navigate to **Timesheet** to see your worklogs

> Credentials are stored in your browser's localStorage only — they never leave your machine.

## CORS Proxy

Since this is a client-side app, browser CORS policies may block requests to Jira. The included proxy solves this:

```bash
# In a separate terminal
npm run cors-proxy
```

Then set the **CORS Proxy** field in Settings to `http://localhost:8081`.

For corporate networks behind a SOCKS5 proxy:

```bash
npm run cors-proxy:socks
```

## Offline Development

Test everything without a Jira connection:

```bash
npm run dev:offline
```

This uses [MSW (Mock Service Worker)](https://mswjs.io/) to intercept API calls and return sample data on port 5174.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run dev:offline` | Start with mock data (port 5174) |
| `npm run build` | Production build to `dist/` |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Check code with Biome |
| `npm run format` | Auto-format with Biome |
| `npm run cors-proxy` | Start CORS proxy (port 8081) |
| `npm run cors-proxy:socks` | CORS proxy via SOCKS5 |

## How It Works

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser    │─────▶│  CORS Proxy  │─────▶│  Jira Cloud  │
│  (React App) │◀─────│  (localhost)  │◀─────│     API      │
└─────────────┘      └──────────────┘      └──────────────┘
       │
       ▼
  localStorage
  (credentials,
   preferences,
   time-off data)
```

1. **Settings** — You configure your Jira host, email, and API token. These are saved in `localStorage`.
2. **Data fetching** — The app queries Jira's REST API (via the CORS proxy) for worklogs in the selected month, fetching issue details in parallel for performance.
3. **Grouping** — Worklogs are grouped by user and date, then rendered in a calendar grid.
4. **Filtering** — Select a specific user or view the full team. The selected filter syncs to the URL.
5. **Export** — Download CSV reports per user or for the entire team with one click.

## Project Structure

```
├── frontend/
│   ├── react/
│   │   ├── components/       # UI components (calendar, day cells, modals, etc.)
│   │   ├── hooks/            # Data fetching, calculations, URL sync
│   │   ├── pages/            # Home, Timesheet, Settings pages
│   │   └── utils/            # CSV builder, date helpers, formatting
│   ├── stores/               # Zustand state (config, timesheet, UI, time-off)
│   └── mocks/                # MSW handlers + mock data for offline mode
├── types/                    # TypeScript interfaces (worklogs, issues)
├── cors-proxy.js             # Node.js CORS proxy with SOCKS5 support
├── rspack.config.ts          # Build configuration
├── vitest.config.ts          # Test configuration
└── biome.json                # Linter & formatter rules
```

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **UI** | React 18 + TypeScript | Type-safe component architecture |
| **State** | Zustand | Minimal boilerplate, built-in localStorage persistence |
| **Bundler** | Rspack | Rust-based, significantly faster than Webpack |
| **Jira client** | jira.js | Official JS client for Jira Cloud REST API |
| **Testing** | Vitest + Playwright | Unit/integration tests + E2E browser tests |
| **Linting** | Biome | Fast, unified linter + formatter (replaces ESLint + Prettier) |
| **Mocking** | MSW | Intercepts network requests at the service worker level |

## Security

- API tokens are stored **only** in your browser's `localStorage` — never transmitted to any third-party server
- The CORS proxy runs **locally** and does not log or store credentials
- All Jira communication uses HTTPS
- No analytics, tracking, or external services

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

```bash
# Fork & clone, then:
npm install
npm run dev:offline    # develop without Jira
npm run test           # run tests
npm run lint           # check code quality
```

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features including worklog CRUD, charts, dark mode, Excel/PDF export, and more.

## License

[ISC](LICENSE)
