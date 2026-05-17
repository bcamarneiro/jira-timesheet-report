# Twitter/X + LinkedIn

Two registers, one set of facts. Twitter is a thread; LinkedIn is one longer post.

## Twitter / X thread

### Tweet 1

Shipped Hoursmith today — an open-source dashboard for your Jira worklogs.

Heatmap, week view, day breakdown, CSV export. The thing Jira's built-in reports never quite gave me.

<SCREENSHOT>

hoursmith.io

### Tweet 2

What it does:

- Heatmap of the last 12 weeks so missed days are obvious
- Per-day and per-week totals across all projects
- Manager rollup if you have direct reports
- CSV export for legacy timesheet workflows

### Tweet 3

Free vs paid:

The app is MIT-licensed and runs locally. 100% of the features, forever.

Premium (€4/mo) is the same app, but I host the CORS proxy so you don't need a terminal. That's the only difference. No gated features.

### Tweet 4

If you log time in Jira and have ever thought "where did my week go" — give it a try.

hoursmith.io

Repo and self-host instructions linked from the site.

### Tweet 5 (optional)

Built with rspack, React, Zustand. Supabase + Stripe for the paid side. Deployed on Vercel.

Source-available end to end — MIT at the root, BSL 1.1 for the hosted-proxy code under /premium/. You can read all of it.

## LinkedIn post

I shipped Hoursmith today.

It's a small product I've been building on evenings for the last eight months — an open-source dashboard that reads your Jira worklogs and gives you the views Jira's built-in reports never quite did: a heatmap of the last twelve weeks so missed days are visually obvious, a per-week and per-day breakdown across all your projects, a manager rollup if you have direct reports, and CSV export for the people who still file timesheets by hand.

The full app is MIT-licensed and runs locally. There is a paid version (Hoursmith Premium, €4/mo) but the only difference is that I host the small CORS proxy that Atlassian's API requires. Same features, same data, just no terminal. I considered building a "Team tier" with shared dashboards and scheduled reports, and cut all of it from scope — I'd rather ship one feature I can stand behind than three I can't support.

It is built with React, Zustand, and rspack on the front end, Supabase and Stripe on the paid side, deployed on Vercel. The source is fully readable — MIT at the root, BSL 1.1 under `/premium/` for the hosted-proxy code.

If you log time in Jira and have ever wondered where your week went, I'd love your feedback.

hoursmith.io
