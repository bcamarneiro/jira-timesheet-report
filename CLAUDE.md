# Hoursmith — agent operating contract

**Linear is the single source of truth for project state.** Any change in scope, status, design decision, or new work discovered must land in Linear *before this session ends*. If a change isn't in Linear, treat it as if it didn't happen — the next agent (or future-Bruno) won't see it.

## Required workflow

When you start work in this repo:

1. **Identify the active ticket.** Query Linear:
   `project:"Jira Timesheet Report — Commercialization"` · `label:pre-go-live` · `state:Todo`.
   If the user is asking for something not covered by an open ticket, **create the ticket before writing code**.
2. **Move the ticket to `In Progress`** when you actually start coding.
3. **Update the ticket description** whenever you make a decision that changes scope, approach, or acceptance criteria. Never let a decision live only in chat.
4. **Move to `In Review`** when you open a PR; **`Done`** when it merges.
5. **Capture discovered work** as new tickets with the right label and `blockedBy`/`blocks` relations — don't bury follow-ups in chat or code comments.

When you stop work (end of session, or context switch):

6. **Audit Linear before signing off.** Status of every touched ticket reflects reality. Any in-flight discovery is filed.
7. **Move the next ticket to `Todo`** (the one that should be attacked next). The next session must be able to identify it from Linear state alone, not from chat history.

## What does NOT live in Linear

- **Durable reference data** (IDs, URLs, connection strings, environment refs, sandbox details) → `~/.claude/projects/-Users-brunocamarneiro-Projects-bcamarneiro-jira-timesheet-report/memory/`. See `MEMORY.md` for the index. *Examples worth keeping there: Supabase project refs, Polar sandbox org id, Edge Config id, custom domain ↔ branch mapping.*
- **Code reasoning** → code comments / commit messages. Project state ≠ code state.

If you catch yourself writing "TODO", "next:", or "remember to" in chat, code, or markdown — **stop and create a Linear ticket** (or update the relevant one) before continuing.

## Project quick map

- **Repo:** this directory. Branches `main` (production, deploys to `hoursmith.io`) + `staging` (release candidate, deploys to `https://staging.hoursmith.io`).
- **Default PR target:** `staging`. Promote `staging → main` to release.
- **Linear team:** Adamastor. **Project:** "Jira Timesheet Report — Commercialization".
- **Pre-go-live label:** `pre-go-live` (red `#DC2626`). The next ticket to attack is the one with this label in state `Todo`.
- **Active sub-projects:** see memory `monetization-gates` for the workstream map.

See `MEMORY.md` (in the memory directory above) for curated reference memories: monetization gates summary, sandbox/staging IDs, pricing model, product brand.
