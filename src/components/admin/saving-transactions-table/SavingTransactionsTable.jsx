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

function formatDate(value) {
   if (!value) {
      return "-";
   }

   const parsedDate = new Date(value);
   if (Number.isNaN(parsedDate.getTime())) {
      return value;
   }

   return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
   }).format(parsedDate);
}

function getStatusLabel(status) {
   if (status === "APPROVED") return "Disetujui";
   if (status === "REJECTED") return "Ditolak";
   return "Pending";
}

function getStatusClass(status) {
   if (status === "APPROVED") return "approved";
   if (status === "REJECTED") return "rejected";
   return "pending";
}

function CheckIcon() {
   return (
      <i className="bi bi-check-lg" aria-hidden="true" />
   );
}

function XIcon() {
   return (
      <i className="bi bi-x-lg" aria-hidden="true" />
   );
}

export default function SavingTransactionsTable({ savingTransactions = [] }) {
   const router = useRouter();

   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState("Semua");
   const [timeFilter, setTimeFilter] = useState("Semua waktu");
   const [selectedDetail, setSelectedDetail] = useState(null);
   const [rejectionTarget, setRejectionTarget] = useState(null);
   const [rejectionNote, setRejectionNote] = useState("");
   const [updatingTransactionId, setUpdatingTransactionId] = useState(null);

   const filteredSavingTransactions = useMemo(() => {
      const normalizedSearch = search.trim().toLowerCase();
      const now = new Date();

      return savingTransactions.filter((transaction) => {
         const memberName = transaction.member?.full_name || "";
         const memberNumber = transaction.member?.member_number || "";
         const productName = transaction.saving_product?.name || "";

         const matchesSearch =
            normalizedSearch === "" ||
            memberName.toLowerCase().includes(normalizedSearch) ||
            memberNumber.toLowerCase().includes(normalizedSearch) ||
            productName.toLowerCase().includes(normalizedSearch);

         const matchesStatus =
            statusFilter === "Semua" ||
            (statusFilter === "Pending" && transaction.status === "PENDING") ||
            (statusFilter === "Approved" && transaction.status === "APPROVED") ||
            (statusFilter === "Rejected" && transaction.status === "REJECTED");

         if (!matchesSearch || !matchesStatus) {
            return false;
         }

         if (timeFilter === "30 hari terakhir" || timeFilter === "90 hari terakhir") {
            const baseDate = transaction.created_at || transaction.transaction_date;
            const createdAt = new Date(baseDate);
            if (Number.isNaN(createdAt.getTime())) {
               return false;
            }

            const daysLimit = timeFilter === "30 hari terakhir" ? 30 : 90;
            const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

            return diffDays <= daysLimit;
         }

         return true;
      });
   }, [savingTransactions, search, statusFilter, timeFilter]);

   async function handleUpdateStatus(transaction, nextStatus, adminNote = "") {
      if (transaction.status !== "PENDING") {
         window.alert("Aksi hanya tersedia untuk transaksi pending.");
         return;
      }

      const actionText = nextStatus === "APPROVED" ? "menerima" : "menolak";
      const confirmed = window.confirm(`Yakin ${actionText} transaksi milik ${transaction.member?.full_name || transaction.member_id}?`);

      if (!confirmed) {
         return;
      }

      setUpdatingTransactionId(transaction.id);

      try {
         const response = await fetch(`/api/admin/saving-transactions/${transaction.id}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               status: nextStatus,
               admin_note: adminNote,
            }),
         });

         const result = await response.json();

         if (!response.ok) {
            window.alert(result.error || "Gagal memperbarui status transaksi.");
            return;
         }

         router.refresh();
      } catch (error) {
         window.alert(error?.message || "Gagal menghubungi server.");
      } finally {
         setUpdatingTransactionId(null);
      }
   }

   function openRejectionModal(transaction) {
      if (transaction.status !== "PENDING") {
         window.alert("Aksi hanya tersedia untuk transaksi pending.");
         return;
      }

      setRejectionTarget(transaction);
      setRejectionNote(transaction.admin_note || "");
   }

   function closeRejectionModal() {
      setRejectionTarget(null);
      setRejectionNote("");
   }

   async function submitRejection(event) {
      event.preventDefault();

      if (!rejectionTarget) {
         return;
      }

      const note = rejectionNote.trim();
      if (!note) {
         window.alert("Alasan penolakan wajib diisi.");
         return;
      }

      const confirmed = window.confirm(
         `Yakin menolak transaksi milik ${rejectionTarget.member?.full_name || rejectionTarget.member_id} dengan alasan ini?`
      );

      if (!confirmed) {
         return;
      }

      await handleUpdateStatus(rejectionTarget, "REJECTED", note);
      closeRejectionModal();
   }

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
                        placeholder="Nama anggota, nomor anggota, atau produk"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
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
                              value={statusFilter}
                              onChange={(event) => setStatusFilter(event.target.value)}
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
                              value={timeFilter}
                              onChange={(event) => setTimeFilter(event.target.value)}
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
            <h3>Daftar Transaksi Simpanan</h3>
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
                        <th>Admin Note</th>
                        <th>Aksi</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredSavingTransactions.length === 0 ? (
                        <tr>
                           <td colSpan="8" className="text-center py-4 text-muted">
                              Tidak ada transaksi simpanan.
                           </td>
                        </tr>
                     ) : (
                        filteredSavingTransactions.map((transaction) => (
                           <tr key={transaction.id}>
                              <td>{formatDate(transaction.transaction_date || transaction.created_at)}</td>
                              <td>
                                 <div className="fw-semibold">
                                    {transaction.member?.full_name || transaction.member_id || "-"}
                                 </div>
                                 <div className="small text-muted">
                                    {transaction.member?.member_number || "-"}
                                 </div>
                                 <div className="small text-muted">
                                    {transaction.member?.email || "-"}
                                 </div>
                              </td>
                              <td>
                                 <div className="fw-semibold">
                                    {transaction.saving_product?.name || "-"}
                                 </div>
                                 <div className="small text-muted">
                                    {transaction.saving_product?.saving_type || "-"}
                                 </div>
                              </td>
                              <td>{formatCurrency(transaction.amount)}</td>
                              <td>
                                 <span className={`admin-status-badge ${getStatusClass(transaction.status)}`}>
                                    {getStatusLabel(transaction.status)}
                                 </span>
                              </td>
                              <td>
                                 {transaction.proof_url ? (
                                    <button
                                       type="button"
                                       className="btn btn-sm btn-outline-primary"
                                       onClick={() =>
                                          setSelectedDetail({
                                             title: "Bukti Transaksi",
                                             type: "proof",
                                             value: transaction.proof_url,
                                          })
                                       }
                                    >
                                       Lihat Bukti
                                    </button>
                                 ) : (
                                    "-"
                                 )}
                              </td>
                              <td>
                                 {transaction.admin_note ? (
                                    <button
                                       type="button"
                                       className="btn btn-sm btn-outline-secondary"
                                       onClick={() =>
                                          setSelectedDetail({
                                             title: "Admin Note",
                                             type: "note",
                                             value: transaction.admin_note,
                                          })
                                       }
                                    >
                                       Lihat Note
                                    </button>
                                 ) : (
                                    "-"
                                 )}
                              </td>
                              <td>
                                 {transaction.status === "PENDING" ? (
                                    <div className="d-flex gap-2 flex-wrap">
                                       <button
                                          type="button"
                                          className="btn btn-sm btn-success d-inline-flex align-items-center justify-content-center"
                                          style={{ width: 36, height: 36 }}
                                          disabled={updatingTransactionId === transaction.id}
                                          onClick={() => handleUpdateStatus(transaction, "APPROVED")}
                                          aria-label="Terima transaksi"
                                          title="Terima"
                                       >
                                          {updatingTransactionId === transaction.id ? (
                                             <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                          ) : (
                                             <CheckIcon />
                                          )}
                                       </button>
                                       <button
                                          type="button"
                                          className="btn btn-sm btn-danger d-inline-flex align-items-center justify-content-center"
                                          style={{ width: 36, height: 36 }}
                                          disabled={updatingTransactionId === transaction.id}
                                          onClick={() => openRejectionModal(transaction)}
                                          aria-label="Tolak transaksi"
                                          title="Tolak"
                                       >
                                          {updatingTransactionId === transaction.id ? (
                                             <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                          ) : (
                                             <XIcon />
                                          )}
                                       </button>
                                    </div>
                                 ) : (
                                    <span className="text-muted">-</span>
                                 )}
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {selectedDetail && (
            <div
               className="modal-backdrop fade show"
               onClick={() => setSelectedDetail(null)}
               aria-hidden="true"
            />
         )}

         {selectedDetail && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
               <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content">
                     <div className="modal-header">
                        <h5 className="modal-title">{selectedDetail.title}</h5>
                        <button
                           type="button"
                           className="btn-close"
                           aria-label="Close"
                           onClick={() => setSelectedDetail(null)}
                        />
                     </div>
                     <div className="modal-body">
                        {selectedDetail.type === "note" ? (
                           <p className="mb-0">{selectedDetail.value}</p>
                        ) : (
                           <div className="d-grid gap-3">
                              <a href={selectedDetail.value} target="_blank" rel="noreferrer" className="btn btn-primary">
                                 Buka Bukti di Tab Baru
                              </a>
                              <div className="border rounded p-3 bg-light">
                                 <p className="mb-2 text-muted">Pratinjau file tidak ditampilkan langsung. Gunakan tombol di atas untuk membuka bukti.</p>
                                 <p className="mb-0 text-break">{selectedDetail.value}</p>
                              </div>
                           </div>
                        )}
                     </div>
                     <div className="modal-footer">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedDetail(null)}>
                           Tutup
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {rejectionTarget && (
            <div
               className="modal-backdrop fade show"
               onClick={closeRejectionModal}
               aria-hidden="true"
            />
         )}

         {rejectionTarget && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
               <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content">
                     <form onSubmit={submitRejection}>
                        <div className="modal-header">
                           <h5 className="modal-title">Alasan Penolakan</h5>
                           <button
                              type="button"
                              className="btn-close"
                              aria-label="Close"
                              onClick={closeRejectionModal}
                           />
                        </div>
                        <div className="modal-body">
                           <p className="text-muted mb-3">
                              Transaksi milik <strong>{rejectionTarget.member?.full_name || rejectionTarget.member_id}</strong> akan ditolak.
                           </p>
                           <div className="admin-form-group mb-0">
                              <label htmlFor="rejectionNote">Alasan penolakan</label>
                              <textarea
                                 id="rejectionNote"
                                 className="form-control admin-input"
                                 rows="4"
                                 value={rejectionNote}
                                 onChange={(event) => setRejectionNote(event.target.value)}
                                 placeholder="Tulis alasan penolakan di sini"
                                 required
                              />
                           </div>
                        </div>
                        <div className="modal-footer">
                           <button type="button" className="btn btn-outline-secondary" onClick={closeRejectionModal}>
                              Batal
                           </button>
                           <button type="submit" className="btn btn-danger" disabled={updatingTransactionId === rejectionTarget.id}>
                              {updatingTransactionId === rejectionTarget.id ? "Menyimpan..." : "Tolak Transaksi"}
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}
