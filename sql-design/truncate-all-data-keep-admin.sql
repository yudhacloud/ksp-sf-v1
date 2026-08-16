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

    -- Hapus data operasional yang terkait anggota non-admin
    DELETE FROM public.audit_logs
    WHERE actor_id IS DISTINCT FROM admin_user_id;

    DELETE FROM public.notifications
    WHERE member_id IS DISTINCT FROM admin_user_id;

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

    -- Hapus profil pengguna non-admin, tapi sisakan profil admin
    DELETE FROM public.profiles
    WHERE id IS DISTINCT FROM admin_user_id;

    -- Pertahankan master data produk pinjaman dan simpanan
    -- Pastikan produk default tetap tersedia jika belum ada
    INSERT INTO public.saving_products (name, saving_type, default_amount, description, is_active)
    VALUES
        ('Simpanan Pokok', 'POKOK', 100000, 'Simpanan pokok yang wajib dibayar sekali saat anggota aktif', true),
        ('Simpanan Wajib', 'WAJIB', 100000, 'Simpanan wajib bulanan yang harus dibayar secara rutin', true),
        ('Simpanan Sukarela', 'SUKARELA', 50000, 'Simpanan sukarela yang dibayar secara opsional', true)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.loan_products (name, max_amount, interest_rate, max_tenor, is_active)
    VALUES
        ('Pinjaman Umum', 50000000, 12, 12, true)
    ON CONFLICT (name) DO NOTHING;

    -- Bersihkan auth user non-admin agar hanya admin yang tersisa
    DELETE FROM auth.identities
    WHERE user_id IS DISTINCT FROM admin_user_id;

    DELETE FROM auth.users
    WHERE id IS DISTINCT FROM admin_user_id;
END
$$;

COMMIT;
