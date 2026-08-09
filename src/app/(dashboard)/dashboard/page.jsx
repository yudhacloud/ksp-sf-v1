import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  return (
    <div className="container py-3">
      <PageHeader
        title="Dashboard Anggota"
        subtitle="Pantau simpanan, pinjaman, dan aktivitas keuangan Anda dalam satu tampilan."
      />

      <div className="dashboard-shell">
        <div className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">Status akun Anda</p>
            <h2>Selamat datang di dashboard KSP</h2>
            <p className="mb-0">Anda memiliki 1 pinjaman aktif dan 2 transaksi menunggu konfirmasi.</p>
          </div>
          <div className="dashboard-hero-actions">
            <button className="btn btn-outline-primary">Lihat Profil</button>
            <button className="btn btn-primary">Ajukan Pinjaman</button>
          </div>
        </div>

        <div className="dashboard-stats">
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-title">Saldo Simpanan</p>
            <div className="dashboard-stat-value">Rp 8.450.000</div>
            <p className="dashboard-stat-caption">Saldo utama Anda saat ini.</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-title">Pinjaman Aktif</p>
            <div className="dashboard-stat-value">Rp 12.000.000</div>
            <p className="dashboard-stat-caption">Sisa pokok pinjaman berjalan.</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-title">Cicilan Jatuh Tempo</p>
            <div className="dashboard-stat-value">3</div>
            <p className="dashboard-stat-caption">Tagihan yang akan jatuh tempo bulan ini.</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-title">Status Pengajuan</p>
            <div className="dashboard-stat-value">Pending</div>
            <p className="dashboard-stat-caption">Pengajuan pinjaman menunggu review.</p>
          </article>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Aktivitas Terbaru</h3>
                <p className="text-muted">Riwayat transaksi dan pembaruan akun Anda.</p>
              </div>
            </div>

            <div className="dashboard-list">
              <div className="dashboard-list-item">
                <div>
                  <strong>Pembayaran cicilan diterima</strong>
                  <p className="text-muted mb-0">Pembayaran bulan Juli berhasil tercatat.</p>
                </div>
                <span className="dashboard-pill success">Selesai</span>
              </div>
              <div className="dashboard-list-item">
                <div>
                  <strong>Pengajuan pinjaman dikirim</strong>
                  <p className="text-muted mb-0">Dokumen Anda sedang menunggu review admin.</p>
                </div>
                <span className="dashboard-pill pending">Pending</span>
              </div>
              <div className="dashboard-list-item">
                <div>
                  <strong>Jatuh tempo cicilan</strong>
                  <p className="text-muted mb-0">Tagihan berikutnya akan jatuh tempo 15 Agustus.</p>
                </div>
                <span className="dashboard-pill danger">Perhatian</span>
              </div>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Aksi Cepat</h3>
                <p className="text-muted">Layanan yang sering Anda butuhkan.</p>
              </div>
            </div>

            <div className="dashboard-quick-list">
              <div className="dashboard-quick-item">
                <strong>Riwayat Simpanan</strong>
                <p className="text-muted mb-0">Lihat semua transaksi simpanan Anda.</p>
              </div>
              <div className="dashboard-quick-item">
                <strong>Tagihan Cicilan</strong>
                <p className="text-muted mb-0">Cek jatuh tempo dan status pembayaran.</p>
              </div>
              <div className="dashboard-quick-item">
                <strong>Profil Anggota</strong>
                <p className="text-muted mb-0">Perbarui data diri dan kontak Anda.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
