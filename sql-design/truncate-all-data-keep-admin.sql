-- =========================================================
-- RESET DATA UNTUK TESTING REAL
-- =========================================================
-- Tujuan:
--   Menghapus seluruh data operasional aplikasi, tetapi menyisakan
--   akun admin serta master data produk pinjaman dan simpanan agar
--   aplikasi tetap bisa digunakan untuk testing tanpa data anggota.
--
-- Catatan:
--   Script ini menghapus data dari tabel publik dan auth.
--   Pastikan Anda menjalankannya dari SQL editor dengan akses yang cukup.
-- =========================================================

BEGIN;

DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    SELECT id INTO admin_user_id
    FROM public.profiles
    WHERE role = 'admin'
    LIMIT 1;

    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Akun admin tidak ditemukan di public.profiles';
    END IF;

    -- Jaga agar master data produk tetap aman dan tidak ikut dihapus
    -- Produk simpanan dan pinjaman hanya diisi ulang jika memang belum ada.

    -- Hapus seluruh log dan notifikasi agar reset bersih dan tidak meninggalkan data operasional lama
    DELETE FROM public.audit_logs;

    DELETE FROM public.notifications;

    DELETE FROM public.installment_payments
    WHERE installment_id IN (
        SELECT li.id
        FROM public.loan_installments li
        JOIN public.loans l ON l.id = li.loan_id
        WHERE l.member_id IS DISTINCT FROM admin_user_id
    );

    DELETE FROM public.loan_installments
    WHERE loan_id IN (
        SELECT id
        FROM public.loans
        WHERE member_id IS DISTINCT FROM admin_user_id
    );

    DELETE FROM public.loans
    WHERE member_id IS DISTINCT FROM admin_user_id;

    DELETE FROM public.loan_applications
    WHERE member_id IS DISTINCT FROM admin_user_id;

    DELETE FROM public.saving_transactions
    WHERE member_id IS DISTINCT FROM admin_user_id;

    DELETE FROM public.saving_obligations
    WHERE saving_account_id IN (
        SELECT id
        FROM public.saving_accounts
        WHERE member_id IS DISTINCT FROM admin_user_id
    );

    DELETE FROM public.saving_accounts
    WHERE member_id IS DISTINCT FROM admin_user_id;

    -- Hanya sisakan akun admin di public.profiles
    DELETE FROM public.profiles
    WHERE id IS DISTINCT FROM admin_user_id;

    -- Pastikan produk master tetap tersedia untuk testing dan konsisten dengan nama/tipe
    INSERT INTO public.saving_products (name, saving_type, default_amount, description, is_active)
    VALUES
        ('Simpanan Pokok', 'POKOK', 100000, 'Simpanan pokok yang wajib dibayar sekali saat anggota aktif', true),
        ('Simpanan Wajib', 'WAJIB', 100000, 'Simpanan wajib bulanan yang harus dibayar secara rutin', true),
        ('Simpanan Sukarela', 'SUKARELA', 50000, 'Simpanan sukarela yang dibayar secara opsional', true)
    ON CONFLICT (name) DO UPDATE
    SET
        saving_type = EXCLUDED.saving_type,
        default_amount = EXCLUDED.default_amount,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active;

    UPDATE public.saving_products
    SET saving_type = CASE
        WHEN name = 'Simpanan Pokok' THEN 'POKOK'
        WHEN name = 'Simpanan Wajib' THEN 'WAJIB'
        WHEN name = 'Simpanan Sukarela' THEN 'SUKARELA'
        ELSE saving_type
    END,
    default_amount = CASE
        WHEN name = 'Simpanan Pokok' THEN 100000
        WHEN name = 'Simpanan Wajib' THEN 100000
        WHEN name = 'Simpanan Sukarela' THEN 50000
        ELSE default_amount
    END,
    is_active = true
    WHERE name IN ('Simpanan Pokok', 'Simpanan Wajib', 'Simpanan Sukarela');

    INSERT INTO public.loan_products (name, max_amount, interest_rate, max_tenor, is_active)
    VALUES
        ('Pinjaman Umum', 50000000, 12, 12, true)
    ON CONFLICT (name) DO UPDATE
    SET
        max_amount = EXCLUDED.max_amount,
        interest_rate = EXCLUDED.interest_rate,
        max_tenor = EXCLUDED.max_tenor,
        is_active = EXCLUDED.is_active;

    -- Hapus auth user non-admin agar hanya admin yang tersisa
    DELETE FROM auth.identities
    WHERE user_id IS DISTINCT FROM admin_user_id;

    DELETE FROM auth.users
    WHERE id IS DISTINCT FROM admin_user_id;
END
$$;

COMMIT;
