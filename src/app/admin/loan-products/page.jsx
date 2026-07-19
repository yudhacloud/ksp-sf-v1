import LoanProductsTable from "@/src/components/admin/loan-products-table/LoanProductsTable";
import PageHeader from "@/src/components/ui/PageHeader";
import { getInternalAuthFetchHeaders } from "@/src/lib/auth/server";

async function getLoanProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const authHeaders = await getInternalAuthFetchHeaders();
  const response = await fetch(`${baseUrl}/api/admin/loan-products`, {
    cache: "no-store",
    headers: authHeaders,
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Respons API loan product bukan JSON. Kemungkinan request ter-redirect ke halaman login.");
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Gagal mengambil data produk pinjaman.");
  }

  return result.loan_products || [];
}

export default async function Page() {
  const loanProducts = await getLoanProducts();
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
          <div className="admin-stat-value">{totalProducts}</div>
          <p>Produk pinjaman terdaftar dalam sistem.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Produk Aktif</p>
          <div className="admin-stat-value">{activeProducts}</div>
          <p>Produk pinjaman yang dapat dipilih anggota.</p>
        </article>
        <article className="admin-card">
          <p className="admin-stat-title">Produk Nonaktif</p>
          <div className="admin-stat-value">{inactiveProducts}</div>
          <p>Produk pinjaman yang saat ini tidak ditawarkan.</p>
        </article>
      </div>

      <LoanProductsTable loanProducts={loanProducts} />
    </section>
  );
}
