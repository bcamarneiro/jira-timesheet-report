# Linear Project Draft

This document is structured so the items can be copied into Linear with minimal rewriting.

## Project

- **Name**: Productization and Adoption Push
- **Goal**: make Jira Timesheet Report easy to discover, configure, trust, and use weekly
- **Success metric**: a teammate can open the hosted app, complete setup, and use Dashboard or Reports without pairing

## Suggested Milestones

### Milestone 1: Hosted and Onboardable

- GitHub Pages deployment
- landing page refresh
- setup wizard
- diagnostics
- PWA basics

### Milestone 2: Weekly Workflow Value

- weekly close assistant
- suggestion explainability
- recent issue history
- report filters and presets

### Milestone 3: Team Trust and Distribution

- in-app consistency validation
- manager view
- read-only snapshots
- docs, screenshots, and rollout guide

## Suggested Labels

- `product`
- `architecture`
- `onboarding`
- `dashboard`
- `reports`
- `settings`
- `distribution`
- `pwa`
- `diagnostics`
- `trust`

## Issue Drafts

## 1. Deploy the app to GitHub Pages

- **Type**: Feature
- **Priority**: High
- **Labels**: `distribution`, `architecture`

### Why

The product is already zero-backend, so static hosting is the lowest-friction distribution path. Right now sharing still depends too much on cloning the repo and running it locally.

### Scope

- add a GitHub Pages deployment workflow
- configure the production build for the repository base path
- make SPA routing work on GitHub Pages
- document the hosted URL and deployment flow

### Acceptance Criteria

- a production build can be deployed automatically from `main`
- opening a deep link directly still loads the app correctly
- the repo contains deployment docs for maintainers

### Notes

The main architecture decision here is route strategy: `404.html` redirect fallback vs a GitHub Pages-specific hash router build.

## 2. Add a landing page that explains the product and routes users clearly

- **Type**: Feature
- **Priority**: High
- **Labels**: `product`, `onboarding`

### Why

The app already has real value, but new users still land in a tool-shaped experience instead of a product-shaped one.

### Scope

- tighten the homepage copy
- make `Dashboard`, `Reports`, `Demo`, and `Setup` explicit calls to action
- add lightweight screenshots or visual cues
- make the first decision obvious: demo vs connect to Jira

### Acceptance Criteria

- a first-time user can understand the product in under 30 seconds
- the home surface presents clear paths for demo and setup
- the content matches the current product language

## 3. Build a first-run setup wizard

- **Type**: Feature
- **Priority**: High
- **Labels**: `onboarding`, `settings`

### Why

The current settings page is powerful but still reads like a configuration form. A guided setup flow will lower adoption friction significantly.

### Scope

- add a step-based first-run wizard
- support `Personal`, `Team Reports`, and `Demo` entry paths
- guide users through host/email/token, optional proxy, and JQL basics
- finish with a connection test and suggested next step

### Acceptance Criteria

- a first-time user can complete setup without opening Settings directly
- failed validation explains what to fix next
- the wizard can be skipped after successful completion

## 4. Add a diagnostics page for connectivity, permissions, and source health

- **Type**: Feature
- **Priority**: High
- **Labels**: `diagnostics`, `trust`

### Why

When setup fails, users currently need to infer whether the problem is CORS, credentials, permissions, or source configuration.

### Scope

- add a dedicated diagnostics page or panel
- show Jira connectivity, auth status, permission summary, and source status
- surface actionable next steps for common failure modes
- include a summary of the last successful fetch time

### Acceptance Criteria

- diagnostics can distinguish between auth, permission, proxy, and source errors
- the page links users back to the relevant settings to fix the problem
- the diagnostics output is readable by non-developers

## 5. Add versioned config migrations

- **Type**: Tech Debt / Architecture
- **Priority**: High
- **Labels**: `architecture`, `settings`

### Why

As the product grows, persisted local settings need a durable migration path to avoid breaking older configs and backups.

### Scope

- add a config schema version
- add migration helpers for existing persisted state and JSON backups
- make import resilient to older backup formats
- document migration rules

### Acceptance Criteria

- opening the app with an older local config does not break the experience
- importing an older backup migrates it safely
- tests cover at least one historical migration path

## 6. Add secret-safe share packs for config

- **Type**: Feature
- **Priority**: Medium
- **Labels**: `settings`, `distribution`

### Why

Teams need a safe way to share a host/JQL/allowed-users preset without sending tokens around.

### Scope

- add a `share pack` export mode that strips token and secret fields
- add a matching import path
- make the UI explicit about what is and is not included

### Acceptance Criteria

- a share pack excludes secret values by default
- importing a share pack preserves safe defaults and prompts for missing secrets
- copy in the UI makes the distinction clear

