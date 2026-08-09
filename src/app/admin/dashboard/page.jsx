import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Pantau kondisi koperasi, review pengajuan pinjaman, dan tindaklanjuti aktivitas harian dengan cepat."
        actions={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary">Export Laporan</button>
            <button className="btn btn-primary">Lihat Semua</button>
          </div>
        }
      />

      <div className="dashboard-shell">
        <div className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">Operasional hari ini</p>
            <h2>Ringkasan kinerja koperasi</h2>
            <p className="mb-0">Ada 18 pengajuan menunggu persetujuan dan 7 pembayaran cicilan yang perlu diverifikasi.</p>
          </div>
          <div className="dashboard-hero-actions">
            <button className="btn btn-outline-primary">Review Pinjaman</button>
            <button className="btn btn-primary">Buka Approval Center</button>
          </div>
        </div>

        <div className="dashboard-stats">
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-title">Total Anggota</p>
            <div className="dashboard-stat-value">1.024</div>
            <p className="dashboard-stat-caption">Anggota aktif yang tercatat di koperasi.</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-title">Total Simpanan</p>
            <div className="dashboard-stat-value">Rp 7,4M</div>
            <p className="dashboard-stat-caption">Saldo simpanan anggota saat ini.</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-title">Pinjaman Aktif</p>
            <div className="dashboard-stat-value">320</div>
            <p className="dashboard-stat-caption">Jumlah pinjaman yang sedang berjalan.</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-title">Tunggakan</p>
            <div className="dashboard-stat-value">54</div>
            <p className="dashboard-stat-caption">Pinjaman yang membutuhkan perhatian lebih.</p>
          </article>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Approval Center</h3>
                <p className="text-muted">Daftar kebutuhan tindakan yang paling mendesak.</p>
              </div>
              <button className="btn btn-outline-primary btn-sm">Lihat Semua</button>
            </div>

            <div className="dashboard-list">
              <div className="dashboard-list-item">
                <div>
                  <strong>Pengajuan pinjaman baru</strong>
                  <p className="text-muted mb-0">8 permohonan menunggu review admin.</p>
                </div>
                <span className="dashboard-pill pending">Pending</span>
              </div>
              <div className="dashboard-list-item">
                <div>
                  <strong>Pembayaran cicilan</strong>
                  <p className="text-muted mb-0">7 bukti pembayaran perlu dicek.</p>
                </div>
                <span className="dashboard-pill">Verifikasi</span>
              </div>
              <div className="dashboard-list-item">
                <div>
                  <strong>Konfirmasi simpanan</strong>
                  <p className="text-muted mb-0">12 transaksi menunggu validasi.</p>
                </div>
                <span className="dashboard-pill success">Siap</span>
              </div>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h3>Aksi Cepat</h3>
                <p className="text-muted">Langkah yang sering dipakai admin.</p>
              </div>
            </div>

            <div className="dashboard-quick-list">
              <div className="dashboard-quick-item">
                <strong>Kelola Produk Pinjaman</strong>
                <p className="text-muted mb-0">Tambah atau edit produk pinjaman utama.</p>
              </div>
              <div className="dashboard-quick-item">
                <strong>Review Pengajuan</strong>
                <p className="text-muted mb-0">Setujui atau tolak permohonan anggota.</p>
              </div>
              <div className="dashboard-quick-item">
                <strong>Monitoring Cicilan</strong>
                <p className="text-muted mb-0">Pantau pembayaran dan tunggakan.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
