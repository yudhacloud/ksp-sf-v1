import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  return (
    <section className="container py-5 admin-page">
      <PageHeader
        title="Pengaturan"
        subtitle="Atur preferensi admin dan konfigurasi umum koperasi."
        actions={<button className="btn btn-primary">Simpan Perubahan</button>}
      />

      <div className="admin-grid">
        <article className="admin-card">
          <h3>Informasi Umum</h3>
          <p className="text-muted mb-3">Atur nama koperasi, kontak, serta informasi umum lainnya.</p>
          <div className="admin-form-group">
            <label>Nama Koperasi</label>
            <input className="form-control admin-input" placeholder="Koperasi Sinergi Finansial" />
          </div>
          <div className="admin-form-group">
            <label>Email Kontak</label>
            <input className="form-control admin-input" placeholder="admin@ksp.co.id" />
          </div>
        </article>

        <article className="admin-card">
          <h3>Keamanan</h3>
          <p className="text-muted mb-3">Konfigurasi hak akses, sesi, dan kontrol login.</p>
          <div className="admin-form-group">
            <label>Password Admin</label>
            <input type="password" className="form-control admin-input" placeholder="••••••••" />
          </div>
          <div className="admin-form-group">
            <label>Notifikasi Email</label>
            <select className="form-select admin-input">
              <option>Aktif</option>
              <option>Tidak Aktif</option>
            </select>
          </div>
        </article>
      </div>
    </section>
  );
}
