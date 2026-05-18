# Hacker News — Show HN

**Title (78 chars):**

`Show HN: Hoursmith – open-source Jira timesheet dashboard with hosted proxy`

**URL:** `https://hoursmith.io`

## Body

I got tired of squinting at Jira's worklog reports trying to remember what I did last Thursday, so I built a small dashboard that talks to the Jira REST API and renders my worklogs as a heatmap, a week view, and a per-day breakdown. It also does a manager-style rollup if you have direct reports, and CSV export for the people who still file timesheets by hand.

The app is MIT-licensed and runs entirely in your browser. The only awkward part is that Atlassian doesn't send CORS headers on the worklog endpoints, so you need a tiny proxy in front. The repo ships one — `npm run cors-proxy` and you're done. Your Jira token never leaves the browser; the proxy is stateless and just forwards requests.

If you don't want to keep a terminal open, there's a hosted version where I run the proxy for you. Name your price — minimum €3/year, suggested €10. Same app, same code, just on my Vercel instead of yours. That's the whole paid offering — I'm not gating features.

Stack: React, Zustand, rspack, Supabase + Stripe for the hosted side. Source-available under BSL 1.1 in `/premium/` so it's all readable.

Curious what other Jira worklog pain points people have run into — happy to extend the free app if there's an obvious gap.

## Author comments to drop in the thread

### Re: "Why not just use Jira's built-in reports?"

Jira's built-in reports are fine for "how many hours did this issue accumulate," but they fall apart the moment you want per-day or per-week granularity across all your work. The worklog tab on an individual issue is per-issue; the time tracking report is per-project; there's no "show me my week" view that aggregates across projects. The heatmap also makes it visually obvious when you forgot to log a day, which is the single most useful thing for me personally. Manager rollups (sum hours per direct report per week) are the other gap — those don't exist natively unless you're on Tempo.

### Re: "Why a CORS proxy at all? Sounds sketchy."

Atlassian Cloud's REST API doesn't send `Access-Control-Allow-Origin`, so browser-only clients can't call it directly. The options are: (1) run a backend that holds your token and proxies for you, (2) run a thin pass-through proxy that just relays the browser's Authorization header. I went with (2). The token stays in browser storage; the proxy never reads or persists it — it's stateless and just rewrites the Host header. Same model whether you self-host (the MIT proxy in the repo) or use the hosted version. Source is readable in `/premium/`.

### Re: "How does this differ from Tempo / Toggl?"

It doesn't compete with them. Tempo and Toggl are time-tracking tools — you start a timer, they log time. Hoursmith doesn't track anything; it reads worklogs you've already logged in Jira and visualizes them. If you don't log worklogs in Jira at all, this tool has nothing to show you. If you log them religiously and want a better view than Jira's native one, this is for you.

### Re: "Why name-your-price? Why a floor?"

Honest answer: payment processor fees have a floor (~€0.30 + 3% on €3 is already ~13% gone), so below €3 the unit economics stop covering even the hosted proxy's Vercel bill plus the occasional support email about expired tokens. €10/year is the suggested default — that's roughly the per-user cost-to-serve. Above that is up to you; some people want to give more, that's fine. The full app stays MIT — if even €3 is a blocker, self-hosting the proxy is a five-minute setup.
