# Hoursmith

Hoursmith is a personal Jira worklog dashboard for developers, tech leads, and engineering managers who already live in Jira and just want their week to make sense. It gives you a heatmap of your logged time, focused week and day views, smart suggestions for the gaps, and one-click CSV exports — all running client-side against your own Jira instance, with no backend to operate and no third party in the middle.

![Hoursmith dashboard](docs/screenshot.png)

## Free and Premium

Hoursmith is open source. The whole app is in this repository under MIT. There is also a hosted Premium tier for people who would rather not run a local proxy.

| | Free (self-host) | Premium (hosted) |
|---|---|---|
| Full app, all features | Yes | Yes |
| Worklog dashboard, heatmap, reports, CSV | Yes | Yes |
| CORS proxy | You run `npm run cors-proxy` locally | We host it, you sign in |
| Terminal required | Yes | No |
| Price | Free, forever | ~€4 / month |
| Status | Available now | Coming soon |

Premium is a pure quality-of-life upgrade. The app code is identical. The only thing you pay for is not having to keep a proxy process running on your machine.

Premium is not launched yet. You can register interest on the [pricing page](https://hoursmith.io/pricing) (placeholder — coming soon).

## Self-host the Free tier

Requirements: Node.js 18+ and a Jira Cloud account with an API token.

```bash
git clone https://github.com/bcamarneiro/jira-timesheet-report.git
cd jira-timesheet-report
npm install
npm run dev
```

In a second terminal:

```bash
npm run cors-proxy
```

Then open `http://localhost:5173` and finish setup in the in-app wizard.

### Why the CORS proxy?

Jira Cloud's REST API does not send CORS headers for browser clients, so a pure SPA cannot call it directly from `localhost` without help. The bundled proxy (`cors-proxy.js`) is a small Node script that forwards requests from your browser to Jira on the same machine. Nothing leaves your computer.

For SOCKS5 environments, use `npm run cors-proxy:socks` instead.

## Security

Hoursmith never sends your Jira credentials anywhere except Jira.

- Your Jira host, email, and API token live in your browser's `localStorage`.
- The local CORS proxy is a transparent forwarder. It does not log, store, or persist tokens.
- The eventual hosted Premium proxy will follow the same rule: tokens stay in your browser and are only used to sign the outbound request to your Jira instance for the duration of that request.

If you stop using Hoursmith, clear site data in your browser and revoke the API token in Jira.

## License

The repository uses a split license:

- Everything at the repository root is [MIT](LICENSE). This is the app you self-host.
- Everything under [`/premium`](premium) is [BSL 1.1](premium/LICENSE). This is the code that powers the hosted Premium proxy. It is source-available so you can read and audit it, but it is not licensed for you to run a competing hosted service.

The boundary is enforced in CI via `npm run check:premium-boundary`. If you only care about the open-source app, you can ignore `/premium` entirely.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

A CLA will be required before non-trivial contributions can be merged (via cla-assistant.io). The CLA bot is not yet wired up — coming soon. Small fixes and documentation tweaks are fine to send in the meantime.

## Status

Hoursmith is under active development. The open-source app is usable today; Hoursmith Premium is not yet launched. The public direction lives in [ROADMAP.md](ROADMAP.md).
