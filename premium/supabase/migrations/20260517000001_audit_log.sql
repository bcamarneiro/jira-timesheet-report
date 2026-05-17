-- Compliance audit log for Hoursmith Premium.
--
-- Append-only record of GDPR-relevant events (account deletions, data exports).
-- Intentionally has no user_id / email / profile reference: rows must survive
-- account deletion (that's the whole point), so they cannot point at a row
-- that no longer exists. The only durable identifier is the Stripe customer
-- id, which is already retained by Stripe for tax/accounting purposes.
--
-- Writers: service-role only (Vercel Functions). No RLS policies are defined,
-- which means `anon` and `authenticated` cannot read or write — the table is
-- effectively private to server-side code holding the service-role key.
--
-- Linear: ADA-263, ADA-264.

create table public.audit_log (
    id bigserial primary key,
    event_type text not null,
    stripe_customer_id text,
    metadata jsonb,
    created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- No policies -> no read/write from anon or authenticated. Service-role only.

create index audit_log_event_type_created_at_idx
    on public.audit_log (event_type, created_at desc);

create index audit_log_stripe_customer_id_idx
    on public.audit_log (stripe_customer_id)
    where stripe_customer_id is not null;
