"use client";

import { useEffect, useState } from "react";
import SavingTransactionsTable from "@/src/components/admin/saving-transactions-table/SavingTransactionsTable";
import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  const [savingTransactions, setSavingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSavingTransactions() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/saving-transactions");

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Gagal mengambil data transaksi simpanan.");
        }

        const result = await response.json();
        setSavingTransactions(result.saving_transactions || []);
      } catch (err) {
        setError(err?.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    }

    loadSavingTransactions();
  }, []);

  const totalTransactions = savingTransactions.length;
  const approvedTransactions = savingTransactions.filter((t) => t.status === "APPROVED").length;
  const rejectedTransactions = savingTransactions.filter((t) => t.status === "REJECTED").length;

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Transaksi Simpanan"
        subtitle="Kelola dan monitor semua transaksi simpanan anggota."
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Total Transaksi</p>
          <div className="admin-stat-value">{loading ? "-" : totalTransactions}</div>
          <p>Total transaksi dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Transaksi Disetujui</p>
          <div className="admin-stat-value">{loading ? "-" : approvedTransactions}</div>
          <p>Total transaksi disetujui</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Transaksi Ditolak</p>
          <div className="admin-stat-value">{loading ? "-" : rejectedTransactions}</div>
          <p>Total transaksi ditolak</p>
        </article>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-muted py-3">Memuat data transaksi simpanan...</div>
      ) : (
        <SavingTransactionsTable savingTransactions={savingTransactions} />
      )}
    </section>
  );
}
