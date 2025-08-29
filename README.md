# Time Tracking (Jira) – Dev Setup

## Prerequisites
- Node.js 18+
- Bun 1.1+

## Quick Start
1. Install dependencies: `bun install`
2. Start the development server: `bun run dev`
3. Open the frontend URL printed by Rspack
4. Configure your JIRA settings in the application

## Scripts (with Bun)
- `bun run server` – starts Express API on port 3000
- `bun run frontend` – starts Rspack dev server (proxies `/api` to API)
- `bun run frontend:offline` – starts frontend with MSW for offline development
- `bun run dev` – runs both concurrently
- `bun run dev:offline` – runs frontend in offline mode (no server needed)
- `bun run build` – builds frontend bundle

## Configuration
The application uses a modern configuration system stored in the browser's localStorage. No environment variables are required!

### Initial Setup
1. Start the application with `bun run dev`
2. Navigate to the Settings page (⚙️ icon in the top-right)
3. Configure your JIRA credentials and project settings

### Project Configuration
- **JIRA Domain**: Your JIRA domain (e.g., yourcompany.atlassian.net)
- **Team Developers**: List of team members to include in the timesheet
- **JIRA Components**: Filter worklogs to only include issues from specific components
- **Emoji Mappings**: Configure specific emojis to display next to ticket IDs
- **Export/Import**: Share project configurations with team members

### Personal Configuration
- **JIRA Personal Access Token**: Your JIRA PAT for API access
- **Your Name**: Your display name in the application
- **Time Off Entries**: Manage personal time off for specific dates
- **Personal Emoji Overrides**: Override project emoji mappings for specific tickets
- **UI Preferences**: Personal display settings
- **Export/Import**: Backup and restore personal configurations

### Accessing Settings
Click the "⚙️ Settings" button in the top-right corner of the application to access both project and personal configuration panels.

## Offline Development
For offline development without needing the Jira API or server:

1. Run `bun run dev:offline` or `bun run frontend:offline`
2. MSW will intercept API calls and return mock data
3. The app will work exactly the same but with sample data
4. Mock data includes sample worklogs for various users including "Alex Thompson", "Ian Davis", "James Wilson", etc.

Mock data is defined in `frontend/mocks/handlers.ts` and can be customized for your development needs.

## Usage
1. Install deps: `bun install`
2. Start with `bun run dev`
3. Open the frontend URL printed by Rspack
4. Configure your JIRA settings in the Settings page
5. Optionally add `?user=Display%20Name` to filter by user

## Notes
- The frontend uses React 18 with Rspack. The server augments worklogs with `issueKey` for correct Jira links.
- All configuration is stored securely in your browser's localStorage
- No environment variables or server-side configuration required
- Configuration is automatically saved and restored between sessions
- Project settings can be shared with team members via export/import



