# Time Tracking (Jira) – Dev Setup

## Prerequisites
- Node.js 18+
- Bun 1.1+

## Environment
Create a `.env` file in the root directory with the following variables:

```
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_PAT=your-personal-access-token
JIRA_COMPONENT=INV_III
API_URL=http://localhost:3000
FRONTEND_PORT=5173
TEAM_DEVELOPERS=Alice Smith,Bob Jones
```

**Required variables:**
- `JIRA_DOMAIN` - Your Jira domain (e.g., your-domain.atlassian.net)
- `JIRA_PAT` - Your Jira Personal Access Token

**Optional variables:**
- `JIRA_COMPONENT` - Filters worklogs to only include issues from the specified component. If not set, all components will be included.
- `API_URL` - Backend API URL (defaults to http://localhost:3000)
- `FRONTEND_PORT` - Frontend dev server port (defaults to 5173, offline mode uses 5174)
- `TEAM_DEVELOPERS` - Comma-separated allowlist of display names; only these users will be shown in the UI and user datalist. If not set, all users will be shown.

## Scripts (with Bun)
- `bun run server` – starts Express API on port 3000
- `bun run frontend` – starts Rspack dev server (proxies `/api` to API)
- `bun run frontend:offline` – starts frontend with MSW for offline development
- `bun run dev` – runs both concurrently
- `bun run dev:offline` – runs frontend in offline mode (no server needed)
- `bun run build` – builds frontend bundle

## Usage
1. Install deps: `bun install`
2. Create `.env` file with your Jira credentials
3. Start with `bun run dev`
4. Open the frontend URL printed by Rspack
5. Optionally add `?user=Display%20Name` to filter

## Offline Development
For offline development without needing the Jira API or server:

1. Run `bun run dev:offline` or `bun run frontend:offline`
2. MSW will intercept API calls and return mock data
3. The app will work exactly the same but with sample data
4. Mock data includes sample worklogs for various users including "Alex Thompson", "Ian Davis", "James Wilson", etc.

Mock data is defined in `frontend/mocks/handlers.ts` and can be customized for your development needs.

## Notes
- The frontend uses React 18 with Rspack. The server augments worklogs with `issueKey` for correct Jira links.
- Never commit tokens. `.env` is gitignored.
- Optional `TEAM_DEVELOPERS` is a comma-separated allowlist of display names; only these users will be shown in the UI and user datalist.
- Optional `JIRA_COMPONENT` filters worklogs to only include issues from the specified component. If not set, all components will be included.



