"use client";

import { useEffect, useState } from "react";
import LoanProductsTable from "@/src/components/admin/loan-products-table/LoanProductsTable";
import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  const [loanProducts, setLoanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLoanProducts() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/loan-products");

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Gagal mengambil data produk pinjaman.");
        }

        const result = await response.json();
        setLoanProducts(result.loan_products || []);
      } catch (err) {
        setError(err?.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    }

    loadLoanProducts();
  }, []);

  const totalProducts = loanProducts.length;
  const activeProducts = loanProducts.filter((product) => product.is_active).length;
  const inactiveProducts = loanProducts.filter((product) => !product.is_active).length;

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Produk Pinjaman"
        subtitle="Kelola produk pinjaman koperasi dan atur parameter pinjaman untuk anggota."
        actions={
          <a href="/admin/loan-products/create" className="btn btn-primary">
            Tambah Produk Pinjaman
          </a>
        }
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Total Produk</p>
          <div className="admin-stat-value">{loading ? "-" : totalProducts}</div>
          <p>Produk pinjaman terdaftar dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Produk Aktif</p>
          <div className="admin-stat-value">{loading ? "-" : activeProducts}</div>
          <p>Produk pinjaman yang dapat dipilih anggota.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Produk Nonaktif</p>
          <div className="admin-stat-value">{loading ? "-" : inactiveProducts}</div>
          <p>Produk pinjaman yang saat ini tidak ditawarkan.</p>
        </article>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-muted py-3">Memuat data produk pinjaman...</div>
      ) : (
        <LoanProductsTable loanProducts={loanProducts} />
      )}
    </section>
  );
}
