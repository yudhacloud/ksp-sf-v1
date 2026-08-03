-- Full reset script for KSP schema on Supabase.
--
-- What this script does:
-- 1) Drop RLS policies on app tables (if any).
-- 2) Drop views, tables, triggers, and custom enum types used by the app.
-- 3) Recreate full schema from zero, including saving monitoring structures.
-- 4) Recreate RLS policies.
-- 5) Seed fresh dummy data.
--
-- Important:
-- - This script is destructive for application data in public schema tables listed below.
-- - auth.users is NOT modified.

begin;

-- =========================================================
-- CLEANUP: POLICIES, VIEWS, TABLES, TYPES, FUNCTIONS
-- =========================================================

do $$
declare
	table_name text;
	policy_name text;
	target_tables text[] := array[
		'profiles',
		'saving_products',
		'saving_accounts',
		'saving_obligations',
		'saving_transactions',
		'loan_products',
		'loan_applications',
		'loans',
		'loan_installments',
		'installment_payments',
		'notifications',
		'audit_logs'
	];
begin
	foreach table_name in array target_tables loop
		for policy_name in
			select pol.policyname
			from pg_policies pol
			where pol.schemaname = 'public'
				and pol.tablename = table_name
		loop
			execute format('drop policy if exists %I on public.%I', policy_name, table_name);
		end loop;
	end loop;
end $$;

drop view if exists public.v_saving_monitoring cascade;

drop table if exists public.installment_payments cascade;
drop table if exists public.loan_installments cascade;
drop table if exists public.loans cascade;
drop table if exists public.loan_applications cascade;
drop table if exists public.loan_products cascade;
drop table if exists public.saving_transactions cascade;
drop table if exists public.saving_obligations cascade;
drop table if exists public.saving_accounts cascade;
drop table if exists public.saving_products cascade;
drop table if exists public.notifications cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.profiles cascade;

drop function if exists public.set_updated_at() cascade;

drop type if exists public.installment_status cascade;
drop type if exists public.loan_status cascade;
drop type if exists public.approval_status cascade;
drop type if exists public.saving_type cascade;
drop type if exists public.saving_account_status cascade;
drop type if exists public.saving_obligation_status cascade;

-- =========================================================
-- TYPES
-- =========================================================

create type public.saving_type as enum ('POKOK', 'WAJIB', 'SUKARELA');
create type public.approval_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type public.loan_status as enum ('ACTIVE', 'PAID', 'DEFAULT', 'CANCELLED');
create type public.installment_status as enum ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');
create type public.saving_account_status as enum ('ACTIVE', 'INACTIVE', 'CLOSED');
create type public.saving_obligation_status as enum ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- =========================================================
-- TABLES
-- =========================================================

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

