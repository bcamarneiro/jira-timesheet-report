# Clone a logged worklog to other days

**Date:** 2026-05-27 · **Status:** approved

## Problem

When filling a timesheet on the Dashboard, the same work often repeats across
days (same Jira issue, same hours). Today there is no granular way to replicate
a single logged entry onto chosen days. Existing tools are coarser: "Copy
Previous Week", Templates (recurring weekday rules), and Favorites. The user
wants to take *one* logged worklog and clone it onto one or more arbitrary days
— including days in other weeks or the first of next month.

### Why a new surface is needed (the key finding)

The Dashboard is gap-oriented. `suggestionMerger` **filters already-logged
worklogs out** of the suggestion list (`if (loggedSet.has(key)) continue;`) and
folds them into the aggregate `loggedSeconds`. Real worklogs are therefore
**not rendered as individual items anywhere** on the Dashboard — only the day
total is shown. The only per-item "logged" cards are *session-logged
suggestions* (a suggestion flipped to `logged: true` via `markSuggestionLogged`
during the current session); those disappear on reload.

So a "Clone to…" action attached to a session-logged card would be **ephemeral**
— it would vanish after a refresh, and could never act on a worklog logged in a
previous session. To deliver the feature, we must first surface each day's
**real** worklogs as individual, persistent items, and hang "Clone to…" off
those. This also closes a gap left by the closed-days-collapse feature: an
expanded closed day currently has no real worklog items to show.

## Solution

Add a per-day list of real worklogs to the day model, render them as individual
items in `DayCard`, and give each a **"Clone to…"** action that opens a
navigable month calendar for multi-selecting target days, then clones the
worklog onto each selected day in one batch.

### 1. Day model — `DaySummary.loggedWorklogs`

```ts
export interface LoggedWorklog {
  worklogId: string;        // Jira worklog id (stable key; enables future edit/delete)
  issueKey: string;
  issueSummary?: string;
  timeSpentSeconds: number;
}

// DaySummary gains:
loggedWorklogs: LoggedWorklog[];   // non-backdated only; [] when none
```

### 2. `suggestionMerger` builds the list (single source of truth)

The merger already iterates `existingWorklogs` to compute `loggedByDay`
(`loggedSeconds`) and knows `isBackdated`. It will, in the same pass, collect the
non-backdated worklogs per day into `loggedWorklogs`, so the clonable items and
the day total always agree (impossible to show divergent numbers).

This requires the merger's input `WorklogEntry` to carry the extra fields it
already has upstream but currently drops: `worklogId`, `issueSummary`.
`deriveWeekWorklogs` in `useDashboardDataFetcher.ts` already reads
`wl.issue.fields.summary` and has `wl.id` available — it just needs to pass
`worklogId: wl.id` and keep `issueSummary`. Backdated worklogs are excluded
(they already surface as ghosts / `weekGhosts`).

### 3. `DayCard` renders real worklogs with "Clone to…"

- A new compact `LoggedWorklogItem` row: `✓ {issueKey} · {time} · {summary}` +
  a **"Clone to…"** button. Rendered for each `day.loggedWorklogs` entry inside
  the (already gated) `expanded` body.
- Because these come from fetched Jira data, they **persist across reloads** and
  exist for every day with logged time — including closed days (which now show
  their real worklogs when expanded).
- The existing session-logged `SuggestionCard` green confirmations stay as-is.
  "Clone to…" lives only on the real `loggedWorklogs` items (persistent),
  avoiding the ephemerality problem.

### 4. Picker — `CloneWorklogPopover` (new)

Rendered inside the existing `Modal`. Props:
`{ issueKey, timeSpent, sourceDate, onClone(dates: string[]), onCancel }`.

- **Month grid**, Monday-first columns, `‹ {Month Year} ›` navigation, no
  bounds (distant dates reachable: next month, 4 weeks out).
- Clicking a day **toggles** selection (multi-select, `Set<string>` of ISO
  dates), persisting as the user navigates months.
- Below the grid, a **chip list of the selected dates** (so selections made in
  other months stay visible — they would otherwise be off-screen).
- The **source day** (`sourceDate`) is disabled/marked "source".
- **Any** day is selectable, including weekends (arbitrary dates requested).
- Header: `Clone {issueKey} · {time} to…`. Footer: `N day(s) selected` +
  primary **`Clone → N`** (disabled when nothing selected).
- Initial view: the month containing `sourceDate`.
- It is a pure presentational unit: it owns calendar/selection only and reports
  chosen ISO dates up via `onClone`; it does not call worklog hooks.

### 5. What is cloned

For each selected day, one worklog is created with:
- `issueKey` = the source worklog's `issueKey`
- `timeSpent` = the source worklog's `timeSpentSeconds`, formatted to Jira
  duration (e.g. `8h`, `1h 30m`)
