# Hoursmith Supabase

Database schema + (later) edge functions for the Premium tier.

License: see `/premium/LICENSE` (BSL 1.1). Do not import from anything under `frontend/`.

## Schema (M2)

Two tables. Nothing else.

- **`profiles`** — one row per authenticated user. Auto-created by trigger when `auth.users` insert happens.
- **`subscriptions`** — Stripe tier + status. Sole writers are the Checkout function and Stripe webhook (service-role key); users have RLS-scoped read access only.

What is **not** stored here: Jira API tokens, Jira data, settings, templates, favorites. Those stay in the browser. This is intentional and load-bearing for the GDPR posture — see ADA-265 (privacy policy) for the contract with users.

## Local setup (tomorrow, when the Supabase project exists)

```bash
# Install the Supabase CLI if not already.
brew install supabase/tap/supabase

# Initialize this directory (only first time per workspace).
cd premium/supabase
supabase init   # creates config.toml, ignored .branches/.temp dirs

# Link to the remote project (run from premium/supabase).
supabase link --project-ref <ref-from-dashboard>

# Apply migrations to remote.
supabase db push
```

## Adding migrations

```bash
# From premium/supabase/, generate a timestamped migration:
supabase migration new <name>

# Edit the generated file under migrations/, then push:
supabase db push
```

Never edit an already-pushed migration — write a new one that alters.

## RLS philosophy

- **Every table has RLS enabled from day one.** Even if today's policy is just `auth.uid() = id`, the structural choice makes it trivial to add org-scoped policies later without a full audit.
- **Service-role writes for billing.** Anything Stripe touches goes through the webhook + Checkout function. Users never write the `subscriptions` table directly.
