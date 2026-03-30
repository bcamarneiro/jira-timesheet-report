# Teammate Onboarding

This guide is for a teammate opening Jira Timesheet Report for the first time.

If everything is configured well, the first run should take only a few minutes.

## What The App Is For

There are two main places in the app:

- `Dashboard`: your personal weekly close workflow
- `Reports`: team reporting and monthly reporting

If you are unsure where to start, begin with `Dashboard`.

## Before You Start

You need:

- the app URL
- your Jira email
- your Jira API token
- a `Share Pack` if your team lead or maintainer gave you one
- a proxy URL only if your environment needs it for Jira access

## First-Time Setup

1. Open the app
2. Go to `Settings`
3. If you received a `Share Pack`, click `Import` first
4. Use the setup wizard to fill in:
   - Jira host
   - email
   - API token
   - optional CORS proxy
5. Run diagnostics
6. Save only after the setup is marked ready

If the wizard succeeds, you are ready to use the app.

## If You Received A Share Pack

A `Share Pack` is safe to share with teammates because it excludes secrets.

It can include:

- Jira host
- JQL defaults
- allowed users
- calendar mappings
- other safe team defaults

It does not include:

- your token
- personal secret values

After importing a `Share Pack`, you still need to fill in your own credentials.

## Your First Useful Flow

The easiest first win is:

1. Open `Dashboard`
2. Review the current week
3. Check missing/gap days
4. Export a weekly summary or CSV if needed

Once that works, move to `Reports` if you need team or monthly reporting.

## Using Dashboard

Use `Dashboard` for:

- seeing missing time in the current week
- reviewing suggestions
- copying useful patterns from the previous week
- exporting your weekly summary

Good habits:

- check it near the end of the week
- use the weekly close assistant as the final pass

## Using Reports

Use `Reports` for:

- weekly team compliance
- monthly per-user reporting
- manager mode trend review
- read-only snapshots for sharing

Useful features inside `Reports`:

- search/filter by person
- saved presets
- shareable URLs
- weekly/monthly consistency validation
- HTML and Markdown snapshots

## Snapshots And Sharing

If you need to share a report without sharing access or settings:

- use `Snapshot HTML` for a read-only, easy-to-view export
- use `Snapshot MD` when Markdown is more useful for documentation or chat tools

If you want someone else to reopen the same filtered report in the app:

- use `Copy share link`

## Installing As An App

If your browser supports it, the app can be installed as a lightweight PWA.

That is useful when:

- you use it every week
- you want it to feel like a dedicated tool instead of a random browser tab

## Troubleshooting

### Diagnostics Fail

Common causes:

- wrong Jira host
- wrong token
- missing proxy in an environment that requires one
- insufficient Jira permissions

What to do:

1. Re-open `Settings`
2. Re-run diagnostics
3. Fix the first failing item instead of changing everything at once

### Dashboard Looks Empty

Check:

- whether the selected week has worklogs
- whether your Jira credentials are valid
- whether diagnostics are green

### Reports Looks Different From Dashboard

This is sometimes expected.

`Dashboard` is personal.  
`Reports` can be scoped to a team using `allowedUsers`.

If something feels wrong:

1. check the reporting scope in `Settings`
2. run the in-app consistency validation from `Reports`
3. ask the maintainer whether your team uses a scoped `Share Pack`

### CORS Errors

If browser requests to Jira are blocked:

- ask whether your team uses the local proxy
- if yes, enter the proxy URL in `Settings`

## When To Ask For Help

Ask for help after you have:

1. run diagnostics
2. noted whether the problem is in `Setup`, `Dashboard`, or `Reports`
3. captured the exact error message if one is shown

That makes support much faster.

## Quick Success Checklist

You are set up correctly when:

- diagnostics are green
- `Dashboard` loads your week
- `Reports` opens
- you can export at least one useful artifact

If those four things work, you are ready to use the app normally.
