# Time Tracking (Jira) – Dev Setup

## Prerequisites
- Node.js 18+
- Bun 1.1+

## Architecture
This is a frontend-only application that connects directly to Jira's API using the jira.js library. All configuration is done in the browser through the Settings page and persisted to localStorage.

**No backend server is required.**

## Scripts (with Bun)
- `bun run start` – starts Rspack dev server on port 5173
- `bun run dev` – same as start (development mode)
- `bun run dev:offline` – runs frontend in offline mode with mock data (no Jira connection needed)
- `bun run build` – builds frontend bundle for production
- `bun run lint` – runs Biome linter
- `bun run format` – formats code with Biome
- `bun run check` – runs Biome check with auto-fix

## Usage
1. Install deps: `bun install`
2. Start with `bun run dev`
3. Open http://localhost:5173
4. Click on "Settings" to configure your Jira credentials:
   - Jira Host (e.g., your-domain.atlassian.net)
   - Email (your Jira email)
   - API Token (generate from https://id.atlassian.com/manage-profile/security/api-tokens)
   - CORS Proxy (optional, only needed if you encounter CORS issues)
5. Navigate to "Timesheet" to view your worklogs

## Offline Development
For offline development without needing a Jira connection:

1. Run `bun run dev:offline`
2. MSW (Mock Service Worker) will intercept API calls and return mock data
3. The app will work exactly the same but with sample data
4. No Jira credentials needed - default mock configuration is automatically applied
5. Mock data includes sample worklogs for various users including "Alex Thompson", "Ian Davis", "James Wilson", etc.

Mock data is defined in:
- `frontend/mocks/handlers.ts` - MSW request handlers
- `frontend/mocks/MockWorklogs.ts` - Sample worklog data
- `frontend/mocks/MockIssueSummaries.ts` - Sample issue summaries
- `frontend/mocks/MockTeamDevelopers.ts` - Sample user names

## Notes
- The frontend uses React 18 with Rspack and Zustand for state management
- All settings are persisted to browser localStorage
- Never commit tokens. Keep your API tokens secure
- The app connects directly to Jira's API from the browser (CORS proxy may be needed for some domains)



