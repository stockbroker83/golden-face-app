create table if not exists public.account_states (
  user_id text primary key,
  points jsonb,
  vip jsonb,
  is_vip boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_account_states_updated_at
  on public.account_states (updated_at desc);

create or replace function public.set_account_states_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_account_states_updated_at on public.account_states;
create trigger trg_account_states_updated_at
before update on public.account_states
for each row
execute function public.set_account_states_updated_at();

alter table public.account_states enable row level security;

drop policy if exists "service role full access account_states" on public.account_states;
create policy "service role full access account_states"
on public.account_states
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
