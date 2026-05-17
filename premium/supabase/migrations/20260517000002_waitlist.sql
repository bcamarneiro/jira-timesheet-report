-- Premium waitlist: emails captured pre-launch from the Pricing page and the
-- in-app Settings card. Single-purpose table; the service-role key is the only
-- writer (via premium/api/waitlist). No anon or authenticated policies → reads
-- and writes from the client are blocked by RLS.
--
-- We deliberately do not store IP, user-agent, or any other identifier here.
-- Email is the natural primary key (idempotent submissions, easy dedup).
--
-- Linear: ADA-269. Sub-processor: Supabase (already listed in docs/sub-processors.md).

create table public.waitlist (
    email text primary key,
    source text not null check (source in ('pricing', 'in-app-settings')),
    created_at timestamptz not null default now(),
    notified boolean not null default false
);

alter table public.waitlist enable row level security;

-- No policies on purpose. Service-role bypasses RLS; everything else is denied.
