import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  return (
    <section className="container py-5 admin-page">
      <PageHeader
        title="Produk Simpanan"
        subtitle="Kelola produk simpanan koperasi dan atur opsi bagi anggota."
        actions={<button className="btn btn-primary">Tambah Produk</button>}
      />

      <div className="admin-grid">
        <article className="admin-card">
          <h3>Ringkasan Produk</h3>
          <p className="text-muted">Jumlah produk simpanan yang tersedia untuk anggota.</p>
          <p className="admin-stat-value">5 produk</p>
        </article>
        <article className="admin-card">
          <h3>Data Produk</h3>
          <p className="text-muted">Nama produk, jenis, nominal, dan status akan tampil di tabel.</p>
        </article>
      </div>
    </section>
  );
}
