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
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadLoans() {
      try {
        const response = await fetch("/api/admin/loans");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat data pinjaman.");
        }

        setLoans(result.loans || []);
      } catch (error) {
        setMessage(error?.message || "Gagal memuat data pinjaman.");
      } finally {
        setLoading(false);
      }
    }

    loadLoans();
  }, []);

  const activeLoans = useMemo(() => loans.filter((loan) => loan.status === "ACTIVE"), [loans]);

  const stats = useMemo(() => ({
    active: activeLoans.length,
    totalPrincipal: activeLoans.reduce((sum, loan) => sum + Number(loan.principal || 0), 0),
    remainingBalance: activeLoans.reduce((sum, loan) => sum + Number(loan.remaining || 0), 0),
  }), [activeLoans]);

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Pinjaman Aktif"
        subtitle="Pantau pinjaman yang sudah disetujui dan sedang berjalan."
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Pinjaman Aktif</p>
          <div className="admin-stat-value">{stats.active}</div>
          <p>Pinjaman yang masih berjalan.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Total Pokok</p>
          <div className="admin-stat-value">{formatCurrency(stats.totalPrincipal)}</div>
          <p>Total nominal pinjaman aktif.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Sisa Saldo</p>
          <div className="admin-stat-value">{formatCurrency(stats.remainingBalance)}</div>
          <p>Total saldo yang belum lunas.</p>
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
                  <th>Anggota</th>
                  <th>Produk</th>
                  <th>Pokok</th>
                  <th>Sisa Saldo</th>
                  <th>Tenor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">Belum ada data pinjaman.</td>
                  </tr>
                ) : (
                  activeLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.member_name}</td>
                      <td>{loan.product_name}</td>
                      <td>{formatCurrency(loan.principal)}</td>
                      <td>{formatCurrency(loan.remaining)}</td>
                      <td>{loan.tenor} bulan</td>
                      <td>
                        <span className={`admin-status-badge ${loan.status === "PAID" ? "approved" : loan.status === "DEFAULT" ? "rejected" : "pending"}`}>
                          {loan.status === "ACTIVE" ? "Aktif" : loan.status === "PAID" ? "Lunas" : loan.status === "DEFAULT" ? "Default" : loan.status}
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
