# Time Tracking (Jira) – Dev Setup

## Prerequisites
- Node.js 18+
- Bun 1.1+

## Environment
Create a `.env` file in the root directory with the following variables:

```
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_PAT=your-personal-access-token
# JIRA_COMPONENT=INV_III  # DEPRECATED: Use project configuration instead
API_URL=http://localhost:3000
FRONTEND_PORT=5173
TEAM_DEVELOPERS=Alice Smith,Bob Jones
```

**Required variables:**
- `JIRA_DOMAIN` - Your Jira domain (e.g., your-domain.atlassian.net)
- `JIRA_PAT` - Your Jira Personal Access Token

**Optional variables:**
- `API_URL` - Backend API URL (defaults to http://localhost:3000)
- `FRONTEND_PORT` - Frontend dev server port (defaults to 5173, offline mode uses 5174)
- `TEAM_DEVELOPERS` - Comma-separated allowlist of display names; only these users will be shown in the UI and user datalist. If not set, all users will be shown.

**Deprecated variables:**
- `JIRA_COMPONENT` - **DEPRECATED**: This environment variable is deprecated. Use the project configuration settings instead to filter worklogs by Jira components. The server will still use this as a fallback if no project configuration is provided, but it's recommended to migrate to the new configuration system.

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

## Configuration
The application now supports both project-wide and personal configurations stored in the browser's localStorage:

### Project Configuration
- **Emoji Mappings**: Configure specific emojis to display next to ticket IDs in daylogs
- **Jira Components**: Filter worklogs to only include issues from specific components
- **Team Developers**: Define which users should be considered developers
- **Export/Import**: Share project configurations with team members

### Personal Configuration
- **Time Off Entries**: Manage personal time off for specific dates
- **Personal Emoji Overrides**: Override project emoji mappings for specific tickets
- **UI Preferences**: Personal display settings including default user selection
- **Export/Import**: Backup and restore personal configurations

### Accessing Settings
Click the "⚙️ Settings" button in the top-right corner of the application to access both project and personal configuration panels.

## Notes
- The frontend uses React 18 with Rspack. The server augments worklogs with `issueKey` for correct Jira links.
- Never commit tokens. `.env` is gitignored.
- Optional `TEAM_DEVELOPERS` is a comma-separated allowlist of display names; only these users will be shown in the UI and user datalist.
- **DEPRECATED**: `JIRA_COMPONENT` environment variable is deprecated in favor of project configuration. The server will still use it as a fallback if no project configuration is provided, but it's recommended to migrate to the new configuration system.



