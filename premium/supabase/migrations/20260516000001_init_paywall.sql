-- Initial paywall schema for Hoursmith Premium.
-- Two tables only: profiles and subscriptions. No Jira data is ever stored here.
-- Stripe webhook + Checkout function are the only writers of `subscriptions`.
-- Users can read their own row; writes are blocked by RLS (service-role bypasses).

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user, auto-created via trigger on signup.
-- ---------------------------------------------------------------------------

create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null,
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);

create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Trigger: auto-create profile row when an auth.users row appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email)
    values (new.id, new.email);
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- subscriptions: tier + Stripe metadata.
--
--   tier   is a text column (not boolean) so future tiers like 'team' are an
--          additive change, not a schema migration.
--   status mirrors Stripe's subscription status; check constraint pinned.
--
-- Rows are written only by the Checkout function (creates with status
-- 'incomplete') and the Stripe webhook (transitions to 'active', 'past_due',
-- 'canceled', etc.). Both use the service-role key, which bypasses RLS.
-- Users have read-only access to their own row.
-- ---------------------------------------------------------------------------

create table public.subscriptions (
    user_id uuid primary key references public.profiles (id) on delete cascade,
    stripe_customer_id text not null,
    stripe_subscription_id text,
    tier text not null default 'free',
    status text not null default 'incomplete',
    current_period_end timestamptz,
    updated_at timestamptz not null default now(),
    constraint subscriptions_tier_check
        check (tier in ('free', 'premium')),
    constraint subscriptions_status_check
        check (status in (
            'active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid'
        ))
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
    on public.subscriptions for select
    using (auth.uid() = user_id);

-- No insert/update/delete policies for users → all writes go through
-- service-role (the Checkout function and Stripe webhook).

-- Unique indexes for fast Stripe webhook lookups.
create unique index subscriptions_stripe_customer_id_uniq
    on public.subscriptions (stripe_customer_id);

create unique index subscriptions_stripe_subscription_id_uniq
    on public.subscriptions (stripe_subscription_id)
    where stripe_subscription_id is not null;

-- Trigger: keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger subscriptions_set_updated_at
    before update on public.subscriptions
    for each row execute function public.set_updated_at();
