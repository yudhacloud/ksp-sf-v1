# Aturan Pengkodean Copilot

## Tujuan
Buat Copilot menulis kode yang konsisten dengan struktur dan gaya proyek Next.js ini.

## Umum
- Gunakan bahasa Indonesia untuk komentar, penamaan variabel, dan penjelasan dalam kode bila masuk akal.
- Gunakan `camelCase` untuk nama variabel dan fungsi.
- Gunakan `PascalCase` untuk nama komponen React dan file komponen.
- Hindari membuat file atau direktori yang tidak diperlukan tanpa konfirmasi.
- Jangan menambahkan dependensi baru kecuali diperlukan dan disetujui.

## Struktur folder
- Tempatkan semua kode aplikasi di dalam `src/`.
- `src/app/` untuk route dan layout Next.js App Router.
- `src/components/` untuk komponen UI yang dapat digunakan ulang.
- `src/lib/` untuk utilitas, constants, helper, dan integrasi eksternal.
- `src/services/` untuk layanan API atau permintaan jaringan/data.
- `src/middleware.js` untuk middleware Next.js di level aplikasi.
- Jika folder lain yang umum seperti `src/hooks/`, `src/stores/`, `src/styles/`, atau `src/assets/` diperlukan, buat hanya bila fitur membutuhkan struktur tersebut.

## Penamaan file
- Gunakan `.jsx` untuk komponen React di `src/app` atau `src/components`.
- Gunakan `.js` untuk utilitas, layanan, repository, dan middleware.
- Gunakan nama file yang deskriptif dan singkat.

## Komponen React
- Komponen harus berupa function components.
- Komponen harus menerima `props` secara eksplisit.
- Deklarasikan `export default function NamaKomponen({ ...props }) { ... }`.
- Gunakan destructuring untuk `props` ketika diperlukan.
- Simpan satu komponen utama per file.

## Layout dan Route
- Gunakan `layout.jsx` di setiap segmen route yang membutuhkan layout khusus.
- `src/app/layout.jsx` adalah layout global.
- Buat file `page.jsx` untuk halaman route, dan `layout.jsx` untuk layout nested.

## Styling
- Gunakan `globals.css` untuk gaya global di `src/app/`.
- Gunakan modul CSS hanya bila diperlukan, dengan penamaan file `*.module.css`.
- Jangan menyimpan aturan CSS berlebihan dalam satu file; pisahkan bila perlu.

## Impor dan Ekspor
- Urutkan impor secara logis:
  1. `next` atau dependensi terinstall.
  2. impor internal `src/`.
  3. impor gaya.
- Gunakan ekspor default hanya untuk komponen dan layout utama.
- Gunakan ekspor bernama untuk utilitas dan fungsi bantu.

## Penanganan data dan fungsi
- Simpan logika data di `services`, bukan langsung di komponen halaman bila memungkinkan.
- Untuk data anggota dan resource admin, gunakan service di `src/services/`.
- Jika perlu endpoint khusus, letakkan API route di `src/app/api/...`.
- Komponen halaman harus tetap tipis: fokus pada layout, statistik, dan pemanggilan komponen.
- Gunakan server-side fetch (`page.jsx` async) untuk memuat data awal dari API route.
- Untuk filter dan pencarian, gunakan client component yang menerima data awal dan memprosesnya di frontend.
- Hindari membuat request tambahan setiap kali filter berubah; cukup fetch sekali di awal.
- Gunakan nama fungsi yang menjelaskan tindakan, misal `fetchMembers`, `getMemberStats`, `handleSearch`.

## Data flow rekomendasi
- `src/services/` berisi fungsi data-level seperti `fetchMembers()`.
- `src/app/api/admin/...` berisi route server-side yang memanggil service.
- `src/app/admin/.../page.jsx` adalah server component yang fetch data awal via API route.
- `src/components/admin/...` berisi client component interaktif untuk filter/search.
- Client component menggunakan `useState` + `useMemo` untuk memproses data yang sudah dimuat.

## Komentar dan Dokumentasi
- Berikan komentar singkat jika logika tidak langsung jelas.
- Jangan gunakan komentar untuk menjelaskan kode yang sudah jelas dari konteks.
- Prioritaskan kode yang dapat dibaca ketimbang komentar berlebihan.
- Tambahkan catatan jika ada alasan khusus, misal "data sudah di-fetch sekali di server" atau "filter dijalankan di client agar tidak query ulang".

## Konsistensi Copilot
- Jika ada beberapa opsi implementasi, pilih yang paling sederhana dan paling mudah dipelihara.
- Saat membuat kode baru, ikuti aturan struktur folder dan penamaan yang sudah ada.
- Jangan mengubah struktur folder tanpa menyelaraskan rute dan impor yang relevan.
- Gunakan folder `sql-design/` sebagai acuan struktur database dan relasi yang sudah dirancang.
- Untuk halaman admin, pastikan data yang ditampilkan sesuai peran: misalnya daftar anggota tidak menyertakan akun admin.

## Referensi Database
- `sql-design/creating-table.md` berisi skema tabel dan relasi utama.
- `sql-design/dummy-data.md` berisi contoh data yang dapat digunakan untuk pengujian.
- Pastikan kode data layer sesuai dengan struktur tabel yang ada di `sql-design/`.

## Perubahan besar
- Untuk fitur baru atau perubahan arsitektur, tambahkan catatan ringkas di `copilot.md` jika perlu.
- Selalu validasi dengan `npm run build` setelah perubahan besar pada struktur atau route.