## 7. Ship the app as an installable PWA

- **Type**: Feature
- **Priority**: Medium
- **Labels**: `pwa`, `distribution`

### Why

Installability makes the app feel like a real tool and reduces the "temporary utility page" feeling.

### Scope

- add web manifest and icons
- define app theme and metadata
- support an offline shell for the static app
- add install guidance in the UI

### Acceptance Criteria

- the app is installable on supported browsers
- the hosted app has valid manifest metadata
- users can reopen the installed app without confusion

## 8. Add a weekly close assistant to Dashboard

- **Type**: Feature
- **Priority**: High
- **Labels**: `dashboard`, `product`

### Why

The strongest product story is helping a person finish the week quickly and confidently.

### Scope

- add a compact weekly close checklist
- show missing days, suspicious gaps, and suggestion opportunities
- support quick actions from the checklist into Dashboard actions

### Acceptance Criteria

- the dashboard clearly communicates whether the week is "ready to close"
- the assistant surfaces meaningful blockers and next actions
- users can reach the affected day or action with one click

## 9. Make suggestions more explainable and trustworthy

- **Type**: Feature
- **Priority**: Medium
- **Labels**: `dashboard`, `trust`

### Why

Suggestions are useful, but they become much more trustworthy if users can understand why they were produced.

### Scope

- add concise reasons for each suggestion
- surface origin, confidence, and similarity cues consistently
- improve the empty and error states for suggestion sources

### Acceptance Criteria

- each suggestion can answer "why am I seeing this?"
- suggestion cards are readable without opening dev tools or docs
- the feature remains compact and fast to scan

## 10. Add recent issue history and faster reuse flows

- **Type**: Feature
- **Priority**: Medium
- **Labels**: `dashboard`

### Why

People often log to the same small set of issues week after week. Reuse should be faster than typing.

### Scope

- store recent issue history locally
- expose it in issue selection and quick-add flows
- integrate it with favorites and templates without duplicating concepts

### Acceptance Criteria

- users can quickly pick from recently used issues
- recent history feels like a lightweight accelerator, not another complex system
- local persistence behaves predictably

## 11. Improve Reports with filters, presets, and shareable URLs

- **Type**: Feature
- **Priority**: High
- **Labels**: `reports`, `product`

### Why

Reports already have useful data, but they still need better slicing and repeatability for real team usage.

### Scope

- add filters for project, issue type, and component where data supports it
- support saved report presets
- make current report state shareable via URL

### Acceptance Criteria

- users can reproduce a report view without manually re-entering filters
- URLs restore a meaningful report state
- presets are persisted and easy to manage

## 12. Add in-app consistency validation for the selected period

- **Type**: Feature
- **Priority**: Medium
- **Labels**: `trust`, `diagnostics`, `reports`

### Why

We already have a script for real-data validation. Bringing that confidence into the product will make the tool easier to trust.

### Scope

- add a UI action to validate current period consistency across relevant views
- reuse shared validation logic where possible
- present the result in a non-technical summary

### Acceptance Criteria

- users can run a validation for the selected period
- the result clearly says whether totals match
- any mismatch includes enough detail to investigate the issue

## 13. Add a manager mode with multi-week trends

- **Type**: Feature
- **Priority**: Medium
- **Labels**: `reports`, `product`

### Why

Team leads often need trends and summaries across multiple weeks, not just a single weekly snapshot.

### Scope

- add a manager-focused report view
- show gap/compliance trends over multiple weeks
- keep the experience simple and export-friendly

### Acceptance Criteria

- a lead can see trends without manually exporting several weeks
- the view stays readable on desktop and usable on smaller screens
- totals remain consistent with the underlying weekly data

## 14. Add read-only snapshot export for sharing

- **Type**: Feature
- **Priority**: Medium
- **Labels**: `reports`, `distribution`

### Why

Teams sometimes need to share a report snapshot without sharing credentials or asking the recipient to configure the app.

### Scope

- support exporting a read-only snapshot for a selected view
- favor HTML or a portable static format
- ensure no secrets are embedded

### Acceptance Criteria

- a user can generate a shareable report snapshot
- the snapshot contains enough context to be useful on its own
- exported files are secret-safe

## 15. Improve docs, screenshots, and rollout guide for teammates

- **Type**: Task
- **Priority**: Medium
- **Labels**: `product`, `onboarding`, `distribution`

### Why

Even with good product changes, rollout still benefits from concise guidance for teammates.

### Scope

- refresh README with hosted usage and setup screenshots
- add a short rollout guide for internal teammates
- explain demo mode, setup, share packs, and diagnostics

### Acceptance Criteria

- documentation matches the product surfaces and setup flow
- a teammate can onboard using docs plus the app itself
- the rollout guide is short enough to actually be used
