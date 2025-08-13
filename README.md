# Time Tracking (Jira) – Dev Setup

## Prerequisites
- Node.js 18+
- Bun 1.1+

## Environment
Copy `.env.example` to `.env` and set values.

```
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_PAT=your-personal-access-token
API_URL=http://localhost:3000
FRONTEND_PORT=5173
TEAM_DEVELOPERS=Alice Smith,Bob Jones
```

## Scripts (with Bun)
- `bun run server` – starts Express API on port 3000
- `bun run frontend` – starts Rspack dev server (proxies `/api` to API)
- `bun run dev` – runs both concurrently
- `bun run build` – builds frontend bundle

## Usage
1. Install deps: `bun install`
2. Start with `bun run dev`
2. Open the frontend URL printed by Rspack
3. Optionally add `?user=Display%20Name` to filter

## Notes
- The frontend uses React 18 with Rspack. The server augments worklogs with `issueKey` for correct Jira links.
- Never commit tokens. `.env` is gitignored.
- Optional `TEAM_DEVELOPERS` is a comma-separated allowlist of display names; only these users will be shown in the UI and user datalist.



