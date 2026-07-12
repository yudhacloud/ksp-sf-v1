import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Ringkasan kondisi koperasi dan aktivitas terbaru dalam satu halaman."
        actions={<button className="btn btn-primary">Lihat Semua</button>}
      />

      <div className="admin-grid">
        <article className="admin-card">
          <p className="admin-stat-title">Total Anggota</p>
          <div className="admin-stat-value">1.024</div>
          <p>Anggota aktif yang tercatat di koperasi.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Total Simpanan</p>
          <div className="admin-stat-value">Rp 7,4M</div>
          <p>Saldo simpanan anggota saat ini.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Pinjaman Aktif</p>
          <div className="admin-stat-value">320</div>
          <p>Jumlah pinjaman yang sedang berjalan.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Pendapatan Bunga</p>
          <div className="admin-stat-value">Rp 156.000</div>
          <p>Pendapatan bunga bulan berjalan.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Dana Masuk</p>
          <div className="admin-stat-value">Rp 2,1M</div>
          <p>Transaksi masuk terbaru.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Dana Keluar</p>
          <div className="admin-stat-value">Rp 980K</div>
          <p>Pengeluaran kas terbaru.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Tunggakan</p>
          <div className="admin-stat-value">54</div>
          <p>Status pinjaman yang tertunda.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Approval Pending</p>
          <div className="admin-stat-value">18</div>
          <p>Pengajuan menunggu tindakan administrasi.</p>
        </article>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h3>Approval Center</h3>
            <p className="text-muted">Pengajuan yang perlu ditindaklanjuti hari ini.</p>
          </div>
          <button className="btn btn-secondary">Lihat Semua</button>
        </div>

        <div className="admin-grid">
          <article className="admin-card">
            <p className="admin-stat-title">Simpanan Pending</p>
            <div className="admin-stat-value">12</div>
            <p>Permintaan konfirmasi bukti transfer.</p>
          </article>
          <article className="admin-card">
            <p className="admin-stat-title">Pengajuan Pinjaman</p>
            <div className="admin-stat-value">8</div>
            <p>Pengajuan pinjaman yang belum disetujui.</p>
          </article>
          <article className="admin-card">
            <p className="admin-stat-title">Pembayaran Cicilan</p>
            <div className="admin-stat-value">7</div>
            <p>Cicilan yang perlu diverifikasi.</p>
          </article>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <h3>Aktivitas Terbaru</h3>
        </div>

        <div className="admin-timeline">
          <div className="admin-timeline-item">
            <div>
              <span className="badge-pill">Simpanan baru</span>
              <p className="mb-1 mt-2">Simpanan anggota berhasil diterima.</p>
              <small className="text-muted">15 menit lalu</small>
            </div>
          </div>
          <div className="admin-timeline-item">
            <div>
              <span className="badge-pill">Pengajuan pinjaman</span>
              <p className="mb-1 mt-2">Anggota mengajukan pinjaman baru.</p>
              <small className="text-muted">1 jam lalu</small>
            </div>
          </div>
          <div className="admin-timeline-item">
            <div>
              <span className="badge-pill">Pembayaran</span>
              <p className="mb-1 mt-2">Cicilan anggota berhasil diproses.</p>
              <small className="text-muted">2 jam lalu</small>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
