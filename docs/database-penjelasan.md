# Penjelasan Database Proyek KSP

Dokumen ini menjelaskan fungsi utama tabel database yang digunakan dalam proyek ini, agar memudahkan pemahaman alur bisnis simpan pinjam.

## 1. profiles
Tabel ini menyimpan data utama pengguna dan anggota.

Fungsi:
- menyimpan identitas anggota seperti nama, email, nomor anggota, dan role
- membedakan akun admin dan member
- menjadi sumber utama untuk semua data yang terkait dengan anggota

Contoh data:
- nama lengkap
- email
- nomor anggota
- role: admin / member

---

## 2. saving_products
Tabel ini berisi daftar produk simpanan yang tersedia.

Fungsi:
- mendefinisikan jenis simpanan yang bisa digunakan
- biasanya berisi produk seperti pokok, wajib, dan sukarela
- menjadi master data untuk akun simpanan anggota

Contoh produk:
- Simpanan Pokok
- Simpanan Wajib
- Simpanan Sukarela

---

## 3. saving_accounts
Tabel ini menghubungkan anggota dengan produk simpanan tertentu.

Fungsi:
- menyatakan bahwa seorang member memiliki akun untuk jenis simpanan tertentu
- satu member bisa memiliki beberapa akun simpanan sekaligus
- menjadi dasar pembuatan tagihan simpanan

Hubungan:
- `member_id` mengarah ke `profiles`
- `saving_product_id` mengarah ke `saving_products`

---

## 4. saving_obligations
Tabel ini mencatat tagihan atau kewajiban pembayaran simpanan.

Fungsi:
- membuat tagihan untuk simpanan pokok, wajib, atau jenis lainnya
- menyimpan nominal, periode, dan jatuh tempo
- dipakai untuk memantau apakah tagihan sudah dibayar atau belum

Contoh isi:
- tagihan bulan ini
- nominal tagihan
- status: pending / paid / overdue

---

## 5. saving_transactions
Tabel ini mencatat setiap transaksi pembayaran simpanan.

Fungsi:
- merekam pembayaran yang masuk dari member
- menghubungkan pembayaran dengan tagihan tertentu
- dipakai untuk menentukan apakah tagihan sudah lunas atau belum

Hubungan:
- `member_id` mengarah ke `profiles`
- `saving_obligation_id` mengarah ke `saving_obligations`
- `saving_product_id` mengarah ke `saving_products`

---

## 6. loan_products
Tabel ini menyimpan daftar produk pinjaman yang tersedia.

Fungsi:
- mendefinisikan jenis pinjaman yang bisa diajukan
- berisi aturan seperti batas pinjaman, bunga, dan tenor

Contoh produk:
- Pinjaman Reguler
- Pinjaman Mikro

---

## 7. loan_applications
Tabel ini mencatat pengajuan pinjaman oleh anggota.

Fungsi:
- menampung permohonan pinjaman dari member
- menyimpan nominal, tenor, dan status review
- menjadi tahap sebelum pinjaman aktif dibuat

Contoh status:
- pending
- approved
- rejected

---

## 8. loans
Tabel ini menyimpan data pinjaman yang sudah disetujui dan aktif.

Fungsi:
- menjadi catatan pinjaman yang sedang berjalan
- berisi data utama pinjaman aktif anggota
- dipakai untuk monitoring saldo pinjaman

---

## 9. loan_installments
Tabel ini memecah pinjaman menjadi beberapa cicilan.

Fungsi:
- mengatur jadwal pembayaran cicilan per bulan
- menyimpan nominal cicilan dan tanggal jatuh tempo
- mempermudah sistem menghitung pembayaran pinjaman

---

## 10. installment_payments
Tabel ini mencatat pembayaran cicilan pinjaman.

Fungsi:
- merekam pembayaran setiap cicilan
- dipakai untuk mengetahui cicilan mana yang sudah dibayar
- mempermudah admin menilai progres pelunasan pinjaman

---

## 11. notifications
Tabel ini menyimpan notifikasi untuk member atau admin.

Fungsi:
- memberi tahu pengguna tentang tagihan, pembayaran, atau status pengajuan
- membantu komunikasi internal sistem

---

## 12. audit_logs
Tabel ini mencatat aktivitas penting yang terjadi di sistem.

Fungsi:
- mencatat perubahan data penting
- membantu melihat siapa yang mengubah apa dan kapan
- berguna untuk audit dan keamanan

---

## Alur singkat sistem
Secara sederhana, alurnya seperti ini:

1. Anggota dibuat di `profiles`
2. Anggota mendapatkan akun simpanan di `saving_accounts`
3. Tagihan dibuat di `saving_obligations`
4. Pembayaran dicatat di `saving_transactions`
5. Untuk pinjaman, aplikasi diajukan di `loan_applications`
6. Jika disetujui, pinjaman aktif masuk ke `loans`
7. Cicilan dibuat di `loan_installments`
8. Pembayaran cicilan dicatat di `installment_payments`

---

## Ringkasan singkat
- `profiles` = data anggota
- `saving_products` = jenis simpanan
- `saving_accounts` = akun simpanan member
- `saving_obligations` = tagihan simpanan
- `saving_transactions` = pembayaran simpanan
- `loan_products` = jenis pinjaman
- `loan_applications` = pengajuan pinjaman
- `loans` = pinjaman aktif
- `loan_installments` = cicilan pinjaman
- `installment_payments` = pembayaran cicilan
- `notifications` = notifikasi
- `audit_logs` = jejak aktivitas

Jika Anda mau, dokumen ini bisa dilanjutkan menjadi versi yang lebih detail dengan diagram relasi antar tabel.