create table public.saving_products (
	id uuid primary key default gen_random_uuid(),
	name varchar(100) not null unique,
	saving_type public.saving_type not null,
	description text,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table public.saving_accounts (
	id uuid primary key default gen_random_uuid(),
	member_id uuid not null references public.profiles(id) on delete cascade,
	saving_product_id uuid not null references public.saving_products(id),
	start_date date not null default current_date,
	end_date date,
	status public.saving_account_status not null default 'ACTIVE',
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique(member_id, saving_product_id)
);

create table public.saving_obligations (
	id uuid primary key default gen_random_uuid(),
	saving_account_id uuid not null references public.saving_accounts(id) on delete cascade,
	billing_period date not null,
	due_date date not null,
	amount_due numeric(14,2) not null check (amount_due > 0),
	status public.saving_obligation_status not null default 'PENDING',
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique(saving_account_id, billing_period)
);

create table public.saving_transactions (
	id uuid primary key default gen_random_uuid(),
	member_id uuid not null references public.profiles(id) on delete cascade,
	saving_product_id uuid not null references public.saving_products(id),
	saving_obligation_id uuid references public.saving_obligations(id) on delete set null,
	amount numeric(14,2) not null check (amount > 0),
	proof_url text,
	status public.approval_status not null default 'PENDING',
	admin_note text,
	transaction_date date not null default current_date,
	approved_by uuid references public.profiles(id),
	approved_at timestamptz,
	created_at timestamptz not null default now()
);

create table public.loan_products (
	id uuid primary key default gen_random_uuid(),
	name varchar(100) not null unique,
	max_amount numeric(14,2) not null check (max_amount > 0),
	interest_rate numeric(5,2) not null check (interest_rate >= 0),
	max_tenor int not null check (max_tenor > 0),
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table public.loan_applications (
	id uuid primary key default gen_random_uuid(),
	member_id uuid not null references public.profiles(id) on delete cascade,
	loan_product_id uuid not null references public.loan_products(id),
	amount numeric(14,2) not null check (amount > 0),
	tenor int not null check (tenor > 0),
	purpose text,
	status public.approval_status not null default 'PENDING',
	admin_note text,
	reviewed_by uuid references public.profiles(id),
	reviewed_at timestamptz,
	created_at timestamptz not null default now()
);

create table public.loans (
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
	status public.loan_status not null default 'ACTIVE',
	created_at timestamptz not null default now()
);

create table public.loan_installments (
	id uuid primary key default gen_random_uuid(),
	loan_id uuid not null references public.loans(id) on delete cascade,
	installment_number int not null,
	due_date date not null,
	amount_due numeric(14,2) not null,
	status public.installment_status not null default 'PENDING',
	unique(loan_id, installment_number)
);

create table public.installment_payments (
	id uuid primary key default gen_random_uuid(),
	installment_id uuid not null references public.loan_installments(id) on delete cascade,
	amount numeric(14,2) not null check (amount > 0),
	payment_date date not null default current_date,
	proof_url text,
	status public.approval_status not null default 'PENDING',
	admin_note text,
	approved_by uuid references public.profiles(id),
	approved_at timestamptz,
	created_at timestamptz not null default now()
);

create table public.notifications (
	id uuid primary key default gen_random_uuid(),
	member_id uuid not null references public.profiles(id) on delete cascade,
	title varchar(150) not null,
	message text not null,
	is_read boolean not null default false,
	created_at timestamptz not null default now()
);

create table public.audit_logs (
	id uuid primary key default gen_random_uuid(),
	actor_id uuid references public.profiles(id),
	table_name varchar(100) not null,
	record_id uuid,
	action varchar(50) not null,
	description text,
	created_at timestamptz not null default now()
);

-- =========================================================
-- INDEXES
-- =========================================================

create index idx_profiles_role on public.profiles(role);

create index idx_saving_member on public.saving_transactions(member_id);
create index idx_saving_product on public.saving_transactions(saving_product_id);
create index idx_saving_obligation on public.saving_transactions(saving_obligation_id);
create index idx_saving_status on public.saving_transactions(status);
create index idx_saving_transaction_date on public.saving_transactions(transaction_date);

create index idx_saving_accounts_member on public.saving_accounts(member_id);
create index idx_saving_accounts_product on public.saving_accounts(saving_product_id);

create index idx_saving_obligations_account on public.saving_obligations(saving_account_id);
create index idx_saving_obligations_period on public.saving_obligations(billing_period);
create index idx_saving_obligations_due_date on public.saving_obligations(due_date);
create index idx_saving_obligations_status on public.saving_obligations(status);

create index idx_application_member on public.loan_applications(member_id);
create index idx_loan_member on public.loans(member_id);
create index idx_installment_loan on public.loan_installments(loan_id);
create index idx_payment_installment on public.installment_payments(installment_id);
create index idx_notification_member on public.notifications(member_id);

-- =========================================================
-- TRIGGERS FOR updated_at
-- =========================================================

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_saving_products_updated_at
before update on public.saving_products
for each row execute function public.set_updated_at();

create trigger trg_saving_accounts_updated_at
before update on public.saving_accounts
for each row execute function public.set_updated_at();

create trigger trg_saving_obligations_updated_at
before update on public.saving_obligations
for each row execute function public.set_updated_at();

create trigger trg_loan_products_updated_at
before update on public.loan_products
for each row execute function public.set_updated_at();

-- =========================================================
-- VIEW: SAVING MONITORING
-- =========================================================

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
		when coalesce(sum(case when st.status = 'APPROVED' then st.amount else 0 end), 0) >= so.amount_due then 'PAID'::text
		when current_date > so.due_date and coalesce(sum(case when st.status = 'APPROVED' then st.amount else 0 end), 0) = 0 then 'OVERDUE'::text
		when coalesce(sum(case when st.status = 'APPROVED' then st.amount else 0 end), 0) > 0 then 'PARTIAL'::text
		else 'PENDING'::text
	end as calculated_status,
	count(st.id) filter (where st.status = 'APPROVED') as approved_payment_count
from public.saving_obligations so
join public.saving_accounts sa on sa.id = so.saving_account_id
join public.profiles p on p.id = sa.member_id
join public.saving_products sp on sp.id = sa.saving_product_id
left join public.saving_transactions st on st.saving_obligation_id = so.id
where so.billing_period >= date_trunc('month', sa.start_date)::date
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

-- =========================================================
-- RLS POLICIES
-- =========================================================

alter table public.profiles enable row level security;
alter table public.saving_products enable row level security;
alter table public.saving_accounts enable row level security;
alter table public.saving_obligations enable row level security;
alter table public.saving_transactions enable row level security;
alter table public.loan_products enable row level security;
alter table public.loan_applications enable row level security;
alter table public.loans enable row level security;
alter table public.loan_installments enable row level security;
alter table public.installment_payments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "admin full access profiles"
on public.profiles
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "member can read own profile"
on public.profiles
as permissive
for select
to authenticated
using (id = auth.uid());

create policy "admin full access saving products"
on public.saving_products
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "authenticated users can read active saving products"
on public.saving_products
as permissive
for select
to authenticated
using (is_active = true);

create policy "admin full access saving accounts"
on public.saving_accounts
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "member can read own saving accounts"
on public.saving_accounts
as permissive
for select
to authenticated
using (member_id = auth.uid());

create policy "admin full access saving obligations"
on public.saving_obligations
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "member can read own saving obligations"
on public.saving_obligations
as permissive
for select
to authenticated
using (
	exists (
		select 1
		from public.saving_accounts sa
		where sa.id = saving_obligations.saving_account_id
			and sa.member_id = auth.uid()
	)
);

create policy "admin full access saving transactions"
on public.saving_transactions
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "member can read own saving transactions"
on public.saving_transactions
as permissive
for select
to authenticated
using (member_id = auth.uid());

create policy "member can insert own saving transactions"
on public.saving_transactions
as permissive
for insert
to authenticated
with check (
	member_id = auth.uid()
	and status = 'PENDING'
	and (
		saving_obligation_id is null
		or exists (
			select 1
			from public.saving_obligations so
			join public.saving_accounts sa on sa.id = so.saving_account_id
			where so.id = saving_transactions.saving_obligation_id
				and sa.member_id = auth.uid()
		)
	)
);

create policy "admin full access loan products"
on public.loan_products
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "authenticated users can read active loan products"
on public.loan_products
as permissive
for select
to authenticated
using (is_active = true);

create policy "admin full access loan applications"
on public.loan_applications
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "member can read own loan applications"
on public.loan_applications
as permissive
for select
to authenticated
using (member_id = auth.uid());

create policy "member can insert own loan applications"
on public.loan_applications
as permissive
for insert
to authenticated
with check (member_id = auth.uid() and status = 'PENDING');

create policy "admin full access loans"
on public.loans
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "member can read own loans"
on public.loans
as permissive
for select
to authenticated
using (member_id = auth.uid());

create policy "admin full access loan installments"
on public.loan_installments
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "member can read own loan installments"
on public.loan_installments
as permissive
for select
to authenticated
using (
	exists (
		select 1
		from public.loans l
		where l.id = loan_installments.loan_id
			and l.member_id = auth.uid()
	)
);

create policy "admin full access installment payments"
on public.installment_payments
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "member can read own installment payments"
on public.installment_payments
as permissive
for select
to authenticated
using (
	exists (
		select 1
		from public.loan_installments li
		join public.loans l on l.id = li.loan_id
		where li.id = installment_payments.installment_id
			and l.member_id = auth.uid()
	)
);

create policy "member can insert own installment payments"
on public.installment_payments
as permissive
for insert
to authenticated
with check (
	exists (
		select 1
		from public.loan_installments li
		join public.loans l on l.id = li.loan_id
		where li.id = installment_payments.installment_id
			and l.member_id = auth.uid()
	)
	and status = 'PENDING'
);

create policy "admin full access notifications"
on public.notifications
as permissive
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "member can read own notifications"
on public.notifications
as permissive
for select
to authenticated
using (member_id = auth.uid());

create policy "member can update own notifications"
on public.notifications
as permissive
for update
to authenticated
using (member_id = auth.uid())
with check (member_id = auth.uid());

create policy "admin can read audit logs"
on public.audit_logs
as permissive
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =========================================================
-- DUMMY DATA
-- =========================================================

insert into public.profiles (
	id,
	member_number,
	full_name,
	email,
	phone,
	address
)
select
	id,
	'AGT0001',
	'Andi Pratama',
	email,
	'081111111111',
	'Surabaya'
from auth.users
where email = 'andi@example.com'
on conflict (id) do nothing;

insert into public.profiles (
	id,
	member_number,
	full_name,
	email,
	phone,
	address
)
select
	id,
	'AGT0002',
	'Budi Santoso',
	email,
	'082222222222',
	'Malang'
from auth.users
where email = 'budi@example.com'
on conflict (id) do nothing;

insert into public.profiles (
	id,
	member_number,
	full_name,
	email,
	phone,
	address
)
select
	id,
	'AGT0003',
	'Citra Lestari',
	email,
	'083333333333',
	'Sidoarjo'
from auth.users
where email = 'citra@example.com'
on conflict (id) do nothing;

insert into public.profiles (
	id,
	member_number,
	full_name,
	email,
	phone,
	role,
	address,
	status
)
select
	id,
	'ADM0001',
	'Admin Sistem',
	email,
	'081200001234',
	'admin',
	'Kantor Pusat',
	true
from auth.users
where email = 'admin@kspsf.com'
on conflict (id) do nothing;

insert into public.saving_products (name, saving_type, description)
values
('Simpanan Pokok', 'POKOK', 'Setoran satu kali saat menjadi anggota'),
('Simpanan Wajib', 'WAJIB', 'Setoran rutin setiap bulan'),
('Simpanan Sukarela', 'SUKARELA', 'Setoran bebas')
on conflict (name) do nothing;

insert into public.loan_products (name, max_amount, interest_rate, max_tenor)
values
('Pinjaman Reguler', 20000000, 1.00, 24),
('Pinjaman Pendidikan', 10000000, 0.75, 12),
('Pinjaman Darurat', 5000000, 0.50, 6)
on conflict (name) do nothing;

insert into public.saving_accounts (member_id, saving_product_id, status)
select p.id, sp.id, 'ACTIVE'
from public.profiles p
join public.saving_products sp on sp.saving_type in ('POKOK', 'WAJIB')
where p.role = 'pengguna'
on conflict (member_id, saving_product_id) do nothing;

insert into public.saving_obligations (
	saving_account_id,
	billing_period,
	due_date,
	amount_due,
	status,
	notes
)
select
	sa.id,
	date_trunc('month', current_date - interval '1 month')::date,
	(date_trunc('month', current_date - interval '1 month')::date + interval '9 day')::date,
	100000,
	'PARTIAL',
	'Iuran wajib bulan lalu'
from public.saving_accounts sa
join public.saving_products sp on sp.id = sa.saving_product_id
where sp.saving_type = 'WAJIB'
	and sa.start_date <= date_trunc('month', current_date - interval '1 month')::date
on conflict (saving_account_id, billing_period) do nothing;

insert into public.saving_obligations (
	saving_account_id,
	billing_period,
	due_date,
	amount_due,
	status,
	notes
)
select
	sa.id,
	date_trunc('month', current_date)::date,
	(date_trunc('month', current_date)::date + interval '9 day')::date,
	100000,
	'PENDING',
	'Iuran wajib bulan berjalan'
from public.saving_accounts sa
join public.saving_products sp on sp.id = sa.saving_product_id
where sp.saving_type = 'WAJIB'
	and sa.start_date <= date_trunc('month', current_date)::date
on conflict (saving_account_id, billing_period) do nothing;

insert into public.saving_transactions (
	member_id,
	saving_product_id,
	amount,
	status,
	transaction_date,
	approved_by,
	approved_at
)
select
	p.id,
	sp.id,
	500000,
	'APPROVED',
	current_date,
	admin_profile.id,
	now()
from public.profiles p
join public.saving_products sp on sp.saving_type = 'POKOK'
left join public.profiles admin_profile on admin_profile.role = 'admin'
where p.role = 'pengguna';

insert into public.saving_transactions (
	member_id,
	saving_product_id,
	saving_obligation_id,
	amount,
	status,
	transaction_date,
	approved_by,
	approved_at
)
select
	p.id,
	sp.id,
	so.id,
	60000,
	'APPROVED',
	current_date - interval '15 day',
	admin_profile.id,
	now() - interval '14 day'
from public.saving_obligations so
join public.saving_accounts sa on sa.id = so.saving_account_id
join public.profiles p on p.id = sa.member_id
join public.saving_products sp on sp.id = sa.saving_product_id and sp.saving_type = 'WAJIB'
left join public.profiles admin_profile on admin_profile.role = 'admin'
where so.billing_period = date_trunc('month', current_date - interval '1 month')::date;

insert into public.saving_transactions (
	member_id,
	saving_product_id,
	saving_obligation_id,
	amount,
	status,
	transaction_date,
	proof_url
)
select
	p.id,
	sp.id,
	so.id,
	100000,
	'PENDING',
	current_date,
	'https://example.com/proof/simpanan-wajib-bulan-ini.jpg'
from public.saving_obligations so
join public.saving_accounts sa on sa.id = so.saving_account_id
join public.profiles p on p.id = sa.member_id
join public.saving_products sp on sp.id = sa.saving_product_id and sp.saving_type = 'WAJIB'
where so.billing_period = date_trunc('month', current_date)::date
	and p.member_number = 'AGT0001';

with member_ref as (
	select id from public.profiles where member_number = 'AGT0001' limit 1
),
loan_product_ref as (
	select id from public.loan_products where name = 'Pinjaman Reguler' limit 1
),
admin_ref as (
	select id from public.profiles where role = 'admin' limit 1
),
created_application as (
	insert into public.loan_applications (
		member_id,
		loan_product_id,
		amount,
		tenor,
		purpose,
		status,
		reviewed_by,
		reviewed_at
	)
	select
		m.id,
		lp.id,
		6000000,
		12,
		'Renovasi rumah',
		'APPROVED',
		a.id,
		now()
	from member_ref m
	cross join loan_product_ref lp
	left join admin_ref a on true
	returning id, member_id
),
created_loan as (
	insert into public.loans (
		application_id,
		member_id,
		principal_amount,
		interest_rate,
		tenor,
		monthly_installment,
		remaining_balance,
		start_date,
		end_date,
		status
	)
	select
		ca.id,
		ca.member_id,
		6000000,
		1.00,
		12,
		550000,
		5400000,
		date_trunc('month', current_date)::date,
		(date_trunc('month', current_date)::date + interval '12 month' - interval '1 day')::date,
		'ACTIVE'
	from created_application ca
	returning id
),
created_installments as (
	insert into public.loan_installments (
		loan_id,
		installment_number,
		due_date,
		amount_due,
		status
	)
	select
		cl.id,
		gs.installment_number,
		(date_trunc('month', current_date)::date + ((gs.installment_number - 1) * interval '1 month'))::date,
		550000,
		case
			when gs.installment_number = 1 then 'PARTIAL'::public.installment_status
			else 'PENDING'::public.installment_status
		end
	from created_loan cl
	cross join generate_series(1, 12) as gs(installment_number)
	returning id, installment_number
)
insert into public.installment_payments (
	installment_id,
	amount,
	payment_date,
	status,
	approved_by,
	approved_at
)
select
	ci.id,
	300000,
	current_date,
	'APPROVED',
	a.id,
	now()
from created_installments ci
left join admin_ref a on true
where ci.installment_number = 1;

commit;
