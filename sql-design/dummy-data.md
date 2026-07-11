-- ==========================================
-- DUMMY DATA PROFILES
-- ==========================================

-- Clear existing dummy data before reinserting. Run this after the schema exists.
TRUNCATE TABLE public.installment_payments,
    public.loan_installments,
    public.loans,
    public.loan_applications,
    public.loan_products,
    public.saving_transactions,
    public.saving_products,
    public.notifications,
    public.audit_logs,
    public.profiles
    RESTART IDENTITY CASCADE;

INSERT INTO public.profiles (
    id,
    member_number,
    full_name,
    email,
    phone,
    address
)
SELECT
    id,
    'AGT0001',
    'Andi Pratama',
    email,
    '081111111111',
    'Surabaya'
FROM auth.users
WHERE email = 'andi@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    id,
    member_number,
    full_name,
    email,
    phone,
    address
)
SELECT
    id,
    'AGT0002',
    'Budi Santoso',
    email,
    '082222222222',
    'Malang'
FROM auth.users
WHERE email = 'budi@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    id,
    member_number,
    full_name,
    email,
    phone,
    address
)
SELECT
    id,
    'AGT0003',
    'Citra Lestari',
    email,
    '083333333333',
    'Sidoarjo'
FROM auth.users
WHERE email = 'citra@example.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    id,
    member_number,
    full_name,
    email,
    phone,
    role,
    address,
    status
)
SELECT
    id,
    'ADM0001',
    'Admin Sistem',
    email,
    '081200001234',
    'admin',
    'Kantor Pusat',
    true
FROM auth.users
WHERE email = 'admin@kspsf.com'
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- SAVING PRODUCTS
-- ==========================================

INSERT INTO public.saving_products (
    name,
    saving_type,
    description
)
VALUES
('Simpanan Pokok', 'POKOK', 'Setoran satu kali saat menjadi anggota'),
('Simpanan Wajib', 'WAJIB', 'Setoran rutin setiap bulan'),
('Simpanan Sukarela', 'SUKARELA', 'Setoran bebas')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- LOAN PRODUCTS
-- ==========================================

INSERT INTO public.loan_products (
    name,
    max_amount,
    interest_rate,
    max_tenor
)
VALUES
('Pinjaman Reguler', 20000000, 1.00, 24),
('Pinjaman Pendidikan', 10000000, 0.75, 12),
('Pinjaman Darurat', 5000000, 0.50, 6)
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- DUMMY SAVING TRANSACTIONS
-- ==========================================

INSERT INTO public.saving_transactions (
    member_id,
    saving_product_id,
    amount,
    status,
    transaction_date
)
SELECT
    p.id,
    sp.id,
    500000,
    'APPROVED',
    CURRENT_DATE
FROM profiles p
JOIN saving_products sp
    ON sp.saving_type = 'POKOK'
WHERE p.member_number = 'AGT0001';

INSERT INTO public.saving_transactions (
    member_id,
    saving_product_id,
    amount,
    status,
    transaction_date
)
SELECT
    p.id,
    sp.id,
    500000,
    'APPROVED',
    CURRENT_DATE
FROM profiles p
JOIN saving_products sp
    ON sp.saving_type = 'POKOK'
WHERE p.member_number = 'AGT0002';

INSERT INTO public.saving_transactions (
    member_id,
    saving_product_id,
    amount,
    status,
    transaction_date
)
SELECT
    p.id,
    sp.id,
    500000,
    'APPROVED',
    CURRENT_DATE
FROM profiles p
JOIN saving_products sp
    ON sp.saving_type = 'POKOK'
WHERE p.member_number = 'AGT0003';