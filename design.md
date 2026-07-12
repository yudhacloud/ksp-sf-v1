# KSP Sinergi Finansial - Design System

## Design Philosophy

Website menggunakan gaya modern, profesional, dan ringan.

Prioritaskan keterbacaan, navigasi jelas, dan ruang putih yang nyaman.

Setiap elemen harus memiliki tujuan dan mempermudah pengguna.

---

# Design Principles

Gunakan prinsip berikut:

- Clean
- Consistent
- Minimal
- Professional
- Functional
- Accessible

Fokus pada konten, bukan dekorasi yang berlebihan.

---

# Color

| Role           | Color            | Hex       |
| -------------- | ---------------- | --------- |
| Primary        | Forest           | `#064734` |
| Primary Hover  | Forest Dark      | `#043829` |
| Primary Light  | Mint             | `#E0FFC2` |
| Secondary      | Sage             | `#A7D7A0` |
| Accent         | Emerald          | `#27AE60` |
| Background     | Soft Green       | `#F7FCF8` |
| Surface        | White            | `#FFFFFF` |
| Border         | Light Green Gray | `#DCE8E2` |
| Text Primary   | Charcoal         | `#1F2937` |
| Text Secondary | Gray             | `#6B7280` |

| Status   | Color     |
| -------- | --------- |
| Success  | `#22C55E` |
| Pending  | `#F59E0B` |
| Danger   | `#EF4444` |
| Info     | `#3B82F6` |
| Disabled | `#9CA3AF` |

---

## Typography

Gunakan font **DM Sans** untuk semua teks.

Skala tipografi:

- Judul halaman: 2rem
- Subjudul: 1.25rem
- Isi teks: 1rem
- Caption / helper: 0.875rem

Pakai font-weight yang jelas untuk judul, metadata, dan tombol utama.

---

# Layout

Struktur dashboard:

- Sidebar kiri
- Header / Page title
- Ringkasan statistik di atas
- Grid konten utama
- Area sekunder di bawah

Gunakan `container` dengan lebar maksimal dan padding horizontal konsisten.

---

# Spacing

Gunakan jarak konsisten:

- antar section: besar
- antar card: sedang
- antar input: sedang
- antar teks: kecil

Jangan membuat elemen terlalu rapat.

---

# Alignment

- Judul kiri
- Tombol action kanan
- Teks ringkasan kiri
- Konten grid rapi

---

# Card Design

Card harus bersih, sederhana, dan putih.

- border-radius 1rem
- border halus
- shadow ringan
- padding besar
- informasi dipisah rapi

---

# Dashboard Cards

Kartu statistik menampilkan:

- Judul
- Nilai utama
- Deskripsi singkat
- Badge status atau icon kecil

Gunakan aksen hijau untuk nilai positif dan tombol utama.

---

# Sidebar

Sidebar menggunakan permukaan putih dan border hijau lembut.

Item aktif diberi aksen hijau di kiri dan background lembut.

---

# Buttons

Tombol utama menggunakan `#064734`.

Hover tombol utama menggunakan `#043829`.

Tombol sekunder menggunakan border netral dan teks hijau.

---

# Form Design

Form tersusun vertikal:

Judul
↓
Deskripsi
↓
Input
↓
Button action

Input menggunakan border lembut, background putih, dan teks utama gelap.

---

# Visual Hierarchy

Urutan perhatian:

1. Page title
2. Ringkasan informasi
3. Primary action
4. Konten utama
5. Informasi sekunder

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