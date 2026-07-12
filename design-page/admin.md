# Admin Pages

## Sidebar Navigation

Dashboard

Anggota

Produk Simpanan

Transaksi Simpanan

Produk Pinjaman

Pengajuan Pinjaman

Pinjaman Aktif

Pembayaran Cicilan

Laporan

Pengaturan

---

# Dashboard

## Tujuan

Menampilkan ringkasan kondisi koperasi secara keseluruhan.

## Ringkasan

- Total Anggota
- Total Simpanan
- Total Pinjaman Aktif
- Total Pendapatan Bunga
- Total Dana Keluar
- Total Dana Masuk
- Total Tunggakan
- Approval Pending

## Grafik

### Grafik Simpanan

- Harian
- Bulanan
- Tahunan

### Grafik Pinjaman

- Nominal pinjaman
- Jumlah pengajuan

### Cash Flow

- Dana Masuk
- Dana Keluar

## Approval Center

Card

- Simpanan Pending
- Pengajuan Pinjaman Pending
- Pembayaran Cicilan Pending

Setiap card memiliki tombol

- Lihat Semua

## Aktivitas Terbaru

Timeline

- Simpanan baru
- Pinjaman baru
- Approval
- Pembayaran

---

# Anggota

## Ringkasan

- Total Anggota
- Anggota Aktif
- Anggota Nonaktif

## Filter

- Nama
- Nomor Anggota
- Status

## Tabel

- Nomor Anggota
- Nama
- Email
- Nomor HP
- Tanggal Bergabung
- Status
- Aksi

## Detail Anggota

### Informasi

- Foto
- Nama
- Email
- Nomor HP
- Alamat
- Tanggal Bergabung

### Statistik

- Total Simpanan
- Total Pinjaman
- Total Cicilan
- Sisa Pinjaman

### Riwayat Simpanan

Table

### Riwayat Pinjaman

Table

### Riwayat Pembayaran

Table

---

# Produk Simpanan

## Ringkasan

- Jumlah Produk

## Tabel

- Nama Produk
- Jenis
- Nominal
- Status

## CRUD

- Tambah
- Edit
- Hapus

---

# Transaksi Simpanan

## Ringkasan

- Pending
- Approved
- Rejected
- Total Nominal

## Filter

- Status
- Jenis Simpanan
- Tanggal

## Tabel

- Anggota
- Jenis
- Nominal
- Tanggal
- Status

## Detail

### Informasi

- Nama Anggota
- Jenis Simpanan
- Nominal
- Tanggal Transfer
- Catatan

### Bukti Transfer

Preview Image

### Action

- Approve
- Reject

---

# Produk Pinjaman

## Ringkasan

- Jumlah Produk

## Tabel

- Nama Produk
- Maksimal Pinjaman
- Bunga
- Tenor
- Status

## CRUD

- Tambah
- Edit
- Hapus

---

# Pengajuan Pinjaman

## Ringkasan

- Pending
- Approved
- Rejected

## Filter

- Status
- Tanggal

## Tabel

- Nama Anggota
- Produk
- Nominal
- Tenor
- Status

## Detail

### Profil Anggota

### Riwayat Simpanan

### Riwayat Pinjaman

### Tujuan Pinjaman

### Action

- Approve
- Reject

---

# Pinjaman Aktif

## Ringkasan

- Total Pinjaman Aktif
- Total Piutang
- Total Tunggakan

## Filter

- Nama
- Status

## Tabel

- Anggota
- Nominal
- Sisa Pinjaman
- Tenor
- Status

## Detail

### Informasi Pinjaman

### Jadwal Cicilan

### Riwayat Pembayaran

### Progress Pelunasan

Progress Bar

---

# Pembayaran Cicilan

## Ringkasan

- Pending
- Approved
- Rejected

## Filter

- Status
- Tanggal

## Tabel

- Anggota
- Nominal
- Tanggal
- Status

## Detail

### Informasi

- Nama Anggota
- Nominal
- Sisa Cicilan
- Catatan

### Bukti Transfer

Preview

### Action

- Approve
- Reject

---

# Laporan

## Ringkasan

- Total Simpanan
- Total Pinjaman
- Total Pembayaran
- Total Pendapatan Bunga

## Filter

- Rentang Tanggal
- Jenis Laporan

## Tabel

Menyesuaikan filter

## Export

- CSV

---

# Pengaturan

## Profil Koperasi

- Nama
- Logo
- Alamat
- Email
- Nomor Telepon

## Rekening Pembayaran

- Bank
- Nomor Rekening
- Atas Nama

CRUD

## Pengguna Admin

- Nama
- Email
- Role

CRUD

## Pengaturan Sistem

- Nominal Simpanan Pokok
- Nominal Simpanan Wajib
- Bunga Default
- Jatuh Tempo