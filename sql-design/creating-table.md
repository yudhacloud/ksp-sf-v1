-- KSP Schema for Supabase
-- Full bootstrap only. Do not re-run this file against an existing Supabase database,
-- because the DROP statements below will remove data and any existing RLS policies.
-- Use sql-design/monitoring-simpanan-migration.sql for non-destructive changes.
DROP TABLE IF EXISTS public.installment_payments CASCADE;
DROP TABLE IF EXISTS public.loan_installments CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.loan_applications CASCADE;
DROP TABLE IF EXISTS public.loan_products CASCADE;
DROP TABLE IF EXISTS public.saving_transactions CASCADE;
DROP TABLE IF EXISTS public.saving_products CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS installment_status CASCADE;
DROP TYPE IF EXISTS loan_status CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS saving_type CASCADE;

create type saving_type as enum ('POKOK','WAJIB','SUKARELA');
create type approval_status as enum ('PENDING','APPROVED','REJECTED');
create type loan_status as enum ('ACTIVE','PAID','DEFAULT','CANCELLED');
create type installment_status as enum ('PENDING','PARTIAL','PAID','OVERDUE');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  member_number varchar(30) unique not null,
  full_name varchar(150) not null,
  email varchar(255) unique,
  phone varchar(30),
  role varchar(20) not null default 'pengguna',
  address text,
  status boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saving_products(
 id uuid primary key default gen_random_uuid(),
 name varchar(100) not null unique,
 saving_type saving_type not null,
 description text,
 is_active boolean not null default true,
 created_at timestamptz default now()
);

create table public.saving_transactions(
 id uuid primary key default gen_random_uuid(),
 member_id uuid not null references public.profiles(id) on delete cascade,
 saving_product_id uuid not null references public.saving_products(id),
 amount numeric(14,2) not null check(amount>0),
 proof_url text,
 status approval_status not null default 'PENDING',
 admin_note text,
 transaction_date date not null default current_date,
 approved_by uuid references public.profiles(id),
 approved_at timestamptz,
 created_at timestamptz default now()
);

create table public.loan_products(
 id uuid primary key default gen_random_uuid(),
 name varchar(100) not null unique,
 max_amount numeric(14,2) not null check(max_amount>0),
 interest_rate numeric(5,2) not null check(interest_rate>=0),
 max_tenor int not null check(max_tenor>0),
 is_active boolean default true,
 created_at timestamptz default now()
);

create table public.loan_applications(
 id uuid primary key default gen_random_uuid(),
 member_id uuid not null references public.profiles(id) on delete cascade,
 loan_product_id uuid not null references public.loan_products(id),
 amount numeric(14,2) not null check(amount>0),
 tenor int not null check(tenor>0),
 purpose text,
 status approval_status not null default 'PENDING',
 admin_note text,
 reviewed_by uuid references public.profiles(id),
 reviewed_at timestamptz,
 created_at timestamptz default now()
);

create table public.loans(
 id uuid primary key default gen_random_uuid(),
 application_id uuid unique not null references public.loan_applications(id),
 member_id uuid not null references public.profiles(id),
 principal_amount numeric(14,2) not null,
 interest_rate numeric(5,2) not null,
 tenor int not null,
 monthly_installment numeric(14,2) not null,
 remaining_balance numeric(14,2) not null,
 start_date date not null,
 end_date date not null,
 status loan_status not null default 'ACTIVE',
 created_at timestamptz default now()
);

create table public.loan_installments(
 id uuid primary key default gen_random_uuid(),
 loan_id uuid not null references public.loans(id) on delete cascade,
 installment_number int not null,
 due_date date not null,
 amount_due numeric(14,2) not null,
 status installment_status not null default 'PENDING',
 unique(loan_id,installment_number)
);

create table public.installment_payments(
 id uuid primary key default gen_random_uuid(),
 installment_id uuid not null references public.loan_installments(id) on delete cascade,
 amount numeric(14,2) not null check(amount>0),
 payment_date date not null default current_date,
 proof_url text,
 status approval_status not null default 'PENDING',
 admin_note text,
 approved_by uuid references public.profiles(id),
 approved_at timestamptz,
 created_at timestamptz default now()
);

create table public.notifications(
 id uuid primary key default gen_random_uuid(),
 member_id uuid not null references public.profiles(id) on delete cascade,
 title varchar(150) not null,
 message text not null,
 is_read boolean default false,
 created_at timestamptz default now()
);

create table public.audit_logs(
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references public.profiles(id),
 table_name varchar(100) not null,
 record_id uuid,
 action varchar(50) not null,
 description text,
 created_at timestamptz default now()
);

create index idx_saving_member on public.saving_transactions(member_id);
create index idx_application_member on public.loan_applications(member_id);
create index idx_loan_member on public.loans(member_id);
create index idx_installment_loan on public.loan_installments(loan_id);
create index idx_payment_installment on public.installment_payments(installment_id);
create index idx_notification_member on public.notifications(member_id);