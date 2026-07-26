-- RLS policy set for the KSP schema (condensed with FOR ALL for admin CRUD).
--
-- Assumption:
-- - Admin identity is stored in JWT app_metadata.role = 'admin'.
-- - Member identity is auth.uid() matching public.profiles.id.
-- - Service role queries bypass RLS.
--
-- Optional cleanup before re-running this file:
-- drop policy if exists "admin full access profiles" on public.profiles;
-- drop policy if exists "member can read own profile" on public.profiles;
-- ...repeat for legacy policy names as needed.

-- =========================================================
-- PROFILES
-- =========================================================
alter table public.profiles enable row level security;

create policy "admin full access profiles"
on public.profiles
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "member can read own profile"
on public.profiles
as permissive
for select
to authenticated
using (
  id = auth.uid()
);

-- =========================================================
-- SAVING PRODUCTS
-- =========================================================
alter table public.saving_products enable row level security;

create policy "admin full access saving products"
on public.saving_products
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "authenticated users can read active saving products"
on public.saving_products
as permissive
for select
to authenticated
using (
  is_active = true
);

-- =========================================================
-- SAVING TRANSACTIONS
-- =========================================================
alter table public.saving_transactions enable row level security;

create policy "admin full access saving transactions"
on public.saving_transactions
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "member can read own saving transactions"
on public.saving_transactions
as permissive
for select
to authenticated
using (
  member_id = auth.uid()
);

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

-- =========================================================
-- SAVING ACCOUNTS
-- =========================================================
alter table public.saving_accounts enable row level security;

create policy "admin full access saving accounts"
on public.saving_accounts
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "member can read own saving accounts"
on public.saving_accounts
as permissive
for select
to authenticated
using (
  member_id = auth.uid()
);

-- =========================================================
-- SAVING OBLIGATIONS
-- =========================================================
alter table public.saving_obligations enable row level security;

create policy "admin full access saving obligations"
on public.saving_obligations
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

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

-- =========================================================
-- LOAN PRODUCTS
-- =========================================================
alter table public.loan_products enable row level security;

create policy "admin full access loan products"
on public.loan_products
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


create policy "authenticated users can read active loan products"
on public.loan_products
as permissive
for select
to authenticated
using (
  is_active = true
);

-- =========================================================
-- LOAN APPLICATIONS
-- =========================================================
alter table public.loan_applications enable row level security;

create policy "admin full access loan applications"
on public.loan_applications
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "member can read own loan applications"
on public.loan_applications
as permissive
for select
to authenticated
using (
  member_id = auth.uid()
);

create policy "member can insert own loan applications"
on public.loan_applications
as permissive
for insert
to authenticated
with check (
  member_id = auth.uid()
  and status = 'PENDING'
);


-- =========================================================
-- LOANS
-- =========================================================
alter table public.loans enable row level security;

create policy "admin full access loans"
on public.loans
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "member can read own loans"
on public.loans
as permissive
for select
to authenticated
using (
  member_id = auth.uid()
);

-- =========================================================
-- LOAN INSTALLMENTS
-- =========================================================
alter table public.loan_installments enable row level security;

create policy "admin full access loan installments"
on public.loan_installments
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

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

-- =========================================================
-- INSTALLMENT PAYMENTS
-- =========================================================
alter table public.installment_payments enable row level security;

create policy "admin full access installment payments"
on public.installment_payments
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

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

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
alter table public.notifications enable row level security;

create policy "admin full access notifications"
on public.notifications
as permissive
for all
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "member can read own notifications"
on public.notifications
as permissive
for select
to authenticated
using (
  member_id = auth.uid()
);

create policy "member can update own notifications"
on public.notifications
as permissive
for update
to authenticated
using (
  member_id = auth.uid()
)
with check (
  member_id = auth.uid()
);

-- =========================================================
-- AUDIT LOGS
-- =========================================================
alter table public.audit_logs enable row level security;

create policy "admin can read audit logs"
on public.audit_logs
as permissive
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

