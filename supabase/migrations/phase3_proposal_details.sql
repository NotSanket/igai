-- Run once in the Supabase SQL Editor for databases created before Phase 3.
-- These fields keep the structured proposal narrative editable without
-- weakening any existing proposal RLS policies.
alter table public.proposals
  add column if not exists impact_statement text,
  add column if not exists evidence_description text;
