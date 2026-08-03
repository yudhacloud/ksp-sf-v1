"use client";

import { useMemo, useState } from "react";

function normalizeMonitoringData(monitoringData = []) {
   const grouped = new Map();

   monitoringData.forEach((item) => {
      const memberId = item.member_id;
      if (!memberId) {
         return;
      }

      const existing = grouped.get(memberId) || {
         id: memberId,
         memberName: item.full_name || "-",
         memberNumber: item.member_number || "-",
         productName: item.saving_product_name || "-",
         productType: item.saving_type || null,
         productLabel: `${item.saving_product_name || "-"} (${getSavingTypeLabel(item.saving_type)})`,
         monthlyObligations: [],
      };

      existing.monthlyObligations.push({
         period: item.billing_period,
         amountDue: item.amount_due,
         paidAmount: item.approved_amount,
         remainingAmount: item.remaining_amount,
         dueDate: item.due_date,
         status: normalizeStatus(item.calculated_status),
         type: item.saving_type || null,
         typeLabel: getSavingTypeLabel(item.saving_type),
      });

      grouped.set(memberId, existing);
   });

   return Array.from(grouped.values());
}

function normalizeStatus(status) {
   if (!status) {
      return "Belum Lunas";
   }

   const normalized = String(status).toUpperCase();
   if (normalized === "PAID") return "Lunas";
   if (normalized === "PARTIAL") return "Sebagian";
   return "Belum Lunas";
}

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
   if (status === "Lunas") return "Lunas";
   if (status === "Sebagian") return "Sebagian";
   return "Belum Lunas";
}

function getSavingTypeLabel(type) {
   if (type === "POKOK") return "Simpanan Pokok";
   if (type === "WAJIB") return "Simpanan Wajib";
   if (type === "SUKARELA") return "Simpanan Sukarela";
   return "Simpanan";
}

function getStatusClass(status) {
   if (status === "Lunas") return "approved";
   if (status === "Sebagian") return "pending";
   return "rejected";
}

function getMemberStatusClass(member) {
   const pendingCount = member.monthlyObligations.filter((item) => item.status !== "Lunas").length;
   if (pendingCount === 0) return "approved";
   if (pendingCount <= 2) return "pending";
   return "rejected";
}

