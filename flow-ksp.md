# Flow Sistem Koperasi Simpan Pinjam (KSP)

## 1. Authentication

``` text
Login
├── Admin
└── Pengguna (Anggota)
```

**Tabel:** `auth.users`, `profiles`

## 2. Manajemen Anggota

``` text
Admin membuat akun
    ↓
auth.users
    ↓
profiles
    ↓
Anggota dapat login
```

**Tabel:** `profiles`

## 3. Kelola Produk Simpanan

-   Tambah produk
-   Edit produk
-   Nonaktifkan produk
-   Lihat daftar produk

**Tabel:** `saving_products`

## 4. Pengajuan Simpanan

``` text
Anggota
↓
Pilih Produk
↓
Input Nominal
↓
Upload Bukti (Opsional)
↓
Submit
↓
Status = PENDING
```

**Tabel:** `saving_transactions`

## 5. Approval Simpanan

``` text
Admin
↓
Verifikasi
├── APPROVED
└── REJECTED
```

**Tabel:** `saving_transactions`

## 6. Riwayat Simpanan

-   Total simpanan
-   Riwayat transaksi
-   Filter jenis simpanan

**Tabel:** `saving_transactions`

## 7. Kelola Produk Pinjaman

-   Tambah
-   Edit
-   Nonaktifkan

**Tabel:** `loan_products`

## 8. Pengajuan Pinjaman

``` text
Anggota
↓
Pilih Produk
↓
Nominal
↓
Tenor
↓
Tujuan
↓
Submit (PENDING)
```

**Tabel:** `loan_applications`

## 9. Approval Pinjaman

``` text
Admin
↓
Review
↓
Approve
↓
Buat Loan
↓
Generate Cicilan
```

**Tabel:** `loan_applications`, `loans`, `loan_installments`

## 10. Generate Jadwal Cicilan

``` text
Loan
↓
Tenor
↓
Generate seluruh cicilan
```

## 11. Melihat Pinjaman

-   Pinjaman aktif
-   Sisa hutang
-   Jadwal cicilan

**Tabel:** `loans`, `loan_installments`

## 12. Upload Pembayaran Cicilan

``` text
Anggota
↓
Pilih Cicilan
↓
Upload Bukti
↓
Input Nominal
↓
Submit (PENDING)
```

**Tabel:** `installment_payments`

## 13. Approval Pembayaran

``` text
Admin
↓
Verifikasi
├── Approve
└── Reject
```

**Tabel:** `installment_payments`, `loan_installments`, `loans`

## 14. Pelunasan Pinjaman

``` text
Semua Cicilan PAID
↓
Loan = PAID
```

## 15. Notifikasi

Dikirim saat: - Simpanan disetujui / ditolak - Pinjaman disetujui /
ditolak - Pembayaran cicilan disetujui / ditolak

**Tabel:** `notifications`

## 16. Audit Log

Mencatat aktivitas penting admin: - Approve / Reject - Tambah / Edit
data - Aktivitas administrasi

**Tabel:** `audit_logs`

## 17. Dashboard Anggota

-   Total Simpanan
-   Pinjaman Aktif
-   Sisa Hutang
-   Cicilan Berikutnya
-   Riwayat
-   Notifikasi

## 18. Dashboard Admin

-   Total Anggota
-   Total Simpanan
-   Total Pinjaman
-   Pengajuan Pending
-   Pembayaran Pending
-   Grafik

## Flow Utama

``` text
                    LOGIN
                      │
         ┌────────────┴────────────┐
         │                         │
      ADMIN                    ANGGOTA
         │                         │
         │                  Simpanan / Pinjaman
         │                         │
         │                         ▼
         │          Saving Transaction / Loan Application
         │                         │
         ▼                         ▼
               Approval oleh Admin
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
 Simpanan      Loan + Cicilan     Pembayaran
 Approved        Generated          Cicilan
      └───────────────┴────────────────┘
                      │
                      ▼
            Riwayat & Notifikasi
```
