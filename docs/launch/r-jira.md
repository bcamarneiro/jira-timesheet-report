# Reddit — r/jira

**Title:**

`I built a free dashboard for Jira worklogs (open-source, self-hosted)`

## Body

I log time in Jira every day and the built-in reports never quite told me what I wanted to know — like "did I forget to log Thursday?" or "where did my week actually go?" So I built a small dashboard that reads your Jira worklogs and shows them as a heatmap, a week view, and a per-day breakdown.

What it does:

- Heatmap of the last 12 weeks, so missed days are visually obvious.
- Week and day views with per-issue and per-project totals.
- CSV export for the people who still file timesheets manually.
- Manager view that rolls up hours per direct report per week (if you have a team).
- Suggestion feed that nags you about unfilled days.

It's open-source (MIT), runs entirely in your browser, no backend collecting your data. Your Jira token stays in your browser. The only thing it needs is a tiny CORS proxy because Atlassian doesn't send CORS headers — there's a `npm run cors-proxy` command in the repo for that.

Repo: <DOMAIN>/github (link at launch)

Happy to take feature requests if you've got worklog pain points it doesn't solve yet.

## Author comments to drop

### Re: "Is there a hosted version? I don't want to run a proxy locally."

Yeah — I host the proxy myself at <DOMAIN> if you'd rather not keep a terminal open. €29/year flat (€19 if you get in early, and that rate stays locked). Exact same app, the only difference is I run the CORS proxy for you. Token still stays in your browser, proxy is stateless and never sees it persistently. Self-hosting stays free forever; the paid version is purely "I don't want to deal with the proxy."

### Re: "Does it work with Jira Server / Data Center, or just Cloud?"

Tested heavily on Cloud. Server/DC *should* work since it's the same REST endpoints, but I haven't tested it against a real DC instance — if anyone here runs DC and wants to try it, I'd love a bug report.

### Re: "Does it modify anything in Jira?"

No. Read-only. It only calls the `/rest/api/3/search` and worklog endpoints — never POSTs, never edits an issue. You can audit the network tab.