export default function SavingMonitoringTable({ monitoringData = [] }) {
   const normalizedMembers = useMemo(() => normalizeMonitoringData(monitoringData), [monitoringData]);
   const [search, setSearch] = useState("");
   const [selectedMemberId, setSelectedMemberId] = useState(normalizedMembers[0]?.id ?? null);

   const filteredMembers = useMemo(() => {
      const normalizedSearch = search.trim().toLowerCase();

      return normalizedMembers.filter((member) => {
         if (normalizedSearch === "") return true;

         return (
            member.memberName.toLowerCase().includes(normalizedSearch) ||
            member.memberNumber.toLowerCase().includes(normalizedSearch) ||
            member.productName.toLowerCase().includes(normalizedSearch)
         );
      });
   }, [normalizedMembers, search]);

   const selectedMember = useMemo(
      () => filteredMembers.find((member) => member.id === selectedMemberId) ?? filteredMembers[0] ?? null,
      [filteredMembers, selectedMemberId],
   );

   const totals = useMemo(() => {
      const totalTagihan = normalizedMembers.reduce(
         (sum, member) => sum + member.monthlyObligations.reduce((itemSum, item) => itemSum + Number(item.amountDue || 0), 0),
         0,
      );
      const totalBelumLunas = normalizedMembers.reduce(
         (sum, member) => sum + member.monthlyObligations.reduce((itemSum, item) => itemSum + Number(item.remainingAmount || 0), 0),
         0,
      );
      const totalAnggotaBelumLunas = normalizedMembers.filter((member) =>
         member.monthlyObligations.some((item) => item.status !== "Lunas"),
      ).length;

      return {
         totalTagihan,
         totalBelumLunas,
         totalAnggotaBelumLunas,
      };
   }, [normalizedMembers]);

   return (
      <div>
         <div className="admin-grid mb-4">
            <article className="admin-card">
               <p className="admin-stat-title">Total Tagihan</p>
               <div className="admin-stat-value">{formatCurrency(totals.totalTagihan)}</div>
               <p>Jumlah tagihan bulanan yang sedang dipantau.</p>
            </article>
            <article className="admin-card">
               <p className="admin-stat-title">Belum Lunas</p>
               <div className="admin-stat-value">{formatCurrency(totals.totalBelumLunas)}</div>
               <p>Nilai sisa pembayaran dari semua bulan.</p>
            </article>
            <article className="admin-card">
               <p className="admin-stat-title">Anggota Bermasalah</p>
               <div className="admin-stat-value">{totals.totalAnggotaBelumLunas}</div>
               <p>Jumlah anggota yang memiliki satu bulan atau lebih belum lunas.</p>
            </article>
         </div>

         <div className="admin-card mb-4">
            <div className="admin-form-group">
               <label htmlFor="searchMonitoring">Cari Anggota</label>
               <input
                  id="searchMonitoring"
                  className="form-control admin-input"
                  placeholder="Nama, nomor anggota, atau produk"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
               />
            </div>
         </div>

         <div className="row g-4">
            <div className="col-lg-4">
               <div className="admin-card h-100">
                  <h3>Daftar Anggota</h3>
                  <p className="text-muted mb-3">Klik salah satu anggota untuk melihat status pembayaran per bulan.</p>
                  <div className="d-grid gap-2">
                     {filteredMembers.length === 0 ? (
                        <div className="text-muted">Tidak ada anggota yang sesuai pencarian.</div>
                     ) : (
                        filteredMembers.map((member) => {
                           const pendingCount = member.monthlyObligations.filter((item) => item.status !== "Lunas").length;

                           return (
                              <button
                                 key={member.id}
                                 type="button"
                                 className={`btn btn-outline-primary text-start w-100 ${selectedMember?.id === member.id ? "active" : ""}`}
                                 onClick={() => setSelectedMemberId(member.id)}
                              >
                                 <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                       <div className="fw-semibold">{member.memberName}</div>
                                       <div className="small text-muted">{member.memberNumber}</div>
                                    </div>
                                    <span className={`admin-status-badge ${getMemberStatusClass(member)}`}>
                                       {pendingCount === 0 ? "Lancar" : `${pendingCount} bulan`}
                                    </span>
                                 </div>
                                 <div className="small text-muted mt-2">{member.productLabel}</div>
                              </button>
                           );
                        })
                     )}
                  </div>
               </div>
            </div>

            <div className="col-lg-8">
               <div className="admin-card h-100">
                  {selectedMember ? (
                     <>
                        <div className="d-flex justify-content-between flex-wrap gap-2 align-items-start mb-4">
                           <div>
                              <h3>{selectedMember.memberName}</h3>
                              <p className="text-muted">{selectedMember.memberNumber} • {selectedMember.productLabel}</p>
                           </div>
                           <span className={`admin-status-badge ${getMemberStatusClass(selectedMember)}`}>
                              {selectedMember.monthlyObligations.filter((item) => item.status !== "Lunas").length === 0
                                 ? "Lancar"
                                 : `${selectedMember.monthlyObligations.filter((item) => item.status !== "Lunas").length} bulan belum lunas`}
                           </span>
                        </div>

                        <div className="admin-grid mb-4">
                           <article className="admin-card">
                              <p className="admin-stat-title">Total Tagihan</p>
                              <div className="admin-stat-value">
                                 {formatCurrency(
                                    selectedMember.monthlyObligations.reduce((sum, item) => sum + Number(item.amountDue || 0), 0),
                                 )}
                              </div>
                              <p>Seluruh tagihan yang pernah dibuat.</p>
                           </article>
                           <article className="admin-card">
                              <p className="admin-stat-title">Sudah Dibayar</p>
                              <div className="admin-stat-value">
                                 {formatCurrency(
                                    selectedMember.monthlyObligations.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0),
                                 )}
                              </div>
                              <p>Jumlah pembayaran yang sudah masuk.</p>
                           </article>
                           <article className="admin-card">
                              <p className="admin-stat-title">Sisa Belum Bayar</p>
                              <div className="admin-stat-value">
                                 {formatCurrency(
                                    selectedMember.monthlyObligations.reduce((sum, item) => sum + Number(item.remainingAmount || 0), 0),
                                 )}
                              </div>
                              <p>Jumlah tunggakan yang belum ditutup.</p>
                           </article>
                        </div>

                        <div className="table-responsive">
                           <table className="admin-table">
                              <thead>
                                 <tr>
                                    <th>Periode</th>
                                    <th>Jenis</th>
                                    <th>Jatuh Tempo</th>
                                    <th>Tagihan</th>
                                    <th>Bayar</th>
                                    <th>Sisa</th>
                                    <th>Status</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {selectedMember.monthlyObligations.map((item) => (
                                    <tr key={`${item.period}-${item.typeLabel}`}>
                                       <td>{item.period}</td>
                                       <td>{item.typeLabel}</td>
                                       <td>{formatDate(item.dueDate)}</td>
                                       <td>{formatCurrency(item.amountDue)}</td>
                                       <td>{formatCurrency(item.paidAmount)}</td>
                                       <td>{formatCurrency(item.remainingAmount)}</td>
                                       <td>
                                          <span className={`admin-status-badge ${getStatusClass(item.status)}`}>
                                             {getStatusLabel(item.status)}
                                          </span>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </>
                  ) : (
                     <div className="text-muted">Pilih anggota untuk melihat rinciannya.</div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
