import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  return (
    <section className="container py-5 admin-page">
      <PageHeader
        title="Pengajuan Pinjaman"
        subtitle="Kelola pengajuan pinjaman, filter status, dan lihat detail tindak lanjut."
        actions={<button className="btn btn-primary">Tambah Pengajuan</button>}
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Pending</p>
          <div className="admin-stat-value">8</div>
          <p>Pengajuan menunggu persetujuan.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Approved</p>
          <div className="admin-stat-value">24</div>
          <p>Pengajuan yang telah disetujui.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Rejected</p>
          <div className="admin-stat-value">6</div>
          <p>Pengajuan yang ditolak.</p>
        </article>
      </div>

      <div className="admin-card mb-4">
        <div className="row gx-3 gy-3 align-items-end">
          <div className="col-12 col-md-4">
            <div className="admin-form-group">
              <label htmlFor="loanSearch">Cari pengajuan</label>
              <input id="loanSearch" className="form-control admin-input" placeholder="Nama anggota atau produk" />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="admin-form-group">
              <label htmlFor="loanStatus">Status</label>
              <select id="loanStatus" className="form-select admin-input">
                <option>Semua</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="admin-form-group">
              <label htmlFor="loanPeriod">Periode</label>
              <select id="loanPeriod" className="form-select admin-input">
                <option>30 hari terakhir</option>
                <option>90 hari terakhir</option>
                <option>180 hari terakhir</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3>Daftar Pengajuan</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Anggota</th>
                <th>Produk</th>
                <th>Nominal</th>
                <th>Tenor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Siti Nurhaliza</td>
                <td>Pinjaman Modal</td>
                <td>Rp 15.000.000</td>
                <td>12 bulan</td>
                <td><span className="admin-status-badge pending">Pending</span></td>
              </tr>
              <tr>
                <td>Budi Santoso</td>
                <td>Pinjaman Pendidikan</td>
                <td>Rp 8.500.000</td>
                <td>18 bulan</td>
                <td><span className="admin-status-badge approved">Approved</span></td>
              </tr>
              <tr>
                <td>Rina Wijaya</td>
                <td>Pinjaman Usaha</td>
                <td>Rp 20.000.000</td>
                <td>24 bulan</td>
                <td><span className="admin-status-badge rejected">Rejected</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
