import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Laporan"
        subtitle="Pantau laporan keuangan dan operasional koperasi dengan ringkas."
        actions={<button className="btn btn-primary">Ekspor Laporan</button>}
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Laporan Bulanan</p>
          <div className="admin-stat-value">12</div>
          <p>Laporan keuangan dan simpanan terkini.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Laporan Pinjaman</p>
          <div className="admin-stat-value">8</div>
          <p>Ringkasan pengajuan dan pelunasan.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Laporan Transaksi</p>
          <div className="admin-stat-value">19</div>
          <p>Transaksi simpanan dan pembayaran.</p>
        </article>
      </div>

      <div className="admin-card">
        <h3>Ringkasan Laporan</h3>
        <p className="text-muted">
          Gunakan halaman ini untuk menampilkan data laporan keuangan, arus kas, dan status operasional koperasi.
        </p>
      </div>
    </section>
  );
}
