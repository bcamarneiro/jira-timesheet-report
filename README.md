# Time Tracking (Jira) – Dev Setup

## Prerequisites
- Node.js 18+

## Environment
Copy `.env.example` to `.env` and set values.

```
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_PAT=your-personal-access-token
API_URL=http://localhost:3000
FRONTEND_PORT=5173
```

## Scripts
- `npm run server` – starts Express API on port 3000
- `npm run frontend` – starts Rspack dev server (proxies `/api` to API)
- `npm run dev` – runs both concurrently
- `npm run build` – builds frontend bundle

## Usage
1. Start with `npm run dev`
2. Open the frontend URL printed by Rspack
3. Optionally add `?user=Display%20Name` to filter

## Notes
- The frontend uses `lit`. The server augments worklogs with `issueKey` for correct Jira links.
- Never commit tokens. `.env` is gitignored.