- `comment` = `''` — **the comment is intentionally NOT cloned**: the issue and
  hours repeat, but what you actually did that day may differ.
- `started` = `withLocalOffset(`${day}T09:00`)` (same 09:00 default as "Log it"
  / "Log All")

If a target day already has that issue logged, a clone is still created — Jira
allows multiple worklogs for the same issue/day, matching manual logging.

### 6. Action / feedback

- `DayCard.handleClone(sourceWorklog, dates)` maps dates → params → one
  `useWorklogOperations.createMultipleWorklogs(params)` call (same hook "Log
  All" uses).
- Full success: `toast.success("Cloned {issueKey} ({time}) to {N} day(s)")` with
  an **Undo** action that deletes the created worklogs
  (`result.created.map((w) => deleteWorklog(w.issueKey, w.worklogId))`) —
  mirroring the `handleLogAll` Undo pattern already in `DayCard.tsx`.
- Partial failure: `toast.error` listing failed days; created ones kept (no
  rollback), same as `handleLogAll`.
- The popover closes after a successful clone.

### Cross-week note

Cloning into another week creates worklogs in that week; they appear in the
Dashboard only when the user navigates there. The success toast with the day
count is the immediate confirmation. Expected behaviour, not a bug.

## Components / files

- **`types/Suggestion.ts`**: add `LoggedWorklog` + `DaySummary.loggedWorklogs`.
- **`frontend/services/suggestionMerger.ts`**: extend input `WorklogEntry` with
  `worklogId`/`issueSummary`; build `loggedWorklogs` per day in the existing
  worklog pass; return it on each `DaySummary`.
- **`frontend/react/hooks/useDashboardDataFetcher.ts`**: `deriveWeekWorklogs`
  passes `worklogId: wl.id` (and keeps `issueSummary`).
- **`CloneWorklogPopover.tsx`** + **`CloneWorklogPopover.module.css`** (new):
  calendar, month navigation, multi-select, selected-date chips, footer.
- **`DayCard.tsx`** (+ a small `LoggedWorklogItem` row, inline or its own file
  with CSS): render `day.loggedWorklogs`; "Clone to…" opens a `Modal` with
  `CloneWorklogPopover`; implement `handleClone`.
- Reuse `useWorklogOperations.createMultipleWorklogs` / `deleteWorklog`,
  `utils/date` (`withLocalOffset`, `addDaysToIsoDate`, `parseIsoDateLocal`,
  `toLocalDateString`), and a seconds→Jira-duration formatter (the merger's
  `formatTimeSpent` logic; extract to a shared util if not already shared).

## Data flow

1. Fetch → `deriveWeekWorklogs` (now with `worklogId`) → `mergeSuggestions`
   builds `DaySummary.loggedWorklogs` → store.
2. `DayCard` renders each `loggedWorklogs` item; user clicks "Clone to…" →
   `Modal` opens with `CloneWorklogPopover` for that worklog.
3. User navigates months, toggles days → local `Set<string>` of ISO dates.
4. "Clone → N" → `onClone([...selected])` → `DayCard.handleClone` builds params
   → `createMultipleWorklogs` → success/partial toast (success includes Undo) →
   closes modal.

## Error handling

- Empty selection: "Clone" disabled (no call).
- Jira not configured: `createMultipleWorklogs` already throws "Jira client not
  configured"; catch shows `toast.error`.
- Partial batch failure: `toast.error`; successful clones kept.
- Undo is best-effort (same as existing Undo flows).

## Testing

- **`suggestionMerger`**: a day with two non-backdated worklogs yields
  `loggedWorklogs` of length 2 with the right `issueKey`/`timeSpentSeconds`;
  backdated worklogs are excluded from `loggedWorklogs` (and still excluded from
  `loggedSeconds`); `loggedWorklogs` total matches `loggedSeconds`.
- **`CloneWorklogPopover`**: renders the source month; clicking a day toggles it
  (footer count + chip reflect it); the source day is disabled; month
  navigation moves next/previous and keeps prior selections; selected-date chips
  render across months; "Clone" disabled at zero selection and calls `onClone`
  with the selected ISO dates.
- **`DayCard`**: a day with `loggedWorklogs` renders the items + a "Clone to…"
  button; invoking `onClone` with two dates calls `createMultipleWorklogs` with
  two params carrying the right `issueKey`, formatted `timeSpent`, **empty
  `comment`**, and `09:00` started times.

## Out of scope (separate work)

- Carrying the worklog comment into clones (deliberately excluded — see §5).
- Edit/delete on the real worklog items (the `worklogId` leaves the door open).
- Different hours/start time per target day.
- Recurring rules (that is Templates).
- Cloning unmapped/active suggestions (clone acts on real logged worklogs).
