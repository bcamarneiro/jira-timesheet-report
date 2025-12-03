# Jira Timesheet Report

A browser-based time tracking dashboard that integrates with Jira to display, filter, and export team worklogs in a calendar view.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![React](https://img.shields.io/badge/react-18-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)

## Features

- **Calendar View**: View worklogs organized by day in a monthly calendar
- **Team Overview**: See all team members' time entries at a glance
- **User Filtering**: Filter by specific team member or view everyone
- **CSV Export**: Download individual or bulk timesheet reports
- **Offline Mode**: Develop and test without a Jira connection using mock data
- **Retroactive Detection**: Identify worklogs logged for past dates
- **No Backend Required**: Runs entirely in the browser

## Quick Start

### Prerequisites

- Node.js 18+ (or Bun 1.1+)
- A Jira Cloud account with API access

### Installation

```bash
# Clone the repository
git clone https://github.com/bcamarneiro/jira-timesheet-report.git
cd jira-timesheet-report

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Configuration

1. Navigate to **Settings** in the app
2. Enter your Jira credentials:
   - **Jira Host**: Your Jira domain (e.g., `your-company.atlassian.net`)
   - **Email**: Your Jira account email
   - **API Token**: [Generate one here](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Click **Test Connection** to verify
4. Go to **Timesheet** to view your worklogs

## CORS Proxy

Since this is a client-side application, you may encounter CORS errors when connecting to Jira. The included proxy solves this:

```bash
# Start the CORS proxy (in a separate terminal)
npm run cors-proxy
```

Then in **Settings**, set **CORS Proxy** to `http://localhost:8081`

## Offline Development

Test the application without a Jira connection:

```bash
npm run dev:offline
```

This mode uses [MSW (Mock Service Worker)](https://mswjs.io/) to intercept API calls and return sample data.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:offline` | Start with mock data (no Jira needed) |
| `npm run build` | Build for production |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |
| `npm run cors-proxy` | Start CORS proxy server |

## Tech Stack

- **React 18** with TypeScript
- **Zustand** for state management
- **Rspack** (Rust-based bundler) for fast builds
- **jira.js** for Jira API integration
- **Vitest** for testing
- **Biome** for linting and formatting
- **MSW** for API mocking

## Project Structure

```text
├── frontend/
│   ├── react/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   ├── stores/            # Zustand state stores
│   └── mocks/             # MSW mock handlers
├── types/                 # TypeScript type definitions
└── cors-proxy.js          # CORS proxy server
```

## Security Notes

- API tokens are stored in browser localStorage (not transmitted to any server)
- The CORS proxy runs locally and doesn't store credentials
- Keep your API tokens secure and never share them

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC License - see [LICENSE](LICENSE) for details.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and improvements.
