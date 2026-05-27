# Dashboard: closed days stay collapsed & editable

**Date:** 2026-05-27 · **Status:** approved

## Problem

On the Dashboard, `DashboardPage.tsx` only renders weekdays with a gap
(`weekdays.filter((d) => d.gapSeconds > 0)`). When a day becomes complete
(`gapSeconds === 0`) its `DayCard` is filtered out and **disappears entirely** —
there is no other place that renders a day's card, so the user can no longer
review or edit a finished day's worklogs.

## Solution (presentational only — no store/persistence/data-model changes)

Keep every weekday visible, in week order, in a single "This week" section.
Complete days render **collapsed**; days with a gap render expanded as today.

### Behaviour
- `DashboardPage`: replace the gap-only "Days to fill" section with one
  "This week" section that maps **all** `weekdays` (still excludes weekends).
  `WeekOverview` and the "All caught up!" banner stay as summaries.
- A day is **closed** when `gapSeconds === 0` and it is not a weekend.
- Closed days render a **collapsed header**: day name, date, total logged
  hours, a **"✓ Closed"** chip, and an expand chevron. Clicking toggles an
  expanded state that reveals the existing body (logged `SuggestionCard`s, which
  already expose Edit & Log / delete via `useWorklogOperations`), so the user
  can change/add/remove. Collapsing hides it again.
- Days with a gap render expanded (suggestions, Fill day, Log All) — unchanged.
- **Today**, even when closed, starts expanded (easy to keep editing).
- Collapse/expand is **local UI state** in `DayCard` — nothing persisted.

### Components
- `DayCard`: add internal `expanded` state + an `isClosed` derivation; render a
  collapsed header when closed-and-not-expanded, else the full body. Add a
  one-line "N worklogs logged · Xh" summary so an expanded closed day with no
  suggestion cards is never empty.
- `DashboardPage`: render all weekdays; drop the `gapSeconds > 0` filter for the
  day list (keep `hasGaps` only for the "All caught up!" banner).
- `DayCard.module.css`: collapsed-header row, "✓ Closed" chip, chevron.

### Edge cases
- Time-off / holiday days (target 0 → gap 0) collapse with the existing
  time-off chip shown in the header.
- Switching from the gap-filtered list to the full weekday list also aligns the
  keyboard-focus index (`useKeyboardShortcuts(weekdays)` already indexes over
  all weekdays; the rendered list now matches).

### Testing
- `DayCard`: closed day renders collapsed (no body) by default; clicking the
  header expands it; gap day renders expanded with no collapse control; today
  starts expanded even when closed.

## Out of scope (separate design)
- "Clone this worklog to day X" — its own brainstorm + spec next.
