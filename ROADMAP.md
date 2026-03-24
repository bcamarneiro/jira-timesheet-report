# Jira Timesheet Report Roadmap

This roadmap reflects the current product shape as of March 24, 2026.

## Current Product Areas

### Dashboard
- Weekly gap-focused workflow
- Suggestions from previous work and auxiliary sources
- Templates and pinned items
- Month heatmap and absence awareness
- Markdown and CSV export

### Reports
- Weekly team compliance table
- Monthly calendar reporting
- Per-user drill-down
- Team and user CSV exports

### Settings
- Jira connection and permissions
- JQL filtering
- Theme and time rounding
- Calendar feeds
- Auxiliary source credentials

## Near-Term Priorities

### 1. Product Coherence
- Finish aligning copy, route names, and docs around **Dashboard** and **Reports**
- Reduce leftover `team` vs `timesheet` naming drift in code and UI
- Remove or consolidate obsolete page flows once replacement paths are stable

### 2. Reporting Improvements
- Better filtering within Reports
  - project
  - issue type
  - component
- More explicit saved/shareable report presets
- Custom date-range exports beyond single week or month

### 3. Dashboard Improvements
- Smarter suggestion ranking
- Better copy-previous-week review controls
- More visible source-health diagnostics when feeds or APIs fail

### 4. Data Quality and Safety
- Tighten typing around Jira worklog and issue shapes
- Normalize comment handling across read and write flows
- Add more coverage for service-layer edge cases and permission failures

## Mid-Term Opportunities

### 1. Export Workflows
- Richer CSV formats
- Excel export
- Printable summary layout

### 2. Personal Workflow Features
- Faster issue lookup and recent issue history
- Better note/comment presets
- Optional daily or weekly reminder scheduling controls

### 3. Team Reporting
- Trend views across multiple weeks
- Basic charts for compliance, gaps, and overtime
- Role- or group-based filtering if Jira data supports it cleanly

## Explicitly De-Prioritized

- Backend infrastructure
- Real-time collaboration
- Native mobile app

The project should stay zero-backend unless a future feature clearly justifies changing that constraint.
