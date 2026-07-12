import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Anggota"
        subtitle="Kelola data anggota koperasi dan lihat ringkasan statistik paling penting."
        actions={<button className="btn btn-primary">Tambah Anggota</button>}
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Total Anggota</p>
          <div className="admin-stat-value">1.024</div>
          <p>Anggota terdaftar dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Anggota Aktif</p>
          <div className="admin-stat-value">980</div>
          <p>Anggota dengan status aktif.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Anggota Nonaktif</p>
          <div className="admin-stat-value">44</div>
          <p>Anggota yang menunggu reaktivasi.</p>
        </article>
      </div>

      <div className="admin-card mb-4">
        <div className="row gx-3 gy-3 align-items-end">
          <div className="col-12 col-md-6">
            <div className="admin-form-group">
              <label htmlFor="searchMember">Cari anggota</label>
              <input id="searchMember" className="form-control admin-input" placeholder="Nama atau nomor anggota" />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="row gx-3 gy-3">
              <div className="col-12 col-sm-6">
                <div className="admin-form-group">
                  <label htmlFor="memberStatus">Status</label>
                  <select id="memberStatus" className="form-select admin-input">
                    <option>Semua</option>
                    <option>Aktif</option>
                    <option>Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="admin-form-group">
                  <label htmlFor="memberFilter">Tanggal Bergabung</label>
                  <select id="memberFilter" className="form-select admin-input">
                    <option>Semua waktu</option>
                    <option>30 hari terakhir</option>
                    <option>90 hari terakhir</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3>Daftar Anggota</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Nama</th>
                <th>Email</th>
                <th>HP</th>
                <th>Gabung</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>00123</td>
                <td>Siti Nurhaliza</td>
                <td>siti@example.com</td>
                <td>0812-3456-7890</td>
                <td>12 Apr 2025</td>
                <td><span className="admin-status-badge approved">Aktif</span></td>
              </tr>
              <tr>
                <td>00124</td>
                <td>Budi Santoso</td>
                <td>budi@example.com</td>
                <td>0813-9876-5432</td>
                <td>05 Mei 2025</td>
                <td><span className="admin-status-badge pending">Nonaktif</span></td>
              </tr>
              <tr>
                <td>00125</td>
                <td>Rina Wijaya</td>
                <td>rina@example.com</td>
                <td>0819-1234-5678</td>
                <td>21 Mei 2025</td>
                <td><span className="admin-status-badge info">Menunggu</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
