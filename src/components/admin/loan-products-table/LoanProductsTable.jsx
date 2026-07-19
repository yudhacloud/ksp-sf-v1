"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatCurrency(value) {
   return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
   }).format(Number(value || 0));
}

export default function LoanProductsTable({ loanProducts }) {
   const router = useRouter();
   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState("Semua");
   const [updatingProductId, setUpdatingProductId] = useState(null);

   const filteredLoanProducts = useMemo(() => {
      const normalizedSearch = search.trim().toLowerCase();

      return loanProducts.filter((product) => {
         const matchesSearch =
            normalizedSearch === "" || product.name.toLowerCase().includes(normalizedSearch);

         const matchesStatus =
            statusFilter === "Semua" ||
            (statusFilter === "Aktif" && product.is_active) ||
            (statusFilter === "Nonaktif" && !product.is_active);

         return matchesSearch && matchesStatus;
      });
   }, [loanProducts, search, statusFilter]);

   async function handleToggleStatus(product) {
      const nextStatus = !product.is_active;
      const actionText = nextStatus ? "mengaktifkan" : "menonaktifkan";
      const confirmed = window.confirm(`Yakin ${actionText} produk ${product.name}?`);

      if (!confirmed) {
         return;
      }

      setUpdatingProductId(product.id);

      try {
         const response = await fetch(`/api/admin/loan-products/${product.id}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               name: product.name,
               max_amount: product.max_amount,
               interest_rate: product.interest_rate,
               max_tenor: product.max_tenor,
               is_active: nextStatus,
            }),
         });

         const result = await response.json();

         if (!response.ok) {
            window.alert(result.error || "Gagal memperbarui status produk pinjaman.");
            return;
         }

         router.refresh();
      } catch (error) {
         window.alert(error?.message || "Gagal menghubungi server.");
      } finally {
         setUpdatingProductId(null);
      }
   }

   return (
      <div>
         <div className="admin-card mb-4">
            <div className="row gx-3 gy-3 align-items-end">
               <div className="col-12 col-md-6">
                  <div className="admin-form-group">
                     <label htmlFor="searchLoanProduct">Cari Produk Pinjaman</label>
                     <input
                        id="searchLoanProduct"
                        className="form-control admin-input"
                        placeholder="Nama produk pinjaman"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                     />
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="admin-form-group">
                     <label htmlFor="loanProductStatus">Status</label>
                     <select
                        id="loanProductStatus"
                        className="form-select admin-input"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                     >
                        <option>Semua</option>
                        <option>Aktif</option>
                        <option>Nonaktif</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>

         <div className="admin-card">
            <h3>Daftar Produk Pinjaman</h3>
            <div className="table-responsive">
               <table className="admin-table">
                  <thead>
                     <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Maksimal Nominal</th>
                        <th>Bunga (%)</th>
                        <th>Maksimal Tenor</th>
                        <th>Status</th>
                        <th>Aksi</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredLoanProducts.length === 0 ? (
                        <tr>
                           <td colSpan="7" className="text-center py-4 text-muted">
                              Tidak ada data produk pinjaman yang cocok.
                           </td>
                        </tr>
                     ) : (
                        filteredLoanProducts.map((product, index) => (
                           <tr key={product.id}>
                              <td>{index + 1}</td>
                              <td>{product.name}</td>
                              <td>{formatCurrency(product.max_amount)}</td>
                              <td>{Number(product.interest_rate).toFixed(2)}%</td>
                              <td>{product.max_tenor} bulan</td>
                              <td>
                                 <span className={`admin-status-badge ${product.is_active ? "approved" : "pending"}`}>
                                    {product.is_active ? "Aktif" : "Nonaktif"}
                                 </span>
                              </td>
                              <td>
                                 <div className="d-flex gap-2 flex-wrap">
                                    <a href={`/admin/loan-products/${product.id}/edit`} className="btn btn-sm btn-outline-primary">
                                       Edit
                                    </a>
                                    <button
                                       type="button"
                                       className="btn btn-sm btn-outline-danger"
                                       onClick={() => handleToggleStatus(product)}
                                       disabled={updatingProductId === product.id}
                                    >
                                       {updatingProductId === product.id
                                          ? "Menyimpan..."
                                          : product.is_active
                                             ? "Nonaktifkan"
                                             : "Aktifkan"}
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}