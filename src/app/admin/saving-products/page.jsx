"use client";

import { useEffect, useState } from "react";
import SavingProductsTable from "@/src/components/admin/saving-products-table/SavingProductsTable";
import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  const [savingProducts, setSavingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSavingProducts() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/saving-products");

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Gagal mengambil data produk simpanan.");
        }

        const result = await response.json();
        setSavingProducts(result.saving_products || []);
      } catch (err) {
        setError(err?.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    }

    loadSavingProducts();
  }, []);

  const totalProduk = savingProducts.length;
  const activeProducts = savingProducts.filter((product) => product.is_active).length;
  const inActiveProducts = savingProducts.filter((product) => !product.is_active).length;

  return (
    <section className="container py-3 admin-page">
      <PageHeader
        title="Produk Simpanan"
        subtitle="Kelola produk simpanan koperasi dan atur opsi bagi anggota."
        actions={<a href="/admin/saving-products/create" className="btn btn-primary">
          Tambah Produk Simpanan
        </a>}
      />

      <div className="admin-grid mb-4">
        <article className="admin-card">
          <p className="admin-stat-title">Total Produk</p>
          <div className="admin-stat-value">{loading ? "-" : totalProduk}</div>
          <p>Produk terdaftar dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Total Produk Aktif</p>
          <div className="admin-stat-value">{loading ? "-" : activeProducts}</div>
          <p>Produk aktif dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Total Produk Non-Aktif</p>
          <div className="admin-stat-value">{loading ? "-" : inActiveProducts}</div>
          <p>Produk non-aktif dalam sistem.</p>
        </article>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-muted py-3">Memuat data produk simpanan...</div>
      ) : (
        <SavingProductsTable savingProducts={savingProducts} />
      )}
    </section>
  );
}
