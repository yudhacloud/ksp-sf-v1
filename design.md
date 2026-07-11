# KSP Sinergi Finansial - Design System

## Design Philosophy

Website menggunakan gaya modern, profesional, bersih, dan mudah digunakan oleh seluruh kalangan.

Prioritaskan keterbacaan daripada dekorasi.

Hindari tampilan yang terlalu ramai.

Gunakan banyak ruang kosong (white space).

Semua halaman harus memiliki hirarki visual yang jelas.

---

# Design Principles

Selalu gunakan prinsip berikut:

- Clean
- Consistent
- Minimal
- Professional
- Functional
- Accessible

Semua elemen harus memiliki tujuan.

Jangan menambahkan dekorasi yang tidak memiliki fungsi.

---

# Visual Hierarchy

Urutan perhatian pengguna harus selalu:

1. Page Title
2. Summary Information
3. Primary Action
4. Filter / Search
5. Main Content
6. Secondary Information

---

# Layout

Setiap halaman dashboard memiliki struktur yang sama.

Header

↓

Breadcrumb

↓

Judul Halaman

↓

Ringkasan (jika diperlukan)

↓

Action Button

↓

Filter & Search

↓

Content

↓

Pagination

Jangan mengubah urutan ini.

---

# Page Width

Gunakan lebar yang konsisten.

Konten tidak boleh menempel ke tepi layar.

Gunakan spacing yang cukup.

---

# Spacing

Gunakan jarak yang konsisten.

Antar Section

Besar

Antar Card

Sedang

Antar Input

Sedang

Antar Text

Kecil

Jangan membuat elemen terlalu rapat.

---

# Alignment

Gunakan alignment yang konsisten.

Title

Kiri

Button

Kanan

Statistik

Grid

Table

Full Width

---

# Card Design

Semua card memiliki gaya yang sama.

Border radius konsisten.

Shadow tipis.

Padding besar.

Judul di bagian atas.

Konten mudah dibaca.

Hindari card dengan terlalu banyak informasi.

---

# Statistics Card

Setiap statistik hanya menampilkan:

Nama Statistik

Nilai

Icon

Opsional:

Persentase

Trend

Jangan menambahkan informasi lain.

---

# Table Design

Table adalah komponen utama.

Gunakan tampilan sederhana.

Header jelas.

Kolom rata.

Action berada di kolom terakhir.

Status menggunakan Badge.

Nominal rata kanan.

Tanggal konsisten.

---

# Form Design

Semua form memiliki struktur yang sama.

Judul

↓

Deskripsi (opsional)

↓

Input

↓

Button Action

Input disusun vertikal.

Label selalu berada di atas input.

---

# Detail Page

Halaman detail menggunakan beberapa card.

Informasi dikelompokkan berdasarkan kategori.

Contoh:

Informasi Anggota

Informasi Pinjaman

Riwayat Pembayaran

Dokumen

Aktivitas

---

# Search & Filter

Search selalu berada di kiri.

Filter berada di kanan.

Action utama berada di kanan atas.

Gunakan urutan:

Search

↓

Filter

↓

Button

---

# Navigation

Sidebar digunakan untuk navigasi utama.

Navbar hanya berisi:

Profile

Notification

Logout

Jangan menaruh menu utama di Navbar.

---

# Badge

Gunakan badge untuk status.

Status harus mudah dibedakan.

Contoh:

Pending

Approved

Rejected

Paid

Partial

Overdue

---

# Empty State

Jika data kosong.

Tampilkan:

Icon

Judul

Deskripsi singkat

Button jika diperlukan

Jangan hanya menampilkan tabel kosong.

---

# Loading State

Gunakan Skeleton Loading.

Hindari spinner untuk seluruh halaman.

Spinner hanya digunakan pada button atau proses singkat.

---

# Error State

Error harus memiliki:

Judul

Deskripsi

Button untuk mencoba kembali

---

# Confirmation

Semua aksi penting memerlukan konfirmasi.

Contoh:

Hapus

Approve

Reject

Batalkan

---

# Notification

Notifikasi tidak mengganggu pekerjaan pengguna.

Gunakan Toast untuk aksi berhasil.

Gunakan Modal untuk aksi penting.

---

# Dashboard

Dashboard adalah ringkasan.

Jangan tampilkan tabel panjang.

Prioritaskan:

Statistik

Grafik

Aktivitas Terbaru

Notifikasi

---

# Data Density

Jangan menampilkan terlalu banyak informasi dalam satu halaman.

Jika data panjang:

Gunakan:

Pagination

Filter

Search

Detail Page

---

# Color Usage

Warna hanya digunakan untuk:

Status

Warning

Error

Success

Primary Action

Jangan menggunakan terlalu banyak warna dalam satu halaman.

---

# Icon Usage

Gunakan icon hanya untuk membantu pemahaman.

Jangan gunakan icon sebagai dekorasi.

Setiap icon harus memiliki arti.

---

# Responsive Behavior

Desktop adalah prioritas utama.

Pada layar kecil:

Card menjadi vertikal.

Table dapat di-scroll horizontal.

Button tidak bertumpuk jika masih memungkinkan.

---

# UX Principles

Kurangi jumlah klik.

Selalu tampilkan status proses.

Pengguna harus selalu tahu apa yang sedang terjadi.

Hindari perpindahan halaman yang tidak perlu.

Gunakan modal untuk aksi sederhana.

Gunakan halaman baru untuk data kompleks.

---

# Design Consistency

Semua halaman harus terlihat dibuat oleh sistem yang sama.

Jangan membuat layout yang berbeda-beda.

Gunakan pola yang sama untuk:

List

Detail

Form

Modal

Dashboard

---

# Before Creating Any UI

Pastikan desain menjawab pertanyaan berikut:

- Apakah informasi utama langsung terlihat?
- Apakah pengguna tahu tindakan utama yang harus dilakukan?
- Apakah halaman mudah dipindai dalam beberapa detik?
- Apakah komponen yang digunakan konsisten dengan halaman lain?
- Apakah tata letak tetap rapi saat data sedikit maupun banyak?

Jika salah satu jawabannya "tidak", perbaiki desain sebelum membuat implementasi.