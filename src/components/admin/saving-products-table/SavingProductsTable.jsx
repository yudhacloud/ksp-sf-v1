"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";


/**
 * Komponen client untuk menampilkan tabel anggota.
 * Search dan filter dijalankan di frontend menggunakan data yang sudah di-fetch.
 */
export default function SavingProductsTable({ savingProducts }) {
   const router = useRouter();

   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState("Semua");
   const [joinedFilter, setJoinedFilter] = useState("Semua waktu");
   const [updatingProductId, setUpdatingProductId] = useState(null);

   const filteredSavingProducts = useMemo(() => {
      const normalizedSearch = search.trim().toLowerCase()
      const now = new Date()

      return savingProducts.filter((product) => {
         const matchesSearch =
            normalizedSearch === "" ||
            product.name.toLowerCase().includes(normalizedSearch)

         const matchesStatus =
            statusFilter === "Semua" ||
            (statusFilter === "Aktif" && product.is_active) ||
            (statusFilter === "Nonaktif" && !product.is_active)

         if (!matchesSearch || !matchesStatus) {
            return false;
         }

         if (joinedFilter === "30 hari terakhir" || joinedFilter === "90 hari terakhir") {
            const createdAt = new Date(product.created_at);
            const daysLimit = joinedFilter === "30 hari terakhir" ? 30 : 90;
            const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

            return diffDays <= daysLimit;
         }

         return true;
      });
   }, [savingProducts, search, statusFilter, joinedFilter])

   async function handleToggleStatus(product) {
      const nextStatus = !product.is_active;
      const promptText = nextStatus ? "mengaktifkan" : "menonaktifkan";
      const confirmed = window.confirm(`Yakin ${promptText} produk ${product.name}?`);

      if (!confirmed) {
         return;
      }

      setUpdatingProductId(product.id);

      try {
         const response = await fetch(`/api/admin/saving-products/${product.id}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               name: product.name,
               saving_type: product.saving_type,
               description: product.description,
               is_active: nextStatus,
            }),
         });

         const result = await response.json();

         if (!response.ok) {
            window.alert(result.error || "Gagal memperbarui status produk simpanan.");
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
                     <label htmlFor="searchMember">Cari Produk Simpanan</label>
                     <input
                        id="searchMember"
                        className="form-control admin-input"
                        placeholder="Nama Simpanan"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                     />
                  </div>
               </div>
               <div className="col-12 col-md-6">
                  <div className="row gx-3 gy-3">
                     <div className="col-12 col-sm-6">
                        <div className="admin-form-group">
                           <label htmlFor="savingProductStatus">Status</label>
                           <select
                              id="savingProductStatus"
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
                     <div className="col-12 col-sm-6">
                        <div className="admin-form-group">
                           <label htmlFor="memberFilter">Tanggal Dibuat</label>
                           <select
                              id="memberFilter"
                              className="form-select admin-input"
                              value={joinedFilter}
                              onChange={(event) => setJoinedFilter(event.target.value)}
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
                        <th>No</th>
                        <th>Nama</th>
                        <th>Tipe</th>
                        <th>Deskripsi</th>
                        <th>Status</th>
                        <th>Aksi</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredSavingProducts.length === 0 ? (
                        <tr>
                           <td colSpan="7" className="text-center py-4 text-muted">
                              Tidak ada data produk Simpanan yang cocok.
                           </td>
                        </tr>
                     ) : (
                        filteredSavingProducts.map((product, index) => (
                           <tr key={product.id}>
                              <td>{index + 1}</td>
                              <td>{product.name}</td>
                              <td>{product.saving_type || "-"}</td>
                              <td>{product.description || "-"}</td>
                              <td>
                                 <span
                                    className={`admin-status-badge ${product.is_active ? "approved" : "pending"}`}
                                 >
                                    {product.is_active ? "Aktif" : "Nonaktif"}
                                 </span>
                              </td>
                              <td>
                                 <div className="d-flex gap-2 flex-wrap">
                                    <a
                                       href={`/admin/saving-products/${product.id}/edit`}
                                       className="btn btn-sm btn-outline-primary"
                                    >
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
