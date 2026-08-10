"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatStatus(status) {
  switch (status) {
    case "APPROVED":
      return "Disetujui";
    case "REJECTED":
      return "Ditolak";
    default:
      return "Pending";
  }
}

export default function Page() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadLoans() {
      try {
        const response = await fetch("/api/loans");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat data pinjaman.");
        }

        setLoans(result.applications || []);
      } catch (error) {
        setMessage(error?.message || "Gagal memuat data pinjaman.");
      } finally {
        setLoading(false);
      }
    }

    loadLoans();
  }, []);

  const activeLoans = loans.filter((loan) => loan.status === "APPROVED").length;
  const pendingApplications = loans.filter((loan) => loan.status === "PENDING").length;
  const totalAmount = loans
    .filter((loan) => loan.status === "APPROVED")
    .reduce((sum, loan) => sum + Number(loan.amount || 0), 0);

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Pinjaman Saya"
        subtitle="Lihat riwayat pengajuan pinjaman dan status pinjaman yang sedang berjalan."
        actions={
          <a href="/loans/apply" className="btn btn-primary">
            Ajukan Pinjaman
          </a>
        }
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Pinjaman Aktif</p>
          <div className="admin-stat-value">{activeLoans}</div>
          <p>Pinjaman yang sedang berjalan.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Pengajuan Pending</p>
          <div className="admin-stat-value">{pendingApplications}</div>
          <p>Pengajuan yang menunggu review admin.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Total Pinjaman</p>
          <div className="admin-stat-value">{formatCurrency(totalAmount)}</div>
          <p>Jumlah nominal pinjaman yang sudah disetujui.</p>
        </article>
      </div>

      <div className="admin-card">
        <h3>Daftar Pinjaman</h3>
        {loading ? (
          <div className="py-4 text-center text-muted">Memuat data pinjaman...</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Nominal</th>
                  <th>Tenor</th>
                  <th>Status</th>
                  <th>Cicilan Berikutnya</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Belum ada data pinjaman.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.loan_product_name || loan.loan_products?.name || "Pinjaman"}</td>
                      <td>{formatCurrency(loan.amount)}</td>
                      <td>{loan.tenor} bulan</td>
                      <td>
                        <span className={`admin-status-badge ${loan.status === "APPROVED" ? "approved" : "pending"}`}>
                          {formatStatus(loan.status)}
                        </span>
                      </td>
                      <td>{loan.status === "APPROVED" ? "Menunggu jadwal" : "-"}</td>
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
