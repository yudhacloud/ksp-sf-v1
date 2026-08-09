"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Page() {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadInstallments() {
      try {
        const response = await fetch("/api/admin/installment-payments");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat data pembayaran cicilan.");
        }

        setInstallments(result.installments || []);
      } catch (error) {
        setMessage(error?.message || "Gagal memuat data pembayaran cicilan.");
      } finally {
        setLoading(false);
      }
    }

    loadInstallments();
  }, []);

  const stats = useMemo(() => ({
    pending: installments.filter((item) => item.status === "PENDING").length,
    paid: installments.filter((item) => item.status === "PAID").length,
    overdue: installments.filter((item) => item.status === "OVERDUE").length,
  }), [installments]);

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Pembayaran Cicilan"
        subtitle="Verifikasi pembayaran cicilan dan pantau tunggakan anggota."
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Belum Dibayar</p>
          <div className="admin-stat-value">{stats.pending}</div>
          <p>Cicilan yang menunggu pembayaran.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Sudah Dibayar</p>
          <div className="admin-stat-value">{stats.paid}</div>
          <p>Cicilan yang telah diverifikasi.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Terlambat</p>
          <div className="admin-stat-value">{stats.overdue}</div>
          <p>Cicilan yang melewati jatuh tempo.</p>
        </article>
      </div>

      <div className="admin-card">
        <h3>Daftar Pembayaran Cicilan</h3>
        {loading ? (
          <div className="py-4 text-center text-muted">Memuat data cicilan...</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Anggota</th>
                  <th>Cicilan</th>
                  <th>Jatuh Tempo</th>
                  <th>Nominal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {installments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">Belum ada data cicilan.</td>
                  </tr>
                ) : (
                  installments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.member_name}</td>
                      <td>{payment.installment_label}</td>
                      <td>{payment.due_date}</td>
                      <td>{formatCurrency(payment.amount_due)}</td>
                      <td>
                        <span className={`admin-status-badge ${payment.status === "PAID" ? "approved" : payment.status === "OVERDUE" ? "rejected" : "pending"}`}>
                          {payment.status === "PAID" ? "Sudah Dibayar" : payment.status === "OVERDUE" ? "Terlambat" : "Belum Dibayar"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {message && (
          <div className="alert alert-danger mt-3" role="alert">
            {message}
          </div>
        )}
      </div>
    </section>
  );
}
