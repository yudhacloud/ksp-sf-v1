-- RLS policy set for the KSP schema.
--
-- Assumption:
-- - Admin identity is stored in JWT app_metadata.role = 'admin'.
-- - Member identity is auth.uid() matching public.profiles.id.
-- - Service role queries bypass RLS, so these policies matter for authenticated user-context access.

-- =========================================================
-- PROFILES
-- =========================================================
alter table public.profiles enable row level security;

create policy "admin can read all profiles"
on public.profiles
as permissive
for select
to authenticated
using (
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

create policy "admin can insert profiles"
on public.profiles
as permissive
for insert
to authenticated
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can update profiles"
on public.profiles
as permissive
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can delete profiles"
on public.profiles
as permissive
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- =========================================================
-- SAVING PRODUCTS
-- =========================================================
alter table public.saving_products enable row level security;

create policy "admin can read all saving products"
on public.saving_products
as permissive
for select
to authenticated
using (
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

create policy "admin can insert saving products"
on public.saving_products
as permissive
for insert
to authenticated
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can update saving products"
on public.saving_products
as permissive
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can delete saving products"
on public.saving_products
as permissive
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- =========================================================
-- SAVING TRANSACTIONS
-- =========================================================
alter table public.saving_transactions enable row level security;

create policy "member can read own saving transactions"
on public.saving_transactions
as permissive
for select
to authenticated
using (
  member_id = auth.uid()
);

create policy "admin can read all saving transactions"
on public.saving_transactions
as permissive
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "member can insert own saving transactions"
on public.saving_transactions
as permissive
for insert
to authenticated
with check (
  member_id = auth.uid()
  and status = 'PENDING'
);

create policy "admin can update saving transactions"
on public.saving_transactions
as permissive
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can delete saving transactions"
on public.saving_transactions
as permissive
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- =========================================================
-- LOAN PRODUCTS
-- =========================================================
alter table public.loan_products enable row level security;

create policy "admin can read all loan products"
on public.loan_products
as permissive
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Optional: let authenticated members read active loan products.
create policy "authenticated users can read active loan products"
on public.loan_products
as permissive
for select
to authenticated
using (
  is_active = true
);

create policy "admin can insert loan products"
on public.loan_products
as permissive
for insert
to authenticated
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can update loan products"
on public.loan_products
as permissive
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can delete loan products"
on public.loan_products
as permissive
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- =========================================================
-- LOAN APPLICATIONS
-- =========================================================
alter table public.loan_applications enable row level security;

create policy "member can read own loan applications"
on public.loan_applications
as permissive
for select
to authenticated
using (
  member_id = auth.uid()
);

create policy "admin can read all loan applications"
on public.loan_applications
as permissive
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
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

create policy "admin can update loan applications"
on public.loan_applications
as permissive
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can delete loan applications"
on public.loan_applications
as permissive
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- =========================================================
-- LOANS
-- =========================================================
alter table public.loans enable row level security;

create policy "member can read own loans"
on public.loans
as permissive
for select
to authenticated
using (
  member_id = auth.uid()
);

create policy "admin can read all loans"
on public.loans
as permissive
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can insert loans"
on public.loans
as permissive
for insert
to authenticated
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can update loans"
on public.loans
as permissive
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can delete loans"
on public.loans
as permissive
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- =========================================================
-- LOAN INSTALLMENTS
-- =========================================================
alter table public.loan_installments enable row level security;

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

create policy "admin can read all loan installments"
on public.loan_installments
as permissive
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can insert loan installments"
on public.loan_installments
as permissive
for insert
to authenticated
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can update loan installments"
on public.loan_installments
as permissive
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can delete loan installments"
on public.loan_installments
as permissive
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- =========================================================
-- INSTALLMENT PAYMENTS
-- =========================================================
alter table public.installment_payments enable row level security;

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

create policy "admin can read all installment payments"
on public.installment_payments
as permissive
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
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

create policy "admin can update installment payments"
on public.installment_payments
as permissive
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can delete installment payments"
on public.installment_payments
as permissive
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
alter table public.notifications enable row level security;

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

create policy "admin can read all notifications"
on public.notifications
as permissive
for select
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can insert notifications"
on public.notifications
as permissive
for insert
to authenticated
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can update notifications"
on public.notifications
as permissive
for update
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can delete notifications"
on public.notifications
as permissive
for delete
to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
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

-- Usually audit logs are written by service role from backend.
-- Service role bypasses RLS, so insert policies are optional.
