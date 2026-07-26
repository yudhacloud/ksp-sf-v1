-- Non-destructive monitoring extension for existing Supabase schema.
--
-- Safe approach:
-- - Do not drop existing tables.
-- - Add new tables and columns with IF NOT EXISTS where possible.
-- - Preserve current data and existing RLS policies.

create table if not exists public.saving_accounts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  saving_product_id uuid not null references public.saving_products(id),
  start_date date not null default current_date,
  end_date date,
  status varchar(20) not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(member_id, saving_product_id)
);

create index if not exists idx_saving_accounts_member on public.saving_accounts(member_id);
create index if not exists idx_saving_accounts_product on public.saving_accounts(saving_product_id);

create table if not exists public.saving_obligations (
  id uuid primary key default gen_random_uuid(),
  saving_account_id uuid not null references public.saving_accounts(id) on delete cascade,
  billing_period date not null,
  due_date date not null,
  amount_due numeric(14,2) not null check (amount_due > 0),
  status varchar(20) not null default 'PENDING' check (status in ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(saving_account_id, billing_period)
);

create index if not exists idx_saving_obligations_account on public.saving_obligations(saving_account_id);
create index if not exists idx_saving_obligations_period on public.saving_obligations(billing_period);
create index if not exists idx_saving_obligations_due_date on public.saving_obligations(due_date);

alter table public.saving_transactions
  add column if not exists saving_obligation_id uuid references public.saving_obligations(id) on delete set null;

create index if not exists idx_saving_transactions_obligation on public.saving_transactions(saving_obligation_id);

create or replace view public.v_saving_monitoring as
select
  so.id as obligation_id,
  so.billing_period,
  so.due_date,
  so.amount_due,
  so.status as obligation_status,
  sa.id as saving_account_id,
  sa.status as account_status,
  p.id as member_id,
  p.member_number,
  p.full_name,
  p.email,
  sp.id as saving_product_id,
  sp.name as saving_product_name,
  sp.saving_type,
  coalesce(sum(case when st.status = 'APPROVED' then st.amount else 0 end), 0) as approved_amount,
  greatest(so.amount_due - coalesce(sum(case when st.status = 'APPROVED' then st.amount else 0 end), 0), 0) as remaining_amount,
  case
    when coalesce(sum(case when st.status = 'APPROVED' then st.amount else 0 end), 0) >= so.amount_due then 'PAID'
    when current_date > so.due_date and coalesce(sum(case when st.status = 'APPROVED' then st.amount else 0 end), 0) = 0 then 'OVERDUE'
    when coalesce(sum(case when st.status = 'APPROVED' then st.amount else 0 end), 0) > 0 then 'PARTIAL'
    else 'PENDING'
  end as calculated_status,
  count(st.id) filter (where st.status = 'APPROVED') as approved_payment_count
from public.saving_obligations so
join public.saving_accounts sa on sa.id = so.saving_account_id
join public.profiles p on p.id = sa.member_id
join public.saving_products sp on sp.id = sa.saving_product_id
left join public.saving_transactions st on st.saving_obligation_id = so.id
group by
  so.id,
  so.billing_period,
  so.due_date,
  so.amount_due,
  so.status,
  sa.id,
  sa.status,
  p.id,
  p.member_number,
  p.full_name,
  p.email,
  sp.id,
  sp.name,
  sp.saving_type;
