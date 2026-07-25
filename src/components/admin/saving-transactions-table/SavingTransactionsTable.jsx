import React from 'react'

export default function SavingTransactionsTable() {
   return (
      <div>
         <div className="admin-card mb-4">
            <div className="row gx-3 gy-3 align-items-end">
               <div className="col-12 col-md-6">
                  <div className="admin-form-group">
                     <label htmlFor="searchMember">Cari Transaksi</label>
                     <input
                        id="searchMember"
                        className="form-control admin-input"
                        placeholder="Nama Anggota"

                     />
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="row gx-3 gy-3">
                     <div className="col-12 col-sm-6">
                        <div className="admin-form-group">
                           <label htmlFor="savingTransactionStatus">Status</label>
                           <select
                              id="savingTransactionStatus"
                              className="form-select admin-input"
                           >
                              <option>Semua</option>
                              <option>Pending</option>
                              <option>Approved</option>
                              <option>Rejected</option>
                           </select>
                        </div>
                     </div>
                     <div className="col-12 col-sm-6">
                        <div className="admin-form-group">
                           <label htmlFor="savingTransactionTime">Tanggal Transaksi</label>
                           <select
                              id="savingTransactionTime"
                              className="form-select admin-input"
                           >
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
            <h3>Daftar Produk Simpanan</h3>
            <div className="table-responsive">
               <table className="admin-table">
                  <thead>
                     <tr>
                        <th>Tanggal</th>
                        <th>Anggota</th>
                        <th>Produk</th>
                        <th>Nominal</th>
                        <th>Status</th>
                        <th>Bukti</th>
                        <th>Admin</th>
                        <th>Aksi</th>
                     </tr>
                  </thead>
                  <tbody>

                  </tbody>
               </table>
            </div>
         </div>
      </div>
   )
}
