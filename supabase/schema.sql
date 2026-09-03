-- Run this file in the Supabase SQL Editor.
-- It creates the IGAI application schema with Row Level Security intentionally enabled.
-- IGAI uses Supabase Auth users together with the public.profiles table.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null check (role in ('ngo', 'corporate')),
  organization_name text,
  created_at timestamptz default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  ngo_name text not null,
  title text not null,
  description text,
  impact_statement text,
  evidence_description text,
  sector text not null,
  state text not null,
  district text not null,
  latitude double precision,
  longitude double precision,
  requested_amount numeric not null check (requested_amount >= 0),
  beneficiaries integer not null check (beneficiaries >= 0),
  duration_months integer,
  impact_score numeric,
  geo_need_score numeric,
  feasibility_score numeric,
  risk_score numeric,
  evidence_score numeric,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'under_review', 'selected', 'deferred')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Safe for projects that ran an earlier phase of this schema.
alter table public.proposals add column if not exists impact_statement text;
alter table public.proposals add column if not exists evidence_description text;

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  budget numeric not null,
  impact_weight numeric,
  reach_weight numeric,
  cost_weight numeric,
  geographic_weight numeric,
  alignment_weight numeric,
  feasibility_weight numeric,
  risk_weight numeric,
  equity_guardrail boolean default true,
  results jsonb,
  created_at timestamptz default now()
);

create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  selected boolean not null default false,
  allocated_amount numeric not null default 0,
  calculated_score numeric,
  selection_reason text,
  created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  timestamp timestamptz default now()
);

create index if not exists proposals_created_by_idx on public.proposals(created_by);
create index if not exists proposals_status_idx on public.proposals(status);
create index if not exists proposals_sector_idx on public.proposals(sector);
create index if not exists proposals_district_idx on public.proposals(district);
create index if not exists scenarios_created_by_idx on public.scenarios(created_by);
create index if not exists allocations_scenario_id_idx on public.allocations(scenario_id);
create index if not exists allocations_proposal_id_idx on public.allocations(proposal_id);
create index if not exists audit_logs_user_id_idx on public.audit_logs(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, organization_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('ngo', 'corporate')
        then new.raw_user_meta_data ->> 'role'
      else 'ngo'
    end,
    nullif(new.raw_user_meta_data ->> 'organization_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_proposal_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_proposal_updated_at() from public, anon, authenticated;

drop trigger if exists proposals_set_updated_at on public.proposals;
create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute function public.set_proposal_updated_at();

alter table public.profiles enable row level security;
alter table public.proposals enable row level security;
alter table public.scenarios enable row level security;
alter table public.allocations enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "NGOs can create own proposals" on public.proposals;
create policy "NGOs can create own proposals"
  on public.proposals for insert
  to authenticated
  with check (
    (select auth.uid()) = created_by
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'ngo'
    )
  );

drop policy if exists "NGOs can read own proposals" on public.proposals;
create policy "NGOs can read own proposals"
  on public.proposals for select
  to authenticated
  using (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'ngo'
    )
  );

drop policy if exists "Corporates can read reviewable proposals" on public.proposals;
create policy "Corporates can read reviewable proposals"
  on public.proposals for select
  to authenticated
  using (
    status in ('submitted', 'under_review')
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'corporate'
    )
  );

drop policy if exists "NGOs can update own proposals" on public.proposals;
create policy "NGOs can update own proposals"
  on public.proposals for update
  to authenticated
  using (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'ngo'
    )
  )
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'ngo'
    )
  );

drop policy if exists "Corporates can read own scenarios" on public.scenarios;
create policy "Corporates can read own scenarios"
  on public.scenarios for select
  to authenticated
  using (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'corporate'
    )
  );

drop policy if exists "Corporates can create own scenarios" on public.scenarios;
create policy "Corporates can create own scenarios"
  on public.scenarios for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'corporate'
    )
  );

drop policy if exists "Corporates can update own scenarios" on public.scenarios;
create policy "Corporates can update own scenarios"
  on public.scenarios for update
  to authenticated
  using (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'corporate'
    )
  )
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'corporate'
    )
  );

drop policy if exists "Corporates can delete own scenarios" on public.scenarios;
create policy "Corporates can delete own scenarios"
  on public.scenarios for delete
  to authenticated
  using (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'corporate'
    )
  );

drop policy if exists "Corporates can read own allocations" on public.allocations;
create policy "Corporates can read own allocations"
  on public.allocations for select
  to authenticated
  using (
    exists (
      select 1
      from public.scenarios
      where scenarios.id = allocations.scenario_id
        and scenarios.created_by = (select auth.uid())
    )
  );

drop policy if exists "Corporates can create own allocations" on public.allocations;
create policy "Corporates can create own allocations"
  on public.allocations for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.scenarios
      where scenarios.id = allocations.scenario_id
        and scenarios.created_by = (select auth.uid())
    )
  );

drop policy if exists "Corporates can update own allocations" on public.allocations;
create policy "Corporates can update own allocations"
  on public.allocations for update
  to authenticated
  using (
    exists (
      select 1
      from public.scenarios
      where scenarios.id = allocations.scenario_id
        and scenarios.created_by = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.scenarios
      where scenarios.id = allocations.scenario_id
        and scenarios.created_by = (select auth.uid())
    )
  );

drop policy if exists "Corporates can delete own allocations" on public.allocations;
create policy "Corporates can delete own allocations"
  on public.allocations for delete
  to authenticated
  using (
    exists (
      select 1
      from public.scenarios
      where scenarios.id = allocations.scenario_id
        and scenarios.created_by = (select auth.uid())
    )
  );

drop policy if exists "Users can read own audit logs" on public.audit_logs;
create policy "Users can read own audit logs"
  on public.audit_logs for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.write_audit_log(
  p_action text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  audit_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if nullif(btrim(p_action), '') is null then
    raise exception 'Audit action is required';
  end if;

  insert into public.audit_logs (user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb))
  returning id into audit_id;

  return audit_id;
end;
$$;

revoke all on function public.write_audit_log(text, text, uuid, jsonb) from public, anon;
grant execute on function public.write_audit_log(text, text, uuid, jsonb) to authenticated;

revoke all on table public.profiles, public.proposals, public.scenarios,
  public.allocations, public.audit_logs from anon;

revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, organization_name) on table public.profiles to authenticated;

revoke all on table public.proposals from authenticated;
grant select, insert, update on table public.proposals to authenticated;

revoke all on table public.scenarios from authenticated;
grant select, insert, update, delete on table public.scenarios to authenticated;

revoke all on table public.allocations from authenticated;
grant select, insert, update, delete on table public.allocations to authenticated;

revoke all on table public.audit_logs from authenticated;
grant select on table public.audit_logs to authenticated;
