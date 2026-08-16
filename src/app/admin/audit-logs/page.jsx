"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";

function formatDate(value) {
   if (!value) return "-";

   const date = new Date(value);
   if (Number.isNaN(date.getTime())) {
      return value;
   }

   return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   }).format(date);
}

function getActionLabel(action) {
   const map = {
      member_created: "Anggota baru ditambahkan",
      loan_application_approved: "Pengajuan pinjaman disetujui",
      loan_application_rejected: "Pengajuan pinjaman ditolak",
      installment_payment_submitted: "Pembayaran cicilan dikirim",
      installment_payment_approved: "Pembayaran cicilan disetujui",
      installment_payment_rejected: "Pembayaran cicilan ditolak",
      saving_transaction_submitted: "Transaksi simpanan dikirim",
      saving_transaction_approved: "Transaksi simpanan disetujui",
      saving_transaction_rejected: "Transaksi simpanan ditolak",
   };

   return map[action] || action;
}

function formatLogDescription(description) {
   if (!description) return "-";

   return description
      .replace(/\s*\|\s*/g, " • ")
      .replace(/\s*\*\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
}

export default function Page() {
   const [logs, setLogs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      async function loadLogs() {
         try {
            const response = await fetch("/api/admin/audit-logs");
            const result = await response.json();

            if (!response.ok) {
               throw new Error(result.error || "Gagal memuat audit log.");
            }

            setLogs(result.logs || []);
         } catch (loadError) {
            setError(loadError.message || "Gagal memuat audit log.");
         } finally {
            setLoading(false);
         }
      }

      void loadLogs();
   }, []);

   return (
      <section className="container py-3 admin-page">
         <PageHeader
            title="Audit Log"
            subtitle="Pantau aktivitas penting yang dilakukan admin dan anggota dalam sistem."
         />

         <div className="admin-card">
            {loading ? (
               <div className="text-muted py-3">Memuat audit log...</div>
            ) : error ? (
               <div className="alert alert-danger">{error}</div>
            ) : logs.length === 0 ? (
               <div className="text-muted py-3">Belum ada aktivitas yang tercatat.</div>
            ) : (
               <div className="table-responsive">
                  <table className="admin-table">
                     <thead>
                        <tr>
                           <th>Waktu</th>
                           <th>Aktivitas</th>
                           <th>Entitas</th>
                           <th>Deskripsi</th>
                        </tr>
                     </thead>
                     <tbody>
                        {logs.map((log) => (
                           <tr key={log.id}>
                              <td>{formatDate(log.created_at)}</td>
                              <td>{getActionLabel(log.action)}</td>
                              <td>{log.table_name || "-"}</td>
                              <td>{formatLogDescription(log.description)}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </section>
   );
}
